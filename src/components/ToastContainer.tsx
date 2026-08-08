import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { ToastType } from '../types';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="pointer-events-auto overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 w-full bg-white dark:bg-gray-800"
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />}
                  {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
                  {toast.type === 'error' && <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.title}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{toast.message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
                    onClick={() => onRemove(toast.id)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
