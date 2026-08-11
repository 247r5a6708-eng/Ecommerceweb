const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');

content = content.replace(
  'style={{ y: y1, opacity }}',
  'style={showSuggestions ? {} : { y: y1, opacity }}'
);

fs.writeFileSync('src/components/Hero.tsx', content);
