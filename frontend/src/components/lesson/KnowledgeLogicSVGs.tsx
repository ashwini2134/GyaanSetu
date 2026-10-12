// ── Propositional Logic — Can you tell what's true? ═══════════════════

export function PropositionalLogicSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Every fact is either TRUE or FALSE' :
         scene === 1 ? 'Combine facts with AND / OR / NOT' :
         scene === 2 ? '"If it rains, the ground gets wet"' :
         'Logic = rules for certain reasoning'}
      </text>

      <defs>
        <filter id="plGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Scene 0: Two statements, show they're true/false */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="55" width="200" height="70" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="140" y="80" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">"It is raining"</text>
          <rect x="90" y="92" width="100" height="22" rx="5" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="140" y="107" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">TRUE</text>

          <rect x="260" y="55" width="200" height="70" rx="10" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="360" y="80" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="system-ui" fontWeight="800">"The sun is cold"</text>
          <rect x="310" y="92" width="100" height="22" rx="5" fill="var(--bg-surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
          <text x="360" y="107" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="system-ui" fontWeight="800">FALSE</text>

          <text x="250" y="175" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            Every statement has a truth value — true or false
          </text>
        </g>
      )}

      {/* Scene 1: AND / OR / NOT with simple visual */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {/* Inputs */}
          <circle cx="80" cy="80" r="18" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="80" y="85" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">P</text>
          <text x="80" y="110" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Raining</text>

          <circle cx="80" cy="160" r="18" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="80" y="165" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Q</text>
          <text x="80" y="190" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Wet ground</text>

          {/* Connection lines */}
          <path d="M 98 80 Q 200 80 200 120" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.35" />
          <path d="M 98 160 Q 200 160 200 120" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.35" />

          {/* Gate box */}
          <rect x="200" y="100" width="100" height="40" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="125" textAnchor="middle" fill="var(--color-primary)" fontSize="14" fontFamily="system-ui" fontWeight="800">AND</text>

          {/* Output */}
          <line x1="300" y1="120" x2="370" y2="120" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" markerEnd="url(#plArr)" />
          <circle cx="400" cy="120" r="18" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="400" y="125" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">P∧Q</text>
          <text x="400" y="150" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontWeight="800">Both true?</text>

          {/* Help text */}
          <text x="250" y="220" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            AND = both must be true · OR = at least one is true · NOT = flips the value
          </text>
        </g>
      )}

      {/* Scene 2: Implication */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="55" width="180" height="60" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="130" y="80" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">IF it rains</text>
          <text x="130" y="98" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">P is TRUE</text>

          <line x1="220" y1="85" x2="260" y2="85" stroke="var(--color-primary)" strokeWidth="3" opacity="0.6" />
          <text x="240" y="78" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">→</text>

          <rect x="270" y="55" width="190" height="60" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="365" y="80" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">THEN ground gets wet</text>
          <text x="365" y="98" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Q is TRUE</text>

          <text x="250" y="165" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">
            Implication: when P is true, Q must also be true
          </text>

          <rect x="140" y="190" width="220" height="30" rx="6" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1" />
          <text x="250" y="209" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">This is how AI writes rules</text>
        </g>
      )}

      {/* Scene 3: Entailment */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {/* Multiple facts */}
          <rect x="50" y="50" width="180" height="90" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="140" y="72" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">KNOWN FACTS</text>
          <line x1="65" y1="78" x2="215" y2="78" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="70" y="95" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">1. It is raining</text>
          <text x="70" y="115" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">2. Rain → Wet ground</text>
          <text x="70" y="132" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">3. Wet ground → Slippery</text>

          <line x1="230" y1="95" x2="270" y2="95" stroke="var(--color-primary)" strokeWidth="3" opacity="0.5" filter="url(#plGlow)" />

          <rect x="280" y="50" width="180" height="90" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="370" y="72" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">CONCLUSION</text>
          <line x1="295" y1="78" x2="445" y2="78" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="370" y="95" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Ground is slippery</text>
          <text x="370" y="118" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">⊨ follows from the facts</text>

          <text x="250" y="185" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Once you have true facts, AI can deduce new truths
          </text>
        </g>
      )}

      <defs>
        <marker id="plArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Knowledge Bases — What if AI never forgot? ════════════════════════

