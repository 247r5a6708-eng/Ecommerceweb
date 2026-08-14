import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { auth } from '../lib/firebase';
import * as firestoreService from '../lib/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Clock } from 'lucide-react';
import { Order, CartItem } from '../types';

export default function ReturnsPage() {
  const { orders } = useUser();
  const navigate = useNavigate();
  const [returns, setReturns] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      firestoreService.getUserReturns(auth.currentUser.uid).then(setReturns);
    }
  }, [auth.currentUser]);

  if (!auth.currentUser) {
    return <div className="min-h-screen pt-32 flex flex-col items-center"><p>Please sign in to view returns.</p><button onClick={() => navigate('/')} className="mt-4 text-blue-500">Go Home</button></div>;
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedItem || !reason) return;
    setIsSubmitting(true);
    
    const returnReq = {
      id: `RET-${crypto.randomUUID().split("-")[0].toUpperCase()}`,
      orderId: selectedOrder.id,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemImage: selectedItem.image,
      sku: selectedItem.sku,
      reason,
      status: 'Pending',
      date: new Date().toISOString()
    };
    
    await firestoreService.createReturnRequest(auth.currentUser.uid, returnReq);
    setReturns([returnReq, ...returns]);
    setSelectedOrder(null);
    setSelectedItem(null);
    setReason('');
    setIsSubmitting(false);
  };

  const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'shipped' || o.status === 'processing'); // in a real app, only 'delivered' within 30 days

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/')} className="mb-8 flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Returns & Exchanges</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white dark:bg-[#121216] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
            <h2 className="text-xl font-bold mb-6">Initiate a Return</h2>
            <form onSubmit={handleReturnSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Order</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3"
                  onChange={e => setSelectedOrder(orders.find(o => o.id === e.target.value) || null)}
                  value={selectedOrder?.id || ''}
                >
                  <option value="">-- Choose an Order --</option>
                  {deliveredOrders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {new Date(o.date).toLocaleDateString()}</option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Item</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3"
                    onChange={e => setSelectedItem(selectedOrder.items.find(i => i.id === e.target.value) || null)}
                    value={selectedItem?.id || ''}
                  >
                    <option value="">-- Choose an Item --</option>
                    {selectedOrder.items.map(i => (
                      <option key={i.id} value={i.id}>{i.name} {i.sku ? `(SKU: ${i.sku})` : ''} - Qty: {i.quantity}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedItem && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Return</label>
                  <textarea 
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 min-h-[100px]"
                    placeholder="Please explain why you are returning this item..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={!selectedOrder || !selectedItem || !reason || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </form>
          </div>

          {/* History */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Your Returns History</h2>
            {returns.length === 0 ? (
              <p className="text-gray-500">You have no return requests.</p>
            ) : (
              <div className="space-y-4">
                {returns.map(ret => (
                  <div key={ret.id} className="bg-white dark:bg-[#121216] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-start space-x-4">
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      {ret.status === 'Pending' ? <Clock className="text-yellow-500" /> : <CheckCircle className="text-green-500" />}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">{ret.id}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${ret.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {ret.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ret.itemName}</p>
                      {ret.sku && <p className="text-xs text-gray-400 mt-1">SKU: {ret.sku}</p>}
                      <p className="text-xs text-gray-400 mt-2">Requested on {new Date(ret.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
