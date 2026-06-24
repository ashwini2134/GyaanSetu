// Lightweight Python interpreter for educational exercises.
// Returns real-looking Python error messages for debugging practice.

type PyVal = string | number | boolean | null | PyVal[] | { [key: string]: PyVal };
type Env = Map<string, PyVal>;
type FnDef = { params: string[]; bodyLines: string[] };

export interface RunResult {
  output: string;
  error: string | null;
  exitCode: number; // 0 = success, 1 = error
  prompts: string[];
}

export function runPython(code: string, inputs: string[] = []): RunResult {
  const instance = new MiniPython(inputs);
  return instance.run(code);
}

class LoopControl extends Error {
  constructor(public ctype: 'break' | 'continue') {
    super(ctype);
    this.name = 'LoopControl';
  }
}

class ReturnControl extends Error {
  constructor(public value: PyVal) {
    super('return');
    this.name = 'ReturnControl';
  }
}

class MiniPython {
  private globals: Env = new Map();
  private fns: Map<string, FnDef> = new Map();
  private out: string = '';
  private traceback: string[] = [];
  private currentLine = 0;
  private inputIdx = 0;
  private prompts: string[] = [];

  constructor(private inputs: string[] = []) {}

  run(code: string): RunResult {
    // Reset state at the start of each run to ensure clean execution
    this.inputIdx = 0;
    this.out = '';
    this.traceback = [];
    this.currentLine = 0;
    this.prompts = [];
    this.globals = new Map();
    this.fns = new Map();
    
    try {
      this.validateSyntax(code);
      const logicalLines = this.reconstructLogicalLines(code);
      this.execLines(logicalLines, 0, this.globals);
      let output = this.out;
      if (output.endsWith('\n')) {
        output = output.slice(0, -1);
      }
      return { output, error: null, exitCode: 0, prompts: this.prompts };
    } catch (e) {
      let output = this.out;
      if (output.endsWith('\n')) {
        output = output.slice(0, -1);
      }
      if (e instanceof LoopControl) {
        return { output, error: `  SyntaxError: '${e.ctype}' outside loop`, exitCode: 1, prompts: this.prompts };
      }
      const msg = String(e instanceof Error ? e.message : e);
      const tb = this.traceback.length > 0
        ? `Traceback (most recent call last):\n  File "<stdin>", line ${this.traceback[0]}, in <module>\n${msg}`
        : msg;
      return { output, error: tb, exitCode: 1, prompts: this.prompts };
    } finally {
      // Clear in-memory filesystem for test isolation
      MiniPython.clearInMemoryFs();
      // Clear localStorage file entries for test isolation
      MiniPython.clearLocalStorageFiles();
    }
  }

  // ── Syntax validation (pre-run) ────────────────────────────────────────

  private validateSyntax(code: string) {
    const lines = code.split('\n');
    let inSingleQuote = false, inDoubleQuote = false, inTripleSingle = false, inTripleDouble = false;
    let parenDepth = 0, bracketDepth = 0, braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      let j = 0;
      while (j < raw.length) {
        const ch = raw[j];
        const next = raw[j + 1] ?? '';

        // String tracking
        if (!inTripleDouble && !inTripleSingle && !inDoubleQuote && !inSingleQuote) {
          if (ch === "'" && next === "'" && raw[j + 2] === "'") { inTripleSingle = true; j += 3; continue; }
          if (ch === '"' && next === '"' && raw[j + 2] === '"') { inTripleDouble = true; j += 3; continue; }
          if (ch === "'") { inSingleQuote = true; j++; continue; }
          if (ch === '"') { inDoubleQuote = true; j++; continue; }
        } else if (inTripleSingle && ch === "'" && next === "'" && raw[j + 2] === "'") { inTripleSingle = false; j += 3; continue; }
        else if (inTripleDouble && ch === '"' && next === '"' && raw[j + 2] === '"') { inTripleDouble = false; j += 3; continue; }
        else if (inSingleQuote && ch === "'") { inSingleQuote = false; }
        else if (inDoubleQuote && ch === '"') { inDoubleQuote = false; }

        if (!inSingleQuote && !inDoubleQuote && !inTripleSingle && !inTripleDouble) {
          if (ch === '(') parenDepth++;
          if (ch === ')') parenDepth--;
          if (ch === '[') bracketDepth++;
          if (ch === ']') bracketDepth--;
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;

          // Detect invalid indentation (mixed tabs and spaces)
          if (j === 0 && ch === '\t') {
            // Check for inconsistent indentation
            let nextNonSpace = raw.search(/\S/);
            if (nextNonSpace > 0 && nextNonSpace % 4 !== 0 && raw[0] !== ' ') {
              throw new Error(`  IndentationError: inconsistent use of tabs and spaces in indentation\n    at line ${i + 1}`);
            }
          }
        }
        j++;
      }

      // Check unmatched brackets at end of line (outside strings)
      if (!inSingleQuote && !inDoubleQuote && !inTripleSingle && !inTripleDouble) {
        if (raw.trim() && !raw.trim().startsWith('#') && parenDepth < 0) {
          throw new Error(`  SyntaxError: unmatched ')' (line ${i + 1})`);
        }
        if (bracketDepth < 0) throw new Error(`  SyntaxError: unmatched ']' (line ${i + 1})`);
        if (braceDepth < 0) throw new Error(`  SyntaxError: unmatched '}' (line ${i + 1})`);
      }
    }

