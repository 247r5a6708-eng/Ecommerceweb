import { motion } from 'motion/react';

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#121216] shadow-sm border border-gray-100 dark:border-white/5">
      <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent blur-md"
        />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-4 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse ml-2" />
        </div>
        <div className="flex items-center mt-1 mb-3">
          <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-1.5" />
          <div className="h-3 w-5/6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
