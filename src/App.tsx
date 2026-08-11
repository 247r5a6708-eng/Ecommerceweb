import React from "react";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AIChatBot from './components/AIChatBot';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Recommendations from './components/Recommendations';
import CategoryFilter from './components/CategoryFilter';
import Cart from './components/Cart';
import UserProfile from './components/UserProfile';
import Wishlist from './components/Wishlist';
import BackToTop from './components/BackToTop';
import ReviewModal from './components/ReviewModal';
import ToastContainer from './components/ToastContainer';
import AuthModal from './components/AuthModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import PromotionalBanner from './components/PromotionalBanner';
import CompareModal from "./components/CompareModal";
import NotifyMeModal from "./components/NotifyMeModal";
import RecentlyViewed from './components/RecentlyViewed';
import { Mail, Scale, X } from 'lucide-react';
import { Product, CartItem, Order, Review, ToastType } from './types';
import { useCatalog } from './contexts/CatalogContext';
import { useUser } from './contexts/UserContext';
import { categories, productTypes } from './data';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as firestoreService from './lib/firestore';

export default function App() {
  const { products, isLoading } = useCatalog();
  const { wishlistItems, setWishlistItems, orders, setOrders, walletItems, setWalletItems, userProfile, setUserProfile, reviews, setReviews } = useUser();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState<Product | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setAiMatchedIds(null);
      return;
    }

    const performAISearch = async () => {
      setIsAiSearching(true);
      try {
        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        const data = await res.json();
        setAiMatchedIds(data.matchedIds || []);
      } catch (err) {
        console.error('AI Search failed', err);
        setAiMatchedIds(null);
      } finally {
        setIsAiSearching(false);
      }
    };

    // Debounce or just fire if they hit enter in Hero (which sets searchQuery once)
    performAISearch();
  }, [searchQuery]);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  const [toasts, setToasts] = useState<ToastType[]>([]);
  
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    const saved = localStorage.getItem('recentlyViewed');
    return saved ? JSON.parse(saved) : [];
  });

  const handleProductClick = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 5);
    });
  };

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const handleToggleCompare = (product: Product) => {
    const isAlreadyCompared = compareProducts.some(p => p.id === product.id);
    if (isAlreadyCompared) {
      setCompareProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      if (compareProducts.length >= 2) {
        addToast({ title: 'Comparison Full', message: 'You can only compare up to 2 products at a time.', type: 'info' });
        return;
      }
      const newCompare = [...compareProducts, product];
      setCompareProducts(newCompare);
      if (newCompare.length === 2) {
        setIsCompareModalOpen(true);
      }
    }
  };

  const addToast = (toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });







  const [isProductsLoading, setIsProductsLoading] = useState(true);
  
  const [reviewModalProduct, setReviewModalProduct] = useState<Product | null>(null);

  const handleAddReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setReviews(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), newReview],
    }));
    if (firebaseUser) {
      firestoreService.saveReview(productId, { ...newReview, userId: firebaseUser.uid });
    }
  };

  useEffect(() => {
    setIsProductsLoading(true);
    const timer = setTimeout(() => {
      setIsProductsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, activeType, sortOption]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);





  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Fetch data from Firestore
        const profile = await firestoreService.getUserProfile(user.uid);
        if (profile) {
          setUserProfile(prev => ({
            ...prev,
            ...profile,
            name: user.displayName || profile.name || prev.name,
            email: user.email || profile.email || prev.email,
          }));
        } else {
          setUserProfile(prev => ({
            ...prev,
            name: user.displayName || prev.name,
            email: user.email || prev.email,
          }));
        }

        const fbOrders = await firestoreService.getUserOrders(user.uid);
        if (fbOrders.length > 0) setOrders(fbOrders);

        const fbWishlist = await firestoreService.getUserWishlist(user.uid);
        if (fbWishlist.length > 0) setWishlistItems(fbWishlist);

        const fbWallet = await firestoreService.getUserWallet(user.uid);
        if (fbWallet.length > 0) setWalletItems(fbWallet);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = (newProfile: typeof userProfile) => {
    setUserProfile(newProfile);
    addToast({
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.',
      type: 'success'
    });
  };

  const handleNotifyMeSubmit = (email: string) => {
    addToast({
      title: 'Subscribed',
      message: `You will be notified at ${email} when ${notifyProduct?.name} is back in stock.`,
      type: 'success'
    });
    setNotifyProduct(null);
  };

  const handleToggleWishlist = (productId: string) => {
    const isAdding = !wishlistItems.includes(productId);
    const product = products.find(p => p.id === productId);
    
    if (product) {
      addToast({
        title: isAdding ? 'Added to Wishlist' : 'Removed from Wishlist',
        message: `${product.name} has been ${isAdding ? 'added to' : 'removed from'} your wishlist.`,
        type: isAdding ? 'success' : 'info'
      });
    }
    
    if (isAdding) {
      setIsWishlistOpen(true);
    }
    
    setWishlistItems(prev => 
      isAdding ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleClearWishlist = () => {
    setWishlistItems([]);
  };

  const handleAddToCart = (product: Product & { selectedSize?: string }) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id && item.selectedSize === product.selectedSize);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number, selectedSize?: string) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.selectedSize === selectedSize ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string, selectedSize?: string) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
  };

  const handlePlaceOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    if (firebaseUser) {
       firestoreService.saveOrder(firebaseUser.uid, order);
    }
    
    // Add to digital wallet
    const newWalletItems = order.items.map(item => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + (item.warrantyInfo?.includes('2 Years') ? 2 : 1));
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        product: item,
        purchaseDate: order.date,
        warrantyStatus: 'Active' as const,
        warrantyExpiry: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'In Use' as const
      };
    });
    
    setWalletItems(prev => [...newWalletItems, ...prev]);
    if (firebaseUser) {
      newWalletItems.forEach(wi => firestoreService.saveWalletProduct(firebaseUser.uid, wi));
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'cancelled' }
        : order
    ));
    if (firebaseUser) {
      firestoreService.updateOrderState(firebaseUser.uid, orderId, 'cancelled');
    }
    addToast({
      title: 'Order Cancelled',
      message: `Order #${orderId} has been successfully cancelled.`,
      type: 'info'
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      addToast({
        title: 'Subscribed Successfully!',
        message: 'Thank you for subscribing to our newsletter.',
        type: 'success'
      });
      setNewsletterEmail('');
    }
  };

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const availableTypes: string[] = ['All', ...Array.from(new Set(products.filter(p => activeCategory === 'All' || p.category === activeCategory).map(p => p.type))) as string[]];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030305] font-sans text-gray-900 dark:text-gray-100 selection:bg-blue-500/30 transition-colors duration-500 relative">
      <div className="fixed inset-0 bg-noise pointer-events-none z-50" />
      <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-50 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      <PromotionalBanner />
      <Navbar 
        cartItemCount={cartItemCount} 
        onOpenCart={() => setIsCartOpen(true)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        wishlistItemCount={wishlistItems.length}
        onOpenProfile={() => firebaseUser ? setIsProfileOpen(true) : setIsAuthOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setActiveType('All');
        }}
        onAddToast={addToast}
      />
      
      
      
      <Hero onSearch={setSearchQuery} />
      
      <CategoryFilter 
        activeType={activeType}
        availableTypes={availableTypes} 
        onTypeChange={setActiveType} 
        sortOption={sortOption}
        onSortChange={setSortOption}
      />
      
      <ProductGrid 
        aiMatchedIds={aiMatchedIds}
        isAiSearching={isAiSearching}
        onAddToCart={handleAddToCart} 
        searchQuery={searchQuery} 
        activeCategory={activeCategory}
        activeType={activeType} 
        sortOption={sortOption}
        wishlistItems={wishlistItems}
        onToggleWishlist={handleToggleWishlist}
        isLoading={isProductsLoading}
        reviews={reviews}
        onOpenReviews={setReviewModalProduct}
        compareProducts={compareProducts}
        onToggleCompare={handleToggleCompare}
        onProductClick={handleProductClick}
        onNotifyMe={setNotifyProduct}
      />
      
      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onPlaceOrder={handlePlaceOrder}
        onAddToast={addToast}
      />
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <UserProfile 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        orders={orders}
        onCancelOrder={handleCancelOrder}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        walletItems={walletItems}
        onLogout={() => {
          signOut(auth);
          setFirebaseUser(null);
          addToast({
            title: 'Signed Out',
            message: 'You have been successfully signed out.',
            type: 'info'
          });
        }}
      />
      
      <Wishlist
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems.map(id => products.find(p => p.id === id)!).filter(Boolean)}
        onRemoveItem={handleToggleWishlist}
        onClearWishlist={handleClearWishlist}
        onAddToCart={handleAddToCart}
      />

      <ReviewModal
        isOpen={!!reviewModalProduct}
        onClose={() => setReviewModalProduct(null)}
        product={reviewModalProduct}
        reviews={reviewModalProduct ? (reviews[reviewModalProduct.id] || []) : []}
        onAddReview={handleAddReview}
      />
      
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setFirebaseUser(user);
          addToast({
            title: 'Welcome!',
            message: 'You have successfully signed in.',
            type: 'success'
          });
        }}
      />
      
      <BackToTop />
      
      <RecentlyViewed
        products={recentlyViewed}
        onAddToCart={handleAddToCart}
        wishlistItems={wishlistItems}
        onToggleWishlist={handleToggleWishlist}
        onOpenReviews={setReviewModalProduct}
        compareProducts={compareProducts}
        onToggleCompare={handleToggleCompare}
        onProductClick={handleProductClick}
      />

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-[#121216] border-t border-gray-100 dark:border-white/5 pt-16 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-200 dark:border-white/10 pb-12">
            <div className="text-center md:text-left">
              <span className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">
                LUMIN<span className="text-gray-400">A</span>
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
                Elevating everyday essentials with mindful design and uncompromising quality.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contact Us</h4>
              <a 
                href="mailto:sontrachithkumar@gmail.com"
                className="inline-flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>sontrachithkumar@gmail.com</span>
              </a>
            </div>

            <div className="md:col-span-2 text-center md:text-left">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Subscribe to our newsletter</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Get the latest updates on new products and upcoming sales.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500 dark:text-gray-400">
            <div>&copy; {new Date().getFullYear()} Lumina Store. All rights reserved.</div>
            <button 
              onClick={() => setIsPrivacyPolicyOpen(true)}
              className="hover:text-gray-900 dark:hover:text-white transition-colors hover:underline"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
      
      <PrivacyPolicyModal 
        isOpen={isPrivacyPolicyOpen} 
        onClose={() => setIsPrivacyPolicyOpen(false)} 
      />
      
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={compareProducts}
        onRemoveProduct={(id) => setCompareProducts(prev => prev.filter(p => p.id !== id))}
        onAddToCart={handleAddToCart}
        reviews={reviews}
      />
      
      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        product={notifyProduct}
        onSubmit={handleNotifyMeSubmit}
      />
      
      {/* Floating Compare Banner */}
      {compareProducts.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 shadow-2xl rounded-full py-3 px-5 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {compareProducts.length} product{compareProducts.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Compare
          </button>
          <button
            onClick={() => setCompareProducts([])}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Clear comparison"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
