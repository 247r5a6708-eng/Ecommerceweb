const fs = require('fs');
let code = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

// Container
code = code.replace(
  /className="bg-white dark:bg-\[#1A1A1A\] rounded-2xl shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] overflow-hidden flex flex-col h-full border border-gray-100 dark:border-white\/5 relative group"/,
  'className="bg-white dark:bg-[#121212] rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col h-full border border-neutral-200/60 dark:border-white/5 relative group"'
);

// Image container
code = code.replace(
  'className="aspect-[4/5] bg-gray-200 dark:bg-black overflow-hidden rounded-t-[calc(1.5rem-1px)] relative cursor-crosshair"',
  'className="aspect-[4/5] bg-[#F5F5F3] dark:bg-[#0A0A0A] overflow-hidden rounded-t-[calc(0.75rem-1px)] relative cursor-crosshair"'
);

// Fonts inside card
code = code.replace(
  'text-[10px] font-bold text-blue-400 dark:text-blue-400 uppercase tracking-[0.2em] mb-1.5',
  'text-[9px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2'
);
code = code.replace(
  'text-base font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug tracking-tight',
  'text-base font-medium text-gray-900 dark:text-white line-clamp-1 leading-snug tracking-tight'
);
code = code.replace(
  'text-lg font-extrabold text-gray-900 dark:text-white ml-3 tracking-tighter',
  'text-base font-medium text-gray-900 dark:text-white ml-3'
);

// Quick Add button
code = code.replace(
  'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200',
  'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200'
);

fs.writeFileSync('src/components/ProductCard.tsx', code);
