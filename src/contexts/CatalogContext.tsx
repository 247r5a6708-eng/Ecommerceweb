import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { getProducts } from '../services/catalogService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CatalogContextType {
  products: Product[];
  isLoading: boolean;
  categories: string[];
  productTypes: string[];
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [productTypes, setProductTypes] = useState<string[]>(['All']);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async (force = false) => {
      if (force === false) setIsLoading(true);
      try {
        const data = await getProducts(force);
        if (!isMounted) return;
        setProducts(data);
        
        const uniqueCategories = ['All', ...Array.from(new Set(data.map(p => p.category).filter(Boolean)))];
        const uniqueTypes = ['All', ...Array.from(new Set(data.map(p => p.type).filter(Boolean)))];
        setCategories(uniqueCategories);
        setProductTypes(uniqueTypes);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchProducts();

    // Real-time stock listener on productVariants
    const unsubscribe = onSnapshot(collection(db, 'productVariants'), (snapshot) => {
      // Skip the initial trigger since we do a full fetch above
      if (!snapshot.metadata.hasPendingWrites) {
         // Debounce or just call it directly (we fetch silently)
         fetchProducts(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <CatalogContext.Provider value={{ products, isLoading, categories, productTypes }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
