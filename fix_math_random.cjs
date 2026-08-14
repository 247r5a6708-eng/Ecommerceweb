const fs = require('fs');

const replaceInFile = (file, from, to) => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replaceAll(from, to);
  fs.writeFileSync(file, code);
};

// Cart.tsx
replaceInFile('src/components/Cart.tsx', 
  'id: Math.random().toString(36).substr(2, 9).toUpperCase(),',
  'id: crypto.randomUUID().split("-")[0].toUpperCase(),'
);

// App.tsx
replaceInFile('src/App.tsx', 
  'id: Math.random().toString(36).substr(2, 9),',
  'id: crypto.randomUUID(),'
);

replaceInFile('src/App.tsx', 
  'Math.random().toString(36).substr(2, 9)',
  'crypto.randomUUID()'
);

// ProductGrid.tsx
// It uses Math.random() for shuffling. That's fine. We don't necessarily have to remove it if it's just shuffling an array.

// data.ts
// currentPrice = currentPrice * (1 + (Math.random() * 0.04 - 0.02)); 
// That's generating a dummy price history. The instructions state "Never fabricate price history."
