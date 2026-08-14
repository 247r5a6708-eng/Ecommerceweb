const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    const newWalletItems = order.items.map(item => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + (item.warrantyInfo?.includes('2 Years') ? 2 : 1));
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        product: item,
        purchaseDate: order.date,
        warrantyStatus: 'Active' as const,
        warrantyExpiry: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'In Use' as const
      };
    });`;

const replacement = `    const newWalletItems = order.items.map(item => {
      const d = new Date(order.date);
      let months = 12;
      if (item.structuredWarranty) {
        months = item.structuredWarranty.durationMonths;
      } else if (item.warrantyInfo?.includes('2 Years')) {
        months = 24;
      }
      d.setMonth(d.getMonth() + months);
      
      return {
        id: crypto.randomUUID(),
        product: item,
        purchaseDate: order.date,
        warrantyStatus: 'Active' as const,
        warrantyExpiry: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'In Use' as const,
        serialNumber: 'Serial number pending'
      };
    });`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
