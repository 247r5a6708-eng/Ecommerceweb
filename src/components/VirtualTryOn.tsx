import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface VirtualTryOnProps {
  category?: string;
  type?: string;
  productName?: string;
}

export default function VirtualTryOn({ category, type, productName = "Accessory" }: VirtualTryOnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const catLower = category?.toLowerCase() || '';
  const typeLower = type?.toLowerCase() || '';
  
  const isAccessory = catLower.includes('accessories') || typeLower.includes('accessories');

  if (!isAccessory) {
    return null;
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-bold text-base transition-all bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20 hover:bg-purple-600/20"
      >
        <Camera className="w-5 h-5" />
        <span>Virtual Try-On</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white font-medium text-sm">AR Try-On: {productName}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative aspect-[3/4] sm:aspect-video bg-black flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform -scale-x-100"
              />
              
              {/* Dummy SVG Overlay (Glasses) */}
              <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 pointer-events-none drop-shadow-2xl opacity-90">
                <svg viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]">
                  {/* Left Lens */}
                  <path d="M5 15 C 5 2, 42 2, 45 15 C 45 28, 5 28, 5 15 Z" fill="rgba(20,20,20,0.6)" stroke="#111" strokeWidth="2.5"/>
                  <path d="M8 10 C 15 5, 30 5, 35 8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  {/* Right Lens */}
                  <path d="M55 15 C 55 2, 92 2, 95 15 C 95 28, 55 28, 55 15 Z" fill="rgba(20,20,20,0.6)" stroke="#111" strokeWidth="2.5"/>
                  <path d="M58 10 C 65 5, 80 5, 85 8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  {/* Bridge */}
                  <path d="M45 12 C 48 10, 52 10, 55 12" stroke="#111" strokeWidth="2.5" fill="none"/>
                  {/* Arms */}
                  <path d="M5 12 L 0 8" stroke="#111" strokeWidth="2.5" fill="none"/>
                  <path d="M95 12 L 100 8" stroke="#111" strokeWidth="2.5" fill="none"/>
                </svg>
              </div>

              {/* Face Guide */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
                <div className="w-48 h-64 border-2 border-dashed border-white rounded-[40%]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
