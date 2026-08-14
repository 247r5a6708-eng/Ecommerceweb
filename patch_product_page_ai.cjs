const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const importsToAdd = `import { useUser } from '../contexts/UserContext';
import { TrendingUp, Activity, UserCheck, CheckCircle2 } from 'lucide-react';
import PriceChart from '../components/PriceChart';`;

code = code.replace(
  "import { Star, ShoppingBag, ArrowLeft } from 'lucide-react';",
  "import { Star, ShoppingBag, ArrowLeft } from 'lucide-react';\n" + importsToAdd
);

const stateAndEffect = `  const { userProfile } = useUser();
  const [frequentlyBoughtIds, setFrequentlyBoughtIds] = useState<string[]>([]);
  const [aiCompat, setAiCompat] = useState<any>(null);
  const [aiPriceInsight, setAiPriceInsight] = useState<any>(null);

  useEffect(() => {
    if (!product) return;
    
    // Frequently Bought
    fetch('/api/frequently-bought', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, cartIds: cartItems.map(i => i.id) })
    }).then(r => r.json()).then(data => setFrequentlyBoughtIds(data.recommendedIds || [])).catch(console.error);

    // AI Compat
    if (userProfile) {
      fetch('/api/ai-compatibility-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, userProfile })
      }).then(r => r.json()).then(data => setAiCompat(data)).catch(console.error);
    }
    
    // Price Insight
    fetch('/api/ai-price-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id })
    }).then(r => r.json()).then(data => setAiPriceInsight(data)).catch(console.error);
    
  }, [product, userProfile, cartItems]);
  
  const freqBoughtProducts = products.filter(p => frequentlyBoughtIds.includes(p.id) && p.id !== product?.id);
`;

code = code.replace(
  "const productReviews = reviews[product.id] || [];",
  stateAndEffect + "\n  const productReviews = reviews[product.id] || [];"
);

const renderingCode = `
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {aiCompat && (
                  <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20 p-4 rounded-xl">
                    <div className="flex items-center text-purple-600 dark:text-purple-400 font-bold text-sm mb-2">
                      <UserCheck className="w-4 h-4 mr-2" /> AI Compatibility: {aiCompat.score}%
                    </div>
                    <p className="text-xs text-purple-800 dark:text-purple-300">{aiCompat.reason}</p>
                  </div>
                )}
                {aiPriceInsight && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl">
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm mb-2">
                      <TrendingUp className="w-4 h-4 mr-2" /> AI Price Intel: {aiPriceInsight.advice}
                    </div>
                    <p className="text-xs text-blue-800 dark:text-blue-300">{aiPriceInsight.analysis}</p>
                  </div>
                )}
              </div>
              
              {product.priceHistory && (
                 <div className="mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                   <div className="flex items-center text-sm font-bold text-gray-900 dark:text-white mb-4">
                     <Activity className="w-4 h-4 mr-2" /> Price History
                   </div>
                   <PriceChart data={product.priceHistory} />
                 </div>
              )}
`;

code = code.replace(
  "{product.sizes && product.sizes.length > 0",
  renderingCode + "\n              {product.sizes && product.sizes.length > 0"
);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
