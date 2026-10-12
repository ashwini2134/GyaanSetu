const fs = require('fs');
let code = fs.readFileSync('frontend/src/Shell.tsx', 'utf-8');

const target1 = 'className={({ isActive }) => `${navLinkBase}';
const replacement1 = 'style={({ isActive }) => getNavStyle(isActive)}\n              className={({ isActive }) => `${navLinkBase}';
code = code.split(target1).join(replacement1);

const target2 = 'className={({ isActive }) => `${subLinkBase}';
const replacement2 = 'style={({ isActive }) => getSubNavStyle(isActive)}\n                    className={({ isActive }) => `${subLinkBase}';
code = code.split(target2).join(replacement2);

fs.writeFileSync('frontend/src/Shell.tsx', code);
console.log('Fixed NavLinks!');
