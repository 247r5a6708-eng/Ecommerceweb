const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import ReturnsPage')) {
  code = code.replace(
    "import ProductPage from './pages/ProductPage';",
    "import ProductPage from './pages/ProductPage';\nimport ReturnsPage from './pages/ReturnsPage';"
  );
  code = code.replace(
    '<Route path="/product/:productId"',
    '<Route path="/returns" element={<ReturnsPage />} />\n        <Route path="/product/:productId"'
  );
  fs.writeFileSync('src/App.tsx', code);
}
