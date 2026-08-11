const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');

content = content.replace(
  'className="relative min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-[#030305] z-30"',
  'className="relative min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-[#030305] overflow-hidden"'
);

fs.writeFileSync('src/components/Hero.tsx', content);
