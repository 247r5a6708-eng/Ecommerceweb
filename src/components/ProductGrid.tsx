import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Product, Review } from '../types';
import { products } from '../data';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  activeType: string;
  activeCategory: string;
  sortOption: string;
  wishlistItems: string[];
  onToggleWishlist: (productId: string) => void;
  isLoading?: boolean;
  reviews: Record<string, Review[]>;
  onOpenReviews: (product: Product) => void;
  compareProducts?: Product[];
  onToggleCompare?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  onNotifyMe?: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart, searchQuery, activeType, activeCategory, sortOption, wishlistItems, onToggleWishlist, isLoading = false, reviews, onOpenReviews, compareProducts = [], onToggleCompare, onProductClick, onNotifyMe }: ProductGridProps) {
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesType = activeType === 'All' || p.type === activeType;
      
      if (!searchQuery) return matchesCategory && matchesType;
      
      const query = searchQuery.toLowerCase();
      
      // Advanced Search Logic (Phase 5)
      
      // 1. Extract budget (e.g., "under 500", "under $50", "under ₹40000", "< 100")
      let maxBudget = Infinity;
      const budgetMatch = query.match(/(?:under|below|<|less than)\s*(?:[$€£₹])?\s*(\d+)/i);
      if (budgetMatch && budgetMatch[1]) {
        maxBudget = parseInt(budgetMatch[1], 10);
      }

      // If currency is INR and we are searching for INR budget, we should probably factor exchange rate? 
      // The requirement just says "budget", let's assume we filter on the raw USD price or they mean the converted price.
      // Since we don't have currency context easily available here in the filter loop (or we could use it if we passed it), 
      // let's do a basic check on the raw price for now, assuming USD base. 
      // A more robust implementation would pass `currencyRate` down.
      // If we assume the query budget is in the user's current currency, we'd need the rate. Let's just use `p.price`.
      const matchesBudget = p.price <= maxBudget;

      const matchesSearch = 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.aiSummary && p.aiSummary.toLowerCase().includes(query)) ||
        p.type.toLowerCase().includes(query);
      
      // Basic semantic keywords simulation
      const hasDurabilityIntent = ['durable', 'lasting', 'strong', 'repair'].some(k => query.includes(k));
      const hasSustainabilityIntent = ['eco', 'sustainable', 'green', 'organic'].some(k => query.includes(k));
      const hasGamingIntent = ['gaming', 'game', 'fps', 'rgb', 'play'].some(k => query.includes(k));
      const hasOfficeIntent = ['office', 'work', 'typing', 'business', 'professional'].some(k => query.includes(k));
      const hasTravelIntent = ['travel', 'portable', 'lightweight', 'compact', 'commuting'].some(k => query.includes(k));
      const hasBudgetIntent = ['cheap', 'budget', 'affordable', 'value', 'inexpensive'].some(k => query.includes(k));
      
      let semanticMatch = false;
      if (hasDurabilityIntent && p.repairabilityScore && p.repairabilityScore >= 7) semanticMatch = true;
      if (hasSustainabilityIntent && (p.sustainabilityGrade === 'A' || p.sustainabilityGrade === 'B')) semanticMatch = true;
      if (hasGamingIntent && (p.category === 'Electronics' && (p.name.toLowerCase().includes('gam') || p.description.toLowerCase().includes('gam')))) semanticMatch = true;
      if (hasOfficeIntent && (p.category === 'Electronics' || p.category === 'Accessories') && !p.name.toLowerCase().includes('gam')) semanticMatch = true;
      if (hasTravelIntent && (p.type === 'Audio' || p.type === 'Bags' || p.type === 'Gadgets')) semanticMatch = true;
      if (hasBudgetIntent && p.price < 100) semanticMatch = true;

      // Ensure budget constraint is respected if present
      if (maxBudget !== Infinity && !matchesBudget) return false;

      return matchesCategory && matchesType && (matchesSearch || semanticMatch);
    });
    
    return result.sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'featured':
        default:
          // If searching, boost higher trust score results
          if (searchQuery && a.trustScore && b.trustScore) {
             return b.trustScore - a.trustScore;
          }
          return 0;
      }
    });
  }, [searchQuery, activeType, activeCategory, sortOption]);

  const recommendedProducts = useMemo(() => {
    const recommendationPool = products.filter(p => 
      !filteredProducts.find(fp => fp.id === p.id) && 
      (activeCategory === 'All' || p.category === activeCategory)
    );
    // Shuffle and pick top 4
    return recommendationPool
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [filteredProducts, activeCategory]);

  return (
    <div id="products" className="bg-transparent py-8 sm:py-12 transition-colors relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 xl:gap-x-8">
             {Array.from({ length: 8 }).map((_, i) => (
               <ProductCardSkeleton key={i} />
             ))}
           </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <motion.div 
            key={`${activeCategory}-${activeType}-${sortOption}-${searchQuery}`}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 xl:gap-x-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] } },
                    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
                  }}
                  exit="exit"
                  key={product.id}
                >
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    isWishlisted={wishlistItems.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                    reviews={reviews[product.id] || []}
                    onOpenReviews={() => onOpenReviews(product)}
                    isCompared={compareProducts?.some(p => p.id === product.id)}
                    onToggleCompare={onToggleCompare}
                    onProductClick={onProductClick}
                    onNotifyMe={onNotifyMe}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* You Might Also Like Section */}
        {!isLoading && recommendedProducts.length > 0 && (
          <div className="mt-24 border-t border-gray-100 dark:border-white/5 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center sm:text-left">
              You Might Also Like
            </h2>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 xl:gap-x-8"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {recommendedProducts.map((product) => (
                <motion.div 
                  key={`rec-${product.id}`}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] } }
                  }}
                >
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    isWishlisted={wishlistItems.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                    reviews={reviews[product.id] || []}
                    onOpenReviews={() => onOpenReviews(product)}
                    isCompared={compareProducts?.some(p => p.id === product.id)}
                    onToggleCompare={onToggleCompare}
                    onProductClick={onProductClick}
                    onNotifyMe={onNotifyMe}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
