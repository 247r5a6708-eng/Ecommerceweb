const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard useState for cartItems
if (code.includes('const [cartItems, setCartItems] = useState<CartItem[]>([]);')) {
  // Add hook imports
  code = code.replace(
    "import { useUser } from './contexts/UserContext';",
    "import { useUser } from './contexts/UserContext';\nimport { useCart } from './hooks/useCart';\nimport { useOrders } from './hooks/useOrders';"
  );

  // Remove old states
  code = code.replace('const [cartItems, setCartItems] = useState<CartItem[]>([]);\n', '');
  code = code.replace('const [isCartLoading, setIsCartLoading] = useState(false);\n', '');
  // Remove duplicate isCartOpen if they both exist (we get isCartOpen from useCart)
  code = code.replace('const [isCartOpen, setIsCartOpen] = useState(false);\n', '');
  
  // Inject hooks
  code = code.replace(
    'const [firebaseUser, setFirebaseUser] = useState<any>(null);',
    `const [firebaseUser, setFirebaseUser] = useState<any>(null);
  
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    isCartLoading,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart
  } = useCart(firebaseUser);

  const {
    orders: userOrders,
    handlePlaceOrder,
    handleCancelOrder,
    setOrders: setUserOrders
  } = useOrders(firebaseUser, userProfile);

  // Note: App originally had its own orders state in useUser(). Let's map it.
  useEffect(() => {
    setOrders(userOrders);
  }, [userOrders, setOrders]);
  `
  );

  // Remove the old handleAddToCart
  code = code.replace(/const handleAddToCart = \([\s\S]*?\}\);\s*\}\s*\};\s*return newItems;\s*\}\);\s*\};\s*const handlePlaceOrder/s, 'const handlePlaceOrder');

  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched cart hooks");
}

