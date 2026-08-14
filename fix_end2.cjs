const fs = require('fs');
let code = fs.readFileSync('src/services/catalogService.ts', 'utf8');

if (!code.endsWith('}')) {
  code = code + '\n}';
}

fs.writeFileSync('src/services/catalogService.ts', code);
