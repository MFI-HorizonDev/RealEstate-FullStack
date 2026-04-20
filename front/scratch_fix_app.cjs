const fs = require('fs');
const file = 'c:/web dev/RealEstate-FullStack/front/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// remove handleLogout
content = content.replace(/  const handleLogout = \(\) => {[\s\S]*?  };\n/, '');

// remove nav
content = content.replace(/      <nav className="fixed top-0 left-0 right-0 z-50[\s\S]*?<\/nav>\n/, '');

// remove footer
content = content.replace(/      <footer className="bg-blue-800 text-blue-100[\s\S]*?<\/footer>\n/, '');

// replace wrapper div
content = content.replace(/<div className="flex min-h-screen flex-col bg-gray-50">/, '<div className="w-full">');

// remove imports that are no longer needed
content = content.replace(/import { logout, isUserLoggedIn } from "@\/services\/api\/useAuth";\n/, 'import { isUserLoggedIn } from "@/services/api/useAuth";\n');

fs.writeFileSync(file, content);
console.log('App.jsx fixed!');
