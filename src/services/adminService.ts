
import { collection, getDocs, query, where, getCountFromServer, getAggregateFromServer, sum, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function getDashboardMetrics() {
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
      const userOrdersRef = collection(db, `users/${userDoc.id}/orders`);
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
}

export async function getRecentOrders(limitCount = 10, statusFilter?: string) {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    let allOrders = [];
    
    for (const userDoc of usersSnap.docs) {
      const userOrdersRef = collection(db, `users/${userDoc.id}/orders`);
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
}

export async function getCatalogHealth() {
  // Real check against database
  try {
    const productsRef = collection(db, 'productVariants');
    const productsCount = await getCountFromServer(productsRef);
    const total = productsCount.data().count;
    
    // In a full implementation, this would query for missing images, invalid SKUs etc.
    // For now we return base structural aggregates as required.
    return {
      total,
      valid: total, // Placeholder for actual validation logic
      invalid: 0,
      missingImages: 0
    };
  } catch (e) {
    return { total: 0, valid: 0, invalid: 0, missingImages: 0 };
  }
}

export async function getAllOrders() {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    let allOrders = [];
    
    for (const userDoc of usersSnap.docs) {
      const userOrdersRef = collection(db, `users/${userDoc.id}/orders`);
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
}

export async function getAllCustomers() {
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    // Since users may not have date/createdAt initially, sort safely if it exists
    return customers.sort((a, b) => {
       const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
       const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
       return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching all customers", error);
    return [];
  }
}

export async function getRecentActivity() {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    let activities: any[] = [];
    
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      if (userData.createdAt) {
        activities.push({
          id: `user-${userDoc.id}`,
          type: 'signup',
          title: 'New Customer Signup',
          description: `${userData.name || userData.email || 'Anonymous'} joined.`,
          date: new Date(userData.createdAt.seconds ? userData.createdAt.seconds * 1000 : userData.createdAt),
          user: userData.email || userData.name || 'Anonymous'
        });
      }
      
      const userOrdersRef = collection(db, `users/${userDoc.id}/orders`);
      const userOrdersSnap = await getDocs(userOrdersRef);
      userOrdersSnap.forEach(doc => {
        const orderData = doc.data();
        if (orderData.createdAt || orderData.date) {
           const d = orderData.createdAt?.seconds ? new Date(orderData.createdAt.seconds * 1000) : new Date(orderData.createdAt || orderData.date);
           activities.push({
             id: `order-${doc.id}`,
             type: 'order',
             title: 'New Order Placed',
             description: `Order ${doc.id} for ₹${(orderData.total || orderData.totalAmount || 0).toLocaleString('en-IN')}`,
             date: d,
             user: orderData.customerEmail || orderData.customerName || 'Guest'
           });
        }
      });
    }
    
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 15);
  } catch (error) {
    console.error("Error fetching activity", error);
    return [];
  }
}

export async function getChartData() {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    let allOrders: any[] = [];
    
    for (const userDoc of usersSnap.docs) {
      const userOrdersRef = collection(db, `users/${userDoc.id}/orders`);
      const userOrdersSnap = await getDocs(userOrdersRef);
      userOrdersSnap.forEach(doc => {
        allOrders.push(doc.data());
      });
    }
    
    // Group by day for the last 30 days
    const now = new Date();
    const chartData: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      chartData.push({
        date: dateStr,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0
      });
    }
    
    allOrders.forEach(order => {
      let orderDate;
      if (order.createdAt?.seconds) {
        orderDate = new Date(order.createdAt.seconds * 1000);
      } else if (order.createdAt || order.date) {
        orderDate = new Date(order.createdAt || order.date);
      } else {
        return;
      }
      
      const dateStr = orderDate.toISOString().split('T')[0];
      const dataPoint = chartData.find(d => d.date === dateStr);
      if (dataPoint) {
        dataPoint.revenue += (order.total || order.totalAmount || 0);
        dataPoint.orders += 1;
      }
    });
    
    return chartData;
  } catch (error) {
    console.error("Error fetching chart data", error);
    return [];
  }
}

export async function getCustomerDetails(userId: string) {
  try {
    const { doc, getDoc, collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return null;
    
    const userData = userSnap.data();
    
    const userOrdersRef = collection(db, `users/${userId}/orders`);
    const userOrdersSnap = await getDocs(userOrdersRef);
    let totalSpent = 0;
    const orders: any[] = [];
    userOrdersSnap.forEach(d => {
      const data = d.data();
      totalSpent += (data.totalAmount || data.total || 0);
      orders.push({ id: d.id, ...data });
    });

    return {
      ...userData,
      id: userId,
      orders: orders.sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()),
      totalSpent,
      orderCount: orders.length
    };
  } catch (error) {
    console.error("Error fetching customer details", error);
    return null;
  }
}

export async function restockProduct(variantId: string, additionalAmount: number = 50) {
  try {
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    
    // First update the variant record which is the primary source
    const variantRef = doc(db, 'productVariants', variantId);
    const variantSnap = await getDoc(variantRef);
    if (variantSnap.exists()) {
      const current = variantSnap.data().inventoryCount || 0;
      await updateDoc(variantRef, { inventoryCount: current + additionalAmount });
    }
    
    // Also try to find if there's an inventory record matching this variant's SKU
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const skusRef = collection(db, 'skus');
    const q = query(skusRef, where('variantId', '==', variantId));
    const skusSnap = await getDocs(q);
    
    if (!skusSnap.empty) {
      const skuId = skusSnap.docs[0].id;
      const invRef = collection(db, 'inventory');
      const invQ = query(invRef, where('skuId', '==', skuId));
      const invSnap = await getDocs(invQ);
      
      if (!invSnap.empty) {
        const invDoc = invSnap.docs[0];
        const currentInv = invDoc.data().quantity || 0;
        await updateDoc(doc(db, 'inventory', invDoc.id), { quantity: currentInv + additionalAmount });
      }
    }
    return true;
  } catch (error) {
    console.error("Error restocking", error);
    return false;
  }
}
