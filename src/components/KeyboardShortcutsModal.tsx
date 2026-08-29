import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Search, ShoppingBag, Heart, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  const shortcuts = [
    { key: '/', description: 'Focus global search', icon: <Search className="w-4 h-4 text-gray-500" /> },
    { key: 'c', description: 'Toggle shopping cart', icon: <ShoppingBag className="w-4 h-4 text-gray-500" /> },
    { key: 'w', description: 'Toggle wishlist', icon: <Heart className="w-4 h-4 text-gray-500" /> },
    { key: '?', description: 'Show keyboard shortcuts', icon: <Keyboard className="w-4 h-4 text-gray-500" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#121216] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Command className="w-5 h-5 mr-3 text-purple-500" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        {shortcut.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                    </div>
                    <kbd className="px-3 py-1.5 min-w-[32px] text-center text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
