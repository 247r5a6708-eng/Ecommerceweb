import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutTemplate, Image as ImageIcon, Type, Link as LinkIcon, Save, Eye, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StorefrontCMS() {
  const [isSaving, setIsSaving] = useState(false);
  const [hero, setHero] = useState({
    title: 'Autumn Collection 2024',
    subtitle: 'Discover the new standard of modern elegance.',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000',
    ctaText: 'Shop Now',
    ctaLink: '/collections/autumn'
  });

  const [categories, setCategories] = useState([
    { id: 1, name: 'New Arrivals', link: '/new', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800' },
    { id: 2, name: 'Essentials', link: '/essentials', image: 'https://images.unsplash.com/photo-1434389678369-182f0f4db239?auto=format&fit=crop&q=80&w=800' },
    { id: 3, name: 'Accessories', link: '/accessories', image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=800' }
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Storefront published successfully');
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Storefront CMS</h1>
          <p className="text-sm text-gray-500 mt-1">Manage homepage layout, banners, and featured collections.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center shadow-sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center shadow-lg shadow-gray-200 disabled:opacity-50"
          >
            {isSaving ? <LayoutTemplate className="w-4 h-4 mr-2 animate-pulse" /> : <Save className="w-4 h-4 mr-2" />}
            Publish Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Hero Banner</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Headline</label>
                <input 
                  type="text" 
                  value={hero.title}
                  onChange={(e) => setHero({...hero, title: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subtitle</label>
                <textarea 
                  rows={2}
                  value={hero.subtitle}
                  onChange={(e) => setHero({...hero, subtitle: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Background Image URL</label>
                <input 
                  type="text" 
                  value={hero.imageUrl}
                  onChange={(e) => setHero({...hero, imageUrl: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CTA Label</label>
                  <input 
                    type="text" 
                    value={hero.ctaText}
                    onChange={(e) => setHero({...hero, ctaText: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CTA Link</label>
                  <input 
                    type="text" 
                    value={hero.ctaLink}
                    onChange={(e) => setHero({...hero, ctaLink: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <LayoutGrid className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Featured Categories</h2>
            </div>
            
            <div className="space-y-4">
              {categories.map((cat, index) => (
                <div key={cat.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                    {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input 
                      type="text" 
                      value={cat.name}
                      onChange={(e) => {
                        const newCats = [...categories];
                        newCats[index].name = e.target.value;
                        setCategories(newCats);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:bg-white focus:ring-2 focus:ring-gray-900 font-medium text-sm"
                      placeholder="Category Name"
                    />
                    <input 
                      type="text" 
                      value={cat.link}
                      onChange={(e) => {
                        const newCats = [...categories];
                        newCats[index].link = e.target.value;
                        setCategories(newCats);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:bg-white focus:ring-2 focus:ring-gray-900 text-sm text-gray-500"
                      placeholder="URL Path"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Live Preview</h3>
            <div className="border-[4px] border-gray-900 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl relative" style={{ height: '600px' }}>
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 z-10 flex justify-center items-end pb-1">
                <div className="w-20 h-4 bg-black rounded-b-xl"></div>
              </div>
              
              <div className="h-full overflow-y-auto no-scrollbar pt-6">
                <div className="relative h-64 w-full bg-gray-100 flex items-center justify-center p-6 text-center">
                  {hero.imageUrl && <img src={hero.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative z-10 space-y-2">
                    <h2 className="text-2xl font-bold text-white">{hero.title || 'Headline'}</h2>
                    <p className="text-xs text-gray-200 line-clamp-2">{hero.subtitle}</p>
                    {hero.ctaText && (
                      <button className="mt-4 px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-lg">{hero.ctaText}</button>
                    )}
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <h3 className="font-bold text-sm">Shop by Category</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => (
                      <div key={cat.id} className="relative h-24 rounded-lg overflow-hidden group">
                        {cat.image ? (
                          <img src={cat.image} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200" />
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-sm text-center px-2">{cat.name || 'Category'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
