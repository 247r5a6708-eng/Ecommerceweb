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
      className={`relative min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-[#030305] ${showSuggestions ? "z-[60]" : ""}`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 3D Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 [transform:perspective(1000px)_rotateX(60deg)_translateY(100px)_scale(2)] origin-bottom" />
        
        {/* Animated Orbs */}
        <motion.div 
           animate={{
            x: mousePosition.x * -100,
            y: mousePosition.y * -100,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" 
        />
        <motion.div 
           animate={{
            x: mousePosition.x * 100,
            y: mousePosition.y * 100,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" 
        />
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
            className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.05]"
          >
            <span className="text-gray-900 dark:text-white">Shop The</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 neon-text-shadow">Future</span>
          </motion.h1>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onSubmit={handleSubmit} 
            className={`group max-w-3xl mx-auto ${showSuggestions ? 'fixed inset-0 z-[100] bg-white dark:bg-[#030305] sm:bg-transparent sm:relative sm:z-20 p-4 sm:p-0 overflow-y-auto sm:overflow-visible' : 'relative z-20'}`}
            style={showSuggestions ? {} : { 
              transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl transition-opacity opacity-50 group-hover:opacity-100 ${showSuggestions ? 'hidden sm:block' : ''}`} />
            
            {showSuggestions && (
              <div className="flex justify-between items-center mb-4 sm:hidden">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search</h3>
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); setShowSuggestions(false); }}
                  className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}

            <div className={`relative rounded-3xl p-2 flex flex-col sm:flex-row sm:items-center ${showSuggestions ? 'shadow-none border-0 sm:border sm:border-gray-200 sm:dark:border-white/20 sm:shadow-lg sm:glass-panel bg-gray-50 dark:bg-white/5 sm:bg-transparent' : 'glass-panel border border-gray-200 dark:border-white/20'}`} ref={suggestionsRef}>
              <div className="flex items-center w-full relative">
                <div className="pl-4 sm:pl-6 pointer-events-none absolute left-0 z-10">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <input
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="block w-full pl-12 sm:pl-16 pr-4 py-4 sm:py-6 bg-transparent text-lg sm:text-xl placeholder-gray-500 focus:outline-none text-gray-900 dark:text-white font-medium relative z-20"
                  placeholder="Initialize search sequence..."
                />
                <button type="button" className="p-3 sm:p-4 mr-1 sm:mr-2 text-gray-400 hover:text-blue-500 transition-colors rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 flex-shrink-0 z-20" title="Visual Search (AR)">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  type="submit"
                  className="hidden sm:inline-flex items-center justify-center px-8 py-5 border border-transparent text-lg font-bold rounded-2xl text-black bg-white hover:bg-blue-50 focus:outline-none transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] active:scale-95 whitespace-nowrap flex-shrink-0 z-20"
                >
                  Execute <ArrowRight className="ml-3 w-5 h-5" />
                </button>
              </div>

              {showSuggestions && (
                 <button
                  type="submit"
                  className="mt-4 sm:hidden w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-black bg-white hover:bg-blue-50 focus:outline-none transition-all duration-300 shadow-md active:scale-95 whitespace-nowrap z-20"
                >
                  Execute <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              )}

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="static sm:absolute sm:top-full sm:left-0 sm:right-0 mt-4 bg-white/95 dark:bg-[#121216]/95 backdrop-blur-xl sm:border border-gray-200 dark:border-white/10 sm:rounded-2xl sm:shadow-2xl overflow-hidden z-50 p-2 text-left"
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
