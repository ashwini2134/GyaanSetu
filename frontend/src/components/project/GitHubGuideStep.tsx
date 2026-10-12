import { FolderGit2 } from 'lucide-react';

const STEPS = [
  { title: 'Create a repository', detail: 'On github.com, click the + in the top right → New repository. Give it a name and make sure it\'s Public.' },
  { title: 'Push your code', detail: 'In your project folder, run: git init, then git add ., then git commit -m "My submission", then follow GitHub\'s "push an existing repository" instructions to connect and push.' },
  { title: 'Copy the repository URL', detail: 'On your repo\'s GitHub page, click the green Code button and copy the URL — it should look like https://github.com/your-username/your-repo.' },
];

/** "Upload to GitHub" — the literal git-101 walkthrough the current flow assumes students already know. Shared by Milestone and Capstone. */
export default function GitHubGuideStep() {
  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <FolderGit2 size={14} className="text-[var(--brand-primary)]" />
        Upload to GitHub
      </h3>
      <div className="space-y-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{s.title}</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
