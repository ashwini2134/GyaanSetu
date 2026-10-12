// ── Algorithmic Bias — Biased data → Unfair AI ═════════════════════════

export function AlgorithmicBiasSVG({ scene }: { scene: number }) {
  const groupA = [
    { x: 60, y: 70 }, { x: 120, y: 70 }, { x: 180, y: 70 }, { x: 240, y: 70 },
    { x: 60, y: 120 }, { x: 120, y: 120 }, { x: 180, y: 120 }, { x: 240, y: 120 },
    { x: 60, y: 170 }, { x: 120, y: 170 }, { x: 180, y: 170 }, { x: 240, y: 170 },
    { x: 60, y: 220 }, { x: 120, y: 220 }, { x: 180, y: 220 }, { x: 240, y: 220 },
  ];
  const groupB = [
    { x: 310, y: 95 }, { x: 370, y: 95 },
    { x: 310, y: 145 }, { x: 370, y: 145 },
  ];

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="abGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Algorithmic Bias: biased data leads to biased AI' :
         scene === 1 ? 'Algorithmic Bias: model learns the bias in the data' :
         scene === 2 ? 'Algorithmic Bias: unfair outcomes for underrepresented groups' :
         'Algorithmic Bias: fair AI treats all groups equitably'}
      </text>

      {/* Dots area */}
      <g style={{ transition: 'all 300ms' }}>
        {/* Group A — circles */}
        {groupA.map((d, i) => (
          <g key={`a${i}`}>
            <circle cx={d.x} cy={d.y} r="10"
              fill="var(--bg-surface)"
              stroke={
                scene === 2 && i % 2 === 0 ? 'var(--color-primary)' :
                scene === 3 ? 'var(--color-primary)' :
                'var(--color-primary)'
              }
              strokeWidth={
                scene === 2 && i % 2 === 0 ? 3 :
                scene === 3 ? 2.5 :
                2.5
              }
              opacity={
                scene === 2 && i % 2 === 0 ? 0.4 :
                scene === 2 ? 0.15 :
                scene === 3 ? 0.35 :
                scene === 0 ? 0.85 :
                1
              }
              style={{ transition: 'all 300ms' }} />
            {scene === 2 && i % 2 === 0 && (
              <text x={d.x} y={d.y + 3} textAnchor="middle" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui" fontWeight="800"
                style={{ transition: 'all 300ms' }}>!</text>
            )}
          </g>
        ))}

        {/* Group B — diamonds */}
        {groupB.map((d, i) => (
          <g key={`b${i}`}>
            <polygon
              points={`${d.x},${d.y - 10} ${d.x + 10},${d.y} ${d.x},${d.y + 10} ${d.x - 10},${d.y}`}
              fill="var(--bg-surface)"
              stroke={
                scene === 2 ? 'var(--color-primary)' :
                scene === 3 ? 'var(--color-primary)' :
                'var(--text-secondary)'
              }
              strokeWidth={
                scene === 2 ? 3 :
                scene === 3 ? 2.5 :
                2
              }
              opacity={
                scene === 2 ? 0.4 :
                scene === 3 ? 0.85 :
                scene === 0 ? 0.4 :
                1
              }
              style={{ transition: 'all 300ms' }} />
            {scene === 2 && (
              <text x={d.x} y={d.y + 3} textAnchor="middle" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui" fontWeight="800"
                style={{ transition: 'all 300ms' }}>!</text>
            )}
            {scene === 3 && (
              <text x={d.x} y={d.y + 3} textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
                style={{ transition: 'all 300ms' }}>✓</text>
            )}
          </g>
        ))}
      </g>

      {/* Labels */}
      <text x="150" y="45" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
        opacity={scene === 0 || scene === 1 ? 1 : 0.3}
        style={{ transition: 'all 300ms' }}>
        Group A (80%)
      </text>
      <text x="340" y="45" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
        opacity={scene === 0 || scene === 1 ? 1 : 0.3}
        style={{ transition: 'all 300ms' }}>
        Group B (20%)
      </text>

      {/* Scene 0: Data imbalance */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="120" y="234" width="260" height="22" rx="6" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" />
          <text x="250" y="249" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Unbalanced training data
          </text>
        </g>
      )}

      {/* Scene 1: Model learns bias */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="155" y="24" width="190" height="32" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="44" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Model learns from data</text>
          <path d="M 165 56 L 165 234" fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" markerEnd="url(#abArrL)" />
          <path d="M 335 56 L 335 234" fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" markerEnd="url(#abArrR)" />
          <rect x="100" y="234" width="300" height="22" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="249" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Model amplifies majority patterns
          </text>
        </g>
      )}

      {/* Scene 2: Unfair predictions */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="290" y="52" width="170" height="28" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="375" y="70" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Predictions</text>
          <path d="M 370 155 L 370 84" fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" markerEnd="url(#abArrUp)" />
          <rect x="80" y="234" width="340" height="22" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="249" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            Group B receives systematically worse outcomes
          </text>
        </g>
      )}

      {/* Scene 3: Fairness */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="80" y="234" width="340" height="22" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="249" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Equal treatment & outcomes for all groups
          </text>
        </g>
      )}

      <defs>
        <marker id="abArrL" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 10 0 L 0 5 L 10 10 Z" fill="var(--color-primary)" />
        </marker>
        <marker id="abArrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
        <marker id="abArrUp" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 10 L 5 0 L 10 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Hallucinations & Deepfakes — When AI gets it wrong ════════════════

export function HallucinationsDeepfakesSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="hdGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Hallucinations & Deepfakes: AI generates text with high confidence' :
         scene === 1 ? 'Hallucinations & Deepfakes: but it can be confidently wrong' :
         scene === 2 ? 'Hallucinations & Deepfakes: deepfakes — synthetic media that looks real' :
         'Hallucinations & Deepfakes: detection — distinguishing real from AI-generated'}
      </text>

      {/* Scene 0: AI generates answer confidently */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="55" width="180" height="92" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="130" y="78" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Question</text>
          <line x1="55" y1="85" x2="205" y2="85" stroke="var(--border-light)" strokeWidth="1" />
          <text x="130" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">"What is the capital of</text>
          <text x="130" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Brazil?"</text>

          <line x1="220" y1="100" x2="260" y2="100" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" markerEnd="url(#hdArr)" />

          <rect x="270" y="55" width="190" height="92" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="365" y="78" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">AI Answer</text>
          <line x1="285" y1="85" x2="445" y2="85" stroke="var(--border-light)" strokeWidth="1" />
          <text x="365" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">"Brasilia is the</text>
          <text x="365" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">capital of Brazil."</text>

          <rect x="310" y="126" width="110" height="18" rx="5" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="365" y="139" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Confidence: 87%</text>

          <text x="250" y="210" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            LLMs predict probable tokens, not truth
          </text>
        </g>
      )}

      {/* Scene 1: Confidently wrong */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="55" width="180" height="92" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="130" y="78" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Question</text>
          <line x1="55" y1="85" x2="205" y2="85" stroke="var(--border-light)" strokeWidth="1" />
          <text x="130" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">"Which president is on</text>
          <text x="130" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">the 500 rupee note?"</text>

          <line x1="220" y1="100" x2="260" y2="100" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" markerEnd="url(#hdArr)" />

          <rect x="270" y="55" width="190" height="92" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="365" y="78" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">AI Answer</text>
          <line x1="285" y1="85" x2="445" y2="85" stroke="var(--border-light)" strokeWidth="1" />
          <text x="365" y="102" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui">"Mahatma Gandhi"</text>
          <text x="365" y="120" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" opacity="0.8">(Actually: no such note)</text>

          <rect x="310" y="126" width="110" height="18" rx="5" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="365" y="139" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Confidence: 92%</text>

          <rect x="110" y="175" width="280" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="198" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Hallucination: confident but completely wrong
          </text>
        </g>
      )}

      {/* Scene 2: Deepfake */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {/* Face outline */}
          <ellipse cx="250" cy="95" rx="50" ry="60" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          {/* Eyes */}
          <circle cx="230" cy="82" r="6" fill="var(--color-primary)" fillOpacity="0.3" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="270" cy="82" r="6" fill="var(--color-primary)" fillOpacity="0.3" stroke="var(--color-primary)" strokeWidth="1.5" />
          {/* Nose */}
          <path d="M 250 88 L 245 100 L 255 100 Z" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1.2" />
          {/* Mouth */}
          <path d="M 235 112 Q 250 120 265 112" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
          {/* Ears */}
          <circle cx="198" cy="95" r="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="302" cy="95" r="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />

          <rect x="195" y="160" width="110" height="22" rx="5" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="250" y="175" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">SYNTHETIC</text>

          <rect x="90" y="195" width="320" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="218" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Generative models create realistic fake media
          </text>
        </g>
      )}

      {/* Scene 3: Detection */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="55" width="190" height="92" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="135" y="78" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Real</text>
          <line x1="55" y1="85" x2="215" y2="85" stroke="var(--border-light)" strokeWidth="1" />
          <text x="135" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Verified source</text>
          <text x="135" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Consistent metadata</text>
          <rect x="90" y="126" width="90" height="18" rx="5" fill="var(--color-primary)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="135" y="139" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">AUTHENTIC</text>

          <line x1="230" y1="100" x2="250" y2="100" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.4" />
          <text x="240" y="92" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">vs</text>

          <rect x="270" y="55" width="190" height="92" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="365" y="78" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">AI-Generated</text>
          <line x1="285" y1="85" x2="445" y2="85" stroke="var(--border-light)" strokeWidth="1" />
          <text x="365" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Artifacts in texture</text>
          <text x="365" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Inconsistent lighting</text>
          <rect x="320" y="126" width="90" height="18" rx="5" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
          <text x="365" y="139" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui" fontWeight="800">SYNTHETIC</text>

          <rect x="80" y="195" width="340" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="218" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            Detection tools look for inconsistencies in pixels & audio
          </text>
        </g>
      )}

      <defs>
        <marker id="hdArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Responsible AI Development — Build AI that people can trust ═══════

