export interface PatternRule {
  id: string;
  label: string;
  pattern: RegExp;
  hint: string;
}

const PATTERN_RULES: PatternRule[] = [
  { id: 'for', label: 'for loop', pattern: /\bfor\s+\w/, hint: 'Try using a **for loop** to repeat an action for each item in a sequence.' },
  { id: 'while', label: 'while loop', pattern: /\bwhile\s+/, hint: 'Try using a **while loop** to repeat an action until a condition is met.' },
  { id: 'function', label: 'function definition', pattern: /\bdef\s+\w+\s*\(/, hint: 'Try defining a **function** with `def` to organize reusable code.' },
  { id: 'fstring', label: 'f-string', pattern: /f["']/, hint: 'Try using an **f-string** (`f"..."`) to embed variables directly in your output.' },
  { id: 'ifelse', label: 'if/else condition', pattern: /\bif\s+|\belif\s+|\belse\s*:/, hint: 'Try using an **if/else statement** to make decisions in your code.' },
  { id: 'input', label: 'input()', pattern: /\binput\s*\(/, hint: 'Try using **input()** to get data from the user.' },
  { id: 'return', label: 'return statement', pattern: /\breturn\b/, hint: 'Your function should **return** a value using `return`.' },
];

export function inferRequiredPatterns(solution: string): string[] {
  return PATTERN_RULES.filter(r => r.pattern.test(solution)).map(r => r.id);
}

export function checkPatterns(code: string, requiredPatterns: string[]): { missing: string[]; hints: string[] } {
  const missing: string[] = [];
  const hints: string[] = [];
  for (const id of requiredPatterns) {
    const rule = PATTERN_RULES.find(r => r.id === id);
    if (rule && !rule.pattern.test(code)) {
      missing.push(rule.label);
      hints.push(rule.hint);
    }
  }
  return { missing, hints };
}

export function generateProgressiveHint(code: string, solution: string, hintText: string, level: number): string {
  const requiredPatterns = inferRequiredPatterns(solution);
  const { missing, hints } = checkPatterns(code, requiredPatterns);

  switch (level) {
    case 0: {
      if (missing.length > 0) {
        return hints[0];
      }
      return '';
    }
    case 1:
      return hintText;
    case 2: {
      const lines = solution.trim().split('\n');
      if (lines.length <= 3) {
        return `Think about this structure:\n\`\`\`python\n${solution}\n\`\`\``;
      }
      const excerpt = lines.slice(0, 2).join('\n');
      return `Your code should start something like:\n\`\`\`python\n${excerpt}\n...\n\`\`\``;
    }
    default:
      return '';
  }
}
