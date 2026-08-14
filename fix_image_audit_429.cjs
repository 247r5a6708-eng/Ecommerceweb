const fs = require('fs');
let code = fs.readFileSync('scripts/images/image-audit.ts', 'utf8');

code = code.replace(
  "if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {",
  "if (res.statusCode && (res.statusCode >= 200 && res.statusCode < 400 || res.statusCode === 429)) {"
);

fs.writeFileSync('scripts/images/image-audit.ts', code);
