import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { products } from '../../src/data';
import { 
  ProductFamily, 
  ProductModel, 
  ProductVariant, 
  SKU, 
  ProductImage,
  Brand,
  Category,
  Seller,
  InventoryItem,
  PriceRecord
} from '../../src/types';

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

async function migrate() {
  console.log('Migrating flat products to normalized catalog...');
  const batch = writeBatch(db);

  // Default Seller
  const defaultSeller: Seller = {
    id: 'seller-lumina-first-party',
    name: 'LUMINA Official',
    trustScore: 100
  };
  batch.set(doc(db, 'sellers', defaultSeller.id), defaultSeller);

  const brandMap = new Map<string, Brand>();
  const categoryMap = new Map<string, Category>();
  const familyMap = new Map<string, ProductFamily>();
  const modelMap = new Map<string, ProductModel>();
  
  let count = 0;

  for (const p of products) {
    if (!p.brand) continue;

    // 1. Brand
    if (!brandMap.has(p.brand)) {
      const brand: Brand = { id: `brand-${p.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, name: p.brand };
      brandMap.set(p.brand, brand);
      batch.set(doc(db, 'brands', brand.id), brand);
    }
    const brand = brandMap.get(p.brand)!;

    // 2. Category
    if (!categoryMap.has(p.category)) {
      const category: Category = { id: `cat-${p.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, name: p.category };
      categoryMap.set(p.category, category);
      batch.set(doc(db, 'categories', category.id), category);
    }
    const category = categoryMap.get(p.category)!;

    // 3. ProductFamily (Using name as family if no obvious family exists, or parse it)
    const familyKey = `${brand.id}-${category.id}-${p.name.split(' ')[0]}`;
    if (!familyMap.has(familyKey)) {
      const family: ProductFamily = {
        id: `fam-${familyKey}`,
        brandId: brand.id,
        name: p.name.split(' ')[0],
        description: `All ${p.name.split(' ')[0]} products by ${brand.name}`,
        categoryId: category.id
      };
      familyMap.set(familyKey, family);
      batch.set(doc(db, 'productFamilies', family.id), family);
    }
    const family = familyMap.get(familyKey)!;

    // 4. ProductModel
    const modelKey = p.model || p.name;
    if (!modelMap.has(modelKey)) {
      const model: ProductModel = {
        id: `mod-${generateId('mod')}`,
        productId: family.id,
        name: modelKey,
      };
      modelMap.set(modelKey, model);
      batch.set(doc(db, 'productModels', model.id), model);
    }
    const model = modelMap.get(modelKey)!;

    // 5. Variant
    const variant: ProductVariant = {
      id: `var-${p.id}`,
      productId: model.id,
      name: p.variant || 'Standard',
      sku: `SKU-${p.id}`,
      price: p.price,
      inventoryCount: p.inventory || 10,
      attributes: { variant: p.variant || 'Standard' }
    };
    batch.set(doc(db, 'productVariants', variant.id), variant);

    // 6. SKU
    const sku: SKU = {
      id: variant.sku,
      variantId: variant.id,
      code: variant.sku
    };
    batch.set(doc(db, 'skus', sku.id), sku);

    // 7. InventoryItem
    const inventory: InventoryItem = {
      skuId: sku.id,
      sellerId: defaultSeller.id,
      quantity: variant.inventoryCount,
      condition: 'New'
    };
    batch.set(doc(db, 'inventory', `${sku.id}-${defaultSeller.id}`), inventory);

    // 8. PriceRecord
    const priceRecord: PriceRecord = {
      id: `prc-${sku.id}`,
      skuId: sku.id,
      sellerId: defaultSeller.id,
      amount: variant.price,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };
    batch.set(doc(db, 'prices', priceRecord.id), priceRecord);

    // 9. ProductImage
    if (p.image) {
      const image: ProductImage = {
        id: `img-${p.id}`,
        productId: family.id,
        modelId: model.id,
        variantId: variant.id,
        url: p.image,
        verified: true,
        verificationStatus: 'verified',
        createdAt: new Date().toISOString()
      };
      batch.set(doc(db, 'productImages', image.id), image);
    }
    
    count++;
  }

  await batch.commit();
  console.log(`Migration complete! Processed ${count} products.`);
  process.exit(0);
}

migrate().catch(console.error);
