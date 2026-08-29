const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSearch.ts', 'utf8');

code = code.replace(
  'const data = await res.json();',
  `if (!res.ok) {
          const text = await res.text();
          throw new Error(\`HTTP \${res.status}: \${text}\`);
        }
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON response");
        }`
);

fs.writeFileSync('src/hooks/useSearch.ts', code);
