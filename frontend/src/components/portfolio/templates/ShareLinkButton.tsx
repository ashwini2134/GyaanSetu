import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

// Copies the student's own public portfolio URL — the one thing a "living
// portfolio" needs to actually be useful is a link worth sending to a
// recruiter, which nothing in the UI previously surfaced.
export default function ShareLinkButton({ userId, className, label, iconSize = 15 }: {
  userId?: string;
  className?: string;
  /** When set, renders as a text link ("Copy Link" / "Copied!") instead of an icon-only button. */
  label?: boolean;
  iconSize?: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!userId) return;
    const url = `${window.location.origin}${window.location.pathname}#/portfolio/${userId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently no-op, button just won't confirm
    }
  };

  if (!userId) return null;

  return (
    <button
      onClick={handleCopy}
      title="Copy public portfolio link"
      className={className ?? 'w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/60 transition-colors'}
    >
      {copied ? <Check size={iconSize} className="text-[var(--color-primary)]" /> : <Link2 size={iconSize} />}
      {label && (copied ? 'Copied!' : 'Copy Link')}
    </button>
  );
}
