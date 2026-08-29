import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import { getProducts } from './src/services/catalogService';

async function check() {
  const p = await getProducts(true);
  let hasPinkCup = 0;
  p.forEach(prod => {
    if (prod.image && prod.image.includes('1560393464')) {
      hasPinkCup++;
    }
  });
  console.log('Total products:', p.length, 'Products with pink cup:', hasPinkCup);
  process.exit(0);
}
check();
