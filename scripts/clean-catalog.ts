import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { products } from '../src/data';

async function checkImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 3000 }, (res) => {
      resolve(res.statusCode && res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.abort(); resolve(false); });
  });
}

async function run() {
  const validProducts = [];
  const urlSet = new Set();
  
  for (const p of products) {
    if (!p.image) continue;
    if (urlSet.has(p.image)) continue; // skip duplicates
    
    const isValid = await checkImage(p.image);
    if (isValid) {
      urlSet.add(p.image);
      validProducts.push(p);
    }
  }
  
  const dataPath = path.join(process.cwd(), 'src/data.ts');
  let content = fs.readFileSync(dataPath, 'utf8');
  
  // Replace the products array
  const productsString = JSON.stringify(validProducts, null, 2);
  content = content.replace(/export const products: Product\[\] = \(\[[\s\S]*?\]\);/, `export const products: Product[] = (${productsString});`);
  
  fs.writeFileSync(dataPath, content);
  console.log(`Cleaned catalog. Kept ${validProducts.length} valid products.`);
}

run();
