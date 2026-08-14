const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSearch.ts', 'utf8');

code = code.replace(
  "    isAiSearching\n  };",
  "    isAiSearching,\n    setAiMatchedIds\n  };"
);

fs.writeFileSync('src/hooks/useSearch.ts', code);
