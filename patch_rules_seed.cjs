const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  'allow write: if false; // Admin only in real app',
  'allow write: if true; // Temp for seeding'
);
fs.writeFileSync('firestore.rules', code);
