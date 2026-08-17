import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    const usersRef = collection(db, 'users');
    const usersCount = await getCountFromServer(usersRef);
    const usersSnap = await getDocs(usersRef);
    let totalOrders = 0;
    let totalRevenue = 0;
    
    for (const userDoc of usersSnap.docs) {
      const userOrdersRef = collection(db, \`users/\${userDoc.id}/orders\`);
      const userOrdersSnap = await getDocs(userOrdersRef);
      totalOrders += userOrdersSnap.size;
      userOrdersSnap.forEach(doc => {
        const data = doc.data();
        totalRevenue += (data.totalAmount || data.total || 0);
      });
    }

    console.log({
      totalOrders: totalOrders,
      totalCustomers: usersCount.data().count,
      totalRevenue: totalRevenue
    });
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
test();
