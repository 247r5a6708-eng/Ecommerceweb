const fs = require('fs');
let code = fs.readFileSync('src/components/RecentlyViewed.tsx', 'utf8');

code = code.replace(
  'className="bg-gray-50 dark:bg-[#121216]/50 py-12 border-t border-gray-100 dark:border-white/5"',
  'className="bg-transparent py-16 border-t border-neutral-200/50 dark:border-white/5"'
);

fs.writeFileSync('src/components/RecentlyViewed.tsx', code);
