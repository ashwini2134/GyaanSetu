interface SceneObjectProps {
  type: string;
  color?: string;
  label?: string;
  size?: number;
}

function Easel({ size = 1 }: { size?: number }) {
  const w = 60 * size;
  const h = 80 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 60 80">
      <line x1="30" y1="5" x2="10" y2="78" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="5" y1="50" x2="30" y2="20" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="55" y1="50" x2="30" y2="20" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="42" x2="52" y2="42" stroke="#6B5B3E" strokeWidth="2" strokeLinecap="round" />
      <rect x="14" y="10" width="32" height="32" rx="1" fill="#FAF0E6" stroke="#D4C4B0" strokeWidth="1" />
      <circle cx="30" cy="26" r="5" fill="none" stroke="#FF6B6B" strokeWidth="1" opacity="0.4" />
      <path d="M 20 24 L 28 32 L 40 20" fill="none" stroke="#4A90D9" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function PaintBrush({ size = 1, animating }: { size?: number; animating?: boolean }) {
  const w = 14 * size;
  const h = 50 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 14 50" className={animating ? 'sim-brush-paint' : ''}>
      <rect x="4" y="2" width="6" height="30" rx="1.5" fill="#c0841c" />
      <path d="M 3 32 Q 7 28 11 32" fill="#c0841c" />
      <polygon points="2,32 12,32 10,46 4,46" fill="#d97706" />
      <line x1="6" y1="46" x2="8" y2="46" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="48" x2="9" y2="48" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="50" x2="13" y2="50" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="4" y="0" width="6" height="4" rx="1" fill="#78716c" />
    </svg>
  );
}

function Palette({ size = 1, colors }: { size?: number; colors?: string[] }) {
  const w = 50 * size;
  const h = 40 * size;
  const dots = colors || ['#ef4444', '#3b82f6', '#fbbf24', '#22c55e', '#a855f7'];
  return (
    <svg width={w} height={h} viewBox="0 0 50 40">
      <ellipse cx="24" cy="20" rx="22" ry="16" fill="#f5f0e8" stroke="#d4c4b0" strokeWidth="1" />
      <ellipse cx="8" cy="12" rx="4" ry="3" fill="#1e293b" />
      {dots.map((c, i) => {
        const angle = (2 * Math.PI * i) / dots.length - Math.PI / 2;
        const r = 7;
        const cx = 24 + r * Math.cos(angle);
        const cy = 20 + r * Math.sin(angle);
        return <circle key={i} cx={cx} cy={cy} r="3.5" fill={c} stroke="#d4c4b0" strokeWidth="0.5" />;
      })}
    </svg>
  );
}

function NameBadge({ label = '?', size = 1 }: { label?: string; size?: number }) {
  const w = 120 * size;
  const h = 28 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 120 28">
      <rect x="0" y="0" width="120" height="28" rx="14" fill="#1e293b" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <rect x="4" y="4" width="112" height="20" rx="10" fill="rgba(255,255,255,0.05)" />
      <text x="60" y="18" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="700" textLength="96">{label}</text>
    </svg>
  );
}

function AgeBadge({ label = '?', size = 1 }: { label?: string; size?: number }) {
  const w = 100 * size;
  const h = 24 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 100 24">
      <rect x="0" y="0" width="100" height="24" rx="12" fill="#1e293b" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <rect x="3" y="3" width="94" height="18" rx="9" fill="rgba(255,255,255,0.05)" />
      <text x="50" y="15.5" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600" textLength="80">{label}</text>
    </svg>
  );
}

function ColorSwatch({ color = '#6366f1', label = '', size = 1 }: { color?: string; label?: string; size?: number }) {
  const w = 80 * size;
  const h = 48 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 80 48">
      <rect x="5" y="3" width="70" height="28" rx="5" fill={color} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x="12" y="9" width="56" height="16" rx="3" fill="rgba(0,0,0,0.15)" />
      <rect x="5" y="33" width="70" height="12" rx="3" fill="#1e293b" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      {label && <text x="40" y="42" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600" textLength="60">{label}</text>}
    </svg>
  );
}

