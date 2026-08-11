const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewModal.tsx', 'utf-8');

const imports = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send, Loader2, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Product, Review } from '../types';`;

const aiState = `  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (isOpen && product && reviews.length > 0) {
      const fetchSummary = async () => {
        setIsSummarizing(true);
        try {
          const res = await fetch('/api/ai-review-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, reviews })
          });
          const data = await res.json();
          setAiSummary(data);
        } catch (error) {
          console.error("Failed to fetch review summary", error);
        } finally {
          setIsSummarizing(false);
        }
      };
      fetchSummary();
    }
  }, [isOpen, product, reviews]);
`;

content = content.replace(/import React.*\{ Product, Review \} from '\.\.\/types';/s, imports);

content = content.replace("  const [newReviewAuthor, setNewReviewAuthor] = useState('');\n  if (!product) return null;", "  const [newReviewAuthor, setNewReviewAuthor] = useState('');\n" + aiState + "\n  if (!product) return null;");

const aiUi = `                {/* AI Review Summary (Phase 8) */}
                {reviews.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 mb-6">
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                      LUMINA Review Intelligence
                    </h4>
                    {isSummarizing ? (
                      <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p>Analyzing all reviews to extract key insights...</p>
                      </div>
                    ) : aiSummary ? (
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">"{aiSummary.verdict}"</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{aiSummary.summary}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div className="bg-white/60 dark:bg-[#121216]/60 p-3 rounded-xl">
                            <h5 className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center mb-2"><ThumbsUp className="w-4 h-4 mr-1"/> Top Positives</h5>
                            <ul className="space-y-1">
                              {aiSummary.positives?.map((p: string, i: number) => <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start"><span className="mr-1">•</span>{p}</li>)}
                            </ul>
                          </div>
                          <div className="bg-white/60 dark:bg-[#121216]/60 p-3 rounded-xl">
                            <h5 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center mb-2"><ThumbsDown className="w-4 h-4 mr-1"/> Top Negatives</h5>
                            <ul className="space-y-1">
                              {aiSummary.negatives?.map((p: string, i: number) => <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start"><span className="mr-1">•</span>{p}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}`;

content = content.replace("{/* Reviews List */}", aiUi + "\n                {/* Reviews List */}");

fs.writeFileSync('src/components/ReviewModal.tsx', content);
