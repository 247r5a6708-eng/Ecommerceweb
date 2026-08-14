import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Product, 
  ProductVariant, 
  ProductModel, 
  ProductFamily, 
  Brand, 
  Category, 
  ProductImage, 
  PriceRecord, 
  InventoryItem,
  SKU
} from '../types';

let catalogCache: Product[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getProducts(forceRefresh = false): Promise<Product[]> {
  const now = Date.now();
  if (!forceRefresh && catalogCache && (now - lastCacheTime < CACHE_DURATION)) {
    return catalogCache;
  }

  try {
    // Fetch all normalized collections
    const [
      variantsSnap, 
      modelsSnap, 
      familiesSnap, 
      brandsSnap, 
      categoriesSnap, 
      imagesSnap, 
      pricesSnap, 
      inventorySnap,
      skusSnap,
      sellersSnap
    ] = await Promise.all([
      getDocs(collection(db, 'productVariants')),
      getDocs(collection(db, 'productModels')),
      getDocs(collection(db, 'productFamilies')),
      getDocs(collection(db, 'brands')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'productImages')),
      getDocs(collection(db, 'prices')),
      getDocs(collection(db, 'inventory')),
      getDocs(collection(db, 'skus')),
      getDocs(collection(db, 'sellers'))
    ]);

    const variants = variantsSnap.docs.map(d => d.data() as ProductVariant);
    const models = new Map(modelsSnap.docs.map(d => [d.id, d.data() as ProductModel]));
    const families = new Map(familiesSnap.docs.map(d => [d.id, d.data() as ProductFamily]));
    const brands = new Map(brandsSnap.docs.map(d => [d.id, d.data() as Brand]));
    const categories = new Map(categoriesSnap.docs.map(d => [d.id, d.data() as Category]));
    const images = imagesSnap.docs.map(d => d.data() as ProductImage);
    const prices = pricesSnap.docs.map(d => d.data() as PriceRecord);
    const inventory = inventorySnap.docs.map(d => d.data() as InventoryItem);
    const skus = new Map(skusSnap.docs.map(d => [d.id, d.data() as SKU]));
    const sellers = new Map(sellersSnap.docs.map(d => [d.id, d.data() as any]));

    const products: Product[] = [];

    for (const variant of variants) {
      const model = models.get(variant.productId);
      if (!model) continue;
      
      const family = families.get(model.productId);
      if (!family) continue;

      const brand = brands.get(family.brandId);
      const category = categories.get(family.categoryId);
      
      const variantImages = images.filter(img => img.variantId === variant.id);
      const primaryImage = variantImages.find(img => img.verified) || variantImages[0];
      
      // Find SKU for variant
      let skuObj = Array.from(skus.values()).find(s => s.variantId === variant.id);
      
      let price = variant.price;
      let inventoryCount = variant.inventoryCount;
      let sellerName = 'Unknown Seller';

      if (skuObj) {
        const skuPrice = prices.find(p => p.skuId === skuObj!.id);
        if (skuPrice) price = skuPrice.amount;

        const skuInventory = inventory.find(i => i.skuId === skuObj!.id);
        if (skuInventory) { inventoryCount = skuInventory.quantity; const seller = sellers.get(skuInventory.sellerId); if (seller) sellerName = seller.name; }
      }

      const product: Product = {
        id: variant.id.replace('var-', ''), // map back to original ID for backward compatibility with UI
        name: `${family.name} ${model.name}`,
        brand: brand?.name || 'Unknown',
        model: model.name,
        variant: variant.name,
        description: family.description,
        price: price,
        category: category?.name || 'Uncategorized',
        type: 'General',
        image: primaryImage?.url || '',
        rating: 4.5, // Default rating
        brandId: brand?.id,
        categoryId: category?.id,
        productId: family.id,
        modelId: model.id,
        variantId: variant.id,
        sku: skuObj?.code || variant.sku,
        inventory: inventoryCount,
        seller: sellerName,
        images: variantImages,
        inStock: inventoryCount > 0
      };

      products.push(product);
    }

    catalogCache = products;
    lastCacheTime = now;
    return products;
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find(p => p.id === id || p.variantId === `var-${id}`);
}

export function getAllProducts(): Product[] {
  console.warn('getAllProducts is deprecated. Use async getProducts() instead.');
  return catalogCache || [];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(p => p.category === category || category === 'All');
}

export async function validateCatalogIntegrity() {
  console.log('Starting catalog integrity audit...');
  let missingImages = 0;
  let brokenImages = 0;
  let missingSKUs = 0;
  let invalidSKUs = 0;
  
  try {
    const [imagesSnap, variantsSnap, skusSnap] = await Promise.all([
      getDocs(collection(db, 'productImages')),
      getDocs(collection(db, 'productVariants')),
      getDocs(collection(db, 'skus'))
    ]);
    
    const images = imagesSnap.docs.map(d => d.data() as ProductImage);
    const variants = variantsSnap.docs.map(d => d.data() as ProductVariant);
    const skus = skusSnap.docs.map(d => d.data() as SKU);
    
    // Validate images
    missingImages = 0;
    brokenImages = 0;
    console.log('Validating ' + images.length + ' images');
    
    // Validate SKUs
    for (const variant of variants) {
      const variantSkus = skus.filter(s => s.variantId === variant.id);
      
      if (variantSkus.length === 0) {
        console.warn(`Missing SKU for variant ${variant.id} (${variant.name})`);
        missingSKUs++;
      } else {
        for (const sku of variantSkus) {
          // Check SKU format, e.g. starts with SKU-
          if (!/^SKU-[A-Za-z0-9-]+$/.test(sku.code)) {
            console.warn(`Invalid SKU format for ${sku.id}: ${sku.code}`);
            invalidSKUs++;
          }
        }
      }
    }
    
    console.log(`Audit complete. Missing SKUs: ${missingSKUs}, Invalid SKUs: ${invalidSKUs}, Missing Images: ${missingImages}`);
    
  } catch (error) {
    console.error('Validation error:', error);
  }
  
  return { missingImages, brokenImages, missingSKUs, invalidSKUs };


}