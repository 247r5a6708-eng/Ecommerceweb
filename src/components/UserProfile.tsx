import { useNavigate } from 'react-router-dom';
import { Fragment, useState, useEffect, useMemo } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, Clock, Package, CheckCircle2, User, Mail, MapPin, Edit2, LogOut, XCircle, Phone, Image as ImageIcon, Wallet, Shield, FileText, Wrench } from 'lucide-react';
import { Order, UserProfileData, WalletProduct } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import SafeProductImage from './SafeProductImage';
import OrderTrackingMap from './OrderTrackingMap';
import OrderStatusStepper from './OrderStatusStepper';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onCancelOrder: (orderId: string, reason?: string) => void;
  userProfile: UserProfileData;
  onUpdateProfile: (profile: UserProfileData) => void;
  onLogout: () => void;
  walletItems?: WalletProduct[];
}

export default function UserProfile({ isOpen, onClose, orders, onCancelOrder, userProfile, onUpdateProfile, onLogout, walletItems = [] }: UserProfileProps) {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfileData>(userProfile);
  const [activeTab, setActiveTab] = useState<'orders' | 'wallet'>('orders');

  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [cancelOrderData, setCancelOrderData] = useState<{ id: string, reason: string } | null>(null);
  const [previewPdfData, setPreviewPdfData] = useState<{ url: string, name: string } | null>(null);


  const previewInvoice = (order: Order) => {
    import('../utils/pdfGenerator').then(({ generateInvoicePDF }) => {
      const doc = generateInvoicePDF(order, user);
      const url = doc.output('bloburl');
      setPreviewPdfData({ url: url.toString(), name: `invoice_${order.id}.pdf` });
    });
  };

  const downloadInvoiceDirect = (order: Order) => {
    import('../utils/pdfGenerator').then(({ generateInvoicePDF }) => {
      const doc = generateInvoicePDF(order, user);
      doc.save(`invoice_${order.id}.pdf`);
    });
  };


  const spendingData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = [];
    const now = new Date();
    
    let hasAnyData = false;
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === month && orderDate.getFullYear() === year && o.status !== 'cancelled';
      });
      
      const totalSpent = monthOrders.reduce((sum, order) => sum + order.total, 0);
      if (totalSpent > 0) hasAnyData = true;
      
      data.push({
        name: monthNames[month],
        spent: totalSpent
      });
    }
    
    // Fallback to sample data for visual demonstration if user has no orders at all
    if (!hasAnyData) {
        return [
            { name: monthNames[(now.getMonth() - 5 + 12) % 12], spent: 120 },
            { name: monthNames[(now.getMonth() - 4 + 12) % 12], spent: 450 },
            { name: monthNames[(now.getMonth() - 3 + 12) % 12], spent: 50 },
            { name: monthNames[(now.getMonth() - 2 + 12) % 12], spent: 850 },
            { name: monthNames[(now.getMonth() - 1 + 12) % 12], spent: 230 },
            { name: monthNames[now.getMonth()], spent: 0 },
        ];
    }
    
    return data;
  }, [orders]);

  useEffect(() => {
    setUser(userProfile);
  }, [userProfile]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Profile Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-gray-50 dark:bg-[#0a0a0c] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#121216] border-b border-gray-100 dark:border-white/5 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                My Profile
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              
              {/* User Details Card */}
              <div className="bg-white dark:bg-[#121216] p-6 mb-2 border-b border-gray-100 dark:border-white/5">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h3>
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setUser(userProfile);
                        }}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar Image</label>
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setUser({...user, avatar: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-sm border border-gray-300 dark:border-white/10 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          value={user.name}
                          onChange={(e) => setUser({...user, name: e.target.value})}
                          className="w-full text-sm border border-gray-300 dark:border-white/10 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          value={user.email}
                          onChange={(e) => setUser({...user, email: e.target.value})}
                          className="w-full text-sm border border-gray-300 dark:border-white/10 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <input 
                          type="tel" 
                          value={user.phone}
                          onChange={(e) => setUser({...user, phone: e.target.value})}
                          className="w-full text-sm border border-gray-300 dark:border-white/10 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-5 h-5 text-gray-400 mt-2" />
                        <textarea 
                          value={user.address}
                          onChange={(e) => setUser({...user, address: e.target.value})}
                          rows={2}
                          className="w-full text-sm border border-gray-300 dark:border-white/10 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          onUpdateProfile(user);
                          setIsEditing(false);
                        }}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {user.avatar ? (
    <img 
      src={user.avatar} 
      alt={user.name || 'User avatar'} 
      className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 dark:border-white/5 shadow-sm"
    />
  ) : (
    <div className="w-20 h-20 rounded-full border-4 border-gray-50 dark:border-white/5 shadow-sm bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
      <User className="w-8 h-8" />
    </div>
  )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" /> {user.email}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" /> {user.phone}
                          </p>
                          <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                            Premium Member
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Shipping Address</p>
                          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{user.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button 
                        onClick={() => {
                          onLogout();
                          onClose();
                        }}
                        className="flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#121216] px-6">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 text-sm font-medium border-b-2 mr-6 transition-colors ${activeTab === 'orders' ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'wallet' ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <span className="flex items-center"><Wallet className="w-4 h-4 mr-2" /> Digital Wallet</span>
                </button>
              </div>

              {/* Order History */}
              <div className="p-6">
                {activeTab === 'orders' ? (
                  <>
                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Purchase History</h3>
                      <div className="h-48 w-full bg-white dark:bg-[#121216] rounded-xl border border-gray-100 dark:border-white/5 p-4 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:scale-[1.01] transition-all duration-300">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={spendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-white/5" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 12, fill: '#6b7280' }} 
                              dy={10} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 12, fill: '#6b7280' }} 
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                              itemStyle={{ color: '#111827', fontWeight: 600 }}
                              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                              labelStyle={{ color: '#6b7280', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="spent" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-white dark:bg-[#121216] rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/10 rounded-full flex items-center justify-center mb-2">
                          <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900 dark:text-white">No orders yet</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">When you make a purchase, it will appear here.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-white dark:bg-[#121216] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:scale-[1.02] transition-all duration-300">
                            <div className="bg-gray-50 dark:bg-white/5 px-4 py-3 border-b border-gray-100 dark:border-white/5 flex flex-wrap gap-2 justify-between items-start sm:items-center">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Order #{order.id}</p>
                                <p className="text-sm text-gray-900 dark:text-white font-medium mt-0.5">
                                  {new Date(order.date).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3">
                                {order.status !== 'cancelled' && (
                                  <button
                                    onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                                    className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-bold hover:scale-105 transition-transform shadow-md hover:shadow-lg"
                                  >
                                    {trackingOrderId === order.id ? 'Hide Tracking' : 'Track Order'}
                                  </button>
                                )}
                                <button
                                  onClick={() => previewInvoice(order)}
                                  className="px-3 py-1.5 flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-105 transition-all shadow-sm hover:shadow-md"
                                >
                                  <FileText className="w-3.5 h-3.5 mr-1" />
                                  Invoice
                                </button>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                                <span className={`inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1.5 ${
                                  order.status === 'delivered' ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10' :
                                  order.status === 'processing' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10' :
                                  order.status === 'cancelled' ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10' :
                                  'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10'
                                }`}>
                                  {order.status === 'cancelled' ? (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                  )}
                                  {order.status ? order.status : 'Completed'}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <ul className="space-y-3">
                                {order.items.map((item) => (
                                  <li key={item.id} className="flex items-center text-sm">
                                    <SafeProductImage
                                      src={item.image}
                                      alt={item.name}
                                      className="w-12 h-12 mr-3 rounded-lg border border-gray-100 dark:border-white/10"
                                      imageClassName="rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      
                                      <p className="text-gray-900 dark:text-gray-200 font-medium truncate">{item.name}</p>
                                      <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-x-2">
                                        <span>Qty: {item.quantity}</span>
                                        {item.sku && <span>SKU: {item.sku}</span>}
                                        {item.seller && <span>Sold by: {item.seller}</span>}
                                      </div>

                                    </div>
                                    <p className="text-gray-900 dark:text-white ml-2 font-medium">{formatPrice((item.price * item.quantity))}</p>
                                  </li>
                                ))}
                              </ul>
                              {order.status === 'processing' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                  <button
                                    onClick={() => setCancelOrderData({ id: order.id, reason: '' })}
                                    className="flex items-center justify-center w-full space-x-2 py-2 px-4 rounded-md border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-medium"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Cancel Order</span>
                                  </button>
                                </div>
                              )}
                            </div>
                            {trackingOrderId === order.id && (
                               <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#121216]">
                                  <OrderStatusStepper status={order.status} />
                                  <OrderTrackingMap orderId={order.id} status={order.status} onClose={() => setTrackingOrderId(null)} />
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    {walletItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-white dark:bg-[#121216] rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/10 rounded-full flex items-center justify-center mb-2">
                          <Wallet className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900 dark:text-white">Your digital wallet is empty</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Purchased items with warranties will appear here.</p>
                        </div>
                      </div>
                    ) : (
                      walletItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10 hover:scale-[1.02] transition-all duration-300">
                          <div className="p-4 flex items-start space-x-4">
                            <SafeProductImage 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-16 h-16 bg-gray-100 rounded-lg"
                              imageClassName="w-16 h-16 rounded-lg object-cover" 
                            />
                            <div className="flex-1 min-w-0">
                              
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                              <div className="flex text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 space-x-2 font-medium">
                                {item.product.sku && <span>SKU: {item.product.sku}</span>}
                                {item.product.seller && <span>Sold by: {item.product.seller}</span>}
                              </div>

                              <p className="text-xs font-bold text-green-500 mt-1">Estimated Trade-in Value: {formatPrice(item.product.price * 0.3)}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.warrantyStatus === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                  <Shield className="w-3 h-3 mr-1" />
                                  Warranty: {item.warrantyStatus}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-white/10 px-4 py-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                            <div className="flex space-x-3">
                              <button className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <FileText className="w-3 h-3 mr-1" /> Invoice
                              </button>
                              <button className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Wrench className="w-3 h-3 mr-1" /> Service
                              </button>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Expires: {item.warrantyExpiry}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        
          {/* Cancel Order Modal */}
          {cancelOrderData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#121216] rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 text-red-600 dark:text-red-400 mb-4">
                    <XCircle className="w-6 h-6" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Order</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Are you sure you want to cancel order #{cancelOrderData.id}? Please provide a reason for cancellation.
                  </p>
                  <textarea
                    value={cancelOrderData.reason}
                    onChange={(e) => setCancelOrderData({ ...cancelOrderData, reason: e.target.value })}
                    placeholder="Reason for cancellation (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500/50 outline-none resize-none mb-6"
                    rows={3}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCancelOrderData(null)}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={() => {
                        onCancelOrder(cancelOrderData.id, cancelOrderData.reason);
                        setCancelOrderData(null);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    >
                      Confirm Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* PDF Preview Modal */}
          {previewPdfData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#1a1a24] rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                  <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Invoice Preview</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewPdfData.url;
                        link.download = previewPdfData.name;
                        link.click();
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => setPreviewPdfData(null)}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-[#0a0a0f] p-2 sm:p-4 overflow-hidden relative">
                  <iframe 
                    src={previewPdfData.url + "#toolbar=0"} 
                    className="w-full h-full rounded-lg shadow-inner bg-white"
                    title="PDF Preview"
                  />
                </div>
              </motion.div>
            </div>
          )}

        </Fragment>
      )}
    </AnimatePresence>
  );
}
