const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'service-account-key.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uids = process.argv.slice(2);

if (uids.length === 0) {
  console.error('Usage: node scripts/set-admin-claims.cjs <uid1> <uid2> ...');
  console.error('Example: node scripts/set-admin-claims.cjs abc123 def456 ghi789 jkl012');
  process.exit(1);
}

async function setAdminClaims() {
  for (const uid of uids) {
    try {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      console.log(`✓ Set admin claim for UID: ${uid}`);
    } catch (err) {
      console.error(`✗ Failed for UID ${uid}: ${err.message}`);
    }
  }
  console.log('\nDone. Users must sign out and sign back in for claims to take effect.');
}

setAdminClaims();
