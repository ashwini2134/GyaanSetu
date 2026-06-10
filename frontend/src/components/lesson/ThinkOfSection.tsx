import { useState } from 'react';
import type { ThinkOfBlock } from '../../types/lesson';

const BLUE = {
  border: 'border-blue-500/25',
  label: 'text-blue-400',
  bg: 'from-blue-600/15 to-blue-900/10',
  gradFrom: 'from-blue-500',
  gradTo: 'to-blue-700',
};

function StorageBoxVisual({ varName, varValue }: { varName?: string; varValue?: string }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="100" viewBox="0 0 140 100" className="overflow-hidden">
        <rect x="12" y="26" width="116" height="62" rx="5" fill="rgba(30,41,59,0.6)" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" />
        <rect x="12" y="14" width="116" height="16" rx="4" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" />
        <text x="70" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="monospace">{varName ?? 'name'}</text>
        <rect x="42" y="52" width="56" height="24" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <text x="70" y="68" textAnchor="middle" fill="#93c5fd" fontSize="15" fontFamily="monospace">{varValue ?? '"value"'}</text>
      </svg>
    </div>
  );
}

function SequenceVisual({ items }: { items?: string[] }) {
  const seq = (items ?? ['Step 1', 'Step 2', 'Step 3']).slice(0, 3);
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {seq.map((item, i) => (
        <div key={i} className="flex items-center">
          <div className={`rounded border ${BLUE.border} ${BLUE.bg} px-3 py-1.5`}>
            <span className="text-sm text-white font-mono font-medium">{item}</span>
          </div>
          {i < seq.length - 1 && (
            <svg className="w-4 h-4 mx-1 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function FunctionMachineVisual({ inputLabel, processLabel, outputLabel }: { inputLabel?: string; processLabel?: string; outputLabel?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="rounded border border-slate-600/40 bg-slate-800/60 px-3 py-1.5 min-w-[100px] text-center">
        <span className="text-sm text-slate-400 font-mono">{inputLabel ?? 'Input'}</span>
      </div>
      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
      </svg>
      <div className={`rounded border ${BLUE.border} bg-gradient-to-r ${BLUE.gradFrom} ${BLUE.gradTo} px-4 py-2 shadow min-w-[100px] text-center`}>
        <span className="text-sm text-white font-bold font-mono">{processLabel ?? 'Process'}</span>
      </div>
      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
      </svg>
      <div className="rounded border border-slate-600/40 bg-slate-700/40 px-3 py-1.5 min-w-[100px] text-center">
        <span className="text-sm text-green-400 font-mono">{outputLabel ?? 'Output'}</span>
      </div>
    </div>
  );
}

function LoopVisual({ steps, label }: { steps?: string[]; label?: string }) {
  const items = (steps ?? ['Start', 'Check', 'Repeat']).slice(0, 4);
  return (
    <div className="flex flex-col items-center gap-1">
      {items.map((step, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className={`rounded border ${BLUE.border} ${BLUE.bg} px-3 py-1.5 min-w-[90px] text-center`}>
            <span className="text-sm text-white font-mono font-semibold">{step}</span>
          </div>
          {i < items.length - 1 && (
            <svg className="w-3 h-3 my-0.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          )}
        </div>
      ))}
      {label && <p className="text-sm text-blue-300/70 text-center mt-0.5 font-mono">↻ {label}</p>}
    </div>
  );
}

function KeyValueVisual({ pairs }: { pairs?: Array<{ key: string; value: string }> }) {
  const data = (pairs ?? [{ key: 'name', value: 'Alice' }, { key: 'age', value: '20' }]).slice(0, 3);
  return (
    <div className="flex flex-col items-center gap-1.5">
      {data.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-center min-w-[60px]">
            <span className="text-sm text-amber-300 font-mono font-bold">{pair.key}</span>
          </div>
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="rounded border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-center min-w-[60px]">
            <span className="text-sm text-blue-300 font-mono">{pair.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionBranchVisual({ condition, trueLabel, falseLabel }: { condition?: string; trueLabel?: string; falseLabel?: string }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="110" viewBox="0 0 140 110" className="overflow-hidden">
        <polygon points="70,10 130,55 70,100 10,55" fill={BLUE.bg.replace('/15', '/25')} stroke={BLUE.border} strokeWidth="1.5" />
        <text x="70" y="59" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="monospace">
          {condition ? (condition.length > 8 ? condition.slice(0, 8) + '..' : condition) : 'if?'}
        </text>
        <line x1="130" y1="55" x2="152" y2="36" stroke="#22c55e" strokeWidth="1.5" />
        <line x1="130" y1="55" x2="152" y2="74" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="152" y="28" width="32" height="16" rx="3" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" />
        <text x="168" y="39" textAnchor="middle" fill="#86efac" fontSize="11" fontFamily="monospace" fontWeight="bold">{trueLabel ?? 'True'}</text>
        <rect x="152" y="66" width="32" height="16" rx="3" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.25)" strokeWidth="1" />
        <text x="168" y="77" textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="monospace" fontWeight="bold">{falseLabel ?? 'False'}</text>
      </svg>
    </div>
  );
}

function BlueprintObjectVisual({ className, properties }: { className?: string; properties?: Array<{ name: string; type: string }> }) {
  const cls = className ?? 'Car';
  const props = (properties ?? [{ name: 'color', type: 'str' }, { name: 'speed', type: 'int' }]).slice(0, 3);
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="rounded-lg border border-slate-600/40 bg-slate-800/60 p-2.5 min-w-[80px]">
        <div className="text-sm text-blue-300 font-bold uppercase tracking-wider text-center mb-0.5">{cls}</div>
        <div className="border-t border-slate-600/30 pt-0.5 space-y-0.5">
          {props.map((p, i) => (
            <div key={i} className="text-sm text-slate-400 font-mono flex justify-between gap-2">
              <span>+{p.name}</span>
              <span className="text-slate-500">:{p.type}</span>
            </div>
          ))}
        </div>
      </div>
      <svg className="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <div className={`rounded-lg border-2 ${BLUE.border} bg-gradient-to-br ${BLUE.gradFrom} ${BLUE.gradTo} w-10 h-10 flex items-center justify-center shadow flex-shrink-0`}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>
  );
}

function StringBeadsVisual({ text }: { text?: string }) {
  const chars = text ? text.split('') : ['H', 'e', 'l', 'l', 'o'];
  const beadSpacing = 22;
  const vw = Math.min(chars.length * beadSpacing + 20, 160);
  return (
    <div className="flex flex-col items-center">
      <svg width={vw} height="48" viewBox={`0 0 ${vw} 48`} className="overflow-hidden max-w-full">
        <line x1="10" y1="24" x2={vw - 10} y2="24" stroke="rgba(148,163,184,0.2)" strokeWidth="1.5" />
        {chars.slice(0, 7).map((ch, i) => {
          const cx = 10 + i * beadSpacing + beadSpacing / 2;
          return (
            <g key={i}>
              <circle cx={cx} cy="24" r="9" fill={BLUE.bg.replace('/15', '/35')} stroke={BLUE.border} strokeWidth="1.5" />
              <text x={cx} y="29" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold">{ch}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HubSpokeVisual({ centerLabel, branches }: { centerLabel?: string; branches?: string[] }) {
  const center = centerLabel ?? 'Python';
  const items = (branches ?? ['Web', 'Data', 'AI', 'Auto']).slice(0, 5);
  const n = items.length;
  const cx = 100, cy = 100, spokeLen = 42;
  return (
    <div className="flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-hidden">
        <circle cx={cx} cy={cy} r="22" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.5)" strokeWidth="2" />
        <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="15" fontWeight="bold" fontFamily="monospace">{center}</text>
        {items.map((label, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const x2 = cx + spokeLen * Math.cos(angle);
          const y2 = cy + spokeLen * Math.sin(angle);
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(59,130,246,0.1)" strokeWidth="1" />
              <rect x={x2 - 36} y={y2 - 10} width="72" height="20" rx="4" fill="rgba(30,41,59,0.7)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
              <text x={x2} y={y2 + 4} textAnchor="middle" dominantBaseline="middle" fill="#93c5fd" fontSize="11" fontFamily="monospace" fontWeight="bold">{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LightSwitchVisual({ boolValue }: { boolValue?: boolean }) {
  const on = boolValue ?? true;
  return (
    <div className="flex flex-col items-center">
      <svg width="44" height="76" viewBox="0 0 44 76" className="overflow-hidden">
        <rect x="5" y="3" width="34" height="70" rx="17" fill="rgba(30,41,59,0.7)" stroke="rgba(71,85,105,0.4)" strokeWidth="1.5" />
        <circle cx="22" cy={on ? "24" : "52"} r="10" fill={on ? "rgba(34,197,94,0.5)" : "rgba(100,116,139,0.35)"}
                stroke={on ? "rgba(34,197,94,0.7)" : "rgba(100,116,139,0.5)"} strokeWidth="1.5" />
        <text x="22" y={on ? "28" : "56"} textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">
          {on ? 'ON' : 'OFF'}
        </text>
      </svg>
    </div>
  );
}

function renderVisualization(block: ThinkOfBlock) {
  const v = block.visualization;
  switch (v.type) {
    case 'storage_box':
      return <StorageBoxVisual varName={v.varName} varValue={v.varValue} />;
    case 'sequence':
      return <SequenceVisual items={v.items} />;
    case 'function_machine':
      return <FunctionMachineVisual inputLabel={v.inputLabel} processLabel={v.processLabel} outputLabel={v.outputLabel} />;
    case 'loop_cycle':
      return <LoopVisual steps={v.loopSteps} label={v.loopLabel} />;
    case 'key_value':
      return <KeyValueVisual pairs={v.pairs} />;
    case 'decision_branch':
      return <DecisionBranchVisual condition={v.condition} trueLabel={v.trueLabel} falseLabel={v.falseLabel} />;
    case 'blueprint_object':
      return <BlueprintObjectVisual className={v.className} properties={v.properties} />;
    case 'string_beads':
      return <StringBeadsVisual text={v.text} />;
    case 'hub_spoke':
      return <HubSpokeVisual centerLabel={v.centerLabel} branches={v.branches} />;
    case 'light_switch':
      return <LightSwitchVisual boolValue={v.boolValue} />;
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
    <div className="rounded-lg border border-slate-700/30 bg-slate-800/50 overflow-hidden h-full flex flex-col">
      {showImage ? (
        <>
          <div className="relative h-28 flex-shrink-0 overflow-hidden">
            <img
              src={block.analogy.image!}
              alt={block.analogy.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/50 to-slate-900/80" />
          </div>
          <div className="flex-1 p-4 flex flex-col justify-center">
            <p className="text-sm font-bold text-white leading-snug">{block.analogy.title}</p>
            <p className="text-xs text-slate-300 mt-0.5 font-light">{block.analogy.description}</p>
          </div>
        </>
      ) : (
        <div className="p-4 flex flex-col items-center justify-center gap-2 text-center flex-1">
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
