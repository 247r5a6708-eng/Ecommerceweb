const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  'allow read, write: if true;',
  'allow read: if true;\n      allow write: if false; // Admin only in real app'
);

// Prevent users from faking verified purchase or trust scores.
// Actually just restrict fields entirely if possible, but for now just basic rules.

fs.writeFileSync('firestore.rules', code);
