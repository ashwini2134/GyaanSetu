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
  const w = 80 * size;
  const h = 28 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 80 28">
      <rect x="0" y="0" width="80" height="28" rx="14" fill="#1e293b" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <rect x="4" y="4" width="72" height="20" rx="10" fill="rgba(255,255,255,0.05)" />
      <text x="40" y="18" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="700">{label}</text>
    </svg>
  );
}

function AgeBadge({ label = '?', size = 1 }: { label?: string; size?: number }) {
  const w = 70 * size;
  const h = 24 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 70 24">
      <rect x="0" y="0" width="70" height="24" rx="12" fill="#1e293b" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <rect x="3" y="3" width="64" height="18" rx="9" fill="rgba(255,255,255,0.05)" />
      <text x="35" y="15.5" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600">{label}</text>
    </svg>
  );
}

function ColorSwatch({ color = '#6366f1', label = '', size = 1 }: { color?: string; label?: string; size?: number }) {
  const w = 60 * size;
  const h = 48 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 60 48">
      <rect x="5" y="3" width="50" height="28" rx="5" fill={color} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x="12" y="9" width="36" height="16" rx="3" fill="rgba(0,0,0,0.15)" />
      <rect x="5" y="33" width="50" height="12" rx="3" fill="#1e293b" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      {label && <text x="30" y="42" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600">{label}</text>}
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
    default:
      return null;
  }
}
