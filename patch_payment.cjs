const fs = require('fs');
let code = fs.readFileSync('src/components/Cart.tsx', 'utf8');

if (!code.includes('apple-pay')) {
  code = code.replace(
    '</label>\n          </div>',
    `</label>
            <label className="flex items-center p-3 border border-gray-200 dark:border-white/10 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <input 
                type="radio" 
                name="payment" 
                value="apple-pay" 
                checked={paymentMethod === 'apple-pay'}
                onChange={e => setPaymentMethod(e.target.value)}
                className="text-gray-900 focus:ring-gray-900"
              />
              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">Apple Pay / Google Pay</span>
            </label>
          </div>`
  );
  fs.writeFileSync('src/components/Cart.tsx', code);
}
