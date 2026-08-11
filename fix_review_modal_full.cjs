const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewModal.tsx', 'utf-8');

const aiState = `  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (isOpen && product && reviews.length > 0) {
      const fetchSummary = async () => {
        setIsSummarizing(true);
        try {
          const res = await fetch('/api/ai-review-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, reviews })
          });
          const data = await res.json();
          setAiSummary(data);
        } catch (error) {
          console.error("Failed to fetch review summary", error);
        } finally {
          setIsSummarizing(false);
        }
      };
      fetchSummary();
    }
  }, [isOpen, product, reviews]);
`;

content = content.replace("  const [newReviewAuthor, setNewReviewAuthor] = useState('');", "  const [newReviewAuthor, setNewReviewAuthor] = useState('');\n" + aiState);

fs.writeFileSync('src/components/ReviewModal.tsx', content);
