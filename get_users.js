import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const usersSnap = await getDocs(collection(db, 'users'));
  for (const userDoc of usersSnap.docs) {
    console.log(`User ID: ${userDoc.id}, Data:`, userDoc.data());
    
    // Find missing users or guest
    if (!userDoc.data().name && !userDoc.data().email) {
       console.log("Empty user found, deleting...");
       await deleteDoc(doc(db, `users/${userDoc.id}`));
    }
  }
  process.exit(0);
}
run();
