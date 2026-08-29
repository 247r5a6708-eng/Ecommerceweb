import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Tag, Calendar, Users, Edit2, Trash2, Loader2, Play, Square, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Promotion {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      code: 'SUMMER20',
      type: 'percentage',
      value: 20,
      usageLimit: 500,
      usageCount: 142,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      isActive: true,
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  
  const [form, setForm] = useState<Partial<Promotion>>({});
  
  const handleOpenModal = (promo?: Promotion) => {
    if (promo) {
      setEditingPromo(promo);
      setForm(promo);
    } else {
      setEditingPromo(null);
      setForm({
        code: '',
        type: 'percentage',
        value: 10,
        usageLimit: 100,
        isActive: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSave = () => {
    if (!form.code || !form.value) return toast.error("Please fill required fields");
    
    if (editingPromo) {
      setPromotions(promotions.map(p => p.id === editingPromo.id ? { ...p, ...form } as Promotion : p));
      toast.success("Promotion updated");
    } else {
      setPromotions([{ ...form, id: Math.random().toString(), usageCount: 0 } as Promotion, ...promotions]);
      toast.success("Promotion created");
    }
    setIsModalOpen(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      setPromotions(promotions.filter(p => p.id !== id));
      toast.success("Promotion deleted");
    }
  };

  const toggleStatus = (id: string) => {
    setPromotions(promotions.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Promotions & Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage active sales, promo codes, and campaign limits.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center shadow-lg shadow-gray-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Promotion
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Code</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Discount</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Usage</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Validity</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-bold text-gray-900 uppercase tracking-wider">{promo.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {promo.type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 font-medium">{promo.usageCount} / {promo.usageLimit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{promo.startDate} - {promo.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit ${
                      promo.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {promo.isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => toggleStatus(promo.id)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title={promo.isActive ? "Pause" : "Activate"}>
                        {promo.isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleOpenModal(promo)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(promo.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No promotions created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {editingPromo ? 'Edit Promotion' : 'New Promotion'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Promo Code</label>
                <input 
                  type="text" 
                  value={form.code} 
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 uppercase font-bold tracking-wider"
                  placeholder="e.g. SUMMER20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                  <select 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value as any})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Value</label>
                  <input 
                    type="number" 
                    value={form.value} 
                    onChange={e => setForm({...form, value: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Usage Limit (Total uses)</label>
                <input 
                  type="number" 
                  value={form.usageLimit} 
                  onChange={e => setForm({...form, usageLimit: Number(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => setForm({...form, startDate: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
                  <input 
                    type="date" 
                    value={form.endDate} 
                    onChange={e => setForm({...form, endDate: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">
                {editingPromo ? 'Save Changes' : 'Create Promotion'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
