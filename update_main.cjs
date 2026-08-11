const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf-8');
content = content.replace("import { CatalogProvider } from './contexts/CatalogContext';", "import { CatalogProvider } from './contexts/CatalogContext';\nimport { UserProvider } from './contexts/UserContext';");
content = content.replace("<CatalogProvider>", "<CatalogProvider>\n        <UserProvider>");
content = content.replace("</CatalogProvider>", "</UserProvider>\n      </CatalogProvider>");
fs.writeFileSync('src/main.tsx', content);
