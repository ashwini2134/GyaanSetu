import { AlertTriangle } from 'lucide-react';

const DEFAULT_MISTAKES = [
  'Repository is set to Private — reviewers can\'t see it, so it reads as not submitted.',
  'Forgetting to actually push — the code only exists locally, GitHub shows an empty repo.',
  'Deleting or renaming provided starter files instead of just editing them.',
  'Submitting a zip file link instead of a GitHub repository URL.',
  'Not testing the code before submitting — a program that crashes on run can\'t be reviewed properly.',
];

interface CommonMistakesCardProps {
  mistakes?: string[];
}

/** Universal beginner mistakes for GitHub-based project submission. Shared by Problems, Milestone, and Capstone. */
export default function CommonMistakesCard({ mistakes }: CommonMistakesCardProps) {
  const items = mistakes && mistakes.length > 0 ? mistakes : DEFAULT_MISTAKES;
  return (
    <div className="rounded-2xl border border-amber-700/25 bg-amber-900/10 p-6">
      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <AlertTriangle size={14} />
        Common Mistakes
      </h3>
      <ul className="space-y-2.5">
        {items.map((m, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
