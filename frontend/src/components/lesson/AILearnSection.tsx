import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ScrollContext } from './ScrollContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Network, ArrowRightLeft, Coins, Check, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import type { AILearnSectionBlock, AIConceptCard, BfsDfsContent, GreedyAStarContent, ProbabilityContent, AdversarialContent } from '../../types/lesson';
import KMeansClustering from './KMeansClustering';
import PerceptronLearningExplorer from './PerceptronLearningExplorer';
import NeuralNetworkStructureExplorer from './NeuralNetworkStructureExplorer';
import ActivationFunctionExplorer from './ActivationFunctionExplorer';
import TrainingHyperparameterExplorer from './TrainingHyperparameterExplorer';
import BackpackOptimization from './BackpackOptimization';
import PasswordStateSpace from './PasswordStateSpace';
import StudyDayPlanner from './StudyDayPlanner';

// ── CSS keyframes (micro-animations inside the card) ─────────────────────────

const KEYFRAMES = `
@keyframes al-ring {
  0%   { box-shadow: 0 0 0 0px var(--illustration-glow); }
  100% { box-shadow: 0 0 0 9px transparent;    }
}
@keyframes al-dot {
  0%   { left: 0%;               opacity: 0; }
  8%   { opacity: 1; }
  92%  { opacity: 1; }
  100% { left: calc(100% - 6px); opacity: 0; }
}
@keyframes step-pop {
  0%   { transform: scale(0.3); opacity: 0; }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
`;

// ── Card Reveal ─────────────────────────────────────────────────────────────────

function CardReveal({ children, delayMs = 0 }: { children: React.ReactNode; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const scrollRoot = useContext(ScrollContext).current;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setVisible(true), delayMs);
        obs.disconnect();
      }
    }, { threshold: 0.15, root: scrollRoot ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs, scrollRoot]);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
      }}
    >
      {children}
    </div>
  );
}

function SwipeReveal({ children, enterFromRight }: { children: React.ReactNode; enterFromRight: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const scrollRoot = useContext(ScrollContext).current;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.15, root: scrollRoot ?? null, rootMargin: "0px 0px -50px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [scrollRoot]);

  const xOffset = typeof window !== 'undefined' && window.innerWidth < 640 ? 40 : 80;
  
  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : `translateX(${enterFromRight ? xOffset : -xOffset}px)`,
      }}
    >
      {children}
    </div>
  );
}


// ── Sentinel ──────────────────────────────────────────────────────────────────

function Sentinel({ onEnter, rootRef }: { onEnter: () => void; rootRef?: HTMLElement | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const fn = useRef(onEnter);
  fn.current = onEnter;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fired = false;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) { fired = true; fn.current(); obs.disconnect(); }
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px', root: rootRef ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootRef]);
  return <div ref={ref} className="h-px" aria-hidden />;
}

// ── Swipe-in image (left/right entrance, tied to parent reveal state) ────────

