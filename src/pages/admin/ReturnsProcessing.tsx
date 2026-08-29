import React, { useState } from 'react';
import { Package, RotateCcw, CheckCircle, Clock, AlertCircle, IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'refunded' | 'rejected';
  amount: number;
}

export default function ReturnsProcessing() {
  const [returns, setReturns] = useState<ReturnRequest[]>([
    {
      id: 'RMA-1029',
      orderId: 'ORD-9982',
      customerName: 'Eleanor Shellstrop',
      productName: 'Oversized Linen Shirt',
      reason: 'Size too large',
      date: '2024-05-14',
      status: 'pending',
      amount: 4500
    },
    {
      id: 'RMA-1028',
      orderId: 'ORD-9950',
      customerName: 'Chidi Anagonye',
      productName: 'Leather Loafers',
      reason: 'Defective item',
      date: '2024-05-12',
      status: 'approved',
      amount: 12000
    }
  ]);

  const handleUpdateStatus = (id: string, newStatus: ReturnRequest['status']) => {
    setReturns(returns.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.success(`RMA ${newStatus}`);
  };

  const handleRefund = (id: string) => {
    setReturns(returns.map(r => r.id === id ? { ...r, status: 'refunded' } : r));
    toast.success('Refund processed successfully');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Returns & Refunds</h1>
          <p className="text-sm text-gray-500 mt-1">Manage RMAs, restock inventory, and issue refunds.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">RMA ID / Order</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Customer & Item</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Reason</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Amount</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{req.id}</div>
                    <div className="text-gray-500 text-xs font-mono mt-1">{req.orderId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.customerName}</div>
                    <div className="text-gray-500">{req.productName}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {req.reason}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ₹{req.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit ${
                      req.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      req.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                      req.status === 'refunded' ? 'bg-green-50 text-green-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {req.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {req.status === 'approved' && <RotateCcw className="w-3 h-3 mr-1" />}
                      {req.status === 'refunded' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {req.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                      <span className="capitalize">{req.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(req.id, 'approved')} className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs transition-colors">
                            Approve Return
                          </button>
                          <button onClick={() => handleUpdateStatus(req.id, 'rejected')} className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-red-600 rounded-lg font-bold text-xs transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === 'approved' && (
                        <button onClick={() => handleRefund(req.id)} className="px-3 py-1.5 bg-gray-900 text-white hover:bg-black rounded-lg font-bold text-xs transition-colors flex items-center">
                          <IndianRupee className="w-3 h-3 mr-1" /> Issue Refund
                        </button>
                      )}
                      {(req.status === 'refunded' || req.status === 'rejected') && (
                        <span className="text-xs text-gray-400 italic">No further actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No return requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
