export interface DebugStep {
  lineIndex: number;
  lineText: string;
  variables: Record<string, string>;
  outputs: string[];
  error?: string;
}

// Helper to find index of a word ignoring contents inside matching parentheses, brackets, braces, and strings
function findWordOutsideBrackets(expr: string, word: string): number {
  let depth = 0, bracketDepth = 0, braceDepth = 0;
  let inStr = false, strCh = '';
  const startsWithSpace = word.startsWith(' ');
  const endsWithSpace = word.endsWith(' ');
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (!inStr && (ch === '"' || ch === "'")) {
      inStr = true;
      strCh = ch;
    } else if (inStr && ch === strCh) {
      inStr = false;
    } else if (!inStr) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === '[') bracketDepth++;
      else if (ch === ']') bracketDepth--;
      else if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
      else if (depth === 0 && bracketDepth === 0 && braceDepth === 0 && i <= expr.length - word.length) {
        if (expr.slice(i, i + word.length) === word) {
          if (startsWithSpace || endsWithSpace) return i;
          const before = expr[i - 1];
          const after = expr[i + word.length];
          const isBoundaryBefore = i === 0 || !/[a-zA-Z0-9_]/.test(before);
          const isBoundaryAfter = (i + word.length) >= expr.length || !/[a-zA-Z0-9_]/.test(after);
          if (isBoundaryBefore && isBoundaryAfter) return i;
        }
      }
    }
  }
  return -1;
}

function reprJS(v: any): string {
  if (v === null || v === undefined) return 'None';
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
  if (Array.isArray(v)) {
    return '[' + v.map(reprJS).join(', ') + ']';
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v).map(([k, val]) => `${reprJS(k)}: ${reprJS(val)}`);
    return '{' + entries.join(', ') + '}';
  }
  return String(v);
}

function strJS(v: any): string {
  if (typeof v === 'string') return v;
  return reprJS(v);
}

