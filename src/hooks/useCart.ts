import { useState, useCallback, useEffect } from 'react';
import { CartItem, Product } from '../types';
import * as firestoreService from '../lib/firestore';

export function useCart(firebaseUser: any) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);

  useEffect(() => {
    if (firebaseUser) {
      setIsCartLoading(true);
      firestoreService.getUserCart(firebaseUser.uid).then(items => {
        if (items) setCartItems(items);
        setIsCartLoading(false);
      });
    } else {
      setCartItems([]);
      setIsCartLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (firebaseUser && !isCartLoading) {
      firestoreService.saveUserCart(firebaseUser.uid, cartItems);
    }
  }, [cartItems, firebaseUser, isCartLoading]);

  const handleAddToCart = useCallback((product: Product & { selectedSize?: string }) => {
    let wasNew = false;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === product.selectedSize);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      wasNew = true;
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    return wasNew;
  }, []);

  const handleUpdateQuantity = useCallback((id: string, quantity: number, selectedSize?: string) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
    } else {
      setCartItems(prev => prev.map(item =>
        item.id === id && item.selectedSize === selectedSize ? { ...item, quantity } : item
      ));
    }
  }, []);

  const handleRemoveItem = useCallback((id: string, selectedSize?: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    isCartLoading,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    setCartItems
  };
}
