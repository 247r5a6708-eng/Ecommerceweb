const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

if (!code.includes('Frequently Bought Together')) {
  const freqBoughtRendering = `
          {freqBoughtProducts.length > 0 && (
            <div className="mt-16 border-t border-gray-100 dark:border-white/5 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Bought Together</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {freqBoughtProducts.map(fp => (
                  <div key={fp.id} className="bg-white dark:bg-[#121216] border border-gray-100 dark:border-white/5 p-4 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(\`/product/\${fp.id}\`)}>
                    <SafeProductImage src={fp.image} alt={fp.name} className="w-full aspect-square bg-gray-50 dark:bg-white/5 rounded-xl mb-4" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{fp.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatPrice(fp.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;
  code = code.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}\s*$/,
    freqBoughtRendering
  );
  fs.writeFileSync('src/pages/ProductPage.tsx', code);
}
