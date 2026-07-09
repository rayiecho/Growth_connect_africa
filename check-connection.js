require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!base64) {
  console.log('RESULT: Missing FIREBASE_SERVICE_ACCOUNT_BASE64 in .env.local — stop here.');
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function check() {
  try {
    const snapshot = await db.collection('applicants').limit(1).get();
    console.log('RESULT: Connected to Firestore safely. Active documents found:', snapshot.size);
  } catch (error) {
    console.log('RESULT: Could not reach Firestore collection.');
    console.log('Error:', error.message);
  }
}
check();
