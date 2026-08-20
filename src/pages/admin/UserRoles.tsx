import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { Shield, Loader2, UserCog, Search, AlertTriangle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUser } from '../../contexts/UserContext';

export default function UserRoles() {
  const { userProfile } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const isAdmin = userProfile?.email === 'kumarrachith0@gmail.com' || userProfile?.role === 'admin';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users')); // Fetching all users to manage them
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) {
      toast.error('Only Admins can change roles.');
      return;
    }
    
    // Prevent removing super admin role
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate?.email === 'kumarrachith0@gmail.com') {
      toast.error('Cannot change super admin role.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        isAdmin: newRole === 'admin'
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || (u.role || 'customer') === filterRole;
    return matchesSearch && matchesRole;
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Shield className="w-16 h-16 text-red-100 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-gray-500 max-w-md">You do not have permission to view or manage user roles. This area is restricted to Administrators only.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Roles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage staff access and enforce role-based access control.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by email or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 transition-shadow outline-none"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 transition-shadow outline-none font-medium text-gray-700"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="manager">Managers</option>
            <option value="support">Support</option>
            <option value="customer">Customers</option>
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Access Level</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500 font-mono">UID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                    <td className="p-4 text-sm font-medium">
                       <select 
                         value={user.role || 'customer'} 
                         onChange={(e) => handleRoleChange(user.id, e.target.value)}
                         disabled={user.email === 'kumarrachith0@gmail.com'}
                         className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
                       >
                         <option value="admin">Admin</option>
                         <option value="manager">Manager</option>
                         <option value="support">Support</option>
                         <option value="customer">Customer</option>
                       </select>
                    </td>
                    <td className="p-4">
                      {user.email === 'kumarrachith0@gmail.com' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
                          <Shield className="w-3 h-3 mr-1" /> Super Admin
                        </span>
                      ) : user.role === 'admin' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                           Admin
                        </span>
                      ) : user.role === 'manager' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider">
                           Manager
                        </span>
                      ) : user.role === 'support' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
                           Support
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-sm text-gray-500">
                      No users found matching the criteria.
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
