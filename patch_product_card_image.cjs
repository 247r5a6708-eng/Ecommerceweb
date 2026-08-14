const fs = require('fs');
let code = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

code = code.replace(
  'className="aspect-[4/5] bg-[#F5F5F3] dark:bg-[#0A0A0A] overflow-hidden rounded-t-[calc(0.75rem-1px)] relative cursor-crosshair"',
  'className="aspect-[4/5] bg-[#F5F5F3] dark:bg-[#0A0A0A] overflow-hidden rounded-t-[calc(0.75rem-1px)] relative cursor-pointer"\n          onClick={() => { if (onProductClick) onProductClick(product); navigate(`/product/${product.id}`); }}'
);

fs.writeFileSync('src/components/ProductCard.tsx', code);
