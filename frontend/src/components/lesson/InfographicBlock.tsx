import type { InfographicBlock as InfographicBlockType } from '../../types/lesson';

const PANEL_COLORS = [
  { label: 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]' },
  { label: 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]' },
  { label: 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]' },
];

function RLScreen1SVG() {
  return (
    <svg className="w-full h-80" viewBox="0 0 200 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Agent box */}
      <rect x="6" y="14" width="72" height="56" rx="6" fill="#6366f1" fillOpacity="0.06" stroke="#818cf8" strokeWidth="0.6" strokeOpacity="0.3" />
      <text x="42" y="28" textAnchor="middle" fill="#818cf8" fontSize="6" fontFamily="system-ui" fontWeight="700">AGENT</text>
      <text x="42" y="38" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">observes state</text>
      <text x="42" y="46" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">selects action</text>
      <text x="42" y="56" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">updates policy</text>
      {/* Environment box */}
      <rect x="122" y="14" width="72" height="56" rx="6" fill="#0ea5e9" fillOpacity="0.06" stroke="#38bdf8" strokeWidth="0.6" strokeOpacity="0.3" />
      <text x="158" y="28" textAnchor="middle" fill="#38bdf8" fontSize="6" fontFamily="system-ui" fontWeight="700">ENVIRONMENT</text>
      <text x="158" y="38" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">receives action</text>
      <text x="158" y="46" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">transitions state</text>
      <text x="158" y="56" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">returns reward</text>
      {/* Action arrow */}
      <defs>
        <marker id="rl-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0,1 L9,5 L0,9" fill="#a78bfa" fillOpacity="0.5" />
        </marker>
      </defs>
      <line x1="78" y1="28" x2="122" y2="28" stroke="#a78bfa" strokeWidth="0.8" strokeOpacity="0.4" markerEnd="url(#rl-arr)" />
      <text x="100" y="24" textAnchor="middle" fill="#a78bfa" fontSize="5" fontFamily="system-ui" fontWeight="600">action</text>
      {/* Reward arrow */}
      <line x1="122" y1="48" x2="78" y2="48" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.4" markerEnd="url(#rl-arr)" strokeDasharray="2,2" />
      <text x="100" y="54" textAnchor="middle" fill="#34d399" fontSize="5" fontFamily="system-ui" fontWeight="600">reward</text>
      <text x="100" y="62" textAnchor="middle" fill="#10b981" fontSize="4" fontFamily="system-ui" fontWeight="500">state</text>
      {/* Loop arc */}
      <path d="M172 14 Q190 14 190 0 Q190 -10 172 -10" stroke="#6b7280" strokeWidth="0.4" opacity="0.2" fill="none" />
    </svg>
  );
}

function RLScreen2SVG() {
  return (
    <svg className="w-full h-80" viewBox="0 0 200 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Two paths diverging */}
      <line x1="20" y1="56" x2="70" y2="56" stroke="#475569" strokeWidth="0.8" opacity="0.3" />
      {/* Explore path (up) */}
      <path d="M70 56 Q90 28 120 28 Q150 28 170 42" stroke="#f59e0b" strokeWidth="1" opacity="0.5" fill="none" strokeDasharray="3,2" />
      <text x="100" y="18" textAnchor="middle" fill="#f59e0b" fontSize="5" fontFamily="system-ui" fontWeight="600">Explore</text>
      <text x="100" y="26" textAnchor="middle" fill="#6b7280" fontSize="4" fontFamily="system-ui">try new actions</text>
      {/* Question marks on explore path */}
      <text x="90" y="38" textAnchor="middle" fontSize="7" fill="#f59e0b" opacity="0.4">?</text>
      <text x="130" y="34" textAnchor="middle" fontSize="7" fill="#f59e0b" opacity="0.3">?</text>
      {/* Exploit path (down) */}
      <path d="M70 56 Q90 84 120 84 Q150 84 170 70" stroke="#34d399" strokeWidth="1" opacity="0.5" fill="none" />
      <text x="100" y="92" textAnchor="middle" fill="#34d399" fontSize="5" fontFamily="system-ui" fontWeight="600">Exploit</text>
      <text x="100" y="100" textAnchor="middle" fill="#6b7280" fontSize="4" fontFamily="system-ui">repeat known best</text>
      {/* Star reward on exploit path */}
      <text x="120" y="76" textAnchor="middle" fontSize="8" fill="#34d399" opacity="0.5">★</text>
      {/* Robot at fork */}
      <circle cx="42" cy="56" r="12" fill="#6366f1" opacity="0.08" stroke="#818cf8" strokeWidth="0.6" />
      <circle cx="39" cy="53" r="1.5" fill="#818cf8" opacity="0.3" />
      <circle cx="45" cy="53" r="1.5" fill="#818cf8" opacity="0.3" />
      <path d="M38 60 Q42 62 46 60" stroke="#818cf8" strokeWidth="0.4" fill="none" opacity="0.3" />
    </svg>
  );
}

function RLScreen3SVG() {
  return (
    <svg className="w-full h-80" viewBox="0 0 200 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Q-Table header */}
      <text x="100" y="14" textAnchor="middle" fill="#818cf8" fontSize="6" fontFamily="system-ui" fontWeight="700">Q(s, a) Table</text>
      {/* Table grid */}
      <line x1="20" y1="20" x2="180" y2="20" stroke="#334155" strokeWidth="0.5" />
      <line x1="20" y1="20" x2="20" y2="92" stroke="#334155" strokeWidth="0.5" />
      <line x1="80" y1="20" x2="80" y2="92" stroke="#334155" strokeWidth="0.5" />
      <line x1="140" y1="20" x2="140" y2="92" stroke="#334155" strokeWidth="0.5" />
      <line x1="180" y1="20" x2="180" y2="92" stroke="#334155" strokeWidth="0.5" />
      <line x1="20" y1="92" x2="180" y2="92" stroke="#334155" strokeWidth="0.5" />
      <line x1="20" y1="46" x2="180" y2="46" stroke="#334155" strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="20" y1="68" x2="180" y2="68" stroke="#334155" strokeWidth="0.3" strokeOpacity="0.3" />
      {/* Headers */}
      <text x="50" y="36" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">S \\ A</text>
      <text x="110" y="36" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">Left</text>
      <text x="160" y="36" textAnchor="middle" fill="#6b7280" fontSize="5" fontFamily="system-ui">Right</text>
      {/* Row labels */}
      <text x="34" y="58" textAnchor="end" fill="#6b7280" fontSize="5" fontFamily="system-ui">S₁</text>
      <text x="34" y="80" textAnchor="end" fill="#6b7280" fontSize="5" fontFamily="system-ui">S₂</text>
      {/* Q-values */}
      <text x="110" y="58" textAnchor="middle" fill="#34d399" fontSize="5" fontFamily="system-ui" fontWeight="600">0.82</text>
      <text x="160" y="58" textAnchor="middle" fill="#f59e0b" fontSize="5" fontFamily="system-ui" fontWeight="600">0.31</text>
      <text x="110" y="80" textAnchor="middle" fill="#f59e0b" fontSize="5" fontFamily="system-ui" fontWeight="600">0.12</text>
      <text x="160" y="80" textAnchor="middle" fill="#34d399" fontSize="5" fontFamily="system-ui" fontWeight="600">0.95</text>
      {/* Formula */}
      <text x="100" y="106" textAnchor="middle" fill="#6b7280" fontSize="4" fontFamily="system-ui" fontStyle="italic">
        Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') − Q(s,a)]
      </text>
    </svg>
  );
}

export default function InfographicBlock({ block }: { block: InfographicBlockType }) {
  const renderSVG = (id: string, panelIdx: number) => {
    if (id === 'rl-learning-cycle') {
      const svgs = [<RLScreen1SVG />, <RLScreen2SVG />, <RLScreen3SVG />];
      return svgs[panelIdx];
    }
    return null;
  };

  return (
    <div className="relative mt-6 rounded-2xl border border-[var(--ai-card-border)] bg-[var(--ai-card-bg)] shadow-[var(--ai-card-shadow)] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
        {block.panels.map((panel, idx) => {
          const color = PANEL_COLORS[idx];
          return (
            <div key={idx} className={`relative p-4 md:p-5 flex flex-col items-center text-center ${idx > 0 ? 'border-t md:border-t-0 md:border-l border-[var(--ai-card-border)]' : ''}`}>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${color.label} text-[10px] font-bold uppercase tracking-widest mb-3`}>{panel.label}</span>
              <h4 className="text-sm font-bold text-[var(--ai-card-heading)] mb-3">{panel.title}</h4>
              <div className="w-full scale-[1.35] my-4">
                {renderSVG(block.id, idx)}
              </div>
              <p className="text-xs text-[var(--ai-card-text)] leading-relaxed mt-3">{panel.caption}</p>
            </div>
          );
        })}
      </div>
      {/* Bottom takeaway */}
      <div className="px-6 md:px-8 py-6 border-t border-[var(--ai-card-border)] bg-[var(--surface-container)]">
        <div className="flex items-center gap-2.5 mb-3">
          <svg className="w-4 h-4 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest">Key Idea</span>
        </div>
        <p className="text-sm text-[var(--ai-card-text)] leading-relaxed max-w-2xl">{block.takeaway}</p>
      </div>
    </div>
  );
}
