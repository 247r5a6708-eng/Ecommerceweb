const fs = require('fs');
let code = fs.readFileSync('src/components/UserProfile.tsx', 'utf8');

if (!code.includes('Initiate a Return') && !code.includes('/returns')) {
  if (!code.includes("import { useNavigate }")) {
    code = code.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';");
  }
  
  code = code.replace(
    "const { formatPrice } = useCurrency();",
    "const { formatPrice } = useCurrency();\n  const navigate = useNavigate();"
  );
  
  code = code.replace(
    /onClick=\{\(\) => setActiveTab\('orders'\)\}/,
    "onClick={() => setActiveTab('orders')}"
  );

  // Add a Returns button next to the tabs
  code = code.replace(
    /<div className="flex space-x-2 border-b border-gray-100 dark:border-white\/10 mb-6">/,
    `<div className="flex justify-between items-center border-b border-gray-100 dark:border-white/10 mb-6">
                        <div className="flex space-x-2">`
  );
  
  code = code.replace(
    /<\/button>\s*<\/div>\s*\{activeTab === 'orders' \? \(/,
    `</button>
                        </div>
                        <button onClick={() => { onClose(); navigate('/returns'); }} className="text-xs font-bold text-blue-500 hover:underline">Returns & Exchanges</button>
                      </div>
                      {activeTab === 'orders' ? (`
  );
  
  fs.writeFileSync('src/components/UserProfile.tsx', code);
}
