const fs = require('fs');
let code = fs.readFileSync('src/components/ProductGrid.tsx', 'utf8');

code = code.replace(
  'className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center sm:text-left"',
  'className="text-4xl font-display tracking-tight text-neutral-900 dark:text-white mb-8 text-center sm:text-left"'
);

fs.writeFileSync('src/components/ProductGrid.tsx', code);
