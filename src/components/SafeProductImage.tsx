import React, { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductImage } from '../types';

interface SafeProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  style?: React.CSSProperties;
  imageObj?: ProductImage; // Phase 2 requirement
}

export default function SafeProductImage({ src, alt, className, imageClassName, style, imageObj }: SafeProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const imageUrl = imageObj?.url || src;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    if (!imageUrl) {
      setStatus('error');
      return;
    }

    if (imageObj && imageObj.verificationStatus !== 'verified') {
       setStatus('error');
       return;
    }

    setStatus('loading');
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setStatus('loaded');
    };
    img.onerror = () => {
      setStatus('error');
    };
  }, [imageUrl, imageObj, inView]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className || ''}`}>
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-200 dark:bg-gray-800 overflow-hidden"
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent blur-md"
            />
          </motion.div>
        )}
        
        {status === 'loaded' && imageUrl && (
          <motion.img
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={imageUrl}
            alt={alt}
            style={style}
            loading="lazy"
            className={`w-full h-full object-cover ${imageClassName || ''}`}
          />
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 p-4 text-center"
          >
            <ImageOff className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium uppercase tracking-wider">Image Unavailable</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
