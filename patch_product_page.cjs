const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

code = code.replace(
  /\.then\(r => r\.json\(\)\)/g,
  '.then(async r => { if(!r.ok) { throw new Error(await r.text()); } const txt = await r.text(); try { return JSON.parse(txt); } catch(e){ return {}; } })'
);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
