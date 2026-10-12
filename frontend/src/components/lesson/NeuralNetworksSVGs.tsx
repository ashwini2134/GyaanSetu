// ── Neurons & Network Architecture ═════════════════════════════════════

export function NeuronsArchitectureSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <marker id="naArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
        <marker id="naDim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--text-secondary)" />
        </marker>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Neurons & Architecture: a neuron computes weighted sum + activation' :
         scene === 1 ? 'Neurons & Architecture: neurons stack into a layer' :
         scene === 2 ? 'Neurons & Architecture: layers build depth' :
         'Neurons & Architecture: information flows forward through the network'}
      </text>

      {/* ── Scene 0: Single Neuron ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="42" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            A neuron computes: output = activation( w.x + b )
          </text>

          <circle cx="55" cy="80" r="14" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="55" y="84" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">x1</text>

          <circle cx="55" cy="125" r="14" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="55" y="129" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">x2</text>

          <circle cx="55" cy="170" r="14" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="55" y="174" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">x3</text>

          <text x="55" y="55" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Inputs</text>

          <line x1="69" y1="80" x2="200" y2="105" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.35" />
          <text x="120" y="88" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">w1</text>

          <line x1="69" y1="125" x2="200" y2="125" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.35" />
          <text x="120" y="131" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">w2</text>

          <line x1="69" y1="170" x2="200" y2="145" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.35" />
          <text x="120" y="180" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">w3</text>

          <line x1="200" y1="190" x2="200" y2="155" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.35" />
          <text x="185" y="202" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">b (bias)</text>

          <circle cx="210" cy="125" r="36" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="3" />
          <text x="210" y="114" textAnchor="middle" fill="var(--color-primary)" fontSize="16" fontFamily="system-ui" fontWeight="800">&#x3a3;</text>
          <line x1="182" y1="125" x2="238" y2="125" stroke="var(--border-light)" strokeWidth="1" />
          <text x="210" y="144" textAnchor="middle" fill="var(--color-primary)" fontSize="12" fontFamily="system-ui" fontWeight="800">&#x3c3;</text>

          <line x1="246" y1="125" x2="350" y2="125" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#naArr)" />

          <rect x="370" y="108" width="80" height="34" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="410" y="129" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">output</text>

          <text x="250" y="235" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Inputs are weighted, summed with bias, then passed through an activation function
          </text>
        </g>
      )}

      {/* ── Scene 1: Three Neurons in a Layer ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="42" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Three neurons side by side — each sees every input with different weights
          </text>

          <circle cx="60" cy="75" r="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="60" y="79" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">x1</text>

          <circle cx="60" cy="120" r="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="60" y="124" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">x2</text>

          <circle cx="60" cy="165" r="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="60" y="169" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">x3</text>

          {[0, 1, 2].map(i => {
            const ys = [60, 120, 165];
            return [75, 120, 165].map(yj => (
              <line key={`c-${i}-${yj}`} x1="72" y1={ys[i]} x2={220 - 10} y2={yj}
                stroke="var(--text-secondary)" strokeWidth="2" opacity="0.2"
                style={{ transition: 'all 300ms' }} />
            ));
          })}

          <rect x="170" y="50" width="120" height="145" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="230" y="46" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Hidden Layer</text>

          {[75, 120, 165].map((y, i) => (
            <g key={`n-${i}`}>
              <circle cx="230" cy={y} r="20" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5"
                style={{ transition: 'all 300ms' }} />
              <text x="230" y={y + 1} textAnchor="middle" fill="var(--color-primary)" fontSize="12" fontFamily="system-ui" fontWeight="800">&#x3c3;</text>
            </g>
          ))}

          {[75, 120, 165].map(y => (
            <line key={`o-${y}`} x1="250" y1={y} x2="380" y2={y}
              stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" markerEnd="url(#naArr)" />
          ))}

          {[75 + 12, 120 + 12, 165 + 12].map((y, i) => (
            <text key={`ol-${i}`} x="395" y={y} fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">y{i + 1}</text>
          ))}

          <text x="250" y="235" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            A layer is a group of neurons that all receive the same inputs in parallel
          </text>
        </g>
      )}

      {/* ── Scene 2: Three Layers ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="42" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Input layer receives data, hidden layer transforms it, output layer produces answer
          </text>

          {[70, 105, 140].map((y, i) => (
            <g key={`il-${i}`}>
              <circle cx="70" cy={y} r="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
              <text x="70" y={y + 4} textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">x{i + 1}</text>
            </g>
          ))}
          <text x="70" y="40" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Input</text>

          {[60, 90, 120, 150].map((y, i) => (
            <circle key={`hl-${i}`} cx="250" cy={y} r="14" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}
          <text x="250" y="40" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Hidden</text>

          {[90, 140].map((y, i) => (
            <g key={`ol-${i}`}>
              <circle cx="430" cy={y} r="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
              <text x="430" y={y + 4} textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">y{i + 1}</text>
            </g>
          ))}
          <text x="430" y="40" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Output</text>

          {[70, 105, 140].map(yIn =>
            [60, 90, 120, 150].map(yHid => (
              <line key={`ih-${yIn}-${yHid}`} x1="82" y1={yIn} x2="236" y2={yHid}
                stroke="var(--text-secondary)" strokeWidth="1.5" opacity="0.15" />
            ))
          )}

          {[60, 90, 120, 150].map(yHid =>
            [90, 140].map(yOut => (
              <line key={`ho-${yHid}-${yOut}`} x1="264" y1={yHid} x2="418" y2={yOut}
                stroke="var(--text-secondary)" strokeWidth="1.5" opacity="0.15" />
            ))
          )}

          <text x="250" y="235" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Stacking layers creates depth — the hidden layer learns increasingly abstract features
          </text>
        </g>
      )}

      {/* ── Scene 3: Forward Pass ── */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {[70, 105, 140].map((y, i) => (
            <circle key={`il-${i}`} cx="70" cy={y} r="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          ))}
          <text x="70" y="40" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Input</text>

          {[60, 90, 120, 150].map((y, i) => (
            <circle key={`hl-${i}`} cx="250" cy={y} r="14" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}
          <text x="250" y="40" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Hidden</text>

          {[90, 140].map((y, i) => (
            <circle key={`ol-${i}`} cx="430" cy={y} r="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}
          <text x="430" y="40" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Output</text>

          {[70, 105, 140].map(yIn =>
            [60, 90, 120, 150].map(yHid => {
              const delay = ((yIn - 70) / 35 + (yHid - 60) / 30) * 0.08;
              return (
                <line key={`ih-${yIn}-${yHid}`} x1="82" y1={yIn} x2="236" y2={yHid}
                  stroke="var(--color-primary)" strokeWidth="2" opacity="0.35"
                  style={{ animation: `tof-flow 0.4s ${delay}s both`, transition: 'all 300ms' }} />
              );
            })
          )}

          {[60, 90, 120, 150].map(yHid =>
            [90, 140].map(yOut => {
              const delay = 0.5 + ((yHid - 60) / 30 + (yOut - 90) / 50) * 0.08;
              return (
                <line key={`ho-${yHid}-${yOut}`} x1="264" y1={yHid} x2="418" y2={yOut}
                  stroke="var(--color-primary)" strokeWidth="2" opacity="0.35"
                  style={{ animation: `tof-flow 0.4s ${delay}s both`, transition: 'all 300ms' }} />
              );
            })
          )}

          <rect x="140" y="185" width="220" height="28" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5"
            style={{ animation: 'tof-pop 0.3s 0.8s both' }} />
          <text x="250" y="203" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">
            Data flows: Input &#x2192; Hidden &#x2192; Output
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Activation Functions & Forward Pass ═══════════════════════════════

export function ActivationFunctionsSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <marker id="afArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Activation & Forward Pass: activation = decision to fire or not' :
         scene === 1 ? 'Activation & Forward Pass: ReLU passes positive, blocks negative' :
         scene === 2 ? 'Activation & Forward Pass: sigmoid squashes between 0 and 1' :
         'Activation & Forward Pass: softmax picks a class'}
      </text>

      {/* ── Scene 0: Neuron with Activation ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="50" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Inside the neuron: weighted sum enters, activation decides what passes through
          </text>

          <rect x="60" y="75" width="100" height="50" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="110" y="95" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Weighted Sum</text>
          <text x="110" y="112" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">z = w.x + b</text>

          <line x1="160" y1="100" x2="195" y2="100" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" markerEnd="url(#afArr)" />

          <circle cx="240" cy="100" r="32" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="3" />
          <text x="240" y="92" textAnchor="middle" fill="var(--color-primary)" fontSize="14" fontFamily="system-ui" fontWeight="800">Act</text>
          <text x="240" y="112" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Function</text>

          <line x1="272" y1="100" x2="330" y2="100" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#afArr)" />

          <rect x="345" y="80" width="100" height="40" rx="8" fill="var(--color-primary)" fillOpacity="0.12" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="395" y="100" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">output</text>
          <text x="395" y="115" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">a(z)</text>

          <circle cx="240" cy="170" r="16" fill="var(--color-primary)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="240" y="174" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">?</text>

          <text x="90" y="175" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Which function?</text>
          <text x="320" y="175" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Decides: fire or not</text>

          <text x="250" y="235" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Without activation, a neural network is just linear — activation adds non-linear power
          </text>
        </g>
      )}

      {/* ── Scene 1: ReLU ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="42" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Rectified Linear Unit: max(0, z) — most popular activation
          </text>

          <line x1="80" y1="180" x2="420" y2="180" stroke="var(--text-secondary)" strokeWidth="2" />
          <line x1="250" y1="25" x2="250" y2="190" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="415" y="194" textAnchor="end" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">z</text>
          <text x="240" y="22" textAnchor="end" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">ReLU</text>

          <text x="255" y="194" textAnchor="start" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">0</text>
          <text x="420" y="194" textAnchor="end" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">z</text>

          <text x="100" y="85" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">max(0, z)</text>

          <polyline points="80,180 250,180 400,50"
            fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinejoin="round"
            style={{ transition: 'all 300ms' }} />

          <circle cx="250" cy="180" r="5" fill="var(--color-primary)" opacity="0.7" />

          <text x="100" y="215" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">z &lt; 0: output = 0 (off)</text>
          <text x="320" y="215" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui">z &gt; 0: output = z (on)</text>

          <text x="250" y="238" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            ReLU is simple, efficient, and avoids the vanishing gradient problem
          </text>
        </g>
      )}

      {/* ── Scene 2: Sigmoid ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="42" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Sigmoid: 1 / (1 + e^-z) — smooth S-curve between 0 and 1
          </text>

          <line x1="80" y1="180" x2="420" y2="180" stroke="var(--text-secondary)" strokeWidth="2" />
          <line x1="250" y1="25" x2="250" y2="195" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="415" y="194" textAnchor="end" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">z</text>
          <text x="240" y="22" textAnchor="end" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">&#x3c3;(z)</text>

          <line x1="80" y1="80" x2="420" y2="80" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="3,3" />
          <text x="75" y="83" textAnchor="end" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">1</text>

          <line x1="80" y1="180" x2="420" y2="180" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="3,3" />
          <text x="75" y="183" textAnchor="end" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">0</text>

          <path d="M 90 175 C 120 175 150 175 180 168 C 200 158 220 132 250 100 C 280 68 300 42 320 32 C 350 25 380 25 410 25"
            fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round"
            style={{ transition: 'all 300ms' }} />

          <text x="350" y="68" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">as z &#x2192; +&#x221e;, &#x3c3; &#x2192; 1</text>
          <text x="100" y="152" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">as z &#x2192; -&#x221e;, &#x3c3; &#x2192; 0</text>

          <text x="250" y="238" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Sigmoid squashes any real number into a probability between 0 and 1
          </text>
        </g>
      )}

      {/* ── Scene 3: Softmax ── */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="42" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Softmax converts raw scores into a probability distribution summing to 1
          </text>

          <rect x="40" y="65" width="120" height="130" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="100" y="85" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Raw Logits</text>
          <line x1="50" y1="92" x2="150" y2="92" stroke="var(--border-light)" strokeWidth="0.8" />

          {[
            { label: 'Cat', score: 2.0, y: 108, w: 80 },
            { label: 'Dog', score: 1.0, y: 140, w: 50 },
            { label: 'Bird', score: 0.1, y: 172, w: 30 },
          ].map(item => (
            <g key={item.label}>
              <rect x="55" y={item.y - 6} width={item.w} height="12" rx="3" fill="var(--color-primary)" fillOpacity="0.15" />
              <text x="58" y={item.y + 3} fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui" fontWeight="800">{item.label}</text>
              <text x={55 + item.w + 5} y={item.y + 3} fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">{item.score.toFixed(1)}</text>
            </g>
          ))}

          <line x1="160" y1="130" x2="195" y2="130" stroke="var(--color-primary)" strokeWidth="3" markerEnd="url(#afArr)"
            style={{ animation: 'tof-flow 0.4s both' }} />

          <rect x="210" y="65" width="170" height="130" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="295" y="85" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Softmax Probabilities</text>
          <line x1="220" y1="92" x2="370" y2="92" stroke="var(--border-light)" strokeWidth="0.8" />

          {[
            { label: 'Cat', prob: 0.66, y: 108, w: 100 },
            { label: 'Dog', prob: 0.24, y: 140, w: 65 },
            { label: 'Bird', prob: 0.10, y: 172, w: 35 },
          ].map(item => (
            <g key={item.label}>
              <rect x="220" y={item.y - 6} width={item.w} height="12" rx="3" fill="var(--color-primary)" fillOpacity="0.25" />
              <text x="224" y={item.y + 3} fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">{item.label}</text>
              <text x={220 + item.w + 5} y={item.y + 3} fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">{item.prob.toFixed(2)}</text>
            </g>
          ))}

          <text x="295" y="210" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">
            Sum of probabilities = 1.00
          </text>

          <text x="250" y="238" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Softmax highlights the largest logit while keeping all options possible
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Training & Backpropagation ════════════════════════════════════════

export function TrainingBackpropagationSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <marker id="tbFwd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
        <marker id="tbBwd" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 10 0 L 0 5 L 10 10 Z" fill="var(--text-secondary)" />
        </marker>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Training & Backpropagation: forward pass predicts, then measures error' :
         scene === 1 ? 'Training & Backpropagation: loss = how wrong the prediction is' :
         scene === 2 ? 'Training & Backpropagation: backward pass computes gradients via chain rule' :
         'Training & Backpropagation: update step downhill, repeat'}
      </text>

      {/* ── Scene 0: Forward Pass ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="45" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Input passes through the network to produce a prediction
          </text>

          {[70, 105, 140].map((y, i) => (
            <circle key={`il-${i}`} cx="60" cy={y} r="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          ))}
          <text x="60" y="38" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Input</text>

          {[60, 90, 120, 150].map((y, i) => (
            <circle key={`hl-${i}`} cx="230" cy={y} r="14" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}
          <text x="230" y="38" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Hidden</text>

          {[90, 140].map((y, i) => (
            <circle key={`ol-${i}`} cx="400" cy={y} r="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}
          <text x="400" y="38" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Output</text>

          {[70, 105, 140].map(yIn =>
            [60, 90, 120, 150].map(yHid => (
              <line key={`ih-${yIn}-${yHid}`} x1="72" y1={yIn} x2="216" y2={yHid}
                stroke="var(--color-primary)" strokeWidth="2" opacity="0.25" markerEnd="url(#tbFwd)" />
            ))
          )}

          {[60, 90, 120, 150].map(yHid =>
            [90, 140].map(yOut => (
              <line key={`ho-${yHid}-${yOut}`} x1="244" y1={yHid} x2="388" y2={yOut}
                stroke="var(--color-primary)" strokeWidth="2" opacity="0.25" markerEnd="url(#tbFwd)" />
            ))
          )}

          <rect x="300" y="175" width="130" height="40" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2"
            style={{ animation: 'tof-pop 0.3s 0.4s both' }} />
          <text x="365" y="193" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Prediction</text>
          <text x="365" y="207" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">&#x0177;</text>

          <line x1="412" y1="140" x2="365" y2="175" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4"
            style={{ animation: 'tof-flow 0.4s 0.6s both' }} />

          <rect x="60" y="175" width="130" height="40" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2"
            style={{ animation: 'tof-pop 0.3s 0.2s both' }} />
          <text x="125" y="193" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">True Label</text>
          <text x="125" y="207" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">y</text>

          <line x1="125" y1="175" x2="365" y2="175" stroke="var(--text-muted)" strokeWidth="2.5" strokeDasharray="5,3"
            style={{ animation: 'tof-flow 0.4s 0.8s both' }} />

          <text x="250" y="238" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Forward pass: run input through all layers to get output, then compare to truth
          </text>
        </g>
      )}

      {/* ── Scene 1: Loss ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="45" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Loss quantifies the gap between prediction and true label
          </text>

          <rect x="80" y="60" width="340" height="70" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">Loss Function</text>
          <line x1="95" y1="90" x2="405" y2="90" stroke="var(--border-light)" strokeWidth="0.8" />

          <text x="250" y="109" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">L = ( y - y&#x302; )&#xb2;</text>
          <text x="250" y="124" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Mean Squared Error (regression) or Cross-Entropy (classification)</text>

          <g style={{ animation: 'tof-pop 0.3s 0.3s both' }}>
            <rect x="150" y="160" width="200" height="40" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
            <text x="250" y="178" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Large loss &#x2192; big mistake</text>
            <text x="250" y="192" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Small loss &#x2192; close to correct</text>
          </g>

          <text x="250" y="240" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            The loss function tells us how far off we are — the goal is to minimize it
          </text>
        </g>
      )}

      {/* ── Scene 2: Backward Pass ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="45" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Gradients flow backward from output to input using the chain rule
          </text>

          {[70, 105, 140].map((y, i) => (
            <circle key={`il-${i}`} cx="60" cy={y} r="12" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          ))}
          <text x="60" y="38" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">Input</text>

          {[60, 90, 120, 150].map((y, i) => (
            <circle key={`hl-${i}`} cx="230" cy={y} r="14" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}
          <text x="230" y="38" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Hidden</text>

          {[90, 140].map((y, i) => (
            <circle key={`ol-${i}`} cx="400" cy={y} r="12" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          ))}
          <text x="400" y="38" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Output</text>

          {[70, 105, 140].map(yIn =>
            [60, 90, 120, 150].map(yHid => (
              <line key={`fih-${yIn}-${yHid}`} x1="72" y1={yIn} x2="216" y2={yHid}
                stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.2" />
            ))
          )}

          {[60, 90, 120, 150].map(yHid =>
            [90, 140].map(yOut => (
              <line key={`fho-${yHid}-${yOut}`} x1="244" y1={yHid} x2="388" y2={yOut}
                stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.2" />
            ))
          )}

          {[90, 140].map(yOut =>
            [60, 90, 120, 150].map(yHid => (
              <line key={`bho-${yOut}-${yHid}`} x1="388" y1={yOut} x2="244" y2={yHid}
                stroke="var(--text-secondary)" strokeWidth="2.5" strokeDasharray="5,4" opacity="0.5"
                markerEnd="url(#tbBwd)" style={{ transition: 'all 300ms' }} />
            ))
          )}

          {[60, 90, 120, 150].map(yHid =>
            [70, 105, 140].map(yIn => (
              <line key={`bih-${yHid}-${yIn}`} x1="216" y1={yHid} x2="72" y2={yIn}
                stroke="var(--text-secondary)" strokeWidth="2.5" strokeDasharray="5,4" opacity="0.5"
                markerEnd="url(#tbBwd)" style={{ transition: 'all 300ms' }} />
            ))
          )}

          <rect x="140" y="180" width="220" height="32" rx="6" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5"
            style={{ animation: 'tof-pop 0.3s 0.3s both' }} />
          <text x="250" y="198" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Backward: propagate error signals ( gradient arrows )
          </text>

          <text x="250" y="240" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Chain rule: compute how much each weight contributed to the error, layer by layer
          </text>
        </g>
      )}

      {/* ── Scene 3: Weight Update ── */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="45" textAnchor="middle" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.6">
            Gradient descent: nudge weights opposite the gradient to reduce loss
          </text>

          <rect x="60" y="60" width="380" height="70" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">Gradient Descent Update Rule</text>
          <line x1="75" y1="90" x2="425" y2="90" stroke="var(--border-light)" strokeWidth="0.8" />

          <text x="250" y="115" textAnchor="middle" fill="var(--color-primary)" fontSize="14" fontFamily="system-ui" fontWeight="800">w = w - &#x3b7; &#xb7; &#x2207;</text>

          <rect x="120" y="145" width="260" height="50" rx="8" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5"
            style={{ animation: 'tof-pop 0.3s 0.2s both' }} />
          <text x="250" y="163" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">&#x3b7; = learning rate (step size)</text>
          <text x="250" y="182" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Too large: overshoot. Too small: slow progress.</text>

          <g style={{ animation: 'tof-up 0.3s 0.4s both' }}>
            <rect x="110" y="210" width="280" height="28" rx="6" fill="var(--color-primary)" fillOpacity="0.08" stroke="var(--color-primary)" strokeWidth="1.5" />
            <text x="250" y="228" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
              Repeat: forward &#x2192; loss &#x2192; backward &#x2192; update &#x2192; repeat
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
