// ── Search Problem — Road Network ══════════════════════════════════════

export function SearchProblemSVG({ scene }: { scene: number }) {
  const R = 22;

  const nodes = [
    { id: 'S', x: 60,  y: 100, label: 'Start' },
    { id: 'A', x: 175, y: 60,  label: '' },
    { id: 'B', x: 175, y: 150, label: '' },
    { id: 'C', x: 290, y: 60,  label: '' },
    { id: 'D', x: 290, y: 150, label: '' },
    { id: 'G', x: 420, y: 100, label: 'Goal' },
  ];

  const edges: [number, number, string][] = [
    [0, 1, '2'], [0, 2, '1'],
    [1, 3, '3'], [2, 4, '4'],
    [3, 5, '1'], [4, 5, '2'],
    [1, 4, '2'],
  ];

  const optimalPath = [0, 1, 3, 5];
  const agentSteps = ['Agent', 'Explore roads', 'Choose best', 'Reach Goal'];

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <marker id="spArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--text-secondary)" />
        </marker>
        <marker id="spArrHi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--color-primary)" />
        </marker>
        <filter id="spGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Where you are → Where you want to be' :
         scene === 1 ? 'Step 1: Know where you start' :
         scene === 2 ? 'Step 2: Explore possible roads' :
         'Find the best path'}
      </text>

      {/* Edges */}
      {edges.map(([fi, ti, cost]) => {
        const from = nodes[fi], to = nodes[ti];
        const isOptimal = scene === 3 && optimalPath.includes(fi) && optimalPath.includes(ti) &&
          Math.abs(optimalPath.indexOf(fi) - optimalPath.indexOf(ti)) === 1;
        const showCost = scene >= 2;

        return (
          <g key={`e-${fi}-${ti}`}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isOptimal ? 'var(--color-primary)' : 'var(--text-secondary)'}
              strokeWidth={isOptimal ? 4 : 2.5}
              markerEnd={isOptimal ? 'url(#spArrHi)' : 'url(#spArr)'}
              opacity={isOptimal ? 1 : scene === 3 ? 0.2 : 0.4}
              style={{ transition: 'all 300ms' }} />
            <rect x={(from.x + to.x) / 2 - 8} y={(from.y + to.y) / 2 - 8} width="16" height="16" rx="4"
              fill="var(--bg-surface)" stroke="none"
              opacity={showCost ? 1 : 0} />
            <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 + 3} textAnchor="middle"
              fill={isOptimal ? 'var(--color-primary)' : 'var(--text-muted)'}
              fontSize="8" fontFamily="system-ui" fontWeight="800"
              opacity={showCost ? 1 : 0}
              style={{ transition: 'all 300ms' }}>{cost}</text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const isStart = i === 0;
        const isGoal = i === nodes.length - 1;
        const onOptimal = scene === 3 && optimalPath.includes(i);
        const highlight = (scene === 1 && isStart) || (scene === 3 && (isStart || isGoal));

        return (
          <g key={n.id}>
            {(highlight || (scene === 1 && isStart)) && (
              <circle cx={n.x} cy={n.y} r={R + 5} fill="none" stroke="var(--color-primary)" strokeWidth="2"
                opacity="0.35" style={{ animation: 'tof-pulse-ring 2s ease-out infinite' }} />
            )}
            <circle cx={n.x} cy={n.y} r={R}
              fill={isGoal && scene >= 2 ? 'var(--color-primary)' : onOptimal ? 'var(--color-primary)' : 'var(--bg-surface)'}
              fillOpacity={isGoal && scene >= 2 ? 0.25 : onOptimal ? 0.25 : 1}
              stroke={onOptimal || (isGoal && scene >= 2) ? 'var(--color-primary)' : isStart ? 'var(--text-main)' : 'var(--text-secondary)'}
              strokeWidth={onOptimal || (isGoal && scene >= 2) ? 3 : 2.5}
              style={{ transition: 'all 300ms' }}>
            </circle>
            <text x={n.x} y={n.y + 5} textAnchor="middle"
              fill={onOptimal || (isGoal && scene >= 2) ? 'var(--color-primary)' : isStart ? 'var(--text-main)' : 'var(--text-secondary)'}
              fontSize="10" fontFamily="system-ui" fontWeight="800"
              style={{ transition: 'all 300ms' }}>{n.id}</text>
            {n.label && (
              <text x={n.x} y={n.y + R + 14} textAnchor="middle"
                fill={isGoal && scene >= 2 ? 'var(--color-primary)' : 'var(--text-muted)'}
                fontSize="7" fontFamily="system-ui" fontWeight="800"
                style={{ transition: 'all 300ms' }}>{n.label}</text>
            )}
          </g>
        );
      })}

      {/* Agent process flow at bottom */}
      <g transform="translate(40, 212)">
        <rect x="0" y="0" width="420" height="28" rx="8" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" opacity="0.6" />
        {agentSteps.map((step, i) => {
          const show = scene >= i;
          return (
            <g key={step}>
              {i > 0 && (
                <line x1={i * 105 - 20} y1="14" x2={i * 105} y2="14"
                  stroke="var(--color-primary)" strokeWidth="2" opacity={show ? 0.6 : 0.1} />
              )}
              <rect x={i * 105 - 5} y="3" width="90" height="22" rx="5"
                fill={show ? 'var(--color-primary)' : 'var(--bg-surface)'}
                fillOpacity={show ? 0.2 : 1}
                stroke={show ? 'var(--color-primary)' : 'var(--border-light)'}
                strokeWidth={show ? 2 : 1.5}
                style={{ transition: 'all 300ms' }} />
              <text x={i * 105 + 40} y="18" textAnchor="middle"
                fill={show ? 'var(--color-primary)' : 'var(--text-muted)'}
                fontSize="7" fontFamily="system-ui" fontWeight="800"
                style={{ transition: 'all 300ms' }}>{step}</text>
            </g>
          );
        })}
      </g>

      {/* Takeaway */}
      <text x="250" y="249" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800"
        style={{ animation: 'tof-up 0.3s both' }}>
        {scene === 0 ? 'Search = find a path from Start to Goal' :
         scene === 3 ? 'Shortest path: S → A → C → G  (cost=6)' : ''}
      </text>
    </svg>
  );
}

