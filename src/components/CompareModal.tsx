import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';
import { X, Scale, Star, ShoppingBag, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Product, Review } from '../types';
import SafeProductImage from './SafeProductImage';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  reviews: Record<string, Review[]>;
}

export default function CompareModal({ isOpen, onClose, products, onRemoveProduct, onAddToCart, reviews }: CompareModalProps) {
  const { formatPrice } = useCurrency();

  const [aiComparison, setAiComparison] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (products.length > 1) {
      const fetchComparison = async () => {
        setIsComparing(true);
        try {
          const res = await fetch('/api/ai-compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: products.map(p => p.id) })
          });
          const data = await res.json();
          setAiComparison(data);
        } catch (error) {
          console.error('Failed to get AI comparison:', error);
        } finally {
          setIsComparing(false);
        }
      };
      fetchComparison();
    } else {
      setAiComparison(null);
    }
  }, [products]);


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
          className="relative w-full max-w-5xl bg-white dark:bg-[#121216] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
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
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 dark:bg-white/10 -translate-x-1/2" />
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
                        className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-[#121216]/80 backdrop-blur-md text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10 shadow-sm"
                        aria-label="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="aspect-[4/3] bg-gray-100 dark:bg-white/10 rounded-xl overflow-hidden mb-4 relative">
                        <SafeProductImage 
                          src={product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=500'} 
                          alt={product.name} 
                          className="w-full h-full"
                          imageClassName="w-full h-full object-cover"
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
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{formatPrice(product.price)}</p>
                      
                      <div className="flex-grow">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 border-b border-gray-100 dark:border-white/5 pb-2">Description</h4>
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
                  <div className="hidden md:flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl bg-gray-50 dark:bg-[#121216]/50">
                    <Scale className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Select another product to compare.</p>
                  </div>
                )}
              </div>
            )}
            
            {products.length > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                  <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-blue-500 fill-blue-500" />
                    AI Comparison Analysis
                  </h4>
                  {isComparing ? (
                    <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <p>LUMINA is analyzing these products...</p>
                    </div>
                  ) : aiComparison ? (
                    <div className="space-y-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Best Overall:</strong> {products.find(p => p.id === aiComparison.bestOverallId)?.name || 'Tie'}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {aiComparison.verdict}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {aiComparison.comparisons?.map((comp: any) => {
                          const p = products.find(p => p.id === comp.productId);
                          if (!p) return null;
                          return (
                            <div key={comp.productId} className="bg-white/50 dark:bg-[#121216]/50 rounded-xl p-4">
                              <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-3">{p.name}</h5>
                              <div className="space-y-3">
                                <div>
                                  <h6 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Pros
                                  </h6>
                                  <ul className="space-y-1">
                                    {comp.pros?.map((pro: string, idx: number) => (
                                      <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                                        <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h6 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" /> Cons
                                  </h6>
                                  <ul className="space-y-1">
                                    {comp.cons?.map((con: string, idx: number) => (
                                      <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                                        <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                        {con}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
