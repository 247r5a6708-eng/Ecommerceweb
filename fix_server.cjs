const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// fix AI Chat Endpoint
content = content.replace("const { message, history, products } = req.body;", "const { message, history } = req.body;\n      const products = await getProducts();");

fs.writeFileSync('server.ts', content);
