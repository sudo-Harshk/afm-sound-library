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
  apiKey: "AIzaSyC9NN6pPcRSrW7tRioJg8phwXXdF44ojtY",
  authDomain: "afm-sound-library.firebaseapp.com",
  projectId: "afm-sound-library",
  storageBucket: "afm-sound-library.firebasestorage.app",
  messagingSenderId: "914724396864",
  appId: "1:914724396864:web:eb5f04fa30aa99453ce4a5",
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
      map[normalize(label)] = {
        section: cat.section,
        subcategory: sub,
        canonicalLabel: label,
        description: desc,
      };
    }
  }
  return map;
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

    // Find in master
    const masterEntry = masterMap[fsNorm];
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
      // Try fuzzy match
      let found = false;
      for (const [mNorm, mEntry] of Object.entries(masterMap)) {
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
  const fsNorms = new Set(fsDocs.map((d) => normalize(d.canonicalLabel || "")));
  for (const [mNorm, mEntry] of Object.entries(masterMap)) {
    if (!fsNorms.has(mNorm)) {
      // Also check fuzzy
      let alreadyExists = false;
      for (const fsNorm of fsNorms) {
        if (fsNorm.includes(mNorm) || mNorm.includes(fsNorm)) {
          alreadyExists = true;
          break;
        }
      }
      if (!alreadyExists) {
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
