const fs = require('fs');
let content = fs.readFileSync('src/components/CompareModal.tsx', 'utf-8');

const imports = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';
import { X, Scale, Star, ShoppingBag, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Product, Review } from '../types';
import SafeProductImage from './SafeProductImage';`;

const newCompareLogic = `
  const [aiComparison, setAiComparison] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (products.length > 1) {
      const fetchComparison = async () => {
        setIsComparing(true);
        try {
          const res = await fetch('/api/ai-compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: products.map(p => p.id) })
          });
          const data = await res.json();
          setAiComparison(data);
        } catch (error) {
          console.error('Failed to get AI comparison:', error);
        } finally {
          setIsComparing(false);
        }
      };
      fetchComparison();
    } else {
      setAiComparison(null);
    }
  }, [products]);
`;

// replace imports
content = content.replace(/import \{ motion.*SafeProductImage';/s, imports);

// insert logic after formatPrice
content = content.replace("const { formatPrice } = useCurrency();", "const { formatPrice } = useCurrency();\n" + newCompareLogic);

// replace AI recommendation UI
const aiBlockRegex = /\{products\.length > 1 && \(\s*<div className="mt-8 pt-6 border-t border-gray-100.*?\)\}/s;
const newAiBlock = `{products.length > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                  <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-blue-500 fill-blue-500" />
                    AI Comparison Analysis
                  </h4>
                  {isComparing ? (
                    <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <p>LUMINA is analyzing these products...</p>
                    </div>
                  ) : aiComparison ? (
                    <div className="space-y-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Best Overall:</strong> {products.find(p => p.id === aiComparison.bestOverallId)?.name || 'Tie'}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {aiComparison.verdict}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {aiComparison.comparisons?.map((comp: any) => {
                          const p = products.find(p => p.id === comp.productId);
                          if (!p) return null;
                          return (
                            <div key={comp.productId} className="bg-white/50 dark:bg-[#121216]/50 rounded-xl p-4">
                              <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-3">{p.name}</h5>
                              <div className="space-y-3">
                                <div>
                                  <h6 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Pros
                                  </h6>
                                  <ul className="space-y-1">
                                    {comp.pros?.map((pro: string, idx: number) => (
                                      <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                                        <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h6 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" /> Cons
                                  </h6>
                                  <ul className="space-y-1">
                                    {comp.cons?.map((con: string, idx: number) => (
                                      <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                                        <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                        {con}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}`;

content = content.replace(aiBlockRegex, newAiBlock);

fs.writeFileSync('src/components/CompareModal.tsx', content);
