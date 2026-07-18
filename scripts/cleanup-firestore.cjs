require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} = require("firebase/firestore");
const { SECTIONS } = require("./master-taxonomy.cjs");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function normalize(s) {
  return s.toLowerCase().trim().replace(/[-_]/g, " ");
}

function buildMasterMap() {
  const map = {};
  for (const cat of SECTIONS) {
    for (const [sub, label, desc] of cat.labels) {
      const key = `${normalize(cat.section)}::${normalize(sub)}::${normalize(label)}`;
      map[key] = {
        section: cat.section,
        subcategory: sub,
        canonicalLabel: label,
        description: desc,
      };
    }
  }
  return map;
}

function findMasterEntry(masterMap, section, subcategory, label) {
  const key = `${normalize(section)}::${normalize(subcategory)}::${normalize(label)}`;
  if (masterMap[key]) return masterMap[key];
  // Fall back to matching by label within the same section, since a label
  // (e.g. "Panting") can legitimately appear under multiple sections.
  const norm = normalize(label);
  const sectionNorm = normalize(section);
  return Object.values(masterMap).find(
    (e) => normalize(e.canonicalLabel) === norm && normalize(e.section) === sectionNorm
  );
}

function isSoundLabel(section) {
  const skip = [
    "annotation guidelines",
    "confusable",
    "background",
    "silence",
    "ambience",
  ];
  return !skip.some((s) => normalize(section).includes(s));
}

async function main() {
  const masterMap = buildMasterMap();
  console.log(`Master taxonomy: ${Object.keys(masterMap).length} labels`);

  // Read all Firestore docs
  const snap = await getDocs(collection(db, "sounds"));
  const fsDocs = [];
  snap.forEach((d) => {
    const data = d.data();
    fsDocs.push({ id: d.id, ...data });
  });
  console.log(`Firestore documents: ${fsDocs.length}`);

  let toDelete = 0;
  let toUpdate = 0;
  let toCreate = 0;
  let alreadyOk = 0;

  const missingFromMaster = [];

  // Phase 1: Process existing Firestore docs
  for (const fsDoc of fsDocs) {
    const fsLabel = (fsDoc.canonicalLabel || "").trim();
    const fsSection = (fsDoc.section || "").trim();
    const fsNorm = normalize(fsLabel);

    // Skip non-sound labels
    if (!isSoundLabel(fsSection)) {
      console.log(`DELETE (non-sound): [${fsSection}] "${fsLabel}" (${fsDoc.id})`);
      await deleteDoc(doc(db, "sounds", fsDoc.id));
      toDelete++;
      continue;
    }

    // Find in master (match within the doc's own section first, since the
    // same label can legitimately exist under multiple sections, e.g. "Panting")
    const masterEntry = findMasterEntry(masterMap, fsSection, fsDoc.subcategory || "", fsLabel);
    if (masterEntry) {
      // Check if section or other fields need updating
      const needsUpdate =
        fsSection !== masterEntry.section ||
        (fsDoc.subcategory || "").trim() !== masterEntry.subcategory ||
        fsLabel !== masterEntry.canonicalLabel;

      if (needsUpdate) {
        console.log(
          `UPDATE: "${fsLabel}" [${fsSection}] → [${masterEntry.section}] sub:${masterEntry.subcategory}`
        );
        await setDoc(doc(db, "sounds", fsDoc.id), {
          section: masterEntry.section,
          subcategory: masterEntry.subcategory,
          canonicalLabel: masterEntry.canonicalLabel,
          description: masterEntry.description,
        });
        toUpdate++;
      } else {
        alreadyOk++;
      }
    } else {
      // Try fuzzy match, preferring an entry within the same section
      let found = false;
      const candidates = Object.values(masterMap).sort(
        (a, b) => (normalize(b.section) === normalize(fsSection) ? 1 : 0) - (normalize(a.section) === normalize(fsSection) ? 1 : 0)
      );
      for (const mEntry of candidates) {
        const mNorm = normalize(mEntry.canonicalLabel);
        if (mNorm.includes(fsNorm) || fsNorm.includes(mNorm)) {
          console.log(
            `UPDATE (fuzzy): "${fsLabel}" [${fsSection}] → "${mEntry.canonicalLabel}" [${mEntry.section}]`
          );
          await setDoc(doc(db, "sounds", fsDoc.id), {
            section: mEntry.section,
            subcategory: mEntry.subcategory,
            canonicalLabel: mEntry.canonicalLabel,
            description: mEntry.description,
          });
          toUpdate++;
          found = true;
          break;
        }
      }
      if (!found) {
        missingFromMaster.push({ id: fsDoc.id, label: fsLabel, section: fsSection });
      }
    }
  }

  // Phase 2: Add missing labels
  // A label can legitimately exist under more than one section (e.g. "Panting"
  // under both Breathing and Dog), so presence must be tracked per section, not globally.
  const fsSectionLabelPairs = fsDocs.map((d) => ({
    section: normalize(d.section || ""),
    label: normalize(d.canonicalLabel || ""),
  }));
  for (const mEntry of Object.values(masterMap)) {
    const mSection = normalize(mEntry.section);
    const mNorm = normalize(mEntry.canonicalLabel);
    const exists = fsSectionLabelPairs.some(
      (p) => p.section === mSection && (p.label === mNorm || p.label.includes(mNorm) || mNorm.includes(p.label))
    );
    if (!exists) {
      const docId = mEntry.canonicalLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      console.log(
        `CREATE: "${mEntry.canonicalLabel}" [${mEntry.section}] (${docId})`
      );
      await setDoc(doc(db, "sounds", docId), {
        section: mEntry.section,
        subcategory: mEntry.subcategory,
        canonicalLabel: mEntry.canonicalLabel,
        description: mEntry.description,
      });
      toCreate++;
    }
  }

  // Report
  console.log("\n" + "=".repeat(60));
  console.log("CLEANUP COMPLETE");
  console.log("=".repeat(60));
  console.log(`Deleted (non-sound labels): ${toDelete}`);
  console.log(`Updated (fixed section/fields): ${toUpdate}`);
  console.log(`Created (missing labels): ${toCreate}`);
  console.log(`Already correct: ${alreadyOk}`);

  if (missingFromMaster.length > 0) {
    console.log(`\nFirestore labels not in master (kept as-is): ${missingFromMaster.length}`);
    for (const d of missingFromMaster) {
      console.log(`  [${d.section}] ${d.label}`);
    }
  }
}

main().catch(console.error);
