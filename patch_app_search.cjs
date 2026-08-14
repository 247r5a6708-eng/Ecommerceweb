const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { useOrders } from './hooks/useOrders';",
  "import { useOrders } from './hooks/useOrders';\nimport { useSearch } from './hooks/useSearch';"
);

// We need to replace the searchQuery block. It goes from `const [searchQuery, setSearchQuery] = useState('');` to the end of the `useEffect` block.
// This is around line 120-155.
// Let's use a regex to replace it.
const regex = /const \[searchQuery, setSearchQuery\] = useState\(''\);[\s\S]*?\}, \[searchQuery\]\);/;
code = code.replace(regex, 'const { searchQuery, setSearchQuery, aiMatchedIds, isAiSearching } = useSearch();');

fs.writeFileSync('src/App.tsx', code);
