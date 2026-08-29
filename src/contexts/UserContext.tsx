import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, Order, WalletProduct, UserProfileData, Review, WishlistCollection } from '../types';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import * as firestoreService from '../lib/firestore';

interface UserContextType {
  wishlistItems: string[];
  setWishlistItems: React.Dispatch<React.SetStateAction<string[]>>;
  wishlistCollections: WishlistCollection[];
  setWishlistCollections: React.Dispatch<React.SetStateAction<WishlistCollection[]>>;
  priceAlerts: Record<string, number>;
  setPriceAlerts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  walletItems: WalletProduct[];
  setWalletItems: React.Dispatch<React.SetStateAction<WalletProduct[]>>;
  userProfile: UserProfileData;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  viewedProducts: string[];
  addViewedProduct: (productId: string) => void;
}

const defaultProfile: UserProfileData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistCollections, setWishlistCollections] = useState<WishlistCollection[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [walletItems, setWalletItems] = useState<WalletProduct[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileData>(defaultProfile);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewedProducts, setViewedProducts] = useState<string[]>(() => {
    const saved = localStorage.getItem('viewedProducts');
    return saved ? JSON.parse(saved) : [];
  });
  const isInitialLoad = useRef(true);

  const addViewedProduct = (productId: string) => {
    setViewedProducts(prev => {
      const updated = [productId, ...prev.filter(id => id !== productId)].slice(0, 10);
      localStorage.setItem('viewedProducts', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      isInitialLoad.current = true;
      if (user) {
        // Load data from subcollections and main docs properly
        const [profile, ordersData, walletData, wishlistData] = await Promise.all([
          firestoreService.getUserProfile(user.uid),
          firestoreService.getUserOrders(user.uid),
          firestoreService.getUserWallet(user.uid),
          firestoreService.getUserWishlist(user.uid)
        ]);

        if (profile) {
          setUserProfile({
            ...profile,
            email: user.email || profile.email || '',
            name: user.displayName || profile.name || user.email?.split('@')[0] || 'Lumina Member'
          });
        }
        else {
          const newProfile = { 
            ...defaultProfile, 
            email: user.email || '', 
            name: user.displayName || user.email?.split('@')[0] || 'Lumina Member' 
          };
          setUserProfile(newProfile);
          // Immediately create the user in Firestore so they appear in Admin
          firestoreService.updateUserProfile(user.uid, newProfile);
        }
        
        setOrders(ordersData || []);
        setWalletItems(walletData || []);
        setWishlistItems(wishlistData || []);
        
        // Wishlist collections & price alerts we can keep on profile or a specific data doc
        // Assuming we need to load them from somewhere, let's just initialize empty if missing
      } else {
        setWishlistItems([]);
        setWishlistCollections([]);
        setPriceAlerts({});
        setOrders([]);
        setWalletItems([]);
        setUserProfile(defaultProfile);
      }
      setTimeout(() => { isInitialLoad.current = false; }, 1000);
    });
    return () => unsubscribe();
  }, []);

  // Save changes to Firestore
  useEffect(() => {
    if (auth.currentUser && !isInitialLoad.current) {
      firestoreService.saveUserWishlist(auth.currentUser.uid, wishlistItems);
    }
  }, [wishlistItems]);

  useEffect(() => {
    if (auth.currentUser && !isInitialLoad.current) {
      firestoreService.updateUserProfile(auth.currentUser.uid, userProfile);
    }
  }, [userProfile]);

  return (
    <UserContext.Provider value={{
      wishlistItems, setWishlistItems,
      wishlistCollections, setWishlistCollections,
      priceAlerts, setPriceAlerts,
      orders, setOrders,
      walletItems, setWalletItems,
      userProfile, setUserProfile,
      reviews, setReviews,
      viewedProducts, addViewedProduct
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
