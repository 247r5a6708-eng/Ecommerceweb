const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');

if (!content.includes('Camera')) {
  content = content.replace("import { ArrowRight, Search }", "import { ArrowRight, Search, Camera }");
  content = content.replace(
    `<Search className="h-6 w-6 text-blue-400" />\n              </div>`,
    `<Search className="h-6 w-6 text-blue-400" />\n              </div>\n              <button type="button" className="absolute right-40 p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Visual Search (AR)">\n                <Camera className="w-6 h-6" />\n              </button>`
  );
  fs.writeFileSync('src/components/Hero.tsx', content);
}
