// ── Probability Basics — Sample Space Grid ═════════════════════════════

export function ProbabilityBasicsSVG({ scene }: { scene: number }) {
  const dots = Array.from({ length: 12 }, (_, i) => ({
    x: 80 + (i % 4) * 90,
    y: 60 + Math.floor(i / 4) * 45,
  }));

  const eventA = [0, 1, 4, 5]; // top-left 2x2
  const eventB = [1, 2, 5, 6]; // overlaps with A

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="pbGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Every experiment has a set of possible outcomes' :
         scene === 1 ? 'An event is any subset you care about' :
         scene === 2 ? 'P(event) = favorable / total' :
         'Conditional: given B, what is P(A)?'}
      </text>

      {/* sample space box — covers all 12 dots */}
      <rect x="55" y="40" width="390" height="125" rx="10" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.4"
        style={{ transition: 'all 300ms' }} />
      {scene === 0 && (
        <text x="250" y="34" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" opacity="0.6">Sample Space</text>
      )}

      {/* Dots */}
      {dots.map((d, i) => {
        const inA = eventA.includes(i);
        const inB = eventB.includes(i);
        const highlightA = (scene === 1 || scene === 2) && inA;
        const highlightB = scene === 3 && inB;
        const highlightCond = scene === 3 && inA && inB;

        return (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="9"
              fill={highlightCond ? 'var(--color-primary)' : highlightA ? 'var(--color-primary)' : highlightB ? 'var(--color-primary)' : 'var(--bg-surface)'}
              fillOpacity={highlightCond ? 0.4 : highlightA ? 0.25 : highlightB ? 0.15 : 1}
              stroke={highlightCond ? 'var(--color-primary)' : highlightA ? 'var(--color-primary)' : highlightB ? 'var(--color-primary)' : 'var(--text-secondary)'}
              strokeWidth={highlightCond ? 3 : (highlightA || highlightB) ? 2.5 : 2}
              opacity={scene === 3 && !inB ? 0.2 : 1}
              style={{ transition: 'all 300ms' }} />
            <text x={d.x} y={d.y + 3} textAnchor="middle"
              fill={highlightCond ? 'var(--color-primary)' : highlightA ? 'var(--color-primary)' : highlightB ? 'var(--color-primary)' : 'var(--text-muted)'}
              fontSize="7" fontFamily="system-ui" fontWeight="800"
              opacity={scene === 3 && !inB ? 0.3 : 1}
              style={{ transition: 'all 300ms' }}>{i + 1}</text>
          </g>
        );
      })}

      {/* Event A bracket */}
      {(scene === 1 || scene === 2) && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="62" y="54" width="118" height="55" rx="6" fill="none"
            stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4,3" opacity="0.6" />
          <text x="66" y="50" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">A</text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s 0.15s both' }}>
          <rect x="150" y="180" width="200" height="32" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="200" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">
            P(A) = 4 / 12 = 1/3
          </text>
        </g>
      )}

      {/* Scene 3: Conditional — Event B bracket with overlap */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="157" y="54" width="118" height="55" rx="6" fill="none"
            stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4,3" opacity="0.6" />
          <text x="279" y="64" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">B</text>
          {/* Highlight the intersection A∩B */}
          <rect x="157" y="54" width="67" height="55" rx="4" fill="var(--color-primary)" fillOpacity="0.08"
            stroke="var(--color-primary)" strokeWidth="2" />
          <rect x="140" y="180" width="240" height="32" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="260" y="200" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">
            P(A | B) = 2 / 4 = 1/2
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Random Variables — Die Face to Distribution ═══════════════════════

export function RandomVariablesSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="rvGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'A variable whose value depends on chance' :
         scene === 1 ? 'Every value has a probability' :
         scene === 2 ? 'Probabilities across all values sum to 1' :
         'Independent: knowing X tells you nothing about Y'}
      </text>

      {/* Scene 0: Die face */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="180" y="50" width="140" height="140" rx="18" fill="var(--bg-surface)" stroke="var(--text-main)" strokeWidth="3" />
          {/* Die face 5 pattern */}
          <circle cx="220" cy="90" r="10" fill="var(--text-main)" />
          <circle cx="280" cy="90" r="10" fill="var(--text-main)" />
          <circle cx="250" cy="120" r="10" fill="var(--text-main)" />
          <circle cx="220" cy="150" r="10" fill="var(--text-main)" />
          <circle cx="280" cy="150" r="10" fill="var(--text-main)" />
          <text x="250" y="210" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Roll = random variable with domain {'{1, 2, 3, 4, 5, 6}'}
          </text>
        </g>
      )}

      {/* Scene 1: Domain values */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {[1, 2, 3, 4, 5, 6].map((v, i) => (
            <g key={v}>
              <rect x={30 + i * 75} y={70} width="65" height="50" rx="8"
                fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
              <text x={30 + i * 75 + 32} y={95} textAnchor="middle" fill="var(--color-primary)" fontSize="13" fontFamily="system-ui" fontWeight="800">{v}</text>
              <text x={30 + i * 75 + 32} y={140} textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">P = 1/6</text>
            </g>
          ))}
          <text x="250" y="175" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Domain: every possible value the variable can take
          </text>
        </g>
      )}

      {/* Scene 2: Distribution bar chart */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {[1, 2, 3, 4, 5, 6].map((v, i) => {
            const barH = 80;
            return (
              <g key={v}>
                <rect x={40 + i * 72} y={140 - barH} width="54" height={barH} rx="4"
                  fill="var(--color-primary)" fillOpacity="0.25" stroke="var(--color-primary)" strokeWidth="2" />
                <text x={40 + i * 72 + 27} y={150 - barH} textAnchor="middle"
                  fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">1/6</text>
                <text x={40 + i * 72 + 27} y={160} textAnchor="middle"
                  fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">{v}</text>
              </g>
            );
          })}
          <text x="250" y="190" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Sum = 1</text>
          <line x1="35" y1="143" x2="465" y2="143" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="3,3" />
        </g>
      )}

      {/* Scene 3: Independence - two coin/dice */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="60" y="55" width="160" height="120" rx="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="140" y="80" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">First Roll</text>
          <line x1="75" y1="88" x2="205" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="140" y="110" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui">P(1) = 1/6</text>
          <text x="140" y="130" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui">P(2) = 1/6</text>
          <text x="140" y="150" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui">...</text>

          <text x="250" y="115" textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontFamily="system-ui" fontWeight="800">⨉</text>

          <rect x="280" y="55" width="160" height="120" rx="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="360" y="80" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">Second Roll</text>
          <line x1="295" y1="88" x2="425" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="360" y="110" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui">P(3) = 1/6</text>
          <text x="360" y="130" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui">P(4) = 1/6</text>
          <text x="360" y="150" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui">...</text>

          <text x="250" y="220" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Roll 1 and Roll 2 do not affect each other
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Bayes' Theorem — Prior → Evidence → Posterior ════════════════════

export function BayesTheoremSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="btGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'How to change your mind the right way' :
         scene === 1 ? 'Prior P(H): belief before evidence' :
         scene === 2 ? 'Likelihood P(E|H): assume H, how likely is E?' :
         'Posterior P(H|E): updated belief after evidence'}
      </text>

      {/* Scene 0: The intuition */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="50" y="55" width="400" height="70" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="80" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">Old belief + New evidence = Updated belief</text>
          <line x1="65" y1="88" x2="435" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="250" y="108" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            P(H | E) = P(E | H) × P(H) / P(E)
          </text>
          <text x="250" y="145" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            The formula for rational belief update
          </text>
        </g>
      )}

      {/* Scene 1: Prior */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="55" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">Population</text>
          {/* 20 small people dots, 1 highlighted */}
          {Array.from({ length: 20 }, (_, i) => ({
            x: 60 + (i % 10) * 40,
            y: 80 + Math.floor(i / 10) * 50,
          })).map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="8"
                fill={i === 0 ? 'var(--color-primary)' : 'var(--bg-surface)'}
                fillOpacity={i === 0 ? 0.3 : 1}
                stroke={i === 0 ? 'var(--color-primary)' : 'var(--text-secondary)'}
                strokeWidth={i === 0 ? 3 : 1.5}
                opacity={i === 0 ? 1 : 0.3}
                style={{ transition: 'all 300ms' }} />
              {i === 0 && (
                <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="var(--color-primary)" strokeWidth="2"
                  opacity="0.4" style={{ animation: 'tof-pulse-ring 2s ease-out infinite' }} />
              )}
            </g>
          ))}
          <text x="250" y="165" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            P(H) = 1/1000 (rare disease)
          </text>
          <text x="250" y="185" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Prior = strength of your initial belief
          </text>
        </g>
      )}

      {/* Scene 2: Likelihood */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="60" y="50" width="160" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="140" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">Hypothesis H</text>
          <line x1="75" y1="78" x2="205" y2="78" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="140" y="100" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Has disease</text>
          <text x="140" y="118" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">P(H) = 0.001</text>

          <line x1="220" y1="90" x2="260" y2="90" stroke="var(--color-primary)" strokeWidth="3" opacity="0.6" />
          <text x="240" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">→</text>

          <rect x="270" y="50" width="170" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="355" y="72" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Evidence E</text>
          <line x1="285" y1="78" x2="425" y2="78" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="355" y="100" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Positive test</text>
          <text x="355" y="118" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">P(E|H) = 0.99</text>

          <text x="250" y="180" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Likelihood: if H is true, how likely is the evidence?
          </text>
        </g>
      )}

      {/* Scene 3: Posterior */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="45" width="420" height="90" rx="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />

          <rect x="55" y="55" width="120" height="28" rx="6" fill="var(--color-primary)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="115" y="73" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">P(H) = 0.001</text>

          <line x1="180" y1="69" x2="210" y2="69" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" />

          <rect x="215" y="55" width="80" height="28" rx="6" fill="var(--color-primary)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="255" y="73" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">0.99</text>

          <line x1="300" y1="69" x2="330" y2="69" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" />

          <rect x="335" y="55" width="110" height="28" rx="6" fill="var(--color-primary)" fillOpacity="0.25" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="390" y="73" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">P(H|E) = ?</text>

          <line x1="65" y1="95" x2="435" y2="95" stroke="var(--border-light)" strokeWidth="0.8" />

          <text x="250" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            P(H|E) = (0.001 × 0.99) / 0.01089 ≈ 0.091
          </text>

          <text x="250" y="155" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            99% accurate test, but only 9% posterior — base rate matters!
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Bayesian Networks — Cause → Effect Chain ═════════════════════════

export function BayesianNetworksSVG({ scene }: { scene: number }) {
  const nodes = [
    { id: 'Rain', x: 60, y: 90, label: 'Rain' },
    { id: 'Traffic', x: 250, y: 90, label: 'Traffic' },
    { id: 'Late', x: 440, y: 90, label: 'Late' },
  ];

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="bnGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Causes form chains — nothing is isolated' :
         scene === 1 ? 'Each node has a probability table (CPT)' :
         scene === 2 ? 'Observing evidence updates all connected nodes' :
         'Inference: propagate evidence through the network'}
      </text>

      {/* Edges between nodes */}
      <line x1={110} y1={90} x2={190} y2={90} stroke="var(--text-secondary)" strokeWidth="3" markerEnd="url(#bnArr)" opacity={0.5} />
      <line x1={300} y1={90} x2={380} y2={90} stroke="var(--text-secondary)" strokeWidth="3" markerEnd="url(#bnArr)" opacity={0.5} />

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={n.id}>
          <rect x={n.x - 40} y={n.y - 25} width="80" height="50" rx="12"
            fill="var(--bg-surface)"
            stroke={i === 1 && scene === 2 ? 'var(--color-primary)' : i === 1 && scene === 3 ? 'var(--color-primary)' : i === 2 && scene === 3 ? 'var(--color-primary)' : 'var(--text-secondary)'}
            strokeWidth={i === 1 && scene >= 2 ? 3 : i === 2 && scene === 3 ? 3 : 2.5}
            style={{ transition: 'all 300ms' }} />
          <text x={n.x} y={n.y - 6} textAnchor="middle"
            fill={i === 1 && scene >= 2 ? 'var(--color-primary)' : i === 2 && scene === 3 ? 'var(--color-primary)' : 'var(--text-secondary)'}
            fontSize="8" fontFamily="system-ui" fontWeight="800"
            style={{ transition: 'all 300ms' }}>{n.id}</text>

          {/* CPT preview */}
          {(scene >= 1) && (
            <text x={n.x} y={n.y + 12} textAnchor="middle"
              fill={i === 1 && scene >= 2 ? 'var(--color-primary)' : 'var(--text-muted)'}
              fontSize="6" fontFamily="system-ui" opacity="0.6"
              style={{ transition: 'all 300ms' }}>
              {i === 0 ? 'P(R)=0.3' : i === 1 ? 'P(T|R)' : 'P(L|T)'}
            </text>
          )}

          {/* Highlight on evidence */}
          {i === 1 && scene === 2 && (
            <rect x={n.x - 44} y={n.y - 29} width="88" height="58" rx="14" fill="none"
              stroke="var(--color-primary)" strokeWidth="2" opacity="0.4"
              style={{ animation: 'tof-pulse-ring 2s ease-out infinite' }} />
          )}
        </g>
      ))}

      {/* Scene 1: CPT detail */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="120" y="155" width="260" height="60" rx="8" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" />
          <text x="250" y="172" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Conditional Probability Table (CPT)</text>
          <line x1="135" y1="176" x2="365" y2="176" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="160" y="195" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Rain | P(Traffic)</text>
          <text x="330" y="195" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">T | 0.9  |  ¬T | 0.3</text>
        </g>
      )}

      {/* Scene 2: Evidence observed */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="100" y="155" width="300" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="177" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">
            Observed: Traffic = heavy
          </text>
        </g>
      )}

      {/* Scene 3: Inference result */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="80" y="155" width="340" height="55" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="175" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Inference</text>
          <line x1="95" y1="182" x2="405" y2="182" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="250" y="196" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            P(Rain | Traffic) increases → P(Late | Traffic) increases
          </text>
        </g>
      )}

      <defs>
        <marker id="bnArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--text-secondary)" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Markov Models — Sequence through Time ════════════════════════════

