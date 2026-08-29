import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import { getProducts } from './src/services/catalogService';

async function check() {
  const pricesSnap = await getDocs(collection(db, 'prices'));
  const prices = pricesSnap.docs.map(d => d.data());
  console.log('Prices collection count:', prices.length);
  if (prices.length > 0) console.log('Sample:', prices[0]);
  
  const variantsSnap = await getDocs(collection(db, 'productVariants'));
  const variants = variantsSnap.docs.map(d => d.data());
  console.log('Variants count:', variants.length);
  if (variants.length > 0) console.log('Variant price:', variants[0].price);
  
  process.exit(0);
}
check();