// ── BFS vs DFS — side-by-side comparison ══════════════════════════════

export function BfsDfsSVG({ scene }: { scene: number }) {
  const R = 18;
  const bfsN: { [id: string]: { x: number; y: number; children: string[] } } = {
    '1': { x: 120, y: 38, children: ['2', '3'] },
    '2': { x: 65,  y: 88, children: ['4', '5'] },
    '3': { x: 175, y: 88, children: ['6', '7'] },
    '4': { x: 28,  y: 138, children: [] },
    '5': { x: 102, y: 138, children: [] },
    '6': { x: 148, y: 138, children: [] },
    '7': { x: 212, y: 138, children: [] },
  };

  const dfsN: { [id: string]: { x: number; y: number; children: string[] } } = {
    '1': { x: 380, y: 38, children: ['2', '3'] },
    '2': { x: 325, y: 88, children: ['4', '5'] },
    '3': { x: 435, y: 88, children: ['6', '7'] },
    '4': { x: 290, y: 138, children: [] },
    '5': { x: 360, y: 138, children: [] },
    '6': { x: 405, y: 138, children: [] },
    '7': { x: 465, y: 138, children: [] },
  };

  const bfsOrder = ['1', '2', '3', '4', '5', '6', '7'];
  const dfsOrder = ['1', '2', '4', '5', '3', '6', '7'];

  const isScene0 = scene === 0;
  const isBFS = scene === 1;
  const isDFS = scene === 2;
  const isCompare = scene === 3;

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="bfGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <line x1="248" y1="8" x2="248" y2="185" stroke="var(--border-light)" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.3" />

      <text x="125" y="216" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">BFS</text>
      <text x="385" y="216" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">DFS</text>

      {/* BFS tree edges */}
      {Object.entries(bfsN).map(([id, n]) =>
        n.children.map(c => (
          <line key={`be-${id}-${c}`} x1={n.x} y1={n.y + R} x2={bfsN[c].x} y2={bfsN[c].y - R}
            stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.35" />
        ))
      )}

      {/* DFS tree edges */}
      {Object.entries(dfsN).map(([id, n]) =>
        n.children.map(c => (
          <line key={`de-${id}-${c}`} x1={n.x} y1={n.y + R} x2={dfsN[c].x} y2={dfsN[c].y - R}
            stroke="var(--text-secondary)" strokeWidth="2.5" opacity="0.35" />
        ))
      )}

      {/* BFS nodes */}
      {Object.entries(bfsN).map(([id, n]) => {
        const idx = bfsOrder.indexOf(id);
        const visitedBFS = isScene0 || isBFS || isCompare;
        const highlighted = visitedBFS && (!isScene0);
        const revealStep = isBFS ? Math.floor(idx / 2) + 1 : 999;
        const visible = !isBFS || revealStep <= scene;

        return (
          <g key={`b-${id}`} style={{ opacity: visible ? 1 : 0.08, transition: 'opacity 400ms' }}>
            <circle cx={n.x} cy={n.y} r={R}
              fill={highlighted ? 'var(--color-primary)' : 'var(--bg-surface)'}
              fillOpacity={highlighted ? 0.2 : 1}
              stroke={highlighted || (isDFS && visitedBFS) ? 'var(--color-primary)' : 'var(--text-secondary)'}
              strokeWidth={highlighted || (isDFS && visitedBFS) ? 3 : 2}
              style={{ transition: 'all 300ms' }} />
            {highlighted && (
              <text x={n.x} y={n.y + R + 12} textAnchor="middle"
                fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">#{idx + 1}</text>
            )}
          </g>
        );
      })}

      {/* DFS nodes */}
      {Object.entries(dfsN).map(([id, n]) => {
        const idx = dfsOrder.indexOf(id);
        const visitedDFS = isScene0 || isDFS || isCompare;
        const highlighted = visitedDFS && (!isScene0);
        const isDeep = isDFS && ['1', '2', '4'].includes(id);
        const revealStep = isDFS ? Math.floor(idx / 2) + 1 : 999;
        const visible = !isDFS || revealStep <= scene;

        return (
          <g key={`d-${id}`} style={{ opacity: visible ? 1 : 0.08, transition: 'opacity 400ms' }}>
            <circle cx={n.x} cy={n.y} r={R}
              fill={highlighted ? 'var(--color-primary)' : 'var(--bg-surface)'}
              fillOpacity={highlighted ? 0.2 : 1}
              stroke={isDeep ? 'var(--color-primary)' : highlighted ? 'var(--color-primary)' : 'var(--text-secondary)'}
              strokeWidth={highlighted ? 3 : 2}
              style={{ transition: 'all 300ms' }} />
            {highlighted && (
              <text x={n.x} y={n.y + R + 12} textAnchor="middle"
                fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">#{idx + 1}</text>
            )}
            {isDeep && (
              <circle cx={n.x} cy={n.y} r={R + 5}
                fill="none" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0.4"
                style={{ animation: 'tof-pulse-ring 1.5s ease-out infinite' }} />
            )}
          </g>
        );
      })}

      {/* Footer */}
      <g style={{ animation: 'tof-up 0.3s both' }}>
        <rect x="10" y="225" width="228" height="28" rx="6" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" />
        {isScene0 && <text x="124" y="243" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">Queue (FIFO)</text>}
        {isBFS && <text x="124" y="243" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">✔ Levels one by one</text>}
        {isDFS && <text x="124" y="243" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">✔ Shortest path</text>}
        {isCompare && <text x="124" y="243" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Explore every nearby option</text>}

        <rect x="262" y="225" width="228" height="28" rx="6" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1.5" />
        {isScene0 && <text x="376" y="243" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800">Stack (LIFO)</text>}
        {isDFS && <text x="376" y="243" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">✔ Less memory</text>}
        {isCompare && <text x="376" y="243" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">Keep exploring one path</text>}
      </g>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {isScene0 ? 'Two ways to explore the same tree' :
         isBFS ? 'BFS: visit level by level' :
         isDFS ? 'DFS: dive deep then backtrack' :
         'Each strategy has different strengths'}
      </text>
    </svg>
  );
}

// ── Heuristic Search — Maze with distance gradient ════════════════════

export function HeuristicSearchSVG({ scene }: { scene: number }) {
  const cell = 52, ox = 140, oy = 38;
  const maze = [
      { r: 0, c: 0, h: 6, meta: 'S' },
    { r: 0, c: 1, h: 5, meta: '' },
    { r: 0, c: 2, h: 4, meta: '' },
    { r: 0, c: 3, h: 3, meta: '' },
    { r: 1, c: 0, h: 5, meta: '' },
    { r: 1, c: 1, h: 0, block: true },
    { r: 1, c: 2, h: 0, block: true },
    { r: 1, c: 3, h: 2, meta: '' },
    { r: 2, c: 0, h: 4, meta: '' },
    { r: 2, c: 1, h: 3, meta: '' },
    { r: 2, c: 2, h: 2, meta: '' },
    { r: 2, c: 3, h: 1, meta: '' },
    { r: 3, c: 0, h: 3, meta: '' },
    { r: 3, c: 1, h: 2, meta: '' },
    { r: 3, c: 2, h: 1, meta: '' },
    { r: 3, c: 3, h: 0, meta: 'G' },
  ];

  const aStarPath = [0, 1, 2, 3, 7, 11, 15];
  const bfsExplore = [0, 1, 4, 2, 8, 3, 9, 12, 7, 10, 13, 11, 14, 15];

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="hgGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'h(n) = estimated steps to goal' :
         scene === 1 ? 'Greedy: always follow lowest h' :
         scene === 2 ? 'A*: f = actual + estimated' :
         'BFS = everywhere  |  A* = toward goal'}
      </text>

      {maze.map((m, i) => {
        const cx = ox + m.c * cell + cell / 2;
        const cy = oy + m.r * cell + cell / 2;
        const isPathA = scene === 3 && aStarPath.includes(i);
        const isBFS = scene === 1;
        const isAStar = scene >= 2;
        const discovered = isBFS ? bfsExplore.indexOf(i) >= 0 && bfsExplore.indexOf(i) <= scene * 5
                         : isAStar ? aStarPath.indexOf(i) >= 0 && aStarPath.indexOf(i) <= scene * 5
                         : true;

        const intensity = Math.max(0.15, 1 - m.h / 8);

        return (
          <g key={i}>
            <rect x={ox + m.c * cell + 2} y={oy + m.r * cell + 2}
              width={cell - 4} height={cell - 4} rx="10"
              fill={m.block ? 'var(--bg-surface)' : isPathA ? 'var(--color-primary)' : m.meta === 'G' ? 'var(--color-primary)' : 'var(--bg-surface)'}
              fillOpacity={m.block ? 0.12 : isPathA ? 0.35 : discovered ? 0.12 + intensity * 0.5 : 0.05}
              stroke={isPathA ? 'var(--color-primary)' : m.meta === 'G' ? 'var(--color-primary)' : 'var(--text-secondary)'}
              strokeWidth={isPathA ? 3 : m.meta === 'G' && scene >= 1 ? 2.5 : 1.5}
              opacity={discovered || scene === 0 ? 1 : 0.15}
              style={{ transition: 'all 300ms' }} />

            {m.meta === 'S' && (
              <circle cx={cx} cy={cy} r="8" fill="var(--text-main)" opacity={scene >= 1 ? 1 : 0.4}
                style={{ transition: 'opacity 300ms' }} />
            )}
            {m.meta === 'G' && (
              <path d={`M ${cx - 7} ${cy} l 4 -5 l 5 8 l -4 2 Z`}
                fill={scene >= 2 ? 'var(--color-primary)' : 'var(--text-muted)'} opacity={0.8} />
            )}
            {m.block && (
              <g opacity="0.3">
                <line x1={cx - 7} y1={cy - 7} x2={cx + 7} y2={cy + 7} stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" />
                <line x1={cx + 7} y1={cy - 7} x2={cx - 7} y2={cy + 7} stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {!m.block && m.meta !== 'S' && m.meta !== 'G' && discovered && (
              <text x={cx} y={cy + 3} textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800"
                opacity={0.8}>{m.h}</text>
            )}

            {isPathA && (
              <circle cx={cx} cy={cy} r="4" fill="var(--color-primary)" filter="url(#hgGlow)" />
            )}
          </g>
        );
      })}

      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="120" y="232" width="260" height="24" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="250" y="248" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800">
            A* finds the goal without exploring every tile
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Adversarial Search — Chess game tree ═════════════════════════════

export function AdversarialSearchSVG({ scene }: { scene: number }) {
  const BRANCH_X = [90, 250, 410];

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: '340px' }}>
      <defs>
        <filter id="adGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="250" y="14" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.75">
        {scene === 0 ? 'Your turn — choose the best move' :
         scene === 1 ? 'Opponent will respond...' :
         scene === 2 ? 'Minimax: pick the best worst case' :
         'Assume your opponent plays perfectly'}
      </text>

      {/* Chess king */}
      <g transform="translate(250, 46)">
        <rect x="-18" y="-18" width="36" height="36" rx="10" fill="var(--bg-surface)" stroke="var(--text-main)" strokeWidth="2.5" />
        <text x="0" y="7" textAnchor="middle" fill="var(--text-main)" fontSize="20" fontFamily="system-ui">♔</text>
      </g>

      <text x="250" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" opacity="0.5">Your Move</text>

      {BRANCH_X.map((bx, bi) => {
        const branchColor = scene >= 2 && bi === 2 ? 'var(--color-primary)' : bi === 1 ? 'var(--color-primary)' : 'var(--text-secondary)';

        return (
          <g key={`b${bi}`}>
            <line x1={250} y1={64} x2={bx} y2={110}
              stroke={scene >= 2 && bi === 2 ? 'var(--color-primary)' : 'var(--text-secondary)'}
              strokeWidth={scene >= 2 && bi === 2 ? 3 : 2.5}
              opacity={scene >= 2 && bi === 2 ? 0.7 : 0.25}
              style={{ transition: 'all 300ms' }} />

            <rect x={bx - 40} y={110} width="80" height="30" rx="8"
              fill="var(--bg-surface)" stroke={branchColor} strokeWidth="2" />
            <text x={bx} y={129} textAnchor="middle" fill={branchColor} fontSize="9" fontFamily="system-ui" fontWeight="800">
              {['Move A', 'Move B', 'Move C'][bi]}
            </text>

            {[0, 1].map(ri => {
              const ry = 158 + ri * 36;
              const score = [[3, -1], [2, -5], [1, 0]][bi][ri];
              const isBestResponse = scene >= 1 && ((bi === 0 && ri === 1) || (bi === 1 && ri === 1) || (bi === 2 && ri === 1));
              const isSelectedPath = scene >= 2 && bi === 2 && ri === 1;

              return (
                <g key={`r${bi}-${ri}`}>
                  <line x1={bx} y1={140} x2={bx - 20 + ri * 40} y2={ry} stroke="var(--text-secondary)" strokeWidth="2" opacity="0.2" />

                  <circle cx={bx - 20 + ri * 40} cy={ry} r="12"
                    fill={isSelectedPath ? 'var(--color-primary)' : 'var(--bg-surface)'}
                    fillOpacity={isSelectedPath ? 0.3 : 1}
                    stroke={isSelectedPath ? 'var(--color-primary)' : isBestResponse ? 'var(--color-primary)' : 'var(--text-secondary)'}
                    strokeWidth={isSelectedPath ? 3 : 2}
                    style={{ transition: 'all 300ms' }} />
                  <text x={bx - 20 + ri * 40} y={ry + 4} textAnchor="middle"
                    fill={isSelectedPath ? 'var(--color-primary)' : 'var(--text-secondary)'}
                    fontSize="9" fontFamily="system-ui" fontWeight={isSelectedPath ? '800' : '600'}
                    style={{ transition: 'all 300ms' }}>{score}</text>
                </g>
              );
            })}

            <text x={bx} y="238" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" opacity="0.4">Opponent</text>
          </g>
        );
      })}

      {scene >= 2 && (
        <g transform="translate(10, 4)" style={{ animation: 'tof-up 0.3s both' }}>
          <rect x="0" y="0" width="68" height="44" rx="5" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="1" opacity="0.6" />
          <text x="10" y="17" fill="var(--text-main)" fontSize="8" fontFamily="system-ui" fontWeight="800">MAX</text>
          <text x="10" y="34" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="800">MIN</text>
        </g>
      )}

      {scene === 3 && (
        <text x="250" y="252" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontFamily="system-ui" fontWeight="800"
          style={{ animation: 'tof-up 0.3s both' }}>
          "I choose assuming my opponent plays perfectly"
        </text>
      )}
    </svg>
  );
}
