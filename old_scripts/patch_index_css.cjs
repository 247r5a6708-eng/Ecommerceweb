const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(
  `@apply font-sans antialiased bg-[#FAFAFA] text-[#111111] transition-colors duration-500 selection:bg-gray-200;`,
  `@apply font-sans antialiased bg-[#FDFDFC] text-[#111111] transition-colors duration-500 selection:bg-neutral-200;`
);

code = code.replace(
  `@apply bg-[#0A0A0A] text-[#FAFAFA] selection:bg-white/20;`,
  `@apply bg-[#0C0C0C] text-[#FAFAFA] selection:bg-white/20;`
);

fs.writeFileSync('src/index.css', code);
