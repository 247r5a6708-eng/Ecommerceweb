const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

appContent = appContent.replace(
  "import { onAuthStateChanged, signOut } from 'firebase/auth';",
  "import { onAuthStateChanged, signOut } from 'firebase/auth';\nimport * as firestoreService from './lib/firestore';"
);

// We should intercept local storage syncs. 
// Right now, it's done via useEffects like:
// useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlistItems)); }, [wishlistItems]);

appContent = appContent.replace(
  "    const unsubscribe = onAuthStateChanged(auth, (user) => {",
  `    const unsubscribe = onAuthStateChanged(auth, async (user) => {`
);

appContent = appContent.replace(
  "      setFirebaseUser(user);\n      if (user) {\n        setUserProfile(prev => ({\n          ...prev,\n          name: user.displayName || prev.name,\n          email: user.email || prev.email,\n        }));\n      }",
  `      setFirebaseUser(user);
      if (user) {
        // Fetch data from Firestore
        const profile = await firestoreService.getUserProfile(user.uid);
        if (profile) {
          setUserProfile(prev => ({
            ...prev,
            ...profile,
            name: user.displayName || profile.name || prev.name,
            email: user.email || profile.email || prev.email,
          }));
        } else {
          setUserProfile(prev => ({
            ...prev,
            name: user.displayName || prev.name,
            email: user.email || prev.email,
          }));
        }

        const fbOrders = await firestoreService.getUserOrders(user.uid);
        if (fbOrders.length > 0) setOrders(fbOrders);

        const fbWishlist = await firestoreService.getUserWishlist(user.uid);
        if (fbWishlist.length > 0) setWishlistItems(fbWishlist);

        const fbWallet = await firestoreService.getUserWallet(user.uid);
        if (fbWallet.length > 0) setWalletItems(fbWallet);
      }`
);

// Replace localstorage sync for orders
appContent = appContent.replace(
  "  useEffect(() => {\n    localStorage.setItem('orders', JSON.stringify(orders));\n  }, [orders]);",
  `  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);`
);

fs.writeFileSync('src/App.tsx', appContent);
