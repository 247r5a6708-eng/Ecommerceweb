const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import KeyboardShortcutsModal')) {
  code = code.replace(
    "import BackToTop from './components/BackToTop';",
    "import BackToTop from './components/BackToTop';\nimport KeyboardShortcutsModal from './components/KeyboardShortcutsModal';"
  );
}

if (!code.includes('const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);')) {
  code = code.replace(
    'const [isCartOpen, setIsCartOpen] = useState(false);',
    'const [isCartOpen, setIsCartOpen] = useState(false);\n  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);'
  );
}

if (!code.includes("else if (e.key === '?') {")) {
  code = code.replace(
    "} else if (e.key.toLowerCase() === 'w') {\n        e.preventDefault();\n        setIsWishlistOpen(prev => !prev);\n      }",
    "} else if (e.key.toLowerCase() === 'w') {\n        e.preventDefault();\n        setIsWishlistOpen(prev => !prev);\n      } else if (e.key === '?') {\n        e.preventDefault();\n        setIsKeyboardHelpOpen(prev => !prev);\n      }"
  );
}

if (!code.includes('<KeyboardShortcutsModal')) {
  code = code.replace(
    '<BackToTop />',
    '<BackToTop />\n      <KeyboardShortcutsModal isOpen={isKeyboardHelpOpen} onClose={() => setIsKeyboardHelpOpen(false)} />\n      \n      {/* Floating Keyboard Shortcuts Trigger */}\n      <button\n        onClick={() => setIsKeyboardHelpOpen(true)}\n        className="fixed bottom-6 left-6 p-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all z-40 focus:outline-none focus:ring-2 focus:ring-blue-500"\n        aria-label="Keyboard Shortcuts"\n        title="Keyboard Shortcuts (?)"\n      >\n        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-keyboard"><path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>\n      </button>'
  );
}

fs.writeFileSync('src/App.tsx', code);