// Helper to translate basic Python expressions to JavaScript
function translateExprToJS(expr: string): string {
  let js = expr.trim();
  
  // Extract string literals to avoid translating keywords inside strings
  const strings: string[] = [];
  const stringRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g;
  js = js.replace(stringRegex, (match) => {
    strings.push(match);
    return `__STR_PLACEHOLDER_${strings.length - 1}__`;
  });

  // Handle Python inline conditional expressions: val1 if cond else val2
  let hasConditional = true;
  while (hasConditional) {
    const ifIdx = findWordOutsideBrackets(js, ' if ');
    if (ifIdx > 0) {
      const elseIdx = findWordOutsideBrackets(js, ' else ');
      if (elseIdx > ifIdx) {
        const lhs = js.slice(0, ifIdx).trim();
        const condStr = js.slice(ifIdx + 4, elseIdx).trim();
        const rhs = js.slice(elseIdx + 6).trim();
        js = `(${translateExprToJS(condStr)} ? ${translateExprToJS(lhs)} : ${translateExprToJS(rhs)})`;
        break;
      }
    }
    hasConditional = false;
  }
  
  // Replace string methods
  js = js.replace(/\.lower\(\)/g, ".toLowerCase()");
  js = js.replace(/\.upper\(\)/g, ".toUpperCase()");
  js = js.replace(/\.strip\(\)/g, ".trim()");
  js = js.replace(/\.startswith\(/g, ".startsWith(");
  js = js.replace(/\.endswith\(/g, ".endsWith(");
  js = js.replace(/\.title\(\)/g, ".replace(/\\b\\w/g, c => c.toUpperCase())");
  js = js.replace(/\.capitalize\(\)/g, ".replace(/^\\w/, c => c.toUpperCase())");
  
  // Replace .replace() with .replaceAll()
  // Python: replace(old, new) -> JS: replaceAll(old, new)
  js = js.replace(/\.replace\(/g, ".replaceAll(");

  // Replace type conversions
  js = js.replace(/\bint\(/g, "parseInt(");
  js = js.replace(/\bfloat\(/g, "parseFloat(");
  js = js.replace(/\bstr\(/g, "String(");
  js = js.replace(/\blen\(/g, "String("); // Mock len as String length check later
  
  // Replace Python constants and booleans
  js = js.replace(/\bTrue\b/g, "true");
  js = js.replace(/\bFalse\b/g, "false");
  js = js.replace(/\bNone\b/g, "null");

  // Replace logical operators
  // Avoid replacing inside strings by simple replacements for basic cases
  js = js.replace(/\band\b/g, "&&");
  js = js.replace(/\bor\b/g, "||");
  js = js.replace(/\bnot\b/g, "!");

  // Restore string literals
  js = js.replace(/__STR_PLACEHOLDER_(\d+)__/g, (_, idx) => strings[parseInt(idx, 10)]);

  return js;
}

export function runPythonMock(code: string, rawInput: string): DebugStep[] {
  const steps: DebugStep[] = [];
  const lines = code.split("\n");
  const inputs = rawInput.split("\n");
  let inputIdx = 0;

  const vars: Record<string, any> = {};
  const funcs: Record<string, Function> = {};
  const outputs: string[] = [];

  // Expose print helper
  const printHelper = (...args: any[]) => {
    outputs.push(args.join(" "));
  };

  // Expose input helper
  const inputHelper = (_prompt?: string) => {
    const val = inputs[inputIdx++];
    return val !== undefined ? val : "";
  };

  // Context builder for evaluation
  const getContext = () => {
    return {
      ...vars,
      ...funcs,
      input: inputHelper,
      print: printHelper,
      parseInt: (val: any) => parseInt(String(val).replace(/\D/g, "")) || 0, // safe digit parser
      parseFloat: (val: any) => {
        const num = parseFloat(String(val).replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
      },
      len: (val: any) => {
        if (typeof val === "string" || Array.isArray(val)) return val.length;
        return 0;
      }
    };
  };

  // Safe evaluation function
  const evalExpr = (expr: string) => {
    const context = getContext();
    const keys = Object.keys(context);
    const vals = Object.values(context);
    const jsExpr = translateExprToJS(expr);
    try {
      const fn = new Function(...keys, `return ${jsExpr};`);
      return fn(...vals);
    } catch (e: any) {
      console.warn("Eval error for:", jsExpr, e);
      return undefined;
    }
  };

  // First pass: scan and define helper functions
  let insideFunction = false;
  let currentFunctionName = "";
  let currentFunctionParams: string[] = [];
  let currentFunctionBody: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("def ")) {
      insideFunction = true;
      const match = trimmed.match(/def\s+(\w+)\s*\(([^)]*)\)/);
      if (match) {
        currentFunctionName = match[1];
        currentFunctionParams = match[2].split(",").map(p => p.trim()).filter(Boolean);
        currentFunctionBody = [];
      }
      continue;
    }

    if (insideFunction) {
      // Check if line is indented or empty
      const isIndented = line.startsWith("    ") || line.startsWith("\t") || trimmed.length === 0;
      if (isIndented) {
        currentFunctionBody.push(line);
      } else {
        // Function ended, compile it
        compileFunction(currentFunctionName, currentFunctionParams, currentFunctionBody, funcs);
        insideFunction = false;
      }
    }
  }
  // Catch function if it ends at EOF
  if (insideFunction) {
    compileFunction(currentFunctionName, currentFunctionParams, currentFunctionBody, funcs);
  }

  // Second pass: step-by-step execution tracer using recursive block execution
  let safetyBrakeTriggered = false;

  const executeRange = (start: number, end: number): "normal" | "break" | "continue" | "return" => {
    let idx = start;
    let conditionalStack: { satisfied: boolean; indentLevel: number }[] = [];

    while (idx < end) {
      if (steps.length > 500) {
        safetyBrakeTriggered = true;
        return "normal";
      }

      const line = lines[idx];
      const trimmed = line.trim();
      const indentLevel = line.length - line.trimStart().length;

      // 1. Skip function definitions during main execution
      if (trimmed.startsWith("def ")) {
        idx++;
        while (idx < end && (lines[idx].startsWith("    ") || lines[idx].startsWith("\t") || lines[idx].trim().length === 0)) {
          idx++;
        }
        continue;
      }

      // 2. Skip empty lines or comment-only lines
      if (trimmed.length === 0 || trimmed.startsWith("#")) {
        idx++;
        continue;
      }

      // Check conditional stack (skip lines if we are inside an unsatisfied if/elif/else block)
      if (conditionalStack.length > 0) {
        const currentBlock = conditionalStack[conditionalStack.length - 1];
        if (indentLevel > currentBlock.indentLevel) {
          if (!currentBlock.satisfied) {
            idx++;
            continue;
          }
        } else {
          // We popped out of the conditional block
          conditionalStack = conditionalStack.filter(b => indentLevel > b.indentLevel);
        }
      }

      // Control statements
      if (trimmed === "break") {
        steps.push(createStep(idx, line, vars, outputs));
        return "break";
      }
      if (trimmed === "continue") {
        steps.push(createStep(idx, line, vars, outputs));
        return "continue";
      }
      if (trimmed.startsWith("return ") || trimmed === "return") {
        const retExpr = trimmed.substring(7).trim();
        const retVal = retExpr ? evalExpr(retExpr) : undefined;
        steps.push(createStep(idx, line, vars, outputs));
        return "return";
      }

      // Handle If statement
      if (trimmed.startsWith("if ") && trimmed.endsWith(":")) {
        const condExpr = trimmed.substring(3, trimmed.length - 1);
        const isSatisfied = !!evalExpr(condExpr);
        conditionalStack.push({ satisfied: isSatisfied, indentLevel });
        steps.push(createStep(idx, line, vars, outputs));
        idx++;
        continue;
      }

      // Handle Elif statement
      if (trimmed.startsWith("elif ") && trimmed.endsWith(":")) {
        const condExpr = trimmed.substring(5, trimmed.length - 1);
        const parentBlock = conditionalStack[conditionalStack.length - 1];
        const isSatisfied = !parentBlock?.satisfied && !!evalExpr(condExpr);
        if (parentBlock) {
          parentBlock.satisfied = parentBlock.satisfied || isSatisfied;
        }
        conditionalStack.push({ satisfied: isSatisfied, indentLevel });
        steps.push(createStep(idx, line, vars, outputs));
        idx++;
        continue;
      }

      // Handle Else statement
      if (trimmed.startsWith("else:") || trimmed.startsWith("else :")) {
        const parentBlock = conditionalStack[conditionalStack.length - 1];
        const isSatisfied = !parentBlock?.satisfied;
        if (parentBlock) {
          parentBlock.satisfied = true; // mark chain as satisfied
        }
        conditionalStack.push({ satisfied: isSatisfied, indentLevel });
        steps.push(createStep(idx, line, vars, outputs));
        idx++;
        continue;
      }

      // Handle For loops
      const forMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s+in\s+(.+)\s*:/);
      if (forMatch) {
        const varNames = forMatch[1].split(",").map(s => s.trim());
        const iterableExpr = forMatch[2].trim();
        
        // Find the loop body lines
        let nextOuterLineIdx = idx + 1;
        while (nextOuterLineIdx < end) {
          const l = lines[nextOuterLineIdx];
          const t = l.trim();
          if (t.length > 0 && !t.startsWith("#")) {
            const indent = l.length - l.trimStart().length;
            if (indent <= indentLevel) {
              break;
            }
          }
          nextOuterLineIdx++;
        }

        // Evaluate iterable
        let iterable: any[] = [];
        const rangeM = iterableExpr.match(/^range\((.+)\)$/);
        if (rangeM) {
          const args = rangeM[1].split(',').map(s => evalExpr(s.trim()));
          let start = 0, stop = 0, step = 1;
          if (args.length === 1) {
            stop = Number(args[0]);
          } else if (args.length === 2) {
            start = Number(args[0]);
            stop = Number(args[1]);
          } else if (args.length === 3) {
            start = Number(args[0]);
            stop = Number(args[1]);
            step = Number(args[2]);
          }
          if (step > 0) {
            for (let k = start; k < stop; k += step) iterable.push(k);
          } else if (step < 0) {
            for (let k = start; k > stop; k += step) iterable.push(k);
          }
        } else {
          const val = evalExpr(iterableExpr);
          if (Array.isArray(val)) {
            iterable = val;
          } else if (typeof val === 'string') {
            iterable = val.split('');
          } else if (val instanceof Set) {
            iterable = Array.from(val);
          } else if (val && typeof val === 'object') {
            iterable = Object.keys(val);
          }
        }

        steps.push(createStep(idx, line, vars, outputs));

        // Execute the loop
        for (const item of iterable) {
          if (varNames.length === 1) {
            vars[varNames[0]] = item;
          } else if (Array.isArray(item)) {
            for (let vi = 0; vi < varNames.length; vi++) {
              vars[varNames[vi]] = item[vi];
            }
          } else {
            vars[varNames[0]] = item;
          }

          const flow = executeRange(idx + 1, nextOuterLineIdx);
          if (flow === "break") {
            break;
          }
          if (flow === "return") {
            return "return";
          }
        }

        idx = nextOuterLineIdx;
        continue;
      }

      // Handle While loops
      const whileMatch = trimmed.match(/^while\s+(.+)\s*:/);
      if (whileMatch) {
        const condExpr = whileMatch[1].trim();

        // Find the loop body lines
        let nextOuterLineIdx = idx + 1;
        while (nextOuterLineIdx < end) {
          const l = lines[nextOuterLineIdx];
          const t = l.trim();
          if (t.length > 0 && !t.startsWith("#")) {
            const indent = l.length - l.trimStart().length;
            if (indent <= indentLevel) {
              break;
            }
          }
          nextOuterLineIdx++;
        }

        steps.push(createStep(idx, line, vars, outputs));

        // Execute the loop
        let iterations = 0;
        const maxIter = 1000; // prevent infinite loops
        while (!!evalExpr(condExpr) && iterations < maxIter) {
          const flow = executeRange(idx + 1, nextOuterLineIdx);
          if (flow === "break") {
            break;
          }
          if (flow === "return") {
            return "return";
          }
          iterations++;
        }

        idx = nextOuterLineIdx;
        continue;
      }

      // Handle print
      if (trimmed.startsWith("print(") && trimmed.endsWith(")")) {
        const printInner = trimmed.substring(6, trimmed.length - 1);
        
        let val;
        if (printInner.startsWith("f'") || printInner.startsWith("f\"") || printInner.startsWith("f`")) {
          // f-string parsing: f"hello {name}"
          let content = printInner.slice(2, -1);
          val = content.replace(/\{([^}]+)\}/g, (_, innerExpr) => {
            const res = evalExpr(innerExpr);
            return res !== undefined ? strJS(res) : "";
          });
        } else {
          // Evaluate multiple comma parameters as an array
          val = evalExpr(`[${printInner}]`);
          if (Array.isArray(val)) {
            val = val.map(strJS).join(" ");
          } else {
            val = strJS(val);
          }
        }

        if (val !== undefined) {
          outputs.push(String(val));
        }

        steps.push(createStep(idx, line, vars, outputs));
        idx++;
        continue;
      }

      // Handle assignment: var = expr
      const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const expr = assignMatch[2];
        const val = evalExpr(expr);
        if (val !== undefined) {
          vars[varName] = val;
        }
        steps.push(createStep(idx, line, vars, outputs));
        idx++;
        continue;
      }

      // Generic fallback for any other statement
      try {
        evalExpr(trimmed);
      } catch {}
      steps.push(createStep(idx, line, vars, outputs));
      idx++;
    }

    return "normal";
  };

  executeRange(0, lines.length);

  // Safety brake to avoid infinite loops in execution
  if (safetyBrakeTriggered) {
    steps.push({
      lineIndex: lines.length,
      lineText: "[Execution Terminated: Step limit exceeded]",
      variables: stringifyVars(vars),
      outputs,
      error: "Execution step limit exceeded (infinite loop safety)."
    });
  }

  return steps;
}

function compileFunction(name: string, params: string[], bodyLines: string[], funcs: Record<string, Function>) {
  // Translate body lines to JS function body
  const jsLines: string[] = [];
  for (const line of bodyLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("return ")) {
      const retExpr = trimmed.substring(7);
      jsLines.push(`  return ${translateExprToJS(retExpr)};`);
    } else {
      // Basic assignments inside function body
      const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const expr = assignMatch[2];
        jsLines.push(`  let ${varName} = ${translateExprToJS(expr)};`);
      } else {
        jsLines.push(`  ${translateExprToJS(trimmed)};`);
      }
    }
  }

  try {
    const fnStr = `function ${name}(${params.join(", ")}) {\n${jsLines.join("\n")}\n}`;
    // Evaluate function declaration in global scope
    const declaredFn = new Function(`return (${fnStr});`)();
    funcs[name] = declaredFn;
  } catch (e) {
    console.error("Failed to compile python function helper:", name, e);
  }
}

function stringifyVars(vars: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) {
    if (typeof v === "object" && v !== null) {
      result[k] = JSON.stringify(v);
    } else {
      result[k] = String(v);
    }
  }
  return result;
}

function createStep(lineIndex: number, lineText: string, vars: Record<string, any>, outputs: string[]): DebugStep {
  return {
    lineIndex,
    lineText,
    variables: stringifyVars(vars),
    outputs: [...outputs]
  };
}
