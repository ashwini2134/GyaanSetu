import { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

function buildTemplate(projectTitle: string): string {
  return `# ${projectTitle}

## Problem Statement
What problem does this project solve? What was the goal?

## Approach
How did you solve it? What algorithm/technique did you use, and why?

## Technologies Used
- Python
- (list any libraries you used)

## How to Run
\`\`\`
python3 your_file.py
\`\`\`

## Screenshots
(optional — add a screenshot or example output here)

## Author
Your Name — link to your GitHub profile
`;
}

interface ReadmeTemplateStepProps {
  projectTitle: string;
}

/** Copyable README template — the single most common "I don't know what a good README looks like" gap for beginners. */
export default function ReadmeTemplateStep({ projectTitle }: ReadmeTemplateStepProps) {
  const [copied, setCopied] = useState(false);
  const template = buildTemplate(projectTitle);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
          <FileText size={14} className="text-[var(--brand-primary)]" />
          README Template
        </h3>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] transition-colors"
        >
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-3">
        Every capstone repository should include a README.md. Copy this template into your repo and fill in the sections.
      </p>
      <pre className="rounded-xl bg-[#0A0E1A] border border-[#334155] px-4 py-3 text-xs text-[#cbd5e1] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {template}
      </pre>
    </div>
  );
}
