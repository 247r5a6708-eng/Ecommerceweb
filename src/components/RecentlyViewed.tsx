import { Product } from '../types';
import ProductCard from './ProductCard';

import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface RecentlyViewedProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  wishlistItems: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenReviews: (product: Product) => void;
  compareProducts: Product[];
  onToggleCompare: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onClear: () => void;
}
export default function RecentlyViewed({
  products,
  onAddToCart,
  wishlistItems,
  onToggleWishlist,
  onOpenReviews,
  compareProducts,
  onToggleCompare,
  onProductClick,
  onClear
}: RecentlyViewedProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="bg-transparent py-16 border-t border-neutral-200/50 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recently Viewed
          </h2>
          <button
            onClick={onClear}
            className="flex items-center text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear History
          </button>
        </div>
        
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 hidden sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-6 snap-x hide-scrollbar scroll-smooth"
          >
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
    </div>
  );
}
