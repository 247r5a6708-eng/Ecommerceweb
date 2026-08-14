const fs = require('fs');
let code = fs.readFileSync('scripts/images/image-audit.ts', 'utf8');

code = code.replace(
  "const req = client.get(url, { timeout: 5000 }, (res) => {",
  "const req = client.get(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {"
);

fs.writeFileSync('scripts/images/image-audit.ts', code);
