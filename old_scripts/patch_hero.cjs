const fs = require('fs');
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Change hero text
code = code.replace(
  'className="text-6xl md:text-8xl font-normal tracking-tight mb-8 leading-[1.05]"',
  'className="text-6xl md:text-8xl font-display tracking-tight mb-8 leading-none"'
);
code = code.replace(
  '<span className="text-gray-900 dark:text-white">Shop The</span> <br />',
  '<span className="text-gray-900 dark:text-white font-medium">Shop The</span> <br />'
);
code = code.replace(
  '<span className="text-gray-500 dark:text-gray-400 italic">Future</span>',
  '<span className="text-neutral-400 dark:text-neutral-500 italic">Future</span>'
);

// Update background
code = code.replace(
  'bg-gray-50 dark:bg-[#030305]',
  'bg-transparent'
);
code = code.replace(
  'bg-white dark:bg-[#111] border',
  'bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border'
);

fs.writeFileSync('src/components/Hero.tsx', code);
