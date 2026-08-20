import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getProducts } from '../../services/catalogService';
import { restockProduct } from '../../services/adminService';
import { TableControls } from '../../components/admin/TableControls';
import { AlertTriangle, Package, Loader2 } from 'lucide-react';
import { Product } from '../../types';

export default function LowStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const STOCK_THRESHOLD = 15;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const allProducts = await getProducts(true); // force refresh
      const lowStockProducts = allProducts
        .filter(p => p.inventoryCount !== undefined && p.inventoryCount < (p.lowStockThreshold || 15))
        .sort((a, b) => (a.inventoryCount || 0) - (b.inventoryCount || 0));
      setProducts(lowStockProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleRestock = async (product: Product) => {
    if (!product.variantId) return;
    setRestockingId(product.id);
    
    const success = await restockProduct(product.variantId, 50); // Add 50 units
    if (success) {
      // Re-fetch or locally update
      setProducts(prev => prev.filter(p => p.id !== product.id));
    }
    
    setRestockingId(null);
  };

  const processedProducts = products.filter(p => 
    searchTerm === '' || 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const paginatedProducts = processedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6 flex items-center space-x-3">
        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
          <p className="text-gray-500 text-sm mt-1">Products with inventory below their configured alert thresholds.</p>
        </div>
      </div>

      <TableControls
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        searchPlaceholder="Search by Product Name or SKU..."
        dateFilter="all"
        onDateFilterChange={() => {}}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={processedProducts.length}
      />

      {loading ? (
         <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           {paginatedProducts.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Inventory Healthy</h3>
                <p className="text-gray-500 text-sm">All products are currently well-stocked above their alert thresholds.</p>
             </div>
           ) : (
             <table className="w-full text-left text-sm">
               <thead>
                 <tr className="border-b border-gray-100 text-gray-400 bg-gray-50">
                   <th className="px-6 py-4 font-medium">Product Name</th>
                   <th className="px-6 py-4 font-medium">SKU</th>
                   <th className="px-6 py-4 font-medium">Current Stock</th>
                   <th className="px-6 py-4 font-medium text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {paginatedProducts.map(product => (
                   <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                       <div className="flex items-center space-x-3">
                         {product.image && (
                           <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                         )}
                         <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 font-mono text-gray-500">{product.sku || 'N/A'}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                         (product.inventoryCount || 0) === 0 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                       }`}>
                         {product.inventoryCount || 0} / {product.lowStockThreshold || 15}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleRestock(product)}
                         disabled={restockingId === product.id}
                         className="bg-gray-900 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center justify-center ml-auto min-w-[100px]"
                       >
                         {restockingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Restock +50'}
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      )}
    </motion.div>
  );
}
