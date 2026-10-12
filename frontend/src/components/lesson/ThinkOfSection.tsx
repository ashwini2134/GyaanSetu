import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { ThinkOfBlock } from '../../types/lesson';

// ─── image lookup ─────────────────────────────────────────────────────────────
const IMAGE_MAP: Array<[RegExp, string]> = [
  [/recipe|kitchen|cook|baking/i, 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80'],
  [/swiss army|multi.?tool|toolbox|tool/i, 'https://images.unsplash.com/photo-1615127717889-8945dba1f05a?w=800&q=80'],
  [/storage box|container|labeled box/i, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80'],
  [/shopping/i, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'],
  [/receptionist|gatekeeper/i, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80'],
  [/fill.?in.?the.?blank|form|template/i, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80'],
  [/rulebook|rule/i, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80'],
  [/traffic light|signal/i, 'https://images.unsplash.com/photo-1557404763-69708cd8b9ce?w=800&q=80'],
  [/washing|laundry/i, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80'],
  [/megaphone|broadcast/i, 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80'],
  [/phone/i, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80'],
  [/sticky note|sticker|label/i, 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'],
  [/locker|school|cabinet/i, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80'],
  [/folder|filing|office/i, 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80'],
  [/container|jar|bottle/i, 'https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=800&q=80'],
  [/envelope|sealed|letter|mail/i, 'https://images.unsplash.com/photo-1649019489428-70f505daacd6?w=800&q=80'],
  [/book|phone book|library|shelf|catalog/i, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80'],
  [/vending/i, 'https://images.unsplash.com/photo-1618506557292-ec1862b3c506?w=800&q=80'],
  [/chain|string|beads|necklace/i, 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80'],
  [/notebook|journal/i, 'https://images.unsplash.com/photo-1517842647576-c639042777db?w=800&q=80'],
  [/pizza|sharing/i, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80'],
  [/weighing scale|scale|balance/i, 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80'],
  [/college|university|entrance/i, 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80'],
  [/attendance|roll call/i, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80'],
  [/alarm|clock|snooze/i, 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=800&q=80'],
  [/bank|passbook|atm/i, 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80'],
  [/bus|journey|transport/i, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
  [/train|coach|platform/i, 'https://images.unsplash.com/photo-1474487548417-781cb6d646ef?w=800&q=80'],
  [/playlist|music/i, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'],
  [/passport|id card/i, 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80'],
  [/club|member|group/i, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'],
  [/contact|phone book/i, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80'],
  [/restaurant|menu|food/i, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'],
  [/coffee|machine/i, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'],
  [/building|house|construction/i, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80'],
  [/register|grade|school/i, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80'],
  [/game show|quiz/i, 'https://images.unsplash.com/photo-1611996575749-79a3a250f5f0?w=800&q=80'],
  [/hotel|check.?in|receptionist/i, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
  [/badge|name tag|conference/i, 'https://images.unsplash.com/photo-1560264280-88b68371db39?w=800&q=80'],
  [/gps|map|direction|navigate|route/i, 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80'],
  [/ai|artificial|intelligence|machine learning/i, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80'],
  [/word processor|editor|document/i, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80'],
];

function imageForTitle(title: string): string | null {
  for (const [re, url] of IMAGE_MAP) if (re.test(title)) return url;
  return null;
}

// ─── derivation helpers ───────────────────────────────────────────────────────
function toBullets(description: string): string[] {
  const sents = description
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 12);
  if (sents.length >= 2) {
    return sents.slice(0, 3).map(s => (s.endsWith('.') ? s : s + '.'));
  }
  const byDash = description.split(' — ').filter(s => s.trim().length > 10);
  if (byDash.length >= 2) return byDash.slice(0, 3).map(s => s.trim());
  return [description.trim()];
}

function parseMapping(items?: string[]): { left: string; right: string }[] {
  if (!items?.length) return [];
  return items.map(item => {
    const sep = item.indexOf(' → ');
    return sep > -1
      ? { left: item.slice(0, sep).trim(), right: item.slice(sep + 3).trim() }
      : { left: item.trim(), right: '' };
  });
}

function deriveVizBullets(block: ThinkOfBlock): string[] {
  const v = block.visualization;
  const pairs = parseMapping(v.items);
  const hasPairs = pairs.length > 0 && !!pairs[0].right;

  if (v.type === 'decision') {
    return [
      `Python evaluates: "${v.condition ?? v.title}"`,
      `If true, the result is "${v.trueLabel ?? 'True'}"`,
      `If false, the result is "${v.falseLabel ?? 'False'}"`,
    ];
  }
  if (v.type === 'repetition' && v.items?.length) {
    return [
      'The loop runs through each step in order',
      'It repeats until the condition is no longer true',
      'Each pass through is called one iteration',
    ];
  }
  if (hasPairs) {
    return pairs
      .slice(0, 3)
      .map(p => `${p.left} in real life maps to ${p.right} in programming`);
  }
  return [
    `This concept is called: ${v.title}`,
    'It directly mirrors the real-life example above',
    'Understanding the analogy makes the code obvious',
  ];
}

function deriveCodeHighlights(block: ThinkOfBlock): string[] {
  const lines = block.code.code
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  const hints: string[] = [];
  for (const line of lines) {
    if (hints.length >= 3) break;
    if (/=/.test(line) && !line.startsWith('print')) {
      const [varPart] = line.split('=');
      hints.push(`${varPart.trim()} stores the value on the right`);
    } else if (line.startsWith('print')) {
      hints.push('print() displays the result on the screen');
    } else if (line.startsWith('for ') || line.startsWith('while ')) {
      hints.push('The loop repeats this block of code automatically');
    } else if (line.startsWith('if ')) {
      hints.push('Python checks this condition before running the block');
    } else if (line.startsWith('def ')) {
      hints.push('def defines a reusable function');
    }
  }
  while (hints.length < 3) {
    hints.push('Each line is one instruction Python executes in order');
  }
  return hints.slice(0, 3);
}

// ─── Scroll sentinel ──────────────────────────────────────────────────────────
function Sentinel({ onEnter }: { onEnter: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired.current) {
          fired.current = true;
          obs.disconnect();
          onEnter();
        }
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onEnter]);
  return <div ref={ref} className="h-1" />;
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'
      }`}
    >
      {children}
    </div>
  );
}

// ─── Stage number badge ───────────────────────────────────────────────────────
function NumBadge({ n, bg }: { n: number; bg: string }) {
  return (
    <div
      className={`w-11 h-11 rounded-full ${bg} ring-4 ring-white/5 flex items-center justify-center flex-shrink-0 shadow-lg`}
    >
      <span className="text-white font-bold text-lg leading-none">{n}</span>
    </div>
  );
}

// ─── Bullet list ──────────────────────────────────────────────────────────────
function BulletList({
  items,
  iconColor,
  iconBg,
}: {
  items: string[];
  iconColor: string;
  iconBg: string;
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <div
            className={`w-5 h-5 rounded-full ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Highlight card ───────────────────────────────────────────────────────────
function HighlightCard({
  text,
  border,
  bg,
  iconBg,
  iconColor,
}: {
  text: string;
  border: string;
  bg: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-3.5 flex items-start gap-3`}>
      <div
        className={`w-7 h-7 rounded-full ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
      <p className="text-sm text-slate-200 leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Stage 2 visualization ────────────────────────────────────────────────────
function StageVisualization({ block }: { block: ThinkOfBlock }) {
  const v = block.visualization;

  if (v.type === 'decision') {
    return (
      <div className="flex flex-col items-center gap-3 py-3">
        <div className="rounded-xl border border-green-500/30 bg-green-500/15 px-5 py-2.5 text-center max-w-[220px]">
          <span className="text-sm text-white font-semibold">{v.condition ?? v.title}</span>
        </div>
        <div className="w-px h-4 bg-green-500/40" />
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-lg border border-green-500/30 bg-green-600/20 px-4 py-2">
              <span className="text-sm text-green-300 font-bold">{v.trueLabel ?? 'True'}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-lg border border-red-500/30 bg-red-600/20 px-4 py-2">
              <span className="text-sm text-red-300 font-bold">{v.falseLabel ?? 'False'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (v.type === 'repetition') {
    return (
      <div className="space-y-2 py-2">
        {(v.items ?? []).map((step, i, arr) => (
          <div key={i} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600/30 text-green-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5">
                <span className="text-xs text-slate-200">{step}</span>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div className="w-px h-3 bg-green-500/25 ml-3" />
            )}
          </div>
        ))}
        <p className="text-center text-xs text-green-400 pt-1 font-medium">↻ Repeats</p>
      </div>
    );
  }

  const pairs = parseMapping(v.items);
  if (pairs.length > 0 && pairs[0].right) {
    return (
      <div className="space-y-2 py-2">
        {pairs.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 min-w-0 rounded-lg border border-slate-600/40 bg-slate-800/60 px-2.5 py-2 text-center">
              <span className="text-xs text-slate-300 font-medium block truncate">{p.left}</span>
            </div>
            <svg
              className="w-4 h-4 text-green-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="flex-1 min-w-0 rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-2 text-center">
              <span className="text-xs text-green-300 font-medium block truncate">{p.right}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // categories without "→" pairs
  return (
    <div className="space-y-1.5 py-2">
      {(v.items ?? [v.title]).map((item, i) => (
        <div key={i} className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5">
          <span className="text-xs text-slate-200">{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stage connector ──────────────────────────────────────────────────────────
function Connector({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 px-4">
      <div className="w-px h-5 bg-gradient-to-b from-slate-600 to-transparent" />
      <div className="w-8 h-8 rounded-full border border-slate-600/50 bg-slate-900 flex items-center justify-center shadow">
        <svg
          className="w-4 h-4 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <p className="text-sm text-slate-300 text-center max-w-sm leading-relaxed mt-1">{text}</p>
      <div className="w-px h-5 bg-gradient-to-b from-transparent to-slate-600" />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface ThinkOfSectionProps {
  block: ThinkOfBlock;
}

export default function ThinkOfSection({ block }: ThinkOfSectionProps) {
  const [stage, setStage] = useState(1);
  const advance = useCallback((n: number) => setStage(prev => Math.max(prev, n)), []);

  // Image
  const [imgError, setImgError] = useState(false);
  const imgSrc = block.analogy.image ?? imageForTitle(block.analogy.title);
  const showImg = !!imgSrc && !imgError;

  // Derived data — explicit fields take priority, fallbacks fill the gaps
  const bullets1 = useMemo(
    () => block.analogy.bullets ?? toBullets(block.analogy.description),
    [block.analogy.bullets, block.analogy.description]
  );
  const highlight1 = block.analogy.highlightCard ?? block.analogy.description;
  const trans1 =
    block.stage1Transition ??
    "So, how does programming handle this? Let's translate this into code.";
  const bullets2 = useMemo(
    () => block.visualization.bullets ?? deriveVizBullets(block),
    [block]
  );
  const highlight2 =
    block.visualization.highlightCard ?? block.visualization.title;
  const trans2 =
    block.stage2Transition ?? "Great! Now let's see how this looks in Python.";
  const bullets3 = useMemo(
    () => block.code.highlights ?? deriveCodeHighlights(block),
    [block]
  );
  const highlight3 = block.code.highlightCard ?? block.reflection?.answer ?? "";
  const takeaway = block.takeaway ?? block.reflection?.answer ?? "";

  return (
    <div className="space-y-0">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">
          Think Of
        </p>
        <h2 className="text-2xl font-bold text-white leading-tight">
          Let&apos;s understand this with a real-life example
        </h2>
        <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
          We&apos;ll connect a simple everyday idea to programming and then to Python code.
        </p>
      </div>

      {/* ── Stage 1: Real Life ─────────────────────────────────────────── */}
      <div>
        {/* Stage label */}
        <div className="flex items-center gap-3 mb-4">
          <NumBadge n={1} bg="bg-purple-600" />
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
            Real Life
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {showImg && (
              <div className="relative md:w-[42%] h-56 md:h-auto flex-shrink-0 overflow-hidden">
                <img
                  src={imgSrc!}
                  alt={block.analogy.title}
                  className="w-full h-full object-cover object-center"
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--ai-section-bg)]/70 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ai-section-bg)]/70 via-transparent to-transparent md:hidden" />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-white">{block.analogy.title}</h3>
              <BulletList
                items={bullets1}
                iconColor="text-purple-400"
                iconBg="bg-purple-500/20"
              />
              <HighlightCard
                text={highlight1}
                border="border-purple-500/25"
                bg="bg-purple-500/10"
                iconBg="bg-purple-600/30"
                iconColor="text-purple-300"
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── Stage 2: Programming Concept ───────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <NumBadge n={2} bg="bg-green-600" />
          <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
            Programming Concept
          </span>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Visualization panel */}
            <div className="md:w-[45%] p-6 border-b border-slate-700/30 md:border-b-0 md:border-r md:border-slate-700/30 flex flex-col justify-center gap-3">
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                {block.visualization.title}
              </p>
              <StageVisualization block={block} />
            </div>

            {/* Explanation panel */}
            <div className="p-6 flex-1 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-white">In programming</h3>
              <BulletList
                items={bullets2}
                iconColor="text-green-400"
                iconBg="bg-green-500/20"
              />
              <HighlightCard
                text={highlight2}
                border="border-green-500/25"
                bg="bg-green-500/10"
                iconBg="bg-green-600/30"
                iconColor="text-green-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stage 3: Python Code ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <NumBadge n={3} bg="bg-blue-600" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Python Code
          </span>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Code editor panel */}
            <div className="md:w-[50%] flex flex-col border-b border-slate-700/30 md:border-b-0 md:border-r md:border-slate-700/30">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800/70 border-b border-slate-700/30">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-slate-300 font-medium uppercase tracking-wide">
                  {block.code.language}
                </span>
              </div>
              {/* Code */}
              <div className="p-4 bg-[#0d1117] flex-1 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  {block.code.code.split('\n').map((line, i) => (
                    <span key={i} className="flex min-h-[1.5rem]">
                      <span className="select-none text-slate-300 w-5 text-right mr-4 flex-shrink-0 text-xs pt-0.5">
                        {i + 1}
                      </span>
                      <CodeLine line={line} />
                    </span>
                  ))}
                </pre>
              </div>
              {/* Output */}
              {block.code.output && (
                <div className="border-t border-slate-700/30">
                  <div className="px-3.5 py-1.5 bg-slate-800/50 border-b border-slate-700/30">
                    <span className="text-xs text-slate-300 font-medium uppercase tracking-wide">
                      Output
                    </span>
                  </div>
                  <div className="px-4 py-3 bg-[var(--ai-section-bg)]">
                    <pre className="text-sm text-green-400 font-mono">{block.code.output}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Explanation panel */}
            <div className="p-6 flex-1 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-white">In Python</h3>
              <BulletList
                items={bullets3}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/20"
              />
              <HighlightCard
                text={highlight3}
                border="border-blue-500/25"
                bg="bg-blue-500/10"
                iconBg="bg-blue-600/30"
                iconColor="text-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Takeaway ───────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-[var(--ai-section-border)] bg-[var(--ai-section-bg-alt)] p-5 flex items-start gap-4">
        <div className="text-3xl flex-shrink-0 leading-none mt-0.5">🚀</div>
        <div>
          <p className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-widest mb-1.5">
            Takeaway
          </p>
          <p className="text-sm text-[var(--ai-section-text-secondary)] leading-relaxed">{takeaway}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Minimal syntax highlighter ───────────────────────────────────────────────
function CodeLine({ line }: { line: string }) {
  if (line.trim().startsWith('#')) {
    return <span className="text-slate-300 italic">{line}</span>;
  }

  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < line.length) {
    const ch = line[i];

    // String literals
    if (ch === '"' || ch === "'") {
      const q = ch;
      let str = q;
      i++;
      while (i < line.length && line[i] !== q) {
        if (line[i] === '\\') { str += line[i]; i++; }
        str += line[i];
        i++;
      }
      str += q; i++;
      parts.push(<span key={key++} className="text-orange-300">{str}</span>);
      continue;
    }

    // Collect plain text
    let plain = '';
    while (i < line.length && line[i] !== '"' && line[i] !== "'") {
      plain += line[i];
      i++;
    }

    if (!plain) continue;

    // Highlight numbers and Python keywords within plain text
    const tokens = plain.split(/(\b\d+\.?\d*\b|\bTrue\b|\bFalse\b|\bNone\b)/);
    parts.push(
      ...tokens.map((tok) => {
        if (/^\d+\.?\d*$/.test(tok)) {
          return <span key={key++} className="text-emerald-400">{tok}</span>;
        }
        if (tok === 'True' || tok === 'False' || tok === 'None') {
          return <span key={key++} className="text-blue-400">{tok}</span>;
        }
        return <span key={key++} className="text-slate-200">{tok}</span>;
      })
    );
  }

  return <>{parts}</>;
}
