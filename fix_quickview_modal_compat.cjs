const fs = require('fs');
let content = fs.readFileSync('src/components/QuickViewModal.tsx', 'utf-8');

const imports = `import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Star, Mail, TrendingUp, TrendingDown, Minus, Loader2, UserCheck } from 'lucide-react';
import { Product, Review } from '../types';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useUser } from '../contexts/UserContext';
import SafeProductImage from './SafeProductImage';`;

const aiState = `  const { userProfile } = useUser();
  const [aiCompat, setAiCompat] = useState<any>(null);
  const [isCompatAnalyzing, setIsCompatAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && product && userProfile) {
      const fetchCompat = async () => {
        setIsCompatAnalyzing(true);
        try {
          const res = await fetch('/api/ai-compatibility-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, userProfile })
          });
          const data = await res.json();
          setAiCompat(data);
        } catch (error) {
          console.error("Failed to fetch compat", error);
        } finally {
          setIsCompatAnalyzing(false);
        }
      };
      fetchCompat();
    } else {
      setAiCompat(null);
    }
  }, [isOpen, product, userProfile]);`;

content = content.replace(/import \{ motion.*SafeProductImage';/s, imports);

content = content.replace("  const [aiPriceInsight, setAiPriceInsight] = useState<any>(null);", aiState + "\n  const [aiPriceInsight, setAiPriceInsight] = useState<any>(null);");

const compatUi = `
              {/* Phase 6: Compatibility Intelligence */}
              <div className="mb-6 p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <UserCheck className="w-4 h-4 mr-2 text-purple-500" />
                  Personal Match Score
                </h4>
                {isCompatAnalyzing ? (
                   <div className="flex items-center space-x-2 text-sm text-gray-500">
                     <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                     <span>Analyzing against your profile...</span>
                   </div>
                ) : aiCompat ? (
                   <div className="space-y-2">
                     <div className="flex items-center space-x-3">
                       <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                         {aiCompat.score}%
                       </div>
                       <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: \`\${aiCompat.score}%\` }} />
                       </div>
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       {aiCompat.reason}
                     </p>
                   </div>
                ) : null}
              </div>
`;

content = content.replace("{/* Phase 7: Price Intelligence */}", compatUi + "\n              {/* Phase 7: Price Intelligence */}");

fs.writeFileSync('src/components/QuickViewModal.tsx', content);
