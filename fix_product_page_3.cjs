const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

// The goal is to insert `</div>` right before `{freqBoughtProducts.length > 0 && (`
code = code.replace(
  "{freqBoughtProducts.length > 0 && (",
  "</div>{freqBoughtProducts.length > 0 && ("
);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
