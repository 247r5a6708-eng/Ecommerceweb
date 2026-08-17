import { readFileSync, writeFileSync } from 'fs';

let code = readFileSync('src/services/adminService.ts', 'utf8');

code = code.replace(/const ordersRef = collectionGroup\(db, 'orders'\);/g, '');
code = code.replace(/import \{ collection, collectionGroup, getDocs, query, where, getCountFromServer, getAggregateFromServer, sum, orderBy, limit \} from 'firebase\/firestore';/g, "import { collection, getDocs, query, where, getCountFromServer, getAggregateFromServer, sum, orderBy, limit } from 'firebase/firestore';");

// Rewrite getDashboardMetrics
code = code.replace(/export async function getDashboardMetrics\(\) \{[\s\S]*?totalRevenue: totalRevenue\n    \};\n  \} catch \(error\) \{[\s\S]*?return \{ totalOrders: 0, totalCustomers: 0, totalProducts: 0, totalRevenue: 0 \};\n  \}\n\}/, 
`export async function getDashboardMetrics() {
  try {
    const usersRef = collection(db, 'users');
    const productsRef = collection(db, 'productVariants'); 
    
    const usersCount = await getCountFromServer(usersRef);
    const productsCount = await getCountFromServer(productsRef);
    
    // Fetch all orders manually across all users since collectionGroup requires an index
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

    return {
      totalOrders: totalOrders,
      totalCustomers: usersCount.data().count,
      totalProducts: productsCount.data().count,
      totalRevenue: totalRevenue
    };
  } catch (error) {
    console.error("Error fetching metrics", error);
    return { totalOrders: 0, totalCustomers: 0, totalProducts: 0, totalRevenue: 0 };
  }
}`);

// Rewrite getRecentOrders
code = code.replace(/export async function getRecentOrders\(limitCount = 10, statusFilter\?: string\) \{[\s\S]*?return \[\];\n  \}\n\}/,
`export async function getRecentOrders(limitCount = 10, statusFilter?: string) {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    let allOrders = [];
    
    for (const userDoc of usersSnap.docs) {
      const userOrdersRef = collection(db, \`users/\${userDoc.id}/orders\`);
      const userOrdersSnap = await getDocs(userOrdersRef);
      userOrdersSnap.forEach(doc => {
        allOrders.push({ id: doc.id, ...doc.data() });
      });
    }
    
    if (statusFilter && statusFilter !== 'all') {
      allOrders = allOrders.filter(o => 
        (o.status && o.status.toLowerCase() === statusFilter.toLowerCase()) || 
        (statusFilter === 'pending' && !o.status)
      );
    }
    
    return allOrders.sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()).slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching recent orders", error);
    return [];
  }
}`);

// Rewrite getAllOrders
code = code.replace(/export async function getAllOrders\(\) \{[\s\S]*?return \[\];\n  \}\n\}/,
`export async function getAllOrders() {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    let allOrders = [];
    
    for (const userDoc of usersSnap.docs) {
      const userOrdersRef = collection(db, \`users/\${userDoc.id}/orders\`);
      const userOrdersSnap = await getDocs(userOrdersRef);
      userOrdersSnap.forEach(doc => {
        allOrders.push({ id: doc.id, ...doc.data() });
      });
    }
    
    return allOrders.sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
  } catch (error) {
    console.error("Error fetching all orders", error);
    return [];
  }
}`);

writeFileSync('src/services/adminService.ts', code);
