import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Product, Review } from '../types';
import { useCatalog } from '../contexts/CatalogContext';

interface ProductGridProps {
  cartItems?: any[];
  aiMatchedIds?: string[] | null;
  isAiSearching?: boolean;
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
  onClearSearch?: () => void;
}

export default function ProductGrid({ cartItems = [],  onAddToCart, searchQuery, activeType, activeCategory, sortOption, wishlistItems, onToggleWishlist, isLoading: propIsLoading = false, reviews, onOpenReviews, compareProducts = [], onToggleCompare, onProductClick, onNotifyMe, aiMatchedIds, isAiSearching, onClearSearch }: ProductGridProps) {
  const { products, isLoading: contextIsLoading } = useCatalog();
  const isLoading = propIsLoading || contextIsLoading || isAiSearching;
  const [fuzzySearchTerm, setFuzzySearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesType = activeType === 'All' || p.type === activeType;
      return matchesCategory && matchesType;
    });

    if (aiMatchedIds) {
      return result.filter(p => aiMatchedIds.includes(p.id));
    }

    if (!searchQuery) {
       return result;
    }

    const query = searchQuery.toLowerCase();

    // 1. Extract budget
    let maxBudget = Infinity;
    const budgetMatch = query.match(/(?:under|below|<|less than)\s*(?:[$€£₹])?\s*(\d+)/i);
    if (budgetMatch && budgetMatch[1]) {
      maxBudget = parseInt(budgetMatch[1], 10);
    }
    
    // Apply budget constraint early if present
    if (maxBudget !== Infinity) {
       result = result.filter(p => p.price <= maxBudget);
    }
    
    // Semantic intents
    const hasDurabilityIntent = ['durable', 'lasting', 'strong', 'repair'].some(k => query.includes(k));
    const hasSustainabilityIntent = ['eco', 'sustainable', 'green', 'organic'].some(k => query.includes(k));
    const hasGamingIntent = ['gaming', 'game', 'fps', 'rgb', 'play'].some(k => query.includes(k));
    const hasOfficeIntent = ['office', 'work', 'typing', 'business', 'professional'].some(k => query.includes(k));
    const hasTravelIntent = ['travel', 'portable', 'lightweight', 'compact', 'commuting'].some(k => query.includes(k));
    const hasBudgetIntent = ['cheap', 'budget', 'affordable', 'value', 'inexpensive'].some(k => query.includes(k));

    // Fuzzy search
    const fuse = new Fuse(result, {
      keys: ['name', 'brand', 'category', 'type', 'description'],
      threshold: 0.4, // lower is more strict
      ignoreLocation: true,
      useExtendedSearch: true
    });
    
    // If the query is mostly about budget and semantic intents, we might not want to heavily filter by text match.
    // We'll see.
    let semanticMatchedIds = new Set<string>();
    
    result.forEach(p => {
      if (hasDurabilityIntent && p.repairabilityScore && p.repairabilityScore >= 7) semanticMatchedIds.add(p.id);
      if (hasSustainabilityIntent && (p.sustainabilityGrade === 'A' || p.sustainabilityGrade === 'B')) semanticMatchedIds.add(p.id);
      if (hasGamingIntent && (p.category === 'Electronics' && (p.name.toLowerCase().includes('gam') || p.description.toLowerCase().includes('gam')))) semanticMatchedIds.add(p.id);
      if (hasOfficeIntent && (p.category === 'Electronics' || p.category === 'Accessories') && !p.name.toLowerCase().includes('gam')) semanticMatchedIds.add(p.id);
      if (hasTravelIntent && (p.type === 'Audio' || p.type === 'Bags' || p.type === 'Gadgets')) semanticMatchedIds.add(p.id);
      if (hasBudgetIntent && p.price < 100) semanticMatchedIds.add(p.id);
    });
    
    // Perform fuzzy search
    // Remove budget terms from query for fuzzy search so it doesn't try to match "under 500" against product names.
    const cleanQuery = query.replace(/(?:under|below|<|less than)\s*(?:[$€£₹])?\s*(\d+)/i, '').trim();
    
    let fuzzyMatches = [];
    if (cleanQuery) {
       fuzzyMatches = fuse.search(cleanQuery).map(res => res.item);
    } else {
       fuzzyMatches = result;
    }
    
    let finalResult = [];
    
    if (semanticMatchedIds.size > 0 && cleanQuery === '') {
       finalResult = result.filter(p => semanticMatchedIds.has(p.id));
    } else if (semanticMatchedIds.size > 0 && cleanQuery !== '') {
       // Combine fuzzy matches and semantic matches
       finalResult = Array.from(new Set([...fuzzyMatches, ...result.filter(p => semanticMatchedIds.has(p.id))]));
    } else {
       finalResult = fuzzyMatches;
    }

    return finalResult.sort((a, b) => {
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
  }, [searchQuery, activeType, activeCategory, sortOption, aiMatchedIds]);

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
    <div id="products" className="bg-transparent pt-8 pb-32 sm:py-12 transition-colors relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 xl:gap-x-8">
             {Array.from({ length: 8 }).map((_, i) => (
               <ProductCardSkeleton key={i} />
             ))}
           </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-gray-100 dark:bg-white/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="max-w-md mx-auto text-sm text-gray-500 dark:text-gray-400 mb-6">
              We couldn't find an exact match for "{searchQuery}". Try adjusting your search, check for typos, or explore our collections.
            </p>
            {onClearSearch && searchQuery && (
              <button
                onClick={onClearSearch}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors shadow-sm"
              >
                Clear Search
              </button>
            )}
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
                  <ProductCard cartItems={cartItems} 
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
                  <ProductCard cartItems={cartItems} 
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
