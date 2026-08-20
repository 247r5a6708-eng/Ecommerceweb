import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Loader2, Search, Clock, User, FileText, ArrowRight } from 'lucide-react';
import { getAuditLogs } from '../../services/adminService';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    (log.actionType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.adminEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">Track all administrative actions and system modifications.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by action, admin, or details..." 
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
                  <th className="p-4 w-48">Timestamp</th>
                  <th className="p-4 w-56">Admin</th>
                  <th className="p-4 w-48">Action Type</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={log.adminEmail}>
                          {log.adminEmail}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-bold tracking-wider">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800">{log.details}</span>
                        <span className="text-xs text-gray-400 font-mono mt-0.5 flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Entity ID: {log.entityId}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-sm text-gray-500">
                      <Shield className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      No audit logs found matching your criteria.
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
