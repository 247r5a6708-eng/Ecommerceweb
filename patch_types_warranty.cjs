const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const warrantyType = `
export interface StructuredWarranty {
  provider: string;
  startDate?: string;
  durationMonths: number;
  coverage: string[];
  exclusions: string[];
  status: 'Active' | 'Expired' | 'Pending';
}
`;

if (!code.includes('StructuredWarranty')) {
  code = code.replace('export interface Product {', warrantyType + '\nexport interface Product {\n  structuredWarranty?: StructuredWarranty;');
  fs.writeFileSync('src/types.ts', code);
}
