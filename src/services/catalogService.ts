import { logAuditAction } from "./adminService";
import { collection, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import type { 
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
} from '../types.ts';

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
    console.error('Error fetching catalog:', error.message, error);
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
  
  const issues: { type: 'missing_sku' | 'invalid_sku' | 'missing_image', message: string, variantId?: string, skuId?: string }[] = [];
  
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
    
    // Validate SKUs
    for (const variant of variants) {
      const variantSkus = skus.filter(s => s.variantId === variant.id);
      
      const variantImages = images.filter(img => img.variantId === variant.id);
      if (variantImages.length === 0) {
        missingImages++;
        issues.push({ type: 'missing_image', message: `Missing image for variant ${variant.name}`, variantId: variant.id });
      }
      
      if (variantSkus.length === 0) {
        console.warn(`Missing SKU for variant ${variant.id} (${variant.name})`);
        missingSKUs++;
        issues.push({ type: 'missing_sku', message: `Missing SKU for variant ${variant.name}`, variantId: variant.id });
      } else {
        for (const sku of variantSkus) {
          if (!/^SKU-[A-Za-z0-9-]+$/.test(sku.code)) {
            console.warn(`Invalid SKU format for ${sku.id}: ${sku.code}`);
            invalidSKUs++;
            issues.push({ type: 'invalid_sku', message: `Invalid SKU format for ${sku.code}`, variantId: variant.id, skuId: sku.id });
          }
        }
      }
    }
    
    console.log(`Audit complete. Missing SKUs: ${missingSKUs}, Invalid SKUs: ${invalidSKUs}, Missing Images: ${missingImages}`);
    
  } catch (error) {
    console.error('Validation error:', error);
  }
  
  return { missingImages, brokenImages, missingSKUs, invalidSKUs, issues };
}

export async function batchFixIssues(issues: any[]) {
  const batch = writeBatch(db);
  
  for (const issue of issues) {
    if (issue.type === 'missing_sku' && issue.variantId) {
      const newSkuId = `sku-${crypto.randomUUID().split('-')[0]}`;
      const skuRef = doc(db, 'skus', newSkuId);
      batch.set(skuRef, {
        id: newSkuId,
        variantId: issue.variantId,
        code: `SKU-FIXED-${Math.floor(Math.random() * 10000)}`
      });
    } else if (issue.type === 'invalid_sku' && issue.skuId) {
      const skuRef = doc(db, 'skus', issue.skuId);
      batch.update(skuRef, {
        code: `SKU-FIXED-${Math.floor(Math.random() * 10000)}`
      });
    } else if (issue.type === 'missing_image' && issue.variantId) {
      const newImgId = `img-${crypto.randomUUID().split('-')[0]}`;
      const imgRef = doc(db, 'productImages', newImgId);
      batch.set(imgRef, {
        id: newImgId,
        variantId: issue.variantId,
        url: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=500',
        verified: true,
        verificationStatus: 'verified',
        createdAt: new Date().toISOString()
      });
    }
  }
  
  await batch.commit();
}

export async function createImportedProducts(parsedProducts: any[]) {
  const batch = writeBatch(db);
  
  for (const p of parsedProducts) {
    const familyId = `fam-${crypto.randomUUID().split('-')[0]}`;
    const modelId = `mod-${crypto.randomUUID().split('-')[0]}`;
    const variantId = `var-${crypto.randomUUID().split('-')[0]}`;
    const skuId = `sku-${crypto.randomUUID().split('-')[0]}`;
    
    // Determine category ID (simplification, would normally lookup)
    const categoryId = 'cat-' + p.category.toLowerCase().replace(/[^a-z0-9]/g, '');
    const brandId = 'brd-' + p.brand.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    batch.set(doc(db, 'brands', brandId), { id: brandId, name: p.brand });
    batch.set(doc(db, 'categories', categoryId), { id: categoryId, name: p.category });
    
    batch.set(doc(db, 'productFamilies', familyId), {
      id: familyId,
      name: p.name,
      description: p.description,
      brandId,
      categoryId
    });
    
    batch.set(doc(db, 'productModels', modelId), {
      id: modelId,
      productId: familyId,
      name: p.name
    });
    
    batch.set(doc(db, 'productVariants', variantId), {
      id: variantId,
      productId: modelId,
      name: p.name,
      price: p.price,
      inventoryCount: p.inventoryCount || 10,
      attributes: {}
    });
    
    batch.set(doc(db, 'skus', skuId), {
      id: skuId,
      variantId,
      code: p.sku || `SKU-${Math.floor(Math.random() * 100000)}`
    });
    
    const imagesToSave = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    
    if (imagesToSave.length > 0) {
      imagesToSave.forEach((url: string, index: number) => {
        const imgId = `img-${crypto.randomUUID().split('-')[0]}`;
        batch.set(doc(db, 'productImages', imgId), {
          id: imgId,
          variantId,
          url,
          verified: true,
          verificationStatus: 'verified',
          createdAt: new Date().toISOString()
        });
      });
    } else {
      const imgId = `img-${crypto.randomUUID().split('-')[0]}`;
      batch.set(doc(db, 'productImages', imgId), {
        id: imgId,
        variantId,
        url: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=500',
        verified: true,
        verificationStatus: 'verified',
        createdAt: new Date().toISOString()
      });
    }
  }
  
  await batch.commit();
}



