const fs = require('fs');
let code = fs.readFileSync('src/components/UserProfile.tsx', 'utf8');

if (!code.includes('Trade-in Value')) {
  // Find where it renders the wallet item details
  code = code.replace(
    '<p className="text-xs text-gray-500 mt-1">Status: {item.status}</p>',
    '<p className="text-xs text-gray-500 mt-1">Status: {item.status}</p>\n                              <p className="text-xs font-bold text-green-500 mt-1">Estimated Trade-in Value: {formatPrice(item.product.price * 0.3)}</p>'
  );
  
  // also add a button to navigate to returns/trade-in if needed, or just display it
  
  fs.writeFileSync('src/components/UserProfile.tsx', code);
}
