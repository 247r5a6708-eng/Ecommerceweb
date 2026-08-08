import { useState } from 'react';
import { Product, Review } from '../types';
import { ShoppingBag, Star, Heart, TrendingUp, Eye, Scale, ShieldCheck, Leaf, Wrench } from 'lucide-react';
import PriceChart from './PriceChart';
import QuickViewModal from './QuickViewModal';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  reviews?: Review[];
  onOpenReviews?: () => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, isWishlisted, onToggleWishlist, reviews = [], onOpenReviews, isCompared = false, onToggleCompare, onProductClick }: ProductCardProps) {
  const [showChart, setShowChart] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : product.rating;
  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-300">
        <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          
          {/* Trust Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2 z-20">
            {product.trustScore && (
              <div className="flex items-center space-x-1 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm" title="Verified Authentic & Trusted Seller">
                <ShieldCheck className="w-3 h-3" />
                <span>{product.trustScore} Trust</span>
              </div>
            )}
            <div className="flex space-x-1">
              {product.sustainabilityGrade && (
                <div className={`flex items-center space-x-1 ${product.sustainabilityGrade === 'A' || product.sustainabilityGrade === 'B' ? 'bg-emerald-500/90' : 'bg-gray-500/90'} backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm`} title="Sustainability Grade">
                  <Leaf className="w-3 h-3" />
                  <span>{product.sustainabilityGrade}</span>
                </div>
              )}
              {product.repairabilityScore && (
                <div className="flex items-center space-x-1 bg-blue-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm" title="Repairability Score (out of 10)">
                  <Wrench className="w-3 h-3" />
                  <span>{product.repairabilityScore}/10</span>
                </div>
              )}
            </div>
          </div>

          {/* Compare Button */}
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare(product);
              }}
              className="absolute top-16 right-4 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-sm z-20"
              aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
              title="Compare Product"
            >
              <Scale className={`w-4 h-4 transition-colors ${isCompared ? 'text-blue-500' : ''}`} />
            </button>
          )}

          {/* Wishlist Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-sm z-20"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </motion.button>

          {/* Quick Actions on Hover (Desktop) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-2.5 px-3 rounded-full font-medium text-xs sm:text-sm shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Quick View</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 px-3 rounded-full font-medium text-xs sm:text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {product.brand} • {product.category}
            </p>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                if (onProductClick) onProductClick(product);
              }}>
                <span aria-hidden="true" className="absolute inset-0 z-0" />
                {product.name}
              </a>
            </h3>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white ml-2">${product.price.toFixed(2)}</p>
        </div>
        
        <div 
          className="flex items-center mt-1 mb-3 cursor-pointer hover:opacity-80 transition-opacity z-20 relative"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onOpenReviews) onOpenReviews();
          }}
        >
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-3 h-3 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">{averageRating.toFixed(1)} ({reviews.length})</span>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mt-auto">
          {product.description}
        </p>

        {product.priceHistory && (
          <div className="mt-3 relative z-20">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowChart(!showChart);
              }}
              className="text-xs flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {showChart ? 'Hide Price History' : 'View Price History'}
            </button>
            <AnimatePresence>
              {showChart && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <PriceChart data={product.priceHistory} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-3 relative z-20">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Size</label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`text-xs px-2 py-1 border rounded-md transition-colors ${
                    selectedSize === size
                      ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart({ ...product, selectedSize: product.sizes ? (selectedSize || product.sizes[0]) : undefined });
          }}
          className="mt-4 w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 px-4 rounded-md font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors relative z-20"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
    
    <QuickViewModal 
      product={product}
      isOpen={isQuickViewOpen}
      onClose={() => setIsQuickViewOpen(false)}
      onAddToCart={onAddToCart}
      reviews={reviews}
    />
    </>
  );
}
