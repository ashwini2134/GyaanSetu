import { useState } from 'react';
import type { ThinkOfBlock } from '../../types/lesson';

const BLUE = {
  border: 'border-blue-500/25',
  label: 'text-blue-400',
  bg: 'from-blue-600/15 to-blue-900/10',
  gradFrom: 'from-blue-500',
  gradTo: 'to-blue-700',
};

function FlowVisual({ items }: { items?: string[] }) {
  const seq = (items ?? ['Instructions', 'Sequence', 'Result']).slice(0, 3);
  return (
    <div className="flex flex-col items-center gap-0.5">
      {seq.map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className={`rounded border ${BLUE.border} ${BLUE.bg} px-3 py-1 min-w-[90px] text-center`}>
            <span className="text-sm text-white font-mono">{item}</span>
          </div>
          {i < seq.length - 1 && (
            <svg width="16" height="14" viewBox="0 0 24 24" className="text-slate-500 my-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function DecisionVisual({ condition, trueLabel, falseLabel }: { condition?: string; trueLabel?: string; falseLabel?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`rounded border ${BLUE.border} ${BLUE.bg} px-3 py-1.5 min-w-[110px] text-center`}>
        <span className="text-sm text-white font-mono font-semibold">{condition ?? 'Condition'}</span>
      </div>
      <svg width="16" height="14" viewBox="0 0 24 24" className="text-slate-500" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
      </svg>
      <div className="flex gap-3">
        <div className="rounded border border-green-500/30 bg-green-500/10 px-3 py-1 text-center">
          <span className="text-sm text-green-400 font-mono font-semibold">{trueLabel ?? 'True'}</span>
        </div>
        <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-1 text-center">
          <span className="text-sm text-red-400 font-mono font-semibold">{falseLabel ?? 'False'}</span>
        </div>
      </div>
    </div>
  );
}

function RepetitionVisual({ items }: { items?: string[] }) {
  const steps = (items ?? ['Start', 'Check', 'Repeat']).slice(0, 4);
  return (
    <div className="flex flex-col items-center gap-0.5">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-400 font-mono font-bold w-4 text-right">{i + 1}.</span>
            <div className={`rounded border ${BLUE.border} ${BLUE.bg} px-3 py-1 min-w-[80px] text-center`}>
              <span className="text-sm text-white font-mono">{step}</span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <svg width="16" height="14" viewBox="0 0 24 24" className="text-slate-500 my-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          )}
        </div>
      ))}
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-sm text-blue-300 font-mono">↻ Repeat</span>
      </div>
    </div>
  );
}

