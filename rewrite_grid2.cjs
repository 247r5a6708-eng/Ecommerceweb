const fs = require('fs');
let content = fs.readFileSync('src/components/ProductGrid.tsx', 'utf-8');

// Replace import { products } from '../data';
content = content.replace("import { products } from '../data';", "import { useCatalog } from '../contexts/CatalogContext';");

// Insert useCatalog inside ProductGrid component
content = content.replace(
  "export default function ProductGrid({ onAddToCart, searchQuery, activeType, activeCategory, sortOption, wishlistItems, onToggleWishlist, isLoading = false, reviews, onOpenReviews, compareProducts = [], onToggleCompare, onProductClick, onNotifyMe }: ProductGridProps) {\n", 
  "export default function ProductGrid({ onAddToCart, searchQuery, activeType, activeCategory, sortOption, wishlistItems, onToggleWishlist, isLoading: propIsLoading = false, reviews, onOpenReviews, compareProducts = [], onToggleCompare, onProductClick, onNotifyMe }: ProductGridProps) {\n  const { products, isLoading: contextIsLoading } = useCatalog();\n  const isLoading = propIsLoading || contextIsLoading;\n"
);

fs.writeFileSync('src/components/ProductGrid.tsx', content);
