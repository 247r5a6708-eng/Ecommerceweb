import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { useCatalog } from '../contexts/CatalogContext';
import ProductCard from './ProductCard';

interface RecommendationsProps {
  wishlistItems: string[];
  cartItems: any[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
}

export default function Recommendations({ wishlistItems, cartItems, onAddToCart, onProductClick, onToggleWishlist }: RecommendationsProps) {
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { products } = useCatalog();

  useEffect(() => {
    // Only fetch if we have some signal
    if (wishlistItems.length === 0 && cartItems.length === 0) {
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
            cartIds: cartItems.map(c => c.productId)
          })
        });
        const data = await res.json();
        setRecommendedIds(data.recommendedIds || []);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [wishlistItems, cartItems]);

  if (wishlistItems.length === 0 && cartItems.length === 0) return null;

  const recProducts = products.filter(p => recommendedIds.includes(p.id));

  return (
    <div className="py-16 bg-gray-50 dark:bg-[#030305] border-t border-gray-100 dark:border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recommended For You</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12 text-purple-600 dark:text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-3 font-medium">LUMINA is finding perfect matches...</span>
          </div>
        ) : recProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 xl:gap-x-8">
            <AnimatePresence>
              {recProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
        ) : null}
      </div>
    </div>
  );
}
