import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getRecentOrders } from '../../services/adminService';
import { TableControls, filterByDateRange } from '../../components/admin/TableControls';

export default function Invoices() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const o = await getRecentOrders(100, 'all'); 
        // Note: For a real invoice system, we'd query an invoices collection, 
        // but orders serve as a proxy for this example
        setOrders(o);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const processedOrders = filterByDateRange(
    orders.filter(o => 
      searchTerm === '' || 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    'createdAt',
    dateFilter
  );

  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
  const paginatedOrders = processedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Invoices System</h2>
        <p className="text-gray-500 text-sm mt-1">Manage, download, and track billing invoices.</p>
      </div>

      <TableControls
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        searchPlaceholder="Search by Invoice/Order ID or Email..."
        dateFilter={dateFilter}
        onDateFilterChange={(val) => { setDateFilter(val); setCurrentPage(1); }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={processedOrders.length}
      />

      {loading ? (
         <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           {paginatedOrders.length === 0 ? (
             <p className="p-6 text-gray-500 text-sm text-center">No invoices found for this criteria.</p>
           ) : (
             <table className="w-full text-left text-sm">
               <thead>
                 <tr className="border-b border-gray-100 text-gray-400 bg-gray-50">
                   <th className="px-6 py-4 font-medium">Invoice #</th>
                   <th className="px-6 py-4 font-medium">Customer</th>
                   <th className="px-6 py-4 font-medium">Status</th>
                   <th className="px-6 py-4 font-medium text-right">Amount</th>
                   <th className="px-6 py-4 font-medium text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {paginatedOrders.map(order => (
                   <tr key={order.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 font-mono text-gray-900">INV-{order.id}</td>
                     <td className="px-6 py-4 text-gray-500">{order.customerEmail || 'Guest'}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${order.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                         {order.status === 'cancelled' ? 'Void' : 'Paid'}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-gray-900 font-bold text-right">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</td>
                     <td className="px-6 py-4 text-right">
                       <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Download</button>
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
