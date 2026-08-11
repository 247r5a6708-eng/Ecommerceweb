import { Fragment } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (id: string) => void;
  onClearWishlist: () => void;
  onAddToCart: (product: Product) => void;
}

export default function Wishlist({ isOpen, onClose, items, onRemoveItem, onClearWishlist, onAddToCart }: WishlistProps) {
  const { formatPrice } = useCurrency();

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Wishlist Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white dark:bg-[#121216] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Your Wishlist
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-white/10 rounded-full flex items-center justify-center mb-2">
                    <Heart className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">Your wishlist is empty</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Save items you love to revisit them later.</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul role="list" className="-my-6 divide-y divide-gray-100 dark:divide-white/10">
                  {items.map((item) => (
                    <li key={item.id} className="flex py-6">
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                            <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                            <p className="ml-4">{formatPrice(item.price)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:underline text-sm"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => {
                              onAddToCart(item);
                              onRemoveItem(item.id);
                            }}
                            className="flex items-center space-x-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-white/5 px-6 py-4">
                <button
                  onClick={onClearWishlist}
                  className="w-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 py-3 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
