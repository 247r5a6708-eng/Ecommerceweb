const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [showConfetti, setShowConfetti] = useState(false);',
  'const [showConfetti, setShowConfetti] = useState(false);\n  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);'
);

fs.writeFileSync('src/App.tsx', code);
