import React, { useState, useEffect, useMemo } from 'react';
import { getAllOrders } from '../../services/adminService';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShoppingCart, FileText, ChevronRight, X, User } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TableControls, filterByDateRange } from '../../components/admin/TableControls';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const allOrders = await getAllOrders();
        setOrders(allOrders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time listener on users collection
    const unsubscribe = onSnapshot(collection(db, 'users'), () => {
      loadOrders();
    });

    return () => unsubscribe();
  }, []);

  // Filter and Paginate
  const processedOrders = useMemo(() => {
    let result = orders;
    
    // 1. Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(lower) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(lower))
      );
    }
    
    // 2. Date Filter
    result = filterByDateRange(result, 'createdAt', dateFilter);
    // If not createdAt, fallback to date
    if (result.length === 0 && orders.length > 0 && orders[0].date) {
        result = filterByDateRange(result, 'date', dateFilter);
    }
    
    return result;
  }, [orders, searchTerm, dateFilter]);

  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
  
  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedOrders = processedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time database sync active</p>
        </div>
      </div>
      
      <TableControls
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        searchPlaceholder="Search by Order ID or Email..."
        dateFilter={dateFilter}
        onDateFilterChange={(val) => { setDateFilter(val); setCurrentPage(1); }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={processedOrders.length}
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : orders.length === 0 ? (
           <div className="p-12 text-center">
             <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">No orders found in database</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map(order => {
                  const date = order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                    : (order.createdAt || 'N/A');
                  return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-xs font-medium text-gray-900">{order.id}</td>
                    <td className="p-4 text-sm text-gray-600">{date}</td>
                    <td className="p-4 text-sm text-gray-900">
                      <div>{order.customerEmail || 'Guest'}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone || ''}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium uppercase tracking-wider">
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 text-right">
                      ₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center"
                      >
                        Details <ChevronRight className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                  <p className="text-xs font-mono text-gray-500">{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status & Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-100 rounded-xl p-4 bg-white">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Status</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedOrder.status || 'Pending'}</p>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4 bg-white">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
                    <p className="font-medium text-gray-900">{selectedOrder.paymentMethod || 'Credit Card'}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" /> Customer Information
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="text-gray-500">Name</div>
                      <div className="font-medium text-gray-900">{selectedOrder.customerName || 'N/A'}</div>
                      <div className="text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{selectedOrder.customerEmail || 'N/A'}</div>
                      <div className="text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900">{selectedOrder.customerPhone || 'N/A'}</div>
                      <div className="text-gray-500">Address</div>
                      <div className="font-medium text-gray-900">
                        {selectedOrder.shippingAddress?.street}<br/>
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-gray-400" /> Order Items
                  </h4>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex items-center space-x-4 border border-gray-100 rounded-xl p-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><FileText className="w-6 h-6" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-500">₹{item.price.toLocaleString('en-IN')} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Totals */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mt-4 pt-4 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span>₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Download Invoice
                </button>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors">
                  Update Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