function Football({ size = 1 }: { size?: number }) {
  const w = 36 * size;
  const h = 24 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 36 24">
      <ellipse cx="18" cy="12" rx="16" ry="10" fill="#8B4513" stroke="#5C2E00" strokeWidth="1" />
      <path d="M 14 2 Q 18 12 14 22" fill="none" stroke="#D2B48C" strokeWidth="1.5" />
      <path d="M 18 2 Q 22 12 18 22" fill="none" stroke="#D2B48C" strokeWidth="1.5" />
      <path d="M 22 2 Q 26 12 22 22" fill="none" stroke="#D2B48C" strokeWidth="1.5" />
      <line x1="14" y1="2" x2="22" y2="2" stroke="#D2B48C" strokeWidth="1" />
      <line x1="14" y1="22" x2="22" y2="22" stroke="#D2B48C" strokeWidth="1" />
    </svg>
  );
}

function Book({ size = 1 }: { size?: number }) {
  const w = 40 * size;
  const h = 44 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 40 44">
      <rect x="2" y="2" width="16" height="38" rx="1" fill="#1e293b" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <rect x="22" y="2" width="16" height="38" rx="1" fill="#1e293b" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <line x1="7" y1="10" x2="13" y2="10" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <line x1="7" y1="16" x2="13" y2="16" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <line x1="7" y1="22" x2="13" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <line x1="27" y1="10" x2="33" y2="10" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <line x1="27" y1="16" x2="33" y2="16" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <line x1="27" y1="22" x2="33" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <path d="M 18 2 Q 20 0 22 2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <path d="M 18 40 Q 20 42 22 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
    </svg>
  );
}

function GameController({ size = 1, animating }: { size?: number; animating?: boolean }) {
  const w = 50 * size;
  const h = 32 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 50 32" className={animating ? 'sim-bounce' : ''}>
      <rect x="4" y="8" width="42" height="16" rx="6" fill="#334155" stroke="#475569" strokeWidth="1" />
      <rect x="10" y="4" width="6" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
      <rect x="34" y="4" width="6" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
      <rect x="8" y="24" width="6" height="6" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
      <rect x="36" y="24" width="6" height="6" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
      <circle cx="20" cy="16" r="2.5" fill="#ef4444" />
      <circle cx="30" cy="16" r="2.5" fill="#3b82f6" />
      <rect x="14" y="19" width="4" height="2" rx="1" fill="#64748b" />
      <rect x="32" y="19" width="4" height="2" rx="1" fill="#64748b" />
    </svg>
  );
}

function MusicNote({ size = 1 }: { size?: number }) {
  const w = 16 * size;
  const h = 40 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 16 40">
      <ellipse cx="5" cy="34" rx="4" ry="3" fill="#fbbf24" />
      <rect x="7" y="4" width="2" height="30" fill="#fbbf24" />
      <path d="M 7 4 Q 14 2 14 8" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="13.5" cy="8" rx="2.5" ry="2" fill="#fbbf24" />
    </svg>
  );
}

function Pencil({ size = 1 }: { size?: number }) {
  const w = 12 * size;
  const h = 52 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 12 52">
      <rect x="2" y="6" width="8" height="34" rx="1" fill="#fbbf24" />
      <polygon points="2,40 10,40 8,50 4,50" fill="#d97706" />
      <line x1="4" y1="50" x2="8" y2="50" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2" y="2" width="8" height="6" rx="1" fill="#ef4444" />
      <rect x="3" y="0" width="6" height="3" rx="1" fill="#94a3b8" />
    </svg>
  );
}

function Computer({ size = 1 }: { size?: number }) {
  const w = 64 * size;
  const h = 56 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 64 56">
      <rect x="6" y="2" width="52" height="34" rx="3" fill="#1e293b" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <rect x="10" y="6" width="44" height="24" rx="2" fill="#0f172a" />
      <rect x="10" y="6" width="44" height="24" rx="2" fill="url(#screenGrad)" opacity="0.3" />
      <defs>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <line x1="32" y1="36" x2="32" y2="42" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <rect x="20" y="42" width="24" height="3" rx="1.5" fill="#334155" />
      <rect x="6" y="48" width="52" height="6" rx="2" fill="#1e293b" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <line x1="12" y1="50" x2="52" y2="50" stroke="#334155" strokeWidth="0.5" />
      <rect x="15" y="49" width="2" height="4" rx="0.5" fill="#475569" />
      <rect x="20" y="49" width="2" height="4" rx="0.5" fill="#475569" />
      <rect x="25" y="49" width="2" height="4" rx="0.5" fill="#475569" />
      <rect x="30" y="49" width="2" height="4" rx="0.5" fill="#475569" />
      <rect x="35" y="49" width="2" height="4" rx="0.5" fill="#475569" />
      <rect x="40" y="49" width="2" height="4" rx="0.5" fill="#475569" />
      <rect x="45" y="49" width="2" height="4" rx="0.5" fill="#475569" />
    </svg>
  );
}