export function ResponsibleAISVG({ scene }: { scene: number }) {
  const pillars = [
    { id: 'Transparency', label: 'Transparency', desc: 'Explainable decisions', x: 70 },
    { id: 'Accountability', label: 'Accountability', desc: 'Audit trails', x: 180 },
    { id: 'Privacy', label: 'Privacy', desc: 'Data protection', x: 290 },
    { id: 'Oversight', label: 'Human Oversight', desc: 'Human review', x: 400 },
  ];

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="raGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Responsible AI Development: AI systems affect real people' :
         scene === 1 ? 'Responsible AI Development: responsible AI rests on four pillars' :
         scene === 2 ? 'Responsible AI Development: Transparency | Accountability | Privacy | Human Oversight' :
         'Responsible AI Development: build responsibly from the start'}
      </text>

      {/* Scene 0: AI affects real people */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="50" y="55" width="400" height="60" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="80" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">AI System → Decision</text>
          <line x1="65" y1="88" x2="435" y2="88" stroke="var(--border-light)" strokeWidth="1" />
          <text x="250" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Loan approval · Hiring · Medical diagnosis · Criminal justice</text>

          {/* People icons */}
          {[130, 200, 270, 340].map((px, i) => (
            <g key={i}>
              <circle cx={px} cy="155" r="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
              <path d={`M ${px - 12} ${179} Q ${px} ${168} ${px + 12} ${179}`} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
              <line x1={px} y1={165} x2={px} y2={177} stroke="var(--color-primary)" strokeWidth="1.5" />
            </g>
          ))}

          <rect x="100" y="200" width="300" height="32" rx="8" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" />
          <text x="250" y="221" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            AI decisions have real consequences
          </text>
        </g>
      )}

      {/* Scene 1: Four pillars appear */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {pillars.map((p, i) => (
            <g key={p.id}>
              <rect x={p.x - 35} y="55" width="70" height="110" rx="6"
                fill="var(--bg-surface)"
                stroke="var(--color-primary)"
                strokeWidth="2"
                style={{ animation: `tof-up 0.3s ${i * 0.1}s both` }} />
              <text x={p.x} y={90} textAnchor="middle"
                fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
                style={{ animation: `tof-up 0.3s ${i * 0.1 + 0.1}s both` }}>
                {p.label.split(' ')[0]}
              </text>
              {p.label.includes(' ') && (
                <text x={p.x} y={102} textAnchor="middle"
                  fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
                  style={{ animation: `tof-up 0.3s ${i * 0.1 + 0.1}s both` }}>
                  {p.label.split(' ').slice(1).join(' ')}
                </text>
              )}
            </g>
          ))}

          <rect x="100" y="195" width="300" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="218" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Four pillars support responsible AI
          </text>
        </g>
      )}

      {/* Scene 2: Pillars with checks */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {pillars.map((p, i) => {
            const active = i <= scene - 1;
            return (
              <g key={p.id}>
                <rect x={p.x - 35} y="50" width="70" height="130" rx="6"
                  fill={active ? 'var(--bg-surface)' : 'var(--bg-surface)'}
                  fillOpacity={active ? 1 : 0.5}
                  stroke={active ? 'var(--color-primary)' : 'var(--text-muted)'}
                  strokeWidth={active ? 2.5 : 1.5}
                  opacity={active ? 1 : 0.4}
                  style={{ transition: 'all 300ms' }} />
                <text x={p.x} y={80} textAnchor="middle"
                  fill={active ? 'var(--color-primary)' : 'var(--text-muted)'}
                  fontSize="7" fontFamily="system-ui" fontWeight="800"
                  style={{ transition: 'all 300ms' }}>
                  {p.label.split(' ')[0]}
                </text>
                {p.label.includes(' ') && (
                  <text x={p.x} y={92} textAnchor="middle"
                    fill={active ? 'var(--color-primary)' : 'var(--text-muted)'}
                    fontSize="6" fontFamily="system-ui" fontWeight="800"
                    style={{ transition: 'all 300ms' }}>
                    {p.label.split(' ').slice(1).join(' ')}
                  </text>
                )}
                <text x={p.x} y={120} textAnchor="middle"
                  fill={active ? 'var(--text-secondary)' : 'var(--text-muted)'}
                  fontSize="6" fontFamily="system-ui"
                  opacity={active ? 1 : 0.3}
                  style={{ transition: 'all 300ms' }}>
                  {p.desc}
                </text>
                <rect x={p.x - 12} y="140" width="24" height="24" rx="5"
                  fill={active ? 'var(--color-primary)' : 'var(--bg-surface)'}
                  fillOpacity={active ? 0.2 : 0.5}
                  stroke={active ? 'var(--color-primary)' : 'var(--text-muted)'}
                  strokeWidth={active ? 2 : 1.5}
                  style={{ transition: 'all 300ms' }} />
                <text x={p.x} y="156" textAnchor="middle"
                  fill={active ? 'var(--color-primary)' : 'var(--text-muted)'}
                  fontSize="9" fontFamily="system-ui" fontWeight="800"
                  style={{ transition: 'all 300ms' }}>
                  ✓
                </text>
              </g>
            );
          })}

          <rect x="100" y="200" width="300" height="32" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="221" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            Each pillar is essential for trustworthy AI
          </text>
        </g>
      )}

      {/* Scene 3: All pillars active */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="45" width="420" height="60" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="67" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Responsible AI Framework</text>
          <line x1="55" y1="75" x2="445" y2="75" stroke="var(--border-light)" strokeWidth="1" />
          <text x="250" y="95" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            Transparency + Accountability + Privacy + Human Oversight
          </text>

          {pillars.map((p, i) => (
            <g key={p.id}>
              <rect x={p.x - 35} y="120" width="70" height="80" rx="6"
                fill="var(--bg-surface)"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                style={{ animation: `tof-up 0.3s ${i * 0.1}s both` }} />
              <text x={p.x} y="145" textAnchor="middle"
                fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
                style={{ animation: `tof-up 0.3s ${i * 0.1 + 0.05}s both` }}>
                {p.label.split(' ')[0]}
              </text>
              {p.label.includes(' ') && (
                <text x={p.x} y="157" textAnchor="middle"
                  fill="var(--color-primary)" fontSize="6" fontFamily="system-ui" fontWeight="800"
                  style={{ animation: `tof-up 0.3s ${i * 0.1 + 0.05}s both` }}>
                  {p.label.split(' ').slice(1).join(' ')}
                </text>
              )}
              <text x={p.x} y="180" textAnchor="middle"
                fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800"
                style={{ animation: `tof-up 0.3s ${i * 0.1 + 0.1}s both` }}>✓</text>
            </g>
          ))}

          <rect x="80" y="215" width="340" height="28" rx="8" fill="var(--color-primary)" fillOpacity="0.1" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="234" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Build responsibly from the start
          </text>
        </g>
      )}

      <defs>
        <marker id="raArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>
    </svg>
  );
}
