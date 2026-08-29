import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import { products } from './src/data';

async function fix() {
  const variantsSnap = await getDocs(collection(db, 'productVariants'));
  const batch = writeBatch(db);
  let count = 0;
  
  for (const vDoc of variantsSnap.docs) {
    const vData = vDoc.data();
    // Try to find by name
    const orig = products.find(p => p.name === vData.name);
    if (orig) {
      console.log(`Matching ${vData.name} -> ${orig.price}`);
      batch.update(vDoc.ref, { price: orig.price });
      count++;
    } else {
      console.log(`Could not find orig for ${vData.name}`);
    }
  }
  
  if (count > 0) {
    await batch.commit();
    console.log(`Updated ${count} prices!`);
  }
  process.exit(0);
}
fix();
