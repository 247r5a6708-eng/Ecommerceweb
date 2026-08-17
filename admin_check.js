import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log("Users:", usersSnap.size);
  let totalRev = 0;
  let totalOrders = 0;
  for (const doc of usersSnap.docs) {
    const ordersSnap = await getDocs(collection(db, `users/${doc.id}/orders`));
    totalOrders += ordersSnap.size;
    ordersSnap.forEach(o => {
      totalRev += o.data().totalAmount || 0;
    });
  }
  console.log("Total Orders:", totalOrders);
  console.log("Total Rev:", totalRev);
}
check();
