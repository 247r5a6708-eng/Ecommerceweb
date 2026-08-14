const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

code = code.replace(
  '            </div>\n                    {freqBoughtProducts.length > 0 && (',
  '            </div>\n          </div>\n          {freqBoughtProducts.length > 0 && ('
);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
