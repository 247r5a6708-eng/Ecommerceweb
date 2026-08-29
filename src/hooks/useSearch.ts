import { useState, useEffect } from 'react';

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    let isCancelled = false;

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
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON response");
        }
        
        if (!isCancelled) {
          setAiMatchedIds(data.matchedIds || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('AI Search failed', err);
          setAiMatchedIds(null);
        }
      } finally {
        if (!isCancelled) {
          setIsAiSearching(false);
        }
      }
    };

    const timer = setTimeout(() => {
      if (!isCancelled) performAISearch();
    }, 1000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    aiMatchedIds,
    isAiSearching,
    setAiMatchedIds
  };
}