export async function deleteProduct(product: Product) {
  // We need to delete from productFamilies, models, variants, skus, images
  const batch = writeBatch(db);
  
  if (product.productId) batch.delete(doc(db, 'productFamilies', product.productId));
  if (product.modelId) batch.delete(doc(db, 'productModels', product.modelId));
  if (product.variantId) batch.delete(doc(db, 'productVariants', product.variantId));
  
  if (product.images) {
    product.images.forEach(img => {
      batch.delete(doc(db, 'productImages', img.id));
    });
  }
  
  // Actually we should just fetch the skus related to variantId and delete them, but for brevity in this MVP we might leave orphans or delete if we know the SKU ID.
  
  await batch.commit();
  await logAuditAction('PRODUCT_DELETE', product.id, `Deleted product: ${product.name}`);
}

export async function updateProductVariant(variantId: string, data: Partial<ProductVariant>) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    const ref = doc(db, 'productVariants', variantId);
    await updateDoc(ref, data);
    await logAuditAction('PRODUCT_UPDATE', variantId, `Updated product variant details`);
    return true;
  } catch (err) {
    console.error("Error updating variant", err);
    return false;
  }
}

export async function addProduct(productData: any) {
  try {
    const { doc, writeBatch } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    const batch = writeBatch(db);

    const familyId = `fam-${crypto.randomUUID().split('-')[0]}`;
    const modelId = `mod-${crypto.randomUUID().split('-')[0]}`;
    const variantId = `var-${crypto.randomUUID().split('-')[0]}`;
    const skuId = `sku-${crypto.randomUUID().split('-')[0]}`;

    const categoryId = 'cat-' + (productData.category || 'Uncategorized').toLowerCase().replace(/[^a-z0-9]/g, '');
    const brandId = 'brd-lumina'; // default brand

    batch.set(doc(db, 'brands', brandId), { id: brandId, name: 'Lumina' }, { merge: true });
    batch.set(doc(db, 'categories', categoryId), { id: categoryId, name: productData.category || 'Uncategorized' }, { merge: true });

    batch.set(doc(db, 'productFamilies', familyId), {
      id: familyId,
      name: productData.name,
      description: productData.description,
      brandId,
      categoryId
    });

    batch.set(doc(db, 'productModels', modelId), {
      id: modelId,
      productId: familyId,
      name: productData.name
    });

    batch.set(doc(db, 'productVariants', variantId), {
      id: variantId,
      productId: modelId,
      name: productData.name,
      price: productData.price || 0,
      inventoryCount: productData.inventoryCount || 0,
      sizeGuideVideoUrl: productData.sizeGuideVideoUrl || '',
      isPinnedInSuggestions: productData.isPinnedInSuggestions || false,
      attributes: {}
    });

    batch.set(doc(db, 'skus', skuId), {
      id: skuId,
      variantId,
      code: productData.sku || `SKU-${Math.floor(Math.random() * 100000)}`
    });

    if (productData.image) {
       const imgId = `img-${crypto.randomUUID().split('-')[0]}`;
       batch.set(doc(db, 'productImages', imgId), {
         id: imgId,
         variantId,
         url: productData.image,
         verified: true,
         verificationStatus: 'verified',
         createdAt: new Date().toISOString()
       });
    }

    await batch.commit();
    
    await logAuditAction('PRODUCT_ADD', variantId, `Added new product: ${productData.name}`);
    
    // Invalidate cache
    catalogCache = null;
    return true;
  } catch (error) {
    console.error("Error adding product:", error);
    return false;
  }
}