export function KnowledgeBasesSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'AI can store facts — and derive new ones' :
         scene === 1 ? 'Facts go in. Rules fire. Answers come out.' :
         scene === 2 ? 'Chain facts together to reach new conclusions' :
         'Permanent · Certain · Traceable reasoning'}
      </text>

      <defs>
        <filter id="kbGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Scene 0: The problem - fragile knowledge */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="60" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">What if AI never forgot or guessed?</text>

          <rect x="60" y="90" width="170" height="70" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
          <text x="145" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Machine Learning</text>
          <text x="145" y="135" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Learns patterns</text>
          <text x="145" y="150" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">But can be wrong</text>

          <text x="250" y="125" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="system-ui" fontWeight="800">vs</text>

          <rect x="270" y="90" width="170" height="70" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="355" y="115" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Knowledge Base</text>
          <text x="355" y="135" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Stores exact facts</text>
          <text x="355" y="150" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Always certain</text>

          <text x="250" y="210" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            KBs give guaranteed-correct answers — no guessing
          </text>
        </g>
      )}

      {/* Scene 1: Facts → Rules → New facts pipeline */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="30" y="60" width="100" height="70" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="80" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">FACTS IN</text>
          <line x1="40" y1="88" x2="120" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="80" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">"Socrates is human"</text>
          <text x="80" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">"Humans are mortal"</text>

          <line x1="130" y1="95" x2="170" y2="95" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" />

          <rect x="175" y="60" width="100" height="70" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="225" y="82" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">RULES</text>
          <line x1="185" y1="88" x2="265" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="225" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">If Human(x)</text>
          <text x="225" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">→ Mortal(x)</text>

          <line x1="275" y1="95" x2="315" y2="95" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" />

          <rect x="320" y="60" width="150" height="70" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="395" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">NEW FACTS</text>
          <line x1="330" y1="88" x2="460" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="395" y="105" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Socrates is mortal</text>

          <text x="250" y="185" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Inference: combine facts + rules to derive new facts
          </text>
        </g>
      )}

      {/* Scene 2: Chaining */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          {[
            { line1: 'Socrates is human', line2: '', x: 70 },
            { line1: 'Humans are mortal', line2: '', x: 210 },
            { line1: 'Socrates is mortal', line2: '', x: 350 },
          ].map((item, i) => (
            <g key={i}>
              {i > 0 && (
                <line x1={70 + i * 140} y1="90" x2={70 + i * 140 + 15} y2="90"
                  stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5"
                  style={{ animation: `tof-flow 0.3s ${i * 0.15}s both` }} />
              )}
              <rect x={item.x - 55} y="60" width="110" height="60" rx="8"
                fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2"
                style={{ animation: `tof-pop 0.3s ${i * 0.15}s both` }} />
              <text x={item.x} y={i === 1 ? 88 : 93} textAnchor="middle"
                fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">{item.line1}</text>
              <text x={item.x} y={i === 1 ? 105 : 108} textAnchor="middle"
                fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="800">{item.line2}</text>
              {i === 1 && (
                <text x={item.x} y="105" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">(rule)</text>
              )}
            </g>
          ))}

          <text x="250" y="185" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Chain facts together: add one fact, AI automatically derives more
          </text>
        </g>
      )}

      {/* Scene 3: Key properties */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="50" y="55" width="400" height="100" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />

          <rect x="65" y="65" width="100" height="26" rx="6" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="115" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Permanent</text>
          <text x="115" y="105" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Facts never fade</text>
          <text x="115" y="120" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">No forgetting</text>

          <line x1="180" y1="65" x2="180" y2="145" stroke="var(--border-light)" strokeWidth="0.8" />

          <rect x="195" y="65" width="100" height="26" rx="6" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="245" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Certain</text>
          <text x="245" y="105" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Guaranteed</text>
          <text x="245" y="120" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">correct answers</text>

          <line x1="310" y1="65" x2="310" y2="145" stroke="var(--border-light)" strokeWidth="0.8" />

          <rect x="325" y="65" width="110" height="26" rx="6" fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="380" y="82" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Traceable</text>
          <text x="380" y="105" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">You can always see</text>
          <text x="380" y="120" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">HOW the answer followed</text>

          <text x="250" y="200" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            Facts + Rules → New Facts — with full transparency
          </text>
        </g>
      )}
    </svg>
  );
}

// ── First-Order Logic — Beyond simple true/false ══════════════════════

