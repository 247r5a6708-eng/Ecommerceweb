const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex2 = /setRecentlyViewed\(prev => \{[\s\S]*?const filtered = prev\.filter\(p => p\.id !== product\.id\);[\s\S]*?return \[product, \.\.\.filtered\]\.slice\(0, 5\);[\s\S]*?\}\);/;
code = code.replace(regex2, 'addRecentlyViewed(product);');

fs.writeFileSync('src/App.tsx', code);
