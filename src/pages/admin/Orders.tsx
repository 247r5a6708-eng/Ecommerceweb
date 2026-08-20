import React, { useState, useEffect, useMemo } from 'react';
import { getAllOrders, updateOrderStatus, updateOrderReturnReason } from '../../services/adminService';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShoppingCart, FileText, ChevronRight, X, User, GripVertical, AlertTriangle } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Drag and drop state
  const [draggedOrder, setDraggedOrder] = useState<any | null>(null);
  const [dragOverCol, setDragOverCol] = useState<OrderStatus | null>(null);

  // For Returns Management
  const [returnReason, setReturnReason] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

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
    
    const unsubscribe = onSnapshot(collection(db, 'users'), () => {
      loadOrders();
    });
    
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (userId: string, orderId: string, newStatus: OrderStatus) => {
    if (!userId) {
      alert("Cannot update order without a user ID.");
      return;
    }
    const success = await updateOrderStatus(userId, orderId, newStatus);
    if (success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert("Failed to update status");
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedOrder?.userId) return;
    setIsProcessingRefund(true);
    const success = await updateOrderReturnReason(selectedOrder.userId, selectedOrder.id, returnReason);
    await handleStatusChange(selectedOrder.userId, selectedOrder.id, 'returned');
    setIsProcessingRefund(false);
    setSelectedOrder((prev: any) => ({...prev, returnReason, status: 'returned'}));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, order: any) => {
    setDraggedOrder(order);
    // Needed for Firefox
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', order.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, colId: OrderStatus) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setDragOverCol(colId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, statusId: OrderStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedOrder && draggedOrder.status !== statusId) {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === draggedOrder.id ? { ...o, status: statusId } : o));
      // Database sync
      const success = await updateOrderStatus(draggedOrder.userId, draggedOrder.id, statusId);
      if (!success) {
        // Revert on fail
        setOrders(prev => prev.map(o => o.id === draggedOrder.id ? { ...o, status: draggedOrder.status } : o));
        toast.error("Failed to sync order status");
      } else {
        toast.success(`Order moved to ${statusId}`);
      }
    }
    setDraggedOrder(null);
  };

  const handleDragEnd = () => {
    setDraggedOrder(null);
    setDragOverCol(null);
  };

  const columns: { id: OrderStatus; title: string; color: string }[] = [
    { id: 'pending', title: 'Placed', color: 'bg-gray-100 border-gray-200 text-gray-800' },
    { id: 'processing', title: 'Processing', color: 'bg-blue-100 border-blue-200 text-blue-800' },
    { id: 'shipped', title: 'Shipped', color: 'bg-purple-100 border-purple-200 text-purple-800' },
    { id: 'delivered', title: 'Delivered', color: 'bg-green-100 border-green-200 text-green-800' },
    { id: 'returned', title: 'Returns', color: 'bg-red-100 border-red-200 text-red-800' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">Manage fulfillment stages via drag and drop.</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto flex gap-6 pb-6">
        {columns.map(col => {
          const colOrders = orders.filter(o => {
            const status = (o.status || 'pending').toLowerCase();
            return status === col.id;
          });
          
          return (
            <div 
              key={col.id} 
              className={`flex-shrink-0 w-80 flex flex-col rounded-2xl border-2 overflow-hidden transition-colors ${
                dragOverCol === col.id 
                  ? 'border-blue-400 bg-blue-50/30' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className={`p-4 border-b ${col.color} font-bold flex justify-between items-center shrink-0`}>
                <span className="uppercase tracking-wider text-xs">{col.title}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{colOrders.length}</span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {colOrders.map(order => (
                  <div 
                    key={order.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, order)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedOrder(order)} 
                    className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                      draggedOrder?.id === order.id ? 'opacity-50 border-blue-400 scale-95' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <span className="text-xs font-mono text-gray-500">#{order.id.slice(-6)}</span>
                      </div>
                      <span className="text-sm font-bold">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1 truncate ml-6">{order.customerName || order.customerEmail || 'Guest'}</div>
                    <div className="text-xs text-gray-500 mb-4 truncate ml-6">{order.items?.length || 0} items</div>
                    
                    {col.id === 'returned' && order.returnReason && (
                      <div className="mb-3 text-xs bg-red-50 text-red-700 p-2 rounded-lg flex items-start">
                         <AlertTriangle className="w-3 h-3 mr-1 shrink-0 mt-0.5" />
                         <span className="line-clamp-2">Reason: {order.returnReason}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 ml-6">
                       <select 
                         value={order.status || 'pending'} 
                         onChange={(e) => {
                           e.stopPropagation();
                           handleStatusChange(order.userId, order.id, e.target.value as OrderStatus);
                         }}
                         className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 w-full hover:border-gray-300 transition-colors cursor-pointer"
                       >
                         <option value="pending">Placed</option>
                         <option value="processing">Processing</option>
                         <option value="shipped">Shipped</option>
                         <option value="delivered">Delivered</option>
                         <option value="returned">Returned</option>
                       </select>
                    </div>
                  </div>
                ))}
                
                {colOrders.length === 0 && (
                   <div className="text-center text-xs text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-xl">
                     Drop here
                   </div>
                )}
              </div>
            </div>
          );
        })}
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
              className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                  <p className="text-xs font-mono text-gray-500">#{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => { setSelectedOrder(null); setReturnReason(''); }}
                  className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-100 rounded-xl p-4 bg-white">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedOrder.status || 'Pending'}</p>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4 bg-white">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                    <p className="font-medium text-gray-900">₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Returns Management */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                   <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center">
                     <AlertTriangle className="w-4 h-4 mr-2" /> Returns Management
                   </h4>
                   <p className="text-xs text-red-700 mb-4">Process a refund and record the reason for analytics (e.g. "Poor Fit").</p>
                   
                   {selectedOrder.status === 'returned' ? (
                     <div className="bg-white p-3 rounded-lg border border-red-100 text-sm">
                       <strong>Reason recorded:</strong> {selectedOrder.returnReason || 'Not specified'}
                     </div>
                   ) : (
                     <div className="space-y-3">
                       <input 
                         type="text"
                         placeholder="Reason (e.g. 'Poor Fit', 'Damaged')"
                         value={returnReason}
                         onChange={e => setReturnReason(e.target.value)}
                         className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm bg-white"
                       />
                       <button 
                         disabled={!returnReason || isProcessingRefund}
                         onClick={handleProcessRefund}
                         className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                       >
                         {isProcessingRefund ? 'Processing...' : 'Mark as Returned & Process Refund'}
                       </button>
                     </div>
                   )}
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-gray-400" /> Order Items
                  </h4>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex flex-col border border-gray-100 rounded-xl p-3">
                        <div className="flex items-center space-x-4">
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
                            {item.selectedSize && (
                              <p className="text-xs font-bold text-blue-600 mt-0.5">Size: {item.selectedSize}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                <button 
                  onClick={() => { setSelectedOrder(null); setReturnReason(''); }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
