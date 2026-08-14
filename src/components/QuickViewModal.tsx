import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Star, Mail, TrendingUp, TrendingDown, Minus, Loader2, UserCheck } from 'lucide-react';
import { Product, Review } from '../types';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useUser } from '../contexts/UserContext';
import { useCatalog } from "../contexts/CatalogContext";
import SafeProductImage from './SafeProductImage';
import PriceChart from './PriceChart';

interface QuickViewModalProps {
  cartItems?: any[];
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  reviews?: Review[];
  onNotifyMe?: (product: Product) => void;
}

export default function QuickViewModal({ cartItems = [], product, isOpen, onClose, onAddToCart, reviews = [], onNotifyMe }: QuickViewModalProps) {
  const { formatPrice } = useCurrency();

  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);
  const { userProfile } = useUser();
  const { products } = useCatalog();
  const [frequentlyBoughtIds, setFrequentlyBoughtIds] = useState<string[]>([]);
  const [isFreqBoughtLoading, setIsFreqBoughtLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && product) {
      const fetchFreqBought = async () => {
        setIsFreqBoughtLoading(true);
        try {
          const res = await fetch('/api/frequently-bought', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              productId: product.id, 
              cartIds: cartItems.map(c => c.id || c.productId)
            })
          });
          const data = await res.json();
          setFrequentlyBoughtIds(data.recommendedIds || []);
        } catch (error) {
          console.error("Failed to fetch freq bought", error);
        } finally {
          setIsFreqBoughtLoading(false);
        }
      };
      fetchFreqBought();
    } else {
      setFrequentlyBoughtIds([]);
    }
  }, [isOpen, product, cartItems]);
  
  const freqBoughtProducts = products.filter(p => frequentlyBoughtIds.includes(p.id) && p.id !== product.id);
  const [aiCompat, setAiCompat] = useState<any>(null);
  const [isCompatAnalyzing, setIsCompatAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && product && userProfile) {
      const fetchCompat = async () => {
        setIsCompatAnalyzing(true);
        try {
          const res = await fetch('/api/ai-compatibility-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, userProfile })
          });
          const data = await res.json();
          setAiCompat(data);
        } catch (error) {
          console.error("Failed to fetch compat", error);
        } finally {
          setIsCompatAnalyzing(false);
        }
      };
      fetchCompat();
    } else {
      setAiCompat(null);
    }
  }, [isOpen, product, userProfile]);
  const [aiPriceInsight, setAiPriceInsight] = useState<any>(null);
  const [isPriceAnalyzing, setIsPriceAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      const fetchPriceInsight = async () => {
        setIsPriceAnalyzing(true);
        try {
          const res = await fetch('/api/ai-price-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id })
          });
          const data = await res.json();
          setAiPriceInsight(data);
        } catch (error) {
          console.error("Failed to fetch price insight", error);
        } finally {
          setIsPriceAnalyzing(false);
        }
      };
      fetchPriceInsight();
    } else {
      setAiPriceInsight(null);
    }
  }, [isOpen, product]);

  useEffect(() => {
    setSelectedSize(product.sizes ? product.sizes[0] : undefined);
  }, [product, isOpen]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : product.rating;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-3xl bg-white dark:bg-[#121216] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-20 bg-white/50 dark:bg-[#121216]/50 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="md:w-1/2 bg-gray-100 dark:bg-white/10 relative">
              <SafeProductImage 
                src={product.image} 
                alt={product.name} 
                className="w-full h-64 md:h-full"
                imageClassName="w-full h-full object-cover"
              />
            </div>

            <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {product.brand} • {product.category}
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{product.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Model: {product.model} | {product.variant}{product.seller && ` | Sold by: ${product.seller}`}
              </p>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
              </div>
              
              <p className="text-2xl font-medium text-gray-900 dark:text-white mb-6">{formatPrice(product.price)}</p>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {product.description}
              </p>

              {product.priceHistory && product.priceHistory.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5 text-blue-500" />
                    Historical Price Trends
                  </h4>
                  <PriceChart data={product.priceHistory} />
                </div>
              )}

              {product.inventory !== undefined && product.inventory > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <p className={`text-sm font-bold ${product.inventory <= 5 ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-green-600 dark:text-green-400'}`}>
                      {product.inventory <= 5 ? `Hurry! Only ${product.inventory} left in stock` : `${product.inventory} in stock`}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${product.inventory <= 5 ? 'bg-amber-500' : 'bg-green-500'}`} 
                      style={{ width: `${Math.min(100, (product.inventory / 20) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {product.aiSummary && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-1.5 text-blue-500 fill-blue-500" />
                    AI Review Summary
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {product.aiSummary}
                  </p>
                </div>
              )}

              
              
              {isFreqBoughtLoading ? (
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Frequently Bought Together</h4>
                  <div className="flex justify-center items-center py-4 text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2 text-sm font-medium">Finding perfect matches...</span>
                  </div>
                </div>
              ) : freqBoughtProducts.length > 0 && (

                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    Frequently Bought Together
                  </h4>
                  <div className="space-y-4">
                    {freqBoughtProducts.map(fbProduct => (
                      <div key={fbProduct.id} className="flex items-center space-x-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                        <SafeProductImage
                          src={fbProduct.image}
                          alt={fbProduct.name}
                          className="w-16 h-16 rounded-lg bg-white dark:bg-[#121216]"
                          imageClassName="w-full h-full object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{fbProduct.name}</h5>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatPrice(fbProduct.price)}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart({ ...fbProduct, selectedSize: fbProduct.sizes ? fbProduct.sizes[0] : undefined });
                          }}
                          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">Select Size</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-sm px-4 py-2 border rounded-md transition-colors ${
                          selectedSize === size
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white font-medium'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 dark:bg-white/10 dark:text-gray-300 dark:border-white/10 dark:hover:border-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {(product.fitDetails || product.sizeGuide) && (
                    <div className="bg-gray-50 dark:bg-white/10/50 p-4 rounded-lg space-y-3 border border-gray-100 dark:border-white/10/50 text-sm text-gray-600 dark:text-gray-400">
                      {product.fitDetails && (
                        <p><strong className="text-gray-900 dark:text-gray-200">Fit:</strong> {product.fitDetails}</p>
                      )}
                      {product.sizeGuide && (
                        <p><strong className="text-gray-900 dark:text-gray-200">Guide:</strong> {product.sizeGuide}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  if (product.inStock === false) {
                    if (onNotifyMe) onNotifyMe(product);
                    onClose();
                  } else {
                    onAddToCart({ ...product, selectedSize: product.sizes ? (selectedSize || product.sizes[0]) : undefined });
                    onClose();
                  }
                }}
                className={`w-full mt-auto flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                  product.inStock === false 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                }`}
              >
                {product.inStock === false ? (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Notify Me</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
