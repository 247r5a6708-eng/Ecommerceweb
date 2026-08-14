import { Product } from '../types';
import { products } from '../data';
import { validateImage } from './imageService';

export async function validateCatalogImages() {
  console.log('Starting image audit...');
  let missing = 0;
  let broken = 0;
  
  for (const product of products) {
    if (!product.image) {
      console.warn(`Missing image for product ${product.id}`);
      missing++;
      continue;
    }
    
    // In a real app we might await all validations, but for now we just want to expose the capability
    const isValid = await validateImage(product.image);
    if (!isValid) {
      console.warn(`Broken image URL for product ${product.id}: ${product.image}`);
      broken++;
    }
  }
  
  console.log(`Image audit complete. Missing: ${missing}, Broken: ${broken}`);
  return { missing, broken };
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export async function getProducts(): Promise<Product[]> {
  return products;
}

export function getAllProducts(): Product[] {
  return products;
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category || category === 'All');
}

export async function seedCatalog() {
  console.log('Seeding catalog...');
  // Logic would go here to push to firestore if needed
}
