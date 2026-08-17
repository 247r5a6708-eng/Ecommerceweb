import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const ordersSnap = await getDocs(collection(db, `users/m0yQjAMCFEUF0KNDBlg5laBjNPL2/orders`));
  
  for (const orderDoc of ordersSnap.docs) {
    const data = orderDoc.data();
    console.log(`Order ID: ${orderDoc.id}, Status: ${data.status}, Total: ${data.totalAmount}, Data.total: ${data.total}`);
    
    if (data.status === 'cancelled') {
       console.log(`Deleting ${orderDoc.id}`);
       await deleteDoc(doc(db, `users/m0yQjAMCFEUF0KNDBlg5laBjNPL2/orders/${orderDoc.id}`));
    }
  }
  
  process.exit(0);
}
run();
