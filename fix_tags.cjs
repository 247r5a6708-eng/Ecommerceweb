const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace("JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, category: p.category, tags: p.tags })))", "JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, category: p.category, type: p.type })))");
fs.writeFileSync('server.ts', content);
