import { FolderOpen, Pencil, Lock } from 'lucide-react';

interface FileGuideStepProps {
  mainFile?: string | null;
}

/** "Open the Project" — which files to edit vs. leave alone. Generic guidance, since per-project
 * folder structures aren't authored data yet; the one specific detail (the main file to edit) is
 * derived from the project's own requirements text where possible, not invented. */
export default function FileGuideStep({ mainFile }: FileGuideStepProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <FolderOpen size={14} className="text-[var(--brand-primary)]" />
        Open the Project
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-5">
        Extract the zip and open the folder in VS Code (or any editor). You'll see a few files — here's what to do with them.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-700/25 bg-emerald-900/10 p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <Pencil size={13} /> Edit this
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {mainFile
              ? <>The file named <code className="px-1 py-0.5 rounded bg-[var(--surface-container)] text-[var(--text-primary)] font-mono text-xs">{mainFile}</code> — that's where your code goes.</>
              : 'The main project file described in the requirements below — that\'s where your code goes.'}
          </p>
        </div>
        <div className="rounded-xl border border-red-700/25 bg-red-900/10 p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
            <Lock size={13} /> Leave these alone
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Any other files provided (test runners, data files, helper modules). They're there to support your code, not for you to rewrite.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-1.5 pt-4 border-t border-[var(--border-light)]">
        <li className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] mt-1.5 flex-shrink-0" />
          Do NOT rename folders.
        </li>
        <li className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] mt-1.5 flex-shrink-0" />
          Do NOT delete any files, even ones you don't think you need.
        </li>
      </ul>
    </div>
  );
}
