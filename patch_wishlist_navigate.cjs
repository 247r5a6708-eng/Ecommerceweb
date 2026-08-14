const fs = require('fs');
let code = fs.readFileSync('src/components/Wishlist.tsx', 'utf8');

if (!code.includes('import { useNavigate }')) {
  code = code.replace(
    "import React, { Fragment, useState, useMemo } from 'react';",
    "import React, { Fragment, useState, useMemo } from 'react';\nimport { useNavigate } from 'react-router-dom';"
  );
  
  code = code.replace(
    "const [sortOrder, setSortOrder] = useState",
    "const navigate = useNavigate();\n  const [sortOrder, setSortOrder] = useState"
  );
  
  code = code.replace(
    '<div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 relative">',
    '<div \n                              onClick={() => { onClose(); navigate(`/product/${item.id}`); }}\n                              className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 relative cursor-pointer hover:opacity-80 transition-opacity"\n                            >'
  );

  code = code.replace(
    '<h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>',
    '<h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1"><button onClick={() => { onClose(); navigate(`/product/${item.id}`); }} className="hover:underline text-left">{item.name}</button></h3>'
  );

  fs.writeFileSync('src/components/Wishlist.tsx', code);
}
