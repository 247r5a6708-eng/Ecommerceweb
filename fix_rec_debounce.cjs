const fs = require('fs');
let content = fs.readFileSync('src/components/Recommendations.tsx', 'utf-8');

const debounceLogic = `  useEffect(() => {
    // Only fetch if we have some signal
    if (wishlistItems.length === 0 && cartItems.length === 0) {
      setRecommendedIds([]);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai-recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            wishlistIds: wishlistItems,
            cartIds: cartItems.map(c => c.id || c.productId)
          })
        });
        const data = await res.json();
        setRecommendedIds(data.recommendedIds || []);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 1500);

    return () => clearTimeout(timer);
  }, [wishlistItems, cartItems]);`;

content = content.replace(/  useEffect\(\(\) => \{\n    \/\/ Only fetch if we have some signal[\s\S]*?fetchRecommendations\(\);\n  \}, \[wishlistItems, cartItems\]\);/, debounceLogic);

fs.writeFileSync('src/components/Recommendations.tsx', content);
