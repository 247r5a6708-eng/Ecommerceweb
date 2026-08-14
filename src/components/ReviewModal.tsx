import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send, Loader2, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Product, Review } from '../types';

interface ReviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  onAddReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

export default function ReviewModal({ product, isOpen, onClose, reviews, onAddReview }: ReviewModalProps) {
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [aiSummary, setAiSummary] = useState<any>(null);
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


  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !newReviewAuthor.trim()) return;

    onAddReview(product.id, {
      author: newReviewAuthor,
      text: newReviewText,
      rating: newReviewRating,
    });

    setNewReviewText('');
    setNewReviewRating(5);
    setNewReviewAuthor('');
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : product.rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div className="bg-white dark:bg-[#121216] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reviews for {product.name}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-8">
                  <div className="flex flex-col items-center min-w-[120px]">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(averageRating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  
                  {/* Rating Distribution */}
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => Math.round(r.rating) === star).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center text-sm">
                          <span className="w-8 font-medium text-gray-600 dark:text-gray-400 flex items-center justify-end">{star} <Star className="w-3 h-3 ml-1 fill-current" /></span>
                          <div className="flex-1 h-2 mx-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-400' : 'bg-red-500'}`} 
                            />
                          </div>
                          <span className="w-8 text-right text-gray-500 dark:text-gray-400 text-xs">{Math.round(percentage)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                                {/* AI Review Summary (Phase 8) */}
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
                )}
                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 dark:border-white/5 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{review.author}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-200 dark:text-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="bg-gray-50 dark:bg-white/10/50 p-6 border-t border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= newReviewRating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            } hover:scale-110 transition-transform`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      id="author"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121216] text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-colors"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="review" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review</label>
                    <textarea
                      id="review"
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121216] text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-colors resize-none"
                      placeholder="What did you like or dislike?"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newReviewText.trim() || !newReviewAuthor.trim()}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-md font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Review</span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
