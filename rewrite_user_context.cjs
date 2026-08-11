const fs = require('fs');
let content = fs.readFileSync('src/contexts/UserContext.tsx', 'utf-8');

content = content.replace("const defaultProfile: UserProfileData = {\n  name: '',\n  email: '',\n  memberSince: new Date().getFullYear().toString(),\n  preferences: {\n    newsletter: true,\n    notifications: true,\n    darkMode: false,\n  }\n};", "const defaultProfile: UserProfileData = {\n  name: '',\n  email: '',\n  phone: '',\n  address: '',\n  avatar: '',\n};");

fs.writeFileSync('src/contexts/UserContext.tsx', content);
