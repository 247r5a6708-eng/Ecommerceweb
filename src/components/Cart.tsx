import { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, CheckCircle2, Loader2, CreditCard, MapPin, Truck, Box, Package, Zap, Clock } from 'lucide-react';
import { CartItem, Order, Address, ToastType } from '../types';
import SafeProductImage from './SafeProductImage';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  isLoading?: boolean;
  onUpdateQuantity: (id: string, newQuantity: number, selectedSize?: string) => void;
  onRemoveItem: (id: string, selectedSize?: string) => void;
  onClearCart: () => void;
  onPlaceOrder?: (order: Order) => void;
  onAddToast?: (toast: Omit<ToastType, 'id'>) => void;
}

export default function Cart({ isOpen, onClose, items, isLoading = false, onUpdateQuantity, onRemoveItem, onClearCart, onPlaceOrder, onAddToast }: CartProps) {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { userProfile } = useUser();

  const [checkoutState, setCheckoutState] = useState<'idle' | 'details' | 'loading' | 'success'>('idle');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showHoldAlert, setShowHoldAlert] = useState(false);
  const [sendReceipt, setSendReceipt] = useState(!!userProfile?.email);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    setSendReceipt(!!userProfile?.email);
  }, [userProfile?.email]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (items.length > 0 && checkoutState === 'idle') {
      timer = setTimeout(() => {
        setShowHoldAlert(true);
      }, 10 * 60 * 1000); // 10 minutes of inactivity
    } else {
      setShowHoldAlert(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [items, checkoutState, isOpen]);
  
  const defaultSavedAddress = userProfile.savedAddresses?.find(a => a.isDefault) || userProfile.savedAddresses?.[0];

  const [address, setAddress] = useState<Address>(defaultSavedAddress || {
    fullName: userProfile.name || 'Jane Doe',
    email: userProfile.email || 'kumarrachith0@gmail.com',
    phone: userProfile.phone || '+1 234 567 8900',
    addressLine1: '123 Tech Lane',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA'
  });
  
  useEffect(() => {
    if (defaultSavedAddress) {
      setAddress(defaultSavedAddress);
    }
  }, [defaultSavedAddress]);
  
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const GIFT_WRAP_FEE = 5.00;
  
  const discountAmount = subtotal * discount;
  const totalAmount = subtotal - discountAmount + (isGiftWrapped ? GIFT_WRAP_FEE : 0) + (shippingMethod === 'drone' ? 15 : 0);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCheckoutState('idle');
        setPlacedOrder(null);
      }, 300);
    }
  }, [isOpen]);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'LUMINA20') {
      setDiscount(0.2);
      if (onAddToast) onAddToast({ title: 'Promo Applied', message: '20% discount applied!', type: 'success' });
    } else {
      setDiscount(0);
      if (onAddToast) onAddToast({ title: 'Invalid Code', message: 'Promo code is not valid.', type: 'info' });
    }
  };
  
  const handleCheckout = () => {
    setCheckoutState('loading');
    
    // Simulate payment authentication step
    setTimeout(() => {
      if (onAddToast) {
        onAddToast({
          title: 'Authenticating Payment',
          message: `Verifying your ${paymentMethod === 'upi' ? 'UPI' : paymentMethod} transaction...`,
          type: 'info'
        });
      }
    }, 500);

    setTimeout(() => {
      const newOrder: Order = {
        id: crypto.randomUUID().split("-")[0].toUpperCase(),
        date: new Date().toISOString(),
        items: [...items],
        total: totalAmount,
        status: 'processing',
        address: { ...address },
        paymentMethod,
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        isGiftWrapped,
        giftMessage: isGiftWrapped ? giftMessage : undefined,
        giftWrapFee: isGiftWrapped ? GIFT_WRAP_FEE : undefined,
        discount: discountAmount > 0 ? discountAmount : undefined
      };
      
      setPlacedOrder(newOrder);
      setCheckoutState('success');
      
      if (onPlaceOrder) {
        onPlaceOrder(newOrder);
      }
      onClearCart();
      
      if (onAddToast) {
        onAddToast({
          title: 'Payment Successful',
          message: `Your payment was authenticated and order #${newOrder.id} is confirmed.`,
          type: 'success'
        });
        
        setTimeout(() => {
          onAddToast({
            title: 'Order Confirmation',
            message: `Invoice for Order #${newOrder.id} has been sent to your email.`,
            type: 'success'
          });
        }, 1500);

        setTimeout(() => {
          onAddToast({
            title: 'Shipping Update',
            message: `Your order #${newOrder.id} has been processed and is ready to ship!`,
            type: 'info'
          });
        }, 5000);
      }
      
    }, 2500);
  };

  const renderCartItems = () => (
    <Fragment>
      <div className="flex-1 overflow-y-auto p-6 sm:px-6">
        {isLoading ? (
          <ul role="list" className="-my-6 divide-y divide-gray-100 dark:divide-white/10">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 dark:border-white/5 bg-gray-200 dark:bg-gray-800 relative">
                  <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent blur-md" />
                </div>
                <div className="ml-4 flex flex-1 flex-col justify-center space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden">
                      <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent blur-md" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden">
                      <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent blur-md" />
                    </div>
                  </div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden">
                    <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent blur-md" />
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden">
                      <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent blur-md" />
                    </div>
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded relative overflow-hidden">
                      <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent blur-md" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              className="relative w-48 h-48 mb-4"
            >
              <div className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-white/5 dark:to-white/10 rounded-full flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-white/50 dark:border-white/10 relative">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  >
                    <ShoppingBag className="w-12 h-12 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
                  </motion.div>
                  {/* Decorative sparkles */}
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-6 right-8 w-2 h-2 rounded-full bg-yellow-400" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} className="absolute bottom-8 left-8 w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className="absolute top-10 left-10 w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              </div>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Your cart is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[240px] mb-8 leading-relaxed">
              Looks like you haven't found anything you like yet. Let's change that!
            </p>
            <button 
              onClick={onClose}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 font-bold text-sm w-full sm:w-auto"
            >
              <span>Continue Shopping</span>
              <motion.div 
                className="ml-2 group-hover:translate-x-1 transition-transform"
              >
                &rarr;
              </motion.div>
            </button>
          </div>
        ) : (
          <ul role="list" className="-my-6 divide-y divide-gray-100 dark:divide-white/10">
            {items.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/10">
                  <SafeProductImage
                    src={item.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=500'}
                    alt={item.name}
                    className="h-full w-full"
                    imageClassName="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                      <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                      <p className="ml-4">{formatPrice((item.price * item.quantity))}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {item.category}
                      {item.selectedSize && ` • Size: ${item.selectedSize}`}
                    </p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-md">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1), item.selectedSize)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id, item.selectedSize)}
                      className="font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-gray-100 dark:border-white/5 px-6 py-6 sm:px-6">
          <div className="mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-100 dark:border-white/10">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isGiftWrapped}
                onChange={(e) => setIsGiftWrapped(e.target.checked)}
                className="w-4 h-4 text-gray-900 bg-white border-gray-300 rounded focus:ring-gray-900 dark:focus:ring-white dark:ring-offset-gray-900 focus:ring-2 dark:bg-transparent dark:border-gray-600"
              />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white flex items-center">
                Add Gift Wrap
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full">
                  +{formatPrice(GIFT_WRAP_FEE)}
                </span>
              </span>
            </label>
            
            <AnimatePresence>
              {isGiftWrapped && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    placeholder="Enter your personalized gift message here..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900 resize-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mb-4">
            <button
              onClick={() => {
                alert("Connecting Web3 Wallet to verify NFT ownership...");
                setDiscount(0.15);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-purple-200 dark:border-purple-500/30 rounded-lg text-sm font-bold text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Box className="w-4 h-4" />
              <span>Connect NFT for 15% Holder Discount</span>
            </button>
          </div>

          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mb-2">
            <p>Subtotal</p>
            <p>{formatPrice(subtotal)}</p>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
              <p>NFT Discount</p>
              <p>-{formatPrice(discountAmount)}</p>
            </div>
          )}
          {isGiftWrapped && (
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              <p>Gift Wrap</p>
              <p>{formatPrice(GIFT_WRAP_FEE)}</p>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-4 pt-2 border-t border-gray-100 dark:border-white/5">
            <p>Estimated Total</p>
            <p>{formatPrice(totalAmount)}</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
            Shipping and taxes calculated at checkout.
          </p>
          <button
            onClick={() => setCheckoutState('details')}
            className="flex w-full items-center justify-center rounded-md bg-gray-900 dark:bg-white px-6 py-3.5 text-base font-medium text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors mb-3"
          >
            Checkout
          </button>
          
          <button
            onClick={() => alert("Connecting to Web3 Wallet (MetaMask/Phantom)...")}
            className="flex w-full items-center justify-center rounded-md bg-blue-600/10 px-6 py-3.5 text-base font-bold text-blue-600 dark:text-blue-400 border border-blue-600/20 hover:bg-blue-600/20 transition-colors"
          >
            Pay with Crypto (Web3)
          </button>
        </div>
      )}
    </Fragment>
  );

  const renderCheckoutDetails = () => (
    <div className="flex-1 overflow-y-auto p-6 sm:px-6 flex flex-col h-full">
      <div className="space-y-6 flex-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2" /> Shipping Address
          </h3>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Full Name" 
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-[#0a0a0f] backdrop-blur-2xl border-l border-white/10 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
              value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-[#0a0a0f] backdrop-blur-2xl border-l border-white/10 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
                value={address.email || ''} onChange={e => setAddress({...address, email: e.target.value})} 
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-[#0a0a0f] backdrop-blur-2xl border-l border-white/10 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
                value={address.phone || ''} onChange={e => setAddress({...address, phone: e.target.value})} 
              />
            </div>
            <input 
              type="text" 
              placeholder="Address Line 1" 
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-[#0a0a0f] backdrop-blur-2xl border-l border-white/10 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
              value={address.addressLine1} onChange={e => setAddress({...address, addressLine1: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="City" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-[#0a0a0f] backdrop-blur-2xl border-l border-white/10 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
                value={address.city} onChange={e => setAddress({...address, city: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Zip Code" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-[#0a0a0f] backdrop-blur-2xl border-l border-white/10 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
                value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Package className="w-4 h-4 mr-2" /> Shipping Method
          </h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 dark:border-white/10 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <input 
                type="radio" 
                name="shipping" 
                value="standard" 
                checked={shippingMethod === 'standard'}
                onChange={e => setShippingMethod(e.target.value)}
                className="text-gray-900 focus:ring-gray-900"
              />
              <div className="ml-3">
                <span className="block text-sm text-gray-900 dark:text-white font-medium">Standard Delivery (3-5 days)</span>
                <span className="block text-xs text-gray-500">Free</span>
              </div>
            </label>
            <label className="flex items-center p-3 border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <input 
                type="radio" 
                name="shipping" 
                value="drone" 
                checked={shippingMethod === 'drone'}
                onChange={e => setShippingMethod(e.target.value)}
                className="text-blue-600 focus:ring-blue-600"
              />
              <div className="ml-3">
                <span className="block text-sm text-blue-900 dark:text-blue-100 font-bold flex items-center">Hyper-Local Drone Delivery <Zap className="w-3 h-3 ml-1 text-yellow-500" /></span>
                <span className="block text-xs text-blue-600 dark:text-blue-400">Under 30 minutes. +$15.00</span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" /> Payment Method
          </h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 dark:border-white/10 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <input 
                type="radio" 
                name="payment" 
                value="credit-card" 
                checked={paymentMethod === 'credit-card'}
                onChange={e => setPaymentMethod(e.target.value)}
                className="text-gray-900 focus:ring-gray-900"
              />
              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">Credit Card</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-white/10 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <input 
                type="radio" 
                name="payment" 
                value="paypal" 
                checked={paymentMethod === 'paypal'}
                onChange={e => setPaymentMethod(e.target.value)}
                className="text-gray-900 focus:ring-gray-900"
              />
              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">PayPal</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-white/10 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <input 
                type="radio" 
                name="payment" 
                value="upi" 
                checked={paymentMethod === 'upi'}
                onChange={e => setPaymentMethod(e.target.value)}
                className="text-gray-900 focus:ring-gray-900"
              />
              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">UPI</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-white/10 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <input 
                type="radio" 
                name="payment" 
                value="apple-pay" 
                checked={paymentMethod === 'apple-pay'}
                onChange={e => setPaymentMethod(e.target.value)}
                className="text-gray-900 focus:ring-gray-900"
              />
              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">Apple Pay / Google Pay</span>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-white/5 mt-auto">
        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mb-2">
          <p>Subtotal</p>
          <p>{formatPrice(subtotal)}</p>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
            <p>NFT Discount</p>
            <p>-{formatPrice(discountAmount)}</p>
          </div>
        )}
        {shippingMethod === 'drone' && (
          <div className="flex justify-between text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
            <p>Drone Delivery</p>
            <p>+$15.00</p>
          </div>
        )}
        {isGiftWrapped && (
          <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <p>Gift Wrap</p>
            <p>{formatPrice(GIFT_WRAP_FEE)}</p>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-4 pt-2 border-t border-gray-100 dark:border-white/5">
          <p>Total</p>
          <p>{formatPrice(totalAmount)}</p>
        </div>
        
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="sendReceipt"
            checked={sendReceipt}
            onChange={(e) => setSendReceipt(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 accent-gray-900 dark:accent-white"
          />
          <label htmlFor="sendReceipt" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Send digital receipt to my email
          </label>
        </div>

        <button
          onClick={handleCheckout}
          className="flex w-full items-center justify-center rounded-md bg-gray-900 dark:bg-white px-6 py-3.5 text-base font-medium text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Confirm & Pay
        </button>
        <button
          onClick={() => setCheckoutState('idle')}
          className="flex w-full items-center justify-center rounded-md mt-3 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex-1 overflow-y-auto p-6 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col h-full"
      >
        <div className="flex flex-col items-center text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-500 dark:text-green-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order Confirmed</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Order #{placedOrder?.id}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/10 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <Truck className="w-4 h-4 mr-2" /> Delivery Dashboard
          </h4>
          
          <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:w-0.5 before:-translate-x-px before:h-full before:bg-gray-200 dark:before:bg-gray-700">
            <div className="relative flex items-center">
              <div className="absolute -left-6 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 z-10" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">Order Placed</div>
            </div>
            <div className="relative flex items-center opacity-50">
              <div className="absolute -left-6 w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-900 z-10" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Processing</div>
            </div>
            <div className="relative flex items-center opacity-50">
              <div className="absolute -left-6 w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-900 z-10" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Shipped</div>
            </div>
            <div className="relative flex items-center">
              <div className="absolute -left-6 w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-900 z-10" />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Expected Delivery <br/>
                <span className="font-medium text-gray-900 dark:text-white">{placedOrder?.expectedDelivery ? new Date(placedOrder.expectedDelivery).toLocaleDateString() : ''}</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-auto px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium w-full"
        >
          Continue Shopping
        </button>
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] shadow-2xl border-l border-gray-200 dark:border-gray-900"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {checkoutState === 'details' ? 'Checkout' : checkoutState === 'success' ? 'Invoice' : 'Your Cart'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence>
              {showHoldAlert && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mx-6 mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex flex-col space-y-4 shadow-sm overflow-hidden shrink-0"
                >
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg mr-3 shrink-0">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Are you still there?</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        Your cart has been inactive for 10 minutes. We can save your items for later securely to your Firebase profile.
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        if (onAddToast) {
                          onAddToast({
                            title: 'Cart Held Successfully',
                            message: 'Your items are safely synced to Firebase.',
                            type: 'success'
                          });
                        }
                        setShowHoldAlert(false);
                        onClose();
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      Hold Cart
                    </button>
                    <button
                      onClick={() => setShowHoldAlert(false)}
                      className="flex-1 py-2.5 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white text-xs font-bold rounded-lg transition-colors border border-gray-200 dark:border-transparent"
                    >
                      Keep Shopping
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {checkoutState === 'loading' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-[#121216]/80 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 animate-spin text-gray-900 dark:text-white mb-4" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Processing your order...</p>
              </div>
            )}

            {checkoutState === 'idle' && renderCartItems()}
            {checkoutState === 'details' && renderCheckoutDetails()}
            {checkoutState === 'success' && renderSuccess()}
            
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
