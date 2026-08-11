const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');

// 1. Change wrapper back to z-30 without overflow-hidden
content = content.replace(
  'className="relative min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-[#030305] overflow-hidden"',
  'className="relative min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-[#030305] z-30"'
);

// 2. Wrap background elements in overflow-hidden div
const oldBg = `{/* 3D Grid Background */}
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
      />`;

const newBg = `<div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>`;

content = content.replace(oldBg, newBg);
fs.writeFileSync('src/components/Hero.tsx', content);
