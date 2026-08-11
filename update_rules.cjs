const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  "match /databases/{database}/documents {",
  "match /databases/{database}/documents {\n    match /products/{productId} {\n      allow read, write: if true;\n    }"
);
fs.writeFileSync('firestore.rules', rules);
