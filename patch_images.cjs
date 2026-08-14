const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

// The duplicate was product 42 using product 25's image. Let's fix that.
// Product 25: Calvin Klein Cotton Classics
// Product 42: Performance Boxer Briefs
code = code.replace(
  `name: 'Performance Boxer Briefs',\n    brand: 'Under Armour',\n    model: 'Tech 6-inch',\n    variant: 'Black',\n    description: 'Excellent for workouts. The synthetic blend wicks sweat efficiently and prevents chafing.',\n    price: 25.00,\n    category: 'Clothing',\n    type: 'Innerwear',\n    image: 'https://images.unsplash.com/photo-1582214643763-7182103f6f14?auto=format&fit=crop&w=800&q=80',`,
  `name: 'Performance Boxer Briefs',\n    brand: 'Under Armour',\n    model: 'Tech 6-inch',\n    variant: 'Black',\n    description: 'Excellent for workouts. The synthetic blend wicks sweat efficiently and prevents chafing.',\n    price: 25.00,\n    category: 'Clothing',\n    type: 'Innerwear',\n    image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=800&q=80',`
); // Let's use a different URL or just delete some products

fs.writeFileSync('src/data.ts', code);
