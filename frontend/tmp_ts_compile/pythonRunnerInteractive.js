"use strict";
// Interactive Python runner with generator-based stdin/stdout.
// Yields execution events. input() pauses until caller sends a value.
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpilePythonToJS = transpilePythonToJS;
exports.runInteractive = runInteractive;
exports.runValidationTest = runValidationTest;
// Custom Array Proxy to mock Python list methods
function createList(initialArray = []) {
    return new Proxy(initialArray, {
        get(target, prop, receiver) {
            if (prop === 'append') {
                return (item) => {
                    target.push(item);
                    return null;
                };
            }
            if (prop === 'remove') {
                return (item) => {
                    const idx = target.indexOf(item);
                    if (idx > -1) {
                        target.splice(idx, 1);
                        return null;
                    }
                    throw new Error(`ValueError: list.remove(x): x not in list`);
                };
            }
            if (prop === 'insert') {
                return (idx, item) => {
                    target.splice(idx, 0, item);
                    return null;
                };
            }
            if (prop === 'pop') {
                return (idx) => {
                    if (idx === undefined)
                        return target.pop();
                    const val = target[idx];
                    target.splice(idx, 1);
                    return val;
                };
            }
            if (prop === 'clear') {
                return () => {
                    target.length = 0;
                    return null;
                };
            }
            if (prop === 'count') {
                return (item) => target.filter(x => x === item).length;
            }
            return Reflect.get(target, prop, receiver);
        }
    });
}
// Custom Object Proxy to mock Python dictionary methods
function createDict(initialObj = {}) {
    return new Proxy(initialObj, {
        get(target, prop, receiver) {
            if (prop === 'keys') {
                return () => createList(Object.keys(target));
            }
            if (prop === 'values') {
                return () => createList(Object.values(target));
            }
            if (prop === 'items') {
                return () => createList(Object.entries(target));
            }
            if (prop === 'get') {
                return (key, def = null) => (key in target ? target[key] : def);
            }
            if (prop === 'pop') {
                return (key, def) => {
                    if (key in target) {
                        const val = target[key];
                        delete target[key];
                        return val;
                    }
                    if (def !== undefined)
                        return def;
                    throw new Error(`KeyError: '${key}'`);
                };
            }
            if (prop === 'clear') {
                return () => {
                    for (let k in target)
                        delete target[k];
                    return null;
                };
            }
            if (prop === 'update') {
                return (other) => {
                    Object.assign(target, other);
                    return null;
                };
            }
            return Reflect.get(target, prop, receiver);
        }
    });
}
// Local storage-backed virtual filesystem helper
function pyOpen(filename, mode = 'r') {
    const cleanFilename = filename.replace(/['"]/g, '').trim();
    const cleanMode = mode.replace(/['"]/g, '').trim();
    const storageKey = `fa_file_${cleanFilename}`;
    return {
        write(text) {
            if (cleanMode === 'r')
                throw new Error(`UnsupportedOperation: not writable`);
            let content = localStorage.getItem(storageKey) || '';
            if (cleanMode === 'w') {
                content = text;
            }
            else if (cleanMode === 'a') {
                content += text;
            }
            localStorage.setItem(storageKey, content);
            return text.length;
        },
        read() {
            if (cleanMode === 'w' || cleanMode === 'a')
                throw new Error(`UnsupportedOperation: not readable`);
            const content = localStorage.getItem(storageKey);
            if (content === null) {
                throw new Error(`FileNotFoundError: [Errno 2] No such file or directory: '${cleanFilename}'`);
            }
            return content;
        },
        close() {
            // Mock close
        },
        [Symbol.iterator]() {
            if (cleanMode === 'w' || cleanMode === 'a')
                throw new Error(`UnsupportedOperation: not readable`);
            const content = localStorage.getItem(storageKey) || '';
            if (!content)
                return [][Symbol.iterator]();
            const lines = content.split(/(?<=\n)/);
            return lines[Symbol.iterator]();
        }
    };
}
// Representation helper to print arrays and objects in Python format
function repr(v) {
    if (v === null || v === undefined)
        return 'None';
    if (typeof v === 'boolean')
        return v ? 'True' : 'False';
    if (Array.isArray(v)) {
        return '[' + v.map(repr).join(', ') + ']';
    }
    if (typeof v === 'object') {
        const entries = Object.entries(v).map(([k, val]) => `'${k}': ${repr(val)}`);
        return '{' + entries.join(', ') + '}';
    }
    return String(v);
}
function* pyPrint(...args) {
    const text = args.map(repr).join(' ') + '\n';
    yield { type: 'stdout', text };
}
function* pyInput(prompt = '') {
    const val = (yield { type: 'input', prompt: String(prompt) });
    return val;
}
function pyLen(x) {
    if (x === null || x === undefined)
        return 0;
    if (typeof x === 'string' || Array.isArray(x))
        return x.length;
    return Object.keys(x).length;
}
function pyVal(val) {
    if (Array.isArray(val)) {
        return createList(val.map(pyVal));
    }
    if (val !== null && typeof val === 'object' && val.constructor === Object) {
        const wrapped = {};
        for (let k in val) {
            wrapped[k] = pyVal(val[k]);
        }
        return createDict(wrapped);
    }
    return val;
}
// ── Transpiler logic ──
function splitComment(line) {
    let inDouble = false;
    let inSingle = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"' && !inSingle)
            inDouble = !inDouble;
        else if (c === "'" && !inDouble)
            inSingle = !inSingle;
        else if (c === '#' && !inDouble && !inSingle) {
            return [line.slice(0, i), '//' + line.slice(i + 1)];
        }
    }
    return [line, ''];
}
function translateExpr(expr, customFuncs) {
    let js = expr.trim();
    if (!js)
        return '';
    // Extract string literals to avoid translating keywords inside strings
    const strings = [];
    const stringRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
    js = js.replace(stringRegex, (match) => {
        strings.push(match);
        return `__STR_PLACEHOLDER_${strings.length - 1}__`;
    });
    // Keywords translation
    js = js.replace(/\band\b/g, ' && ')
        .replace(/\bor\b/g, ' || ')
        .replace(/\bnot\b/g, ' ! ')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null');
    // Input & Print
    js = js.replace(/\binput\s*\(([^)]*)\)/g, '(yield* pyInput($1))');
    js = js.replace(/\bprint\s*\(([^)]*)\)/g, 'yield* pyPrint($1)');
    js = js.replace(/\blen\s*\(([^)]*)\)/g, 'pyLen($1)');
    // Dict / List instantiations
    js = js.replace(/\{\}/g, 'createDict({})');
    js = js.replace(/\[\]/g, 'createList([])');
    // Custom function yields
    for (let fn of customFuncs) {
        const regex = new RegExp(`\\b${fn}\\s*\\(([^)]*)\\)`, 'g');
        js = js.replace(regex, (match, args) => {
            if (match.startsWith('yield*') || match.startsWith('function*'))
                return match;
            return `yield* ${fn}(${args})`;
        });
    }
    // List append method replacement
    js = js.replace(/\.append\s*\(/g, '.push(');
    // Tuple literals translation
    let prevJs = '';
    while (js !== prevJs) {
        prevJs = js;
        js = js.replace(/(?<!\b[a-zA-Z_]\w*)\(([^()]+,[^()]+)\)/g, '[$1]');
    }
    // Restore string literals
    js = js.replace(/__STR_PLACEHOLDER_(\d+)__/g, (_, idx) => strings[parseInt(idx, 10)]);
    return js;
}
function translateLine(line, customFuncs, inWithBlock, currentIndent) {
    let t = line.trim();
    if (!t)
        return '';
    // Strip trailing colon for translation, except for try/except/else blocks
    const isBlockHeader = t.endsWith(':');
    let body = isBlockHeader ? t.slice(0, -1).trim() : t;
    // def statement
    const defM = body.match(/^def\s+(\w+)\s*\(([^)]*)\)$/);
    if (defM) {
        customFuncs.add(defM[1]);
        return `function* ${defM[1]}(${defM[2]}) {`;
    }
    // with open statement
    const withM = body.match(/^with\s+open\(([^)]+)\)\s+as\s+(\w+)$/);
    if (withM) {
        inWithBlock.push({ varName: withM[2], indent: currentIndent });
        return `{ let ${withM[2]} = pyOpen(${withM[1]}); try {`;
    }
    // conditionals
    if (body.startsWith('if ')) {
        return `if (${translateExpr(body.slice(3), customFuncs)}) {`;
    }
    if (body.startsWith('elif ')) {
        return `} else if (${translateExpr(body.slice(5), customFuncs)}) {`;
    }
    if (body === 'else') {
        return `} else {`;
    }
    if (body.startsWith('while ')) {
        return `while (${translateExpr(body.slice(6), customFuncs)}) {`;
    }
    // for loop
    const forRangeM = body.match(/^for\s+(\w+)\s+in\s+range\((.+)\)$/);
    if (forRangeM) {
        const varName = forRangeM[1];
        const args = forRangeM[2].split(',').map(s => translateExpr(s.trim(), customFuncs));
        if (args.length === 1) {
            return `for (let ${varName} = 0; ${varName} < ${args[0]}; ${varName}++) {`;
        }
        if (args.length === 2) {
            return `for (let ${varName} = ${args[0]}; ${varName} < ${args[1]}; ${varName}++) {`;
        }
        if (args.length === 3) {
            return `for (let ${varName} = ${args[0]}; ${varName} < ${args[1]}; ${varName} += ${args[2]}) {`;
        }
    }
    const forInM = body.match(/^for\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s+in\s+(.+)$/);
    if (forInM) {
        const varsStr = forInM[1].trim();
        const iterExpr = translateExpr(forInM[2], customFuncs);
        let jsVars = varsStr;
        if (varsStr.includes(',')) {
            jsVars = `[${varsStr}]`;
        }
        return `for (let ${jsVars} of (${iterExpr} && typeof ${iterExpr}[Symbol.iterator] === 'function' ? ${iterExpr} : (Array.isArray(${iterExpr}) ? ${iterExpr} : Object.keys(${iterExpr})))) {`;
    }
    // try/except
    if (body === 'try') {
        return 'try {';
    }
    if (body.startsWith('except')) {
        const exceptM = body.match(/^except\s+(.+)\s+as\s+(\w+)$/);
        if (exceptM)
            return `} catch (${exceptM[2]}) {`;
        return '} catch (err) {';
    }
    // del statement
    if (body.startsWith('del ')) {
        return `delete ${translateExpr(body.slice(4), customFuncs)};`;
    }
    // return statement
    if (body.startsWith('return ')) {
        return `return ${translateExpr(body.slice(7), customFuncs)};`;
    }
    // raise statement
    if (body.startsWith('raise ')) {
        return `throw ${translateExpr(body.slice(6), customFuncs)};`;
    }
    // assignments (with pyVal wrapping for objects/arrays)
    const assignTupleM = body.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)+)\s*=(?!=)\s*(.+)$/);
    const assignSingleM = body.match(/^([a-zA-Z_]\w*(?:\[[^\]]+\]|\.\w*)*)\s*=(?!=)\s*(.+)$/);
    if (assignTupleM) {
        const targets = assignTupleM[1].split(',').map(s => s.trim()).join(', ');
        const expr = translateExpr(assignTupleM[2].trim(), customFuncs);
        return `[${targets}] = pyVal(${expr});`;
    }
    if (assignSingleM) {
        const target = assignSingleM[1].trim();
        const expr = translateExpr(assignSingleM[2].trim(), customFuncs);
        return `${target} = pyVal(${expr});`;
    }
    // general expressions
    return translateExpr(body, customFuncs) + ';';
}
function reconstructLogicalLines(code) {
    const physicalLines = code.split('\n');
    const logicalLines = [];
    let currentLogicalLine = '';
    let openParentheses = 0;
    let openBrackets = 0;
    let openBraces = 0;
    for (let i = 0; i < physicalLines.length; i++) {
        const line = physicalLines[i];
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let escape = false;
        let nonCommentLength = line.length;
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (escape) {
                escape = false;
                continue;
            }
            if (char === '\\') {
                escape = true;
                continue;
            }
            if (char === "'" && !inDoubleQuote) {
                inSingleQuote = !inSingleQuote;
                continue;
            }
            if (char === '"' && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote;
                continue;
            }
            if (inSingleQuote || inDoubleQuote) {
                continue;
            }
            if (char === '#') {
                nonCommentLength = j;
                break;
            }
            if (char === '(')
                openParentheses++;
            else if (char === ')')
                openParentheses--;
            else if (char === '[')
                openBrackets++;
            else if (char === ']')
                openBrackets--;
            else if (char === '{')
                openBraces++;
            else if (char === '}')
                openBraces--;
        }
        const commentPart = line.slice(nonCommentLength);
        let codePart = line.slice(0, nonCommentLength);
        let endsWithBackslash = false;
        if (codePart.trim().endsWith('\\')) {
            endsWithBackslash = true;
            codePart = codePart.slice(0, codePart.lastIndexOf('\\'));
        }
        if (currentLogicalLine === '') {
            currentLogicalLine = codePart;
        }
        else {
            currentLogicalLine += ' ' + codePart.trim();
        }
        const totalOpen = openParentheses + openBrackets + openBraces;
        if (totalOpen <= 0 && !endsWithBackslash) {
            logicalLines.push(currentLogicalLine + commentPart);
            currentLogicalLine = '';
            openParentheses = 0;
            openBrackets = 0;
            openBraces = 0;
        }
    }
    if (currentLogicalLine !== '') {
        logicalLines.push(currentLogicalLine);
    }
    return logicalLines;
}
function transpilePythonToJS(code) {
    const lines = reconstructLogicalLines(code);
    const customFuncs = new Set();
    // Pre-scan for custom functions
    for (let line of lines) {
        const m = line.trim().match(/^def\s+(\w+)/);
        if (m)
            customFuncs.add(m[1]);
    }
    // Pre-scan for variable assignments to declare them globally in the function
    const declaredVars = new Set();
    for (let line of lines) {
        const trimmed = line.trim();
        const mTuple = trimmed.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)+)\s*=(?!=)/);
        const mSingle = trimmed.match(/^([a-zA-Z_]\w*(?:\[[^\]]+\]|\.\w*)*)\s*=(?!=)/);
        if (mTuple) {
            const vars = mTuple[1].split(',').map(s => s.trim());
            for (const v of vars) {
                if (!['if', 'for', 'while', 'def', 'return', 'class', 'del', 'try', 'except', 'with', 'import'].includes(v)) {
                    declaredVars.add(v);
                }
            }
        }
        else if (mSingle) {
            const varName = mSingle[1];
            if (!varName.includes('.') && !varName.includes('[')) {
                if (!['if', 'for', 'while', 'def', 'return', 'class', 'del', 'try', 'except', 'with', 'import'].includes(varName)) {
                    declaredVars.add(varName);
                }
            }
        }
    }
    let jsCode = '';
    let indentStack = [0];
    let inWithBlock = [];
    if (declaredVars.size > 0) {
        jsCode += `let ${Array.from(declaredVars).join(', ')};\n`;
    }
    for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        const [cleanLine, comment] = splitComment(line);
        const trimmed = cleanLine.trim();
        if (!trimmed) {
            jsCode += comment ? comment + '\n' : '\n';
            continue;
        }
        // Calculate indent
        let indent = 0;
        for (let c of cleanLine) {
            if (c === ' ')
                indent++;
            else if (c === '\t')
                indent += 4;
            else
                break;
        }
        // Close blocks
        while (indentStack[indentStack.length - 1] > indent) {
            const poppedIndent = indentStack.pop();
            const isContinuation = /^(except|finally|elif|else)\b/.test(trimmed);
            const suppressBrace = isContinuation && poppedIndent === indent + 4;
            if (inWithBlock.length > 0 && inWithBlock[inWithBlock.length - 1].indent === indentStack.length) {
                const item = inWithBlock.pop();
                jsCode += ' '.repeat(indent) + `} finally { ${item.varName}.close(); } }\n`;
            }
            else if (!suppressBrace) {
                jsCode += ' '.repeat(indent) + '}\n';
            }
        }
        const jsLine = translateLine(cleanLine, customFuncs, inWithBlock, indentStack.length);
        jsCode += ' '.repeat(indent) + jsLine + (comment ? ' ' + comment : '') + '\n';
        if (trimmed.endsWith(':')) {
            indentStack.push(indent + 4);
        }
    }
    // Close any open blocks at EOF
    while (indentStack.length > 1) {
        indentStack.pop();
        if (inWithBlock.length > 0 && inWithBlock[inWithBlock.length - 1].indent === indentStack.length) {
            const item = inWithBlock.pop();
            jsCode += `} finally { ${item.varName}.close(); } }\n`;
        }
        else {
            jsCode += '}\n';
        }
    }
    return jsCode;
}
function* runInteractive(code) {
    const jsCode = transpilePythonToJS(code);
    const sandboxFunc = new Function('pyPrint', 'pyInput', 'pyOpen', 'pyLen', 'createDict', 'createList', 'pyVal', `
      if (!String.prototype.strip) String.prototype.strip = function() { return this.trim(); };
      if (!String.prototype.lower) String.prototype.lower = function() { return this.toLowerCase(); };
      if (!String.prototype.upper) String.prototype.upper = function() { return this.toUpperCase(); };
      if (!String.prototype.title) String.prototype.title = function() { return this.replace(/\\b\\w/g, c => c.toUpperCase()); };
      
      const int = (x) => parseInt(x, 10);
      const float = (x) => parseFloat(x);
      const str = (x) => String(x);
      
      const ValueError = Error;
      const TypeError = Error;
      const KeyError = Error;
      const FileNotFoundError = Error;
      const ZeroDivisionError = Error;
      
      return function*() {
        try {
          ${jsCode}
          
          if (typeof main === 'function') {
            yield* main();
          }
        } catch (err) {
          yield { type: 'stderr', text: err.stack || err.message || String(err) };
          throw err;
        }
      };
    `);
    const genCreator = sandboxFunc(pyPrint, pyInput, pyOpen, pyLen, createDict, createList, pyVal);
    const mainGen = genCreator();
    let lastVal = undefined;
    let isResumingInput = false;
    while (true) {
        try {
            const { value, done } = isResumingInput ? mainGen.next(lastVal) : mainGen.next();
            isResumingInput = false;
            if (done) {
                return { output: '', error: null, exitCode: 0 };
            }
            if (value.type === 'stderr') {
                return { output: '', error: value.text, exitCode: 1 };
            }
            if (value.type === 'input') {
                const inputVal = yield value;
                lastVal = inputVal;
                isResumingInput = true;
            }
            else {
                yield value;
                lastVal = undefined;
                isResumingInput = false;
            }
        }
        catch (err) {
            return { output: '', error: String(err), exitCode: 1 };
        }
    }
}
function runValidationTest(code, inputs) {
    try {
        const gen = runInteractive(code);
        const stdoutLines = [];
        let inputIdx = 0;
        let nextVal = null;
        let steps = 0;
        while (steps < 2000) {
            steps++;
            const { value, done } = nextVal !== null ? gen.next(nextVal) : gen.next();
            if (done)
                break;
            if (value.type === 'stdout') {
                stdoutLines.push(value.text);
                nextVal = null;
            }
            else if (value.type === 'input') {
                const val = inputs[inputIdx++];
                if (val === undefined) {
                    break;
                }
                nextVal = val;
            }
            else if (value.type === 'stderr') {
                return { stdout: stdoutLines.join(''), error: value.text };
            }
        }
        return { stdout: stdoutLines.join(''), error: null };
    }
    catch (err) {
        return { stdout: '', error: String(err) };
    }
}
