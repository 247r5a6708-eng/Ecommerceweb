const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

const target = `] as Product[]).map((product: Product) => {
 const priceHistory = [];
 let currentPrice = product.price;
 for (let i = 30; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  priceHistory.push({
   date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
   price: Number(currentPrice.toFixed(2))
  });
  // Add small random fluctuation, but end up at the current price
  currentPrice = currentPrice * (1 + (Math.random() * 0.04 - 0.02)); 
 }
 // Ensure the last price is the exact current price
 priceHistory[priceHistory.length - 1].price = product.price;
 return { ...product, priceHistory };
});`;

const replacement = `] as Product[]);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/data.ts', code);
