const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace import { products } from './data';
content = content.replace("import { products } from './data';", "import { useCatalog } from './contexts/CatalogContext';\nimport { categories, productTypes } from './data';");

// Insert useCatalog inside App component
content = content.replace("export default function App() {\n", "export default function App() {\n  const { products, isLoading } = useCatalog();\n");

// Replace products with safe checks where needed or let the context variable handle it since it's the same name.
fs.writeFileSync('src/App.tsx', content);
