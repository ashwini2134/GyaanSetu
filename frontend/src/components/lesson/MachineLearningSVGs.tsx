// ── Supervised Learning — Labeled Data ══════════════════════════════════

export function SupervisedLearningSVG({ scene }: { scene: number }) {
  const pts = [
    { x: 60, y: 120, label: 'A', cls: 0 },
    { x: 100, y: 80, label: 'A', cls: 0 },
    { x: 70, y: 155, label: 'B', cls: 1 },
    { x: 130, y: 140, label: 'B', cls: 1 },
    { x: 40, y: 90, label: 'A', cls: 0 },
    { x: 110, y: 105, label: 'B', cls: 1 },
    { x: 170, y: 85, label: 'A', cls: 0 },
    { x: 180, y: 130, label: 'B', cls: 1 },
    { x: 200, y: 110, label: 'A', cls: 0 },
    { x: 215, y: 90, label: 'A', cls: 0 },
  ];

  const newPts = [
    { x: 300, y: 95, label: 'A', cls: 0 },
    { x: 330, y: 130, label: 'B', cls: 1 },
    { x: 360, y: 100, label: 'A', cls: 0 },
    { x: 380, y: 125, label: 'B', cls: 1 },
    { x: 410, y: 85, label: 'A', cls: 0 },
    { x: 440, y: 110, label: 'A', cls: 0 },
    { x: 315, y: 80, label: '?', cls: -1 },
    { x: 350, y: 145, label: '?', cls: -1 },
    { x: 395, y: 150, label: '?', cls: -1 },
  ];

  const clsFill = (c: number) => c === 0 ? 'var(--color-primary)' : c === 1 ? 'var(--text-main)' : 'var(--text-muted)';

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Supervised Learning: labeled data teaches the model' :
         scene === 1 ? 'Supervised Learning: learn from examples' :
         scene === 2 ? 'Supervised Learning: predict labels for unseen data' :
         'Supervised Learning: the goal is to predict correctly on new data'}
      </text>

      <defs>
        <marker id="slArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--text-secondary)" />
        </marker>
        <marker id="slArrHi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>

      {/* Scene 0-1: Labeled data points / Training */}
      {(scene === 0 || scene === 1) && (
        <g>
          <rect x="25" y="35" width="220" height="145" rx="8" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" opacity="0.6" />
          <text x="135" y="50" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            {scene === 0 ? 'Training Data (labeled)' : 'Training: (Input → Output)'}
          </text>

          {pts.map((p, i) => (
            <g key={i} style={{ transition: 'all 300ms' }}>
              <circle cx={p.x} cy={p.y} r="10"
                fill={clsFill(p.cls)} fillOpacity={scene === 0 ? 0.25 : 0.3}
                stroke={clsFill(p.cls)} strokeWidth={2.5} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fill={clsFill(p.cls)}
                fontSize="8" fontFamily="system-ui" fontWeight="800">{p.label}</text>
            </g>
          ))}

          {scene === 1 && (
            <g style={{ animation: 'tof-up 0.3s 0.2s both' }}>
              <line x1="245" y1="75" x2="270" y2="75" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#slArrHi)" opacity="0.7" />
              <rect x="270" y="45" width="95" height="55" rx="8" fill="var(--color-primary)" fillOpacity="0.12" stroke="var(--color-primary)" strokeWidth="2" />
              <text x="317" y="72" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Model</text>
              <text x="317" y="85" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">learns pattern</text>
              <text x="250" y="200" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800" style={{ animation: 'tof-up 0.3s 0.5s both' }}>
                Input → Output mapping from examples
              </text>
            </g>
          )}

          {scene === 0 && (
            <text x="135" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic"
              style={{ animation: 'tof-up 0.3s 0.3s both' }}>
              Each input has a known label
            </text>
          )}
        </g>
      )}

      {/* Scene 2: Prediction on new data */}
      {scene === 2 && (
        <g>
          <rect x="25" y="35" width="220" height="145" rx="8" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" opacity="0.6" />
          <text x="135" y="50" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Trained Model</text>

          {pts.slice(0, 6).map((p, i) => (
            <g key={i} style={{ opacity: 0.3, transition: 'all 300ms' }}>
              <circle cx={p.x} cy={p.y} r="8"
                fill={clsFill(p.cls)} fillOpacity={0.15}
                stroke={clsFill(p.cls)} strokeWidth={1.5} />
            </g>
          ))}

          <line x1="245" y1="95" x2="270" y2="95" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#slArrHi)" opacity="0.7" />
          <rect x="270" y="60" width="95" height="55" rx="8" fill="var(--color-primary)" fillOpacity="0.12" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="317" y="86" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Model</text>
          <text x="317" y="98" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">predicts label</text>

          <line x1="365" y1="86" x2="390" y2="86" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#slArrHi)" opacity="0.7" />
          <rect x="390" y="35" width="90" height="145" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="435" y="50" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Predictions</text>

          {newPts.map((p, i) => (
            <g key={i} style={{ transition: 'all 300ms' }}>
              <circle cx={p.x} cy={p.y} r="10"
                fill={p.cls === -1 ? 'var(--bg-surface)' : clsFill(p.cls)}
                fillOpacity={p.cls === -1 ? 0.5 : 0.25}
                stroke={p.cls === -1 ? 'var(--text-muted)' : clsFill(p.cls)}
                strokeWidth={p.cls === -1 ? 2 : 2.5}
                strokeDasharray={p.cls === -1 ? '3,2' : 'none'} />
              <text x={p.x} y={p.y + 4} textAnchor="middle"
                fill={p.cls === -1 ? 'var(--text-muted)' : clsFill(p.cls)}
                fontSize="8" fontFamily="system-ui" fontWeight="800">{p.label}</text>
            </g>
          ))}

          <text x="250" y="208" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.4s both' }}>
            Model assigns labels to unseen examples
          </text>
        </g>
      )}

      {/* Scene 3: Generalization */}
      {scene === 3 && (
        <g>
          <rect x="30" y="38" width="190" height="140" rx="8" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" opacity="0.5" />
          <text x="125" y="55" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Training Data</text>

          {pts.slice(0, 6).map((p, i) => (
            <g key={i} style={{ transition: 'all 300ms' }}>
              <circle cx={p.x} cy={p.y} r="9"
                fill={clsFill(p.cls)} fillOpacity={0.25}
                stroke={clsFill(p.cls)} strokeWidth={2.5} />
              <text x={p.x} y={p.y + 3} textAnchor="middle" fill={clsFill(p.cls)}
                fontSize="7" fontFamily="system-ui" fontWeight="800">{p.label}</text>
            </g>
          ))}

          <rect x="265" y="38" width="205" height="140" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="367" y="55" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">New Data — Correctly Predicted</text>

          {newPts.filter((_, i) => i < 6).map((p, i) => (
            <g key={i} style={{ transition: 'all 300ms' }}>
              <circle cx={p.x} cy={p.y} r="9"
                fill={clsFill(p.cls)} fillOpacity={0.25}
                stroke={clsFill(p.cls)} strokeWidth={2.5} />
              <text x={p.x} y={p.y + 3} textAnchor="middle" fill={clsFill(p.cls)}
                fontSize="7" fontFamily="system-ui" fontWeight="800">{p.label}</text>
              <path d={`M ${p.x - 4} ${p.y - 7} l 3 4 l 7 -8`} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            </g>
          ))}

          {newPts.filter((_, i) => i >= 6).map((p, i) => (
            <g key={`n${i}`} style={{ transition: 'all 300ms' }}>
              <circle cx={p.x} cy={p.y} r="9"
                fill={clsFill(p.cls)} fillOpacity={0.25}
                stroke={clsFill(p.cls)} strokeWidth={2.5} />
              <text x={p.x} y={p.y + 3} textAnchor="middle" fill={clsFill(p.cls)}
                fontSize="7" fontFamily="system-ui" fontWeight="800">{p.cls === 0 ? 'A' : 'B'}</text>
              <path d={`M ${p.x - 4} ${p.y - 7} l 3 4 l 7 -8`} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            </g>
          ))}

          <text x="250" y="210" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.4s both' }}>
            Generalization: model performs well on data it has never seen
          </text>
        </g>
      )}

      <text x="250" y="248" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800"
        style={{ animation: 'tof-up 0.3s 0.5s both' }}>
        {scene === 0 ? 'Labels guide the learning process' :
         scene === 1 ? 'Model learns the mapping' :
         scene === 2 ? 'Unseen data gets predicted labels' :
         'True test is performance on new data'}
      </text>
    </svg>
  );
}

