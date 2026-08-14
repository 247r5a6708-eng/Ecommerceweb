const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = "const { searchQuery, setSearchQuery, aiMatchedIds, isAiSearching } = useSearch();";
const replacement = `const { searchQuery, setSearchQuery, aiMatchedIds, setAiMatchedIds, isAiSearching } = useSearch();

  const [sharedWishlistUserId, setSharedWishlistUserId] = useState<string | null>(null);
  const [sharedWishlistItems, setSharedWishlistItems] = useState<string[]>([]);
  const [isSharedWishlistLoading, setIsSharedWishlistLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedUserId = params.get('sharedWishlist');
      if (sharedUserId) {
        setSharedWishlistUserId(sharedUserId);
        setIsSharedWishlistLoading(true);
        firestoreService.getUserWishlist(sharedUserId).then(items => {
          setSharedWishlistItems(items);
          setIsSharedWishlistLoading(false);
        });
      }
    }
  }, []);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
