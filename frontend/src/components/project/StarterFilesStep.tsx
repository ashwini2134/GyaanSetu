import { Terminal, FolderDown } from 'lucide-react';

interface StarterFilesStepProps {
  downloadUrl?: string;
  mainFile?: string | null;
}

/** "Download Starter Files" — the existing zip download, elevated with a preview of what's inside. */
export default function StarterFilesStep({ downloadUrl, mainFile }: StarterFilesStepProps) {
  if (!downloadUrl) return null;
  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <FolderDown size={14} className="text-[var(--brand-primary)]" />
        Download Starter Files
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        This gives you the starter code and any data you need. Download it, then extract (unzip) the folder before you start editing.
      </p>
      <a
        href={downloadUrl}
        download
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white font-medium text-sm transition-all shadow-md shadow-[var(--brand-primary)]/20"
      >
        <Terminal size={16} /> Download Starter Code &amp; Dataset
      </a>
      {mainFile && (
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Once extracted, look for <code className="px-1.5 py-0.5 rounded bg-[var(--surface-container)] text-[var(--text-primary)] font-mono">{mainFile}</code> — that's the file you'll be editing.
        </p>
      )}
    </div>
  );
}
