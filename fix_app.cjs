const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Revert the useOrders injection
code = code.replace(
  "import { useUser } from './contexts/UserContext';\nimport { useCart } from './hooks/useCart';\nimport { useOrders } from './hooks/useOrders';",
  "import { useUser } from './contexts/UserContext';\nimport { useCart } from './hooks/useCart';"
);

code = code.replace(/const \{\s*orders: userOrders,\s*handlePlaceOrder,\s*handleCancelOrder,\s*setOrders: setUserOrders\s*\} = useOrders\(firebaseUser, userProfile\);\s*\/\/ Note: App originally had its own orders state in useUser\(\)\. Let's map it\.\s*useEffect\(\(\) => \{\s*setOrders\(userOrders\);\s*\}, \[userOrders, setOrders\]\);/g, '');

fs.writeFileSync('src/App.tsx', code);