function SwipeImage({ src, alt, direction, visible }: { src: string; alt: string; direction: 'left' | 'right'; visible: boolean }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  
  const isDiagram = src.includes('wikipedia/commons') || src.includes('Breadth-first-tree') || src.includes('Depth-first-tree');

  const containerClasses = isDiagram 
    ? 'w-fit mx-auto max-w-full h-auto' 
    : 'w-full h-48 md:h-56';
    
  const imgClasses = isDiagram
    ? 'w-auto h-auto max-w-full max-h-[32rem] object-contain p-4 mx-auto'
    : 'w-full h-full object-cover';

  return (
    <div
      className={`mb-6 rounded-2xl overflow-hidden border border-slate-800/60 ${containerClasses} ${isDiagram ? 'bg-slate-200/90' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : `translateX(${direction === 'left' ? '-48px' : '48px'})`,
        transition: 'opacity 700ms ease-out, transform 700ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <img src={src} alt={alt} className={imgClasses} loading="lazy" onError={() => setErr(true)} />
    </div>
  );
}

// ── Hero SVG Illustration ─────────────────────────────────────────────────────

function BiologyExplorerIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="be-sky" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-bg-dark)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--illustration-surface)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="be-ocean" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-special-alt)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="240" height="176" fill="url(#be-sky)" />

      {/* Ocean */}
      <rect x="0" y="130" width="240" height="46" fill="url(#be-ocean)" />
      <path d="M0 138 Q20 134 40 138 Q60 142 80 138 Q100 134 120 138 Q140 142 160 138 Q180 134 200 138 Q220 142 240 138" stroke="#0891b2" strokeWidth="0.8" opacity="0.15">
        <animate attributeName="d" values="M0 138 Q20 134 40 138 Q60 142 80 138 Q100 134 120 138 Q140 142 160 138 Q180 134 200 138 Q220 142 240 138;M0 136 Q20 140 40 136 Q60 132 80 136 Q100 140 120 136 Q140 132 160 136 Q180 140 200 136 Q220 132 240 136;M0 138 Q20 134 40 138 Q60 142 80 138 Q100 134 120 138 Q140 142 160 138 Q180 134 200 138 Q220 142 240 138" dur="4s" repeatCount="indefinite" />
      </path>

      {/* Island */}
      <path d="M60 130 Q70 114 90 112 Q110 110 120 112 Q130 114 135 118 Q140 122 150 130Z" fill="#065f46" opacity="0.5" />
      <path d="M70 122 Q80 108 100 106 Q115 104 125 108 Q130 112 138 122Z" fill="#047857" opacity="0.35" />

      {/* Trees */}
      <path d="M85 110 L88 100 L91 110Z" fill="var(--illustration-success-deep)" opacity="0.4" />
      <path d="M110 106 L113 94 L116 106Z" fill="var(--illustration-success-dim)" opacity="0.35" />
      <path d="M75 114 L77 106 L79 114Z" fill="var(--illustration-success-bright)" opacity="0.3" />

      {/* Bird-like (feathers) — amber */}
      <g>
        <ellipse cx="88" cy="98" rx="4" ry="3" fill="var(--illustration-warning)" opacity="0.7" />
        <path d="M85 96 L83 93" stroke="var(--illustration-warning-deep)" strokeWidth="1" opacity="0.5" />
        <path d="M91 96 L93 93" stroke="var(--illustration-warning-deep)" strokeWidth="1" opacity="0.5" />
        <polygon points="85,97 82,99 86,99" fill="var(--illustration-warning)" opacity="0.5" />
      </g>

      {/* Reptile-like (scales) — emerald */}
      <g>
        <ellipse cx="105" cy="102" rx="5" ry="2.5" fill="var(--illustration-success-dim)" opacity="0.6" />
        <circle cx="105" cy="100" r="2" fill="var(--illustration-success-dim)" opacity="0.7" />
        <line x1="103" y1="99" x2="103" y2="98" stroke="var(--illustration-success-dim)" strokeWidth="0.6" opacity="0.4" />
        <line x1="107" y1="99" x2="107" y2="98" stroke="var(--illustration-success-dim)" strokeWidth="0.6" opacity="0.4" />
      </g>

      {/* Mammal-like (fur) — violet */}
      <g>
        <circle cx="124" cy="100" r="4" fill="var(--illustration-deep)" opacity="0.6" />
        <ellipse cx="124" cy="104" rx="4" ry="2.5" fill="var(--illustration-deep)" opacity="0.5" />
        <circle cx="122" cy="98" r="0.8" fill="var(--illustration-light)" opacity="0.6" />
        <circle cx="126" cy="98" r="0.8" fill="var(--illustration-light)" opacity="0.6" />
      </g>

      {/* Glowing creature (bioluminescent) — cyan */}
      <g>
        <circle cx="96" cy="110" r="2" fill="var(--illustration-special)" opacity="0.7" />
        <circle cx="96" cy="110" r="4" fill="var(--illustration-special)" opacity="0.08" />
      </g>

      {/* Magnifying glass (biologist observing) */}
      <g opacity="0.6">
        <circle cx="168" cy="44" r="14" stroke="var(--illustration-warning-light)" strokeWidth="1.5" opacity="0.5" fill="none" />
        <circle cx="168" cy="44" r="12" stroke="var(--illustration-warning-light)" strokeWidth="0.5" opacity="0.15" fill="none" />
        <line x1="178" y1="54" x2="190" y2="66" stroke="var(--illustration-warning-light)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </g>

      {/* Labels */}
      <text x="42" y="162" textAnchor="middle" fontSize="7" fontWeight="600" fill="var(--illustration-muted-lighter)">Explore</text>
      <text x="120" y="162" textAnchor="middle" fontSize="7" fontWeight="600" fill="var(--illustration-muted-lighter)">Compare</text>
      <text x="198" y="162" textAnchor="middle" fontSize="7" fontWeight="600" fill="var(--illustration-muted-lighter)">Groups Emerge</text>

      {/* Beam connecting the three phases */}
      <rect x="8" y="150" width="224" height="1" rx="0.5" fill="url(#be-ocean)" opacity="0.3" />
    </svg>
  );
}

function RLHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rl-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0" />
        </linearGradient>
        <marker id="rl-arr-hero" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,1 L9,5 L0,9" fill="var(--illustration-accent)" fillOpacity="0.6" />
        </marker>
        <marker id="rl-arr-hero-reward" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,1 L9,5 L0,9" fill="var(--illustration-success-bright)" fillOpacity="0.6" />
        </marker>
      </defs>

      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#rl-glow)" />

      {/* Agent box */}
      <rect x="16" y="36" width="80" height="64" rx="8" fill="var(--illustration-primary)" fillOpacity="0.06" stroke="var(--illustration-secondary)" strokeWidth="1" strokeOpacity="0.3" />
      <text x="56" y="56" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="8" fontFamily="system-ui" fontWeight="700">AGENT</text>
      <text x="56" y="68" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="6" fontFamily="system-ui">observes state</text>
      <text x="56" y="78" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="6" fontFamily="system-ui">selects action</text>
      <text x="56" y="88" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="6" fontFamily="system-ui">updates policy</text>

      {/* Environment box */}
      <rect x="144" y="36" width="80" height="64" rx="8" fill="#0ea5e9" fillOpacity="0.06" stroke="var(--illustration-special-light)" strokeWidth="1" strokeOpacity="0.3" />
      <text x="184" y="56" textAnchor="middle" fill="var(--illustration-special-light)" fontSize="8" fontFamily="system-ui" fontWeight="700">ENVIRONMENT</text>
      <text x="184" y="68" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="6" fontFamily="system-ui">receives action</text>
      <text x="184" y="78" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="6" fontFamily="system-ui">transitions state</text>
      <text x="184" y="88" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="6" fontFamily="system-ui">returns reward</text>

      {/* Action arrow */}
      <line x1="96" y1="52" x2="144" y2="52" stroke="var(--illustration-accent)" strokeWidth="1.2" strokeOpacity="0.5" markerEnd="url(#rl-arr-hero)" />
      <text x="120" y="46" textAnchor="middle" fill="var(--illustration-accent)" fontSize="6" fontFamily="system-ui" fontWeight="600">action</text>

      {/* Reward arrow */}
      <line x1="144" y1="72" x2="96" y2="72" stroke="var(--illustration-success-bright)" strokeWidth="1.2" strokeOpacity="0.5" markerEnd="url(#rl-arr-hero-reward)" strokeDasharray="3,2" />
      <text x="120" y="78" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="6" fontFamily="system-ui" fontWeight="600">reward</text>

      {/* State label */}
      <text x="120" y="100" textAnchor="middle" fill="var(--illustration-success-dim)" fontSize="5" fontFamily="system-ui" fontWeight="500">state</text>

      {/* Loop arc */}
      <path d="M208 36 Q232 36 232 16 Q232 0 208 0" stroke="var(--illustration-muted-lighter)" strokeWidth="0.5" opacity="0.2" fill="none" />

      {/* Bottom labels */}
      <text x="120" y="130" textAnchor="middle" fill="var(--illustration-deep)" fontSize="7" fontFamily="system-ui" fontWeight="700">Agent · Action · Reward</text>
      <text x="120" y="142" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5" fontFamily="system-ui">The agent learns by interacting with its environment</text>
    </svg>
  );
}

function LanguageHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lang-bg" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-deep)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--illustration-accent-deep)" stopOpacity="0" />
        </linearGradient>
        <marker id="lang-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,1 L9,5 L0,9" fill="var(--illustration-accent)" fillOpacity="0.3" />
        </marker>
      </defs>
      <rect x="0" y="0" width="240" height="176" rx="0" fill="url(#lang-bg)" />
      <text x="120" y="24" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="800" letterSpacing="4" opacity="0.75">NLP</text>
      <g transform="translate(22, 42)">
        <rect x="0" y="0" width="44" height="54" rx="5" fill="var(--illustration-accent)" fillOpacity="0.06" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.2" />
        <rect x="8" y="10" width="28" height="3" rx="1.5" fill="var(--illustration-accent)" opacity="0.5" />
        <rect x="8" y="18" width="22" height="3" rx="1.5" fill="var(--illustration-accent)" opacity="0.3" />
        <rect x="8" y="26" width="26" height="3" rx="1.5" fill="var(--illustration-accent)" opacity="0.4" />
        <rect x="8" y="34" width="16" height="3" rx="1.5" fill="var(--illustration-accent)" opacity="0.25" />
      </g>
      <text x="44" y="110" textAnchor="middle" fill="var(--illustration-accent)" fontSize="8" fontFamily="system-ui" fontWeight="700" opacity="0.7">Text</text>
      <path d="M74,69 L90,69" stroke="var(--illustration-accent)" strokeWidth="1.5" strokeOpacity="0.3" markerEnd="url(#lang-arrow)" />
      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="0.5s" repeatCount="indefinite" />
      <g transform="translate(107, 36)">
        <circle cx="18" cy="33" r="28" fill="var(--illustration-accent)" fillOpacity="0.06" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="18" cy="33" r="18" fill="var(--illustration-accent)" fillOpacity="0.04">
          <animate attributeName="r" values="16;20;16" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="18" cy="33" r="8" fill="var(--illustration-light)" opacity="0.08">
          <animate attributeName="opacity" values="0.05;0.2;0.05" dur="2s" repeatCount="indefinite" />
        </circle>
        <path d="M8,23 L14,28" stroke="var(--illustration-accent)" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M28,23 L22,28" stroke="var(--illustration-accent)" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M8,43 L14,38" stroke="var(--illustration-accent)" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M28,43 L22,38" stroke="var(--illustration-accent)" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M18,55 L18,65" stroke="var(--illustration-accent)" strokeWidth="0.8" strokeOpacity="0.15" />
      </g>
      <text x="125" y="110" textAnchor="middle" fill="var(--illustration-accent)" fontSize="8" fontFamily="system-ui" fontWeight="700" opacity="0.7">Process</text>
      <path d="M151,69 L168,69" stroke="var(--illustration-accent)" strokeWidth="1.5" strokeOpacity="0.3" markerEnd="url(#lang-arrow)" />
      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="1s" repeatCount="indefinite" />
      <g transform="translate(185, 42)">
        <circle cx="14" cy="27" r="7" fill="var(--illustration-accent)" fillOpacity="0.08" stroke="var(--illustration-accent)" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M8,34 L12,34 L13,38 L15,38 L16,34 L20,34" stroke="var(--illustration-accent)" strokeWidth="0.8" strokeOpacity="0.2" fill="none" />
        <rect x="11" y="39" width="6" height="7" rx="1" fill="var(--illustration-accent)" fillOpacity="0.06" stroke="var(--illustration-accent)" strokeWidth="0.6" strokeOpacity="0.15" />
        <path d="M14,46 L14,52" stroke="var(--illustration-accent)" strokeWidth="0.6" strokeOpacity="0.15" />
        <circle cx="14" cy="27" r="4" fill="var(--illustration-light)" opacity="0.08">
          <animate attributeName="opacity" values="0.05;0.2;0.05" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
        </circle>
      </g>
      <text x="199" y="110" textAnchor="middle" fill="var(--illustration-accent)" fontSize="8" fontFamily="system-ui" fontWeight="700" opacity="0.7">Meaning</text>
      <text x="120" y="138" textAnchor="middle" fill="var(--illustration-deeper)" fontSize="6.5" fontFamily="system-ui" fontWeight="500" opacity="0.45">Natural Language Processing</text>
      <circle cx="12" cy="160" r="1" fill="var(--illustration-light)" opacity="0.2">
        <animateMotion dur="8s" repeatCount="indefinite" path="M0,0 L220,0" />
      </circle>
      <circle cx="12" cy="156" r="0.7" fill="var(--illustration-light)" opacity="0.15">
        <animateMotion dur="10s" repeatCount="indefinite" begin="2s" path="M0,0 L220,0" />
      </circle>
      <circle cx="12" cy="164" r="0.8" fill="var(--illustration-light)" opacity="0.15">
        <animateMotion dur="9s" repeatCount="indefinite" begin="4s" path="M0,0 L220,0" />
      </circle>
    </svg>
  );
}

function HeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="al-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-deep)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--illustration-accent-deep)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="al-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--illustration-deep)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--illustration-deep)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--illustration-deep)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background glow */}
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#al-glow)" />

      {/* ── Step 1: Examples flowing in (left) ── */}
      {/* Stacked cards icon */}
      <rect x="16" y="64" width="30" height="6" rx="2" fill="var(--illustration-deeper)" opacity="0.25" />
      <rect x="18" y="68" width="30" height="6" rx="2" fill="var(--illustration-deep)" opacity="0.3" />
      <rect x="20" y="72" width="30" height="6" rx="2" fill="var(--illustration-accent)" opacity="0.35" />
      <rect x="22" y="76" width="30" height="6" rx="2" fill="var(--illustration-light)" opacity="0.4" />

      <text x="35" y="102" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--illustration-muted-lighter)">Sees</text>
      <text x="35" y="112" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--illustration-muted-lighter)">Examples</text>

      {/* Animated particles flowing from examples toward brain */}
      <circle r="2" fill="var(--illustration-accent)" opacity="0.6">
        <animateMotion dur="2s" repeatCount="indefinite" path="M50,70 Q70,60 85,80" />
      </circle>
      <circle r="1.5" fill="var(--illustration-light)" opacity="0.5">
        <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.6s" path="M50,75 Q70,65 85,85" />
      </circle>
      <circle r="1.8" fill="var(--illustration-accent)" opacity="0.5">
        <animateMotion dur="2.8s" repeatCount="indefinite" begin="1.2s" path="M50,72 Q70,62 85,82" />
      </circle>

      {/* Arrow connecting examples to brain */}
      <path d="M54 78 Q68 72 82 80" stroke="var(--illustration-deep)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />

      {/* ── Step 2: Brain learns patterns (center) ── */}
      {/* Outer glow ring */}
      <circle cx="120" cy="82" r="32" fill="var(--illustration-deep)" opacity="0.03">
        <animate attributeName="r" values="30;34;30" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Brain shape */}
      <path d="M98 76 C96 64 104 56 114 56 C122 56 128 60 130 66 C134 60 140 58 146 62 C150 66 150 74 146 80 C150 84 150 92 146 98 C140 106 130 110 120 108 C110 108 100 102 96 94 C92 88 92 80 98 76Z" fill="var(--illustration-deeper)" opacity="0.1" stroke="var(--illustration-accent)" strokeWidth="1.2" />

      {/* Brain inner highlight */}
      <path d="M106 78 C106 70 112 64 118 64 C124 64 128 68 130 72 C132 68 136 66 140 70 C142 74 140 80 138 84 C140 88 138 94 134 98 C130 102 122 104 116 102 C110 100 106 94 106 86 C106 82 106 80 106 78Z" fill="var(--illustration-deep)" opacity="0.06" />

      {/* Pulsing core */}
      <circle cx="120" cy="84" r="8" fill="var(--illustration-deep)" opacity="0.12">
        <animate attributeName="r" values="8;12;8" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.12;0.05;0.12" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* Brain fold lines */}
      <path d="M106 70 Q114 66 122 70" stroke="var(--illustration-light)" strokeWidth="0.7" opacity="0.2" strokeLinecap="round" />
      <path d="M110 78 Q118 74 126 78" stroke="var(--illustration-light)" strokeWidth="0.7" opacity="0.2" strokeLinecap="round" />
      <path d="M104 86 Q112 82 122 86" stroke="var(--illustration-light)" strokeWidth="0.7" opacity="0.2" strokeLinecap="round" />
      <path d="M108 94 Q116 90 126 94" stroke="var(--illustration-light)" strokeWidth="0.7" opacity="0.2" strokeLinecap="round" />

      <text x="120" y="87" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--illustration-light)">Learns</text>

      <text x="120" y="122" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--illustration-muted-lighter)">Finds Patterns</text>

      {/* ── Step 3: Answers coming out (right) ── */}
      {/* Animated particles flowing from brain to answers */}
      <circle r="2" fill="var(--illustration-success-bright)" opacity="0.6">
        <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.3s" path="M158,80 Q175,72 190,78" />
      </circle>
      <circle r="1.5" fill="var(--illustration-success-lighter)" opacity="0.5">
        <animateMotion dur="2.6s" repeatCount="indefinite" begin="1s" path="M158,85 Q175,76 190,82" />
      </circle>

      {/* Arrow */}
      <path d="M158 82 Q172 76 188 80" stroke="var(--illustration-success-bright)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />

      {/* Answer cards stacking up */}
      <rect x="194" y="70" width="32" height="8" rx="3" fill="#065f46" stroke="var(--illustration-success-dim)" strokeWidth="0.6" opacity="0.7" />
      <rect x="196" y="76" width="32" height="8" rx="3" fill="#047857" stroke="var(--illustration-success-dim)" strokeWidth="0.6" opacity="0.8" />
      <rect x="198" y="82" width="32" height="8" rx="3" fill="var(--illustration-success-deep)" stroke="var(--illustration-success-bright)" strokeWidth="0.6" />

      {/* Checkmark */}
      <polyline points="208,78 210,80 214,76" stroke="var(--illustration-success-lighter)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </polyline>

      <text x="210" y="108" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--illustration-muted-lighter)">Answers</text>
      <text x="210" y="118" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--illustration-muted-lighter)">Correctly</text>

      {/* ── Subtle beam connecting the three steps ── */}
      <rect x="35" y="90" width="175" height="1.5" rx="1" fill="url(#al-beam)" opacity="0.15" />
    </svg>
  );
}

function NestedCirclesIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nc-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-deep)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-accent-deep)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="88" rx="100" ry="60" fill="url(#nc-glow)" />
      {/* Outer ring: AI */}
      <circle cx="120" cy="82" r="52" fill="none" stroke="var(--illustration-deeper)" strokeWidth="1.8" strokeDasharray="4,5" opacity="0.35">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite" />
      </circle>
      {/* Middle ring: ML */}
      <circle cx="120" cy="82" r="36" fill="none" stroke="var(--illustration-deep)" strokeWidth="1.5" strokeDasharray="3,4" opacity="0.45">
        <animate attributeName="opacity" values="0.25;0.7;0.25" dur="4s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      {/* Inner ring: DL */}
      <circle cx="120" cy="82" r="20" fill="none" stroke="var(--illustration-accent)" strokeWidth="1.2" strokeDasharray="2,3" opacity="0.55">
        <animate attributeName="opacity" values="0.35;0.85;0.35" dur="4s" begin="1s" repeatCount="indefinite" />
      </circle>
      {/* Pulsing core */}
      <circle cx="120" cy="82" r="4" fill="var(--illustration-light)" opacity="0.25">
        <animate attributeName="r" values="3;6;3" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Labels */}
      <text x="120" y="24" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--illustration-deeper)" opacity="0.8">
        Artificial Intelligence
        <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" />
      </text>
      <text x="120" y="134" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--illustration-deep)" opacity="0.8">
        Machine Learning
        <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" begin="0.5s" repeatCount="indefinite" />
      </text>
      <text x="120" y="148" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--illustration-accent)" opacity="0.8">
        Deep Learning
        <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" begin="1s" repeatCount="indefinite" />
      </text>
    </svg>
  );
}

// ── AI Around You — 5 everyday AI cards, readable ─────────────────────────────
function AlreadyAroundIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none">
      <defs>
        <radialGradient id="aa-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="240" height="176" fill="url(#aa-glow)" />

      {/* Row 1: Face, Maps, Spam */}
      <rect x="8" y="10" width="71" height="64" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-primary)" strokeWidth="0.8" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.5s" begin="0s" repeatCount="indefinite" />
      </rect>
      <circle cx="43.5" cy="30" r="8" stroke="var(--illustration-accent)" strokeWidth="1" opacity="0.55" />
      <circle cx="41" cy="28" r="1.5" fill="var(--illustration-accent)" opacity="0.55" />
      <circle cx="46" cy="28" r="1.5" fill="var(--illustration-accent)" opacity="0.55" />
      <path d="M39 33 Q43.5 37 48 33" stroke="var(--illustration-accent)" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
      <text x="43.5" y="62" textAnchor="middle" fill="var(--illustration-accent)" fontSize="14" fontFamily="system-ui" fontWeight="700">Face</text>

      <rect x="84" y="10" width="72" height="64" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="0.8" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
      </rect>
      <path d="M120 22 L128 28 L128 40 L112 40 L112 28Z" stroke="var(--illustration-light)" strokeWidth="1" opacity="0.4" />
      <circle cx="120" cy="31" r="3.5" stroke="var(--illustration-light)" strokeWidth="0.8" opacity="0.55" />
      <circle cx="120" cy="31" r="1.5" fill="var(--illustration-light)" opacity="0.45" />
      <text x="120" y="62" textAnchor="middle" fill="var(--illustration-light)" fontSize="14" fontFamily="system-ui" fontWeight="700">Maps</text>

      <rect x="161" y="10" width="71" height="64" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-accent)" strokeWidth="0.8" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.5s" begin="0.6s" repeatCount="indefinite" />
      </rect>
      <path d="M190.5 22 L206.5 22 L206.5 34 Q206.5 42 198.5 46 Q190.5 42 190.5 34Z" stroke="var(--illustration-lightest)" strokeWidth="1" opacity="0.4" />
      <path d="M194.5 30 L198.5 33 L203 27" stroke="var(--illustration-lightest)" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
      <text x="198.5" y="62" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="14" fontFamily="system-ui" fontWeight="700">Spam</text>

      {/* Row 2: Netflix, ChatGPT */}
      <rect x="36" y="86" width="78" height="64" rx="8" fill="var(--illustration-surface)" stroke="#c084fc" strokeWidth="0.8" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.5s" begin="0.9s" repeatCount="indefinite" />
      </rect>
      <rect x="63" y="99" width="24" height="22" rx="3" stroke="var(--illustration-light)" strokeWidth="0.8" opacity="0.4" />
      <rect x="63" y="99" width="8" height="22" fill="var(--illustration-light)" opacity="0.15" />
      <rect x="79" y="99" width="8" height="22" fill="var(--illustration-light)" opacity="0.15" />
      <path d="M63 99 L69 112 L63 121" stroke="var(--illustration-light)" strokeWidth="0.8" opacity="0.5" />
      <path d="M87 99 L81 112 L87 121" stroke="var(--illustration-light)" strokeWidth="0.8" opacity="0.5" />
      <text x="75" y="138" textAnchor="middle" fill="var(--illustration-light)" fontSize="14" fontFamily="system-ui" fontWeight="700">Netflix</text>

      <rect x="126" y="86" width="78" height="64" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-success-dim)" strokeWidth="0.8" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.5s" begin="1.2s" repeatCount="indefinite" />
      </rect>
      <rect x="153" y="100" width="24" height="18" rx="4" stroke="var(--illustration-success-lighter)" strokeWidth="0.8" opacity="0.4" />
      <path d="M165 118 L159 124" stroke="var(--illustration-success-lighter)" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
      <circle cx="160" cy="107" r="1.5" fill="var(--illustration-success-lighter)" opacity="0.55" />
      <circle cx="167" cy="107" r="1.5" fill="var(--illustration-success-lighter)" opacity="0.55" />
      <circle cx="163.5" cy="112" r="1.5" fill="var(--illustration-success-lighter)" opacity="0.45" />
      <text x="165" y="138" textAnchor="middle" fill="var(--illustration-success-lighter)" fontSize="13" fontFamily="system-ui" fontWeight="700">ChatGPT</text>

      <text x="120" y="168" textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="11" fontFamily="system-ui" fontWeight="500">
        All before you arrive
      </text>
    </svg>
  );
}

// ── Search Problem Illustration ──────────────────────────────────────────────
function SearchProblemIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none">
      <defs>
        <radialGradient id="sp-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="240" height="176" fill="url(#sp-glow)" />

      {/* ── Grid background ── */}
      {[40, 70, 100, 130].map(y => (
        <line key={`gy${y}`} x1="15" y1={y} x2="225" y2={y} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.2" />
      ))}
      {[50, 100, 150, 200].map(x => (
        <line key={`gx${x}`} x1={x} y1="25" x2={x} y2="145" stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.2" />
      ))}

      {/* ── Start node ── */}
      <circle cx="32" cy="88" r="14" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="2" />
      <text x="32" y="93" textAnchor="middle" fill="var(--illustration-accent)" fontSize="13" fontFamily="system-ui" fontWeight="800">S</text>
      <text x="32" y="114" textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="11" fontFamily="system-ui">Start</text>

      {/* ── Goal node ── */}
      <circle cx="208" cy="88" r="14" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-dim)" strokeWidth="2" />
      <text x="208" y="93" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="13" fontFamily="system-ui" fontWeight="800">G</text>
      <text x="208" y="114" textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="11" fontFamily="system-ui">Goal</text>

      {/* ── Branching paths (dim, unexplored) ── */}
      <path d="M 46 80 Q 80 50 120 55" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="1.2" strokeDasharray="4,3" />
      <path d="M 46 96 Q 80 130 120 125" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="1.2" strokeDasharray="4,3" />
      <path d="M 120 55 Q 160 30 202 80" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="1.2" strokeDasharray="4,3" />
      <path d="M 120 125 Q 160 145 202 96" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="1.2" strokeDasharray="4,3" />
      <path d="M 120 90 Q 160 75 202 88" fill="none" stroke="var(--illustration-surface-alt)" strokeWidth="1.2" strokeDasharray="4,3" />

      {/* ── Intermediate nodes ── */}
      <circle cx="120" cy="55" r="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
      <circle cx="120" cy="125" r="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
      <circle cx="160" cy="75" r="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />
      <circle cx="120" cy="90" r="6" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1" />

      {/* ── Optimal path (highlighted) ── */}
      <path d="M 46 88 Q 80 100 120 90 Q 160 80 195 88" fill="none" stroke="var(--illustration-primary)" strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.5))' }} />

      {/* ── Animated agent ── */}
      <circle r="4" fill="var(--illustration-accent)" opacity="0.9">
        <animateMotion dur="3.5s" repeatCount="indefinite" path="M 46 88 Q 80 100 120 90 Q 160 80 195 88" />
      </circle>

      {/* ── Path labels ── */}
      <text x="78" y="44" textAnchor="middle" fill="var(--illustration-element-deep)" fontSize="10" fontFamily="system-ui">State Space</text>
      <text x="78" y="56" textAnchor="middle" fill="var(--illustration-element-deep)" fontSize="9" fontFamily="system-ui">(exploring)</text>

      {/* ── Best path badge ── */}
      <rect x="80" y="147" width="80" height="18" rx="6" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="0.6" opacity="0.8" />
      <text x="120" y="159" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700">Find best path</text>

      {/* ── Pulsing glow around explored path ── */}
      <circle cx="120" cy="90" r="10" fill="var(--illustration-primary)" opacity="0.04">
        <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.04;0.01;0.04" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ── BFS vs DFS Illustration ──────────────────────────────────────────────────
function BfsDfsIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none">
      <defs>
        <radialGradient id="bd-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0" />
        </radialGradient>
        <style>{`
          @keyframes fade-on {
            0%, 10% { opacity: 0; }
            20%, 100% { opacity: 1; }
          }
          @keyframes fade-off {
            0%, 55% { opacity: 1; }
            65%, 100% { opacity: 0; }
          }
          @keyframes pulse-ring {
            0%   { r: 4; opacity: 0.5; }
            100% { r: 18; opacity: 0; }
          }
        `}</style>
      </defs>
      <rect x="0" y="0" width="240" height="176" fill="url(#bd-glow)" />

      {/* ── Labels ── */}
      <rect x="10" y="4" width="104" height="16" rx="4" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.5;0.15;0.15;0.5;0.5" dur="12s" repeatCount="indefinite" keyTimes="0;0.48;0.55;0.9;0.95;1" />
      </rect>
      <text x="62" y="15" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="700">BFS: level by level</text>
      <rect x="126" y="4" width="104" height="16" rx="4" fill="var(--illustration-bg-dark)" stroke="var(--illustration-accent)" strokeWidth="0.5" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.15;0.5;0.5;0.15;0.15" dur="12s" repeatCount="indefinite" keyTimes="0;0.48;0.55;0.9;0.95;1" />
      </rect>
      <text x="178" y="15" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="9" fontFamily="system-ui" fontWeight="700">DFS: go deep first</text>

      {/* ── Tree edges ── */}
      <line x1="120" y1="45" x2="72" y2="74" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
      <line x1="120" y1="45" x2="168" y2="74" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
      <line x1="64" y1="82" x2="32" y2="114" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
      <line x1="80" y1="82" x2="112" y2="114" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
      <line x1="160" y1="82" x2="128" y2="114" stroke="var(--illustration-surface-alt)" strokeWidth="1" />
      <line x1="176" y1="82" x2="208" y2="114" stroke="var(--illustration-surface-alt)" strokeWidth="1" />

      {/* ── DFS path edges (highlight during phase 2) ── */}
      <line x1="120" y1="38" x2="72" y2="68" stroke="var(--illustration-accent)" strokeWidth="1.5" opacity="0"
        style={{ animation: 'fade-on 12s 6.5s infinite' }} />
      <line x1="64" y1="76" x2="32" y2="108" stroke="var(--illustration-accent)" strokeWidth="1.5" opacity="0"
        style={{ animation: 'fade-on 12s 7.5s infinite' }} />

      {/* ── BFS node positions ── */}
      {/* Node 1 (root) */}
      <circle cx="120" cy="38" r="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
      <text x="120" y="42" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">1</text>
      {/* Node 2 */}
      <circle cx="72" cy="74" r="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
      <text x="72" y="78" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">2</text>
      {/* Node 3 */}
      <circle cx="168" cy="74" r="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
      <text x="168" y="78" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">3</text>
      {/* Node 4 */}
      <circle cx="32" cy="118" r="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
      <text x="32" y="122" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">4</text>
      {/* Node 5 */}
      <circle cx="112" cy="118" r="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
      <text x="112" y="122" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">5</text>
      {/* Node 6 */}
      <circle cx="128" cy="118" r="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
      <text x="128" y="122" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">6</text>
      {/* Node 7 */}
      <circle cx="208" cy="118" r="9" fill="var(--illustration-surface)" stroke="var(--illustration-surface-mid)" strokeWidth="1.5" />
      <text x="208" y="122" textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">7</text>

      {/* ── BFS phase: node highlights (0s–6.5s) ── */}
      {/* Node 1 lights at 0s */}
      <circle cx="120" cy="38" r="9" fill="var(--illustration-primary)" opacity="0"
        style={{ animation: 'fade-on 12s 0.0s infinite' }} />
      <text x="120" y="42" textAnchor="middle" fill="var(--illustration-light)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 0.0s infinite' }}>1</text>
      <circle cx="120" cy="38" r="4" fill="none" stroke="var(--illustration-primary)" strokeWidth="1" opacity="0"
        style={{ animation: 'pulse-ring 2s 0.0s infinite' }} />

      {/* Node 2 lights at 1.2s */}
      <circle cx="72" cy="74" r="9" fill="var(--illustration-secondary)" opacity="0"
        style={{ animation: 'fade-on 12s 1.2s infinite' }} />
      <text x="72" y="78" textAnchor="middle" fill="var(--illustration-light)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 1.2s infinite' }}>2</text>
      <circle cx="72" cy="74" r="4" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1" opacity="0"
        style={{ animation: 'pulse-ring 2s 1.2s infinite' }} />

      {/* Node 3 lights at 2.4s */}
      <circle cx="168" cy="74" r="9" fill="var(--illustration-secondary)" opacity="0"
        style={{ animation: 'fade-on 12s 2.4s infinite' }} />
      <text x="168" y="78" textAnchor="middle" fill="var(--illustration-light)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 2.4s infinite' }}>3</text>
      <circle cx="168" cy="74" r="4" fill="none" stroke="var(--illustration-secondary)" strokeWidth="1" opacity="0"
        style={{ animation: 'pulse-ring 2s 2.4s infinite' }} />

      {/* Node 4 lights at 3.6s */}
      <circle cx="32" cy="118" r="9" fill="var(--illustration-deep)" opacity="0"
        style={{ animation: 'fade-on 12s 3.6s infinite' }} />
      <text x="32" y="122" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 3.6s infinite' }}>4</text>
      <circle cx="32" cy="118" r="4" fill="none" stroke="var(--illustration-deep)" strokeWidth="1" opacity="0"
        style={{ animation: 'pulse-ring 2s 3.6s infinite' }} />

      {/* Node 5 lights at 4.0s */}
      <circle cx="112" cy="118" r="9" fill="var(--illustration-deep)" opacity="0"
        style={{ animation: 'fade-on 12s 4.0s infinite' }} />
      <text x="112" y="122" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 4.0s infinite' }}>5</text>
      <circle cx="112" cy="118" r="4" fill="none" stroke="var(--illustration-deep)" strokeWidth="1" opacity="0"
        style={{ animation: 'pulse-ring 2s 4.0s infinite' }} />

      {/* Node 6 lights at 4.4s */}
      <circle cx="128" cy="118" r="9" fill="var(--illustration-deep)" opacity="0"
        style={{ animation: 'fade-on 12s 4.4s infinite' }} />
      <text x="128" y="122" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 4.4s infinite' }}>6</text>
      <circle cx="128" cy="118" r="4" fill="none" stroke="var(--illustration-deep)" strokeWidth="1" opacity="0"
        style={{ animation: 'pulse-ring 2s 4.4s infinite' }} />

      {/* Node 7 lights at 4.8s */}
      <circle cx="208" cy="118" r="9" fill="var(--illustration-deep)" opacity="0"
        style={{ animation: 'fade-on 12s 4.8s infinite' }} />
      <text x="208" y="122" textAnchor="middle" fill="var(--illustration-accent)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 4.8s infinite' }}>7</text>
      <circle cx="208" cy="118" r="4" fill="none" stroke="var(--illustration-deep)" strokeWidth="1" opacity="0"
        style={{ animation: 'pulse-ring 2s 4.8s infinite' }} />

      {/* ── DFS phase: node highlights (6.5s–9.5s) ── */}
      {/* Node 1 re-lights for DFS at 6.5s */}
      <circle cx="120" cy="38" r="9" fill="var(--illustration-accent)" opacity="0"
        style={{ animation: 'fade-on 12s 6.5s infinite' }} />
      <text x="120" y="42" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 6.5s infinite' }}>1</text>

      {/* Node 2 re-lights for DFS at 7.5s */}
      <circle cx="72" cy="74" r="9" fill="var(--illustration-accent)" opacity="0"
        style={{ animation: 'fade-on 12s 7.5s infinite' }} />
      <text x="72" y="78" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 7.5s infinite' }}>2</text>

      {/* Node 4 re-lights for DFS at 8.5s */}
      <circle cx="32" cy="118" r="9" fill="var(--illustration-accent)" opacity="0"
        style={{ animation: 'fade-on 12s 8.5s infinite' }} />
      <text x="32" y="122" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="10" fontFamily="system-ui" fontWeight="700" opacity="0"
        style={{ animation: 'fade-on 12s 8.5s infinite' }}>4</text>

      {/* ── BFS agent dot: moves through all nodes in BFS order (0s–5.5s) ── */}
      <circle r="4" fill="var(--illustration-accent)" opacity="0" style={{ animation: 'fade-on 12s 0s infinite' }}>
        <animateMotion dur="5.5s" begin="0s" repeatCount="indefinite"
          keyPoints="0;0.15;0.3;0.45;0.6;0.75;0.9;1" keyTimes="0;0.15;0.3;0.45;0.6;0.75;0.9;1"
          calcMode="linear"
          path="M 120 38 L 72 74 L 168 74 L 32 118 L 112 118 L 128 118 L 208 118" />
      </circle>

      {/* ── DFS agent dot: moves deep path 1→2→4 (6.5s–9s) ── */}
      <circle r="4" fill="var(--illustration-lightest)" opacity="0" style={{ animation: 'fade-on 12s 6.5s infinite' }}>
        <animate attributeName="cx" values="120;72;32" dur="2.5s" begin="6.5s" repeatCount="indefinite" keyTimes="0;0.4;1" calcMode="linear" />
        <animate attributeName="cy" values="38;74;118" dur="2.5s" begin="6.5s" repeatCount="indefinite" keyTimes="0;0.4;1" calcMode="linear" />
      </circle>

      {/* ── Bottom badges ── */}
      <rect x="16" y="146" width="96" height="16" rx="4" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.7;0.2;0.2;0.7;0.7" dur="12s" repeatCount="indefinite" keyTimes="0;0.48;0.55;0.9;0.95;1" />
      </rect>
      <text x="64" y="157" textAnchor="middle" fill="var(--illustration-accent)" fontSize="9" fontFamily="system-ui" fontWeight="600">
        BFS: shortest path ✓
        <animate attributeName="opacity" values="1;1;0.2;0.2;1;1" dur="12s" repeatCount="indefinite" keyTimes="0;0.48;0.55;0.9;0.95;1" />
      </text>
      <rect x="128" y="146" width="96" height="16" rx="4" fill="var(--illustration-bg-dark)" stroke="var(--illustration-accent)" strokeWidth="0.5" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.2;0.7;0.7;0.2;0.2" dur="12s" repeatCount="indefinite" keyTimes="0;0.48;0.55;0.9;0.95;1" />
      </rect>
      <text x="176" y="157" textAnchor="middle" fill="var(--illustration-lightest)" fontSize="9" fontFamily="system-ui" fontWeight="600">
        DFS: less memory ✓
        <animate attributeName="opacity" values="0.2;0.2;1;1;0.2;0.2" dur="12s" repeatCount="indefinite" keyTimes="0;0.48;0.55;0.9;0.95;1" />
      </text>
    </svg>
  );
}

// ── Greedy Search & A* Illustration ──────────────────────────────────────────
function GreedySearchIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none">
      <defs>
        <radialGradient id="gs-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-warning)" stopOpacity="0.04" />
          <stop offset="50%" stopColor="var(--illustration-primary)" stopOpacity="0.04" />
          <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="240" height="176" fill="url(#gs-glow)" />

      {/* ── Labels ── */}
      <rect x="10" y="4" width="104" height="16" rx="4" fill="#1c0f00" stroke="var(--illustration-warning)" strokeWidth="0.5" opacity="0.5" />
      <text x="62" y="15" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">Greedy: h(n) only</text>
      <rect x="126" y="4" width="104" height="16" rx="4" fill="#00100a" stroke="var(--illustration-secondary)" strokeWidth="0.5" opacity="0.5" />
      <text x="178" y="15" textAnchor="middle" fill="var(--illustration-light)" fontSize="9" fontFamily="system-ui" fontWeight="700">A*: g(n)+h(n)</text>

      {/* ── Greedy path (amber, dashed, hits obstacle) ── */}
      <path d="M 32 88 L 100 50 L 150 50" fill="none" stroke="var(--illustration-warning)" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6">
        <animate attributeName="strokeDashoffset" values="0;-14" dur="1.5s" repeatCount="indefinite" />
      </path>
      {/* Obstacle blocking greedy */}
      <rect x="148" y="42" width="18" height="18" rx="3" fill="#7f1d1d" stroke="var(--illustration-danger)" strokeWidth="1" opacity="0.7" />
      <text x="157" y="54" textAnchor="middle" fill="var(--illustration-danger)" fontSize="12" fontFamily="system-ui" fontWeight="800">✗</text>
      <text x="157" y="36" textAnchor="middle" fill="var(--illustration-danger)" fontSize="7" fontFamily="system-ui" opacity="0.6">dead end</text>

      {/* ── A* path (violet, solid, reaches goal) ── */}
      <path d="M 32 105 Q 80 140 130 120 Q 170 105 208 88" fill="none" stroke="var(--illustration-secondary)" strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 3px rgba(129,140,248,0.4))' }} />
      <circle r="3.5" fill="var(--illustration-light)" opacity="0.8">
        <animateMotion dur="3.5s" repeatCount="indefinite" path="M 32 105 Q 80 140 130 120 Q 170 105 208 88" />
      </circle>

      {/* ── Start node ── */}
      <circle cx="24" cy="96" r="10" fill="var(--illustration-bg-dark)" stroke="var(--illustration-primary)" strokeWidth="1.5" />
      <text x="24" y="100" textAnchor="middle" fill="var(--illustration-accent)" fontSize="11" fontFamily="system-ui" fontWeight="800">S</text>

      {/* ── Goal node ── */}
      <circle cx="216" cy="88" r="10" fill="var(--illustration-success-bg)" stroke="var(--illustration-success-dim)" strokeWidth="1.5">
        <animate attributeName="r" values="10;13;10" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="216" y="92" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="11" fontFamily="system-ui" fontWeight="800">G</text>

      {/* ── Greedy agent (stuck at dead-end) ── */}
      <circle r="3" fill="var(--illustration-warning-light)" opacity="0.6">
        <animateMotion dur="4s" repeatCount="indefinite" path="M 24 96 L 100 50 L 148 50" />
      </circle>

      {/* ── f(n) formula badge on A* side ── */}
      <g style={{ animation: 'tof-up 0.6s 1s both' }}>
        <rect x="114" y="148" width="110" height="18" rx="5" fill="var(--illustration-surface)" stroke="var(--illustration-secondary)" strokeWidth="0.5" opacity="0.75" />
        <text x="169" y="160" textAnchor="middle" fill="var(--illustration-light)" fontSize="10" fontFamily="system-ui" fontWeight="700">f = g + h → optimal</text>
      </g>

      {/* ── Bottom label ── */}
      <text x="56" y="164" textAnchor="middle" fill="var(--illustration-warning)" fontSize="9" fontFamily="system-ui" opacity="0.6">Greedy: fastest ≠ best</text>
    </svg>
  );
}

// ── Staggered line reveal ─────────────────────────────────────────────────────
function StaggeredIntro({ lines }: { lines: string[] }) {
  const [visible, setVisible] = useState<number>(0);

  useEffect(() => {
    if (lines.length === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < lines.length; i++) {
      timers.push(setTimeout(() => setVisible(i), i * 2000));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [lines.length]);

  return (
    <>
      {lines.map((line, i) => {
        const isBullet = line.trim().startsWith('•');
        return (
          <span key={i}
            style={{
              display: 'block',
              transition: 'opacity 600ms ease-out, transform 600ms ease-out',
              opacity: i <= visible ? 1 : 0,
              transform: i <= visible ? 'translateY(0)' : 'translateY(12px)',
              paddingLeft: isBullet ? '1.25em' : undefined,
              textIndent: isBullet ? '-1.25em' : undefined,
              marginTop: isBullet && i > 0 ? '0.5em' : undefined,
            }}
          >{line}</span>
        );
      })}
    </>
  );
}

// ── BFS / DFS Breakdown (for section 2.2 only) ─────────────────────────────

function StepLine({ steps, shown }: { steps: BfsDfsStep[]; shown: boolean }) {
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!shown) { setActiveStep(-1); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < steps.length; i++) {
      timers.push(setTimeout(() => setActiveStep(i), i * 400));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [shown, steps.length]);

  const color = {
    line: 'border-[var(--brand-primary)]/30', fill: 'bg-[var(--brand-primary)]',
    circle: 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/30', text: 'text-[var(--brand-primary)]',
    title: 'text-white', sub: 'text-slate-300', dot: 'bg-[var(--brand-primary)]', ring: 'ring-[var(--brand-primary)]/40',
  };

  return (
    <div className="relative pl-8 mt-10">
      {/* ── Animated vertical line ── */}
      <div className={`absolute left-[7px] top-1 bottom-0 w-[2px] ${color.line} overflow-hidden rounded-full`}>
        <div className={`absolute top-0 left-0 w-full ${color.fill} transition-all duration-[1200ms] ease-out rounded-full`}
          style={{ height: activeStep >= 0 ? `${((activeStep + 1) / steps.length) * 100}%` : '0%' }} />
      </div>

      {/* ── Moving dot along the line ── */}
      {activeStep >= 0 && activeStep < steps.length - 1 && (
        <div className={`absolute left-[2px] w-[12px] h-[12px] rounded-full ${color.dot} transition-all duration-[400ms] ease-linear shadow-lg`}
          style={{ top: `${18 + (activeStep / (steps.length - 1)) * 120}px`, zIndex: 5 }} />
      )}

      {/* Steps */}
      <div className="space-y-7">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-1.5 h-1.5 rounded-full ${color.fill}`} />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">How it works</span>
        </div>
        {steps.map((step, i) => (
          <div key={i} className="relative"
            style={{
              transition: 'opacity 500ms ease-out, transform 500ms ease-out',
              opacity: activeStep >= i ? 1 : 0,
              transform: activeStep >= i ? 'translateY(0)' : 'translateY(12px)',
            }}>
            {/* Circle number badge */}
            <div className={`absolute -left-[26px] top-0 w-5 h-5 rounded-full ${color.circle} border flex items-center justify-center`}
              style={{
                animation: activeStep >= i ? 'step-pop 0.4s ease-out' : 'none',
                boxShadow: activeStep === i ? '0 0 0 4px rgba(0,191,179,0.15)' : 'none',
              }}>
              <span className={`text-[10px] font-bold ${color.text}`}>{i + 1}</span>
            </div>
            <h4 className={`text-sm font-bold ${color.title}`}>{step.title}</h4>
            <p className={`text-xs ${color.sub} mt-0.5 leading-relaxed`}>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BfsDfsBreakdown({ content }: { content: BfsDfsContent }) {
  const [bfsVisible, setBfsVisible] = useState(false);
  const [dfsVisible, setDfsVisible] = useState(false);
  const [bfsSentenceCount, setBfsSentenceCount] = useState(0);
  const [dfsSentenceCount, setDfsSentenceCount] = useState(0);
  const bfsRef = useRef<HTMLDivElement>(null);
  const dfsRef = useRef<HTMLDivElement>(null);
  const scrollRoot = useContext(ScrollContext).current;

  useEffect(() => {
    const el = bfsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setBfsVisible(true); obs.disconnect(); }
    }, { threshold: 0.12, root: scrollRoot ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (!bfsVisible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= content.bfsSentences.length; i++) {
      timers.push(setTimeout(() => setBfsSentenceCount(i), i * 400));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [bfsVisible, content.bfsSentences.length]);

  useEffect(() => {
    const el = dfsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDfsVisible(true); obs.disconnect(); }
    }, { threshold: 0.12, root: scrollRoot ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (!dfsVisible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= content.dfsSentences.length; i++) {
      timers.push(setTimeout(() => setDfsSentenceCount(i), i * 400));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [dfsVisible, content.dfsSentences.length]);

  const allBfsSentencesShown = bfsSentenceCount >= content.bfsSentences.length;
  const allDfsSentencesShown = dfsSentenceCount >= content.dfsSentences.length;

  return (
    <div className="space-y-28 mt-6">
      {/* ── BFS Section ── */}
      <div ref={bfsRef} className="transition-all duration-700"
        style={{ opacity: bfsVisible ? 1 : 0, transform: bfsVisible ? 'translateY(0)' : 'translateY(16px)' }}>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/30 text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest mb-4">
          Algorithm 1
        </span>
        <h3 className="text-2xl font-black text-white leading-tight">Breadth-First Search (BFS)</h3>

        <div className="mt-5 space-y-3">
          {content.bfsSentences.map((s, i) => (
            <p key={i} className="text-slate-300 text-sm leading-relaxed"
              style={{
                transition: 'opacity 600ms ease-out, transform 600ms ease-out',
                opacity: i < bfsSentenceCount ? 1 : 0,
                transform: i < bfsSentenceCount ? 'translateY(0)' : 'translateY(8px)',
              }}
            >{s}</p>
          ))}
        </div>

        <StepLine steps={content.bfsSteps} shown={allBfsSentencesShown} />
      </div>

      {/* ── DFS Section ── */}
      <div ref={dfsRef} className="transition-all duration-700"
        style={{ opacity: dfsVisible ? 1 : 0, transform: dfsVisible ? 'translateY(0)' : 'translateY(16px)' }}>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/30 text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest mb-4">
          Algorithm 2
        </span>
        <h3 className="text-2xl font-black text-white leading-tight">Depth-First Search (DFS)</h3>

        <div className="mt-5 space-y-3">
          {content.dfsSentences.map((s, i) => (
            <p key={i} className="text-slate-300 text-sm leading-relaxed"
              style={{
                transition: 'opacity 600ms ease-out, transform 600ms ease-out',
                opacity: i < dfsSentenceCount ? 1 : 0,
                transform: i < dfsSentenceCount ? 'translateY(0)' : 'translateY(8px)',
              }}
            >{s}</p>
          ))}
        </div>

        <StepLine steps={content.dfsSteps} shown={allDfsSentencesShown} />
      </div>
    </div>
  );
}

// ── Greedy / A* Breakdown (for section 2.3 only) ──────────────────────────

function GreedyAStarBreakdown({ content }: { content: GreedyAStarContent }) {
  // Rework Greedy/A* into chapter headings with 3 cards each, matching ProbabilityBreakdown layout.
  const [visibilities, setVisibilities] = useState<boolean[]>([false, false]);
  const [counts, setCounts] = useState<number[]>([0, 0]);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRoot = useContext(ScrollContext).current;

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (let i = 0; i < 2; i++) {
      const el = refs.current[i];
      if (!el) continue;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setVisibilities(prev => { const next = [...prev]; next[i] = true; return next; });
          obs.disconnect();
        }
      }, { threshold: 0.15, root: scrollRoot ?? null });
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach(o => o.disconnect());
  }, [scrollRoot]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // For each chapter (Greedy, A*), stagger reveal of sentences and (optionally) pseudocode
    const chapterSentences = [content.greedySentences, content.aStarSentences];
    for (let idx = 0; idx < chapterSentences.length; idx++) {
      if (!visibilities[idx]) continue;
      const total = chapterSentences[idx].length;
      for (let i = 1; i <= total; i++) {
        timers.push(setTimeout(() => {
          setCounts(prev => { const next = [...prev]; next[idx] = Math.max(next[idx], i); return next; });
        }, i * 350));
      }
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [visibilities, content.greedySentences, content.aStarSentences]);

  // Map optional image arrays if provided on the content object (non-destructive lookup)
  const greedyImages = (content as any).greedyImages as string[] | undefined;
  const aStarImages = (content as any).aStarImages as string[] | undefined;

  const chapters = [
    { title: 'Greedy Best-First Search', sentences: content.greedySentences, steps: content.greedySteps, images: greedyImages },
    { title: 'A* Search', sentences: content.aStarSentences, steps: content.aStarSteps, images: aStarImages },
  ];

  const accents = [
    { accent: 'from-indigo-600/10', border: 'border-indigo-500/20', badge: 'bg-emerald-600/20 text-indigo-300' },
    { accent: 'from-amber-600/10', border: 'border-amber-500/20', badge: 'bg-amber-600/20 text-amber-300' },
  ];

  return (
    <div className="mt-6 space-y-12">
      {chapters.map((ch, idx) => {
        const isVis = visibilities[idx];
        const count = counts[idx];
        const colors = accents[idx % accents.length];

        // split sentences into exactly 3 cards
        const cards: string[][] = [[], [], []];
        ch.sentences.forEach((s, i) => { cards[i % 3].push(s); });

        return (
          <div key={idx} ref={el => { refs.current[idx] = el; }}
            className={`rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.accent} to-slate-900/40 px-8 pt-8 pb-6 transition-all duration-700`}
            style={{ opacity: isVis ? 1 : 0, transform: isVis ? 'translateY(0)' : 'translateY(24px)' }}>
            <span className={`inline-flex items-center px-3 py-1 rounded-full ${colors.badge} text-[10px] font-bold uppercase tracking-widest mb-4`}>
              Chapter {idx + 1}
            </span>
            <h3 className="text-xl font-bold text-white mb-4">{ch.title}</h3>

            {/* optional image per chapter: show the first image as hero if provided */}
            {ch.images && ch.images[0] ? (
              <SwipeImage src={ch.images[0]} alt={ch.title} direction={idx % 2 === 0 ? 'left' : 'right'} visible={isVis} />
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {cards.map((cardLines, ci) => (
                <CardReveal key={ci} delayMs={ci * 120 + idx * 80}>
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 h-full">
                    {cardLines.length === 0 ? (
                      <p className="text-sm text-slate-300">&nbsp;</p>
                    ) : (
                      cardLines.map((line, li) => (
                        <div key={li} className="mb-3">
                          <p className="text-sm text-slate-300 leading-relaxed">{line}</p>
                        </div>
                      ))
                    )}
                    {/* optional image per card */}
                    {ch.images && ch.images[ci] ? (
                      <div className="mt-3">
                        {(() => {
                          const imgSrc = ch.images![ci];
                          const isDiagram = imgSrc.includes('wikipedia/commons') || imgSrc.includes('Breadth-first-tree') || imgSrc.includes('Depth-first-tree');
                          return (
                            <img src={imgSrc} alt={`${ch.title} ${ci + 1}`} className={`w-full h-36 rounded-md border border-slate-700/40 ${isDiagram ? 'object-contain p-2 bg-slate-200/90' : 'object-cover'}`} loading="lazy" />
                          );
                        })()}
                      </div>
                    ) : null}
                  </div>
                </CardReveal>
              ))}
            </div>

            {/* Keep StepLine (steps) to preserve original structured steps */}
            <div className="mt-6">
              <StepLine steps={ch.steps} shown={count >= ch.sentences.length} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Conditional Probability Explorer (interactive dice grid) ─────────────────

function ConditionalProbabilityExplorer() {
  const [condition, setCondition] = useState(6);
  const rows = [1, 2, 3, 4, 5, 6];

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-900/5 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      <p className="text-sm text-slate-300 mb-5">
        Roll two dice. The first die lands on <span className="text-blue-300 font-semibold">{condition}</span>.
        What is the probability that the sum is 12?
      </p>

      {/* Condition selector */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-slate-300">First die:</span>
        {rows.map(n => (
          <button key={n} onClick={() => setCondition(n)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              n === condition
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-110'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >{n}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 max-w-[320px] mx-auto mb-5">
        {/* Corner */}
        <div className="text-[10px] text-slate-300 flex items-center justify-center font-mono">D1/D2</div>
        {/* Column headers */}
        {rows.map(n => (
          <div key={`h${n}`} className="text-[10px] text-slate-300 flex items-center justify-center font-mono">{n}</div>
        ))}
        {rows.map(d1 => (
          <>
            {/* Row header */}
            <div className={`text-[10px] font-mono flex items-center justify-center rounded ${
              d1 === condition ? 'text-blue-300 font-bold' : 'text-slate-300'
            }`}>{d1}</div>
            {/* Cells */}
            {rows.map(d2 => {
              const sum = d1 + d2;
              const isConditionRow = d1 === condition;
              const isTarget = isConditionRow && sum === 12;
              return (
                <div key={`${d1}-${d2}`} className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-mono transition-all duration-300 ${
                  isTarget
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50 scale-110 shadow-lg shadow-amber-500/20 z-10'
                    : isConditionRow
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/20'
                    : 'bg-slate-800/40 text-slate-300 border border-slate-800/30'
                }`}>
                  {sum}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Formula */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/50 px-5 py-4 text-center space-y-2">
        <p className="text-sm font-bold text-white">
          P(Sum 12 | First die = {condition})
        </p>
        <p className="text-xs text-slate-300">
          = <span className="text-blue-300">P(Sum 12 and First die = {condition})</span> / <span className="text-blue-400">P(First die = {condition})</span>
        </p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-blue-300">1</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-400">6</span>
          <span className="text-slate-300 mx-1">=</span>
          <span className="text-amber-300 font-bold">1/6</span>
        </div>
      </div>

      {/* Single takeaway line */}
      <p className="mt-4 text-xs text-slate-300 text-center">
        <span className="text-blue-400">Condition restricts</span> the sample space to {condition} outcomes.
        <span className="text-amber-400"> Target</span> is <span className="text-white">1</span> of those.
      </p>
    </div>
  );
}

// ── Random Variable Explorer (Try It Yourself) ──────────────────────────────
function RandomVariableExplorer() {
  const [counts, setCounts] = useState([0, 0, 0, 0, 0, 0]);
  const [total, setTotal] = useState(0);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [showIndependence, setShowIndependence] = useState(false);
  const [die1, setDie1] = useState<number | null>(null);
  const [die2, setDie2] = useState<number | null>(null);
  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6);
      setLastRoll(val + 1);
      setCounts(prev => {
        const next = [...prev];
        next[val] += 1;
        return next;
      });
      setTotal(prev => prev + 1);
      setRolling(false);
    }, 150);
  }, [rolling]);

  const rollBoth = useCallback(() => {
    const a = Math.floor(Math.random() * 6);
    const b = Math.floor(Math.random() * 6);
    setDie1(a + 1);
    setDie2(b + 1);
  }, []);

  const reset = useCallback(() => {
    setCounts([0, 0, 0, 0, 0, 0]);
    setTotal(0);
    setLastRoll(null);
    setDie1(null);
    setDie2(null);
  }, []);

  const probs = counts.map(c => (total > 0 ? c / total : 0));

  return (
    <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-600/10 to-slate-900/40 p-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      {/* Simulator: Roll dice */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Left: Random Variable "Roll" */}
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 text-center">
          <h4 className="text-sm font-bold text-white mb-1">Random Variable: <span className="text-cyan-400">Roll</span></h4>
          <p className="text-xs text-slate-300 mb-4">Domain: {'{'}1, 2, 3, 4, 5, 6{'}'}</p>

          {/* Dice display */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center text-3xl font-black transition-all duration-150 ${
              rolling ? 'border-cyan-400 bg-cyan-900/20 scale-95' : lastRoll ? 'border-cyan-500 bg-cyan-900/30' : 'border-slate-700 bg-slate-800/50'
            }`}>
              {rolling ? (
                <span className="text-cyan-400 animate-pulse">?</span>
              ) : lastRoll ? (
                <span className="text-cyan-300">{lastRoll}</span>
              ) : (
                <span className="text-slate-300">-</span>
              )}
            </div>
          </div>

          <button
            onClick={roll}
            disabled={rolling}
            className="px-6 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-sm font-bold text-cyan-300 hover:bg-cyan-600/30 transition-colors disabled:opacity-40"
          >
            {rolling ? 'Rolling...' : 'Roll Dice'}
          </button>

          {lastRoll && (
            <p className="text-xs text-slate-300 mt-3">
              Roll({lastRoll}) = outcome <span className="text-cyan-300 font-bold">{lastRoll}</span>
            </p>
          )}
        </div>

        {/* Right: Distribution */}
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6">
          <h4 className="text-sm font-bold text-white mb-1">Probability Distribution</h4>
          <p className="text-xs text-slate-300 mb-4">Empirical distribution after <span className="text-white font-bold">{total}</span> rolls</p>

          {/* Bar chart */}
          <div className="flex items-end justify-center gap-2 h-28 mb-3">
            {counts.map((c, i) => {
              const h = total > 0 ? (c / total) * 80 : 0;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">{probs[i].toFixed(2)}</span>
                  <div
                    className="w-7 rounded-t-md transition-all duration-300"
                    style={{
                      height: `${Math.max(h, 2)}px`,
                      background: `linear-gradient(to top, rgba(6,182,212,${0.2 + i * 0.06}), rgba(34,211,238,${0.5 + i * 0.05}))`,
                    }}
                  />
                  <span className="text-[10px] text-slate-300">{i + 1}</span>
                </div>
              );
            })}
          </div>

          {/* Vector notation */}
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 px-4 py-2.5 text-center">
            <span className="text-xs text-slate-300">P(Roll) = </span>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {'<'}
              {probs.map((p, i) => (
                <span key={i}>{p.toFixed(2)}{i < 5 ? ', ' : ''}</span>
              ))}
              {'>'}
            </span>
          </div>
        </div>
      </div>

      {/* Independence demo */}
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6">
        <button
          onClick={() => setShowIndependence(!showIndependence)}
          className="flex items-center gap-2 text-sm font-bold text-white mb-3"
        >
          <svg className={`w-3 h-3 text-cyan-400 transition-transform ${showIndependence ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4l8 6-8 6V4z" />
          </svg>
          Independence Check: Roll Two Dice
        </button>

        {showIndependence && (
          <div>
            <p className="text-xs text-slate-300 mb-4">
              Roll two dice. The result of each is <span className="text-cyan-300 font-bold">independent</span> of the other.
              P(die₁ = a ∧ die₂ = b) = P(die₁ = a) × P(die₂ = b) = 1/6 × 1/6 = 1/36.
            </p>

            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-[10px] text-slate-300 mb-1">Die 1</p>
                <div className={`w-14 h-14 rounded-lg border flex items-center justify-center text-2xl font-black ${
                  die1 ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300' : 'border-slate-700 bg-slate-800/50 text-slate-300'
                }`}>
                  {die1 ?? '-'}
                </div>
              </div>
              <span className="text-lg text-slate-300">+</span>
              <div className="text-center">
                <p className="text-[10px] text-slate-300 mb-1">Die 2</p>
                <div className={`w-14 h-14 rounded-lg border flex items-center justify-center text-2xl font-black ${
                  die2 ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300' : 'border-slate-700 bg-slate-800/50 text-slate-300'
                }`}>
                  {die2 ?? '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={rollBoth}
                className="px-5 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-sm font-bold text-cyan-300 hover:bg-cyan-600/30 transition-colors"
              >
                Roll Both
              </button>
              {die1 && die2 && (
                <p className="text-xs text-slate-300">
                  P(<span className="text-cyan-300">{die1}</span> ∧ <span className="text-cyan-300">{die2}</span>) = <span className="text-cyan-300 font-bold">1/36</span>
                </p>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-slate-800/40 border border-slate-700/40 px-4 py-2.5">
              <p className="text-xs text-slate-300">
                Each roll pair: P(die₁ = a) = 1/6, P(die₂ = b) = 1/6, P(die₁ = a ∧ die₂ = b) = 1/36 = (1/6) × (1/6)
                <span className="block text-cyan-400/70 mt-1 text-[10px]">Independent! Knowing die₁ tells us nothing about die₂.</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reset */}
      {total > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={reset}
            className="text-xs text-slate-300 hover:text-slate-300 underline underline-offset-2 transition-colors"
          >
            Reset simulation
          </button>
        </div>
      )}
    </div>
  );
}

// ── Joint Probability Explorer (Try It Yourself) ────────────────────────────
type Scenario = 'independent' | 'dependent' | 'medical';
function JointProbabilityExplorer() {
  const [scenario, setScenario] = useState<Scenario>('independent');
  const [overlap, setOverlap] = useState(0.5);

  const scenarios = {
    independent: { label: 'Independent: Dice × Coin', P_A: 1/6, P_B: 0.5, desc: 'Rolling a die and flipping a coin are unrelated events.' },
    dependent: { label: 'Dependent: Clouds × Rain', P_A: 0.4, P_B: 0.3, desc: 'Clouds in the morning make rain in the afternoon more likely.' },
    medical: { label: 'Medical: Disease × Positive Test', P_A: 0.001, P_B: 0.05, desc: 'A rare disease with a test that sometimes produces false positives.' },
  };
  const sc = scenarios[scenario];

  // Compute joint probability from overlap slider
  const maxJoint = Math.min(sc.P_A, sc.P_B);
  const P_AB = maxJoint * overlap;
  const P_AnotB = sc.P_A - P_AB;
  const P_notAB = sc.P_B - P_AB;
  const P_notAnotB = 1 - (P_AB + P_AnotB + P_notAB);
  const P_A_given_B = P_AB / sc.P_B;
  const P_B_given_A = P_AB / sc.P_A;

  const circleR = 48;
  const offsetX = 20;

  return (
    <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-slate-900/40 p-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.entries(scenarios) as [Scenario, typeof sc][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => { setScenario(key); setOverlap(0.5); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              scenario === key
                ? 'bg-violet-600/30 border border-violet-500/40 text-violet-200'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-300 mb-5">{sc.desc}</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Venn diagram */}
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 flex flex-col items-center">
          <h4 className="text-sm font-bold text-white mb-3">Venn Diagram</h4>
          <svg width="220" height="160" viewBox="0 0 220 160">
            {/* Neither region (background) */}
            <rect x="0" y="0" width="220" height="160" rx="8" fill="var(--illustration-surface)" opacity="0.3" />

            {/* A-only region (left crescent) */}
            <clipPath id="aOnly">
              <circle cx={95 - offsetX} cy="80" r={circleR} />
            </clipPath>
            <clipPath id="notB">
              <circle cx={125 + offsetX} cy="80" r={circleR} clipRule="evenodd" />
            </clipPath>
            <g clipPath="url(#aOnly)">
              <rect x="0" y="0" width="220" height="160" fill="var(--illustration-primary)" opacity={Math.max(P_AnotB * 3, 0.05)} />
            </g>

            {/* B-only region (right crescent) */}
            <clipPath id="bOnly">
              <circle cx={125 + offsetX} cy="80" r={circleR} />
            </clipPath>
            <clipPath id="notA">
              <circle cx={95 - offsetX} cy="80" r={circleR} clipRule="evenodd" />
            </clipPath>
            <g clipPath="url(#bOnly)">
              <rect x="0" y="0" width="220" height="160" fill="var(--illustration-special-alt)" opacity={Math.max(P_notAB * 3, 0.05)} />
            </g>

            {/* Intersection (A∧B) */}
            <clipPath id="intersection">
              <circle cx={95 - offsetX} cy="80" r={circleR} />
              <circle cx={125 + offsetX} cy="80" r={circleR} />
            </clipPath>
            <g clipPath="url(#intersection)">
              <rect x="0" y="0" width="220" height="160" fill="var(--illustration-accent)" opacity={Math.max(P_AB * 5, 0.08)} />
            </g>

            {/* Circle outlines */}
            <circle cx={95 - offsetX} cy="80" r={circleR} fill="none" stroke="var(--illustration-secondary)" strokeWidth="1.2" opacity="0.5" />
            <circle cx={125 + offsetX} cy="80" r={circleR} fill="none" stroke="var(--illustration-special)" strokeWidth="1.2" opacity="0.5" />

            {/* Labels */}
            <text x={95 - offsetX - 35} y="84" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="13" fontFamily="system-ui" fontWeight="700">A</text>
            <text x={125 + offsetX + 35} y="84" textAnchor="middle" fill="var(--illustration-special)" fontSize="13" fontFamily="system-ui" fontWeight="700">B</text>
            <text x="110" y="84" textAnchor="middle" fill="var(--illustration-light)" fontSize="10" fontFamily="system-ui" fontWeight="600">A∧B</text>

            {/* Region labels below */}
            <text x="60" y="150" textAnchor="middle" fill="var(--illustration-secondary)" fontSize="7" fontFamily="system-ui">A only</text>
            <text x="110" y="150" textAnchor="middle" fill="var(--illustration-light)" fontSize="7" fontFamily="system-ui">Both</text>
            <text x="160" y="150" textAnchor="middle" fill="var(--illustration-special)" fontSize="7" fontFamily="system-ui">B only</text>
          </svg>

          {/* Overlap slider */}
          <div className="w-full mt-4">
            <div className="flex justify-between text-[10px] text-slate-300 mb-1">
              <span>Less overlap</span>
              <span>More overlap</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.01" value={overlap}
              onChange={e => setOverlap(Number(e.target.value))}
              className="ai-range-slider"
            />
            <p className="text-[10px] text-slate-300 mt-1 text-center">
              Adjust overlap: P(A ∧ B) = {P_AB.toFixed(3)}
            </p>
          </div>
        </div>

        {/* Right: Probability table */}
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6">
          <h4 className="text-sm font-bold text-white mb-3">Joint & Marginal Probabilities</h4>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-700/50 text-xs mb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/60">
                  <th className="px-3 py-2 text-slate-300 font-medium"></th>
                  <th className="px-3 py-2 text-slate-300 font-medium">B</th>
                  <th className="px-3 py-2 text-slate-300 font-medium">¬B</th>
                  <th className="px-3 py-2 text-slate-300 font-medium border-l border-slate-700/50">Marginal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-700/50">
                  <td className="px-3 py-2 text-slate-300 font-medium">A</td>
                  <td className="px-3 py-2 text-violet-300 font-mono">{P_AB.toFixed(3)}</td>
                  <td className="px-3 py-2 text-slate-300 font-mono">{P_AnotB.toFixed(3)}</td>
                  <td className="px-3 py-2 text-cyan-300 font-mono font-bold border-l border-slate-700/50">{sc.P_A.toFixed(3)}</td>
                </tr>
                <tr className="border-t border-slate-700/50">
                  <td className="px-3 py-2 text-slate-300 font-medium">¬A</td>
                  <td className="px-3 py-2 text-slate-300 font-mono">{P_notAB.toFixed(3)}</td>
                  <td className="px-3 py-2 text-slate-300 font-mono">{P_notAnotB.toFixed(3)}</td>
                  <td className="px-3 py-2 text-cyan-300 font-mono font-bold border-l border-slate-700/50">{(1 - sc.P_A).toFixed(3)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-700/50 bg-slate-800/30">
                  <td className="px-3 py-2 text-slate-300 font-medium">Marginal</td>
                  <td className="px-3 py-2 text-cyan-300 font-mono font-bold">{sc.P_B.toFixed(3)}</td>
                  <td className="px-3 py-2 text-cyan-300 font-mono font-bold">{(1 - sc.P_B).toFixed(3)}</td>
                  <td className="px-3 py-2 text-slate-300 font-mono border-l border-slate-700/50">1.000</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Conditional probabilities */}
          <div className="space-y-2">
            <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 px-4 py-2.5">
              <span className="text-xs text-slate-300">P(A | B) = </span>
              <span className="text-xs font-mono text-violet-300 font-bold">
                {P_A_given_B.toFixed(3)} {scenario !== 'independent' && <span className="text-slate-300">= {P_AB.toFixed(3)} / {sc.P_B.toFixed(3)}</span>}
              </span>
            </div>
            <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 px-4 py-2.5">
              <span className="text-xs text-slate-300">P(B | A) = </span>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                {P_B_given_A.toFixed(3)} {scenario !== 'independent' && <span className="text-slate-300">= {P_AB.toFixed(3)} / {sc.P_A.toFixed(3)}</span>}
              </span>
            </div>
            <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 px-4 py-2.5">
              <span className="text-xs text-slate-300">P(A ∧ B) = </span>
              <span className="text-xs font-mono text-violet-300 font-bold">{P_AB.toFixed(3)}</span>
              <span className="text-xs text-slate-300 ml-2">
                {scenario === 'independent' ? '= P(A) × P(B) (independent)' : scenario === 'dependent' ? '≠ P(A) × P(B) (dependent)' : '= P(B|A) × P(A)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bayesian Network Explorer (Try It Yourself) ─────────────────────────────
type BNNode = 'rain' | 'maintenance' | 'train' | 'appointment';
const BN_NODES: BNNode[] = ['rain', 'maintenance', 'train', 'appointment'];
const BN_LABELS: Record<BNNode, string> = { rain: 'Rain', maintenance: 'Maintenance', train: 'Train', appointment: 'Appointment' };
const BN_COLORS: Record<BNNode, string> = { rain: 'var(--illustration-special-alt)', maintenance: 'var(--illustration-warning)', train: 'var(--illustration-deep)', appointment: 'var(--illustration-success-dim)' };
const BN_ORDER: BNNode[] = ['rain', 'maintenance', 'train', 'appointment'];

const BN_CPTS: Record<BNNode, { header: string[]; rows: (string | number)[][] }> = {
  rain: {
    header: ['Value', 'P'],
    rows: [['none', 0.7], ['light', 0.2], ['heavy', 0.1]],
  },
  maintenance: {
    header: ['R', 'yes', 'no'],
    rows: [['none', 0.4, 0.6], ['light', 0.2, 0.8], ['heavy', 0.1, 0.9]],
  },
  train: {
    header: ['R', 'M', 'on time', 'delayed'],
    rows: [
      ['none', 'yes', 0.8, 0.2],
      ['none', 'no', 0.9, 0.1],
      ['light', 'yes', 0.6, 0.4],
      ['light', 'no', 0.7, 0.3],
      ['heavy', 'yes', 0.4, 0.6],
      ['heavy', 'no', 0.5, 0.5],
    ],
  },
  appointment: {
    header: ['T', 'attend', 'miss'],
    rows: [['on time', 0.9, 0.1], ['delayed', 0.6, 0.4]],
  },
};

const PRESETS: { label: string; values: Partial<Record<BNNode, string>> }[] = [
  { label: 'Light rain, no maintenance', values: { rain: 'light', maintenance: 'no', train: 'on time', appointment: 'attend' } },
  { label: 'Heavy rain, train delayed', values: { rain: 'heavy', maintenance: 'no', train: 'delayed', appointment: 'miss' } },
  { label: 'Train on time', values: { rain: 'none', maintenance: 'yes', train: 'on time', appointment: 'attend' } },
];

function BayesianNetworkExplorer() {
  const [values, setValues] = useState<Partial<Record<BNNode, string>>>({});
  const [openNode, setOpenNode] = useState<BNNode | null>(null);

  const allSet = BN_NODES.every(n => values[n]);

  const setValue = (node: BNNode, val: string) => {
    setValues(prev => {
      if (prev[node] === val) {
        const next = { ...prev };
        delete next[node];
        return next;
      }
      const idx = BN_ORDER.indexOf(node);
      const next: Partial<Record<BNNode, string>> = {};
      for (const n of BN_ORDER) {
        if (n === node) next[n] = val;
        else if (idx >= BN_ORDER.indexOf(n)) next[n] = prev[n];
      }
      return next;
    });
    setOpenNode(null);
  };

  const loadPreset = (preset: Partial<Record<BNNode, string>>) => {
    setValues({ ...preset });
    setOpenNode(null);
  };

  const reset = () => { setValues({}); setOpenNode(null); };

  function lookupProb(node: BNNode): number | null {
    const val = values[node];
    if (!val) return null;
    const cpt = BN_CPTS[node];
    if (node === 'rain') {
      const row = cpt.rows.find(r => r[0] === val);
      return row ? (row[1] as number) : null;
    }
    if (node === 'maintenance') {
      const r = values.rain;
      if (!r) return null;
      const row = cpt.rows.find(rr => rr[0] === r);
      if (!row) return null;
      return row[val === 'yes' ? 1 : 2] as number;
    }
    if (node === 'train') {
      const r = values.rain;
      const m = values.maintenance;
      if (!r || !m) return null;
      const row = cpt.rows.find(rr => rr[0] === r && rr[1] === m);
      if (!row) return null;
      return row[val === 'on time' ? 2 : 3] as number;
    }
    if (node === 'appointment') {
      const t = values.train;
      if (!t) return null;
      const row = cpt.rows.find(rr => rr[0] === t);
      if (!row) return null;
      return row[val === 'attend' ? 1 : 2] as number;
    }
    return null;
  }

  const jointProb = allSet
    ? BN_ORDER.reduce((acc, n) => { const p = lookupProb(n); return p !== null ? acc * p : acc; }, 1)
    : null;

  const isReady = (node: BNNode): boolean =>
    node === 'rain' || (node === 'maintenance' && !!values.rain) ||
    (node === 'train' && !!values.rain && !!values.maintenance) ||
    (node === 'appointment' && !!values.train);

  const optionsFor = (node: BNNode): string[] =>
    node === 'rain' ? ['none', 'light', 'heavy']
    : node === 'maintenance' ? ['yes', 'no']
    : node === 'train' ? ['on time', 'delayed']
    : ['attend', 'miss'];

  // ── SVG graph layout ──
  const NODE_POS: Record<BNNode, { x: number; y: number }> = {
    rain: { x: 120, y: 50 },
    maintenance: { x: 340, y: 50 },
    train: { x: 230, y: 140 },
    appointment: { x: 230, y: 230 },
  };

  type BNEdge = [BNNode, BNNode];
  const EDGES: BNEdge[] = [
    ['rain', 'maintenance'],
    ['rain', 'train'],
    ['maintenance', 'train'],
    ['train', 'appointment'],
  ];

  // Check if an edge is "active" (both nodes have values)
  const edgeActive = (from: BNNode, to: BNNode) => !!values[from] && !!values[to];

  return (
    <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m3-6H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      {/* ── Presets row ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => loadPreset(p.values)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-indigo-500/40 hover:text-indigo-200 transition-colors"
          >{p.label}</button>
        ))}
        {Object.keys(values).length > 0 && (
          <button onClick={reset}
            className="px-3 py-1.5 rounded-xl text-[10px] text-slate-300 hover:text-slate-300 underline underline-offset-2"
          >Reset</button>
        )}
      </div>

      {/* ── Visual graph showing current state ── */}
      <div className="rounded-xl bg-slate-900/30 border border-slate-800/50 p-4 mb-6">
        <svg viewBox="0 0 460 160" className="w-full h-auto">
          {/* Edges */}
          {EDGES.map(([from, to], i) => {
            const f = NODE_POS[from];
            const t = NODE_POS[to];
            const active = edgeActive(from, to);
            const edgeCol = active ? 'var(--illustration-success-bright)' : 'var(--illustration-surface-mid)';
            return (
              <line key={i} x1={f.x} y1={f.y + 18} x2={t.x} y2={t.y - 18}
                stroke={edgeCol} strokeWidth={active ? 2 : 1}
                strokeDasharray={active ? 'none' : '4,3'}
                opacity={active ? 0.8 : 0.25}
                markerEnd={active ? 'url(#bn-arr-active)' : 'url(#bn-arr-inactive)'}
              />
            );
          })}
          {/* Nodes */}
          {BN_ORDER.map((node) => {
            const { x, y } = NODE_POS[node];
            const col = BN_COLORS[node];
            const val = values[node];
            const prob = lookupProb(node);
            return (
              <g key={node}>
                <rect x={x - 36} y={y - 16} width="72" height="36" rx="8"
                  fill={val ? `${col}18` : 'var(--illustration-surface)'}
                  stroke={val ? col : 'var(--illustration-surface-alt)'}
                  strokeWidth={val ? 1.5 : 0.8}
                />
                <text x={x} y={y - 1} textAnchor="middle" fill={val ? col : 'var(--illustration-element-muted)'}
                  fontSize="9" fontWeight="700" fontFamily="system-ui"
                >{BN_LABELS[node]}</text>
                <text x={x} y={y + 11} textAnchor="middle" fill={val ? 'var(--illustration-track)' : 'var(--illustration-surface-mid)'}
                  fontSize="7" fontFamily="system-ui" fontWeight={val ? '600' : '400'}
                >{val || '?'}{prob !== null ? `  (${prob.toFixed(2)})` : ''}</text>
              </g>
            );
          })}
          <defs>
            <marker id="bn-arr-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--illustration-success-bright)" opacity="0.8" />
            </marker>
            <marker id="bn-arr-inactive" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill="var(--illustration-surface-mid)" opacity="0.3" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* ── Variable selectors in a 2x2 grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {BN_ORDER.map((node, idx) => {
          const col = BN_COLORS[node];
          const val = values[node];
          const prob = lookupProb(node);
          const options = optionsFor(node);
          const ready = isReady(node);

          return (
            <div key={node} className={`rounded-xl border bg-slate-900/30 p-4 transition-all duration-300 ${
              val ? 'border-indigo-500/30' : 'border-slate-800/50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                    style={{ background: col }}>{idx + 1}</span>
                  <span className="text-sm font-bold text-white" style={{ color: col }}>{BN_LABELS[node]}</span>
                  {node !== 'rain' && <span className="text-[9px] text-slate-300">
                    P({BN_LABELS[node]} | {node === 'maintenance' ? 'Rain' : node === 'train' ? 'Rain, Maintenance' : 'Train'})
                  </span>}
                  {node === 'rain' && <span className="text-[9px] text-slate-300">Prior</span>}
                </div>
                {prob !== null && (
                  <span className="text-[10px] font-mono font-bold text-indigo-300">= {prob.toFixed(1)}</span>
                )}
              </div>

              {/* Option buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {options.map(opt => {
                  const isActive = val === opt;
                  return (
                    <button key={opt}
                      onClick={() => ready && setValue(node, opt)}
                      disabled={!ready}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-200'
                          : ready
                            ? 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-indigo-500/30 hover:text-slate-200'
                            : 'bg-slate-800/30 border border-slate-800/40 text-slate-300 cursor-not-allowed'
                      }`}
                    >{opt}</button>
                  );
                })}
              </div>

              {/* Mini CPT table */}
              <div className="rounded-lg bg-slate-800/30 border border-slate-800/50 overflow-hidden">
                <table className="w-full text-[9px]">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-300">
                      {BN_CPTS[node].header.map((h, i) => (
                        <th key={i} className="px-2 py-1 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BN_CPTS[node].rows.map((row, ri) => {
                      const isActive = val && (node === 'rain' ? row[0] === val
                        : node === 'maintenance' ? row[0] === values.rain && row[1] === val
                        : node === 'train' ? row[0] === values.rain && row[1] === values.maintenance && row[2] === val
                        : row[0] === values.train && row[1] === val);
                      return (
                        <tr key={ri} className={`border-t border-slate-800/40 ${isActive ? 'bg-emerald-900/15' : ''}`}>
                          {row.map((cell, ci) => (
                            <td key={ci} className={`px-2 py-1 ${ci === row.length - 1 ? 'font-mono' : ''} ${
                              isActive && ci === row.length - 1 ? 'text-indigo-300 font-bold' : isActive ? 'text-indigo-200' : 'text-slate-300'
                            }`}>
                              {typeof cell === 'number' ? cell.toFixed(1) : cell}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Joint probability result ── */}
      <div className={`rounded-2xl border p-6 transition-all duration-500 ${
        allSet ? 'border-indigo-500/30 bg-emerald-900/10' : 'border-slate-800/50 bg-slate-900/20'
      }`}>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Joint Probability
        </h4>
        {allSet ? (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {BN_ORDER.map((n, i) => {
                const p = lookupProb(n);
                return (
                  <span key={n} className="flex items-center gap-1">
                    <span className="font-mono text-[11px] text-slate-300">
                      P({n === 'rain' ? values.rain : n === 'maintenance' ? `${values.maintenance}|${values.rain}` : n === 'train' ? `${values.train}|${values.rain},${values.maintenance}` : `${values.appointment}|${values.train}`})
                    </span>
                    <span className="font-mono text-[11px] text-indigo-300 font-bold">= {p?.toFixed(2)}</span>
                    {i < BN_ORDER.length - 1 && <span className="text-slate-300 mx-1 text-[10px]">×</span>}
                  </span>
                );
              })}
            </div>
            <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 px-5 py-3">
              <p className="text-xs text-slate-300 mb-1">
                P({values.rain}, {values.maintenance}, {values.train}, {values.appointment}) =
              </p>
              <p className="text-sm font-mono text-indigo-300 font-bold">
                {BN_ORDER.map(n => lookupProb(n)).join(' × ')} = <span className="text-white">{jointProb?.toFixed(4)}</span>
              </p>
              <p className="text-[10px] text-slate-300 mt-2">
                There is a <span className="text-white font-bold">{(jointProb! * 100).toFixed(1)}%</span> probability of this exact scenario occurring.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-slate-300">Select a value for each variable above to see the joint probability calculation.</p>
        )}
      </div>
    </div>
  );
}

// ── Probability Breakdown (for section 4.1) ─────────────────────────────────

function ChapterBreakdown({ content, stagger = true, advance, scrollRoot: scrollRootProp, light = false }: { content: ProbabilityContent; stagger?: boolean; advance: (to: number) => void; scrollRoot?: HTMLElement | null; light?: boolean }) {
  const [chapterVisibility, setChapterVisibility] = useState<number[]>(content.chapters.map(() => 0));
  const chapterRefs = useRef<(HTMLDivElement | null)[]>(Array(content.chapters.length).fill(null));
  const scrollRoot = useContext(ScrollContext).current ?? scrollRootProp;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const observers: IntersectionObserver[] = [];
    content.chapters.forEach((chapter, idx) => {
      const el = chapterRefs.current[idx];
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          advance(idx);
          const total = chapter.sentences.length + (chapter.terms?.length ?? 0);
          if (!stagger) {
            setChapterVisibility(prev => {
              if (prev[idx] > 0) return prev;
              const next = [...prev];
              next[idx] = total;
              return next;
            });
          } else {
            setChapterVisibility(prev => {
              if (prev[idx] > 0) return prev;
              const next = [...prev];
              next[idx] = 1;
              return next;
            });
            for (let i = 1; i < total; i++) {
              timers.push(setTimeout(() => {
                setChapterVisibility(prev => {
                  const next = [...prev];
                  next[idx] = Math.max(next[idx], i + 1);
                  return next;
                });
              }, i * 350));
            }
            setTimeout(() => obs.disconnect(), total * 350 + 100);
          }
        }
      }, { threshold: 0.15, root: scrollRoot ?? null });
      obs.observe(el);
      observers.push(obs);
    });
    return () => {
      observers.forEach(o => o.disconnect());
      timers.forEach(t => clearTimeout(t));
    };
  }, [scrollRoot, stagger, advance]);

  const CHAPTER_COLORS = [
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]', termBorder: 'border-[var(--brand-primary)]/10', termBg: 'bg-[var(--brand-primary)]/10', termText: 'text-[var(--brand-primary)]' },
  ];

  function renderSentence(s: string, i: number, visible: boolean) {
    const baseStyle = {
      transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
    };
    if (s.startsWith('Formula:')) {
      const body = s.replace('Formula:', '').trim();
      return (
        <div key={i} className={`rounded-xl px-5 py-4 font-mono text-sm leading-relaxed whitespace-pre-wrap ${light ? 'bg-[var(--surface-card)] border border-[var(--border-medium)] text-[var(--brand-primary)]' : 'bg-slate-800/60 border border-slate-700/50 text-cyan-300'}`}
          style={baseStyle}
        >{body}</div>
      );
    }
    if (s.startsWith('In simple words:')) {
      return (
        <p key={i} className={`text-sm leading-relaxed italic ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}
          style={baseStyle}
        >{s}</p>
      );
    }
    return (
      <p key={i} className={`text-sm leading-relaxed ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}
        style={baseStyle}
      >{s}</p>
    );
  }

  return (
    <div className="mt-6">
      <div className="space-y-8">
      {content.chapters.map((chapter, idx) => {
        const colors = CHAPTER_COLORS[idx % CHAPTER_COLORS.length];
        const visibleCount = chapterVisibility[idx];
        return (
          <div key={idx} ref={el => { chapterRefs.current[idx] = el; }}>
            <div className={`rounded-3xl px-8 pt-8 pb-4 transition-all duration-700 ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : `border ${colors.border} bg-gradient-to-br ${colors.accent} to-slate-900/40`}`}
              style={{
                opacity: visibleCount > 0 ? 1 : 0,
                transform: visibleCount > 0 ? 'translateY(0)' : 'translateY(40px)',
              }}
            >
              <span className={`inline-flex items-center px-3 py-1 rounded-full ${colors.badge} text-[10px] font-bold uppercase tracking-widest mb-4`}>
                Chapter {idx + 1}
              </span>
              <h3 className={`text-xl font-bold mb-4 ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>{chapter.title}</h3>

              {chapter.image && (
                <SwipeImage
                  src={chapter.image}
                  alt={chapter.imageAlt || chapter.title}
                  direction={idx % 2 === 0 ? 'left' : 'right'}
                  visible={visibleCount > 0}
                />
              )}

              {(() => {
                const hasExplorer = chapter.interactive === 'k-means' || chapter.interactive === 'clue-code' || chapter.interactive === 'mastermind' || chapter.interactive === 'knowledge-engineering-try-it-yourself' || chapter.interactive === 'conditional-probability' || chapter.interactive === 'random-variable' || chapter.interactive === 'joint-probability' || chapter.interactive === 'bayesian-network' || chapter.interactive === 'markov-chain' || chapter.interactive === 'local-search' || chapter.interactive === 'state-space' || chapter.interactive === 'simulated-annealing' || chapter.interactive === 'feasible-region' || chapter.interactive === 'arc-consistency' || chapter.interactive === 'neural-network-structure' || chapter.interactive === 'activation-function-explorer' || chapter.interactive === 'training-hyperparameters' || chapter.interactive === 'perceptron-learning' || chapter.interactive === 'backpack-optimization' || chapter.interactive === 'password-state-space' || chapter.interactive === 'study-day-planner';
                const hasTerms = chapter.terms && chapter.terms.length > 0;
                const hasExample = !!chapter.example;
                return (
                  <>
                    <div className={`space-y-3 ${hasExplorer || hasTerms || hasExample ? 'mb-6' : ''}`}>
                      {chapter.sentences.map((s, i) => renderSentence(s, i, visibleCount > i))}
                    </div>

                    {hasExplorer ? (
                      <div className={hasTerms || hasExample ? 'mb-6' : ''}>
                        {chapter.interactive === 'k-means' ? <KMeansClustering /> : null}
                        {chapter.interactive === 'perceptron-learning' ? <PerceptronLearningExplorer /> : null}
                        {chapter.interactive === 'mastermind' ? <MastermindInteractiveWidget /> : null}
                        {chapter.interactive === 'clue-code' ? <ClueCodeWidget /> : null}
                        {chapter.interactive === 'knowledge-engineering-try-it-yourself' ? <KnowledgeEngineeringTryItYourselfWidget /> : null}
                        {chapter.interactive === 'conditional-probability' ? <ConditionalProbabilityExplorer /> : null}
                        {chapter.interactive === 'random-variable' ? <RandomVariableExplorer /> : null}
                        {chapter.interactive === 'joint-probability' ? <JointProbabilityExplorer /> : null}
                        {chapter.interactive === 'bayesian-network' ? <BayesianNetworkExplorer /> : null}
                        {chapter.interactive === 'markov-chain' ? <MarkovChainExplorer /> : null}
                        {chapter.interactive === 'local-search' ? <LocalSearchExplorer /> : null}
                        {chapter.interactive === 'state-space' ? <StateSpaceExplorer /> : null}
                        {chapter.interactive === 'simulated-annealing' ? <SimulatedAnnealingExplorer /> : null}
                        {chapter.interactive === 'feasible-region' ? <FeasibleRegionExplorer /> : null}
                        {chapter.interactive === 'arc-consistency' ? <ArcConsistencyExplorer /> : null}
                        {chapter.interactive === 'neural-network-structure' ? <NeuralNetworkStructureExplorer /> : null}
                        {chapter.interactive === 'activation-function-explorer' ? <ActivationFunctionExplorer /> : null}
                        {chapter.interactive === 'training-hyperparameters' ? <TrainingHyperparameterExplorer /> : null}
                        {chapter.interactive === 'backpack-optimization' ? <BackpackOptimization /> : null}
                        {chapter.interactive === 'password-state-space' ? <PasswordStateSpace /> : null}
                        {chapter.interactive === 'study-day-planner' ? <StudyDayPlanner /> : null}
                      </div>
                    ) : null}

                    {hasExample && chapter.example && (
                      <div className={`rounded-xl overflow-hidden ${hasTerms ? 'mb-6' : ''} ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-card)]' : 'border border-slate-700/50 bg-slate-900/50'}`}>
                        <p className={`text-xs font-bold px-5 pt-4 ${light ? 'text-[var(--text-primary)]' : 'text-slate-300'}`}>{chapter.example.title}</p>
                        <div className="overflow-x-auto px-5 pt-3 pb-4">
                          <table className="w-full text-xs font-mono border-collapse">
                            <tbody>
                              {chapter.example.table.map((row, ri) => (
                                <tr key={ri}>
                                  {row.map((cell, ci) => (
                                    <td key={ci} className={`px-3 py-2 ${light ? `border border-[var(--border-medium)] ${ri === 0 || ci === 0 ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--brand-primary)]'}` : `border border-slate-700/40 ${ri === 0 || ci === 0 ? 'text-slate-300 font-semibold' : 'text-indigo-300'}`}`}>
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {chapter.example.note && (
                          <p className={`text-[11px] px-5 pb-4 leading-relaxed ${light ? 'text-[var(--text-muted)]' : 'text-slate-300'}`}>{chapter.example.note}</p>
                        )}
                      </div>
                    )}

                    {hasTerms && (
                      <div className="grid gap-3">
                        {chapter.terms!.map((t, j) => {
                          const termIndex = chapter.sentences.length + j;
                          return (
                            <div key={j}
                              className={`rounded-xl border ${colors.termBorder} ${colors.termBg} px-5 py-4 transition-all duration-500`}
                              style={{
                                opacity: visibleCount > termIndex ? 1 : 0,
                                transform: visibleCount > termIndex ? 'translateY(0)' : 'translateY(8px)',
                              }}
                            >
                              <span className={`text-sm font-bold ${colors.termText}`}>{t.term}</span>
                              <p className={`text-xs mt-1 leading-relaxed ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>{t.definition}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

// ── Neural Network Architecture Hero Illustration ────────────────────────────
// ── Training & Backpropagation Hero Illustration ─────────────────────────────
function TrainingBackpropIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tb-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-warning)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="92" rx="112" ry="58" fill="url(#tb-glow)" />

      <text x="120" y="16" textAnchor="middle" fontSize="7" fontWeight="600" letterSpacing="1" fill="var(--illustration-secondary)" opacity="0.75">FORWARD PASS →</text>

      {/* Input layer */}
      <circle cx="26" cy="66" r="5.5" fill="var(--illustration-primary)" fillOpacity="0.15" stroke="var(--illustration-secondary)" strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="26" cy="90" r="5.5" fill="var(--illustration-primary)" fillOpacity="0.15" stroke="var(--illustration-secondary)" strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="26" cy="114" r="5.5" fill="var(--illustration-primary)" fillOpacity="0.15" stroke="var(--illustration-secondary)" strokeWidth="1" strokeOpacity="0.6" />

      {/* Hidden layer */}
      <circle cx="88" cy="54" r="5.5" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="88" cy="78" r="5.5" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="88" cy="102" r="5.5" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="88" cy="126" r="5.5" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.6" />

      {/* Output / prediction node */}
      <circle cx="152" cy="90" r="6.5" fill="var(--illustration-success-bg)" fillOpacity="0.5" stroke="var(--illustration-success-bright)" strokeWidth="1.25" />

      {/* Forward-pass connections */}
      {[66, 90, 114].map((iy) =>
        [54, 78, 102, 126].map((hy) => (
          <line key={`if-${iy}-${hy}`} x1="31" y1={iy} x2="83" y2={hy} stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.16" />
        ))
      )}
      {[54, 78, 102, 126].map((hy) => (
        <line key={`ho-${hy}`} x1="93" y1={hy} x2="146" y2="90" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.2" />
      ))}

      {/* Forward pass — animated particle, left to right */}
      <circle r="2" fill="var(--illustration-secondary)">
        <animateMotion dur="2.2s" repeatCount="indefinite" path="M 26 90 Q 58 84 88 78 Q 120 84 152 90" />
      </circle>

      {/* Prediction vs target */}
      <g transform="translate(152, 90)">
        <text x="0" y="-13" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--illustration-success-bright)">PREDICTED</text>
      </g>
      <g transform="translate(190, 90)">
        <path d="M0 -7 L2.1 -2.1 L7.4 -1.7 L3.3 1.7 L4.6 7 L0 4 L-4.6 7 L-3.3 1.7 L-7.4 -1.7 L-2.1 -2.1 Z" fill="var(--illustration-warning)" fillOpacity="0.85" />
        <text x="0" y="-13" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--illustration-warning)">TARGET</text>
      </g>
      <line x1="159" y1="90" x2="182" y2="90" stroke="var(--illustration-warning)" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
      <text x="170" y="103" textAnchor="middle" fontSize="5.5" fontWeight="600" fill="var(--illustration-warning)" opacity="0.85">ERROR</text>

      {/* Backpropagation — dashed arc flowing right to left, error correcting weights */}
      <path d="M190 100 C 155 146, 60 146, 26 128" stroke="var(--illustration-warning)" strokeWidth="1.25" strokeDasharray="4,3" fill="none" opacity="0.55" />
      <circle r="2" fill="var(--illustration-warning)">
        <animateMotion dur="2.6s" repeatCount="indefinite" path="M190 100 C 155 146, 60 146, 26 128" />
      </circle>
      <g opacity="0.85">
        <path d="M143 140 l-3.5 -1.5 M143 140 l-1 -3.5" stroke="var(--illustration-warning)" strokeWidth="1" strokeLinecap="round" />
        <path d="M72 144 l-3.5 -1 M72 144 l0 -3.6" stroke="var(--illustration-warning)" strokeWidth="1" strokeLinecap="round" />
      </g>
      <text x="120" y="162" textAnchor="middle" fontSize="6.5" fontWeight="600" letterSpacing="0.75" fill="var(--illustration-warning)" opacity="0.8">← BACKPROPAGATION (ADJUST WEIGHTS)</text>
    </svg>
  );
}

function NNArchitectureIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nn-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#nn-glow)" />

      {/* Input layer (3 neurons) */}
      <circle cx="30" cy="60" r="7" fill="var(--illustration-primary)" fillOpacity="0.15" stroke="var(--illustration-secondary)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="30" cy="88" r="7" fill="var(--illustration-primary)" fillOpacity="0.15" stroke="var(--illustration-secondary)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="30" cy="116" r="7" fill="var(--illustration-primary)" fillOpacity="0.15" stroke="var(--illustration-secondary)" strokeWidth="1" strokeOpacity="0.5" />

      {/* Hidden layer (4 neurons) */}
      <circle cx="90" cy="42" r="7" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="90" cy="70" r="7" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="90" cy="98" r="7" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="90" cy="126" r="7" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.5" />

      {/* Hidden layer 2 (3 neurons) */}
      <circle cx="150" cy="54" r="7" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="150" cy="82" r="7" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="150" cy="110" r="7" fill="var(--illustration-deep)" fillOpacity="0.15" stroke="var(--illustration-accent)" strokeWidth="1" strokeOpacity="0.5" />

      {/* Output layer (2 neurons) */}
      <circle cx="210" cy="70" r="7" fill="var(--illustration-success-dim)" fillOpacity="0.15" stroke="var(--illustration-success-bright)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="210" cy="106" r="7" fill="var(--illustration-success-dim)" fillOpacity="0.15" stroke="var(--illustration-success-bright)" strokeWidth="1" strokeOpacity="0.5" />

      {/* Connection lines (input to hidden 1) */}
      <line x1="37" y1="60" x2="83" y2="42" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="60" x2="83" y2="70" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="60" x2="83" y2="98" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="60" x2="83" y2="126" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="88" x2="83" y2="42" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="88" x2="83" y2="70" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="88" x2="83" y2="98" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="88" x2="83" y2="126" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="116" x2="83" y2="42" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="116" x2="83" y2="70" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="116" x2="83" y2="98" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />
      <line x1="37" y1="116" x2="83" y2="126" stroke="var(--illustration-primary)" strokeWidth="0.5" opacity="0.15" />

      {/* Connection lines (hidden 1 to hidden 2) */}
      <line x1="97" y1="42" x2="143" y2="54" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="42" x2="143" y2="82" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="42" x2="143" y2="110" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="70" x2="143" y2="54" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="70" x2="143" y2="82" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="70" x2="143" y2="110" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="98" x2="143" y2="54" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="98" x2="143" y2="82" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="98" x2="143" y2="110" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="126" x2="143" y2="54" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="126" x2="143" y2="82" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="97" y1="126" x2="143" y2="110" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />

      {/* Connection lines (hidden 2 to output) */}
      <line x1="157" y1="54" x2="203" y2="70" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="157" y1="54" x2="203" y2="106" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="157" y1="82" x2="203" y2="70" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="157" y1="82" x2="203" y2="106" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="157" y1="110" x2="203" y2="70" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />
      <line x1="157" y1="110" x2="203" y2="106" stroke="var(--illustration-deep)" strokeWidth="0.5" opacity="0.15" />

      {/* Layer labels */}
      <text x="30" y="144" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--illustration-secondary)" opacity="0.6">Input</text>
      <text x="90" y="148" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--illustration-accent)" opacity="0.6">Hidden</text>
      <text x="150" y="140" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--illustration-accent)" opacity="0.6">Hidden</text>
      <text x="210" y="128" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--illustration-success-bright)" opacity="0.6">Output</text>

      {/* Bottom subtext */}
      <rect x="20" y="156" width="200" height="16" rx="4" fill="var(--illustration-primary)" opacity="0.03" />
      <text x="120" y="167" textAnchor="middle" fontSize="6" fill="var(--illustration-muted-lighter)" opacity="0.6">Weights connect every neuron to every neuron in the next layer</text>
    </svg>
  );
}

// ── Overfitting Hero Illustration ────────────────────────────────────────────
function OverfittingHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="of-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-warning)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-warning-deep)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#of-glow)" />

      {/* Title text */}
      <text x="120" y="26" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--illustration-warning-light)" opacity="0.7">Overfitting</text>

      {/* Left side: Training data — perfect fit */}
      <text x="62" y="38" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--illustration-success-bright)" opacity="0.6">Training (100%)</text>
      {/* Data points */}
      <circle cx="30" cy="74" r="2.5" fill="var(--illustration-success-dim)" opacity="0.6" />
      <circle cx="44" cy="60" r="2.5" fill="var(--illustration-success-dim)" opacity="0.6" />
      <circle cx="58" cy="48" r="2.5" fill="var(--illustration-success-dim)" opacity="0.6" />
      <circle cx="72" cy="38" r="2.5" fill="var(--illustration-success-dim)" opacity="0.6" />
      <circle cx="86" cy="50" r="2.5" fill="var(--illustration-success-dim)" opacity="0.6" />
      {/* Wavy curve through every point */}
      <path d="M26 74 Q32 68 38 63 Q44 58 50 52 Q56 46 62 42 Q68 38 74 38 Q80 40 86 46 Q90 50 92 52" stroke="var(--illustration-success-bright)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Checkmark */}
      <polyline points="55,82 57,84 61,79" stroke="var(--illustration-success-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

      {/* Right side: New data — poor performance */}
      <text x="180" y="38" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--illustration-danger-light-vivid)" opacity="0.6">New Data (fails)</text>
      {/* Same wavy curve but now dashed */}
      <path d="M110 52 Q114 48 120 44 Q126 40 132 38 Q140 36 148 40 Q154 44 160 50 Q168 58 176 64 Q184 70 192 74" stroke="var(--illustration-danger-light-vivid)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25" strokeDasharray="3,2" />
      {/* Actual new data points (don't match curve) */}
      <circle cx="120" cy="42" r="2.5" fill="var(--illustration-danger-light)" opacity="0.5" />
      <circle cx="136" cy="48" r="2.5" fill="var(--illustration-danger-light)" opacity="0.5" />
      <circle cx="152" cy="54" r="2.5" fill="var(--illustration-danger-light)" opacity="0.5" />
      <circle cx="168" cy="62" r="2.5" fill="var(--illustration-danger-light)" opacity="0.5" />
      <circle cx="184" cy="70" r="2.5" fill="var(--illustration-danger-light)" opacity="0.5" />
      {/* Red cross */}
      <text x="182" y="82" textAnchor="middle" fontSize="10" fill="var(--illustration-danger-light)" fontWeight="700" opacity="0.6">✗</text>

      {/* Center arrow showing gap */}
      <path d="M96 60 Q104 56 108 56" stroke="var(--illustration-muted-lighter)" strokeWidth="0.8" opacity="0.3" />
      <path d="M96 64 Q104 68 108 68" stroke="var(--illustration-muted-lighter)" strokeWidth="0.8" opacity="0.3" />

      {/* Bottom explanation */}
      <rect x="20" y="100" width="200" height="28" rx="4" fill="var(--illustration-warning)" opacity="0.04" />
      <text x="120" y="112" textAnchor="middle" fontSize="6" fill="#a1a1aa" opacity="0.6">Memorises training</text>
      <text x="120" y="122" textAnchor="middle" fontSize="6" fill="#a1a1aa" opacity="0.6">Fails on anything new</text>
    </svg>
  );
}

// ── Overfitting Infographic ──────────────────────────────────────────────────
function OverfittingInfographic({ takeaway }: { takeaway: string }) {
  return (
    <div className="relative mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0a0f1a] to-[#060b14] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800/30">
        {/* Panel 1: The Student Who Memorized */}
        <div className="relative p-6 md:p-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-3">Screen 1</span>
          <h4 className="text-sm font-bold text-white mb-3">Memorizing Instead of Understanding</h4>
          <svg className="w-full max-w-[200px] h-28" viewBox="0 0 200 112" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Desk */}
            <rect x="10" y="88" width="180" height="6" rx="2" fill="var(--illustration-surface-mid)" opacity="0.5" />
            {/* Papers on desk */}
            <rect x="30" y="74" width="28" height="18" rx="2" fill="var(--illustration-info-deep)" fillOpacity="0.15" stroke="var(--illustration-info-deep)" strokeWidth="0.5" strokeOpacity="0.3" />
            <rect x="32" y="76" width="24" height="3" rx="1" fill="var(--illustration-info-deep)" opacity="0.15" />
            <rect x="32" y="82" width="24" height="3" rx="1" fill="var(--illustration-info-deep)" opacity="0.15" />
            <rect x="65" y="72" width="28" height="18" rx="2" fill="var(--illustration-warning)" fillOpacity="0.15" stroke="var(--illustration-warning)" strokeWidth="0.5" strokeOpacity="0.3" />
            <rect x="67" y="74" width="24" height="3" rx="1" fill="var(--illustration-warning)" opacity="0.15" />
            <rect x="67" y="80" width="24" height="3" rx="1" fill="var(--illustration-warning)" opacity="0.15" />
            {/* Sticky notes on wall */}
            <rect x="120" y="18" width="20" height="18" rx="1" fill="var(--illustration-warning-light)" opacity="0.2" />
            <rect x="145" y="12" width="20" height="18" rx="1" fill="#f97316" opacity="0.2" />
            <rect x="132" y="38" width="20" height="18" rx="1" fill="var(--illustration-warning-light)" opacity="0.15" />
            <rect x="158" y="30" width="20" height="18" rx="1" fill="#f97316" opacity="0.15" />
            {/* Student head (studying) */}
            <circle cx="50" cy="38" r="16" fill="var(--illustration-primary)" fillOpacity="0.15" stroke="var(--illustration-primary)" strokeWidth="0.8" strokeOpacity="0.4" />
            <circle cx="50" cy="38" r="16" fill="none" opacity="0.4" />
            <circle cx="50" cy="38" r="8" fill="var(--illustration-primary)" opacity="0.08" />
            {/* Brain with memorized content */}
            <path d="M42 34 C40 30 43 28 47 28 C50 28 52 30 53 32 C54 30 56 29 58 31 C59 33 58 36 57 38 C58 40 57 43 55 44 C52 46 48 46 46 44 C44 42 43 38 42 34Z" fill="var(--illustration-primary)" opacity="0.12" />
            <text x="50" y="37" textAnchor="middle" fontSize="6" fill="var(--illustration-secondary)" fontWeight="700">MEM</text>
            {/* Book */}
            <rect x="95" y="58" width="22" height="30" rx="2" fill="var(--illustration-success-dim)" fillOpacity="0.12" stroke="var(--illustration-success-dim)" strokeWidth="0.5" strokeOpacity="0.3" />
            <rect x="98" y="62" width="16" height="2.5" rx="0.5" fill="var(--illustration-success-dim)" opacity="0.15" />
            <rect x="98" y="67" width="16" height="2.5" rx="0.5" fill="var(--illustration-success-dim)" opacity="0.15" />
            <rect x="98" y="72" width="16" height="2.5" rx="0.5" fill="var(--illustration-success-dim)" opacity="0.15" />
            <rect x="98" y="77" width="16" height="2.5" rx="0.5" fill="var(--illustration-success-dim)" opacity="0.15" />
            {/* Checkmarks on old exam papers */}
            <polyline points="44,84 46,86 49,82" stroke="var(--illustration-success-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <polyline points="75,82 77,84 80,80" stroke="var(--illustration-success-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          </svg>
          <p className="text-xs text-slate-300 leading-relaxed mt-3 max-w-[200px]">
            The student memorizes every question instead of understanding the concepts.
          </p>
        </div>

        {/* Panel 2: The New Exam */}
        <div className="relative p-6 md:p-8 flex flex-col items-center text-center border-t md:border-t-0 md:border-l border-slate-800/40">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-teal-600/20 border border-teal-500/30 text-[10px] font-bold text-teal-300 uppercase tracking-widest mb-3">Screen 2</span>
          <h4 className="text-sm font-bold text-white mb-3">A Different Situation</h4>
          <svg className="w-full max-w-[200px] h-28" viewBox="0 0 200 112" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Desk */}
            <rect x="10" y="88" width="180" height="6" rx="2" fill="var(--illustration-surface-mid)" opacity="0.5" />
            {/* New exam paper */}
            <rect x="60" y="68" width="50" height="24" rx="2" fill="var(--illustration-danger-light)" fillOpacity="0.1" stroke="var(--illustration-danger-light)" strokeWidth="0.5" strokeOpacity="0.3" />
            <text x="85" y="80" textAnchor="middle" fontSize="5" fill="var(--illustration-danger-light-vivid)" fontWeight="600">New</text>
            <text x="85" y="87" textAnchor="middle" fontSize="5" fill="var(--illustration-danger-light-vivid)" fontWeight="600">Questions</text>
            {/* Student head (confused) */}
            <circle cx="40" cy="36" r="16" fill="var(--illustration-warning)" fillOpacity="0.12" stroke="var(--illustration-warning)" strokeWidth="0.8" strokeOpacity="0.4" />
            {/* Question marks around head */}
            <text x="28" y="26" textAnchor="middle" fontSize="9" fill="var(--illustration-warning-light)" fontWeight="700" opacity="0.6">?</text>
            <text x="52" y="22" textAnchor="middle" fontSize="7" fill="var(--illustration-warning-light)" fontWeight="700" opacity="0.4">?</text>
            <text x="56" y="38" textAnchor="middle" fontSize="6" fill="var(--illustration-warning-light)" fontWeight="700" opacity="0.3">?</text>
            {/* Confused face */}
            <circle cx="35" cy="34" r="1.5" fill="var(--illustration-warning)" opacity="0.5" />
            <circle cx="45" cy="34" r="1.5" fill="var(--illustration-warning)" opacity="0.5" />
            <path d="M36 42 Q40 40 44 42" stroke="var(--illustration-warning)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            {/* Classmates (small figures) who understand */}
            <circle cx="145" cy="40" r="10" fill="var(--illustration-success-dim)" fillOpacity="0.1" stroke="var(--illustration-success-dim)" strokeWidth="0.5" strokeOpacity="0.3" />
            <circle cx="145" cy="40" r="4" fill="var(--illustration-success-dim)" opacity="0.08" />
            <circle cx="168" cy="36" r="10" fill="var(--illustration-success-dim)" fillOpacity="0.1" stroke="var(--illustration-success-dim)" strokeWidth="0.5" strokeOpacity="0.3" />
            <circle cx="168" cy="36" r="4" fill="var(--illustration-success-dim)" opacity="0.08" />
            <polyline points="143,64 145,66 148,62" stroke="var(--illustration-success-dim)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
            <polyline points="166,60 168,62 171,58" stroke="var(--illustration-success-dim)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
          </svg>
          <p className="text-xs text-slate-300 leading-relaxed mt-3 max-w-[200px]">
            Because the questions changed, memorization was not enough.
          </p>
        </div>

        {/* Panel 3: Connection to ML */}
        <div className="relative p-6 md:p-8 flex flex-col items-center text-center border-t md:border-t-0 md:border-l border-slate-800/40">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-orange-600/20 border border-orange-500/30 text-[10px] font-bold text-orange-300 uppercase tracking-widest mb-3">Screen 3</span>
          <h4 className="text-sm font-bold text-white mb-3">This is Overfitting</h4>
          <svg className="w-full max-w-[200px] h-28" viewBox="0 0 200 112" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Split background: left green, right red */}
            <rect x="10" y="10" width="88" height="76" rx="6" fill="var(--illustration-success-dim)" opacity="0.04" />
            <rect x="102" y="10" width="88" height="76" rx="6" fill="var(--illustration-danger-light)" opacity="0.04" />
            {/* Divider */}
            <line x1="100" y1="10" x2="100" y2="86" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" opacity="0.4" />
            {/* Left: Training data with perfect fit (wavy curve) */}
            <text x="54" y="22" textAnchor="middle" fontSize="5" fill="var(--illustration-success-bright)" fontWeight="600">Training</text>
            <text x="54" y="28" textAnchor="middle" fontSize="5" fill="var(--illustration-success-bright)" fontWeight="600">Data</text>
            {/* Points */}
            <circle cx="28" cy="68" r="2" fill="var(--illustration-success-dim)" opacity="0.5" />
            <circle cx="38" cy="54" r="2" fill="var(--illustration-success-dim)" opacity="0.5" />
            <circle cx="48" cy="44" r="2" fill="var(--illustration-success-dim)" opacity="0.5" />
            <circle cx="58" cy="32" r="2" fill="var(--illustration-success-dim)" opacity="0.5" />
            <circle cx="68" cy="40" r="2" fill="var(--illustration-success-dim)" opacity="0.5" />
            <circle cx="78" cy="50" r="2" fill="var(--illustration-success-dim)" opacity="0.5" />
            {/* Wavy curve going through every point */}
            <path d="M26 68 Q30 60 34 56 Q38 52 42 47 Q48 40 52 36 Q56 32 60 32 Q64 34 68 38 Q72 42 76 46 Q78 48 80 50" stroke="var(--illustration-success-dim)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
            {/* Checkmark */}
            <polyline points="48,76 50,78 54,74" stroke="var(--illustration-success-dim)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            <text x="54" y="80" textAnchor="middle" fontSize="4" fill="var(--illustration-success-bright)" opacity="0.6">Excellent</text>
            {/* Right: New data with poor performance */}
            <text x="148" y="22" textAnchor="middle" fontSize="5" fill="var(--illustration-danger-light-vivid)" fontWeight="600">New</text>
            <text x="148" y="28" textAnchor="middle" fontSize="5" fill="var(--illustration-danger-light-vivid)" fontWeight="600">Data</text>
            {/* Same curve but now it's wrong */}
            <path d="M108 50 Q112 46 116 44 Q120 42 124 40 Q130 36 134 38 Q138 40 142 44 Q146 50 150 54 Q154 58 158 60 Q162 62 166 64" stroke="var(--illustration-danger-light-vivid)" strokeWidth="1" strokeLinecap="round" opacity="0.3" fill="none" strokeDasharray="3,2" />
            {/* Actual new data points (don't fit the curve) */}
            <circle cx="118" cy="34" r="2" fill="var(--illustration-danger-light)" opacity="0.4" />
            <circle cx="128" cy="50" r="2" fill="var(--illustration-danger-light)" opacity="0.4" />
            <circle cx="138" cy="38" r="2" fill="var(--illustration-danger-light)" opacity="0.4" />
            <circle cx="148" cy="46" r="2" fill="var(--illustration-danger-light)" opacity="0.4" />
            <circle cx="158" cy="58" r="2" fill="var(--illustration-danger-light)" opacity="0.4" />
            <circle cx="168" cy="36" r="2" fill="var(--illustration-danger-light)" opacity="0.4" />
            {/* Red cross */}
            <text x="150" y="82" textAnchor="middle" fontSize="10" fill="var(--illustration-danger-light-vivid)" fontWeight="700" opacity="0.5">✗</text>
            <text x="152" y="80" textAnchor="middle" fontSize="4" fill="var(--illustration-danger-light-vivid)" opacity="0.6">Poor</text>
          </svg>
          <p className="text-xs text-slate-300 leading-relaxed mt-3 max-w-[200px]">
            An overfitted model memorizes the training data instead of learning the general pattern.
          </p>
        </div>
      </div>

      {/* Bottom takeaway */}
      <div className="px-6 md:px-8 py-6 border-t border-slate-800/60 bg-slate-900/30">
        <div className="flex items-center gap-2.5 mb-3">
          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Key Idea</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          {takeaway}
        </p>
      </div>
    </div>
  );
}

// ── Random Variables Hero Illustration ────────────────────────────────────────
function RandomVariablesHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rv-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-special-alt)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#rv-glow)" />

      {/* ── Title ── */}
      <text x="120" y="22" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--illustration-special)" opacity="0.7">Random Variable</text>

      {/* ── Left: Die with rolling animation ── */}
      <g transform="translate(28, 32)">
        <rect x="0" y="0" width="56" height="56" rx="8" fill="var(--illustration-special-alt)" fillOpacity="0.08" stroke="var(--illustration-special)" strokeWidth="1" strokeOpacity="0.4" />
        {/* Die face changes via opacity */}
        <g>
          <circle cx="14" cy="14" r="3" fill="var(--illustration-special)" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="42" cy="14" r="3" fill="var(--illustration-special)" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="14" cy="42" r="3" fill="var(--illustration-special)" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="42" cy="42" r="3" fill="var(--illustration-special)" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="28" cy="28" r="3" fill="var(--illustration-special)" opacity="0.3">
            <animate attributeName="opacity" values="0;0.3;0;0;0;0" dur="4s" repeatCount="indefinite" />
          </circle>
        </g>
        <text x="28" y="72" textAnchor="middle" fontSize="7" fontWeight="600" fill="var(--illustration-muted-lighter)">Roll</text>
        <text x="28" y="80" textAnchor="middle" fontSize="6" fill="var(--illustration-muted-lighter)">{'{1,2,3,4,5,6}'}</text>
      </g>

      {/* ── Center arrow: outcome → probability ── */}
      <g>
        <path d="M90 58 Q105 50 120 54" stroke="var(--illustration-special)" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.3" />
        <circle r="1.5" fill="var(--illustration-special)" opacity="0.5">
          <animateMotion dur="2s" repeatCount="indefinite" path="M90 58 Q105 50 120 54" />
        </circle>
      </g>

      {/* ── Right: Probability distribution bars ── */}
      <g transform="translate(126, 24)">
        <text x="45" y="-2" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--illustration-muted-lighter)">Distribution</text>
        {/* Bars for 1-6 */}
        {[0, 1, 2, 3, 4, 5].map(i => {
          const h = 20 + Math.sin(i * 1.2) * 8;
          return (
            <g key={i}>
              <rect x={i * 14} y={58 - h} width={10} height={h} rx="1.5" fill="var(--illustration-special)" fillOpacity={0.15 + i * 0.03} stroke="var(--illustration-special)" strokeWidth="0.5" strokeOpacity="0.3">
                <animate attributeName="height" values={`${h};${h + 4};${h}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="y" values={`${58 - h};${58 - h - 4};${58 - h}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </rect>
              <text x={i * 14 + 5} y={70} textAnchor="middle" fontSize="5" fill="var(--illustration-muted-lighter)">{i + 1}</text>
            </g>
          );
        })}
      </g>

      {/* ── Bottom: probability values ── */}
      <text x="120" y="132" textAnchor="middle" fontSize="6" fontWeight="600" fill="var(--illustration-special)" opacity="0.5">P(Roll)</text>
      <text x="120" y="142" textAnchor="middle" fontSize="6" fill="var(--illustration-muted-lighter)">= {'<'}1/6, 1/6, 1/6, 1/6, 1/6, 1/6{' >'}</text>

      {/* ── Subtle connecting line across bottom ── */}
      <rect x="20" y="148" width="200" height="0.8" rx="0.4" fill="var(--illustration-special)" opacity="0.08" />
    </svg>
  );
}

// ── Bayes' Theorem Hero Illustration ─────────────────────────────────────────
function BayesHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bt-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-warning)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-warning-deep)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bt-arrow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--illustration-warning)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--illustration-warning)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--illustration-warning)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#bt-glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* ── Title ── */}
      <text x="120" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--illustration-warning-light)" opacity="0.8">Bayes' Theorem</text>

      {/* ── Animated particles flowing left-to-right ── */}
      <circle r="1.5" fill="var(--illustration-warning-light)">
        <animateMotion dur="3s" repeatCount="indefinite" path="M60,78 Q100,72 140,78" />
      </circle>
      <circle r="1.2" fill="var(--illustration-warning-light)">
        <animateMotion dur="3.6s" repeatCount="indefinite" begin="0.8s" path="M60,82 Q100,76 140,82" />
      </circle>
      <circle r="1" fill="var(--illustration-warning)">
        <animateMotion dur="4.2s" repeatCount="indefinite" begin="1.6s" path="M60,74 Q100,68 140,74" />
      </circle>

      {/* ── Prior (left) ── */}
      <g transform="translate(30, 52)">
        <circle cx="30" cy="30" r="28" fill="var(--illustration-warning)" opacity="0.06" stroke="var(--illustration-warning-light)" strokeWidth="0.8">
          <animate attributeName="r" values="28;30;28" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.04;0.08;0.04" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="30" r="18" fill="var(--illustration-warning)" opacity="0.1" />
        <text x="30" y="28" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="7" fontFamily="system-ui" fontWeight="700">Prior</text>
        <text x="30" y="38" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="5" fontFamily="system-ui" opacity="0.7">P(H)</text>
        <circle cx="30" cy="14" r="4" fill="var(--illustration-warning-light)" opacity="0.3" />
        <rect x="27" y="19" width="6" height="6" rx="1.5" fill="var(--illustration-warning-light)" opacity="0.2" />
      </g>

      {/* ── Arrow 1: Prior → Bayes ── */}
      <g transform="translate(68, 70)">
        <rect x="0" y="0" width="28" height="1.5" rx="0.75" fill="url(#bt-arrow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </rect>
        <polygon points="28,-3 34,0.75 28,4.5" fill="var(--illustration-warning-light)" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.2s" repeatCount="indefinite" />
        </polygon>
      </g>

      {/* ── Center: Bayes engine ── */}
      <g transform="translate(96, 40)">
        <rect x="0" y="0" width="48" height="76" rx="8" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="0.8" opacity="0.8">
          <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
        </rect>
        <rect x="6" y="6" width="36" height="24" rx="4" fill="var(--illustration-warning)" opacity="0.06" />
        <text x="24" y="16" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="5" fontFamily="system-ui" fontWeight="600">Likelihood</text>
        <text x="24" y="24" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="5" fontFamily="system-ui" fontWeight="600">P(E|H)</text>
        <line x1="10" y1="34" x2="38" y2="34" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" />
        <rect x="6" y="38" width="36" height="24" rx="4" fill="var(--illustration-warning)" opacity="0.04" />
        <text x="24" y="48" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="5" fontFamily="system-ui" fontWeight="600">Evidence</text>
        <text x="24" y="56" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="5" fontFamily="system-ui" fontWeight="600">P(E)</text>
        <line x1="10" y1="66" x2="38" y2="66" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" />
        <circle cx="24" cy="70" r="2" fill="var(--illustration-warning-light)">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="r" values="2;3;2" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* ── Arrow 2: Bayes → Posterior ── */}
      <g transform="translate(146, 70)">
        <rect x="0" y="0" width="24" height="1.5" rx="0.75" fill="url(#bt-arrow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </rect>
        <polygon points="24,-3 30,0.75 24,4.5" fill="var(--illustration-warning-light)" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </polygon>
      </g>

      {/* ── Posterior (right) ── */}
      <g transform="translate(178, 52)">
        <circle cx="30" cy="30" r="28" fill="var(--illustration-warning)" opacity="0.06" stroke="var(--illustration-warning-light)" strokeWidth="0.8">
          <animate attributeName="r" values="28;32;28" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.04;0.1;0.04" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="30" r="18" fill="var(--illustration-warning)" opacity="0.15">
          <animate attributeName="opacity" values="0.12;0.25;0.12" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="18;20;18" dur="2.5s" repeatCount="indefinite" />
        </circle>
        {/* Expanding ring */}
        <circle cx="30" cy="30" r="28" fill="none" stroke="var(--illustration-success-bright)" strokeWidth="0.5">
          <animate attributeName="r" values="28;40;28" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="30" y="28" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="7" fontFamily="system-ui" fontWeight="700">Posterior</text>
        <text x="30" y="38" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="5" fontFamily="system-ui" opacity="0.7">P(H|E)</text>
        <path d="M26 14 L30 10 L34 14" stroke="var(--illustration-success-bright)" strokeWidth="0.8" fill="none" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" repeatCount="indefinite" />
        </path>
      </g>

      {/* ── Glow sweep across formula bar ── */}
      <g transform="translate(20, 140)">
        <rect x="0" y="0" width="200" height="22" rx="6" fill="var(--illustration-surface)" stroke="var(--illustration-warning)" strokeWidth="0.5" opacity="0.5">
          <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Glow sweep */}
        <rect x="0" y="2" width="30" height="18" rx="4" fill="var(--illustration-warning)" opacity="0.08">
          <animate attributeName="x" values="-30;230;-30" dur="4s" repeatCount="indefinite" />
        </rect>
        <text x="100" y="14" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="7" fontFamily="monospace" fontWeight="700">
          P(H|E) = P(E|H) × P(H) / P(E)
        </text>
      </g>
    </svg>
  );
}

// ── Bayesian Networks Hero Illustration ───────────────────────────────────────
function BayesianNetworksHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bn-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-success-dim)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-success-deep)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#bn-glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="4.5s" repeatCount="indefinite" />
      </ellipse>

      <text x="120" y="18" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--illustration-success-bright)" opacity="0.8">Bayesian Network</text>

      {/* ── Network graph ── */}
      {/* Node 1: Rain (top-left) */}
      <g transform="translate(50, 44)">
        <circle cx="20" cy="20" r="16" fill="var(--illustration-success-dim)" opacity="0.08" stroke="var(--illustration-success-bright)" strokeWidth="0.8">
          <animate attributeName="r" values="16;18;16" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <text x="20" y="18" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="6" fontFamily="system-ui" fontWeight="700">Rain</text>
        <text x="20" y="26" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="4" fontFamily="system-ui">P=0.2</text>
      </g>

      {/* Node 2: Traffic (top-right) */}
      <g transform="translate(150, 44)">
        <circle cx="20" cy="20" r="16" fill="var(--illustration-success-dim)" opacity="0.08" stroke="var(--illustration-success-bright)" strokeWidth="0.8">
          <animate attributeName="r" values="16;18;16" dur="3.8s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <text x="20" y="18" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="6" fontFamily="system-ui" fontWeight="700">Traffic</text>
        <text x="20" y="26" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="4" fontFamily="system-ui">P=0.5</text>
      </g>

      {/* Node 3: Alarm (bottom-center) */}
      <g transform="translate(100, 96)">
        <circle cx="20" cy="20" r="16" fill="var(--illustration-success-dim)" opacity="0.08" stroke="var(--illustration-success-bright)" strokeWidth="0.8">
          <animate attributeName="r" values="16;18;16" dur="4s" repeatCount="indefinite" begin="1s" />
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <text x="20" y="18" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="6" fontFamily="system-ui" fontWeight="700">Alarm</text>
        <text x="20" y="26" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="4" fontFamily="system-ui">P=0.8</text>
      </g>

      {/* ── Edges between nodes ── */}
      {/* Rain → Traffic */}
      <g>
        <path d="M72,58 Q110,48 148,58" stroke="var(--illustration-success-bright)" strokeWidth="0.8" opacity="0.4" fill="none" markerEnd="url(#bn-arrow)">
          <animate attributeName="stroke-dashoffset" values="0;50" dur="2s" repeatCount="indefinite" />
        </path>
        <circle r="1.2" fill="var(--illustration-success-bright)">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M72,58 Q110,48 148,58" />
        </circle>
      </g>
      {/* Rain → Alarm (dashed, weaker influence) */}
      <path d="M60,62 Q80,96 118,112" stroke="var(--illustration-success-bright)" strokeWidth="0.5" opacity="0.2" strokeDasharray="3,3" fill="none" />
      {/* Traffic → Alarm */}
      <g>
        <path d="M158,62 Q140,96 122,112" stroke="var(--illustration-success-bright)" strokeWidth="0.8" opacity="0.4" fill="none" markerEnd="url(#bn-arrow)">
          <animate attributeName="stroke-dashoffset" values="0;40" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </path>
        <circle r="1" fill="var(--illustration-success-bright)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M158,62 Q140,96 122,112" />
        </circle>
      </g>

      {/* ── Conditional Probability Table hint ── */}
      <g transform="translate(16, 132)">
        <rect x="0" y="0" width="208" height="30" rx="5" fill="var(--illustration-surface)" stroke="var(--illustration-success-dim)" strokeWidth="0.4" opacity="0.5" />
        <text x="16" y="12" fill="var(--illustration-muted-lighter)" fontSize="4.5" fontFamily="monospace">P(Rain)</text>
        <text x="70" y="12" fill="var(--illustration-muted-lighter)" fontSize="4.5" fontFamily="monospace">P(Traffic|Rain)</text>
        <text x="135" y="12" fill="var(--illustration-muted-lighter)" fontSize="4.5" fontFamily="monospace">P(Alarm|Traffic)</text>
        <text x="104" y="24" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="5" fontFamily="monospace" fontWeight="600">
          P(R,T,A) = P(R) × P(T|R) × P(A|T)
        </text>
      </g>

      {/* Arrow marker */}
      <defs>
        <marker id="bn-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--illustration-success-bright)" opacity="0.5" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Markov Chain Explorer (Try It Yourself) ─────────────────────────────

type MCState = 'sunny' | 'cloudy' | 'rainy';
const MC_STATES: MCState[] = ['sunny', 'cloudy', 'rainy'];
const MC_LABELS: Record<MCState, string> = { sunny: 'Sunny', cloudy: 'Cloudy', rainy: 'Rainy' };
const MC_VARIANTS: Record<MCState, { icon: string; node: string; text: string; bar: string; fill: string; stroke: string; bg: string }> = {
  sunny: {
    icon: 'S', node: 'text-amber-300', text: 'text-amber-400', bar: 'from-amber-600/40 to-amber-400/40',
    fill: 'var(--illustration-warning)', stroke: 'var(--illustration-warning-light)', bg: 'bg-amber-500/20'
  },
  cloudy: {
    icon: 'C', node: 'text-slate-300', text: 'text-slate-300', bar: 'from-slate-600/40 to-slate-400/40',
    fill: 'var(--illustration-muted-lighter)', stroke: 'var(--illustration-element-muted)', bg: 'bg-slate-500/20'
  },
  rainy: {
    icon: 'R', node: 'text-blue-300', text: 'text-blue-400', bar: 'from-blue-600/40 to-blue-400/40',
    fill: 'var(--illustration-info)', stroke: 'var(--illustration-info)', bg: 'bg-blue-500/20'
  },
};

function MarkovChainExplorer() {
  const DEFAULT_TM: Record<MCState, Record<MCState, number>> = {
    sunny: { sunny: 0.5, cloudy: 0.3, rainy: 0.2 },
    cloudy: { cloudy: 0.4, sunny: 0.35, rainy: 0.25 },
    rainy: { rainy: 0.5, cloudy: 0.3, sunny: 0.2 },
  };

  const [transitionMatrix, setTransitionMatrix] = useState(DEFAULT_TM);
  const [current, setCurrent] = useState<MCState>('sunny');
  const [history, setHistory] = useState<MCState[]>(['sunny']);
  const [animating, setAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [lastTransition, setLastTransition] = useState<{ from: MCState; to: MCState } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const autoRef = useRef<number | null>(null);
  const [editingFrom, setEditingFrom] = useState<MCState | null>(null);

  const step = useCallback(() => {
    if (animating) return;
    setShowResult(false);
    setAnimating(true);
    const probs = transitionMatrix[current];
    const r = Math.random();
    let cumulative = 0;
    let next: MCState = 'sunny';
    for (const s of MC_STATES) {
      cumulative += probs[s];
      if (r < cumulative) { next = s; break; }
    }
    setLastTransition({ from: current, to: next });
    setTimeout(() => {
      setCurrent(next);
      setHistory(prev => [...prev, next]);
      setAnimating(false);
      setShowResult(true);
    }, 400);
  }, [current, animating, transitionMatrix]);

  useEffect(() => {
    if (autoPlay) {
      autoRef.current = window.setInterval(step, 800);
      return () => { if (autoRef.current) clearInterval(autoRef.current); };
    } else {
      if (autoRef.current) clearInterval(autoRef.current);
    }
  }, [autoPlay, step]);

  const reset = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    setAutoPlay(false);
    setCurrent('sunny');
    setHistory(['sunny']);
    setLastTransition(null);
    setShowResult(false);
    setEditingFrom(null);
  }, []);

  const handleSlider = (from: MCState, to: MCState, val: number) => {
    setTransitionMatrix(prev => {
      const row = { ...prev[from] };
      const oldVal = row[to];
      const diff = val - oldVal;
      row[to] = Math.max(0, Math.min(1, val));
      const others = MC_STATES.filter(s => s !== to);
      const othersTotal = others.reduce((a, s) => a + prev[from][s], 0);
      if (othersTotal > 0 && diff !== 0) {
        let remaining = 1 - row[to];
        for (const s of others) {
          const share = othersTotal > 0 ? prev[from][s] / othersTotal : 1 / others.length;
          row[s] = Math.max(0, Math.min(1, remaining * share));
          remaining -= row[s];
        }
      }
      const next = { ...prev, [from]: row };
      return next;
    });
  };

  const distribution = MC_STATES.reduce((acc, s) => {
    acc[s] = history.filter(h => h === s).length;
    return acc;
  }, {} as Record<string, number>);
  const total = history.length;
  const distPct = MC_STATES.reduce((acc, s) => {
    acc[s] = total > 0 ? ((distribution[s] / total) * 100).toFixed(1) : '0.0';
    return acc;
  }, {} as Record<string, string>);

  const probs = transitionMatrix[current];

  return (
    <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <div className="text-xs text-slate-300 leading-relaxed mb-6 max-w-xl space-y-1">
        <p><span className="text-white font-medium">How to use:</span></p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Click <span className="text-indigo-300 font-medium">Next Step</span> to randomly transition from the current state</li>
          <li>Adjust the <span className="text-white">sliders</span> in the transition matrix to change the probabilities</li>
          <li>Use <span className="text-indigo-300 font-medium">Auto</span> to run many steps and see the distribution converge</li>
          <li>Try different matrices and see how the stationary distribution changes</li>
        </ol>
      </div>

      {/* ── Transition Matrix Editor ── */}
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Transition Matrix</h4>
          <button onClick={() => setEditingFrom(editingFrom ? null : 'sunny')} className="text-[10px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            {editingFrom ? 'Done editing' : 'Edit probabilities'}
          </button>
        </div>
        <div className="space-y-3">
          {MC_STATES.map(from => (
            <div key={from} className={`rounded-xl border ${current === from ? 'border-indigo-500/30 bg-indigo-900/10' : 'border-slate-800/50 bg-slate-800/20'} p-3`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${MC_VARIANTS[from].text}`}>{MC_VARIANTS[from].icon} {MC_LABELS[from]}</span>
                <span className="text-[9px] text-slate-300">From {MC_LABELS[from]}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MC_STATES.map(to => {
                  const pct = (transitionMatrix[from][to] * 100).toFixed(0);
                  const isChosen = lastTransition?.from === from && lastTransition?.to === to;
                  return (
                    <div key={to} className={`rounded-lg p-2 text-center border ${isChosen ? 'border-indigo-500/40 bg-indigo-900/20' : 'border-slate-800/60'}`}>
                      <div className={`text-[9px] font-medium ${MC_VARIANTS[to].text}`}>{MC_LABELS[to]}</div>
                      <div className="text-sm font-bold text-white">{pct}%</div>
                      {editingFrom === from && (
                        <input type="range" min="0" max="100" value={pct}
                          onChange={e => handleSlider(from, to, parseInt(e.target.value) / 100)}
                          className="ai-range-slider mt-1"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── State diagram (simplified) ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Left: current state + controls */}
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-5 text-center">
          <h4 className="text-xs text-slate-300 mb-3">Current state</h4>
          <div className={`text-2xl font-bold mb-1 ${MC_VARIANTS[current].text}`}>{MC_LABELS[current]}</div>
          <div className={`inline-block w-16 h-16 rounded-full ${MC_VARIANTS[current].bg} flex items-center justify-center text-xl font-bold ${MC_VARIANTS[current].text} border border-current mb-4`}>
            {MC_VARIANTS[current].icon}
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={step} disabled={animating}
              className="px-5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-sm font-bold text-indigo-300 hover:bg-indigo-600/30 transition-colors disabled:opacity-40">
              {animating ? '...' : 'Next Step ->'}
            </button>
            <button onClick={() => setAutoPlay(p => !p)}
              className={`px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${autoPlay ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300' : 'bg-slate-700/30 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'}`}>
              {autoPlay ? 'Pause' : 'Auto'}
            </button>
            <button onClick={reset}
              className="px-3 py-2 rounded-xl border border-slate-700/50 text-sm font-bold text-slate-300 hover:bg-slate-700/30 transition-colors">
              Reset
            </button>
          </div>
          {/* Probability roulette */}
          {animating && (
            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-indigo-400">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              Picking next state...
            </div>
          )}
        </div>

        {/* Right: what happened */}
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-5">
          <h4 className="text-xs text-slate-300 mb-2">What happened</h4>
          {showResult && lastTransition ? (
            <div className="text-sm space-y-2">
              <div>
                <span className="text-slate-300">From </span>
                <span className={`font-semibold ${MC_VARIANTS[lastTransition.from].text}`}>{MC_LABELS[lastTransition.from]}</span>
                <span className="text-slate-300"> to </span>
                <span className={`font-semibold ${MC_VARIANTS[lastTransition.to].text}`}>{MC_LABELS[lastTransition.to]}</span>
              </div>
              <div className="text-xs text-slate-300">
                Took the <span className="text-indigo-400 font-medium">{(transitionMatrix[lastTransition.from][lastTransition.to] * 100).toFixed(0)}%</span> probability path
              </div>
              <div className="rounded-lg bg-slate-800/40 border border-slate-800/60 p-2">
                <div className="text-[10px] text-slate-300 mb-1">From {MC_LABELS[lastTransition.from]}:</div>
                <div className="flex gap-2 text-[9px]">
                  {MC_STATES.map(s => (
                    <span key={s} className={`${MC_VARIANTS[s].text}`}>
                      {MC_LABELS[s]} {(transitionMatrix[lastTransition.from][s] * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-300">Press <span className="text-indigo-400">Next Step</span> to advance the chain.</p>
          )}
        </div>
      </div>

      {/* ── Distribution bars + history ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <h4 className="text-xs font-bold text-slate-300 mb-3">Observed ({total} steps)</h4>
          <div className="space-y-2">
            {MC_STATES.map(s => {
              const pct = distPct[s];
              return (
                <div key={s}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className={`font-medium ${MC_VARIANTS[s].text}`}>{MC_VARIANTS[s].icon} {MC_LABELS[s]}</span>
                    <span className="text-slate-300">{pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${MC_VARIANTS[s].bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <h4 className="text-xs font-bold text-slate-300 mb-2">Path</h4>
          <div className="flex flex-wrap gap-1">
            {history.map((s, i) => (
              <div key={i} className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center border ${MC_VARIANTS[s].bg} ${MC_VARIANTS[s].text} ${i === history.length - 1 ? 'ring-1 ring-indigo-500/40' : ''}`}>
                {MC_VARIANTS[s].icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-300 leading-relaxed">
        <span className="text-indigo-400 font-semibold">Notice:</span> The more steps you run, the closer the observed distribution gets to the chain's stationary distribution. Try adjusting the matrix to see how it changes.
      </div>
    </div>
  );
}

// ── State Space Explorer (Try It Yourself) ────────────────────────────────
function StateSpaceExplorer() {
  const landscape = [12, 25, 18, 42, 55, 68, 72, 58, 35, 20, 5];
  const [currentPos, setCurrentPos] = useState(5);
  const [path, setPath] = useState<number[]>([]);
  const [stepLog, setStepLog] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'climbing' | 'done'>('idle');

  const maxVal = Math.max(...landscape);
  const globalMaxIdx = landscape.indexOf(maxVal);

  const isLocalOptimum = (pos: number) => {
    const val = landscape[pos];
    const left = pos > 0 ? landscape[pos - 1] : -Infinity;
    const right = pos < landscape.length - 1 ? landscape[pos + 1] : -Infinity;
    return val >= left && val >= right;
  };

  const isGlobalMax = (pos: number) => landscape[pos] === maxVal;

  const stepClimb = () => {
    const val = landscape[currentPos];
    const left = currentPos > 0 ? landscape[currentPos - 1] : -Infinity;
    const right = currentPos < landscape.length - 1 ? landscape[currentPos + 1] : -Infinity;

    if (val >= left && val >= right) {
      setStepLog(prev => [
        ...prev,
        `Stop: S${currentPos + 1} = ${val} — both neighbors (left: ${left === -Infinity ? '—' : left}, right: ${right === -Infinity ? '—' : right}) are lower or equal. Local optimum reached.`
      ]);
      setStatus('done');
      return;
    }

    const nextPos = left > right ? currentPos - 1 : currentPos + 1;
    const nextVal = landscape[nextPos];
    const direction = nextPos < currentPos ? 'left' : 'right';

    setStepLog(prev => [
      ...prev,
      `S${currentPos + 1}(${val}) → compare: left=${left !== -Infinity ? left : '—'}, right=${right !== -Infinity ? right : '—'} → move ${direction} to S${nextPos + 1}(${nextVal})`
    ]);
    setCurrentPos(nextPos);
    setPath(prev => [...prev, nextPos]);
  };

  const runFull = () => {
    setPath([]);
    setStepLog([]);
    setCurrentPos(5);
    setStatus('idle');
    const originalPos = 5;
    let pos = originalPos;
    const log: string[] = [];

    while (true) {
      const val = landscape[pos];
      const left = pos > 0 ? landscape[pos - 1] : -Infinity;
      const right = pos < landscape.length - 1 ? landscape[pos + 1] : -Infinity;

      if (val >= left && val >= right) {
        if (pos === globalMaxIdx) {
          log.push(`✓ Global maximum found at S${pos + 1} (value ${val}).`);
        } else {
          log.push(`✗ Stopped at local optimum S${pos + 1} (value ${val}). Global max is S${globalMaxIdx + 1} (value ${maxVal}).`);
        }
        break;
      }

      const nextPos = left > right ? pos - 1 : pos + 1;
      const nextVal = landscape[nextPos];
      const direction = nextPos < pos ? 'left' : 'right';
      log.push(`S${pos + 1}(${val}) → left=${left !== -Infinity ? left : '—'}, right=${right !== -Infinity ? right : '—'} → move ${direction} to S${nextPos + 1}(${nextVal})`);
      pos = nextPos;
    }

    setStepLog(log);
    setCurrentPos(pos);
    setPath(Array.from({ length: Math.abs(pos - originalPos) + 1 }, (_, i) => originalPos + (pos >= originalPos ? i : -i)));
    setStatus('done');
  };

  const reset = () => {
    setCurrentPos(5);
    setPath([]);
    setStepLog([]);
    setStatus('idle');
  };

  const barWidth = 18;
  const barGap = 4;
  const svgWidth = landscape.length * (barWidth + barGap) + 40;
  const svgHeight = 180;
  const baseY = 150;

  return (
    <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        This is a <span className="text-indigo-300 font-medium">state-space landscape</span>. Each bar is a state; its height is the objective value (higher = better).
        The algorithm performs <span className="text-indigo-400">hill climbing</span> — at each step it compares the current state to its neighbors and moves to the taller one.
        Use <span className="text-indigo-300">Step</span> to advance one iteration or <span className="text-indigo-400">Run</span> to see the full search.
      </p>

      {/* ── Bar Landscape ── */}
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 mb-4 overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-lg mx-auto" style={{ minHeight: 180 }}>
          <defs>
            <linearGradient id="ss-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--illustration-secondary)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--illustration-primary)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="ss-bar-current" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--illustration-success-bright)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--illustration-success-deep)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="ss-bar-max" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--illustration-warning-light)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--illustration-warning-deep)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="ss-bar-visited" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--illustration-accent)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--illustration-deeper)" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100, 125, 150].map(y => (
            <line key={y} x1={20} y1={baseY - y} x2={svgWidth - 20} y2={baseY - y} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.12" />
          ))}

          {landscape.map((val, i) => {
            const x = 25 + i * (barWidth + barGap);
            const h = (val / maxVal) * 130;
            const isCurrent = i === currentPos;
            const isMax = i === globalMaxIdx;
            const visited = path.includes(i);
            const isNeighbor = Math.abs(i - currentPos) === 1;
            return (
              <g key={i}>
                {isCurrent && (
                  <rect x={x - 3} y={baseY - h - 3} width={barWidth + 4} height={h + 6} rx="4" fill="none" stroke="var(--illustration-success-bright)" strokeWidth="1" opacity="0.3" />
                )}
                <rect x={x} y={baseY - h + 2} width={barWidth} height={h} rx="2"
                  fill={isCurrent ? '#065f46' : isMax ? '#78350f' : visited ? '#2e1065' : 'var(--illustration-surface)'} opacity={isCurrent ? 0.6 : 0.3} />
                <rect x={x} y={baseY - h} width={barWidth - 2} height={h} rx="2"
                  fill={isCurrent ? 'url(#ss-bar-current)' : isMax ? 'url(#ss-bar-max)' : visited ? 'url(#ss-bar-visited)' : 'url(#ss-bar)'}
                  stroke={isCurrent ? 'var(--illustration-success-bright)' : isMax ? 'var(--illustration-warning-light)' : visited ? 'var(--illustration-accent)' : 'var(--illustration-surface-mid)'}
                  strokeWidth={isCurrent || isMax ? 1.5 : 0.5} />
                {isMax && (
                  <text x={x + (barWidth - 2) / 2} y={baseY - h - 10} textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="6" fontWeight="700">★</text>
                )}
                <circle cx={x + (barWidth - 2) / 2} cy={baseY - h} r={isCurrent ? 3 : isMax ? 2 : 1.5}
                  fill={isCurrent ? 'var(--illustration-success-lighter)' : isMax ? 'var(--illustration-warning-light)' : 'var(--illustration-secondary)'} opacity={isCurrent || isMax ? 1 : 0.5} />
                <text x={x + (barWidth - 2) / 2} y={baseY + 12} textAnchor="middle"
                  fill={isCurrent ? 'var(--illustration-success-bright)' : isMax ? 'var(--illustration-warning-light)' : 'var(--illustration-element-muted)'} fontSize="8" fontFamily="system-ui" fontWeight={isCurrent || isMax ? '700' : '400'}>
                  S{i + 1}
                </text>
                <text x={x + (barWidth - 2) / 2} y={baseY - h - 4} textAnchor="middle"
                  fill={isCurrent ? 'var(--illustration-success-lighter)' : isMax ? 'var(--illustration-warning-light)' : 'var(--illustration-muted-light)'} fontSize="7" fontFamily="monospace" fontWeight="600">{val}</text>
              </g>
            );
          })}

          {/* Legend */}
          <text x={svgWidth - 12} y={20} textAnchor="end" fill="var(--illustration-success-bright)" fontSize="6" fontFamily="system-ui">● Current</text>
          <text x={svgWidth - 12} y={30} textAnchor="end" fill="var(--illustration-warning-light)" fontSize="6" fontFamily="system-ui">★ Global max</text>
          {path.length > 0 && <text x={svgWidth - 12} y={40} textAnchor="end" fill="var(--illustration-accent)" fontSize="6" fontFamily="system-ui">● Visited</text>}
        </svg>
      </div>

      {/* ── Algorithm log + controls ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-5">
          <h4 className="text-xs font-bold text-slate-300 mb-3">Algorithm Controls</h4>
          <div className="flex flex-wrap gap-2">
            <button onClick={stepClimb} disabled={status === 'done'}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 ${
                status === 'done'
                  ? 'bg-slate-700/30 border border-slate-700/50 text-slate-300'
                  : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30'
              }`}>
              {status === 'done' ? 'Complete' : 'Step (1 iteration)'}
            </button>
            <button onClick={runFull}
              className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-indigo-500/30 text-sm font-bold text-indigo-300 hover:bg-emerald-600/30 transition-colors">
              Run Hill Climbing
            </button>
            <button onClick={reset}
              className="px-4 py-2 rounded-xl bg-slate-700/30 border border-slate-700/50 text-sm font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
              Reset
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-5">
          <h4 className="text-xs font-bold text-slate-300 mb-3">Current State</h4>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">State:</span>
              <span className="text-indigo-300 font-bold">S{currentPos + 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Value:</span>
              <span className="text-indigo-300 font-bold font-mono">{landscape[currentPos]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Left neighbor:</span>
              <span className="text-slate-300 font-mono">{currentPos > 0 ? `S${currentPos} = ${landscape[currentPos - 1]}` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Right neighbor:</span>
              <span className="text-slate-300 font-mono">{currentPos < landscape.length - 1 ? `S${currentPos + 2} = ${landscape[currentPos + 1]}` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Local optimum:</span>
              <span className={isLocalOptimum(currentPos) ? 'text-indigo-400 font-bold' : 'text-slate-300'}>{isLocalOptimum(currentPos) ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Global max:</span>
              <span className={isGlobalMax(currentPos) ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                {isGlobalMax(currentPos) ? 'Yes ★' : `S${globalMaxIdx + 1} = ${maxVal}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Algorithm log ── */}
      {stepLog.length > 0 && (
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 mb-4">
          <h4 className="text-xs font-bold text-slate-300 mb-2">Algorithm Trace</h4>
          <div className="space-y-1">
            {stepLog.map((entry, i) => (
              <div key={i} className="font-mono text-[11px] leading-relaxed px-2 py-1 rounded bg-slate-800/40">
                <span className="text-indigo-400 mr-2">Step {i + 1}:</span>
                <span className="text-slate-300">{entry}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-indigo-400 font-semibold">How hill climbing works:</span> At each step, the algorithm evaluates the current state's value, compares it to both neighbors, and moves to the higher one. This repeats until no neighbor is higher — a <span className="text-indigo-400">local optimum</span>. If that optimum is also the highest point in the entire landscape, it's the <span className="text-amber-400">global maximum</span>. Otherwise, the algorithm is stuck at a suboptimal solution.
        </p>
      </div>
    </div>
  );
}

// ── Local Search Explorer (Try It Yourself) ──────────────────────────────
function LocalSearchExplorer() {
  const GRID_SIZE = 7;
  const HOUSE_POSITIONS: [number, number][] = [[1, 1], [1, 5], [5, 1], [5, 5]];
  const INITIAL_HOSPITALS: [number, number][] = [[2, 2], [4, 4]];

  const [hospitals, setHospitals] = useState<[number, number][]>(INITIAL_HOSPITALS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [neighborResults, setNeighborResults] = useState<{ dir: string; pos: [number, number]; cost: number }[] | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const manhattan = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

  const computeCost = (h: [number, number][]) =>
    HOUSE_POSITIONS.reduce((sum, house) => sum + Math.min(...h.map(hp => manhattan(house, hp))), 0);

  const cost = computeCost(hospitals);

  const evaluateNeighbors = () => {
    const [ar, ac] = hospitals[activeIdx];
    const dirs: { dir: string; dr: number; dc: number }[] = [
      { dir: 'up', dr: -1, dc: 0 },
      { dir: 'down', dr: 1, dc: 0 },
      { dir: 'left', dr: 0, dc: -1 },
      { dir: 'right', dr: 0, dc: 1 },
    ];
    const results: { dir: string; pos: [number, number]; cost: number }[] = [];

    for (const { dir, dr, dc } of dirs) {
      const nr = ar + dr;
      const nc = ac + dc;
      if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
      if (HOUSE_POSITIONS.some(([hr, hc]) => hr === nr && hc === nc)) continue;
      if (hospitals.find((h, i) => i !== activeIdx && h[0] === nr && h[1] === nc)) continue;
      const candidate: [number, number][] = hospitals.map((h, i) => i === activeIdx ? [nr, nc] : h);
      results.push({ dir, pos: [nr, nc], cost: computeCost(candidate) });
    }

    setNeighborResults(results);

    const best = results.reduce((a, b) => a.cost < b.cost ? a : b);
    const currentCost = cost;
    const entry = results.map(r => `${r.dir}=${r.cost}`).join(', ');
    if (best.cost < currentCost) {
      setLog(prev => [...prev, `H${activeIdx + 1} @ (${ar},${ac}) cost=${currentCost} → neighbors: [${entry}] → best: move ${best.dir} to (${best.pos[0]},${best.pos[1]}) cost=${best.cost}`]);
    } else {
      setLog(prev => [...prev, `H${activeIdx + 1} @ (${ar},${ac}) cost=${currentCost} → neighbors: [${entry}] → no improvement. Local optimum for this hospital.`]);
      setDone(true);
    }
  };

  const applyBestNeighbor = () => {
    if (!neighborResults || neighborResults.length === 0) return;
    const best = neighborResults.reduce((a, b) => a.cost < b.cost ? a : b);
    if (best.cost >= cost) return;
    setHospitals(prev => prev.map((h, i) => i === activeIdx ? best.pos : h));
    setNeighborResults(null);
  };

  const reset = () => {
    setHospitals(INITIAL_HOSPITALS);
    setActiveIdx(0);
    setNeighborResults(null);
    setLog([]);
    setDone(false);
  };

  const getNearest = (house: [number, number]) => {
    return hospitals.reduce((best, h) => manhattan(house, h) < manhattan(house, best) ? h : best, hospitals[0]);
  };

  return (
    <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        This is the <span className="text-violet-300 font-medium">hospitals problem</span> — a classic local search example.
        Four houses (■) are fixed on a grid. Two hospitals (+) can be placed to minimize total Manhattan distance.
        The <span className="text-indigo-400">state</span> is the pair of hospital positions. A <span className="text-indigo-300">neighbor</span> moves one hospital one cell.
        Click <span className="text-violet-300">Evaluate Neighbors</span> to compare all possible moves for the active hospital.
      </p>

      {/* ── Grid ── */}
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 mb-4">
        <div className="flex justify-center">
          <svg viewBox="0 0 280 310" className="w-full max-w-xs">
            {/* Grid */}
            {Array.from({ length: GRID_SIZE }).map((_, r) =>
              Array.from({ length: GRID_SIZE }).map((_, c) => {
                const isHouse = HOUSE_POSITIONS.some(([hr, hc]) => hr === r && hc === c);
                const hospIdx = hospitals.findIndex(([hr, hc]) => hr === r && hc === c);
                const isActiveHosp = hospIdx === activeIdx;
                const isOtherHosp = hospIdx >= 0 && hospIdx !== activeIdx;
                const isNeighborCandidate = neighborResults?.some(n => n.pos[0] === r && n.pos[1] === c);
                const neighborInfo = neighborResults?.find(n => n.pos[0] === r && n.pos[1] === c);
                const x = c * 40 + 4;
                const y = r * 40 + 4;
                return (
                  <g key={`${r}-${c}`}>
                    <rect x={x} y={y} width="36" height="36" rx="4"
                      fill={isNeighborCandidate ? '#312e81' : isActiveHosp ? '#9d174d' : isOtherHosp ? 'var(--illustration-accent-deeper)' : isHouse ? '#78350f' : 'var(--illustration-surface)'}
                      stroke={isNeighborCandidate ? 'var(--illustration-secondary)' : isActiveHosp ? 'var(--illustration-danger-light)' : isOtherHosp ? 'var(--illustration-deep)' : isHouse ? 'var(--illustration-warning)' : 'var(--illustration-surface-alt)'}
                      strokeWidth={isNeighborCandidate || isActiveHosp ? 2 : isOtherHosp ? 1.5 : 0.5}
                      opacity={0.6} />
                    {isNeighborCandidate && neighborInfo && (
                      <text x={x + 18} y={y + 20} textAnchor="middle" fill="var(--illustration-secondary)" fontSize="7" fontFamily="monospace" fontWeight="600">{neighborInfo.cost}</text>
                    )}
                    {isHouse && (
                      <g transform={`translate(${x + 18}, ${y + 18})`}>
                        <rect x="-5" y="-4" width="10" height="8" rx="1" fill="var(--illustration-warning)" opacity="0.7" />
                        <polygon points="-6,-4 0,-9 6,-4" fill="var(--illustration-warning)" opacity="0.6" />
                      </g>
                    )}
                    {(isActiveHosp || isOtherHosp) && (
                      <g transform={`translate(${x + 18}, ${y + 18})`}>
                        <line x1="-7" y1="0" x2="7" y2="0" stroke={isActiveHosp ? 'var(--illustration-danger-light)' : 'var(--illustration-accent)'} strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="0" y1="-7" x2="0" y2="7" stroke={isActiveHosp ? 'var(--illustration-danger-light)' : 'var(--illustration-accent)'} strokeWidth="2.5" strokeLinecap="round" />
                      </g>
                    )}
                  </g>
                );
              })
            )}

            {/* Distance lines */}
            {HOUSE_POSITIONS.map((house, i) => {
              const nearest = getNearest(house);
              const hx = house[1] * 40 + 22;
              const hy = house[0] * 40 + 22;
              const nx = nearest[1] * 40 + 22;
              const ny = nearest[0] * 40 + 22;
              return (
                <g key={i}>
                  <line x1={hx} y1={hy} x2={nx} y2={hy} stroke="var(--illustration-primary)" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.2" />
                  <line x1={nx} y1={hy} x2={nx} y2={ny} stroke="var(--illustration-primary)" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.2" />
                  <text x={(hx + nx) / 2} y={hy - 4} textAnchor="middle" fill="var(--illustration-primary)" fontSize="6" fontFamily="monospace" opacity="0.3">
                    {manhattan(house, nearest)}
                  </text>
                </g>
              );
            })}

            {/* Labels */}
            <text x="140" y="290" textAnchor="middle" fill="var(--illustration-element-muted)" fontSize="7" fontFamily="system-ui">■ = House  + = Hospital</text>
          </svg>
        </div>
      </div>

      {/* ── Controls + Cost ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-5">
          <h4 className="text-xs font-bold text-slate-300 mb-3">Local Search Controls</h4>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveIdx(p => (p + 1) % 2)}
              className="px-3 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-xs font-bold text-rose-300 hover:bg-rose-600/30 transition-colors">
              Active: H{hospitals[activeIdx][0]},{hospitals[activeIdx][1]} → Swap
            </button>
            <button onClick={evaluateNeighbors}
              className="px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 transition-colors">
              Evaluate Neighbors
            </button>
            {neighborResults && neighborResults.length > 0 && (
              <button onClick={applyBestNeighbor} disabled={done}
                className="px-3 py-2 rounded-xl bg-emerald-600/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:bg-emerald-600/30 transition-colors disabled:opacity-40">
                Apply Best Move
              </button>
            )}
            <button onClick={reset}
              className="px-3 py-2 rounded-xl bg-slate-700/30 border border-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
              Reset
            </button>
          </div>
          {neighborResults && neighborResults.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {neighborResults.map((n, i) => (
                <div key={i} className="flex justify-between text-[11px] px-2 py-1 rounded bg-slate-800/40">
                  <span className="text-indigo-300">{n.dir}</span>
                  <span className="text-slate-300 font-mono">({n.pos[0]},{n.pos[1]})</span>
                  <span className="text-slate-300 font-mono">{n.cost}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-5">
          <h4 className="text-xs font-bold text-slate-300 mb-2">Cost Function</h4>
          <p className="text-3xl font-black font-mono text-slate-200">{cost}</p>
          <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
            Manhattan distance from each house to its nearest hospital, summed.
          </p>
          <div className="mt-2 space-y-0.5 text-[10px] font-mono text-slate-300">
            {HOUSE_POSITIONS.map((h, i) => {
              const d = manhattan(h, getNearest(h));
              return <div key={i}>House {i + 1}({h[0]},{h[1]}) → nearest hospital: {d} step{d > 1 ? 's' : ''}</div>;
            })}
          </div>
        </div>
      </div>

      {/* ── Algorithm log ── */}
      {log.length > 0 && (
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 mb-4">
          <h4 className="text-xs font-bold text-slate-300 mb-2">Algorithm Trace</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="font-mono text-[11px] leading-relaxed px-2 py-1 rounded bg-slate-800/40">
                <span className="text-violet-400 mr-2">Step {i + 1}:</span>
                <span className="text-slate-300">{entry}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-violet-400 font-semibold">How local search works:</span> The algorithm picks a hospital, evaluates all its possible one-step moves (neighbors), and moves to the one that reduces total cost the most. It repeats until no move improves the cost — a <span className="text-indigo-400">local optimum</span>. This is the same pattern used in real AI for logistics, chip design, and scheduling.
        </p>
      </div>
    </div>
  );
}

// ── Optimization Hero Illustration ────────────────────────────────────────
function OptimizationHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="op-bg" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-accent-deeper)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="var(--illustration-accent-deep)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--illustration-surface)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="op-mountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-deep)" stopOpacity="0.35" />
          <stop offset="60%" stopColor="var(--illustration-deeper)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--illustration-accent-deeper)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="op-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f3ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--illustration-light)" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="op-peak-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-accent)" stopOpacity="0.6" />
          <stop offset="50%" stopColor="var(--illustration-deep)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-accent-deep)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="op-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-warning-light)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--illustration-warning)" stopOpacity="0" />
        </radialGradient>
        <filter id="op-glow-filter">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="op-soft-glow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="240" height="176" fill="url(#op-bg)" />

      {/* Ambient glow */}
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#op-bg)" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5s" repeatCount="indefinite" />
      </ellipse>

      {/* Title */}
      <text x="120" y="16" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--illustration-accent)" opacity="0.8" letterSpacing="1">Optimization Landscape</text>

      {/* ── Mountain peaks ── */}
      {/* Background smaller peaks */}
      <path d="M10 140 L30 110 L50 118 L70 100 L90 108 L110 90 L130 96 L150 80 L170 88 L190 72 L210 80 L230 65 L240 70 L240 140Z" fill="var(--illustration-accent-deeper)" opacity="0.08" />
      <path d="M20 140 L40 116 L60 122 L80 106 L100 114 L120 96 L140 102 L160 86 L180 92 L200 76 L220 84 L240 70 L240 140Z" fill="var(--illustration-accent-deep)" opacity="0.1" />

      {/* Main peak (highest point) */}
      <path d="M70 140 L90 102 L120 60 L150 48 L180 70 L200 90 L220 110 L240 140Z" fill="url(#op-mountain)">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
      </path>

      {/* Second peak */}
      <path d="M0 140 L20 116 L40 120 L60 106 L80 112 L100 98 L120 88 L140 94 L160 80 L180 140Z" fill="var(--illustration-deeper)" opacity="0.08" />

      {/* Snow cap on main peak */}
      <path d="M120 60 L132 54 L140 58 L148 52 L156 58 L150 48 L120 60Z" fill="url(#op-snow)">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
      </path>

      {/* Peak glow marker */}
      <circle cx="148" cy="52" r="14" fill="url(#op-peak-glow)" filter="url(#op-soft-glow)">
        <animate attributeName="r" values="14;20;14" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="148" cy="52" r="4" fill="var(--illustration-light)" opacity="0.8" filter="url(#op-glow-filter)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Flag on peak */}
      <line x1="148" y1="52" x2="148" y2="36" stroke="var(--illustration-accent)" strokeWidth="0.8" opacity="0.6" />
      <polygon points="148,36 158,39 148,42" fill="var(--illustration-accent)" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
      </polygon>

      {/* Sun glow in sky */}
      <circle cx="200" cy="24" r="18" fill="url(#op-sun)">
        <animate attributeName="r" values="18;22;18" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* ── Animated dots moving along landscape surface ── */}
      <circle r="2" fill="var(--illustration-accent)" opacity="0.7" filter="url(#op-glow-filter)">
        <animateMotion dur="4s" repeatCount="indefinite" path="M90,102 Q120,60 148,48 Q178,70 200,90" />
      </circle>
      <circle r="1.5" fill="var(--illustration-light)" opacity="0.6">
        <animateMotion dur="5s" repeatCount="indefinite" begin="0.8s" path="M70,140 Q90,102 120,60 Q148,48 180,70" />
      </circle>
      <circle r="1.8" fill="var(--illustration-deep)" opacity="0.5">
        <animateMotion dur="4.5s" repeatCount="indefinite" begin="1.5s" path="M60,106 Q80,112 100,98 Q120,88 140,94" />
      </circle>

      {/* ── Small walker figure climbing ── */}
      <g>
        <animateMotion dur="6s" repeatCount="indefinite" path="M80,120 Q100,96 130,68 Q144,56 148,52" />
        {/* Body */}
        <circle cx="0" cy="-2" r="3" fill="var(--illustration-warning-light)" opacity="0.7" />
        <line x1="0" y1="1" x2="0" y2="6" stroke="var(--illustration-warning-light)" strokeWidth="0.8" opacity="0.6" />
        <line x1="0" y1="3" x2="-3" y2="5" stroke="var(--illustration-warning-light)" strokeWidth="0.6" opacity="0.5" />
        <line x1="0" y1="3" x2="3" y2="5" stroke="var(--illustration-warning-light)" strokeWidth="0.6" opacity="0.5" />
      </g>

      {/* ── Labels ── */}
      <text x="120" y="156" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5.5" fontWeight="600">State Space</text>

      {/* Axis labels */}
      <text x="10" y={90} textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5.5" fontWeight="500"
        transform="rotate(-90, 10, 90)">Cost</text>
      <text x="225" y={148} textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5.5" fontWeight="500">Solutions</text>

      {/* Axis lines */}
      <line x1="16" y1="140" x2="228" y2="140" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" opacity="0.3" />
      <line x1="16" y1="140" x2="16" y2="20" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" opacity="0.3" />
      {/* Arrow heads */}
      <polygon points="228,138 234,140 228,142" fill="var(--illustration-surface-mid)" opacity="0.3" />
      <polygon points="14,20 16,14 18,20" fill="var(--illustration-surface-mid)" opacity="0.3" />

      {/* ── Formula bar ── */}
      <rect x="20" y="160" width="200" height="14" rx="3" fill="var(--illustration-surface)" stroke="var(--illustration-deeper)" strokeWidth="0.3" opacity="0.5" />
      <text x="120" y="170" textAnchor="middle" fill="var(--illustration-accent)" fontSize="6" fontFamily="monospace" fontWeight="700" opacity="0.8">
        argmin f(x)
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
      </text>

      {/* Cursor blink */}
      <rect x="142" y="162" width="3" height="10" rx="0.5" fill="var(--illustration-accent)" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0;0.3" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* ── Floating particles ── */}
      {[[35, 30], [55, 20], [170, 16], [195, 36], [25, 130], [210, 120]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="var(--illustration-accent)" opacity="0.1">
          <animate attributeName="cy" values={`${y};${y - 6};${y}`} dur={`${3 + i * 0.6}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur={`${3 + i * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ── Hill Climbing Hero Illustration ─────────────────────────────────────
function HillClimbingHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hc-bg" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-success-deep)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hc-mountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-success-bright)" stopOpacity="0.3" />
          <stop offset="60%" stopColor="var(--illustration-success-dim)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--illustration-success-deep)" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="hc-peak-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-warning-light)" stopOpacity="0.5" />
          <stop offset="50%" stopColor="var(--illustration-warning)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-warning-deep)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hc-local-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-danger-muted)" stopOpacity="0.3" />
          <stop offset="50%" stopColor="var(--illustration-danger)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hc-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0fdf4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#86efac" stopOpacity="0.08" />
        </linearGradient>
        <filter id="hc-glow">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id="hc-soft">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="240" height="176" fill="url(#hc-bg)" />
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#hc-bg)" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" />
      </ellipse>

      <text x="120" y="14" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--illustration-success-bright)" opacity="0.75" letterSpacing="1.5">Hill Climbing Landscape</text>

      {/* ── Background smaller peaks ── */}
      <path d="M10 140 L30 115 L50 120 L70 105 L90 110 L110 92 L130 98 L150 82 L170 88 L190 74 L210 80 L230 66 L240 70 L240 140Z" fill="var(--illustration-success-deep)" opacity="0.06" />

      {/* ── Main ridgeline ── */}
      <path d="M20 140 L40 118 L60 124 L80 108 L100 112 L115 98 L130 72 L140 48 L155 38 L170 44 L185 62 L200 78 L220 96 L240 110 L240 140Z" fill="url(#hc-mountain)">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
      </path>

      {/* ── Flat shoulder (plateau) ── */}
      <path d="M80 108 L92 106 L108 104 L115 98 L100 112 L80 108Z" fill="var(--illustration-success-dim)" opacity="0.06" />
      <line x1="82" y1="107" x2="113" y2="100" stroke="var(--illustration-success-bright)" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.15" />
      <text x="98" y="96" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="4" fontWeight="600" opacity="0.5">Shoulder</text>

      {/* ── Local max peak ── */}
      <path d="M115 98 L130 72 L140 48 L145 50 L135 76 L125 100Z" fill="var(--illustration-danger)" opacity="0.04" />
      <circle cx="140" cy="48" r="10" fill="url(#hc-local-glow)" filter="url(#hc-soft)">
        <animate attributeName="r" values="10;15;10" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="48" r="3" fill="var(--illustration-danger-muted)" opacity="0.6" filter="url(#hc-glow)">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="140" y="42" textAnchor="middle" fill="var(--illustration-danger-muted)" fontSize="4.5" fontWeight="700" opacity="0.7">Local</text>
      <text x="140" y="36" textAnchor="middle" fill="#fca5a5" fontSize="4" fontWeight="600" opacity="0.5">Max</text>

      {/* ── Global max peak ── */}
      <path d="M140 48 L155 38 L170 44 L165 50 L155 44Z" fill="var(--illustration-warning-light)" opacity="0.06" />
      <circle cx="155" cy="38" r="12" fill="url(#hc-peak-glow)" filter="url(#hc-soft)">
        <animate attributeName="r" values="12;18;12" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="155" cy="38" r="3.5" fill="var(--illustration-warning-light)" opacity="0.8" filter="url(#hc-glow)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* Flag */}
      <line x1="155" y1="38" x2="155" y2="24" stroke="var(--illustration-warning-light)" strokeWidth="0.7" opacity="0.5" />
      <polygon points="155,24 164,27 155,30" fill="var(--illustration-warning-light)" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
      </polygon>
      <text x="155" y="22" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="4.5" fontWeight="700" opacity="0.7">Global</text>
      <text x="155" y="17" textAnchor="middle" fill="var(--illustration-warning-faint)" fontSize="4" fontWeight="600" opacity="0.5">Max</text>

      {/* ── Sun glow ── */}
      <circle cx="210" cy="20" r="16" fill="var(--illustration-warning-light)" opacity="0.06">
        <animate attributeName="r" values="16;20;16" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* ── Climber figure ascending ── */}
      <g>
        <animateMotion dur="5s" repeatCount="indefinite" path="M40,128 Q80,110 110,94 Q125,82 135,60 Q140,48 145,52" />
        {/* Body */}
        <circle cx="0" cy="-2" r="3" fill="var(--illustration-success-bright)" opacity="0.7" />
        <line x1="0" y1="1" x2="0" y2="6" stroke="var(--illustration-success-bright)" strokeWidth="0.8" opacity="0.6" />
        <line x1="0" y1="3" x2="-3" y2="5" stroke="var(--illustration-success-bright)" strokeWidth="0.6" opacity="0.5" />
        <line x1="0" y1="3" x2="3" y2="5" stroke="var(--illustration-success-bright)" strokeWidth="0.6" opacity="0.5" />
      </g>

      {/* ── Animated particles on landscape ── */}
      <circle r="1.5" fill="var(--illustration-success-lighter)" opacity="0.5" filter="url(#hc-glow)">
        <animateMotion dur="3.5s" repeatCount="indefinite" path="M60,124 Q80,108 100,112 Q115,98 130,72" />
      </circle>
      <circle r="1.2" fill="var(--illustration-warning-light)" opacity="0.4">
        <animateMotion dur="4.5s" repeatCount="indefinite" begin="1s" path="M130,72 Q140,48 155,38 Q170,44 185,62" />
      </circle>
      <circle r="1" fill="var(--illustration-danger-muted)" opacity="0.3">
        <animateMotion dur="3s" repeatCount="indefinite" begin="0.5s" path="M100,112 Q115,98 130,72" />
      </circle>

      {/* ── Animated dots at the peaks ── */}
      <circle cx="155" cy="38" r="1.5" fill="var(--illustration-warning-faint)" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="48" r="1.5" fill="#fca5a5" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.8s" repeatCount="indefinite" />
      </circle>

      {/* ── Axis labels ── */}
      <text x="120" y="156" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5" fontWeight="600">State Space</text>
      <text x="10" y={90} textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5" fontWeight="500" transform="rotate(-90, 10, 90)">Value</text>

      {/* Axis lines */}
      <line x1="16" y1="140" x2="228" y2="140" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" opacity="0.25" />
      <line x1="16" y1="140" x2="16" y2="20" stroke="var(--illustration-surface-mid)" strokeWidth="0.5" opacity="0.25" />
      <polygon points="228,138 234,140 228,142" fill="var(--illustration-surface-mid)" opacity="0.25" />
      <polygon points="14,20 16,14 18,20" fill="var(--illustration-surface-mid)" opacity="0.25" />

      {/* ── Formula bar ── */}
      <rect x="14" y="160" width="212" height="14" rx="3" fill="var(--illustration-surface)" stroke="var(--illustration-success-dim)" strokeWidth="0.3" opacity="0.5" />
      <text x="120" y="170" textAnchor="middle" fill="var(--illustration-success-bright)" fontSize="5" fontFamily="monospace" fontWeight="700" opacity="0.75">
        while better neighbor exists: move to it
        <animate attributeName="opacity" values="0.75;0.4;0.75" dur="2s" repeatCount="indefinite" />
      </text>
      <rect x="196" y="162" width="3" height="10" rx="0.5" fill="var(--illustration-success-bright)" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0;0.3" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* ── Floating particles ── */}
      {[[30, 28], [50, 18], [175, 14], [200, 30], [28, 125], [215, 115]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="var(--illustration-success-bright)" opacity="0.08">
          <animate attributeName="cy" values={`${y};${y - 6};${y}`} dur={`${3 + i * 0.6}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.08;0.2;0.08" dur={`${3 + i * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ── Linear Programming Hero Illustration ────────────────────────────────
function LinearProgrammingHeroIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-bg" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-deeper)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--illustration-accent-deep)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lp-feasible" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--illustration-accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-deeper)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="lp-obj" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--illustration-warning-light)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--illustration-warning)" stopOpacity="0.9" />
        </linearGradient>
        <filter id="lp-glow">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="240" height="176" fill="url(#lp-bg)" />
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#lp-bg)" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" />
      </ellipse>

      <text x="120" y="14" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="var(--illustration-accent)" opacity="0.75" letterSpacing="1.5">Linear Programming</text>

      {/* ── Coordinate axes ── */}
      <line x1="30" y1="128" x2="210" y2="128" stroke="var(--illustration-surface-mid)" strokeWidth="0.6" opacity="0.3" />
      <line x1="30" y1="128" x2="30" y2="20" stroke="var(--illustration-surface-mid)" strokeWidth="0.6" opacity="0.3" />
      {/* Arrow heads */}
      <polygon points="210,126 216,128 210,130" fill="var(--illustration-surface-mid)" opacity="0.25" />
      <polygon points="28,20 30,14 32,20" fill="var(--illustration-surface-mid)" opacity="0.25" />

      {/* Grid lines */}
      {[40, 50, 60, 70, 80, 90, 100, 110, 120].map(y => (
        <line key={y} x1="30" y1={140 - y} x2="210" y2={140 - y} stroke="var(--illustration-surface-alt)" strokeWidth="0.3" opacity="0.08" />
      ))}
      {[50, 70, 90, 110, 130, 150, 170, 190].map(x => (
        <line key={x} x1={x} y1="20" x2={x} y2="128" stroke="var(--illustration-surface-alt)" strokeWidth="0.3" opacity="0.08" />
      ))}

      {/* ── Constraints as lines ── */}
      {/* Constraint 1: 5x₁ + 2x₂ ≤ 20 → line: x₂ = (20 - 5x₁)/2 */}
      {/* Intercepts: x₁=0 → x₂=10 (y=128-10*10=28), x₂=0 → x₁=4 (x=30+4*20=110) */}
      <line x1="30" y1="28" x2="110" y2="128" stroke="var(--illustration-secondary)" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.4" />
      <text x="105" y="40" fontSize="4.5" fill="var(--illustration-secondary)" opacity="0.4" fontFamily="system-ui" fontWeight="600">5x₁ + 2x₂ ≤ 20</text>

      {/* Constraint 2: -10x₁ + -12x₂ ≤ -90 → line: x₂ = (90 - 10x₁)/12 */}
      {/* Intercepts: x₁=0 → x₂=7.5 (y=128-75=53), x₂=0 → x₁=9 (x=30+180=210) */}
      <line x1="30" y1="53" x2="210" y2="128" stroke="var(--illustration-danger-muted)" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.4" />
      <text x="145" y="52" fontSize="4.5" fill="var(--illustration-danger-muted)" opacity="0.4" fontFamily="system-ui" fontWeight="600">10x₁ + 12x₂ ≥ 90</text>

      {/* Non-negativity: x₁ ≥ 0 (y-axis), x₂ ≥ 0 (x-axis) — implicit from axes */}

      {/* ── Feasible region (shaded polygon) ── */}
      {/* Intersection points of constraints with axes and each other */}
      {/* Point A: (0, 7.5) → (30, 53) */}
      {/* Point B: intersection of both constraints:
           5x₁ + 2x₂ = 20
           10x₁ + 12x₂ = 90
           Multiply first by 2: 10x₁ + 4x₂ = 40
           Subtract: 8x₂ = 50 → x₂ = 6.25, x₁ = (20 - 12.5)/5 = 1.5
           → (1.5, 6.25) → (30+1.5*20, 128-62.5) = (60, 65.5) */}
      {/* Point C: (4, 0) → (110, 128) */}
      {/* Point D: (0, 10) → (30, 28) — but (0,10) is outside feas region bounded by axis */}
      <path d="M30,53 L60,65.5 L110,128 L30,128 Z" fill="url(#lp-feasible)" stroke="var(--illustration-accent)" strokeWidth="0.3" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
      </path>

      {/* ── Optimal point at vertex ── */}
      <circle cx="60" cy="65.5" r="5" fill="url(#lp-obj)" filter="url(#lp-glow)">
        <animate attributeName="r" values="5;8;5" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="65.5" r="2.5" fill="var(--illustration-warning-light)" opacity="0.9">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* ── Pulsing ring around optimal point ── */}
      <circle cx="60" cy="65.5" r="3" fill="none" stroke="var(--illustration-warning-light)" strokeWidth="0.5" opacity="0.4">
        <animate attributeName="r" values="3;10;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* ── Objective function line sliding across feasible region ── */}
      {/* Cost: 50x₁ + 80x₂. Line moves toward origin to minimize cost */}
      <line x1="40" y1="70" x2="70" y2="60" stroke="var(--illustration-warning-light)" strokeWidth="0.8" opacity="0.5">
        <animate attributeName="x1" values="20;50;20" dur="5s" repeatCount="indefinite" />
        <animate attributeName="y1" values="80;60;80" dur="5s" repeatCount="indefinite" />
        <animate attributeName="x2" values="80;100;80" dur="5s" repeatCount="indefinite" />
        <animate attributeName="y2" values="60;40;60" dur="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5s" repeatCount="indefinite" />
      </line>
      <text x="34" y="74" fontSize="4.5" fill="var(--illustration-warning-light)" opacity="0.5" fontFamily="system-ui" fontWeight="700">min 50x₁ + 80x₂</text>

      {/* ── Animated particle moving along the objective line ── */}
      <circle r="1.5" fill="var(--illustration-warning-faint)" opacity="0.6" filter="url(#lp-glow)">
        <animateMotion dur="5s" repeatCount="indefinite" path="M30,84 Q60,70 90,56" />
      </circle>

      {/* ── Vertex labels ── */}
      <circle cx="110" cy="128" r="1.5" fill="var(--illustration-secondary)" opacity="0.4" />
      <text x="114" y="132" fontSize="4.5" fill="var(--illustration-secondary)" opacity="0.4" fontFamily="monospace">(4, 0)</text>
      <circle cx="30" cy="53" r="1.5" fill="var(--illustration-danger-muted)" opacity="0.4" />
      <text x="18" y="50" fontSize="4.5" fill="var(--illustration-danger-muted)" opacity="0.4" fontFamily="monospace">(0, 7.5)</text>
      <text x="62" y="62" fontSize="4.5" fill="var(--illustration-warning-light)" opacity="0.6" fontFamily="monospace" fontWeight="700">★</text>

      {/* ── Axis labels ── */}
      <text x="120" y="148" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5" fontWeight="600">x₁ (hours)</text>
      <text x="14" y={74} textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5" fontWeight="500" transform="rotate(-90, 14, 74)">x₂ (hours)</text>

      {/* ── Formula bar ── */}
      <rect x="14" y="160" width="212" height="14" rx="3" fill="var(--illustration-surface)" stroke="var(--illustration-deeper)" strokeWidth="0.3" opacity="0.5" />
      <text x="120" y="170" textAnchor="middle" fill="var(--illustration-accent)" fontSize="5" fontFamily="monospace" fontWeight="700" opacity="0.75">
        min c·x  subject to  Ax ≤ b, x ≥ 0
        <animate attributeName="opacity" values="0.75;0.4;0.75" dur="2s" repeatCount="indefinite" />
      </text>
      <rect x="200" y="162" width="3" height="10" rx="0.5" fill="var(--illustration-accent)" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0;0.3" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* ── Floating particles ── */}
      {[[40, 24], [180, 18], [200, 100], [50, 80], [150, 40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="var(--illustration-accent)" opacity="0.08">
          <animate attributeName="cy" values={`${y};${y - 6};${y}`} dur={`${3 + i * 0.6}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.08;0.2;0.08" dur={`${3 + i * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ── Markov Chain Hero Illustration ───────────────────────────────────────
function MarkovChainHeroIllustration() {
  const [chain, setChain] = useState(() => {
    const states = ['S', 'S', 'R', 'R', 'R', 'S'];
    return states;
  });

  useEffect(() => {
    const t = setInterval(() => {
      setChain(prev => {
        const next = [...prev.slice(1)];
        next.push(Math.random() < 0.6 ? 'S' : 'R');
        return next;
      });
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <svg className="w-full h-full" viewBox="0 0 240 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mc-bg" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--illustration-danger-light)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="mc-sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-warning)" stopOpacity="0.25" />
          <stop offset="60%" stopColor="var(--illustration-warning)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--illustration-warning)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mc-rain-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--illustration-info-deep)" stopOpacity="0.25" />
          <stop offset="60%" stopColor="var(--illustration-info-deep)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--illustration-info-deep)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mc-sun-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--illustration-warning-light)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-warning)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="mc-rain-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--illustration-info)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--illustration-info-deep)" stopOpacity="0.05" />
        </linearGradient>
        <marker id="mc-arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--illustration-danger-light)" opacity="0.45" />
        </marker>
        <filter id="mc-glow-filter">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background glow */}
      <ellipse cx="120" cy="88" rx="110" ry="60" fill="url(#mc-bg)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="5s" repeatCount="indefinite" />
      </ellipse>

      <text x="120" y="16" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--illustration-danger-light)" opacity="0.7" letterSpacing="1.5">Markov Chain</text>

      {/* ── Two-state transition diagram ── */}
      {/* Sun state (left) */}
      <g transform="translate(55, 52)">
        {/* Outer glow */}
        <circle cx="30" cy="30" r="28" fill="url(#mc-sun-glow)">
          <animate attributeName="r" values="28;32;28" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* Body */}
        <circle cx="30" cy="30" r="17" fill="url(#mc-sun-body)" stroke="var(--illustration-warning-light)" strokeWidth="0.7" opacity="0.7" filter="url(#mc-glow-filter)" />
        {/* Sun rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <line key={i}
            x1={30 + 22 * Math.cos(a * Math.PI / 180)}
            y1={30 + 22 * Math.sin(a * Math.PI / 180)}
            x2={30 + 26 * Math.cos(a * Math.PI / 180)}
            y2={30 + 26 * Math.sin(a * Math.PI / 180)}
            stroke="var(--illustration-warning-light)" strokeWidth="0.6" opacity="0.25"
          >
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Core */}
        <circle cx="30" cy="30" r="10" fill="var(--illustration-warning)" opacity="0.08" />
        <circle cx="30" cy="30" r="3" fill="var(--illustration-warning-light)" opacity="0.3" />
        <text x="30" y="60" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="7" fontFamily="system-ui" fontWeight="700">Sunny</text>
      </g>

      {/* Rain state (right) */}
      <g transform="translate(155, 52)">
        {/* Outer glow */}
        <circle cx="30" cy="30" r="28" fill="url(#mc-rain-glow)">
          <animate attributeName="r" values="28;32;28" dur="4s" begin="1s" repeatCount="indefinite" />
        </circle>
        {/* Body */}
        <circle cx="30" cy="30" r="17" fill="url(#mc-rain-body)" stroke="var(--illustration-info)" strokeWidth="0.7" opacity="0.7" filter="url(#mc-glow-filter)" />
        {/* Raindrops */}
        {[0, 1, 2].map(i => (
          <g key={i} transform={`translate(${22 + i * 8}, ${22 + i * 3})`}>
            <path d="M0 0 L2 3 L-2 3Z" fill="var(--illustration-info)" opacity="0.25">
              <animate attributeName="opacity" values="0.1;0.4;0.1" dur={`${1.2 + i * 0.5}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}
        {/* Core */}
        <circle cx="30" cy="30" r="10" fill="var(--illustration-info-deep)" opacity="0.08" />
        <circle cx="30" cy="30" r="3" fill="var(--illustration-info)" opacity="0.3" />
        <text x="30" y="60" textAnchor="middle" fill="var(--illustration-info)" fontSize="7" fontFamily="system-ui" fontWeight="700">Rainy</text>
      </g>

      {/* ── Transition edges with animated particles ── */}

      {/* Sun → Sun (self-loop top) */}
      <path d="M76,38 Q106,22 130,38" stroke="var(--illustration-warning-light)" strokeWidth="0.6" fill="none" opacity="0.3" strokeDasharray="3 3" markerEnd="url(#mc-arrow-head)">
        <animate attributeName="stroke-dashoffset" values="0;-30" dur="1.5s" repeatCount="indefinite" />
      </path>
      <circle r="2" fill="var(--illustration-warning-light)" opacity="0.6" filter="url(#mc-glow-filter)">
        <animateMotion dur="1.5s" repeatCount="indefinite" path="M76,38 Q106,22 130,38" />
      </circle>
      <rect x="93" y="18" width="18" height="8" rx="3" fill="var(--illustration-warning)" opacity="0.06" />
      <text x="102" y="24" textAnchor="middle" fill="var(--illustration-warning-light)" fontSize="5.5" fontFamily="monospace" fontWeight="600" opacity="0.7">0.8</text>

      {/* Sun → Rain (down arc) */}
      <path d="M88,68 Q110,98 152,68" stroke="var(--illustration-element-muted)" strokeWidth="0.5" fill="none" opacity="0.25" strokeDasharray="2 4" markerEnd="url(#mc-arrow-head)" />
      <circle r="1.5" fill="var(--illustration-muted-text)" opacity="0.4">
        <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M88,68 Q110,98 152,68" />
      </circle>
      <rect x="108" y="86" width="18" height="8" rx="3" fill="var(--illustration-element-muted)" opacity="0.04" />
      <text x="117" y="93" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5.5" fontFamily="monospace" fontWeight="600" opacity="0.6">0.2</text>

      {/* Rain → Rain (self-loop bottom) */}
      <path d="M164,68 Q134,82 112,68" stroke="var(--illustration-info)" strokeWidth="0.6" fill="none" opacity="0.3" strokeDasharray="3 3" markerEnd="url(#mc-arrow-head)">
        <animate attributeName="stroke-dashoffset" values="0;30" dur="1.5s" repeatCount="indefinite" />
      </path>
      <circle r="2" fill="var(--illustration-info)" opacity="0.6" filter="url(#mc-glow-filter)">
        <animateMotion dur="1.5s" repeatCount="indefinite" path="M164,68 Q134,82 112,68" />
      </circle>
      <rect x="123" y="78" width="18" height="8" rx="3" fill="var(--illustration-info-deep)" opacity="0.06" />
      <text x="132" y="85" textAnchor="middle" fill="var(--illustration-info)" fontSize="5.5" fontFamily="monospace" fontWeight="600" opacity="0.7">0.7</text>

      {/* Rain → Sun (up arc) */}
      <path d="M152,38 Q130,16 88,38" stroke="var(--illustration-element-muted)" strokeWidth="0.5" fill="none" opacity="0.25" strokeDasharray="2 4" markerEnd="url(#mc-arrow-head)" />
      <circle r="1.5" fill="var(--illustration-muted-text)" opacity="0.4">
        <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M152,38 Q130,16 88,38" />
      </circle>
      <rect x="108" y="12" width="18" height="8" rx="3" fill="var(--illustration-element-muted)" opacity="0.04" />
      <text x="117" y="19" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5.5" fontFamily="monospace" fontWeight="600" opacity="0.6">0.3</text>

      {/* ── Animated chain sequence at bottom ── */}
      <g transform="translate(20, 124)">
        <text x="100" y="-4" textAnchor="middle" fill="var(--illustration-muted-lighter)" fontSize="5" fontFamily="system-ui" opacity="0.5">Chain: sampling through time →</text>
        {chain.map((s, i) => (
          <g key={i}>
            {/* Node */}
            <circle cx={16 + i * 28} cy={14} r="7" fill={s === 'S' ? 'var(--illustration-warning)' : 'var(--illustration-info-deep)'} opacity="0.06" stroke={s === 'S' ? 'var(--illustration-warning-light)' : 'var(--illustration-info)'} strokeWidth="0.5" />
            <circle cx={16 + i * 28} cy={14} r="4" fill={s === 'S' ? 'var(--illustration-warning)' : 'var(--illustration-info-deep)'} opacity="0.15" />
            <text x={16 + i * 28} y={16} textAnchor="middle" fill={s === 'S' ? 'var(--illustration-warning-light)' : 'var(--illustration-info)'} fontSize="6" fontFamily="system-ui" fontWeight="700">{s}</text>
            {/* Arrow between nodes */}
            {i < chain.length - 1 && (
              <path d={`M${23 + i * 28},14 L${27 + i * 28},14`} stroke="var(--illustration-element-muted)" strokeWidth="0.4" opacity="0.2" markerEnd="url(#mc-arrow-head)" />
            )}
          </g>
        ))}
        {/* Glowing cursor on latest node */}
        <circle cx={16 + (chain.length - 1) * 28} cy={14} r="9" fill="none" stroke="var(--illustration-danger-light)" strokeWidth="0.4" opacity="0.3">
          <animate attributeName="r" values="9;12;9" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Formula bar */}
      <rect x="20" y="154" width="200" height="16" rx="4" fill="var(--illustration-surface)" stroke="var(--illustration-danger-light)" strokeWidth="0.25" opacity="0.5" />
      <text x="120" y="165" textAnchor="middle" fill="var(--illustration-danger-light)" fontSize="5.5" fontFamily="monospace" fontWeight="600" opacity="0.8">
        P(Xₜ₊₁ | Xₜ) — Transition Probability
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
      </text>
      {/* Cursor blink */}
      <rect x="188" y="157" width="4" height="10" rx="1" fill="var(--illustration-danger-light)" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0;0.3" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* Ambient floating particles */}
      {[[60, 110], [180, 20], [40, 140], [200, 120], [90, 170], [150, 170]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="var(--illustration-danger-light)" opacity="0.08">
          <animate attributeName="cy" values={`${y};${y - 8};${y}`} dur={`${3 + i * 0.7}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.08;0.2;0.08" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ── Simulated Annealing Explorer (Try It Yourself) ───────────────────────────
function SimulatedAnnealingExplorer() {
  const [step, setStep] = useState<'start' | 'choose' | 'stuck' | 'sa-mode' | 'success'>('start');
  const [showDownhill, setShowDownhill] = useState(false);

  const mountain = () => (
    <svg viewBox="0 0 200 120" className="w-full max-w-[200px] mx-auto">
      <defs>
        <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(200,200,200,0.2)" />
          <stop offset="100%" stopColor="rgba(200,200,200,0)" />
        </linearGradient>
      </defs>
      {/* Highest Peak */}
      <polygon points="120,30 135,10 150,30" fill="oklch(0.6 0.15 150)" opacity="0.9" />
      {/* Local peak (closer) */}
      <polygon points="50,50 65,25 80,50" fill="oklch(0.6 0.15 40)" opacity="0.9" />
      {/* Small hill where you start */}
      <polygon points="10,80 25,60 40,80" fill="oklch(0.5 0.05 250)" opacity="0.6" />
      {/* Valley between */}
      {step === 'success' && (
        <polygon points="40,80 55,65 80,50 65,50 50,50 40,80" fill="oklch(0.4 0.05 200)" opacity="0.3" />
      )}
      {/* You marker */}
      {step !== 'success' && (
        <circle cx="25" cy="58" r="4" fill="oklch(0.8 0.15 50)" />
      )}
      {step === 'success' && (
        <polygon points="130,6 133,14 141,14 135,19 137,27 130,22 123,27 125,19 119,14 127,14" fill="oklch(0.8 0.15 140)" />
      )}
      {/* Fog */}
      {step === 'start' && (
        <rect x="0" y="70" width="200" height="50" fill="url(#fog)" opacity="0.5" />
      )}
      {/* Labels */}
      {step === 'success' && (
        <>
          <text x="135" y="6" textAnchor="middle" fill="oklch(0.8 0.15 140)" fontSize="5" fontWeight="bold">Highest Peak</text>
          <text x="65" y="22" textAnchor="middle" fill="oklch(0.6 0.15 40)" fontSize="4" fontWeight="bold">Local Peak</text>
        </>
      )}
    </svg>
  );

  return (
    <div className="mt-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      {/* ── Screen 1: Start ── */}
      {step === 'start' && (
        <>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            You are climbing a mountain to find the highest viewpoint. Unfortunately, it's foggy.
            You can only see the nearby hills.
          </p>

          {mountain()}

          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-3 mt-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              The hiker begins on a small hill. <strong className="text-amber-300">Reach the highest peak.</strong>
            </p>
          </div>

          <button onClick={() => setStep('choose')}
            className="mt-4 w-full px-4 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-600/30 transition-colors">
            Start Climbing →
          </button>
        </>
      )}

      {/* ── Screen 2: Choose ── */}
      {step === 'choose' && (
        <>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            You see two possible moves. Which way do you go?
          </p>

          {mountain()}

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => setStep('stuck')}
              className="px-4 py-6 rounded-2xl bg-emerald-600/15 border-2 border-indigo-500/30 text-center hover:bg-indigo-600/25 transition-all hover:scale-[1.02]">
              <span className="text-xs font-bold text-indigo-300">Climb a slightly higher hill</span>
            </button>
            <button onClick={() => setShowDownhill(true)}
              className="px-4 py-6 rounded-2xl bg-red-600/15 border-2 border-red-500/30 text-center hover:bg-red-600/25 transition-all hover:scale-[1.02]">
              <span className="text-xs font-bold text-red-300">Step down into a valley</span>
            </button>
          </div>

          {showDownhill && (
            <div className="mt-3 rounded-xl bg-amber-900/20 border border-amber-500/30 px-4 py-2">
              <p className="text-xs text-amber-300 leading-relaxed">
                That seems counterintuitive — why go down? Most people choose to climb higher.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Screen 3: Stuck ── */}
      {step === 'stuck' && (
        <>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            You climbed to what looked like the top — but now you're surrounded by fog and can't go higher.
          </p>

          {mountain()}

          <div className="mt-4 rounded-xl bg-rose-900/20 border border-rose-500/30 px-4 py-3">
            <p className="text-xs text-rose-300 font-bold mb-1">You're stuck on a local peak.</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hill climbing would stop here. But the highest peak is still out there, hidden in the fog.
            </p>
          </div>

          <button onClick={() => setStep('sa-mode')}
            className="mt-4 w-full px-4 py-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:bg-cyan-600/30 transition-colors">
            Enable Simulated Annealing Mode →
          </button>
        </>
      )}

      {/* ── Screen 4: SA Mode ── */}
      {step === 'sa-mode' && (
        <>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            <span className="text-cyan-300 font-semibold">Simulated Annealing Mode</span> — Sometimes it's okay to step downhill temporarily.
          </p>

          {mountain()}

          <div className="rounded-xl bg-cyan-900/20 border border-cyan-500/30 px-4 py-3 mt-4">
            <p className="text-xs text-cyan-300 leading-relaxed">
              The system says: <em>"Sometimes it's okay to step downhill temporarily."</em>
            </p>
          </div>

          <button onClick={() => setStep('success')}
            className="mt-4 w-full px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:bg-emerald-600/30 transition-colors">
            Accept a Downhill Move →
          </button>
        </>
      )}

      {/* ── Screen 5: Success ── */}
      {step === 'success' && (
        <>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-indigo-400">Success</div>
            <p className="text-xs font-bold text-indigo-400 mt-2">You found a better solution!</p>
          </div>

          {mountain()}

          <div className="rounded-xl bg-emerald-900/20 border border-indigo-500/30 px-4 py-3 mt-4">
            <p className="text-xs text-indigo-300 leading-relaxed">
              You found a better solution because you accepted a temporary setback.
            </p>
          </div>

          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-3 mt-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="text-amber-300 font-semibold">Final Insight:</span> Simulated Annealing occasionally accepts worse moves to escape local optima and discover better solutions.
            </p>
          </div>

          <button onClick={() => { setStep('start'); setShowDownhill(false); }}
            className="mt-4 w-full px-4 py-2 rounded-xl bg-slate-700/30 border border-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
            Start Over
          </button>
        </>
      )}
    </div>
  );
}

// ── Feasible Region Explorer (Try It Yourself) ───────────────────────────────
function FeasibleRegionExplorer() {
  const vertices = [
    { x: 0, y: 7.5, label: 'V1' },
    { x: 0, y: 10, label: 'V2' },
    { x: 1.5, y: 6.25, label: 'V3' },
  ];
  const cost = (x: number, y: number) => 50 * x + 80 * y;
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const optimalIdx = vertices.reduce((best, v, i) => (cost(v.x, v.y) < cost(vertices[best].x, vertices[best].y) ? i : best), 0);

  const W = 320, H = 320, PAD = 36;
  const maxX = 5, maxY = 12;
  const toSvgX = (x: number) => PAD + (x / maxX) * (W - 2 * PAD);
  const toSvgY = (y: number) => H - PAD - (y / maxY) * (H - 2 * PAD);

  const polygonPoints = vertices.map(v => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ');

  return (
    <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        This is the factory example: minimize <span className="font-mono text-sky-300">50x₁ + 80x₂</span> subject to <span className="font-mono text-slate-300">5x₁+2x₂≤20</span> and <span className="font-mono text-slate-300">10x₁+12x₂≥90</span>.
        The shaded triangle is the feasible region. Click each vertex to compute its cost — the optimum always lies at one of them.
      </p>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 mb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto">
          {/* axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--illustration-surface-mid)" strokeWidth="1" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--illustration-surface-mid)" strokeWidth="1" />
          <text x={W - PAD} y={H - PAD + 14} textAnchor="end" fontSize="8" fill="var(--illustration-muted-light)">x₁</text>
          <text x={PAD - 8} y={PAD} textAnchor="end" fontSize="8" fill="var(--illustration-muted-light)">x₂</text>

          {/* feasible region */}
          <polygon points={polygonPoints} fill="#0ea5e9" fillOpacity="0.15" stroke="var(--illustration-special-light)" strokeWidth="1.5" />

          {/* vertices */}
          {vertices.map((v, i) => {
            const isSel = selected === i;
            const isOpt = revealed && i === optimalIdx;
            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSelected(i)}>
                <circle cx={toSvgX(v.x)} cy={toSvgY(v.y)} r={isSel || isOpt ? 7 : 5}
                  fill={isOpt ? 'var(--illustration-success-bright)' : isSel ? 'var(--illustration-special-light)' : '#0ea5e9'}
                  stroke={isOpt ? 'var(--illustration-success-lighter)' : '#e0f2fe'} strokeWidth="1.5" />
                <text x={toSvgX(v.x)} y={toSvgY(v.y) - 12} textAnchor="middle" fontSize="8" fontWeight="700" fill={isOpt ? 'var(--illustration-success-lighter)' : '#e0f2fe'}>
                  {v.label}{isOpt ? ' ★' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selected !== null && (
        <div className="rounded-xl bg-slate-800/50 border border-sky-500/20 px-5 py-4 mb-4 text-center">
          <p className="text-sm font-bold text-white">
            {vertices[selected].label} = (x₁={vertices[selected].x}, x₂={vertices[selected].y})
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Cost = 50×{vertices[selected].x} + 80×{vertices[selected].y} = <span className="text-sky-300 font-bold">${cost(vertices[selected].x, vertices[selected].y)}</span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setRevealed(true)} className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-indigo-500/30 text-sm font-bold text-indigo-300 hover:bg-emerald-600/30 transition-colors">
          Reveal Optimal Vertex
        </button>
        <button onClick={() => { setSelected(null); setRevealed(false); }} className="px-4 py-2 rounded-xl bg-slate-700/30 border border-slate-700/50 text-sm font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
          Reset
        </button>
      </div>

      {revealed && (
        <p className="mt-4 text-xs text-slate-300 text-center">
          <span className="text-indigo-400 font-semibold">{vertices[optimalIdx].label}</span> has the lowest cost (${cost(vertices[optimalIdx].x, vertices[optimalIdx].y)}) of all three vertices — Simplex would land here.
        </p>
      )}
    </div>
  );
}

// ── Arc Consistency Explorer (Try It Yourself) ───────────────────────────────
function ArcConsistencyExplorer() {
  const REGIONS = [
    { id: 'A', label: 'North', x: 40, y: 30, adj: ['B', 'C'] },
    { id: 'B', label: 'East', x: 160, y: 30, adj: ['A', 'D'] },
    { id: 'C', label: 'West', x: 40, y: 110, adj: ['A', 'D'] },
    { id: 'D', label: 'South', x: 160, y: 110, adj: ['B', 'C'] },
  ];
  const COLORS = ['#ef4444', '#22c55e', '#3b82f6'];
  const COLOR_LABELS = ['Red', 'Green', 'Blue'];

  type Arc = { from: string; to: string };

  const allArcs = (): Arc[] =>
    REGIONS.flatMap(r => r.adj.map(a => ({ from: r.id, to: a })));

  const initialDomains = (): Record<string, number[]> =>
    Object.fromEntries(REGIONS.map(r => [r.id, [0, 1, 2]]));

  const [assignments, setAssignments] = useState<Record<string, number | null>>(
    Object.fromEntries(REGIONS.map(r => [r.id, null]))
  );
  const [domains, setDomains] = useState<Record<string, number[]>>(initialDomains());
  const [arcQueue, setArcQueue] = useState<Arc[]>([]);
  const [message, setMessage] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [flashRemoval, setFlashRemoval] = useState<{ region: string; color: number } | null>(null);
  const [completed, setCompleted] = useState(false);

  const getActualDomains = (
    assign: Record<string, number | null>,
    dom: Record<string, number[]>
  ): Record<string, number[]> => {
    const result: Record<string, number[]> = {};
    for (const r of REGIONS) {
      result[r.id] = assign[r.id] !== null ? [assign[r.id]!] : [...dom[r.id]];
    }
    return result;
  };

  const assignColor = (regionId: string, color: number) => {
    const newAssign = { ...assignments, [regionId]: color };
    const newDom = { ...domains, [regionId]: [color] };
    setAssignments(newAssign);
    setDomains(newDom);
    setSelectedRegion(null);
    setCompleted(false);
    setMessage(`You assigned ${COLOR_LABELS[color]} to ${REGIONS.find(r => r.id === regionId)!.label}.`);

    // Queue arcs FROM neighbors TO this region (they lose this color)
    const neighborArcs = REGIONS
      .filter(r => r.adj.includes(regionId))
      .map(r => ({ from: r.id, to: regionId }));
    setArcQueue(neighborArcs);
  };

  const processNextArc = () => {
    if (arcQueue.length === 0) {
      // Check if all regions have exactly one color
      const actual = getActualDomains(assignments, domains);
      const allAssigned = REGIONS.every(r => assignments[r.id] !== null || actual[r.id].length === 1);
      const noViolations = REGIONS.every(r =>
        r.adj.every(a => {
          const aCol = assignments[a.id] ?? (actual[a.id].length === 1 ? actual[a.id][0] : null);
          const rCol = assignments[r.id] ?? (actual[r.id].length === 1 ? actual[r.id][0] : null);
          return aCol === null || rCol === null || aCol !== rCol;
        })
      );
      if (allAssigned && noViolations) {
        setCompleted(true);
        setMessage('Arc Consistency Achieved! All remaining values satisfy every neighbor constraint.');
      } else if (allAssigned && !noViolations) {
        setMessage('All regions have a color, but some constraints are violated. Try resetting and choosing different colors.');
      } else {
        setMessage('Queue is empty. Assign a color to another region, then continue stepping.');
      }
      return;
    }

    const [arc, ...rest] = arcQueue;
    const actual = getActualDomains(assignments, domains);
    const fromDom = actual[arc.from];
    const toDom = actual[arc.to];
    const newFrom = fromDom.filter(fVal =>
      toDom.some(tVal => tVal !== fVal)
    );

    if (newFrom.length === fromDom.length) {
      setMessage(`Arc ${arc.from} → ${arc.to}: All values in ${REGIONS.find(r => r.id === arc.from)!.label} have support in ${REGIONS.find(r => r.id === arc.to)!.label}. No removal.`);
      setArcQueue(rest);
      return;
    }

    const removed = fromDom.find(v => !newFrom.includes(v))!;
    setFlashRemoval({ region: arc.from, color: removed });
    setTimeout(() => setFlashRemoval(null), 1200);

    setMessage(`Arc ${arc.from} → ${arc.to}: Removed ${COLOR_LABELS[removed]} from ${REGIONS.find(r => r.id === arc.from)!.label} — no supporting value in ${REGIONS.find(r => r.id === arc.to)!.label}.`);

    // Update domain
    const newDom = { ...domains, [arc.from]: assignments[arc.from] !== null ? [assignments[arc.from]!] : newFrom };
    setDomains(newDom);

    // Queue arcs pointing TO the changed variable
    const inboundArcs = REGIONS
      .filter(r => r.adj.includes(arc.from))
      .map(r => ({ from: r.id, to: arc.from }));
    setArcQueue([...rest, ...inboundArcs]);
  };

  const runAll = () => {
    let dom = { ...initialDomains() };
    let assign = { ...assignments };
    let changed = true;
    let iter = 0;
    while (changed && iter < 100) {
      changed = false;
      iter++;
      for (const r of REGIONS) {
        for (const a of r.adj) {
          const fromDom = assign[r.id] !== null ? [assign[r.id]!] : dom[r.id];
          const toDom = assign[a] !== null ? [assign[a]!] : dom[a];
          const newFrom = fromDom.filter((fv: number) =>
            toDom.some((tv: number) => tv !== fv)
          );
          if (newFrom.length < fromDom.length) {
            dom[r.id] = newFrom;
            changed = true;
          }
        }
      }
    }
    setDomains(dom);
    setArcQueue([]);
    const allDone = REGIONS.every(r => assign[r.id] !== null || dom[r.id].length === 1);
    if (allDone) {
      setCompleted(true);
      setMessage('Arc Consistency Achieved! All remaining values satisfy every neighbor constraint.');
    } else {
      setMessage('All arcs processed. Keep assigning colors to continue.');
    }
  };

  const reset = () => {
    setAssignments(Object.fromEntries(REGIONS.map(r => [r.id, null])));
    setDomains(initialDomains());
    setArcQueue([]);
    setSelectedRegion(null);
    setHoveredRegion(null);
    setMessage('');
    setFlashRemoval(null);
    setCompleted(false);
  };

  const actual = getActualDomains(assignments, domains);

  return (
    <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        Assign colors so that <strong className="text-white">adjacent regions are different</strong>.
        Click a region, pick a color, then step through AC-3. AC-3 only <em>removes impossible choices</em> — you make the assignments.
      </p>

      <div className="flex gap-4 mb-5">
        {/* Map */}
        <svg viewBox="0 0 200 150" className="w-2/3 max-w-xs">
          <line x1="60" y1="45" x2="140" y2="45" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="60" y1="105" x2="140" y2="105" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="60" y1="45" x2="60" y2="105" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="140" y1="45" x2="140" y2="105" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          {REGIONS.map(r => {
            const assignedColor = assignments[r.id];
            const fillColor = assignedColor !== null ? COLORS[assignedColor] : '#334155';
            const isSelected = selectedRegion === r.id;
            return (
              <g key={r.id} onClick={() => !completed && setSelectedRegion(r.id)}
                onMouseEnter={() => setHoveredRegion(r.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer">
                <rect x={r.x - 25} y={r.y - 15} width={50} height={30} rx="6"
                  fill={fillColor} stroke={isSelected ? '#a78bfa' : '#64748b'} strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all duration-300" />
                <text x={r.x} y={r.y - 2} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontWeight="bold">{r.label}</text>
                <text x={r.x} y={r.y + 8} textAnchor="middle" fontSize="5" fill="#94a3b8">
                  {actual[r.id].map(d => COLOR_LABELS[d][0]).join(' ')}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Color Picker */}
        {selectedRegion && !completed && (
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 self-start w-1/3">
            <p className="text-[10px] font-bold text-slate-300 mb-2">
              Pick color for {REGIONS.find(r => r.id === selectedRegion)!.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map(c => {
                const available = actual[selectedRegion].includes(c);
                return (
                  <button key={c} onClick={() => available && assignColor(selectedRegion, c)}
                    disabled={!available}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      available
                        ? 'hover:scale-110 cursor-pointer'
                        : 'opacity-20 cursor-not-allowed line-through'
                    }`}
                    style={{ backgroundColor: COLORS[c], borderColor: available ? COLORS[c] : '#475569' }}>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setSelectedRegion(null)}
              className="mt-3 text-[10px] text-slate-300 hover:text-slate-300 underline">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Hover info */}
      {hoveredRegion && (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-3 mb-4 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-4 text-[11px]">
            <div>
              <span className="text-slate-300 block text-[10px]">Region</span>
              <span className="text-white font-bold">{REGIONS.find(r => r.id === hoveredRegion)!.label}</span>
            </div>
            <div>
              <span className="text-slate-300 block text-[10px]">Current Color</span>
              <span className={assignments[hoveredRegion] !== null ? 'text-white font-bold' : 'text-slate-300 italic'}>
                {assignments[hoveredRegion] !== null ? COLOR_LABELS[assignments[hoveredRegion]!] : 'Not set'}
              </span>
            </div>
            <div>
              <span className="text-slate-300 block text-[10px]">Remaining Domain</span>
              <span className="text-white font-mono">
                {actual[hoveredRegion].map(d => COLOR_LABELS[d][0]).join(' ')}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-300">
            Neighbors: {REGIONS.find(r => r.id === hoveredRegion)!.adj.map(id =>
              REGIONS.find(r => r.id === id)!.label
            ).join(', ')}
          </div>
        </div>
      )}

      {/* Domain cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {REGIONS.map(r => {
          const dom = actual[r.id];
          const flash = flashRemoval?.region === r.id;
          return (
            <div key={r.id} className={`rounded-xl border p-3 transition-all duration-500 ${
              flash ? 'border-rose-500/50 bg-rose-900/20' : 'border-slate-800/70 bg-slate-900/30'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-bold text-slate-300">{r.label}</h4>
                {assignments[r.id] !== null && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: COLORS[assignments[r.id]!] + '40', color: '#fff' }}>
                    {COLOR_LABELS[assignments[r.id]!]}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(c => {
                  const alive = dom.includes(c);
                  const isFlashing = flash && flashRemoval?.color === c;
                  return (
                    <span key={c} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-700 ${
                      alive ? 'text-white' : 'text-slate-300'
                    } ${isFlashing ? 'animate-pulse ring-2 ring-rose-400' : ''}`}
                      style={{
                        backgroundColor: alive ? COLORS[c] : '#1e293b',
                        border: `1px solid ${alive ? COLORS[c] : '#334155'}`,
                        opacity: alive ? 1 : 0.2,
                        textDecoration: alive ? 'none' : 'line-through',
                      }}>
                      {COLOR_LABELS[c][0]}
                    </span>
                  );
                })}
              </div>
              {flash && flashRemoval && (
                <div className="text-[9px] text-rose-400 font-bold mt-1.5 animate-fade-in">
                  No support
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={processNextArc}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${
            arcQueue.length === 0
              ? 'bg-slate-700/30 border border-slate-700/50 text-slate-300'
              : 'bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 hover:scale-105'
          }`}>
          {arcQueue.length === 0 ? 'No pending arcs' : `Next Step (${arcQueue.length} arc${arcQueue.length > 1 ? 's' : ''} left)`}
        </button>
        <button onClick={runAll}
          className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-indigo-500/30 text-sm font-bold text-indigo-300 hover:bg-emerald-600/30 transition-all hover:scale-105">
          Run All
        </button>
        <button onClick={reset}
          className="px-4 py-2 rounded-xl bg-slate-700/30 border border-slate-700/50 text-sm font-bold text-slate-300 hover:bg-slate-700/50 transition-all hover:scale-105">
          Reset
        </button>
      </div>

      {/* Success */}
      {completed && (
        <div className="rounded-2xl bg-emerald-900/30 border border-indigo-500/40 p-5 text-center">
          <div className="text-2xl mb-2">&#127881;</div>
          <p className="text-sm font-bold text-indigo-400 mb-1">Arc Consistency Achieved</p>
          <p className="text-xs text-slate-300">All remaining values satisfy every neighbor constraint.</p>
        </div>
      )}

      {/* Message */}
      {message && !completed && (
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 px-4 py-3">
          <p className="text-xs text-violet-300 leading-relaxed">{message}</p>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

// ── Custom Animated Icons for Search Problem Concepts ───────────────────────

function AgentIcon() {
  return (
    <svg className="w-14 h-14 drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Outer radar rings */}
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="r" values="2;11" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="r" values="2;11" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="r" values="2;11" dur="2.5s" begin="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0" dur="2.5s" begin="1.6s" repeatCount="indefinite" />
      </circle>
      
      {/* Agent core with pulsing glow */}
      <circle cx="12" cy="12" r="4" fill="currentColor">
        <animate attributeName="r" values="3.5;4.5;3.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2">
         <animateTransform attributeName="transform" type="rotate" values="0 12 12; 360 12 12" dur="8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function StateIcon() {
  return (
    <svg className="w-14 h-14 drop-shadow-[0_0_15px_rgba(167,139,250,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.1">
        <animateTransform attributeName="transform" type="translate" values="0,0; -1.5,-1.5; 0,0" dur="3s" repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="0.1; 0.5; 0.1" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Floating dot for active state tracking */}
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none">
        <animateMotion path="M0 0 L9 0 L9 9 L0 9 Z" dur="6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function ActionsIcon() {
  return (
    <svg className="w-14 h-14 drop-shadow-[0_0_15px_rgba(167,139,250,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Origin state */}
      <circle cx="12" cy="18" r="3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="5" strokeWidth="1" strokeDasharray="2 2" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" values="0 12 18; 360 12 18" dur="4s" repeatCount="indefinite" />
      </circle>
      
      {/* Action 1 (straight up) */}
      <g>
        <path d="M12 14 L12 5" />
        <polyline points="8 9 12 5 16 9" />
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" />
      </g>
      
      {/* Action 2 (left angle) */}
      <g>
        <path d="M9 16 L4 10" />
        <polyline points="4 15 4 10 9 10" />
        <animateTransform attributeName="transform" type="translate" values="0,0; -3,-3; 0,0" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
      </g>
      
      {/* Action 3 (right angle) */}
      <g>
        <path d="M15 16 L20 10" />
        <polyline points="15 10 20 10 20 15" />
        <animateTransform attributeName="transform" type="translate" values="0,0; 3,-3; 0,0" dur="2.5s" begin="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" begin="1.6s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

function TransitionModelIcon() {
  return (
    <svg className="w-14 h-14 drop-shadow-[0_0_15px_rgba(167,139,250,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* State 1 */}
      <rect x="3" y="9" width="6" height="6" rx="1.5" />
      {/* State 2 */}
      <rect x="15" y="9" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      
      {/* Flow arrow */}
      <path d="M9 12 L15 12" strokeOpacity="0.2" />
      <path d="M9 12 L15 12" strokeDasharray="10" strokeDashoffset="10">
        <animate attributeName="stroke-dashoffset" values="10;-10" dur="1.5s" repeatCount="indefinite" />
      </path>
      
      <polyline points="12 9 15 12 12 15">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
      </polyline>
      
      {/* Data particle traveling */}
      <circle cx="0" cy="0" r="1.5" fill="currentColor" stroke="none">
        <animateMotion path="M9 12 L15 12" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function StateSpaceIcon() {
  return (
    <svg className="w-14 h-14 drop-shadow-[0_0_15px_rgba(167,139,250,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Nodes */}
      <circle cx="12" cy="4" r="2.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="5" cy="11" r="2" />
      <circle cx="19" cy="11" r="2" />
      <circle cx="9" cy="19" r="2.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="15" cy="19" r="2" />
      
      {/* Faint static connections */}
      <g strokeOpacity="0.15">
        <line x1="10.5" y1="5.5" x2="6.5" y2="9.5" />
        <line x1="13.5" y1="5.5" x2="17.5" y2="9.5" />
        <line x1="6" y1="12.5" x2="8" y2="17.5" />
        <line x1="18" y1="12.5" x2="16" y2="17.5" />
        <line x1="11" y1="19" x2="13" y2="19" />
      </g>
      
      {/* Animated active paths */}
      <g strokeWidth="1.5" stroke="currentColor">
        <line x1="10.5" y1="5.5" x2="6.5" y2="9.5" strokeDasharray="10" strokeDashoffset="10">
          <animate attributeName="stroke-dashoffset" values="10;0" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="6" y1="12.5" x2="8" y2="17.5" strokeDasharray="10" strokeDashoffset="10">
          <animate attributeName="stroke-dashoffset" values="10;0" dur="2s" begin="1s" repeatCount="indefinite" />
        </line>
        <line x1="11" y1="19" x2="13" y2="19" strokeDasharray="5" strokeDashoffset="5">
          <animate attributeName="stroke-dashoffset" values="5;0" dur="2s" begin="2s" repeatCount="indefinite" />
        </line>
      </g>
    </svg>
  );
}

function GoalTestIcon() {
  return (
    <svg className="w-14 h-14 drop-shadow-[0_0_15px_rgba(167,139,250,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Target rings */}
      <circle cx="12" cy="12" r="9" strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5" strokeOpacity="0.4" strokeWidth="1.5" />
      
      {/* Checkmark */}
      <path d="M7 13 L10 16 L17 8" strokeOpacity="0.1" />
      <g style={{ transformOrigin: "12px 12px" }}>
        <path d="M7 13 L10 16 L17 8" />
        <animateTransform attributeName="transform" type="scale" values="0.8; 1.2; 1; 0.8" keyTimes="0; 0.2; 0.5; 1" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.2; 0.8; 1" dur="3s" repeatCount="indefinite" />
        {/* Glow behind checkmark */}
        <path d="M7 13 L10 16 L17 8" strokeWidth="4" strokeOpacity="0.3" filter="blur(2px)" />
      </g>
    </svg>
  );
}

function PathCostIcon() {
  return (
    <svg className="w-14 h-14 drop-shadow-[0_0_15px_rgba(167,139,250,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Grid background */}
      <path d="M4 12 L20 12 M12 4 L12 20" strokeWidth="0.5" strokeOpacity="0.2" />
      
      {/* Path curve */}
      <path d="M4 20 C 4 10, 14 14, 20 4" strokeOpacity="0.2" strokeDasharray="3 4" />
      
      {/* Moving object on path */}
      <circle r="3" fill="currentColor" stroke="none">
        <animateMotion dur="3s" repeatCount="indefinite" path="M4 20 C 4 10, 14 14, 20 4" />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0; 0.1; 0.9; 1" dur="3s" repeatCount="indefinite" />
      </circle>
      
      {/* Endpoints */}
      <circle cx="20" cy="4" r="2" fill="currentColor" fillOpacity="0.5" stroke="none" />
      <circle cx="4" cy="20" r="2" fill="currentColor" fillOpacity="0.5" stroke="none" />
      
      {/* Cost popup */}
      <g>
        <rect x="8" y="2" width="6" height="4" rx="1" fill="currentColor" fillOpacity="0.1" strokeOpacity="0.5" strokeWidth="1" />
        <text x="11" y="5" fontSize="3" fontWeight="bold" fontFamily="sans-serif" fill="currentColor" textAnchor="middle" stroke="none">$</text>
        <animateTransform attributeName="transform" type="translate" values="0,2; 0,0; 0,2" dur="3s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

// ── Adversarial Breakdown (for section 2.4) ──────────────────────────────────

function AdversarialBreakdown({ content }: { content: AdversarialContent }) {
  // Keep per-chapter intersection and staggered reveal, but render each chapter as
  // a heading + exactly three responsive cards (md:grid-cols-3) to match ProbabilityBreakdown.
  const [visibilities, setVisibilities] = useState<boolean[]>(content.chapters.map(() => false));
  const [counts, setCounts] = useState<number[]>(content.chapters.map(() => 0));
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRoot = useContext(ScrollContext).current;

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    content.chapters.forEach((_, idx) => {
      const el = refs.current[idx];
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setVisibilities(prev => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
          obs.disconnect();
        }
      }, { threshold: 0.15, root: scrollRoot ?? null });
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [scrollRoot, content.chapters.length]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    content.chapters.forEach((chapter, idx) => {
      if (!visibilities[idx]) return;
      // stagger reveal for sentences + pseudocode
      const total = chapter.sentences.length + (chapter.pseudocode ? 1 : 0);
      for (let i = 1; i <= total; i++) {
        timers.push(setTimeout(() => {
          setCounts(prev => {
            const next = [...prev];
            next[idx] = Math.max(next[idx], i);
            return next;
          });
        }, i * 350));
      }
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [visibilities, content.chapters]);

  const accents = [
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]' },
    { accent: 'from-[var(--brand-primary)]/10', border: 'border-[var(--brand-primary)]/20', badge: 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]' },
  ];

  return (
    <div className="mt-6 space-y-12">
      {content.chapters.map((chapter, idx) => {
        const isVis = visibilities[idx];
        const count = counts[idx];
        const colors = accents[idx % accents.length];

        // Build exactly three cards by distributing sentences across them (preserve order).
        const cards: string[][] = [[], [], []];
        chapter.sentences.forEach((s, i) => {
          cards[i % 3].push(s);
        });
        if (chapter.pseudocode) {
          // append pseudocode to the last card
          cards[2].push(chapter.pseudocode);
        }

        return (
          <div key={idx} ref={el => { refs.current[idx] = el; }}
            className={`rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.accent} to-slate-900/40 px-8 pt-8 pb-6 transition-all duration-700`}
            style={{ opacity: isVis ? 1 : 0, transform: isVis ? 'translateY(0)' : 'translateY(24px)' }}>
            <span className={`inline-flex items-center px-3 py-1 rounded-full ${colors.badge} text-[10px] font-bold uppercase tracking-widest mb-4`}>
              Chapter {idx + 1}
            </span>
            <h3 className="text-xl font-bold text-white mb-4">{chapter.title}</h3>

            {((chapter as any).image) ? (
              <SwipeImage src={(chapter as any).image} alt={(chapter as any).imageAlt || chapter.title} direction={idx % 2 === 0 ? 'left' : 'right'} visible={isVis} />
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {cards.map((cardLines, ci) => (
                <CardReveal key={ci} delayMs={ci * 120 + idx * 80}>
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 h-full">
                    {cardLines.length === 0 ? (
                      <p className="text-sm text-slate-300">&nbsp;</p>
                    ) : (
                      cardLines.map((line, li) => (
                        <div key={li} className={`mb-3 ${li === cardLines.length - 1 ? '' : ''}`}>
                          {li === cardLines.length - 1 && line.includes('\n') ? (
                            <pre className="text-xs text-indigo-300 font-mono whitespace-pre-wrap leading-relaxed">{line}</pre>
                          ) : (
                            <p className="text-sm text-slate-300 leading-relaxed">{line}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardReveal>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}



function ConfettiBurst() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return null;

  const colors = ['#7F77DD', '#1D9E75', '#D85A30', '#BA7517', 'var(--illustration-accent)', '#34D399'];
  const pieces = Array.from({ length: 16 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, y: 0, x: '50%', scale: Math.random() * 0.5 + 0.5 }}
          animate={{
            opacity: 0,
            y: 100 + Math.random() * 100,
            x: `calc(50% + ${Math.random() * 200 - 100}px)`,
            rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)
          }}
          transition={{ duration: 1 + Math.random() * 0.3, ease: 'easeOut' }}
          className="absolute top-1/2 left-0 right-0 w-3 h-3 mx-auto"
          style={{ backgroundColor: colors[i % colors.length] }}
        />
      ))}
    </div>
  );
}

function SearchProblemJourneyMap({ concepts }: { concepts: AIConceptCard[] }) {
  const [active, setActive] = useState(0);
  const [explored, setExplored] = useState<boolean[]>([false, false, false, false]);
  const [showConfetti, setShowConfetti] = useState(false);

  const N = concepts?.length || 0;
  if (N !== 4) return null;

  const COLORS = [
    { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500' },
    { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600' },
    { bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-600' },
    { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600' }
  ];

  const markExplored = (index: number) => {
    if (!explored[index]) {
      const next = [...explored];
      next[index] = true;
      setExplored(next);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
  };

  const [demo1Start, setDemo1Start] = useState<number | null>(null);
  const [demo1Goal, setDemo1Goal] = useState<number | null>(null);
  
  const [demo2Expanded, setDemo2Expanded] = useState(false);

  const [demo3Dir, setDemo3Dir] = useState<'AtoB' | 'BtoA'>('AtoB');
  
  const [demo4Val, setDemo4Val] = useState<number>(0);
  const [demo4Moved, setDemo4Moved] = useState(false);

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {showConfetti && <ConfettiBurst />}

      <div className="flex justify-center gap-2 mb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-500 ${explored[i] ? COLORS[i].bg : 'bg-slate-700'}`} aria-hidden="true" />
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {concepts.map((c, i) => {
          const isActive = active === i;
          const isExplored = explored[i];
          const color = COLORS[i];

          return (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <button
                role="tab"
                aria-selected={isActive}
                aria-label={`Step ${i + 1}: ${c.title}`}
                onClick={() => setActive(i)}
                className={`relative flex-1 rounded-xl border-[1.5px] p-4 text-left transition-all duration-300 ${color.border} ${isActive ? color.bg : 'bg-[#0b1021] hover:bg-slate-800/50'}`}
              >
                <div className="relative inline-block mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${color.bg}`}>
                    {i + 1}
                  </div>
                  {isExplored && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center border border-[#0b1021]">
                      <Check className="w-2 h-2 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className={`font-bold text-sm ${isActive ? 'text-white' : color.text}`}>{c.title}</div>
              </button>

              {i < 3 && (
                <div className="hidden md:flex items-center justify-center w-8 h-12">
                  <div className="w-full h-[3px] bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${color.bg} transition-all duration-500 ease-out`} style={{ width: isExplored ? '100%' : '0%' }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 p-6 rounded-xl border border-slate-700 bg-slate-900/50 relative overflow-hidden min-h-[240px] flex flex-col items-center justify-center">
        
        {active === 0 && (
          <div className="w-full max-w-md mx-auto text-center animate-in fade-in duration-300">
            <p className="text-slate-300 mb-8 text-sm">Click a tile to set the start, click another to set the goal.</p>
            <div className="flex gap-2 justify-center mb-8">
              {Array.from({ length: 8 }).map((_, idx) => {
                const isStart = demo1Start === idx;
                const isGoal = demo1Goal === idx;
                return (
                  <button
                    key={idx}
                    aria-label={`Tile ${idx}`}
                    onClick={() => {
                      if (demo1Start !== null && demo1Goal !== null) {
                        setDemo1Start(idx); setDemo1Goal(null);
                      } else if (demo1Start === null) {
                        setDemo1Start(idx);
                      } else if (demo1Start !== idx && demo1Goal === null) {
                        setDemo1Goal(idx); markExplored(0);
                      }
                    }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md font-bold text-lg transition-colors flex items-center justify-center border ${
                      isStart ? 'bg-indigo-500 border-indigo-400 text-white' 
                      : isGoal ? 'bg-green-500 border-green-400 text-white'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-transparent'
                    }`}
                  >
                    {isStart ? 'S' : isGoal ? 'G' : ''}
                  </button>
                )
              })}
            </div>
            <div className="h-6">
              {demo1Start !== null && demo1Goal !== null && (
                <p className="text-indigo-400 font-bold text-sm">Distance from start to goal: {Math.abs(demo1Goal - demo1Start)} steps</p>
              )}
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="w-full max-w-md mx-auto text-center animate-in fade-in duration-300">
            <p className="text-slate-300 mb-8 text-sm">Click the root node to expand it and reveal new states.</p>
            <div className="flex flex-col items-center">
              <button 
                disabled={demo2Expanded}
                onClick={() => { setDemo2Expanded(true); markExplored(1); }}
                className={`w-12 h-12 rounded-full border-2 border-emerald-600 font-bold text-lg flex items-center justify-center transition-all ${demo2Expanded ? 'opacity-50 cursor-not-allowed bg-emerald-900/30 text-emerald-600/50' : 'bg-emerald-900/50 text-indigo-400 hover:bg-emerald-800/80 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}
              >
                0
              </button>
              
              <div className="h-10 mt-2 w-32 relative">
                {demo2Expanded && (
                  <>
                    <div className="absolute top-0 left-1/2 w-px h-6 bg-emerald-600/50 -translate-x-1/2 -z-10" />
                    <div className="absolute top-4 left-4 right-4 h-px bg-emerald-600/50 -z-10" />
                    <div className="absolute top-4 left-4 w-px h-4 bg-emerald-600/50 -z-10" />
                    <div className="absolute top-4 right-4 w-px h-4 bg-emerald-600/50 -z-10" />
                  </>
                )}
              </div>

              <div className="flex gap-6 relative z-10">
                <AnimatePresence>
                  {demo2Expanded && [1, 2, 3].map((num, idx) => (
                    <motion.div
                      key={num}
                      initial={{ scale: 0, opacity: 0, y: -20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ type: 'spring', delay: idx * 0.1 }}
                      className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                      {num}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <p className="mt-8 text-sm font-bold text-indigo-400 h-6">
                States discovered: {demo2Expanded ? 4 : 1}
              </p>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="w-full max-w-md mx-auto text-center animate-in fade-in duration-300">
            <p className="text-slate-300 mb-8 text-sm">Click the arrow to flip the action direction.</p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="w-14 h-14 rounded-full border-2 border-orange-600 bg-orange-900/20 text-orange-400 font-bold text-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.15)]">
                A
              </div>
              <button
                aria-label="Toggle direction"
                onClick={() => {
                  setDemo3Dir(p => p === 'AtoB' ? 'BtoA' : 'AtoB');
                  markExplored(2);
                }}
                className="w-20 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-colors shadow-inner"
              >
                <ArrowRight className={`text-orange-500 w-6 h-6 transition-transform duration-300 ${demo3Dir === 'BtoA' ? 'rotate-180' : ''}`} />
              </button>
              <div className="w-14 h-14 rounded-full border-2 border-orange-600 bg-orange-900/20 text-orange-400 font-bold text-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.15)]">
                B
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="w-full max-w-md mx-auto text-center animate-in fade-in duration-300">
            <p className="text-slate-300 mb-12 text-sm">Drag to change what the AI optimizes for.</p>
            <div className="px-6 relative">
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                value={demo4Val}
                onChange={(e) => {
                  setDemo4Val(Number(e.target.value));
                  if (!demo4Moved) {
                    setDemo4Moved(true);
                    markExplored(3);
                  }
                }}
                aria-label="Optimization criteria"
                className="ai-range-slider"
              />
              <div className="flex justify-between mt-4 text-xs font-bold text-slate-300 px-1">
                <span className={demo4Val === 0 ? "text-amber-500" : ""}>Dist</span>
                <span className={demo4Val === 1 ? "text-amber-500" : ""}>Time</span>
                <span className={demo4Val === 2 ? "text-amber-500" : ""}>Cost</span>
              </div>
              <div className="mt-10 h-8">
                <p className="text-amber-400 font-bold text-xl drop-shadow-md">
                  {demo4Val === 0 ? "Distance: 4.2 km" : demo4Val === 1 ? "Time: 11 min" : "Money: $2.30"}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


// ── Mastermind Widget ────────────────────────────────────────────────────────────


function ClueCodeWidget() {
  return (
    <div className="bg-[var(--illustration-bg-surface-dark)] rounded-2xl border border-slate-800 overflow-hidden shadow-xl mb-6">
      <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
        <span className="ml-2 text-xs font-mono text-slate-300">clue_kb.py</span>
      </div>
      <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
        <span className="text-slate-300"># Add the clues to the KB</span><br/>
        <span className="text-white">knowledge</span> = <span className="text-indigo-400">And</span>(<br/>
        <br/>
        <span className="text-slate-300">    # Start with the game conditions: one item in each category has to be true.</span><br/>
        <span className="text-indigo-400">    Or</span>(mustard, plum, scarlet),<br/>
        <span className="text-indigo-400">    Or</span>(ballroom, kitchen, library),<br/>
        <span className="text-indigo-400">    Or</span>(knife, revolver, wrench),<br/>
        <br/>
        <span className="text-slate-300">    # Add the information from the three initial cards we saw</span><br/>
        <span className="text-indigo-400">    Not</span>(mustard),<br/>
        <span className="text-indigo-400">    Not</span>(kitchen),<br/>
        <span className="text-indigo-400">    Not</span>(revolver),<br/>
        <br/>
        <span className="text-slate-300">    # Add the guess someone made that it is Scarlet, who used a wrench in the library</span><br/>
        <span className="text-indigo-400">    Or</span>(<span className="text-indigo-400">Not</span>(scarlet), <span className="text-indigo-400">Not</span>(library), <span className="text-indigo-400">Not</span>(wrench)),<br/>
        <br/>
        <span className="text-slate-300">    # Add the cards that we were exposed to</span><br/>
        <span className="text-indigo-400">    Not</span>(plum),<br/>
        <span className="text-indigo-400">    Not</span>(ballroom)<br/>
        )
      </pre>
    </div>
  );
}

function MastermindInteractiveWidget() {
  const [round, setRound] = useState(1);
  const rounds = [
    { colors: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400'], feedback: 2, desc: "Round 1: Player One reports 'two'. Two colors are in the correct position, two are in the wrong place." },
    { colors: ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-400'], feedback: 0, desc: "Round 2: Player Two swaps Red and Blue. Player One says 'zero'. This means the swapped colors were right initially, and the untouched two were wrong." },
    { colors: ['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500'], feedback: 4, desc: "Round 3: Player Two swaps the other two (Green and Yellow) and restores Red and Blue. Player One says 'four'. Solved!" }
  ];
  
  const current = rounds[round - 1];

  return (
    <div className="bg-[var(--illustration-bg-surface-dark)] border border-slate-800/60 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-xl font-semibold text-slate-200">Interactive Mastermind</h4>
          <div className="flex space-x-2">
            <button 
              onClick={() => setRound(r => Math.max(1, r - 1))}
              disabled={round === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${round === 1 ? 'bg-slate-800/50 text-slate-300 cursor-not-allowed' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Prev Round
            </button>
            <button 
              onClick={() => setRound(r => Math.min(3, r + 1))}
              disabled={round === 3}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${round === 3 ? 'bg-slate-800/50 text-slate-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
            >
              Next Round
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-black/40 rounded-xl p-8 border border-slate-800/50">
          <div className="flex space-x-6">
            {current.colors.map((c, i) => (
              <motion.div 
                key={`${round}-${i}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`w-16 h-16 rounded-full ${c} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
              />
            ))}
          </div>
          <motion.div 
            key={`badge-${round}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700 shadow-inner"
          >
            <span className="text-3xl font-bold text-white">{current.feedback}</span>
          </motion.div>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
          <p className="text-slate-300 leading-relaxed">{current.desc}</p>
        </div>
      </div>
    </div>
  );
}

export function KnowledgeEngineeringTryItYourselfWidget() {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });

  const steps = [
    {
      title: 'Step 1',
      prompt: 'Sam has an alibi — she was on a video call the whole time.',
      question: 'What does this add to the KB?',
      options: [
        { label: 'A) Not(Sam)', value: 'Not(Sam)', correct: true, explanation: 'Sam can be ruled out, so the KB should include Not(Sam).' },
        { label: 'B) Not(Riya)', value: 'Not(Riya)', correct: false, explanation: 'This clue says nothing about Riya.' },
        { label: 'C) Or(Sam, Riya)', value: 'Or(Sam, Riya)', correct: false, explanation: 'That would add a weaker statement, not the direct exclusion.' },
      ],
    },
    {
      title: 'Step 2',
      prompt: "There's cake crumbs found in the Garden, but none in the Kitchen.",
      question: 'What does this add to the KB?',
      options: [
        { label: 'A) Kitchen', value: 'Kitchen', correct: false, explanation: 'The crumbs suggest the opposite location.' },
        { label: 'B) Not(Kitchen)', value: 'Not(Kitchen)', correct: true, explanation: 'The evidence points away from the Kitchen.' },
        { label: 'C) Not(Garden)', value: 'Not(Garden)', correct: false, explanation: 'The crumbs support the Garden instead.' },
      ],
    },
    {
      title: 'Step 3',
      prompt: "A fork was found clean and unused in the drawer, but there are no visible forks anywhere near the crime scene, and Riya's hands were sticky with frosting.",
      question: 'What does this add to the KB?',
      options: [
        { label: 'A) Fork', value: 'Fork', correct: false, explanation: 'The clue points to the opposite method.' },
        { label: 'B) Not(Hands)', value: 'Not(Hands)', correct: false, explanation: 'The frosting on Riya\'s hands supports the opposite conclusion.' },
        { label: 'C) Not(Fork)', value: 'Not(Fork)', correct: true, explanation: 'The evidence strongly rules out the fork as the method.' },
      ],
    },
  ] as const;

  const currentStep = steps[step - 1];

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setFeedback({ type: 'correct', message: 'Correct! Move on to the next clue.' });
      setStep(prev => (prev >= steps.length ? 4 : prev + 1));
      window.setTimeout(() => {
        setFeedback({ type: null, message: '' });
      }, 450);
    } else {
      setFeedback({ type: 'incorrect', message: 'Not quite — try again.' });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 via-[#111827] to-[var(--illustration-bg-surface-dark)] p-6 md:p-8 shadow-[0_0_40px_rgba(15,23,42,0.45)] mb-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-[var(--illustration-bg-surface-dark)] overflow-hidden shadow-xl mb-6">
        <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 text-xs font-mono text-slate-300">knowledge_engineering.py</span>
        </div>
        <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
          <span className="text-slate-300"># Mystery setup</span><br/>
          <span className="text-white">mystery</span> = <span className="text-indigo-400">And</span>(<br/>
          <span className="text-indigo-400">    Or</span>(sam, riya, ana),<br/>
          <span className="text-indigo-400">    Or</span>(kitchen, garden),<br/>
          <span className="text-indigo-400">    Or</span>(fork, hands)<br/>
          )
        </pre>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5 md:p-6">
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Someone ate the last slice of cake. There are 3 suspects (Sam, Riya, Ana), 2 possible locations (Kitchen, Garden), and 2 possible methods (Fork, Bare Hands). Use the clues below to deduce who did it, where, and how.
        </p>

        {step <= steps.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-white">{currentStep.title}</h4>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{step}/3</span>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-900/50 p-4">
              <p className="text-slate-300 leading-relaxed mb-3">{currentStep.prompt}</p>
              <p className="text-sm font-semibold text-slate-200">{currentStep.question}</p>
            </div>

            <div className="grid gap-3">
              {currentStep.options.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleAnswer(option.correct)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-indigo-500/40 hover:bg-slate-800/80"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {feedback.type && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === 'correct' ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
                {feedback.type === 'correct' ? '✓ Correct!' : '✗ Not quite — try again.'}
                {feedback.message ? ` ${feedback.message}` : ''}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-indigo-300">
                <span className="text-lg font-bold">✓</span>
              </div>
              <h4 className="text-lg font-semibold text-indigo-300">Final Deduction</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              By elimination: it wasn't Sam (Step 1), it wasn't the Kitchen (Step 2), and it wasn't the Fork (Step 3). Since only Riya, Ana remain as suspects, and we know it's not Sam — combined with process of elimination across all clues — the answer is: <span className="font-semibold text-white">Riya ate the cake, in the Garden, with her Hands.</span>
            </p>
            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4 font-mono text-sm text-cyan-300">
              And(Not(Sam), Not(Kitchen), Not(Fork)) → concluding Riya, Garden, Hands
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Minimax Explorer (Try It Yourself) ─────────────────────────────
function MinimaxExplorer() {
  const [selectedMove, setSelectedMove] = useState<'A' | 'B' | null>(null);
  const [minTurnFinished, setMinTurnFinished] = useState(false);

  const reset = useCallback(() => {
    setSelectedMove(null);
    setMinTurnFinished(false);
  }, []);

  const handleMove = useCallback((move: 'A' | 'B') => {
    setSelectedMove(move);
    setTimeout(() => {
      setMinTurnFinished(true);
    }, 800);
  }, []);

  return (
    <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-slate-900/40 p-8 mt-12">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Try It Yourself</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 text-center">
          <h4 className="text-sm font-bold text-white mb-2">Play as MAX</h4>
          <p className="text-xs text-slate-300 mb-6">
            You are MAX. It's your turn at the root of the tree.
            Assuming MIN plays optimally, which move guarantees you the highest score?
          </p>
          
          <div className="flex justify-center items-start gap-8 mb-4 relative">
            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleMove('A')}
                disabled={selectedMove !== null}
                className={`px-6 py-3 rounded-xl font-bold border-2 transition-all duration-200 ${selectedMove === 'A' ? 'bg-violet-600 text-white border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : selectedMove === 'B' ? 'bg-slate-800/50 text-slate-300 border-slate-700' : 'bg-slate-800 text-violet-400 border-violet-500/30 hover:bg-slate-700 hover:border-violet-400 hover:scale-105'}`}
              >
                Move A
              </button>
              <div className="h-8 w-0.5 bg-slate-600 my-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-500"></div>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-slate-300 uppercase mb-2">MIN sees:</div>
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg border-2 ${selectedMove === 'A' && minTurnFinished ? 'border-violet-400 bg-violet-900/50 text-violet-300 font-bold scale-110 shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'border-slate-700 bg-slate-800 text-slate-300'} flex items-center justify-center text-sm transition-all duration-300`}>3</div>
                <div className={`w-10 h-10 rounded-lg border-2 border-slate-700 bg-slate-800 text-slate-300 flex items-center justify-center text-sm opacity-40 transition-all duration-300`}>12</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleMove('B')}
                disabled={selectedMove !== null}
                className={`px-6 py-3 rounded-xl font-bold border-2 transition-all duration-200 ${selectedMove === 'B' ? 'bg-violet-600 text-white border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : selectedMove === 'A' ? 'bg-slate-800/50 text-slate-300 border-slate-700' : 'bg-slate-800 text-violet-400 border-violet-500/30 hover:bg-slate-700 hover:border-violet-400 hover:scale-105'}`}
              >
                Move B
              </button>
              <div className="h-8 w-0.5 bg-slate-600 my-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-500"></div>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-slate-300 uppercase mb-2">MIN sees:</div>
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg border-2 border-slate-700 bg-slate-800 text-slate-300 flex items-center justify-center text-sm opacity-40 transition-all duration-300`}>8</div>
                <div className={`w-10 h-10 rounded-lg border-2 ${selectedMove === 'B' && minTurnFinished ? 'border-rose-400 bg-rose-900/50 text-rose-300 font-bold scale-110 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-slate-700 bg-slate-800 text-slate-300'} flex items-center justify-center text-sm transition-all duration-300`}>2</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 flex flex-col justify-center min-h-[220px]">
          {!selectedMove ? (
            <div className="text-center text-slate-300">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mx-auto mb-4 opacity-50">
                <span className="text-xl">?</span>
              </div>
              <p className="text-sm font-medium text-slate-300">Waiting for your move...</p>
              <p className="text-xs mt-3 leading-relaxed">Remember: MIN will always choose the smallest available number to minimize your score.</p>
            </div>
          ) : !minTurnFinished ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-t-violet-400 border-r-violet-400 border-b-slate-700 border-l-slate-700 animate-spin flex items-center justify-center mx-auto mb-4"></div>
              <p className="text-sm font-bold text-violet-400 animate-pulse">MIN is thinking...</p>
            </div>
          ) : (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              {selectedMove === 'A' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-900/50 border border-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    <span className="text-indigo-400 font-bold text-xl">✓</span>
                  </div>
                  <h4 className="text-indigo-400 font-bold mb-2">Optimal Move!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    You chose <strong>Move A</strong>. MIN looked at options [3, 12] and chose the lowest score: <strong className="text-indigo-300">3</strong>.<br/><br/>
                    If you had chosen <strong>Move B</strong>, MIN would have forced you into a score of <strong className="text-rose-300">2</strong> (from [8, 2]). 
                    By maximizing the minimum possible outcome (3 vs 2), you played perfectly!
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-rose-900/50 border border-rose-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <span className="text-rose-400 font-bold text-xl">✗</span>
                  </div>
                  <h4 className="text-rose-400 font-bold mb-2">Suboptimal Move</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    You chose <strong>Move B</strong>. MIN looked at options [8, 2] and chose the lowest score: <strong className="text-rose-300">2</strong>.<br/><br/>
                    If you had chosen <strong>Move A</strong>, MIN would have been forced to give you a score of <strong className="text-indigo-300">3</strong>. 
                    You must assume MIN plays perfectly and always maximize the minimum possible outcome!
                  </p>
                </>
              )}
              <button 
                onClick={reset} 
                className="px-4 py-1.5 rounded-full bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Truth Table Explorer (Interactive Light Bulb Widget) ─────────────────────────────
const LightbulbIcon = ({ on }: { on: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" height="32" 
    viewBox="0 0 24 24" 
    fill={on ? "#facc15" : "none"} 
    stroke={on ? "#facc15" : "var(--illustration-muted-light)"} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`transition-colors duration-300 ${on ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : ''}`}
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
);

function TruthTableExplorer() {
  const [p, setP] = useState(false);
  const [q, setQ] = useState(false);
  const [connective, setConnective] = useState<'NOT' | 'AND' | 'OR' | 'IMP' | 'BIC'>('AND');

  const result = (() => {
    switch (connective) {
      case 'NOT': return !p;
      case 'AND': return p && q;
      case 'OR': return p || q;
      case 'IMP': return !p || q;
      case 'BIC': return p === q;
    }
  })();

  const connectiveInfo = {
    'NOT': { label: 'NOT (¬)', note: 'Inverses the truth value of the proposition. Example: ¬P means "It is not raining."' },
    'AND': { label: 'AND (∧)', note: 'True only when both P and Q are true.' },
    'OR': { label: 'OR (∨)', note: 'True if at least one of P or Q is true. In logic, "Or" is usually inclusive (meaning one, the other, or both).' },
    'IMP': { label: 'IMPLICATION (→)', note: 'False only when P is true and Q is false. Why is F → T trivially true? Like a promise: "If it rains (P), I bring an umbrella (Q)". The promise is only broken if it rains and I do not bring it!' },
    'BIC': { label: 'BICONDITIONAL (↔)', note: '"If and only if". Equivalent to (P → Q) AND (Q → P). True only when both have the exact same truth value.' }
  };

  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900/30 overflow-hidden p-6 mt-4 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap gap-2 mb-8 relative z-10 border-b border-slate-800/50 pb-4">
        {(['NOT', 'AND', 'OR', 'IMP', 'BIC'] as const).map(c => (
          <button
            key={c}
            onClick={() => setConnective(c)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${connective === c ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'bg-slate-950/50 text-slate-300 border border-slate-800/50 hover:bg-slate-800/50 hover:text-slate-300'}`}
          >
            {connectiveInfo[c].label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-8 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm font-bold text-slate-300">Proposition P</div>
          <button 
            onClick={() => setP(!p)}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <LightbulbIcon on={p} />
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${p ? 'bg-violet-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${p ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className={`text-xs font-bold ${p ? 'text-violet-400' : 'text-slate-300'}`}>{p ? 'TRUE' : 'FALSE'}</span>
          </button>
        </div>

        <div className="text-3xl font-black text-slate-300">
          {connective === 'NOT' ? '¬' : connective === 'AND' ? '∧' : connective === 'OR' ? '∨' : connective === 'IMP' ? '→' : '↔'}
        </div>

        <div className={`flex flex-col items-center gap-4 transition-opacity duration-300 ${connective === 'NOT' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <div className="text-sm font-bold text-slate-300">Proposition Q</div>
          <button 
            onClick={() => setQ(!q)}
            disabled={connective === 'NOT'}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <LightbulbIcon on={q} />
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${q ? 'bg-violet-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${q ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className={`text-xs font-bold ${q ? 'text-violet-400' : 'text-slate-300'}`}>{q ? 'TRUE' : 'FALSE'}</span>
          </button>
        </div>

        <div className="text-3xl font-black text-slate-300">=</div>

        <div className="flex flex-col items-center gap-4">
          <div className="text-sm font-bold text-white">Result</div>
          <div className="flex flex-col items-center gap-3">
            <LightbulbIcon on={result} />
            <div className={`px-4 py-1.5 rounded-lg border-2 transition-colors duration-300 ${result ? 'border-amber-400/50 bg-amber-400/10 text-amber-400' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>
              <span className="text-xs font-bold">{result ? 'TRUE' : 'FALSE'}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 px-5 py-4 bg-slate-950/50 rounded-lg border border-slate-800/50 flex gap-3">
        <span className="text-violet-400 text-lg mt-0.5 flex-shrink-0">💡</span>
        <p className="text-sm text-slate-300 leading-relaxed">
          {connectiveInfo[connective].note}
        </p>
      </div>
    </div>
  );
}


// ── Interactive Inference & Knowledge Base Widgets ─────────────────────────────

function LiveModelChecker() {
  const [p, setP] = useState(false);
  const [q, setQ] = useState(false);
  const [r, setR] = useState(false);

  const stmt1 = p;
  const stmt2 = !q;
  const stmt3 = !(p && !q) || r; // (P ∧ ¬Q) → R
  const kbTrue = stmt1 && stmt2 && stmt3;
  const isTarget = p && !q && r;

  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900/30 overflow-hidden mb-4 p-6">
      <div className="mb-6">
        <p className="text-sm font-bold text-white mb-2">Symbols:</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded border border-slate-800">
            <span className="font-bold text-rose-400">P</span> = It is a Tuesday
          </div>
          <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded border border-slate-800">
            <span className="font-bold text-rose-400">Q</span> = It is raining
          </div>
          <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded border border-slate-800">
            <span className="font-bold text-rose-400">R</span> = Harry will go for a run
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-950/50 rounded border border-slate-800 text-sm">
          <p className="text-slate-300"><strong className="text-white">Knowledge Base (KB):</strong> (P ∧ ¬Q) → R, with P true and Q false.</p>
          <p className="text-slate-300 mt-1"><strong className="text-white">Query:</strong> R</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm font-bold text-white mb-4">Set Model Values (World State):</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'P', val: p, set: setP },
              { label: 'Q', val: q, set: setQ },
              { label: 'R', val: r, set: setR }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50">
                <span className="font-bold text-slate-300">{item.label}</span>
                <button
                  onClick={() => item.set(!item.val)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${item.val ? 'bg-rose-600' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.val ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-white mb-4">Live Evaluation:</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950/50">
              <span className="text-slate-300">Statement 1: P</span>
              <span className={`font-bold ${stmt1 ? 'text-indigo-400' : 'text-rose-400'}`}>{stmt1 ? 'TRUE' : 'FALSE'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950/50">
              <span className="text-slate-300">Statement 2: ¬Q</span>
              <span className={`font-bold ${stmt2 ? 'text-indigo-400' : 'text-rose-400'}`}>{stmt2 ? 'TRUE' : 'FALSE'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950/50">
              <span className="text-slate-300">Statement 3: (P ∧ ¬Q) → R</span>
              <span className={`font-bold ${stmt3 ? 'text-indigo-400' : 'text-rose-400'}`}>{stmt3 ? 'TRUE' : 'FALSE'}</span>
            </div>
          </div>
          
          <div className={`mt-6 p-4 rounded-xl border-2 transition-colors duration-500 ${isTarget ? 'border-emerald-500 bg-indigo-500/10' : kbTrue ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'}`}>
            <div className="flex items-center gap-3">
              <div className={`text-2xl ${isTarget ? '' : 'grayscale opacity-50'}`}>
                {kbTrue ? '✅' : '❌'}
              </div>
              <div>
                {isTarget ? (
                  <p className="text-sm font-bold text-indigo-400">You found it — this is the only model where KB is true, so KB ⊨ R!</p>
                ) : kbTrue ? (
                  <p className="text-sm font-bold text-indigo-400">Valid model — KB is satisfied here!</p>
                ) : (
                  <p className="text-sm font-bold text-rose-400">This model breaks the KB.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InferenceRulesInteractive() {
  const rules = [
    { name: "Modus Ponens", desc: "If P → Q is known, and P is known to be true, then Q is true." },
    { name: "And Elimination", desc: "If P ∧ Q is true, then P is true and Q is true individually." },
    { name: "Double Negation Elimination", desc: "¬(¬P) is equivalent to P." },
    { name: "Implication Elimination", desc: "P → Q is equivalent to ¬P ∨ Q." },
    { name: "Biconditional Elimination", desc: "P ↔ Q is equivalent to (P → Q) ∧ (Q → P)." },
    { name: "De Morgan's Law", desc: "¬(P ∧ Q) is equivalent to ¬P ∨ ¬Q, and ¬(P ∨ Q) is equivalent to ¬P ∧ ¬Q." },
    { name: "Distributive Property", desc: "P ∧ (Q ∨ R) is equivalent to (P ∧ Q) ∨ (P ∧ R), and similarly for Or over And." }
  ];

  const questions = [
    { q: "We know that 'If it rains, the grass is wet' (P → Q). We also know 'It is raining' (P). Therefore, 'The grass is wet' (Q).", ans: "Modus Ponens", resp: "Correct! This is Modus Ponens — Q must be true." },
    { q: "We know that 'It is raining AND it is cold' (P ∧ Q). Therefore, we can conclude 'It is raining' (P).", ans: "And Elimination", resp: "Correct! If both are true, we can safely extract either one." },
    { q: "We have the sentence 'If I study, I pass' (P → Q). We can rewrite this as 'Either I do NOT study, OR I pass' (¬P ∨ Q).", ans: "Implication Elimination", resp: "Correct! This is the standard way AI systems remove implications to convert to normal forms." }
  ];

  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [qIdx, setQIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);

  const toggleFlip = (i: number) => {
    setFlipped(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const handleAns = (ans: string) => {
    setSelectedAns(ans);
  };

  const nextQ = () => {
    setQIdx((prev) => (prev + 1) % questions.length);
    setSelectedAns(null);
  };

  const [p, setP] = useState(false);
  const [q, setQ] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {rules.map((rule, i) => (
          <div 
            key={i} 
            className="relative h-32 cursor-pointer" 
            style={{ perspective: '1000px' }}
            onClick={() => toggleFlip(i)}
          >
            <div className={`w-full h-full transition-transform duration-500`} style={{ transformStyle: 'preserve-3d', transform: flipped[i] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-colors shadow-lg" style={{ backfaceVisibility: 'hidden' }}>
                <p className="text-sm font-bold text-white text-center">{rule.name}</p>
                <div className="absolute bottom-2 right-2 opacity-30">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-4 rounded-xl border border-indigo-500/30 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-xs text-slate-300 text-center leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-900/40 p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Test Yourself</span>
          <span className="text-xs text-slate-300">Question {qIdx + 1} of {questions.length}</span>
        </div>
        <p className="text-sm text-white font-medium mb-6 leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-800">
          {questions[qIdx].q}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {rules.map(r => {
            const isCorrect = r.name === questions[qIdx].ans;
            const isSelected = selectedAns === r.name;
            let btnClass = "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white";
            
            if (selectedAns) {
              if (isCorrect) {
                btnClass = "bg-emerald-600/20 text-indigo-400 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
              } else if (isSelected && !isCorrect) {
                btnClass = "bg-rose-600/20 text-rose-400 border-rose-500";
              } else {
                btnClass = "bg-slate-900 text-slate-300 border-slate-800 opacity-50";
              }
            }

            return (
              <button
                key={r.name}
                disabled={selectedAns !== null}
                onClick={() => handleAns(r.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 ${btnClass}`}
              >
                {r.name}
              </button>
            )
          })}
        </div>

        {selectedAns && (
          <div className={`p-4 rounded-lg border ${selectedAns === questions[qIdx].ans ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-rose-500/30 bg-rose-500/10'} flex items-center justify-between animate-in fade-in zoom-in duration-300`}>
            <p className={`text-sm font-bold ${selectedAns === questions[qIdx].ans ? 'text-indigo-400' : 'text-rose-400'}`}>
              {selectedAns === questions[qIdx].ans ? questions[qIdx].resp : "Not quite! Try reading the rule definitions again."}
            </p>
            <button 
              onClick={selectedAns === questions[qIdx].ans ? nextQ : () => setSelectedAns(null)}
              className="px-4 py-1.5 rounded-full bg-slate-800 text-xs text-white hover:bg-slate-700 transition-colors"
            >
              {selectedAns === questions[qIdx].ans ? "Next Question →" : "Try Again"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-800/70 bg-slate-900/30 overflow-hidden mt-8">
        <div className="px-5 py-4 border-b border-slate-800/70 flex justify-between items-center bg-slate-950/80">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400">💡</span> Implication Elimination Live Table
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">P:</span>
              <button onClick={() => setP(!p)} className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${p ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{p ? 'T' : 'F'}</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Q:</span>
              <button onClick={() => setQ(!q)} className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${q ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{q ? 'T' : 'F'}</button>
            </div>
          </div>
        </div>
        <div className="px-5 py-6 bg-slate-900/50 flex flex-col md:flex-row items-center justify-around gap-6 text-center">
          <div>
            <p className="text-xs text-slate-300 font-bold mb-2 uppercase tracking-widest">P → Q</p>
            <div className={`px-6 py-3 rounded-xl border-2 text-xl font-black ${(!p || q) ? 'border-emerald-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 bg-slate-800/50 text-slate-300'} transition-colors duration-300 shadow-lg`}>
              {(!p || q) ? 'TRUE' : 'FALSE'}
            </div>
          </div>
          <div className="text-3xl font-black text-slate-300">≡</div>
          <div>
            <p className="text-xs text-slate-300 font-bold mb-2 uppercase tracking-widest">¬P ∨ Q</p>
            <div className={`px-6 py-3 rounded-xl border-2 text-xl font-black ${(!p || q) ? 'border-emerald-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 bg-slate-800/50 text-slate-300'} transition-colors duration-300 shadow-lg`}>
              {(!p || q) ? 'TRUE' : 'FALSE'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}


// ── Animated Quantifier Scanner ──────────────────────────────────────────────

function AnimatedQuantifierScanner() {
  const [scanType, setScanType] = useState<'all' | 'exists' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [statusText, setStatusText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // P(x) = "x has more than 100 students"
  const domain = [
    { name: "Gryffindor", color: "bg-red-500", value: true },
    { name: "Hufflepuff", color: "bg-yellow-500", value: true },
    { name: "Ravenclaw", color: "bg-blue-500", value: false },
    { name: "Slytherin", color: "bg-green-500", value: true },
    { name: "Beauxbatons", color: "bg-cyan-300", value: true },
  ];

  const handleScan = (type: 'all' | 'exists') => {
    if (isAnimating) return;
    setScanType(type);
    setCurrentIndex(0);
    setStatusText("Scanning domain...");
    setIsAnimating(true);
  };

  const resetScan = () => {
    setScanType(null);
    setCurrentIndex(-1);
    setStatusText("");
    setIsAnimating(false);
  };

  useEffect(() => {
    if (!isAnimating || currentIndex === -1) return;

    const timer = setTimeout(() => {
      const currentHouse = domain[currentIndex];
      
      if (scanType === 'all') {
        if (!currentHouse.value) {
          // Found a false! Universal fails.
          setStatusText(`❌ Found a counter-example at ${currentHouse.name} — the ∀ statement is FALSE. Universal quantification requires ALL objects to satisfy P(x).`);
          setIsAnimating(false);
        } else if (currentIndex === domain.length - 1) {
          // Reached the end and all were true
          setStatusText(`✅ All objects checked — the ∀ statement is TRUE.`);
          setIsAnimating(false);
        } else {
          // Move to next
          setCurrentIndex(prev => prev + 1);
        }
      } else if (scanType === 'exists') {
        if (currentHouse.value) {
          // Found a true! Existential succeeds.
          setStatusText(`✅ Found a match at ${currentHouse.name} — the ∃ statement is TRUE. Existential quantification only needs ONE object to satisfy P(x).`);
          setIsAnimating(false);
        } else if (currentIndex === domain.length - 1) {
          // Reached the end and none were true
          setStatusText(`❌ No match found — the ∃ statement is FALSE.`);
          setIsAnimating(false);
        } else {
          // Move to next
          setCurrentIndex(prev => prev + 1);
        }
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [currentIndex, isAnimating, scanType]);

  return (
    <div className="mt-8 rounded-xl border border-slate-800/70 bg-slate-900/30 overflow-hidden p-6 relative">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <p className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-indigo-400">🔍</span> Animated Quantifier Scanner
          </p>
          <p className="text-xs text-slate-300">
            Domain: 5 Houses. Property <code className="text-indigo-300 bg-slate-800 px-1 rounded">P(x) = "x has more than 100 students"</code>
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button 
            onClick={() => handleScan('all')}
            disabled={isAnimating}
            className="px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-bold transition-colors disabled:opacity-50"
          >
            Check ∀ (For All)
          </button>
          <button 
            onClick={() => handleScan('exists')}
            disabled={isAnimating}
            className="px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-bold transition-colors disabled:opacity-50"
          >
            Check ∃ (There Exists)
          </button>
          <button 
            onClick={resetScan}
            disabled={isAnimating}
            className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 py-8 mb-4 border-y border-slate-800/50 bg-slate-950/30 relative">
        {/* Scanner Line */}
        {scanType && currentIndex >= 0 && (
          <div 
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none transition-all duration-700 ease-in-out z-0"
            style={{ 
              left: `calc(50% - 150px + ${currentIndex * 64}px)`,
              transform: 'translateX(-50%)'
            }}
          />
        )}
        
        {domain.map((house, idx) => {
          const isScanned = scanType !== null && (idx < currentIndex || (idx === currentIndex && !isAnimating));
          const isScanningThis = scanType !== null && idx === currentIndex;
          let iconState = "opacity-50 grayscale";
          
          if (isScanned) {
             iconState = house.value ? "opacity-100 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/50" : "opacity-100 scale-105 shadow-[0_0_15px_rgba(244,63,94,0.3)] border-rose-500/50 grayscale-0";
          } else if (isScanningThis) {
             iconState = "opacity-100 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] border-white/50";
          }

          return (
            <div key={idx} className="flex flex-col items-center gap-3 relative z-10 w-16">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border-2 border-transparent ${iconState} ${house.color} bg-opacity-20`}>
                <div className={`w-6 h-6 rounded-md ${house.color} opacity-80`} />
              </div>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{house.name.substring(0,3)}</p>
              
              {/* Check/Cross overlay */}
              {isScanned && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-in zoom-in duration-300 ${house.value ? 'bg-emerald-500 text-slate-900' : 'bg-rose-500 text-white'}`}>
                  {house.value ? '✓' : '✗'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="h-16 flex items-center justify-center">
        {statusText ? (
          <p className={`text-sm font-bold text-center animate-in fade-in slide-in-from-bottom-2 duration-300 ${statusText.includes('❌') ? 'text-rose-400' : statusText.includes('✅') ? 'text-indigo-400' : 'text-slate-300'}`}>
            {statusText}
          </p>
        ) : (
          <p className="text-sm text-slate-300 text-center italic">
            Select a quantifier above to start scanning the domain.
          </p>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800/80">
        <p className="text-xs text-slate-300 text-center">
          <strong className="text-slate-300">Notice:</strong> ∀ needs to check every single object and fails at the first exception. ∃ can stop as soon as it finds one match.
        </p>
      </div>
    </div>
  );
}

export default function AILearnSection({ block }: { block: AILearnSectionBlock }) {
  const [stage, setStage] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [insightVisible, setInsightVisible] = useState(false);
  const heroRef    = useRef<HTMLDivElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const N = block.concepts?.length || 0;
  const isMLDL = block.hero.title.includes('Machine Learning');
  const isAlreadyAround = block.hero.title.includes('Already Around');
  const isSearchProblem = block.hero.title.includes('Search Problem') || block.hero.title.includes('Every Goal Starts');
  const isBfsDfs = block.hero.title.includes('Breadth-First');
  const isGreedySearch = block.hero.title.includes('Greedy Search');
  const isPropositionalLogic = block.hero.title.includes('Propositional Logic');
  const isInference = block.hero.title.includes('Knowledge Bases & Inference');
  const isKnowledgeEngineering = block.hero.title.includes('Knowledge Engineering');
  const isUnsupervised = block.hero.title.includes('Unsupervised Learning');
  const isOverfitting = block.hero.title.includes('Overfitting');
  const isNNArchitecture = block.hero.title.includes('Neurons & Network');
  const isTrainingBackprop = block.hero.title.includes('Training & Backpropagation');
  const isRandomVariables = block.hero.title.includes('Random Variables');
  const isBayesTheorem = block.hero.title.includes("Bayes'");
  const isBayesianNetworks = block.hero.title.includes('Bayesian Networks');
  const isMarkovModels = block.hero.title.includes('Markov Models');
  const isOptimization = block.hero.title.includes('What is Optimization');
  const isHillClimbing = block.hero.title.includes('Hill Climbing');
  const isLinearProgramming = block.hero.title.includes('Linear Programming');
  const isRL = block.hero.title.includes('Reinforcement Learning');
  const isAdversarial = block.hero.title.includes('Adversarial');
  const isFirstOrderLogic = block.hero.title.includes('First-Order Logic');
  const isLanguage = block.hero.title.includes('Language');
  const light = block.theme === 'light';
  const probChapterCount = block.probabilityContent?.chapters.length ?? 0;
  const insightThreshold = block.probabilityContent ? probChapterCount - 1 : N - 1;

  const scrollCtx = useContext(ScrollContext);
  const scrollRoot = scrollCtx.current;

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let fired = false;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) { fired = true; setHeroVisible(true); obs.disconnect(); }
    }, { threshold: 0.04, root: scrollRoot ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (isBfsDfs && stage < 2) return;
    if (block.probabilityContent || block.chapterContent) {
      setInsightVisible(true);
      return;
    }
    if (!isBfsDfs && stage < insightThreshold) return;
    const el = insightRef.current;
    if (!el) return;
    let fired = false;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) { fired = true; setInsightVisible(true); obs.disconnect(); }
    }, { threshold: 0.04, root: scrollRoot ?? null });
    obs.observe(el);
    return () => obs.disconnect();
  }, [stage, insightThreshold, isBfsDfs, scrollRoot]);

  const advance = useCallback((to: number) => setStage(p => Math.max(p, to)), []);

  return (
    <div className="ai-illustration">
      <style>{KEYFRAMES}</style>

      {/* ── Hero card ── */}
      {!light && block.hero.title && (
        <ScrollReveal totalItems={(block.hero.intro || '').split('|').length}>
          {(visibleCount, outerStyle, getInnerStyle) => (
            <div className="transition-all duration-700 ease-out" style={outerStyle}>
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-[#111827] via-[#0f1623] to-[var(--illustration-bg-glow)]">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--brand-primary)]/8 rounded-full blur-3xl pointer-events-none" />
            <div className={`relative flex flex-col md:flex-row items-center gap-6 p-8 md:p-10 ${isMLDL ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] text-[10px] font-bold uppercase tracking-widest">
                  {block.hero.category ?? 'Learn'}
                </span>
                <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                  {block.hero.title}
                </h2>
                <p className={`text-slate-300 text-sm leading-relaxed ${isMLDL ? '' : 'max-w-sm'}`}>
                  <StaggeredIntro lines={(block.hero.intro || '').split('|')} getInnerStyle={getInnerStyle} />
                </p>
              </div>
              {block.hero.illustration && !imgErr && !isMLDL && !isAlreadyAround && !isTrainingBackprop ? (
                <div className="flex-shrink-0 w-full md:w-60 h-44 rounded-2xl overflow-hidden">
                  <img
                    src={block.hero.illustration}
                    alt={block.hero.title}
                    className="w-full h-full object-cover opacity-80"
                    onError={() => setImgErr(true)}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-full md:w-60 h-44 rounded-2xl overflow-hidden bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/10">
                  {isMLDL ? <NestedCirclesIllustration /> : isAlreadyAround ? <AlreadyAroundIllustration /> : isSearchProblem ? <SearchProblemIllustration /> : isBfsDfs ? <BfsDfsIllustration /> : isGreedySearch ? <GreedySearchIllustration /> : isUnsupervised ? <BiologyExplorerIllustration /> : isOverfitting ? <OverfittingHeroIllustration /> : isNNArchitecture ? <NNArchitectureIllustration /> : isTrainingBackprop ? <TrainingBackpropIllustration /> : isRandomVariables ? <RandomVariablesHeroIllustration /> : isBayesTheorem ? <BayesHeroIllustration /> : isBayesianNetworks ? <BayesianNetworksHeroIllustration /> : isMarkovModels ? <MarkovChainHeroIllustration /> : isOptimization ? <OptimizationHeroIllustration /> : isHillClimbing ? <HillClimbingHeroIllustration /> : isLinearProgramming ? <LinearProgrammingHeroIllustration /> : isRL ? <RLHeroIllustration /> : isLanguage ? <LanguageHeroIllustration /> : <HeroIllustration />}
                </div>
              )}
            </div>
          </div>
        </div>
          )}
        </ScrollReveal>
      )}

      {/* ── Concept description cards (for standard sections) ── */}
      {!isBfsDfs && !isGreedySearch && !block.probabilityContent && !block.chapterContent && !isPropositionalLogic && !isOverfitting && !isAdversarial && !isFirstOrderLogic && !isSearchProblem && !isInference && !isKnowledgeEngineering && block.concepts && block.concepts.length > 0 && (
        <div className="mt-6 space-y-6">
          {block.concepts.map((c, i) => {
            const enterFromRight = i % 2 === 0;
            return (
              <motion.div
                key={c.number}
                initial={{ opacity: 0, x: enterFromRight ? 80 : -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-[var(--illustration-bg-surface-mid)] to-[var(--illustration-bg-glow)] overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--brand-primary)]/6 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative flex items-start gap-4 p-6">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-[var(--brand-primary)] bg-[var(--brand-primary)]/25 text-[var(--brand-primary)] flex items-center justify-center text-sm font-black shadow-[0_0_12px_rgba(0,191,179,0.4)]">
                      {c.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white mb-1.5">{c.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{c.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── BFS/DFS Breakdown (for section 2.2) ── */}
      {isBfsDfs && block.bfsDfsContent && (
        <BfsDfsBreakdown content={block.bfsDfsContent} />
      )}

      {/* ── Greedy / A* Breakdown (for section 2.3) ── */}
      {isGreedySearch && block.greedyAStarContent && (
        <GreedyAStarBreakdown content={block.greedyAStarContent} />
      )}

      {/* ── Probability / Breakdown Content (for sections that have it) ── */}
      {(block.probabilityContent || block.chapterContent) && (
          <ChapterBreakdown content={(block.probabilityContent || block.chapterContent)!} advance={advance} scrollRoot={scrollRoot} light={light} />
        )}

      {/* ── Adversarial Breakdown ── */}
      {isAdversarial && block.adversarialContent && (
        <AdversarialBreakdown content={block.adversarialContent} />
      )}
      {isAdversarial && (
        <CardReveal>
          <MinimaxExplorer />
        </CardReveal>
      )}

      {/* ── Overfitting Infographic ── */}
      {isOverfitting && block.overfittingContent && (
        <OverfittingInfographic takeaway={block.overfittingContent.takeaway} />
      )}

      {/* ── Scroll spacers + Sentinels for BFS/DFS key insight ──
          The spacer only needs to exist while its sentinel is still
          waiting to fire (it's scroll runway for the trigger). Once the
          sentinel has advanced the stage, both collapse away instead of
          leaving a permanent gap in the layout. */}
      {isBfsDfs && Array.from({ length: 2 }).map((_, i) => {
        const target = i + 1;
        const waiting = stage === target - 1;
        if (!waiting) return null;
        return (
          <div key={i}>
            <div className="h-[180px]" />
            <Sentinel onEnter={() => advance(target)} rootRef={scrollRoot} />
          </div>
        );
      })}

      {/* ── Propositional Logic Fundamentals ── */}
      {isPropositionalLogic && (
        <div className="relative mt-6">
          <div className={`relative rounded-3xl overflow-hidden ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-gradient-to-br from-[var(--illustration-bg-surface-mid)] to-[var(--illustration-bg-glow)]'}`}>
            {!light && <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/6 rounded-full blur-3xl pointer-events-none" />}
            <div className="relative px-8 py-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-[var(--brand-primary)] rounded-full" />
                <h3 className={`text-lg font-bold ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>Fundamentals of Propositional Logic</h3>
              </div>
              <div className="grid gap-4">
                {[
                  { label: 'Propositions', points: ['Statements that are definitively True or False \u2014 never both, never neither', '"It is raining" is a proposition; "Is it raining?" is not'] },
                  { label: 'Connectives', points: ['AND: both must be true', 'OR: at least one is true', 'NOT: flips the truth value', 'These three operations build every Boolean expression'] },
                  { label: 'Implication (\u2192)', points: ['"If P then Q" \u2014 the rule holds unless P is true and Q is false', 'This is how AI encodes conditional logic'] },
                  { label: 'Entailment (\u2283)', points: ['A set of facts entails a conclusion if that conclusion is true in every world where the facts hold', 'It is the mathematical definition of logical consequence'] },
                  { label: 'Truth Tables', points: ['Exhaustive listings of truth values for every possible assignment of atomic propositions', 'Each row represents a unique combination of truth values'] },
                  { label: 'Knowledge Base', points: ['A set of sentences (facts and rules) that an AI agent knows to be true', 'Inference derives new sentences that are logically entailed by the KB'] },
                ].map((item, i) => (
                  <div key={i} className={`rounded-xl px-5 py-4 ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-card)]' : 'border border-slate-800/70 bg-slate-900/30'}`}>
                    <p className={`text-sm font-bold mb-2.5 ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>{item.label}</p>
                    <div className="space-y-1.5">
                      {item.points.map((pt, j) => (
                        <div key={j} className="flex gap-2.5">
                          <span className="text-[var(--brand-primary)] mt-0.5 flex-shrink-0 text-xs leading-relaxed">{'\u25B8'}</span>
                          <span className={`text-sm leading-relaxed ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

            {/* ── Logical Connectives & Truth Tables ── */}
      {isPropositionalLogic && (
        <div className="relative mt-6">
          <div className={`relative rounded-3xl overflow-hidden ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-gradient-to-br from-[var(--illustration-bg-surface-mid)] to-[var(--illustration-bg-glow)]'}`}>
            {!light && <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/6 rounded-full blur-3xl pointer-events-none" />}
            <div className="relative px-8 py-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-[var(--brand-primary)] rounded-full" />
                <h3 className={`text-lg font-bold ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>Logical Connectives & Truth Tables</h3>
              </div>
              <TruthTableExplorer />
            </div>
          </div>
        </div>
      )}

      {/* ── 7 Core Search-Problem Concepts ── */}
      {isSearchProblem && (
        <>
          <div className="mt-6">
            {[
              { heading: 'Agent', text: 'The "agent" is whatever is doing the deciding — it senses its surroundings and picks what to do next. For example, in a navigation app, the agent is basically the car figuring out which route to take.', icon: <AgentIcon /> },
              { heading: 'State', text: 'A "state" is just one snapshot of how everything is arranged at a given moment. For example, in a sliding tile puzzle, every possible arrangement of the tiles is a different state. The very first snapshot — where the search begins — is called the Initial State. In a maps app, that\'s your current location.', icon: <StateIcon /> },
              { heading: 'Actions', text: '"Actions" are the choices available to you from a particular state. Given a state, there\'s a specific set of moves you\'re allowed to make from it. In a tile puzzle, the actions are just the different ways you\'re allowed to slide a tile from where you currently are.', icon: <ActionsIcon /> },
              { heading: 'Transition Model', text: 'The "transition model" tells you what new state you land in after taking a specific action from a specific state. In other words: state + action = new state. In a tile puzzle, sliding one tile in a direction moves you from your current arrangement to a new one.', icon: <TransitionModelIcon /> },
              { heading: 'State Space', text: 'The "state space" is every single state you could possibly reach, starting from the initial state, through any combination of actions. You can picture it as a big map or graph, where each state is a point, and each action is a line connecting one point to another.', icon: <StateSpaceIcon /> },
              { heading: 'Goal Test', text: 'The "goal test" is simply the check that tells you whether you\'ve reached the answer. If the current state passes the test, you\'re done. If not, the search keeps going. In a maps app, the goal test is just: "Have I arrived at the destination?"', icon: <GoalTestIcon /> },
              { heading: 'Path Cost', text: '"Path cost" is a number that represents how expensive or long a particular path is. It\'s not enough to just reach the goal — a good search also tries to get there using the path with the lowest cost, i.e. the fastest or cheapest route.', icon: <PathCostIcon /> }
            ].map((c, i) => {
              const isLeft = i % 2 === 0;
              const enterFromRight = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: enterFromRight ? 80 : -80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="mb-6 last:mb-0"
                >
                  <div className={`flex flex-col md:flex-row items-center gap-6 p-8 rounded-3xl ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-[var(--illustration-bg-glow)]'} ${!isLeft ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-full md:w-1/4 flex justify-center items-center">
                      <div className="w-28 h-28 rounded-2xl bg-[var(--brand-primary)]/8 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)]">
                        {c.icon}
                      </div>
                    </div>
                    <div className="w-full md:w-3/4 text-center md:text-left space-y-2">
                      <h3 className={`text-xl font-bold ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>{c.heading}</h3>
                      <p className={light ? 'text-[var(--text-secondary)] leading-relaxed' : 'text-slate-300 leading-relaxed'}>{c.text}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6">
            <CardReveal>
              <div className={`relative rounded-3xl overflow-hidden px-8 py-10 text-center ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-[var(--illustration-bg-glow)]'}`}>
                {!light && <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/8 to-transparent pointer-events-none" />}
                <div className="flex justify-center items-center gap-2.5 mb-3">
                  <svg className="w-4 h-4 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest leading-none">Key Insight</span>
                </div>
                <p className={`relative text-xl font-bold leading-snug max-w-2xl mx-auto whitespace-pre-line ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>
                  AI search is the process of finding the optimal path through a state space from an initial state to a goal state.
                </p>
              </div>
            </CardReveal>
          </div>
        </>
      )}

      {isInference && (
        <div className="relative mt-6 mb-12">
          {/* Section: Inference */}
          <div className={`relative rounded-3xl overflow-hidden mb-6 ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-gradient-to-br from-[var(--illustration-bg-surface-mid)] to-[var(--illustration-bg-glow)]'}`}>
            <div className="relative px-8 py-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[var(--brand-primary)] rounded-full" />
                <h3 className={`text-lg font-bold ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>Inference</h3>
              </div>
              <p className={`text-sm ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>Inference is the process of deriving new sentences from existing ones in the knowledge base.</p>
            </div>
          </div>

          {/* Section: Model Checking */}
          <div className={`relative rounded-3xl overflow-hidden mb-6 ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-gradient-to-br from-[var(--illustration-bg-surface-mid)] to-[var(--illustration-bg-glow)]'}`}>
            <div className="relative px-8 py-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[var(--brand-primary)] rounded-full" />
                <h3 className={`text-lg font-bold ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>Model Checking</h3>
              </div>
              <p className={`text-sm mb-6 ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>Model Checking determines whether KB ⊨ α (whether the knowledge base entails a query) by enumerating every possible model and checking that the query is true in every model where the KB is true.</p>

              <LiveModelChecker />
              <p className={`text-sm ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>Only one model has KB = true, and in that model R is also true — so KB ⊨ R.</p>
            </div>
          </div>

          {/* Section: Inference Rules */}
          <div className={`relative rounded-3xl overflow-hidden mb-6 ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-gradient-to-br from-[var(--illustration-bg-surface-mid)] to-[var(--illustration-bg-glow)]'}`}>
            <div className="relative px-8 py-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[var(--brand-primary)] rounded-full" />
                <h3 className={`text-lg font-bold ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>Inference Rules</h3>
              </div>
              <p className={`text-sm mb-6 ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>Inference rules let us derive new knowledge directly, without checking every possible model.</p>

              <InferenceRulesInteractive />
            </div>
          </div>

          {/* Section: Resolution */}
          <div className={`relative rounded-3xl overflow-hidden ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-gradient-to-br from-[var(--illustration-bg-surface-mid)] to-[var(--illustration-bg-glow)]'}`}>
            <div className="relative px-8 py-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[var(--brand-primary)] rounded-full" />
                <h3 className={`text-lg font-bold ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>Resolution</h3>
              </div>
              <p className={`text-sm mb-6 ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>Resolution is an inference rule stating that if one atomic proposition in an Or clause is false, the other must be true. It relies on finding complementary literals (P and ¬P) to generate new clauses.</p>

              <div className={`rounded-xl px-5 py-4 mb-6 ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-card)]' : 'border border-slate-800/70 bg-slate-900/30'}`}>
                <p className={`text-sm font-bold mb-2 ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>CNF Conversion Steps</p>
                <ol className={`list-decimal list-inside text-sm space-y-1.5 ml-1 ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>
                  <li>Eliminate biconditionals: (α ↔ β) becomes (α → β) ∧ (β → α)</li>
                  <li>Eliminate implications: (α → β) becomes ¬α ∨ β</li>
                  <li>Move negations inward using De Morgan's Law until only literals are negated</li>
                </ol>
              </div>

              <div className={`rounded-xl px-5 py-4 ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-card)]' : 'border border-slate-800/70 bg-slate-900/30'}`}>
                <p className={`text-sm font-bold mb-2 ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>Worked Example</p>
                <div className={`font-mono text-sm space-y-1 ${light ? 'text-[var(--brand-primary)]' : 'text-slate-300'}`}>
                  <p>(P ∨ Q) → R</p>
                  <p>→ ¬(P ∨ Q) ∨ R <span className={light ? 'text-[var(--text-muted)] ml-2' : 'text-slate-300 ml-2'}>(eliminate implication)</span></p>
                  <p>→ (¬P ∧ ¬Q) ∨ R <span className={light ? 'text-[var(--text-muted)] ml-2' : 'text-slate-300 ml-2'}>(De Morgan's Law)</span></p>
                  <p>→ (¬P ∨ R) ∧ (¬Q ∨ R) <span className={light ? 'text-[var(--text-muted)] ml-2' : 'text-slate-300 ml-2'}>(Distributive Law)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ── First-Order Logic: Quantification ── */}
      {isFirstOrderLogic && (
        <div className="relative mt-6 mb-12">

          <AnimatedQuantifierScanner />

          <div className={`relative rounded-3xl overflow-hidden px-8 py-8 mb-6 ${light ? 'border border-[var(--border-medium)] bg-[var(--surface-container)]' : 'border border-slate-800 bg-[var(--illustration-bg-glow)]'}`}>
            {!light && <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/8 to-transparent pointer-events-none" />}
            <div className="relative flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className={`text-lg font-bold ${light ? 'text-[var(--text-primary)]' : 'text-white'}`}>Think of it this way</h3>
            </div>
            <p className={`relative text-sm leading-relaxed ${light ? 'text-[var(--text-secondary)]' : 'text-slate-300'}`}>
              Instead of writing a separate rule for Minerva, Pomona, Gilderoy, and every other person individually ("Minerva belongs to a house," "Pomona belongs to a house," …), universal quantification lets you write the rule once — "for every person x, there exists a house y that x belongs to" — and it automatically applies to anyone who fits the category "person." Existential quantification is the piece that says "such a house is out there somewhere," even before you know which one.
            </p>
          </div>

        </div>
      )}

      {/* ── Key Insight (appears after scroll sentinel for BFS/DFS, or after all stages) ── */}
      {block.keyInsight && (isBfsDfs ? stage >= 2 : true) && (
        <div
          ref={insightRef}
          className={`mt-6 transition-all duration-700 ease-out ${insightVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="relative rounded-3xl border border-slate-800 bg-[var(--illustration-bg-glow)] overflow-hidden px-8 py-10 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/8 to-transparent pointer-events-none" />
            <div className="flex justify-center items-center gap-2.5 mb-3">
              <svg className="w-4 h-4 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest leading-none">Key Insight</span>
            </div>
            <p className="relative text-xl font-bold text-white leading-snug max-w-2xl mx-auto whitespace-pre-line text-center">
              {typeof block.keyInsight === 'string' ? block.keyInsight.replace(/\|/g, '\n') : block.keyInsight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
