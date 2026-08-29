import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight, Search, Camera, Clock, TrendingUp, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface HeroProps {
  onSearch?: (intent: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [intent, setIntent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const popularSearches = ['Laptops', 'Smartphones', 'Headphones', 'Smartwatches', 'Cameras'];

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
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (search: string) => {
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
    setIntent(suggestion);
    setShowSuggestions(false);
    saveRecentSearch(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    }
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;
    
    saveRecentSearch(intent.trim());
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(intent);
    }
    
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative min-h-[90vh] flex items-center justify-center bg-transparent ${showSuggestions ? "z-[60]" : ""}`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 3D Grid Background */}
        
        
        {/* Animated Orbs */}
        
        
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          style={showSuggestions ? {} : { y: y1, opacity }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-display tracking-tight mb-8 leading-none"
          >
            <span className="text-gray-900 dark:text-white font-medium">Shop The</span> <br />
            <span className="text-neutral-400 dark:text-neutral-500 italic">Future</span>
          </motion.h1>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onSubmit={handleSubmit} 
            className={`group max-w-3xl mx-auto ${showSuggestions ? 'relative z-[100] bg-transparent sm:z-20 p-0 overflow-visible' : 'relative z-20'}`}
            style={showSuggestions ? {} : { 
              transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className={`relative rounded-full p-2 flex flex-row items-center bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border ${showSuggestions ? "border-gray-300 dark:border-gray-700 shadow-xl" : "border-gray-200 dark:border-gray-800 shadow-sm"}`} ref={suggestionsRef}>
              <div className="flex items-center w-full relative">
                <div className="pl-4 sm:pl-6 pointer-events-none absolute left-0 z-10">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="block w-full pl-12 sm:pl-16 pr-4 py-3 sm:py-6 bg-transparent text-base sm:text-xl placeholder-gray-500 focus:outline-none text-gray-900 dark:text-white font-medium relative z-20"
                  placeholder="Search products..."
                />
                <button type="button" className="p-2 sm:p-4 mr-1 sm:mr-2 text-gray-400 hover:text-blue-500 transition-colors rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 flex-shrink-0 z-20" title="Visual Search (AR)">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-lg font-medium rounded-full text-white bg-black dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 focus:outline-none transition-all duration-300 active:scale-95 whitespace-nowrap flex-shrink-0 z-20"
                >
                  <span className="hidden sm:inline">Execute</span> <ArrowRight className="sm:ml-3 w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-50 p-2 text-left"
                  >
                    {recentSearches.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between px-4 py-2">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Searches</h4>
                          <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                        </div>
                        {recentSearches.map((search, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(search)}
                            className="w-full flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-700 dark:text-gray-300 group"
                          >
                            <Clock className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="flex-1 text-left">{search}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div>
                      <div className="px-4 py-2">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trending</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-2">
                        {popularSearches.map((search, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(search)}
                            className="flex items-center px-4 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-700 dark:text-gray-300 group"
                          >
                            <TrendingUp className="w-4 h-4 mr-3 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
                            <span className="flex-1 text-left font-medium">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
