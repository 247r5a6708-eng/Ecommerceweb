const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const firebaseConfig = require('../firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Need to convert data.ts to JSON for seed... this might be hard directly in a CJS script if data.ts is TS.
// Let's do it another way: We can write a TS script to seed it.
