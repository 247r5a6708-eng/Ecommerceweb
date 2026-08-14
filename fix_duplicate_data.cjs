const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

// The easiest way to remove product 42 is to replace its chunk
code = code.replace(/\{\n  id: '42',[\s\S]*?sustainabilityGrade: 'C',[\s\S]*?sizeGuide: 'Waist[\s\S]*?'\n \},/m, '');

fs.writeFileSync('src/data.ts', code);
