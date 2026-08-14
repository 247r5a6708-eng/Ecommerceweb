const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { Routes, Route } from \'react-router-dom\'')) {
  code = code.replace(
    "import { BrowserRouter } from 'react-router-dom';",
    "import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';"
  );
  if (!code.includes('react-router-dom')) {
    code = code.replace(
      "import { useState, useEffect } from 'react';",
      "import { useState, useEffect } from 'react';\nimport { Routes, Route, useNavigate, useLocation } from 'react-router-dom';"
    );
  }

  // Replace <Hero /> down to </ProductGrid></div> with <Routes>
  const start = code.indexOf('<Hero');
  const end = code.indexOf('</div>', code.indexOf('</ProductGrid>')) + 6;

  const homeContent = code.slice(start, end);
  
  const routes = `
      <Routes>
        <Route path="/" element={
          <>
${homeContent}
          </>
        } />
        <Route path="/product/:productId" element={<ProductPage cartItems={cartItems} onAddToCart={handleAddToCart} reviews={reviews} onNotifyMe={setNotifyProduct} />} />
      </Routes>
  `;

  code = code.slice(0, start) + routes + code.slice(end);
  code = code.replace("import NotifyMeModal", "import ProductPage from './pages/ProductPage';\nimport NotifyMeModal");

  fs.writeFileSync('src/App.tsx', code);
}