function MusicInstrument({ size = 1 }: { size?: number }) {
  const w = 28 * size;
  const h = 56 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 28 56">
      <rect x="11" y="2" width="6" height="32" rx="1" fill="#d97706" />
      <ellipse cx="14" cy="36" rx="12" ry="16" fill="#d97706" stroke="#b45309" strokeWidth="1" />
      <ellipse cx="14" cy="40" rx="8" ry="8" fill="none" stroke="#b45309" strokeWidth="0.8" />
      <ellipse cx="14" cy="40" rx="4" ry="4" fill="#1c1917" />
      <line x1="6" y1="18" x2="6" y2="22" stroke="#fcd34d" strokeWidth="0.6" />
      <line x1="9" y1="18" x2="9" y2="24" stroke="#fcd34d" strokeWidth="0.6" />
      <line x1="19" y1="18" x2="19" y2="24" stroke="#fcd34d" strokeWidth="0.6" />
      <line x1="22" y1="18" x2="22" y2="22" stroke="#fcd34d" strokeWidth="0.6" />
      <rect x="6" y="12" width="5" height="2" rx="0.5" fill="#fcd34d" />
      <rect x="17" y="12" width="5" height="2" rx="0.5" fill="#fcd34d" />
    </svg>
  );
}

function Stadium({ size = 1 }: { size?: number }) {
  const w = 60 * size;
  const h = 50 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 60 50">
      <rect x="10" y="6" width="40" height="36" rx="2" fill="none" stroke="#475569" strokeWidth="1.5" />
      <line x1="30" y1="6" x2="30" y2="42" stroke="#475569" strokeWidth="1" strokeDasharray="4 3" />
      <rect x="22" y="42" width="16" height="4" rx="1" fill="#334155" />
      <circle cx="30" cy="24" r="6" fill="none" stroke="#475569" strokeWidth="1" />
      <line x1="10" y1="16" x2="8" y2="8" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="16" x2="52" y2="8" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="8" x2="52" y2="8" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="3" width="3" height="5" rx="0.5" fill="#475569" />
      <rect x="54" y="3" width="3" height="5" rx="0.5" fill="#475569" />
    </svg>
  );
}

