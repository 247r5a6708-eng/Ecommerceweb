const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load products
const dataPath = path.join(__dirname, '../src/data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// A crude way to extract the products array for auditing
let products = [];
try {
  // Extract just the array part
  const match = dataContent.match(/export const products: Product\[\] = \(\[([\s\S]*?)\]\);/);
  if (match) {
    const arrString = '[' + match[1] + ']';
    // Use Function constructor to safely evaluate the array literal
    products = new Function('return ' + arrString)();
  }
} catch (e) {
  console.error("Could not parse products:", e.message);
  process.exit(1);
}

if (!products.length) {
  console.error("No products found to audit.");
  process.exit(1);
}

async function checkImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      return resolve({ status: 'missing', statusCode: null });
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
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
      // Still check if it's broken
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
  
  if (broken > 0 || missing > 0 || duplicates > 0) {
    console.log('\nSTATUS: FAILED');
    process.exit(1);
  } else {
    console.log('\nSTATUS: PASSED');
    process.exit(0);
  }
}

runAudit();
