import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const ordersSnap = await getDocs(collection(db, `users/m0yQjAMCFEUF0KNDBlg5laBjNPL2/orders`));
  console.log("Remaining orders: " + ordersSnap.size);
  process.exit(0);
}
run();