    if (inSingleQuote) throw new Error(`  SyntaxError: EOL while scanning string literal`);
    if (inDoubleQuote) throw new Error(`  SyntaxError: EOL while scanning string literal`);
    if (inTripleSingle) throw new Error(`  SyntaxError: EOF while scanning triple-quoted string literal`);
    if (inTripleDouble) throw new Error(`  SyntaxError: EOF while scanning triple-quoted string literal`);
    if (parenDepth > 0) throw new Error(`  SyntaxError: unexpected EOF while parsing (missing ')')`);
  }

  // ── Indentation ────────────────────────────────────────────────────────

  private indent(line: string): number {
    let n = 0;
    for (const c of line) {
      if (c === ' ') n++;
      else if (c === '\t') n += 4;
      else break;
    }
    return n;
  }

  // ── Code execution ─────────────────────────────────────────────────────

  private execLines(lines: string[], base: number, env: Env, inFn = false): void {
    let i = 0;
    while (i < lines.length) {
      this.currentLine = i + 1;
      const raw = lines[i];
      const t = raw.trim();
      if (!t || t.startsWith('#')) { i++; continue; }

      const ind = this.indent(raw);
      if (ind < base && t) break;

      // Function definition
      const defM = t.match(/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*:/);
      if (defM) {
        const name = defM[1];
        const params = defM[2].split(',').map(s => s.trim()).filter(Boolean);
        const body: string[] = [];
        i++;
        while (i < lines.length) {
          const bl = lines[i];
          const bt = bl.trim();
          if (bt && this.indent(bl) <= ind && !bt.startsWith('#')) break;
          body.push(bl);
          i++;
        }
        this.traceback.push(String(i + 1));
        this.fns.set(name, { params, bodyLines: body });
        continue;
      }

      // with open(...) as f:
      const withM = t.match(/^with\s+open\s*\(([^)]+)\)\s+as\s+([a-zA-Z_]\w*)\s*:/);
      if (withM) {
        const argsStr = withM[1].trim();
        const varName = withM[2].trim();
        const body: string[] = [];
        i++;
        while (i < lines.length) {
          const bl = lines[i];
          const bt = bl.trim();
          if (bt && this.indent(bl) <= ind) break;
          body.push(bl);
          i++;
        }
        const args = this.parseArgs(argsStr, env);
        const filename = String(args[0]);
        const mode = args[1] ? String(args[1]) : 'r';
        const fileObj = {
          __type__: 'file',
          filename,
          mode
        };
        env.set(varName, fileObj);
        try {
          this.execLines(body, ind + 1, env, inFn);
        } finally {
          env.delete(varName);
        }
        continue;
      }

      // Print statement
      if (t.startsWith('print(') || t.startsWith('print (')) {
        const inner = this.unParen(t.slice(t.indexOf('(')));
        this.handlePrint(inner, env);
        i++; continue;
      }

      // Augmented assignment
      const augM = t.match(/^([a-zA-Z_]\w*)\s*(\*\*|[+\-*\/%]|\/\/)=\s*(.+)$/);
      if (augM) {
        const cur = this.eval(augM[1], env);
        if (cur === null || cur === undefined) {
          throw new Error(`  NameError: name '${augM[1]}' is not defined\n    at line ${i + 1}`);
        }
        const rhs = this.eval(augM[3].trim(), env);
        const op = augM[2];
        let res: PyVal;
        if (typeof cur === 'string' && op === '+') {
          res = cur + String(rhs);
        } else if (typeof cur === 'string' && op === '%') {
          res = this.formatString(cur, rhs);
        } else {
          if (typeof cur !== 'number' || typeof rhs !== 'number') {
            throw new Error(`  TypeError: unsupported operand type(s) for ${op}=: '${typeof cur}' and '${typeof rhs}'\n    at line ${i + 1}`);
          }
          switch (op) {
            case '+': res = cur + rhs; break;
            case '-': res = cur - rhs; break;
            case '*': res = cur * rhs; break;
            case '/':
              if (rhs === 0) throw new Error(`  ZeroDivisionError: division by zero\n    at line ${i + 1}`);
              res = cur / rhs; break;
            case '//':
              if (rhs === 0) throw new Error(`  ZeroDivisionError: integer division or modulo by zero\n    at line ${i + 1}`);
              res = Math.floor(cur / rhs); break;
            case '%':
              if (rhs === 0) throw new Error(`  ZeroDivisionError: modulo by zero\n    at line ${i + 1}`);
              res = cur % rhs; break;
            case '**':
              res = Math.pow(cur, rhs); break;
            default: res = 0;
          }
        }
        env.set(augM[1], res);
        i++; continue;
      }

      // Dict/List augmented assignment: d[key] += value
      const dictAugM = t.match(/^([a-zA-Z_]\w*)\[([^\]]+)\]\s*(\*\*|[+\-*\/%]|\/\/)=\s*(.+)$/);
      if (dictAugM) {
        const dict = env.get(dictAugM[1]) ?? this.globals.get(dictAugM[1]);
        if (dict && (this.isDict(dict) || Array.isArray(dict))) {
          const key = String(this.eval(dictAugM[2].trim(), env));
          const op = dictAugM[3];
          const rhs = this.eval(dictAugM[4].trim(), env);
          
          let cur: PyVal;
          if (this.isDict(dict)) {
            cur = dict[key];
          } else {
            cur = (dict as PyVal[])[Number(key)];
          }

          if (cur === undefined || cur === null) {
            if (this.isDict(dict)) throw new Error(`  KeyError: '${key}'\n    at line ${i + 1}`);
            throw new Error(`  IndexError: list index out of range\n    at line ${i + 1}`);
          }

          let res: PyVal;
          if (typeof cur === 'string' && op === '+') {
            res = cur + String(rhs);
          } else {
            if (typeof cur !== 'number' || typeof rhs !== 'number') {
              throw new Error(`  TypeError: unsupported operand type(s) for ${op}=: '${typeof cur}' and '${typeof rhs}'\n    at line ${i + 1}`);
            }
            switch (op) {
              case '+': res = cur + rhs; break;
              case '-': res = cur - rhs; break;
              case '*': res = cur * rhs; break;
              case '/':
                if (rhs === 0) throw new Error(`  ZeroDivisionError: division by zero\n    at line ${i + 1}`);
                res = cur / rhs; break;
              case '//':
                if (rhs === 0) throw new Error(`  ZeroDivisionError: integer division or modulo by zero\n    at line ${i + 1}`);
                res = Math.floor(cur / rhs); break;
              case '%':
                if (rhs === 0) throw new Error(`  ZeroDivisionError: modulo by zero\n    at line ${i + 1}`);
                res = cur % rhs; break;
              case '**':
                res = Math.pow(cur, rhs); break;
              default: res = 0;
            }
          }

          if (this.isDict(dict)) {
            dict[key] = res;
          } else {
            (dict as PyVal[])[Number(key)] = res;
          }
        } else {
          throw new Error(`  TypeError: '${typeof dict}' object does not support item assignment\n    at line ${i + 1}`);
        }
        i++; continue;
      }

      // if / elif / else
      if (t.startsWith('if ') || t.startsWith('elif ')) {
        const condStr = t.slice(t.startsWith('elif ') ? 5 : 3, t.lastIndexOf(':')).trim();
        const cond = this.eval(condStr, env);
        const body: string[] = [];
        i++;
        while (i < lines.length) {
          const bl = lines[i];
          const bt = bl.trim();
          if (bt && this.indent(bl) <= ind) break;
          body.push(bl);
          i++;
        }
        
        // Helper: skip remaining elif/else blocks in the chain
        const skipChain = () => {
          while (i < lines.length) {
            const skipLine = lines[i].trim();
            if (!skipLine || skipLine.startsWith('#')) {
              i++;
              continue;
            }
            if (skipLine.startsWith('elif ') || skipLine.startsWith('else:') || skipLine.startsWith('else :')) {
              i++;
              while (i < lines.length) {
                const bl = lines[i];
                const bt = bl.trim();
                if (bt && this.indent(bl) <= ind && !bt.startsWith('#')) break;
                i++;
              }
            } else {
              break;
            }
          }
        };

        if (cond) {
          this.execLines(body, ind + 1, env, inFn);
          skipChain();
          continue;
        }

        // Check for elif / else
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (!nextLine || nextLine.startsWith('#')) {
            i++;
            continue;
          }
          if (nextLine.startsWith('elif ')) {
            const elCondStr = nextLine.slice(5, nextLine.lastIndexOf(':')).trim();
            const elCond = this.eval(elCondStr, env);
            const elBody: string[] = [];
            i++;
            while (i < lines.length) {
              const bl = lines[i];
              const bt = bl.trim();
              if (bt && this.indent(bl) <= ind) break;
              elBody.push(bl);
              i++;
            }
            if (elCond) {
              this.execLines(elBody, ind + 1, env, inFn);
              skipChain();
              break;
            }
          } else if (nextLine.startsWith('else:') || nextLine.startsWith('else :')) {
            const elBody: string[] = [];
            i++;
            while (i < lines.length) {
              const bl = lines[i];
              const bt = bl.trim();
              if (bt && this.indent(bl) <= ind) break;
              elBody.push(bl);
              i++;
            }
            this.execLines(elBody, ind + 1, env, inFn);
            break;
          } else {
            break;
          }
        }
        continue;
      }

      if (t.startsWith('else:') || t.startsWith('else :')) {
        throw new Error(`  SyntaxError: 'else' without 'if' (line ${i + 1})`);
      }
      if (t.startsWith('elif ')) {
        throw new Error(`  SyntaxError: 'elif' without 'if' (line ${i + 1})`);
      }

      // for loop (supports tuple unpacking: for i, item in enumerate(x))
      const forM = t.match(/^for\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s+in\s+(.+):\s*$/);
      if (forM) {
        const varNames = forM[1].split(',').map(s => s.trim());
        const iterExpr = forM[2].trim();
        const body: string[] = [];
        i++;
        while (i < lines.length) {
          const bl = lines[i];
          const bt = bl.trim();
          if (bt && this.indent(bl) <= ind) break;
          body.push(bl);
          i++;
        }

        // Helper: set for-loop variable(s), supporting tuple unpacking
        const setVars = (val: PyVal) => {
          if (varNames.length === 1) {
            env.set(varNames[0], val);
          } else if (Array.isArray(val)) {
            for (let vi = 0; vi < varNames.length; vi++) {
              env.set(varNames[vi], val[vi]);
            }
          } else {
            throw new Error(`  ValueError: too many values to unpack (expected ${varNames.length})`);
          }
        };

        // Handle range()
        const rangeM = iterExpr.match(/^range\s*(\(.*\))$/);
        if (rangeM) {
          const inner = this.unParen(rangeM[1]);
          const args = inner.split(',').map(s => s.trim()).filter(Boolean);
          let start = 0, stop = 0, step = 1;
          if (args.length === 1) { stop = Number(this.eval(args[0], env)); }
          else if (args.length === 2) { start = Number(this.eval(args[0], env)); stop = Number(this.eval(args[1], env)); }
          else if (args.length === 3) { start = Number(this.eval(args[0], env)); stop = Number(this.eval(args[1], env)); step = Number(this.eval(args[2], env)); }
          if (varNames.length > 1) throw new Error(`  ValueError: cannot unpack from range() (expected ${varNames.length} variables)`);
          for (let val = start; step > 0 ? val < stop : val > stop; val += step) {
            env.set(varNames[0], val);
            try {
              this.execLines(body, ind + 1, env, inFn);
            } catch (e) {
              if (e instanceof LoopControl) {
                if (e.ctype === 'break') break;
              } else { throw e; }
            }
          }
        } else {
          const iterable = this.eval(iterExpr, env);
          const iterableList = this.toIterableList(iterable);
          if (iterableList === null) {
            throw new Error(`  TypeError: '${iterable === null ? 'NoneType' : typeof iterable}' object is not iterable\n    at line ${this.currentLine}`);
          }
          for (const val of iterableList) {
            setVars(val);
            try {
              this.execLines(body, ind + 1, env, inFn);
            } catch (e) {
              if (e instanceof LoopControl) {
                if (e.ctype === 'break') break;
                // continue falls through to next iteration
              } else { throw e; }
            }
          }
        }
        continue;
      }

      // while loop
      const whileM = t.match(/^while\s+(.+):\s*$/);
      if (whileM) {
        const condStr = whileM[1].trim();
        const body: string[] = [];
        i++;
        while (i < lines.length) {
          const bl = lines[i];
          const bt = bl.trim();
          if (bt && this.indent(bl) <= ind) break;
          body.push(bl);
          i++;
        }

        let iterations = 0;
        const maxIter = 10000; // Prevent infinite loops
        while (this.eval(condStr, env) && iterations < maxIter) {
          try {
            this.execLines(body, ind + 1, env, inFn);
          } catch (e) {
            if (e instanceof LoopControl) {
              if (e.ctype === 'break') break;
              // continue: re-check condition at top of while
              continue;
            } else { throw e; }
          }
          iterations++;
        }
        if (iterations >= maxIter) {
          // silently stop (educational context)
        }
        continue;
      }

      // break / continue / pass
      if (t === 'break') throw new LoopControl('break');
      if (t === 'continue') throw new LoopControl('continue');
      if (t === 'pass') { i++; continue; }

      // del
      if (t.startsWith('del ')) {
        const target = t.slice(4).trim();
        const delDictM = target.match(/^([a-zA-Z_]\w*)\[([^\]]+)\]$/);
        if (delDictM) {
          const dict = env.get(delDictM[1]) ?? this.globals.get(delDictM[1]);
          if (dict && this.isDict(dict)) {
            const key = String(this.eval(delDictM[2].trim(), env));
            delete (dict as { [key: string]: PyVal })[key];
          } else {
            throw new Error(`  TypeError: '${typeof dict}' object does not support item deletion\n    at line ${i + 1}`);
          }
        } else if (/^[a-zA-Z_]\w*$/.test(target)) {
          env.delete(target);
          this.globals.delete(target);
        }
        i++; continue;
      }

      // Dict assignment: d[key] = value
      const dictAssignM = t.match(/^([a-zA-Z_]\w*)\[([^\]]+)\]\s*=(?!=)\s*(.+)$/);
      if (dictAssignM) {
        const target = env.get(dictAssignM[1]) ?? this.globals.get(dictAssignM[1]);
        if (target && this.isDict(target)) {
          const key = String(this.eval(dictAssignM[2].trim(), env));
          const val = this.eval(dictAssignM[3].trim(), env);
          (target as { [key: string]: PyVal })[key] = val;
        } else {
          throw new Error(`  TypeError: '${typeof target}' object does not support item assignment\n    at line ${i + 1}`);
        }
        i++; continue;
      }

      // Variable assignment
      const assignM = t.match(/^([a-zA-Z_]\w*)\s*=(?!=)\s*(.+)$/);
      if (assignM) {
        const val = this.eval(assignM[2].trim(), env);
        env.set(assignM[1], val);
        i++; continue;
      }

      // Method call: obj.method(args)
      const methodCallM = t.match(/^([a-zA-Z_]\w*(?:\[[^\]]*\])*)\.([a-zA-Z_]\w*)\s*\((.*)?\)\s*$/);
      if (methodCallM) {
        const target = this.eval(methodCallM[1], env);
        const method = methodCallM[2];
        const rawArgs = methodCallM[3] ?? '';
        const args = rawArgs.trim() ? this.parseArgs(rawArgs, env) : [];
        if (Array.isArray(target)) {
          if (method === 'append' && args.length >= 1) target.push(args[0]);
          else if (method === 'remove' && args.length >= 1) {
            const idx = target.indexOf(args[0]);
            if (idx >= 0) target.splice(idx, 1);
          }
          else if (method === 'sort') target.sort((a, b) => Number(a) - Number(b));
          else if (method === 'pop') target.pop();
        } else if (this.isFile(target)) {
          const fileObj = target as any;
          if (method === 'write') {
            const text = String(args[0]);
            this.writeFile(fileObj.filename, fileObj.mode, text);
          }
        }
        i++; continue;
      }

      // Standalone function call
      const callM = t.match(/^([a-zA-Z_]\w*)\s*\((.*)?\)\s*$/);
      if (callM) {
        this.call(callM[1], callM[2] ?? '', env);
        i++; continue;
      }

      // return
      if (t.startsWith('return ')) {
        if (!inFn) {
          throw new Error(`  SyntaxError: 'return' outside function (line ${i + 1})`);
        }
        const val = this.eval(t.slice(7).trim(), env);
        throw new ReturnControl(val);
      }

      i++;
    }
  }



  // ── Function call ───────────────────────────────────────────────────────

  private call(name: string, argsStr: string, env: Env): PyVal {
    if (name === 'open') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      const filename = String(args[0]);
      const mode = args[1] ? String(args[1]) : 'r';
      return {
        __type__: 'file',
        filename,
        mode
      };
    }
    if (name === 'str') return this.str(this.eval(argsStr, env));
    if (name === 'repr') return this.repr(this.eval(argsStr, env));
    if (name === 'int') {
      const v = this.eval(argsStr, env);
      const n = Number(v);
      if (isNaN(n)) throw new Error(`  ValueError: invalid literal for int() with base 10: '${v}'`);
      if (typeof v === 'string' && v.includes('.')) return Math.trunc(n);
      return Math.trunc(n);
    }
    if (name === 'float') {
      const v = this.eval(argsStr, env);
      const n = Number(v);
      if (isNaN(n)) throw new Error(`  ValueError: could not convert string to float: '${v}'`);
      return n;
    }
    if (name === 'len') {
      const v = this.eval(argsStr, env);
      if (typeof v === 'string') return v.length;
      if (Array.isArray(v)) return v.length;
      if (this.isDict(v)) return Object.keys(v).length;
      if (v === null) return 0;
      throw new Error(`  TypeError: object of type '${typeof v}' has no len()`);
    }
    if (name === 'input') {
      const prompt = argsStr ? this.eval(argsStr, env) : '';
      if (prompt !== null && prompt !== undefined && String(prompt) !== '') {
        const pStr = String(prompt);
        this.out += pStr;
        this.prompts.push(pStr);
      }
      const val = this.inputs[this.inputIdx++];
      return val !== undefined ? val : '';
    }
    if (name === 'print') { this.handlePrint(argsStr, env); return null; }
    if (name === 'upper') {
      const v = this.eval(argsStr, env);
      return typeof v === 'string' ? v.toUpperCase() : null;
    }
    if (name === 'lower') {
      const v = this.eval(argsStr, env);
      return typeof v === 'string' ? v.toLowerCase() : null;
    }
    if (name === 'strip') {
      const v = this.eval(argsStr, env);
      return typeof v === 'string' ? v.trim() : null;
    }
    if (name === 'sum') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      if (args.length === 0) throw new Error(`  TypeError: sum() takes at least 1 argument (0 given)`);
      const v = args[0];
      const start = args[1] !== undefined ? Number(args[1]) : 0;
      const list = this.toIterableList(v);
      if (list === null) throw new Error(`  TypeError: '${v === null ? 'NoneType' : typeof v}' object is not iterable`);
      return list.reduce((a, b) => Number(a) + Number(b), start);
    }
    if (name === 'min') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      if (args.length === 0) throw new Error(`  TypeError: min() takes at least 1 argument (0 given)`);
      const v = args[0];
      const list = this.toIterableList(v);
      if (list === null) throw new Error(`  TypeError: '${v === null ? 'NoneType' : typeof v}' object is not iterable`);
      return Math.min(...list.filter(x => typeof x === 'number'));
    }
    if (name === 'max') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      if (args.length === 0) throw new Error(`  TypeError: max() takes at least 1 argument (0 given)`);
      const v = args[0];
      const list = this.toIterableList(v);
      if (list === null) throw new Error(`  TypeError: '${v === null ? 'NoneType' : typeof v}' object is not iterable`);
      return Math.max(...list.filter(x => typeof x === 'number'));
    }
    if (name === 'sorted') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      if (args.length === 0) throw new Error(`  TypeError: sorted() takes at least 1 argument (0 given)`);
      const v = args[0];
      const list = this.toIterableList(v);
      if (list === null) throw new Error(`  TypeError: '${v === null ? 'NoneType' : typeof v}' object is not iterable`);
      return [...list].sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });
    }
    if (name === 'set') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      if (args.length === 0) return [];
      const v = args[0];
      const list = this.toIterableList(v);
      if (list === null) throw new Error(`  TypeError: '${v === null ? 'NoneType' : typeof v}' object is not iterable`);
      return [...new Set(list)];
    }
    if (name === 'list') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      if (args.length === 0) return [];
      const v = args[0];
      const list = this.toIterableList(v);
      if (list === null) throw new Error(`  TypeError: '${v === null ? 'NoneType' : typeof v}' object is not iterable`);
      return list;
    }
    if (name === 'reversed') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      if (args.length === 0) throw new Error(`  TypeError: reversed() takes at least 1 argument (0 given)`);
      const v = args[0];
      const list = this.toIterableList(v);
      if (list === null) throw new Error(`  TypeError: '${v === null ? 'NoneType' : typeof v}' object is not iterable`);
      return [...list].reverse();
    }
    if (name === 'enumerate') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      if (args.length === 0) throw new Error(`  TypeError: enumerate() takes at least 1 argument (0 given)`);
      const v = args[0];
      const start = args[1] !== undefined ? Number(args[1]) : 0;
      const list = this.toIterableList(v);
      if (list === null) throw new Error(`  TypeError: '${v === null ? 'NoneType' : typeof v}' object is not iterable`);
      return list.map((item, idx) => [idx + start, item]);
    }
    if (name === 'type') {
      const v = this.eval(argsStr, env);
      if (v === null) return "<class 'NoneType'>";
      if (typeof v === 'string') return "<class 'str'>";
      if (typeof v === 'number') return Number.isInteger(v) ? "<class 'int'>" : "<class 'float'>";
      if (typeof v === 'boolean') return "<class 'bool'>";
      if (Array.isArray(v)) return "<class 'list'>";
      if (this.isDict(v)) return "<class 'dict'>";
      return `<class '${typeof v}'>`;
    }
    if (name === 'abs') {
      const v = this.eval(argsStr, env);
      if (typeof v !== 'number') throw new Error(`  TypeError: bad operand type for abs(): '${typeof v}'`);
      return Math.abs(v);
    }
    if (name === 'round') {
      const args = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
      const v = args[0];
      if (typeof v !== 'number') throw new Error(`  TypeError: '${typeof v}' object cannot be interpreted as an integer`);
      if (args.length >= 2) {
        const ndigits = Number(args[1]);
        return Number(v.toFixed(ndigits));
      }
      return Math.round(v);
    }

    const fn = this.fns.get(name);
    if (!fn) throw new Error(`  NameError: name '${name}' is not defined`);

    const argVals = argsStr.trim() ? this.parseArgs(argsStr, env) : [];
    if (argVals.length !== fn.params.length) {
      throw new Error(`  TypeError: ${name}() takes ${fn.params.length} positional argument${fn.params.length === 1 ? '' : 's'} but ${argVals.length} were given`);
    }
    const local: Env = new Map(this.globals);
    fn.params.forEach((p, i) => local.set(p, argVals[i] ?? null));
    
    const baseInd = fn.bodyLines.length > 0 ? this.indent(fn.bodyLines[0]) : 0;
    try {
      this.execLines(fn.bodyLines, baseInd, local, true);
    } catch (e) {
      if (e instanceof ReturnControl) {
        return e.value;
      }
      throw e;
    }
    return null;
  }

  // ── Print handler (supports multiple args, sep, end) ────────────────

  private handlePrint(argsStr: string, env: Env): void {
    if (!argsStr.trim()) { this.out += '\n'; return; }

    const parts: string[] = [];
    let cur = '', depth = 0, bracketDepth = 0, inStr = false, strCh = '';
    for (const ch of argsStr) {
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strCh = ch; cur += ch; }
      else if (inStr && ch === strCh) { inStr = false; cur += ch; }
      else if (!inStr && ch === '(') { depth++; cur += ch; }
      else if (!inStr && ch === ')') { depth--; cur += ch; }
      else if (!inStr && ch === '[') { bracketDepth++; cur += ch; }
      else if (!inStr && ch === ']') { bracketDepth--; cur += ch; }
      else if (!inStr && ch === ',' && !depth && !bracketDepth) { parts.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());

    let sep = ' ';
    let end = '\n';
    const positional: string[] = [];

    for (const part of parts) {
      const eqIdx = part.indexOf('=');
      if (eqIdx > 0) {
        const key = part.slice(0, eqIdx).trim();
        const valExpr = part.slice(eqIdx + 1).trim();
        if (key === 'sep') {
          const val = this.eval(valExpr, env);
          sep = val !== null ? String(val) : ' ';
          continue;
        }
        if (key === 'end') {
          const val = this.eval(valExpr, env);
          end = val !== null ? String(val) : '\n';
          continue;
        }
      }
      positional.push(part);
    }

    const vals = positional.map(p => this.eval(p, env));
    const result = vals.map(v => this.str(v)).join(sep);

    this.out += result + end;
  }

  private isDict(v: PyVal): v is { [key: string]: PyVal } {
    return typeof v === 'object' && v !== null && !Array.isArray(v) && !('__type__' in v);
  }

  private toIterableList(v: PyVal): PyVal[] | null {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') return v.split('');
    if (this.isFile(v)) {
      const fileObj = v as any;
      try {
        const content = this.readFile(fileObj.filename, fileObj.mode);
        return content ? content.split(/(?<=\n)/) : [];
      } catch (e) {
        // If file read fails, return empty array
        return [];
      }
    }
    if (this.isDict(v)) {
      return Object.keys(v);
    }
    return null;
  }

  // ── Expression evaluator ───────────────────────────────────────────────

  private eval(expr: string, env: Env): PyVal {
    expr = expr.trim();
    if (!expr) return null;

    // f-string (supports !r, !s conversions and format specifiers like :.2f, :, , :>10, :b, :x, :%)
    if (expr.startsWith('f"') || expr.startsWith("f'")) {
      const quote = expr[1];
      const inner = expr.slice(2, expr.lastIndexOf(quote));
      return inner.replace(/\{([^}]+)\}/g, (_, e) => {
        try {
          let exprStr = e.trim();
          let conversion: 'r' | 's' | null = null;
          // Check for !r or !s conversion
          const bangM = exprStr.match(/^(.+?)\s*!(r|s)\s*(?::\s*(.*))?$/s);
          if (bangM) {
            exprStr = bangM[1].trim();
            conversion = bangM[2] as 'r' | 's';
            if (bangM[3] !== undefined) exprStr += ':' + bangM[3].trim();
          }
          // Split on last : that's not inside brackets/parens/quotes
          let formatSpec = '';
          let depth = 0;
          let lastColon = -1;
          let inStr = false;
          let strChar = '';
          for (let ci = 0; ci < exprStr.length; ci++) {
            const ch = exprStr[ci];
            if (inStr) {
              if (ch === strChar && (ci === 0 || exprStr[ci - 1] !== '\\')) inStr = false;
              continue;
            }
            if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
            if (ch === '(' || ch === '[' || ch === '{') { depth++; continue; }
            if (ch === ')' || ch === ']' || ch === '}') { depth--; continue; }
            if (ch === ':' && depth === 0) lastColon = ci;
          }
          if (lastColon >= 0) {
            formatSpec = exprStr.slice(lastColon + 1).trim();
            exprStr = exprStr.slice(0, lastColon).trim();
          }
          // Re-parse conversion from the first part
          const reBang = exprStr.match(/^(.+?)\s*!(r|s)\s*$/);
          if (reBang) {
            exprStr = reBang[1].trim();
            conversion = reBang[2] as 'r' | 's';
          }
          const val = this.eval(exprStr, env);
          const strVal = conversion === 'r'
            ? this.repr(val)
            : this.str(val);
          if (!formatSpec) return strVal;
          // Apply format spec
          const num = Number(val);
          if (formatSpec === ',') {
            if (typeof val === 'number') return Number(val).toLocaleString('en-US');
            return strVal;
          }
          if (formatSpec === '%') {
            if (typeof val === 'number') return String(Math.round(num * 100)) + '%';
            return strVal;
          }
          if (formatSpec === 'd') {
            if (typeof val === 'number') return String(Math.trunc(num));
            return strVal;
          }
          if (formatSpec === 'e') return Number(val).toExponential();
          if (formatSpec === 'E') return Number(val).toExponential().toUpperCase();
          if (formatSpec === 'b') return Math.trunc(num).toString(2);
          if (formatSpec === 'x') return Math.trunc(num).toString(16);
          if (formatSpec === 'X') return Math.trunc(num).toString(16).toUpperCase();
          if (formatSpec === 'o') return Math.trunc(num).toString(8);
          // :.Nf - float with N decimals
          const dotF = formatSpec.match(/^\.(\d+)f$/);
          if (dotF) return Number(val).toFixed(parseInt(dotF[1]));
          // :>N, :<N, :^N - alignment with width
          const alignM = formatSpec.match(/^([<>^])(\d+)$/);
          if (alignM) {
            const pad = parseInt(alignM[2]);
            const s = strVal;
            if (alignM[1] === '>') return s.padStart(pad);
            if (alignM[1] === '<') return s.padEnd(pad);
            if (alignM[1] === '^') {
              const left = Math.floor((pad - s.length) / 2);
              const right = pad - s.length - left;
              return ' '.repeat(left) + s + ' '.repeat(right);
            }
          }
          // :0Nd - zero-padded integer
          const zeroM = formatSpec.match(/^0(\d+)d$/);
          if (zeroM) return String(Math.trunc(num)).padStart(parseInt(zeroM[1]), '0');
          // Generic :width (just pad)
          const width = parseInt(formatSpec);
          if (!isNaN(width) && String(width) === formatSpec) return strVal.padStart(width);
          return strVal;
        } catch { return `{${e}}`; }
      });
    }

    // Triple-quoted strings
    if (expr.startsWith('"""') && expr.endsWith('"""')) return expr.slice(3, -3);
    if (expr.startsWith("'''") && expr.endsWith("'''")) return expr.slice(3, -3);

    // String literals (must be a pure string, not a compound expression like "a"+b+"c")
    if ((expr.startsWith('"') && expr.endsWith('"') && !expr.slice(1, -1).includes('"')) ||
        (expr.startsWith("'") && expr.endsWith("'") && !expr.slice(1, -1).includes("'"))) {
      return expr.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    }

    // Keywords
    if (expr === 'None') return null;
    if (expr === 'True') return true;
    if (expr === 'False') return false;

    // Numbers
    if (/^-?\d+$/.test(expr)) return parseInt(expr, 10);
    if (/^-?\d*\.\d+$/.test(expr)) return parseFloat(expr);

    // Unary minus
    if (expr.startsWith('-') && expr.length > 1 && /^-\s*\d/.test(expr) === false) {
      // Only try unary minus if it's NOT a negative number literal
      if (!/^-\d+$/.test(expr) && !/^-\d*\.\d+$/.test(expr)) {
        const val = this.eval(expr.slice(1).trim(), env);
        if (typeof val === 'number') return -val;
        throw new Error(`  TypeError: bad operand type for unary -: '${typeof val}'`);
      }
    }

    // String repeat: "=" * 3
    const mulStrM = expr.match(/^(['"])(.*)\1\s*\*\s*(\d+)$/);
    if (mulStrM) return mulStrM[2].repeat(parseInt(mulStrM[3], 10));

    // List literal: [a, b, c]
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      return this.parseArgs(inner, env);
    }

    // Tuple literal: (a, b, c) — treat as list
    if (expr.startsWith('(') && expr.endsWith(')') && expr.includes(',')) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      return this.parseArgs(inner, env);
    }

    // Parenthesized expression: (expr)
    if (expr.startsWith('(') && expr.endsWith(')')) {
      return this.eval(expr.slice(1, -1).trim(), env);
    }

    // Dict literal: {key: val, ...}
    if (expr.startsWith('{') && expr.endsWith('}')) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return {};
      if (inner.includes(':')) return this.parseDictLiteral(inner, env);
    }

    // Logical operators (lowest precedence)
    const logOps: Array<[string, (a: PyVal, b: PyVal) => PyVal]> = [
      [' and ', (a, b) => a && b],
      [' or ', (a, b) => a || b],
    ];
    for (const [op, fn] of logOps) {
      const idx = this.findWordOutsideStrings(expr, op);
      if (idx > 0) {
        const lhs = this.eval(expr.slice(0, idx).trim(), env);
        if (op === ' and ' && !lhs) return lhs;
        if (op === ' or ' && lhs) return lhs;
        return fn(lhs, this.eval(expr.slice(idx + op.length).trim(), env));
      }
    }

    // not
    if (expr.startsWith('not ')) {
      return !this.eval(expr.slice(4).trim(), env);
    }

    // Comparison operators (lowest precedence)
    const compOps = ['==', '!=', '>=', '<=', '>', '<'];
    for (const op of compOps) {
      const idx = this.findOpOutsideStrings(expr, op);
      if (idx > 0) {
        const lhs = expr.slice(0, idx).trim();
        const rhs = expr.slice(idx + op.length).trim();
        if (!lhs || !rhs) continue;
        const lv = this.eval(lhs, env);
        const rv = this.eval(rhs, env);
        switch (op) {
          case '==': return lv === rv;
          case '!=': return lv !== rv;
          case '>': return Number(lv) > Number(rv);
          case '<': return Number(lv) < Number(rv);
          case '>=': return Number(lv) >= Number(rv);
          case '<=': return Number(lv) <= Number(rv);
        }
      }
    }

    // Membership: in / not in
    const notInIdx = this.findWordOutsideStrings(expr, ' not in ');
    if (notInIdx > 0) {
      const lhs = this.eval(expr.slice(0, notInIdx).trim(), env);
      const rhs = this.eval(expr.slice(notInIdx + 8).trim(), env);
      return !this._contains(rhs, lhs);
    }
    const inIdx = this.findWordOutsideStrings(expr, ' in ');
    if (inIdx > 0) {
      const lhs = this.eval(expr.slice(0, inIdx).trim(), env);
      const rhs = this.eval(expr.slice(inIdx + 4).trim(), env);
      return this._contains(rhs, lhs);
    }



    // Binary operators
    const bin = this.findBinOp(expr);
    if (bin) {
      const [lhs, op, rhs] = bin;
      const lv = this.eval(lhs, env);
      const rv = this.eval(rhs, env);
      if (lv === null || rv === null) {
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      if (typeof lv === 'string' || typeof rv === 'string') {
        if (op === '+') return String(lv ?? '') + String(rv ?? '');
        if (op === '%' && typeof lv === 'string') return this.formatString(lv, rv);
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      if (typeof lv !== 'number' || typeof rv !== 'number') {
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      switch (op) {
        case '+': return lv + rv;
        case '-': return lv - rv;
        case '*': return lv * rv;
        case '/':
          if (rv === 0) throw new Error(`  ZeroDivisionError: division by zero`);
          return lv / rv;
        case '//':
          if (rv === 0) throw new Error(`  ZeroDivisionError: integer division or modulo by zero`);
          return Math.floor(lv / rv);
        case '%':
          if (rv === 0) throw new Error(`  ZeroDivisionError: modulo by zero`);
          return lv % rv;
        case '**':
          return Math.pow(lv, rv);
      }
    }

    // Function call
    const fnM = expr.match(/^([a-zA-Z_]\w*)\s*\((.*)?\)$/);
    if (fnM) return this.call(fnM[1], fnM[2] ?? '', env);

    // Indexing or slicing: expr[idx] or expr[start:end]
    const idxM = expr.match(/^(.+)\[([^\]]+)\]$/);
    if (idxM) {
      const target = this.eval(idxM[1].trim(), env);
      const inner = idxM[2].trim();
      // Slicing: start:end or :end or start:
      if (inner.includes(':')) {
        const parts = inner.split(':');
        const startStr = parts[0].trim();
        const endStr = (parts[1] ?? '').trim();
        const stepStr = (parts[2] ?? '').trim();

        if (typeof target !== 'string' && !Array.isArray(target)) {
          throw new Error(`  TypeError: object of type '${typeof target}' is not subscriptable`);
        }

        const step = stepStr ? Number(this.eval(stepStr, env)) : 1;
        if (isNaN(step) || step === 0) throw new Error("  ValueError: slice step cannot be zero");

        let start: number;
        if (startStr) {
          start = Number(this.eval(startStr, env));
          if (start < 0) start = target.length + start;
        } else {
          start = step > 0 ? 0 : target.length - 1;
        }

        let end: number;
        if (endStr) {
          end = Number(this.eval(endStr, env));
          if (end < 0) end = target.length + end;
        } else {
          end = step > 0 ? target.length : -1;
        }

        const result: any[] = [];
        if (step > 0) {
          for (let k = start; k < end; k += step) {
            if (k >= 0 && k < target.length) result.push(target[k]);
          }
        } else {
          for (let k = start; k > end; k += step) {
            if (k >= 0 && k < target.length) result.push(target[k]);
          }
        }

        if (typeof target === 'string') {
          return result.join('');
        }
        return result;
      }
      const index = this.eval(inner, env);
      const idx = typeof index === 'number' ? index : Number(index);
      if (typeof target === 'string') {
        if (idx < 0) return target[target.length + idx] ?? '';
        return target[idx] ?? '';
      }
      if (Array.isArray(target)) {
        if (idx < 0) return target[target.length + idx] ?? null;
        return target[idx] ?? null;
      }
      if (this.isDict(target)) {
        const k = String(index);
        if (k in target) return target[k];
        throw new Error(`  KeyError: '${k}'`);
      }
      throw new Error(`  TypeError: object of type '${typeof target}' is not subscriptable`);
    }

    // Method call: target.method(args)
    const methodEvalM = expr.match(/^(.+)\.([a-zA-Z_]\w*)\s*\((.*)?\)$/);
    if (methodEvalM) {
      const target = this.eval(methodEvalM[1].trim(), env);
      const methodName = methodEvalM[2];
      const rawArgs = methodEvalM[3] ?? '';
      const args = rawArgs.trim() ? this.parseArgs(rawArgs, env) : [];
      if (typeof target === 'string') {
        if (methodName === 'upper') return target.toUpperCase();
        if (methodName === 'lower') return target.toLowerCase();
        if (methodName === 'strip') return target.trim();
        if (methodName === 'replace' && args.length >= 2) return target.split(String(args[0])).join(String(args[1]));
        if (methodName === 'find' && args.length >= 1) return target.indexOf(String(args[0]));
        if (methodName === 'split') {
          if (args.length >= 1) return target.split(String(args[0]));
          return target.split(/\s+/).filter(Boolean);
        }
        if (methodName === 'join' && args.length >= 1 && Array.isArray(args[0])) {
          const arr = args[0] as PyVal[];
          return arr.map(x => String(x)).join(target);
        }
      }
      if (Array.isArray(target)) {
        if (methodName === 'pop') return target.pop() ?? null;
        if (methodName === 'append' && args.length >= 1) { target.push(args[0]); return null; }
        if (methodName === 'remove' && args.length >= 1) {
          const idx = target.indexOf(args[0]);
          if (idx >= 0) target.splice(idx, 1);
          return null;
        }
        if (methodName === 'sort') { target.sort((a, b) => Number(a) - Number(b)); return null; }
      }
      if (this.isDict(target)) {
        if (methodName === 'keys') return Object.keys(target);
        if (methodName === 'values') return Object.values(target);
        if (methodName === 'items') {
          const result: PyVal[] = [];
          for (const k of Object.keys(target)) result.push([k, target[k]]);
          return result;
        }
        if (methodName === 'get') {
          if (args.length >= 1) {
            const k = String(args[0]);
            if (k in target) return target[k];
            if (args.length >= 2) return args[1];
            return null;
          }
        }
      }
      if (this.isFile(target)) {
        const fileObj = target as any;
        if (methodName === 'write') {
          const text = String(args[0]);
          this.writeFile(fileObj.filename, fileObj.mode, text);
          return text.length;
        }
        if (methodName === 'read') {
          return this.readFile(fileObj.filename, fileObj.mode);
        }
        if (methodName === 'readlines') {
          const content = this.readFile(fileObj.filename, fileObj.mode);
          return content ? content.split(/(?<=\n)/) : [];
        }
        if (methodName === 'close') {
          return null;
        }
      }
      throw new Error(`  AttributeError: '${typeof target}' object has no attribute '${methodName}'`);
    }

    // Variable
    if (/^[a-zA-Z_]\w*$/.test(expr)) {
      if (env.has(expr)) return env.get(expr)!;
      if (this.globals.has(expr)) return this.globals.get(expr)!;
      throw new Error(`  NameError: name '${expr}' is not defined`);
    }

    return null;
  }

  private _contains(container: PyVal, item: PyVal): boolean {
    if (typeof container === 'string' && typeof item === 'string') return container.includes(item);
    if (Array.isArray(container)) return container.includes(item);
    if (this.isDict(container)) return item !== null && item !== undefined && String(item) in container;
    throw new Error(`  TypeError: argument of type '${typeof container}' is not iterable`);
  }

  private findWordOutsideStrings(expr: string, word: string): number {
    let inStr = false, strCh = '';
    let depth = 0, bracketDepth = 0, braceDepth = 0;
    const startsWithSpace = word.startsWith(' ');
    const endsWithSpace = word.endsWith(' ');
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (!inStr && depth === 0 && bracketDepth === 0 && braceDepth === 0 && i <= expr.length - word.length) {
        if (expr.slice(i, i + word.length) === word) {
          // Spaces in the pattern already act as word boundaries
          if (startsWithSpace || endsWithSpace) return i;
          const before = expr[i - 1];
          const after = expr[i + word.length];
          const isBoundaryBefore = i === 0 || !/[a-zA-Z0-9_]/.test(before);
          const isBoundaryAfter = (i + word.length) >= expr.length || !/[a-zA-Z0-9_]/.test(after);
          if (isBoundaryBefore && isBoundaryAfter) return i;
        }
      }
      if (ch === '"' || ch === "'") {
        if (!inStr) { inStr = true; strCh = ch; }
        else if (ch === strCh) inStr = false;
      } else if (!inStr) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === '[') bracketDepth++;
        else if (ch === ']') bracketDepth--;
        else if (ch === '{') braceDepth++;
        else if (ch === '}') braceDepth--;
      }
    }
    return -1;
  }

  private parseDictLiteral(inner: string, env: Env): { [key: string]: PyVal } {
    const result: { [key: string]: PyVal } = {};
    const parts: string[] = [];
    let cur = '', depth = 0, bracketDepth = 0, braceDepth = 0, inStr = false, strCh = '';
    for (const ch of inner) {
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strCh = ch; cur += ch; }
      else if (inStr && ch === strCh) { inStr = false; cur += ch; }
      else if (!inStr && ch === '(') { depth++; cur += ch; }
      else if (!inStr && ch === ')') { depth--; cur += ch; }
      else if (!inStr && ch === '[') { bracketDepth++; cur += ch; }
      else if (!inStr && ch === ']') { bracketDepth--; cur += ch; }
      else if (!inStr && ch === '{') { braceDepth++; cur += ch; }
      else if (!inStr && ch === '}') { braceDepth--; cur += ch; }
      else if (!inStr && ch === ',' && !depth && !bracketDepth && !braceDepth) { parts.push(cur); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) parts.push(cur);
    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0) {
        const key = String(this.eval(part.slice(0, colonIdx).trim(), env));
        const val = this.eval(part.slice(colonIdx + 1).trim(), env);
        result[key] = val;
      }
    }
    return result;
  }

  private findOpOutsideStrings(expr: string, op: string): number {
    let inStr = false, strCh = '';
    let depth = 0, bracketDepth = 0, braceDepth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (!inStr && depth === 0 && bracketDepth === 0 && braceDepth === 0 && i <= expr.length - op.length) {
        if (expr.slice(i, i + op.length) === op) return i;
      }
      if (ch === '"' || ch === "'") {
        if (!inStr) { inStr = true; strCh = ch; }
        else if (ch === strCh) inStr = false;
      } else if (!inStr) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === '[') bracketDepth++;
        else if (ch === ']') bracketDepth--;
        else if (ch === '{') braceDepth++;
        else if (ch === '}') braceDepth--;
      }
    }
    return -1;
  }

  private unParen(s: string): string {
    if (!s.startsWith('(')) return s;
    let d = 0, start = -1;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') { if (!d) start = i + 1; d++; }
      else if (s[i] === ')') { d--; if (!d) return s.slice(start, i); }
    }
    return s.slice(1);
  }

  private parseArgs(argsStr: string, env: Env): PyVal[] {
    const parts: string[] = [];
    let cur = '', depth = 0, bracketDepth = 0, braceDepth = 0, inStr = false, strCh = '';
    for (const ch of argsStr) {
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strCh = ch; cur += ch; }
      else if (inStr && ch === strCh) { inStr = false; cur += ch; }
      else if (!inStr && ch === '(') { depth++; cur += ch; }
      else if (!inStr && ch === ')') { depth--; cur += ch; }
      else if (!inStr && ch === '[') { bracketDepth++; cur += ch; }
      else if (!inStr && ch === ']') { bracketDepth--; cur += ch; }
      else if (!inStr && ch === '{') { braceDepth++; cur += ch; }
      else if (!inStr && ch === '}') { braceDepth--; cur += ch; }
      else if (!inStr && ch === ',' && !depth && !bracketDepth && !braceDepth) { parts.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts.map(p => this.eval(p, env));
  }

  private findBinOp(expr: string): [string, string, string] | null {
    const ops = ['+', '-', '**', '*', '//', '/', '%'];
    let inStr = false, strCh = '', depth = 0, bracketDepth = 0, braceDepth = 0;
    for (let i = expr.length - 1; i >= 1; i--) {
      const ch = expr[i];
      if (ch === ')') depth++;
      else if (ch === '(') depth--;
      else if (ch === ']') bracketDepth++;
      else if (ch === '[') bracketDepth--;
      else if (ch === '}') braceDepth++;
      else if (ch === '{') braceDepth--;
      else if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strCh = ch; }
      else if (inStr && ch === strCh) inStr = false;
      if (!inStr && !depth && !bracketDepth && !braceDepth) {
        for (const op of ops) {
          if (expr.slice(i, i + op.length) === op) {
            // Skip '-' if it's likely unary minus (prev non-space char is not a valid expr ending)
            if (op === '-' && i > 0) {
              let j = i - 1;
              while (j >= 0 && expr[j] === ' ') j--;
              const prev = j >= 0 ? expr[j] : '';
              if (!prev || !/[a-zA-Z0-9_)\]}]/.test(prev)) continue;
            }
            // Skip '*' if it's the second char of '**'
            if (op === '*' && i > 0 && expr[i - 1] === '*') continue;
            // Skip '/' if it's the second char of '//'
            if (op === '/' && i > 0 && expr[i - 1] === '/') continue;
            const lhs = expr.slice(0, i).trim();
            const rhs = expr.slice(i + op.length).trim();
            if (lhs && rhs && !lhs.endsWith('=')) return [lhs, op, rhs];
          }
        }
      }
    }
    return null;
  }

  private static inMemoryFs = new Map<string, string>();

  // Clear in-memory filesystem (for test isolation)
  private static clearInMemoryFs(): void {
    MiniPython.inMemoryFs.clear();
  }

  // Clear localStorage file entries (for test isolation)
  private static clearLocalStorageFiles(): void {
    if (typeof localStorage !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fa_file_')) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    }
  }

  private isFile(v: PyVal): boolean {
    return typeof v === 'object' && v !== null && '__type__' in v && (v as any).__type__ === 'file';
  }

  private getFileContent(filename: string): string | null {
    const storageKey = `fa_file_${filename}`;
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(storageKey);
    }
    return MiniPython.inMemoryFs.get(storageKey) ?? null;
  }

  private setFileContent(filename: string, content: string): void {
    const storageKey = `fa_file_${filename}`;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, content);
    } else {
      MiniPython.inMemoryFs.set(storageKey, content);
    }
  }

  private readFile(filename: string, mode: string): string {
    const cleanFilename = filename.replace(/['"]/g, '').trim();
    const cleanMode = mode.replace(/['"]/g, '').trim();
    if (cleanMode === 'w' || cleanMode === 'a') {
      throw new Error(`  UnsupportedOperation: not readable`);
    }
    const content = this.getFileContent(cleanFilename);
    if (content === null) {
      throw new Error(`  FileNotFoundError: [Errno 2] No such file or directory: '${cleanFilename}'`);
    }
    return content;
  }

  private writeFile(filename: string, mode: string, text: string): void {
    const cleanFilename = filename.replace(/['"]/g, '').trim();
    const cleanMode = mode.replace(/['"]/g, '').trim();
    if (cleanMode === 'r') {
      throw new Error(`  UnsupportedOperation: not writable`);
    }
    let content = this.getFileContent(cleanFilename) || '';
    if (cleanMode === 'w') {
      content = text;
    } else if (cleanMode === 'a') {
      content += text;
    }
    this.setFileContent(cleanFilename, content);
  }

  private reconstructLogicalLines(code: string): string[] {
    const physicalLines = code.split('\n');
    const logicalLines: string[] = [];
    
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
        
        if (char === '(') openParentheses++;
        else if (char === ')') openParentheses--;
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets--;
        else if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
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
      } else {
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

  private formatString(format: string, args: PyVal): string {
    const argList = Array.isArray(args) ? args : [args];
    let argIdx = 0;
    
    return format.replace(/%([-+ 0#]*)?(\d+)?(?:\.(\d+))?([sdiouxXeEfFgG%])/g, (match, flags, width, precision, type) => {
      if (type === '%') return '%';
      if (argIdx >= argList.length) {
        throw new Error(`  TypeError: not enough arguments for format string`);
      }
      const val = argList[argIdx++];
      
      let formatted = '';
      if (type === 's') {
        formatted = this.str(val);
      } else if (type === 'd' || type === 'i') {
        formatted = String(Math.trunc(Number(val)));
      } else if (type === 'f' || type === 'F') {
        if (precision !== undefined) {
          formatted = Number(val).toFixed(parseInt(precision, 10));
        } else {
          formatted = Number(val).toFixed(6);
        }
      } else if (type === 'x' || type === 'X') {
        const num = Math.trunc(Number(val));
        formatted = type === 'x' ? num.toString(16) : num.toString(16).toUpperCase();
      } else {
        formatted = String(val);
      }
      
      if (width) {
        const w = parseInt(width, 10);
        const padChar = flags && flags.includes('0') ? '0' : ' ';
        if (formatted.length < w) {
          if (flags && flags.includes('-')) {
            formatted = formatted.padEnd(w, ' ');
          } else {
            formatted = formatted.padStart(w, padChar);
          }
        }
      }
      return formatted;
    });
  }

  private str(v: PyVal): string {
    if (typeof v === 'string') return v;
    return this.repr(v);
  }

  private repr(v: PyVal): string {
    if (v === null) return 'None';
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    if (typeof v === 'string') {
      const escaped = v
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `'${escaped}'`;
    }
    if (Array.isArray(v)) return '[' + v.map(x => this.repr(x)).join(', ') + ']';
    if (this.isDict(v)) {
      const entries = Object.entries(v).map(([k, val]) => `${this.repr(k)}: ${this.repr(val)}`);
      return '{' + entries.join(', ') + '}';
    }
    if (this.isFile(v)) {
      const fileObj = v as any;
      return `<_io.TextIOWrapper name='${fileObj.filename}' mode='${fileObj.mode}' encoding='UTF-8'>`;
    }
    return String(v);
  }
}

export function normalizeNumbers(str: string): string {
  return str.replace(/-?(?:\d+(?:\.\d+)?|\.\d+)/g, (match) => {
    const val = parseFloat(match);
    return isNaN(val) ? match : String(val);
  });
}

export function stripPrompts(text: string, prompts: string[]): string {
  let result = text;
  for (const prompt of prompts) {
    if (!prompt) continue;
    const escaped = prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), '');
  }
  return result;
}