// ── Overfitting & Generalisation — Bias-Variance ════════════════════════

export function OverfittingSVG({ scene }: { scene: number }) {
  const dataPts = [
    { x: 50, y: 150 }, { x: 90, y: 120 }, { x: 130, y: 100 },
    { x: 170, y: 90 }, { x: 210, y: 105 }, { x: 250, y: 80 },
    { x: 290, y: 95 }, { x: 330, y: 75 }, { x: 370, y: 85 },
    { x: 410, y: 70 }, { x: 450, y: 80 },
  ];

  const simpleCurve = [
    'M 40 160', 'Q 100 80 160 95', 'T 280 85', 'T 400 78', 'T 470 82',
  ].join(' ');

  const complexCurve = [
    'M 40 160',
    'Q 60 120 80 118', 'C 95 116 95 125 110 120',
    'C 120 116 130 108 140 102',
    'C 155 92 165 88 175 90',
    'C 185 91 195 102 210 104',
    'C 225 106 235 82 250 80',
    'C 265 78 275 94 290 94',
    'C 305 96 315 78 330 75',
    'C 345 72 355 86 370 84',
    'C 385 83 395 72 410 70',
    'C 425 68 435 78 450 78',
    'C 460 76 465 80 470 82',
  ].join(' ');

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Overfitting & Generalisation: a simple model captures the general trend' :
         scene === 1 ? 'Overfitting & Generalisation: an overfit model memorizes noise' :
         scene === 2 ? 'Overfitting & Generalisation: simple vs complex model comparison' :
         'Overfitting & Generalisation: simplicity leads to better predictions'}
      </text>

      <defs>
        <marker id="ovArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--text-secondary)" />
        </marker>
      </defs>

      {/* Coordinate axes */}
      <line x1="35" y1="175" x2="475" y2="175" stroke="var(--border-light)" strokeWidth="1.5" />
      <line x1="40" y1="45" x2="40" y2="175" stroke="var(--border-light)" strokeWidth="1.5" />

      {(scene === 0 || scene === 1) && (
        <g>
          {/* Simple curve (scene 0) / Complex curve (scene 1) */}
          <path d={scene === 0 ? simpleCurve : complexCurve}
            fill="none"
            stroke={scene === 0 ? 'var(--color-primary)' : 'var(--text-main)'}
            strokeWidth={scene === 0 ? 3 : 3}
            strokeLinecap="round"
            opacity={0.8}
            style={{ transition: 'all 300ms' }} />

          {/* Data points */}
          {dataPts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="5"
              fill="var(--bg-surface)"
              stroke={scene === 0 ? 'var(--color-primary)' : 'var(--text-main)'}
              strokeWidth={2.5}
              style={{ transition: 'all 300ms' }} />
          ))}

          <text x="250" y="228" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            {scene === 0 ? 'Smooth curve captures the underlying pattern' :
             'Wiggly curve passes through every point — memorizes noise'}
          </text>
        </g>
      )}

      {/* Scene 2: Two panels */}
      {scene === 2 && (
        <g>
          {/* Simple model panel */}
          <rect x="25" y="35" width="215" height="145" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" opacity="0.8" />
          <text x="132" y="52" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Simple Model</text>

          {dataPts.slice(0, 6).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y + 10} r="4"
              fill="var(--color-primary)" fillOpacity="0.2"
              stroke="var(--color-primary)" strokeWidth="2" />
          ))}
          <path d="M 35 145 Q 80 105 120 110 T 200 108 T 232 112"
            fill="none" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.6" />

          {/* Bars: train error, test error */}
          <rect x="50" y="175" width="60" height="14" rx="4" fill="var(--color-primary)" fillOpacity="0.3" />
          <text x="80" y="186" textAnchor="middle" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui" fontWeight="800">Train: Med</text>
          <rect x="155" y="175" width="60" height="14" rx="4" fill="var(--color-primary)" fillOpacity="0.3" />
          <text x="185" y="186" textAnchor="middle" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui" fontWeight="800">Test: Med</text>

          <line x1="132" y1="196" x2="132" y2="175" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="2,2" />

          {/* Complex model panel */}
          <rect x="260" y="35" width="215" height="145" rx="8" fill="var(--bg-surface)" stroke="var(--text-main)" strokeWidth="2" opacity="0.8" />
          <text x="367" y="52" textAnchor="middle" fill="var(--text-main)" fontSize="7" fontFamily="system-ui" fontWeight="800">Complex Model</text>

          {dataPts.slice(6).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y + 10} r="4"
              fill="var(--text-main)" fillOpacity="0.2"
              stroke="var(--text-main)" strokeWidth="2" />
          ))}
          <path d="M 270 90 C 280 88 290 95 300 92 C 310 88 320 82 335 80 C 350 78 360 90 370 85 C 380 82 390 76 405 74 C 420 72 435 82 450 78 C 460 76 468 80 470 82"
            fill="none" stroke="var(--text-main)" strokeWidth="2.5" opacity="0.6" />

          {/* Bars: train error, test error */}
          <rect x="280" y="175" width="60" height="14" rx="4" fill="var(--color-primary)" fillOpacity="0.4" />
          <text x="310" y="186" textAnchor="middle" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui" fontWeight="800">Train: Low</text>
          <rect x="395" y="175" width="60" height="14" rx="4" fill="var(--text-main)" fillOpacity="0.4" />
          <text x="425" y="186" textAnchor="middle" fill="var(--text-main)" fontSize="6" fontFamily="system-ui" fontWeight="800">Test: High</text>

          <line x1="367" y1="196" x2="367" y2="175" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="2,2" />

          <text x="250" y="225" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            Complex model memorizes training but fails on new data
          </text>
        </g>
      )}

      {/* Scene 3: Generalization gap */}
      {scene === 3 && (
        <g>
          <text x="250" y="48" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Generalisation Gap</text>

          {/* Training error bar (low) */}
          <rect x="60" y="60" width="380" height="35" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="60" y="60" width="120" height="35" rx="6" fill="var(--color-primary)" fillOpacity="0.2" />
          <text x="120" y="83" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Training Error</text>
          <text x="120" y="110" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">Low (memorized)</text>

          {/* Test error bar (high) — showing gap */}
          <rect x="60" y="125" width="380" height="35" rx="6" fill="var(--bg-surface)" stroke="var(--text-main)" strokeWidth="1.5" />
          <rect x="60" y="125" width="340" height="35" rx="6" fill="var(--text-main)" fillOpacity="0.2" />
          <text x="230" y="148" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800">Test Error</text>
          <text x="230" y="175" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">High (fails to generalise)</text>

          {/* Gap bracket */}
          <g opacity="0.6">
            <line x1="182" y1="60" x2="182" y2="125" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3,2" />
            <line x1="178" y1="60" x2="186" y2="60" stroke="var(--text-muted)" strokeWidth="1.5" />
            <line x1="178" y1="125" x2="186" y2="125" stroke="var(--text-muted)" strokeWidth="1.5" />
            <path d="M 186 92 L 205 92" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#ovArr)" />
            <text x="220" y="89" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontWeight="800">Gap</text>
          </g>

          {/* Simplicity arrow */}
          <rect x="60" y="195" width="380" height="32" rx="6" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" opacity="0.6" />
          <line x1="80" y1="211" x2="420" y2="211" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#ovArr)" opacity="0.6" />
          <text x="140" y="215" textAnchor="middle" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui" fontWeight="800">Simple</text>
          <text x="360" y="215" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontWeight="800">Complex</text>
          <text x="250" y="207" textAnchor="middle" fill="var(--text-muted)" fontSize="5" fontFamily="system-ui">Model Complexity →</text>

          <text x="250" y="250" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            Simpler models generalise better than complex ones
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Loss Functions — Quantifying Error ═════════════════════════════════

export function LossFunctionsSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Loss Functions: how wrong is the prediction?' :
         scene === 1 ? 'Loss Functions: loss quantifies the mistake' :
         scene === 2 ? 'Loss Functions: L₁ (absolute) vs L₂ (squared) loss' :
         'Loss Functions: training means minimizing the loss'}
      </text>

      <defs>
        <marker id="lfArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--text-secondary)" />
        </marker>
      </defs>

      {/* Scene 0: Target with prediction errors */}
      {scene === 0 && (
        <g>
          {/* Bullseye target */}
          <circle cx="180" cy="120" r="70" fill="none" stroke="var(--border-light)" strokeWidth="1" opacity="0.3" />
          <circle cx="180" cy="120" r="50" fill="none" stroke="var(--border-light)" strokeWidth="1" opacity="0.3" />
          <circle cx="180" cy="120" r="30" fill="none" stroke="var(--border-light)" strokeWidth="1" opacity="0.3" />
          <circle cx="180" cy="120" r="14" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="180" y="124" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">T</text>

          {/* Prediction points scattered */}
          {[
            { x: 120, y: 80, dx: -60, dy: -40 },
            { x: 140, y: 160, dx: -40, dy: 40 },
            { x: 250, y: 90, dx: 70, dy: -30 },
            { x: 230, y: 150, dx: 50, dy: 30 },
            { x: 100, y: 130, dx: -80, dy: 10 },
          ].map((p, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.12}s both` }}>
              <circle cx={p.x} cy={p.y} r="6"
                fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
              <line x1={p.x} y1={p.y} x2={180} y2={120}
                stroke="var(--text-secondary)" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
            </g>
          ))}

          <text x="330" y="90" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic"
            style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            Predictions can be off by
          </text>
          <text x="330" y="105" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic"
            style={{ animation: 'tof-up 0.3s 0.6s both' }}>
            different amounts
          </text>

          <text x="250" y="210" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.6s both' }}>
            Loss = distance between prediction (P) and target (T)
          </text>
        </g>
      )}

      {/* Scene 1: Small vs large error comparison */}
      {scene === 1 && (
        <g>
          {/* Small error */}
          <rect x="40" y="45" width="190" height="130" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="135" y="62" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Small Error</text>
          <rect x="65" y="80" width="50" height="70" rx="4" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="90" y="119" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">P</text>
          <rect x="155" y="75" width="50" height="75" rx="4" fill="var(--text-secondary)" fillOpacity="0.15" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="180" y="117" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">T</text>
          <line x1="115" y1="78" x2="155" y2="73" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#lfArr)" />
          <text x="135" y="68" textAnchor="middle" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui">5 off</text>

          <text x="250" y="115" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="system-ui" fontWeight="800">vs</text>

          {/* Large error */}
          <rect x="270" y="45" width="190" height="130" rx="8" fill="var(--bg-surface)" stroke="var(--text-main)" strokeWidth="2" />
          <text x="365" y="62" textAnchor="middle" fill="var(--text-main)" fontSize="7" fontFamily="system-ui" fontWeight="800">Large Error</text>
          <rect x="290" y="55" width="50" height="95" rx="4" fill="var(--text-main)" fillOpacity="0.2" stroke="var(--text-main)" strokeWidth="2" />
          <text x="315" y="107" textAnchor="middle" fill="var(--text-main)" fontSize="9" fontFamily="system-ui" fontWeight="800">P</text>
          <rect x="380" y="75" width="50" height="75" rx="4" fill="var(--text-secondary)" fillOpacity="0.15" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="405" y="117" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">T</text>
          <line x1="340" y1="53" x2="378" y2="73" stroke="var(--text-main)" strokeWidth="2.5" markerEnd="url(#lfArr)" />
          <text x="365" y="48" textAnchor="middle" fill="var(--text-main)" fontSize="6" fontFamily="system-ui">45 off</text>

          <text x="250" y="210" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            Bigger mistake → bigger loss
          </text>
        </g>
      )}

      {/* Scene 2: L1 vs L2 loss curves */}
      {scene === 2 && (
        <g>
          {/* L1 Loss */}
          <rect x="25" y="40" width="210" height="140" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.7" />
          <text x="130" y="58" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">L₁ Loss (Absolute)</text>
          <text x="130" y="70" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">|y − ŷ|</text>

          {/* V-shaped curve */}
          <line x1="50" y1="105" x2="130" y2="50" stroke="var(--color-primary)" strokeWidth="2.5" />
          <line x1="130" y1="50" x2="210" y2="105" stroke="var(--color-primary)" strokeWidth="2.5" />
          <circle cx="130" cy="50" r="4" fill="var(--color-primary)" />
          <text x="55" y="100" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">|error|</text>
          <text x="215" y="170" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">error →</text>

          {/* Axes */}
          <line x1="45" y1="165" x2="240" y2="165" stroke="var(--border-light)" strokeWidth="1" />
          <line x1="45" y1="45" x2="45" y2="165" stroke="var(--border-light)" strokeWidth="1" />

          <text x="130" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">Linear penalty for error</text>

          {/* L2 Loss */}
          <rect x="265" y="40" width="210" height="140" rx="8" fill="var(--bg-surface)" stroke="var(--text-main)" strokeWidth="1.5" opacity="0.7" />
          <text x="370" y="58" textAnchor="middle" fill="var(--text-main)" fontSize="7" fontFamily="system-ui" fontWeight="800">L₂ Loss (Squared)</text>
          <text x="370" y="70" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">(y − ŷ)²</text>

          {/* Parabola curve */}
          <path d="M 285 165 Q 300 125 330 80 Q 360 45 370 42 Q 380 45 410 80 Q 440 125 455 165"
            fill="none" stroke="var(--text-main)" strokeWidth="2.5" />
          <circle cx="370" cy="42" r="4" fill="var(--text-main)" />
          <text x="295" y="100" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">error²</text>
          <text x="455" y="170" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">error →</text>

          {/* Axes */}
          <line x1="285" y1="165" x2="480" y2="165" stroke="var(--border-light)" strokeWidth="1" />
          <line x1="285" y1="40" x2="285" y2="165" stroke="var(--border-light)" strokeWidth="1" />

          <text x="370" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">Penalizes large errors heavily</text>

          <text x="250" y="230" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            L₁ treats all errors equally; L₂ amplifies big mistakes
          </text>
        </g>
      )}

      {/* Scene 3: Minimizing loss = training */}
      {scene === 3 && (
        <g>
          {/* Loss landscape — descending curve */}
          <path d="M 30 160 Q 100 140 160 110 Q 220 80 280 75 Q 340 70 400 55 Q 440 48 470 45"
            fill="none" stroke="var(--color-primary)" strokeWidth="3" opacity="0.5" />
          <path d="M 30 160 Q 100 140 160 110 Q 220 80 280 75 Q 340 70 400 55 Q 440 48 470 45 L 470 170 L 30 170 Z"
            fill="var(--color-primary)" fillOpacity="0.06" />

          {/* Arrow showing descent direction */}
          <g>
            <line x1="100" y1="150" x2="160" y2="120" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#lfArr)" opacity="0.6" />
            <line x1="200" y1="100" x2="260" y2="85" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#lfArr)" opacity="0.6" />
            <line x1="300" y1="80" x2="360" y2="65" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#lfArr)" opacity="0.6" />
          </g>

          {/* Dots along the descent */}
          {[
            { x: 55, y: 150, label: 'Start' },
            { x: 130, y: 125, label: '' },
            { x: 220, y: 88, label: '' },
            { x: 320, y: 73, label: '' },
            { x: 440, y: 48, label: 'Min' },
          ].map((p, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.15}s both` }}>
              <circle cx={p.x} cy={p.y} r="7"
                fill={i === 0 ? 'var(--text-secondary)' : i === 4 ? 'var(--color-primary)' : 'var(--bg-surface)'}
                fillOpacity={i === 0 || i === 4 ? 0.3 : 1}
                stroke={i === 4 ? 'var(--color-primary)' : 'var(--text-secondary)'}
                strokeWidth={i === 4 ? 3 : 2} />
              {p.label && (
                <text x={p.x} y={p.y - 14} textAnchor="middle" fill={i === 4 ? 'var(--color-primary)' : 'var(--text-muted)'}
                  fontSize="7" fontFamily="system-ui" fontWeight="800">{p.label}</text>
              )}
            </g>
          ))}

          {/* Training process flow */}
          <rect x="100" y="195" width="300" height="32" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.6" />
          <text x="110" y="206" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Predict</text>
          <text x="190" y="206" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">→</text>
          <text x="215" y="206" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Compare</text>
          <text x="305" y="206" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">→</text>
          <text x="330" y="206" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Update</text>

          <text x="250" y="250" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.6s both' }}>
            Training iteratively reduces the loss
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Perceptron Learning — Threshold Logic Unit ═════════════════════════

