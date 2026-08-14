import { motion } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';

export default function PromotionalBanner() {
  const { formatPrice } = useCurrency();
  
  const promotions = [
    "🔥 SUMMER SALE: Up to 50% off select items!",
    `FREE SHIPPING on orders over ${formatPrice(100)}`,
    "Use code LUMIN20 for 20% off your first order",
    "✨ New arrivals are here - Shop now!"
  ];

  return (
    <div className="bg-black dark:bg-white text-white dark:text-black py-2.5 overflow-hidden border-b border-black dark:border-white">
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
            <span key={index} className="mx-8 text-[11px] font-bold tracking-widest uppercase">
              {promo}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
