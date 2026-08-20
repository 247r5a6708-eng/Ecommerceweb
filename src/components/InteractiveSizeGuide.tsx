import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, User, Save, RefreshCw, PlayCircle } from 'lucide-react';
import { Product, UserProfileData } from '../types';

interface InteractiveSizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  userProfile?: UserProfileData | null;
  onUpdateProfile?: (profile: UserProfileData) => void;
  onSelectSize: (size: string) => void;
}

export default function InteractiveSizeGuide({ isOpen, onClose, product, userProfile, onUpdateProfile, onSelectSize }: InteractiveSizeGuideProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'video'>('diagram');
  const [showRuler, setShowRuler] = useState(false);
  const [measurements, setMeasurements] = useState({
    chest: userProfile?.bodyMeasurements?.chest || '',
    waist: userProfile?.bodyMeasurements?.waist || '',
    hips: userProfile?.bodyMeasurements?.hips || '',
    height: userProfile?.bodyMeasurements?.height || '',
    weight: userProfile?.bodyMeasurements?.weight || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{ recommendedSize?: string; reason?: string } | null>(null);
  
  useEffect(() => {
    if (userProfile?.bodyMeasurements) {
      setMeasurements({
        chest: userProfile.bodyMeasurements.chest || '',
        waist: userProfile.bodyMeasurements.waist || '',
        hips: userProfile.bodyMeasurements.hips || '',
        height: userProfile.bodyMeasurements.height || '',
        weight: userProfile.bodyMeasurements.weight || '',
      });
    }
  }, [userProfile]);

  const handleCalculate = async () => {
    setIsLoading(true);
    
    // Save locally to user profile if onUpdateProfile exists
    if (onUpdateProfile && userProfile) {
      onUpdateProfile({
        ...userProfile,
        bodyMeasurements: measurements
      });
    }

    try {
      const res = await fetch('/api/ai-size-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.id, 
          userProfile: { bodyMeasurements: measurements }, 
          orders: [] // we can omit orders or fetch them if needed
        })
      });
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error('Size rec failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#121216] rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden my-8 relative flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10 bg-white/50 dark:bg-black/50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Left side: Diagram or Video */}
            <div className="w-full md:w-2/5 bg-gray-50 dark:bg-white/5 p-6 md:p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10">
              <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 mb-6 w-full max-w-[200px]">
                <button
                  onClick={() => setViewMode('diagram')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === 'diagram' ? 'bg-white dark:bg-black shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Diagram
                </button>
                <button
                  onClick={() => setViewMode('video')}
                  className={`flex-1 flex items-center justify-center py-1.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === 'video' ? 'bg-white dark:bg-black shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5 mr-1" />
                  Video
                </button>
              </div>

              {viewMode === 'diagram' ? (
                <>
                  <div className="relative w-48 h-80 bg-gray-200 dark:bg-gray-800 rounded-[3rem] border-4 border-gray-300 dark:border-gray-700 shadow-inner flex items-center justify-center mb-6">
                     {/* Abstract body diagram */}
                     <div className="absolute top-6 w-12 h-16 bg-gray-300 dark:bg-gray-600 rounded-[2rem]"></div>
                     <div className="absolute top-24 w-32 h-24 bg-gray-300 dark:bg-gray-600 rounded-[2rem]"></div>
                     <div className="absolute top-[12rem] w-36 h-20 bg-gray-300 dark:bg-gray-600 rounded-[2rem]"></div>
                     
                     {/* Measurement Lines */}
                     <div className="absolute top-[7.5rem] w-full flex items-center justify-center group cursor-help">
                       <div className="w-40 border-t-2 border-dashed border-blue-500 relative">
                         <span className="absolute -right-10 -top-3 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 px-1 rounded shadow">Chest</span>
                       </div>
                     </div>
                     <div className="absolute top-[10.5rem] w-full flex items-center justify-center group cursor-help">
                       <div className="w-32 border-t-2 border-dashed border-purple-500 relative">
                         <span className="absolute -left-10 -top-3 text-xs font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-900 px-1 rounded shadow">Waist</span>
                       </div>
                     </div>
                     <div className="absolute top-[13.5rem] w-full flex items-center justify-center group cursor-help">
                       <div className="w-40 border-t-2 border-dashed border-pink-500 relative">
                         <span className="absolute -right-10 -top-3 text-xs font-bold text-pink-600 dark:text-pink-400 bg-white dark:bg-gray-900 px-1 rounded shadow">Hips</span>
                       </div>
                     </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                    Use a flexible measuring tape. Keep the tape comfortably loose.
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-sm rounded-xl overflow-hidden bg-black shadow-lg mb-4 relative aspect-[9/16]">
                    <video
                      controls
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1590622765872-965709403d73?w=800&auto=format&fit=crop&q=60"
                    >
                      <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                    Watch our expert tailor demonstrate how to properly take your measurements for the best fit.
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Interactive Form & Results */}
            <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Find Your Perfect Fit</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter your measurements below and we'll calculate the best size for <strong>{product.name}</strong>.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Chest (inches)</label>
                  <input 
                    type="number" 
                    value={measurements.chest} 
                    onChange={e => setMeasurements({...measurements, chest: e.target.value})}
                    className="w-full bg-white dark:bg-[#1A1A20] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 38"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Waist (inches)</label>
                  <input 
                    type="number" 
                    value={measurements.waist} 
                    onChange={e => setMeasurements({...measurements, waist: e.target.value})}
                    className="w-full bg-white dark:bg-[#1A1A20] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 32"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Hips (inches)</label>
                  <input 
                    type="number" 
                    value={measurements.hips} 
                    onChange={e => setMeasurements({...measurements, hips: e.target.value})}
                    className="w-full bg-white dark:bg-[#1A1A20] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Height (optional)</label>
                  <input 
                    type="text" 
                    value={measurements.height} 
                    onChange={e => setMeasurements({...measurements, height: e.target.value})}
                    className="w-full bg-white dark:bg-[#1A1A20] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 5'10&quot;"
                  />
                </div>
              </div>

              {product.sizeGuide && (
                <div className="mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 text-sm text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white block mb-1">Standard Size Guide:</strong>
                  {product.sizeGuide}
                </div>
              )}

              <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                <div className="flex justify-between items-start mb-2">
                  <strong className="text-blue-900 dark:text-blue-300 block text-sm">Quick Tips for Accuracy:</strong>
                  <button
                    onClick={() => setShowRuler(!showRuler)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 underline-offset-2 transition-colors"
                  >
                    {showRuler ? 'Hide Ruler' : 'Show Screen Ruler'}
                  </button>
                </div>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-disc pl-4">
                  <li>Keep the tape horizontal—don't let it dip in the back.</li>
                  <li>Measure over bare skin or form-fitting clothing.</li>
                  <li>Don't hold your breath or suck in your stomach.</li>
                  <li>Have a friend help if possible for the most accurate read.</li>
                </ul>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/10">
                {!recommendation ? (
                  <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Ruler className="w-5 h-5 mr-2" />
                    )}
                    Calculate Size
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 p-6 rounded-xl text-center relative">
                      <button onClick={handleCalculate} className="absolute top-4 right-4 text-blue-400 hover:text-blue-600" title="Recalculate">
                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-2">Recommended Size</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{recommendation.recommendedSize || 'N/A'}</p>
                    </div>
                    {recommendation.reason && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                        {recommendation.reason}
                      </p>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (recommendation.recommendedSize && product.sizes?.includes(recommendation.recommendedSize)) {
                            onSelectSize(recommendation.recommendedSize);
                            onClose();
                          }
                        }}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                      >
                        Select {recommendation.recommendedSize}
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </motion.div>
          <AnimatePresence>
            {showRuler && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-24 bg-yellow-300 dark:bg-yellow-600 shadow-2xl z-[150] border-r border-yellow-500 overflow-hidden flex flex-col print:absolute print:bg-white print:border-none print:shadow-none"
              >
                <button
                  onClick={() => setShowRuler(false)}
                  className="absolute top-2 right-2 p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10 print:hidden"
                >
                  <X className="w-4 h-4 text-black dark:text-white" />
                </button>

                <div className="w-16 h-full overflow-y-auto overflow-x-hidden border-r-2 border-black dark:border-white relative mt-16 pb-32 print:mt-0 print:border-black">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="absolute w-full border-t-2 border-black dark:border-white print:border-black" style={{ top: `${i * 96}px` }}>
                      <span className="absolute -right-4 -top-3 text-xs font-bold text-black dark:text-white print:text-black">{i}</span>
                      <div className="absolute w-8 border-t border-black/50 dark:border-white/50 right-0 print:border-black/50" style={{ top: '48px' }} />
                      <div className="absolute w-4 border-t border-black/30 dark:border-white/30 right-0 print:border-black/30" style={{ top: '24px' }} />
                      <div className="absolute w-4 border-t border-black/30 dark:border-white/30 right-0 print:border-black/30" style={{ top: '72px' }} />
                    </div>
                  ))}
                </div>
                
                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center space-y-3 px-2 z-20 bg-yellow-300 dark:bg-yellow-600 py-2 print:hidden">
                  <span className="text-[10px] text-center font-bold text-yellow-900 dark:text-yellow-100 leading-tight">
                    Approx 96 DPI scale.
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="bg-black text-white text-xs px-3 py-2 rounded-lg font-bold shadow-lg hover:bg-gray-800 transition-colors w-full"
                  >
                    Print
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
