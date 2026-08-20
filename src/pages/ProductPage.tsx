import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { Product, Review } from '../types';
import SafeProductImage from '../components/SafeProductImage';
import { useCurrency } from '../contexts/CurrencyContext';
import { Star, ShoppingBag, ArrowLeft, Zap, X, Ruler, AlertTriangle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { TrendingUp, Activity, UserCheck, CheckCircle2 } from 'lucide-react';
import PriceChart from '../components/PriceChart';
import { motion, AnimatePresence } from 'motion/react';
import InteractiveSizeGuide from '../components/InteractiveSizeGuide';

interface ProductPageProps {
  cartItems: any[];
  onAddToCart: (p: Product) => void;
  reviews: Record<string, Review[]>;
  onNotifyMe: (p: Product) => void;
  onPlaceOrder?: (order: any) => void;
  onAddToast?: (toast: any) => void;
}

export default function ProductPage({ cartItems, onAddToCart, reviews, onNotifyMe, onPlaceOrder, onAddToast }: ProductPageProps) {
  const { productId } = useParams();
  const { products, isLoading } = useCatalog();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeRec, setSizeRec] = useState<{recommendedSize?: string, reason?: string} | null>(null);
  const [isSizeRecLoading, setIsSizeRecLoading] = useState(false);
  const { userProfile, setUserProfile, orders } = useUser();

  useEffect(() => {
    if (!isLoading) {
      const p = products.find(p => p.id === productId);
      if (p) {
        setProduct(p);
        setSelectedSize(prev => prev || (p.sizes?.length ? p.sizes[0] : undefined));
      } else {
        setProduct(null);
      }
    }
  }, [productId, products, isLoading]);

  const handleOpenSizeGuide = async () => {
    setIsSizeGuideOpen(true);
    if (!sizeRec && product && userProfile && userProfile.bodyMeasurements) {
      setIsSizeRecLoading(true);
      try {
        const res = await fetch('/api/ai-size-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, userProfile, orders })
        });
        const data = await res.json();
        setSizeRec(data);
        if (data.recommendedSize && product.sizes?.includes(data.recommendedSize)) {
          setSelectedSize(data.recommendedSize);
        }
      } catch (err) {
        console.error('Size rec failed', err);
      } finally {
        setIsSizeRecLoading(false);
      }
    }
  };


  const [frequentlyBoughtIds, setFrequentlyBoughtIds] = useState<string[]>([]);
  const [aiCompat, setAiCompat] = useState<any>(null);
  const [aiPriceInsight, setAiPriceInsight] = useState<any>(null);

  useEffect(() => {
    if (!product) return;
    
    // Frequently Bought
    fetch('/api/frequently-bought', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, cartIds: cartItems.map(i => i.id) })
    }).then(r => r.json()).then(data => setFrequentlyBoughtIds(data.recommendedIds || [])).catch(console.error);

    // AI Compat
    if (userProfile) {
      fetch('/api/ai-compatibility-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, userProfile })
      }).then(r => r.json()).then(data => setAiCompat(data)).catch(console.error);
    }
    
    // Price Insight
    fetch('/api/ai-price-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id })
    }).then(r => r.json()).then(data => setAiPriceInsight(data)).catch(console.error);
    
  }, [product, userProfile, cartItems]);
  
  const freqBoughtProducts = products.filter(p => frequentlyBoughtIds.includes(p.id) && p.id !== product?.id);

  if (isLoading) return <div className="min-h-screen pt-32 flex justify-center text-gray-500">Loading catalog...</div>;
  if (!product) return (
    <div className="min-h-screen pt-32 flex flex-col items-center">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <button onClick={() => navigate('/')} className="mt-4 text-blue-500 hover:underline">Return to Home</button>
    </div>
  );

  const productReviews = reviews[product.id] || [];
  const averageRating = productReviews.length 
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
    : product.rating || 5;

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/')} className="mb-8 flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
        </button>
        <div className="bg-white dark:bg-[#121216] rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/5">
              <SafeProductImage src={product.image} alt={product.name} />
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">
                {product.brand} • {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-500 ml-3">{averageRating.toFixed(1)} ({productReviews.length} reviews)</span>
              </div>

              <div className="flex items-center mb-6">
                <p className="text-2xl text-gray-900 dark:text-white font-medium">{formatPrice(product.price)}</p>
                {product.inventory !== undefined && product.inventory > 0 && product.inventory <= 5 && (
                  <div className="ml-4 flex items-center space-x-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-bold px-3 py-1 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Low Stock: {product.inventory} left</span>
                  </div>
                )}
                {product.inStock === false && (
                  <div className="ml-4 flex items-center space-x-1 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold px-3 py-1 rounded-full border border-red-500/20">
                    <X className="w-4 h-4" />
                    <span>Out of Stock</span>
                  </div>
                )}
              </div>
              
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {product.description}
              </p>
              
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {aiCompat && (
                  <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20 p-4 rounded-xl">
                    <div className="flex items-center text-purple-600 dark:text-purple-400 font-bold text-sm mb-2">
                      <UserCheck className="w-4 h-4 mr-2" /> AI Compatibility: {aiCompat.score}%
                    </div>
                    <p className="text-xs text-purple-800 dark:text-purple-300">{aiCompat.reason}</p>
                  </div>
                )}
                {aiPriceInsight && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl">
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm mb-2">
                      <TrendingUp className="w-4 h-4 mr-2" /> AI Price Intel: {aiPriceInsight.advice}
                    </div>
                    <p className="text-xs text-blue-800 dark:text-blue-300">{aiPriceInsight.analysis}</p>
                  </div>
                )}
              </div>
              
              {product.priceHistory && (
                 <div className="mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                   <div className="flex items-center text-sm font-bold text-gray-900 dark:text-white mb-4">
                     <Activity className="w-4 h-4 mr-2" /> Price History
                   </div>
                   <PriceChart data={product.priceHistory} />
                 </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest block">Available Configurations</label>
                    <button onClick={handleOpenSizeGuide} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                      <Ruler className="w-4 h-4 mr-1" />
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-sm px-4 py-2 rounded-xl font-bold transition-all ${
                          selectedSize === size
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 border border-transparent dark:border-white/10 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto space-y-3">
                <button
                  onClick={() => {
                    if (product.inStock === false) {
                      onNotifyMe(product);
                    } else {
                      onAddToCart({ ...product, selectedSize });
                    }
                  }}
                  className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-bold text-base transition-all ${
                    product.inStock === false
                      ? 'bg-gray-800 text-white hover:bg-gray-900'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{product.inStock === false ? 'Notify Me' : 'Add to Cart'}</span>
                </button>

                {userProfile?.savedAddresses && userProfile.savedAddresses.length > 0 && product.inStock !== false && onPlaceOrder && (
                  <button
                    onClick={() => {
                      const defaultAddress = userProfile.savedAddresses?.find(a => a.isDefault) || userProfile.savedAddresses![0];
                      const order = {
                        id: Math.random().toString(36).substr(2, 9),
                        date: new Date().toISOString(),
                        items: [{ ...product, selectedSize, quantity: 1 }],
                        total: product.price,
                        status: 'processing',
                        address: defaultAddress,
                        paymentMethod: 'credit-card',
                      };
                      onPlaceOrder(order);
                      if (onAddToast) {
                        onAddToast({
                          title: 'Order Placed!',
                          message: `Successfully purchased ${product.name} with Express Checkout.`,
                          type: 'success'
                        });
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-bold text-base transition-all bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Express Checkout</span>
                  </button>
                )}
              </div>
            </div>
          
          </div>{freqBoughtProducts.length > 0 && (
            <div className="mt-16 border-t border-gray-100 dark:border-white/5 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Bought Together</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {freqBoughtProducts.map(fp => (
                  <div key={fp.id} className="bg-white dark:bg-[#121216] border border-gray-100 dark:border-white/5 p-4 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/product/${fp.id}`)}>
                    <SafeProductImage src={fp.image} alt={fp.name} className="w-full aspect-square bg-gray-50 dark:bg-white/5 rounded-xl mb-4" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{fp.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatPrice(fp.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <InteractiveSizeGuide
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        product={product}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        onSelectSize={(size) => setSelectedSize(size)}
      />
    </div>
  );
}
