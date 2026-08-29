import React, { useState } from 'react';
import { ShoppingCart, Mail, Clock, ArrowUpRight, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AbandonedCart {
  id: string;
  customerEmail: string;
  itemsCount: number;
  totalValue: number;
  lastActive: string;
  status: 'pending' | 'recovered' | 'lost';
  recoverySent: boolean;
}

export default function AbandonedCarts() {
  const [carts, setCarts] = useState<AbandonedCart[]>([
    {
      id: 'cart-8123',
      customerEmail: 'eleanor@example.com',
      itemsCount: 3,
      totalValue: 8500,
      lastActive: '2 hours ago',
      status: 'pending',
      recoverySent: false
    },
    {
      id: 'cart-8092',
      customerEmail: 'chidi@example.com',
      itemsCount: 1,
      totalValue: 1200,
      lastActive: '1 day ago',
      status: 'recovered',
      recoverySent: true
    },
    {
      id: 'cart-7944',
      customerEmail: 'tahani@example.com',
      itemsCount: 5,
      totalValue: 24000,
      lastActive: '3 days ago',
      status: 'lost',
      recoverySent: true
    }
  ]);

  const sendRecoveryEmail = (id: string) => {
    setCarts(carts.map(c => c.id === id ? { ...c, recoverySent: true } : c));
    toast.success('Recovery email sent successfully!');
  };

  const metrics = {
    recoveryRate: '24%',
    recoveredRevenue: '₹34,500',
    pendingCarts: carts.filter(c => c.status === 'pending').length
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Abandoned Carts</h1>
          <p className="text-sm text-gray-500 mt-1">Track uncompleted checkouts and recover lost sales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Recovery Rate</p>
            <p className="text-3xl font-black text-gray-900">{metrics.recoveryRate}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Recovered Revenue</p>
            <p className="text-3xl font-black text-gray-900">{metrics.recoveredRevenue}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pending Carts</p>
            <p className="text-3xl font-black text-gray-900">{metrics.pendingCarts}</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Customer Email</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Cart Value</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Last Active</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {carts.map((cart) => (
                <tr key={cart.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{cart.customerEmail}</div>
                    <div className="text-gray-500 text-xs mt-1">{cart.itemsCount} items</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ₹{cart.totalValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{cart.lastActive}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit ${
                      cart.status === 'pending' ? 'bg-orange-50 text-orange-700' :
                      cart.status === 'recovered' ? 'bg-green-50 text-green-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      <span className="capitalize">{cart.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {cart.status === 'pending' && !cart.recoverySent ? (
                      <button 
                        onClick={() => sendRecoveryEmail(cart.id)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors inline-flex items-center"
                      >
                        <Mail className="w-3 h-3 mr-1.5" /> Send Reminder
                      </button>
                    ) : cart.status === 'pending' && cart.recoverySent ? (
                      <span className="text-xs text-gray-400 italic">Reminder sent</span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
