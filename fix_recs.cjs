const fs = require('fs');
let content = fs.readFileSync('src/components/Recommendations.tsx', 'utf-8');
content = content.replace("onClick={() => onProductClick(product)}", "onProductClick={onProductClick}");
fs.writeFileSync('src/components/Recommendations.tsx', content);
