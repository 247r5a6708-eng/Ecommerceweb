const fs = require('fs');
let content = fs.readFileSync('src/components/ProductGrid.tsx', 'utf-8');
content = content.replace("interface ProductGridProps {", "interface ProductGridProps {\n  aiMatchedIds?: string[] | null;\n  isAiSearching?: boolean;");
fs.writeFileSync('src/components/ProductGrid.tsx', content);
