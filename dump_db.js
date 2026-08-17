import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function dump() {
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log(`--- USERS (${usersSnap.size}) ---`);
  for (const u of usersSnap.docs) {
    console.log(`User: ${u.id}`, u.data());
    const orders = await getDocs(collection(db, `users/${u.id}/orders`));
    console.log(`  Orders: ${orders.size}`);
    orders.forEach(o => {
        console.log(`    Order ID: ${o.id}, Status: ${o.data().status}, Total: ${o.data().totalAmount}, Email: ${o.data().customerEmail}`);
    });
  }
}
dump();
