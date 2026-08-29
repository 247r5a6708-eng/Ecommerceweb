import { Clock, ShoppingBag, User, Search, Menu, X, Heart, Settings, LogOut, Package, CreditCard, Scale, Sun, Moon, Mic, MicOff, Camera, Users } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency, Currency } from '../contexts/CurrencyContext';
import { useCatalog } from '../contexts/CatalogContext';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import SafeProductImage from './SafeProductImage';
import CameraSearchModal from './CameraSearchModal';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenProfile: () => void;
  onOpenWishlist: () => void;
  wishlistItemCount?: number;
  hasWishlistAlerts?: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  compareCount?: number;
  onOpenCompare?: () => void;
  onAddToast?: (toast: { title: string; message: string; type: 'success' | 'error' | 'info' }) => void;
}

export default function Navbar({ 
  cartItemCount, 
  onOpenCart, 
  searchQuery, 
  onSearchChange, 
  onOpenProfile, 
  onOpenWishlist,
  wishlistItemCount = 0,
  hasWishlistAlerts = false,
  isDarkMode,
  onToggleDarkMode,
  activeCategory,
  onCategoryChange,
  compareCount = 0,
  onOpenCompare,
  onAddToast
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [showDesktopSuggestions, setShowDesktopSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [isCameraSearchOpen, setIsCameraSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const desktopSuggestionsRef = useRef<HTMLDivElement>(null);
  const mobileSuggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopSuggestionsRef.current && !desktopSuggestionsRef.current.contains(event.target as Node)) {
        setShowDesktopSuggestions(false);
      }
      if (mobileSuggestionsRef.current && !mobileSuggestionsRef.current.contains(event.target as Node)) {
        setShowMobileSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowDesktopSuggestions(false);
    setShowMobileSuggestions(false);
    saveRecentSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveRecentSearch(searchQuery);
      setShowDesktopSuggestions(false);
      setShowMobileSuggestions(false);
    }
  };

  const recognitionRef = useRef<any>(null);
  const { currency, setCurrency } = useCurrency();
  const { userProfile } = useUser();
  const isAdmin = userProfile?.email === 'kumarrachith0@gmail.com' || userProfile?.isAdmin;
  const { products, categories } = useCatalog();
  const recommendedProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products
      .filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
      .slice(0, 5);
  }, [searchQuery, products]);


  useEffect(() => {
    // Initialize speech recognition if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSearchChange(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          if (onAddToast) {
            onAddToast({ title: 'Microphone Access Denied', message: 'Please allow microphone access to use voice search.', type: 'error' });
          } else {
            alert("Please allow microphone access to use voice search.");
          }
        } else if (event.error === 'network') {
          if (onAddToast) {
            onAddToast({ title: 'Speech Recognition Unavailable', message: 'Voice search is not supported by your browser (e.g., Brave) or requires an internet connection.', type: 'error' });
          } else {
            alert("Voice search is not supported by your browser or requires an internet connection.");
          }
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onSearchChange]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      onSearchChange(''); // Clear current search when starting new voice input
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-40 w-full transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/70 dark:bg-[#030305]/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
        : 'bg-transparent border-b border-transparent dark:border-transparent'
    }`}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => onCategoryChange('All')}>
            <div className="relative w-10 h-10 mr-3 flex items-center justify-center overflow-visible">
              <motion.svg 
                viewBox="0 0 100 100" 
                className="w-full h-full drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]"
              >
                <defs>
                  <linearGradient id="cyber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                {/* Outer wireframe */}
                <motion.path 
                  d="M50 5 L93 30 L93 70 L50 95 L7 70 L7 30 Z" 
                  fill="none" 
                  stroke="url(#cyber-gradient)" 
                  strokeWidth="2.5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "50px 50px" }}
                />
                {/* Inner glowing core */}
                <motion.path 
                  d="M50 20 L80 37 L80 63 L50 80 L20 63 L20 37 Z" 
                  fill="url(#cyber-gradient)"
                  opacity="0.15"
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "50px 50px" }}
                />
                {/* Hyper-cube connecting lines */}
                <motion.g stroke="url(#cyber-gradient)" strokeWidth="1.5" opacity="0.6">
                  <path d="M50 5 L50 20" />
                  <path d="M93 30 L80 37" />
                  <path d="M93 70 L80 63" />
                  <path d="M50 95 L50 80" />
                  <path d="M7 70 L20 63" />
                  <path d="M7 30 L20 37" />
                </motion.g>
                {/* Center diamond pulse */}
                <motion.polygon 
                  points="50,35 65,50 50,65 35,50" 
                  fill="#fff" 
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "50px 50px" }}
                />
              </motion.svg>
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full pointer-events-none group-hover:bg-cyan-500/30 transition-colors duration-500" />
            </div>
            <span className="text-3xl font-extrabold tracking-tighter text-gray-900 dark:text-white flex items-center">
              LUMINA
            </span>
          </div>

          {/* Desktop Navigation */}
          {(isAdmin || categories.length > 1) && (
            <div className="hidden md:flex space-x-1 items-center bg-white/50 dark:bg-white/5 p-1 rounded-full backdrop-blur-md border border-gray-200 dark:border-white/10">
              {!isAdmin && (
                <button
                  onClick={() => onCategoryChange('All')}
                  className={`font-bold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md text-sm tracking-wide ${
                    activeCategory === 'All' 
                       ? 'text-white bg-black dark:bg-white dark:text-black shadow-sm' 
                       : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  Home
                </button>
              )}
              {isAdmin && (
                <Link 
                  to="/admin"
                  className="font-bold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md text-sm tracking-wide bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm flex items-center"
                  aria-label="Admin Portal"
                >
                  <Shield className="w-4 h-4 mr-2" /> Admin
                </Link>
              )}
              {isAdmin && (
                <button
                  onClick={() => onCategoryChange('All')}
                  className={`font-bold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md text-sm tracking-wide ${
                    activeCategory === 'All' 
                       ? 'text-white bg-black dark:bg-white dark:text-black shadow-sm' 
                       : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  Home
                </button>
              )}
            {categories.slice(1).map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`font-bold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md text-sm tracking-wide ${
                  activeCategory === category 
                    ? 'text-white bg-black dark:bg-white dark:text-black shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
            </div>
          )}

          {/* Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="hidden lg:flex items-center relative group" ref={desktopSuggestionsRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="desktop-search-input"
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setShowDesktopSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="block w-64 pl-10 pr-10 py-2 bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:bg-white dark:focus:bg-white/10 transition-all text-gray-900 dark:text-white font-medium relative z-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2 z-10">
                <button
                  onClick={() => setIsCameraSearchOpen(true)}
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                  title="Snap & Shop (Visual Search)"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleListening}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title={isListening ? "Stop listening" : "Start voice search"}
                >
                  {isListening ? (
                    <Mic className="h-4 w-4 text-red-500 animate-pulse" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              <AnimatePresence>
                {showDesktopSuggestions && (recentSearches.length > 0 || searchQuery.trim() !== '') && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-2 min-w-[300px]"
                  >
                    {searchQuery.trim() === '' && recentSearches.length > 0 && (
                      <>
                        <div className="flex items-center justify-between px-4 py-2">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Searches</h4>
                          <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                        </div>
                        {recentSearches.map((search, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(search)}
                            className="w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 group text-sm"
                          >
                            <Clock className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="flex-1 text-left">{search}</span>
                          </button>
                        ))}
                      </>
                    )}
                    {searchQuery.trim() !== '' && recommendedProducts.length > 0 && (
                      <>
                        <div className="px-4 py-2">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</h4>
                        </div>
                        {recommendedProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSuggestionClick(product.name)}
                            className="w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 group text-sm"
                          >
                            <SafeProductImage
                              src={product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=500'}
                              alt={product.name}
                              className="w-8 h-8 mr-3 rounded bg-gray-100 flex-shrink-0"
                              imageClassName="w-8 h-8 rounded object-cover"
                            />
                            <div className="flex-1 text-left flex flex-col min-w-0">
                              <span className="truncate font-medium">{product.name}</span>
                              <span className="text-[10px] text-gray-500 truncate">{product.category}</span>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    {searchQuery.trim() !== '' && recommendedProducts.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No products found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {compareCount > 0 && onOpenCompare && (
              <button 
                onClick={onOpenCompare}
                className="hidden sm:flex p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative"
                aria-label="Compare"
              >
                <Scale className="w-5 h-5" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-black dark:bg-white rounded-full shadow-sm">
                  {compareCount}
                </span>
              </button>
            )}
            
            <div className="hidden sm:block">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-0 cursor-pointer appearance-none px-2 py-1"
              >
                <option value="USD" className="bg-white dark:bg-[#121216] text-gray-900 dark:text-white">USD</option>
                <option value="EUR" className="bg-white dark:bg-[#121216] text-gray-900 dark:text-white">EUR</option>
                <option value="GBP" className="bg-white dark:bg-[#121216] text-gray-900 dark:text-white">GBP</option>
                <option value="INR" className="bg-white dark:bg-[#121216] text-gray-900 dark:text-white">INR</option>
              </select>
            </div>
            
            <button
              onClick={onToggleDarkMode}
              className="hidden sm:flex p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDarkMode ? 'dark' : 'light'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <button 
              onClick={onOpenWishlist}
              className="hidden sm:flex p-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {hasWishlistAlerts && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-[#030305]"></span>
                </span>
              )}
              {wishlistItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-black dark:bg-white rounded-full shadow-sm">
                  {wishlistItemCount}
                </span>
              )}
            </button>

            
            <button 
              onClick={onOpenProfile}
              className="hidden sm:flex p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="User Profile"
            >
              <User className="w-5 h-5" />
            </button>

            <button 
              onClick={onOpenCart}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#030305] border-b border-gray-100 dark:border-white/10 overflow-hidden shadow-2xl z-50"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              <div className="relative" ref={mobileSuggestionsRef}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setShowMobileSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="block w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white relative z-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2 z-10">
                  <button
                    onClick={() => setIsCameraSearchOpen(true)}
                    className="text-gray-400 hover:text-purple-500 transition-colors"
                    title="Snap & Shop"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <button
                    onClick={toggleListening}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    title={isListening ? "Stop listening" : "Start voice search"}
                  >
                    {isListening ? (
                      <Mic className="h-4 w-4 text-red-500 animate-pulse" />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showMobileSuggestions && (recentSearches.length > 0 || searchQuery.trim() !== '') && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-2"
                    >
                      {searchQuery.trim() === '' && recentSearches.length > 0 && (
                        <>
                          <div className="flex items-center justify-between px-4 py-2">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Searches</h4>
                            <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                          </div>
                          {recentSearches.map((search, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSuggestionClick(search)}
                              className="w-full flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 group text-sm"
                            >
                              <Clock className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              <span className="flex-1 text-left">{search}</span>
                            </button>
                          ))}
                        </>
                      )}
                      {searchQuery.trim() !== '' && recommendedProducts.length > 0 && (
                        <>
                          <div className="px-4 py-2">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</h4>
                          </div>
                          {recommendedProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSuggestionClick(product.name)}
                              className="w-full flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 group text-sm"
                            >
                              <SafeProductImage
                                src={product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=500'}
                                alt={product.name}
                                className="w-10 h-10 mr-3 rounded-md bg-gray-100 flex-shrink-0"
                                imageClassName="w-10 h-10 rounded-md object-cover"
                              />
                              <div className="flex-1 text-left flex flex-col min-w-0">
                                <span className="truncate font-medium">{product.name}</span>
                                <span className="text-[10px] text-gray-500 truncate">{product.category}</span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                      {searchQuery.trim() !== '' && recommendedProducts.length === 0 && (
                        <div className="px-4 py-4 text-sm text-gray-500 text-center">
                          No products found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pb-4 border-b border-gray-100 dark:border-white/5">
                {isAdmin && (
                  <Link 
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="col-span-2 flex items-center justify-center space-x-2 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold mb-2 transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Portal</span>
                  </Link>
                )}
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onOpenProfile(); }}
                  className="flex items-center justify-center space-x-2 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-700 dark:text-gray-300 font-medium"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onOpenWishlist(); }}
                  className="flex items-center justify-center space-x-2 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-700 dark:text-gray-300 font-medium relative"
                >
                  <div className="relative">
                    <Heart className="w-5 h-5" />
                    {hasWishlistAlerts && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-[#121216]"></span>
                      </span>
                    )}
                  </div>
                  <span>Wishlist</span>
                  {wishlistItemCount > 0 && (
                    <span className="absolute top-2 right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-pink-500 rounded-full">
                      {wishlistItemCount}
                    </span>
                  )}
                </button>
                {compareCount > 0 && onOpenCompare && (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onOpenCompare(); }}
                    className="flex items-center justify-center space-x-2 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-700 dark:text-gray-300 font-medium relative"
                  >
                    <Scale className="w-5 h-5" />
                    <span>Compare</span>
                    <span className="absolute top-2 right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-blue-500 rounded-full">
                      {compareCount}
                    </span>
                  </button>
                )}
                <button 
                  onClick={onToggleDarkMode}
                  className="flex items-center justify-center space-x-2 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-700 dark:text-gray-300 font-medium"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={isDarkMode ? 'dark' : 'light'}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.div>
                  </AnimatePresence>
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Categories</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-gray-100 dark:bg-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0 appearance-none px-3 py-1.5"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    onCategoryChange('All');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                    activeCategory === 'All' 
                       ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' 
                       : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  Home
                </button>
                {categories.slice(1).map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                      activeCategory === category 
                        ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CameraSearchModal isOpen={isCameraSearchOpen} onClose={() => setIsCameraSearchOpen(false)} />
    </nav>
  );
}
