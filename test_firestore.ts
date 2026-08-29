import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' with { type: "json" };

async function run() {
  console.log('DB ID:', (firebaseConfig as any).firestoreDatabaseId);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
  try {
    const snap = await getDocs(collection(db, 'products'));
    console.log('Success, docs count:', snap.size);
    process.exit(0);
  } catch (err) {
    console.error('Error connecting:', err);
    process.exit(1);
  }
}
run();
