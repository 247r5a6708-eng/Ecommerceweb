import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Search } from 'lucide-react';
import React, { useState } from 'react';

interface HeroProps {
  onSearch?: (intent: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [intent, setIntent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;
    
    if (onSearch) {
      onSearch(intent);
    }
    
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-40">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 rounded-full text-sm font-medium flex items-center border border-gray-200 dark:border-gray-700 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
              AI Lifecycle Commerce
            </span>
          </div>
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-6">
            Tell us what you need. <br className="hidden sm:block" />
            <span className="text-gray-500 dark:text-gray-400">We'll find the perfect match.</span>
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-lg mb-10">
            Don't search for products. Search for solutions. Describe your budget, use-case, or problem, and our AI will recommend verified, sustainable, and highly-rated solutions.
          </p>

          <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="block w-full pl-11 pr-32 py-4 sm:py-5 border-2 border-transparent bg-white dark:bg-gray-800 rounded-2xl text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-lg group-hover:shadow-xl transition-all duration-300 dark:text-white"
              placeholder='e.g., "I need a durable backpack for a 5-day hiking trip under $150"'
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 focus:outline-none transition-colors"
              >
                Find <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>Popular:</span>
            <button onClick={() => setIntent("Quiet keyboard for programming")} className="hover:text-gray-900 dark:hover:text-white transition-colors underline decoration-dotted">Quiet keyboard for programming</button>
            <button onClick={() => setIntent("Durable daily coffee maker")} className="hover:text-gray-900 dark:hover:text-white transition-colors underline decoration-dotted">Durable daily coffee maker</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
