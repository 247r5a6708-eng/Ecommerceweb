const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

appContent = appContent.replace(
  "    setWalletItems(prev => [...newWalletItems, ...prev]);",
  `    setWalletItems(prev => [...newWalletItems, ...prev]);
    if (firebaseUser) {
      newWalletItems.forEach(wi => firestoreService.saveWalletProduct(firebaseUser.uid, wi));
    }`
);

appContent = appContent.replace(
  "    setReviews(prev => ({\n      ...prev,\n      [productId]: [...(prev[productId] || []), newReview],\n    }));",
  `    setReviews(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), newReview],
    }));
    if (firebaseUser) {
      firestoreService.saveReview(productId, { ...newReview, userId: firebaseUser.uid });
    }`
);

// We should also replace the hardcoded "Alex Johnson" guest profile in UserProfile since it says: "Remove fake default identity data such as 'Alex Johnson' for real users. For an unauthenticated user, show: 'Guest'"
appContent = appContent.replace(
  "  const [userProfile, setUserProfile] = useState(() => {\n    const saved = localStorage.getItem('userProfile');\n    return saved ? JSON.parse(saved) : {\n      name: 'Alex Johnson',\n      email: 'alex.johnson@example.com',\n      phone: '+1 (555) 123-4567',\n      address: '123 Innovation Drive, Tech City, TC 90210',\n      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'\n    };\n  });",
  `  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      name: 'Guest',
      email: '',
      phone: '',
      address: '',
      avatar: 'https://ui-avatars.com/api/?name=Guest&background=random'
    };
  });`
);

fs.writeFileSync('src/App.tsx', appContent);
