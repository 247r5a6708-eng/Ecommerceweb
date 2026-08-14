import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { getProducts } from '../services/catalogService';

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
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
        
        const uniqueCategories = ['All', ...Array.from(new Set(data.map(p => p.category).filter(Boolean)))];
        const uniqueTypes = ['All', ...Array.from(new Set(data.map(p => p.type).filter(Boolean)))];
        setCategories(uniqueCategories);
        setProductTypes(uniqueTypes);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
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
