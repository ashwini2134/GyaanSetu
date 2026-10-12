import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ScrollContext } from './ScrollContext';
import type { AIThinkOfPanelBlock, ThinkOfBlock } from '../../types/lesson';

// ── CSS animations ────────────────────────────────────────────────────────────

const STYLES = `
@keyframes tof-belt {
  from { stroke-dashoffset: 0;  }
  to   { stroke-dashoffset: -40; }
}
@keyframes tof-sweep {
  0%   { transform: translateY(0px);  opacity: 0.8; }
  100% { transform: translateY(90px); opacity: 0.1; }
}
@keyframes tof-flag {
  0%, 100% { filter: drop-shadow(0 0 3px var(--illustration-danger)); }
  50%       { filter: drop-shadow(0 0 9px var(--illustration-danger)); }
}
@keyframes tof-conn {
  from { stroke-dashoffset: 220; opacity: 0; }
  to   { stroke-dashoffset: 0;   opacity: 0.55; }
}
@keyframes tof-node {
  0%, 100% { opacity: 0.35; }
  50%       { opacity: 1; }
}
@keyframes tof-pop {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes tof-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tof-slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes tof-slide-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes tof-pulse-ring {
  0%   { r: 18; opacity: 0.8; }
  100% { r: 30; opacity: 0; }
}
@keyframes tof-wave {
  0%   { opacity: 0; r: 0; }
  50%  { opacity: 0.5; }
  100% { opacity: 0; r: 55; }
}
@keyframes tof-needle {
  from { transform: rotate(0deg); }
  to   { transform: rotate(1deg); }
}
@keyframes tof-flow {
  from { stroke-dashoffset: 40; }
  to   { stroke-dashoffset: 0; }
}
@keyframes tof-signal {
  0%   { opacity: 0; transform: translateX(-8px); }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { opacity: 0; transform: translateX(8px); }
}
@keyframes tof-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}
@keyframes tof-signal-r {
  0%, 100% { fill: var(--illustration-danger); filter: drop-shadow(0 0 5px var(--illustration-danger)); }
  25%, 75% { fill: var(--illustration-danger-bg); filter: none; }
}
@keyframes tof-signal-y {
  0%, 25%  { fill: var(--illustration-warning-bg); filter: none; }
  40%, 60% { fill: var(--illustration-warning); filter: drop-shadow(0 0 5px var(--illustration-warning)); }
  75%, 100%{ fill: var(--illustration-warning-bg); filter: none; }
}
@keyframes tof-signal-g {
  0%, 50%  { fill: var(--illustration-success-bg); filter: none; }
  65%, 100%{ fill: var(--illustration-success); filter: drop-shadow(0 0 5px var(--illustration-success)); }
}
@keyframes tof-drive1 {
  from { transform: translateX(560px); }
  to   { transform: translateX(-100px); }
}
@keyframes tof-drive2 {
  from { transform: translateX(-100px); }
  to   { transform: translateX(560px); }
}
@keyframes tof-progress {
  from { width: 100%; }
  to   { width: 0%; }
}
@keyframes tof-beam {
  0%, 25%  { transform: translateY(25px);  opacity: 0.9; }
  30%, 55% { transform: translateY(120px); opacity: 0.9; }
  60%, 90% { transform: translateY(215px); opacity: 0.9; }
  100%     { transform: translateY(215px); opacity: 0; }
}
@keyframes tof-beam-glow {
  0%, 100% { opacity: 0; }
  25%, 90% { opacity: 0.4; }
}
@keyframes tof-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
@keyframes tof-pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50%      { opacity: 1;   transform: scale(1.1); }
}
@keyframes bfs-elevator {
  0%, 8%   { transform: translateY(0); }
  16%, 24% { transform: translateY(-42px); }
  32%, 40% { transform: translateY(-83px); }
  48%, 56% { transform: translateY(-124px); }
  64%, 72% { transform: translateY(-165px); }
  80%, 88% { transform: translateY(-206px); }
  96%, 100%{ transform: translateY(-206px); }
}
@keyframes bfs-trail {
  0%, 8%   { opacity: 0; }
  16%, 100%{ opacity: 0.25; }
}
@keyframes dfs-climb {
  0%, 8%   { transform: translateY(0); }
  16%, 24% { transform: translateY(-45px); }
  32%, 40% { transform: translateY(-90px); }
  48%, 56% { transform: translateY(-135px); }
  64%, 72% { transform: translateY(-180px); }
  80%, 88% { transform: translateY(-220px); }
  90%, 100%{ transform: translateY(-220px); }
}
@keyframes win-pulse {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.8; }
}
@keyframes bfs-sweep {
  0%, 15%  { transform: translateY(0); }
  20%, 35% { transform: translateY(-40px); }
  40%, 55% { transform: translateY(-80px); }
  60%, 75% { transform: translateY(-120px); }
  80%, 95% { transform: translateY(-160px); }
  100%     { transform: translateY(-200px); }
}
@keyframes dfs-crawl {
  0%, 10%  { transform: translateY(0); }
  20%, 30% { transform: translateY(-40px); }
  40%, 50% { transform: translateY(-80px); }
  60%, 70% { transform: translateY(-120px); }
  80%, 90% { transform: translateY(-160px); }
  100%     { transform: translateY(-200px); }
}
`;

// ── Airport security SVG ──────────────────────────────────────────────────────

function AirportSVG({ scene }: { scene: number }) {
  const showBelt   = scene < 2;
  const showArch   = scene < 2;
  const showCase   = scene < 2;
  const showItems  = scene === 1;
  const showScan   = scene === 1;
  const showNeural = scene === 2;
  const caseX = scene === 0 ? 0 : 130;
  const AX = 175, AY = 70, AW = 144, AH = 128;
  const BY = 192;
  const IX = 66, HX = 248, OX = 415;
  const IY = [72, 116, 160, 204];
  const HY = [95, 150, 202];
  const OY = [120, 184];

  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect x="28" y={BY} width="444" height="16" rx="8" fill="var(--illustration-surface-dark-alt)"
        style={{ opacity: showBelt ? 1 : 0, transition: 'opacity 700ms' }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={48 + i * 38} y1={BY + 2} x2={48 + i * 38} y2={BY + 14}
          stroke="#1e2a3a" strokeWidth="2"
          style={{ opacity: showBelt ? 0.8 : 0, transition: 'opacity 700ms',
            animation: scene < 2 ? 'tof-belt 1.4s linear infinite' : undefined }} />
      ))}
      <rect x={AX} y={AY} width={AW} height={14} rx="4"
        fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5"
        style={{ opacity: showArch ? 1 : 0, transition: 'opacity 700ms' }} />
      <rect x={AX} y={AY + 14} width={14} height={AH} rx="2"
        fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5"
        style={{ opacity: showArch ? 1 : 0, transition: 'opacity 700ms' }} />
      <rect x={AX + AW - 14} y={AY + 14} width={14} height={AH} rx="2"
        fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5"
        style={{ opacity: showArch ? 1 : 0, transition: 'opacity 700ms' }} />
      <rect x={AX + 14} y={AY + 14} width={AW - 28} height={AH} rx="1"
        fill={showItems ? '#130800' : '#03080f'}
        style={{ opacity: showArch ? 1 : 0, transition: 'fill 500ms, opacity 700ms' }} />
      <line x1={AX + 15} y1={AY + 18} x2={AX + AW - 15} y2={AY + 18}
        stroke="var(--illustration-warning)" strokeWidth="1.5"
        style={{ opacity: showScan ? 1 : 0, transition: 'opacity 400ms',
          animation: scene === 1 ? 'tof-sweep 1.9s ease-in-out infinite alternate' : undefined }} />
      <g style={{ transform: `translateX(${caseX}px)`, opacity: showCase ? 1 : 0,
        transition: 'transform 900ms cubic-bezier(0.4,0,0.2,1), opacity 600ms' }}>
        <rect x="48" y={BY - 56} width="62" height="50" rx="7" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
        <rect x="68" y={BY - 70} width="22" height="16" rx="8" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
        <line x1="48" y1={BY - 34} x2="110" y2={BY - 34} stroke="var(--illustration-surface-mid)" strokeWidth="1" />
      </g>
      <rect x="208" y="100" width="40" height="28" rx="5" fill="var(--illustration-danger-bg-deep)" stroke="var(--illustration-danger)" strokeWidth="1.3"
        style={{ opacity: showItems ? 1 : 0, transition: 'opacity 500ms 200ms',
          animation: scene === 1 ? 'tof-flag 1.6s ease-in-out infinite' : undefined }} />
      <text x="228" y="118" textAnchor="middle" fill="var(--illustration-danger)" fontSize="9"
        style={{ opacity: showItems ? 1 : 0, transition: 'opacity 500ms 200ms' }}>⚡</text>
      <rect x="258" y="106" width="26" height="22" rx="4" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1.3"
        style={{ opacity: showItems ? 1 : 0, transition: 'opacity 500ms 350ms' }} />
      <text x="271" y="121" textAnchor="middle" fill="var(--illustration-success)" fontSize="8"
        style={{ opacity: showItems ? 1 : 0, transition: 'opacity 500ms 350ms' }}>📖</text>
      <g style={{ opacity: showItems ? 1 : 0, transition: 'opacity 400ms 600ms',
        animation: scene === 1 ? 'tof-pop 0.35s 0.6s both' : undefined }}>
        <rect x="204" y="78" width="50" height="16" rx="8" fill="var(--illustration-danger-bg)" />
        <text x="229" y="89.5" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7.5" fontFamily="system-ui" fontWeight="700">FLAGGED</text>
      </g>
      <g style={{ opacity: showItems ? 1 : 0, transition: 'opacity 400ms 800ms',
        animation: scene === 1 ? 'tof-pop 0.35s 0.8s both' : undefined }}>
        <rect x="258" y="78" width="38" height="16" rx="8" fill="#14532d" />
        <text x="277" y="89.5" textAnchor="middle" fill="var(--illustration-success)" fontSize="7.5" fontFamily="system-ui" fontWeight="700">SAFE</text>
      </g>
      <g style={{ opacity: showNeural ? 1 : 0, transition: 'opacity 800ms 200ms' }}>
        {IY.map(iy => HY.map((hy, j) => (
          <line key={`ih${iy}${hy}`} x1={IX + 10} y1={iy} x2={HX - 13} y2={hy}
            stroke="var(--illustration-primary)" strokeWidth="0.8" strokeDasharray="220" strokeDashoffset="220"
            style={{ animation: scene === 2 ? `tof-conn 1s ${(IY.indexOf(iy) * 0.06 + j * 0.09 + 0.15).toFixed(2)}s forwards` : undefined }} />
        )))}
        {HY.map((hy, j) => OY.map((oy, k) => (
          <line key={`ho${hy}${k}`} x1={HX + 13} y1={hy} x2={OX - 18} y2={oy}
            stroke="var(--illustration-success-dim)" strokeWidth="1" strokeDasharray="220" strokeDashoffset="220"
            style={{ animation: scene === 2 ? `tof-conn 1s ${(j * 0.08 + k * 0.12 + 0.65).toFixed(2)}s forwards` : undefined }} />
        )))}
        {IY.map((y, i) => (
          <circle key={i} cx={IX} cy={y} r="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5"
            style={{ animation: scene === 2 ? `tof-node 2.2s ${(i * 0.26).toFixed(2)}s infinite` : undefined }} />
        ))}
        {HY.map((y, i) => (
          <circle key={i} cx={HX} cy={y} r="13" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5"
            style={{ animation: scene === 2 ? `tof-node 2.2s ${(i * 0.22 + 0.45).toFixed(2)}s infinite` : undefined }} />
        ))}
        {[{ y: OY[0], label: 'SAFE', fill: 'var(--illustration-success-bg)', stroke: 'var(--illustration-success)', text: 'var(--illustration-success)' },
          { y: OY[1], label: 'FLAG', fill: 'var(--illustration-danger-bg-deep)', stroke: 'var(--illustration-danger)', text: 'var(--illustration-danger)' }].map((o, i) => (
          <g key={i}>
            <circle cx={OX} cy={o.y} r="18" fill={o.fill} stroke={o.stroke} strokeWidth="2"
              style={{ animation: scene === 2 ? `tof-node 2.2s ${(i * 0.4 + 1.1).toFixed(2)}s infinite` : undefined }} />
            <text x={OX} y={o.y + 4} textAnchor="middle" fill={o.text} fontSize="8" fontFamily="system-ui" fontWeight="700">{o.label}</text>
          </g>
        ))}
        <text x={IX}  y="244" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">Bags</text>
        <text x={HX}  y="244" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">Patterns</text>
        <text x={OX}  y="244" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">Decision</text>
      </g>
    </svg>
  );
}

// ── Dog training SVG ──────────────────────────────────────────────────────────

function DogTrainingSVG({ scene }: { scene: number }) {
  const dogBody = (
    <g>
      <ellipse cx="0" cy="6" rx="22" ry="14" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
      <circle cx="20" cy="-4" r="12" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
      <ellipse cx="16" cy="-14" rx="6" ry="9" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" transform="rotate(-15,16,-14)" />
      <ellipse cx="30" cy="-14" rx="6" ry="9" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" transform="rotate(10,30,-14)" />
      <circle cx="25" cy="-6" r="2" fill="var(--illustration-accent)" />
      <path d="M -18 6 Q -28 4 -22 -4" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="2" strokeLinecap="round" />
      <line x1="-14" y1="18" x2="-12" y2="28" stroke="var(--illustration-element-muted)" strokeWidth="2" strokeLinecap="round" />
      <line x1="-6" y1="19" x2="-4" y2="28" stroke="var(--illustration-element-muted)" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="19" x2="8" y2="28" stroke="var(--illustration-element-muted)" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="18" x2="16" y2="28" stroke="var(--illustration-element-muted)" strokeWidth="2" strokeLinecap="round" />
    </g>
  );

  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <defs>
        <linearGradient id="dt-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-surface-muted)" />
          <stop offset="100%" stopColor="var(--illustration-bg-dim)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="500" height="274" fill="url(#dt-bg)" rx="12" />

      {/* ── Scene 0: Dog starts uncertain ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Dog on left */}
          <g transform="translate(120, 160)">
            {dogBody}
            {/* Question mark */}
            <g style={{ animation: 'tof-float 2s ease-in-out infinite' }}>
              <circle cx="4" cy="-40" r="10" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
              <text x="4" y="-36" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="11" fontFamily="system-ui" fontWeight="700">?</text>
            </g>
          </g>

          {/* Command */}
          <rect x="260" y="120" width="100" height="36" rx="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <text x="310" y="143" textAnchor="middle" fill="var(--illustration-accent)" fontSize="12" fontFamily="system-ui" fontWeight="700">SIT!</text>

          {/* Probability bar — low confidence */}
          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x="170" y="200" width="160" height="18" rx="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            <rect x="172" y="202" width="48" height="14" rx="7" fill="var(--illustration-primary)" opacity="0.6" />
            <text x="250" y="234" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">P(Sit → Treat) = 30% — Dog is unsure</text>
          </g>
        </g>
      )}

      {/* ── Scene 1: Dog gets treat — belief updates ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Dog — now on right, shifted */}
          <g transform="translate(200, 160)">
            {dogBody}
            {/* Happy face */}
            <text x="25" y="-8" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui">✓</text>
          </g>

          {/* Treat */}
          <g transform="translate(310, 140)" style={{ animation: 'tof-float 1.8s ease-in-out infinite' }}>
            <rect x="-10" y="-6" width="20" height="12" rx="4" fill="var(--illustration-warning)" />
            <rect x="-8" y="-8" width="4" height="16" rx="2" fill="var(--illustration-warning)" opacity="0.6" />
            <rect x="4" y="-8" width="4" height="16" rx="2" fill="var(--illustration-warning)" opacity="0.6" />
          </g>

          {/* Correct! badge */}
          <g style={{ animation: 'tof-pop 0.35s 0.3s both' }}>
            <circle cx="360" cy="108" r="14" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1.5" />
            <text x="360" y="113" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="14" fontFamily="system-ui" fontWeight="800">✓</text>
          </g>

          {/* Probability bar — high confidence */}
          <g style={{ animation: 'tof-pop 0.4s 0.5s both' }}>
            <rect x="170" y="200" width="160" height="18" rx="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            <rect x="172" y="202" width="128" height="14" rx="7" fill="var(--illustration-success)" opacity="0.6" />
            <text x="250" y="234" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">P(Sit → Treat) = 80% — Belief updated!</text>
          </g>

          {/* Evidence flowing in */}
          {[0,1,2].map(i => (
            <circle key={`e${i}`} r="3" fill="var(--illustration-warning)" opacity="0.7">
              <animateMotion dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite"
                path={`M ${80 + i * 30} 100 Q 150 80 195 140`} />
            </circle>
          ))}
        </g>
      )}

      {/* ── Scene 2: Bayesian update cycle ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Filtered — ML training loop style */}
          <rect x="30" y="80" width="110" height="42" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
          <text x="85" y="99" textAnchor="middle" fill="var(--illustration-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">Prior</text>
          <text x="85" y="113" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">P(H)</text>

          <rect x="195" y="36" width="110" height="42" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <text x="250" y="55" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="10" fontFamily="system-ui" fontWeight="700">Likelihood</text>
          <text x="250" y="69" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="9" fontFamily="system-ui">P(E|H)</text>

          <rect x="360" y="80" width="110" height="42" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <text x="415" y="99" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">Posterior</text>
          <text x="415" y="113" textAnchor="middle" fill="var(--illustration-success-lighter)" fontSize="9" fontFamily="system-ui">P(H|E)</text>

          {/* Arrows */}
          <line x1="140" y1="101" x2="193" y2="65" stroke="var(--illustration-secondary)" strokeWidth="1.5" strokeDasharray="5,3" />
          <polygon points="189,69 199,61 190,59" fill="var(--illustration-secondary)" />
          <line x1="250" y1="78" x2="250" y2="95" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <polygon points="246,91 254,91 250,100" fill="var(--illustration-warning)" />
          <line x1="305" y1="65" x2="358" y2="101" stroke="var(--illustration-success)" strokeWidth="1.5" strokeDasharray="5,3" />
          <polygon points="354,97 364,105 355,107" fill="var(--illustration-success)" />

          {/* Formula */}
          <g style={{ animation: 'tof-up 0.5s 0.3s both' }}>
            <rect x="100" y="152" width="300" height="36" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <text x="250" y="175" textAnchor="middle" fill="var(--illustration-light)" fontSize="13" fontFamily="system-ui" fontWeight="700">P(H|E) = P(E|H) × P(H) / P(E)</text>
          </g>

          {/* Loop back arrow */}
          <g style={{ animation: 'tof-up 0.5s 0.6s both' }}>
            <path d="M 415 128 Q 250 210 85 128" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
            <polygon points="89,132 85,124 81,132" fill="var(--illustration-secondary)" opacity="0.5" />
            <text x="250" y="200" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">Posterior becomes next Prior</text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ── GPS navigation SVG ────────────────────────────────────────────────────────

function GPSNavigationSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full" style={{ maxHeight: '420px' }}>
      <defs>
        <linearGradient id="gps-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-bg-surface-deeper)" />
          <stop offset="100%" stopColor="var(--illustration-bg-dim)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="500" height="300" fill="url(#gps-bg)" rx="12" />

      {/* Grid */}
      {[80, 130, 180, 230].map(y => (
        <line key={`h${y}`} x1="20" y1={y} x2="480" y2={y} stroke="var(--illustration-surface-alt)" strokeWidth="0.6" opacity="0.15" />
      ))}
      {[80, 170, 260, 350, 440].map(x => (
        <line key={`v${x}`} x1={x} y1="40" x2={x} y2="270" stroke="var(--illustration-surface-alt)" strokeWidth="0.6" opacity="0.15" />
      ))}

      {/* ── Scene 0: GPS — multiple data sources ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Satellite connections */}
          {[[80,60],[130,40],[170,70]].map(([sx, sy], i) => (
            <g key={`sat${i}`}>
              <line x1={sx} y1={sy} x2="250" y2="150" stroke="var(--illustration-info)" strokeWidth="1" strokeDasharray="4,3" opacity="0.3" />
              <circle cx={sx} cy={sy} r="6" fill="var(--illustration-surface)" stroke="var(--illustration-info)" strokeWidth="1.5" />
              <text x={sx} y={sy + 18} textAnchor="middle" fill="var(--illustration-info)" fontSize="7" fontFamily="system-ui">SAT</text>
            </g>
          ))}

          {/* Map area */}
          <rect x="180" y="80" width="280" height="170" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />

          {/* Roads on map */}
          <path d="M 230 130 L 330 120 L 400 180 L 440 160" fill="none" stroke="var(--illustration-surface-mid)" strokeWidth="2" opacity="0.4" />
          <path d="M 210 200 L 290 210 L 370 190 L 430 220" fill="none" stroke="var(--illustration-surface-mid)" strokeWidth="2" opacity="0.4" />
          <path d="M 220 150 L 300 190 L 380 200" fill="none" stroke="var(--illustration-warning)" strokeWidth="2.5" opacity="0.6" />

          {/* Traffic indicator */}
          <rect x="340" y="185" width="20" height="10" rx="3" fill="var(--illustration-danger)" opacity="0.5" />

          {/* Start / Goal */}
          <circle cx="200" cy="120" r="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="2" />
          <text x="200" y="124" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="800">A</text>
          <circle cx="440" cy="140" r="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-dim)" strokeWidth="2" />
          <text x="440" y="144" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="9" fontFamily="system-ui" fontWeight="800">B</text>

          {/* Data sources sidebar */}
          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x="20" y="100" width="130" height="110" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
            <text x="85" y="120" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui" fontWeight="600">INPUTS</text>
            <text x="85" y="140" textAnchor="middle" fill="var(--illustration-info)" fontSize="9" fontFamily="system-ui">📍 Satellites</text>
            <text x="85" y="158" textAnchor="middle" fill="var(--illustration-warning)" fontSize="9" fontFamily="system-ui">🚦 Traffic</text>
            <text x="85" y="176" textAnchor="middle" fill="var(--illustration-success)" fontSize="9" fontFamily="system-ui">🗺️ Map Data</text>
            <text x="85" y="194" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">📡 Historical</text>
          </g>

          <text x="250" y="270" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui">GPS combines satellites, traffic, maps — multiple signals into one position</text>
        </g>
      )}

      {/* ── Scene 1: Evidence propagates ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Map */}
          <rect x="50" y="60" width="400" height="170" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />

          {/* Roads */}
          <path d="M 80 130 Q 200 80 320 120 L 420 100" fill="none" stroke="var(--illustration-surface-mid)" strokeWidth="2" opacity="0.3" />
          <path d="M 80 180 Q 220 240 350 210 L 420 100" fill="none" stroke="var(--illustration-surface-mid)" strokeWidth="2" opacity="0.3" />

          {/* New traffic data appears — highlighted */}
          <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
            <rect x="280" y="110" width="60" height="24" rx="4" fill="var(--illustration-danger-bg)" stroke="var(--illustration-danger)" strokeWidth="1.5" />
            <text x="310" y="126" textAnchor="middle" fill="var(--illustration-danger)" fontSize="9" fontFamily="system-ui" fontWeight="800">ACCIDENT</text>
          </g>

          {/* Route recalculates — highlighted path shifts */}
          <path d="M 80 180 Q 220 240 350 210 L 420 100" fill="none" stroke="var(--illustration-secondary)" strokeWidth="3.5" opacity="0.85"
            style={{ filter: 'drop-shadow(0 0 5px rgba(129,140,248,0.5))' }} />
          <circle r="5" fill="var(--illustration-secondary)" opacity="0.9">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 80 180 Q 220 240 350 210 L 420 100" />
          </circle>

          {/* Old route — dimmed */}
          <path d="M 80 130 Q 200 80 320 120 L 420 100" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.2" />

          {/* Start / Goal */}
          <circle cx="80" cy="150" r="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="2" />
          <text x="80" y="154" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="800">A</text>
          <circle cx="420" cy="100" r="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-dim)" strokeWidth="2" />
          <text x="420" y="104" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="10" fontFamily="system-ui" fontWeight="800">B</text>

          {/* Propagation arrows */}
          <g style={{ animation: 'tof-up 0.5s 0.4s both' }}>
            <line x1="310" y1="110" x2="310" y2="90" stroke="var(--illustration-danger)" strokeWidth="1.5" strokeDasharray="3,3" />
            <polygon points="306,94 314,94 310,86" fill="var(--illustration-danger)" />
            <text x="310" y="84" textAnchor="middle" fill="var(--illustration-danger)" fontSize="8" fontFamily="system-ui">Arrival Time: +15min</text>
          </g>

          <text x="250" y="270" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui">One new signal updates everything connected — just like a Bayesian Network</text>
        </g>
      )}

      {/* ── Scene 2: Bayesian Network structure ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Nodes arranged as a BN graph */}
          {[
            { x: 100, y: 80, label: 'Rain', color: 'var(--illustration-primary)' },
            { x: 100, y: 210, label: 'Sprinkler', color: 'var(--illustration-warning)' },
            { x: 250, y: 145, label: 'Grass Wet', color: 'var(--illustration-success)' },
            { x: 400, y: 80, label: 'Slippery', color: 'var(--illustration-accent)' },
            { x: 400, y: 210, label: 'Late', color: 'var(--illustration-accent-pink)' },
          ].map((node, i) => (
            <g key={`n${i}`} style={{ animation: `tof-pop 0.4s ${0.2 + i * 0.12}s both` }}>
              <circle cx={node.x} cy={node.y} r="22" fill="var(--illustration-surface)" stroke={node.color} strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 4px ${node.color}40)` }} />
              <text x={node.x} y={node.y + 3} textAnchor="middle" fill={node.color} fontSize="9" fontFamily="system-ui" fontWeight="700">{node.label}</text>
            </g>
          ))}

          {/* Edges */}
          {[
            [0, 2], [1, 2], [2, 3], [2, 4]
          ].map(([from, to], i) => {
            const f = [{x:100,y:80},{x:100,y:210},{x:250,y:145},{x:400,y:80},{x:400,y:210}][from];
            const t = [{x:100,y:80},{x:100,y:210},{x:250,y:145},{x:400,y:80},{x:400,y:210}][to];
            const dx = t.x - f.x, dy = t.y - f.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const ux = dx/dist * 22, uy = dy/dist * 22;
            return (
              <g key={`e${i}`} style={{ animation: `tof-conn 0.6s ${0.7 + i * 0.15}s both` }}>
                <line x1={f.x + ux} y1={f.y + uy} x2={t.x - ux} y2={t.y - uy}
                  stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,3" />
                <polygon points={`${t.x - ux - 4},${t.y - uy - 3} ${t.x - ux + 4},${t.y - uy + 3} ${t.x - ux + 4},${t.y - uy - 3}`}
                  fill="var(--illustration-element-muted)" opacity="0.5" />
              </g>
            );
          })}

          {/* Evidence highlight */}
          <g style={{ animation: 'tof-node 2s 1.5s infinite' }}>
            <circle cx="100" cy="80" r="26" fill="none" stroke="var(--illustration-primary)" strokeWidth="2" opacity="0.4" />
          </g>
          <g style={{ animation: 'tof-signal 2s 1.8s infinite' }}>
            <line x1="130" y1="90" x2="220" y2="135" stroke="var(--illustration-primary)" strokeWidth="2" opacity="0.6" />
          </g>
          <g style={{ animation: 'tof-signal 2s 2.2s infinite' }}>
            <line x1="280" y1="155" x2="370" y2="90" stroke="var(--illustration-success)" strokeWidth="2" opacity="0.6" />
          </g>

          <text x="250" y="270" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui">Observe Rain → Grass Wet updates → Slippery and Late both update</text>
        </g>
      )}
    </svg>
  );
}

// ── Delivery Rider SVG — Greedy vs A* ───────────────────────────────────────
//
//  scene 0 : City map — restaurant, customer, traffic obstacles
//  scene 1 : Greedy picks the closest-looking road
//  scene 2 : Greedy hits gridlock, must backtrack
//  scene 3 : A* evaluates g(n)+h(n), takes smarter route
//  scene 4 : A* delivers; Greedy still stuck in traffic

function Scooter({ color = 'var(--illustration-warning)' }: { color?: string }) {
  return (
    <g>
      <rect x="-10" y="-6" width="20" height="10" rx="4" fill={color} opacity="0.9" />
      <rect x="-10" y="-6" width="20" height="3" rx="1.5" fill="white" opacity="0.2" />
      <line x1="-10" y1="-6" x2="-14" y2="-12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="-8" y1="-12" x2="-14" y2="-12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2" y="-10" width="12" height="5" rx="2" fill={color} opacity="0.7" />
      <circle cx="-6" cy="4" r="4.5" fill={color} stroke="var(--illustration-surface-alt)" strokeWidth="1" />
      <circle cx="7" cy="4" r="4.5" fill={color} stroke="var(--illustration-surface-alt)" strokeWidth="1" />
    </g>
  );
}

function House({ x, y, color = 'var(--illustration-success-dim)' }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-16" y="-8" width="32" height="20" rx="2" fill="var(--illustration-surface-mid-alt)" stroke={color} strokeWidth="1.5" />
      <polygon points="-18,-8 0,-20 18,-8" fill={color} opacity="0.8" />
      <rect x="-6" y="0" width="12" height="12" rx="1" fill="#1a2a4a" stroke={color} strokeWidth="1" opacity="0.6" />
      <circle cx="0" cy="6" r="1.5" fill={color} opacity="0.8" />
    </g>
  );
}

function Restaurant({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-16" y="-8" width="32" height="20" rx="2" fill="var(--illustration-surface-mid-alt)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
      <rect x="-16" y="-8" width="32" height="5" rx="1" fill="var(--illustration-primary)" opacity="0.3" />
      <text x="0" y="4" textAnchor="middle" fill="var(--illustration-accent)" fontSize="12" fontFamily="system-ui" fontWeight="800">R</text>
    </g>
  );
}

function TrafficCone({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points="-5,-6 5,-6 7,8 -7,8" fill="var(--illustration-danger)" opacity="0.85" />
      <rect x="-4" y="-8" width="8" height="3" rx="1" fill="var(--illustration-danger)" opacity="0.7" />
      <rect x="-3" y="-2" width="6" height="2" rx="0.5" fill="white" opacity="0.5" />
    </g>
  );
}

function GreedyVsAStarSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full" style={{ maxHeight: '420px' }}>
      <defs>
        <linearGradient id="dr-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-bg-surface-deeper)" />
          <stop offset="100%" stopColor="var(--illustration-bg-dim)" />
        </linearGradient>
        <linearGradient id="amber-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--illustration-warning)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--illustration-warning)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-warning)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="blue-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--illustration-secondary)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--illustration-secondary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-secondary)" stopOpacity="0" />
        </linearGradient>
        <filter id="glow-amber">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-blue">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="500" height="300" fill="url(#dr-bg)" rx="12" />

      {/* ── Building silhouettes ── */}
      {[
        { x: 35, w: 28, h: 40, y: 60 },
        { x: 75, w: 20, h: 25, y: 75 },
        { x: 110, w: 32, h: 55, y: 45 },
        { x: 155, w: 24, h: 30, y: 70 },
        { x: 200, w: 18, h: 45, y: 55 },
        { x: 240, w: 30, h: 35, y: 65 },
        { x: 285, w: 22, h: 50, y: 50 },
        { x: 320, w: 28, h: 28, y: 72 },
        { x: 360, w: 24, h: 42, y: 58 },
        { x: 400, w: 30, h: 48, y: 52 },
        { x: 445, w: 22, h: 32, y: 68 },
      ].map((b, i) => (
        <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="var(--illustration-surface-dark-alt)" opacity="0.4" />
      ))}

      {/* ── Road grid ── */}
      {[70, 120, 170, 220, 270].map(y => (
        <line key={`h${y}`} x1="25" y1={y} x2="475" y2={y} stroke="var(--illustration-surface-alt)" strokeWidth="1" opacity="0.15" />
      ))}
      {[80, 160, 240, 320, 400].map(x => (
        <line key={`v${x}`} x1={x} y1="40" x2={x} y2="285" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.1" />
      ))}
      {/* Road markings */}
      {[120, 170, 220].map(y => (
        <line key={`rm${y}`} x1="25" y1={y} x2="475" y2={y} stroke="#2a3a5a" strokeWidth="0.5" strokeDasharray="6,8" opacity="0.2" />
      ))}

      {/* ── Landmarks (consistent across scenes) ── */}

      {/* Restaurant (Start) */}
      <Restaurant x={60} y={195} />
      {scene >= 1 && (
        <g transform="translate(60, 215)" style={{ animation: 'tof-float 2.5s ease-in-out infinite' }}>
            <Scooter color={scene >= 3 ? 'var(--illustration-secondary)' : 'var(--illustration-warning)'} />
        </g>
      )}

      {/* Customer (Goal) */}
      <House x={440} y={90} />

      {/* Traffic obstacle (shared) */}
      <TrafficCone x={345} y={110} />
      <rect x="350" y="116" width="3" height="16" rx="1" fill="var(--illustration-danger)" opacity="0.5" />

      {/* ── Scene 0: The Delivery ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Route options */}
          <path d="M 80 180 Q 200 80 320 120 L 440 90" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.4" />
          <path d="M 80 210 Q 220 270 350 230 L 440 90" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.4" />
          <path d="M 80 210 Q 180 240 280 250 L 440 90" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.3" />

          {/* Scooter at start */}
          <g transform="translate(60, 210)" style={{ animation: 'tof-float 2.5s ease-in-out infinite' }}>
            <Scooter />
          </g>

          {/* Route labels */}
          <text x="200" y="110" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" opacity="0.6">Shortest but blocked</text>
          <text x="280" y="280" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" opacity="0.6">Longer but clear</text>

          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x="130" y="38" width="240" height="28" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" opacity="0.9" />
            <text x="250" y="57" textAnchor="middle" fill="var(--illustration-light)" fontSize="13" fontFamily="system-ui" fontWeight="700">A delivery to make — traffic ahead</text>
          </g>
        </g>
      )}

      {/* ── Scene 1: Greedy Picks Closest ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Both route options visible */}
          <path d="M 76 180 Q 200 80 320 120 L 440 90" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="2" opacity="0.15" />

          {/* Greedy path highlighted */}
          <path d="M 76 200 Q 220 260 345 160 L 440 90" fill="none" stroke="var(--illustration-warning)" strokeWidth="3" opacity="0.85"
            style={{ filter: 'url(#glow-amber)' }} />
          <circle r="5" fill="var(--illustration-warning)" opacity="0.9">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 76 200 Q 220 260 345 160 L 440 90" />
          </circle>

          {/* h(n) visual — short distance marker */}
          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x="285" y="220" width="50" height="24" rx="8" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="310" y="236" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">h(n)=4</text>
          </g>

          {/* Thought bubble */}
          <g transform="translate(200, 55)" style={{ animation: 'tof-pop 0.4s 0.6s both' }}>
            <ellipse cx="0" cy="0" rx="100" ry="22" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="1" opacity="0.9" />
            <polygon points="-30,20 -15,28 -20,18" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="12" fontFamily="system-ui" fontWeight="700">That looks closest! →</text>
          </g>

          {/* Lower route dimmed */}
          <path d="M 76 210 Q 180 280 280 260 L 440 90" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.25" />

          <text x="310" y="190" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" opacity="0.5">Greedy ignores this road</text>
        </g>
      )}

      {/* ── Scene 2: Greedy hits dead-end ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Greedy path to obstacle */}
          <path d="M 76 200 Q 220 260 345 160" fill="none" stroke="var(--illustration-warning)" strokeWidth="3" opacity="0.9" />

          {/* Traffic standstill */}
          <g transform="translate(345, 150)">
            <rect x="-30" y="-4" width="60" height="20" rx="4" fill="var(--illustration-danger-bg)" stroke="var(--illustration-danger)" strokeWidth="1.5" />
            <text x="0" y="10" textAnchor="middle" fill="var(--illustration-danger)" fontSize="10" fontFamily="system-ui" fontWeight="800">GRIDLOCK</text>
            {/* Cars in traffic */}
            {[0, 1, 2].map(i => (
              <rect key={`car${i}`} x={-28 + i * 18} y="6" width="14" height="8" rx="2" fill="var(--illustration-danger)" opacity="0.3 + i * 0.15" />
            ))}
          </g>

          {/* Backtrack arrow */}
          <path d="M 330 175 Q 200 130 130 180" fill="none" stroke="var(--illustration-warning)" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.5" />
          <polygon points="126,176 136,174 128,184" fill="var(--illustration-warning)" opacity="0.5" />
          <text x="220" y="140" textAnchor="middle" fill="var(--illustration-warning)" fontSize="9" fontFamily="system-ui">must backtrack</text>

          {/* A* continues on lower route (dim) */}
          <path d="M 76 210 Q 180 280 280 260 L 440 90" fill="none" stroke="var(--illustration-secondary)" strokeWidth="2" opacity="0.4" />
          <circle r="4" fill="var(--illustration-secondary)" opacity="0.5">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 76 210 Q 180 280 280 260 L 440 90" />
          </circle>

          <g style={{ animation: 'tof-pop 0.4s 0.5s both' }}>
            <rect x="100" y="262" width="300" height="26" rx="8" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="250" y="280" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="12" fontFamily="system-ui" fontWeight="700">Greedy ignored traffic. Now it's stuck.</text>
          </g>
        </g>
      )}

      {/* ── Scene 3: A* Considers Both ── */}
      {scene === 3 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Fork in road — two options shown with costs */}
          <circle cx="160" cy="200" r="5" fill="var(--illustration-secondary)" opacity="0.8" />

          {/* Option A (greedy — rejected) */}
          <path d="M 160 200 Q 240 160 320 150" fill="none" stroke="var(--illustration-warning)" strokeWidth="2" strokeDasharray="5,4" opacity="0.3" />
          <g style={{ animation: 'tof-pop 0.3s 0.3s both' }}>
            <rect x="200" y="140" width="120" height="22" rx="6" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="0.5" opacity="0.5" />
            <text x="260" y="155" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="10" fontFamily="system-ui" fontWeight="600">g=6 + h=1 = 7</text>
          </g>

          {/* Option B (A* — chosen) */}
          <path d="M 160 200 Q 250 260 380 190 L 440 90" fill="none" stroke="var(--illustration-secondary)" strokeWidth="3" opacity="0.9"
            style={{ filter: 'url(#glow-blue)' }} />
          <g>
            <circle r="5" fill="var(--illustration-secondary)" opacity="0.9">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M 160 200 Q 250 260 380 190 L 440 90" />
            </circle>
          </g>
          <g style={{ animation: 'tof-pop 0.3s 0.5s both' }}>
            <rect x="230" y="262" width="120" height="22" rx="6" fill="var(--illustration-surface-mid-alt)" stroke="var(--illustration-secondary)" strokeWidth="0.5" />
            <text x="290" y="277" textAnchor="middle" fill="var(--illustration-light)" fontSize="10" fontFamily="system-ui" fontWeight="600">g=3 + h=3 = 6 ✓</text>
          </g>

          {/* A* thought */}
          <g transform="translate(250, 50)" style={{ animation: 'tof-pop 0.4s 0.7s both' }}>
            <ellipse cx="0" cy="0" rx="115" ry="28" fill="var(--illustration-surface-mid-alt)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <polygon points="-20,24 -8,34 -14,20" fill="var(--illustration-surface-mid-alt)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <text x="0" y="-5" textAnchor="middle" fill="var(--illustration-light)" fontSize="11" fontFamily="system-ui" fontWeight="600">f(n) = g(n) + h(n)</text>
            <text x="0" y="10" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="10" fontFamily="system-ui">"This route is cheaper overall"</text>
          </g>
        </g>
      )}

      {/* ── Scene 4: A* arrives ── */}
      {scene === 4 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Greedy still stuck (dim background) */}
          <g opacity="0.15">
            <path d="M 76 200 Q 220 260 345 160" fill="none" stroke="var(--illustration-warning)" strokeWidth="2" opacity="0.3" />
            <path d="M 330 175 Q 200 130 130 180" fill="none" stroke="var(--illustration-warning)" strokeWidth="1" strokeDasharray="4,3" />
            <text x="200" y="115" textAnchor="middle" fill="var(--illustration-warning)" fontSize="9" fontFamily="system-ui">Greedy still backtracking</text>
          </g>

          {/* A* path — fully highlighted */}
          <path d="M 76 210 Q 180 280 280 260 L 440 90" fill="none" stroke="var(--illustration-secondary)" strokeWidth="4"
            style={{ filter: 'url(#glow-blue)' }} />
          <circle r="5" fill="var(--illustration-secondary)" opacity="0.9">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 76 210 Q 180 280 280 260 L 440 90" />
          </circle>

          {/* Customer reached — celebration */}
          <g transform="translate(440, 90)">
            <circle r="24" fill="none" stroke="var(--illustration-success-dim)" strokeWidth="2" opacity="0.3"
              style={{ animation: 'tof-pulse-ring 2s infinite' }} />
            <circle r="18" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-dim)" strokeWidth="3" />
            <text x="0" y="-5" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="11" fontFamily="system-ui" fontWeight="800">✓</text>
          </g>

          {/* Delivered badge */}
          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x="145" y="240" width="210" height="34" rx="12" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-dim)" strokeWidth="1.5" />
            <text x="250" y="262" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="14" fontFamily="system-ui" fontWeight="700">✓ A* delivers on time</text>
          </g>

          {/* Winner card */}
          <g style={{ animation: 'tof-up 0.5s 0.6s both' }}>
            <rect x="100" y="44" width="300" height="32" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <text x="250" y="64" textAnchor="middle" fill="var(--illustration-light)" fontSize="13" fontFamily="system-ui" fontWeight="700">A*: "That is the smartest overall route."</text>
          </g>
        </g>
      )}

    </svg>
  );
}

// ── Orchestra SVG — many instruments, one symphony ──────────────────────────
function OrchestraSVG({ scene }: { scene: number }) {
  const instPos = [
    { x: 50, label: 'Violin', color: 'var(--illustration-accent)' },
    { x: 150, label: 'Trumpet', color: 'var(--illustration-light)' },
    { x: 250, label: 'Drums', color: 'var(--illustration-lightest)' },
    { x: 350, label: 'Flute', color: 'var(--illustration-accent-faint)' },
    { x: 450, label: 'Piano', color: 'var(--illustration-secondary)' },
  ];

  return (
    <svg viewBox="0 0 500 340" className="w-full" style={{ maxHeight: '470px' }}>
      <defs>
        <radialGradient id="sp-ai" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sp-ml" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--illustration-accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="or-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.02" />
          <stop offset="100%" stopColor="var(--illustration-bg-dark)" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="500" height="340" fill="#0c0a1a" />

      {/* ── Curtains ── */}
      <path d="M-5 0 Q40 60 50 130 Q30 200 -5 340 L-5 0Z" fill="var(--illustration-bg-accent-alt)" opacity={scene === 4 ? 0.3 : 0.5}>
        <animate attributeName="opacity" values="0.5;0.3;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </path>
      <path d="M505 0 Q460 60 450 130 Q470 200 505 340 L505 0Z" fill="var(--illustration-bg-accent-alt)" opacity={scene === 4 ? 0.3 : 0.5}>
        <animate attributeName="opacity" values="0.5;0.3;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </path>
      <path d="M-5 0 L505 0 L505 8 Q400 20 250 18 Q100 20 -5 8Z" fill="var(--illustration-bg-accent-alt)" opacity={scene === 4 ? 0.3 : 0.6} />

      {/* ── Stage floor ── */}
      <ellipse cx="250" cy="260" rx="210" ry="55" fill="url(#or-floor)" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.12" />
      <path d="M50 250 Q250 220 450 250 L450 255 Q250 225 50 255Z" fill="var(--illustration-primary)" opacity="0.04" />

      {/* ── Scene 0: Instruments scattered with gaps ── */}
      {scene === 0 && (
        <g>
          {instPos.map((inst, i) => (
            <g key={i}>
              <rect x={inst.x - 35} y="175" width="70" height="40" rx="6" fill="none" stroke={inst.color} strokeWidth="1" opacity={0.35}
                style={{ animation: `tof-up 0.5s ${i * 0.15}s both` }} />
              <text x={inst.x} y="199" textAnchor="middle" fill={inst.color} fontSize="13" fontFamily="system-ui" fontWeight="600" opacity={0.65}>
                {inst.label}
              </text>
            </g>
          ))}
          <text x="250" y="100" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="13" fontFamily="system-ui" style={{ animation: 'tof-up 0.5s 0.5s both' }}>
            Different instruments
          </text>
          <text x="250" y="118" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="12" fontFamily="system-ui" style={{ animation: 'tof-up 0.5s 0.7s both' }}>
            Each with its own sound
          </text>
          <text x="250" y="305" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="12" fontFamily="system-ui" style={{ animation: 'tof-float 2s ease-in-out infinite' }}>
            One orchestra, many voices
          </text>
        </g>
      )}

      {/* ── Scene 1: Instruments grouped, different roles emphasized ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {[
            { x: 50, section: 'Strings', color: 'var(--illustration-accent)' },
            { x: 150, section: 'Brass', color: 'var(--illustration-light)' },
            { x: 250, section: 'Percussion', color: 'var(--illustration-lightest)' },
            { x: 350, section: 'Woodwind', color: 'var(--illustration-accent-faint)' },
            { x: 450, section: 'Keys', color: 'var(--illustration-secondary)' },
          ].map((s, i) => (
            <g key={i}>
              <rect x={s.x - 35} y="160" width="70" height="46" rx="6" fill={s.color} opacity="0.04" stroke={s.color} strokeWidth="0.5" strokeOpacity="0.2" />
              <text x={s.x} y="176" textAnchor="middle" fill={s.color} fontSize="10" fontFamily="system-ui" fontWeight="600" opacity="0.6">{s.section}</text>
              <text x={s.x} y="196" textAnchor="middle" fill={s.color} fontSize="13" fontFamily="system-ui" fontWeight="600">{instPos[i].label}</text>
            </g>
          ))}
          <text x="250" y="103" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="13" fontFamily="system-ui">Each instrument has its own section and role</text>
          <text x="250" y="305" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="12" fontFamily="system-ui">Different voices, different strengths</text>
        </g>
      )}

      {/* ── Scene 2: Conductor unites them ── */}
      {scene === 2 && (
        <g>
          {instPos.map((inst, i) => (
            <text key={i} x={inst.x} y="202" textAnchor="middle" fill={inst.color} fontSize="13" fontFamily="system-ui" fontWeight="600">{inst.label}</text>
          ))}
          {/* Connection lines from conductor to instruments */}
          <g stroke="var(--illustration-secondary)" strokeWidth="0.8" opacity="0.25">
            <line x1="250" y1="148" x2={instPos[0].x} y2="194">
              <animate attributeName="opacity" values="0;0.35;0" dur="2s" begin="0s" repeatCount="indefinite" />
            </line>
            <line x1="250" y1="148" x2={instPos[1].x} y2="194">
              <animate attributeName="opacity" values="0;0.35;0" dur="2s" begin="0.3s" repeatCount="indefinite" />
            </line>
            <line x1="250" y1="148" x2={instPos[2].x} y2="194">
              <animate attributeName="opacity" values="0;0.35;0" dur="2s" begin="0.6s" repeatCount="indefinite" />
            </line>
            <line x1="250" y1="148" x2={instPos[3].x} y2="194">
              <animate attributeName="opacity" values="0;0.35;0" dur="2s" begin="0.9s" repeatCount="indefinite" />
            </line>
            <line x1="250" y1="148" x2={instPos[4].x} y2="194">
              <animate attributeName="opacity" values="0;0.35;0" dur="2s" begin="1.2s" repeatCount="indefinite" />
            </line>
          </g>
          {/* Conductor */}
          <g transform="translate(250, 130)">
            <rect x="-18" y="20" width="36" height="10" rx="3" fill="var(--illustration-secondary)" opacity="0.15" />
            <rect x="-12" y="26" width="24" height="5" rx="1.5" fill="var(--illustration-secondary)" opacity="0.1" />
            <rect x="-6" y="6" width="12" height="16" rx="3" fill="var(--illustration-secondary)" opacity="0.2" />
            <circle cx="0" cy="0" r="7" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.5" opacity="0.5" />
            <line x1="6" y1="9" x2="22" y2="-4" stroke="var(--illustration-secondary)" strokeWidth="1.5" strokeLinecap="round">
              <animate attributeName="x2" values="22;18;26;22" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="y2" values="-4;-8;0;-4" dur="0.8s" repeatCount="indefinite" />
            </line>
            <line x1="-6" y1="9" x2="-20" y2="0" stroke="var(--illustration-secondary)" strokeWidth="1.2" strokeLinecap="round">
              <animate attributeName="x2" values="-20;-16;-24;-20" dur="0.8s" begin="0.15s" repeatCount="indefinite" />
              <animate attributeName="y2" values="0;4;-4;0" dur="0.8s" begin="0.15s" repeatCount="indefinite" />
            </line>
            <text x="0" y="42" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="11" fontFamily="system-ui" fontWeight="700" opacity="0.7">Conductor</text>
          </g>
          <text x="250" y="98" textAnchor="middle" fill="var(--illustration-light)" fontSize="13" fontFamily="system-ui" fontWeight="600" style={{ animation: 'tof-up 0.5s both' }}>
            The conductor unites every instrument
          </text>
          <text x="250" y="305" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="12" fontFamily="system-ui" style={{ animation: 'tof-up 0.5s 0.3s both' }}>
            One beat, one direction
          </text>
        </g>
      )}

      {/* ── Scene 3: Full symphony — AI labels revealed ── */}
      {scene === 3 && (
        <g>
          {instPos.map((inst, i) => (
            <circle key={i} cx={inst.x} cy={190} r={35} fill={inst.color} opacity="0.06">
              <animate attributeName="r" values="30;42;30" dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {instPos.map((inst, i) => (
            <text key={i} x={inst.x} y="182" textAnchor="middle" fill={inst.color} fontSize="13" fontFamily="system-ui" fontWeight="600">{inst.label}</text>
          ))}
          <text x={instPos[0].x} y="200" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="11" fontFamily="system-ui">Face Unlock</text>
          <text x={instPos[1].x} y="200" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="11" fontFamily="system-ui">Google Maps</text>
          <text x={instPos[2].x} y="200" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="11" fontFamily="system-ui">Spam Filter</text>
          <text x={instPos[3].x} y="200" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="11" fontFamily="system-ui">Netflix</text>
          <text x={instPos[4].x} y="200" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="11" fontFamily="system-ui">ChatGPT</text>
          {/* Conductor / AI */}
          <g transform="translate(250, 122)" opacity="0.55">
            <circle cx="0" cy="0" r="6" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.2" />
            <rect x="-5" y="6" width="10" height="14" rx="2.5" fill="var(--illustration-secondary)" opacity="0.2" />
            <rect x="-16" y="22" width="32" height="7" rx="2.5" fill="var(--illustration-secondary)" opacity="0.1" />
            <line x1="5" y1="8" x2="18" y2="-3" stroke="var(--illustration-secondary)" strokeWidth="1.2">
              <animate attributeName="x2" values="18;14;22;18" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="y2" values="-3;-7;1;-3" dur="0.8s" repeatCount="indefinite" />
            </line>
            <text x="0" y="36" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="10" fontFamily="system-ui" fontWeight="700">AI</text>
          </g>
          {/* Sound waves */}
          {instPos.map((inst, i) => (
            <circle key={`w${i}`} cx={inst.x} cy={190} r={14} fill="none" stroke={inst.color} strokeWidth="0.6" opacity="0.3">
              <animate attributeName="r" values="14;28;14" dur="2.5s" begin={`${i*0.4}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" begin={`${i*0.4}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Music notes */}
          {[
            { x: 100, y: 140 }, { x: 185, y: 130 }, { x: 315, y: 135 }, { x: 400, y: 140 },
          ].map((n, i) => (
            <text key={n.x} x={n.x} y={n.y} fill="var(--illustration-light)" fontSize={14} opacity="0.4">
              {['♫','♪','♩','♫'][i]}
              <animate attributeName="y" values={`${n.y};${n.y-20};${n.y}`} dur="1.5s" begin={`${i*0.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" begin={`${i*0.3}s`} repeatCount="indefinite" />
            </text>
          ))}
          <text x="250" y="98" textAnchor="middle" fill="var(--illustration-light)" fontSize="13" fontFamily="system-ui" fontWeight="600" style={{ animation: 'tof-up 0.5s both' }}>
            Different approaches, one purpose
          </text>
          <text x="250" y="305" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="12" fontFamily="system-ui" style={{ animation: 'tof-up 0.5s 0.3s both' }}>
            Every AI makes life easier
          </text>
        </g>
      )}

      {/* ── Scene 4: Goal card crescendo ── */}
      {scene === 4 && (
        <g>
          {/* Faded orchestra in background with converging lines */}
          {instPos.map((inst, i) => (
            <g key={i}>
              <text x={inst.x} y="205" textAnchor="middle" fill={inst.color} fontSize="14" fontFamily="system-ui" fontWeight="600" opacity="0.1">{inst.label}</text>
              <line x1={inst.x} y1="180" x2={250 - (250 - inst.x) * 0.55} y2="130" stroke={inst.color} strokeWidth="0.8" opacity="0.1">
                <animate attributeName="opacity" values="0;0.2;0" dur="2.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              </line>
            </g>
          ))}
          {/* Goal card */}
          <rect x="40" y="88" width="420" height="145" rx="16" fill="var(--illustration-surface)" stroke="var(--illustration-accent)" strokeWidth="1.5" opacity="0.95"
            style={{ animation: 'tof-up 0.5s 0.15s both' }} />
          {/* Pulsing glow behind icon */}
          <circle cx="250" cy="108" r="20" fill="var(--illustration-primary)" opacity="0.1">
            <animate attributeName="r" values="18;26;18" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <text x="250" y="114" textAnchor="middle" fill="var(--illustration-accent)" fontSize="16" fontFamily="system-ui" opacity="0.5"
            style={{ animation: 'tof-up 0.5s 0.2s both' }}>✦</text>
          {/* Title */}
          <text x="250" y="138" textAnchor="middle" fill="var(--illustration-light)" fontSize="20" fontFamily="system-ui" fontWeight="800"
            style={{ animation: 'tof-up 0.5s 0.25s both' }}>One Symphony</text>
          <text x="250" y="160" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="12" fontFamily="system-ui"
            style={{ animation: 'tof-up 0.5s 0.35s both' }}>Five AI services, one purpose</text>
          {/* AI service chips */}
          {[
            { name: 'Face Unlock', color: 'var(--illustration-secondary)' },
            { name: 'Maps', color: 'var(--illustration-accent)' },
            { name: 'Spam Filter', color: 'var(--illustration-light)' },
            { name: 'Netflix', color: 'var(--illustration-lightest)' },
            { name: 'ChatGPT', color: 'var(--illustration-success-bright)' },
          ].map((chip, i) => (
            <g key={chip.name} style={{ animation: `tof-pop 0.35s ${(0.45 + i * 0.1).toFixed(2)}s both` }}>
              <rect x={64 + i * 78} y="170" width={68} height="24" rx="7" fill={chip.color} opacity="0.08" />
              <text x={98 + i * 78} y="186" textAnchor="middle" fill={chip.color} fontSize="11" fontFamily="system-ui" fontWeight="600">{chip.name}</text>
            </g>
          ))}
          {/* Bottom highlight */}
          <rect x="150" y="204" width="200" height="24" rx="10" fill="var(--illustration-success-dim)" opacity="0.1"
            style={{ animation: 'tof-up 0.5s 0.95s both' }} />
          <text x="250" y="220" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="14" fontFamily="system-ui" fontWeight="700"
            style={{ animation: 'tof-up 0.5s 0.95s both' }}>Making life easier</text>
        </g>
      )}
    </svg>
  );
}

// ── Building Search SVG — BFS vs DFS (Friend on 10th Floor) ──────────────────

const BLDG_CX = 250;
const FLOORS = [
  { label: '10F', y: 40, r1x: 210, r2x: 290, friend: true },
  { label: '8F',  y: 78 },
  { label: '6F',  y: 116 },
  { label: '4F',  y: 154 },
  { label: '2F',  y: 192 },
  { label: 'GF',  y: 238, lobby: true },
];
// Floor y positions for each floor (index 0 = 10F)
const FL_Y = (i: number) => FLOORS[i].y;
const FLOOR_H = 28;

function BuildingSearchSVG({ scene }: { scene: number }) {
  const R = 10; // room dot radius

  return (
    <svg viewBox="0 0 500 300" className="w-full" style={{ maxHeight: '430px' }}>
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#080e1a" />
          <stop offset="100%" stopColor="#04080f" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="500" height="300" fill="url(#bgGrad)" />

      {/* ── Floor cards ── */}
      {FLOORS.map((f, i) => (
        <g key={`floor-${i}`}>
          {/* Card background */}
          <rect x={f.lobby ? 165 : 175} y={f.y} width={f.lobby ? 170 : 150} height={FLOOR_H} rx="6"
            fill="var(--illustration-surface-mid-deep)" stroke={scene === 0 ? '#15202b' : 'var(--illustration-surface-alt-deep)'} strokeWidth="1"
            style={{ transition: 'stroke 500ms' }} />
          {/* Floor label */}
          <text x={f.lobby ? 175 : 183} y={f.y + FLOOR_H / 2 + 1} fill="var(--illustration-surface-mid)" fontSize="8" fontFamily="system-ui" fontWeight="700">
            {f.label}
          </text>

          {/* Room dots */}
          {!f.lobby && (
            <>
              <circle cx={210} cy={f.y + FLOOR_H / 2} r={R}
                fill={dotFill(scene, i, 'l')} stroke={dotStroke(scene, i, 'l')} strokeWidth="1.5"
                style={{ transition: 'fill 400ms, stroke 400ms' }} />
              <circle cx={290} cy={f.y + FLOOR_H / 2} r={R}
                fill={dotFill(scene, i, 'r')} stroke={dotStroke(scene, i, 'r')} strokeWidth="1.5"
                style={{ transition: 'fill 400ms, stroke 400ms' }} />
            </>
          )}

          {/* Lobby */}
          {f.lobby && (
            <g>
              <rect x="195" y={f.y + 4} width="110" height={FLOOR_H - 8} rx="4" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
              <text x="250" y={f.y + FLOOR_H / 2 + 1} textAnchor="middle" fill="var(--illustration-element-muted)" fontSize="7" fontFamily="system-ui">Lobby</text>
            </g>
          )}

          {/* Friend star on 10F */}
          {f.friend && (
            <text x="250" y={f.y - 6} textAnchor="middle" fill="var(--illustration-warning)" fontSize="8" fontFamily="system-ui" fontWeight="800"
              style={{ animation: scene === 0 || scene >= 3 ? 'tof-float 1.8s ease-in-out infinite' : 'none' }}>
              {scene === 0 ? '? Friend' : scene >= 3 ? 'Friend!' : 'Friend'}
            </text>
          )}

          {/* BFS checkmark */}
          {scene === 1 && !f.lobby && (
            <text x="250" y={f.y + FLOOR_H / 2 + 1} textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="9" fontFamily="system-ui" fontWeight="800"
              style={{ animation: `tof-pop 0.3s ${i * 0.3 + 0.15}s both` }}>&#10003;</text>
          )}

          {/* DFS found star */}
          {scene === 2 && f.friend && (
            <>
              <text x={210} y={f.y + FLOOR_H / 2 + 1} textAnchor="middle" fill="var(--illustration-warning)" fontSize="10" fontFamily="system-ui" fontWeight="800"
                style={{ animation: 'tof-pop 0.3s 1.2s both' }}>&#9733;</text>
              <circle cx={210} cy={f.y + FLOOR_H / 2} r={16}
                fill="none" stroke="var(--illustration-warning)" strokeWidth="1"
                style={{ animation: 'tof-wave 1.5s 1.4s ease-in-out infinite' }} />
            </>
          )}
        </g>
      ))}

      {/* ── Connecting lines (the search path) ── */}
      {scene === 1 && (
        <g>
          {[0,1,2,3,4].map(i => (
            <line key={`bline-${i}`} x1={250} y1={FL_Y(i) + FLOOR_H} x2={250} y2={FL_Y(i + 1)}
              stroke="var(--illustration-deep)" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.4"
              style={{ animation: `tof-up 0.3s ${i * 0.3 + 0.3}s both` }} />
          ))}
          {/* Pulsing scan beam */}
          <rect x="165" y={FL_Y(5) - 4} width="170" height="6" rx="3" fill="var(--illustration-primary)" opacity="0.25"
            style={{ animation: 'bfs-sweep 4s ease-in-out infinite' }} />
        </g>
      )}

      {scene === 2 && (
        <g>
          {/* Left-side deep path line */}
          <line x1={210} y1={FL_Y(0) + 10} x2={210} y2={FL_Y(5) + FLOOR_H - 10}
            stroke="var(--illustration-accent)" strokeWidth="2" opacity="0.35"
            style={{ animation: 'tof-up 0.6s 0.2s both' }} />
          {/* Active crawling dot along path */}
          <circle cx={210} cy={FL_Y(5) + FLOOR_H - 10} r="4" fill="var(--illustration-accent)"
            style={{ animation: 'dfs-crawl 3s ease-in-out infinite' }} />
          {/* Right side dotted (unexplored) */}
          <line x1={290} y1={FL_Y(0) + 10} x2={290} y2={FL_Y(5) + FLOOR_H - 10}
            stroke="var(--illustration-surface-alt)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
        </g>
      )}

      {/* Scene 3 — BFS/DFS tags */}
      {scene === 3 && (
        <>
          <rect x="15" y="95" width="75" height="32" rx="8" fill="var(--illustration-surface-mid-deep)" stroke="var(--illustration-primary)" strokeWidth="1"
            style={{ animation: 'tof-pop 0.3s 0.1s both' }} />
          <text x="52" y="108" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">BFS</text>
          <text x="52" y="120" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="6" fontFamily="system-ui">Queue</text>
          <rect x="410" y="95" width="75" height="32" rx="8" fill="var(--illustration-surface-mid-deep)" stroke="var(--illustration-accent)" strokeWidth="1"
            style={{ animation: 'tof-pop 0.3s 0.2s both' }} />
          <text x="447" y="108" textAnchor="middle" fill="var(--illustration-light)" fontSize="9" fontFamily="system-ui" fontWeight="800">DFS</text>
          <text x="447" y="120" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="6" fontFamily="system-ui">Stack</text>
          {/* Arrows */}
          <path d="M 91 111 Q 115 111 130 111" fill="none" stroke="var(--illustration-primary)" strokeWidth="1.2" markerEnd="url(#ab)" />
          <path d="M 370 111 Q 385 111 408 111" fill="none" stroke="var(--illustration-accent)" strokeWidth="1.2" markerEnd="url(#ad)" />
          <defs>
            <marker id="ab" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><polygon points="0,0 5,2.5 0,5" fill="var(--illustration-primary)" /></marker>
            <marker id="ad" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><polygon points="0,0 5,2.5 0,5" fill="var(--illustration-accent)" /></marker>
          </defs>
        </>
      )}

      {/* Scene 4 — Conclusion */}
      {scene === 4 && (
        <>
          <rect x="12" y="85" width="96" height="44" rx="8" fill="var(--illustration-surface-mid-deep)" stroke="var(--illustration-primary)" strokeWidth="1"
            style={{ animation: 'tof-pop 0.3s 0.1s both' }} />
          <text x="60" y="100" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="9" fontFamily="system-ui" fontWeight="800">BFS</text>
          <text x="60" y="116" textAnchor="middle" fill="var(--illustration-accent)" fontSize="13" fontFamily="system-ui" fontWeight="900">5 min</text>
          <text x="60" y="125" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="6" fontFamily="system-ui">guaranteed</text>
          <rect x="392" y="85" width="96" height="44" rx="8" fill="var(--illustration-surface-mid-deep)" stroke="var(--illustration-accent)" strokeWidth="1"
            style={{ animation: 'tof-pop 0.3s 0.2s both' }} />
          <text x="440" y="100" textAnchor="middle" fill="var(--illustration-light)" fontSize="9" fontFamily="system-ui" fontWeight="800">DFS</text>
          <text x="440" y="116" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="13" fontFamily="system-ui" fontWeight="900">2 min</text>
          <text x="440" y="125" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="6" fontFamily="system-ui">direct dive</text>
          {/* Celebration rings */}
          {[0,1,2].map(i => (
            <circle key={`cr-${i}`} cx={250} cy={FL_Y(0) + 12} r={8 + i * 7}
              fill="none" stroke="var(--illustration-warning)" strokeWidth="0.8"
              style={{ animation: `tof-wave 1.8s ${i * 0.15}s ease-in-out infinite` }} />
          ))}
        </>
      )}

      {/* ── Scene labels (bottom area) ── */}
      <text x="250" y="282" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">
        {['10 floors. Friend at the top. How do you search?',
          'BFS: both rooms per floor, level by level.',
          'DFS: one room deep, skip the rest.',
          'Queue vs Stack — both find the friend.',
          'Shortest path vs less memory.'][scene]}
      </text>
    </svg>
  );

  // ── helpers ──
  function dotFill(sc: number, fi: number, side: 'l' | 'r'): string {
    if (sc === 0) return 'var(--illustration-surface)';
    if (sc === 1) return 'var(--illustration-bg-dark)';
    if (sc === 2) return side === 'l' ? 'var(--illustration-bg-dark)' : 'var(--illustration-bg-surface-deeper)';
    if (sc >= 3) return 'var(--illustration-surface-alt-deep)';
    return 'var(--illustration-surface)';
  }
  function dotStroke(sc: number, fi: number, side: 'l' | 'r'): string {
    if (sc === 0) return 'var(--illustration-surface-alt)';
    if (sc === 1) return 'var(--illustration-deep)';
    if (sc === 2) return side === 'l' ? 'var(--illustration-accent)' : 'var(--illustration-surface-alt)';
    if (sc >= 3) return 'var(--illustration-deep)';
    return 'var(--illustration-surface-alt)';
  }
}

// Keep SearchTreeSVG as fallback
function SearchTreeSVG({ scene }: { scene: number }) {
  const nodes = [
    { x: 250, y: 45  },
    { x: 145, y: 140 },
    { x: 355, y: 140 },
    { x: 80,  y: 235 },
    { x: 205, y: 235 },
    { x: 295, y: 235 },
    { x: 420, y: 235 },
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]] as [number,number][];
  const bfsLevel = [0, 1, 1, 2, 2, 2, 2];
  const dfsHighlight = [0, 1, 3];
  const dfsRightPath = [0, 2, 6];

  const nodeStyle = (i: number) => {
    if (scene === 0) return { fill: 'var(--illustration-surface)', stroke: 'var(--illustration-surface-alt)', text: 'var(--illustration-muted-light)' };
    if (scene === 1) {
      if (bfsLevel[i] === 0) return { fill: 'var(--illustration-bg-dark)', stroke: 'var(--illustration-primary)', text: 'var(--illustration-accent)' };
      if (bfsLevel[i] === 1) return { fill: 'var(--illustration-bg-dark)', stroke: 'var(--illustration-secondary)', text: 'var(--illustration-light)' };
      return { fill: 'var(--illustration-surface-alt-deep)', stroke: 'var(--illustration-deep)', text: 'var(--illustration-secondary)' };
    }
    if (scene === 2) {
      if (dfsHighlight.includes(i)) return { fill: 'var(--illustration-bg-dark)', stroke: 'var(--illustration-accent)', text: 'var(--illustration-lightest)' };
      return { fill: 'var(--illustration-bg-surface-deeper)', stroke: 'var(--illustration-surface-alt)', text: 'var(--illustration-element-muted)' };
    }
    if (scene === 3) {
      if (bfsLevel[i] === 0) return { fill: 'var(--illustration-bg-dark)', stroke: 'var(--illustration-primary)', text: 'var(--illustration-accent)' };
      if (bfsLevel[i] === 1) return { fill: 'var(--illustration-bg-dark)', stroke: 'var(--illustration-primary)', text: 'var(--illustration-accent)' };
      if (bfsLevel[i] === 2) return { fill: 'var(--illustration-surface-alt-deep)', stroke: 'var(--illustration-deep)', text: 'var(--illustration-secondary)' };
      return { fill: 'var(--illustration-surface)', stroke: 'var(--illustration-surface-alt)', text: 'var(--illustration-muted-light)' };
    }
    if (scene === 4) {
      if (bfsLevel[i] <= 1) return { fill: 'var(--illustration-bg-dark)', stroke: 'var(--illustration-primary)', text: 'var(--illustration-accent)' };
      if (dfsRightPath.includes(i)) return { fill: 'var(--illustration-bg-dark)', stroke: 'var(--illustration-accent)', text: 'var(--illustration-lightest)' };
      return { fill: 'var(--illustration-bg-surface-deeper)', stroke: 'var(--illustration-surface-alt)', text: 'var(--illustration-element-muted)' };
    }
    return { fill: 'var(--illustration-surface)', stroke: 'var(--illustration-surface-alt)', text: 'var(--illustration-muted-light)' };
  };

  const edgeColor = (from: number, to: number) => {
    if (scene === 1) return 'var(--illustration-deep)';
    if (scene === 2 && dfsHighlight.includes(from) && dfsHighlight.includes(to)) return 'var(--illustration-accent)';
    if (scene === 3) return 'var(--illustration-deep)';
    if (scene === 4) {
      if ((bfsLevel[from] <= 1 && bfsLevel[to] <= 1)) return 'var(--illustration-primary)';
      if (dfsRightPath.includes(from) && dfsRightPath.includes(to)) return 'var(--illustration-accent)';
      return 'var(--illustration-surface-alt)';
    }
    return 'var(--illustration-surface-alt)';
  };

  return (
    <svg viewBox="0 0 500 290" className="w-full" style={{ maxHeight: '420px' }}>
      {edges.map(([f, t], i) => (
        <line key={i}
          x1={nodes[f].x} y1={nodes[f].y} x2={nodes[t].x} y2={nodes[t].y}
          stroke={edgeColor(f, t)}
          strokeWidth={(scene === 2 && dfsHighlight.includes(f) && dfsHighlight.includes(t)) || (scene === 4 && dfsRightPath.includes(f) && dfsRightPath.includes(t)) ? 2.5 : 1.5}
          style={{ transition: 'stroke 500ms, stroke-width 500ms' }}
        />
      ))}

      {(scene === 1 || scene === 4) && [0,1,2].map(level => {
        const levelNodes = nodes.filter((_, i) => bfsLevel[i] === level);
        return levelNodes.map((n, j) => (
          <circle key={`wave-${level}-${j}`} cx={n.x} cy={n.y} r="24" fill="none" stroke="var(--illustration-primary)" strokeWidth="1.5"
            style={{ animation: `tof-wave 2.4s ${(level * 0.6).toFixed(1)}s infinite` }} />
        ));
      })}

      {scene === 4 && (
        <circle cx={nodes[6].x} cy={nodes[6].y} r="24" fill="none" stroke="var(--illustration-accent)" strokeWidth="1.5"
          style={{ animation: 'tof-wave 1.6s 0.3s infinite' }} />
      )}

      {scene === 3 && (
        <>
          <rect x="40" y="0" width="420" height="4" rx="2" fill="var(--illustration-secondary)"
            style={{ animation: 'tof-beam 4s ease-in-out infinite' }} />
          <rect x="38" y="-2" width="424" height="8" rx="4" fill="var(--illustration-primary)"
            style={{ animation: 'tof-beam 4s ease-in-out infinite', filter: 'blur(3px)', opacity: 0.5 }} />
        </>
      )}

      {nodes.map((n, i) => {
        const s = nodeStyle(i);
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="22" fill={s.fill} stroke={s.stroke} strokeWidth="2"
              style={{ transition: 'fill 500ms, stroke 500ms' }} />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fill={s.text}
              fontSize="13" fontFamily="system-ui" fontWeight="700" style={{ transition: 'fill 500ms' }}>{i + 1}</text>
          </g>
        );
      })}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s 0.5s both' }}>
          <path d="M 100 215 Q 60 170 100 145" fill="none" stroke="var(--illustration-warning)" strokeWidth="1.5" strokeDasharray="4,3" />
          <polygon points="96,148 106,140 110,152" fill="var(--illustration-warning)" opacity="0.8" />
          <text x="36" y="180" textAnchor="middle" fill="var(--illustration-warning)" fontSize="11" fontFamily="system-ui">backtrack</text>
        </g>
      )}

      {scene === 0 && <text x="250" y="280" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="13" fontFamily="system-ui">Where do we explore first?</text>}
      {scene === 1 && (
        <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
          <rect x="140" y="262" width="220" height="24" rx="12" fill="var(--illustration-bg-dark)" stroke="var(--illustration-deep)" />
          <text x="250" y="278" textAnchor="middle" fill="var(--illustration-accent)" fontSize="12" fontFamily="system-ui" fontWeight="700">BFS — Level by level ↔</text>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
          <rect x="140" y="262" width="220" height="24" rx="12" fill="var(--illustration-bg-dark)" stroke="var(--illustration-accent)" />
          <text x="250" y="278" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="12" fontFamily="system-ui" fontWeight="700">DFS — Go deep first ↓</text>
        </g>
      )}
      {scene === 3 && (
        <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
          <rect x="130" y="262" width="240" height="24" rx="12" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" />
          <text x="250" y="278" textAnchor="middle" fill="var(--illustration-accent)" fontSize="11" fontFamily="system-ui" fontWeight="700">Queue vs Stack — the difference</text>
        </g>
      )}
      {scene === 4 && (
        <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
          <rect x="100" y="258" width="300" height="28" rx="12" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" />
          <text x="250" y="275" textAnchor="middle" fill="var(--illustration-accent)" fontSize="11" fontFamily="system-ui" fontWeight="700">BFS = shortest path | DFS = less memory</text>
        </g>
      )}
    </svg>
  );
}

// ── Probability meter SVG ─────────────────────────────────────────────────────
//
//  scene 0 : Gauge at 50%, "Unknown probability"
//  scene 1 : Evidence appears (rain cloud), needle swings to ~80%
//  scene 2 : Bayesian network — Prior → Likelihood → Posterior

function ProbabilityMeterSVG({ scene }: { scene: number }) {
  const cx = 250, cy = 195, r = 115;
  const needleAngles = [72, 140, 108];
  const angle = needleAngles[scene] ?? 90;
  const rad = (angle * Math.PI) / 180;
  const nx = cx + r * 0.82 * Math.cos(Math.PI - rad);
  const ny = cy - r * 0.82 * Math.sin(rad);

  return (
    <svg viewBox="0 0 500 290" className="w-full" style={{ maxHeight: '420px' }}>
      <defs>
        <linearGradient id="pm-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-surface-muted)" />
          <stop offset="100%" stopColor="var(--illustration-bg-dim)" />
        </linearGradient>
        <linearGradient id="pm-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="500" height="290" fill="url(#pm-bg)" rx="12" />
      <rect x="0" y="0" width="500" height="290" fill="url(#pm-glow)" rx="12" />

      {/* ── Scene 0: Weather Forecaster — uncertain ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Sky with clouds */}
          <path d="M 60 50 Q 80 35 100 50 Q 120 40 140 55" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="2" opacity="0.5" />
          <path d="M 340 40 Q 360 25 380 40 Q 400 30 420 45" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="2" opacity="0.5" />
          <circle cx="300" cy="35" r="18" fill="var(--illustration-warning)" opacity="0.15" />
          <circle cx="300" cy="35" r="12" fill="var(--illustration-warning)" opacity="0.3" />

          {/* City silhouette */}
          {[40, 55, 70, 88, 102, 118].map((x, i) => (
            <rect key={`b${i}`} x={x} y={265 - Math.random() * 40 - 20} width="12" height={Math.random() * 40 + 20} rx="1" fill="var(--illustration-surface-dark-alt)" opacity="0.3" />
          ))}
          {[380, 395, 412, 428, 445, 460].map((x, i) => (
            <rect key={`c${i}`} x={x} y={265 - Math.random() * 35 - 15} width="10" height={Math.random() * 35 + 15} rx="1" fill="var(--illustration-surface-dark-alt)" opacity="0.3" />
          ))}

          {/* Gauge */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="4" />
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx - r * Math.cos(Math.PI * 0.8)} ${cy - r * Math.sin(Math.PI * 0.8)}`}
            fill="none" stroke="var(--illustration-danger)" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
          <path d={`M ${cx - r * Math.cos(Math.PI * 0.8)} ${cy - r * Math.sin(Math.PI * 0.8)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI * 0.4)} ${cy - r * Math.sin(Math.PI * 0.4)}`}
            fill="none" stroke="var(--illustration-warning)" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
          <path d={`M ${cx + r * Math.cos(Math.PI * 0.4)} ${cy - r * Math.sin(Math.PI * 0.4)} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="var(--illustration-success)" strokeWidth="14" strokeLinecap="round" opacity="0.4" />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((pct, i) => {
            const a = (pct / 100) * Math.PI;
            const x1 = cx - (r - 6) * Math.cos(a), y1 = cy - (r - 6) * Math.sin(a);
            const x2 = cx - (r + 6) * Math.cos(a), y2 = cy - (r + 6) * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--illustration-element-deep)" strokeWidth="1.5" />;
          })}

          {/* Needle at 50% */}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--illustration-track)" strokeWidth="2.5" strokeLinecap="round"
            style={{ transition: 'x2 800ms cubic-bezier(0.4,0,0.2,1), y2 800ms cubic-bezier(0.4,0,0.2,1)' }} />
          <circle cx={cx} cy={cy} r="7" fill="var(--illustration-surface-mid)" stroke="var(--illustration-muted-text)" strokeWidth="1.5" />

          {/* Data sources */}
          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x="50" y="235" width="130" height="24" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="0.5" />
            <text x="115" y="251" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="600">Pressure · Humidity · Satellite</text>
          </g>
          <g style={{ animation: 'tof-up 0.5s 0.5s both' }}>
            <text x={cx} y={cy + 28} textAnchor="middle" fill="#f8fafc" fontSize="18" fontFamily="system-ui" fontWeight="800">50%</text>
            <text x={cx} y={cy + 44} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">Prior — No evidence yet</text>
          </g>
        </g>
      )}

      {/* ── Scene 1: Evidence arrives — needle moves ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Sky — rain */}
          <path d="M 340 30 Q 360 15 380 30 Q 400 20 420 35" fill="none" stroke="var(--illustration-muted-light)" strokeWidth="2" opacity="0.6" />
          {[0,1,2,3,4].map(i => (
            <line key={`r${i}`} x1={380 + i * 15} y1={45 + i * 5} x2={375 + i * 14} y2={65 + i * 5} stroke="var(--illustration-info)" strokeWidth="1" opacity="0.4" />
          ))}

          {/* Data flowing in */}
          {[0,1,2,3].map(i => (
            <circle key={`d${i}`} r="3" fill="var(--illustration-info)" opacity="0.7">
              <animateMotion dur={`${2 + i * 0.3}s`} repeatCount="indefinite"
                path={`M ${60 + i * 60} 50 Q ${100 + i * 40} 100 ${cx - 40 + i * 25} ${cy - 30}`} />
            </circle>
          ))}

          {/* Gauge */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="4" />
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx - r * Math.cos(Math.PI * 0.8)} ${cy - r * Math.sin(Math.PI * 0.8)}`}
            fill="none" stroke="var(--illustration-danger)" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
          <path d={`M ${cx - r * Math.cos(Math.PI * 0.8)} ${cy - r * Math.sin(Math.PI * 0.8)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI * 0.4)} ${cy - r * Math.sin(Math.PI * 0.4)}`}
            fill="none" stroke="var(--illustration-warning)" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
          <path d={`M ${cx + r * Math.cos(Math.PI * 0.4)} ${cy - r * Math.sin(Math.PI * 0.4)} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="var(--illustration-success)" strokeWidth="14" strokeLinecap="round" opacity="0.4" />

          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--illustration-warning)" strokeWidth="3" strokeLinecap="round"
            style={{ transition: 'x2 800ms cubic-bezier(0.4,0,0.2,1), y2 800ms cubic-bezier(0.4,0,0.2,1)',
              filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' }} />
          <circle cx={cx} cy={cy} r="7" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="1.5" />

          {/* Evidence badge */}
          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x="150" y="235" width="200" height="26" rx="8" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="250" y="253" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">↑ Evidence updates belief to 80%</text>
          </g>

          <g style={{ animation: 'tof-up 0.5s 0.5s both' }}>
            <text x={cx} y={cy + 28} textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="20" fontFamily="system-ui" fontWeight="800">80%</text>
            <text x={cx} y={cy + 44} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">Posterior — Rain observed</text>
          </g>
        </g>
      )}

      {/* ── Scene 2: Bayesian updating cycle ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Gauge */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="3" />
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx - r * Math.cos(Math.PI * 0.8)} ${cy - r * Math.sin(Math.PI * 0.8)}`}
            fill="none" stroke="var(--illustration-danger)" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          <path d={`M ${cx - r * Math.cos(Math.PI * 0.8)} ${cy - r * Math.sin(Math.PI * 0.8)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI * 0.4)} ${cy - r * Math.sin(Math.PI * 0.4)}`}
            fill="none" stroke="var(--illustration-warning)" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          <path d={`M ${cx + r * Math.cos(Math.PI * 0.4)} ${cy - r * Math.sin(Math.PI * 0.4)} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="var(--illustration-success)" strokeWidth="10" strokeLinecap="round" opacity="0.3" />

          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--illustration-secondary)" strokeWidth="2.5" strokeLinecap="round"
            style={{ transition: 'x2 800ms cubic-bezier(0.4,0,0.2,1), y2 800ms cubic-bezier(0.4,0,0.2,1)' }} />
          <circle cx={cx} cy={cy} r="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />

          <text x={cx} y={cy + 26} textAnchor="middle" fill="var(--illustration-light)" fontSize="16" fontFamily="system-ui" fontWeight="800">Prior</text>
          <text x={cx} y={cy + 42} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">New evidence → Posterior</text>

          {/* Update cycle */}
          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x="36" y="148" width="78" height="28" rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1" />
            <text x="75" y="166" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="600">P(H) Prior</text>
            <rect x="195" y="32" width="110" height="28" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="250" y="50" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="600">P(E|H) Likelihood</text>
            <rect x="386" y="148" width="78" height="28" rx="6" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1" />
            <text x="425" y="166" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">P(H|E) Posterior</text>

            {/* Arrows forming triangle */}
            <line x1="114" y1="162" x2="193" y2="50" stroke="var(--illustration-primary)" strokeWidth="1.2" strokeDasharray="4,3" />
            <polygon points="189,54 199,46 190,44" fill="var(--illustration-primary)" />
            <line x1="250" y1="60" x2="250" y2="90" stroke="var(--illustration-warning)" strokeWidth="1.2" strokeDasharray="4,3" />
            <polygon points="246,86 254,86 250,94" fill="var(--illustration-warning)" />
            <line x1="464" y1="162" x2="385" y2="50" stroke="var(--illustration-success)" strokeWidth="1.2" strokeDasharray="4,3" />
            <polygon points="389,54 379,46 388,44" fill="var(--illustration-success)" />
          </g>

          {/* Feedback loop */}
          <g style={{ animation: 'tof-up 0.5s 0.6s both' }}>
            <path d="M 425 178 Q 250 240 75 178" fill="none" stroke="var(--illustration-primary)" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
            <polygon points="79,182 75,174 71,182" fill="var(--illustration-primary)" opacity="0.5" />
            <text x="250" y="230" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">Posterior becomes next Prior</text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ── Logic gate SVG ────────────────────────────────────────────────────────────
//
//  scene 0 : Two propositions (P=TRUE, Q=?) separated — no connection yet
//  scene 1 : Rule "P → Q" appears; inference arrow fires; Q becomes TRUE
//  scene 2 : Multi-step chain: P₁ + P₂ → Rule → C₁ → Rule → C₂

function LogicGateSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 280" className="w-full" style={{ maxHeight: '420px' }}>
      <defs>
        <linearGradient id="lg-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-surface-muted)" />
          <stop offset="100%" stopColor="var(--illustration-bg-dim)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="500" height="280" fill="url(#lg-bg)" rx="12" />

      {/* ── Scene 0: Security rules — exact conditions ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Checklist header */}
          <rect x="120" y="24" width="260" height="30" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
          <text x="250" y="44" textAnchor="middle" fill="var(--illustration-accent)" fontSize="12" fontFamily="system-ui" fontWeight="700">Airport Security Checklist</text>

          {/* Rule 1 */}
          <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
            <rect x="40" y="80" width="420" height="44" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            <rect x="50" y="88" width="50" height="28" rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
            <text x="75" y="106" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">{'Liquid > 100ml'}</text>
            <text x="160" y="106" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui">→</text>
            <rect x="200" y="88" width="50" height="28" rx="6" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1.5" />
            <text x="225" y="106" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Remove</text>
            <rect x="330" y="88" width="60" height="28" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1" />
            <text x="360" y="106" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">TRUE ✓</text>
          </g>

          {/* Rule 2 */}
          <g style={{ animation: 'tof-pop 0.4s 0.4s both' }}>
            <rect x="40" y="136" width="420" height="44" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            <rect x="50" y="144" width="50" height="28" rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
            <text x="75" y="162" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Shoes Metal</text>
            <text x="160" y="162" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui">→</text>
            <rect x="200" y="144" width="50" height="28" rx="6" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1.5" />
            <text x="225" y="162" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Scan</text>
            <rect x="330" y="144" width="60" height="28" rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="360" y="162" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="700">FALSE</text>
          </g>

          {/* Bottom label */}
          <text x="250" y="230" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui">
            Each rule is exact: IF condition met → THEN action. No ambiguity.
          </text>
        </g>
      )}

      {/* ── Scene 1: The Pattern — propositional logic AND gate ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Two facts entering */}
          <rect x="30" y="70" width="110" height="40" rx="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <text x="85" y="89" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Contains Liquid</text>
          <text x="85" y="103" textAnchor="middle" fill="var(--illustration-success)" fontSize="8" fontFamily="system-ui" fontWeight="700">TRUE ✓</text>

          <rect x="30" y="160" width="110" height="40" rx="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <text x="85" y="179" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">{'Volume > 100ml'}</text>
          <text x="85" y="193" textAnchor="middle" fill="var(--illustration-success)" fontSize="8" fontFamily="system-ui" fontWeight="700">TRUE ✓</text>

          {/* AND Gate box */}
          <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
            <rect x="210" y="110" width="80" height="50" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="2" />
            <text x="250" y="135" textAnchor="middle" fill="var(--illustration-light)" fontSize="14" fontFamily="system-ui" fontWeight="800">AND</text>
            <text x="250" y="150" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">gate</text>
          </g>

          {/* Input arrows */}
          <line x1="140" y1="90" x2="208" y2="128" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <polygon points="204,124 214,132 204,133" fill="var(--illustration-primary)" />
          <line x1="140" y1="180" x2="208" y2="142" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <polygon points="204,138 214,146 204,148" fill="var(--illustration-primary)" />

          {/* Output */}
          <line x1="290" y1="135" x2="340" y2="135" stroke="var(--illustration-success)" strokeWidth="2" />
          <polygon points="336,130 346,135 336,140" fill="var(--illustration-success)" />
          <rect x="340" y="117" width="120" height="36" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <text x="400" y="140" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">Flag Bag ✓</text>

          <text x="250" y="250" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui">
            {'Contains_Liquid \u2227 Volume > 100ml \u2192 Flag_Bag. Both TRUE, conclusion follows.'}
          </text>
        </g>
      )}

      {/* ── Scene 2: AI — forward chaining chain ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Facts row */}
          <rect x="20" y="80" width="90" height="36" rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <text x="65" y="102" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">P: TRUE</text>

          <rect x="20" y="150" width="90" height="36" rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <text x="65" y="172" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Q: TRUE</text>

          {/* Rule 1 */}
          <rect x="150" y="108" width="90" height="36" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
          <text x="195" y="125" textAnchor="middle" fill="var(--illustration-light)" fontSize="8" fontFamily="system-ui" fontWeight="700">P ∧ Q → R</text>
          <text x="195" y="138" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">Rule 1</text>

          {/* Arrow P→Rule */}
          <line x1="110" y1="98" x2="148" y2="120" stroke="var(--illustration-primary)" strokeWidth="1.2" />
          <polygon points="144,116 154,124 144,125" fill="var(--illustration-primary)" />
          {/* Arrow Q→Rule */}
          <line x1="110" y1="168" x2="148" y2="140" stroke="var(--illustration-primary)" strokeWidth="1.2" />
          <polygon points="144,136 154,144 144,145" fill="var(--illustration-primary)" />

          {/* Conclusion R */}
          <line x1="240" y1="126" x2="280" y2="126" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <polygon points="276,121 286,126 276,131" fill="var(--illustration-success)" />
          <rect x="280" y="108" width="80" height="36" rx="6" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <text x="320" y="130" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">R: TRUE</text>

          {/* Rule 2 */}
          <rect x="390" y="108" width="80" height="36" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <text x="430" y="125" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="8" fontFamily="system-ui" fontWeight="700">R → S</text>
          <text x="430" y="138" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">Rule 2</text>

          <line x1="360" y1="126" x2="388" y2="126" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <polygon points="384,121 394,126 384,131" fill="var(--illustration-success)" />

          {/* Final conclusion S */}
          <line x1="470" y1="126" x2="480" y2="126" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <rect x="360" y="178" width="100" height="36" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="2" />
          <text x="410" y="201" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">S DERIVED ✓</text>
          <line x1="430" y1="144" x2="430" y2="176" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <polygon points="425,172 435,172 430,182" fill="var(--illustration-warning)" />

          <text x="250" y="250" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui">
            Forward chaining: rules chain known facts into guaranteed new conclusions.
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Optimization landscape SVG ────────────────────────────────────────────────
//
//  scene 0 : Hilly landscape, agent stuck at local max — "Stuck!"
//  scene 1 : Simulated annealing — agent jumps around exploring
//  scene 2 : Gradient descent — clean downward arrow to global minimum

function OptimizationSVG({ scene }: { scene: number }) {
  const landscapePath = 'M 20 230 Q 80 230 110 160 Q 135 110 160 130 Q 190 155 210 200 Q 230 225 250 220 Q 270 215 300 120 Q 325 50 360 80 Q 390 105 410 190 Q 430 230 480 230';
  const localMaxX = 135, localMaxY = 100;
  const globalMaxX = 338, globalMaxY = 42;
  const globalMinX = 395, globalMinY = 100;

  // Agent position per scene
  const agentPos = [
    { x: localMaxX, y: localMaxY - 14 },    // scene 0: stuck at local max
    { x: globalMaxX, y: globalMaxY - 14 },  // scene 1: found global peak
    { x: globalMinX, y: globalMinY + 14 },  // scene 2: at minimum
  ];

  return (
    <svg viewBox="0 0 500 280" className="w-full" style={{ maxHeight: '420px' }}>
      {/* Landscape fill */}
      <path d={landscapePath + ' L 480 280 L 20 280 Z'} fill="#080c18" />
      {/* Landscape line */}
      <path d={landscapePath} fill="none" stroke="var(--illustration-surface-mid)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Global peak highlight (scene 1 & 2) */}
      {scene >= 1 && (
        <g style={{ animation: 'tof-up 0.4s 0.3s both' }}>
          <line x1={globalMaxX} y1={globalMaxY - 14} x2={globalMaxX} y2={globalMaxY}
            stroke="var(--illustration-success)" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x={globalMaxX} y={globalMaxY - 20} textAnchor="middle" fill="var(--illustration-success)" fontSize="8.5" fontFamily="system-ui" fontWeight="700">
            Global Max
          </text>
        </g>
      )}

      {/* Local max marker (scene 0 & 1) */}
      {scene < 2 && (
        <g>
          <circle cx={localMaxX} cy={localMaxY} r="4" fill="var(--illustration-danger)" />
          <text x={localMaxX - 16} y={localMaxY - 8} fill="var(--illustration-danger)" fontSize="8" fontFamily="system-ui" fontWeight="700">Local</text>
          <text x={localMaxX - 16} y={localMaxY - 0} fill="var(--illustration-danger)" fontSize="8" fontFamily="system-ui" fontWeight="700">Max</text>
          {scene === 0 && (
            <g style={{ animation: 'tof-pop 0.4s 0.5s both' }}>
              <rect x={localMaxX + 8} y={localMaxY - 22} width="46" height="18" rx="9" fill="var(--illustration-danger-bg-deep)" stroke="var(--illustration-danger)" strokeWidth="1" />
              <text x={localMaxX + 31} y={localMaxY - 10} textAnchor="middle" fill="var(--illustration-danger)" fontSize="8.5" fontFamily="system-ui" fontWeight="700">STUCK!</text>
            </g>
          )}
        </g>
      )}

      {/* Agent circle */}
      <circle
        cx={agentPos[scene].x}
        cy={agentPos[scene].y}
        r="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="2"
        style={{ transition: 'cx 700ms cubic-bezier(0.4,0,0.2,1), cy 700ms cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x={agentPos[scene].x} y={agentPos[scene].y + 4} textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui"
        style={{ transition: 'x 700ms, y 700ms' }}>◉</text>

      {/* Scene 1: jump arrows (simulated annealing exploring) */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s 0.2s both' }}>
          <path d="M 145 86 Q 200 50 260 120 Q 295 78 336 40" fill="none" stroke="var(--illustration-warning)" strokeWidth="1.5" strokeDasharray="5,4" />
          <polygon points="332,35 342,43 330,47" fill="var(--illustration-warning)" />
          <text x="200" y="50" textAnchor="middle" fill="var(--illustration-warning)" fontSize="8.5" fontFamily="system-ui" fontWeight="700">Annealing: dare to explore</text>
        </g>
      )}

      {/* Scene 2: gradient arrow */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s 0.3s both' }}>
          <path d="M 300 100 Q 350 95 380 115" fill="none" stroke="var(--illustration-primary)" strokeWidth="2.5" />
          <polygon points="376,110 388,118 378,124" fill="var(--illustration-primary)" />
          <text x="340" y="90" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="8.5" fontFamily="system-ui" fontWeight="700">Gradient →</text>
          <rect x="350" y="107" width="90" height="20" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1.2" />
          <text x="395" y="121" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="8.5" fontFamily="system-ui" fontWeight="700">Global Min ↓</text>
        </g>
      )}

      {/* Legend */}
      <text x="250" y="270" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">
        {scene === 0 ? 'Hill climbing gets trapped at local optima' :
         scene === 1 ? 'Simulated annealing escapes by exploring broadly' :
         'Gradient descent follows the slope to the minimum'}
      </text>
    </svg>
  );
}

// ── Neural network layer SVG ──────────────────────────────────────────────────
//
//  scene 0 : Static architecture — input → hidden → output layers with weights
//  scene 1 : Forward pass — signals flow through layers, neurons activate
//  scene 2 : Backpropagation — error gradient flows backward, weights update

function NeuralNetSVG({ scene }: { scene: number }) {
  const layers = [
    { x: 80,  nodes: [60, 130, 200, 270], label: 'Input', color: 'var(--illustration-primary)' },
    { x: 210, nodes: [45, 110, 175, 240], label: 'Hidden 1', color: 'var(--illustration-secondary)' },
    { x: 330, nodes: [80, 165, 250], label: 'Hidden 2', color: 'var(--illustration-accent)' },
    { x: 440, nodes: [110, 215], label: 'Output', color: 'var(--illustration-success-dim)' },
  ];

  const fwdActive = scene === 1;
  const bwdActive = scene === 2;

  return (
    <svg viewBox="0 0 500 310" className="w-full" style={{ maxHeight: '430px' }}>
      {/* Connections */}
      {layers.slice(0, -1).map((layerA, li) => {
        const layerB = layers[li + 1];
        return layerA.nodes.map((ay, ai) =>
          layerB.nodes.map((by, bi) => {
            const opacity = scene === 0 ? 0.12 : 0.08;
            const stroke = fwdActive ? 'var(--illustration-deep)' : bwdActive ? '#dc2626' : 'var(--illustration-surface-alt)';
            return (
              <line key={`${li}-${ai}-${bi}`}
                x1={layerA.x} y1={ay} x2={layerB.x} y2={by}
                stroke={stroke} strokeWidth="0.8"
                style={{ opacity, transition: 'stroke 600ms, opacity 600ms' }}
              />
            );
          })
        );
      })}

      {/* Forward pass signal animation */}
      {fwdActive && layers.slice(0, -1).map((layerA, li) => {
        const layerB = layers[li + 1];
        return layerA.nodes.slice(0, 2).map((ay, ai) => (
          <circle key={`sig-${li}-${ai}`} r="3" fill="var(--illustration-primary)" opacity="0.8">
            <animateMotion
              dur="1.8s"
              begin={`${li * 0.4}s`}
              repeatCount="indefinite"
              path={`M ${layerA.x} ${ay} L ${layerB.x} ${layerB.nodes[ai % layerB.nodes.length]}`}
            />
          </circle>
        ));
      })}

      {/* Backward error gradient */}
      {bwdActive && layers.slice(1).reverse().map((layerA, li) => {
        const layerB = layers[layers.length - 2 - li];
        return layerA.nodes.slice(0, 1).map(ay => (
          <circle key={`err-${li}`} r="3" fill="var(--illustration-danger)" opacity="0.7">
            <animateMotion
              dur="2s"
              begin={`${li * 0.5}s`}
              repeatCount="indefinite"
              path={`M ${layerA.x} ${ay} L ${layerB.x} ${layerB.nodes[0]}`}
            />
          </circle>
        ));
      })}

      {/* Nodes */}
      {layers.map((layer, li) =>
        layer.nodes.map((y, ni) => {
          const isActive = fwdActive || bwdActive;
          return (
            <g key={`n-${li}-${ni}`}>
              <circle cx={layer.x} cy={y} r="14"
                fill={isActive ? 'var(--illustration-bg-dark)' : 'var(--illustration-surface)'}
                stroke={isActive ? layer.color : 'var(--illustration-surface-alt)'}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ transition: 'all 500ms',
                  animation: isActive ? `tof-node 2s ${(li * 0.3 + ni * 0.15).toFixed(2)}s infinite` : undefined }}
              />
              {li === 0 && (
                <text x={layer.x} y={y + 4} textAnchor="middle" fill="var(--illustration-secondary)" fontSize="8" fontFamily="system-ui">
                  x{ni + 1}
                </text>
              )}
              {li === layers.length - 1 && (
                <text x={layer.x} y={y + 4} textAnchor="middle" fill="var(--illustration-success-light)" fontSize="8" fontFamily="system-ui">
                  {ni === 0 ? 'Cat' : 'Dog'}
                </text>
              )}
            </g>
          );
        })
      )}

      {/* Layer labels */}
      {layers.map((layer) => (
        <text key={`lbl-${layer.x}`} x={layer.x} y="292" textAnchor="middle"
          fill="var(--illustration-text-muted)" fontSize="8.5" fontFamily="system-ui">{layer.label}</text>
      ))}

      {/* Scene labels */}
      {scene === 0 && (
        <text x="250" y="30" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="10" fontFamily="system-ui">
          Network architecture: input → hidden → output
        </text>
      )}
      {fwdActive && (
        <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
          <rect x="145" y="16" width="210" height="22" rx="11" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" />
          <text x="250" y="31" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700">
            Forward Pass → Signal flows right
          </text>
        </g>
      )}
      {bwdActive && (
        <g style={{ animation: 'tof-pop 0.4s 0.2s both' }}>
          <rect x="125" y="16" width="250" height="22" rx="11" fill="var(--illustration-danger-bg-deep)" stroke="var(--illustration-danger)" />
          <text x="250" y="31" textAnchor="middle" fill="var(--illustration-danger-light-soft)" fontSize="10" fontFamily="system-ui" fontWeight="700">
            Backpropagation ← Gradient flows left
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Word vector SVG ───────────────────────────────────────────────────────────
//
//  scene 0 : Words scattered randomly in 2D space
//  scene 1 : Words move to semantic clusters (royalty, animals)
//  scene 2 : Vector arithmetic — King - Man + Woman ≈ Queen

function WordVectorSVG({ scene }: { scene: number }) {
  // Positions: [random, clustered]
  const words = [
    { label: 'King',  rand: {x:110, y:80},  cluster: {x:140, y:90},  group: 'royalty', color: 'var(--illustration-accent)' },
    { label: 'Queen', rand: {x:380, y:200},  cluster: {x:180, y:140}, group: 'royalty', color: 'var(--illustration-accent)' },
    { label: 'Man',   rand: {x:240, y:50},  cluster: {x:120, y:190}, group: 'gender',  color: 'var(--illustration-info)' },
    { label: 'Woman', rand: {x:60, y:200},  cluster: {x:170, y:230}, group: 'gender',  color: 'var(--illustration-info)' },
    { label: 'Cat',   rand: {x:420, y:90},  cluster: {x:370, y:120}, group: 'animal',  color: 'var(--illustration-success-light)' },
    { label: 'Dog',   rand: {x:300, y:180}, cluster: {x:410, y:160}, group: 'animal',  color: 'var(--illustration-success-light)' },
    { label: 'Fish',  rand: {x:180, y:240}, cluster: {x:390, y:210}, group: 'animal',  color: 'var(--illustration-success-light)' },
  ];

  const pos = (w: typeof words[0]) => scene === 0 ? w.rand : w.cluster;

  return (
    <svg viewBox="0 0 500 280" className="w-full" style={{ maxHeight: '420px' }}>
      {/* Axes (scene 0) */}
      {scene === 0 && (
        <>
          <line x1="40" y1="250" x2="470" y2="250" stroke="var(--illustration-surface-alt)" strokeWidth="1.5" />
          <line x1="40" y1="250" x2="40" y2="30" stroke="var(--illustration-surface-alt)" strokeWidth="1.5" />
          <text x="470" y="264" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">meaning →</text>
          <text x="28" y="28" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui" transform="rotate(-90,28,28)">similarity</text>
          <text x="250" y="20" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9.5" fontFamily="system-ui">Words scattered — no structure yet</text>
        </>
      )}

      {/* Cluster backgrounds (scene 1) */}
      {scene === 1 && (
        <>
          <ellipse cx="160" cy="165" rx="72" ry="90" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1" opacity="0.4" style={{ animation: 'tof-up 0.4s 0.2s both' }} />
          <text x="160" y="278" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="8.5" fontFamily="system-ui">Royalty + Gender</text>
          <ellipse cx="392" cy="165" rx="60" ry="70" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1" opacity="0.4" style={{ animation: 'tof-up 0.4s 0.4s both' }} />
          <text x="392" y="278" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="8.5" fontFamily="system-ui">Animals</text>
          <text x="250" y="20" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9.5" fontFamily="system-ui">Semantic clusters emerge automatically</text>
        </>
      )}

      {/* Word labels */}
      {words.map((w, i) => {
        const p = pos(w);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill={w.color} opacity="0.6"
              style={{ transition: 'cx 800ms cubic-bezier(0.4,0,0.2,1), cy 800ms cubic-bezier(0.4,0,0.2,1)' }} />
            <text x={p.x + 8} y={p.y + 4} fill={scene === 0 ? 'var(--illustration-muted-light)' : w.color} fontSize="10" fontFamily="system-ui" fontWeight={scene === 0 ? '400' : '700'}
              style={{ transition: 'fill 500ms, x 800ms, y 800ms' }}>
              {w.label}
            </text>
          </g>
        );
      })}

      {/* Scene 2: Vector arithmetic */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s 0.1s both' }}>
          {/* King vector */}
          <rect x="30" y="60" width="80" height="30" rx="7" fill="var(--illustration-bg-dark)" stroke="var(--illustration-accent)" strokeWidth="1.5" />
          <text x="70" y="79" textAnchor="middle" fill="var(--illustration-accent)" fontSize="11" fontFamily="system-ui" fontWeight="800">King</text>

          <text x="122" y="80" textAnchor="middle" fill="var(--illustration-danger)" fontSize="16" fontFamily="system-ui" fontWeight="800">−</text>

          <rect x="140" y="60" width="80" height="30" rx="7" fill="var(--illustration-surface-alt)" stroke="var(--illustration-info)" strokeWidth="1.5" />
          <text x="180" y="79" textAnchor="middle" fill="#93c5fd" fontSize="11" fontFamily="system-ui" fontWeight="800">Man</text>

          <text x="232" y="80" textAnchor="middle" fill="var(--illustration-success)" fontSize="16" fontFamily="system-ui" fontWeight="800">+</text>

          <rect x="248" y="60" width="80" height="30" rx="7" fill="var(--illustration-surface-alt)" stroke="var(--illustration-info)" strokeWidth="1.5" />
          <text x="288" y="79" textAnchor="middle" fill="#93c5fd" fontSize="11" fontFamily="system-ui" fontWeight="800">Woman</text>

          <text x="340" y="80" textAnchor="middle" fill="#f8fafc" fontSize="16" fontFamily="system-ui" fontWeight="800">≈</text>

          <rect x="354" y="55" width="112" height="40" rx="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-accent)" strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.4))' }} />
          <text x="410" y="80" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="14" fontFamily="system-ui" fontWeight="900">Queen</text>

          {/* Explanation */}
          <text x="250" y="145" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">
            Directions in embedding space = abstract relationships
          </text>

          {/* Dimension axes */}
          <rect x="30" y="165" width="440" height="80" rx="10" fill="var(--illustration-bg-surface-deeper)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <text x="250" y="185" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8.5" fontFamily="system-ui">Word vectors (300 dimensions)</text>
          {['royalty', 'gender', 'plural', 'age', '...'].map((dim, i) => (
            <g key={dim}>
              <rect x={40 + i * 88} y="195" width="78" height="38" rx="5" fill="var(--illustration-surface-dark-alt)" stroke="var(--illustration-surface-alt)" />
              <text x={79 + i * 88} y="212" textAnchor="middle" fill="var(--illustration-element-muted)" fontSize="7.5" fontFamily="system-ui">{dim}</text>
              <rect x={40 + i * 88} y="218" width={dim === 'royalty' ? 70 : dim === 'gender' ? 35 : dim === 'plural' ? 20 : dim === 'age' ? 55 : 10} height="8" rx="3"
                fill={i === 0 ? 'var(--illustration-primary)' : i === 1 ? 'var(--illustration-info)' : 'var(--illustration-surface-mid)'} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

// ── Nested circles SVG (AI ⊃ ML ⊃ DL) ───────────────────────────────────────
//
//  scene 0 : Three nested rings, all equal
//  scene 1 : Each ring labelled: AI (outer), ML (middle), DL (inner) with examples
//  scene 2 : Relationship arrows + key difference text

function NestedCirclesSVG({ scene }: { scene: number }) {
  const dollShape = (w: number, h: number) => {
    const hw = w / 2, hh = h / 2;
    const body = `M ${-hw * 0.88} ${-hh * 0.1}
      Q ${-hw * 1.05} ${hh * 0.2}, ${-hw * 0.95} ${hh * 0.5}
      Q ${-hw * 1.0} ${hh * 0.7}, ${-hw * 0.9} ${hh * 0.88}
      L ${hw * 0.9} ${hh * 0.88}
      Q ${hw * 1.0} ${hh * 0.7}, ${hw * 0.95} ${hh * 0.5}
      Q ${hw * 1.05} ${hh * 0.2}, ${hw * 0.88} ${-hh * 0.1}
      Z`;
    const head = `M ${-hw * 0.88} ${-hh * 0.1}
      Q ${-hw * 0.7} ${-hh * 0.5}, ${-hw * 0.28} ${-hh * 0.75}
      C ${-hw * 0.2} ${-hh * 0.88}, ${-hw * 0.22} ${-hh * 1.02}, ${0} ${-hh * 1.05}
      C ${hw * 0.22} ${-hh * 1.02}, ${hw * 0.2} ${-hh * 0.88}, ${hw * 0.28} ${-hh * 0.75}
      Q ${hw * 0.7} ${-hh * 0.5}, ${hw * 0.88} ${-hh * 0.1}
      Z`;
    return { body, head };
  };

  const face = (cx: number, cy: number, s: number) => (
    <g>
      <circle cx={cx - s * 5} cy={cy - s * 2} r={s * 1.8} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.3} />
      <circle cx={cx + s * 5} cy={cy - s * 2} r={s * 1.8} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.3} />
      <path d={`M ${cx - s * 4} ${cy + s * 4} Q ${cx} ${cy + s * 8} ${cx + s * 4} ${cy + s * 4}`} fill="none" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" opacity={0.3} />
    </g>
  );

  const aiDoll = dollShape(240, 280);
  const mlDoll = dollShape(170, 196);
  const dlDoll = dollShape(105, 118);

  const aiOpen = scene >= 1;
  const mlOpen = scene >= 2;

  return (
    <svg viewBox="0 0 500 350" className="w-full" style={{ maxHeight: '480px' }}>
      <defs>
        <linearGradient id="dai" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--illustration-deep)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="dml" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="ddl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-lightest)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <ellipse cx="250" cy="170" rx="200" ry="130" fill="var(--illustration-primary)" opacity="0.03" />

      {/* ── AI doll ── */}
      <g transform="translate(250, 205)">
        <path d={aiDoll.body} fill="url(#dai)" stroke="var(--illustration-primary)" strokeWidth={1.5}
          style={{ opacity: aiOpen ? 0.2 : 0.5, transition: 'opacity 600ms' }} />
        <path d={aiDoll.head} fill="url(#dai)" stroke="var(--illustration-primary)" strokeWidth={1.5}
          style={{ transform: aiOpen ? 'translateY(-135px)' : 'translateY(0)', opacity: aiOpen ? 0.12 : 0.5, transition: 'transform 800ms, opacity 500ms' }} />
        {!aiOpen && face(0, -95, 2.4)}
        <text x="0" y={aiOpen ? -55 : 4} textAnchor="middle" fill="var(--illustration-secondary)" fontSize="22" fontFamily="system-ui" fontWeight="800"
          style={{ transition: 'transform 800ms' }}>AI</text>
        {aiOpen && (
          <text x="0" y={-185} textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="11" fontFamily="system-ui"
            style={{ animation: 'tof-up 0.4s 0.1s both' }}>Search · Rules · Logic</text>
        )}
      </g>

      {/* ── ML doll ── */}
      <g transform={`translate(250, ${aiOpen ? 205 : 285})`}
        style={{ opacity: aiOpen ? 1 : 0, transition: 'transform 800ms 0.15s, opacity 600ms 0.15s' }}>
        <path d={mlDoll.body} fill="url(#dml)" stroke="var(--illustration-accent)" strokeWidth={1.5}
          style={{ opacity: mlOpen ? 0.2 : 0.5, transition: 'opacity 600ms' }} />
        <path d={mlDoll.head} fill="url(#dml)" stroke="var(--illustration-accent)" strokeWidth={1.5}
          style={{ transform: mlOpen ? 'translateY(-95px)' : 'translateY(0)', opacity: mlOpen ? 0.12 : 0.5, transition: 'transform 800ms 0.2s, opacity 500ms' }} />
        {aiOpen && !mlOpen && face(0, -68, 1.7)}
        <text x="0" y={mlOpen ? -40 : 4} textAnchor="middle" fill="var(--illustration-light)" fontSize="16" fontFamily="system-ui" fontWeight="800"
          style={{ transition: 'transform 800ms 0.2s' }}>ML</text>
        {aiOpen && (
          <text x="0" y={mlOpen ? -130 : 34} textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="10" fontFamily="system-ui"
            style={{ animation: 'tof-up 0.4s 0.6s both' }}>{mlOpen ? 'Learns from data' : 'Decision Trees'}</text>
        )}
      </g>

      {/* ── DL doll ── */}
      <g transform={`translate(250, ${mlOpen ? 205 : 285})`}
        style={{ opacity: mlOpen ? 1 : 0, transition: 'transform 800ms 0.3s, opacity 600ms 0.3s' }}>
        <path d={dlDoll.body} fill="url(#ddl)" stroke="var(--illustration-lightest)" strokeWidth={1.5} opacity={0.5} />
        <path d={dlDoll.head} fill="url(#ddl)" stroke="var(--illustration-lightest)" strokeWidth={1.5} opacity={0.5} />
        {mlOpen && face(0, -40, 1)}
        <text x="0" y="4" textAnchor="middle" fill="var(--illustration-accent-faint)" fontSize="13" fontFamily="system-ui" fontWeight="800">DL</text>
        {mlOpen && (
          <text x="0" y="40" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui"
            style={{ animation: 'tof-up 0.4s 0.8s both' }}>Neural Networks</text>
        )}
      </g>

      {/* ── Scene 0: hint ── */}
      {scene === 0 && (
        <text x="250" y="330" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="11" fontFamily="system-ui"
          style={{ animation: 'tof-float 2s ease-in-out infinite' }}>
          A larger field contains a smaller one inside
        </text>
      )}
    </svg>
  );
}

// ── Smart Door Lock SVG — AND gate analogy ────────────────────────────────────

function SmartDoorLockSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 290" className="w-full" style={{ maxHeight: '420px' }}>
      <defs>
        <linearGradient id="dl-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-surface-muted)" />
          <stop offset="100%" stopColor="var(--illustration-bg-dim)" />
        </linearGradient>
        <filter id="dl-glow-g"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="dl-glow-r"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="dl-glow-v"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <rect x="0" y="0" width="500" height="290" fill="url(#dl-bg)" rx="12" />

      {/* ── Scene 0: Face ✓ Fingerprint ✓ Phone ✗ → Door locked ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Door frame */}
          <rect x="320" y="20" width="120" height="200" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="2" />
          <rect x="330" y="30" width="100" height="180" rx="4" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
          {/* Lock icon */}
          <rect x="370" y="100" width="20" height="18" rx="4" fill="var(--illustration-danger-bg)" stroke="var(--illustration-danger)" strokeWidth="1.2" />
          <path d="M374 104 L374 98 Q374 92 380 92 Q386 92 386 98 L386 104" fill="none" stroke="var(--illustration-danger)" strokeWidth="1.2" />
          <text x="380" y="140" textAnchor="middle" fill="var(--illustration-danger-light-soft)" fontSize="10" fontFamily="system-ui" fontWeight="700">LOCKED</text>

          {/* ── Row 1: Face ✓ ── */}
          <rect x="40" y="24" width="200" height="44" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <circle cx="70" cy="46" r="12" fill="var(--illustration-surface)" stroke="var(--illustration-success-lighter)" strokeWidth="1.5" />
          <circle cx="66" cy="42" r="2" fill="var(--illustration-success-lighter)" opacity="0.8" />
          <circle cx="74" cy="42" r="2" fill="var(--illustration-success-lighter)" opacity="0.8" />
          <path d="M64 50 Q70 54 76 50" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1" strokeLinecap="round" />
          <text x="110" y="50" textAnchor="middle" fill="var(--illustration-success-lighter)" fontSize="14" fontFamily="system-ui" fontWeight="800">Face Scan</text>
          <rect x="200" y="32" width="30" height="28" rx="14" fill="var(--illustration-success-bg-deep)" stroke="var(--illustration-success)" strokeWidth="1" />
          <text x="215" y="51" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">{'\u2713'}</text>

          {/* ── Row 2: Fingerprint ✓ ── */}
          <rect x="40" y="82" width="200" height="44" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <circle cx="70" cy="104" r="12" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1.5" />
          <path d="M64 100 Q64 94 70 94 Q76 94 76 100 L76 108" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1" />
          <path d="M68 103 Q68 99 70 99 Q72 99 72 103 L72 108" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1" />
          <text x="110" y="108" textAnchor="middle" fill="var(--illustration-success-lighter)" fontSize="14" fontFamily="system-ui" fontWeight="800">Fingerprint</text>
          <rect x="200" y="90" width="30" height="28" rx="14" fill="var(--illustration-success-bg-deep)" stroke="var(--illustration-success)" strokeWidth="1" />
          <text x="215" y="109" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">{'\u2713'}</text>

          {/* ── Row 3: Phone ✗ ── */}
          <rect x="40" y="140" width="200" height="44" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-danger)" strokeWidth="1.5" />
          <rect x="60" y="152" width="20" height="20" rx="4" fill="none" stroke="var(--illustration-danger-light-soft)" strokeWidth="1.5" />
          <circle cx="70" cy="168" r="2" fill="var(--illustration-danger-light-soft)" opacity="0.6" />
          <text x="110" y="166" textAnchor="middle" fill="var(--illustration-danger-light-soft)" fontSize="14" fontFamily="system-ui" fontWeight="800">Phone Nearby</text>
          <rect x="200" y="148" width="30" height="28" rx="14" fill="var(--illustration-danger-bg)" stroke="var(--illustration-danger)" strokeWidth="1" />
          <text x="215" y="167" textAnchor="middle" fill="var(--illustration-danger-light-soft)" fontSize="13" fontFamily="system-ui" fontWeight="700">X</text>

          {/* Arrow to decision */}
          <path d="M250 140 L300 140" stroke="var(--illustration-surface-mid)" strokeWidth="2" strokeDasharray="6,4" />
          <polygon points="296,135 306,140 296,145" fill="var(--illustration-surface-mid)" />

          {/* AND gate */}
          <rect x="300" y="120" width="20" height="40" rx="5" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
          <path d="M300 120 Q316 120 316 140 Q316 160 300 160" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.2" opacity="0.5" />

          {/* Bottom label */}
          <text x="160" y="220" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontStyle="italic">
            Phone missing — one condition fails, door stays locked
          </text>
        </g>
      )}

      {/* ── Scene 1: Phone connects → All ✓ → Door opens ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Door frame */}
          <rect x="320" y="20" width="120" height="200" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="2" />
          <rect x="330" y="30" width="100" height="180" rx="4" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
          {/* Door slightly open (shifted) */}
          <rect x="318" y="30" width="100" height="180" rx="4" fill="var(--illustration-surface-alt)" stroke="var(--illustration-success)" strokeWidth="1.5" opacity="0"
            style={{ animation: 'tof-pop 0.6s 0.8s both' }}>
            <animate attributeName="x" values="330;318" dur="0.6s" begin="0.8s" fill="freeze" />
          </rect>
          {/* Unlock icon */}
          <rect x="368" y="100" width="20" height="18" rx="4" fill="var(--illustration-success-bg-deep)" stroke="var(--illustration-success)" strokeWidth="1.2" opacity="0"
            style={{ animation: 'tof-pop 0.5s 0.8s both' }} />
          <path d="M372 104 L372 98 Q372 92 378 92 Q384 92 384 98 L384 104" fill="none" stroke="var(--illustration-success)" strokeWidth="1.2" opacity="0"
            style={{ animation: 'tof-pop 0.5s 0.8s both' }} />
          <text x="380" y="140" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
            style={{ animation: 'tof-pop 0.5s 0.8s both' }}>OPEN</text>

          {/* ── Row 1: Face ✓ ── */}
          <rect x="40" y="24" width="200" height="44" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <circle cx="70" cy="46" r="12" fill="var(--illustration-surface)" stroke="var(--illustration-success-lighter)" strokeWidth="1.5" />
          <circle cx="66" cy="42" r="2" fill="var(--illustration-success-lighter)" opacity="0.8" />
          <circle cx="74" cy="42" r="2" fill="var(--illustration-success-lighter)" opacity="0.8" />
          <path d="M64 50 Q70 54 76 50" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1" strokeLinecap="round" />
          <text x="110" y="50" textAnchor="middle" fill="var(--illustration-success-lighter)" fontSize="14" fontFamily="system-ui" fontWeight="800">Face Scan</text>
          <rect x="200" y="32" width="30" height="28" rx="14" fill="var(--illustration-success-bg-deep)" stroke="var(--illustration-success)" strokeWidth="1" />
          <text x="215" y="51" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">{'\u2713'}</text>

          {/* ── Row 2: Fingerprint ✓ ── */}
          <rect x="40" y="82" width="200" height="44" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <circle cx="70" cy="104" r="12" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1.5" />
          <path d="M64 100 Q64 94 70 94 Q76 94 76 100 L76 108" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1" />
          <path d="M68 103 Q68 99 70 99 Q72 99 72 103 L72 108" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1" />
          <text x="110" y="108" textAnchor="middle" fill="var(--illustration-success-lighter)" fontSize="14" fontFamily="system-ui" fontWeight="800">Fingerprint</text>
          <rect x="200" y="90" width="30" height="28" rx="14" fill="var(--illustration-success-bg-deep)" stroke="var(--illustration-success)" strokeWidth="1" />
          <text x="215" y="109" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">{'\u2713'}</text>

          {/* ── Row 3: Phone ✓ (now green) ── */}
          <rect x="40" y="140" width="200" height="44" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <rect x="60" y="152" width="20" height="20" rx="4" fill="none" stroke="var(--illustration-success-lighter)" strokeWidth="1.5" />
          <circle cx="70" cy="168" r="2" fill="var(--illustration-success-lighter)" opacity="0.6" />
          <text x="110" y="166" textAnchor="middle" fill="var(--illustration-success-lighter)" fontSize="14" fontFamily="system-ui" fontWeight="800">Phone Nearby</text>
          <rect x="200" y="148" width="30" height="28" rx="14" fill="var(--illustration-success-bg-deep)" stroke="var(--illustration-success)" strokeWidth="1" />
          <text x="215" y="167" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">{'\u2713'}</text>

          {/* Arrow to decision */}
          <path d="M250 140 L300 140" stroke="var(--illustration-success)" strokeWidth="2" strokeDasharray="6,4">
            <animate attributeName="stroke" values="var(--illustration-success);var(--illustration-success-light);var(--illustration-success)" dur="1.5s" repeatCount="indefinite" />
          </path>
          <polygon points="296,135 306,140 296,145" fill="var(--illustration-success)" />

          {/* AND gate */}
          <rect x="300" y="120" width="20" height="40" rx="5" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="2" opacity="0.9">
            <animate attributeName="stroke" values="var(--illustration-success);var(--illustration-success-light);var(--illustration-success)" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <path d="M300 120 Q316 120 316 140 Q316 160 300 160" fill="none" stroke="var(--illustration-success)" strokeWidth="1.2" opacity="0.5" />

          {/* Green checkmark burst */}
          <circle cx="380" cy="50" r="20" fill="var(--illustration-success-dim)" opacity="0">
            <animate attributeName="opacity" values="0;0.2;0" dur="2s" begin="1.2s" repeatCount="indefinite" />
            <animate attributeName="r" values="10;40;10" dur="2s" begin="1.2s" repeatCount="indefinite" />
          </circle>

          {/* Bottom label */}
          <text x="160" y="220" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontStyle="italic">
            Phone connects — all three True — door unlocks
          </text>
        </g>
      )}

      {/* ── Scene 2: Decision logic — AND gate visualization ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Three inputs */}
          <rect x="30" y="30" width="160" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <text x="110" y="52" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="13" fontFamily="system-ui" fontWeight="700">Face \u2713</text>

          <rect x="30" y="80" width="160" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <text x="110" y="102" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="13" fontFamily="system-ui" fontWeight="700">Fingerprint \u2713</text>

          <rect x="30" y="130" width="160" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <text x="110" y="152" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="13" fontFamily="system-ui" fontWeight="700">Phone Nearby \u2713</text>

          {/* Arrows to AND gate */}
          <path d="M190 48 L260 48" stroke="var(--illustration-success)" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6" />
          <path d="M190 98 L260 98" stroke="var(--illustration-success)" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6" />
          <path d="M190 148 L260 148" stroke="var(--illustration-success)" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6" />

          {/* AND gate */}
          <rect x="260" y="55" width="60" height="90" rx="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="2"
            style={{ filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.3))' }}>
            <animate attributeName="stroke" values="var(--illustration-success);var(--illustration-success-light);var(--illustration-success)" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x="290" y="97" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="18" fontFamily="monospace" fontWeight="800">AND</text>
          <text x="290" y="115" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">gate</text>

          {/* Output arrow */}
          <path d="M320 100 L380 100" stroke="var(--illustration-success)" strokeWidth="2" opacity="0.8" />
          <polygon points="376,95 386,100 376,105" fill="var(--illustration-success)" opacity="0.8" />

          {/* Output: Door Opens */}
          <rect x="380" y="78" width="110" height="44" rx="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="2"
            style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.25))' }} />
          <rect x="395" y="90" width="14" height="20" rx="3" fill="var(--illustration-success-bg-deep)" stroke="var(--illustration-success-light)" strokeWidth="1" />
          <path d="M398 94 L398 90 Q398 86 402 86 Q406 86 406 90 L406 94" fill="none" stroke="var(--illustration-success-light)" strokeWidth="1" />
          <text x="426" y="104" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="13" fontFamily="system-ui" fontWeight="800">DOOR OPENS</text>

          {/* Bottom badge */}
          <rect x="110" y="210" width="280" height="28" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="0.5" opacity="0.6" />
          <text x="250" y="229" textAnchor="middle" fill="var(--illustration-light)" fontSize="10" fontFamily="system-ui" fontWeight="600">
            ALL conditions must be True for the door to open
          </text>

          {/* Animated checkmark */}
          <path d="M85 190 L92 197 L102 185" fill="none" stroke="var(--illustration-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
          </path>
        </g>
      )}
    </svg>
  );
}

// ── Traffic Signal SVG ──────────────────────────────────────────────────────────

function TrafficLight({ cx, topY, litR, litY, litG }: {
  cx: number; topY: number; litR: boolean; litY: boolean; litG: boolean;
}) {
  const bulbs = [
    { cy: topY + 28, lit: litR, on: 'var(--illustration-danger)', glow: 'var(--illustration-danger-light-soft)', off: '#1c0a0a', ring: 'var(--illustration-danger-bg)' },
    { cy: topY + 72, lit: litY, on: 'var(--illustration-warning)', glow: '#fde68a', off: '#1c1408', ring: '#78350f' },
    { cy: topY + 116, lit: litG, on: 'var(--illustration-success)', glow: 'var(--illustration-success-lighter-alt)', off: '#041c0e', ring: '#14532d' },
  ];
  return (
    <g>
      <rect x={cx - 3} y={topY + 150} width={6} height={50} rx="3" fill="var(--illustration-surface-alt)" />
      <rect x={cx - 28} y={topY} width={56} height={148} rx="10"
        fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
      {bulbs.map((b, i) => (
        <g key={i}>
          {b.lit && (
            <circle cx={cx} cy={b.cy} r="22" fill={b.on} opacity="0.12" />
          )}
          <circle cx={cx} cy={b.cy} r="16"
            fill={b.lit ? b.on : b.off}
            stroke={b.lit ? b.on : b.ring}
            strokeWidth="1.5"
            style={{ transition: 'fill 500ms, stroke 500ms',
              filter: b.lit ? `drop-shadow(0 0 8px ${b.glow})` : 'none' }} />
        </g>
      ))}
    </g>
  );
}

function ConditionCard({ x, y, label, truth, delay }: {
  x: number; y: number; label: string; truth: boolean; delay: number;
}) {
  const color = truth ? 'var(--illustration-success)' : 'var(--illustration-danger)';
  const glow  = truth ? 'var(--illustration-success-lighter-alt)' : 'var(--illustration-danger-light-soft)';
  const txt   = truth ? 'TRUE' : 'FALSE';
  const icon  = truth ? '✓' : '✗';
  return (
    <g style={{ animation: `tof-pop 0.35s ${delay}s both` }}>
      <rect x={x} y={y} width={200} height={42} rx="8" fill="var(--illustration-surface)" stroke={color} strokeWidth="1.5" />
      <circle cx={x + 25} cy={y + 21} r="8" fill={color} stroke={color} strokeWidth="1"
        style={{ filter: `drop-shadow(0 0 5px ${glow})` }} />
      <text x={x + 25} y={y + 25} textAnchor="middle" fill="#fff" fontSize="10" fontFamily="system-ui" fontWeight="700">{icon}</text>
      <text x={x + 42} y={y + 25} fill="var(--illustration-track)" fontSize="10" fontFamily="system-ui">{label}</text>
      <text x={x + 178} y={y + 21} textAnchor="middle" fill={color} fontSize="8" fontFamily="system-ui" fontWeight="800" opacity="0.8">{txt}</text>
    </g>
  );
}

function TrafficSignalSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 290" className="w-full" style={{ maxHeight: '420px' }}>
      <rect x="0" y="0" width="500" height="290" fill="var(--illustration-bg-deep)" rx="12" />

      {/* ── SCENE 0 — AND Logic: ALL TRUE → GREEN ── */}
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <ConditionCard x={20} y={18} label="Emergency Vehicle" truth={true} delay={0.1} />
          <ConditionCard x={20} y={70} label="Pedestrian Waiting" truth={true} delay={0.2} />
          <ConditionCard x={20} y={122} label="Traffic Clear" truth={true} delay={0.3} />

          {/* Connection lines */}
          <line x1={220} y1={39} x2={282} y2={39} stroke="var(--illustration-surface-mid)" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1={220} y1={91} x2={282} y2={91} stroke="var(--illustration-surface-mid)" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1={220} y1={143} x2={282} y2={143} stroke="var(--illustration-surface-mid)" strokeWidth="1.5" strokeDasharray="4,3" />

          {/* AND gate node */}
          <rect x={270} y={66} width={24} height={54} rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <text x={282} y={84} textAnchor="middle" fill="var(--illustration-secondary)" fontSize="11" fontFamily="system-ui" fontWeight="800">A</text>
          <text x={282} y={97} textAnchor="middle" fill="var(--illustration-secondary)" fontSize="11" fontFamily="system-ui" fontWeight="800">N</text>
          <text x={282} y={110} textAnchor="middle" fill="var(--illustration-secondary)" fontSize="11" fontFamily="system-ui" fontWeight="800">D</text>

          <line x1={294} y1={93} x2={328} y2={93} stroke="var(--illustration-success)" strokeWidth="2" />
          <polygon points="325,88 335,93 325,98" fill="var(--illustration-success)" />

          <TrafficLight cx={380} topY={15} litR={false} litY={false} litG={true} />

          <rect x={320} y={178} width={120} height={22} rx="6" fill="#041c0e" stroke="var(--illustration-success)" strokeWidth="1" />
          <text x={380} y={193} textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">GREEN LIGHT</text>

          <rect x={20} y={212} width={460} height={36} rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
          <text x={250} y={228} textAnchor="middle" fill="var(--illustration-secondary)" fontSize="13" fontFamily="system-ui" fontWeight="800">AND Logic</text>
          <text x={250} y={242} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">All three TRUE → GREEN light turns on</text>

          <rect x={20} y={258} width={460} height={24} rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" />
          <text x={250} y={274} textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="9" fontFamily="system-ui">
            AND: all must be TRUE
          </text>
        </g>
      )}

      {/* ── SCENE 1 — OR Logic: ONE TRUE → WALK ── */}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <ConditionCard x={20} y={18} label="Emergency Vehicle" truth={false} delay={0.1} />
          <ConditionCard x={20} y={70} label="Pedestrian Waiting" truth={true} delay={0.2} />
          <ConditionCard x={20} y={122} label="Traffic Clear" truth={false} delay={0.3} />

          <line x1={220} y1={39} x2={282} y2={39} stroke="var(--illustration-surface-mid)" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1={220} y1={91} x2={282} y2={91} stroke="var(--illustration-surface-mid)" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1={220} y1={143} x2={282} y2={143} stroke="var(--illustration-surface-mid)" strokeWidth="1.5" strokeDasharray="4,3" />

          <rect x={270} y={66} width={24} height={54} rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <text x={282} y={84} textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="11" fontFamily="system-ui" fontWeight="800">O</text>
          <text x={282} y={97} textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="11" fontFamily="system-ui" fontWeight="800">R</text>

          <line x1={294} y1={93} x2={328} y2={93} stroke="var(--illustration-success)" strokeWidth="2" />
          <polygon points="325,88 335,93 325,98" fill="var(--illustration-success)" />

          {/* Walk signal */}
          <g style={{ animation: 'tof-pop 0.4s 0.5s both' }}>
            <rect x={326} y={15} width={108} height={168} rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
            <circle cx={380} cy={70} r="12" fill="var(--illustration-success)" />
            <line x1={380} y1={82} x2={380} y2={110} stroke="var(--illustration-success)" strokeWidth="3" strokeLinecap="round" />
            <line x1={380} y1={92} x2={362} y2={80} stroke="var(--illustration-success)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={380} y1={92} x2={398} y2={80} stroke="var(--illustration-success)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={380} y1={110} x2={368} y2={132} stroke="var(--illustration-success)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={380} y1={110} x2={392} y2={132} stroke="var(--illustration-success)" strokeWidth="2.5" strokeLinecap="round" />
            <text x={380} y={158} textAnchor="middle" fill="var(--illustration-success)" fontSize="11" fontFamily="system-ui" fontWeight="800">WALK</text>
          </g>

          <rect x={20} y={212} width={460} height={36} rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <text x={250} y={228} textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="13" fontFamily="system-ui" fontWeight="800">OR Logic</text>
          <text x={250} y={242} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">One TRUE → WALK signal activates</text>

          <rect x={20} y={258} width={460} height={24} rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" />
          <text x={250} y={274} textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="9" fontFamily="system-ui">
            OR: at least one TRUE
          </text>
        </g>
      )}

      {/* ── SCENE 2 — NOT Logic: FALSE flips to TRUE → RED ── */}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <g style={{ animation: 'tof-pop 0.35s 0.1s both' }}>
            <rect x={30} y={28} width={160} height={58} rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-danger)" strokeWidth="1.5" />
            <circle cx={55} cy={57} r="9" fill="var(--illustration-danger)" stroke="var(--illustration-danger)" strokeWidth="1"
              style={{ filter: 'drop-shadow(0 0 5px var(--illustration-danger-light-soft))' }} />
            <text x={55} y={61} textAnchor="middle" fill="#fff" fontSize="9" fontFamily="system-ui" fontWeight="700">F</text>
            <text x={75} y={51} fill="var(--illustration-track)" fontSize="10" fontFamily="system-ui" fontWeight="600">P = FALSE</text>
            <text x={75} y={68} fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">"Safe to proceed"</text>
          </g>

          <g style={{ animation: 'tof-pop 0.4s 0.3s both' }}>
            <rect x={200} y={45} width={42} height={26} rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-accent)" strokeWidth="1.5" />
            <text x={221} y={63} textAnchor="middle" fill="var(--illustration-light)" fontSize="11" fontFamily="system-ui" fontWeight="800">NOT</text>
          </g>

          <g style={{ animation: 'tof-pop 0.35s 0.5s both' }}>
            <rect x={280} y={28} width={160} height={58} rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
            <circle cx={305} cy={57} r="9" fill="var(--illustration-success)" stroke="var(--illustration-success)" strokeWidth="1"
              style={{ filter: 'drop-shadow(0 0 5px var(--illustration-success-lighter-alt))' }} />
            <text x={305} y={61} textAnchor="middle" fill="#fff" fontSize="9" fontFamily="system-ui" fontWeight="700">T</text>
            <text x={325} y={51} fill="var(--illustration-track)" fontSize="10" fontFamily="system-ui" fontWeight="600">NOT P = TRUE</text>
            <text x={325} y={68} fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">"Not safe to proceed"</text>
          </g>

          <line x1={190} y1={57} x2={198} y2={57} stroke="var(--illustration-accent)" strokeWidth="1.5" strokeDasharray="3,2" />
          <polygon points="196,53 203,57 196,61" fill="var(--illustration-accent)" />
          <line x1={242} y1={57} x2={278} y2={57} stroke="var(--illustration-accent)" strokeWidth="1.5" strokeDasharray="3,2" />
          <polygon points="276,53 283,57 276,61" fill="var(--illustration-accent)" />

          <TrafficLight cx={150} topY={98} litR={true} litY={false} litG={false} />

          <g style={{ animation: 'tof-pop 0.4s 0.7s both' }}>
            <rect x={240} y={115} width={220} height={52} rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-accent)" strokeWidth="1.5" />
            <text x={350} y={135} textAnchor="middle" fill="var(--illustration-light)" fontSize="13" fontFamily="system-ui" fontWeight="800">NOT Logic</text>
            <text x={350} y={153} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">FALSE flips to TRUE → RED light turns on</text>
          </g>

          <rect x={20} y={258} width={460} height={24} rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" />
          <text x={250} y={274} textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="9" fontFamily="system-ui">
            NOT: flip the value
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Image-based think-of visuals ─────────────────────────────────────────────

function docHead(cx: number, cy: number, r: number) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.15} r={r * 0.12} fill="var(--illustration-element-muted)" />
      <circle cx={cx + r * 0.3} cy={cy - r * 0.15} r={r * 0.12} fill="var(--illustration-element-muted)" />
      <path d={`M ${cx - r * 0.35} ${cy + r * 0.2} Q ${cx} ${cy + r * 0.45} ${cx + r * 0.35} ${cy + r * 0.2}`} fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

function docBody(cx: number, cy: number) {
  return (
    <g>
      <rect x={cx - 18} y={cy - 5} width="36" height="50" rx="6" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1.2" />
      <line x1={cx - 10} y1={cy} x2={cx} y2={cy + 10} stroke="var(--illustration-element-muted)" strokeWidth="1" />
      <line x1={cx + 10} y1={cy} x2={cx} y2={cy + 10} stroke="var(--illustration-element-muted)" strokeWidth="1" />
      <path d={`M ${cx - 12} ${cy + 2} Q ${cx - 22} ${cy + 12} ${cx - 18} ${cy + 8} Q ${cx - 14} ${cy + 4} ${cx - 8} ${cy + 6}`} fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.2" />
      <path d={`M ${cx + 12} ${cy + 2} Q ${cx + 22} ${cy + 12} ${cx + 18} ${cy + 8} Q ${cx + 14} ${cy + 4} ${cx + 8} ${cy + 6}`} fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.2" />
      <circle cx={cx} cy={cy + 25} r="5" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.2" />
      <line x1={cx - 8} y1={cy + 8} x2={cx} y2={cy + 25} stroke="var(--illustration-secondary)" strokeWidth="1" />
      <line x1={cx + 8} y1={cy + 8} x2={cx} y2={cy + 25} stroke="var(--illustration-secondary)" strokeWidth="1" />
    </g>
  );
}

function DoctorKnowledgeBaseSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Heartbeat monitor */}
          <rect x="25" y="30" width="120" height="55" rx="8" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1.2" />
          <text x="40" y="46" fill="var(--illustration-danger)" fontSize="8" fontFamily="system-ui" fontWeight="600">♥ Monitor</text>
          <line x1="30" y1="68" x2="140" y2="68" stroke="#15202b" strokeWidth="0.5" />
          <polyline fill="none" stroke="var(--illustration-success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            points="30,65 50,65 55,65 60,65 65,65 68,65 69,50 71,82 73,65 78,65 85,65 90,65 95,65 100,65 105,65 108,60 110,72 112,65 125,65 140,65"
            strokeDasharray="120" strokeDashoffset="0">
            <animate attributeName="stroke-dashoffset" values="120;0;0" dur="1.2s" repeatCount="indefinite" />
          </polyline>

          {/* Knowledge shelf */}
          <g style={{ animation: 'tof-up 0.4s 0.1s both' }}>
            <rect x="165" y="44" width="70" height="4" rx="2" fill="var(--illustration-surface-alt)" />
            {[{ w: 38, x: 168 }, { w: 42, x: 170 }, { w: 36, x: 169 }].map((b, i) => (
              <rect key={i} x={b.x} y={30 + i * 8} width={b.w} height="7" rx="2" fill={i === 1 ? 'var(--illustration-bg-dark)' : 'var(--illustration-surface)'}
                stroke={i === 1 ? 'var(--illustration-primary)' : 'var(--illustration-surface-alt)'} strokeWidth="0.5" />
            ))}
            <text x="200" y="65" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Medical Library</text>
          </g>

          {/* Doctor */}
          <g style={{ animation: 'tof-up 0.4s 0.2s both' }}>
            {docHead(270, 72, 16)}
            {docBody(270, 87)}
            <text x="270" y="150" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">Doctor</text>
          </g>

          {/* Patient on bed */}
          <g style={{ animation: 'tof-up 0.4s 0.35s both' }}>
            <rect x="370" y="108" width="90" height="7" rx="3" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
            <rect x="378" y="115" width="5" height="12" fill="var(--illustration-surface)" />
            <rect x="447" y="115" width="5" height="12" fill="var(--illustration-surface)" />
            <rect x="378" y="92" width="48" height="18" rx="5" fill="var(--illustration-surface-alt)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            <circle cx="386" cy="82" r="11" fill="var(--illustration-surface-alt)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            <rect x="375" y="100" width="14" height="5" rx="2" fill="var(--illustration-surface)" />
            <text x="415" y="138" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Patient</text>
          </g>

          {/* IV drip */}
          <line x1="440" y1="70" x2="440" y2="105" stroke="var(--illustration-warning)" strokeWidth="0.8" />
          <rect x="434" y="64" width="12" height="12" rx="3" fill="var(--illustration-surface-alt)" stroke="var(--illustration-warning)" strokeWidth="0.8" />
          <circle r="1.5" fill="var(--illustration-warning)">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 440 76 L 440 103" />
          </circle>

          {/* Knowledge → Doctor flow */}
          <circle r="2" fill="var(--illustration-secondary)">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 240 55 Q 245 65 252 72" />
          </circle>

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Doctors rely on stored medical knowledge to examine and treat patients
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Graph-based knowledge matching */}
          <text x="250" y="20" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            SYMPTOMS → KNOWLEDGE → DIAGNOSIS
          </text>

          {/* Symptom nodes (left) */}
          {[
            { label: 'Fever', x: 60, y: 80, color: 'var(--illustration-warning)' },
            { label: 'Cough', x: 60, y: 145, color: 'var(--illustration-warning)' },
            { label: 'Fatigue', x: 60, y: 210, color: 'var(--illustration-danger-mid)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.12}s both` }}>
              <circle cx={s.x} cy={s.y} r="20" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="1.5" />
              <text x={s.x} y={s.y + 4} textAnchor="middle" fill={s.color} fontSize="9" fontFamily="system-ui" fontWeight="700">{s.label}</text>
            </g>
          ))}

          {/* Knowledge nodes (center) */}
          {[
            { label: 'Infection', x: 180, y: 85, color: 'var(--illustration-secondary)' },
            { label: 'Cold', x: 180, y: 145, color: 'var(--illustration-secondary)' },
            { label: 'Anemia', x: 180, y: 205, color: 'var(--illustration-danger-mid)' },
          ].map((n, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${0.3 + i * 0.1}s both` }}>
              <circle cx={n.x} cy={n.y} r="20" fill="var(--illustration-bg-dark)" stroke={n.color} strokeWidth="1.5" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill={n.color} fontSize="8" fontFamily="system-ui" fontWeight="700">{n.label}</text>
            </g>
          ))}

          {/* Edges — symptom → knowledge */}
          {[
            [0, 0], [0, 1], [1, 1], [2, 2],
          ].map(([from, to], i) => {
            const sx = 60, sy = [80, 145, 210][from];
            const nx = 180, ny = [85, 145, 205][to];
            return (
              <line key={i} x1={sx + 20} y1={sy} x2={nx - 20} y2={ny}
                stroke={i === 3 ? 'var(--illustration-danger-mid)' : 'var(--illustration-surface-mid)'} strokeWidth={i === 3 ? '2' : '1'}
                strokeDasharray={i === 3 ? undefined : '5,3'}
                style={{ animation: `tof-conn 0.6s ${0.6 + i * 0.12}s both` }} />
            );
          })}

          {/* Inference matches — highlighted path */}
          <circle r="3" fill="var(--illustration-danger-mid)" opacity="0.8">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 80 210 Q 110 220 158 205" />
          </circle>

          {/* Diagnosis node (right) */}
          <g style={{ animation: 'tof-pop 0.4s 0.8s both' }}>
            <rect x="250" y="120" width="100" height="50" rx="10" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="2" />
            <text x="300" y="142" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">Diagnosis</text>
            <text x="300" y="158" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="8" fontFamily="system-ui">Multiple</text>
          </g>

          {/* Inference arrow */}
          <line x1="180" y1="145" x2="248" y2="145" stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,3" />
          <polygon points="245,142 255,145 245,148" fill="var(--illustration-element-muted)" />

          {/* Pulsing diagnosis ring */}
          <circle cx="300" cy="145" r="38" fill="none" stroke="var(--illustration-success-alt)" strokeWidth="1" opacity="0"
            style={{ animation: 'tof-wave 2s ease infinite' }} />

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Symptoms are matched against stored medical knowledge to reach a diagnosis
          </text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* AI Inference Pipeline */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            AI INFERENCE PIPELINE
          </text>

          {/* Stage 1: Knowledge Base */}
          <g style={{ animation: 'tof-pop 0.35s 0.1s both' }}>
            <circle cx="80" cy="80" r="30" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="2" />
            <text x="80" y="76" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Knowledge</text>
            <text x="80" y="90" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Base</text>
            <text x="80" y="125" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Facts + Rules</text>
          </g>

          {/* Stage 2: Inference Engine */}
          <g style={{ animation: 'tof-pop 0.35s 0.25s both' }}>
            <rect x="170" y="52" width="160" height="56" rx="28" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="2" />
            {/* Processing dots */}
            <circle cx="195" cy="80" r="6" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.5"
              style={{ animation: 'tof-node 1.5s ease infinite' }} />
            <circle cx="220" cy="72" r="5" fill="var(--illustration-secondary)"
              style={{ animation: 'tof-node 1.5s ease 0.25s infinite' }} />
            <circle cx="250" cy="68" r="7" fill="none" stroke="var(--illustration-accent)" strokeWidth="1.5"
              style={{ animation: 'tof-node 1.5s ease 0.5s infinite' }} />
            <circle cx="280" cy="72" r="5" fill="var(--illustration-secondary)"
              style={{ animation: 'tof-node 1.5s ease 0.75s infinite' }} />
            <circle cx="305" cy="80" r="6" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.5"
              style={{ animation: 'tof-node 1.5s ease 1s infinite' }} />
            <text x="250" y="96" textAnchor="middle" fill="var(--illustration-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Inference Engine</text>
            {/* Flow line through engine */}
            <line x1="195" y1="80" x2="305" y2="80" stroke="var(--illustration-primary)" strokeWidth="1" strokeDasharray="4,3"
              style={{ animation: 'tof-flow 0.8s linear infinite' }} />
          </g>

          {/* Stage 3: Conclusion */}
          <g style={{ animation: 'tof-pop 0.35s 0.4s both' }}>
            <circle cx="425" cy="80" r="28" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="2" />
            <text x="425" y="76" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">New</text>
            <text x="425" y="90" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Knowledge</text>
            <text x="425" y="120" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Derived Facts</text>
          </g>

          {/* Flow particles between stages */}
          <circle r="2.5" fill="var(--illustration-secondary)">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M 110 80 Q 135 80 168 80" />
          </circle>
          <circle r="2.5" fill="var(--illustration-success-light)">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M 330 80 Q 370 80 395 80" />
          </circle>

          {/* Feedback loop */}
          <path d="M 425 112 Q 250 200 80 112" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1" strokeDasharray="4,3" opacity="0.4"
            style={{ animation: 'tof-flow 2.5s linear infinite' }} />
          <polygon points="83,115 80,107 76,115" fill="var(--illustration-element-muted)" opacity="0.4" />

          {/* Caption */}
          <g style={{ animation: 'tof-up 0.4s 0.7s both' }}>
            <rect x="80" y="155" width="340" height="40" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
            <text x="250" y="173" textAnchor="middle" fill="var(--illustration-accent)" fontSize="12" fontFamily="monospace" fontWeight="500">
              Facts + Rules → Inference → New Knowledge
            </text>
            <text x="250" y="188" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">
              Knowledge Base + Inference Engine = AI Reasoning
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

function DetectiveReasoningSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Title */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            DETECTIVE GATHERS FACTS
          </text>

          {/* Evidence items */}
          {[
            { label: '🔍 Fingerprint', x: 50, color: 'var(--illustration-warning)' },
            { label: '👣 Footprint', x: 180, color: 'var(--illustration-secondary)' },
            { label: '📝 Witness', x: 310, color: 'var(--illustration-accent-pink)' },
            { label: '🔦 Clue', x: 420, color: 'var(--illustration-success-bright)' },
          ].map((item, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.15}s both` }}>
              <rect x={item.x - 30} y={60 + (i % 2) * 55} width="60" height="40" rx="8"
                fill="var(--illustration-surface)" stroke={item.color} strokeWidth="1.2" opacity="0.9" />
              <text x={item.x} y={80 + (i % 2) * 55} textAnchor="middle" fill="var(--illustration-track)" fontSize="16">{item.color === 'var(--illustration-warning)' ? '🔍' : item.color === 'var(--illustration-secondary)' ? '👣' : item.color === 'var(--illustration-accent-pink)' ? '📝' : '🔦'}</text>
              <text x={item.x} y={96 + (i % 2) * 55} textAnchor="middle" fill={item.color} fontSize="7" fontFamily="system-ui" fontWeight="600">{item.label.split(' ')[1]}</text>
            </g>
          ))}

          {/* Magnifying glass visual */}
          <g style={{ animation: 'tof-float 2.5s ease-in-out infinite' }}>
            <circle cx="250" cy="190" r="22" fill="none" stroke="var(--illustration-muted-light)" strokeWidth="3" />
            <line x1="266" y1="206" x2="280" y2="220" stroke="var(--illustration-muted-light)" strokeWidth="3" strokeLinecap="round" />
          </g>

          <text x="250" y="252" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Detectives collect evidence first — each clue is a fact to investigate
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Title */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            CONNECTING CLUES → PATTERN EMERGES
          </text>

          {/* Evidence board */}
          <rect x="40" y="35" width="420" height="170" rx="6" fill="#0a0a14" stroke="var(--illustration-surface-alt)" strokeWidth="1.5" />

          {/* Clue cards on board */}
          {[
            { label: 'C1', x: 110, y: 70, color: 'var(--illustration-warning)' },
            { label: 'C2', x: 280, y: 60, color: 'var(--illustration-secondary)' },
            { label: 'C3', x: 70, y: 150, color: 'var(--illustration-accent-pink)' },
            { label: 'C4', x: 350, y: 140, color: 'var(--illustration-success-bright)' },
          ].map((c, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.2}s both` }}>
              <rect x={c.x - 22} y={c.y - 14} width="44" height="28" rx="5"
                fill="var(--illustration-surface-alt)" stroke={c.color} strokeWidth="1.2" />
              <text x={c.x} y={c.y + 1} textAnchor="middle" fill={c.color} fontSize="9" fontFamily="monospace" fontWeight="700">{c.label}</text>
              {/* Pin */}
              <circle cx={c.x} cy={c.y - 14} r="3" fill={c.color} />
            </g>
          ))}

          {/* Connecting strings */}
          {[
            { x1: 110, y1: 70, x2: 280, y2: 60 },
            { x1: 110, y1: 70, x2: 70, y2: 150 },
            { x1: 280, y1: 60, x2: 350, y2: 140 },
            { x1: 70, y1: 150, x2: 350, y2: 140 },
            { x1: 110, y1: 70, x2: 350, y2: 140 },
          ].map((line, i) => (
            <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
              stroke={i === 4 ? 'var(--illustration-warning)' : 'var(--illustration-surface-mid)'} strokeWidth={i === 4 ? '2' : '1'}
              strokeDasharray={i === 4 ? undefined : '6,4'}
              style={{ animation: `tof-conn 0.8s ${0.6 + i * 0.2}s both` }} />
          ))}

          {/* Pattern found highlight */}
          <g style={{ animation: 'tof-pop 0.4s 1.8s both' }}>
            <rect x="140" y="175" width="220" height="26" rx="6" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="1" />
            <text x="250" y="192" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Clues C1 → C4 → Pattern Found ✓</text>
          </g>

          <text x="250" y="252" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Individual clues connect logically → the bigger picture emerges
          </text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Title */}
          <text x="250" y="25" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            AI REASONING → CONCLUSION
          </text>

          {/* Evidence input */}
          <rect x="30" y="50" width="100" height="80" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <text x="80" y="78" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="700">Evidence</text>
          <text x="80" y="92" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="700">Input</text>
          <text x="80" y="112" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">All Clues</text>

          {/* Reasoning Engine */}
          <rect x="170" y="50" width="160" height="80" rx="12" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="2" />
          <text x="250" y="78" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700">Reasoning Engine</text>
          <text x="250" y="95" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="8" fontFamily="system-ui">Logic + Inference</text>
          {/* Processing animation */}
          <circle cx="220" cy="115" r="5" fill="var(--illustration-secondary)"
            style={{ animation: 'tof-node 1.8s ease infinite' }} />
          <circle cx="250" cy="115" r="5" fill="var(--illustration-secondary)"
            style={{ animation: 'tof-node 1.8s ease 0.4s infinite' }} />
          <circle cx="280" cy="115" r="5" fill="var(--illustration-secondary)"
            style={{ animation: 'tof-node 1.8s ease 0.8s infinite' }} />

          {/* Conclusion output */}
          <rect x="370" y="50" width="110" height="80" rx="10" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
          <text x="425" y="78" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">Conclusion</text>
          <text x="425" y="102" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="18" fontFamily="system-ui" fontWeight="800">✓</text>

          {/* Flow particles */}
          <circle r="3" fill="var(--illustration-warning)" opacity="0.7">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 130 90 Q 145 90 165 90" />
          </circle>
          <circle r="3" fill="var(--illustration-success-light)" opacity="0.7">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 330 90 Q 345 90 365 90" />
          </circle>

          {/* Inference chain */}
          <g style={{ animation: 'tof-up 0.4s 0.7s both' }}>
            <rect x="80" y="160" width="340" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            <text x="250" y="178" textAnchor="middle" fill="var(--illustration-light)" fontSize="12" fontFamily="monospace" fontWeight="500">
              Clues + Logic → Inference → Solved ✓
            </text>
          </g>

          <text x="250" y="252" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            AI follows the same reasoning path: facts → logical connection → conclusion
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Weather Forecast — Probability Meter ──────────────────────────────────

function WeatherForecastSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Weather data inputs */}
          <rect x="25" y="25" width="120" height="26" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="0.8" />
          <text x="85" y="42" textAnchor="middle" fill="var(--illustration-accent)" fontSize="8" fontFamily="system-ui" fontWeight="600">Pressure · Humidity · Satellite</text>

          {/* Forecaster desk */}
          <rect x="40" y="68" width="90" height="60" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          {docHead(85, 82, 12)}
          {docBody(85, 93)}
          <text x="85" y="145" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Forecaster</text>

          {/* Weather map */}
          <rect x="170" y="56" width="160" height="80" rx="8" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <path d="M 185 70 Q 210 60 235 75 Q 260 90 285 75 Q 310 60 315 70" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1" opacity="0.5" />
          <path d="M 180 100 Q 210 85 240 100 T 310 95" fill="none" stroke="var(--illustration-info)" strokeWidth="1" opacity="0.4" strokeDasharray="4,3" />
          <text x="250" y="128" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Weather Map</text>

          {/* Gauge */}
          <g transform="translate(380, 40)">
            <path d="M 0 75 A 55 55 0 0 1 110 75" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="3" />
            <path d="M 0 75 A 55 55 0 0 1 20 32" fill="none" stroke="var(--illustration-danger)" strokeWidth="8" opacity="0.3" />
            <path d="M 20 32 A 55 55 0 0 1 70 12" fill="none" stroke="var(--illustration-warning)" strokeWidth="8" opacity="0.3" />
            <path d="M 70 12 A 55 55 0 0 1 110 75" fill="none" stroke="var(--illustration-success)" strokeWidth="8" opacity="0.3" />
            <line x1="55" y1="75" x2="55" y2="18" stroke="var(--illustration-track)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="55" cy="75" r="5" fill="var(--illustration-surface-mid)" stroke="var(--illustration-muted-text)" strokeWidth="1" />
            <text x="55" y="95" textAnchor="middle" fill="var(--illustration-track)" fontSize="8" fontFamily="system-ui" fontWeight="800">50%</text>
          </g>

        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Rain clouds */}
          <path d="M 350 25 Q 380 10 410 25 Q 430 15 440 30" fill="none" stroke="var(--illustration-muted-light)" strokeWidth="2" opacity="0.6" />
          {[0,1,2,3,4].map(i => (
            <line key={i} x1={390 + i * 12} y1={35 + i * 3} x2={385 + i * 12} y2={55 + i * 3} stroke="var(--illustration-info)" strokeWidth="1" opacity="0.3" />
          ))}

          {/* Data evidence flowing in */}
          {[0,1,2].map(i => (
            <circle key={i} r="2.5" fill="var(--illustration-info)">
              <animateMotion dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite"
                path={`M ${60 + i * 50} 60 Q 120 100 180 ${80 + i * 10}`} />
            </circle>
          ))}

          {/* Pressure drop alert */}
          <g style={{ animation: 'tof-pop 0.3s 0.2s both' }}>
            <rect x="30" y="50" width="100" height="24" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="80" y="66" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="8" fontFamily="system-ui" fontWeight="600">↓ Pressure dropping</text>
          </g>

          {/* Gauge at 80% */}
          <g transform="translate(170, 50)">
            <path d="M 0 105 A 70 70 0 0 1 140 105" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="4" />
            <path d="M 0 105 A 70 70 0 0 1 25 50" fill="none" stroke="var(--illustration-danger)" strokeWidth="12" opacity="0.3" />
            <path d="M 25 50 A 70 70 0 0 1 60 25" fill="none" stroke="var(--illustration-warning)" strokeWidth="12" opacity="0.3" />
            <path d="M 60 25 A 70 70 0 0 1 140 105" fill="none" stroke="var(--illustration-success)" strokeWidth="12" opacity="0.3" />
            <line x1="70" y1="105" x2="95" y2="30" stroke="var(--illustration-warning)" strokeWidth="2.5" strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.5))' }} />
            <circle cx="70" cy="105" r="6" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
            <text x="70" y="126" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="12" fontFamily="system-ui" fontWeight="800">80%</text>
            <text x="70" y="138" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Rain likely</text>
          </g>

          {/* Evidence badge */}
          <g style={{ animation: 'tof-pop 0.3s 0.5s both' }}>
            <rect x="310" y="80" width="150" height="28" rx="8" fill="var(--illustration-bg-warm)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="385" y="100" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="700">New evidence → Update</text>
          </g>

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Each new observation updates the probability — evidence shifts belief
          </text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Bayesian Update Cycle */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            BAYESIAN UPDATE CYCLE
          </text>

          {/* Prior */}
          <g style={{ animation: 'tof-pop 0.35s 0.1s both' }}>
            <circle cx="80" cy="80" r="30" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="2" />
            <text x="80" y="76" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Prior</text>
            <text x="80" y="90" textAnchor="middle" fill="var(--illustration-accent)" fontSize="7" fontFamily="system-ui">P(H)</text>
            <text x="80" y="122" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Initial belief</text>
          </g>

          {/* Likelihood */}
          <g style={{ animation: 'tof-pop 0.35s 0.25s both' }}>
            <circle cx="250" cy="35" r="28" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="2" />
            <text x="250" y="31" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="8" fontFamily="system-ui" fontWeight="700">Evidence</text>
            <text x="250" y="45" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="7" fontFamily="system-ui">P(E|H)</text>
            <text x="250" y="72" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">New data</text>
          </g>

          {/* Posterior */}
          <g style={{ animation: 'tof-pop 0.35s 0.4s both' }}>
            <circle cx="420" cy="80" r="30" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="2" />
            <text x="420" y="76" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Posterior</text>
            <text x="420" y="90" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="7" fontFamily="system-ui">P(H|E)</text>
            <text x="420" y="122" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Updated belief</text>
          </g>

          {/* Arrows */}
          <line x1="110" y1="75" x2="222" y2="50" stroke="var(--illustration-secondary)" strokeWidth="1.5" strokeDasharray="5,3" />
          <polygon points="218,54 228,46 219,44" fill="var(--illustration-secondary)" />
          <line x1="250" y1="63" x2="250" y2="78" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <polygon points="246,74 254,74 250,82" fill="var(--illustration-warning)" />
          <line x1="278" y1="50" x2="390" y2="75" stroke="var(--illustration-success)" strokeWidth="1.5" strokeDasharray="5,3" />
          <polygon points="386,71 396,79 387,81" fill="var(--illustration-success)" />

          {/* Formula */}
          <g style={{ animation: 'tof-up 0.4s 0.6s both' }}>
            <rect x="80" y="155" width="340" height="36" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
            <text x="250" y="172" textAnchor="middle" fill="var(--illustration-accent)" fontSize="12" fontFamily="monospace" fontWeight="500">
              P(H|E) = P(E|H) × P(H) / P(E)
            </text>
            <text x="250" y="186" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">
              Posterior = Likelihood × Prior ÷ Evidence
            </text>
          </g>

          {/* Feedback loop */}
          <path d="M 420 112 Q 250 200 80 112" fill="none" stroke="var(--illustration-element-muted)" strokeWidth="1" strokeDasharray="4,3" opacity="0.4"
            style={{ animation: 'tof-flow 2.5s linear infinite' }} />
          <polygon points="83,115 80,107 76,115" fill="var(--illustration-element-muted)" opacity="0.4" />
          <text x="250" y="230" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">Posterior becomes next Prior</text>
        </g>
      )}
    </svg>
  );
}

// ── Dice Roll — Random Variables ─────────────────────────────────────────

function DiceRollSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Title */}
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            EVERY OUTCOME HAS A NUMBER
          </text>

          {/* Child figure */}
          <g transform="translate(80, 80)">
            {/* Body */}
            <rect x="-10" y="20" width="20" height="30" rx="6" fill="var(--illustration-primary)" opacity="0.3" />
            {/* Head */}
            <circle cx="0" cy="10" r="14" fill="var(--illustration-primary)" opacity="0.2" stroke="var(--illustration-secondary)" strokeWidth="0.8" />
            <circle cx="-4" cy="8" r="2" fill="var(--illustration-secondary)" opacity="0.5" />
            <circle cx="4" cy="8" r="2" fill="var(--illustration-secondary)" opacity="0.5" />
            <path d="M-4 15 Q0 18 4 15" stroke="var(--illustration-secondary)" strokeWidth="0.8" fill="none" opacity="0.4" />
            {/* Arm tossing */}
            <path d="M10 24 Q30 10 45 20" stroke="var(--illustration-primary)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
          </g>

          {/* Table */}
          <rect x="55" y="185" width="100" height="8" rx="3" fill="var(--illustration-surface-mid)" opacity="0.5" />
          <rect x="65" y="178" width="8" height="10" rx="1" fill="var(--illustration-surface-alt)" opacity="0.4" />
          <rect x="135" y="178" width="8" height="10" rx="1" fill="var(--illustration-surface-alt)" opacity="0.4" />

          {/* Dice in air (spinning) */}
          <g transform="translate(120, 100)">
            <rect x="-18" y="-18" width="36" height="36" rx="6" fill="var(--illustration-special-mid)" opacity="0.15" stroke="var(--illustration-special)" strokeWidth="1.2">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite" />
            </rect>
            <circle cx="-6" cy="-6" r="3" fill="var(--illustration-special)" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="6" cy="6" r="3" fill="var(--illustration-special)" opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Question marks floating */}
          <text x="145" y="82" textAnchor="middle" fill="var(--illustration-warning)" fontSize="16" fontWeight="700" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.8s" repeatCount="indefinite" />?
          </text>
          <text x="100" y="60" textAnchor="middle" fill="var(--illustration-warning)" fontSize="12" fontWeight="700" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.2s" repeatCount="indefinite" />?
          </text>
          <text x="160" y="55" textAnchor="middle" fill="var(--illustration-warning)" fontSize="10" fontWeight="700" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.6s" repeatCount="indefinite" />?
          </text>

          {/* Possible outcomes (1-6) around right side */}
          {[1,2,3,4,5,6].map(n => {
            const angle = (n - 1) * (Math.PI / 3) - Math.PI / 2;
            const cx = 260 + Math.cos(angle) * 55;
            const cy = 120 + Math.sin(angle) * 45;
            return (
              <g key={n}>
                <circle cx={cx} cy={cy} r="14" fill={n === 4 ? 'var(--illustration-special-mid)' : 'var(--illustration-surface)'} fillOpacity={n === 4 ? 0.15 : 0.4} stroke={n === 4 ? 'var(--illustration-special)' : 'var(--illustration-surface-mid)'} strokeWidth={n === 4 ? 1.2 : 0.6} />
                <text x={cx} y={cy + 1} textAnchor="middle" fill={n === 4 ? 'var(--illustration-special)' : 'var(--illustration-muted-light)'} fontSize="10" fontFamily="system-ui" fontWeight="700">{n}</text>
              </g>
            );
          })}

          {/* Glowing path from dice to outcomes */}
          <circle cx="155" cy="165" r="60" fill="none" stroke="var(--illustration-special)" strokeWidth="0.5" opacity="0.1" strokeDasharray="2,4">
            <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Caption */}
          <text x="250" y="248" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            Before the die lands, any number from 1 to 6 could appear
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Title */}
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            THE RANDOM VARIABLE RECORDS THE RESULT
          </text>

          {/* Dice landed on 4 */}
          <g transform="translate(95, 95)">
            <rect x="-28" y="-28" width="56" height="56" rx="8" fill="var(--illustration-special-mid)" opacity="0.12" stroke="var(--illustration-special)" strokeWidth="1.2" />
            {/* 4 dots */}
            <circle cx="-10" cy="-10" r="4" fill="var(--illustration-special)" opacity="0.5" />
            <circle cx="10" cy="-10" r="4" fill="var(--illustration-special)" opacity="0.5" />
            <circle cx="-10" cy="10" r="4" fill="var(--illustration-special)" opacity="0.5" />
            <circle cx="10" cy="10" r="4" fill="var(--illustration-special)" opacity="0.5" />
            <text x="0" y="40" textAnchor="middle" fill="var(--illustration-special)" fontSize="10" fontFamily="system-ui" fontWeight="700">Die shows 4</text>
          </g>

          {/* Arrow from dice to notebook */}
          <path d="M135 110 Q180 100 210 110" stroke="var(--illustration-element-muted)" strokeWidth="1.2" fill="none" markerEnd="url(#arrow)" strokeDasharray="3,2" opacity="0.5" />

          {/* Notebook / Scorecard */}
          <g transform="translate(215, 75)">
            <rect x="0" y="0" width="130" height="90" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="0.8" />
            <text x="65" y="18" textAnchor="middle" fill="var(--illustration-accent)" fontSize="7" fontFamily="system-ui" fontWeight="600">Scorecard</text>
            <line x1="15" y1="24" x2="115" y2="24" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" />
            <text x="20" y="40" fill="var(--illustration-muted-text)" fontSize="9" fontFamily="system-ui">Roll</text>
            <text x="95" y="40" textAnchor="end" fill="var(--illustration-special)" fontSize="9" fontFamily="system-ui" fontWeight="700">4</text>
            <line x1="15" y1="48" x2="115" y2="48" stroke="var(--illustration-surface-mid)" strokeWidth="0.3" />
            <text x="20" y="58" fill="var(--illustration-muted-text)" fontSize="9" fontFamily="system-ui">X =</text>
            <text x="105" y="58" textAnchor="end" fill="var(--illustration-special)" fontSize="9" fontFamily="system-ui" fontWeight="700">4</text>
            <line x1="15" y1="66" x2="115" y2="66" stroke="var(--illustration-surface-mid)" strokeWidth="0.3" />
            <text x="65" y="80" textAnchor="middle" fill="var(--illustration-primary)" fontSize="7" fontFamily="system-ui" fontWeight="600">Outcome → Number</text>
          </g>

          {/* Mapping examples below */}
          <g transform="translate(30, 175)">
            {/* Coin flip */}
            <rect x="0" y="0" width="120" height="40" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="0.5" opacity="0.8" />
            <circle cx="20" cy="20" r="10" fill="var(--illustration-warning)" opacity="0.12" stroke="var(--illustration-warning-light)" strokeWidth="0.6" />
            <text x="20" y="23" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="8" fontFamily="system-ui" fontWeight="700">H</text>
            <path d="M35 20 L45 20" stroke="var(--illustration-element-muted)" strokeWidth="0.8" />
            <text x="60" y="16" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui">Heads → X = 1</text>
            <text x="60" y="32" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui">Tails → X = 0</text>

            {/* Spinner */}
            <rect x="140" y="0" width="120" height="40" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-success-dim)" strokeWidth="0.5" opacity="0.8" />
            <circle cx="160" cy="20" r="10" fill="var(--illustration-success-dim)" opacity="0.12" stroke="var(--illustration-success-bright)" strokeWidth="0.6" />
            <path d="M160 10 L160 20 L168 20" stroke="var(--illustration-success-bright)" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M175 20 L185 20" stroke="var(--illustration-element-muted)" strokeWidth="0.8" />
            <text x="200" y="16" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui">Red → X = 1</text>
            <text x="200" y="32" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui">Blue → X = 2</text>

            {/* Dice */}
            <rect x="280" y="0" width="120" height="40" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-special-mid)" strokeWidth="0.5" opacity="0.8" />
            <rect x="293" y="10" width="20" height="20" rx="4" fill="var(--illustration-special-mid)" opacity="0.1" stroke="var(--illustration-special)" strokeWidth="0.6" />
            <text x="303" y="22" textAnchor="middle" fill="var(--illustration-special)" fontSize="8" fontFamily="system-ui" fontWeight="700">4</text>
            <path d="M320 20 L330 20" stroke="var(--illustration-element-muted)" strokeWidth="0.8" />
            <text x="345" y="16" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui">Dice → X = 4</text>
            <text x="345" y="32" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui">Value recorded</text>
          </g>

          {/* Caption */}
          <text x="250" y="248" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            A random variable X assigns a number to the outcome: X(die = 4) → 4
          </text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Title */}
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            THIS IS A RANDOM VARIABLE
          </text>

          {/* Left half: Outcome table */}
          <g transform="translate(20, 40)">
            <rect x="0" y="0" width="200" height="160" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="0.6" />
            <text x="100" y="18" textAnchor="middle" fill="var(--illustration-accent)" fontSize="8" fontFamily="system-ui" fontWeight="600">Outcome → Value</text>
            <line x1="10" y1="24" x2="190" y2="24" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" />
            {/* Table header */}
            <rect x="10" y="28" width="85" height="18" rx="3" fill="var(--illustration-primary)" opacity="0.08" />
            <text x="52" y="40" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui" fontWeight="600">Outcome</text>
            <rect x="105" y="28" width="85" height="18" rx="3" fill="var(--illustration-primary)" opacity="0.08" />
            <text x="147" y="40" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui" fontWeight="600">X (value)</text>
            {/* Table rows */}
            {[1,2,3,4,5,6].map(n => (
              <g key={n}>
                <rect x="10" y={48 + n * 16} width="85" height="16" rx="2" fill={n % 2 === 0 ? 'var(--illustration-surface-alt)' : 'transparent'} opacity="0.3" />
                <text x="52" y={60 + n * 16} textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="8" fontFamily="system-ui">{n}</text>
                <rect x="105" y={48 + n * 16} width="85" height="16" rx="2" fill={n % 2 === 0 ? 'var(--illustration-surface-alt)' : 'transparent'} opacity="0.3" />
                <text x="147" y={60 + n * 16} textAnchor="middle" fill="var(--illustration-special)" fontSize="8" fontFamily="system-ui" fontWeight="700">{n}</text>
              </g>
            ))}
            <text x="100" y="155" textAnchor="middle" fill="var(--illustration-primary)" fontSize="6" fontFamily="system-ui">Each outcome maps to its number</text>
          </g>

          {/* Connecting arrow */}
          <g transform="translate(230, 110)">
            <path d="M0 0 Q15 0 15 0" stroke="var(--illustration-element-muted)" strokeWidth="1" fill="none" />
            <polygon points="18,-3 24,0 18,3" fill="var(--illustration-element-muted)" />
          </g>

          {/* Right half: Bar chart */}
          <g transform="translate(265, 40)">
            <rect x="0" y="0" width="215" height="160" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-special-mid)" strokeWidth="0.6" />
            <text x="107" y="18" textAnchor="middle" fill="var(--illustration-special)" fontSize="8" fontFamily="system-ui" fontWeight="600">Probability Distribution</text>
            <line x1="10" y1="24" x2="205" y2="24" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" />

            {/* Y-axis label */}
            <text x="-90" y="-25" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="6" fontFamily="system-ui" transform="rotate(-90)">Probability</text>

            {/* Bars */}
            {[1,2,3,4,5,6].map((n, i) => {
              const barH = 70;
              return (
                <g key={n}>
                  <rect x={18 + i * 30} y={110 - barH} width="20" height={barH} rx="3" fill="var(--illustration-special-mid)" opacity={0.15 + i * 0.04} stroke="var(--illustration-special)" strokeWidth="0.6">
                    <animate attributeName="height" from="0" to={barH} dur="0.6s" begin={`${i * 0.08}s`} fill="freeze" />
                    <animate attributeName="y" from="110" to={110 - barH} dur="0.6s" begin={`${i * 0.08}s`} fill="freeze" />
                  </rect>
                  <text x={28 + i * 30} y={122} textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="8" fontFamily="system-ui" fontWeight="600">{n}</text>
                  <text x={28 + i * 30} y={100 - barH} textAnchor="middle" fill="var(--illustration-special)" fontSize="6" fontFamily="system-ui" fontWeight="700">1/6</text>
                </g>
              );
            })}

            {/* Equal probability label */}
            <text x="107" y="148" textAnchor="middle" fill="var(--illustration-primary)" fontSize="7" fontFamily="system-ui" fontWeight="600">
              P(X = x) = 1/6 for each outcome
            </text>
          </g>

          {/* Caption */}
          <text x="250" y="248" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            A random variable lets us describe uncertain events with numbers — making them easy to analyze with probability
          </text>
        </g>
      )}

      {/* Arrow marker definition */}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--illustration-element-muted)" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Bayes Theorem — Medical Diagnosis ────────────────────────────────────

function BayesUpdateSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Population visualization */}
          <text x="250" y="20" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            RARE DISEASE: 1 IN 1000
          </text>

          {/* People grid */}
          {Array.from({ length: 50 }).map((_, i) => {
            const row = Math.floor(i / 10), col = i % 10;
            const isAffected = i === 17;
            return (
              <circle key={i} cx={40 + col * 44} cy={40 + row * 38} r="10"
                fill={isAffected ? 'var(--illustration-danger-bg-alt)' : 'var(--illustration-surface)'}
                stroke={isAffected ? 'var(--illustration-danger)' : 'var(--illustration-surface-alt)'} strokeWidth="1"
                style={{ animation: isAffected ? 'tof-node 2s ease infinite' : undefined }} />
            );
          })}

          {/* Prior belief */}
          <g style={{ animation: 'tof-pop 0.4s 0.5s both' }}>
            <rect x="120" y="225" width="260" height="32" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <text x="250" y="242" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700">Prior: P(Disease) = 0.1%</text>
            <text x="250" y="254" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">Very low — before any test</text>
          </g>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Test arrives */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            TEST ARRIVES — 99% ACCURATE
          </text>

          {/* Test result */}
          <g style={{ animation: 'tof-pop 0.35s 0.1s both' }}>
            <rect x="30" y="40" width="120" height="100" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
            <text x="90" y="65" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="10" fontFamily="system-ui" fontWeight="700">Test Result</text>
            <text x="90" y="90" textAnchor="middle" fill="var(--illustration-danger)" fontSize="18" fontFamily="system-ui" fontWeight="800">POSITIVE</text>
            <text x="90" y="115" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">99% accurate</text>
            <text x="90" y="128" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">1% false positive</text>
          </g>

          {/* Bayes formula visual */}
          <g style={{ animation: 'tof-pop 0.35s 0.3s both' }}>
            <rect x="170" y="40" width="160" height="100" rx="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
            <text x="250" y="62" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Bayes' Theorem</text>
            <text x="250" y="82" textAnchor="middle" fill="var(--illustration-accent)" fontSize="11" fontFamily="monospace" fontWeight="600">P(H|E)</text>
            <text x="250" y="100" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">P(E|H) · P(H)</text>
            <line x1="210" y1="105" x2="290" y2="105" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <text x="250" y="120" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">P(E)</text>
            <text x="250" y="136" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Posterior ≈ 9%</text>
          </g>

          {/* Counter-intuitive result */}
          <g style={{ animation: 'tof-pop 0.35s 0.5s both' }}>
            <rect x="350" y="40" width="120" height="100" rx="10" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
            <text x="410" y="65" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">Posterior</text>
            <text x="410" y="95" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="20" fontFamily="system-ui" fontWeight="800">9%</text>
            <text x="410" y="125" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Still low due to rarity</text>
          </g>

          {/* Flow arrows */}
          <line x1="150" y1="90" x2="168" y2="90" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <polygon points="164,87 174,90 164,93" fill="var(--illustration-warning)" />
          <line x1="330" y1="90" x2="348" y2="90" stroke="var(--illustration-success-light)" strokeWidth="1.5" />
          <polygon points="344,87 354,90 344,93" fill="var(--illustration-success-light)" />

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Bayes combines prior rarity with test accuracy to find the true posterior
          </text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* AI Applications of Bayes */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            AI USES BAYES EVERYWHERE
          </text>

          {/* Spam Filter */}
          <g style={{ animation: 'tof-pop 0.35s 0.1s both' }}>
            <rect x="25" y="40" width="130" height="90" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
            <text x="90" y="65" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="700">📧 Spam Filter</text>
            <text x="90" y="85" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">P(Spam | Word)</text>
            <text x="90" y="105" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Updates as emails arrive</text>
            {/* Pulsing dot */}
            <circle cx="90" cy="122" r="4" fill="var(--illustration-warning)"
              style={{ animation: 'tof-node 1.5s ease infinite' }} />
          </g>

          {/* Medical Diagnosis */}
          <g style={{ animation: 'tof-pop 0.35s 0.25s both' }}>
            <rect x="185" y="40" width="130" height="90" rx="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
            <text x="250" y="65" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">🩺 Medical AI</text>
            <text x="250" y="85" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">P(Disease | Symptoms)</text>
            <text x="250" y="105" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Updates with each test</text>
            <circle cx="250" cy="122" r="4" fill="var(--illustration-secondary)"
              style={{ animation: 'tof-node 1.5s ease 0.4s infinite' }} />
          </g>

          {/* Recommendation */}
          <g style={{ animation: 'tof-pop 0.35s 0.4s both' }}>
            <rect x="345" y="40" width="130" height="90" rx="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1.5" />
            <text x="410" y="65" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">🎬 Recommendations</text>
            <text x="410" y="85" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">P(Likes | Watched)</text>
            <text x="410" y="105" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Updates with each view</text>
            <circle cx="410" cy="122" r="4" fill="var(--illustration-success-light)"
              style={{ animation: 'tof-node 1.5s ease 0.8s infinite' }} />
          </g>

          {/* Connecting arrows */}
          <line x1="155" y1="85" x2="183" y2="85" stroke="var(--illustration-element-muted)" strokeWidth="1" strokeDasharray="4,2" />
          <line x1="315" y1="85" x2="343" y2="85" stroke="var(--illustration-element-muted)" strokeWidth="1" strokeDasharray="4,2" />

          {/* Bottom insight */}
          <g style={{ animation: 'tof-up 0.4s 0.6s both' }}>
            <rect x="80" y="160" width="340" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
            <text x="250" y="178" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="600">
              Every new observation refines the probability toward truth
            </text>
            <text x="250" y="192" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">
              AI doesn't guess — it updates with Bayes
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ── Bayesian Networks — Causal Graph ─────────────────────────────────────

function BayesianNetworkSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Causal chain */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            CAUSE → EFFECT CHAIN
          </text>

          {/* Rain node */}
          <g style={{ animation: 'tof-pop 0.3s 0.1s both' }}>
            <circle cx="100" cy="80" r="28" fill="var(--illustration-surface)" stroke="var(--illustration-info)" strokeWidth="2" />
            <text x="100" y="76" textAnchor="middle" fill="var(--illustration-info)" fontSize="10" fontFamily="system-ui" fontWeight="700">Rain</text>
            <text x="100" y="90" textAnchor="middle" fill="var(--illustration-info)" fontSize="7" fontFamily="system-ui">Cause</text>
            <text x="100" y="120" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Rain falls</text>
          </g>

          {/* Arrow */}
          <line x1="128" y1="80" x2="170" y2="80" stroke="var(--illustration-element-muted)" strokeWidth="2" />
          <polygon points="166,76 176,80 166,84" fill="var(--illustration-element-muted)" />

          {/* Wet Grass node */}
          <g style={{ animation: 'tof-pop 0.3s 0.25s both' }}>
            <circle cx="210" cy="80" r="28" fill="var(--illustration-surface)" stroke="var(--illustration-success-bright)" strokeWidth="2" />
            <text x="210" y="76" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="10" fontFamily="system-ui" fontWeight="700">Wet</text>
            <text x="210" y="90" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">Grass</text>
            <text x="210" y="120" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Effect</text>
          </g>

          {/* Arrow */}
          <line x1="238" y1="80" x2="280" y2="80" stroke="var(--illustration-element-muted)" strokeWidth="2" />
          <polygon points="276,76 286,80 276,84" fill="var(--illustration-element-muted)" />

          {/* Slippery node */}
          <g style={{ animation: 'tof-pop 0.3s 0.4s both' }}>
            <circle cx="320" cy="50" r="24" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="2" />
            <text x="320" y="46" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="700">Slippery</text>
            <text x="320" y="60" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="7" fontFamily="system-ui">Path</text>
            <text x="320" y="88" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Wet → Slippery</text>
          </g>

          {/* Arrow to Slippery */}
          <line x1="238" y1="72" x2="296" y2="55" stroke="var(--illustration-element-muted)" strokeWidth="2" />
          <polygon points="292,60 304,50 296,48" fill="var(--illustration-element-muted)" />

          {/* Accident node */}
          <g style={{ animation: 'tof-pop 0.3s 0.55s both' }}>
            <circle cx="410" cy="80" r="24" fill="var(--illustration-surface)" stroke="var(--illustration-danger)" strokeWidth="2" />
            <text x="410" y="76" textAnchor="middle" fill="var(--illustration-danger)" fontSize="9" fontFamily="system-ui" fontWeight="700">Accident</text>
            <text x="410" y="90" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui">Risk ↑</text>
            <text x="410" y="118" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Chain outcome</text>
          </g>

          {/* Arrow to Accident */}
          <line x1="330" y1="60" x2="390" y2="75" stroke="var(--illustration-element-muted)" strokeWidth="2" />
          <polygon points="386,71 396,80 385,78" fill="var(--illustration-element-muted)" />

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            One event triggers the next — a chain of cause and effect
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Bayesian Network graph */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            OBSERVE ONE → UPDATES ALL
          </text>

          {/* Network nodes */}
          {[
            { cx: 100, cy: 80, label: 'Rain', color: 'var(--illustration-info)', highlight: true },
            { cx: 210, cy: 40, label: 'Sprinkler', color: 'var(--illustration-success-bright)' },
            { cx: 180, cy: 150, label: 'Wet Grass', color: 'var(--illustration-warning)', highlight: true },
            { cx: 310, cy: 80, label: 'Slippery', color: 'var(--illustration-accent-pink)' },
            { cx: 400, cy: 120, label: 'Accident', color: 'var(--illustration-danger)' },
            { cx: 370, cy: 30, label: 'Rain Cancel', color: 'var(--illustration-secondary)' },
          ].map((n, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${0.1 + i * 0.08}s both` }}>
              <circle cx={n.cx} cy={n.cy} r="22"
                fill={n.highlight ? 'var(--illustration-bg-dark)' : 'var(--illustration-surface)'}
                stroke={n.color} strokeWidth={n.highlight ? '2.5' : '1.5'} />
              <text x={n.cx} y={n.cy + 1} textAnchor="middle" fill={n.color} fontSize="7" fontFamily="system-ui" fontWeight="700">{n.label.split(' ')[0]}</text>
              <text x={n.cx} y={n.cy + 11} textAnchor="middle" fill={n.color} fontSize="6" fontFamily="system-ui">{n.label.split(' ')[1] || ''}</text>
              {/* Highlight ring */}
              {n.highlight && (
                <circle cx={n.cx} cy={n.cy} r="28" fill="none" stroke={n.color} strokeWidth="1" opacity="0"
                  style={{ animation: 'tof-wave 2s ease infinite' }} />
              )}
            </g>
          ))}

          {/* Edges */}
          {[
            [0, 2], [1, 2], [2, 3], [3, 4], [0, 5], [5, 4],
          ].map(([from, to], i) => {
            const nodes = [
              { cx: 100, cy: 80 }, { cx: 210, cy: 40 }, { cx: 180, cy: 150 },
              { cx: 310, cy: 80 }, { cx: 400, cy: 120 }, { cx: 370, cy: 30 },
            ];
            return (
              <line key={i} x1={nodes[from].cx} y1={nodes[from].cy + 22}
                x2={nodes[to].cx} y2={nodes[to].cy - 22}
                stroke={i < 4 ? 'var(--illustration-element-muted)' : 'var(--illustration-element-muted)'} strokeWidth="1" strokeDasharray="4,3"
                style={{ animation: `tof-conn 0.5s ${0.5 + i * 0.08}s both` }} />
            );
          })}

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Observing Wet Grass updates probability of both Rain and Slippery
          </text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Evidence propagation */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            EVIDENCE PROPAGATES THROUGH NETWORK
          </text>

          {/* Input: Observed evidence */}
          <g style={{ animation: 'tof-pop 0.35s 0.1s both' }}>
            <rect x="30" y="45" width="100" height="50" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="2" />
            <text x="80" y="68" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="700">🔍 Evidence</text>
            <text x="80" y="84" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="8" fontFamily="system-ui">Wet Grass</text>
          </g>

          {/* Network visual */}
          <g style={{ animation: 'tof-pop 0.35s 0.25s both' }}>
            <rect x="160" y="40" width="180" height="120" rx="12" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="2" />
            <text x="250" y="62" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Bayesian Network</text>

            {/* Nodes inside */}
            {[
              { cx: 210, cy: 90, label: 'Rain', color: 'var(--illustration-info)' },
              { cx: 290, cy: 85, label: 'Sprinkler', color: 'var(--illustration-success-bright)' },
              { cx: 250, cy: 135, label: 'Wet Grass', color: 'var(--illustration-warning)' },
            ].map((n, i) => (
              <g key={i}>
                <circle cx={n.cx} cy={n.cy} r="16" fill="var(--illustration-surface)" stroke={n.color} strokeWidth="1.5" />
                <text x={n.cx} y={n.cy + 1} textAnchor="middle" fill={n.color} fontSize="7" fontFamily="system-ui" fontWeight="700">{n.label}</text>
                <line x1={210} y1={106} x2={250} y2={119} stroke="var(--illustration-element-muted)" strokeWidth="1" />
                <line x1={290} y1={101} x2={250} y2={119} stroke="var(--illustration-element-muted)" strokeWidth="1" />
              </g>
            ))}
          </g>

          {/* Output: Updated beliefs */}
          <g style={{ animation: 'tof-pop 0.35s 0.4s both' }}>
            <rect x="370" y="45" width="100" height="110" rx="10" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
            <text x="420" y="65" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Updated</text>
            <text x="420" y="78" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Beliefs</text>
            <text x="420" y="100" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="800">Rain: 85%</text>
            <text x="420" y="120" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="10" fontFamily="system-ui" fontWeight="800">Sprinkler: 5%</text>
            <text x="420" y="145" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Probabilities updated</text>
          </g>

          {/* Flow arrows */}
          <line x1="130" y1="70" x2="158" y2="70" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <polygon points="154,67 164,70 154,73" fill="var(--illustration-warning)" />
          <line x1="340" y1="100" x2="368" y2="100" stroke="var(--illustration-success-light)" strokeWidth="1.5" />
          <polygon points="364,97 374,100 364,103" fill="var(--illustration-success-light)" />

          {/* Propagation particles */}
          <circle r="2.5" fill="var(--illustration-info)">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 210 90 Q 230 90 250 135" />
          </circle>
          <circle r="2.5" fill="var(--illustration-success-bright)">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 290 85 Q 270 85 250 135" />
          </circle>

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Observing one variable updates all connected probabilities through the network
          </text>
        </g>
      )}
    </svg>
  );
}

// ── GPS Route Optimization ───────────────────────────────────────────────

function GPSRouteOptimizationSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* GPS Map */}
          <rect x="25" y="25" width="450" height="160" rx="10" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />

          {/* Grid lines */}
          {[60, 95, 130, 165].map(y => <line key={'h'+y} x1="30" y1={y} x2="470" y2={y} stroke="var(--illustration-surface)" strokeWidth="0.5" />)}
          {[80, 160, 240, 320, 400].map(x => <line key={'v'+x} x1={x} y1="30" x2={x} y2="180" stroke="var(--illustration-surface)" strokeWidth="0.5" />)}

          {/* Route A (direct, traffic) */}
          <path d="M 60 170 Q 80 100 140 80 Q 200 60 250 80 Q 300 100 350 70 Q 400 40 440 170" fill="none" stroke="var(--illustration-danger)" strokeWidth="2" strokeDasharray="8,4" opacity="0.6" />
          <text x="260" y="50" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui">Route A — 45 min (traffic)</text>

          {/* Route B (longer but clear) */}
          <path d="M 60 170 Q 100 150 180 140 Q 280 130 380 140 Q 430 155 440 170" fill="none" stroke="var(--illustration-success-bright)" strokeWidth="2.5" />
          <text x="260" y="198" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">Route B — 35 min ✓</text>

          {/* Start */}
          <circle cx="60" cy="170" r="8" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="2" />
          <text x="60" y="190" textAnchor="middle" fill="var(--illustration-warning)" fontSize="8" fontFamily="system-ui" fontWeight="700">A</text>
          {/* End */}
          <circle cx="440" cy="170" r="8" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="2" />
          <text x="440" y="190" textAnchor="middle" fill="var(--illustration-success)" fontSize="8" fontFamily="system-ui" fontWeight="700">B</text>

          {/* Traffic icons */}
          {[0,1,2].map(i => <circle key={i} cx={120 + i * 60} cy={95 + i * 20} r="4" fill="var(--illustration-danger)" opacity="0.5" />)}

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            GPS compares thousands of routes — finds the one with minimum time
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Objective function evaluation */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            OBJECTIVE FUNCTION SCORES EACH ROUTE
          </text>

          {/* Route cards with costs */}
          {[
            { name: 'Route A', cost: 45, time: '45 min', traffic: 'Heavy', color: 'var(--illustration-danger)' },
            { name: 'Route B', cost: 35, time: '35 min', traffic: 'Light', color: 'var(--illustration-success-bright)' },
            { name: 'Route C', cost: 50, time: '50 min', traffic: 'Moderate', color: 'var(--illustration-warning)' },
          ].map((r, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.12}s both` }}>
              <rect x={50 + i * 140} y={45} width="120" height="90" rx="10" fill="var(--illustration-surface)" stroke={r.color} strokeWidth="1.5" />
              <text x={110 + i * 140} y={68} textAnchor="middle" fill={r.color} fontSize="10" fontFamily="system-ui" fontWeight="700">{r.name}</text>
              <text x={110 + i * 140} y={88} textAnchor="middle" fill="var(--illustration-track)" fontSize="14" fontFamily="system-ui" fontWeight="800">{r.time}</text>
              <text x={110 + i * 140} y={106} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">Traffic: {r.traffic}</text>
              {/* Cost badge */}
              <rect x={60 + i * 140} y={110} width="100" height="18" rx="5"
                fill={i === 1 ? 'var(--illustration-success-bg)' : 'var(--illustration-surface)'}
                stroke={i === 1 ? 'var(--illustration-success)' : 'var(--illustration-surface-mid)'} strokeWidth="1" />
              <text x={110 + i * 140} y={123} textAnchor="middle"
                fill={i === 1 ? 'var(--illustration-success-light)' : 'var(--illustration-muted-light)'} fontSize="8" fontFamily="system-ui" fontWeight="700">
                Cost: {r.cost}
              </text>
            </g>
          ))}

          {/* Minimum found */}
          <g style={{ animation: 'tof-pop 0.4s 0.5s both' }}>
            <rect x="130" y="155" width="240" height="30" rx="8" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
            <text x="250" y="175" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">
              ✓ Route B — Lowest cost = 35 (optimal)
            </text>
            <circle cx="250" cy="185" r="35" fill="none" stroke="var(--illustration-success-alt)" strokeWidth="1" opacity="0"
              style={{ animation: 'tof-wave 2s ease infinite' }} />
          </g>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            AI OPTIMIZATION
          </text>

          {/* Flow: Input → Objective → Search → Best */}
          {[
            { label: 'All\nRoutes', x: 55, color: 'var(--illustration-secondary)' },
            { label: 'Objective\nFunction', x: 175, color: 'var(--illustration-warning)' },
            { label: 'Search\nAlgorithm', x: 295, color: 'var(--illustration-secondary)' },
            { label: 'Best\nRoute ✓', x: 415, color: 'var(--illustration-success-alt)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.15}s both` }}>
              <circle cx={s.x} cy={75} r="32" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="2" />
              <text x={s.x} y={71} textAnchor="middle" fill={s.color} fontSize="8" fontFamily="system-ui" fontWeight="700">{s.label.split('\n')[0]}</text>
              <text x={s.x} y={83} textAnchor="middle" fill={s.color} fontSize="8" fontFamily="system-ui" fontWeight="700">{s.label.split('\n')[1] || ''}</text>
            </g>
          ))}

          {/* Arrows */}
          <line x1="87" y1="75" x2="141" y2="75" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="137,72 147,75 137,78" fill="var(--illustration-element-muted)" />
          <line x1="207" y1="75" x2="261" y2="75" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="257,72 267,75 257,78" fill="var(--illustration-element-muted)" />
          <line x1="327" y1="75" x2="381" y2="75" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="377,72 387,75 377,78" fill="var(--illustration-element-muted)" />

          {/* Bottom insight */}
          <g style={{ animation: 'tof-up 0.4s 0.6s both' }}>
            <rect x="60" y="150" width="380" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
            <text x="250" y="168" textAnchor="middle" fill="var(--illustration-accent)" fontSize="11" fontFamily="monospace" fontWeight="500">
              Define "best" → Search the space → Return minimum
            </text>
            <text x="250" y="182" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">
              Objective function defines best; algorithm finds it
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ── Simulated Annealing — GPS Rerouting ─────────────────────────────────

function SimulatedAnnealingSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Traffic jam */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            GPS REROUTING — DETOUR EXPLORATION
          </text>

          {/* Road network */}
          <rect x="30" y="45" width="440" height="140" rx="8" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />

          {/* Main road (stuck) */}
          <line x1="40" y1="110" x2="200" y2="110" stroke="var(--illustration-danger)" strokeWidth="3" />
          <text x="120" y="100" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui">🚗 Traffic jam</text>

          {/* Detour (residential) */}
          <path d="M 200 110 Q 220 70 270 70 Q 320 70 340 85 Q 360 100 380 110" fill="none" stroke="var(--illustration-warning)" strokeWidth="2.5" strokeDasharray="6,3" />
          <text x="290" y="60" textAnchor="middle" fill="var(--illustration-warning)" fontSize="7" fontFamily="system-ui">Detour (slower road, but moving)</text>

          {/* Main road continues */}
          <line x1="380" y1="110" x2="460" y2="110" stroke="var(--illustration-success-bright)" strokeWidth="3" />
          <text x="430" y="125" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">Clear ahead</text>

          {/* Arrow showing reroute */}
          <path d="M 195 106 Q 210 90 230 80" fill="none" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <polygon points="226,84 234,76 228,74" fill="var(--illustration-warning)" />

          {/* Start/End points */}
          <circle cx="40" cy="110" r="6" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
          <text x="40" y="130" textAnchor="middle" fill="var(--illustration-warning)" fontSize="7" fontFamily="system-ui">Start</text>
          <circle cx="460" cy="110" r="6" fill="var(--illustration-surface)" stroke="var(--illustration-success)" strokeWidth="1.5" />
          <text x="460" y="130" textAnchor="middle" fill="var(--illustration-success)" fontSize="7" fontFamily="system-ui">End</text>

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Taking a worse road temporarily leads to a better outcome overall
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Temperature / Exploration schedule */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            TEMPERATURE SCHEDULE: EXPLORE → EXPLOIT
          </text>

          {/* Thermometer visualization */}
          <g style={{ animation: 'tof-pop 0.35s 0.1s both' }}>
            <rect x="60" y="45" width="40" height="140" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
            {/* Mercury - full (high temp) */}
            <rect x="65" y="55" width="30" height="130" rx="5" fill="var(--illustration-danger)" opacity="0.3" />
            {/* Mercury - decreasing animation */}
            <rect x="65" y="55" width="30" height="105" rx="5" fill="var(--illustration-danger)" opacity="0.5"
              style={{ animation: 'tof-thermometer 4s ease-in-out infinite' }} />
            <circle cx="80" cy="185" r="8" fill="var(--illustration-danger)" opacity="0.5" />
            <text x="80" y="208" textAnchor="middle" fill="var(--illustration-danger)" fontSize="10" fontFamily="system-ui" fontWeight="700">Temp</text>
          </g>

          {/* Exploration (early) */}
          <g style={{ animation: 'tof-pop 0.35s 0.2s both' }}>
            <rect x="140" y="50" width="150" height="60" rx="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
            <text x="215" y="72" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700">Early (Hot)</text>
            <text x="215" y="88" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="8" fontFamily="system-ui">Bold detours accepted</text>
            <text x="215" y="100" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Explore widely</text>
          </g>

          {/* Arrow */}
          <line x1="290" y1="80" x2="320" y2="80" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="316,77 326,80 316,83" fill="var(--illustration-element-muted)" />

          {/* Exploitation (late) */}
          <g style={{ animation: 'tof-pop 0.35s 0.35s both' }}>
            <rect x="330" y="50" width="150" height="60" rx="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
            <text x="405" y="72" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">Late (Cold)</text>
            <text x="405" y="88" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="8" fontFamily="system-ui">Follow best route</text>
            <text x="405" y="100" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Exploit known path</text>
          </g>

          {/* Jump arrows showing exploration decreasing */}
          {[0,1,2].map(i => (
            <line key={i} x1={80} y1={135 + i * 20} x2={80 + (3 - i) * 40} y2={135 + i * 20}
              stroke={i < 2 ? 'var(--illustration-warning)' : 'var(--illustration-element-muted)'} strokeWidth={3 - i * 0.5}
              opacity={1 - i * 0.3}
              style={{ animation: `tof-pop 0.3s ${0.5 + i * 0.15}s both` }} />
          ))}
          <text x="215" y="220" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">Exploration ↓ over time</text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            SIMULATED ANNEALING ALGORITHM
          </text>

          {/* Landscape */}
          <path d="M 30 180 Q 80 120 120 140 Q 160 160 190 130 Q 220 100 260 110 Q 300 120 330 80 Q 360 40 390 60 Q 420 80 470 150" fill="none" stroke="var(--illustration-surface-mid)" strokeWidth="2" />

          {/* Local optimum marker */}
          <circle cx="190" cy="118" r="5" fill="var(--illustration-danger)" />
          <text x="190" y="108" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui" fontWeight="700">Local</text>

          {/* Global optimum marker */}
          <circle cx="360" cy="38" r="5" fill="var(--illustration-success)" />
          <text x="360" y="28" textAnchor="middle" fill="var(--illustration-success)" fontSize="7" fontFamily="system-ui" fontWeight="700">Global</text>

          {/* Agent exploring — jump path */}
          <path d="M 190 118 Q 250 60 360 38" fill="none" stroke="var(--illustration-warning)" strokeWidth="1.5" strokeDasharray="5,3" />
          <polygon points="356,34 366,42 354,45" fill="var(--illustration-warning)" />

          {/* Agent */}
          <circle cx="360" cy="38" r="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="2"
            style={{ animation: 'tof-node 1.5s ease infinite' }} />

          {/* Process boxes */}
          <g style={{ animation: 'tof-up 0.4s 0.4s both' }}>
            <rect x="60" y="195" width="120" height="30" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <text x="120" y="214" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="600">🏔️ Explore landscape</text>
            <rect x="200" y="195" width="120" height="30" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="260" y="214" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="600">🌡️ Accept detours</text>
            <rect x="340" y="195" width="120" height="30" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1" />
            <text x="400" y="214" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">✓ Converge to best</text>
          </g>

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            High temperature → explore boldly. Cool down → exploit the best.
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Constraints — Airport Security ──────────────────────────────────────

function CSPConstraintsSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Airport security */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            SECURITY RULES FILTER EVERYTHING
          </text>

          {/* Conveyor belt */}
          <rect x="50" y="175" width="400" height="12" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={65 + i * 50} y1={177} x2={65 + i * 50} y2={185} stroke="var(--illustration-surface-alt)" strokeWidth="1.5" />
          ))}

          {/* Rules board */}
          <rect x="30" y="40" width="440" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
          <text x="250" y="57" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="600">Rules: No liquids &gt; 100ml · No sharp objects · No prohibited electronics</text>
          <text x="250" y="70" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">Constraints eliminate millions of combinations immediately</text>

          {/* Suitcase */}
          <g style={{ animation: 'tof-float 2.5s ease-in-out infinite' }}>
            <rect x="210" y="95" width="80" height="55" rx="8" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
            <rect x="230" y="88" width="40" height="12" rx="6" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <line x1="210" y1="122" x2="290" y2="122" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            {/* Liquid bottle inside */}
            <rect x="230" y="128" width="16" height="20" rx="4" fill="var(--illustration-danger-bg-alt)" stroke="var(--illustration-danger)" strokeWidth="1" />
            <text x="238" y="142" textAnchor="middle" fill="var(--illustration-danger)" fontSize="6" fontFamily="system-ui">💧</text>
          </g>

          {/* X-ray scan area */}
          <rect x="140" y="85" width="220" height="70" rx="6" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" opacity="0.5" />
          <text x="250" y="100" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Scanning...</text>

          {/* X-ray beam */}
          <line x1="250" y1="85" x2="250" y2="96" stroke="var(--illustration-primary)" strokeWidth="2" opacity="0.5"
            style={{ animation: 'tof-beam 2s ease-in-out infinite' }} />
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Constraint pruning */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            CONSTRAINT PRUNING — REJECT IMMEDIATELY
          </text>

          {/* Items being checked */}
          {[
            { label: 'Large Liquid', passes: false, color: 'var(--illustration-danger)', icon: '💧' },
            { label: 'Phone', passes: true, color: 'var(--illustration-success-bright)', icon: '📱' },
            { label: 'Laptop', passes: true, color: 'var(--illustration-success-bright)', icon: '💻' },
            { label: 'Knife', passes: false, color: 'var(--illustration-danger)', icon: '🔪' },
          ].map((item, i) => {
            const row = Math.floor(i / 2), col = i % 2;
            return (
              <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.12}s both` }}>
                <rect x={60 + col * 200} y={45 + row * 65} width="170" height="50" rx="8"
                  fill={item.passes ? 'var(--illustration-success-bg-alt)' : 'var(--illustration-danger-bg-alt)'}
                  stroke={item.color} strokeWidth="1.5" />
                <text x={110 + col * 200} y={66 + row * 65} textAnchor="middle" fill={item.color} fontSize="14">{item.icon}</text>
                <text x={145 + col * 200} y={66 + row * 65} fill="var(--illustration-track)" fontSize="9" fontFamily="system-ui" fontWeight="600">{item.label}</text>
                <text x={145 + col * 200} y={82 + row * 65} fill={item.color} fontSize="9" fontFamily="system-ui" fontWeight="700">
                  {item.passes ? '✓ PASS' : '✗ REJECT'}
                </text>
              </g>
            );
          })}

          {/* Pruning effect */}
          <g style={{ animation: 'tof-pop 0.3s 0.5s both' }}>
            <rect x="120" y="180" width="260" height="26" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <text x="250" y="197" textAnchor="middle" fill="var(--illustration-track)" fontSize="9" fontFamily="system-ui" fontWeight="600">
              2 items filtered — no further checks needed
            </text>
          </g>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* CSP Constraint Propagation */}
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            CSP CONSTRAINT PROPAGATION
          </text>

          {/* Variables with domains */}
          {[
            { label: 'A', domain: '{1,2,3}', color: 'var(--illustration-secondary)' },
            { label: 'B', domain: '{1,2}', color: 'var(--illustration-warning)' },
            { label: 'C', domain: '{1,2,3}', color: 'var(--illustration-success-bright)' },
            { label: 'D', domain: '{2,3}', color: 'var(--illustration-accent-pink)' },
          ].map((v, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.1}s both` }}>
              <circle cx={65 + i * 100} cy={70} r="24" fill="var(--illustration-surface)" stroke={v.color} strokeWidth="2" />
              <text x={65 + i * 100} y={66} textAnchor="middle" fill={v.color} fontSize="12" fontFamily="system-ui" fontWeight="700">{v.label}</text>
              <text x={65 + i * 100} y={80} textAnchor="middle" fill={v.color} fontSize="6" fontFamily="system-ui">{v.domain}</text>
              <text x={65 + i * 100} y={106} textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Domain</text>
            </g>
          ))}

          {/* Constraints between them */}
          {[
            [0, 1], [1, 2], [2, 3], [0, 2],
          ].map(([from, to], i) => (
            <line key={i} x1={89 + from * 100} y1={62} x2={41 + to * 100} y2={62}
              stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,3"
              style={{ animation: `tof-conn 0.4s ${0.5 + i * 0.1}s both` }} />
          ))}

          {/* Propagation arc */}
          <g style={{ animation: 'tof-pop 0.4s 0.7s both' }}>
            <rect x="60" y="135" width="380" height="50" rx="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
            <text x="250" y="155" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700">Arc Consistency</text>
            <text x="250" y="170" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">A=1 → B can't be 1 → B=2 → C can't be 2 → C=3</text>
            <text x="250" y="182" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Propagation eliminates impossible values before searching</text>
          </g>

          {/* Animated propagation flow */}
          <circle r="2.5" fill="var(--illustration-secondary)">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 35 70 Q 100 120 165 70 Q 200 120 265 70 Q 300 120 365 70" />
          </circle>
        </g>
      )}
    </svg>
  );
}

function TrafficDecisionSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Road */}
          <rect x="0" y="170" width="500" height="50" fill="var(--illustration-surface)" />
          <line x1="0" y1="195" x2="500" y2="195" stroke="var(--illustration-surface-alt)" strokeWidth="2" strokeDasharray="12,8" />

          {/* Traffic light pole */}
          <rect x="340" y="60" width="10" height="110" fill="var(--illustration-surface-alt)" />
          <rect x="350" y="50" width="28" height="90" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
          {/* Lights */}
          <circle cx="364" cy="72" r="9" fill="var(--illustration-danger-bg)" stroke="var(--illustration-danger)" strokeWidth="1"
            style={{ animation: 'tof-signal-r 3s ease infinite' }} />
          <circle cx="364" cy="95" r="9" fill="var(--illustration-warning-bg)" stroke="var(--illustration-warning)" strokeWidth="1"
            style={{ animation: 'tof-signal-y 3s ease infinite' }} />
          <circle cx="364" cy="118" r="9" fill="var(--illustration-success-bg)" stroke="var(--illustration-success)" strokeWidth="1"
            style={{ animation: 'tof-signal-g 3s ease infinite' }} />

          {/* Car 1 — moving left */}
          <g style={{ animation: 'tof-drive1 5s linear infinite' }}>
            <rect x="-60" y="178" width="36" height="16" rx="4" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <rect x="-54" y="174" width="16" height="10" rx="3" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <circle cx="-52" cy="196" r="4" fill="var(--illustration-surface)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <circle cx="-38" cy="196" r="4" fill="var(--illustration-surface)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
          </g>

          {/* Car 2 — moving right (top lane) */}
          <g style={{ animation: 'tof-drive2 4.5s linear infinite' }}>
            <rect x="520" y="155" width="36" height="16" rx="4" fill="#1a1a2e" stroke="var(--illustration-primary)" strokeWidth="1" />
            <rect x="514" y="151" width="16" height="10" rx="3" fill="#1a1a2e" stroke="var(--illustration-primary)" strokeWidth="1" />
            <circle cx="518" cy="173" r="4" fill="var(--illustration-surface)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <circle cx="532" cy="173" r="4" fill="var(--illustration-surface)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
          </g>

          {/* Observation radar pulses */}
          <circle cx="364" cy="95" r="15" fill="none" stroke="var(--illustration-primary)" strokeWidth="1" opacity="0"
            style={{ animation: 'tof-wave 2.5s ease infinite' }} />
          <circle cx="364" cy="95" r="15" fill="none" stroke="var(--illustration-primary)" strokeWidth="1" opacity="0"
            style={{ animation: 'tof-wave 2.5s ease 0.8s infinite' }} />
          <circle cx="364" cy="95" r="15" fill="none" stroke="var(--illustration-primary)" strokeWidth="1" opacity="0"
            style={{ animation: 'tof-wave 2.5s ease 1.6s infinite' }} />

          <text x="250" y="246" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Traffic signals observe conditions → then decide
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Title */}
          <text x="250" y="28" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            CHANGE A CONDITION → OUTCOME FLIPS
          </text>

          {/* ── AND gate with signal flow ── */}
          <text x="250" y="52" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui, sans-serif">
            AND Rule: ALL inputs must be TRUE
          </text>

          {/* Signal flow particles */}
          <circle r="3" fill="var(--illustration-secondary)" opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 60 108 Q 100 120 145 115" />
          </circle>
          <circle r="3" fill="var(--illustration-secondary)" opacity="0.8">
            <animateMotion dur="3.5s" repeatCount="indefinite" path="M 60 182 Q 100 175 145 175" />
          </circle>

          {/* P input */}
          <rect x="40" y="94" width="48" height="32" rx="8" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="2" />
          <text x="64" y="114" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="13" fontFamily="monospace" fontWeight="700">P</text>
          <text x="64" y="136" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="8" fontFamily="system-ui" fontWeight="600">TRUE</text>

          {/* Q input */}
          <rect x="40" y="168" width="48" height="32" rx="8" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="2" />
          <text x="64" y="188" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="13" fontFamily="monospace" fontWeight="700">Q</text>
          <text x="64" y="210" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="8" fontFamily="system-ui" fontWeight="600">TRUE</text>

          {/* AND gate */}
          <path d="M 145 95 L 175 95 Q 210 132 175 168 L 145 168 Z" fill="#1E293B" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
          <text x="170" y="135" textAnchor="middle" fill="var(--illustration-accent)" fontSize="11" fontFamily="monospace" fontWeight="700">AND</text>

          {/* Connection lines */}
          <line x1="88" y1="110" x2="145" y2="110" stroke="var(--illustration-element-muted)" strokeWidth="1.2" />
          <line x1="88" y1="184" x2="145" y2="155" stroke="var(--illustration-element-muted)" strokeWidth="1.2" />
          <line x1="210" y1="132" x2="360" y2="132" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />

          {/* Output result - TRUE */}
          <g style={{ animation: 'tof-pop 0.35s 0.3s both' }}>
            <rect x="330" y="96" width="80" height="72" rx="10" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="2" />
            <text x="370" y="126" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600">RESULT</text>
            <text x="370" y="152" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="18" fontFamily="system-ui" fontWeight="800">✓ TRUE</text>
          </g>

          {/* Pulsing glow on result */}
          <circle cx="370" cy="132" r="50" fill="none" stroke="var(--illustration-success-alt)" strokeWidth="1" opacity="0"
            style={{ animation: 'tof-wave 2s ease infinite' }} />

          {/* Bottom comparison row */}
          <g style={{ animation: 'tof-up 0.4s 0.8s both' }}>
            <line x1="60" y1="235" x2="440" y2="235" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
            <text x="120" y="252" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">P=✓ Q=✓ → AND → ✓</text>
            <text x="250" y="252" textAnchor="middle" fill="var(--illustration-primary)" fontSize="8" fontFamily="system-ui" fontWeight="600">What if Q=F?</text>
            <text x="380" y="252" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">P=✓ Q=✗ → AND → ✗</text>

            {/* Arrow */}
            <polygon points="240,258 250,264 260,258" fill="var(--illustration-primary)" opacity="0.6" />
          </g>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Title */}
          <text x="250" y="25" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            AI EVALUATES RULES → MAKES DECISIONS
          </text>

          {/* AI Processor / Brain */}
          <rect x="150" y="60" width="200" height="120" rx="18" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
          <rect x="170" y="80" width="160" height="80" rx="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1" />

          {/* Circuit traces inside the processor */}
          {[
            { x1: 180, y1: 95, x2: 210, y2: 95 },
            { x1: 180, y1: 120, x2: 210, y2: 120 },
            { x1: 180, y1: 145, x2: 210, y2: 145 },
            { x1: 290, y1: 95, x2: 320, y2: 95 },
            { x1: 290, y1: 120, x2: 320, y2: 120 },
            { x1: 290, y1: 145, x2: 320, y2: 145 },
            { x1: 210, y1: 95, x2: 210, y2: 145 },
            { x1: 250, y1: 95, x2: 250, y2: 145 },
            { x1: 290, y1: 95, x2: 290, y2: 145 },
          ].map((line, i) => (
            <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
              stroke="var(--illustration-primary)" strokeWidth="1.2" strokeDasharray="8,4"
              style={{ animation: i < 6 ? `tof-flow 1.5s ${i * 0.15}s linear infinite` : undefined }} />
          ))}

          {/* CPU icon */}
          <text x="250" y="110" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="16" fontFamily="system-ui" fontWeight="700">AI</text>
          <text x="250" y="130" textAnchor="middle" fill="var(--illustration-primary)" fontSize="9" fontFamily="system-ui">Logic Engine</text>

          {/* Pulsing core */}
          <circle cx="250" cy="120" r="35" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1" opacity="0"
            style={{ animation: 'tof-wave 2s ease infinite' }} />
          <circle cx="250" cy="120" r="35" fill="none" stroke="var(--illustration-secondary)" strokeWidth="0.5" opacity="0"
            style={{ animation: 'tof-wave 2s ease 0.6s infinite' }} />

          {/* Inputs flowing in */}
          {['Rule 1: IF', 'Rule 2: AND', 'Rule 3: OR'].map((label, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${0.2 + i * 0.15}s both` }}>
              <rect x="20" y={68 + i * 38} width="70" height="28" rx="6" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
              <text x="55" y={86 + i * 38} textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="8" fontFamily="system-ui">{label}</text>
              {/* Flow dot */}
              <circle r="3" fill="var(--illustration-secondary)" opacity="0.7">
                <animateMotion dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite"
                  path={`M ${90 + i * 5} ${82 + i * 38} Q 120 ${80 + i * 38 + 10} 150 120`} />
              </circle>
            </g>
          ))}

          {/* Output flowing out */}
          <g style={{ animation: 'tof-pop 0.35s 0.8s both' }}>
            <rect x="400" y="90" width="70" height="60" rx="10" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
            <text x="435" y="112" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">DECISION</text>
            <text x="435" y="134" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="14" fontFamily="system-ui" fontWeight="800">✓</text>
          </g>

          {/* Flow line from processor to output */}
          <circle r="3" fill="var(--illustration-success-light)" opacity="0.8">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 350 120 Q 375 120 395 120" />
          </circle>

          <text x="250" y="255" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui, sans-serif">
            AI applies logical rules to facts → produces reliable decisions
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Neural Network Layers — learns through layers of activation ─────────

// A simple, recognizable bag/suitcase glyph reused across scenes so the
// "officer scans bags" story stays visually consistent from scan → recognition.
function BagGlyph({ color, filled = true }: { color: string; filled?: boolean }) {
  return (
    <g>
      <path d="M -7 -9 Q -7 -15 0 -15 Q 7 -15 7 -9" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="-11" y="-9" width="22" height="17" rx="3.5" fill={color} fillOpacity={filled ? 0.22 : 0} stroke={color} strokeWidth="2" />
      <line x1="-11" y1="-0.5" x2="11" y2="-0.5" stroke={color} strokeWidth="1.25" opacity="0.5" />
    </g>
  );
}

function NeuralLayerSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <defs>
        <radialGradient id="nls-glow" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nls-card-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-secondary)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--illustration-secondary)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="nls-card-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-success-bright)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--illustration-success-bright)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="nls-card-3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-warning)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--illustration-warning)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      <ellipse cx="250" cy="115" rx="220" ry="100" fill="url(#nls-glow)" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1.5" opacity="0.7">
            EXPERIENCE, ONE SCAN AT A TIME
          </text>

          {/* Officer — clean vector silhouette, no emoji */}
          <g transform="translate(95, 100)">
            <circle cx="0" cy="0" r="30" fill="var(--illustration-primary)" fillOpacity="0.08" />
            <circle cx="0" cy="-13" r="10" fill="var(--illustration-surface-alt)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
            <path d="M -15 22 C -15 4 15 4 15 22" fill="var(--illustration-surface-alt)" stroke="var(--illustration-secondary)" strokeWidth="1.5" strokeLinecap="round" />
            <text x="0" y="48" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7.5" fontFamily="system-ui" fontWeight="600" letterSpacing="0.5">OFFICER</text>
          </g>

          {/* Scan flow — a literal row of bags moving past the officer */}
          <line x1="140" y1="100" x2="335" y2="100" stroke="var(--illustration-element-muted)" strokeWidth="1" opacity="0.3" />
          {[
            'var(--illustration-secondary)',
            'var(--illustration-info)',
            'var(--illustration-success-bright)',
            'var(--illustration-warning)',
            'var(--illustration-accent)',
          ].map((color, i) => (
            <g key={i} transform={`translate(${165 + i * 38}, 100)`}>
              <g style={{ animation: `tof-pop 0.3s ${i * 0.1}s both`, transformOrigin: '0px 0px' }}>
                <BagGlyph color={color} />
              </g>
            </g>
          ))}
          <text x="270" y="132" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="7.5" fontFamily="system-ui" letterSpacing="0.5">THOUSANDS OF BAGS SCANNED</text>

          {/* Experience card */}
          <g style={{ animation: 'tof-pop 0.35s 0.55s both' }}>
            <rect x="350" y="60" width="120" height="90" rx="14" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
            <rect x="350" y="60" width="120" height="90" rx="14" fill="url(#nls-card-1)" />
            <g transform="translate(410, 84)">
              <circle cx="-10" cy="4" r="3" fill="var(--illustration-secondary)" />
              <circle cx="4" cy="-4" r="3" fill="var(--illustration-accent)" />
              <circle cx="10" cy="6" r="3" fill="var(--illustration-info)" />
              <path d="M -10 4 L 4 -4 L 10 6" stroke="var(--illustration-muted-light)" strokeWidth="0.75" fill="none" opacity="0.6" />
            </g>
            <text x="410" y="106" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9.5" fontFamily="system-ui" fontWeight="700">Experience</text>
            <text x="410" y="120" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7.5" fontFamily="system-ui">Patterns, not rules</text>
            <text x="410" y="133" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="7" fontFamily="system-ui">Recognised instantly</text>
          </g>

          <line x1="315" y1="100" x2="343" y2="100" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="339,97 349,100 339,103" fill="var(--illustration-element-muted)" />
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1.5" opacity="0.7">
            LAYER HIERARCHY: EDGES → SHAPES → OBJECTS
          </text>

          {/* 3 layers stacked */}
          {[
            { label: 'Layer 1', desc: 'Edges & corners', color: 'var(--illustration-secondary)', grad: 'url(#nls-card-1)', icon: 'edges' },
            { label: 'Layer 2', desc: 'Shapes & patterns', color: 'var(--illustration-success-bright)', grad: 'url(#nls-card-2)', icon: 'shapes' },
            { label: 'Layer 3', desc: 'Objects & meaning', color: 'var(--illustration-warning)', grad: 'url(#nls-card-3)', icon: 'objects' },
          ].map((layer, i) => (
            <g key={i} transform={`translate(${30 + i * 150}, 45)`}>
              <g style={{ animation: `tof-pop 0.35s ${i * 0.15}s both`, transformOrigin: '70px 60px' }}>
                <rect width="140" height="120" rx="14" fill="var(--illustration-surface)" stroke={layer.color} strokeWidth="1.5" />
                <rect width="140" height="120" rx="14" fill={layer.grad} />

                {/* Per-layer icon — same bag motif at each stage of recognition */}
                <g transform="translate(70, 48)">
                  {layer.icon === 'edges' && (
                    <>
                      {/* Corner-focus brackets: only the outline is being picked up so far */}
                      <path d="M -18 -12 L -22 -12 L -22 -8" fill="none" stroke={layer.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 18 -12 L 22 -12 L 22 -8" fill="none" stroke={layer.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M -18 12 L -22 12 L -22 8" fill="none" stroke={layer.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 18 12 L 22 12 L 22 8" fill="none" stroke={layer.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="-11" y="-9" width="22" height="17" rx="3.5" fill="none" stroke={layer.color} strokeWidth="1.25" strokeDasharray="2,3" opacity="0.6" />
                    </>
                  )}
                  {layer.icon === 'shapes' && (
                    <>
                      {/* Basic geometric primitives combining into a recognisable form */}
                      <circle cx="-17" cy="-2" r="7" fill="none" stroke={layer.color} strokeWidth="2.25" />
                      <polygon points="9,-9 17,6 1,6" fill="none" stroke={layer.color} strokeWidth="2.25" strokeLinejoin="round" />
                      <rect x="-8" y="6" width="16" height="10" rx="2.5" fill="none" stroke={layer.color} strokeWidth="2.25" />
                    </>
                  )}
                  {layer.icon === 'objects' && (
                    <>
                      {/* Fully recognised bag, flagged with a checkmark */}
                      <BagGlyph color={layer.color} />
                      <circle cx="15" cy="-13" r="7" fill="var(--illustration-bg-dark)" stroke={layer.color} strokeWidth="1.5" />
                      <path d="M 12 -13 L 14 -11 L 18 -16" fill="none" stroke={layer.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}
                </g>

                <text x="70" y="88" textAnchor="middle" fill={layer.color} fontSize="10.5" fontFamily="system-ui" fontWeight="700">{layer.label}</text>
                <text x="70" y="103" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">{layer.desc}</text>
              </g>

              {i < 2 && (
                <>
                  <line x1="140" y1="60" x2="148" y2="60" stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="4,2" />
                  <polygon points="145,57 154,60 145,63" fill="var(--illustration-element-muted)" />
                </>
              )}
            </g>
          ))}

          {/* Animated signal passing through */}
          <circle r="2.5" fill="var(--illustration-warning)">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 100 105 Q 150 105 175 105 Q 230 105 250 105 Q 300 105 320 105" />
          </circle>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          {/* Deep network architecture */}
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1.5" opacity="0.7">
            DEEP NETWORK — HIERARCHICAL FEATURE LEARNING
          </text>

          {/* Input layer */}
          <g transform="translate(60, 80)">
            {[0,1,2,3].map(i => <circle key={i} cx="0" cy={i * 18} r="6" fill="var(--illustration-surface)" stroke="var(--illustration-muted-light)" strokeWidth="1.5" />)}
            <text x="0" y="80" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">Input</text>
          </g>

          {/* Hidden layer 1 */}
          <g transform="translate(160, 62)">
            {[0,1,2,3,4,5].map(i => <circle key={i} cx="0" cy={i * 18} r="5" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />)}
            <text x="0" y="115" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="7" fontFamily="system-ui">Edges</text>
          </g>

          {/* Hidden layer 2 */}
          <g transform="translate(260, 62)">
            {[0,1,2,3,4].map(i => <circle key={i} cx="0" cy={i * 18} r="5" fill="var(--illustration-success-bg-alt)" stroke="var(--illustration-success-bright)" strokeWidth="1.5" />)}
            <text x="0" y="108" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">Shapes</text>
          </g>

          {/* Hidden layer 3 */}
          <g transform="translate(360, 80)">
            {[0,1,2,3].map(i => <circle key={i} cx="0" cy={i * 18} r="6" fill="#1e0f0f" stroke="var(--illustration-warning)" strokeWidth="1.5" />)}
            <text x="0" y={85} textAnchor="middle" fill="var(--illustration-warning)" fontSize="7" fontFamily="system-ui">Objects</text>
          </g>

          {/* Output */}
          <g transform="translate(440, 95)">
            <circle cx="0" cy="0" r="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="2" />
            <text x="0" y="25" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="7" fontFamily="system-ui" fontWeight="700">Output</text>
            <text x="0" y="4" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="8">✓</text>
          </g>

          {/* Connections (simplified) */}
          {[0,1,2,3].map(i => [0,1,2,3,4,5].map(j =>
            <line key={`${i}-${j}`} x1="66" y1={80 + i * 18} x2="160" y2={62 + j * 18} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.4" />
          ))}
          {[0,1,2,3,4,5].map(i => [0,1,2,3,4].map(j =>
            <line key={`${i}-${j}`} x1="165" y1={62 + i * 18} x2="260" y2={62 + j * 18} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.4" />
          ))}
          {[0,1,2,3,4].map(i => [0,1,2,3].map(j =>
            <line key={`${i}-${j}`} x1="265" y1={62 + i * 18} x2="360" y2={80 + j * 18} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.4" />
          ))}
          {[0,1,2,3].map(i =>
            <line key={i} x1="366" y1={80 + i * 6} x2="440" y2={95} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.4" />
          )}

          {/* Insight bar */}
          <g style={{ animation: 'tof-up 0.4s 0.6s both' }}>
            <rect x="90" y="182" width="320" height="40" rx="12" fill="var(--illustration-surface)" fillOpacity="0.7" stroke="var(--illustration-primary)" strokeWidth="1" strokeOpacity="0.5" />
            <text x="250" y="201" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui">
              Each layer detects higher-level features from lower-level inputs
            </text>
            <text x="250" y="214" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">
              End-to-end learning: no hand-crafted rules
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ── Activation Functions — inference decisions at each neuron ────────────

function ActivationGateSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            SECURITY SCANNER — THRESHOLD DECISIONS
          </text>

          {/* Scanner device */}
          <rect x="100" y="60" width="300" height="50" rx="10" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1.5" />

          {/* Items passing through */}
          {[
            { icon: '📱', density: 0.3, passes: true },
            { icon: '💧', density: 0.7, passes: false },
            { icon: '🔑', density: 0.1, passes: true },
          ].map((item, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.2}s both` }}>
              <rect x={120 + i * 100} y={70} width="40" height="30" rx="5" fill="var(--illustration-surface)" stroke={item.passes ? 'var(--illustration-success-bright)' : 'var(--illustration-danger)'} strokeWidth="1" />
              <text x={140 + i * 100} y={90} textAnchor="middle" fontSize="12">{item.icon}</text>
              {/* Density meter */}
              <rect x={120 + i * 100} y={105} width="40" height="4" rx="2" fill="var(--illustration-surface-alt)" />
              <rect x={120 + i * 100} y={105} width={40 * item.density} height="4" rx="2" fill={item.passes ? 'var(--illustration-success-bright)' : 'var(--illustration-danger)'} />
              {item.passes ? (
                <text x={140 + i * 100} y={125} textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui" fontWeight="700">✓ PASS</text>
              ) : (
                <text x={140 + i * 100} y={125} textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui" fontWeight="700">✗ FLAG</text>
              )}
            </g>
          ))}

          {/* Threshold line */}
          <line x1="100" y1="80" x2="400" y2="80" stroke="var(--illustration-warning)" strokeWidth="1.5" strokeDasharray="6,3" />
          <text x="410" y="83" fill="var(--illustration-warning)" fontSize="7" fontFamily="system-ui">Threshold</text>

          {/* Gauge */}
          <g transform="translate(250, 155)">
            <circle cx="0" cy="0" r="30" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="4" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="var(--illustration-warning)" strokeWidth="4"
              strokeDasharray={`${0.5 * 188.5} ${188.5}`}
              transform="rotate(-90)" />
            <rect x="0" y="-5" width="18" height="10" rx="3" fill="var(--illustration-warning)" transform="rotate(0)" />
            <text x="0" y="4" textAnchor="middle" fill="var(--illustration-track)" fontSize="10" fontFamily="system-ui" fontWeight="700">50%</text>
            <text x="0" y="45" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">Density threshold</text>
          </g>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            DECISION GATES — ACTIVATION FUNCTIONS
          </text>

          {/* 3 activation function cards */}
          {[
            { name: 'Threshold\n(Step)', shape: '┃ 0 → 1', graph: '⬆', color: 'var(--illustration-secondary)', y: 50 },
            { name: 'Sigmoid', shape: 'S-curve', graph: '∼', color: 'var(--illustration-success-bright)', y: 130 },
            { name: 'ReLU', shape: '0 → x', graph: '∠', color: 'var(--illustration-warning)', y: 210 },
          ].map((fn, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.12}s both` }}>
              <rect x={30 + i * 155} y={fn.y} width="140" height="60" rx="10" fill="var(--illustration-surface)" stroke={fn.color} strokeWidth="1.5" />
              <text x={100 + i * 155} y={fn.y + 20} textAnchor="middle" fill={fn.color} fontSize="9" fontFamily="system-ui" fontWeight="700">{fn.name}</text>
              <text x={100 + i * 155} y={fn.y + 42} textAnchor="middle" fill="var(--illustration-track)" fontSize="11" fontFamily="system-ui">{fn.graph}</text>
            </g>
          ))}

          {/* Input → Gate → Output flow */}
          <g style={{ animation: 'tof-up 0.4s 0.5s both' }}>
            <rect x="60" y="220" width="380" height="30" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <text x="250" y="239" textAnchor="middle" fill="var(--illustration-track)" fontSize="9" fontFamily="monospace">
              Input signal → Activation gate → Does neuron fire?
            </text>
          </g>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            ACTIVATION FUNCTIONS IN NEURAL NETWORKS
          </text>

          {/* Single neuron detail */}
          <g transform="translate(250, 80)">
            {/* Neuron body */}
            <circle cx="0" cy="0" r="30" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="2" />
            {/* Dendrites (inputs) */}
            {[0,1,2,3].map(i => {
              const angle = (i / 4) * Math.PI - Math.PI * 0.8;
              return <line key={'in'+i} x1={Math.cos(angle) * 30} y1={Math.sin(angle) * 30}
                x2={Math.cos(angle) * 50} y2={Math.sin(angle) * 50}
                stroke="var(--illustration-element-muted)" strokeWidth="1.5" />;
            })}
            {/* Axon (output) */}
            <line x1="30" y1="0" x2="55" y2="0" stroke="var(--illustration-success-bright)" strokeWidth="2" />
            <polygon points="52,-3 60,0 52,3" fill="var(--illustration-success-bright)" />
            {/* Activation label */}
            <text x="0" y="3" textAnchor="middle" fill="var(--illustration-accent)" fontSize="8" fontFamily="system-ui">Σ → f</text>
          </g>

          {/* Input weights */}
          {[
            { x: 120, w: 0.8, label: 'w₁=0.8' },
            { x: 160, w: -0.3, label: 'w₂=-0.3' },
            { x: 200, w: 0.5, label: 'w₃=0.5' },
          ].map((inp, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.1}s both` }}>
              <circle cx={inp.x} cy={45 + i * 35} r="14" fill="var(--illustration-surface)" stroke={inp.w > 0 ? 'var(--illustration-success-bright)' : 'var(--illustration-danger)'} strokeWidth="1.5" />
              <text x={inp.x} y={49 + i * 35} textAnchor="middle" fill="var(--illustration-track)" fontSize="7" fontFamily="system-ui">x{i+1}</text>
              <text x={inp.x} y={70 + i * 35} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">{inp.label}</text>
              <line x1={inp.x + 14} y1={45 + i * 35} x2={220} y2={80} stroke="var(--illustration-element-muted)" strokeWidth="1" />
            </g>
          ))}

          {/* Net input and activation gate */}
          <g style={{ animation: 'tof-pop 0.4s 0.5s both' }}>
            <rect x="120" y="175" width="260" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
            <text x="250" y="193" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="monospace">
              net = Σ(wᵢ · xᵢ) → σ(net) → output
            </text>
            <text x="250" y="206" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">
              Activation function decides if combined signal is strong enough
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ── Backpropagation — corrects weights like retraining a dog ────────────

function BackpropagationSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            DOG TRAINING — CORRECT THE ASSOCIATION
          </text>

          {/* Dog */}
          <g transform="translate(100, 120)">
            <ellipse cx="0" cy="0" rx="25" ry="18" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
            <ellipse cx="-15" cy="-15" rx="10" ry="8" fill="var(--illustration-surface-alt)" stroke="var(--illustration-element-muted)" strokeWidth="1" />
            <circle cx="-18" cy="-17" r="2" fill="var(--illustration-muted-text)" />
            <text x="0" y="-5" textAnchor="middle" fontSize="18">🐕</text>
          </g>

          {/* Commands */}
          <g transform="translate(220, 55)">
            <rect x="-40" y="-12" width="80" height="24" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
            <text x="0" y="3" textAnchor="middle" fill="var(--illustration-warning)" fontSize="8" fontFamily="system-ui">"Sit!" → Sits</text>
            <path d="M 0 12 Q 30 20 50 10" fill="none" stroke="var(--illustration-success-bright)" strokeWidth="1.5" />
            <text x="60" y="8" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">✓ Right!</text>
          </g>

          <g transform="translate(220, 105)">
            <rect x="-40" y="-12" width="80" height="24" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-danger)" strokeWidth="1.5" />
            <text x="0" y="3" textAnchor="middle" fill="var(--illustration-danger)" fontSize="8" fontFamily="system-ui">"Stand!" → Sits</text>
            <path d="M 0 12 Q 30 20 50 10" fill="none" stroke="var(--illustration-danger)" strokeWidth="1.5" />
            <text x="58" y="8" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui">✗ Wrong!</text>
          </g>

          {/* Correction arrow */}
          <g transform="translate(320, 135)">
            <line x1="0" y1="0" x2="80" y2="-30" stroke="var(--illustration-warning)" strokeWidth="2" />
            <polygon points="76,-26 88,-28 80,-36" fill="var(--illustration-warning)" />
            <text x="40" y="-15" textAnchor="middle" fill="var(--illustration-warning)" fontSize="7" fontFamily="system-ui">Adjust</text>
          </g>

          {/* Treat */}
          <g transform="translate(420, 85)">
            <text fontSize="20" textAnchor="middle">🦴</text>
          </g>

          <text x="250" y="220" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Error = prediction vs expected — reinforce the correct association
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            ERROR ATTRIBUTION — BLAME THE RIGHT WEIGHT
          </text>

          {/* Network showing error flow */}
          {[
            { label: 'x₁', w: 0.8, blame: 'low', x: 55 },
            { label: 'x₂', w: -0.3, blame: 'high', x: 155 },
            { label: 'x₃', w: 0.5, blame: 'medium', x: 255 },
          ].map((inp, i) => (
            <g key={i} style={{ animation: `tof-pop 0.35s ${i * 0.15}s both` }}>
              <circle cx={inp.x} cy={65} r="16" fill="var(--illustration-surface)"
                stroke={inp.blame === 'high' ? 'var(--illustration-danger)' : inp.blame === 'medium' ? 'var(--illustration-warning)' : 'var(--illustration-element-muted)'}
                strokeWidth="2" />
              <text x={inp.x} y={69} textAnchor="middle" fill="var(--illustration-track)" fontSize="10" fontFamily="system-ui" fontWeight="600">{inp.label}</text>

              {/* Weight value */}
              <rect x={inp.x - 18} y={90} width="36" height="16" rx="4"
                fill={inp.blame === 'high' ? 'var(--illustration-danger-bg-alt)' : inp.blame === 'medium' ? '#1e1b0f' : 'var(--illustration-surface)'}
                stroke={inp.blame === 'high' ? 'var(--illustration-danger)' : inp.blame === 'medium' ? 'var(--illustration-warning)' : 'var(--illustration-surface-mid)'}
                strokeWidth="1" />
              <text x={inp.x} y={102} textAnchor="middle" fill="var(--illustration-track)" fontSize="7" fontFamily="monospace">w={inp.w}</text>
            </g>
          ))}

          {/* Summation */}
          <line x1="271" y1="65" x2="310" y2="65" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <circle cx="330" cy="65" r="14" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
          <text x="330" y="69" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui">Σ</text>

          {/* Output */}
          <line x1="344" y1="65" x2="380" y2="65" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <circle cx="400" cy="65" r="14" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="2" />
          <text x="400" y="69" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="8" fontFamily="system-ui">2.1</text>

          {/* Error */}
          <g transform="translate(400, 100)" style={{ animation: 'tof-pop 0.35s 0.5s both' }}>
            <rect x="-30" y="-10" width="60" height="20" rx="5" fill="var(--illustration-danger-bg-alt)" stroke="var(--illustration-danger)" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="var(--illustration-danger)" fontSize="9" fontFamily="system-ui" fontWeight="700">Error = 0.8</text>
          </g>

          {/* Backward arrows showing correction */}
          <g style={{ animation: 'tof-pop 0.4s 0.7s both' }}>
            {[
              { x: 55, delta: 'Δ=0.1' },
              { x: 155, delta: 'Δ=0.6' },
              { x: 255, delta: 'Δ=0.3' },
            ].map((inp, i) => (
              <g key={i}>
                <line x1={330} y1={75} x2={inp.x} y2={110} stroke={i === 1 ? 'var(--illustration-danger)' : 'var(--illustration-warning)'} strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6" />
                <text x={(330 + inp.x) / 2} y={100 + i * 2} textAnchor="middle" fill={i === 1 ? 'var(--illustration-danger)' : 'var(--illustration-warning)'} fontSize="6" fontFamily="monospace">{inp.delta}</text>
              </g>
            ))}
          </g>

          <text x="250" y="210" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui, sans-serif">
            Weights that contributed more to the error receive larger corrections
          </text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            BACKPROPAGATION: OUTPUT ERROR → GRADIENT → UPDATE
          </text>

          {/* Forward pass */}
          <g style={{ animation: 'tof-pop 0.3s 0.1s both' }}>
            <rect x="30" y="50" width="440" height="30" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
            <text x="250" y="69" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="600">Forward pass: Input → Network → Prediction (2.1)</text>
          </g>

          {/* Error computation */}
          <g style={{ animation: 'tof-pop 0.3s 0.25s both' }}>
            <rect x="100" y="95" width="300" height="30" rx="8" fill="var(--illustration-danger-bg-alt)" stroke="var(--illustration-danger)" strokeWidth="1.5" />
            <text x="250" y="114" textAnchor="middle" fill="var(--illustration-danger)" fontSize="9" fontFamily="system-ui" fontWeight="600">Error = Prediction − Expected = 2.1 − 1.3 = 0.8</text>
          </g>

          {/* Backward pass */}
          <g style={{ animation: 'tof-pop 0.3s 0.4s both' }}>
            <rect x="30" y="140" width="440" height="30" rx="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-warning)" strokeWidth="1.5" />
            <text x="250" y="159" textAnchor="middle" fill="var(--illustration-warning-lighter)" fontSize="9" fontFamily="system-ui" fontWeight="600">Backward pass: Gradient flows back through each layer</text>
          </g>

          {/* Update */}
          <g style={{ animation: 'tof-pop 0.3s 0.55s both' }}>
            <rect x="100" y="185" width="300" height="30" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
            <text x="250" y="204" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">Weight update: wᵢ ← wᵢ − α · ∂E/∂wᵢ</text>
          </g>

          {/* Chain linking them */}
          <line x1="250" y1="80" x2="250" y2="93" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="247,90 250,97 253,90" fill="var(--illustration-element-muted)" />
          <line x1="250" y1="125" x2="250" y2="138" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="247,135 250,142 253,135" fill="var(--illustration-element-muted)" />
          <line x1="250" y1="170" x2="250" y2="183" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="247,180 250,187 253,180" fill="var(--illustration-element-muted)" />
        </g>
      )}
    </svg>
  );
}

// ── CNN — scanning images like airport X-ray ────────────────────────────

function CNNScanSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            X-RAY SWEEPS IN PATCHES ACROSS THE BAG
          </text>

          {/* Suitcase */}
          <rect x="60" y="50" width="240" height="150" rx="8" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1.5" />

          {/* Items inside */}
          <text x="110" y="85" fontSize="16">👕</text>
          <text x="170" y="75" fontSize="12">💻</text>
          <text x="200" y="130" fontSize="12">🔑</text>
          <text x="100" y="150" fontSize="12">👟</text>
          <text x="230" y="110" fontSize="16">💧</text>
          <text x="130" y="115" fontSize="10">📱</text>
          <text x="180" y="180" fontSize="10">🔋</text>

          {/* Scanning window */}
          <rect x="170" y="70" width="50" height="50" rx="4" fill="none" stroke="var(--illustration-warning)" strokeWidth="2.5"
            style={{ animation: 'tof-scan 3s ease-in-out infinite' }} />

          {/* Scan line */}
          <line x1="60" y1="95" x2="300" y2="95" stroke="var(--illustration-warning)" strokeWidth="1" opacity="0.4"
            style={{ animation: 'tof-beam 2s ease-in-out infinite' }} />

          {/* Scanner head */}
          <g transform="translate(330, 80)">
            <rect x="-20" y="-30" width="40" height="30" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-success-bright)" strokeWidth="1.5" />
            <text x="0" y="-12" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">Scanner</text>
            <line x1="-10" y1="0" x2="-10" y2="20" stroke="var(--illustration-success-bright)" strokeWidth="1.5" />
            <line x1="10" y1="0" x2="10" y2="20" stroke="var(--illustration-success-bright)" strokeWidth="1.5" />
            <polygon points="-13,18 -10,26 -7,18" fill="var(--illustration-success-bright)" />
            <polygon points="7,18 10,26 13,18" fill="var(--illustration-success-bright)" />
          </g>

          {/* Result */}
          <g transform="translate(400, 145)">
            <rect x="-30" y="-12" width="60" height="24" rx="6" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
            <text x="0" y="3" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="8" fontFamily="system-ui" fontWeight="700">Threat map</text>
          </g>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            SLIDING WINDOW — DETECT LOCAL PATTERNS
          </text>

          {/* Input grid */}
          <rect x="40" y="45" width="160" height="160" rx="4" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={'hg'+i} x1="40" y1={65 + i * 20} x2="200" y2={65 + i * 20} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={'vg'+i} x1={60 + i * 20} y1="45" x2={60 + i * 20} y2="205" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
          ))}

          {/* Active window */}
          <rect x={60} y={65} width="60" height="60" rx="2" fill="none" stroke="var(--illustration-warning)" strokeWidth="2.5"
            style={{ animation: 'tof-scan 3s ease-in-out infinite' }} />

          {/* Convolution result */}
          <g transform="translate(280, 55)">
            <rect x="-10" y="-10" width="80" height="80" rx="4" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <text x="30" y="12" textAnchor="middle" fill="var(--illustration-accent)" fontSize="7" fontFamily="system-ui">Feature Map</text>
            {/* Smaller grid */}
            <line x1="10" y1="30" x2="10" y2="60" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
            <line x1="30" y1="20" x2="30" y2="60" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
            <line x1="50" y1="20" x2="50" y2="60" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="60" y2="40" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
            <line x1="0" y1="60" x2="60" y2="60" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
            {/* Activated cells */}
            <rect x="1" y="21" width="18" height="18" fill="var(--illustration-secondary)" opacity="0.4" rx="1" />
            <rect x="41" y="21" width="18" height="18" fill="var(--illustration-secondary)" opacity="0.3" rx="1" />
          </g>

          {/* Sliding arrow */}
          <line x1="205" y1="125" x2="265" y2="85" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="261,89 268,82 263,80" fill="var(--illustration-element-muted)" />

          {/* Pooling */}
          <g transform="translate(390, 55)">
            <rect x="-15" y="-10" width="80" height="80" rx="4" fill="var(--illustration-surface)" stroke="var(--illustration-success-bright)" strokeWidth="1" />
            <text x="25" y="12" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">Pooled</text>
            <line x1="5" y1="40" x2="45" y2="40" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
            <line x1="25" y1="25" x2="25" y2="55" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
            <rect x="6" y="26" width="18" height="18" fill="var(--illustration-success-bright)" opacity="0.4" rx="1" />
          </g>

          <line x1="345" y1="95" x2="370" y2="95" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <polygon points="367,92 375,95 367,98" fill="var(--illustration-element-muted)" />
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1">
            CNN: CONVOLUTION KERNELS SLIDE ACROSS IMAGE
          </text>

          {/* Input image */}
          <g transform="translate(60, 55)">
            <rect x="-30" y="-25" width="60" height="50" rx="4" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-muted-light)" strokeWidth="1" />
            <text x="0" y="0" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">Image</text>
            <text x="0" y="15" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">224×224</text>
          </g>

          {/* Convolution layer */}
          <g transform="translate(180, 55)">
            <rect x="-35" y="-25" width="70" height="50" rx="4" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <text x="0" y="0" textAnchor="middle" fill="var(--illustration-accent)" fontSize="8" fontFamily="system-ui">Conv 3×3</text>
            <text x="0" y="15" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">64 kernels</text>
          </g>

          {/* Activation */}
          <g transform="translate(300, 55)">
            <rect x="-30" y="-25" width="60" height="50" rx="4" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="0" y="0" textAnchor="middle" fill="var(--illustration-warning)" fontSize="8" fontFamily="system-ui">ReLU</text>
            <text x="0" y="15" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Activation</text>
          </g>

          {/* Pooling */}
          <g transform="translate(410, 55)">
            <rect x="-30" y="-25" width="60" height="50" rx="4" fill="var(--illustration-surface)" stroke="var(--illustration-success-bright)" strokeWidth="1" />
            <text x="0" y="0" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="8" fontFamily="system-ui">Pool 2×2</text>
            <text x="0" y="15" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Downsample</text>
          </g>

          {/* Arrows between */}
          {[
            [90, 55, 143, 55],
            [215, 55, 268, 55],
            [330, 55, 378, 55],
          ].map(([x1, y1, x2, y2]) => (
            <>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
              <polygon points={[x2-3, y2-3, x2+3, y2, x2-3, y2+3].join(',')} fill="var(--illustration-element-muted)" />
            </>
          ))}

          {/* Kernel visualization */}
          <g transform="translate(250, 145)">
            <rect x="-50" y="-20" width="100" height="40" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
            <text x="0" y="0" textAnchor="middle" fill="var(--illustration-accent)" fontSize="8" fontFamily="system-ui">Kernel (filter) learns: edges, textures, patterns</text>
            <text x="0" y="14" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Multiple kernels = multiple feature maps</text>
          </g>

          {/* Output */}
          <g transform="translate(250, 200)">
            <rect x="-80" y="-15" width="160" height="30" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
            <text x="0" y="3" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">
              Convolution + ReLU + Pooling → Repeated → Fully Connected
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ── Text Processing — scans language like airport scanner ───────────────

function TextProcessingSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">TEXT GOES THROUGH THE LANGUAGE SCANNER</text>
          <rect x="50" y="55" width="400" height="60" rx="8" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1.5" />
          <text x="250" y="80" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="12" fontFamily="monospace">"The quick brown fox jumps over the lazy dog"</text>
          <rect x="150" y="60" width="60" height="50" rx="4" fill="none" stroke="var(--illustration-warning)" strokeWidth="2" style={{ animation: 'tof-scan 3s ease-in-out infinite' }} />
          <rect x="170" y="140" width="160" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
          <text x="250" y="157" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">Scanner reads character by character</text>
          <text x="250" y="170" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Raw text → Tokens → Meaning</text>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">TOKENIZATION — BREAK TEXT INTO PIECES</text>
          {[
            { tok: 'The', color: 'var(--illustration-secondary)' },
            { tok: 'quick', color: 'var(--illustration-success-bright)' },
            { tok: 'brown', color: 'var(--illustration-warning)' },
            { tok: 'fox', color: 'var(--illustration-accent-pink)' },
            { tok: 'jumps', color: 'var(--illustration-success-alt)' },
            { tok: 'over', color: 'var(--illustration-accent)' },
            { tok: 'the', color: 'var(--illustration-danger)' },
            { tok: 'lazy', color: '#38bdf8' },
            { tok: 'dog', color: '#fb923c' },
          ].map((t, i) => (
            <g key={i} style={{ animation: `tof-pop 0.25s ${i * 0.06}s both` }}>
              <rect x={15 + i * 52} y={60} width="48" height="32" rx="6" fill="var(--illustration-surface)" stroke={t.color} strokeWidth="1" />
              <text x={39 + i * 52} y={80} textAnchor="middle" fill={t.color} fontSize="8" fontFamily="monospace" fontWeight="700">{t.tok}</text>
            </g>
          ))}
          <g style={{ animation: 'tof-up 0.3s 0.6s both' }}>
            <rect x="80" y="120" width="340" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
            <text x="250" y="138" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">Each token = one unit for the model to process</text>
            <text x="250" y="150" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Like scanning bag items one by one</text>
          </g>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">NLP PIPELINE — RAW TEXT TO INSIGHT</text>
          {[
            { label: 'Text', icon: '📄', y: 65, color: 'var(--illustration-muted-light)' },
            { label: 'Tokenize', icon: '✂️', y: 65, color: 'var(--illustration-secondary)' },
            { label: 'Parse', icon: '🔍', y: 65, color: 'var(--illustration-warning)' },
            { label: 'Embed', icon: '🗺️', y: 65, color: 'var(--illustration-success-bright)' },
            { label: 'Predict', icon: '🎯', y: 65, color: 'var(--illustration-success-alt)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.1}s both` }}>
              <rect x={20 + i * 96} y={s.y} width="76" height="60" rx="8" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="1.5" />
              <text x={58 + i * 96} y={s.y + 28} textAnchor="middle" fontSize="14">{s.icon}</text>
              <text x={58 + i * 96} y={s.y + 48} textAnchor="middle" fill={s.color} fontSize="8" fontFamily="system-ui" fontWeight="600">{s.label}</text>
            </g>
          ))}
          {[0,1,2,3].map(i => (
            <line key={i} x1={96 + i * 96} y1={95} x2={98 + i * 96} y2={95} stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          ))}
          <rect x="120" y="165" width="260" height="30" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1" />
          <text x="250" y="184" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">Raw language → Structured understanding</text>
        </g>
      )}
    </svg>
  );
}

// ── Word Embeddings — map meaning like GPS coordinates ──────────────────

function WordMeaningEmbedSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">WORDS LIVE ON A MEANING MAP</text>
          <rect x="60" y="45" width="380" height="150" rx="10" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          {[0,1,2,3,4].map(i => <line key={'h'+i} x1="65" y1={75 + i * 30} x2="435" y2={75 + i * 30} stroke="var(--illustration-surface)" strokeWidth="0.5" />)}
          {[0,1,2,3,4].map(i => <line key={'v'+i} x1={135 + i * 75} y1="50" x2={135 + i * 75} y2="190" stroke="var(--illustration-surface)" strokeWidth="0.5" />)}
          {[
            { word: 'King', x: 250, y: 80, color: 'var(--illustration-warning)' },
            { word: 'Queen', x: 250, y: 140, color: 'var(--illustration-accent-pink)' },
            { word: 'Man', x: 170, y: 110, color: 'var(--illustration-secondary)' },
            { word: 'Woman', x: 170, y: 170, color: 'var(--illustration-success-bright)' },
            { word: 'Prince', x: 330, y: 90, color: 'var(--illustration-success-alt)' },
            { word: 'Princess', x: 330, y: 150, color: 'var(--illustration-accent)' },
          ].map((w, i) => (
            <g key={i}>
              <circle cx={w.x} cy={w.y} r="4" fill={w.color} />
              <text x={w.x + 8} y={w.y + 3} fill={w.color} fontSize="8" fontFamily="system-ui">{w.word}</text>
            </g>
          ))}
          <line x1="170" y1="110" x2="250" y2="80" stroke="var(--illustration-element-muted)" strokeWidth="0.5" strokeDasharray="3,2" />
          <line x1="170" y1="170" x2="250" y2="140" stroke="var(--illustration-element-muted)" strokeWidth="0.5" strokeDasharray="3,2" />
          <line x1="250" y1="80" x2="250" y2="140" stroke="var(--illustration-warning)" strokeWidth="1" opacity="0.5" />
          <text x="255" y="115" fill="var(--illustration-warning)" fontSize="6" fontFamily="system-ui">Gender axis</text>
          <text x="250" y="200" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">King − Man + Woman = Queen</text>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">EMBEDDING SPACE — MEANING → VECTOR</text>
          {[
            { word: 'Paris', vec: '[0.2, 0.8]', x: 90, color: 'var(--illustration-secondary)', cat: 'City' },
            { word: 'Rome', vec: '[0.3, 0.7]', x: 190, color: 'var(--illustration-secondary)', cat: 'City' },
            { word: 'France', vec: '[0.7, 0.3]', x: 310, color: 'var(--illustration-warning)', cat: 'Country' },
            { word: 'Italy', vec: '[0.8, 0.2]', x: 410, color: 'var(--illustration-warning)', cat: 'Country' },
          ].map((w, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.1}s both` }}>
              <rect x={20 + i * 110} y={50} width="100" height="55" rx="8" fill="var(--illustration-surface)" stroke={w.color} strokeWidth="1.5" />
              <text x={70 + i * 110} y={70} textAnchor="middle" fill="var(--illustration-track)" fontSize="12" fontFamily="system-ui" fontWeight="700">{w.word}</text>
              <text x={70 + i * 110} y={90} textAnchor="middle" fill={w.color} fontSize="7" fontFamily="monospace">{w.vec}</text>
              <text x={70 + i * 110} y={100} textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="6" fontFamily="system-ui">{w.cat}</text>
            </g>
          ))}
          <g style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            <rect x="100" y="135" width="300" height="35" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
            <text x="250" y="153" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="600">Similar words → Close vectors</text>
            <text x="250" y="165" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Paris − France + Italy = Rome (vector arithmetic)</text>
          </g>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">EMBEDDING LAYER — WORDS → NUMBERS</text>
          {[
            { idx: 0, word: 'The', vec: '...', color: 'var(--illustration-secondary)' },
            { idx: 1, word: 'cat', vec: '...', color: 'var(--illustration-success-bright)' },
            { idx: 2, word: 'sat', vec: '...', color: 'var(--illustration-warning)' },
          ].map((w, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.12}s both` }}>
              <rect x={60 + i * 140} y={50} width="120" height="45" rx="6" fill="var(--illustration-surface)" stroke={w.color} strokeWidth="1" />
              <text x={120 + i * 140} y={70} textAnchor="middle" fill="var(--illustration-track)" fontSize="11" fontFamily="monospace" fontWeight="700">{w.word}</text>
              <text x={120 + i * 140} y={86} textAnchor="middle" fill={w.color} fontSize="8" fontFamily="monospace">→ [{w.vec}]</text>
            </g>
          ))}
          <line x1="180" y1="72" x2="195" y2="72" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <line x1="320" y1="72" x2="335" y2="72" stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          <g style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            <rect x="80" y="135" width="340" height="45" rx="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
            <text x="250" y="153" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">Embedding Matrix (300-dim)</text>
            <text x="250" y="168" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">Each word → fixed-length vector of numbers</text>
            <text x="250" y="178" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Similar context → similar vectors</text>
          </g>
        </g>
      )}
    </svg>
  );
}

// ── Language Models — navigate text like GPS navigates roads ────────────

function LanguageModelNavSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">NEXT WORD PREDICTION — LIKE GPS PREDICTS THE ROAD</text>
          <rect x="40" y="55" width="420" height="50" rx="8" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <text x="250" y="75" textAnchor="middle" fill="var(--illustration-track)" fontSize="10" fontFamily="monospace">"The cat sat on the ___"</text>
          <text x="250" y="90" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="monospace">↓ Which word comes next?</text>
          <g style={{ animation: 'tof-pop 0.35s 0.3s both' }}>
            {[
              { word: 'mat', prob: 0.72, color: 'var(--illustration-success-bright)' },
              { word: 'floor', prob: 0.15, color: 'var(--illustration-warning)' },
              { word: 'roof', prob: 0.08, color: 'var(--illustration-secondary)' },
              { word: 'table', prob: 0.05, color: 'var(--illustration-muted-light)' },
            ].map((w, i) => (
              <g key={i}>
                <rect x={60 + i * 100} y={130} width="80" height="36" rx="6" fill="var(--illustration-surface)" stroke={w.color} strokeWidth="1" />
                <text x={100 + i * 100} y={148} textAnchor="middle" fill={w.color} fontSize="9" fontFamily="system-ui" fontWeight="700">{w.word}</text>
                <text x={100 + i * 100} y={160} textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="monospace">{Math.round(w.prob * 100)}%</text>
              </g>
            ))}
          </g>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">PROBABILITY LANDSCAPE — CHOOSE THE PATH</text>
          <path d="M 40 180 Q 100 60 160 120 Q 220 180 280 40 Q 340 100 400 140 Q 440 120 460 180" fill="none" stroke="var(--illustration-surface-mid)" strokeWidth="2" />
          {['cat', 'sat', 'on', 'the', 'mat'].map((w, i) => (
            <circle key={i} cx={80 + i * 90} cy={i % 2 === 0 ? 70 : 130} r="18" fill="var(--illustration-surface)"
              stroke={i === 4 ? 'var(--illustration-success-bright)' : 'var(--illustration-secondary)'} strokeWidth="2"
              style={{ animation: `tof-pop 0.3s ${i * 0.15}s both` }} />
          ))}
          {['cat', 'sat', 'on', 'the', 'mat'].map((w, i) => (
            <text key={i} x={80 + i * 90} y={i % 2 === 0 ? 75 : 135} textAnchor="middle"
              fill="var(--illustration-track)" fontSize="8" fontFamily="system-ui">{w}</text>
          ))}
          {[0,1,2,3].map(i => (
            <line key={i} x1={98 + i * 90} y1={i % 2 === 0 ? 80 : 140} x2={152 + i * 90} y2={i % 2 === 0 ? 115 : 75}
              stroke="var(--illustration-element-muted)" strokeWidth="1" />
          ))}
          <rect x="100" y="195" width="300" height="28" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
          <text x="250" y="213" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">Each word choice = fork in the road</text>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">LANGUAGE MODEL ARCHITECTURE</text>
          {[
            { label: 'Input\nTokens', x: 50, color: 'var(--illustration-muted-light)' },
            { label: 'Embed\nLayer', x: 150, color: 'var(--illustration-secondary)' },
            { label: 'Transformer\nBlocks', x: 280, color: 'var(--illustration-warning)' },
            { label: 'Output\nProbs', x: 410, color: 'var(--illustration-success-bright)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.1}s both` }}>
              <rect x={s.x - 45} y={60} width="90" height="80" rx="8" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="1.5" />
              <text x={s.x} y={100} textAnchor="middle" fill={s.color} fontSize="8" fontFamily="system-ui" fontWeight="600">{s.label}</text>
            </g>
          ))}
          {[0,1,2].map(i => (
            <line key={i} x1={95 + i * 130} y1={100} x2={103 + i * 130} y2={100} stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          ))}
          <rect x="80" y="175" width="340" height="36" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1" />
          <text x="250" y="193" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">Next token prediction → Auto-regressive generation</text>
          <text x="250" y="206" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Predict one token at a time, feed it back in</text>
        </g>
      )}
    </svg>
  );
}

// ── Attention — routes understanding like GPS routes traffic ────────────

function AttentionRouteSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">ATTENTION FOCUSES ON WHAT MATTERS</text>
          <rect x="50" y="55" width="400" height="70" rx="8" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <text x="250" y="80" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="monospace">"The trophy would not fit in the suitcase because it was too big."</text>
          <text x="250" y="100" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">What does "it" refer to?</text>
          <g style={{ animation: 'tof-pop 0.3s 0.3s both' }}>
            <ellipse cx="100" cy="60" rx="35" ry="12" fill="none" stroke="var(--illustration-danger)" strokeWidth="2" opacity="0.6" style={{ animation: 'tof-float 2s ease-in-out infinite' }} />
            <text x="100" y="63" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui" fontWeight="700">trophy</text>
          </g>
          <ellipse cx="310" cy="83" rx="30" ry="12" fill="none" stroke="var(--illustration-warning)" strokeWidth="2" opacity="0.4" />
          <text x="310" y="86" textAnchor="middle" fill="var(--illustration-warning)" fontSize="7" fontFamily="system-ui">suitcase</text>
          <rect x="150" y="155" width="200" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1" />
          <text x="250" y="173" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">Attention weights determine the link</text>
          <text x="250" y="186" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">{"\"trophy\" (0.7) > \"suitcase\" (0.2) → \"it\" = trophy"}</text>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">ATTENTION WEIGHTS — ROUTE THE SIGNAL</text>
          {[
            { word: 'The', w: [0.01, 0.05, 0.02, 0.9, 0.02], color: 'var(--illustration-muted-light)' },
            { word: 'cat', w: [0.1, 0.8, 0.05, 0.03, 0.02], color: 'var(--illustration-success-bright)' },
            { word: 'sat', w: [0.3, 0.1, 0.5, 0.05, 0.05], color: 'var(--illustration-warning)' },
            { word: 'on', w: [0.1, 0.05, 0.05, 0.1, 0.7], color: 'var(--illustration-secondary)' },
            { word: 'mat', w: [0.05, 0.05, 0.05, 0.8, 0.05], color: 'var(--illustration-success-alt)' },
          ].map((row, ri) => (
            <g key={ri}>
              <text x="25" y={65 + ri * 30} fill={row.color} fontSize="8" fontFamily="system-ui" fontWeight="600">{row.word}</text>
              {row.w.map((val, ci) => (
                <rect key={ci} x={70 + ci * 55} y={50 + ri * 30} width="50" height="24" rx="3"
                  fill={val > 0.5 ? 'var(--illustration-success-alt)' : val > 0.1 ? 'var(--illustration-warning)' : 'var(--illustration-surface-alt)'}
                  opacity={0.5 + val * 0.5} />
              ))}
            </g>
          ))}
          <text x="250" y="220" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">Each word attends to every other word — learns dependencies</text>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">MULTI-HEAD ATTENTION</text>
          {[
            { head: 'Head 1', role: 'Syntax', color: 'var(--illustration-secondary)' },
            { head: 'Head 2', role: 'Semantics', color: 'var(--illustration-success-bright)' },
            { head: 'Head 3', role: 'Position', color: 'var(--illustration-warning)' },
            { head: 'Head 4', role: 'Context', color: 'var(--illustration-accent-pink)' },
          ].map((h, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.1}s both` }}>
              <rect x={40 + i * 110} y={55} width="90" height="55" rx="8" fill="var(--illustration-surface)" stroke={h.color} strokeWidth="1.5" />
              <text x={85 + i * 110} y={75} textAnchor="middle" fill={h.color} fontSize="9" fontFamily="system-ui" fontWeight="700">{h.head}</text>
              <text x={85 + i * 110} y={95} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">{h.role}</text>
            </g>
          ))}
          <rect x="120" y="140" width="260" height="36" rx="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1" />
          <text x="250" y="158" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">Multiple attention patterns in parallel</text>
          <text x="250" y="170" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Each head learns a different relationship type</text>
          <rect x="80" y="195" width="340" height="28" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1" />
          <text x="250" y="213" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui">Concatenate all heads → richer understanding</text>
        </g>
      )}
    </svg>
  );
}

// ── Bias in Data — hides like contraband in luggage ────────────────────

function BiasInDataSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">SKEWED DATA — HIDDEN IMBALANCE</text>
          {[
            { label: 'Group A', count: 80, color: 'var(--illustration-secondary)' },
            { label: 'Group B', count: 15, color: 'var(--illustration-warning)' },
            { label: 'Group C', count: 5, color: 'var(--illustration-danger)' },
          ].map((g, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.12}s both` }}>
              <rect x={60 + i * 140} y={55 + (80 - g.count) * 1.5} width="100" height={g.count * 1.5} rx="4" fill={g.color} opacity="0.7" />
              <text x={110 + i * 140} y={50 + (80 - g.count) * 1.5} textAnchor="middle" fill={g.color} fontSize="9" fontFamily="system-ui" fontWeight="700">{g.count}%</text>
              <text x={110 + i * 140} y={192} textAnchor="middle" fill={g.color} fontSize="9" fontFamily="system-ui">{g.label}</text>
            </g>
          ))}
          <g style={{ animation: 'tof-up 0.3s 0.5s both' }}>
            <rect x="80" y="200" width="340" height="28" rx="8" fill="var(--illustration-danger-bg-alt)" stroke="var(--illustration-danger)" strokeWidth="1" />
            <text x="250" y="218" textAnchor="middle" fill="var(--illustration-danger)" fontSize="9" fontFamily="system-ui" fontWeight="600">⚠️ 80% of data is Group A — model will overfit to A</text>
          </g>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">BIASED TRAINING → BIASED OUTPUT</text>
          {[
            { stage: 'Training Data', icon: '📊', desc: '80% A, 15% B, 5% C', color: 'var(--illustration-secondary)', y: 55 },
            { stage: 'Model Learns', icon: '🧠', desc: 'Optimizes for majority', color: 'var(--illustration-warning)', y: 105 },
            { stage: 'Prediction', icon: '🎯', desc: 'Fails on minority groups', color: 'var(--illustration-danger)', y: 155 },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.12}s both` }}>
              <rect x={100} y={s.y} width="300" height="40" rx="8" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="1.5" />
              <text x={120} y={s.y + 16} fontSize="12">{s.icon}</text>
              <text x={210} y={s.y + 16} textAnchor="middle" fill={s.color} fontSize="9" fontFamily="system-ui" fontWeight="700">{s.stage}</text>
              <text x={210} y={s.y + 32} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">{s.desc}</text>
            </g>
          ))}
          {[0,1].map(i => (
            <line key={i} x1="250" y1={95 + i * 50} x2="250" y2={103 + i * 50} stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          ))}
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">FAIRNESS — MITIGATING BIAS</text>
          {[
            { label: 'Balanced\nData', icon: '⚖️', color: 'var(--illustration-success-bright)' },
            { label: 'Fair\nTraining', icon: '🔧', color: 'var(--illustration-secondary)' },
            { label: 'Audit\nOutputs', icon: '🔍', color: 'var(--illustration-warning)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.1}s both` }}>
              <rect x={50 + i * 145} y={60} width="120" height="80" rx="10" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="1.5" />
              <text x={110 + i * 145} y={90} textAnchor="middle" fontSize="18">{s.icon}</text>
              <text x={110 + i * 145} y={115} textAnchor="middle" fill={s.color} fontSize="9" fontFamily="system-ui" fontWeight="600">{s.label}</text>
            </g>
          ))}
          {[0,1].map(i => (
            <line key={i} x1={170 + i * 145} y1={100} x2={172 + i * 145} y2={100} stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          ))}
          <rect x="120" y="175" width="260" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-success-alt)" strokeWidth="1" />
          <text x="250" y="193" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">Fair model = representative data + careful evaluation</text>
          <text x="250" y="205" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Check performance across all groups</text>
        </g>
      )}
    </svg>
  );
}

// ── AI Hallucinations — like a broken GPS ───────────────────────────────

function HallucinationSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">BROKEN GPS — CONFIDENTLY WRONG</text>
          <rect x="80" y="50" width="340" height="120" rx="10" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <path d="M 120 130 Q 180 60 250 100 Q 320 140 380 70" fill="none" stroke="var(--illustration-danger)" strokeWidth="2.5" />
          <circle cx="380" cy="70" r="8" fill="var(--illustration-danger)" />
          <text x="380" y="60" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui" fontWeight="700">You are here!</text>
          <rect x="120" y="50" width="60" height="24" rx="4" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1" />
          <text x="150" y="66" textAnchor="middle" fill="var(--illustration-warning)" fontSize="7" fontFamily="system-ui">🏁 Start</text>
          <circle cx="250" cy="100" r="6" fill="var(--illustration-danger)" opacity="0.5" style={{ animation: 'tof-node 1.5s ease infinite' }} />
          <text x="250" y="125" textAnchor="middle" fill="var(--illustration-danger)" fontSize="8" fontFamily="system-ui" fontWeight="700">Wrong turn!</text>
          <text x="250" y="180" textAnchor="middle" fill="var(--illustration-danger)" fontSize="8" fontFamily="system-ui">GPS says "Arrived" — but you're in a field</text>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">MODEL HALLUCINATES — CONFIDENTLY WRONG</text>
          {[
            { q: 'Prompt', a: '"What is the capital of Atlantis?"', color: 'var(--illustration-secondary)' },
            { q: 'Model', a: '"Atlantis is a lost city in the Atlantic... Its capital was Poseidonia, founded in 9500 BC."', color: 'var(--illustration-danger)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.15}s both` }}>
              <rect x={60} y={50 + i * 60} width="380" height="50" rx="8" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="1.5" />
              <text x={80} y={70 + i * 60} fill={s.color} fontSize="8" fontFamily="system-ui" fontWeight="600">{s.q}:</text>
              <text x={80} y={88 + i * 60} fill="var(--illustration-track)" fontSize="8" fontFamily="system-ui">{s.a.length > 50 ? s.a.slice(0, 60) + '...' : s.a}</text>
            </g>
          ))}
          <g style={{ animation: 'tof-pop 0.3s 0.4s both' }}>
            <rect x="100" y="180" width="300" height="36" rx="8" fill="var(--illustration-danger-bg-alt)" stroke="var(--illustration-danger)" strokeWidth="1" />
            <text x="250" y="198" textAnchor="middle" fill="var(--illustration-danger)" fontSize="9" fontFamily="system-ui" fontWeight="600">🚫 Atlantis doesn't exist — model invented facts</text>
            <text x="250" y="211" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Sound convincing + factually wrong = hallucination</text>
          </g>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">MITIGATING HALLUCINATIONS</text>
          {[
            { label: 'Grounding', desc: 'Connect to real data sources', icon: '🔗', color: 'var(--illustration-success-bright)' },
            { label: 'Verification', desc: 'Cross-check facts before output', icon: '✅', color: 'var(--illustration-secondary)' },
            { label: 'Confidence', desc: 'Show uncertainty levels', icon: '📊', color: 'var(--illustration-warning)' },
          ].map((m, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.1}s both` }}>
              <rect x={40 + i * 145} y={60} width="120" height="75" rx="8" fill="var(--illustration-surface)" stroke={m.color} strokeWidth="1.5" />
              <text x={100 + i * 145} y={88} textAnchor="middle" fontSize="16">{m.icon}</text>
              <text x={100 + i * 145} y={108} textAnchor="middle" fill={m.color} fontSize="8" fontFamily="system-ui" fontWeight="600">{m.label}</text>
              <text x={100 + i * 145} y={125} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="system-ui">{m.desc}</text>
            </g>
          ))}
          <rect x="120" y="170" width="260" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
          <text x="250" y="188" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">Always verify AI outputs against known facts</text>
          <text x="250" y="200" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">RAG = Retrieval-Augmented Generation (grounding)</text>
        </g>
      )}
    </svg>
  );
}

// ── Responsible AI — routes decisions like GPS around hazards ──────────

function ResponsibleAISVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">GPS AVOIDS HAZARDS — AI NEEDS GUARDRAILS</text>
          <rect x="50" y="50" width="400" height="130" rx="10" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <path d="M 80 170 Q 150 80 250 120 Q 350 160 420 80" fill="none" stroke="var(--illustration-success-bright)" strokeWidth="2.5" />
          <circle cx="80" cy="170" r="6" fill="var(--illustration-success-bright)" />
          <circle cx="420" cy="80" r="6" fill="var(--illustration-success-bright)" />
          <line x1="170" y1="100" x2="200" y2="120" stroke="var(--illustration-danger)" strokeWidth="1.5" strokeDasharray="6,3" />
          <text x="140" y="95" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui">⚠️ Hazard</text>
          <line x1="320" y1="130" x2="350" y2="130" stroke="var(--illustration-danger)" strokeWidth="1.5" strokeDasharray="6,3" />
          <text x="335" y="145" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui">⚠️ Ethical risk</text>
          <rect x="180" y="170" width="140" height="28" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1" />
          <text x="250" y="189" textAnchor="middle" fill="var(--illustration-warning)" fontSize="8" fontFamily="system-ui">Guardrails = GPS hazard detection</text>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">ETHICAL CONSTRAINTS IN AI SYSTEMS</text>
          {[
            { label: 'Fairness', desc: 'No discriminatory outputs', icon: '⚖️', color: 'var(--illustration-secondary)' },
            { label: 'Privacy', desc: 'Protect user data', icon: '🔒', color: 'var(--illustration-success-bright)' },
            { label: 'Transparency', desc: 'Explainable decisions', icon: '🔍', color: 'var(--illustration-warning)' },
            { label: 'Accountability', desc: 'Human oversight', icon: '👤', color: 'var(--illustration-accent-pink)' },
          ].map((c, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.08}s both` }}>
              <rect x={30 + i * 113} y={55} width="100" height="70" rx="8" fill="var(--illustration-surface)" stroke={c.color} strokeWidth="1.5" />
              <text x={80 + i * 113} y={78} textAnchor="middle" fontSize="14">{c.icon}</text>
              <text x={80 + i * 113} y={98} textAnchor="middle" fill={c.color} fontSize="8" fontFamily="system-ui" fontWeight="600">{c.label}</text>
              <text x={80 + i * 113} y={114} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="6" fontFamily="system-ui">{c.desc}</text>
            </g>
          ))}
          <rect x="120" y="150" width="260" height="36" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1" />
          <text x="250" y="168" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">Built into the system — not an afterthought</text>
          <text x="250" y="180" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Ethics by design, not bolt-on compliance</text>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">RESPONSIBLE AI FRAMEWORK</text>
          {[
            { label: 'Define\nPrinciples', x: 60, color: 'var(--illustration-secondary)' },
            { label: 'Train\nFairly', x: 170, color: 'var(--illustration-success-bright)' },
            { label: 'Audit &\nMonitor', x: 285, color: 'var(--illustration-warning)' },
            { label: 'Iterate\nImprove', x: 400, color: 'var(--illustration-success-alt)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.1}s both` }}>
              <rect x={s.x - 45} y={60} width="90" height="65" rx="8" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="1.5" />
              <text x={s.x} y={92} textAnchor="middle" fill={s.color} fontSize="9" fontFamily="system-ui" fontWeight="600">{s.label}</text>
            </g>
          ))}
          {[0,1,2].map(i => (
            <line key={i} x1={105 + i * 110} y1={92} x2={113 + i * 110} y2={92} stroke="var(--illustration-element-muted)" strokeWidth="1.5" />
          ))}
          <rect x="80" y="155" width="340" height="36" rx="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1" />
          <text x="250" y="173" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">Responsible AI = continuous cycle, not one-time fix</text>
          <text x="250" y="185" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Monitor → Detect → Fix → Monitor (closed loop)</text>
        </g>
      )}
    </svg>
  );
}

// ── Journey Complete — like GPS reaching destination ────────────────────

function JourneyCompleteSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">GPS SAYS: "YOU HAVE ARRIVED"</text>
          <rect x="80" y="50" width="340" height="130" rx="12" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <path d="M 120 150 Q 200 80 300 120 Q 370 160 400 100" fill="none" stroke="var(--illustration-success-bright)" strokeWidth="2" />
          <circle cx="120" cy="150" r="6" fill="var(--illustration-success-bright)" />
          <text x="120" y="170" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">Start</text>
          <circle cx="400" cy="100" r="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="2.5" style={{ animation: 'tof-node 1.5s ease infinite' }} />
          <text x="400" y="125" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="7" fontFamily="system-ui" fontWeight="700">🏁 Destination</text>
          <text x="250" y="195" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="12" fontFamily="system-ui" fontWeight="700">✓ Journey complete!</text>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">AI LEARNING JOURNEY — ALL LECTURES</text>
          {[
            'Search', 'Knowledge', 'Probability', 'Optimization',
            'Neural Nets', 'NLP', 'Ethics',
          ].map((lec, i) => (
            <g key={i} style={{ animation: `tof-pop 0.25s ${i * 0.08}s both` }}>
              <rect x={15 + i * 68} y={60} width="58" height="36" rx="6" fill="var(--illustration-surface)"
                stroke={i < 6 ? 'var(--illustration-success-bright)' : 'var(--illustration-warning)'} strokeWidth="1.5" />
              <text x={44 + i * 68} y={82} textAnchor="middle" fill="var(--illustration-track)" fontSize="6" fontFamily="system-ui" fontWeight="600">{lec}</text>
            </g>
          ))}
          {[0,1,2,3,4,5].map(i => (
            <line key={i} x1={73 + i * 68} y1={78} x2={75 + i * 68} y2={78} stroke="var(--illustration-element-muted)" strokeWidth="1" />
          ))}
          <rect x="120" y="125" width="260" height="50" rx="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1.5" />
          <text x="250" y="145" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">🎉 All lectures completed</text>
          <text x="250" y="162" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">From search algorithms to responsible AI</text>
          <text x="250" y="210" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">Each lecture built on the last — like turn-by-turn directions</text>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">WHAT'S NEXT — NEW DESTINATIONS</text>
          <g transform="translate(250, 75)">
            <circle cx="0" cy="0" r="30" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fontSize="16">🧭</text>
          </g>
          {[
            { label: 'Build your own AI project', x: 100, color: 'var(--illustration-success-bright)' },
            { label: 'Explore specialization (CV, NLP, Robotics)', x: 140, color: 'var(--illustration-secondary)' },
            { label: 'Join AI research community', x: 120, color: 'var(--illustration-warning)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${0.3 + i * 0.1}s both` }}>
              <rect x={s.x} y={120 + i * 35} width={280 - s.x} height="28" rx="6" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="1" />
              <text x={s.x + 10} y={139 + i * 35} fill={s.color} fontSize="8" fontFamily="system-ui" fontWeight="600">{s.label}</text>
            </g>
          ))}
          <rect x="120" y="225" width="260" height="28" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
          <text x="250" y="244" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">The journey doesn't end — it evolves 🚀</text>
        </g>
      )}
    </svg>
  );
}

// ── Project Design — like training a new dog ────────────────────────────

function ProjectDesignSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">STARTING A PROJECT — LIKE A NEW PUPPY</text>
          <rect x="80" y="55" width="340" height="55" rx="10" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="1.5" />
          <text x="250" y="78" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700">🐶 "I want to build an AI that..."</text>
          <text x="250" y="97" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">Exciting start — but where do you begin?</text>
          <g style={{ animation: 'tof-pop 0.3s 0.3s both' }}>
            <rect x="100" y="140" width="300" height="36" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="1" />
            <text x="250" y="158" textAnchor="middle" fill="var(--illustration-warning)" fontSize="9" fontFamily="system-ui">Step 1: Define the problem clearly</text>
            <text x="250" y="170" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">What data? What success looks like? What constraints?</text>
          </g>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">ITERATIVE REFINEMENT — TRAINING + FEEDBACK</text>
          {[
            { label: 'Try', icon: '🧪', color: 'var(--illustration-secondary)' },
            { label: 'Fail', icon: '💥', color: 'var(--illustration-danger)' },
            { label: 'Learn', icon: '📖', color: 'var(--illustration-warning)' },
            { label: 'Improve', icon: '🔧', color: 'var(--illustration-success-bright)' },
          ].map((s, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.1}s both` }}>
              <circle cx={65 + i * 100} cy={90} r="28" fill="var(--illustration-surface)" stroke={s.color} strokeWidth="2" />
              <text x={65 + i * 100} cy={90} dy="8" textAnchor="middle" fontSize="14">{s.icon}</text>
              <text x={65 + i * 100} y={135} textAnchor="middle" fill={s.color} fontSize="9" fontFamily="system-ui" fontWeight="600">{s.label}</text>
            </g>
          ))}
          {[0,1,2].map(i => (
            <line key={i} x1={93 + i * 100} y1={90} x2={95 + i * 100} y2={90} stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,3" />
          ))}
          <line x1="365" y1="90" x2="35" y2="90" stroke="var(--illustration-element-muted)" strokeWidth="1.5" strokeDasharray="5,3" />
          <text x="250" y="175" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">Loop until the model performs well enough</text>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">PROJECT COMPLETE — DOG LEARNED THE TRICKS</text>
          <rect x="80" y="55" width="340" height="130" rx="10" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <text x="250" y="85" textAnchor="middle" fontSize="24">🐕</text>
          <text x="250" y="110" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="12" fontFamily="system-ui" fontWeight="700">✓ Dog knows all tricks!</text>
          <text x="250" y="135" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="9" fontFamily="system-ui">Model trained, tested, and deployed</text>
          <text x="250" y="155" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">Sit, Stay, Roll Over, Fetch — all working</text>
          <rect x="120" y="195" width="260" height="28" rx="8" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="1" />
          <text x="250" y="213" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="9" fontFamily="system-ui" fontWeight="600">Patience + consistency + treats = success</text>
        </g>
      )}
    </svg>
  );
}

// ── Building AI — navigating to unknown destination ────────────────────

function BuildNavigateSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">UNKNOWN TERRITORY — NO CLEAR MAP</text>
          <rect x="60" y="50" width="380" height="130" rx="10" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <text x="80" y="75" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="monospace">?? ??? ??? ???</text>
          <text x="80" y="95" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="monospace">?? ???? ??? ??</text>
          <text x="80" y="115" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="monospace">? ??? ??? ???</text>
          <text x="250" y="145" textAnchor="middle" fill="var(--illustration-warning)" fontSize="10" fontFamily="system-ui" fontWeight="600">No pre-computed route exists</text>
          <text x="250" y="165" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">You explore as you go — like the first GPS to map a new city</text>
        </g>
      )}
      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">EXPLORATION + PIVOTING</text>
          <path d="M 60 170 Q 120 60 180 140 Q 240 50 300 120 Q 360 80 420 140" fill="none" stroke="var(--illustration-secondary)" strokeWidth="2.5" />
          {[
            { cx: 60, cy: 170, label: 'Start', color: 'var(--illustration-warning)' },
            { cx: 180, cy: 140, label: 'Try A', color: 'var(--illustration-secondary)' },
            { cx: 300, cy: 120, label: 'Pivot', color: 'var(--illustration-success-bright)' },
            { cx: 420, cy: 140, label: 'Route found ✓', color: 'var(--illustration-success-alt)' },
          ].map((p, i) => (
            <g key={i} style={{ animation: `tof-pop 0.3s ${i * 0.12}s both` }}>
              <circle cx={p.cx} cy={p.cy} r="8" fill="var(--illustration-surface)" stroke={p.color} strokeWidth="2" />
              <text x={p.cx} y={p.cy + 22} textAnchor="middle" fill={p.color} fontSize="7" fontFamily="system-ui" fontWeight="700">{p.label}</text>
            </g>
          ))}
          <rect x="80" y="195" width="340" height="30" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="1" />
          <text x="250" y="214" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">Try different approaches — learn from failures — pivot fast</text>
        </g>
      )}
      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="22" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">REACHING THE UNKNOWN DESTINATION</text>
          <rect x="80" y="50" width="340" height="130" rx="12" fill="var(--illustration-bg-surface-deep)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <path d="M 120 150 Q 200 60 300 100 Q 380 130 400 85" fill="none" stroke="var(--illustration-success-bright)" strokeWidth="2" />
          <circle cx="120" cy="150" r="6" fill="var(--illustration-success-bright)" />
          <text x="120" y="170" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui">Start</text>
          <circle cx="400" cy="85" r="12" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-alt)" strokeWidth="2.5" style={{ animation: 'tof-node 1.5s ease infinite' }} />
          <text x="400" y="110" textAnchor="middle" fill="var(--illustration-success-alt)" fontSize="7" fontFamily="system-ui" fontWeight="700">🏁 Built!</text>
          <text x="250" y="145" textAnchor="middle" fill="var(--illustration-success-light)" fontSize="11" fontFamily="system-ui" fontWeight="700">✓ Your AI project works!</text>
          <text x="250" y="165" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="8" fontFamily="system-ui">You navigated uncertainty and built something real</text>
          <rect x="120" y="195" width="260" height="28" rx="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-secondary)" strokeWidth="1" />
          <text x="250" y="213" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui">"The best way to predict the future is to create it."</text>
        </g>
      )}
    </svg>
  );
}

// ── Hidden States & Observations (HMM / Markov) ──────────────────────────

function HiddenStateObservationSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />

      {scene === 0 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            OBSERVING WITHOUT SEEING
          </text>

          {/* Building */}
          <g transform="translate(160, 40)">
            <rect x="0" y="0" width="180" height="180" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
            {/* Door */}
            <rect x="70" y="120" width="40" height="60" rx="4" fill="var(--illustration-surface-alt)" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" />
            {/* Windows */}
            {[0,1,2,3].map(i => (
              <rect key={i} x={20 + i * 40} y={30} width="28" height="36" rx="3" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" />
            ))}
            {/* Roof line */}
            <rect x="-8" y="-6" width="196" height="8" rx="2" fill="var(--illustration-surface-alt)" />

            {/* Question mark above building */}
            <text x="90" y="-14" textAnchor="middle" fill="var(--illustration-danger-light)" fontSize="22" fontWeight="700" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />?
            </text>
            {/* Cloud */}
            <g transform="translate(60, -50)">
              <ellipse cx="30" cy="24" rx="28" ry="14" fill="var(--illustration-surface-alt)" opacity="0.5" />
              <ellipse cx="20" cy="20" rx="16" ry="12" fill="var(--illustration-surface-alt)" opacity="0.4" />
              <ellipse cx="40" cy="22" rx="14" ry="10" fill="var(--illustration-surface-alt)" opacity="0.4" />
              <text x="30" y="28" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui" fontWeight="600">Weather?</text>
            </g>
          </g>

          {/* People entering building */}
          {/* Person 1 - with umbrella */}
          <g transform="translate(100, 140)">
            <circle cx="0" cy="-8" r="7" fill="var(--illustration-primary)" opacity="0.4" />
            <rect x="-5" y="0" width="10" height="20" rx="4" fill="var(--illustration-primary)" opacity="0.3" />
            <path d="M-10,-16 Q0,-28 10,-16" stroke="var(--illustration-danger-light)" strokeWidth="1.5" fill="none" opacity="0.6" />
            <text x="0" y="28" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui">☂</text>
          </g>
          {/* Person 2 - no umbrella */}
          <g transform="translate(130, 145)">
            <circle cx="0" cy="-8" r="7" fill="var(--illustration-special)" opacity="0.4" />
            <rect x="-5" y="0" width="10" height="20" rx="4" fill="var(--illustration-special)" opacity="0.3" />
          </g>
          {/* Person 3 - with umbrella */}
          <g transform="translate(280, 138)">
            <circle cx="0" cy="-8" r="7" fill="var(--illustration-warning)" opacity="0.4" />
            <rect x="-5" y="0" width="10" height="20" rx="4" fill="var(--illustration-warning)" opacity="0.3" />
            <path d="M-10,-16 Q0,-28 10,-16" stroke="var(--illustration-danger-light)" strokeWidth="1.5" fill="none" opacity="0.6" />
            <text x="0" y="28" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="7" fontFamily="system-ui">☂</text>
          </g>
          {/* Person 4 - no umbrella */}
          <g transform="translate(310, 143)">
            <circle cx="0" cy="-8" r="7" fill="var(--illustration-success-dim)" opacity="0.4" />
            <rect x="-5" y="0" width="10" height="20" rx="4" fill="var(--illustration-success-dim)" opacity="0.3" />
          </g>

          {/* Arrows pointing to building */}
          <path d="M80,168 Q120,170 155,165" stroke="var(--illustration-element-muted)" strokeWidth="0.8" fill="none" strokeDasharray="3,2" opacity="0.4" />
          <path d="M340,168 Q300,170 265,165" stroke="var(--illustration-element-muted)" strokeWidth="0.8" fill="none" strokeDasharray="3,2" opacity="0.4" />

          {/* Caption */}
          <text x="250" y="248" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            You see who brings umbrellas — but the weather itself stays hidden
          </text>
        </g>
      )}

      {scene === 1 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            TWO LAYERS: HIDDEN STATE + OBSERVATION
          </text>

          {/* Hidden layer (top) */}
          <g transform="translate(50, 40)">
            <rect x="0" y="0" width="400" height="70" rx="8" fill="var(--illustration-danger-light)" opacity="0.04" stroke="var(--illustration-danger-light)" strokeWidth="0.5" strokeDasharray="4,3" />
            <text x="200" y="14" textAnchor="middle" fill="var(--illustration-danger-light)" fontSize="7" fontFamily="system-ui" fontWeight="600" letterSpacing="1">HIDDEN STATE (X)</text>

            {/* Sun state */}
            <g transform="translate(60, 24)">
              <circle cx="20" cy="20" r="16" fill="var(--illustration-warning)" opacity="0.08" stroke="var(--illustration-warning-light)" strokeWidth="0.8" />
              <text x="20" y="18" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="8" fontFamily="system-ui" fontWeight="700">☀</text>
              <text x="20" y="30" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="5" fontFamily="system-ui">Sun</text>
            </g>

            {/* Rain state */}
            <g transform="translate(180, 24)">
              <circle cx="20" cy="20" r="16" fill="var(--illustration-info-deep)" opacity="0.08" stroke="var(--illustration-info)" strokeWidth="0.8" />
              <text x="20" y="18" textAnchor="middle" fill="var(--illustration-info)" fontSize="8" fontFamily="system-ui" fontWeight="700">☔</text>
              <text x="20" y="30" textAnchor="middle" fill="var(--illustration-info)" fontSize="5" fontFamily="system-ui">Rain</text>
            </g>

            {/* Transition arrow */}
            <path d="M98,40 Q130,30 160,40" stroke="var(--illustration-element-muted)" strokeWidth="0.8" fill="none" markerEnd="url(#hmm-arr)" opacity="0.4" />
            <path d="M160,20 Q130,10 98,20" stroke="var(--illustration-element-muted)" strokeWidth="0.8" fill="none" markerEnd="url(#hmm-arr)" opacity="0.4" />

            {/* Dots for more states */}
            <text x="290" y="40" textAnchor="middle" fill="var(--illustration-element-muted)" fontSize="12">···</text>
          </g>

          {/* Down arrows (emission) */}
          <g transform="translate(50, 112)">
            <path d="M30,0 L30,20" stroke="var(--illustration-danger-light)" strokeWidth="0.8" opacity="0.4" markerEnd="url(#hmm-arr)" />
            <text x="30" y="12" textAnchor="middle" fill="var(--illustration-danger-light)" fontSize="5" fontFamily="system-ui">P(E|X)</text>
          </g>
          <g transform="translate(170, 112)">
            <path d="M20,0 L20,20" stroke="var(--illustration-danger-light)" strokeWidth="0.8" opacity="0.4" markerEnd="url(#hmm-arr)" />
            <text x="20" y="12" textAnchor="middle" fill="var(--illustration-danger-light)" fontSize="5" fontFamily="system-ui">P(E|X)</text>
          </g>

          {/* Observation layer (bottom) */}
          <g transform="translate(50, 134)">
            <rect x="0" y="0" width="400" height="70" rx="8" fill="var(--illustration-special)" opacity="0.04" stroke="var(--illustration-special)" strokeWidth="0.5" strokeDasharray="4,3" />
            <text x="200" y="14" textAnchor="middle" fill="var(--illustration-special)" fontSize="7" fontFamily="system-ui" fontWeight="600" letterSpacing="1">OBSERVATION (E)</text>

            {/* Umbrella observation */}
            <g transform="translate(70, 24)">
              <rect x="-16" y="-16" width="32" height="32" rx="6" fill="var(--illustration-special)" opacity="0.06" stroke="var(--illustration-special)" strokeWidth="0.6" />
              <text x="0" y="5" textAnchor="middle" fill="var(--illustration-special)" fontSize="11" fontFamily="system-ui">☂</text>
              <text x="0" y="20" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="5" fontFamily="system-ui">Umbrella</text>
            </g>

            {/* No umbrella observation */}
            <g transform="translate(190, 24)">
              <rect x="-16" y="-16" width="32" height="32" rx="6" fill="var(--illustration-special)" opacity="0.06" stroke="var(--illustration-special)" strokeWidth="0.6" />
              <text x="0" y="5" textAnchor="middle" fill="var(--illustration-special)" fontSize="11" fontFamily="system-ui">☀</text>
              <text x="0" y="20" textAnchor="middle" fill="var(--illustration-muted-text)" fontSize="5" fontFamily="system-ui">No Umbrella</text>
            </g>

            {/* Dots */}
            <text x="290" y="35" textAnchor="middle" fill="var(--illustration-element-muted)" fontSize="12">···</text>
          </g>

          {/* Arrow marker */}
          <defs>
            <marker id="hmm-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--illustration-element-muted)" opacity="0.6" />
            </marker>
          </defs>

          {/* Caption */}
          <text x="250" y="248" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            Hidden states (weather) generate observations (umbrellas) through the emission model P(E|X)
          </text>
        </g>
      )}

      {scene === 2 && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            INFERENCE: OBSERVATIONS REVEAL THE HIDDEN
          </text>

          {/* Timeline of observations */}
          <g transform="translate(30, 50)">
            <text x="220" y="0" textAnchor="middle" fill="var(--illustration-special)" fontSize="7" fontFamily="system-ui" fontWeight="600">Observation Timeline</text>

            {/* Observation boxes */}
            {['☂', '☂', '☀', '☂', '☂', '☂'].map((obs, i) => (
              <g key={i}>
                <rect x={10 + i * 66} y={10} width="50" height="40" rx="6" fill="var(--illustration-special)" opacity="0.06" stroke="var(--illustration-special)" strokeWidth="0.6" />
                <text x={35 + i * 66} y={35} textAnchor="middle" fill="var(--illustration-special)" fontSize="14" fontFamily="system-ui">{obs}</text>
                <text x={35 + i * 66} y={58} textAnchor="middle" fill="var(--illustration-element-muted)" fontSize="6" fontFamily="system-ui">t+{i}</text>
              </g>
            ))}
          </g>

          {/* Arrow down - inference */}
          <g transform="translate(50, 110)">
            <path d="M220,0 L220,20" stroke="var(--illustration-danger-light)" strokeWidth="1.2" opacity="0.5" markerEnd="url(#hmm-inf)" />
            <text x="220" y="12" textAnchor="middle" fill="var(--illustration-danger-light)" fontSize="6" fontFamily="system-ui" fontWeight="600">Most Likely Explanation</text>
          </g>

          {/* Inferred hidden states */}
          <g transform="translate(30, 140)">
            <text x="220" y="0" textAnchor="middle" fill="var(--illustration-danger-light)" fontSize="7" fontFamily="system-ui" fontWeight="600">Inferred Hidden States</text>

            {['☔', '☔', '☀', '☔', '☔', '☔'].map((state, i) => (
              <g key={i}>
                <rect x={10 + i * 66} y={10} width="50" height="40" rx="6" fill="var(--illustration-danger-light)" opacity="0.06" stroke={state === '☔' ? 'var(--illustration-info-deep)' : 'var(--illustration-warning)'} strokeWidth="0.8" />
                <text x={35 + i * 66} y={35} textAnchor="middle" fill={state === '☔' ? 'var(--illustration-info)' : 'var(--illustration-warning-light)'} fontSize="14" fontFamily="system-ui">{state}</text>
                <text x={35 + i * 66} y={58} textAnchor="middle" fill="var(--illustration-element-muted)" fontSize="6" fontFamily="system-ui">{state === '☔' ? 'Rain' : 'Sun'}</text>
              </g>
            ))}
          </g>

          {/* Arrow marker */}
          <defs>
            <marker id="hmm-inf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--illustration-danger-light)" opacity="0.7" />
            </marker>
          </defs>

          {/* Caption */}
          <text x="250" y="248" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            From umbrella observations, the model infers the most likely weather sequence: rain, rain, sun, rain, rain, rain
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Dart Competition — Loss Functions (minimizing error like darts hitting bullseye) ──

function DartCompetitionSVG({ scene }: { scene: number }) {
  const rings = [60, 48, 36, 24, 12, 4];
  const ringLabels = ['100', '50', '20', '10', '5', '1'];
  const scoreColors = ['var(--illustration-danger-light)', '#f97316', 'var(--illustration-warning)', 'var(--illustration-success)', 'var(--illustration-special)', 'var(--illustration-accent)'];
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {(scene === 0 || scene === 1 || scene === 2) && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            {scene === 0 ? 'WILD THROWS — HIGH LOSS' : scene === 1 ? 'ADJUSTING AIM — LOSS DROPPING' : 'BULLSEYE — LOSS MINIMIZED'}
          </text>
          <g transform="translate(250, 138)">
            {rings.map((r, i) => (
              <g key={i}>
                <circle cx="0" cy="0" r={r} fill="none" stroke={scoreColors[i]} strokeWidth={i === rings.length - 1 ? 2 : 0.4} opacity={i === rings.length - 1 ? 0.6 : 0.25} />
                <text x={0} y={-r + 6} textAnchor="middle" fill={scoreColors[i]} fontSize="5" fontFamily="system-ui" opacity="0.4">{ringLabels[i]}</text>
              </g>
            ))}
            <circle cx="0" cy="0" r="2" fill={scene === 2 ? 'var(--illustration-success)' : 'var(--illustration-danger)'} opacity="0.6" />
            <line x1="-58" y1="0" x2="58" y2="0" stroke="var(--illustration-element-muted)" strokeWidth="0.2" />
            <line x1="0" y1="-58" x2="0" y2="58" stroke="var(--illustration-element-muted)" strokeWidth="0.2" />
          </g>
          {scene === 0 && [170,185,320,335,155].map((x, i) => (
            <g key={i} transform={`translate(${x}, ${[85,160,70,155,120][i]}) rotate(${[-20,10,25,-30,0][i]})`}>
              <line x1="0" y1="0" x2="2" y2="-30" stroke="var(--illustration-muted-text)" strokeWidth="1" />
              <circle cx="0" cy="-33" r="2" fill="var(--illustration-danger-light)" opacity="0.9" />
              <text x="4" y="-18" fill="var(--illustration-danger-light)" fontSize="5" fontFamily="system-ui" opacity="0.5">✗</text>
            </g>
          ))}
          {scene === 1 && [220,235,270,280,250].map((x, i) => (
            <g key={i} transform={`translate(${x}, ${[120,155,110,150,105][i]}) rotate(${[-8,-3,5,10,0][i]})`}>
              <line x1="0" y1="0" x2="2" y2="-30" stroke="var(--illustration-muted-text)" strokeWidth="1" />
              <circle cx="0" cy="-33" r="2" fill="var(--illustration-warning)" opacity="0.9" />
            </g>
          ))}
          {scene === 2 && [248,252,246,254,250].map((x, i) => (
            <g key={i} transform={`translate(${x}, ${[138,140,136,142,137][i]}) rotate(${[-2,1,0,3,-1][i]})`}>
              <line x1="0" y1="0" x2="2" y2="-30" stroke="var(--illustration-muted-text)" strokeWidth="1" />
              <circle cx="0" cy="-33" r="2" fill="var(--illustration-success)" opacity="0.9" />
            </g>
          ))}
          <text x="250" y="250" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            {scene === 0 ? 'Darts scattered far from center → high loss value' : scene === 1 ? 'Aim improving — predictions are getting closer to target' : 'All darts hit bullseye — loss is minimized'}
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Security Guard — Perceptron Learning (learning a decision boundary) ──

function SecurityGuardSVG({ scene }: { scene: number }) {
  const guardColor = 'var(--illustration-primary)';
  const guardColor2 = 'var(--illustration-secondary)';
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {(scene === 0 || scene === 1 || scene === 2) && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            {scene === 0 ? 'GUARD DOES NOT KNOW THE STAFF YET' : scene === 1 ? 'GUARD IS LEARNING THE STAFF' : 'GUARD KNOWS EVERYONE — FULLY TRAINED'}
          </text>
          <g transform="translate(250, 180)">
            {(scene === 0 || scene === 1) && (
              <path d="M-60 -40 Q-30 -50 0 -40 Q30 -50 60 -40" fill="none" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" strokeDasharray="3,3" />
            )}
            {scene === 1 && (
              <path d="M-65 -40 L65 -40" stroke="var(--illustration-warning)" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.7">
                <animate attributeName="stroke-dashoffset" from="8" to="0" dur="1s" repeatCount="indefinite" />
              </path>
            )}
            {scene === 2 && (
              <path d="M-65 -40 L65 -40" stroke="var(--illustration-success)" strokeWidth="2" opacity="0.8" />
            )}
            <text x="0" y="-48" textAnchor="middle" fill={scene === 0 ? 'var(--illustration-muted-light)' : scene === 1 ? 'var(--illustration-warning)' : 'var(--illustration-success)'} fontSize="7" fontFamily="system-ui" fontWeight="600">
              {scene === 0 ? 'Decision boundary — not yet learned' : scene === 1 ? 'Learning the boundary...' : 'Clear decision boundary'}
            </text>
            {/** People on left side (staff) */}
            {[
              { dx: -120, label: 'Alice' },
              { dx: -90, label: 'Bob' },
              { dx: -100, label: 'Carol' },
            ].map((p, i) => (
              <g key={i} transform={`translate(${p.dx}, ${[-60, -10, 15][i]})`}>
                <circle cx="0" cy="-10" r="6" fill={scene === 2 ? 'var(--illustration-success)' : 'var(--illustration-surface-mid)'} opacity="0.4" />
                <rect x="-5" y="-4" width="10" height="12" rx="3" fill={scene === 2 ? 'var(--illustration-success)' : 'var(--illustration-surface-mid)'} opacity="0.3" />
                {scene === 2 && <text x="0" y="14" textAnchor="middle" fill="var(--illustration-success)" fontSize="5" fontFamily="system-ui">✓</text>}
              </g>
            ))}
            {/** People on right side (strangers) */}
            {[
              { dx: 90, label: 'X' },
              { dx: 120, label: 'Y' },
              { dx: 100, label: 'Z' },
            ].map((p, i) => (
              <g key={i} transform={`translate(${p.dx}, ${[-60, -10, 15][i]})`}>
                <circle cx="0" cy="-10" r="6" fill={scene === 2 ? 'var(--illustration-danger-light)' : 'var(--illustration-surface-mid)'} opacity="0.4" />
                <rect x="-5" y="-4" width="10" height="12" rx="3" fill={scene === 2 ? 'var(--illustration-danger-light)' : 'var(--illustration-surface-mid)'} opacity="0.3" />
                {scene === 2 && <text x="0" y="14" textAnchor="middle" fill="var(--illustration-danger-light)" fontSize="5" fontFamily="system-ui">✗</text>}
              </g>
            ))}
            {/** Guard figure */}
            <g transform="translate(0, 30)">
              <rect x="-6" y="0" width="12" height="18" rx="4" fill={scene === 2 ? 'var(--illustration-success)' : guardColor} opacity="0.25" />
              <circle cx="0" cy="-6" r="8" fill={scene === 2 ? 'var(--illustration-success)' : guardColor} opacity="0.2" stroke={guardColor2} strokeWidth="0.6" />
              <circle cx="-3" cy="-7" r="2" fill={guardColor2} opacity="0.5" />
              <circle cx="3" cy="-7" r="2" fill={guardColor2} opacity="0.5" />
              {scene === 0 && <text x="0" cy="-18" textAnchor="middle" fill="var(--illustration-warning)" fontSize="12" fontWeight="700" opacity="0.4">?</text>}
            </g>
          </g>
          <text x="250" y="250" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            {scene === 0 ? 'Guard has examples of staff and strangers — needs to learn the pattern' : scene === 1 ? 'Guard is drawing a line between known staff and strangers' : 'Guard correctly separates staff from strangers — perceptron converged'}
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Road Median — SVM Margin (maximum margin separation) ──

function RoadMedianSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 274" className="w-full" style={{ maxHeight: '420px' }}>
      <rect width="500" height="274" fill="var(--illustration-bg-deep)" rx="12" />
      {(scene === 0 || scene === 1 || scene === 2) && (
        <g style={{ animation: 'tof-up 0.5s both' }}>
          <text x="250" y="24" textAnchor="middle" fill="var(--illustration-text-muted-alt)" fontSize="10" fontFamily="system-ui" fontWeight="600" letterSpacing="1">
            {scene === 0 ? 'TWO-LANE ROAD — NO SEPARATOR' : scene === 1 ? 'ADDING A MEDIAN — MARGIN' : 'MAXIMUM MARGIN — ROAD MEDIAN'}
          </text>
          {/* Road surface */}
          <rect x="50" y="100" width="400" height="130" rx="4" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
          {scene === 0 && (
            <>
              {/* Road center dashed line */}
              <line x1="60" y1="165" x2="440" y2="165" stroke="var(--illustration-element-muted)" strokeWidth="1" strokeDasharray="8,6" opacity="0.4" />
              <text x="250" y="170" textAnchor="middle" fill="var(--illustration-element-muted)" fontSize="7" fontFamily="system-ui" opacity="0.5">Dashed line — no real barrier</text>
            </>
          )}
          {scene === 1 && (
            <>
              <rect x="230" y="100" width="8" height="130" rx="1" fill="var(--illustration-warning)" opacity="0.5">
                <animate attributeName="width" from="2" to="8" dur="1.5s" fill="freeze" />
              </rect>
              <text x="250" y="170" textAnchor="middle" fill="var(--illustration-warning)" fontSize="7" fontFamily="system-ui" opacity="0.6">Building median...</text>
            </>
          )}
          {scene === 2 && (
            <>
              <rect x="225" y="100" width="12" height="130" rx="2" fill="var(--illustration-success)" opacity="0.4" />
              <rect x="229" y="100" width="4" height="130" rx="1" fill="var(--illustration-success)" opacity="0.7" />
              <text x="250" y="170" textAnchor="middle" fill="var(--illustration-success)" fontSize="7" fontFamily="system-ui" fontWeight="600">MAX MARGIN (width = 12)</text>
              {/* Margin arrows */}
              <line x1="225" y1="140" x2="185" y2="140" stroke="var(--illustration-success)" strokeWidth="0.5" opacity="0.4" />
              <line x1="237" y1="140" x2="275" y2="140" stroke="var(--illustration-success)" strokeWidth="0.5" opacity="0.4" />
              <text x="205" y="144" textAnchor="middle" fill="var(--illustration-success)" fontSize="5" fontFamily="system-ui" opacity="0.5">← margin</text>
              <text x="256" y="144" textAnchor="middle" fill="var(--illustration-success)" fontSize="5" fontFamily="system-ui" opacity="0.5">margin →</text>
            </>
          )}
          {/* Cars on left lane */}
          {[
            { x: 80, y: 112, color: 'var(--illustration-primary)' },
            { x: 140, y: 150, color: 'var(--illustration-primary)' },
            { x: 160, y: 118, color: 'var(--illustration-secondary)' },
          ].map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width="22" height="10" rx="3" fill={c.color} opacity="0.25" stroke={c.color} strokeWidth="0.5" />
          ))}
          {/* Cars on right lane */}
          {[
            { x: 310, y: 130, color: 'var(--illustration-danger-light)' },
            { x: 380, y: 108, color: 'var(--illustration-danger-light)' },
            { x: 340, y: 155, color: '#fb7185' },
          ].map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width="22" height="10" rx="3" fill={c.color} opacity="0.25" stroke={c.color} strokeWidth="0.5" />
          ))}
          {/* Animated car on scene 2 showing safe separation */}
          {scene === 2 && (
            <rect x="150" y="155" width="22" height="10" rx="3" fill="var(--illustration-success)" opacity="0.4" stroke="var(--illustration-success)" strokeWidth="0.6">
              <animate attributeName="x" from="150" to="300" dur="4s" repeatCount="indefinite" />
            </rect>
          )}
          <text x="250" y="250" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="9" fontFamily="system-ui">
            {scene === 0 ? 'Vehicles pass freely — no clear separation (no decision boundary)' : scene === 1 ? 'A narrow median starts separating the two directions' : 'Wide median ensures maximum safe separation between both sides'}
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Lego Grammar Visual — words, rules, sentences ─────────────────────

const LEGO_COLORS = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'] as const;

function LegoGrammarSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 280" className="w-full" style={{ maxHeight: '430px' }}>
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#080e1a" />
          <stop offset="100%" stopColor="#04080f" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect x="0" y="0" width="500" height="280" fill="url(#bgGrad)" />

      {/* ══════════════════════════════════════════════
         SCENE 0 — Words as Bricks
         ══════════════════════════════════════════════ */}
      {scene === 0 && (
        <>
          {/* Table surface */}
          <rect x="30" y="155" width="440" height="90" rx="6" fill="var(--illustration-surface-mid-deep)" opacity="0.3" />
          <line x1="30" y1="155" x2="470" y2="155" stroke="var(--illustration-surface-alt)" strokeWidth="1" opacity="0.4" />
          <line x1="30" y1="245" x2="470" y2="245" stroke="var(--illustration-surface-alt)" strokeWidth="1" opacity="0.3" />

          {/* Scattered LEGO bricks with word labels */}
          {[
            { x: 70,  y: 168, color: 0, word: 'Dog', pos: 'Noun', rot: -3 },
            { x: 195, y: 168, color: 2, word: 'The', pos: 'Article', rot: 1 },
            { x: 320, y: 168, color: 1, word: 'Runs', pos: 'Verb', rot: -2 },
            { x: 120, y: 220, color: 3, word: 'Fast', pos: 'Adjective', rot: 3 },
            { x: 300, y: 220, color: 4, word: 'Park', pos: 'Noun', rot: -1 },
          ].map((b, i) => (
            <g key={i} transform={`translate(${b.x}, ${b.y}) rotate(${b.rot})`}
              style={{ animation: `tof-float 2.5s ${i * 0.3}s ease-in-out infinite` }}>
              <rect x="-28" y="-16" width="56" height="32" rx="4" fill={LEGO_COLORS[b.color]} opacity="0.85" />
              <rect x="-26" y="-14" width="52" height="28" rx="3" fill={LEGO_COLORS[b.color]} opacity="0.5" />
              {/* Lego studs on top */}
              <circle cx="-14" cy="-16" r="3.5" fill={LEGO_COLORS[b.color]} opacity="0.6" />
              <circle cx="0" cy="-16" r="3.5" fill={LEGO_COLORS[b.color]} opacity="0.6" />
              <circle cx="14" cy="-16" r="3.5" fill={LEGO_COLORS[b.color]} opacity="0.6" />
              <text x="0" y="-3" textAnchor="middle" fill="white" fontSize="9" fontFamily="system-ui" fontWeight="800">{b.word}</text>
              <text x="0" y="8" textAnchor="middle" fill="white" fontSize="6" fontFamily="system-ui" opacity="0.7">({b.pos})</text>
            </g>
          ))}

          {/* Label */}
          <rect x="175" y="50" width="150" height="24" rx="12" fill="var(--illustration-bg-deep)" stroke="var(--illustration-deep)" strokeWidth="1" />
          <text x="250" y="66" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="11" fontFamily="system-ui" fontWeight="700">
            Words → Building Blocks
          </text>

          {/* One-line caption */}
          <text x="250" y="270" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">
            Words are like individual LEGO pieces — each has a purpose, but alone they don't build much.
          </text>
        </>
      )}

      {/* ══════════════════════════════════════════════
         SCENE 1 — Rules Connect Words
         ══════════════════════════════════════════════ */}
      {scene === 1 && (
        <>
          {/* Instruction booklet */}
          <rect x="20" y="30" width="180" height="200" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1.5" />
          <rect x="20" y="30" width="180" height="28" rx="6" fill="var(--illustration-bg-dark)" />
          <text x="110" y="49" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="700">INSTRUCTIONS</text>

          {/* Step 1: The + Dog → Noun Phrase */}
          <text x="35" y="78" fill="var(--illustration-primary)" fontSize="7" fontFamily="system-ui" fontWeight="700">Step 1</text>
          <rect x="35" y="84" width="40" height="20" rx="3" fill={LEGO_COLORS[2]} opacity="0.8" />
          <text x="55" y="97" textAnchor="middle" fill="white" fontSize="7" fontFamily="system-ui" fontWeight="800">The</text>
          <text x="80" y="96" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">+</text>
          <rect x="92" y="84" width="40" height="20" rx="3" fill={LEGO_COLORS[0]} opacity="0.8" />
          <text x="112" y="97" textAnchor="middle" fill="white" fontSize="7" fontFamily="system-ui" fontWeight="800">Dog</text>
          <path d="M 55 108 L 55 118 L 112 118 L 112 108" fill="none" stroke="var(--illustration-primary)" strokeWidth="1.5" markerEnd="url(#arrow1)" />
          <rect x="50" y="120" width="68" height="18" rx="3" fill="var(--illustration-primary)" opacity="0.25" stroke="var(--illustration-primary)" strokeWidth="1" />
          <text x="84" y="132" textAnchor="middle" fill="var(--illustration-primary)" fontSize="7" fontFamily="system-ui" fontWeight="800">Noun Phrase</text>

          {/* Step 2: Runs + Fast → Verb Phrase */}
          <text x="35" y="160" fill="var(--illustration-accent)" fontSize="7" fontFamily="system-ui" fontWeight="700">Step 2</text>
          <rect x="35" y="166" width="40" height="20" rx="3" fill={LEGO_COLORS[1]} opacity="0.8" />
          <text x="55" y="179" textAnchor="middle" fill="white" fontSize="7" fontFamily="system-ui" fontWeight="800">Runs</text>
          <text x="80" y="178" fill="var(--illustration-text-muted)" fontSize="9" fontFamily="system-ui">+</text>
          <rect x="92" y="166" width="40" height="20" rx="3" fill={LEGO_COLORS[3]} opacity="0.8" />
          <text x="112" y="179" textAnchor="middle" fill="white" fontSize="7" fontFamily="system-ui" fontWeight="800">Fast</text>
          <path d="M 55 190 L 55 200 L 112 200 L 112 190" fill="none" stroke="var(--illustration-accent)" strokeWidth="1.5" markerEnd="url(#arrow2)" />
          <rect x="50" y="202" width="68" height="18" rx="3" fill="var(--illustration-accent)" opacity="0.25" stroke="var(--illustration-accent)" strokeWidth="1" />
          <text x="84" y="214" textAnchor="middle" fill="var(--illustration-accent)" fontSize="7" fontFamily="system-ui" fontWeight="800">Verb Phrase</text>

          {/* Right side — grammar rules panel */}
          <rect x="230" y="60" width="240" height="120" rx="8" fill="var(--illustration-bg-dark)" stroke="var(--illustration-deep)" strokeWidth="1" />
          <text x="350" y="85" textAnchor="middle" fill="var(--illustration-primary)" fontSize="10" fontFamily="system-ui" fontWeight="800">Grammar Rules</text>
          <line x1="270" y1="95" x2="430" y2="95" stroke="var(--illustration-deep)" strokeWidth="0.5" />
          <text x="260" y="115" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">Article + Noun</text>
          <text x="260" y="132" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">→ Noun Phrase</text>
          <text x="260" y="150" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">Verb + Adverb</text>
          <text x="260" y="167" fill="var(--illustration-text-muted)" fontSize="8" fontFamily="system-ui">→ Verb Phrase</text>

          {/* Arrow from booklet to rules */}
          <path d="M 200 120 Q 215 120 228 120" fill="none" stroke="var(--illustration-primary)" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow3)"
            style={{ animation: 'tof-signal 2s ease-in-out infinite' }} />

          <defs>
            <marker id="arrow1" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0,0 6,2 0,4" fill="var(--illustration-primary)" /></marker>
            <marker id="arrow2" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0,0 6,2 0,4" fill="var(--illustration-accent)" /></marker>
            <marker id="arrow3" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0,0 6,2 0,4" fill="var(--illustration-primary)" /></marker>
          </defs>

          {/* One-line caption */}
          <text x="250" y="270" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">
            Grammar rules act like LEGO instructions, showing which words can connect to form meaningful phrases.
          </text>
        </>
      )}

      {/* ══════════════════════════════════════════════
         SCENE 2 — Phrases Become Sentence
         ══════════════════════════════════════════════ */}
      {scene === 2 && (
        <>
          {/* LEGO House */}
          {/* Roof */}
          <polygon points="120,70 380,70 340,110 160,110" fill={LEGO_COLORS[0]} opacity="0.8" />
          <polygon points="120,70 380,70 340,110 160,110" fill="none" stroke={LEGO_COLORS[0]} strokeWidth="1.5" />
          {/* Roof label */}
          <text x="250" y="94" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui" fontWeight="800">"The Dog"</text>
          <text x="250" y="106" textAnchor="middle" fill="white" fontSize="6" fontFamily="system-ui" opacity="0.7">Noun Phrase</text>

          {/* Walls */}
          <rect x="160" y="110" width="180" height="80" rx="2" fill={LEGO_COLORS[1]} opacity="0.6" />
          <rect x="160" y="110" width="180" height="80" rx="2" fill="none" stroke={LEGO_COLORS[1]} strokeWidth="1.5" />
          {/* Wall label */}
          <text x="250" y="148" textAnchor="middle" fill="white" fontSize="10" fontFamily="system-ui" fontWeight="800">"Runs Fast"</text>
          <text x="250" y="160" textAnchor="middle" fill="white" fontSize="6" fontFamily="system-ui" opacity="0.7">Verb Phrase</text>

          {/* Foundation */}
          <rect x="150" y="190" width="200" height="16" rx="2" fill={LEGO_COLORS[2]} opacity="0.7" />
          <rect x="150" y="190" width="200" height="16" rx="2" fill="none" stroke={LEGO_COLORS[2]} strokeWidth="1" />

          {/* Door (shifted right to avoid center text) */}
          <rect x="285" y="145" width="30" height="45" rx="3" fill="var(--illustration-bg-dark)" stroke="var(--illustration-deep)" strokeWidth="1" />
          <circle cx="308" cy="168" r="2" fill="var(--illustration-deep)" />

          {/* Windows */}
          <rect x="175" y="125" width="22" height="22" rx="2" fill="var(--illustration-bg-dark)" stroke="var(--illustration-deep)" strokeWidth="1" />
          <line x1="186" y1="125" x2="186" y2="147" stroke="var(--illustration-deep)" strokeWidth="0.5" />
          <line x1="175" y1="136" x2="197" y2="136" stroke="var(--illustration-deep)" strokeWidth="0.5" />
          <rect x="258" y="125" width="22" height="22" rx="2" fill="var(--illustration-bg-dark)" stroke="var(--illustration-deep)" strokeWidth="1" />
          <line x1="269" y1="125" x2="269" y2="147" stroke="var(--illustration-deep)" strokeWidth="0.5" />
          <line x1="258" y1="136" x2="280" y2="136" stroke="var(--illustration-deep)" strokeWidth="0.5" />

          {/* Flag on top */}
          <line x1="250" y1="70" x2="250" y2="45" stroke="var(--illustration-surface-alt)" strokeWidth="2" />
          <polygon points="250,45 290,50 250,55" fill={LEGO_COLORS[3]} />
          <text x="260" y="52" textAnchor="middle" fill="white" fontSize="5" fontFamily="system-ui" fontWeight="800">✓</text>

          {/* Complete sentence at bottom */}
          <rect x="165" y="212" width="170" height="22" rx="4" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1" />
          <text x="250" y="227" textAnchor="middle" fill="var(--illustration-primary)" fontSize="10" fontFamily="system-ui" fontWeight="900">
            The Dog Runs Fast.
          </text>

          {/* Instruction booklet (closed, bottom-right) */}
          <rect x="390" y="220" width="50" height="35" rx="3" fill="var(--illustration-surface)" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
          <text x="415" y="240" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="5" fontFamily="system-ui" opacity="0.6">DONE</text>

          {/* One-line caption */}
          <text x="250" y="270" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">
            Grammar combines phrases into complete sentences, just as LEGO instructions combine pieces into a finished model.
          </text>
        </>
      )}
    </svg>
  );
}

// ── Syntax / Semantics Building Visual — structural analogy ──────────

function SyntaxBuildingSVG({ scene }: { scene: number }) {
  const bx = 55, bw = 390, bh = 190;
  const ground = 245;
  const roof = 55;
  const fh = 95;
  const f1y = roof + fh;
  const pad = 10;

  const colX = [bx + pad, bx + bw / 2, bx + bw - pad];
  const colW = 7;
  const colColor = scene === 0 ? '#c8963a' : scene === 2 ? '#f59e0b' : 'var(--illustration-surface-alt)';

  return (
    <svg viewBox="0 0 500 280" className="w-full" style={{ maxHeight: '430px' }}>
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#080e1a" />
          <stop offset="100%" stopColor="#04080f" />
        </linearGradient>
        <linearGradient id="warmGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b50" />
          <stop offset="100%" stopColor="#d9770630" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="500" height="280" fill="url(#bgGrad)" />

      {/* Ground */}
      <line x1={bx - 10} y1={ground} x2={bx + bw + 10} y2={ground} stroke="var(--illustration-surface-alt)" strokeWidth="2" />
      <rect x={bx - 10} y={ground + 2} width={bw + 20} height="4" rx="2" fill="var(--illustration-bg-deep)" />

      {/* ── Columns (always visible) ── */}
      {colX.map((cx, i) => (
        <rect key={`col-${i}`} x={cx - colW / 2} y={roof} width={colW} height={bh}
          fill={colColor} opacity={scene === 0 ? 0.9 : scene === 2 ? 0.5 : 0.4} rx="1"
          style={{ transition: 'fill 500ms, opacity 500ms' }}
        />
      ))}

      {/* ── Floor slab ── */}
      <rect x={bx + pad} y={f1y - 2} width={bw - pad * 2} height="4" rx="1"
        fill={scene === 0 ? '#c8963a' : 'var(--illustration-surface-alt)'} opacity={scene === 0 ? 0.7 : 0.5}
      />
      {/* Roof slab */}
      <line x1={bx + pad} y1={roof + 3} x2={bx + bw - pad} y2={roof + 3}
        stroke={scene === 0 ? '#c8963a' : 'var(--illustration-surface-alt)'} strokeWidth="3" opacity={scene === 0 ? 0.7 : 0.5} />

      {/* ══════════════════════════════════════════════
         SCENE 0 — Framework / Steel Skeleton
         ══════════════════════════════════════════════ */}
      {scene === 0 && (
        <>
          {/* Cross-bracing — bold X patterns */}
          {[
            [colX[0] + colW / 2, roof + 5, colX[1] - colW / 2, f1y - 5],
            [colX[1] - colW / 2, roof + 5, colX[0] + colW / 2, f1y - 5],
            [colX[1] + colW / 2, roof + 5, colX[2] - colW / 2, f1y - 5],
            [colX[2] - colW / 2, roof + 5, colX[1] + colW / 2, f1y - 5],
            [colX[0] + colW / 2, f1y + 5, colX[1] - colW / 2, ground - 5],
            [colX[1] - colW / 2, f1y + 5, colX[0] + colW / 2, ground - 5],
            [colX[1] + colW / 2, f1y + 5, colX[2] - colW / 2, ground - 5],
            [colX[2] - colW / 2, f1y + 5, colX[1] + colW / 2, ground - 5],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={`xb-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#c8963a" strokeWidth="2.5" strokeDasharray="8,6" opacity="0.7" />
          ))}

          {/* Horizontal beams */}
          <line x1={colX[0] + colW / 2} y1={roof + 8} x2={colX[2] - colW / 2} y2={roof + 8}
            stroke="#c8963a" strokeWidth="5" opacity="0.6" />
          <line x1={colX[0] + colW / 2} y1={f1y + 5} x2={colX[2] - colW / 2} y2={f1y + 5}
            stroke="#c8963a" strokeWidth="5" opacity="0.6" />
          <line x1={colX[0] + colW / 2} y1={ground - 5} x2={colX[2] - colW / 2} y2={ground - 5}
            stroke="#c8963a" strokeWidth="5" opacity="0.6" />

          {/* Crane */}
          <rect x={bx + bw / 2 - 14} y={roof - 55} width="28" height="55" rx="3"
            fill="#2a2a3e" stroke="#c8963a" strokeWidth="1.5" />
          <polygon points={`${bx + bw / 2},${roof - 55} ${bx + bw / 2 + 70},${roof - 80} ${bx + bw / 2 + 70},${roof - 55}`}
            fill="none" stroke="#c8963a" strokeWidth="2" />
          <line x1={bx + bw / 2 + 70} y1={roof - 68} x2={bx + bw / 2 + 70} y2={roof - 55}
            stroke="#c8963a" strokeWidth="1.5" />
          <circle cx={bx + bw / 2 + 70} cy={roof - 78} r="4" fill="#f59e0b" filter="url(#glow)" />
          {/* Crane cable */}
          <line x1={bx + bw / 2 + 40} y1={roof - 55} x2={bx + bw / 2 + 40} y2={roof - 30}
            stroke="#c8963a" strokeWidth="1" strokeDasharray="3,2" />
          <rect x={bx + bw / 2 + 30} y={roof - 30} width="20" height="8" rx="2" fill="#c8963a" opacity="0.8" />

          {/* Hard hat worker silhouettes */}
          <g transform="translate(120, 225)">
            <circle cx="0" cy="-8" r="6" fill="#4a4a6e" />
            <path d="M-5,-6 Q0,-12 5,-6" fill="#c8963a" opacity="0.8" />
            <rect x="-4" y="-2" width="8" height="16" rx="3" fill="#4a4a6e" />
          </g>
          <g transform="translate(340, 130)">
            <circle cx="0" cy="-8" r="6" fill="#4a4a6e" />
            <path d="M-5,-6 Q0,-12 5,-6" fill="#c8963a" opacity="0.8" />
            <rect x="-4" y="-2" width="8" height="16" rx="3" fill="#4a4a6e" />
          </g>

          {/* Banner */}
          <rect x={bx + 20} y={roof + 22} width={bw - 40} height="28" rx="4" fill="#c8963a" opacity="0.15" />
          <rect x={bx + 20} y={roof + 22} width={bw - 40} height="28" rx="4" fill="none" stroke="#c8963a" strokeWidth="1" opacity="0.4" />
          <text x={bx + bw / 2} y={roof + 41} textAnchor="middle" fill="#f59e0b"
            fontSize="13" fontFamily="system-ui" fontWeight="900" letterSpacing="3">
            UNDER CONSTRUCTION
          </text>
        </>
      )}

      {/* ══════════════════════════════════════════════
         SCENE 1 — Walls Up, Empty
         ══════════════════════════════════════════════ */}
      {scene === 1 && (
        <>
          {/* Wall fill (semi-transparent) */}
          <rect x={bx + pad + 2} y={roof + 6} width={bw - pad * 2 - 4} height={bh - 12}
            fill="var(--illustration-bg-surface-deeper)" rx="2" />
          <rect x={bx + pad + 2} y={roof + 6} width={bw - pad * 2 - 4} height={fh - 8}
            fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />
          <rect x={bx + pad + 2} y={f1y + 4} width={bw - pad * 2 - 4} height={fh - 10}
            fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" />

          {/* Windows — dark, empty */}
          {[85, 175, 290, 380].map((wx, i) => (
            <g key={`win-${i}`}>
              <rect x={wx} y={i < 2 ? roof + 22 : f1y + 22} width="36" height="48" rx="3"
                fill="#0a0f1a" stroke="var(--illustration-deep)" strokeWidth="1.5" />
              <line x1={wx + 18} y1={i < 2 ? roof + 22 : f1y + 22} x2={wx + 18} y2={(i < 2 ? roof : f1y) + 70}
                stroke="var(--illustration-deep)" strokeWidth="0.8" />
              <line x1={wx} y1={(i < 2 ? roof : f1y) + 46} x2={wx + 36} y2={(i < 2 ? roof : f1y) + 46}
                stroke="var(--illustration-deep)" strokeWidth="0.8" />
            </g>
          ))}

          {/* Door */}
          <rect x={bx + bw / 2 - 14} y={ground - 45} width="28" height="45" rx="2"
            fill="#0a0f1a" stroke="var(--illustration-deep)" strokeWidth="1.5" />

          {/* "VACANT" text */}
          <rect x={bx + 60} y={roof + 38} width={bw - 120} height="30" rx="4"
            fill="var(--illustration-deep)" opacity="0.3" />
          <text x={bx + bw / 2} y={roof + 58} textAnchor="middle" fill="var(--illustration-text-muted)"
            fontSize="14" fontFamily="system-ui" fontWeight="800" letterSpacing="4" opacity="0.6">
            VACANT
          </text>
        </>
      )}

      {/* ══════════════════════════════════════════════
         SCENE 2 — Furnished & Alive
         ══════════════════════════════════════════════ */}
      {scene === 2 && (
        <>
          {/* Warm glow */}
          <rect x={bx + pad + 2} y={roof + 6} width={bw - pad * 2 - 4} height={bh - 12}
            fill="url(#warmGlow)" rx="2" />

          {/* ── Floor 2 ── */}
          {/* Desk 1 */}
          <rect x={colX[0] + 15} y={f1y - 38} width="55" height="14" rx="2" fill="#2d2d45" />
          <rect x={colX[0] + 20} y={f1y - 43} width="45" height="6" rx="1.5" fill="#40406a" />
          <rect x={colX[0] + 24} y={f1y - 45} width="36" height="3" rx="1" fill="#5a5a8a" opacity="0.6" />
          {/* Person 1 */}
          <circle cx={colX[0] + 40} cy={f1y - 18} r="10" fill="#5a5a7a" opacity="0.85" />
          <rect x={colX[0] + 34} y={f1y - 8} width="12" height="4" rx="2" fill="#5a5a7a" opacity="0.85" />

          {/* Desk 2 */}
          <rect x={colX[1] + 15} y={f1y - 38} width="55" height="14" rx="2" fill="#2d2d45" />
          <rect x={colX[1] + 20} y={f1y - 43} width="45" height="6" rx="1.5" fill="#40406a" />
          <rect x={colX[1] + 24} y={f1y - 45} width="36" height="3" rx="1" fill="#5a5a8a" opacity="0.6" />
          {/* Person 2 */}
          <circle cx={colX[1] + 40} cy={f1y - 18} r="10" fill="#5a5a7a" opacity="0.85" />
          <rect x={colX[1] + 34} y={f1y - 8} width="12" height="4" rx="2" fill="#5a5a7a" opacity="0.85" />

          {/* Desk 3 (right side) */}
          <rect x={colX[2] - 70} y={f1y - 38} width="55" height="14" rx="2" fill="#2d2d45" />
          <rect x={colX[2] - 65} y={f1y - 43} width="45" height="6" rx="1.5" fill="#40406a" />
          {/* Person 3 */}
          <circle cx={colX[2] - 45} cy={f1y - 18} r="10" fill="#5a5a7a" opacity="0.85" />

          {/* ── Floor 1 ── */}
          {/* Desk 4 */}
          <rect x={colX[0] + 15} y={ground - 38} width="55" height="14" rx="2" fill="#2d2d45" />
          <rect x={colX[0] + 20} y={ground - 43} width="45" height="6" rx="1.5" fill="#40406a" />
          {/* Person 4 */}
          <circle cx={colX[0] + 40} cy={ground - 18} r="10" fill="#5a5a7a" opacity="0.85" />

          {/* Desk 5 */}
          <rect x={colX[1] + 15} y={ground - 38} width="55" height="14" rx="2" fill="#2d2d45" />
          <rect x={colX[1] + 20} y={ground - 43} width="45" height="6" rx="1.5" fill="#40406a" />
          {/* Person 5 */}
          <circle cx={colX[1] + 40} cy={ground - 18} r="10" fill="#5a5a7a" opacity="0.85" />

          {/* Meeting table (large, center floor 1) */}
          <rect x={colX[2] - 50} y={ground - 45} width="70" height="26" rx="4" fill="#2d2d45" stroke="#40406a" strokeWidth="1" />
          <circle cx={colX[2] - 30} cy={ground - 56} r="7" fill="#5a5a7a" opacity="0.85" />
          <circle cx={colX[2] + 10} cy={ground - 56} r="7" fill="#5a5a7a" opacity="0.85" />
          <circle cx={colX[2] - 30} cy={ground - 8} r="7" fill="#5a5a7a" opacity="0.85" />
          <circle cx={colX[2] + 10} cy={ground - 8} r="7" fill="#5a5a7a" opacity="0.85" />

          {/* Activity indicator dots */}
          {[
            { x: colX[0] + 10, y: f1y - 28 }, { x: colX[1] + 10, y: f1y - 28 },
            { x: colX[0] + 10, y: ground - 28 }, { x: colX[1] + 10, y: ground - 28 },
            { x: colX[2] - 60, y: ground - 32 },
          ].map((p, i) => (
            <circle key={`act-${i}`} cx={p.x} cy={p.y} r="4" fill="#22c55e"
              style={{ animation: `tof-pulse ${1.2 + i * 0.2}s ease-in-out infinite` }} />
          ))}

          {/* Light fixture icons on ceiling */}
          {[colX[0] + 40, colX[1] + 40, colX[2] - 25].map((lx, i) => (
            <g key={`light-${i}`}>
              <rect x={lx - 12} y={roof + 8} width="24" height="5" rx="2" fill="#f59e0b" opacity="0.4" />
              <polygon points={`${lx - 8},${roof + 13} ${lx + 8},${roof + 13} ${lx},${roof + 24}`} fill="#f59e0b" opacity="0.15" />
            </g>
          ))}
        </>
      )}

      {/* Scene label */}
      <text x="250" y="275" textAnchor="middle" fill="var(--illustration-text-muted)" fontSize="7" fontFamily="system-ui">
        {['Steel beams define the skeleton — the rules of syntax.',
          'Walls enclose empty rooms — correct form, no meaning yet.',
          'Furnished & alive — semantics gives purpose to the structure.'][scene]}
      </text>
    </svg>
  );
}

// ── Visual switcher — picks the right SVG based on the analogy title ──────────

// ── AI Learns from Examples — Split-panel comparison ═══════════════════

export function AILearningSVG({ scene }: { scene: number }) {
  return (
    <svg viewBox="0 0 500 280" className="w-full" style={{ maxHeight: '380px' }}>
      {/* ── Divider ── */}
      <line x1="250" y1="20" x2="250" y2="255" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="3,3" />

      {/* ── Left panel: Traditional Program — always visible ── */}
      <g>
        {/* Outer border frame */}
        <rect x="10" y="34" width="228" height="228" rx="6" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" opacity="0.25" />

        <text x="125" y="26" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="700">TRADITIONAL PROGRAM</text>

        {/* Flowchart: Input → Condition → Output */}
        <rect x="65" y="44" width="120" height="28" rx="4" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <text x="125" y="62" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="system-ui" fontWeight="600">Input: x = 1</text>

        <path d="M 125 72 L 125 82" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <polygon points="121,82 129,82 125,88" fill="var(--text-secondary)" />

        {/* Decision diamond */}
        <path d="M 125 88 L 165 108 L 125 128 L 85 108 Z" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <text x="125" y="107" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui" fontWeight="600">x == 1?</text>

        {/* Yes branch */}
        <path d="M 165 108 L 195 108" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <polygon points="195,104 195,112 201,108" fill="var(--text-secondary)" />
        <text x="180" y="102" textAnchor="middle" fill="var(--text-muted)" fontSize="5" fontFamily="system-ui">Yes</text>

        <rect x="201" y="96" width="50" height="24" rx="3" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <text x="226" y="104" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui">y = 2</text>
        <text x="226" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="5" fontFamily="system-ui">(fixed)</text>

        {/* No branch */}
        <path d="M 85 108 L 45 108" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <polygon points="45,104 45,112 39,108" fill="var(--text-secondary)" />
        <text x="65" y="102" textAnchor="middle" fill="var(--text-muted)" fontSize="5" fontFamily="system-ui">No</text>

        <rect x="7" y="96" width="32" height="24" rx="3" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <text x="23" y="104" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui">y = 0</text>
        <text x="23" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="5" fontFamily="system-ui">(fixed)</text>

        {/* Rule table at bottom */}
        <rect x="35" y="150" width="180" height="50" rx="4" fill="var(--bg-surface)" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <text x="125" y="165" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontWeight="600">Lookup Table (hardcoded)</text>
        <line x1="55" y1="169" x2="195" y2="169" stroke="var(--text-muted)" strokeWidth="0.8" />
        <text x="80" y="182" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui">Input</text>
        <text x="180" y="182" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui">Output</text>
        <line x1="125" y1="172" x2="125" y2="196" stroke="var(--text-muted)" strokeWidth="0.8" />
        <text x="80" y="194" textAnchor="middle" fill="var(--text-muted)" fontSize="5" fontFamily="system-ui">x=0 → y=0</text>
        <text x="180" y="194" textAnchor="middle" fill="var(--text-muted)" fontSize="5" fontFamily="system-ui">x=1 → y=2</text>

        <text x="125" y="255" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui" fontStyle="italic">Cannot handle x=2 (no rule)</text>
      </g>

      {/* ── Right panel: AI ── */}
      <g style={{ opacity: scene >= 1 ? 1 : 0.15, transition: 'opacity 700ms' }}>
        <text x="370" y="26" textAnchor="middle" fill={scene >= 1 ? 'var(--color-primary)' : 'var(--text-muted)'} fontSize="8" fontFamily="system-ui" fontWeight="700">AI SYSTEM</text>

        {scene === 1 && (
          <g style={{ animation: 'tof-up 0.5s both' }}>
            {[[310, 50], [350, 40], [390, 55], [330, 75], [370, 70], [410, 45]].map((p, i) => (
              <rect key={i} x={p[0]} y={p[1]} width="12" height="8" rx="2" fill="var(--color-primary)" opacity="0.35"
                style={{ animation: `tof-pop 0.3s ${i * 0.08}s both` }} />
            ))}
            <text x="370" y="108" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="600"
              style={{ animation: 'tof-up 0.4s 0.3s both' }}>Thousands of examples</text>
            <path d="M 365 116 L 370 126 L 375 116" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.35">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="1.5s" repeatCount="indefinite" />
            </path>
            <rect x="320" y="135" width="100" height="24" rx="5" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="0.8" opacity="0.6"
              style={{ animation: 'tof-pop 0.4s 0.6s both' }} />
            <text x="370" y="151" textAnchor="middle" fill="var(--color-primary)" fontSize="7" fontFamily="system-ui" fontWeight="700">Learns Patterns</text>
            <text x="370" y="230" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="600"
              style={{ animation: 'tof-pop 0.4s 0.9s both' }}>Handles new inputs ✓</text>
          </g>
        )}

        {scene === 2 && (
          <g style={{ animation: 'tof-up 0.5s both' }}>
            <rect x="285" y="50" width="36" height="36" rx="4" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="0.8" opacity="0.7" />
            <path d="M 297 66 L 309 66 M 303 60 L 303 72" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <text x="303" y="96" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui" fontWeight="600">Input</text>

            <line x1="321" y1="68" x2="344" y2="68" stroke="var(--border-light)" strokeWidth="0.8">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="1s" repeatCount="indefinite" />
            </line>

            <rect x="348" y="50" width="36" height="36" rx="4" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="0.8" opacity="0.7" />
            <path d="M 360 58 Q 368 54 376 58 Q 380 64 368 76 Q 356 64 360 58Z" fill="var(--color-primary)" opacity="0.25" />
            <path d="M 364 64 L 372 64 M 364 68 L 370 68" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <text x="366" y="96" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui" fontWeight="600">Learn</text>

            <line x1="384" y1="68" x2="407" y2="68" stroke="var(--border-light)" strokeWidth="0.8">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="1s" begin="0.3s" repeatCount="indefinite" />
            </line>

            <rect x="412" y="50" width="36" height="36" rx="4" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="0.8" opacity="0.7" />
            <path d="M 424 66 L 430 72 L 440 62" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            <text x="430" y="96" textAnchor="middle" fill="var(--text-secondary)" fontSize="6" fontFamily="system-ui" fontWeight="600">Output</text>

            <text x="370" y="130" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="600">Learns from examples</text>
            <rect x="310" y="155" width="120" height="22" rx="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.5"
              style={{ animation: 'tof-pop 0.5s 0.5s both' }} />
            <text x="370" y="170" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontFamily="system-ui" fontWeight="700">Improves with more data</text>
          </g>
        )}
      </g>
    </svg>
  );
}

// ── AI ⊃ ML ⊃ DL — Nested matryoshka boxes ═══════════════════════════

export function AISubsetsSVG({ scene }: { scene: number }) {
  const CX = 250, CY = 145;
  const layers = [
    { label: 'Artificial Intelligence', sub: 'Search · Rules · Logic · Systems', w: 340, h: 180, color: 'var(--text-main)' },
    { label: 'Machine Learning', sub: 'Learns patterns from data', w: 240, h: 110, color: 'var(--color-primary)' },
    { label: 'Deep Learning', sub: 'Multi-layer neural networks', w: 140, h: 60, color: 'var(--text-secondary)' },
  ];

  const highlightIdx = scene === 0 ? -1 : scene === 1 ? 0 : scene === 2 ? 1 : scene === 3 ? 2 : -1;

  return (
    <svg viewBox="0 0 500 290" className="w-full" style={{ maxHeight: '380px' }}>
      {layers.map((l, i) => {
        const isHighlighted = i === highlightIdx;
        const dimOpacity = highlightIdx >= 0 && !isHighlighted ? 0.25 : 0.45;
        return (
          <g key={i} style={{ transition: 'all 500ms' }}>
            <rect x={CX - l.w / 2} y={CY - l.h / 2} width={l.w} height={l.h} rx="10"
              fill={isHighlighted ? 'var(--bg-surface)' : 'var(--bg-surface)'}
              stroke={isHighlighted ? l.color : 'var(--border-light)'}
              strokeWidth={isHighlighted ? 2 : 0.8}
              style={{ transition: 'all 500ms' }}
              opacity={isHighlighted || highlightIdx < 0 ? 0.9 : dimOpacity} />
            <text x={CX} y={CY - 6} textAnchor="middle" fill={highlightIdx === i || highlightIdx < 0 ? l.color : 'var(--text-muted)'}
              fontSize={i === 0 ? 13 : i === 1 ? 11 : 10} fontFamily="system-ui" fontWeight="700"
              opacity={isHighlighted || highlightIdx < 0 ? 1 : 0.35}
              style={{ transition: 'all 500ms' }}>{l.label}</text>
            <text x={CX} y={CY + 12} textAnchor="middle" fill="var(--text-muted)"
              fontSize={i === 0 ? 8 : 7} fontFamily="system-ui"
              opacity={isHighlighted || highlightIdx < 0 ? 0.65 : 0.15}
              style={{ transition: 'all 500ms' }}>{l.sub}</text>
          </g>
        );
      })}

      {scene === 4 && (
        <g style={{ animation: 'tof-up 0.4s both' }}>
          <rect x="50" y="248" width="88" height="32" rx="4" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="0.5" />
          <text x="94" y="262" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="600">Narrow AI</text>
          <text x="94" y="274" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">(One task)</text>

          <rect x="362" y="248" width="88" height="32" rx="4" fill="var(--bg-surface)" stroke="var(--border-light)" strokeWidth="0.5" />
          <text x="406" y="262" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" fontWeight="600">General AI</text>
          <text x="406" y="274" textAnchor="middle" fill="var(--text-muted)" fontSize="6" fontFamily="system-ui">(Doesn't exist)</text>
        </g>
      )}

      <text x="250" y="22" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" opacity="0.5">
        {scene === 0 ? 'AI ⊃ ML ⊃ DL' :
         scene === 1 ? 'AI: the broadest field' :
         scene === 2 ? 'ML learns from data' :
         scene === 3 ? 'DL: neural networks' :
         'Narrow AI vs General AI'}
      </text>
    </svg>
  );
}

// ── AI in Your Daily Life — Horizontal timeline ═══════════════════════

export function AIEverydaySVG({ scene }: { scene: number }) {
  const apps = [
    { time: '07:00', label: 'Face Unlock', note: 'Recognizes your face', color: 'var(--text-main)' },
    { time: '08:30', label: 'Google Maps', note: 'Finds fastest route', color: 'var(--color-primary)' },
    { time: '09:15', label: 'Spam Filter', note: 'Blocks junk mail', color: 'var(--text-secondary)' },
    { time: '20:00', label: 'Netflix', note: 'Recommends shows', color: 'var(--text-muted)' },
    { time: '22:30', label: 'ChatGPT', note: 'Generates responses', color: 'var(--text-main)' },
  ];

  const dotX = [60, 170, 280, 390, 460];

  return (
    <svg viewBox="0 0 500 270" className="w-full" style={{ maxHeight: '360px' }}>
      <text x="250" y="24" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontWeight="600" opacity="0.5">
        YOUR DAY WITH AI
      </text>

      {/* ── Timeline bar ── */}
      <line x1="60" y1="100" x2="460" y2="100" stroke="var(--border-light)" strokeWidth="2" />

      {/* Scene 0: All dots visible */}
      {scene === 0 && dotX.map((x, i) => {
        const icons = [
          <path key="f" d="M-6-6h12v12h-12z M-3-8v-2h6v2 M-8-2h16 M-2-8v4 M2-8v4" stroke={apps[i].color} strokeWidth="1.2" fill="none" strokeLinecap="round" />,
          <path key="m" d="M0-7 l6 7 h-4 v6 h-4 v-6 h-4Z" fill={apps[i].color} opacity="0.6" />,
          <path key="s" d="M-7-5 h14 v10 h-14Z M-7-5 l7 5 l7-5" fill="none" stroke={apps[i].color} strokeWidth="1.2" strokeLinejoin="round" />,
          <path key="n" d="M-6-4 h12 v8 h-12Z M-6-4 l6 4 l6-4 M-2-4 v2 M2-4 v2" fill="none" stroke={apps[i].color} strokeWidth="1.2" strokeLinecap="round" />,
          <path key="c" d="M-7-2 a7 7 0 1 1 14 0 v2 a3 3 0 0 1-3 3 h-8 a3 3 0 0 1-3-3Z" fill="none" stroke={apps[i].color} strokeWidth="1.2" />,
        ];
        return (
          <g key={i}>
            <circle cx={x} cy="100" r="14" fill="var(--bg-surface)" stroke={apps[i].color} strokeWidth="1.5" opacity="0.6" />
            <g transform={`translate(${x}, 100)`} opacity="0.8">{icons[i]}</g>
            <text x={x} y="128" textAnchor="middle" fill={apps[i].color} fontSize="8" fontFamily="system-ui" fontWeight="600">{apps[i].label}</text>
            <text x={x} y="85" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="system-ui" opacity="0.5">{apps[i].time}</text>
          </g>
        );
      })}

      {/* ── Scene 1-5: Highlight each app ── */}
      {[1, 2, 3, 4, 5].map(s => {
        if (scene !== s) return null;
        const i = s - 1;
        const x = dotX[i];
        return (
          <g key={s} style={{ animation: 'tof-up 0.4s both' }}>
            {/* Glow ring */}
            <circle cx={x} cy="100" r="22" fill="none" stroke={apps[i].color} strokeWidth="0.5" opacity="0.5"
              style={{ animation: 'tof-pulse-ring 2s ease-out infinite' }} />

            {/* Main dot */}
            <circle cx={x} cy="100" r="18" fill="var(--bg-surface)" stroke={apps[i].color} strokeWidth="2"
              style={{ filter: `drop-shadow(0 0 6px ${apps[i].color})` }} />
            <g transform={`translate(${x}, 100)`}>
              {[
                <path key="f" d="M-8-8h16v16h-16z M-4-11v-3h8v3 M-11-3h22 M-3-11v6 M3-11v6" stroke={apps[i].color} strokeWidth="1.5" fill="none" strokeLinecap="round" />,
                <path key="m" d="M0-9 l8 10 h-6 v8 h-4 v-8 h-6Z" fill={apps[i].color} opacity="0.7" />,
                <path key="s" d="M-9-7 h18 v14 h-18Z M-9-7 l9 7 l9-7" fill="none" stroke={apps[i].color} strokeWidth="1.5" strokeLinejoin="round" />,
                <path key="n" d="M-8-6 h16 v12 h-16Z M-8-6 l8 6 l8-6 M-3-6 v4 M3-6 v4" fill="none" stroke={apps[i].color} strokeWidth="1.5" strokeLinecap="round" />,
                <path key="c" d="M-9-3 a9 9 0 1 1 18 0 v3 a4 4 0 0 1-4 4 h-10 a4 4 0 0 1-4-4Z" fill="none" stroke={apps[i].color} strokeWidth="1.5" />,
              ][i]}
            </g>

            {/* Time */}
            <text x={x} y="72" textAnchor="middle" fill={apps[i].color} fontSize="8" fontFamily="system-ui" fontWeight="700">{apps[i].time}</text>

            {/* Card below */}
            <rect x={x - 70} y="150" width="140" height="56" rx="8" fill="var(--bg-surface)" stroke={apps[i].color} strokeWidth="1" opacity="0.85" />
            <text x={x} y="172" textAnchor="middle" fill={apps[i].color} fontSize="11" fontFamily="system-ui" fontWeight="700">{apps[i].label}</text>
            <text x={x} y="191" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui">{apps[i].note}</text>

            {/* Dim other dots */}
            {dotX.map((dx, j) => {
              if (j === i) return null;
              const dimIcons = [
                <path key="f" d="M-5-5h10v10h-10z M-2-9v-2h4v2 M-9-1h18 M-2-9v4 M2-9v4" stroke={apps[j].color} strokeWidth="1" fill="none" strokeLinecap="round" />,
                <path key="m" d="M0-6 l5 6 h-4 v5 h-2 v-5 h-4Z" fill={apps[j].color} opacity="0.2" />,
                <path key="s" d="M-6-5 h12 v10 h-12Z M-6-5 l6 5 l6-5" fill="none" stroke={apps[j].color} strokeWidth="1" strokeLinejoin="round" />,
                <path key="n" d="M-5-4 h10 v8 h-10Z M-5-4 l5 4 l5-4 M-2-4 v2 M2-4 v2" fill="none" stroke={apps[j].color} strokeWidth="1" strokeLinecap="round" />,
                <path key="c" d="M-6-2 a6 6 0 1 1 12 0 v2 a3 3 0 0 1-3 3 h-6 a3 3 0 0 1-3-3Z" fill="none" stroke={apps[j].color} strokeWidth="1" />,
              ];
              return (
                <g key={j}>
                  <circle cx={dx} cy="100" r="12" fill="var(--bg-surface)" opacity="0.15" />
                  <g transform={`translate(${dx}, 100)`} opacity="0.2">{dimIcons[j]}</g>
                </g>
              );
            })}

            {/* Bottom description */}
            <text x="250" y="240" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="system-ui" fontStyle="italic" opacity="0.6">
              {['Your phone learns your face geometry from thousands of examples',
                'Maps explores millions of paths, picks the fastest',
                'A model trained on millions of labeled emails',
                'Collaborative filtering: people like you → shows you like',
                'Generates text word-by-word from billions of sentences'][i]}
            </text>
          </g>
        );
      })}

      {/* Clock icon on left end */}
      <circle cx="30" cy="100" r="8" fill="none" stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="100" x2="30" y2="96" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <line x1="30" y1="100" x2="34" y2="100" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}


// ── Dispatch: map title to SVG ──────────────────────────────────────────────

function ThinkOfVisual({ scene, title }: { scene: number; title: string }) {
  const t = title.toLowerCase();

  // Lego Grammar — words, rules, sentences
  if (t.includes('lego') || t.includes('building instructions'))
    return <LegoGrammarSVG scene={scene} />;

  // Syntax / Semantics — building analogy
  if (t.includes('syntax') || t.includes('semantics') || t.includes('framework'))
    return <SyntaxBuildingSVG scene={scene} />;

  // Building / floor search (BFS / DFS building analogy)
  if (t.includes('floor') || t.includes('friend') || t.includes('10th') || t.includes('searching'))
    return <BuildingSearchSVG scene={scene} />;

  // Search / BFS / DFS
  if (t.includes('bfs') || t.includes('dfs') || t.includes('breadth') || t.includes('depth') ||
      t.includes('ripples') || t.includes('search tree') || t.includes('explore') || t.includes('frontier'))
    return <SearchTreeSVG scene={scene} />;

  // Traffic Decision — makes logical decisions (Lecture 3, must check before 'traffic signal')
  if (t.includes('makes logical decisions'))
    return <TrafficDecisionSVG scene={scene} />;

  // Traffic Signal — logic rules for intersection control
  if (t.includes('traffic signal'))
    return <TrafficSignalSVG scene={scene} />;

  // Doctor Knowledge Base — diagnosing a patient (Lecture 3)
  if (t.includes('doctor'))
    return <DoctorKnowledgeBaseSVG scene={scene} />;

  // Dice Roll — random variables (must check before 'weather' since 'rolling dice' could match)
  if (t.includes('dice') || t.includes('rolling') || t.includes('die'))
    return <DiceRollSVG scene={scene} />;

  // Weather Forecast — probability basics
  if (t.includes('weather') || (t.includes('probability') && !t.includes('bayesian')))
    return <WeatherForecastSVG scene={scene} />;

  // Bayes Theorem — belief updates
  if (t.includes('bayes theorem') || t.includes('bayes updates') || (t.includes('bayes') && !t.includes('bayesian')))
    return <BayesUpdateSVG scene={scene} />;

  // Bayesian Networks — causal graph
  if (t.includes('bayesian network') || t.includes('bayesian networks') || t.includes('connect causes'))
    return <BayesianNetworkSVG scene={scene} />;

  // Hidden Markov Models — hidden states & observations (Lecture 3.5)
  if (t.includes('hidden') || t.includes('two layers') || (t.includes('inference') && t.includes('observ')))
    return <HiddenStateObservationSVG scene={scene} />;

  // Fallback: probability / uncertainty
  if (t.includes('uncertain') || t.includes('belief') || t.includes('probability'))
    return <ProbabilityMeterSVG scene={scene} />;

  // Detective Solving a Mystery (Lecture 3, must check before 'detective')
  if (t.includes('detective solving'))
    return <DetectiveReasoningSVG scene={scene} />;

  // Logic / Inference
  if (t.includes('logic') || t.includes('inference') || t.includes('propositional') ||
      t.includes('detective') || t.includes('clue') || t.includes('rule') || t.includes('checklist'))
    return <LogicGateSVG scene={scene} />;

  // Lecture 5: Optimization Finds the Best GPS Route
  if (t.includes('finds the best gps route'))
    return <GPSRouteOptimizationSVG scene={scene} />;

  // Lecture 5: Simulated Annealing Escapes Like GPS Rerouting
  if (t.includes('simulated annealing'))
    return <SimulatedAnnealingSVG scene={scene} />;

  // Lecture 5: Constraints Filter Choices Like Airport Security (CSP)
  if (t.includes('constraints filter'))
    return <CSPConstraintsSVG scene={scene} />;

  // Optimization / landscape
  if (t.includes('optimiz') || t.includes('hill') || t.includes('gradient') ||
      t.includes('anneal') || t.includes('valley') || t.includes('peak') || t.includes('landscape') || t.includes('rerouting'))
    return <OptimizationSVG scene={scene} />;

  // Lecture 6: Neural Networks Learn Through Layers of Activation
  if (t.includes('layers of activation'))
    return <NeuralLayerSVG scene={scene} />;

  // Lecture 6: Activation Functions Make Inference Decisions at Each Neuron
  if (t.includes('activation functions'))
    return <ActivationGateSVG scene={scene} />;

  // Lecture 6: Backpropagation Corrects Weights Like Retraining a Dog
  if (t.includes('backpropagation corrects'))
    return <BackpropagationSVG scene={scene} />;

  // Lecture 6: CNNs Scan Images Like Airport X-Ray Analysis
  if (t.includes('cnns scan'))
    return <CNNScanSVG scene={scene} />;

  // Neural networks / backprop / CNN
  if (t.includes('neural') || t.includes('neuron') || t.includes('activation') ||
      t.includes('backprop') || t.includes('layer') || t.includes('cnn') || t.includes('retraining'))
    return <NeuralNetSVG scene={scene} />;

  // Lecture 7: Text Processing Scans Language Like an Airport Scanner
  if (t.includes('text processing scans'))
    return <TextProcessingSVG scene={scene} />;

  // Lecture 7: Word Embeddings Map Meaning Like GPS Coordinates
  if (t.includes('map meaning'))
    return <WordMeaningEmbedSVG scene={scene} />;

  // Lecture 7: Language Models Navigate Text Like GPS Navigates Roads
  if (t.includes('navigate text'))
    return <LanguageModelNavSVG scene={scene} />;

  // Lecture 7: Attention Routes Understanding Like GPS Routes Traffic
  if (t.includes('attention routes'))
    return <AttentionRouteSVG scene={scene} />;

  // Word embeddings / NLP / language
  if (t.includes('word') || t.includes('embed') || t.includes('coordinate') ||
      t.includes('attention') || t.includes('transformer') || t.includes('language model') ||
      t.includes('gps logic') || t.includes('route traffic'))
    return <WordVectorSVG scene={scene} />;

  // AI vs ML vs DL / nested / Russian dolls
  if (t.includes('nested') || t.includes('ai contains') || t.includes('vs ml') ||
      t.includes('vs dl') || t.includes('subset') || t.includes('doll'))
    return <NestedCirclesSVG scene={scene} />;

  // Lecture 9: Project Design is Like Training a New Dog
  if (t.includes('project design'))
    return <ProjectDesignSVG scene={scene} />;

  // Dog training / RL / reward
  if (t.includes('dog') || t.includes('trick') || t.includes('reward') ||
      t.includes('reinforcement') || t.includes('retrains'))
    return <DogTrainingSVG scene={scene} />;

  // Orchestra / many instruments one goal
  if (t.includes('orchestra'))
    return <OrchestraSVG scene={scene} />;

  // Greedy vs A* comparison
  if (t.includes('greedy') || t.includes('a*') || t.includes('a-star') || t.includes('rush driver'))
    return <GreedyVsAStarSVG scene={scene} />;

  // Smart Door Lock — AND gate / all conditions must be true
  if (t.includes('door lock') || t.includes('smart door') || t.includes('all condition'))
    return <SmartDoorLockSVG scene={scene} />;

  // Lecture 8: Bias Hides in Training Data Like Contraband Hides in Luggage
  if (t.includes('bias hides'))
    return <BiasInDataSVG scene={scene} />;

  // Lecture 8: AI Hallucinations Are Like a Broken GPS
  if (t.includes('hallucinations are'))
    return <HallucinationSVG scene={scene} />;

  // Lecture 8: Responsible AI Routes Decisions Like GPS Routes Around Hazards
  if (t.includes('responsible ai routes'))
    return <ResponsibleAISVG scene={scene} />;

  // Lecture 9: Your AI Journey is Complete — Like GPS Reaching the Destination
  if (t.includes('ai journey'))
    return <JourneyCompleteSVG scene={scene} />;

  // Lecture 9: Building AI is Like Navigating to an Unknown Destination
  if (t.includes('building ai'))
    return <BuildNavigateSVG scene={scene} />;

  // GPS / navigation / routing
  if (t.includes('gps') || t.includes('navigation') || t.includes('route') ||
      t.includes('journey') || t.includes('map') || t.includes('destination'))
    return <GPSNavigationSVG scene={scene} />;

  // Overfitting — dog training visual matches the analogy (dog at home vs park)
  if (t.includes('overfitting'))
    return <DogTrainingSVG scene={scene} />;

  // Lecture 5: Loss Functions — Dart Competition (minimizing error)
  if (t.includes('dart') || t.includes('competition') || t.includes('bullseye'))
    return <DartCompetitionSVG scene={scene} />;

  // Lecture 5: Perceptron Learning — Security Guard (learning decision boundary)
  if (t.includes('security guard') || t.includes('guard') || t.includes('learning staff'))
    return <SecurityGuardSVG scene={scene} />;

  // Lecture 5: SVMs — Road Median (maximum margin separation)
  if (t.includes('road median') || t.includes('svm') || t.includes('maximum margin') || t.includes('median'))
    return <RoadMedianSVG scene={scene} />;

  // Default: airport scanner
  return <AirportSVG scene={scene} />;
}

// ── Fallback captions for think-of panels that don't have captions ──────────

function getFallbackCaption(title: string, scene: number): string {
  const t = title.toLowerCase();

  // BFS / DFS building
  if (t.includes('floor') || t.includes('friend') || t.includes('10th'))
    return [
      'Friend on 10F. You at ground. Where to start?',
      'BFS: elevator checks every floor level by level.',
      'DFS: stairs dive deep one side — less work.',
      'BFS = queue. DFS = stack. Same goal.',
      'BFS: 5 min guaranteed. DFS: 2 min but may backtrack.',
    ][scene] ?? '';

  // Traffic Decision — makes logical decisions
  if (t.includes('makes logical decisions'))
    return [
      'Real-world systems first collect facts before making decisions.',
      'Different rules produce different decisions.',
      'AI also makes decisions using logical conditions.',
    ][scene] ?? '';

  // Traffic Signal
  if (t.includes('traffic signal'))
    return [
      'AND: All conditions TRUE → GREEN light.',
      'OR: One condition TRUE → WALK signal.',
      'NOT: FALSE becomes TRUE → RED light.',
    ][scene] ?? '';

  // Doctor Knowledge Base — diagnosing a patient
  if (t.includes('doctor diagnosing'))
    return [
      'Experts rely on knowledge they have already learned.',
      'New information is compared with stored knowledge.',
      'AI combines facts to discover something new.',
    ][scene] ?? '';

  // Detective Solving a Mystery
  if (t.includes('detective solving'))
    return [
      'Good decisions begin with reliable evidence.',
      'Reasoning connects facts to reveal patterns.',
      'AI follows the same reasoning process using facts and rules.',
    ][scene] ?? '';

  // Logic / inference
  if (t.includes('logic') || t.includes('airport') || t.includes('security') ||
      t.includes('checklist') || t.includes('detective') || t.includes('rule'))
    return [
      'IF bag has liquid >100ml THEN remove. IF shoes have metal THEN scan.',
      'Rules chain together: known facts → inferred facts.',
      'Logic is just IF-THEN rules applied in sequence.',
    ][scene] ?? '';

  // Probability / Bayes / weather
  if (t.includes('probability') || t.includes('weather') || t.includes('bayes') ||
      t.includes('forecast') || t.includes('belief') || t.includes('uncertain'))
    return [
      'Forecaster reads pressure, humidity, clouds — assigns a number.',
      'New evidence updates the probability. Belief shifts.',
      'Each observation refines the estimate. AI learns from data.',
    ][scene] ?? '';

  // Dog / RL / training
  if (t.includes('dog') || t.includes('trick') || t.includes('reward') || t.includes('train'))
    return [
      'Dog does not know sit = treat yet. Prior belief is weak.',
      'Sit + treat = belief strengthens. Evidence updates prior.',
      'Posterior becomes prior. With enough trials, dog learns.',
    ][scene] ?? '';

  // GPS / navigation / Bayesian Networks
  if (t.includes('gps') || t.includes('navigation') || t.includes('route') ||
      t.includes('bayesian network') || t.includes('uncertainty like gps'))
    return [
      'GPS blends satellite, traffic, and map data into one position fix.',
      'New traffic data propagates — arrival time, route, ETA all update.',
      'One observation updates every connected node in the network.',
    ][scene] ?? '';

  // Greedy / A*
  if (t.includes('greedy') || t.includes('a*') || t.includes('delivery rider'))
    return [
      'Restaurant to customer. Traffic ahead. Which route?',
      'Greedy: "That road looks closest — go!"',
      'Greedy ignored traffic. Now it\'s stuck.',
      'A*: g(n) + h(n) = "This route is cheaper overall."',
      'A* delivers. Greedy? Still stuck in traffic.',
    ][scene] ?? '';

  // Smart Door Lock
  if (t.includes('door lock') || t.includes('smart door') || t.includes('all condition'))
    return [
      'Face ✓ Fingerprint ✓ Phone ✗ — door stays locked.',
      'Phone connects. All three ✓. Door opens.',
      'ALL conditions must be True — that is AND logic.',
    ][scene] ?? '';

  return '';
}

// ── Staggered line reveal ─────────────────────────────────────────────────────
function firstSentence(text: string): string {
  const trimmed = (text || '').trim();
  const match = trimmed.match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : trimmed).trim();
}

function StaggeredText({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  const lines = (text || '').split('|').map(s => s.trim()).filter(Boolean);
  const [visible, setVisible] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timerRef.current = lines.map((_, i) =>
      setTimeout(() => setVisible(v => [...v, i]), startDelay * 1000 + i * 2000)
    );
    return () => { timerRef.current.forEach(t => clearTimeout(t)); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {lines.map((line, i) => (
        <span key={i}
          style={{
            display: 'block',
            transition: 'opacity 600ms ease-out, transform 600ms ease-out',
            opacity: visible.includes(i) ? 1 : 0,
            transform: visible.includes(i) ? 'translateY(0)' : 'translateY(12px)',
          }}
        >{line}</span>
      ))}
    </>
  );
}

// ── Backwards compat ──────────────────────────────────────────────────────────

function deriveFromThinkOf(b: ThinkOfBlock): AIThinkOfPanelBlock {
  return {
    type: 'ai_think_of',
    title: b.analogy?.title ?? 'Think Of It This Way',
    subtitle: b.analogy?.description ?? '',
    panels: [
      { number: 1, label: 'Real World', description: b.analogy?.description ?? '' },
      { number: 2, label: 'The Pattern', description: b.visualization?.title ?? '' },
      { number: 3, label: 'AI',          description: b.takeaway ?? '' },
    ],
    insight: b.takeaway ?? '',
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AIThinkOfSection({
  block,
  thinkOfBlock,
}: {
  block?: AIThinkOfPanelBlock;
  thinkOfBlock?: ThinkOfBlock;
}) {
  const resolved: AIThinkOfPanelBlock = block ?? deriveFromThinkOf(thinkOfBlock!);
  const N = resolved.panels.length;

  const [scene, setScene] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [insightVisible, setInsightVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const prevTitle  = useRef(resolved.title);
  const touchStartX = useRef(0);

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0 && scene > 0) { setSlideDir('right'); setScene(s => s - 1); }
      else if (dx < 0 && scene < N - 1) { setSlideDir('left'); setScene(s => s + 1); }
    }
  }, [scene, N]);

  // Reset scene when switching to a different think-of block
  useEffect(() => {
    if (resolved.title !== prevTitle.current) {
      prevTitle.current = resolved.title;
      setScene(0);
      setInsightVisible(false);
    }
  }, [resolved.title]);

  const scrollRoot = useContext(ScrollContext).current;

  // Animate header on scroll-in
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    let fired = false;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) { fired = true; setHeaderVisible(true); obs.disconnect(); }
    }, { threshold: 0.05, root: scrollRoot ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [scrollRoot]);

  // Start animation only when section enters viewport
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !hasStarted) {
        setHasStarted(true);
        setScene(0);
        setInsightVisible(false);
        obs.disconnect();
      }
    }, { threshold: 0.15, root: scrollRoot ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasStarted, scrollRoot]);

  // Show insight once the last scene has been reached
  useEffect(() => {
    if (scene < N - 1) return;
    const t = setTimeout(() => setInsightVisible(true), 600);
    return () => clearTimeout(t);
  }, [scene, N]);

  // Also show the insight on scroll — most readers scroll straight through
  // instead of clicking every scene dot, and previously that meant they'd
  // never see it (and the section would end abruptly right after the sticky
  // visual, reading as leftover empty space below it).
  const insightSentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = insightSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInsightVisible(true); obs.disconnect(); }
    }, { threshold: 0, rootMargin: '0px 0px -80px 0px', root: scrollRoot ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [scrollRoot]);

  // Manual navigation
  const goTo = useCallback((i: number) => {
    setScene(i);
  }, []);

  const panel = resolved.panels[scene];
  const ACCENTS = ['text-[var(--brand-primary)]', 'text-[var(--brand-primary)]', 'text-[var(--brand-primary)]'];
  const accent  = ACCENTS[scene % ACCENTS.length];

  return (
    <div ref={wrapperRef} className="ai-illustration ai-think-of-scope">
      <style>{STYLES}</style>
      <style>{`
        /* Softer, lighter dark tones scoped to just this "Think Of It This Way"
           component so it fits naturally into the surrounding light lecture
           content, without changing the shared illustration palette used by
           AILearnSection.tsx and other explorer widgets elsewhere. */
        .ai-think-of-scope {
          --illustration-bg-dark: #2c276d;
          --illustration-surface: #1b2a4c;
          --illustration-bg-deep: #131d30;
          --illustration-bg-glow: #131d3a;
          --illustration-bg-surface-deep: #182137;
          --illustration-bg-surface-mid: #1d2741;
          --illustration-bg-surface-dark: #1b2332;
          --illustration-bg-dim: #111a34;
          --illustration-bg-surface-deeper: #17203b;
          --illustration-surface-muted: #1a2139;
        }
      `}</style>

      {/* ── Header ── */}
      <div
        ref={headerRef}
        className={`transition-all duration-700 ease-out ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#1c2a41] to-[#132036] px-8 py-8">
          <div className="flex justify-center items-center gap-2.5 mb-3">
            <svg className="w-4 h-4 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest leading-none">Think Of It This Way</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight text-center">{resolved.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line max-w-lg mx-auto text-center">{resolved.subtitle?.replace(/\|/g, '\n')}</p>
        </div>
      </div>

      {/* ── Sticky morphing visual + scroll spacers ── */}
      <div className="relative mt-6">

        {/* Compact sticky card */}
        <div className="sticky top-4 z-10">
          <div
            className="rounded-3xl border border-slate-800 bg-[#0e1b33] px-6 py-6"
          >

            {/* Scene indicator row */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-[0.25em] transition-colors duration-500 ${accent}`}>
                {panel?.label ?? `Scene ${scene + 1}`}
              </span>
              <div className="flex items-center gap-1.5 ml-auto">
                {Array.from({ length: N }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-400 ${
                      i === scene
                        ? 'w-4 h-1.5 bg-white'
                        : i < scene
                        ? 'w-1.5 h-1.5 bg-slate-500 hover:bg-slate-300'
                        : 'w-1.5 h-1.5 bg-slate-800 hover:bg-slate-600'
                    }`}
                    aria-label={`Go to scene ${i + 1}`}
                  />
                ))}
                <button
                  onClick={() => goTo(Math.max(scene - 1, 0))}
                  disabled={scene <= 0}
                  className={`ml-1 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    scene > 0
                      ? 'border-slate-600 text-slate-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] cursor-pointer'
                      : 'border-slate-800 text-slate-700 opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="Previous scene"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => goTo(Math.min(scene + 1, N - 1))}
                  disabled={scene >= N - 1}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    scene < N - 1
                      ? 'border-slate-600 text-slate-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] cursor-pointer'
                      : 'border-slate-800 text-slate-700 opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="Next scene"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Topic-specific SVG visual with embedded description */}
            <div
              className="relative select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                key={`viz-${scene}`}
                style={{ animation: `tof-slide-in-${slideDir} 0.45s ease both` }}
              >
                <ThinkOfVisual scene={scene} title={resolved.title} />
              </div>
              <div
                key={`cap-${scene}`}
                className="absolute bottom-0 left-0 right-0 bg-[var(--illustration-bg-deep)] text-center px-4 py-2"
                style={{ animation: 'tof-up 0.4s 0.15s both' }}
              >
                <p className="text-xs text-slate-300 leading-snug max-w-md mx-auto line-clamp-2">
                  {firstSentence(panel?.caption || panel?.description || '')}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div ref={insightSentinelRef} className="h-px" aria-hidden />

      {/* ── Insight card ── */}
      {insightVisible && (
        <div
          ref={insightRef}
          className={`mt-6 transition-all duration-700 ease-out ${insightVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="rounded-3xl border border-[var(--brand-primary)]/20 bg-[#13302d] px-8 py-8">
            <div className="flex justify-center items-center gap-2.5 mb-3">
              <svg className="w-4 h-4 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest leading-none">Key Insight</span>
            </div>
            <p className="relative text-xl font-bold text-white leading-snug max-w-2xl mx-auto whitespace-pre-line text-center">
              <StaggeredText text={resolved.insight || ''} startDelay={0} />
            </p>
            {resolved.reinforcement && (
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                <StaggeredText text={resolved.reinforcement} startDelay={(resolved.insight || '').split('|').length * 2} />
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
