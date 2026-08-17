import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  console.log("Starting...");
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log(`Found ${usersSnap.size} users.`);
  for (const userDoc of usersSnap.docs) {
    const ordersSnap = await getDocs(collection(db, `users/${userDoc.id}/orders`));
    console.log(`User ${userDoc.id} has ${ordersSnap.size} orders`);
    
    for (const orderDoc of ordersSnap.docs) {
      const data = orderDoc.data();
      if ((data.status === 'CANCELLED' || !data.status) && (data.totalAmount === 0 || !data.totalAmount)) {
         console.log(`Deleting broken order ${orderDoc.id} for user ${userDoc.id}`);
         await deleteDoc(doc(db, `users/${userDoc.id}/orders/${orderDoc.id}`));
      } else if (data.status === 'CANCELLED' && userDoc.id === 'guest') {
         console.log(`Deleting guest cancelled order ${orderDoc.id}`);
         await deleteDoc(doc(db, `users/${userDoc.id}/orders/${orderDoc.id}`));
      }
    }
    
    const remainingOrders = await getDocs(collection(db, `users/${userDoc.id}/orders`));
    const userData = userDoc.data();
    if (userDoc.id === 'guest' && remainingOrders.empty) {
        console.log("Deleting guest user with no orders left.");
        await deleteDoc(doc(db, `users/${userDoc.id}`));
    }
    if ((!userData.name && !userData.email && userDoc.id !== 'guest') || (userData.name === 'Lumina Member' && !userData.email)) {
        if (remainingOrders.empty) {
           console.log(`Deleting anonymous user artifact ${userDoc.id}`);
           await deleteDoc(doc(db, `users/${userDoc.id}`));
        }
    }
  }
  console.log("Cleanup done.");
  process.exit(0);
}
run();
