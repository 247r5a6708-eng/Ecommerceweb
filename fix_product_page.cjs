const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

code = code.replace(
  '            </div>\n                    {freqBoughtProducts.length > 0 && (',
  `            </div>
          </div>
          {freqBoughtProducts.length > 0 && (`
);

code = code.replace(
  '        </div>\n      </div>\n    </div>\n  );\n}\n',
  '        </div>\n      </div>\n    </div>\n  );\n}\n'
);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
