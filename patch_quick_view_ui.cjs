const fs = require('fs');
let content = fs.readFileSync('src/components/QuickViewModal.tsx', 'utf-8');

const freqBoughtUI = `
              {freqBoughtProducts.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    Frequently Bought Together
                  </h4>
                  <div className="space-y-4">
                    {freqBoughtProducts.map(fbProduct => (
                      <div key={fbProduct.id} className="flex items-center space-x-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                        <SafeProductImage
                          src={fbProduct.image}
                          alt={fbProduct.name}
                          className="w-16 h-16 rounded-lg bg-white dark:bg-[#121216]"
                          imageClassName="w-full h-full object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{fbProduct.name}</h5>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatPrice(fbProduct.price)}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart({ ...fbProduct, selectedSize: fbProduct.sizes ? fbProduct.sizes[0] : undefined });
                          }}
                          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
`;

content = content.replace(
  '{product.sizes && product.sizes.length > 0 && (',
  freqBoughtUI + '\n              {product.sizes && product.sizes.length > 0 && ('
);

fs.writeFileSync('src/components/QuickViewModal.tsx', content);
