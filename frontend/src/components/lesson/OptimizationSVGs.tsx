// ── What is Optimization? — State-Space Landscape ═════════════════════

export function WhatIsOptimizationSVG({ scene }: { scene: number }) {
  const points = [
    { x: 30, y: 170, label: '' },
    { x: 80, y: 145, label: '' },
    { x: 130, y: 80, label: 'Local' },
    { x: 180, y: 110, label: '' },
    { x: 230, y: 145, label: '' },
    { x: 280, y: 120, label: '' },
    { x: 330, y: 55, label: 'Global' },
    { x: 380, y: 90, label: '' },
    { x: 430, y: 130, label: '' },
    { x: 470, y: 155, label: '' },
  ];
  const baseline = 175;

  const ptsStr = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Find the best answer, not just any answer' :
         scene === 1 ? 'State space = every possible configuration' :
         scene === 2 ? 'Move from current state to a better neighbor' :
         'The cost function separates good from bad'}
      </text>

      {/* Mountain landscape silhouette */}
      <polyline points={`${ptsStr} ${points[points.length-1].x},${baseline} ${points[0].x},${baseline}`}
        fill="var(--color-primary)" fillOpacity="0.06"
        stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinejoin="round"
        opacity={0.5} style={{ transition: 'all 300ms' }} />

      {/* Baseline */}
      <line x1={points[0].x} y1={baseline} x2={points[points.length-1].x} y2={baseline}
        stroke="var(--border-light)" strokeWidth="1.5" strokeDasharray="4,3" />

      {/* Y-axis label (scene 3) */}
      {scene === 3 && (
        <text x="12" y="105" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontWeight="800"
          style={{ animation: 'tof-up 0.3s both' }}>
          Cost
        </text>
      )}

      {/* Dots on landscape */}
      {points.map((p, i) => {
        const isLocal = i === 2;
        const isGlobal = i === 6;
        const isCurrent = scene === 2 && i === 1;
        const isNext = scene === 2 && i === 2;
        const isDimmed = scene === 3 && !isLocal && !isGlobal;

        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6"
              fill={isCurrent ? 'var(--color-primary)' : isNext ? 'var(--color-primary)' : isGlobal ? 'var(--color-primary)' : isLocal ? 'var(--text-secondary)' : 'var(--bg-surface)'}
              fillOpacity={isCurrent ? 1 : isNext ? 0.3 : isGlobal ? 0.3 : isLocal ? 0.4 : 1}
              stroke={isCurrent ? 'var(--color-primary)' : isNext ? 'var(--color-primary)' : isGlobal ? 'var(--color-primary)' : isLocal ? 'var(--text-secondary)' : 'var(--text-secondary)'}
              strokeWidth={isGlobal ? 3 : isLocal ? 2.5 : 2}
              opacity={isDimmed ? 0.2 : 1}
              style={{ transition: 'all 300ms' }} />
            {p.label && (
              <text x={p.x} y={p.y - 14} textAnchor="middle"
                fill={isGlobal ? 'var(--color-primary)' : 'var(--text-muted)'}
                fontSize="7" fontFamily="system-ui" fontWeight="800"
                opacity={isDimmed ? 0.3 : 1}
                style={{ transition: 'all 300ms' }}>{p.label}</text>
            )}
          </g>
        );
      })}

      {/* Scene 2: Arrow from current to neighbor */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <line x1={80} y1={140} x2={120} y2={82}
            stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#optArr)" opacity="0.7" />
          <text x="95" y="105" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Better</text>
        </g>
      )}

      {/* Scene 3: Local vs Global labels */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s 0.15s both' }}>
          <rect x="90" y="180" width="90" height="24" rx="5" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1" />
          <text x="135" y="196" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Local optimum</text>

          <rect x="290" y="180" width="90" height="24" rx="5" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="335" y="196" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Global optimum</text>
        </g>
      )}

      {/* Scene 0 takeaway */}
      {scene === 0 && (
        <text x="250" y="225" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic"
          style={{ animation: 'tof-up 0.3s both' }}>
          Not all answers are equal — optimization finds the best one
        </text>
      )}

      <defs>
        <marker id="optArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Hill Climbing & Simulated Annealing ═══════════════════════════════

