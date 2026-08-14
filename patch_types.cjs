const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const newTypes = `
// --- PHASE 3: PRODUCT IDENTITY ARCHITECTURE ---
export interface ProductFamily {
  id: string;
  brandId: string;
  name: string;
  description: string;
  categoryId: string;
}

export interface ProductModel {
  id: string;
  productId: string;
  name: string;
  releaseYear?: number;
}

export interface SKU {
  id: string;
  variantId: string;
  code: string;
}

export interface Seller {
  id: string;
  name: string;
  trustScore: number;
}

export interface InventoryItem {
  skuId: string;
  sellerId: string;
  quantity: number;
  condition: 'New' | 'Refurbished' | 'Used';
}

export interface PriceRecord {
  id: string;
  skuId: string;
  sellerId: string;
  amount: number;
  currency: string;
  timestamp: string;
}
`;

if (!code.includes('ProductFamily')) {
  code = code.replace('// --- NEW COMMERCE DATA MODEL ---', '// --- NEW COMMERCE DATA MODEL ---\n' + newTypes);
  fs.writeFileSync('src/types.ts', code);
}