export function MarkovModelsSVG({ scene }: { scene: number }) {
  const stateLabels = ['S', 'R', 'C'];
  const timeSteps = [0, 1, 2, 3];

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="mmGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'The world changes over time — AI tracks sequences' :
         scene === 1 ? 'Markov assumption: the future depends only on now' :
         scene === 2 ? 'Markov Chain: states connected by transition probabilities' :
         'HMM: hidden states produce observable outputs'}
      </text>

      {/* Scene 0: Sequence of states over time */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="60" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">Time steps</text>
          {timeSteps.map((t, i) => (
            <g key={t}>
              <circle cx={70 + i * 120} cy="100" r="24"
                fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
              <text x={70 + i * 120} y="105" textAnchor="middle" fill="var(--color-primary)" fontSize="14" fontFamily="system-ui" fontWeight="800">{stateLabels[t % 3]}</text>
              <text x={70 + i * 120} y="140" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">t = {t}</text>
            </g>
          ))}
          <text x="250" y="175" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Weather changes day by day — each step depends on the last
          </text>
        </g>
      )}

      {/* Scene 1: Markov assumption */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="50" y="55" width="400" height="80" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="80" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">
            P(Xₜ₊₁ | X₀, X₁, ..., Xₜ) = P(Xₜ₊₁ | Xₜ)
          </text>
          <line x1="65" y1="88" x2="435" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="250" y="110" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Tomorrow's weather ≈ Today's weather
          </text>
          <text x="250" y="130" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Only the present matters for predicting the future</text>
        </g>
      )}

      {/* Scene 2: Markov chain */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {/* Three state circles in a triangle */}
          <circle cx="250" cy="55" r="28"
            fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="60" textAnchor="middle" fill="var(--color-primary)" fontSize="12" fontFamily="system-ui" fontWeight="800">Sunny</text>

          <circle cx="120" cy="155" r="28"
            fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2.5" />
          <text x="120" y="160" textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontFamily="system-ui" fontWeight="800">Rain</text>

          <circle cx="380" cy="155" r="28"
            fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2.5" />
          <text x="380" y="160" textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontFamily="system-ui" fontWeight="800">Cloudy</text>

          {/* Transition arrows */}
          <g opacity="0.5">
            <path d="M 235 75 Q 160 100 130 135" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#mmArr)" />
            <path d="M 265 75 Q 340 100 370 135" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#mmArr)" />
            <path d="M 148 168 Q 200 190 280 170 Q 340 155 362 148" fill="none" stroke="var(--text-secondary)" strokeWidth="2" markerEnd="url(#mmArr)" />
            <path d="M 230 68 Q 200 45 170 55 Q 140 65 125 130" fill="none" stroke="var(--text-secondary)" strokeWidth="2" markerEnd="url(#mmArr)" />
          </g>

          <text x="250" y="220" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Transitions show the probability of moving between states
          </text>
        </g>
      )}

      {/* Scene 3: HMM */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="50" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Hidden States</text>
          <text x="250" y="150" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Observations</text>

          {timeSteps.map((t, i) => (
            <g key={t}>
              {/* Hidden state */}
              <circle cx={70 + i * 120} cy="80" r="20"
                fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
              <text x={70 + i * 120} y="85" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">{stateLabels[t % 3]}</text>

              {/* Observation */}
              <rect x={40 + i * 120} y={170} width="60" height="30" rx="6"
                fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
              <text x={70 + i * 120} y={189} textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui" fontWeight="800">{['Temp', 'Hum', 'Wind', 'Rain'][t]}</text>

              {/* Observation arrow (hidden → observed) */}
              <line x1={70 + i * 120} y1={100} x2={70 + i * 120} y2={168}
                stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" markerEnd="url(#mmArr)" />

              {/* Transition arrow */}
              {i < 3 && (
                <line x1={90 + i * 120} y1={80} x2={105 + i * 120} y2={80}
                  stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" markerEnd="url(#mmArr)" />
              )}
            </g>
          ))}

          <text x="250" y="225" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            AI sees observations (sensor readings) but must infer the hidden state
          </text>
        </g>
      )}

      <defs>
        <marker id="mmArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>
    </svg>
  );
}
