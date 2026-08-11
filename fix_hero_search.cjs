const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');

const imports = `import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight, Search, Camera, Clock, TrendingUp, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';`;

content = content.replace(/import \{ motion.*from 'react';/s, imports);

const states = `  const [intent, setIntent] = useState('');
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
  };`;

content = content.replace("  const [intent, setIntent] = useState('');", states);

const handleSubmitLogic = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;
    
    saveRecentSearch(intent.trim());
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(intent);
    }`;

content = content.replace(/  const handleSubmit = \(e: React.FormEvent\) => \{[\s\S]*?if \(onSearch\) \{[\s\S]*?onSearch\(intent\);[\s\S]*?\}/, handleSubmitLogic);

const inputUI = `<div className="relative glass-panel rounded-3xl p-2 flex items-center border border-white/20" ref={suggestionsRef}>
              <div className="pl-6 pointer-events-none">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="block w-full pl-6 pr-4 py-6 bg-transparent text-xl placeholder-gray-500 focus:outline-none text-gray-900 dark:text-white font-medium relative z-20"
                placeholder="Initialize search sequence..."
              />
              <button type="button" className="p-4 mr-2 text-gray-400 hover:text-blue-500 transition-colors rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 flex-shrink-0 z-20" title="Visual Search (AR)">
                <Camera className="w-6 h-6" />
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-8 py-5 border border-transparent text-lg font-bold rounded-2xl text-black bg-white hover:bg-blue-50 focus:outline-none transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] active:scale-95 whitespace-nowrap flex-shrink-0 z-20"
              >
                Execute <ArrowRight className="ml-3 w-5 h-5" />
              </button>

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-white/90 dark:bg-[#121216]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 text-left"
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
            </div>`;

content = content.replace(/<div className="relative glass-panel rounded-3xl p-2 flex items-center border border-white\/20">[\s\S]*?<\/div>/, inputUI);

fs.writeFileSync('src/components/Hero.tsx', content);
