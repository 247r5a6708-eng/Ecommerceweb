import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import { getProducts } from './src/services/catalogService';

async function check() {
  const p = await getProducts(true);
  p.slice(0,5).forEach(prod => console.log(prod.name, '|||', prod.price));
  process.exit(0);
}
check();
