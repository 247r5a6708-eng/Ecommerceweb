import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Search } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface HeroProps {
  onSearch?: (intent: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [intent, setIntent] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;
    
    if (onSearch) {
      onSearch(intent);
    }
    
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#030305]"
    >
      {/* 3D Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 [transform:perspective(1000px)_rotateX(60deg)_translateY(100px)_scale(2)] origin-bottom" />
      
      {/* Animated Orbs */}
      <motion.div 
        animate={{
          x: mousePosition.x * -100,
          y: mousePosition.y * -100,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{
          x: mousePosition.x * 100,
          y: mousePosition.y * 100,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          style={{ y: y1, opacity }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.05]"
          >
            <span className="text-gray-900 dark:text-white">Shop The</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 neon-text-shadow">Future</span>
          </motion.h1>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onSubmit={handleSubmit} 
            className="relative group max-w-3xl mx-auto"
            style={{ 
              transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl transition-opacity opacity-50 group-hover:opacity-100" />
            
            <div className="relative glass-panel rounded-3xl p-2 flex items-center border border-white/20">
              <div className="pl-6 pointer-events-none">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="block w-full pl-6 pr-6 py-6 bg-transparent text-xl placeholder-gray-500 focus:outline-none text-gray-900 dark:text-white font-medium"
                placeholder="Initialize search sequence..."
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-8 py-5 border border-transparent text-lg font-bold rounded-2xl text-black bg-white hover:bg-blue-50 focus:outline-none transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] active:scale-95 whitespace-nowrap"
              >
                Execute <ArrowRight className="ml-3 w-5 h-5" />
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
