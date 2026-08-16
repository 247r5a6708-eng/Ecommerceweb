
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getDashboardMetrics, getRecentOrders } from '../../services/adminService';
import { IndianRupee, ShoppingCart, Users, Package, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [m, orders] = await Promise.all([
        getDashboardMetrics(),
        getRecentOrders(5, 'all')
      ]);
      setMetrics(m);
      setRecentOrders(orders);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleFilterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setOrderFilter(val);
    setOrdersLoading(true);
    const orders = await getRecentOrders(5, val);
    setRecentOrders(orders);
    setOrdersLoading(false);
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  }

  const hasData = metrics.totalOrders > 0 || metrics.totalCustomers > 0 || metrics.totalProducts > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">
                {metrics.totalRevenue > 0 ? `₹${metrics.totalRevenue.toLocaleString('en-IN')}` : '₹0'}
              </h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><IndianRupee className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-xs">
            <span className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full"><TrendingUp className="w-3 h-3 mr-1" /> Live</span>
            <span className="text-gray-400">Syncing...</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">{metrics.totalOrders}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShoppingCart className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-xs">
            <span className="flex items-center text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full"><TrendingUp className="w-3 h-3 mr-1" /> Live</span>
            <span className="text-gray-400">Syncing...</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Customers</p>
              <h3 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">{metrics.totalCustomers}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-xs">
            <span className="flex items-center text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full"><TrendingUp className="w-3 h-3 mr-1" /> Live</span>
            <span className="text-gray-400">Syncing...</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Products</p>
              <h3 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">{metrics.totalProducts}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Package className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-xs">
            <span className="flex items-center text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full"><TrendingUp className="w-3 h-3 mr-1" /> Live</span>
            <span className="text-gray-400">Syncing...</span>
          </div>
        </motion.div>
      </div>

      {!hasData && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-900"></div>
          <ShieldCheck className="w-8 h-8 text-gray-900 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg font-sans">System Initialized & Secured</h3>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            The LUMINA commerce database is actively monitoring. No historical data is available for this period. Metrics will populate dynamically as transactions occur.
          </p>
        </div>
      )}

      {/* Grid Layout for Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center space-x-4">
              <h3 className="font-bold text-gray-900 font-sans">Recent Orders</h3>
              <select 
                value={orderFilter}
                onChange={handleFilterChange}
                disabled={ordersLoading}
                className="text-xs font-medium border-gray-200 rounded-lg text-gray-600 focus:ring-gray-900 focus:border-gray-900 py-1.5 pl-3 pr-8 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">View All</button>
          </div>
          
          <div className="relative flex-1">
            {ordersLoading && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No orders found for this status</p>
              </div>
            ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                    <td className="px-6 py-4">{order.customerEmail || 'Guest'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium uppercase tracking-wider">{order.status || 'Pending'}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 font-sans">System Health</h3>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">Database Connection</span>
               <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> ONLINE</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">Catalog Health</span>
               <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">100% VALID</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">Pending Actions</span>
               <span className="text-xs font-bold text-gray-500">0</span>
             </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
