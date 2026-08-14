const fs = require('fs');
let code = fs.readFileSync('src/components/SafeProductImage.tsx', 'utf8');

code = code.replace(
  "if (imageObj && imageObj.verificationStatus !== 'verified') {",
  "if (imageObj && imageObj.verificationStatus !== 'verified') {\n       setStatus('error');\n       return;\n    }"
);

fs.writeFileSync('src/components/SafeProductImage.tsx', code);
