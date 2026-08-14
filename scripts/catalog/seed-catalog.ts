import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { products } from '../../src/data';

async function seed() {
  console.log('Seeding catalog...');
  for (const product of products) {
    await setDoc(doc(db, 'products', product.id), product);
    console.log(`Seeded ${product.name}`);
  }
  console.log('Catalog seeded successfully.');
  process.exit(0);
}
seed().catch(console.error);
