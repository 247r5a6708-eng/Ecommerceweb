const fs = require('fs');
let content = fs.readFileSync('src/components/QuickViewModal.tsx', 'utf-8');
content = content.replace(
  /const freqBoughtProducts = products.filter.*/,
  'const freqBoughtProducts = products.filter(p => frequentlyBoughtIds.includes(p.id) && p.id !== product.id);'
);
fs.writeFileSync('src/components/QuickViewModal.tsx', content);
