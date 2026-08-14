import { products } from '../../src/data';

async function runAudit() {
  console.log('--- LUMINA CATALOG AUDIT ---');
  let invalidProducts = 0;
  let duplicateSKUs = 0;
  let missingImages = 0;
  
  const skuSet = new Set<string>();
  const imageSet = new Set<string>();

  for (const p of products) {
    let isValid = true;
    
    // Check required fields
    if (!p.brand) {
      console.warn(`Product ${p.id} missing brand`);
      isValid = false;
    }
    if (!p.category) {
      console.warn(`Product ${p.id} missing category`);
      isValid = false;
    }
    
    // In our transition, p.id might be used as SKU for now.
    // In a real system we would check p.skuId.
    const sku = p.id;
    if (skuSet.has(sku)) {
      console.warn(`Duplicate SKU detected: ${sku}`);
      duplicateSKUs++;
      isValid = false;
    } else {
      skuSet.add(sku);
    }

    if (!p.image) {
      console.warn(`Product ${sku} missing image`);
      missingImages++;
      isValid = false;
    } else {
      if (imageSet.has(p.image)) {
        console.warn(`Product ${sku} uses duplicate image URL: ${p.image}`);
      }
      imageSet.add(p.image);
    }
    
    if (typeof p.price !== 'number' || p.price < 0) {
      console.warn(`Product ${sku} has invalid price`);
      isValid = false;
    }
    
    if (!isValid) {
      invalidProducts++;
    }
  }

  console.log('--- AUDIT RESULTS ---');
  console.log(`Total Products: ${products.length}`);
  console.log(`Invalid Products: ${invalidProducts}`);
  console.log(`Duplicate SKUs: ${duplicateSKUs}`);
  console.log(`Missing Images: ${missingImages}`);
  
  if (invalidProducts > 0 || duplicateSKUs > 0 || missingImages > 0) {
    console.error('Catalog audit failed validation gates.');
    process.exit(1);
  } else {
    console.log('Catalog audit passed.');
  }
}

runAudit();
