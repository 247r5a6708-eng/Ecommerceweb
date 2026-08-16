import React, { useState, useEffect } from 'react';
import { getAllCustomers } from '../../services/adminService';
import { motion } from 'motion/react';
import { Loader2, Users, Search, ChevronRight, Mail, Calendar, MapPin } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const allCustomers = await getAllCustomers();
      setCustomers(allCustomers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time database sync active</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Name or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 w-64 md:w-80"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : customers.length === 0 ? (
           <div className="p-12 text-center">
             <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">No customers found in database</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map(customer => {
                  const date = customer.createdAt?.seconds 
                    ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString()
                    : (customer.createdAt || 'N/A');
                  return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : customer.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{customer.name || 'Anonymous User'}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {customer.id.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" /> {customer.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" /> {date}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${customer.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {customer.isAdmin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center">
                        View 360 <ChevronRight className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
