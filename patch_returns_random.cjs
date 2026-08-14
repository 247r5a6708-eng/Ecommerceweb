const fs = require('fs');
let code = fs.readFileSync('src/pages/ReturnsPage.tsx', 'utf8');

code = code.replace(
  'id: \`RET-\${Math.random().toString(36).substr(2, 6).toUpperCase()}\`,',
  'id: \`RET-\${crypto.randomUUID().split("-")[0].toUpperCase()}\`,'
);

fs.writeFileSync('src/pages/ReturnsPage.tsx', code);
