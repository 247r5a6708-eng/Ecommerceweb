const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('tracking-normal')) {
  code = code.replace(
    `@apply font-sans antialiased bg-[#FDFDFC] text-[#111111] transition-colors duration-500 selection:bg-neutral-200;`,
    `@apply font-sans antialiased bg-[#FDFDFC] text-[#111111] transition-colors duration-500 selection:bg-neutral-200 tracking-tight;`
  );

  code = code.replace(
    `@apply bg-[#0C0C0C] text-[#FAFAFA] selection:bg-white/20;`,
    `@apply bg-[#0B0B0C] text-[#FAFAFA] selection:bg-white/20 tracking-tight;`
  );
}

fs.writeFileSync('src/index.css', code);
