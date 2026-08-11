const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const debounceLogic = `  useEffect(() => {
    if (!searchQuery) {
      setAiMatchedIds(null);
      return;
    }

    const performAISearch = async () => {
      setIsAiSearching(true);
      try {
        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        const data = await res.json();
        setAiMatchedIds(data.matchedIds || []);
      } catch (err) {
        console.error('AI Search failed', err);
        setAiMatchedIds(null);
      } finally {
        setIsAiSearching(false);
      }
    };

    const timer = setTimeout(() => {
      performAISearch();
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);`;

content = content.replace(/  useEffect\(\(\) => \{\n    if \(\!searchQuery\) \{[\s\S]*?performAISearch\(\);\n  \}, \[searchQuery\]\);/, debounceLogic);

fs.writeFileSync('src/App.tsx', content);
