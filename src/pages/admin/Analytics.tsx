import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getDashboardMetrics, getChartData } from '../../services/adminService';
import { TableControls } from '../../components/admin/TableControls';
import { Download } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Analytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [m, cData] = await Promise.all([
          getDashboardMetrics(),
          getChartData()
        ]);
        setMetrics(m);
        setChartData(cData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const averageOrderValue = metrics?.totalOrders > 0 
    ? (metrics.totalRevenue / metrics.totalOrders) 
    : 0;

  const handleExportCSV = () => {
    if (!chartData || chartData.length === 0) return;
    
    // Create CSV header
    const headers = ['Date', 'Display Date', 'Orders', 'Revenue'];
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(','),
      ...chartData.map(row => [
        row.date,
        `"${row.displayDate}"`,
        row.orders,
        row.revenue
      ].join(','))
    ].join('\n');
    
    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-500 text-sm mt-1">Deep dive into store metrics and user behavior.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={loading || chartData.length === 0}
          className="bg-gray-900 hover:bg-black text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <TableControls
        searchTerm={""}
        onSearchChange={() => {}}
        searchPlaceholder="Analytics search not applicable"
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        itemsPerPage={10}
        totalItems={0}
      />

      {loading ? (
         <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">
                {metrics?.totalRevenue > 0 ? `₹${metrics.totalRevenue.toLocaleString('en-IN')}` : '₹0'}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">{metrics?.totalCustomers || 0}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Average Order Value</p>
              <h3 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">
                ₹{averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-4">Revenue Trend (30 Days)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-4">Daily Orders (30 Days)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#F3F4F6' }}
                    />
                    <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
