import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllCustomers, getCustomerDetails } from '../../services/adminService';
import { TableControls, filterByDateRange } from '../../components/admin/TableControls';
import { X, User, ShoppingCart, TrendingUp, Mail, Phone, MapPin } from 'lucide-react';

export default function Customer360() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const c = await getAllCustomers();
        setCustomers(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCustomerClick = async (customerId: string) => {
    setDetailsLoading(true);
    // Open panel immediately with basic info
    const basicInfo = customers.find(c => c.id === customerId);
    setSelectedCustomer({ ...basicInfo, _loading: true });
    
    // Fetch deep details
    const details = await getCustomerDetails(customerId);
    if (details) {
      setSelectedCustomer(details);
    }
    setDetailsLoading(false);
  };

  const processedCustomers = filterByDateRange(
    customers.filter(c => 
      searchTerm === '' || 
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    'createdAt',
    dateFilter
  );

  const totalPages = Math.ceil(processedCustomers.length / itemsPerPage);
  const paginatedCustomers = processedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer 360</h2>
        <p className="text-gray-500 text-sm mt-1">Holistic view of customer interactions and lifetime value.</p>
      </div>

      <TableControls
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        searchPlaceholder="Search by Customer Name or Email..."
        dateFilter={dateFilter}
        onDateFilterChange={(val) => { setDateFilter(val); setCurrentPage(1); }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={processedCustomers.length}
      />

      {loading ? (
         <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           {paginatedCustomers.length === 0 ? (
             <p className="p-6 text-gray-500 text-sm text-center">No customers found for this criteria.</p>
           ) : (
             <table className="w-full text-left text-sm">
               <thead>
                 <tr className="border-b border-gray-100 text-gray-400 bg-gray-50">
                   <th className="px-6 py-4 font-medium">Customer Name</th>
                   <th className="px-6 py-4 font-medium">Email</th>
                   <th className="px-6 py-4 font-medium">Join Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {paginatedCustomers.map(customer => (
                   <tr 
                     key={customer.id} 
                     onClick={() => handleCustomerClick(customer.id)}
                     className="hover:bg-gray-50 cursor-pointer transition-colors"
                   >
                     <td className="px-6 py-4 font-medium text-gray-900">{customer.name || 'Anonymous'}</td>
                     <td className="px-6 py-4 text-gray-500">{customer.email || 'N/A'}</td>
                     <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {customer.createdAt?.seconds ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : (customer.createdAt || 'N/A')}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      )}

      {/* Customer 360 Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold">
                    {selectedCustomer.name?.charAt(0).toUpperCase() || selectedCustomer.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name || 'Anonymous User'}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-1.5" /> {selectedCustomer.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {selectedCustomer._loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    {/* Lifetime Value Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-100 rounded-xl p-4 bg-white flex items-center space-x-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lifetime Value</p>
                          <p className="text-xl font-bold text-gray-900">₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="border border-gray-100 rounded-xl p-4 bg-white flex items-center space-x-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                          <p className="text-xl font-bold text-gray-900">{selectedCustomer.orderCount || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Demographics */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" /> Customer Profile
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 text-sm grid grid-cols-2 gap-y-4">
                        <div>
                          <div className="text-gray-500 mb-1 text-xs uppercase font-bold tracking-wider">Phone</div>
                          <div className="font-medium text-gray-900 flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {selectedCustomer.phone || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1 text-xs uppercase font-bold tracking-wider">Joined</div>
                          <div className="font-medium text-gray-900 font-mono">
                            {selectedCustomer.createdAt?.seconds 
                              ? new Date(selectedCustomer.createdAt.seconds * 1000).toLocaleDateString() 
                              : (selectedCustomer.createdAt || 'N/A')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order History */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-2 text-gray-400" /> Order History
                      </h4>
                      
                      {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-gray-500 text-sm">No orders found for this customer.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedCustomer.orders.map((order: any) => {
                             const date = order.createdAt?.seconds 
                               ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                               : (order.createdAt || order.date || 'N/A');
                               
                             return (
                              <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors bg-white shadow-sm flex items-center justify-between">
                                <div>
                                  <div className="flex items-center space-x-3 mb-1">
                                    <span className="font-mono text-xs font-bold text-gray-900">{order.id}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      order.status === 'delivered' ? 'bg-green-50 text-green-700' : 
                                      order.status === 'cancelled' ? 'bg-red-50 text-red-700' : 
                                      'bg-blue-50 text-blue-700'
                                    }`}>
                                      {order.status || 'Pending'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">{date} • {order.items?.length || 0} items</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
