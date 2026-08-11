const fs = require('fs');

// QuickViewModal
let qv = fs.readFileSync('src/components/QuickViewModal.tsx', 'utf-8');
qv = qv.replace(
  "{product.model} | {product.variant}", 
  "{product.model} | {product.variant}{product.seller && ` | Sold by: ${product.seller}`}"
);
fs.writeFileSync('src/components/QuickViewModal.tsx', qv);

// ProductCard
let pc = fs.readFileSync('src/components/ProductCard.tsx', 'utf-8');
pc = pc.replace(
  "{product.category}", 
  "{product.category}{product.seller && ` • ${product.seller}`}"
);
fs.writeFileSync('src/components/ProductCard.tsx', pc);

