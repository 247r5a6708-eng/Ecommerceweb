const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'const { wishlistIds, cartIds } = req.body;',
  'const { wishlistIds, cartIds, viewedIds = [], orderedIds = [] } = req.body;'
);
code = code.replace(
  'const cacheKey = JSON.stringify({ w: wishlistIds, c: cartIds });',
  'const cacheKey = JSON.stringify({ w: wishlistIds, c: cartIds, v: viewedIds, o: orderedIds });'
);
code = code.replace(
  'The user has the following product IDs in their cart: ${JSON.stringify(cartIds)}\nHere is our catalog:',
  'The user has the following product IDs in their cart: ${JSON.stringify(cartIds)}\nThe user has recently viewed the following product IDs: ${JSON.stringify(viewedIds)}\nThe user has previously ordered the following product IDs: ${JSON.stringify(orderedIds)}\nHere is our catalog:'
);
code = code.replace(
  'Based on their wishlist and cart, suggest 4 related product IDs from the catalog that they might also like. Do not suggest products already in their wishlist or cart if possible.',
  'Based on their wishlist, cart, browsing history, and past orders, suggest 4 related product IDs from the catalog that they might also like. Do not suggest products already in their wishlist, cart, or past orders if possible.'
);
fs.writeFileSync('server.ts', code);
