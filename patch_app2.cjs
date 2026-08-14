const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find and remove old handlers
const removeRegex = (regex) => {
  code = code.replace(regex, '');
}

removeRegex(/const handleUpdateQuantity = [\s\S]*?\}\);\s*\};\s*const handleRemoveItem/);
removeRegex(/const handleRemoveItem = [\s\S]*?\}\);\s*\};\s*/);

// Wait, the regex might be tricky. Let's just use string replacement for the exact functions.
