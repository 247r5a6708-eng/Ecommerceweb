import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getAllCustomers, getAllOrders } from '../../services/adminService';
import { Brain, User, ShoppingBag, AlertCircle, Activity, ChevronRight, Search, Loader2 } from 'lucide-react';

export default function CustomerInsights() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      try {
        const [customers, orders] = await Promise.all([
          getAllCustomers(),
          getAllOrders()
        ]);
        
        const generatedInsights = customers.map(customer => {
          const customerOrders = orders.filter((o: any) => o.userId === customer.id);
          const totalSpent = customerOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          
          let returnsCount = 0;
          let fitRelatedReturns = 0;
          let recentPurchaseDate = null;
          
          customerOrders.forEach((o: any) => {
             const orderDate = new Date(o.createdAt || o.date || 0);
             if (!recentPurchaseDate || orderDate > recentPurchaseDate) {
               recentPurchaseDate = orderDate;
             }
             if (o.status === 'returned') {
               returnsCount++;
               const reason = (o.returnReason || '').toLowerCase();
               if (reason.includes('fit') || reason.includes('size') || reason.includes('small') || reason.includes('large')) {
                 fitRelatedReturns++;
               }
             }
          });

          // Mock AI 'Fit Confidence' Score calculation based on data
          // Base score 80
          let fitConfidence = 80;
          
          // Boost if they have body measurements saved
          if (customer.bodyMeasurements) {
            fitConfidence += 15;
          }
          
          // Penalize for fit-related returns
          if (fitRelatedReturns > 0) {
            fitConfidence -= (fitRelatedReturns * 10);
          }
          
          // Cap between 0 and 100
          fitConfidence = Math.max(0, Math.min(100, fitConfidence));
          
          let confidenceLabel = 'Medium';
          let confidenceColor = 'text-yellow-600 bg-yellow-50';
          if (fitConfidence >= 85) {
            confidenceLabel = 'High';
            confidenceColor = 'text-green-600 bg-green-50';
          } else if (fitConfidence < 60) {
            confidenceLabel = 'Low';
            confidenceColor = 'text-red-600 bg-red-50';
          }

          return {
            id: customer.id,
            name: customer.fullName || customer.displayName || 'Unknown Customer',
            email: customer.email || 'No email',
            totalOrders: customerOrders.length,
            totalSpent,
            returnsCount,
            fitRelatedReturns,
            lastPurchase: recentPurchaseDate,
            fitConfidence,
            confidenceLabel,
            confidenceColor,
            hasMeasurements: !!customer.bodyMeasurements
          };
        });

        // Sort by total spent by default
        setInsights(generatedInsights.sort((a, b) => b.totalSpent - a.totalSpent));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadInsights();
  }, []);

  const filteredInsights = insights.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Customer Insights</h1>
          <p className="text-sm text-gray-500 mt-1">Analyze purchase activity and AI-predicted fit confidence scores.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 transition-shadow outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
             <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Purchase Activity</th>
                  <th className="p-4">Returns (Fit Issues)</th>
                  <th className="p-4">AI Fit Confidence</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInsights.map(insight => (
                  <tr key={insight.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{insight.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{insight.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">₹{insight.totalSpent.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-gray-500 flex items-center mt-1">
                          <ShoppingBag className="w-3 h-3 mr-1" />
                          {insight.totalOrders} order{insight.totalOrders !== 1 && 's'}
                        </span>
                        {insight.lastPurchase && (
                           <span className="text-[10px] text-gray-400 mt-0.5">Last: {insight.lastPurchase.toLocaleDateString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 font-medium">{insight.returnsCount} Total</span>
                        {insight.fitRelatedReturns > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {insight.fitRelatedReturns} Size Issues
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold tracking-wider ${insight.confidenceColor}`}>
                            <Brain className="w-3 h-3 mr-1" />
                            {insight.confidenceLabel}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{insight.fitConfidence}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${insight.fitConfidence >= 85 ? 'bg-green-500' : insight.fitConfidence < 60 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                            style={{ width: `${insight.fitConfidence}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {insight.hasMeasurements ? 'Profile & interactions synced' : 'Limited sizing data'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded hover:bg-gray-200">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInsights.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-sm text-gray-500">
                      <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