export function PerceptronLearningSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Perceptron Learning: weighted sum of inputs' :
         scene === 1 ? 'Perceptron Learning: if sum exceeds threshold, fire' :
         scene === 2 ? 'Perceptron Learning: the perceptron draws a line' :
         'Perceptron Learning: update weights on error'}
      </text>

      <defs>
        <marker id="plArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--text-secondary)" />
        </marker>
        <marker id="plArrHi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>

      {/* Scene 0: Inputs with weights → neuron */}
      {scene === 0 && (
        <g>
          {/* Input nodes */}
          {[
            { label: 'x₁', w: 'w₁', y: 60 },
            { label: 'x₂', w: 'w₂', y: 110 },
            { label: 'x₃', w: 'w₃', y: 160 },
          ].map((inp, i) => (
            <g key={i}>
              <circle cx={90} cy={inp.y} r="16"
                fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2.5" />
              <text x={90} y={inp.y + 4} textAnchor="middle" fill="var(--text-secondary)"
                fontSize="9" fontFamily="system-ui" fontWeight="800">{inp.label}</text>

              <line x1={106} y1={inp.y} x2={140} y2={110}
                stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.5" />
              <text x={115} y={inp.y + (110 - inp.y) / 2 - 5} fill="var(--color-primary)"
                fontSize="7" fontFamily="system-ui" fontWeight="800">{inp.w}</text>
            </g>
          ))}

          {/* Neuron */}
          <circle cx="170" cy="110" r="26"
            fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="3" />
          <text x="170" y="108" textAnchor="middle" fill="var(--color-primary)"
            fontSize="9" fontFamily="system-ui" fontWeight="800">Σ</text>
          <text x="170" y="120" textAnchor="middle" fill="var(--text-muted)"
            fontSize="6" fontFamily="system-ui">wᵢxᵢ</text>

          {/* Summation formula */}
          <rect x="230" y="75" width="240" height="70" rx="8" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" opacity="0.7" />
          <text x="350" y="97" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Σ = w₁x₁ + w₂x₂ + w₃x₃</text>
          <text x="350" y="120" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">Each input weighted by importance</text>

          <text x="250" y="225" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            Weighted sum determines the neuron's activation
          </text>
        </g>
      )}

      {/* Scene 1: Threshold activation */}
      {scene === 1 && (
        <g>
          {/* Inputs → Neuron (simplified) */}
          <circle cx={90} cy={60} r="14" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2.5" />
          <text x={90} y={64} textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">x</text>
          <line x1={104} y1={60} x2={140} y2={110} stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.4" />

          <circle cx={90} cy={160} r="14" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2.5" />
          <text x={90} y={164} textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">x</text>
          <line x1={104} y1={160} x2={140} y2={110} stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.4" />

          {/* Neuron with threshold */}
          <circle cx="170" cy="110" r="26"
            fill="var(--color-primary)" fillOpacity="0.12"
            stroke="var(--color-primary)" strokeWidth="3" />
          <text x="170" y="108" textAnchor="middle" fill="var(--color-primary)"
            fontSize="9" fontFamily="system-ui" fontWeight="800">Σ</text>
          <text x="170" y="120" textAnchor="middle" fill="var(--text-muted)"
            fontSize="6" fontFamily="system-ui">wᵢxᵢ</text>

          {/* Threshold comparator */}
          <rect x="230" y="60" width="240" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="350" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">If Σ &gt; θ : fire (output = 1)</text>
          <text x="350" y="102" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">If Σ ≤ θ : stay (output = 0)</text>
          <text x="350" y="124" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">θ = threshold</text>

          {/* Output */}
          <line x1={196} y1={110} x2={230} y2={110} stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#plArrHi)" opacity="0.6" />

          <text x="250" y="225" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.4s both' }}>
            Threshold activation: sum must be high enough to fire
          </text>
        </g>
      )}

      {/* Scene 2: Decision boundary */}
      {scene === 2 && (
        <g>
          {/* Axes */}
          <line x1="60" y1="180" x2="60" y2="40" stroke="var(--text-secondary)" strokeWidth="2" />
          <line x1="60" y1="180" x2="440" y2="180" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="55" y="35" textAnchor="end" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">x₂</text>
          <text x="445" y="184" textAnchor="start" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">x₁</text>

          {/* Data points */}
          {[
            { x: 100, y: 150, cls: 0 }, { x: 120, y: 130, cls: 0 },
            { x: 140, y: 160, cls: 0 }, { x: 150, y: 110, cls: 0 },
            { x: 170, y: 140, cls: 0 }, { x: 350, y: 60, cls: 1 },
            { x: 380, y: 80, cls: 1 }, { x: 400, y: 55, cls: 1 },
            { x: 330, y: 100, cls: 1 }, { x: 360, y: 110, cls: 1 },
            { x: 200, y: 120, cls: 0 }, { x: 300, y: 90, cls: 1 },
          ].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="7"
              fill={p.cls === 0 ? 'var(--color-primary)' : 'var(--text-main)'}
              fillOpacity="0.25"
              stroke={p.cls === 0 ? 'var(--color-primary)' : 'var(--text-main)'}
              strokeWidth="2.5" />
          ))}

          {/* Decision boundary line */}
          <line x1="80" y1="170" x2="400" y2="40"
            stroke="var(--color-primary)" strokeWidth="3" opacity="0.7" />
          <text x="300" y="50" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Decision boundary</text>
          <text x="300" y="62" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui">w · x = 0</text>

          {/* Region labels */}
          <text x="90" y="90" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800" opacity="0.5">Class A</text>
          <text x="400" y="150" fill="var(--text-main)" fontSize="7" fontFamily="system-ui" fontWeight="800" opacity="0.5">Class B</text>

          <text x="250" y="225" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.4s both' }}>
            A linear decision boundary separates the two classes
          </text>
        </g>
      )}

      {/* Scene 3: Learning rule — weight update */}
      {scene === 3 && (
        <g>
          {/* Before / After panels */}
          <rect x="25" y="40" width="210" height="130" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" opacity="0.7" />
          <text x="130" y="58" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Before Update</text>

          {/* Wrong classification */}
          <circle cx="80" cy="100" r="8" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="2" />
          <circle cx="130" cy="80" r="8" fill="var(--text-main)" fillOpacity="0.2" stroke="var(--text-main)" strokeWidth="2" />
          <line x1="80" y1="130" x2="180" y2="70" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.4" />
          <circle cx="160" cy="120" r="8" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="180" y="140" fill="var(--text-main)" fontSize="6" fontFamily="system-ui" fontWeight="800">Misclassified</text>

          <rect x="265" y="40" width="210" height="130" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="370" y="58" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">After Update</text>

          <circle cx="320" cy="100" r="8" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="2" />
          <circle cx="370" cy="80" r="8" fill="var(--text-main)" fillOpacity="0.2" stroke="var(--text-main)" strokeWidth="2" />
          <line x1="320" y1="130" x2="420" y2="50" stroke="var(--color-primary)" strokeWidth="3" opacity="0.6" />
          <circle cx="400" cy="120" r="8" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="400" y="140" fill="var(--color-primary)" fontSize="6" fontFamily="system-ui" fontWeight="800">Corrected</text>

          <line x1="235" y1="100" x2="265" y2="100" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#plArrHi)" opacity="0.6" />

          {/* Formula */}
          <rect x="80" y="185" width="340" height="35" rx="6" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" opacity="0.6" />
          <text x="250" y="200" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            w_new = w_old + η × (target − prediction) × x
          </text>
          <text x="250" y="212" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">η = learning rate</text>

          <text x="250" y="250" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.4s both' }}>
            Weights adjust only when the prediction is wrong
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Support Vector Machines — Maximum Margin ═══════════════════════════

export function SupportVectorMachinesSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Support Vector Machines: separate the two classes' :
         scene === 1 ? 'Support Vector Machines: which line is best?' :
         scene === 2 ? 'Support Vector Machines: maximum margin is best' :
         'Support Vector Machines: kernel trick transforms the space'}
      </text>

      <defs>
        <filter id="svGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <marker id="svArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>

      {/* Scene 0: Two classes with a gap */}
      {scene === 0 && (
        <g>
          {/* Axes */}
          <line x1="45" y1="195" x2="460" y2="195" stroke="var(--border-light)" strokeWidth="1" />
          <line x1="45" y1="40" x2="45" y2="195" stroke="var(--border-light)" strokeWidth="1" />

          {/* Class A (circles) - left side */}
          {[
            { x: 80, y: 120 }, { x: 100, y: 80 }, { x: 70, y: 160 },
            { x: 120, y: 140 }, { x: 130, y: 90 }, { x: 150, y: 110 },
          ].map((p, i) => (
            <circle key={`a${i}`} cx={p.x} cy={p.y} r="8"
              fill="var(--color-primary)" fillOpacity="0.2"
              stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}

          {/* Class B (squares) - right side */}
          {[
            { x: 300, y: 100 }, { x: 330, y: 130 }, { x: 350, y: 80 },
            { x: 370, y: 150 }, { x: 390, y: 100 }, { x: 410, y: 70 },
          ].map((p, i) => (
            <g key={`b${i}`}>
              <rect x={p.x - 7} y={p.y - 7} width="14" height="14" rx="2"
                fill="var(--text-main)" fillOpacity="0.2"
                stroke="var(--text-main)" strokeWidth="2.5" />
            </g>
          ))}

          {/* Gap indicator */}
          <line x1="200" y1="45" x2="200" y2="195" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="5,4" opacity="0.4" />
          <text x="205" y="120" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">Gap exists</text>

          <text x="250" y="235" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            Two classes are linearly separable
          </text>
        </g>
      )}

      {/* Scene 1: Many possible dividing lines */}
      {scene === 1 && (
        <g>
          {/* Class A (circles) */}
          {[
            { x: 80, y: 120 }, { x: 100, y: 80 }, { x: 70, y: 160 },
            { x: 120, y: 140 }, { x: 130, y: 90 }, { x: 150, y: 110 },
          ].map((p, i) => (
            <circle key={`a${i}`} cx={p.x} cy={p.y} r="7"
              fill="var(--color-primary)" fillOpacity="0.15"
              stroke="var(--color-primary)" strokeWidth="2" />
          ))}

          {/* Class B (squares) */}
          {[
            { x: 300, y: 100 }, { x: 330, y: 130 }, { x: 350, y: 80 },
            { x: 370, y: 150 }, { x: 390, y: 100 }, { x: 410, y: 70 },
          ].map((p, i) => (
            <rect key={`b${i}`} x={p.x - 6} y={p.y - 6} width="12" height="12" rx="2"
              fill="var(--text-main)" fillOpacity="0.15"
              stroke="var(--text-main)" strokeWidth="2" />
          ))}

          {/* Multiple lines */}
          <line x1="60" y1="150" x2="430" y2="60" stroke="var(--text-secondary)" strokeWidth="2" opacity="0.3" strokeDasharray="4,3" />
          <line x1="60" y1="120" x2="440" y2="70" stroke="var(--text-secondary)" strokeWidth="2" opacity="0.3" strokeDasharray="4,3" />
          <line x1="80" y1="180" x2="420" y2="50" stroke="var(--text-secondary)" strokeWidth="2" opacity="0.3" strokeDasharray="4,3" />
          <line x1="70" y1="100" x2="440" y2="90" stroke="var(--text-secondary)" strokeWidth="2" opacity="0.3" strokeDasharray="4,3" />

          <text x="250" y="130" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-pop 0.3s 0.3s both' }}>
            Many possible lines separate them
          </text>

          <text x="250" y="235" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            Which one should we choose?
          </text>
        </g>
      )}

      {/* Scene 2: Maximum margin line */}
      {scene === 2 && (
        <g>
          {/* Class A */}
          {[
            { x: 80, y: 130 }, { x: 100, y: 90 }, { x: 70, y: 170 },
            { x: 120, y: 150 }, { x: 130, y: 100 }, { x: 150, y: 120 },
          ].map((p, i) => (
            <circle key={`a${i}`} cx={p.x} cy={p.y} r="7"
              fill="var(--color-primary)" fillOpacity="0.15"
              stroke="var(--color-primary)" strokeWidth="2" />
          ))}

          {/* Class B */}
          {[
            { x: 300, y: 100 }, { x: 330, y: 130 }, { x: 350, y: 80 },
            { x: 370, y: 150 }, { x: 390, y: 100 }, { x: 410, y: 70 },
          ].map((p, i) => (
            <rect key={`b${i}`} x={p.x - 6} y={p.y - 6} width="12" height="12" rx="2"
              fill="var(--text-main)" fillOpacity="0.15"
              stroke="var(--text-main)" strokeWidth="2" />
          ))}

          {/* Decision boundary */}
          <line x1="60" y1="160" x2="440" y2="55" stroke="var(--color-primary)" strokeWidth="3" />

          {/* Margin boundaries */}
          <line x1="60" y1="185" x2="440" y2="80" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
          <line x1="60" y1="135" x2="440" y2="30" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />

          {/* Margin arrow */}
          <line x1="220" y1="175" x2="220" y2="145" stroke="var(--color-primary)" strokeWidth="2.5" markerEnd="url(#svArr)" opacity="0.6" />
          <text x="228" y="164" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Margin</text>

          {/* Support vectors - circled */}
          {[
            { x: 150, y: 120 }, { x: 130, y: 150 }, { x: 300, y: 100 }, { x: 330, y: 80 },
          ].map((p, i) => (
            <g key={`sv${i}`}>
              <circle cx={p.x} cy={p.y} r="12"
                fill="none" stroke="var(--color-primary)" strokeWidth="2.5"
                strokeDasharray="3,2" opacity="0.7"
                style={{ animation: 'tof-pulse-ring 2s ease-out infinite' }} />
            </g>
          ))}

          <text x="250" y="40" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-pop 0.3s 0.2s both' }}>
            Maximum Margin Hyperplane
          </text>
          <text x="250" y="52" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui"
            style={{ animation: 'tof-pop 0.3s 0.4s both' }}>
            Support vectors define the margin
          </text>

          <text x="250" y="240" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.6s both' }}>
            Maximise the margin between classes
          </text>
        </g>
      )}

      {/* Scene 3: Kernel trick */}
      {scene === 3 && (
        <g>
          {/* Non-linearly separable data */}
          <text x="120" y="50" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Original Space</text>

          {/* Circle of points forming a non-linear pattern */}
          {(() => {
            const r1 = 45, cx = 120, cy = 125;
            const pts: { x: number; y: number; cls: number }[] = [];
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2;
              pts.push({ x: cx + Math.cos(a) * r1, y: cy + Math.sin(a) * r1, cls: 0 });
            }
            const r2 = 20;
            for (let i = 0; i < 6; i++) {
              const a = (i / 6) * Math.PI * 2;
              pts.push({ x: cx + Math.cos(a) * r2, y: cy + Math.sin(a) * r2, cls: 1 });
            }
            return pts.map((p, i) => (
              p.cls === 0
                ? <circle key={i} cx={p.x} cy={p.y} r="5"
                    fill="var(--color-primary)" fillOpacity="0.2"
                    stroke="var(--color-primary)" strokeWidth="2" />
                : <rect key={i} x={p.x - 4} y={p.y - 4} width="8" height="8" rx="1"
                    fill="var(--text-main)" fillOpacity="0.2"
                    stroke="var(--text-main)" strokeWidth="2" />
            ));
          })()}

          {/* Arrow */}
          <text x="250" y="125" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-pop 0.3s 0.3s both' }}>
            →
          </text>
          <text x="250" y="142" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui"
            style={{ animation: 'tof-pop 0.3s 0.4s both' }}>
            Kernel: φ(x)
          </text>

          {/* Transformed space — linearly separable */}
          <text x="385" y="50" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Transformed Space</text>

          {/* 3D-like projection with line */}
          <g transform="translate(385, 115)">
            {/* Points projected upward */}
            {(() => {
              const r1 = 30;
              const pts: { x: number; y: number; cls: number }[] = [];
              for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                pts.push({ x: Math.cos(a) * r1, y: Math.sin(a) * r1, cls: 0 });
              }
              const r2 = 14;
              for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                pts.push({ x: Math.cos(a) * r2, y: Math.sin(a) * r2, cls: 1 });
              }
              return pts.map((p, i) => {
                const elevated = p.cls === 0 ? 8 : -8;
                return p.cls === 0
                  ? <circle key={i} cx={p.x} cy={p.y + elevated} r="4"
                      fill="var(--color-primary)" fillOpacity="0.25"
                      stroke="var(--color-primary)" strokeWidth="2" />
                  : <rect key={i} x={p.x - 3} y={p.y + elevated - 3} width="6" height="6" rx="1"
                      fill="var(--text-main)" fillOpacity="0.25"
                      stroke="var(--text-main)" strokeWidth="2" />;
              });
            })()}

            {/* Separation plane in transformed space */}
            <line x1="-50" y1="-2" x2="50" y2="-2" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.6" />
            <text x="0" y="-10" textAnchor="middle" fill="var(--color-primary)" fontSize="5" fontFamily="system-ui" fontWeight="800">Now separable!</text>
          </g>

          <text x="250" y="230" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            Kernel maps data to a higher dimension where separation is linear
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Unsupervised Learning — Clustering ══════════════════════════════════

export function UnsupervisedLearningSVG({ scene }: { scene: number }) {
  const allPts = [
    { x: 80, y: 140 }, { x: 90, y: 100 }, { x: 70, y: 120 },
    { x: 100, y: 80 }, { x: 85, y: 160 }, { x: 110, y: 130 },
    { x: 300, y: 100 }, { x: 330, y: 80 }, { x: 310, y: 130 },
    { x: 350, y: 110 }, { x: 290, y: 90 }, { x: 340, y: 140 },
    { x: 180, y: 50 }, { x: 160, y: 70 }, { x: 195, y: 60 },
    { x: 240, y: 150 }, { x: 260, y: 140 }, { x: 230, y: 165 },
    { x: 410, y: 150 }, { x: 430, y: 130 }, { x: 440, y: 170 },
    { x: 380, y: 60 }, { x: 400, y: 50 }, { x: 420, y: 70 },
  ];

  const clusterA = [0, 1, 2, 3, 4, 5];
  const clusterB = [6, 7, 8, 9, 10, 11];
  const clusterC = [12, 13, 14];
  const clusterD = [15, 16, 17];


  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Unsupervised Learning: raw data with no labels' :
         scene === 1 ? 'Unsupervised Learning: find hidden structure' :
         scene === 2 ? 'Unsupervised Learning: K-Means groups by similarity' :
         'Unsupervised Learning: patterns emerge without a teacher'}
      </text>

      {/* Scene 0: Unlabeled scattered points */}
      {scene === 0 && (
        <g>
          {allPts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="6"
              fill="var(--bg-surface)"
              stroke="var(--text-muted)" strokeWidth="2"
              opacity="0.6"
              style={{ animation: `tof-pop 0.2s ${i * 0.04}s both` }} />
          ))}

          <text x="250" y="205" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic"
            style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            No labels — just points in space
          </text>

          <text x="250" y="240" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.7s both' }}>
            We don't know what each point represents
          </text>
        </g>
      )}

      {/* Scene 1: Points start to show natural grouping */}
      {scene === 1 && (
        <g>
          {allPts.map((p, i) => {
            let cls: number;
            if (clusterA.includes(i) || clusterC.includes(i)) cls = 0;
            else if (clusterB.includes(i) || clusterD.includes(i)) cls = 1;
            else cls = 2;

            const colors = ['var(--color-primary)', 'var(--text-main)', 'var(--text-secondary)'];
            return (
              <circle key={i} cx={p.x} cy={p.y} r="6"
                fill={colors[cls]} fillOpacity="0.15"
                stroke={colors[cls]} strokeWidth="2"
                style={{ transition: 'all 300ms' }} />
            );
          })}

          {/* Group hints — dashed ellipses */}
          <ellipse cx="100" cy="120" rx="55" ry="55" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4,3" opacity="0.4" />
          <ellipse cx="320" cy="110" rx="55" ry="50" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeDasharray="4,3" opacity="0.4" />
          <ellipse cx="410" cy="150" rx="45" ry="40" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeDasharray="4,3" opacity="0.4" />

          <text x="250" y="210" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            Groups naturally emerge from the data
          </text>

          <text x="250" y="242" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">
            Similar points tend to cluster together
          </text>
        </g>
      )}

      {/* Scene 2: K-Means process */}
      {scene === 2 && (
        <g>
          {/* Centers */}
          {[
            { x: 100, y: 115, label: 'C₁', cls: 0 },
            { x: 320, y: 105, label: 'C₂', cls: 1 },
            { x: 415, y: 145, label: 'C₃', cls: 2 },
          ].map((c, ci) => {
            const colors = ['var(--color-primary)', 'var(--text-main)', 'var(--text-secondary)'];
            return (
              <g key={ci}>
                <circle cx={c.x} cy={c.y} r="14"
                  fill="var(--bg-surface)"
                  stroke={colors[ci]} strokeWidth="3"
                  style={{ animation: 'tof-pulse-ring 2s ease-out infinite' }} />
                <circle cx={c.x} cy={c.y} r="10"
                  fill={colors[ci]} fillOpacity="0.25"
                  stroke={colors[ci]} strokeWidth="2.5" />
                <text x={c.x} y={c.y + 4} textAnchor="middle" fill={colors[ci]}
                  fontSize="8" fontFamily="system-ui" fontWeight="800">{c.label}</text>
              </g>
            );
          })}

          {/* Points assigned to nearest center */}
          {allPts.map((p, i) => {
            let cls: number;
            if (clusterA.includes(i) || clusterC.includes(i)) cls = 0;
            else if (clusterB.includes(i) || clusterD.includes(i)) cls = 1;
            else cls = 2;

            let center: { x: number; y: number };
            if (cls === 0) center = { x: 100, y: 115 };
            else if (cls === 1) center = { x: 320, y: 105 };
            else center = { x: 415, y: 145 };

            const colors = ['var(--color-primary)', 'var(--text-main)', 'var(--text-secondary)'];
            return (
              <g key={i}>
                <line x1={p.x} y1={p.y} x2={center.x} y2={center.y}
                  stroke={colors[cls]} strokeWidth="1.5" strokeDasharray="2,2" opacity="0.3" />
                <circle cx={p.x} cy={p.y} r="6"
                  fill={colors[cls]} fillOpacity="0.2"
                  stroke={colors[cls]} strokeWidth="2" />
              </g>
            );
          })}

          <text x="250" y="210" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            K-Means: assign each point to nearest center
          </text>

          <text x="250" y="242" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">
            Centers shift until convergence
          </text>
        </g>
      )}

      {/* Scene 3: Two distinct clusters found */}
      {scene === 3 && (
        <g>
          {/* Clear clusters with colors */}
          {(() => {
            const groups = [
              { indices: [0, 1, 2, 3, 4, 5, 12, 13, 14], color: 'var(--color-primary)', label: 'Cluster A' },
              { indices: [6, 7, 8, 9, 10, 11, 15, 16, 17], color: 'var(--text-main)', label: 'Cluster B' },
              { indices: [18, 19, 20, 21, 22, 23], color: 'var(--text-secondary)', label: 'Cluster C' },
            ];
            return groups.map(g => (
              <g key={g.label}>
                {g.indices.map(i => (
                  <circle key={i} cx={allPts[i].x} cy={allPts[i].y} r="7"
                    fill={g.color} fillOpacity="0.25"
                    stroke={g.color} strokeWidth="2.5" />
                ))}
              </g>
            ));
          })()}

          {/* Cluster labels */}
          <text x="95" y="45" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-pop 0.3s 0.2s both' }}>Cluster A</text>
          <text x="310" y="55" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-pop 0.3s 0.35s both' }}>Cluster B</text>
          <text x="410" y="185" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-pop 0.3s 0.5s both' }}>Cluster C</text>

          {/* Two remaining points */}
          <circle cx="180" cy="50" r="7" fill="var(--color-primary)" fillOpacity="0.25" stroke="var(--color-primary)" strokeWidth="2.5" />
          <circle cx="240" cy="150" r="7" fill="var(--text-main)" fillOpacity="0.25" stroke="var(--text-main)" strokeWidth="2.5" />

          <text x="250" y="230" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.6s both' }}>
            Structure discovered without any labels
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Reinforcement Learning — Agent & Environment ═══════════════════════

export function ReinforcementLearningSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Reinforcement Learning: agent interacts with a world' :
         scene === 1 ? 'Reinforcement Learning: actions lead to rewards' :
         scene === 2 ? 'Reinforcement Learning: try new things or use what works' :
         'Reinforcement Learning: learn from trial and error'}
      </text>

      <defs>
        <marker id="rlArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--text-secondary)" />
        </marker>
        <marker id="rlArrHi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>

      {/* Scene 0: Agent and Environment */}
      {scene === 0 && (
        <g>
          <rect x="50" y="55" width="170" height="130" rx="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.8" />
          <text x="135" y="85" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Agent</text>
          <line x1="70" y1="93" x2="200" y2="93" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="135" y="115" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Decision-maker</text>
          <text x="135" y="135" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Chooses actions</text>
          <text x="135" y="155" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Learns from feedback</text>

          <rect x="280" y="55" width="170" height="130" rx="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.8" />
          <text x="365" y="85" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Environment</text>
          <line x1="300" y1="93" x2="430" y2="93" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="365" y="115" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">The outside world</text>
          <text x="365" y="135" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Responds to actions</text>
          <text x="365" y="155" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Gives rewards</text>

          <text x="250" y="210" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            The agent acts, the environment responds
          </text>

          <text x="250" y="242" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">
            No teacher — learn from interaction
          </text>
        </g>
      )}

      {/* Scene 1: Action → Reward */}
      {scene === 1 && (
        <g>
          <rect x="50" y="65" width="150" height="110" rx="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="125" y="95" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Agent</text>
          <line x1="65" y1="103" x2="185" y2="103" stroke="var(--border-light)" strokeWidth="0.8" />

          <rect x="300" y="65" width="150" height="110" rx="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2.5" />
          <text x="375" y="95" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Environment</text>
          <line x1="315" y1="103" x2="435" y2="103" stroke="var(--border-light)" strokeWidth="0.8" />

          {/* Action arrow */}
          <line x1="200" y1="95" x2="290" y2="95" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#rlArrHi)" opacity="0.8" />
          <rect x="220" y="78" width="55" height="18" rx="4" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="247" y="91" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Action A</text>

          {/* Reward arrow */}
          <line x1="290" y1="135" x2="200" y2="135" stroke="var(--text-main)" strokeWidth="3" markerEnd="url(#rlArr)" opacity="0.8" />
          <rect x="218" y="138" width="60" height="18" rx="4" fill="var(--bg-surface)" stroke="var(--text-main)" strokeWidth="1.5" />
          <text x="248" y="151" textAnchor="middle" fill="var(--text-main)" fontSize="7" fontFamily="system-ui" fontWeight="800">Reward R</text>

          <text x="250" y="210" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            Agent takes action → Environment gives reward
          </text>

          <text x="250" y="242" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">
            Reward tells the agent how good the action was
          </text>
        </g>
      )}

      {/* Scene 2: Explore vs Exploit */}
      {scene === 2 && (
        <g>
          <text x="250" y="48" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Explore vs Exploit Tradeoff</text>

          {/* Branching diagram */}
          <circle cx="250" cy="80" r="16"
            fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="84" textAnchor="middle" fill="var(--color-primary)"
            fontSize="8" fontFamily="system-ui" fontWeight="800">Agent</text>

          {/* Explore branch */}
          <line x1="250" y1="96" x2="110" y2="140" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#rlArrHi)" opacity="0.6" />
          <rect x="40" y="140" width="140" height="60" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="110" y="162" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Explore</text>
          <text x="110" y="180" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">Try something new</text>
          <text x="110" y="192" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">Discover better rewards</text>

          {/* Exploit branch */}
          <line x1="250" y1="96" x2="390" y2="140" stroke="var(--text-secondary)" strokeWidth="3" markerEnd="url(#rlArr)" opacity="0.6" />
          <rect x="320" y="140" width="140" height="60" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="390" y="162" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Exploit</text>
          <text x="390" y="180" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">Use what works</text>
          <text x="390" y="192" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">Maximise known rewards</text>

          <text x="250" y="230" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            Explore to discover, exploit to maximise
          </text>
        </g>
      )}

      {/* Scene 3: RL Loop */}
      {scene === 3 && (
        <g>
          <text x="250" y="45" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">The Reinforcement Learning Loop</text>

          {/* Agent */}
          <rect x="35" y="70" width="180" height="110" rx="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="125" y="100" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Agent</text>
          <line x1="55" y1="108" x2="195" y2="108" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="125" y="128" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Policy π(s) → a</text>
          <text x="125" y="148" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">State s</text>

          {/* Environment */}
          <rect x="285" y="70" width="180" height="110" rx="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2.5" />
          <text x="375" y="100" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Environment</text>
          <line x1="305" y1="108" x2="445" y2="108" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="375" y="128" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Next state s'</text>
          <text x="375" y="148" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Reward r</text>

          {/* Action arrow */}
          <line x1="215" y1="85" x2="280" y2="85" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#rlArrHi)" opacity="0.8" />
          <text x="247" y="78" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">a</text>

          {/* Reward arrow */}
          <path d="M 285 165 Q 250 195 215 165" fill="none" stroke="var(--text-main)" strokeWidth="2.5" markerEnd="url(#rlArr)" opacity="0.7" />
          <text x="235" y="192" textAnchor="middle" fill="var(--text-main)" fontSize="7" fontFamily="system-ui" fontWeight="800">r</text>

          {/* Next state arrow */}
          <path d="M 285 155 Q 250 180 215 155" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" markerEnd="url(#rlArr)" opacity="0.5" strokeDasharray="4,3" />
          <text x="265" y="178" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui">s'</text>

          {/* State arrow */}
          <line x1="215" y1="125" x2="280" y2="125" stroke="var(--text-secondary)" strokeWidth="2.5" markerEnd="url(#rlArr)" opacity="0.5" />
          <text x="235" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui">s</text>

          <text x="250" y="232" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s 0.3s both' }}>
            State → Action → Reward → Next State (repeat)
          </text>

          <text x="250" y="250" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">
            The agent learns from each interaction cycle
          </text>
        </g>
      )}
    </svg>
  );
}
