import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { Product } from '../types';

interface NotifyMeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export default function NotifyMeModal({ product, isOpen, onClose, onSubmit }: NotifyMeModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onSubmit(email);
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
        onClose();
      }, 2000);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-[#121216]/80 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-[#121216] rounded-xl shadow-2xl sm:my-8 sm:w-full sm:max-w-md sm:align-middle border border-gray-100 dark:border-white/5"
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
            >
              <span className="sr-only">Close</span>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 pt-5 pb-6 sm:pb-6">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                  Notify Me When Available
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Leave your email and we'll let you know as soon as <strong>{product.name}</strong> is back in stock.
                  </p>
                  
                  {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">You're on the list!</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-2">
                      <div className="mb-4">
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="block w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          isSubmitting || !email ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isSubmitting ? 'Subscribing...' : 'Notify Me'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
