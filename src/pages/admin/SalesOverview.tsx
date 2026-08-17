import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getDashboardMetrics, getRecentOrders, getChartData } from '../../services/adminService';
import { TableControls, filterByDateRange } from '../../components/admin/TableControls';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function SalesOverview() {
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const [m, o, cData] = await Promise.all([
          getDashboardMetrics(),
          getRecentOrders(100, 'all'), // Fetch a large chunk for demonstration
          getChartData()
        ]);
        setMetrics(m);
        setOrders(o);
        setChartData(cData);
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
      o.id.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-2xl font-bold text-gray-900">Sales Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Comprehensive view of your store's sales performance.</p>
      </div>

      <TableControls
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        searchPlaceholder="Search by Order ID..."
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
           <h3 className="text-lg font-bold mb-4">Sales Performance</h3>
           <div className="h-72 bg-white rounded-xl border border-gray-100 p-4">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart
                 data={chartData}
                 margin={{
                   top: 10,
                   right: 10,
                   left: 0,
                   bottom: 0,
                 }}
               >
                 <defs>
                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#111827" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                 <XAxis 
                   dataKey="displayDate" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 12, fill: '#6B7280' }} 
                   dy={10}
                 />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 12, fill: '#6B7280' }}
                   tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                   dx={-10}
                 />
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                   labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                 />
                 <Area 
                   type="monotone" 
                   dataKey="revenue" 
                   stroke="#111827" 
                   strokeWidth={2}
                   fillOpacity={1} 
                   fill="url(#colorRevenue)" 
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
           
           <h3 className="text-lg font-bold mt-8 mb-4">Filtered Orders</h3>
           {paginatedOrders.length === 0 ? (
             <p className="text-gray-500 text-sm">No sales found for this period.</p>
           ) : (
             <table className="w-full text-left text-sm">
               <thead>
                 <tr className="border-b border-gray-100 text-gray-400">
                   <th className="px-4 py-3 font-medium">Order ID</th>
                   <th className="px-4 py-3 font-medium">Status</th>
                   <th className="px-4 py-3 font-medium text-right">Amount</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {paginatedOrders.map(order => (
                   <tr key={order.id} className="hover:bg-gray-50">
                     <td className="px-4 py-3 font-mono">{order.id}</td>
                     <td className="px-4 py-3">{order.status || 'Pending'}</td>
                     <td className="px-4 py-3 text-right">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</td>
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
