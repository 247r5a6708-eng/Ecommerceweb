import { useState, useCallback, useEffect } from 'react';
import { Order, CartItem, Address } from '../types';
import * as firestoreService from '../lib/firestore';

export function useOrders(firebaseUser: any, userProfile: any) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (firebaseUser) {
      firestoreService.getUserOrders(firebaseUser.uid).then(setOrders);
    } else {
      setOrders([]);
    }
  }, [firebaseUser]);

  const handlePlaceOrder = useCallback(async (
    cartItems: CartItem[],
    shippingAddress: Address,
    isGiftWrapped: boolean,
    giftMessage: string,
    giftWrapFee: number
  ): Promise<Order | null> => {
    if (!firebaseUser) return null;

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 100 ? 0 : 15;
    const total = subtotal + tax + shipping + giftWrapFee;

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items: cartItems.map(item => ({...item})),
      total,
      subtotal,
      tax,
      shipping,
      status: 'processing',
      address: shippingAddress,
      isGiftWrapped,
      giftMessage,
      giftWrapFee
    };

    setOrders(prev => [newOrder, ...prev]);
    await firestoreService.saveOrder(firebaseUser.uid, newOrder);
    return newOrder;
  }, [firebaseUser]);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    if (!firebaseUser) return;
    
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
    await firestoreService.updateOrderState(firebaseUser.uid, orderId, 'cancelled');
  }, [firebaseUser]);

  return {
    orders,
    handlePlaceOrder,
    handleCancelOrder,
    setOrders
  };
}
