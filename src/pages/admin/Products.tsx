
import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../../services/catalogService';
import { Product } from '../../types';
import { motion } from 'motion/react';
import { Loader2, Plus, Trash2, Package } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const prods = await getProducts(true);
      setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;
    try {
      await deleteProduct(product);
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert('Failed to delete product');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time database sync active</p>
        </div>
        <button 
          className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : products.length === 0 ? (
           <div className="p-12 text-center">
             <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">No products found in database</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Package className="w-4 h-4 text-gray-400" /></div>}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{p.category}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.inventory! > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.inventory! > 0 ? `${p.inventory} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(p)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
