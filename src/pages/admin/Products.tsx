import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, updateProductVariant, addProduct } from '../../services/catalogService';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Plus, Trash2, Edit2, Package, X, Video, Pin, RefreshCw, Square, CheckSquare, Settings2, Download, ChevronDown, BellRing, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAllOrders } from '../../services/adminService';
import { checkAndTriggerLowStockAlert } from '../../services/emailService';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [thresholdValue, setThresholdValue] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportCatalog = () => {
    try {
      if (!products.length) {
        toast.error('No products to export');
        return;
      }
      const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Brand', 'Model', 'Variant'];
      const rows = products.map(p => [
        p.id, 
        `"${(p.name || '').replace(/"/g, '""')}"`, 
        p.sku || '', 
        p.category || '', 
        p.price || 0, 
        p.inventoryCount || 0,
        `"${(p.brand || '').replace(/"/g, '""')}"`,
        `"${(p.model || '').replace(/"/g, '""')}"`,
        `"${(p.variant || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csvContent, `product_catalog_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Product catalog exported');
      setShowExportMenu(false);
    } catch (err) {
      toast.error('Failed to export catalog');
    }
  };

  const handleExportOrders = async () => {
    const loadingToast = toast.loading('Fetching orders for export...');
    try {
      const orders = await getAllOrders();
      if (!orders.length) {
        toast.error('No orders to export', { id: loadingToast });
        return;
      }
      
      const headers = ['Order ID', 'Date', 'User ID', 'Status', 'Total', 'Items Count'];
      const rows = orders.map((o: any) => [
        o.id,
        o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString() : (o.date || ''),
        o.userId,
        o.status,
        o.total || 0,
        o.items?.length || 0
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csvContent, `order_history_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Order history exported', { id: loadingToast });
      setShowExportMenu(false);
    } catch (err) {
      toast.error('Failed to export orders', { id: loadingToast });
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const prods = await getProducts(true);
      setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.variantId || p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkPriceUpdate = async () => {
    if (!bulkPrice || isNaN(Number(bulkPrice))) return;
    setIsSaving(true);
    try {
      for (const id of selectedIds) {
        await updateProductVariant(id, { price: Number(bulkPrice) });
      }
      toast.success(`Updated price for ${selectedIds.length} products`);
      setSelectedIds([]);
      setShowBulkPriceModal(false);
      setBulkPrice('');
      await loadProducts();
    } catch (error) {
      toast.error('Failed to bulk update price');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkThresholdUpdate = async () => {
    if (!thresholdValue || isNaN(Number(thresholdValue))) return;
    setIsSaving(true);
    try {
      const parsedThreshold = Number(thresholdValue);
      for (const id of selectedIds) {
        await updateProductVariant(id, { lowStockThreshold: parsedThreshold });
        
        // Find product to check if we should trigger alert right now
        const product = products.find(p => (p.variantId || p.id) === id);
        if (product && (product.inventoryCount || 0) < parsedThreshold) {
          checkAndTriggerLowStockAlert(product, product.inventoryCount || 0, parsedThreshold);
        }
      }
      toast.success(`Updated low-stock threshold for ${selectedIds.length} products`);
      setSelectedIds([]);
      setShowThresholdModal(false);
      setThresholdValue('');
      await loadProducts();
    } catch (error) {
      toast.error('Failed to bulk update thresholds');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkVisibility = async (isPinned: boolean) => {
    setIsSaving(true);
    try {
      for (const id of selectedIds) {
        await updateProductVariant(id, { isPinnedInSuggestions: isPinned });
      }
      toast.success(`Updated visibility for ${selectedIds.length} products`);
      setSelectedIds([]);
      await loadProducts();
    } catch (error) {
      toast.error('Failed to bulk update visibility');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSKU = () => {
    return `PRD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;
    try {
      await deleteProduct(product);
      await loadProducts();
      toast.success('Product deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product');
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsAddingProduct(false);
    setEditForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || 0,
      inventoryCount: p.inventoryCount || 0,
      lowStockThreshold: p.lowStockThreshold || 15,
      category: p.category || 'Apparel',
      image: p.images?.[0] || '',
      sizeGuideVideoUrl: p.sizeGuideVideoUrl || '',
      isPinnedInSuggestions: p.isPinnedInSuggestions || false,
      sku: p.sku || ''
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsAddingProduct(true);
    setEditForm({
      name: '',
      description: '',
      price: 0,
      inventoryCount: 10,
      lowStockThreshold: 15,
      category: 'Apparel',
      image: '',
      sizeGuideVideoUrl: '',
      isPinnedInSuggestions: false,
      sku: generateSKU()
    });
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  const handleGenerateCopy = async () => {
    if (!editForm.name) {
      toast.error("Please enter a product name first.");
      return;
    }
    
    // We'll prompt for some basic keywords, or just use category + name
    const keywords = prompt("Enter a few keywords (e.g., cotton, oversized, elegant) to guide the AI:", editForm.category || "luxury");
    if (keywords === null) return;
    
    setIsGeneratingCopy(true);
    const toastId = toast.loading("AI is writing description...");
    try {
      const response = await fetch("/api/generate-product-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, keywords })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setEditForm({ ...editForm, description: data.copy });
      toast.success("Description generated!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate description", { id: toastId });
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isAddingProduct) {
        const threshold = parseInt(editForm.lowStockThreshold) || 15;
        const count = parseInt(editForm.inventoryCount);
        const newProduct = {
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          inventoryCount: count,
          lowStockThreshold: threshold,
          category: editForm.category,
          image: editForm.image,
          sizeGuideVideoUrl: editForm.sizeGuideVideoUrl,
          isPinnedInSuggestions: editForm.isPinnedInSuggestions,
          sku: editForm.sku,
        };
        await addProduct(newProduct);
        if (count < threshold) {
           checkAndTriggerLowStockAlert(newProduct as Product, count, threshold);
        }
        toast.success('Product added successfully');
      } else if (editingProduct) {
        const threshold = parseInt(editForm.lowStockThreshold) || 15;
        const count = parseInt(editForm.inventoryCount);
        await updateProductVariant(editingProduct.id, {
           name: editForm.name,
           description: editForm.description,
           inventoryCount: count,
           lowStockThreshold: threshold,
           sizeGuideVideoUrl: editForm.sizeGuideVideoUrl,
           isPinnedInSuggestions: editForm.isPinnedInSuggestions,
        });
        if (count < threshold) {
           checkAndTriggerLowStockAlert(editingProduct, count, threshold);
        }
        // We aren't updating the image/price on variant easily here without hitting other collections,
        // so we stick to the basic override fields as requested.
        toast.success('Product updated');
      }
      await loadProducts();
      closeModal();
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage inventory, new arrivals, and AI metadata overrides.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-3">
            {selectedIds.length > 0 ? (
              <div className="flex items-center space-x-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-left-4">
                <span className="mr-2 border-r border-gray-700 pr-3">{selectedIds.length} selected</span>
                <button onClick={() => setShowBulkPriceModal(true)} className="hover:bg-gray-800 px-2 py-1 rounded transition-colors text-xs font-bold">Update Price</button>
                <button onClick={() => setShowThresholdModal(true)} className="hover:bg-gray-800 px-2 py-1 rounded transition-colors text-xs font-bold flex items-center">
                  <BellRing className="w-3 h-3 mr-1" /> Thresholds
                </button>
                <button onClick={() => handleBulkVisibility(true)} className="hover:bg-gray-800 px-2 py-1 rounded transition-colors text-xs font-bold">Pin Visible</button>
                <button onClick={() => handleBulkVisibility(false)} className="hover:bg-gray-800 px-2 py-1 rounded transition-colors text-xs font-bold">Unpin</button>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-500">Total Products ({products.length})</span>
            )}
          </div>
          <div className="flex items-center space-x-3 relative">
            <div className="relative">
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" /> Export
                <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                  <button onClick={handleExportCatalog} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50">
                    Product Catalog
                  </button>
                  <button onClick={handleExportOrders} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Order History
                  </button>
                </div>
              )}
            </div>
            <button onClick={openAddModal} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-black transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-gray-900 cursor-pointer"
                      checked={selectedIds.length > 0 && selectedIds.length === products.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU / ID</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">AI Metadata</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => {
                  const id = p.variantId || p.id;
                  const isSelected = selectedIds.includes(id);
                  return (
                  <tr key={id} className={`transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-gray-900 cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleSelectOne(id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                           {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400 m-auto mt-2" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{p.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500">{p.id.slice(0, 8)}...</td>
                    <td className="p-4 text-sm font-medium text-gray-900">₹{(p.price || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${p.inventoryCount && p.inventoryCount > 10 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {p.inventoryCount || 0} in stock
                      </span>
                    </td>
                    <td className="p-4">
                       <div className="flex space-x-2">
                         {p.sizeGuideVideoUrl && <Video className="w-4 h-4 text-blue-500" title="Custom Video URL Set" />}
                         {p.isPinnedInSuggestions && <Pin className="w-4 h-4 text-amber-500" title="Pinned in Suggestions" />}
                         {!p.sizeGuideVideoUrl && !p.isPinnedInSuggestions && <span className="text-xs text-gray-400">Standard</span>}
                       </div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEditModal(p)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded hover:bg-gray-200 mr-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p)} className="p-2 text-red-400 hover:text-red-700 transition-colors rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(editingProduct || isAddingProduct) && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <h3 className="text-lg font-bold text-gray-900">
                  {isAddingProduct ? 'Add New Product' : 'Edit Product'}
                </h3>
                <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
                   <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-medium text-sm" />
                 </div>
                 
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                     <button 
                       type="button" 
                       onClick={handleGenerateCopy}
                       disabled={isGeneratingCopy}
                       className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors flex items-center disabled:opacity-50"
                     >
                       {isGeneratingCopy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                       AI Write
                     </button>
                   </div>
                   <textarea rows={4} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all text-sm"></textarea>
                 </div>
                 
                 {isAddingProduct && (
                   <>
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                         <span>SKU / Product Code</span>
                         <button onClick={() => setEditForm({...editForm, sku: generateSKU()})} className="text-gray-400 hover:text-gray-900 transition-colors flex items-center text-[10px]">
                           <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                         </button>
                       </label>
                       <input type="text" value={editForm.sku} onChange={e => setEditForm({...editForm, sku: e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-mono text-sm uppercase" placeholder="PRD-XXXXXX" />
                     </div>
                     
                     <div className="mt-6">
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                       <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-medium text-sm" placeholder="e.g. Apparel, Accessories" />
                     </div>
                     
                     <div className="mt-6">
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL</label>
                       <input type="text" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-medium text-sm" placeholder="https://..." />
                     </div>
                     
                     <div className="h-6"></div>
                   </>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₹)</label>
                     <input type="number" disabled={!isAddingProduct} value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className={`w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm ${isAddingProduct ? 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`} title={!isAddingProduct ? "Update via pricing module" : ""} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock Count</label>
                     <input type="number" value={editForm.inventoryCount} onChange={e => setEditForm({...editForm, inventoryCount: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-medium text-sm" />
                   </div>
                 </div>
                 
                 <div className="mt-4">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Low-Stock Alert Threshold</label>
                   <input type="number" value={editForm.lowStockThreshold} onChange={e => setEditForm({...editForm, lowStockThreshold: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-medium text-sm" placeholder="e.g. 15" />
                   <p className="text-xs text-gray-400 mt-1">Triggers an email notification to supply team when stock falls below this amount.</p>
                 </div>

                 <div className="border-t border-gray-200 pt-6">
                   <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                     AI Metadata Overrides
                   </h4>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                         <Video className="w-3 h-3 mr-1" /> Custom Size Guide Video URL
                       </label>
                       <input type="text" placeholder="https://..." value={editForm.sizeGuideVideoUrl} onChange={e => setEditForm({...editForm, sizeGuideVideoUrl: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all text-sm" />
                       <p className="text-xs text-gray-400 mt-1">Overrides the AI-generated instructional video for this specific product.</p>
                     </div>
                     
                     <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                       <input type="checkbox" checked={editForm.isPinnedInSuggestions} onChange={e => setEditForm({...editForm, isPinnedInSuggestions: e.target.checked})} className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-gray-900" />
                       <div>
                         <span className="block text-sm font-bold text-gray-900">Pin to "Frequently Bought Together"</span>
                         <span className="block text-xs text-gray-500">Forces this product to appear alongside AI suggestions.</span>
                       </div>
                     </label>
                   </div>
                 </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0 space-x-3">
                 <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
                 <button onClick={handleSave} disabled={isSaving || !editForm.name} className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors flex items-center disabled:opacity-50">
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Changes'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showThresholdModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                  <BellRing className="w-4 h-4 mr-2 text-gray-400" />
                  Stock Thresholds
                </h3>
                <button onClick={() => setShowThresholdModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Low-Stock Alert Level</label>
                <input 
                  type="number" 
                  value={thresholdValue} 
                  onChange={e => setThresholdValue(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-medium text-sm" 
                  placeholder="e.g. 15"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">Sets the alert trigger level for {selectedIds.length} products. Triggers emails to supply team.</p>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                 <button onClick={() => setShowThresholdModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
                 <button onClick={handleBulkThresholdUpdate} disabled={isSaving || !thresholdValue} className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors flex items-center disabled:opacity-50">
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Set Threshold'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBulkPriceModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Bulk Update Price
                </h3>
                <button onClick={() => setShowBulkPriceModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Price (₹)</label>
                <input 
                  type="number" 
                  value={bulkPrice} 
                  onChange={e => setBulkPrice(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-medium text-sm" 
                  placeholder="e.g. 1999"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">This price will be applied to {selectedIds.length} selected products.</p>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                 <button onClick={() => setShowBulkPriceModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
                 <button onClick={handleBulkPriceUpdate} disabled={isSaving || !bulkPrice} className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors flex items-center disabled:opacity-50">
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Apply Price'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showThresholdModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                  <BellRing className="w-4 h-4 mr-2 text-gray-400" />
                  Stock Thresholds
                </h3>
                <button onClick={() => setShowThresholdModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Low-Stock Alert Level</label>
                <input 
                  type="number" 
                  value={thresholdValue} 
                  onChange={e => setThresholdValue(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all font-medium text-sm" 
                  placeholder="e.g. 15"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">Sets the alert trigger level for {selectedIds.length} products. Triggers emails to supply team.</p>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                 <button onClick={() => setShowThresholdModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
                 <button onClick={handleBulkThresholdUpdate} disabled={isSaving || !thresholdValue} className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors flex items-center disabled:opacity-50">
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Set Threshold'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
