const fs = require('fs');
let code = fs.readFileSync('src/components/Cart.tsx', 'utf8');

if (!code.includes('import { useNavigate }')) {
  code = code.replace(
    "import { Fragment, useState, useEffect } from 'react';",
    "import { Fragment, useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';"
  );
  code = code.replace(
    "const { formatPrice } = useCurrency();",
    "const { formatPrice } = useCurrency();\n  const navigate = useNavigate();"
  );
  
  // Make image container clickable
  code = code.replace(
    '<div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-white/10">',
    '<div \n                    onClick={() => { onClose(); navigate(`/product/${item.id}`); }}\n                    className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-white/10 cursor-pointer hover:opacity-80 transition-opacity"\n                  >'
  );

  // Make item name clickable
  code = code.replace(
    '<h3>{item.name}</h3>',
    '<h3><button onClick={() => { onClose(); navigate(`/product/${item.id}`); }} className="hover:underline text-left">{item.name}</button></h3>'
  );

  fs.writeFileSync('src/components/Cart.tsx', code);
}
