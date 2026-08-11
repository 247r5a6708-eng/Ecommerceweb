const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

appContent = appContent.replace(
  "  const handlePlaceOrder = (order: Order) => {\n    setOrders(prev => [order, ...prev]);",
  `  const handlePlaceOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    if (firebaseUser) {
       firestoreService.saveOrder(firebaseUser.uid, order);
    }`
);

appContent = appContent.replace(
  "  const handleCancelOrder = (orderId: string) => {\n    setOrders(prev => prev.map(order => \n      order.id === orderId \n        ? { ...order, status: 'cancelled' }\n        : order\n    ));",
  `  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'cancelled' }
        : order
    ));
    if (firebaseUser) {
      firestoreService.updateOrderState(firebaseUser.uid, orderId, 'cancelled');
    }`
);

appContent = appContent.replace(
  "  const handleToggleWishlist = (productId: string) => {\n    const isAdding = !wishlistItems.includes(productId);\n    if (isAdding) {\n      addToast({ title: 'Added to Wishlist', message: 'Item saved for later', type: 'success' });\n    } else {\n      addToast({ title: 'Removed from Wishlist', message: 'Item removed from your list', type: 'info' });\n    }\n    \n    setWishlistItems(prev => \n      isAdding ? [...prev, productId] : prev.filter(id => id !== productId)\n    );\n  };",
  `  const handleToggleWishlist = (productId: string) => {
    const isAdding = !wishlistItems.includes(productId);
    if (isAdding) {
      addToast({ title: 'Added to Wishlist', message: 'Item saved for later', type: 'success' });
    } else {
      addToast({ title: 'Removed from Wishlist', message: 'Item removed from your list', type: 'info' });
    }
    
    setWishlistItems(prev => {
      const next = isAdding ? [...prev, productId] : prev.filter(id => id !== productId);
      if (firebaseUser) {
        firestoreService.saveUserWishlist(firebaseUser.uid, next);
      }
      return next;
    });
  };`
);

appContent = appContent.replace(
  "  const handleUpdateProfile = (newProfile: UserProfileData) => {\n    setUserProfile(newProfile);\n    addToast({ title: 'Profile Updated', message: 'Your changes have been saved', type: 'success' });\n  };",
  `  const handleUpdateProfile = (newProfile: UserProfileData) => {
    setUserProfile(newProfile);
    if (firebaseUser) {
      firestoreService.updateUserProfile(firebaseUser.uid, newProfile);
    }
    addToast({ title: 'Profile Updated', message: 'Your changes have been saved', type: 'success' });
  };`
);

fs.writeFileSync('src/App.tsx', appContent);
