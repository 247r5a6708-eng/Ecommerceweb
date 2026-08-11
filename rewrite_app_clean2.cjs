const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove walletItems
content = content.replace(/  const \[walletItems, setWalletItems\] = useState<any\[\]>\(\(\) => {[\s\S]*?\}\);\n/m, '');

// Remove reviews
content = content.replace(/  const \[reviews, setReviews\] = useState<Record<string, Review\[\]>>\(\(\) => {[\s\S]*?\}\);\n/m, '');

fs.writeFileSync('src/App.tsx', content);
