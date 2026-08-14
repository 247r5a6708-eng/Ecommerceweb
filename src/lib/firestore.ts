import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { UserProfileData, Order, WalletProduct, Product, Review } from '../types';

// USER PROFILE
export const getUserProfile = async (userId: string): Promise<UserProfileData | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: UserProfileData) => {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
  }
};

// ORDERS
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(collection(db, `users/${userId}/orders`));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ ...doc.data(), id: doc.id } as Order);
    });
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

export const saveOrder = async (userId: string, order: Order) => {
  try {
    const docRef = doc(db, `users/${userId}/orders`, order.id);
    await setDoc(docRef, order);
  } catch (error) {
    console.error("Error saving order:", error);
  }
};

export const updateOrderState = async (userId: string, orderId: string, status: Order['status']) => {
    try {
      const docRef = doc(db, `users/${userId}/orders`, orderId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error("Error updating order state:", error);
    }
}

// WISHLIST
export const getUserWishlist = async (userId: string): Promise<string[]> => {
  try {
    const docRef = doc(db, `users/${userId}/data`, 'wishlist');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};

export const saveUserWishlist = async (userId: string, items: string[]) => {
  try {
    const docRef = doc(db, `users/${userId}/data`, 'wishlist');
    await setDoc(docRef, { items });
  } catch (error) {
    console.error("Error saving wishlist:", error);
  }
};

// WALLET PRODUCTS
export const getUserWallet = async (userId: string): Promise<WalletProduct[]> => {
  try {
    const q = query(collection(db, `users/${userId}/owned-products`));
    const querySnapshot = await getDocs(q);
    const items: WalletProduct[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ ...doc.data(), id: doc.id } as WalletProduct);
    });
    return items;
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    return [];
  }
};

export const saveWalletProduct = async (userId: string, product: WalletProduct) => {
  try {
    const docRef = doc(db, `users/${userId}/owned-products`, product.id);
    await setDoc(docRef, product);
  } catch (error) {
    console.error("Error saving wallet product:", error);
  }
};

// REVIEWS
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ ...doc.data(), id: doc.id } as Review);
    });
    return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const saveReview = async (productId: string, review: Review & { userId: string }) => {
  try {
    const docRef = doc(db, 'reviews', review.id);
    await setDoc(docRef, { ...review, productId });
    // Also save in user's reviews
    const userReviewRef = doc(db, `users/${review.userId}/reviews`, review.id);
    await setDoc(userReviewRef, { ...review, productId });
  } catch (error) {
    console.error("Error saving review:", error);
  }
};


// CART
export const getUserCart = async (userId: string) => {
  try {
    const docRef = doc(db, `users/${userId}/data`, 'cart');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};

export const saveUserCart = async (userId: string, items: any[]) => {
  try {
    const docRef = doc(db, `users/${userId}/data`, 'cart');
    await setDoc(docRef, { items });
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};


export const getAllReviews = async (): Promise<Record<string, Review[]>> => {
  try {
    const q = query(collection(db, 'reviews'));
    const querySnapshot = await getDocs(q);
    const reviews: Record<string, Review[]> = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const productId = data.productId;
      if (productId) {
        if (!reviews[productId]) reviews[productId] = [];
        reviews[productId].push({ ...data, id: doc.id } as Review);
      }
    });
    return reviews;
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return {};
  }
};

// RETURNS
export const getUserReturns = async (userId: string) => {
  try {
    const q = query(collection(db, `users/${userId}/returns`));
    const querySnapshot = await getDocs(q);
    const returns: any[] = [];
    querySnapshot.forEach((doc) => {
      returns.push({ ...doc.data(), id: doc.id });
    });
    return returns;
  } catch (error) {
    console.error("Error fetching returns:", error);
    return [];
  }
};

export const createReturnRequest = async (userId: string, returnData: any) => {
  try {
    const docRef = doc(db, `users/${userId}/returns`, returnData.id);
    await setDoc(docRef, returnData);
  } catch (error) {
    console.error("Error saving return:", error);
  }
};
