import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import SafeProductImage from './SafeProductImage';
import { useCurrency } from '../contexts/CurrencyContext';

interface SharedWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  productIds: string[];
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
}

export default function SharedWishlistModal({
  isOpen,
  onClose,
  productIds,
  products,
  isLoading,
  onAddToCart
}: SharedWishlistModalProps) {
  const { formatPrice } = useCurrency();
  const sharedProducts = productIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => p !== undefined);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[#121216] w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-white/5"
          >
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2 text-blue-500" />
                  Shared Wishlist
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Someone shared their favorite items with you.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-black/20">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-500 font-medium">Loading shared items...</p>
                </div>
              ) : sharedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">Empty Wishlist</p>
                  <p className="text-gray-500 mt-1">There are no items in this shared wishlist.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sharedProducts.map(product => (
                    <div key={product.id} className="flex flex-col bg-white dark:bg-[#1a1a1f] p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                      <div className="flex space-x-4 mb-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5">
                          <SafeProductImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full"
                            imageClassName="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.brand}</p>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug">{product.name}</h4>
                          <p className="font-bold text-gray-900 dark:text-white mt-1">{formatPrice(product.price)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart({ ...product, selectedSize: product.sizes?.[0] })}
                        className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm flex items-center justify-center space-x-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mt-auto"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
