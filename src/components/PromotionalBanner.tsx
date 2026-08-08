import { motion } from 'motion/react';

const promotions = [
  "🔥 SUMMER SALE: Up to 50% off select items!",
  "FREE SHIPPING on orders over $100",
  "Use code LUMIN20 for 20% off your first order",
  "✨ New arrivals are here - Shop now!"
];

export default function PromotionalBanner() {
  return (
    <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 overflow-hidden border-b border-gray-900 dark:border-white">
      <div className="relative flex max-w-full overflow-hidden">
        <motion.div
          className="whitespace-nowrap flex"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25,
          }}
        >
          {/* Duplicate promotions to create a seamless loop */}
          {[...promotions, ...promotions].map((promo, index) => (
            <span key={index} className="mx-8 text-sm font-medium tracking-wide">
              {promo}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
