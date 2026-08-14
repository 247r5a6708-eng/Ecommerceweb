import React, { Fragment, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { X, Heart, ShoppingBag, Folder, Plus, ChevronRight, ArrowLeft, MoreHorizontal, FolderPlus, Download, GripVertical, BarChart2, Bell, Share2, Check, ChevronDown } from 'lucide-react';
import { auth } from '../lib/firebase';
import { Product } from '../types';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import SafeProductImage from './SafeProductImage';
import { generateWishlistPDF } from '../utils/pdfGenerator';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (id: string) => void;
  onClearWishlist: () => void;
  onAddToCart: (product: Product) => void;
  onAddToast?: (toast: any) => void;
}

export default function Wishlist({ isOpen, onClose, items, onRemoveItem, onClearWishlist, onAddToCart, onAddToast }: WishlistProps) {
  const { formatPrice } = useCurrency();
  const { wishlistItems, setWishlistItems, wishlistCollections, setWishlistCollections, userProfile, priceAlerts, setPriceAlerts } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'collections' | 'insights'>('all');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<'manual' | 'price-asc' | 'price-desc' | 'name-asc'>('manual');
  const [itemToMove, setItemToMove] = useState<string | null>(null);
  const [alertItem, setAlertItem] = useState<string | null>(null);
  const [alertPrice, setAlertPrice] = useState<string>('');
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const sortedItems = useMemo(() => {
    let sorted = [...items];
    switch (sortOrder) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break; 
    }
    return sorted;
  }, [items, sortOrder]);

  
  const handleShareWishlist = () => {
    const user = auth.currentUser;
    if (!user) {
      if (onAddToast) onAddToast({ title: 'Error', message: 'You must be logged in to share your wishlist', type: 'error' });
      return;
    }
    const url = `${window.location.origin}/?sharedWishlist=${user.uid}`;
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
    if (onAddToast) onAddToast({ title: 'Link Copied', message: 'Wishlist share link copied to clipboard!', type: 'success' });
  };

  const handleDownloadPDF = () => {
    if (items.length > 0) {
      const doc = generateWishlistPDF(items, userProfile);
      doc.save('my-wishlist.pdf');
    }
  };


  const handleSaveAlert = (productId: string) => {
    const numPrice = parseFloat(alertPrice);
    if (!isNaN(numPrice) && numPrice > 0) {
      setPriceAlerts(prev => ({ ...prev, [productId]: numPrice }));
      if (onAddToast) {
        onAddToast({
          title: 'Alert Set',
          message: `You will be notified if the price drops below ${formatPrice(numPrice)}.`,
          type: 'success'
        });
      }
    }
    setAlertItem(null);
  };
  
  const handleRemoveAlert = (productId: string) => {
    setPriceAlerts(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
    if (onAddToast) {
      onAddToast({
        title: 'Alert Removed',
        message: 'Price alert for this item has been removed.',
        type: 'info'
      });
    }
    setAlertItem(null);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      setWishlistCollections([
        ...wishlistCollections,
        {
          id: Date.now().toString(),
          name: newCollectionName.trim(),
          productIds: []
        }
      ]);
      setNewCollectionName('');
      setIsCreatingCollection(false);
    }
  };

  const handleMoveToCollection = (collectionId: string) => {
    if (itemToMove) {
      setWishlistCollections(prev => prev.map(c => {
        if (c.id === collectionId) {
          if (!c.productIds.includes(itemToMove)) {
            return { ...c, productIds: [...c.productIds, itemToMove] };
          }
        }
        return c;
      }));
      setItemToMove(null);
    }
  };
  
  const handleRemoveFromCollection = (collectionId: string, productId: string) => {
    setWishlistCollections(prev => prev.map(c => {
      if (c.id === collectionId) {
        return { ...c, productIds: c.productIds.filter(id => id !== productId) };
      }
      return c;
    }));
  };
  
  const handleDeleteCollection = (collectionId: string) => {
    setWishlistCollections(prev => prev.filter(c => c.id !== collectionId));
    setSelectedCollectionId(null);
  };

  const renderProductItem = (item: Product, collectionId?: string) => {
    const isPriceDrop = item.priceHistory && item.priceHistory.length > 1 && item.priceHistory[item.priceHistory.length - 1].price < item.priceHistory[item.priceHistory.length - 2].price;

    return (
      <div className="flex py-6">
        {sortOrder === 'manual' && !collectionId && (
           <div className="flex items-center justify-center pr-2 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 transition-colors">
             <GripVertical className="w-5 h-5" />
           </div>
        )}
        <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
          <SafeProductImage
            src={item.image}
            alt={item.name}
            className="h-full w-full"
            imageClassName="h-full w-full object-cover object-center"
          />
        </div>
        <div className="ml-4 flex flex-1 flex-col justify-between relative">
          <div>
            <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
              <h3 className="line-clamp-2 pr-4">{item.name}</h3>
              
              <div className="flex flex-col items-end">
                <p className="ml-4">{formatPrice(item.price)}</p>
                {priceAlerts[item.id] && (
                  <span className="text-[10px] text-amber-500 flex items-center mt-0.5" title={`Alert when < ${formatPrice(priceAlerts[item.id])}`}>
                    <Bell className="w-3 h-3 mr-0.5" />
                    &lt;{formatPrice(priceAlerts[item.id])}
                  </span>
                )}
              </div>

            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
            {item.priceHistory && item.priceHistory.length > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="h-8 w-24 opacity-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.priceHistory}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={isPriceDrop ? "#ef4444" : "#64748b"}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {isPriceDrop && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm">
                    Price Drop
                  </span>
                )}
              </div>
            )}
          </div>
          
          {alertItem === item.id ? (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Bell className="w-3 h-3 mr-1" />
                Alert me when price drops below:
              </p>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  placeholder={item.price.toString()}
                  className="w-full bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-between mt-2">
                <div className="space-x-2">
                  <button 
                    onClick={() => handleSaveAlert(item.id)}
                    className="text-xs bg-black dark:bg-white text-white dark:text-black font-medium px-2 py-1 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setAlertItem(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
                {priceAlerts[item.id] && (
                  <button 
                    onClick={() => handleRemoveAlert(item.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove Alert
                  </button>
                )}
              </div>
            </div>
          ) : itemToMove === item.id ? (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Save to collection:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {wishlistCollections.length === 0 ? (
                  <p className="text-xs text-gray-500">No collections found. Create one first.</p>
                ) : (
                  wishlistCollections.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleMoveToCollection(c.id)}
                      className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors flex justify-between items-center"
                    >
                      <span className="truncate">{c.name}</span>
                      {c.productIds.includes(item.id) && <span className="text-[10px] bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded">Added</span>}
                    </button>
                  ))
                )}
              </div>
              <button 
                onClick={() => setItemToMove(null)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 w-full text-center"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between mt-4 gap-y-3 gap-x-2">
              <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
                <button
                  type="button"
                  onClick={() => collectionId ? handleRemoveFromCollection(collectionId, item.id) : onRemoveItem(item.id)}
                  className="font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:underline text-sm"
                >
                  Remove
                </button>
                {!collectionId && (
                  <>
                    <button
                      type="button"
                      onClick={() => setItemToMove(item.id)}
                      className="font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-sm flex items-center"
                    >
                      <FolderPlus className="w-3 h-3 mr-1" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlertPrice(priceAlerts[item.id] ? priceAlerts[item.id].toString() : (item.price - 1).toString());
                        setAlertItem(item.id);
                      }}
                      className={`font-medium hover:underline text-sm flex items-center ${priceAlerts[item.id] ? 'text-amber-500 hover:text-amber-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Alert
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  onAddToCart(item);
                  if (!collectionId) onRemoveItem(item.id);
                }}
                className="flex justify-center items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInsightsView = () => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4 py-12">
           <BarChart2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
           <p className="text-gray-500 dark:text-gray-400">Add items to your wishlist to see insights.</p>
        </div>
      );
    }

    const categoryData = items.reduce((acc, item) => {
      const cat = item.category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    let totalSaved = 0;
    const priceDrops = items.filter(item => {
      if (item.priceHistory && item.priceHistory.length > 1) {
        const latest = item.priceHistory[item.priceHistory.length - 1].price;
        const prev = item.priceHistory[item.priceHistory.length - 2].price;
        if (latest < prev) {
           totalSaved += (prev - latest);
           return true;
        }
      }
      return false;
    });

    return (
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Wishlist Insights</h3>
        
        <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Categories Saved</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontSize: '14px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-[10px] text-gray-500">
                <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Potential Savings</h4>
          <p className="text-3xl font-bold text-green-500 dark:text-green-400 mb-1">{formatPrice(totalSaved)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">from {priceDrops.length} items that recently dropped in price</p>
        </div>
      </div>
    );
  };

  const renderActiveView = () => {
    if (activeTab === 'insights') {
      return renderInsightsView();
    }

    if (selectedCollectionId) {
      const collection = wishlistCollections.find(c => c.id === selectedCollectionId);
      if (!collection) return null;
      
      const collectionItems = items.filter(item => collection.productIds.includes(item.id));
      
      return (
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedCollectionId(null)}
              className="mr-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1 truncate">{collection.name}</h3>
            <button 
              onClick={() => handleDeleteCollection(collection.id)}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
          
          {collectionItems.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">This collection is empty.</p>
              <p className="text-sm text-gray-400 mt-1">Go to "All Items" to save products here.</p>
            </div>
          ) : (
            <ul role="list" className="-my-6 divide-y divide-gray-100 dark:divide-white/10">
              {collectionItems.map((item) => (
                <li key={item.id}>{renderProductItem(item, collection.id)}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    if (activeTab === 'all') {
      return (
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 font-medium">{items.length} items</span>
            <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="text-sm bg-[#FAFAFA] dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-md py-1.5 pl-3 pr-8 outline-none text-[#111] dark:text-[#FAFAFA] min-w-[140px] cursor-pointer appearance-none w-full"
            >
              <option value="manual" className="bg-white dark:bg-gray-900 text-black dark:text-white">Manual Order</option>
              <option value="price-asc" className="bg-white dark:bg-gray-900 text-black dark:text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-white dark:bg-gray-900 text-black dark:text-white">Price: High to Low</option>
              <option value="name-asc" className="bg-white dark:bg-gray-900 text-black dark:text-white">Alphabetical</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 rounded-full flex items-center justify-center mb-2">
                <Heart className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">Your wishlist is empty</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Save items you love to revisit them later.</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
             sortOrder === 'manual' ? (
                <Reorder.Group 
                  axis="y" 
                  values={sortedItems} 
                  onReorder={(newOrder) => setWishlistItems(newOrder.map(p => p.id))}
                  className="-my-6 divide-y divide-gray-100 dark:divide-white/10"
                >
                  {sortedItems.map((item) => (
                    <Reorder.Item key={item.id} value={item} className="bg-white dark:bg-[#121216]">
                      {renderProductItem(item)}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
             ) : (
                <ul role="list" className="-my-6 divide-y divide-gray-100 dark:divide-white/10">
                  {sortedItems.map((item) => (
                    <li key={item.id}>{renderProductItem(item)}</li>
                  ))}
                </ul>
             )
          )}
        </div>
      );
    }

    // Collections Tab
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Collections</h3>
          <button 
            onClick={() => setIsCreatingCollection(true)}
            className="flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>

        {isCreatingCollection && (
          <form onSubmit={handleCreateCollection} className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Collection Name</label>
            <input 
              type="text"
              autoFocus
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="e.g. Summer Essentials"
              className="w-full bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-3 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setIsCreatingCollection(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!newCollectionName.trim()}
                className="px-3 py-1.5 text-sm font-medium bg-black dark:bg-white text-white dark:text-black font-medium rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {wishlistCollections.length === 0 && !isCreatingCollection ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No collections yet.</p>
            <p className="text-sm text-gray-400 mt-1">Organize your saved items into folders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistCollections.map(collection => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollectionId(collection.id)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{collection.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{collection.productIds.length} items</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

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
          {/* Wishlist Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] shadow-2xl border-l border-gray-100 dark:border-gray-900"
          >
            {/* Header */}
            <div className="px-6 pt-4 pb-0 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Your Saved Items
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {!selectedCollectionId && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'all' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => setActiveTab('collections')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'collections' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                  >
                    Collections
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'insights' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                  >
                    Insights
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            {renderActiveView()}
            
            {items.length > 0 && activeTab === 'all' && !selectedCollectionId && (
              <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-col space-y-3">

                <button
                  onClick={handleShareWishlist}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 dark:bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
                >
                  {copiedShareLink ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                  <span>{copiedShareLink ? 'Copied Link' : 'Share Wishlist'}</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center space-x-2 bg-black dark:bg-white text-white dark:text-black font-medium py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Wishlist (PDF)</span>
                </button>
                <button
                  onClick={onClearWishlist}
                  className="w-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 py-3 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
