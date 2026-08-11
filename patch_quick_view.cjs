const fs = require('fs');
let content = fs.readFileSync('src/components/QuickViewModal.tsx', 'utf-8');

const hookStr = `  const { userProfile } = useUser();
  const { products } = useCatalog();
  const [frequentlyBoughtIds, setFrequentlyBoughtIds] = useState<string[]>([]);
  const [isFreqBoughtLoading, setIsFreqBoughtLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && product) {
      const fetchFreqBought = async () => {
        setIsFreqBoughtLoading(true);
        try {
          const res = await fetch('/api/frequently-bought', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              productId: product.id, 
              cartIds: cartItems.map(c => c.id || c.productId)
            })
          });
          const data = await res.json();
          setFrequentlyBoughtIds(data.recommendedIds || []);
        } catch (error) {
          console.error("Failed to fetch freq bought", error);
        } finally {
          setIsFreqBoughtLoading(false);
        }
      };
      fetchFreqBought();
    } else {
      setFrequentlyBoughtIds([]);
    }
  }, [isOpen, product, cartItems]);
  
  const freqBoughtProducts = products.filter(p => frequentlyBoughtIds.includes(p.id));`;

content = content.replace('  const { userProfile } = useUser();', hookStr);
fs.writeFileSync('src/components/QuickViewModal.tsx', content);
