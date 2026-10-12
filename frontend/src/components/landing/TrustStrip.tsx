import { GraduationCap, Bot, Award } from "lucide-react";

const STRIP_ITEMS = [
  { icon: GraduationCap, text: "Project-based Python & AI courses" },
  { icon: Bot, text: "Real IDE, not a video player" },
  { icon: Award, text: "Verified certificates on completion" },
];

export default function TrustStrip() {
  return (
    <div className="w-full bg-[var(--bg-header)] border-b border-[var(--border-primary)]/60 py-2 flex justify-center items-center">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6">
        {STRIP_ITEMS.map(({ icon: Icon, text }, i) => (
          <div key={text} className="flex items-center gap-2 text-[var(--text-secondary)] text-[11px] md:text-xs font-semibold tracking-wide">
            <Icon className="w-3.5 h-3.5 text-[var(--accent-violet)]" />
            <span>{text}</span>
            {i < STRIP_ITEMS.length - 1 && (
              <span className="hidden md:inline text-[var(--border-primary)] ml-4">•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
