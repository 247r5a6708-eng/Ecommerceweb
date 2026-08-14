const fs = require('fs');
let code = fs.readFileSync('src/services/catalogService.ts', 'utf8');

code = code.replace(
  'export function getAllProducts(): Product[] {',
  'export async function getProducts(): Promise<Product[]> {\n  return products;\n}\n\nexport function getAllProducts(): Product[] {'
);

fs.writeFileSync('src/services/catalogService.ts', code);
