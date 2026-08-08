import { motion, AnimatePresence } from 'motion/react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Shield className="w-5 h-5" />
              <h2 className="text-xl font-bold">Privacy Policy</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300">
              <section>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">1. Information We Collect</h3>
                <p>
                  We collect information you provide directly to us, such as when you create or modify your account, make a purchase, contact customer support, or otherwise communicate with us. This information may include your name, email address, phone number, postal address, payment information, and other details.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">2. How We Use Your Information</h3>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, process transactions, send related information including confirmations and invoices, and communicate with you about products, services, offers, promotions, and events.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">3. Information Sharing</h3>
                <p>
                  We do not share your personal information with third parties except as described in this privacy policy, such as with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">4. Security</h3>
                <p>
                  We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">5. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at sontrachithkumar@gmail.com.
                </p>
              </section>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
             <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Understood
              </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
