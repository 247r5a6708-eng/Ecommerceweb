const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const newFields = `  brandId?: string;
  categoryId?: string;
  productId?: string;
  modelId?: string;
  variantId?: string;
  compatibility?: string;
  shipping?: string;`;

code = code.replace(
  "export interface Product {",
  "export interface Product {\n" + newFields
);

fs.writeFileSync('src/types.ts', code);
