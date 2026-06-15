// Interactive Python runner with generator-based stdin/stdout.
// Yields execution events. input() pauses until caller sends a value.

type PyVal = string | number | boolean | null;
type Env = Map<string, PyVal>;
type FnDef = { params: string[]; bodyLines: string[] };

export type ExecEvent =
  | { type: 'stdout'; text: string }
  | { type: 'input'; prompt: string }
  | { type: 'stderr'; text: string };

export interface ExecResult {
  output: string;
  error: string | null;
  exitCode: number;
}

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
  }
}
