const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const start = code.indexOf('const handleAddToCart = (product: Product & { selectedSize?: string }) => {');
const end = code.indexOf('const handlePlaceOrder = (order: Order) => {');

if (start !== -1 && end !== -1 && end > start) {
  code = code.slice(0, start) + code.slice(end);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Stripped inline cart handlers");
} else {
  console.log("Could not find bounds");
}
