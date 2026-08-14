const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryFilter.tsx', 'utf8');

code = code.replace(
  /className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap \${/g,
  'className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${'
);
code = code.replace(
  /'bg-black dark:bg-white text-white dark:text-black shadow-sm'/g,
  "'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm'"
);

fs.writeFileSync('src/components/CategoryFilter.tsx', code);
