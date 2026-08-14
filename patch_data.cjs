const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

// Remove fake claims from aiSummary
code = code.replace(/Verified authentic\./g, '');
code = code.replace(/Verified image\./g, '');
code = code.replace(/Verified seller\./g, '');
code = code.replace(/  aiSummary: '(.*) '\n/g, "  aiSummary: '$1'\n");

fs.writeFileSync('src/data.ts', code);
