
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { getDashboardMetrics, getRecentOrders, getRecentActivity } from '../../services/adminService';
import { IndianRupee, ShoppingCart, Users, Package, AlertTriangle, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TableControls, filterByDateRange } from '../../components/admin/TableControls';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [allRecentOrders, setAllRecentOrders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Table Controls State
  const [orderFilter, setOrderFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch a large pool of orders to filter locally for the dashboard
        const [m, orders, acts] = await Promise.all([
          getDashboardMetrics(),
          getRecentOrders(50, 'all'), 
          getRecentActivity()
        ]);
        setMetrics(m);
        setAllRecentOrders(orders);
        setActivities(acts);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    // Set up real-time listener on users collection
    // Whenever a user is added or updated (e.g., when they place an order, as lastActivity is updated), 
    // we reload the dashboard metrics.
    const unsubscribe = onSnapshot(collection(db, 'users'), () => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  // Process Orders for Dashboard
  const processedOrders = useMemo(() => {
    let result = allRecentOrders;
    
    if (orderFilter !== 'all') {
      result = result.filter(o => 
        (o.status && o.status.toLowerCase() === orderFilter.toLowerCase()) ||
        (orderFilter === 'pending' && !o.status)
      );
    }
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(lower) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(lower))
      );
    }
    
    result = filterByDateRange(result, 'createdAt', dateFilter);
    if (result.length === 0 && allRecentOrders.length > 0 && allRecentOrders[0].date) {
        result = filterByDateRange(result, 'date', dateFilter);
    }
    
    return result;
  }, [allRecentOrders, orderFilter, searchTerm, dateFilter]);

  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedOrders = processedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderFilter(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  }

  const hasData = metrics.totalOrders > 0 || metrics.totalCustomers > 0 || metrics.totalProducts > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
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
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-4">
            <h3 className="font-bold text-gray-900 font-sans">Recent Orders</h3>
            <div className="flex flex-wrap items-center gap-3">
              <select 
                value={orderFilter}
                onChange={handleStatusFilterChange}
                className="text-xs font-medium border-gray-200 rounded-lg text-gray-600 focus:ring-gray-900 focus:border-gray-900 py-1.5 pl-3 pr-8 shadow-sm transition-colors cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100">
            <TableControls
              searchTerm={searchTerm}
              onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
              searchPlaceholder="Search Orders..."
              dateFilter={dateFilter}
              onDateFilterChange={(val) => { setDateFilter(val); setCurrentPage(1); }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={processedOrders.length}
            />
          </div>
          
          <div className="relative flex-1">
            
            {paginatedOrders.length === 0 ? (
              <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No orders found for this criteria</p>
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
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                    <td className="px-6 py-4">{order.customerEmail || 'Guest'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium uppercase tracking-wider">{order.status || 'Pending'}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 font-sans flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-600" /> 
              Activity Feed
            </h3>
          </div>
          <div className="p-6 overflow-y-auto max-h-[500px]">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">No recent activity</p>
            ) : (
              <div className="space-y-6">
                {activities.map((activity, idx) => (
                  <div key={`${activity.id}-${idx}`} className="flex gap-4 relative">
                    {idx !== activities.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      activity.type === 'signup' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'signup' ? <Users className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
