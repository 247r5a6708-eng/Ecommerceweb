const fs = require('fs');
let code = fs.readFileSync('src/components/Recommendations.tsx', 'utf8');

code = code.replace(
  "import { useCatalog } from '../contexts/CatalogContext';",
  "import { useCatalog } from '../contexts/CatalogContext';\nimport { useUser } from '../contexts/UserContext';"
);

code = code.replace(
  "export default function Recommendations({ wishlistItems, cartItems, onAddToCart, onProductClick, onToggleWishlist }: RecommendationsProps) {",
  "export default function Recommendations({ wishlistItems, cartItems, onAddToCart, onProductClick, onToggleWishlist }: RecommendationsProps) {\n  const { viewedProducts, orders } = useUser();\n  const [canScrollLeft, setCanScrollLeft] = useState(false);\n  const [canScrollRight, setCanScrollRight] = useState(true);\n  const carouselRef = React.useRef<HTMLDivElement>(null);\n\n  const handleScroll = () => {\n    if (carouselRef.current) {\n      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;\n      setCanScrollLeft(scrollLeft > 0);\n      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);\n    }\n  };\n\n  const scroll = (direction: 'left' | 'right') => {\n    if (carouselRef.current) {\n      const scrollAmount = direction === 'left' ? -400 : 400;\n      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });\n    }\n  };"
);

code = code.replace(
  "if (wishlistItems.length === 0 && cartItems.length === 0) {",
  "if (wishlistItems.length === 0 && cartItems.length === 0 && viewedProducts.length === 0 && orders.length === 0) {"
);

code = code.replace(
  "body: JSON.stringify({ \n             wishlistIds: wishlistItems,\n            cartIds: cartItems.map(c => c.id || c.productId)\n          })",
  "body: JSON.stringify({ \n             wishlistIds: wishlistItems,\n            cartIds: cartItems.map(c => c.id || c.productId),\n            viewedIds: viewedProducts,\n            orderedIds: orders.map(o => o.items.map(i => i.id || i.productId)).flat()\n          })"
);

code = code.replace(
  "}, [wishlistItems, cartItems]);",
  "}, [wishlistItems, cartItems, viewedProducts, orders]);"
);

code = code.replace(
  "if (wishlistItems.length === 0 && cartItems.length === 0) return null;",
  "if (wishlistItems.length === 0 && cartItems.length === 0 && viewedProducts.length === 0 && orders.length === 0) return null;"
);

code = code.replace(
  "import { Sparkles, Loader2 } from 'lucide-react';",
  "import { Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';"
);

code = code.replace(
  /<div className="flex items-center space-x-3 mb-8">[\s\S]*?<\/div>/m,
  `<div className="flex items-center justify-between mb-8">
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
        </div>`
);

code = code.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 xl:gap-x-8">[\s\S]*?<\/AnimatePresence>\s*<\/div>/m,
  `<div className="relative group">
            <div 
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex space-x-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
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
          </div>`
);

fs.writeFileSync('src/components/Recommendations.tsx', code);
