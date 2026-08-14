const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the cart loading logic from App.tsx since useCart handles it
code = code.replace(
  /        setIsCartLoading\(true\);\s*try \{\s*const fbCart = await firestoreService\.getUserCart\(user\.uid\);\s*if \(fbCart\.length > 0\) setCartItems\(fbCart\);\s*\} finally \{\s*setIsCartLoading\(false\);\s*\}/,
  ""
);

code = code.replace(
  /      \} else \{\s*\/\/ Clear data on logout if necessary \(optional\)\s*setCartItems\(\[\]\);\s*\}/,
  "      } else {\n      }"
);

code = code.replace(
  /  useEffect\(\(\) => \{\s*if \(firebaseUser && !isCartLoading\) \{\s*firestoreService\.saveUserCart\(firebaseUser\.uid, cartItems\);\s*\}\s*\}, \[cartItems, firebaseUser, isCartLoading\]\);/,
  ""
);

// fix onClearCart mapping in Cart component where setCartItems was used
code = code.replace(
  /onClearCart=\{() => setCartItems\(\[\]\)\}/g,
  "onClearCart={handleClearCart}"
);

fs.writeFileSync('src/App.tsx', code);
