import { Product, ProductImage } from '../types';

export const imageRegistry: Record<string, ProductImage> = {};

export function registerImage(image: ProductImage) {
  imageRegistry[image.id] = image;
}

export function getVerifiedImage(product: Product): string | null {
  // Simple resolution logic using the registry
  // First check if there's a verified image exactly matching the product variant/model
  const images = Object.values(imageRegistry).filter(img => 
    img.productId === product.id && 
    img.verificationStatus === 'verified'
  );
  
  if (images.length > 0) {
    return images[0].url;
  }
  
  // For backwards compatibility in Stage 1, return the existing image if no verified image is found
  if (product.image && !product.image.includes('source.unsplash.com')) {
    return product.image; 
  }
  
  return null;
}

export function validateImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
