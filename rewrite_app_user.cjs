const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
content = content.replace("import { useCatalog } from './contexts/CatalogContext';", "import { useCatalog } from './contexts/CatalogContext';\nimport { useUser } from './contexts/UserContext';");

// Replace state hooks with context hook
content = content.replace("export default function App() {\n  const { products, isLoading } = useCatalog();\n", "export default function App() {\n  const { products, isLoading } = useCatalog();\n  const { wishlistItems, setWishlistItems, orders, setOrders, walletItems, setWalletItems, userProfile, setUserProfile, reviews, setReviews } = useUser();\n");

// Remove the old useState declarations for these
content = content.replace(/  const \[wishlistItems, setWishlistItems\] = useState<string\[\]>\(\(\) => {[\s\S]*?\}\);\n/m, '');
content = content.replace(/  const \[orders, setOrders\] = useState<Order\[\]>\(\(\) => {[\s\S]*?\}\);\n/m, '');
content = content.replace(/  const \[userProfile, setUserProfile\] = useState<UserProfileData>\(\(\) => {[\s\S]*?\}\);\n/m, '');
content = content.replace(/  const \[walletItems, setWalletItems\] = useState<WalletProduct\[\]>\(\(\) => {[\s\S]*?\}\);\n/m, '');
content = content.replace(/  const \[reviews, setReviews\] = useState<Review\[\]>\(\(\) => {[\s\S]*?\}\);\n/m, '');

// Remove useEffects saving to localStorage for these items
content = content.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\('wishlist', JSON\.stringify\(wishlistItems\)\);\n  \}, \[wishlistItems\]\);\n/m, '');
content = content.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\('orders', JSON\.stringify\(orders\)\);\n  \}, \[orders\]\);\n/m, '');
content = content.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\('userProfile', JSON\.stringify\(userProfile\)\);\n  \}, \[userProfile\]\);\n/m, '');
content = content.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\('walletItems', JSON\.stringify\(walletItems\)\);\n  \}, \[walletItems\]\);\n/m, '');
content = content.replace(/  useEffect\(\(\) => \{\n    localStorage\.setItem\('reviews', JSON\.stringify\(reviews\)\);\n  \}, \[reviews\]\);\n/m, '');

fs.writeFileSync('src/App.tsx', content);
