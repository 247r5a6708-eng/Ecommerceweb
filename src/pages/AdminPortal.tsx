
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Shield, LayoutDashboard, ArrowLeft, ShoppingCart, Users, Package, Settings, Database, Loader2, Menu, X, CheckSquare, Search, Bell } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminDashboard from './admin/Dashboard';
import Placeholder from './admin/Placeholder';
import AdminProducts from './admin/Products';
import AdminOrders from './admin/Orders';
import AdminCustomers from './admin/Customers';
import SalesOverview from './admin/SalesOverview';
import Customer360 from './admin/Customer360';
import Invoices from './admin/Invoices';
import Analytics from './admin/Analytics';
import LowStock from './admin/LowStock';

import AdminImport from './admin/ImportData';

import { motion, AnimatePresence } from 'motion/react';

// Navigation structure matching the prompt requirements
const NAV_SECTIONS = [
  {
    title: "Core",
    items: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard }
    ]
  },
  {
    title: "Sales",
    items: [
      { name: "Overview", path: "/admin/sales-overview", icon: TrendingUp },
      { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
      { name: "Invoices", path: "/admin/invoices", icon: FileText }
    ]
  },
  {
    title: "Customers",
    items: [
      { name: "All Customers", path: "/admin/customers", icon: Users },
      { name: "Customer 360", path: "/admin/customer-360", icon: Search }
    ]
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", path: "/admin/products", icon: Package },
      { name: "Low Stock", path: "/admin/low-stock", icon: AlertTriangle },
      { name: "Categories", path: "/admin/categories", icon: FolderTree },
      { name: "Import Data", path: "/admin/import", icon: Upload }
    ]
  },
  {
    title: "System",
    items: [
      { name: "Analytics", path: "/admin/analytics", icon: LineChart },
      { name: "Settings", path: "/admin/settings", icon: Settings }
    ]
  }
];

// Re-importing missing icons directly for scope
import { TrendingUp, FileText, FolderTree, Upload, LineChart, AlertTriangle } from 'lucide-react';

export default function AdminPortal() {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = userProfile?.email === 'kumarrachith0@gmail.com' || userProfile?.isAdmin;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (createError: any) {
          setAuthError(createError.message);
        }
      } else {
        setAuthError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">LUMINA Command</h2>
          <p className="text-center text-sm text-gray-500 mb-8">Restricted operations portal.</p>
          {authError && <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium">{authError}</div>}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Identity</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Security Key</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all font-medium"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex font-sans">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="fixed md:static inset-y-0 left-0 z-40 bg-black text-gray-400 flex flex-col h-screen overflow-y-auto shrink-0 border-r border-white/10"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 text-white mb-8">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-sm tracking-widest uppercase">Lumina Core</h1>
                  <p className="text-[10px] text-gray-500">DATABASE ACTIVE</p>
                </div>
              </div>

              <div className="space-y-8">
                {NAV_SECTIONS.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3 px-3">{section.title}</h3>
                    <nav className="space-y-1">
                      {section.items.map((item, i) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                          <button
                            key={i}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-gray-200'}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 mt-auto border-t border-white/10">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit to Storefront</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-900 p-1">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Global Search (Orders, Users, SKUs)..." 
                className="pl-9 pr-4 py-1.5 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 w-64 md:w-96 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="hidden md:flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
            <button className="text-gray-400 hover:text-gray-900 relative p-1">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
              {userProfile?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/sales-overview" element={<SalesOverview />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/customers" element={<AdminCustomers />} />
            <Route path="/customer-360" element={<Customer360 />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/low-stock" element={<LowStock />} />
            <Route path="/categories" element={<Placeholder title="Category Taxonomy" />} />
            <Route path="/import" element={<AdminImport />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Placeholder title="Portal Settings" />} />
            <Route path="*" element={<Placeholder title="Module Not Found" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
