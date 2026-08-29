import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import { getProducts } from './src/services/catalogService';

async function check() {
  const p = await getProducts(true);
  console.log('Products:', p.length);
  if (p.length > 0) {
    console.log(p[0].name, p[0].image, p[0].images?.length);
  }
  process.exit(0);
}
check();
