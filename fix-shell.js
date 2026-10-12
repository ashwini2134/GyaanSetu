const fs = require('fs');
let code = fs.readFileSync('frontend/src/Shell.tsx', 'utf-8');

// 1. Update the navLinkActive class string
code = code.replace('bg-blue-600/15 text-white border-l-blue-500 shadow-sm', 'text-white shadow-sm');
// 2. Update the subLinkActive class string
code = code.replace('text-blue-300 bg-blue-600/10 border-blue-500/20', 'text-white/90');

// 3. Add the helper functions
const styleCode = `  const { branding } = useBranding();

  const pColor = branding?.primaryColor || '#2563eb';
  const getNavStyle = (isActive) => isActive ? { backgroundColor: pColor + '26', borderLeftColor: pColor } : {};
  const getSubNavStyle = (isActive) => isActive ? { color: pColor, backgroundColor: pColor + '1A', borderColor: pColor + '33' } : {};
`;
if (!code.includes('const getNavStyle')) {
  code = code.replace('  const { branding } = useBranding();', styleCode);
}

// 4. Update Portfolio button
const oldPortfolio = '<NavLink to=\"/profile\" className=\"hidden md:flex rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 text-sm font-medium transition-all duration-200 border border-blue-500/50 whitespace-nowrap\">';
const newPortfolio = '<NavLink to=\"/profile\" style={{ backgroundColor: pColor, borderColor: pColor }} className=\"hidden md:flex rounded-lg text-white px-3 md:px-4 py-2 text-sm font-medium transition-all duration-200 border whitespace-nowrap opacity-90 hover:opacity-100\">';
code = code.replace(oldPortfolio, newPortfolio);

// 5. Update NavLinks to use getNavStyle and getSubNavStyle
code = code.replace(/<NavLink([^>]+?)className=\{\(\{ isActive \}\) => `\$\{navLinkBase\}/g, '<NavLink$1style={({ isActive }) => getNavStyle(isActive)} className={({ isActive }) => `${navLinkBase}');
code = code.replace(/<NavLink([^>]+?)className=\{\(\{ isActive \}\) => `\$\{subLinkBase\}/g, '<NavLink$1style={({ isActive }) => getSubNavStyle(isActive)} className={({ isActive }) => `${subLinkBase}');

fs.writeFileSync('frontend/src/Shell.tsx', code);
console.log('Shell.tsx updated');
