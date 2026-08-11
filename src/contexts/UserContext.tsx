import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, WalletProduct, UserProfileData, Review } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface UserContextType {
  wishlistItems: string[];
  setWishlistItems: React.Dispatch<React.SetStateAction<string[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  walletItems: WalletProduct[];
  setWalletItems: React.Dispatch<React.SetStateAction<WalletProduct[]>>;
  userProfile: UserProfileData;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [walletItems, setWalletItems] = useState<WalletProduct[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileData>(defaultProfile);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWishlistItems(data.wishlistItems || []);
          setOrders(data.orders || []);
          setWalletItems(data.walletItems || []);
          setUserProfile(data.profile || { ...defaultProfile, email: user.email || '' });
        }
      } else {
        setWishlistItems([]);
        setOrders([]);
        setWalletItems([]);
        setUserProfile(defaultProfile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save changes to Firestore
  useEffect(() => {
    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), {
        wishlistItems,
        orders,
        walletItems,
        profile: userProfile
      }, { merge: true });
    }
  }, [wishlistItems, orders, walletItems, userProfile]);

  return (
    <UserContext.Provider value={{
      wishlistItems, setWishlistItems,
      orders, setOrders,
      walletItems, setWalletItems,
      userProfile, setUserProfile,
      reviews, setReviews
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