function SketchBook({ size = 1 }: { size?: number }) {
  const w = 44 * size;
  const h = 52 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 44 52">
      <rect x="6" y="4" width="32" height="44" rx="2" fill="#1e293b" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <rect x="9" y="7" width="26" height="38" rx="1" fill="#f8fafc" />
      <circle cx="22" cy="26" r="5" fill="none" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
      <path d="M 15 32 L 20 28 L 29 35" fill="none" stroke="#6366f1" strokeWidth="0.8" opacity="0.5" />
      <line x1="6" y1="10" x2="0" y2="10" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6" y1="16" x2="0" y2="16" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6" y1="22" x2="0" y2="22" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6" y1="28" x2="0" y2="28" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6" y1="34" x2="0" y2="34" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6" y1="40" x2="0" y2="40" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function StoryBook({ size = 1 }: { size?: number }) {
  const w = 100 * size;
  const h = 80 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 100 80">
      <defs>
        <linearGradient id="bookCover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="bookPage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
      </defs>
      <rect x="5" y="10" width="40" height="60" rx="2" fill="url(#bookCover)" stroke="#334155" strokeWidth="0.8" />
      <rect x="55" y="10" width="40" height="60" rx="2" fill="url(#bookCover)" stroke="#334155" strokeWidth="0.8" />
      <rect x="8" y="13" width="34" height="54" rx="1" fill="url(#bookPage)" />
      <rect x="58" y="13" width="34" height="54" rx="1" fill="url(#bookPage)" />
      <line x1="50" y1="10" x2="50" y2="70" stroke="#475569" strokeWidth="1.5" />
      <line x1="12" y1="24" x2="38" y2="24" stroke="#64748b" strokeWidth="0.6" opacity="0.4" />
      <line x1="12" y1="30" x2="35" y2="30" stroke="#64748b" strokeWidth="0.6" opacity="0.4" />
      <line x1="12" y1="36" x2="36" y2="36" stroke="#64748b" strokeWidth="0.6" opacity="0.4" />
      <line x1="12" y1="42" x2="33" y2="42" stroke="#64748b" strokeWidth="0.6" opacity="0.4" />
      <line x1="62" y1="24" x2="88" y2="24" stroke="#64748b" strokeWidth="0.6" opacity="0.4" />
      <line x1="62" y1="30" x2="86" y2="30" stroke="#64748b" strokeWidth="0.6" opacity="0.4" />
      <line x1="62" y1="36" x2="85" y2="36" stroke="#64748b" strokeWidth="0.6" opacity="0.4" />
      <line x1="62" y1="42" x2="87" y2="42" stroke="#64748b" strokeWidth="0.6" opacity="0.4" />
      <circle cx="50" cy="40" r="3" fill="#6366f1" opacity="0.5" />
      <circle cx="48" cy="38" r="1.5" fill="#818cf8" opacity="0.4" />
      <circle cx="52" cy="42" r="1" fill="#a5b4fc" opacity="0.3" />
    </svg>
  );
}

function CanvasArt({ color = '#6366f1', size = 1 }: { color?: string; size?: number }) {
  const w = 56 * size;
  const h = 56 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 56 56">
      <line x1="28" y1="4" x2="18" y2="54" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="34" x2="28" y2="12" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" />
      <line x1="51" y1="34" x2="28" y2="12" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="30" x2="48" y2="30" stroke="#6B5B3E" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="15" y="8" width="26" height="26" rx="1" fill="#FAF0E6" stroke="#D4C4B0" strokeWidth="0.8" />
      <circle cx="28" cy="21" r="8" fill={color} opacity="0.6" />
      <circle cx="26" cy="18" r="5" fill={color} opacity="0.8" />
      <circle cx="30" cy="25" r="4" fill={color} opacity="0.5" />
      <path d="M 18 24 Q 22 26 28 22 Q 34 18 38 20" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function Bookshelf({ size = 1 }: { size?: number }) {
  const w = 50 * size;
  const h = 60 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 50 60">
      <rect x="2" y="2" width="46" height="56" rx="2" fill="#1e293b" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
      <rect x="2" y="16" width="46" height="3" fill="#334155" />
      <rect x="2" y="34" width="46" height="3" fill="#334155" />
      <rect x="6" y="20" width="8" height="14" rx="0.5" fill="#6366f1" opacity="0.7" />
      <rect x="16" y="22" width="7" height="12" rx="0.5" fill="#ec4899" opacity="0.7" />
      <rect x="25" y="18" width="9" height="16" rx="0.5" fill="#22c55e" opacity="0.7" />
      <rect x="36" y="20" width="8" height="14" rx="0.5" fill="#f59e0b" opacity="0.7" />
      <rect x="6" y="4" width="10" height="12" rx="0.5" fill="#a855f7" opacity="0.6" />
      <rect x="18" y="6" width="8" height="10" rx="0.5" fill="#3b82f6" opacity="0.6" />
      <rect x="28" y="4" width="7" height="12" rx="0.5" fill="#ef4444" opacity="0.6" />
      <rect x="37" y="6" width="7" height="10" rx="0.5" fill="#14b8a6" opacity="0.6" />
      <rect x="6" y="38" width="12" height="18" rx="0.5" fill="#f97316" opacity="0.5" />
      <rect x="20" y="40" width="9" height="16" rx="0.5" fill="#06b6d4" opacity="0.5" />
      <rect x="31" y="38" width="10" height="18" rx="0.5" fill="#d946ef" opacity="0.5" />
    </svg>
  );
}

