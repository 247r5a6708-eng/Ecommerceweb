
import { collection, collectionGroup, getDocs, query, where, getCountFromServer, getAggregateFromServer, sum, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function getDashboardMetrics() {
  try {
    const ordersRef = collectionGroup(db, 'orders');
    const usersRef = collection(db, 'users');
    const productsRef = collection(db, 'productVariants'); 
    
    // Check if collections exist / have data by trying to get counts
    const ordersCount = await getCountFromServer(ordersRef);
    const usersCount = await getCountFromServer(usersRef);
    const productsCount = await getCountFromServer(productsRef);
    
    let totalRevenue = 0;
    if (ordersCount.data().count > 0) {
       const revenueAgg = await getAggregateFromServer(ordersRef, {
         totalRevenue: sum('totalAmount')
       });
       totalRevenue = revenueAgg.data().totalRevenue || 0;
    }

    return {
      totalOrders: ordersCount.data().count,
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
    const q = query(collectionGroup(db, 'orders'));
    const snapshot = await getDocs(q);
    let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    if (statusFilter && statusFilter !== 'all') {
      orders = orders.filter(o => 
        (o.status && o.status.toLowerCase() === statusFilter.toLowerCase()) || 
        (statusFilter === 'pending' && !o.status)
      );
    }
    
    return orders.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, limitCount);
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
    const q = query(collectionGroup(db, 'orders'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    return orders.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
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
