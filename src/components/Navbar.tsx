import { ShoppingCart, Menu, X, Search, Heart, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { categories, products } from '../data';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistItemCount: number;
  onOpenProfile: () => void;
  onOpenWishlist: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function Navbar({ 
  cartItemCount, 
  onOpenCart, 
  searchQuery, 
  onSearchChange, 
  wishlistItemCount, 
  onOpenProfile, 
  onOpenWishlist, 
  isDarkMode, 
  onToggleDarkMode,
  activeCategory,
  onCategoryChange
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const newRecent = [query, ...recentSearches.filter(q => q !== query)].slice(0, 3);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  const searchSuggestions = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onCategoryChange('All')}>
            <a href="#" className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">
              LUMIN<span className="text-gray-400">A</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2 items-center">
            {categories.slice(1).map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                  activeCategory === category 
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 md:space-x-5">
            <div className="hidden sm:flex items-center relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(searchQuery);
                    setIsSearchFocused(false);
                    e.currentTarget.blur();
                  }
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="block w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white transition-colors bg-gray-50 dark:bg-gray-900 dark:text-white"
              />
              
              {isSearchFocused && searchQuery.trim() === '' && recentSearches.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Searches</p>
                  </div>
                  {recentSearches.map(query => (
                    <button 
                      key={query}
                      onClick={() => {
                         onSearchChange(query);
                         setIsSearchFocused(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{query}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {isSearchFocused && searchSuggestions.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
                  {searchSuggestions.map(product => (
                    <button 
                      key={product.id}
                      onClick={() => {
                         onSearchChange(product.name);
                         handleSearchSubmit(product.name);
                         setIsSearchFocused(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                    >
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">${product.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={onToggleDarkMode}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 relative" 
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={onOpenProfile}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 relative hidden sm:block" 
              aria-label="User Profile"
            >
              <User className="w-5 h-5" />
            </button>

            <button 
              onClick={onOpenWishlist}
              className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 relative" 
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950">
                  {wishlistItemCount}
                </span>
              )}
            </button>

            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 relative"
              onClick={onOpenCart}
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 sm:px-6">
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(searchQuery);
                      setIsMobileMenuOpen(false);
                      e.currentTarget.blur();
                    }
                  }}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-base placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
                
                {searchQuery.trim() === '' && recentSearches.length > 0 && (
                  <div className="mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Searches</p>
                    </div>
                    {recentSearches.map(query => (
                      <button 
                        key={query}
                        onClick={() => {
                           onSearchChange(query);
                           setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{query}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchQuery.trim() !== '' && searchSuggestions.length > 0 && (
                  <div className="mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden z-50">
                    {searchSuggestions.map(product => (
                      <button 
                        key={product.id}
                        onClick={() => {
                           onSearchChange(product.name);
                           handleSearchSubmit(product.name);
                           setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                      >
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">${product.price.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); onOpenProfile(); setIsMobileMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Profile & Orders</a>
              {categories.slice(1).map(category => (
                <button
                  key={category}
                  onClick={() => {
                    onCategoryChange(category);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    activeCategory === category 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                      : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
