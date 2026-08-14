const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "export interface WalletProduct {",
  `export interface WalletProduct {
  serialNumber?: string;
  invoiceUrl?: string;`
);

fs.writeFileSync('src/types.ts', code);
