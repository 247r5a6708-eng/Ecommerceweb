const fs = require('fs');
let content = fs.readFileSync('src/components/QuickViewModal.tsx', 'utf-8');

const imports = `import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Star, Mail, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Product, Review } from '../types';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import SafeProductImage from './SafeProductImage';`;

const aiState = `  const [aiPriceInsight, setAiPriceInsight] = useState<any>(null);
  const [isPriceAnalyzing, setIsPriceAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      const fetchPriceInsight = async () => {
        setIsPriceAnalyzing(true);
        try {
          const res = await fetch('/api/ai-price-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id })
          });
          const data = await res.json();
          setAiPriceInsight(data);
        } catch (error) {
          console.error("Failed to fetch price insight", error);
        } finally {
          setIsPriceAnalyzing(false);
        }
      };
      fetchPriceInsight();
    } else {
      setAiPriceInsight(null);
    }
  }, [isOpen, product]);`;

content = content.replace(/import \{ motion.*SafeProductImage';/s, imports);

content = content.replace("const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);", "const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);\n" + aiState);

const priceInsightUi = `
              {/* Phase 7: Price Intelligence */}
              <div className="mb-6 p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white/50 dark:bg-[#121216]/50">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                  LUMINA Price Intelligence
                </h4>
                {isPriceAnalyzing ? (
                   <div className="flex items-center space-x-2 text-sm text-gray-500">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     <span>Analyzing pricing trends...</span>
                   </div>
                ) : aiPriceInsight ? (
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className={\`text-xs font-bold uppercase px-2 py-1 rounded \${aiPriceInsight.advice === 'Buy Now' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : aiPriceInsight.advice === 'Wait' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}\`}>
                         {aiPriceInsight.advice}
                       </span>
                       <span className="text-xs text-gray-500">
                         {aiPriceInsight.confidence}% Confidence
                       </span>
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {aiPriceInsight.analysis}
                     </p>
                     <div className="flex items-center space-x-2 text-xs text-gray-500">
                       <span>Trend:</span>
                       {aiPriceInsight.historicalTrend === 'up' ? <TrendingUp className="w-4 h-4 text-red-500" /> : aiPriceInsight.historicalTrend === 'down' ? <TrendingDown className="w-4 h-4 text-green-500" /> : <Minus className="w-4 h-4 text-gray-400" />}
                     </div>
                   </div>
                ) : null}
              </div>
`;

content = content.replace("</p>\n              {product.aiSummary", priceInsightUi + "</p>\n              {product.aiSummary");

fs.writeFileSync('src/components/QuickViewModal.tsx', content);
