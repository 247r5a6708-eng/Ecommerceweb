import React, { useState, useRef } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Product, Review } from '../types';
import { Leaf, Wrench, Scale, Heart, Eye, Mail, ShoppingBag, Star, Share2, MessageCircle, Check, Copy, TrendingUp, TrendingDown, AlertTriangle, Plus } from "lucide-react";
import PriceChart from './PriceChart';
import QuickViewModal from './QuickViewModal';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';

import SafeProductImage from './SafeProductImage';

interface ProductCardProps {
  cartItems?: any[];
  product: Product;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  reviews?: Review[];
  onOpenReviews?: () => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  onNotifyMe?: (product: Product) => void;
}

export default function ProductCard({ cartItems = [], product, onAddToCart, isWishlisted, onToggleWishlist, reviews = [], onOpenReviews, isCompared = false, onToggleCompare, onProductClick, onNotifyMe }: ProductCardProps) {
  const { formatPrice } = useCurrency();

  const [showChart, setShowChart] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  const isPriceDrop = React.useMemo(() => {
    if (isWishlisted && product.priceHistory && product.priceHistory.length > 1) {
      const historyLength = product.priceHistory.length;
      const latest = product.priceHistory[historyLength - 1].price;
      const previous = product.priceHistory[historyLength - 2].price;
      return latest < previous;
    }
    return false;
  }, [isWishlisted, product.priceHistory]);

  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const glareOpacity = useTransform(mouseYSpring, [-0.5, 0.5], [0, 0.3]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : product.rating;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `Check out this ${product.name} for ${formatPrice(product.price)}!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.href)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
    setIsHoveringImage(true);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHoveringImage(false);
    setShowShareMenu(false);
  };

  return (
    <div style={{ perspective: '1200px' }} className="w-full flex">
      <motion.div 
        ref={cardRef}
        whileHover={{ scale: 1.02 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative flex flex-col rounded-3xl bg-white dark:bg-white/5 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 border border-gray-100 dark:border-white/10 transition-all duration-300 w-full z-10 hover:z-20"
      >
        <motion.div
          style={{ opacity: glareOpacity, top: glareY }}
          className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-50 transform -translate-y-1/2"
        />

        <div 
          className="aspect-[4/5] bg-gray-200 dark:bg-black overflow-hidden rounded-t-[calc(1.5rem-1px)] relative cursor-crosshair"
          style={{ transform: "translateZ(30px)" }}
        >
          {product.image ? (
            <SafeProductImage 
              src={product.image} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full"
              style={{
                transform: isHoveringImage ? 'scale(1.1)' : 'scale(1)'
              }}
              imageClassName="h-full w-full object-cover object-center transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-400">
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-4 left-4 flex flex-col space-y-2 z-20" style={{ transform: "translateZ(40px)" }}>
            <div className="flex space-x-1">
                            {isPriceDrop && (
                <div className="flex items-center space-x-1 bg-red-500/90 text-white backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-red-400" title="Price Dropped!">
                  <TrendingDown className="w-3 h-3" />
                  <span>Price Drop</span>
                </div>
              )}
              {product.sustainabilityGrade && (
                <div className={`flex items-center space-x-1 ${product.sustainabilityGrade === 'A' || product.sustainabilityGrade === 'B' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-black/30 dark:bg-white/10 text-white border-white/20 dark:border-white/20'} backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border`} title="Sustainability Grade">
                  <Leaf className="w-3 h-3" />
                  <span>{product.sustainabilityGrade}</span>
                </div>
              )}
              {product.repairabilityScore && (
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-white/20 dark:border-white/20" title="Repairability Score">
                  <Wrench className="w-3 h-3 text-blue-400" />
                  <span>{product.repairabilityScore}/10</span>
                </div>
              )}
              {product.inventory !== undefined && product.inventory > 0 && product.inventory < 5 && (
                <div className="flex items-center space-x-1 bg-amber-500/90 text-white backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-amber-400" title="Low Stock">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Low Stock: {product.inventory} left</span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20" style={{ transform: "translateZ(40px)" }}>
            {onToggleCompare && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCompare(product);
                }}
                className={`p-2 backdrop-blur-md rounded-full transition-all shadow-sm ${isCompared ? 'bg-blue-500 text-white border-none' : 'bg-black/30 dark:bg-white/10 text-white hover:bg-white/30 border border-white/20 dark:border-white/20'}`}
                aria-label={isCompared ? "Remove from compare" : "Add to compare"}
                title="Compare"
              >
                <Scale className="w-4 h-4" />
              </button>
            )}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className={`p-2 backdrop-blur-md rounded-full transition-all shadow-sm ${isWishlisted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-black/30 dark:bg-white/10 text-white hover:bg-white/30 border border-white/20 dark:border-white/20'}`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </motion.button>
          </div>

          {/* Quick Actions on Hover (Desktop) */}
          <div 
            className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4 z-20"
            style={{ transform: "translateZ(50px)" }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-black/60 backdrop-blur-md border border-white/20 text-white py-3 px-4 rounded-xl font-medium text-xs sm:text-sm shadow-sm hover:bg-black/80 transition-all"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Quick View</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.inStock === false) {
                  if (onNotifyMe) onNotifyMe(product);
                } else {
                  onAddToCart(product);
                }
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm shadow-sm transition-all ${
                product.inStock === false
                  ? 'bg-gray-800 hover:bg-gray-900 border border-transparent text-white'
                  : 'bg-white text-black hover:bg-gray-100 border border-transparent'
              }`}
            >
              {product.inStock === false ? (
                <>
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Notify</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 z-10" style={{ transform: "translateZ(20px)" }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-bold text-blue-400 dark:text-blue-400 uppercase tracking-[0.2em] mb-1.5">
                {product.brand} • {product.category}{product.seller && ` • ${product.seller}`}
              </p>
              <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug tracking-tight">
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  if (onProductClick) onProductClick(product);
                }}>
                  <span aria-hidden="true" className="absolute inset-0 z-0" />
                  {product.name}
                </a>
              </h3>
            </div>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white ml-3 tracking-tighter">{formatPrice(product.price)}</p>
          </div>
          
          <div className="flex items-center justify-between mt-1 mb-4 z-20 relative">
            <div 
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity bg-white/5 border border-white/5 rounded-full px-2 py-1"
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
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-wider">{averageRating.toFixed(1)} ({reviews.length})</span>
            </div>

            {/* Share Button & Menu */}
            <div 
              className="relative"
              onMouseLeave={() => setShowShareMenu(false)}
            >
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-blue-400 dark:text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="Share product"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-xl py-2 z-50 border border-gray-100 dark:border-gray-800"
                  >
                    <button
                      onClick={handleWhatsApp}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center font-medium"
                    >
                      <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                      WhatsApp
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center font-medium"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2 text-blue-400" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light line-clamp-2 mt-auto leading-relaxed">
            {product.description}
          </p>

          {product.priceHistory && (
            <div className="mt-4 relative z-20">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowChart(!showChart);
                }}
                className="text-xs flex items-center text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-bold uppercase tracking-wider"
              >
                <TrendingUp className="w-3 h-3 mr-1.5" />
                {showChart ? 'Hide Intel' : 'Market Intel'}
              </button>
              <AnimatePresence>
                {showChart && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2"
                  >
                    <PriceChart data={product.priceHistory} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-4 relative z-20">
              <label className="text-[10px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2 block">Available Configs</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      selectedSize === size
                        ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] border-transparent'
                        : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 border dark:border-white/10 dark:hover:border-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      <QuickViewModal cartItems={cartItems} 
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={onAddToCart}
        reviews={reviews}
        onNotifyMe={onNotifyMe}
      />
    </div>
  );
}
