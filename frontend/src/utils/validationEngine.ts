import type { ValidationRule } from "../data/projectsData";

export interface ValidationResult {
  ruleId: string;
  label: string;
  passed: boolean;
}

function checkElementExists(code: string, selector: string): boolean {
  const clean = selector.replace(/^[.#]/, '');
  const patterns = [
    `class="${clean}"`,
    `class='${clean}'`,
    `id="${clean}"`,
    `id='${clean}'`,
    selector,
  ];
  return patterns.some(p => code.includes(p));
}

function checkCodeContains(code: string, target: string): boolean {
  return code.toLowerCase().includes(target.toLowerCase());
}

function checkCssRule(css: string, selector: string, value: string): boolean {
  const lines = css.split('\n');
  let inSelector = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(selector) || trimmed.includes(selector.replace(/^[.#]/, ''))) {
      inSelector = true;
    }
    if (inSelector && trimmed.startsWith('}')) {
      inSelector = false;
    }
    if (inSelector && trimmed.replace(/\s+/g, '').includes(value.replace(/\s+/g, ''))) {
      return true;
    }
  }
  return false;
}

function checkElementCount(code: string, className: string, minCount: number): boolean {
  const clean = className.replace(/^[.#]/, '');
  const regex = new RegExp(`class="${clean}"`, 'g');
  const matches = code.match(regex);
  return (matches?.length || 0) >= minCount;
}

export function validateTask(
  rules: ValidationRule[],
  html: string,
  css: string,
  js: string
): ValidationResult[] {
  return rules.map(rule => {
    let passed = false;
    const code = rule.lang === 'html' ? html : rule.lang === 'css' ? css : rule.lang === 'js' ? js : html + css + js;

    switch (rule.type) {
      case 'element_exists':
        passed = checkElementExists(code, rule.target);
        break;
      case 'code_contains':
        passed = checkCodeContains(code, rule.target);
        break;
      case 'css_rule':
        passed = checkCssRule(css, rule.target, rule.value || '');
        break;
    }
    return { ruleId: rule.id, label: rule.label, passed };
  });
}

export function allRulesPass(results: ValidationResult[]): boolean {
  return results.length > 0 && results.every(r => r.passed);
}
