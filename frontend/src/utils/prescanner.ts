export interface InputField {
  id: number;
  prompt: string;
  value: string;
}

export interface ScanResult {
  hasInput: boolean;
  fields: InputField[];
  replacedCode: string;
}

function extractPrompt(inputExpr: string): string {
  const trimmed = inputExpr.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && !trimmed.slice(1, -1).includes('"')) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && !trimmed.slice(1, -1).includes("'")) {
    return trimmed.slice(1, -1);
  }
  const strM = trimmed.match(/^(["'])(.*?)\1/);
  return strM ? strM[2] : '';
}

export function scanForInput(code: string): ScanResult {
  const fields: InputField[] = [];
  let id = 0;
  // Manual scan approach to handle nested parens in prompts like "Choose (1-4): "
  const result: string[] = [];
  let i = 0;
  while (i < code.length) {
    const inputM = code.slice(i).match(/input\s*\(/);
    if (!inputM || inputM.index === undefined) {
      result.push(code.slice(i));
      break;
    }
    // Copy everything before 'input(' (without copying 'input(' itself)
    result.push(code.slice(i, i + (inputM.index ?? 0)));
    i += (inputM.index ?? 0) + (inputM[0]?.length ?? 0);

    // Find matching closing paren with balanced count
    let depth = 1;
    let inStr = false;
    let strChar = '';
    let closeIdx = i;
    while (closeIdx < code.length && depth > 0) {
      const ch = code[closeIdx];
      if (inStr) {
        if (ch === strChar && code[closeIdx - 1] !== '\\') inStr = false;
      } else {
        if (ch === '"' || ch === "'") { inStr = true; strChar = ch; }
        else if (ch === '(') depth++;
        else if (ch === ')') depth--;
      }
      closeIdx++;
    }
    const content = code.slice(i, closeIdx - 1);
    fields.push({ id: id++, prompt: extractPrompt(content), value: '' });
    result.push(`__input_${id - 1}__`);
    i = closeIdx;
  }

  // After the loop, if we broke out early, 'i' is past the last match
  return { hasInput: fields.length > 0, fields, replacedCode: result.join('') };
}

export function injectInputs(code: string, values: string[]): string {
  let result = code;
  for (let i = 0; i < values.length; i++) {
    // Escape special characters in the value for safe string embedding
    const escaped = values[i].replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    result = result.replace(`__input_${i}__`, `'${escaped}'`);
  }
  return result;
}
