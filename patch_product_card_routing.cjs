const fs = require('fs');
let code = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

if (!code.includes("import { useNavigate } from 'react-router-dom';")) {
  code = code.replace(
    "import { useState } from 'react';",
    "import { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';"
  );

  code = code.replace(
    "const { formatPrice } = useCurrency();",
    "const { formatPrice } = useCurrency();\n  const navigate = useNavigate();"
  );

  code = code.replace(
    /onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*if \(onProductClick\) onProductClick\(product\);\s*\}\}/g,
    "onClick={(e) => {\n                  e.preventDefault();\n                  if (onProductClick) onProductClick(product);\n                  navigate(`/product/${product.id}`);\n                }}"
  );

  fs.writeFileSync('src/components/ProductCard.tsx', code);
}
