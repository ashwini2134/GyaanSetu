import { transpilePythonToJS } from './pythonRunnerInteractive.js';
const code = `
s = {1, 2, 2, 3}
print(s)
s.add(4)
print(s)
print(4 in s)
`;
console.log(transpilePythonToJS(code));
