const fs = require('fs');

const files = [
  'src/components/InteractiveSizeGuide.tsx',
  'src/components/GiftReminder.tsx',
  'src/components/ReviewModal.tsx',
  'src/components/QuickViewModal.tsx',
  'src/components/CompareModal.tsx',
  'src/components/Recommendations.tsx',
  'src/components/AIChatBot.tsx',
  'src/pages/ProductPage.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(
      /const (\w+) = await res\.json\(\);/g,
      `let $1;
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(\`HTTP \${res.status}: \${errText}\`);
        }
        const textRes = await res.text();
        try {
          $1 = JSON.parse(textRes);
        } catch (e) {
          $1 = {};
        }`
    );
    fs.writeFileSync(file, code);
  }
}
