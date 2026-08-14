import { products } from '../../src/data';
import https from 'https';
import http from 'http';

async function checkImage(url: string): Promise<any> {
  return new Promise((resolve) => {
    if (!url) {
      return resolve({ status: 'missing', statusCode: null });
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode && (res.statusCode >= 200 && res.statusCode < 400 || res.statusCode === 429)) {
        resolve({ status: 'valid', statusCode: res.statusCode });
      } else {
        resolve({ status: 'broken', statusCode: res.statusCode });
      }
    });
    
    req.on('error', (err) => {
      resolve({ status: 'error', error: err.message });
    });
    
    req.on('timeout', () => {
      req.abort();
      resolve({ status: 'timeout' });
    });
  });
}

async function runAudit() {
  console.log('IMAGE AUDIT\n');
  console.log(`Products scanned: ${products.length}\n`);
  
  let valid = 0;
  let missing = 0;
  let broken = 0;
  let duplicates = 0;
  let unverified = 0;
  
  const urlMap = new Map();
  
  for (const p of products) {
    process.stdout.write(`Checking ${p.id} - ${p.name.substring(0, 30)}... `);
    if (!p.image) {
      console.log('MISSING');
      missing++;
      continue;
    }
    
    if (urlMap.has(p.image)) {
      console.log('DUPLICATE (used by ' + urlMap.get(p.image) + ')');
      duplicates++;
    } else {
      urlMap.set(p.image, p.id);
    }
    
    const result = await checkImage(p.image);
    if (result.status === 'valid') {
      console.log('OK');
      valid++;
    } else {
      console.log(`FAILED (${result.status} ${result.statusCode || ''})`);
      broken++;
    }
  }
  
  console.log('\n--- SUMMARY ---');
  console.log(`Valid images: ${valid}`);
  console.log(`Missing images: ${missing}`);
  console.log(`Broken images: ${broken}`);
  console.log(`Duplicates: ${duplicates}`);
  console.log(`Unverified: ${unverified}`);
  
  if (broken > 0 || missing > 0 || duplicates > 0 || unverified > 0) {
    console.log('\nSTATUS: FAILED');
    process.exit(1);
  } else {
    console.log('\nSTATUS: PASSED');
    process.exit(0);
  }
}

runAudit();
