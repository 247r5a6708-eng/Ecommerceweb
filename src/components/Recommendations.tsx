import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useCatalog } from '../contexts/CatalogContext';
import { useUser } from '../contexts/UserContext';
import ProductCard from './ProductCard';

interface RecommendationsProps {
  wishlistItems: string[];
  cartItems: any[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
}

export default function Recommendations({ wishlistItems, cartItems, onAddToCart, onProductClick, onToggleWishlist }: RecommendationsProps) {
  const { viewedProducts, orders } = useUser();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { products } = useCatalog();

  useEffect(() => {
    // Only fetch if we have some signal
    if (wishlistItems.length === 0 && cartItems.length === 0 && viewedProducts.length === 0 && orders.length === 0) {
      setRecommendedIds([]);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai-recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            wishlistIds: wishlistItems,
            cartIds: cartItems.map(c => c.id || c.productId),
            viewedIds: viewedProducts,
            orderedIds: orders.map(o => o.items.map(i => i.id || i.productId)).flat()
          })
        });
        let data;
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        const textRes = await res.text();
        try {
          data = JSON.parse(textRes);
        } catch (e) {
          data = {};
        }
        setRecommendedIds(data.recommendedIds || []);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 1500);

    return () => clearTimeout(timer);
  }, [wishlistItems, cartItems, viewedProducts, orders]);

  if (wishlistItems.length === 0 && cartItems.length === 0 && viewedProducts.length === 0 && orders.length === 0) return null;

  const recProducts = products.filter(p => recommendedIds.includes(p.id));

  return (
    <div className="py-16 bg-gray-50 dark:bg-[#030305] border-t border-gray-100 dark:border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recommended For You</h2>
          </div>
          {recProducts.length > 0 && (
            <div className="flex space-x-2 hidden sm:flex">
              <button 
                onClick={() => scroll('left')} 
                disabled={!canScrollLeft}
                className="p-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scroll('right')} 
                disabled={!canScrollRight}
                className="p-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12 text-purple-600 dark:text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-3 font-medium">LUMINA is finding perfect matches...</span>
          </div>
        ) : recProducts.length > 0 ? (
          <div className="relative group">
            <div 
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex space-x-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence>
                {recProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-none w-[280px] sm:w-[320px] snap-start"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      isWishlisted={wishlistItems.includes(product.id)}
                      onToggleWishlist={onToggleWishlist}
                      onProductClick={onProductClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