export function LocalSearchSVG({ scene }: { scene: number }) {
  // Same landscape as above but with paths overlaid
  const points = [
    { x: 30, y: 170 },
    { x: 80, y: 145 },
    { x: 130, y: 80 },  // local peak
    { x: 180, y: 110 },
    { x: 230, y: 145 },
    { x: 280, y: 120 },
    { x: 330, y: 55 },  // global peak
    { x: 380, y: 90 },
    { x: 430, y: 130 },
    { x: 470, y: 155 },
  ];
  const baseline = 175;

  const hillClimbPath = [0, 1, 2];   // climbs to local peak
  const saPath = [0, 1, 2, 3, 4, 5, 6]; // escapes local, climbs to global

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Hill climbing: always move to a better neighbor' :
         scene === 1 ? 'Problem: gets trapped at local optima' :
         scene === 2 ? 'SA: sometimes accept a worse state to escape' :
         'Temperature controls explore vs exploit'}
      </text>

      {/* Landscape silhouette */}
      <polyline points={`${points.map(p => `${p.x},${p.y}`).join(' ')} ${points[9].x},${baseline} ${points[0].x},${baseline}`}
        fill="var(--color-primary)" fillOpacity="0.06"
        stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinejoin="round" opacity={0.5} />

      <line x1={points[0].x} y1={baseline} x2={points[9].x} y2={baseline}
        stroke="var(--border-light)" strokeWidth="1.5" strokeDasharray="4,3" />

      {/* Hill climb path (scenes 0-1) */}
      {(scene === 0 || scene === 1) && (
        <g>
          {hillClimbPath.slice(0, -1).map((_, i) => {
            const from = points[hillClimbPath[i]];
            const to = points[hillClimbPath[i + 1]];
            return (
              <line key={`hc-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#lsArr)" opacity="0.7"
                style={{ transition: 'all 300ms' }} />
            );
          })}
          {/* Dots along hill climb path */}
          {hillClimbPath.map((pi, i) => (
            <circle key={`hd-${i}`} cx={points[pi].x} cy={points[pi].y} r="7"
              fill="var(--color-primary)" fillOpacity={i === hillClimbPath.length - 1 ? 0.4 : 1}
              stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}
        </g>
      )}

      {/* Scene 1: Trapped at local peak */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="95" y="54" width="75" height="22" rx="5" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="132" y="69" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Stuck!</text>
          {/* Show higher peak beyond */}
          <circle cx={330} cy={55} r="8" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
          <text x="330" y="40" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" opacity="0.5">Higher</text>
        </g>
      )}

      {/* Scenes 2-3: SA path */}
      {scene >= 2 && (
        <g>
          {/* Connected path segments */}
          {saPath.slice(0, -1).map((_, i) => {
            const from = points[saPath[i]];
            const to = points[saPath[i + 1]];
            const isDownhill = to.y > from.y;
            return (
              <line key={`sa-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={isDownhill ? 'var(--text-muted)' : 'var(--color-primary)'}
                strokeWidth={isDownhill ? 2 : 3}
                strokeDasharray={isDownhill ? '4,3' : 'none'}
                markerEnd={isDownhill ? 'none' : 'url(#lsArr)'}
                opacity={0.6} style={{ transition: 'all 300ms' }} />
            );
          })}
          {/* Dots */}
          {saPath.map((pi, i) => (
            <circle key={`sd-${i}`} cx={points[pi].x} cy={points[pi].y} r="6"
              fill={i === 0 || i === saPath.length - 1 ? 'var(--color-primary)' : 'var(--bg-surface)'}
              fillOpacity={i === 0 || i === saPath.length - 1 ? 1 : 1}
              stroke={i === saPath.length - 1 ? 'var(--color-primary)' : i === 2 ? 'var(--text-muted)' : 'var(--text-secondary)'}
              strokeWidth={i === saPath.length - 1 ? 3 : 2}
              style={{ transition: 'all 300ms' }} />
          ))}
          {/* Label the dip */}
          <text x={230} y={135} textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>Worse state accepted</text>
        </g>
      )}

      {/* Scene 3: Temperature gauge */}
      {scene === 3 && (
        <g transform="translate(380, 175)" style={{ animation: 'tof-pop 0.3s both' }}>
          <rect x="0" y="0" width="90" height="50" rx="6" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" />
          {/* Thermometer */}
          <rect x="10" y="10" width="8" height="32" rx="4" fill="var(--bg-surface)" stroke="var(--text-muted)" strokeWidth="1" />
          <rect x="10" y="26" width="8" height="16" rx="4" fill="var(--color-primary)" fillOpacity="0.5" />
          <rect x="8" y="36" width="12" height="4" rx="2" fill="var(--color-primary)" opacity="0.7" />
          <text x="28" y="22" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Explore</text>
          <text x="28" y="40" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Exploit</text>
        </g>
      )}
    </svg>
  );
}

// ── Linear Programming & CSP ═══════════════════════════════════════════

