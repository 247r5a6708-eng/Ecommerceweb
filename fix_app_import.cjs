const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { useCart } from './hooks/useCart';",
  "import { useCart } from './hooks/useCart';\nimport { useSearch } from './hooks/useSearch';"
);

fs.writeFileSync('src/App.tsx', code);