function CategoriesVisual({ centerLabel, items }: { centerLabel?: string; items?: string[] }) {
  const center = centerLabel ?? 'Python';
  const branches = (items ?? ['Web', 'Data', 'AI', 'Auto']).slice(0, 5);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`rounded border ${BLUE.border} bg-gradient-to-r ${BLUE.gradFrom} ${BLUE.gradTo} px-3 py-1 shadow-sm text-center`}>
        <span className="text-sm text-white font-bold font-mono">{center}</span>
      </div>
      <div className="flex flex-col items-start gap-0.5 mt-0.5">
        {branches.map((branch, i) => {
          const isLast = i === branches.length - 1;
          const prefix = isLast ? '└── ' : '├── ';
          return (
            <div key={i} className="flex items-center gap-1">
              <span className="text-xs text-slate-500 font-mono">{prefix}</span>
              <div className="rounded border border-slate-600/30 bg-slate-800/40 px-2.5 py-0.5">
                <span className="text-sm text-slate-200 font-mono">{branch}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderVisualization(block: ThinkOfBlock) {
  const v = block.visualization;
  switch (v.type) {
    case 'flow':
      return <FlowVisual items={v.items} />;
    case 'decision':
      return <DecisionVisual condition={v.condition} trueLabel={v.trueLabel} falseLabel={v.falseLabel} />;
    case 'repetition':
      return <RepetitionVisual items={v.items} />;
    case 'categories':
      return <CategoriesVisual centerLabel={v.centerLabel} items={v.items} />;
    default:
      return <p className="text-sm text-slate-300 text-center">{v.title}</p>;
  }
}

const EMOJI_MAP: Array<[RegExp, string]> = [
  [/recipe|kitchen|cook|baking/i, '\ud83e\uddd1\u200d\ud83c\udf73'],
  [/swiss army|multi.?tool|toolbox|tool/i, '\ud83e\uddf0'],
  [/storage box|container|labeled box|bag/i, '\ud83d\udce6'],
  [/shopping/i, '\ud83d\uded2'],
  [/receptionist|gatekeeper/i, '\ud83d\udc81'],
  [/fill.?in.?the.?blank|form|template/i, '\ud83d\udcdd'],
  [/rulebook|rule/i, '\ud83d\udcdc'],
  [/traffic light|signal/i, '\ud83d\udea6'],
  [/washing|machine cycle|laundry/i, '\ud83e\udd7a'],
  [/phone/i, '\ud83d\udcf1'],
  [/envelope|sealed|letter|mail/i, '\u2709\ufe0f'],
  [/book|phone book|library|shelf|catalog/i, '\ud83d\udcda'],
  [/vending/i, '\ud83e\udd16'],
  [/chain|string|beads/i, '\u26d3\ufe0f'],
  [/notebook|journal/i, '\ud83d\udcd3'],
  [/dog|puppy|tricks|training/i, '\ud83d\udc15'],
  [/maze|labyrinth|navigate/i, '\ud83c\udf00'],
  [/gps|map|direction|navigate|route/i, '\ud83d\uddfa\ufe0f'],
  [/ai|artificial|intelligence|machine learning|fast reader/i, '\ud83e\udd16'],
  [/real life|analogy/i, '\ud83d\udca1'],
];

function emojiForTitle(title: string): string {
  for (const [pattern, emoji] of EMOJI_MAP) {
    if (pattern.test(title)) return emoji;
  }
  return '\ud83d\udca1';
}

function AnalogyCard({ block }: { block: ThinkOfBlock }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!block.analogy.image && !imgError;
  return (
    <div className="rounded-lg border border-slate-700/30 bg-slate-800/50 overflow-hidden h-full">
      {showImage ? (
        <div className="relative w-full h-full">
          <img
            src={block.analogy.image!}
            alt={block.analogy.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/5 via-slate-900/30 to-slate-900/85" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="text-sm font-bold text-white leading-tight">{block.analogy.title}</p>
            <p className="text-xs text-slate-300 mt-0.5 font-light leading-snug">{block.analogy.description}</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-4xl">{emojiForTitle(block.analogy.title)}</span>
          <p className="text-sm font-bold text-white leading-snug">{block.analogy.title}</p>
          <p className="text-xs text-slate-300 mt-0.5 font-light">{block.analogy.description}</p>
        </div>
      )}
    </div>
  );
}

interface ThinkOfSectionProps {
  block: ThinkOfBlock;
}

export default function ThinkOfSection({ block }: ThinkOfSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className={`p-4 bg-gradient-to-r ${BLUE.gradFrom} ${BLUE.gradTo} border-b border-slate-700/30`}>
        <p className="text-sm text-white font-bold uppercase tracking-wider text-center">
          Think Of {block.analogy.title}
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="flex flex-col">
          <p className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Real-Life Analogy</p>
          <AnalogyCard block={block} />
        </div>

        <div className="flex flex-col">
          <p className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Programming Concept</p>
          <div className={`flex-1 rounded-lg bg-gradient-to-br ${BLUE.bg} border ${BLUE.border} flex flex-col items-center justify-center p-5 overflow-hidden text-center min-h-[180px]`}>
            <p className={`text-sm ${BLUE.label} font-bold mb-3 text-center`}>{block.visualization.title}</p>
            {renderVisualization(block)}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Code Example</p>
          <div className="flex-1 rounded-lg bg-[#0d1117] border border-slate-700/40 flex flex-col overflow-hidden min-h-[180px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 border-b border-slate-700/30">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[11px] text-slate-500 font-medium uppercase">{block.code.language}</span>
            </div>
            <div className="p-4 flex-1 overflow-x-auto">
              <pre className="text-sm leading-relaxed font-mono">
                <code className="text-slate-200">{block.code.code}</code>
              </pre>
            </div>
            {block.code.output && (
              <div className="border-t border-slate-700/30 bg-slate-900/80 flex-shrink-0">
                <div className="px-4 py-1 bg-slate-800/40 border-b border-slate-700/30">
                  <span className="text-[11px] text-slate-500 font-medium uppercase">Output</span>
                </div>
                <div className="px-4 py-3">
                  <pre className="text-sm text-green-400 font-mono">{block.code.output}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