function BirthdayCake({ size = 1 }: { size?: number }) {
  const w = 60 * size;
  const h = 60 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 60 60">
      <rect x="12" y="34" width="36" height="20" rx="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      <rect x="14" y="20" width="32" height="16" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
      <rect x="16" y="10" width="28" height="12" rx="2" fill="#fcd34d" stroke="#d97706" strokeWidth="0.6" />
      <rect x="12" y="54" width="36" height="4" rx="1.5" fill="#d97706" />
      <circle cx="22" cy="31" r="1.5" fill="#ef4444" />
      <circle cx="30" cy="29" r="1.5" fill="#3b82f6" />
      <circle cx="38" cy="31" r="1.5" fill="#22c55e" />
      <circle cx="26" cy="17" r="1" fill="#ef4444" />
      <circle cx="34" cy="17" r="1" fill="#3b82f6" />
      <circle cx="30" cy="15" r="1" fill="#fbbf24" />
      <line x1="24" y1="10" x2="24" y2="0" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="30" y1="10" x2="30" y2="0" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="36" y1="10" x2="36" y2="0" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="24" cy="2" r="2" fill="#fbbf24" opacity="0.9" />
      <circle cx="30" cy="2" r="2" fill="#fbbf24" opacity="0.9" />
      <circle cx="36" cy="2" r="2" fill="#fbbf24" opacity="0.9" />
      <ellipse cx="24" cy="5" rx="1.5" ry="2" fill="#f97316" opacity="0.4" />
      <ellipse cx="30" cy="5" rx="1.5" ry="2" fill="#f97316" opacity="0.4" />
      <ellipse cx="36" cy="5" rx="1.5" ry="2" fill="#f97316" opacity="0.4" />
    </svg>
  );
}

function Calendar({ size = 1 }: { size?: number }) {
  const w = 50 * size;
  const h = 50 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 50 50">
      <rect x="4" y="8" width="42" height="38" rx="4" fill="#1e293b" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      <rect x="4" y="8" width="42" height="10" rx="4" fill="#6366f1" />
      <rect x="4" y="14" width="42" height="4" fill="#6366f1" />
      <circle cx="14" cy="14" rx="1" ry="1" fill="rgba(255,255,255,0.3)" />
      <circle cx="25" cy="14" rx="1" ry="1" fill="rgba(255,255,255,0.3)" />
      <circle cx="36" cy="14" rx="1" ry="1" fill="rgba(255,255,255,0.3)" />
      <line x1="14" y1="4" x2="14" y2="8" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="36" y1="4" x2="36" y2="8" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <text x="25" y="36" textAnchor="middle" fill="#f1f5f9" fontSize="16" fontWeight="800" fontFamily="sans-serif">22</text>
    </svg>
  );
}

export default function SceneObject({ type, color, label, size = 1 }: SceneObjectProps) {
  switch (type) {
    case 'easel':
      return <Easel size={size} />;
    case 'paintBrush':
      return <PaintBrush size={size} animating />;
    case 'palette':
      return <Palette size={size} />;
    case 'nameBadge':
      return <NameBadge label={label} size={size} />;
    case 'ageBadge':
      return <AgeBadge label={label} size={size} />;
    case 'colorSwatch':
      return <ColorSwatch color={color} label={label} size={size} />;
    case 'football':
      return <Football size={size} />;
    case 'book':
      return <Book size={size} />;
    case 'gameController':
      return <GameController size={size} animating />;
    case 'musicNote':
      return <MusicNote size={size} />;
    case 'pencil':
      return <Pencil size={size} />;
    case 'computer':
      return <Computer size={size} />;
    case 'musicInstrument':
      return <MusicInstrument size={size} />;
    case 'stadium':
      return <Stadium size={size} />;
    case 'sketchBook':
      return <SketchBook size={size} />;
    case 'storyBook':
      return <StoryBook size={size} />;
    case 'birthdayCake':
      return <BirthdayCake size={size} />;
    case 'calendar':
      return <Calendar size={size} />;
    case 'canvasArt':
      return <CanvasArt color={color} size={size} />;
    case 'bookshelf':
      return <Bookshelf size={size} />;
    default:
      return null;
  }
}
