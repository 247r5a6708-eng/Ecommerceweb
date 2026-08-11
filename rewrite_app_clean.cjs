const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove userProfile
content = content.replace(/  const \[userProfile, setUserProfile\] = useState\(\(\) => {[\s\S]*?\}\);\n/m, '');

// Remove walletItems
content = content.replace(/  const \[walletItems, setWalletItems\] = useState\(\(\) => {[\s\S]*?\}\);\n/m, '');

// Remove reviews
content = content.replace(/  const \[reviews, setReviews\] = useState\(\(\) => {[\s\S]*?\}\);\n/m, '');

fs.writeFileSync('src/App.tsx', content);
