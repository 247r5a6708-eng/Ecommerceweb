import { generateInvoicePDF } from './utils/pdfGenerator';
import React from "react";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import ProductPage from './pages/ProductPage';
import ReturnsPage from './pages/ReturnsPage';
import NotifyMeModal from "./components/NotifyMeModal";
import SharedWishlistModal from './components/SharedWishlistModal';
import RecentlyViewed from './components/RecentlyViewed';
import { Mail, Scale, X } from 'lucide-react';
import { Product, CartItem, Order, Review, ToastType } from './types';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useCatalog } from './contexts/CatalogContext';
import { useUser } from './contexts/UserContext';
import { useCart } from './hooks/useCart';
import { useSearch } from './hooks/useSearch';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as firestoreService from './lib/firestore';

export default function App() {
  const { products, isLoading, categories, productTypes } = useCatalog();

  const { wishlistItems, setWishlistItems, orders, setOrders, walletItems, setWalletItems, userProfile, setUserProfile, priceAlerts } = useUser();
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});

  const hasWishlistAlerts = React.useMemo(() => {
    return wishlistItems.some(id => {
      const p = products.find(prod => prod.id === id);
      if (!p) return false;
      
      const historyLength = p.priceHistory?.length || 0;
      if (historyLength > 1) {
        const latest = p.priceHistory[historyLength - 1].price;
        const previous = p.priceHistory[historyLength - 2].price;
        if (latest < previous) return true; // Price dropped!
      }
      return false;
    });
  }, [wishlistItems, products]);

  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    isCartLoading,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart
  } = useCart(firebaseUser);

  
  
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [alertsSent, setAlertsSent] = useState<Set<string>>(new Set());
  const [notifyProduct, setNotifyProduct] = useState<Product | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
    
  const { searchQuery, setSearchQuery, aiMatchedIds, setAiMatchedIds, isAiSearching } = useSearch();

  const [sharedWishlistUserId, setSharedWishlistUserId] = useState<string | null>(null);
  const [sharedWishlistItems, setSharedWishlistItems] = useState<string[]>([]);
  const [isSharedWishlistLoading, setIsSharedWishlistLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedUserId = params.get('sharedWishlist');
      if (sharedUserId) {
        setSharedWishlistUserId(sharedUserId);
        setIsSharedWishlistLoading(true);
        firestoreService.getUserWishlist(sharedUserId).then(items => {
          setSharedWishlistItems(items);
          setIsSharedWishlistLoading(false);
        });
      }
    }
  }, []);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  const [toasts, setToasts] = useState<ToastType[]>([]);
  
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const { recentlyViewed, addRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  const handleProductClick = (product: Product) => {
    addRecentlyViewed(product);
  };

  

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
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };
  
  useEffect(() => {
    if (!products.length) return;
    const newAlertsSent = new Set(alertsSent);
    let didSend = false;

    products.forEach(p => {
      const targetPrice = priceAlerts[p.id];
      if (targetPrice && p.price <= targetPrice && !newAlertsSent.has(p.id)) {
        addToast({
          title: 'Price Alert Triggered! 📧',
          message: `Email sent to ${userProfile.email || 'you'}: ${p.name} is now below your threshold (${p.price.toFixed(2)})!`,
          type: 'success'
        });
        newAlertsSent.add(p.id);
        didSend = true;
      }
    });

    if (didSend) {
      setAlertsSent(newAlertsSent);
    }
  }, [products, priceAlerts, userProfile.email]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });







  const [isProductsLoading, setIsProductsLoading] = useState(true);
  
  const [reviewModalProduct, setReviewModalProduct] = useState<Product | null>(null);


  useEffect(() => {
    firestoreService.getAllReviews().then(data => {
      if (data) {
        setReviews(data);
      }
    });
  }, []);

  const handleAddReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: crypto.randomUUID(),
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


      } else {
      }
    });
    return () => unsubscribe();
  }, []);




  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Check shortcuts
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('desktop-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCartOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setIsWishlistOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handlePlaceOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    
    // Trigger confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 7000);

    if (firebaseUser) {
       firestoreService.saveOrder(firebaseUser.uid, order);
    }
    
    // Add to digital wallet
    
    // Send email with PDF attachment
    const customerEmail = order.address?.email || userProfile?.email;
    if (customerEmail) {
      try {
        const tempProfile = userProfile || { name: order.address?.fullName || 'Customer', email: customerEmail, phone: order.address?.phone || '', address: '', avatar: '' };
        const doc = generateInvoicePDF(order, tempProfile);
        const pdfBase64 = doc.output('datauristring');
        
        fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customerEmail,
            name: order.address?.fullName || userProfile?.name || 'Customer',
            order: order,
            pdfBase64: pdfBase64
          })
        }).catch(err => console.error("Email send err:", err));
      } catch (err) {
        console.error("PDF generation err:", err);
      }
    }

    const newWalletItems = order.items.map(item => {
      const d = new Date(order.date);
      let months = 12;
      if (item.structuredWarranty) {
        months = item.structuredWarranty.durationMonths;
      } else if (item.warrantyInfo?.includes('2 Years')) {
        months = 24;
      }
      d.setMonth(d.getMonth() + months);
      
      return {
        id: crypto.randomUUID(),
        product: item,
        purchaseDate: order.date,
        warrantyStatus: 'Active' as const,
        warrantyExpiry: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'In Use' as const,
        serialNumber: 'Serial number pending'
      };
    });
    
    setWalletItems(prev => [...newWalletItems, ...prev]);
    if (firebaseUser) {
      newWalletItems.forEach(wi => firestoreService.saveWalletProduct(firebaseUser.uid, wi));
    }
  };

  const handleCancelOrder = (orderId: string, reason?: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
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

    if (orderToCancel) {
      const customerEmail = orderToCancel.address?.email || userProfile?.email;
      if (customerEmail) {
        fetch('/api/send-cancel-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customerEmail,
            name: orderToCancel.address?.fullName || userProfile?.name || 'Customer',
            order: orderToCancel,
            reason: reason || 'No reason provided'
          })
        }).catch(err => console.error("Cancel email send err:", err));
      }
    }
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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] font-sans text-[#111] dark:text-[#FAFAFA] selection:bg-gray-300 dark:selection:bg-white/20 transition-colors duration-500 relative">
      
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.15}
          />
        </div>
      )}

      <PromotionalBanner />
      <Navbar 
        cartItemCount={cartItemCount} 
        onOpenCart={() => setIsCartOpen(true)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        wishlistItemCount={wishlistItems.length}
        hasWishlistAlerts={hasWishlistAlerts}
        onOpenProfile={() => firebaseUser ? setIsProfileOpen(true) : setIsAuthOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setActiveType('All');
          setSearchQuery('');
          setAiMatchedIds(null);
        }}
        onAddToast={addToast}
      />
      
      
      
      
      
      <Routes>
        <Route path="/" element={
          <>
            <Hero onSearch={setSearchQuery} />
            <div className="relative z-20 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
            <CategoryFilter 
              activeType={activeType}
              availableTypes={productTypes} 
              onTypeChange={(type) => {
                if (type === 'All') setActiveCategory('All');
                setActiveType(type);
                setSearchQuery('');
                setAiMatchedIds(null);
              }} 
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
            
            <ProductGrid cartItems={cartItems} 
              aiMatchedIds={aiMatchedIds}
              isAiSearching={isAiSearching}
              onAddToCart={handleAddToCart} 
              searchQuery={searchQuery} 
              activeCategory={activeCategory}
              activeType={activeType} 
              sortOption={sortOption}
              wishlistItems={wishlistItems}
              onToggleWishlist={handleToggleWishlist}
              isLoading={isLoading}
              reviews={reviews}
              onOpenReviews={setReviewModalProduct}
              compareProducts={compareProducts}
              onToggleCompare={handleToggleCompare}
              onProductClick={handleProductClick}
              onNotifyMe={setNotifyProduct}
              onClearSearch={() => {
                setSearchQuery('');
                setAiMatchedIds(null);
              }}
            />
            </div>
          </>
        } />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/product/:productId" element={<ProductPage cartItems={cartItems} onAddToCart={handleAddToCart} reviews={reviews} onNotifyMe={setNotifyProduct} />} />
      </Routes>


      <PromotionalBanner />
      <Navbar 
        cartItemCount={cartItemCount} 
        onOpenCart={() => setIsCartOpen(true)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        wishlistItemCount={wishlistItems.length}
        hasWishlistAlerts={hasWishlistAlerts}
        onOpenProfile={() => firebaseUser ? setIsProfileOpen(true) : setIsAuthOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setActiveType('All');
          setSearchQuery('');
          setAiMatchedIds(null);
        }}
        onAddToast={addToast}
      />
      
      
      
      <Hero onSearch={setSearchQuery} />
      
      <div className="relative z-20 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <CategoryFilter 
        activeType={activeType}
        availableTypes={availableTypes} 
        onTypeChange={(type) => {
          if (type === 'All') {
            setActiveCategory('All');
          }
          setActiveType(type);
          setSearchQuery('');
          setAiMatchedIds(null);
        }} 
        sortOption={sortOption}
        onSortChange={setSortOption}
      />
      
      <ProductGrid cartItems={cartItems} 
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
        onClearSearch={() => {
          setSearchQuery('');
          setAiMatchedIds(null);
        }}
      />
      </div>
      
      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        isLoading={isCartLoading}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        onAddToast={addToast}
      />
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <SharedWishlistModal
        isOpen={!!sharedWishlistUserId}
        onClose={() => {
          setSharedWishlistUserId(null);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('sharedWishlist');
            window.history.replaceState({}, '', url.toString());
          }
        }}
        productIds={sharedWishlistItems}
        products={products}
        isLoading={isSharedWishlistLoading}
        onAddToCart={handleAddToCart}
      />

      
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
        onAddToast={addToast}
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
        onClear={() => {
          clearRecentlyViewed();
        }}
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
