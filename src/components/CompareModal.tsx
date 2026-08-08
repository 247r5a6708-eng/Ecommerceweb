import { motion, AnimatePresence } from 'motion/react';
import { X, Scale, Star, ShoppingBag } from 'lucide-react';
import { Product, Review } from '../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  reviews: Record<string, Review[]>;
}

export default function CompareModal({ isOpen, onClose, products, onRemoveProduct, onAddToCart, reviews }: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Scale className="w-5 h-5" />
              <h2 className="text-xl font-bold">Compare Products</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products selected for comparison.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {products.length > 1 && (
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800 -translate-x-1/2" />
                )}
                {products.map((product) => {
                  const productReviews = reviews[product.id] || [];
                  const averageRating = productReviews.length > 0 
                    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
                    : product.rating;

                  return (
                    <div key={product.id} className="relative flex flex-col">
                      <button 
                        onClick={() => onRemoveProduct(product.id)}
                        className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10 shadow-sm"
                        aria-label="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4 relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 ml-1 font-medium">{averageRating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-400 dark:text-gray-500 ml-2">({productReviews.length} reviews)</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-6">${product.price.toFixed(2)}</p>
                      
                      <div className="flex-grow">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">Description</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{product.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart(product);
                        }}
                        className="w-full mt-auto flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  );
                })}
                {products.length === 1 && (
                  <div className="hidden md:flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                    <Scale className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Select another product to compare.</p>
                  </div>
                )}
              </div>
            )}
            
            {products.length > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                  <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-blue-500 fill-blue-500" />
                    AI Recommendation
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Best Overall: {products[0].trustScore && products[1].trustScore ? (products[0].trustScore > products[1].trustScore ? products[0].name : products[1].name) : products[0].name}</strong>
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    Based on verified trust scores, repairability indexes, and overall value, we recommend this product. It provides a better balance of sustainability and long-term durability. 
                    {products[0].warrantyInfo && products[1].warrantyInfo && ` Also features superior warranty coverage.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
