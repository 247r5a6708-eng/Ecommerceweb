const fs = require('fs');
let content = fs.readFileSync('src/components/ProductGrid.tsx', 'utf-8');

// Update Props
content = content.replace("export interface ProductGridProps {", "export interface ProductGridProps {\n  aiMatchedIds?: string[] | null;\n  isAiSearching?: boolean;");

// Update Component Signature
content = content.replace(
  "export default function ProductGrid({ onAddToCart, searchQuery, activeType, activeCategory, sortOption, wishlistItems, onToggleWishlist, isLoading: propIsLoading = false, reviews, onOpenReviews, compareProducts = [], onToggleCompare, onProductClick, onNotifyMe }: ProductGridProps) {",
  "export default function ProductGrid({ onAddToCart, searchQuery, activeType, activeCategory, sortOption, wishlistItems, onToggleWishlist, isLoading: propIsLoading = false, reviews, onOpenReviews, compareProducts = [], onToggleCompare, onProductClick, onNotifyMe, aiMatchedIds, isAiSearching }: ProductGridProps) {"
);

// Update isLoading logic to also include isAiSearching
content = content.replace("const isLoading = propIsLoading || contextIsLoading;", "const isLoading = propIsLoading || contextIsLoading || isAiSearching;");

// Update filteredProducts logic to prioritize AI matches
const filterLogicToReplace = `      if (!searchQuery) return matchesCategory && matchesType;
      
      const query = searchQuery.toLowerCase();`;

const newFilterLogic = `      if (aiMatchedIds) {
        return aiMatchedIds.includes(p.id) && matchesCategory && matchesType;
      }
      
      if (!searchQuery) return matchesCategory && matchesType;
      
      const query = searchQuery.toLowerCase();`;

content = content.replace(filterLogicToReplace, newFilterLogic);

// Add aiMatchedIds to dependency array
content = content.replace("}, [searchQuery, activeType, activeCategory, sortOption]);", "}, [searchQuery, activeType, activeCategory, sortOption, aiMatchedIds]);");

fs.writeFileSync('src/components/ProductGrid.tsx', content);
