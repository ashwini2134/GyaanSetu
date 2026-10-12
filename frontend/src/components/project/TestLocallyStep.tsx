import { PlayCircle } from 'lucide-react';

interface TestLocallyStepProps {
  mainFile?: string | null;
}

const SELF_CHECK = [
  'Program runs without errors',
  'Output looks correct for the given input',
  'You tried at least one different input, not just the example',
];

/** "Test Your Project" — how to run it locally before submitting, plus a self-check list. */
export default function TestLocallyStep({ mainFile }: TestLocallyStepProps) {
  const fileRef = mainFile || 'your_file.py';
  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <PlayCircle size={14} className="text-[var(--brand-primary)]" />
        Test Your Project
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-3">Run it locally and verify it works before you submit:</p>
      <div className="rounded-xl bg-[#0A0E1A] border border-[#334155] px-4 py-3 font-mono text-xs text-[#cbd5e1] mb-4 overflow-x-auto">
        <div><span className="text-[#64748b]">$</span> cd your-project-folder</div>
        <div><span className="text-[#64748b]">$</span> pip install -r requirements.txt <span className="text-[#64748b]"># if one is provided</span></div>
        <div><span className="text-[#64748b]">$</span> python3 {fileRef}</div>
      </div>
      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Before submitting, check:</p>
      <ul className="space-y-1.5">
        {SELF_CHECK.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="w-1 h-1 rounded-full bg-[var(--brand-primary)] mt-1.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
