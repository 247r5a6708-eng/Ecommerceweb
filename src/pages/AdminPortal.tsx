import React, { useState, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { Shield, LayoutDashboard, Home, ArrowLeft, ShoppingCart, Users, Package, Settings, Database, Loader2, Menu, X, CheckSquare, Search, Bell, UserCog, Brain } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminDashboard from './admin/Dashboard';
import Placeholder from './admin/Placeholder';
import AdminProducts from './admin/Products';
import Promotions from './admin/Promotions';
import StorefrontCMS from './admin/StorefrontCMS';
import AdminReviews from './admin/Reviews';
import AdminOrders from './admin/Orders';
import AdminCustomers from './admin/Customers';
import ReturnsProcessing from './admin/ReturnsProcessing';
import AbandonedCarts from './admin/AbandonedCarts';
import SalesOverview from './admin/SalesOverview';
import Customer360 from './admin/Customer360';
import Invoices from './admin/Invoices';
import Analytics from './admin/Analytics';
import LowStock from './admin/LowStock';
import UserRoles from './admin/UserRoles';
import AuditLog from './admin/AuditLog';
import CustomerInsights from './admin/CustomerInsights';
import { Toaster } from 'react-hot-toast';

import AdminImport from './admin/ImportData';

import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, FileText, FolderTree, Upload, LineChart, AlertTriangle, ClipboardList, Star, RotateCcw } from 'lucide-react';

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

  const isSuperAdmin = userProfile?.email === 'kumarrachith0@gmail.com';
  const role = userProfile?.role || 'customer';
  const hasAccess = isSuperAdmin || ['admin', 'manager', 'support'].includes(role);
  const isAdmin = isSuperAdmin || role === 'admin';
  const isManager = isAdmin || role === 'manager';
  const isSupport = isManager || role === 'support';

  const NAV_SECTIONS = useMemo(() => {
    const sections = [];
    
    // Everyone with access gets Core Dashboard
    if (isSupport) {
      sections.push({
        title: "Core",
        items: [
          { name: "Admin", path: "/admin", icon: LayoutDashboard },
          { name: "Home", path: "/", icon: Home }
        ]
      });
    }

    if (isSupport) {
      const salesItems = [];
      if (isManager) salesItems.push({ name: "Overview", path: "/admin/sales-overview", icon: TrendingUp });
      salesItems.push({ name: "Orders", path: "/admin/orders", icon: ShoppingCart });
      if (isManager) salesItems.push({ name: "Invoices", path: "/admin/invoices", icon: FileText });
      salesItems.push({ name: "Returns", path: "/admin/returns", icon: RotateCcw });
      if (isManager) salesItems.push({ name: "Abandoned Carts", path: "/admin/abandoned-carts", icon: ShoppingCart });
      
      sections.push({ title: "Sales", items: salesItems });
    }

    if (isSupport) {
      sections.push({
        title: "Customers",
        items: [
          { name: "All Customers", path: "/admin/customers", icon: Users },
          { name: "Customer 360", path: "/admin/customer-360", icon: Search },
          { name: "Insights & Fit", path: "/admin/customer-insights", icon: Brain },
          { name: "Reviews", path: "/admin/reviews", icon: Star }
        ]
      });
    }

    if (isManager) {
      sections.push({
        title: "Marketing",
        items: [
          { name: "Promotions", path: "/admin/promotions", icon: Bell },
          { name: "Storefront CMS", path: "/admin/storefront", icon: LayoutDashboard },
        ]
      });
    }

    if (isManager) {
      sections.push({
        title: "Catalog",
        items: [
          { name: "Products", path: "/admin/products", icon: Package },
          { name: "Low Stock", path: "/admin/low-stock", icon: AlertTriangle },
          { name: "Categories", path: "/admin/categories", icon: FolderTree },
          { name: "Import Data", path: "/admin/import", icon: Upload }
        ]
      });
    }

    if (isAdmin) {
      sections.push({
        title: "System",
        items: [
          { name: "Analytics", path: "/admin/analytics", icon: LineChart },
          { name: "Roles & Access", path: "/admin/roles", icon: UserCog },
          { name: "Audit Log", path: "/admin/audit-log", icon: ClipboardList },
          { name: "Settings", path: "/admin/settings", icon: Settings }
        ]
      });
    }

    return sections;
  }, [isAdmin, isManager, isSupport]);

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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center transform rotate-3">
              <Shield className="w-8 h-8 text-white -rotate-3" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 tracking-tight mb-2">Admin Portal</h2>
          <p className="text-sm text-center text-gray-500 mb-8">Sign in with authorized credentials</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-sm"
              />
            </div>
            
            {authError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">
                {authError}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center mt-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
            </button>
          </form>
          <button 
            onClick={() => navigate('/')}
            className="w-full mt-6 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6 text-sm">Your account ({userProfile.email}) does not have administrative privileges. Contact a system administrator to request access.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors text-sm"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex font-sans">
      <Toaster position="top-right" />
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col overflow-hidden shrink-0 shadow-sm z-20"
          >
            <div className="p-6 flex items-center space-x-3 shrink-0">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Admin<span className="text-gray-400">OS</span></span>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 no-scrollbar">
              {NAV_SECTIONS.map((section, idx) => (
                <div key={idx}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                            isActive 
                              ? 'bg-gray-900 text-white shadow-md' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 shrink-0">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 font-bold text-gray-600">
                  {userProfile.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{userProfile.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 font-mono capitalize truncate">{isSuperAdmin ? 'Super Admin' : role}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 shrink-0 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <span>AdminOS</span>
              <span>/</span>
              <span className="font-medium text-gray-900 capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
             <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
             <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors hidden sm:block">
               Storefront
             </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            {isManager && <Route path="/sales-overview" element={<SalesOverview />} />}
            {isSupport && <Route path="/orders" element={<AdminOrders />} />}
            {isManager && <Route path="/invoices" element={<Invoices />} />}
            {isSupport && <Route path="/returns" element={<ReturnsProcessing />} />}
            {isManager && <Route path="/abandoned-carts" element={<AbandonedCarts />} />}
            
            {isSupport && <Route path="/customers" element={<AdminCustomers />} />}
            {isSupport && <Route path="/customer-360" element={<Customer360 />} />}
            {isSupport && <Route path="/customer-insights" element={<CustomerInsights />} />}
            {isSupport && <Route path="/reviews" element={<AdminReviews />} />}
            
            {isManager && <Route path="/products" element={<AdminProducts />} />}
            {isManager && <Route path="/low-stock" element={<LowStock />} />}
            {isManager && <Route path="/categories" element={<Placeholder title="Categories" />} />}
            {isManager && <Route path="/import" element={<AdminImport />} />}
            {isManager && <Route path="/promotions" element={<Promotions />} />}
            {isManager && <Route path="/storefront" element={<StorefrontCMS />} />}
            
            {isAdmin && <Route path="/analytics" element={<Analytics />} />}
            {isAdmin && <Route path="/roles" element={<UserRoles />} />}
            {isAdmin && <Route path="/audit-log" element={<AuditLog />} />}
            {isAdmin && <Route path="/settings" element={<Placeholder title="System Settings" />} />}
          </Routes>
        </div>
      </main>
    </div>
  );
}
