import { Fragment, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, CheckCircle2, Loader2, CreditCard, MapPin, Truck } from 'lucide-react';
import { CartItem, Order, Address, ToastType } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQuantity: number, selectedSize?: string) => void;
  onRemoveItem: (id: string, selectedSize?: string) => void;
  onClearCart: () => void;
  onPlaceOrder?: (order: Order) => void;
  onAddToast?: (toast: Omit<ToastType, 'id'>) => void;
}

export default function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onClearCart, onPlaceOrder, onAddToast }: CartProps) {
  const [checkoutState, setCheckoutState] = useState<'idle' | 'details' | 'loading' | 'success'>('idle');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const [address, setAddress] = useState<Address>({
    fullName: 'Jane Doe',
    addressLine1: '123 Tech Lane',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCheckoutState('idle');
        setPlacedOrder(null);
      }, 300);
    }
  }, [isOpen]);

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
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toISOString(),
        items: [...items],
        total: subtotal,
        status: 'processing',
        address: { ...address },
        paymentMethod,
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
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
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
              <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">Your cart is empty</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Looks like you haven't added anything yet.</p>
            <button 
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <ul role="list" className="-my-6 divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                      <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                      <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {item.category}
                      {item.selectedSize && ` • Size: ${item.selectedSize}`}
                    </p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
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
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-6 sm:px-6">
          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mb-4">
            <p>Subtotal</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
            Shipping and taxes calculated at checkout.
          </p>
          <button
            onClick={() => setCheckoutState('details')}
            className="flex w-full items-center justify-center rounded-md bg-gray-900 dark:bg-white px-6 py-3.5 text-base font-medium text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Checkout
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
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
              value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} 
            />
            <input 
              type="text" 
              placeholder="Address Line 1" 
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
              value={address.addressLine1} onChange={e => setAddress({...address, addressLine1: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="City" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
                value={address.city} onChange={e => setAddress({...address, city: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Zip Code" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-gray-900" 
                value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" /> Payment Method
          </h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
            <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
            <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mb-6">
          <p>Total</p>
          <p>${subtotal.toFixed(2)}</p>
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

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 mb-6">
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
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white dark:bg-gray-900 shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
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

            {checkoutState === 'loading' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
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
