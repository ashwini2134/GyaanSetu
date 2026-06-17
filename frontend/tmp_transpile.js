const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join('src','utils','pythonRunnerInteractive.ts'),'utf8');

function extract(name) {
  const re = new RegExp(`function ${name}\\([\\s\\S]*?)(?=^function |^export |^const |^let |^var )`, 'm');
  const m = text.match(re);
  if (!m) throw new Error('missing '+name);
  return m[0];
}

const funcs = ['splitComment','translateExpr','translateLine','reconstructLogicalLines','transpilePythonToJS'];
let script = '';
for (const fn of funcs) {
  script += extract(fn) + '\n\n';
}
script += `const code = \\
\
# To-Do List Application\n\
# Manage tasks and persist their status to \"todo.txt\".\n\n\
...`;
console.log(script.slice(0,1000));
