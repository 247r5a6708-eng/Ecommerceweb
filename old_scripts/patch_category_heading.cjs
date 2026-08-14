const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryFilter.tsx', 'utf8');

code = code.replace(
  'className="text-4xl font-display font-medium tracking-tight text-gray-900 dark:text-white"',
  'className="text-5xl md:text-6xl font-display tracking-tight text-neutral-900 dark:text-white"'
);

fs.writeFileSync('src/components/CategoryFilter.tsx', code);
