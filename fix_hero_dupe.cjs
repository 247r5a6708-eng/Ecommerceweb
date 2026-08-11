const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');

// I'll just write it correctly.
const toReplace = `              </AnimatePresence>
            </div>
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="block w-full pl-6 pr-4 py-6 bg-transparent text-xl placeholder-gray-500 focus:outline-none text-gray-900 dark:text-white font-medium"
                placeholder="Initialize search sequence..."
              />
              <button type="button" className="p-4 mr-2 text-gray-400 hover:text-blue-500 transition-colors rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 flex-shrink-0" title="Visual Search (AR)">
                <Camera className="w-6 h-6" />
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-8 py-5 border border-transparent text-lg font-bold rounded-2xl text-black bg-white hover:bg-blue-50 focus:outline-none transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                Execute <ArrowRight className="ml-3 w-5 h-5" />
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}`;

const replaceWith = `              </AnimatePresence>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}`;

content = content.replace(toReplace, replaceWith);
fs.writeFileSync('src/components/Hero.tsx', content);
