const fs = require('fs');
let code = fs.readFileSync('src/components/ProductGrid.tsx', 'utf8');

code = code.replace(
  'const filteredProducts = useMemo(() => {',
  'const filteredProducts = useMemo(() => {\n    console.log("ProductGrid computing:", { activeCategory, activeType, searchQuery, productsCount: products.length, aiMatchedIds });'
);

code = code.replace(
  'if (!searchQuery) {\n       return result;\n    }',
  'if (!searchQuery) {\n       console.log("ProductGrid returning result directly:", result.length);\n       return result;\n    }'
);

fs.writeFileSync('src/components/ProductGrid.tsx', code);
