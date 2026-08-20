import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getChartData, getAllOrders, getAuditLogs } from '../../services/adminService';
import { TrendingUp, BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [sizeSuccessRate, setSizeSuccessRate] = useState<any[]>([]);
  const [adminChangesData, setAdminChangesData] = useState<any[]>([]);
  
  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6B7280'];

  useEffect(() => {
    async function loadData() {
      try {
        const [cData, allOrders, auditLogs] = await Promise.all([
          getChartData(),
          getAllOrders(),
          getAuditLogs()
        ]);
        
        // Process audit logs for administrative changes frequency
        const now = new Date();
        const auditChartData: any[] = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          
          auditChartData.push({
            date: dateStr,
            displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            changes: 0
          });
        }
        
        auditLogs.forEach((log: any) => {
          let logDate;
          if (log.timestamp?.seconds) {
            logDate = new Date(log.timestamp.seconds * 1000);
          } else if (log.timestamp) {
            logDate = new Date(log.timestamp);
          } else {
            return;
          }
          
          const dateStr = logDate.toISOString().split('T')[0];
          const dataPoint = auditChartData.find(d => d.date === dateStr);
          if (dataPoint) {
            dataPoint.changes += 1;
          }
        });
        
        setAdminChangesData(auditChartData);
        
        // 1. Sales Trends (Directly from getChartData)
        setSalesData(cData.slice(-14)); // Last 14 days for cleaner visualization

        // 2. Product Performance (Aggregate from allOrders)
        const productCounts: Record<string, number> = {};
        allOrders.forEach(order => {
          if (order.status !== 'returned' && order.items) {
            order.items.forEach((item: any) => {
              if (item.name) {
                productCounts[item.name] = (productCounts[item.name] || 0) + (item.quantity || 1);
              }
            });
          }
        });
        
        const topProducts = Object.keys(productCounts)
          .map(name => ({ name, sales: productCounts[name] }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5); // Top 5 products
          
        setProductPerformance(topProducts.length > 0 ? topProducts : [
          { name: 'Classic T-Shirt', sales: 120 },
          { name: 'Slim Jeans', sales: 95 },
          { name: 'Running Sneakers', sales: 78 },
          { name: 'Winter Jacket', sales: 60 },
          { name: 'Cotton Socks', sales: 45 },
        ]); // Fallback if no real data

        // 3. AI Size Recommendation Success Rates
        let kept = 0;
        let returnedFit = 0;
        let returnedOther = 0;
        
        allOrders.forEach(order => {
          const itemCount = order.items?.length || 1;
          if (order.status === 'returned') {
            const reason = (order.returnReason || '').toLowerCase();
            if (reason.includes('fit') || reason.includes('size') || reason.includes('small') || reason.includes('large')) {
              returnedFit += itemCount;
            } else {
              returnedOther += itemCount;
            }
          } else if (order.status === 'delivered') {
            kept += itemCount;
          } else {
             // Assuming processing/shipped are 'kept' for now
            kept += itemCount;
          }
        });
        
        // If DB has barely any data, seed with realistic mock ratios to show the visualization
        if (kept + returnedFit + returnedOther < 5) {
          kept = 85;
          returnedFit = 10;
          returnedOther = 5;
        }

        setSizeSuccessRate([
          { name: 'Successful Fit (Kept)', value: kept },
          { name: 'Returned (Poor Fit)', value: returnedFit },
          { name: 'Returned (Other)', value: returnedOther },
        ]);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center flex h-full items-center justify-center"><TrendingUp className="animate-pulse mx-auto w-8 h-8 text-gray-400" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visualize sales trends, product performance, and AI sizing accuracy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto no-scrollbar pb-8">
        
        {/* Sales Trends */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sales Trends (14 Days)</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ stroke: '#F3F4F6', strokeWidth: 2 }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Administrative Changes Frequency */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center mb-6">
            <Activity className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Administrative Changes Frequency (14 Days)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adminChangesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ stroke: '#F3F4F6', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [value, 'Changes']}
                />
                <Line type="monotone" dataKey="changes" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center mb-6">
            <BarChart2 className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Top Performing Products</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformance} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151' }} width={90} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
                <Bar dataKey="sales" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Size Recommendation Success Rate */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center mb-6">
            <PieChartIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">AI Sizing Success Rate</h3>
          </div>
          <div className="h-64 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sizeSuccessRate}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sizeSuccessRate.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
