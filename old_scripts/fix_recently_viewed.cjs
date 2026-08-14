const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { useSearch } from './hooks/useSearch';",
  "import { useSearch } from './hooks/useSearch';\nimport { useRecentlyViewed } from './hooks/useRecentlyViewed';"
);

// We need to replace:
//   const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
//     const saved = localStorage.getItem('recentlyViewed');
//     return saved ? JSON.parse(saved) : [];
//   });
// with:
//   const { recentlyViewed, addRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

const regex1 = /const \[recentlyViewed, setRecentlyViewed\] = useState<Product\[\]>\(\(\) => \{[\s\S]*?return saved \? JSON\.parse\(saved\) : \[\];\n  \}\);/;
code = code.replace(regex1, 'const { recentlyViewed, addRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();');

// Also replace:
//     setRecentlyViewed(prev => {
//       const filtered = prev.filter(p => p.id !== product.id);
//       return [product, ...filtered].slice(0, 5); // Keep last 5
//     });
// with:
//     addRecentlyViewed(product);

const regex2 = /setRecentlyViewed\(prev => \{[\s\S]*?const filtered = prev\.filter\(p => p\.id !== product\.id\);[\s\S]*?return \[product, \.\.\.filtered\]\.slice\(0, 5\); \/\/ Keep last 5[\s\S]*?\}\);/;
code = code.replace(regex2, 'addRecentlyViewed(product);');

// Also replace:
//   useEffect(() => {
//     localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
//   }, [recentlyViewed]);

const regex3 = /useEffect\(\(\) => \{\n    localStorage\.setItem\('recentlyViewed', JSON\.stringify\(recentlyViewed\)\);\n  \}, \[recentlyViewed\]\);/;
code = code.replace(regex3, '');

// Also replace:
//           setRecentlyViewed([]);
//           localStorage.removeItem('recentlyViewed');
// with:
//           clearRecentlyViewed();

const regex4 = /setRecentlyViewed\(\[\]\);\n          localStorage\.removeItem\('recentlyViewed'\);/;
code = code.replace(regex4, 'clearRecentlyViewed();');

fs.writeFileSync('src/App.tsx', code);
