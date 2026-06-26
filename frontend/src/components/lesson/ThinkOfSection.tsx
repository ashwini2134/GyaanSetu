import { useState, useMemo } from 'react';
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

const IMAGE_MAP: Array<[RegExp, string]> = [
  [/recipe|kitchen|cook|baking/i, 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80'],
  [/swiss army|multi.?tool|toolbox|tool/i, 'https://images.unsplash.com/photo-1615127717889-8945dba1f05a?w=800&q=80'],
  [/storage box|container|labeled box|bag/i, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80'],
  [/shopping/i, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'],
  [/receptionist|gatekeeper/i, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80'],
  [/fill.?in.?the.?blank|form|template/i, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80'],
  [/rulebook|rule/i, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80'],
  [/traffic light|signal/i, 'https://images.unsplash.com/photo-1557404763-69708cd8b9ce?w=800&q=80'],
  [/washing|laundry/i, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80'],
  [/phone/i, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80'],
  [/envelope|sealed|letter|mail/i, 'https://images.unsplash.com/photo-1649019489428-70f505daacd6?w=800&q=80'],
  [/book|phone book|library|shelf|catalog/i, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80'],
  [/vending/i, 'https://images.unsplash.com/photo-1618506557292-ec1862b3c506?w=800&q=80'],
  [/chain|string|beads|characters/i, 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80'],
  [/notebook|journal/i, 'https://images.unsplash.com/photo-1517842647576-c639042777db?w=800&q=80'],
  [/dog|puppy|tricks|training/i, 'https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=800&q=80'],
  [/maze|labyrinth/i, 'https://images.unsplash.com/photo-1590278458425-6aa3912a48a5?w=800&q=80'],
  [/gps|map|direction|navigate|route/i, 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80'],
  [/ai|artificial|intelligence|machine learning|fast reader/i, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80'],
  [/detective/i, 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=800&q=80'],
  [/puzzle/i, 'https://images.unsplash.com/photo-1611996575749-79a3a250f5f0?w=800&q=80'],
  [/family tree/i, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f4?w=800&q=80'],
  [/weather forecast|probability/i, 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80'],
  [/bayes|updating belief/i, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'],
  [/branching path|probability flow/i, 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80'],
  [/packing a suitcase|optimization/i, 'https://images.unsplash.com/photo-1561023680-2a8b83ccc4a8?w=800&q=80'],
  [/classroom seating|csp/i, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80'],
  [/delivery route|optimization flow/i, 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80'],
  [/sort laundry|sorting laundry/i, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80'],
  [/reinforcement learning|puppy training/i, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80'],
  [/factory|assembly line|ml pipeline/i, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80'],
  [/team of detectives|neural networks as a team/i, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'],
  [/magnifying glass|cnn/i, 'https://images.unsplash.com/photo-1588616319944-81976676762d?w=800&q=80'],
  [/slicing a pizza|tokenization/i, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'],
  [/word embeddings|map of meanings/i, 'https://images.unsplash.com/photo-1589519160732-57fc6ea83bc8?w=800&q=80'],
  [/well-read librarian|llm/i, 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80'],
  [/ai bias|one-sided story/i, 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80'],
  [/hallucination|over-confident/i, 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80'],
  [/responsible ai|safety checklist/i, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80'],
  [/learning to ride|ai journey|ride a bike/i, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'],
  [/blueprint|project planning/i, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'],
  [/project workflow|workflow as a recipe/i, 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80'],
];

function imageForTitle(title: string): string | null {
  for (const [pattern, url] of IMAGE_MAP) {
    if (pattern.test(title)) return url;
  }
  return null;
}

function AnalogyCard({ block }: { block: ThinkOfBlock }) {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = useMemo(() => imageForTitle(block.analogy.title), [block.analogy.title]);
  const src = block.analogy.image || fallbackImage;
  const showImage = !!src && !imgError;
  return (
    <div className="rounded-lg border border-slate-700/30 bg-slate-800/50 overflow-hidden h-full">
      {showImage ? (
        <div className="relative w-full h-full">
          <img
            src={src!}
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
        <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-700/30 to-slate-800/50">
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
