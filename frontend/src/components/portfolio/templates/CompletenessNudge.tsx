import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';

export interface CompletenessNudgeTheme {
  accentHex: string;
  textColor: string;
  mutedColor: string;
  /** Wrapper classes — set for a "card" look matching the host template. */
  containerClassName?: string;
  containerStyle?: CSSProperties;
  buttonTextColor?: string;
}

// Shared "fill out your portfolio" nudge, reused across every template.
// Only ever shown to the profile's own owner, and only while there's real
// room to improve — the score is the same one the monthly Spotlight uses
// to decide who qualifies, so "Complete it" is never a vague nag.
export default function CompletenessNudge({ completeness, onComplete, theme }: {
  completeness: number;
  onComplete: () => void;
  theme: CompletenessNudgeTheme;
}) {
  if (completeness >= 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={theme.containerClassName ?? 'rounded-2xl p-4 mb-6 flex items-center gap-4'}
      style={theme.containerStyle}
    >
      <div className="relative w-11 h-11 flex-shrink-0">
        <svg viewBox="0 0 40 40" className="w-11 h-11 -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke={theme.mutedColor} strokeOpacity={0.25} strokeWidth="4" />
          <circle
            cx="20" cy="20" r="16" fill="none" stroke={theme.accentHex} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${(completeness / 100) * 100.5} 100.5`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: theme.textColor }}>{completeness}%</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold" style={{ color: theme.textColor }}>Your portfolio is {completeness}% complete</p>
        <p className="text-[12px]" style={{ color: theme.mutedColor }}>Add experience, education, or projects — a fuller portfolio also qualifies for the monthly Spotlight.</p>
      </div>
      <button
        onClick={onComplete}
        className="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: theme.accentHex, color: theme.buttonTextColor ?? '#ffffff' }}
      >
        Complete it
      </button>
    </motion.div>
  );
}
