const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import AIChatBot')) {
  content = content.replace("import Hero", "import AIChatBot from './components/AIChatBot';\nimport Hero");
}

if (!content.includes('<AIChatBot />')) {
  content = content.replace("</main>", "</main>\n      <AIChatBot />");
}

fs.writeFileSync('src/App.tsx', content);
