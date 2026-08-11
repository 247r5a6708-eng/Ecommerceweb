const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert new states
const statesToInsert = `
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
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

    // Debounce or just fire if they hit enter in Hero (which sets searchQuery once)
    performAISearch();
  }, [searchQuery]);
`;

content = content.replace("  const [searchQuery, setSearchQuery] = useState('');", statesToInsert);

// Pass aiMatchedIds and isAiSearching to ProductGrid
content = content.replace("<ProductGrid \n", "<ProductGrid \n        aiMatchedIds={aiMatchedIds}\n        isAiSearching={isAiSearching}\n");

fs.writeFileSync('src/App.tsx', content);