export function LinearProgrammingSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="lpGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Optimize a linear goal within constraints' :
         scene === 1 ? 'Constraints define a feasible region' :
         scene === 2 ? 'Optimal solution is always at a vertex' :
         'CSP: satisfy all constraints, no optimization'}
      </text>

      {/* Scene 0: Factory with resources */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="50" y="55" width="180" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="140" y="75" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">Resources</text>
          <line x1="65" y1="81" x2="215" y2="81" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="140" y="100" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Wood: 100 units</text>
          <text x="140" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Labor: 80 hours</text>

          <text x="250" y="95" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="system-ui" fontWeight="800">→</text>

          <rect x="270" y="55" width="180" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="360" y="75" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Products</text>
          <line x1="285" y1="81" x2="435" y2="81" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="360" y="100" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Chairs: x₁</text>
          <text x="360" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Tables: x₂</text>

          <rect x="140" y="170" width="220" height="32" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="190" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">
            Maximize profit: 5x₁ + 8x₂
          </text>

          <text x="250" y="225" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Limited resources define what is possible
          </text>
        </g>
      )}

      {/* Scene 1-2: Feasible region */}
      {scene >= 1 && scene <= 2 && (
        <g>
          {/* Axes */}
          <line x1="80" y1="180" x2="80" y2="50" stroke="var(--text-secondary)" strokeWidth="2" />
          <line x1="80" y1="180" x2="430" y2="180" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="75" y="45" textAnchor="end" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">x₂</text>
          <text x="435" y="184" textAnchor="start" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">x₁</text>

          {/* Constraint lines */}
          {/* 2x₁+x₂=120 passes through (60,0)→screen(200,180) and (30,60)→screen(140,60) */}
          <line x1="200" y1="180" x2="140" y2="60" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.4" />
          <text x="145" y="55" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" opacity="0.5">2x₁+x₂≤120</text>
          {/* x₁+2x₂=100 passes through (100,0)→screen(280,180) and (0,50)→screen(80,80) */}
          <line x1="280" y1="180" x2="80" y2="80" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.4" />
          <text x="285" y="175" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" opacity="0.5">x₁+2x₂≤100</text>

          {/* Common feasible polygon: (0,0)→(60,0)→(46.7,26.7)→(0,50) in problem coords */}
          {/* Screen: 80,180 → 200,180 → 173,127 → 80,80 */}

          {scene === 1 && (
            <g style={{ animation: 'tof-up 0.3s both' }}>
              <polygon points="80,180 200,180 173,127 80,80"
                fill="var(--color-primary)" fillOpacity="0.12"
                stroke="var(--color-primary)" strokeWidth="2.5" strokeDasharray="5,3" />
              <text x="150" y="155" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
                style={{ animation: 'tof-pop 0.3s 0.3s both' }}>
                Feasible region
              </text>
              <text x="250" y="225" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic"
                style={{ animation: 'tof-up 0.3s 0.45s both' }}>
                Every point inside satisfies all constraints
              </text>
            </g>
          )}

          {scene === 2 && (
            <g style={{ animation: 'tof-up 0.3s both' }}>
              <polygon points="80,180 200,180 173,127 80,80"
                fill="var(--color-primary)" fillOpacity="0.08"
                stroke="var(--border-light)" strokeWidth="1.5" />
              <polygon points="80,180 200,180 173,127 80,80"
                fill="var(--color-primary)" fillOpacity="0.15"
                stroke="var(--color-primary)" strokeWidth="2.5" />
              <circle cx={173} cy={127} r="10"
                fill="var(--color-primary)" fillOpacity="0.3"
                stroke="var(--color-primary)" strokeWidth="3"
                style={{ animation: 'tof-pulse-ring 2s ease-out infinite' }} />
              <text x={173} y={115} textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Optimal</text>
              <text x="250" y="225" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
                The best solution is at the intersection of constraints
              </text>
            </g>
          )}
        </g>
      )}

      {/* Scene 3: CSP */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="50" width="420" height="100" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="72" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Constraint Satisfaction Problem</text>
          <line x1="55" y1="78" x2="445" y2="78" stroke="var(--border-light)" strokeWidth="0.8" />

          {/* Three variables with domains */}
          {[
            { id: 'A', domain: '{1,2,3}', x: 85 },
            { id: 'B', domain: '{1,2,3}', x: 250 },
            { id: 'C', domain: '{1,2,3}', x: 415 },
          ].map(v => (
            <g key={v.id}>
              <circle cx={v.x} cy="100" r="16"
                fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
              <text x={v.x} y="105" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">{v.id}</text>
              <text x={v.x} y="133" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">{v.domain}</text>
            </g>
          ))}

          {/* Constraint arcs */}
          <path d="M 100 100 Q 165 60 234 100" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.6" markerEnd="url(#lpArr)" />
          <path d="M 266 100 Q 330 60 399 100" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.6" markerEnd="url(#lpArr)" />
          <text x="167" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">A ≠ B</text>
          <text x="332" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">B ≠ C</text>

          <text x="250" y="185" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Variables + Domains + Constraints → find any valid assignment
          </text>
        </g>
      )}

      <defs>
        <marker id="lpArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>
    </svg>
  );
}