export function FirstOrderLogicSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'What if you need to talk about objects?' :
         scene === 1 ? 'Predicates = properties objects have' :
         scene === 2 ? '∀ — "all humans are mortal"' :
         '∃ — "someone loves pizza"'}
      </text>

      <defs>
        <filter id="flGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Scene 0: The limitation of propositional logic */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="40" y="50" width="200" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
          <text x="140" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">Propositional Logic</text>
          <line x1="55" y1="78" x2="225" y2="78" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="140" y="98" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">"It is raining" → TRUE/FALSE</text>
          <text x="140" y="116" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Cannot talk about objects</text>

          <text x="250" y="90" textAnchor="middle" fill="var(--text-muted)" fontSize="14" fontFamily="system-ui" fontWeight="800">→</text>

          <rect x="270" y="50" width="190" height="80" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="365" y="72" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">First-Order Logic</text>
          <line x1="285" y1="78" x2="445" y2="78" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="365" y="98" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Human(John) → TRUE/FALSE</text>
          <text x="365" y="116" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">✓ Can talk about objects!</text>

          <text x="250" y="185" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            FOL adds objects, properties, and relationships
          </text>
        </g>
      )}

      {/* Scene 1: Predicates */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <circle cx="100" cy="90" r="24" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="100" y="95" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">John</text>
          <rect x="60" y="125" width="80" height="22" rx="5" fill="var(--color-primary)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="100" y="139" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Human(John)</text>

          <circle cx="250" cy="90" r="24" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="95" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Mary</text>
          <rect x="210" y="125" width="80" height="22" rx="5" fill="var(--color-primary)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="250" y="139" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Human(Mary)</text>

          <circle cx="380" cy="90" r="24" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="380" y="95" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="system-ui" fontWeight="800">Biscuit</text>
          <rect x="340" y="125" width="80" height="22" rx="5" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
          <text x="380" y="139" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Dog(Biscuit)</text>

          <text x="250" y="185" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Predicates tell us what objects ARE or what they DO
          </text>
        </g>
      )}

      {/* Scene 2: Universal quantifier */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="60" y="55" width="380" height="80" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="55" y="80" fill="var(--color-primary)" fontSize="20" fontFamily="system-ui" fontWeight="800">∀</text>
          <text x="85" y="80" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">For ALL things x:</text>
          <line x1="60" y1="88" x2="425" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="250" y="108" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">If Human(x) then Mortal(x)</text>
          <text x="250" y="125" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Every human is mortal — no exceptions</text>

          <text x="250" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            ∀x applies the rule to every object in the universe
          </text>
        </g>
      )}

      {/* Scene 3: Existential quantifier */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="60" y="55" width="380" height="80" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="55" y="80" fill="var(--color-primary)" fontSize="20" fontFamily="system-ui" fontWeight="800">∃</text>
          <text x="85" y="80" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">There EXISTS x:</text>
          <line x1="60" y1="88" x2="425" y2="88" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="250" y="108" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">Loves(John, x) ∧ Pizza(x)</text>
          <text x="250" y="125" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">There is at least one pizza that John loves</text>

          <text x="250" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            ∃x says "at least one thing exists with this property"
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Knowledge Engineering — Turn messy problems into logic ═══════════

export function KnowledgeEngineeringSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'The real world is messy. Logic makes it clean.' :
         scene === 1 ? 'Step 1: Identify objects & facts' :
         scene === 2 ? 'Step 2: Write rules & infer' :
         'Step 3: The answer emerges from logic'}
      </text>

      <defs>
        <filter id="keGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Scene 0: The messy problem */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <text x="250" y="55" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="system-ui" fontWeight="800">A real puzzle</text>

          <rect x="50" y="70" width="400" height="80" rx="10" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />

          {/* Three suspects as circles */}
          <circle cx="100" cy="110" r="18" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="100" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">A</text>

          <circle cx="200" cy="110" r="18" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="200" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">B</text>

          <circle cx="300" cy="110" r="18" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="300" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">C</text>

          <circle cx="400" cy="110" r="18" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="2" />
          <text x="400" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">?</text>

          <text x="250" y="145" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui">Who? With what? Where? — The facts are connected</text>

          <text x="250" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Real problems have objects, constraints, and missing pieces
          </text>
        </g>
      )}

      {/* Scene 1: Identify objects and facts */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="30" y="55" width="160" height="90" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="110" y="75" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">OBJECTS</text>
          <line x1="40" y1="80" x2="180" y2="80" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="110" y="98" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Person(A), Person(B)</text>
          <text x="110" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Weapon(Knife)</text>
          <text x="110" y="132" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Location(Kitchen)</text>

          <rect x="220" y="55" width="160" height="90" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="300" y="75" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">CONSTRAINTS</text>
          <line x1="230" y1="80" x2="370" y2="80" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="300" y="98" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Only one culprit</text>
          <text x="300" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Weapon matches person</text>
          <text x="300" y="132" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Each fact is TRUE/FALSE</text>

          <text x="250" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Step 1: Identify what exists and what the rules are
          </text>
        </g>
      )}

      {/* Scene 2: Inference rules */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="30" y="55" width="440" height="60" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
          <text x="250" y="75" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">RULES</text>
          <line x1="45" y1="82" x2="455" y2="82" stroke="var(--border-light)" strokeWidth="0.8" />
          <text x="110" y="101" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">¬Innocent(A) → Guilty(A)</text>
          <text x="300" y="101" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Guilty(A) → Used(Weapon)</text>
          <text x="430" y="101" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui">Used(Weapon) → Location</text>

          <line x1="250" y1="122" x2="250" y2="140" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.5" filter="url(#keGlow)" />

          <rect x="130" y="145" width="240" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2"
            style={{ animation: 'tof-pop 0.3s both' }} />
          <text x="250" y="167" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">
            ¬Innocent(A) → ... → Location(Kitchen)
          </text>

          <text x="250" y="210" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontStyle="italic">
            Step 2: Let inference rules connect the dots
          </text>
        </g>
      )}

      {/* Scene 3: Solution */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="50" y="50" width="400" height="90" rx="10" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="250" y="73" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontFamily="system-ui" fontWeight="800">MODEL CHECKING</text>
          <line x1="65" y1="80" x2="435" y2="80" stroke="var(--border-light)" strokeWidth="0.8" />

          <text x="250" y="100" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">
            Try all assignments. Find the one that fits.
          </text>
          <text x="250" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="800">
            A did it · Knife · Kitchen
          </text>

          <text x="250" y="195" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.3s both' }}>
            Step 3: The only consistent model is the answer
          </text>
        </g>
      )}
    </svg>
  );
}
