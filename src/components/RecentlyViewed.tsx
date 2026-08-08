import { Product } from '../types';
import ProductCard from './ProductCard';

interface RecentlyViewedProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  wishlistItems: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenReviews: (product: Product) => void;
  compareProducts: Product[];
  onToggleCompare: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export default function RecentlyViewed({
  products,
  onAddToCart,
  wishlistItems,
  onToggleWishlist,
  onOpenReviews,
  compareProducts,
  onToggleCompare,
  onProductClick
}: RecentlyViewedProps) {
  if (products.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 py-12 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Recently Viewed
        </h2>
        
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-6 snap-x hide-scrollbar">
          {products.map((product) => (
            <div key={product.id} className="w-[280px] flex-none snap-start">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                isWishlisted={wishlistItems.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onOpenReviews={() => onOpenReviews(product)}
                isCompared={compareProducts.some(p => p.id === product.id)}
                onToggleCompare={onToggleCompare}
                onProductClick={onProductClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
