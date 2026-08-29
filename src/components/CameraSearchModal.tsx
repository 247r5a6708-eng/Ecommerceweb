import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCcw, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCatalog } from '../contexts/CatalogContext';
import SafeProductImage from './SafeProductImage';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

interface CameraSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraSearchModal({ isOpen, onClose }: CameraSearchModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const { products } = useCatalog();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen && !snapshot && !isSearching) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
      setSnapshot(null);
      setMatchedProducts([]);
    }
    return () => stopCamera();
  }, [isOpen, snapshot, isSearching]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      // Fallback if environment camera isn't available
      try {
         const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
         setStream(mediaStream);
         if (videoRef.current) {
           videoRef.current.srcObject = mediaStream;
         }
      } catch(fallbackErr) {
         console.error("Camera access error (fallback):", fallbackErr);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setSnapshot(dataUrl);
        stopCamera();
        performMockSearch();
      }
    }
  };

  const performMockSearch = () => {
    setIsSearching(true);
    // Mock network request / AI processing delay
    setTimeout(() => {
      // Pick 2-3 random products from the catalog to act as matches
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      setMatchedProducts(selected);
      setIsSearching(false);
    }, 2000);
  };

  const retake = () => {
    setSnapshot(null);
    setMatchedProducts([]);
    setIsSearching(false);
  };

  const handleProductClick = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Camera / Image Area */}
            <div className="relative flex-1 bg-black min-h-[300px] flex items-center justify-center">
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors md:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              <canvas ref={canvasRef} className="hidden" />

              {!snapshot ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Framing Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-white/50 rounded-xl relative">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-white" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-white" />
                    </div>
                    <p className="text-white text-sm font-medium mt-6 bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
                      Center object in frame
                    </p>
                  </div>

                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <button
                      onClick={captureImage}
                      className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border-2 border-white/50"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
                        <Search className="w-6 h-6" />
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <img src={snapshot} alt="Captured" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Results Area */}
            <div className="w-full md:w-96 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-white/10 flex flex-col max-h-[50vh] md:max-h-none overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                  <Search className="w-4 h-4 mr-2" /> Visual Search
                </h3>
                <div className="flex items-center space-x-2">
                  {snapshot && !isSearching && (
                    <button onClick={retake} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Retake">
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors hidden md:block">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {!snapshot && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-6">
                    <Camera className="w-12 h-12 mb-4 opacity-50" />
                    <p>Snap a photo of an item you like, and our AI will find similar products in our catalog.</p>
                  </div>
                )}

                {isSearching && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                      <Search className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Analyzing Image...</p>
                      <p className="text-sm text-gray-500">Finding visual matches</p>
                    </div>
                  </div>
                )}

                {!isSearching && matchedProducts.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Matches Found</p>
                    {matchedProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl hover:border-blue-500 transition-colors text-left group"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 dark:bg-white/5 shrink-0">
                          <SafeProductImage src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">{product.name}</p>
                          <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
