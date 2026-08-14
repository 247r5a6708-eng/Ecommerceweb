const fs = require('fs');
let code = fs.readFileSync('src/components/Cart.tsx', 'utf8');

if (!code.includes('promoCode')) {
  // Add state for promo code
  code = code.replace(
    'const [isGiftWrapped, setIsGiftWrapped] = useState(false);',
    'const [promoCode, setPromoCode] = useState("");\n  const [discount, setDiscount] = useState(0);\n  const [isGiftWrapped, setIsGiftWrapped] = useState(false);'
  );

  // Update total calculation
  code = code.replace(
    'const totalAmount = subtotal + (isGiftWrapped ? GIFT_WRAP_FEE : 0);',
    'const discountAmount = subtotal * discount;\n  const totalAmount = subtotal - discountAmount + (isGiftWrapped ? GIFT_WRAP_FEE : 0);'
  );
  
  // Add handleApplyPromo function
  code = code.replace(
    'const handleCheckout = () => {',
    `const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'LUMINA20') {
      setDiscount(0.2);
      if (onAddToast) onAddToast({ title: 'Promo Applied', message: '20% discount applied!', type: 'success' });
    } else {
      setDiscount(0);
      if (onAddToast) onAddToast({ title: 'Invalid Code', message: 'Promo code is not valid.', type: 'info' });
    }
  };
  
  const handleCheckout = () => {`
  );
  
  // Update order object
  code = code.replace(
    'giftWrapFee: isGiftWrapped ? GIFT_WRAP_FEE : undefined',
    'giftWrapFee: isGiftWrapped ? GIFT_WRAP_FEE : undefined,\n        discount: discountAmount > 0 ? discountAmount : undefined'
  );
  
  // Render promo code input
  code = code.replace(
    '<div className="flex justify-between items-center mb-6">',
    `
                      <div className="mb-6 flex space-x-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Promo code (e.g., LUMINA20)"
                          className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl"
                        >
                          Apply
                        </button>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between text-sm mb-3 font-bold text-green-500">
                          <span>Discount ({promoCode})</span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-6">`
  );

  fs.writeFileSync('src/components/Cart.tsx', code);
}
