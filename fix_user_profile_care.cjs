const fs = require('fs');
let content = fs.readFileSync('src/components/UserProfile.tsx', 'utf-8');

const careButtons = `
                              <div className="flex space-x-2 mt-4">
                                <button className="flex-1 flex justify-center items-center py-2 px-3 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                                  <Shield className="w-3 h-3 mr-1" /> LUMINA Care
                                </button>
                                <button className="flex-1 flex justify-center items-center py-2 px-3 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                  <FileText className="w-3 h-3 mr-1" /> View Receipt
                                </button>
                              </div>
                            </div>
`;

content = content.replace("                            </div>\n                          </div>\n                        </div>", careButtons + "\n                          </div>\n                        </div>");

fs.writeFileSync('src/components/UserProfile.tsx', content);
