const fs = require('fs');
let content = fs.readFileSync('src/components/QuickViewModal.tsx', 'utf-8');

const loaderUI = `
              {isFreqBoughtLoading ? (
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Frequently Bought Together</h4>
                  <div className="flex justify-center items-center py-4 text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2 text-sm font-medium">Finding perfect matches...</span>
                  </div>
                </div>
              ) : freqBoughtProducts.length > 0 && (
`;

content = content.replace('{freqBoughtProducts.length > 0 && (', loaderUI);

fs.writeFileSync('src/components/QuickViewModal.tsx', content);
