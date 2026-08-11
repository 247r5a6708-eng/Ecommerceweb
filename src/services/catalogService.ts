import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { products as mockProducts } from '../data';

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, 'products'));
  if (snapshot.empty) {
    console.log('No products found in Firestore. Returning mock data or seeding...');
    return mockProducts;
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const productDoc = await getDoc(doc(db, 'products', id));
  if (productDoc.exists()) {
    return { id: productDoc.id, ...productDoc.data() } as Product;
  }
  return mockProducts.find(p => p.id === id) || null;
};

export const seedCatalog = async () => {
  console.log('Seeding catalog...');
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);
  if (!snapshot.empty) {
    console.log('Catalog already seeded.');
    return;
  }
  for (const product of mockProducts) {
    await setDoc(doc(db, 'products', product.id), product);
  }
  console.log('Catalog seeded successfully.');
};
