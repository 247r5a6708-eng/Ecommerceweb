const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import Recommendations')) {
  content = content.replace("import ProductGrid from './components/ProductGrid';", "import ProductGrid from './components/ProductGrid';\nimport Recommendations from './components/Recommendations';");
}

if (!content.includes('<Recommendations')) {
  const recsString = `
      <Recommendations
        wishlistItems={wishlistItems}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onProductClick={handleProductClick}
        onToggleWishlist={handleToggleWishlist}
      />
`;
  content = content.replace("</main>", recsString + "</main>");
}

fs.writeFileSync('src/App.tsx', content);
