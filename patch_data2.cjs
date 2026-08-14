const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

const regexes = [
  /Verified authentic\./g,
  /Image correctly verified as the Base \(Disc\) Edition\./g,
  /Verified image correctly matches the Neon Joy-Con model\./g,
  /Verified image confirms S24 base model design language\./g,
  /High authenticity verification\./g,
  /verified image confirms classic black high-top styling\./g,
  /Image is verified authentic Submariner\./g,
  /Image accurately depicts the iconic classic resin model\./g,
  /Our platform provides 100% authenticity verification\./g,
  /Image matches Pink Togo leather\./g
];

regexes.forEach(r => {
  code = code.replace(r, '');
});
// clean up double spaces
code = code.replace(/  /g, ' ');

fs.writeFileSync('src/data.ts', code);
