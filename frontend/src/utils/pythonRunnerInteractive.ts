// Interactive Python runner with generator-based stdin/stdout.
// Yields execution events. input() pauses until caller sends a value.

<<<<<<< HEAD
type PyVal = string | number | boolean | null;
type Env = Map<string, PyVal>;
type FnDef = { params: string[]; bodyLines: string[] };

=======
>>>>>>> 8245f18 (Initial commit)
export type ExecEvent =
  | { type: 'stdout'; text: string }
  | { type: 'input'; prompt: string }
  | { type: 'stderr'; text: string };

export interface ExecResult {
  output: string;
  error: string | null;
  exitCode: number;
}

<<<<<<< HEAD
export function* runInteractive(code: string): Generator<ExecEvent, ExecResult, string> {
  const runner = new InteractivePython();
  const result = yield* runner.exec(code);
  return result;
}

class InteractivePython {
  private globals: Env = new Map();
  private fns: Map<string, FnDef> = new Map();
  private out: string[] = [];
  private currentLine = 0;

  *exec(code: string): Generator<ExecEvent, ExecResult, string> {
    this.globals = new Map();
    this.fns = new Map();
    this.out = [];
    this.currentLine = 0;

    try {
      this.validateSyntax(code);
      yield* this.execLines(code.split('\n'), 0, this.globals);
      return { output: this.out.join('\n'), error: null, exitCode: 0 };
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e);
      const tb = `Traceback (most recent call last):\n  File "<stdin>", line ${this.currentLine}, in <module>\n${msg}`;
      yield { type: 'stderr', text: tb };
      return { output: this.out.join('\n'), error: tb, exitCode: 1 };
    }
  }

  // ── Syntax validation ──

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
        }
        j++;
      }

      if (!inSingleQuote && !inDoubleQuote && !inTripleSingle && !inTripleDouble) {
        if (raw.trim() && !raw.trim().startsWith('#') && parenDepth < 0)
          throw new Error(`  SyntaxError: unmatched ')' (line ${i + 1})`);
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

  // ── Indentation ──

  private indent(line: string): number {
    let n = 0;
    for (const c of line) {
      if (c === ' ') n++;
      else if (c === '\t') n += 4;
      else break;
    }
    return n;
  }

  // ── Code execution ──

  private *execLines(lines: string[], base: number, env: Env): Generator<ExecEvent, void, string> {
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
        this.fns.set(name, { params, bodyLines: body });
        continue;
      }

      // Print statement
      if (t.startsWith('print(') || t.startsWith('print (')) {
        const argsStr = this.unParen(t.slice(t.indexOf('(')));
        const args = this.parseArgsSimple(argsStr);
        const parts: string[] = [];
        for (const a of args) {
          const v = yield* this.eval(a, env);
          parts.push(this.repr(v));
        }
        const line = parts.join(' ');
        this.out.push(line);
        yield { type: 'stdout', text: line + '\n' };
        i++; continue;
      }

      // Augmented assignment
      const augM = t.match(/^([a-zA-Z_]\w*)\s*([+\-*\/%]|\/\/)=\s*(.+)$/);
      if (augM) {
        const cur = this.evalSync(augM[1], env);
        if (cur === null || cur === undefined) {
          throw new Error(`  NameError: name '${augM[1]}' is not defined\n    at line ${i + 1}`);
        }
        const rhs = yield* this.eval(augM[3].trim(), env);
        const op = augM[2];
        let res: PyVal;
        if (typeof cur !== 'number' || typeof rhs !== 'number') {
          throw new Error(`  TypeError: unsupported operand type(s) for ${op}=: '${typeof cur}' and '${typeof rhs}'\n    at line ${i + 1}`);
        }
        switch (op) {
          case '+': res = cur + rhs; break;
          case '-': res = cur - rhs; break;
          case '*': res = cur * rhs; break;
          case '/': if (rhs === 0) throw new Error(`  ZeroDivisionError: division by zero\n    at line ${i + 1}`); res = cur / rhs; break;
          case '//': if (rhs === 0) throw new Error(`  ZeroDivisionError: integer division or modulo by zero\n    at line ${i + 1}`); res = Math.floor(cur / rhs); break;
          case '%': if (rhs === 0) throw new Error(`  ZeroDivisionError: modulo by zero\n    at line ${i + 1}`); res = cur % rhs; break;
          default: res = 0;
        }
        env.set(augM[1], res);
        i++; continue;
      }

      // if / elif / else
      if (t.startsWith('if ') || t.startsWith('elif ')) {
        const condStr = t.slice(t.startsWith('elif ') ? 5 : 3, t.lastIndexOf(':')).trim();
        const cond = yield* this.eval(condStr, env);
        const body: string[] = [];
        i++;
        while (i < lines.length) {
          const bl = lines[i];
          const bt = bl.trim();
          if (bt && this.indent(bl) <= ind) break;
          body.push(bl);
          i++;
        }
        if (cond) { yield* this.execLines(body, ind + 1, env); continue; }

        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('elif ')) {
            const elCondStr = nextLine.slice(5, nextLine.lastIndexOf(':')).trim();
            const elCond = yield* this.eval(elCondStr, env);
            const elBody: string[] = [];
            i++;
            while (i < lines.length) {
              const bl = lines[i];
              const bt = bl.trim();
              if (bt && this.indent(bl) <= ind) break;
              elBody.push(bl);
              i++;
            }
            if (elCond) { yield* this.execLines(elBody, ind + 1, env); break; }
          } else if (nextLine.startsWith('else:')) {
            const elBody: string[] = [];
            i++;
            while (i < lines.length) {
              const bl = lines[i];
              const bt = bl.trim();
              if (bt && this.indent(bl) <= ind) break;
              elBody.push(bl);
              i++;
            }
            yield* this.execLines(elBody, ind + 1, env);
            break;
          } else break;
        }
        continue;
      }

      if (t.startsWith('else:')) {
        throw new Error(`  SyntaxError: 'else' without 'if' (line ${i + 1})`);
      }

      // for loop
      const forM = t.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+(.+):\s*$/);
      if (forM) {
        const varName = forM[1];
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

        const rangeM = iterExpr.match(/^range\s*\(([^)]*)\)\s*$/);
        if (rangeM) {
          const args = rangeM[1].split(',').map(s => s.trim()).filter(Boolean);
          let start = 0, stop = 0, step = 1;
          if (args.length === 1) { stop = Number(yield* this.eval(args[0], env)); }
          else if (args.length === 2) { start = Number(yield* this.eval(args[0], env)); stop = Number(yield* this.eval(args[1], env)); }
          else if (args.length === 3) { start = Number(yield* this.eval(args[0], env)); stop = Number(yield* this.eval(args[1], env)); step = Number(yield* this.eval(args[2], env)); }
          for (let val = start; step > 0 ? val < stop : val > stop; val += step) {
            env.set(varName, val);
            yield* this.execLines(body, ind + 1, env);
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
        const maxIter = 10000;
        while (!!(yield* this.eval(condStr, env)) && iterations < maxIter) {
          yield* this.execLines(body, ind + 1, env);
          iterations++;
        }
        continue;
      }

      // Variable assignment
      const assignM = t.match(/^([a-zA-Z_]\w*)\s*=(?!=)\s*(.+)$/);
      if (assignM) {
        const val = yield* this.eval(assignM[2].trim(), env);
        env.set(assignM[1], val);
        i++; continue;
      }

      // Standalone function call
      const callM = t.match(/^([a-zA-Z_]\w*)\s*\((.*)?\)\s*$/);
      if (callM) {
        yield* this.call(callM[1], callM[2] ?? '', env);
        i++; continue;
      }

      // return outside function
      if (t.startsWith('return ')) {
        throw new Error(`  SyntaxError: 'return' outside function (line ${i + 1})`);
      }

      i++;
    }
  }

  private *runBody(lines: string[], env: Env): Generator<ExecEvent, PyVal, string> {
    let baseInd = Infinity;
    for (const l of lines) {
      if (l.trim()) { baseInd = this.indent(l); break; }
    }
    if (!isFinite(baseInd)) return null;

    for (let i = 0; i < lines.length; i++) {
      this.currentLine = this.currentLine + 1;
      const raw = lines[i];
      const t = raw.trim();
      if (!t || t.startsWith('#')) continue;

      if (t.startsWith('return ')) return yield* this.eval(t.slice(7).trim(), env);

      if (t.startsWith('print(') || t.startsWith('print (')) {
        const argsStr = this.unParen(t.slice(t.indexOf('(')));
        const args = this.parseArgsSimple(argsStr);
        const parts: string[] = [];
        for (const a of args) {
          const v = yield* this.eval(a, env);
          parts.push(this.repr(v));
        }
        const line = parts.join(' ');
        this.out.push(line);
        yield { type: 'stdout', text: line + '\n' };
        continue;
      }

      const augM = t.match(/^([a-zA-Z_]\w*)\s*([+\-*\/%]|\/\/)=\s*(.+)$/);
      if (augM) {
        const cur = this.evalSync(augM[1], env);
        const rhs = yield* this.eval(augM[3].trim(), env);
        const op = augM[2];
        let res: PyVal;
        if (typeof cur !== 'number' || typeof rhs !== 'number')
          throw new Error(`  TypeError: unsupported operand type(s) for ${op}=`);
        switch (op) {
          case '+': res = cur + rhs; break;
          case '-': res = cur - rhs; break;
          case '*': res = cur * rhs; break;
          case '/': if (rhs === 0) throw new Error(`  ZeroDivisionError: division by zero`); res = cur / rhs; break;
          case '//': if (rhs === 0) throw new Error(`  ZeroDivisionError: integer division or modulo by zero`); res = Math.floor(cur / rhs); break;
          case '%': if (rhs === 0) throw new Error(`  ZeroDivisionError: modulo by zero`); res = cur % rhs; break;
          default: res = 0;
        }
        env.set(augM[1], res);
        continue;
      }

      const assignM = t.match(/^([a-zA-Z_]\w*)\s*=(?!=)\s*(.+)$/);
      if (assignM) { env.set(assignM[1], yield* this.eval(assignM[2].trim(), env)); continue; }

      const callM = t.match(/^([a-zA-Z_]\w*)\s*\((.*)?\)\s*$/);
      if (callM) { yield* this.call(callM[1], callM[2] ?? '', env); continue; }
    }
    return null;
  }

  // ── Function call ──

  private *call(name: string, argsStr: string, env: Env): Generator<ExecEvent, PyVal, string> {
    if (name === 'str') {
      const v = yield* this.eval(argsStr.trim(), env);
      return String(v);
    }
    if (name === 'int') {
      const v = yield* this.eval(argsStr.trim(), env);
      const n = Number(v);
      if (isNaN(n)) throw new Error(`  ValueError: invalid literal for int() with base 10: '${v}'`);
      if (typeof v === 'string' && v.includes('.')) return Math.trunc(n);
      return Math.trunc(n);
    }
    if (name === 'float') {
      const v = yield* this.eval(argsStr.trim(), env);
      const n = Number(v);
      if (isNaN(n)) throw new Error(`  ValueError: could not convert string to float: '${v}'`);
      return n;
    }
    if (name === 'len') {
      const v = yield* this.eval(argsStr.trim(), env);
      if (typeof v === 'string') return v.length;
      if (v === null) return 0;
      throw new Error(`  TypeError: object of type '${typeof v}' has no len()`);
    }
    if (name === 'input') {
      const promptExpr = argsStr.trim();
      const promptText = promptExpr ? String(this.evalSync(promptExpr, env)) : '';
      const value = yield { type: 'input', prompt: promptText };
      return value;
    }
    if (name === 'print') {
      const v = yield* this.eval(argsStr.trim(), env);
      const line = this.repr(v);
      this.out.push(line);
      yield { type: 'stdout', text: line + '\n' };
      return null;
    }
    if (name === 'upper' || name === 'lower' || name === 'strip') return null;

    const fn = this.fns.get(name);
    if (!fn) throw new Error(`  NameError: name '${name}' is not defined`);

    const argVals = argsStr.trim() ? this.parseArgs(argsStr, env) : [];

    if (argVals.length !== fn.params.length) {
      throw new Error(`  TypeError: ${name}() takes ${fn.params.length} positional argument${fn.params.length === 1 ? '' : 's'} but ${argVals.length} were given`);
    }
    const local: Env = new Map(this.globals);
    fn.params.forEach((p, i) => local.set(p, argVals[i]! ?? null));
    return yield* this.runBody(fn.bodyLines, local);
  }

  // ── Expression evaluator (generator — supports function calls via yield*) ──

  private *eval(expr: string, env: Env): Generator<ExecEvent, PyVal, string> {
    expr = expr.trim();
    if (!expr) return null;

    if (expr.startsWith('f"') || expr.startsWith("f'")) {
      const quote = expr[1];
      const inner = expr.slice(2, expr.lastIndexOf(quote));
      return inner.replace(/\{([^}]+)\}/g, (_, e) => {
        try { return this.repr(this.evalSync(e.trim(), env)); } catch { return `{${e}}`; }
      });
    }

    if (expr.startsWith('"""') && expr.endsWith('"""')) return expr.slice(3, -3);
    if (expr.startsWith("'''") && expr.endsWith("'''")) return expr.slice(3, -3);

    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    }

    if (expr === 'None') return null;
    if (expr === 'True') return true;
    if (expr === 'False') return false;

    if (/^-?\d+$/.test(expr)) return parseInt(expr, 10);
    if (/^-?\d*\.\d+$/.test(expr)) return parseFloat(expr);

    const mulStrM = expr.match(/^(['"])(.*)\1\s*\*\s*(\d+)$/);
    if (mulStrM) return mulStrM[2].repeat(parseInt(mulStrM[3], 10));

    // Comparison
    const compOps = ['==', '!=', '>=', '<=', '>', '<'];
    for (const op of compOps) {
      const idx = this.findOpOutsideStrings(expr, op);
      if (idx > 0) {
        const lhs = expr.slice(0, idx).trim();
        const rhs = expr.slice(idx + op.length).trim();
        if (!lhs || !rhs) continue;
        const lv = yield* this.eval(lhs, env);
        const rv = yield* this.eval(rhs, env);
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

    // Logical
    const logOps: Array<[string, (a: PyVal, b: PyVal) => PyVal]> = [
      [' and ', (a, b) => a && b],
      [' or ', (a, b) => a || b],
    ];
    for (const [op, fn] of logOps) {
      const idx = expr.indexOf(op);
      if (idx > 0) {
        const lhs = yield* this.eval(expr.slice(0, idx).trim(), env);
        if (op === ' and ' && !lhs) return lhs;
        if (op === ' or ' && lhs) return lhs;
        return fn(lhs, yield* this.eval(expr.slice(idx + op.length).trim(), env));
      }
    }

    if (expr.startsWith('not ')) {
      return !(yield* this.eval(expr.slice(4).trim(), env));
    }

    // Binary
    const bin = this.findBinOp(expr);
    if (bin) {
      const [lhs, op, rhs] = bin;
      const lv = yield* this.eval(lhs, env);
      const rv = yield* this.eval(rhs, env);
      if (lv === null || rv === null) {
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      if (typeof lv === 'string' || typeof rv === 'string') {
        if (op === '+') return String(lv ?? '') + String(rv ?? '');
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      if (typeof lv !== 'number' || typeof rv !== 'number') {
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      switch (op) {
        case '+': return lv + rv;
        case '-': return lv - rv;
        case '*': return lv * rv;
        case '/': if (rv === 0) throw new Error(`  ZeroDivisionError: division by zero`); return lv / rv;
        case '//': if (rv === 0) throw new Error(`  ZeroDivisionError: integer division or modulo by zero`); return Math.floor(lv / rv);
        case '%': if (rv === 0) throw new Error(`  ZeroDivisionError: modulo by zero`); return lv % rv;
      }
    }

    // Function call — yields through call()
    const fnM = expr.match(/^([a-zA-Z_]\w*)\s*\((.*)?\)$/);
    if (fnM) {
      return yield* this.call(fnM[1], fnM[2] ?? '', env);
    }

    // Variable
    if (/^[a-zA-Z_]\w*$/.test(expr)) {
      if (env.has(expr)) return env.get(expr)!;
      if (this.globals.has(expr)) return this.globals.get(expr)!;
      throw new Error(`  NameError: name '${expr}' is not defined`);
    }

    return null;
  }

  // ── Expression evaluator (synchronous — for simple non-function-call expressions) ──

  private evalSync(expr: string, env: Env): PyVal {
    expr = expr.trim();
    if (!expr) return null;

    if (expr.startsWith('f"') || expr.startsWith("f'")) {
      const quote = expr[1];
      const inner = expr.slice(2, expr.lastIndexOf(quote));
      return inner.replace(/\{([^}]+)\}/g, (_, e) => {
        try { return this.repr(this.evalSync(e.trim(), env)); } catch { return `{${e}}`; }
      });
    }

    if (expr.startsWith('"""') && expr.endsWith('"""')) return expr.slice(3, -3);
    if (expr.startsWith("'''") && expr.endsWith("'''")) return expr.slice(3, -3);

    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    }

    if (expr === 'None') return null;
    if (expr === 'True') return true;
    if (expr === 'False') return false;

    if (/^-?\d+$/.test(expr)) return parseInt(expr, 10);
    if (/^-?\d*\.\d+$/.test(expr)) return parseFloat(expr);

    const mulStrM = expr.match(/^(['"])(.*)\1\s*\*\s*(\d+)$/);
    if (mulStrM) return mulStrM[2].repeat(parseInt(mulStrM[3], 10));

    const compOps = ['==', '!=', '>=', '<=', '>', '<'];
    for (const op of compOps) {
      const idx = this.findOpOutsideStrings(expr, op);
      if (idx > 0) {
        const lhs = expr.slice(0, idx).trim();
        const rhs = expr.slice(idx + op.length).trim();
        if (!lhs || !rhs) continue;
        const lv = this.evalSync(lhs, env);
        const rv = this.evalSync(rhs, env);
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

    const logOps: Array<[string, (a: PyVal, b: PyVal) => PyVal]> = [
      [' and ', (a, b) => a && b],
      [' or ', (a, b) => a || b],
    ];
    for (const [op, fn] of logOps) {
      const idx = expr.indexOf(op);
      if (idx > 0) {
        const lhs = this.evalSync(expr.slice(0, idx).trim(), env);
        if (op === ' and ' && !lhs) return lhs;
        if (op === ' or ' && lhs) return lhs;
        return fn(lhs, this.evalSync(expr.slice(idx + op.length).trim(), env));
      }
    }

    if (expr.startsWith('not ')) {
      return !this.evalSync(expr.slice(4).trim(), env);
    }

    const bin = this.findBinOp(expr);
    if (bin) {
      const [lhs, op, rhs] = bin;
      const lv = this.evalSync(lhs, env);
      const rv = this.evalSync(rhs, env);
      if (lv === null || rv === null) {
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      if (typeof lv === 'string' || typeof rv === 'string') {
        if (op === '+') return String(lv ?? '') + String(rv ?? '');
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      if (typeof lv !== 'number' || typeof rv !== 'number') {
        throw new Error(`  TypeError: unsupported operand type(s) for ${op}: '${typeof lv}' and '${typeof rv}'`);
      }
      switch (op) {
        case '+': return lv + rv;
        case '-': return lv - rv;
        case '*': return lv * rv;
        case '/': if (rv === 0) throw new Error(`  ZeroDivisionError: division by zero`); return lv / rv;
        case '//': if (rv === 0) throw new Error(`  ZeroDivisionError: integer division or modulo by zero`); return Math.floor(lv / rv);
        case '%': if (rv === 0) throw new Error(`  ZeroDivisionError: modulo by zero`); return lv % rv;
      }
    }

    // sync eval does NOT handle function calls — only simple expressions
    if (/^[a-zA-Z_]\w*$/.test(expr)) {
      if (env.has(expr)) return env.get(expr)!;
      if (this.globals.has(expr)) return this.globals.get(expr)!;
      throw new Error(`  NameError: name '${expr}' is not defined`);
    }

    // If it looks like a function call but we're in sync mode, throw
    const fnM = expr.match(/^([a-zA-Z_]\w*)\s*\(/);
    if (fnM) {
      throw new Error(`  RuntimeError: cannot call '${fnM[1]}()' in this context`);
    }

    return null;
  }

  // ── Helpers ──

  private findOpOutsideStrings(expr: string, op: string): number {
    let inStr = false, strCh = '';
    for (let i = 0; i <= expr.length - op.length; i++) {
      const ch = expr[i];
      if (ch === '"' || ch === "'") {
        if (!inStr) { inStr = true; strCh = ch; }
        else if (ch === strCh) inStr = false;
      }
      if (!inStr && expr.slice(i, i + op.length) === op) return i;
    }
    return -1;
  }

  private repr(v: PyVal): string {
    if (v === null) return 'None';
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    return String(v);
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
    return this.parseArgsSimple(argsStr).map(a => this.evalSync(a, env));
  }

  private parseArgsSimple(argsStr: string): string[] {
    if (!argsStr.trim()) return [];
    const parts: string[] = [];
    let cur = '', depth = 0, inStr = false, strCh = '';
    for (const ch of argsStr) {
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strCh = ch; cur += ch; }
      else if (inStr && ch === strCh) { inStr = false; cur += ch; }
      else if (!inStr && ch === '(') { depth++; cur += ch; }
      else if (!inStr && ch === ')') { depth--; cur += ch; }
      else if (!inStr && ch === ',' && !depth) { parts.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }

  private findBinOp(expr: string): [string, string, string] | null {
    const ops = ['+', '-', '*', '//', '/', '%'];
    let inStr = false, strCh = '', depth = 0;
    for (let i = expr.length - 1; i >= 1; i--) {
      const ch = expr[i];
      if (ch === ')') depth++;
      else if (ch === '(') depth--;
      else if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strCh = ch; }
      else if (inStr && ch === strCh) inStr = false;
      if (!inStr && !depth) {
        for (const op of ops) {
          if (expr.slice(i, i + op.length) === op) {
            const lhs = expr.slice(0, i).trim();
            const rhs = expr.slice(i + op.length).trim();
            if (lhs && rhs && !lhs.endsWith('=')) return [lhs, op, rhs];
          }
        }
      }
    }
    return null;
=======
// Custom Array Proxy to mock Python list methods
function createList(initialArray: any[] = []): any {
  return new Proxy(initialArray, {
    get(target, prop, receiver) {
      if (prop === 'append') {
        return (item: any) => {
          target.push(item);
          return null;
        };
      }
      if (prop === 'remove') {
        return (item: any) => {
          const idx = target.indexOf(item);
          if (idx > -1) {
            target.splice(idx, 1);
            return null;
          }
          throw new Error(`ValueError: list.remove(x): x not in list`);
        };
      }
      if (prop === 'insert') {
        return (idx: number, item: any) => {
          target.splice(idx, 0, item);
          return null;
        };
      }
      if (prop === 'pop') {
        return (idx?: number) => {
          if (idx === undefined) return target.pop();
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
        return (item: any) => target.filter(x => x === item).length;
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

// Custom Object Proxy to mock Python dictionary methods
function createDict(initialObj: Record<string, any> = {}): any {
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
        return (key: string, def: any = null) => (key in target ? target[key] : def);
      }
      if (prop === 'pop') {
        return (key: string, def?: any) => {
          if (key in target) {
            const val = target[key];
            delete target[key];
            return val;
          }
          if (def !== undefined) return def;
          throw new Error(`KeyError: '${key}'`);
        };
      }
      if (prop === 'clear') {
        return () => {
          for (let k in target) delete target[k];
          return null;
        };
      }
      if (prop === 'update') {
        return (other: Record<string, any>) => {
          Object.assign(target, other);
          return null;
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

// Local storage-backed virtual filesystem helper
function pyOpen(filename: string, mode: string = 'r') {
  const cleanFilename = filename.replace(/['"]/g, '').trim();
  const cleanMode = mode.replace(/['"]/g, '').trim();
  const storageKey = `fa_file_${cleanFilename}`;
  
  return {
    write(text: string) {
      if (cleanMode === 'r') throw new Error(`UnsupportedOperation: not writable`);
      let content = localStorage.getItem(storageKey) || '';
      if (cleanMode === 'w') {
        content = text;
      } else if (cleanMode === 'a') {
        content += text;
      }
      localStorage.setItem(storageKey, content);
      return text.length;
    },
    read() {
      if (cleanMode === 'w' || cleanMode === 'a') throw new Error(`UnsupportedOperation: not readable`);
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
      if (cleanMode === 'w' || cleanMode === 'a') throw new Error(`UnsupportedOperation: not readable`);
      const content = localStorage.getItem(storageKey) || '';
      if (!content) return [][Symbol.iterator]();
      const lines = content.split(/(?<=\n)/);
      return lines[Symbol.iterator]();
    }
  };
}

// Representation helper to print arrays and objects in Python format
function repr(v: any): string {
  if (v === null || v === undefined) return 'None';
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (Array.isArray(v)) {
    return '[' + v.map(repr).join(', ') + ']';
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v).map(([k, val]) => `'${k}': ${repr(val)}`);
    return '{' + entries.join(', ') + '}';
  }
  return String(v);
}

function* pyPrint(...args: any[]): Generator<ExecEvent, void, unknown> {
  const text = args.map(repr).join(' ') + '\n';
  yield { type: 'stdout', text };
}

function* pyInput(prompt: any = ''): Generator<ExecEvent, string, string> {
  const val = (yield { type: 'input', prompt: String(prompt) }) as string;
  return val;
}

function pyLen(x: any): number {
  if (x === null || x === undefined) return 0;
  if (typeof x === 'string' || Array.isArray(x)) return x.length;
  return Object.keys(x).length;
}

function pyVal(val: any): any {
  if (Array.isArray(val)) {
    return createList(val.map(pyVal));
  }
  if (val !== null && typeof val === 'object' && val.constructor === Object) {
    const wrapped: Record<string, any> = {};
    for (let k in val) {
      wrapped[k] = pyVal(val[k]);
    }
    return createDict(wrapped);
  }
  return val;
}

// ── Transpiler logic ──

function splitComment(line: string): [string, string] {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === '#' && !inDouble && !inSingle) {
      return [line.slice(0, i), '//' + line.slice(i + 1)];
    }
  }
  return [line, ''];
}

function translateExpr(expr: string, customFuncs: Set<string>): string {
  let js = expr.trim();
  if (!js) return '';

  // Extract string literals to avoid translating keywords inside strings
  const strings: string[] = [];
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

  // Python inline conditional expressions
  const conditionalMatch = js.match(/^(.*?)\s+if\s+(.*?)\s+else\s+(.*)$/);
  if (conditionalMatch) {
    const [, trueExpr, condExpr, falseExpr] = conditionalMatch;
    return `(${translateExpr(condExpr, customFuncs)} ? ${translateExpr(trueExpr, customFuncs)} : ${translateExpr(falseExpr, customFuncs)})`;
  }

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
      if (match.startsWith('yield*') || match.startsWith('function*')) return match;
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

function translateLine(line: string, customFuncs: Set<string>, inWithBlock: any[], currentIndent: number): string {
  let t = line.trim();
  if (!t) return '';

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
    if (exceptM) return `} catch (${exceptM[2]}) {`;
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

function reconstructLogicalLines(code: string): string[] {
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

export function transpilePythonToJS(code: string): string {
  const lines = reconstructLogicalLines(code);
  const customFuncs = new Set<string>();

  // Pre-scan for custom functions
  for (let line of lines) {
    const m = line.trim().match(/^def\s+(\w+)/);
    if (m) customFuncs.add(m[1]);
  }

  // Pre-scan for variable assignments to declare them globally in the function
  const declaredVars = new Set<string>();
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
    } else if (mSingle) {
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
  let inWithBlock: any[] = [];

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
      if (c === ' ') indent++;
      else if (c === '\t') indent += 4;
      else break;
    }

    // Close blocks
    while (indentStack[indentStack.length - 1] > indent) {
      const poppedIndent = indentStack.pop();
      const isContinuation = /^(except|finally|elif|else)\b/.test(trimmed);
      const suppressBrace = isContinuation && poppedIndent === indent + 4;

      if (inWithBlock.length > 0 && inWithBlock[inWithBlock.length - 1].indent === indentStack.length) {
        const item = inWithBlock.pop();
        jsCode += ' '.repeat(indent) + `} finally { ${item.varName}.close(); } }\n`;
      } else if (!suppressBrace) {
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
    } else {
      jsCode += '}\n';
    }
  }

  return jsCode;
}

export function* runInteractive(code: string): Generator<ExecEvent, ExecResult, string> {
  const jsCode = transpilePythonToJS(code);

  const sandboxFunc = new Function(
    'pyPrint', 'pyInput', 'pyOpen', 'pyLen', 'createDict', 'createList', 'pyVal',
    `
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
    `
  );

  const genCreator = sandboxFunc(
    pyPrint, pyInput, pyOpen, pyLen, createDict, createList, pyVal
  );

  const mainGen = genCreator();
  let lastVal: string | undefined = undefined;
  let isResumingInput = false;

  while (true) {
    try {
      const { value, done } = isResumingInput ? mainGen.next(lastVal!) : mainGen.next();
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
      } else {
        yield value;
        lastVal = undefined;
        isResumingInput = false;
      }
    } catch (err) {
      return { output: '', error: String(err), exitCode: 1 };
    }
  }
}

export function runValidationTest(code: string, inputs: string[]): { stdout: string; error: string | null } {
  try {
    const gen = runInteractive(code);
    const stdoutLines: string[] = [];
    let inputIdx = 0;
    let nextVal: string | null = null;
    
    let steps = 0;
    while (steps < 2000) {
      steps++;
      const { value, done } = nextVal !== null ? gen.next(nextVal) : gen.next();
      if (done) break;
      
      if (value.type === 'stdout') {
        stdoutLines.push(value.text);
        nextVal = null;
      } else if (value.type === 'input') {
        const val = inputs[inputIdx++];
        if (val === undefined) {
          break;
        }
        nextVal = val;
      } else if (value.type === 'stderr') {
        return { stdout: stdoutLines.join(''), error: value.text };
      }
    }
    
    return { stdout: stdoutLines.join(''), error: null };
  } catch (err) {
    return { stdout: '', error: String(err) };
>>>>>>> 8245f18 (Initial commit)
  }
}
