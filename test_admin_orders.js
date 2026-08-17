import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, getDocs, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    const ordersRef = collectionGroup(db, 'orders');
    console.log("Fetching orders count...");
    const countSnap = await getCountFromServer(ordersRef);
    console.log("Count:", countSnap.data().count);

    console.log("Fetching orders docs...");
    const docs = await getDocs(ordersRef);
    console.log("Docs fetched:", docs.size);
    docs.forEach(d => console.log(d.id, d.data().totalAmount, d.data().total));
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
test();
