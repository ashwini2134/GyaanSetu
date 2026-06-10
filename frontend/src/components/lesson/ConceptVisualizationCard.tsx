import type { ConceptVisualizationBlock } from '../../types/lesson';
import * as LucideIcons from 'lucide-react';

const ACCENT = {
  blue:   { bg: 'from-blue-600/15 to-blue-900/10', border: 'border-blue-500/25', label: 'text-blue-300', shadow: 'shadow-[0_8px_32px_rgba(59,130,246,0.35)]', gradFrom: 'from-blue-500', gradTo: 'to-blue-700', border2: 'border-blue-400/30' },
  purple: { bg: 'from-purple-600/15 to-purple-900/10', border: 'border-purple-500/25', label: 'text-purple-300', shadow: 'shadow-[0_8px_32px_rgba(139,92,246,0.35)]', gradFrom: 'from-purple-500', gradTo: 'to-purple-700', border2: 'border-purple-400/30' },
  green:  { bg: 'from-green-600/15 to-green-900/10', border: 'border-green-500/25', label: 'text-green-300', shadow: 'shadow-[0_8px_32px_rgba(34,197,94,0.35)]', gradFrom: 'from-green-500', gradTo: 'to-green-700', border2: 'border-green-400/30' },
  orange: { bg: 'from-orange-600/15 to-orange-900/10', border: 'border-orange-500/25', label: 'text-orange-300', shadow: 'shadow-[0_8px_32px_rgba(249,115,22,0.35)]', gradFrom: 'from-orange-500', gradTo: 'to-orange-700', border2: 'border-orange-400/30' },
};

function StorageBoxVisual({ varName, varValue, accent }: { varName?: string; varValue?: string; accent: typeof ACCENT['blue'] }) {
  return (
    <div className="relative">
      <div className={`w-32 h-28 rounded-xl bg-gradient-to-br ${accent.gradFrom} ${accent.gradTo} ${accent.shadow} border ${accent.border2} flex flex-col items-center justify-center relative`}>
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-36 h-3 rounded-t-lg bg-gradient-to-r ${accent.gradFrom} ${accent.gradTo} opacity-80`} />
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-1.5 border border-white/20 mb-2">
          <span className="text-white font-bold text-sm font-mono">{varName ?? 'name'}</span>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-1 border border-white/10">
          <span className="text-blue-100 font-mono text-xs">{varValue ?? '"Lakshanya"'}</span>
        </div>
      </div>
      <p className={`text-[10px] ${accent.label} opacity-70 text-center mt-3 font-mono`}>
        Variable = Container that stores a value
      </p>
    </div>
  );
}

function RecipeBookVisual({ accent }: { accent: typeof ACCENT['blue'] }) {
  return (
    <div className="relative">
      <div className={`w-32 h-28 rounded-xl bg-gradient-to-br ${accent.gradFrom} ${accent.gradTo} ${accent.shadow} border ${accent.border2} flex flex-col items-center justify-center relative`}>
        <div className={`absolute -left-1.5 top-2 w-1.5 h-24 rounded-r-sm bg-gradient-to-b ${accent.gradFrom} ${accent.gradTo} opacity-80`} />
        <div className="space-y-1.5">
          {['Ingredients', 'Instructions', '→ Result'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${i === 2 ? 'bg-green-400' : 'bg-yellow-300'} shadow-sm`} />
              <span className="text-[10px] text-purple-100 font-mono">{step}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 justify-center">
        {['Input', 'Process', 'Output'].map((step, i) => (
          <span key={step} className="flex items-center gap-1">
            <span className={`text-[9px] px-2 py-0.5 rounded ${i === 2 ? 'bg-green-500/10 text-green-300/70' : `${accent.bg} ${accent.label} opacity-70`}`}>{step}</span>
            {i < 2 && <span className={`${accent.label} text-xs opacity-70`}>→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function FlowDiagramVisual({ steps, accent }: { steps?: string[]; accent: typeof ACCENT['blue'] }) {
  const defaultSteps = steps ?? ['Input', '↓', 'Function', '↓', 'Output'];
  return (
    <div className="flex flex-col items-center gap-1.5">
      {defaultSteps.map((step, i) => (
        <span key={i} className={step === '↓' ? `text-xl ${accent.label} opacity-50` : `text-sm font-mono px-4 py-1.5 rounded-lg border ${accent.border} ${accent.bg} ${accent.label}`}>
          {step}
        </span>
      ))}
    </div>
  );
}

export default function ConceptVisualizationCard({ block }: { block: ConceptVisualizationBlock }) {
  const accent = ACCENT[block.accentColor] ?? ACCENT.blue;

  const renderCenter = () => {
    const { centerPanel: cp } = block;
    if (cp.visualType === 'storage_box') {
      return <StorageBoxVisual varName={cp.varName} varValue={cp.varValue} accent={accent} />;
    }
    if (cp.visualType === 'recipe_book') {
      return <RecipeBookVisual accent={accent} />;
    }
    if (cp.visualType === 'flow_diagram') {
      return <FlowDiagramVisual steps={cp.flowSteps} accent={accent} />;
    }
    return <p className="text-sm text-slate-300 text-center">{cp.textContent}</p>;
  };

  const LeftIcon = (LucideIcons as any)[block.leftPanel.icon ?? ''] || LucideIcons.Zap;

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-5 text-center">
        {block.title}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left panel */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/30">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
            {block.leftPanel.label}
          </p>
          <div className="flex flex-col items-center text-center">
            {block.leftPanel.icon && (
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3">
                <LeftIcon className="w-8 h-8 text-amber-400" />
              </div>
            )}
            {block.leftPanel.title && (
              <p className="text-sm font-medium text-slate-200 mb-1">{block.leftPanel.title}</p>
            )}
            {block.leftPanel.description && (
              <p className="text-xs text-slate-400">{block.leftPanel.description}</p>
            )}
          </div>
        </div>

        {/* Center panel */}
        <div className={`p-5 rounded-xl bg-gradient-to-br ${accent.bg} border ${accent.border} flex flex-col items-center justify-center min-h-[220px]`}>
          <p className={`text-[11px] ${accent.label} font-semibold uppercase tracking-wider mb-4`}>
            {block.centerPanel.label}
          </p>
          {renderCenter()}
        </div>

        {/* Right panel */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/30">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
            {block.rightPanel.label}
          </p>
          {block.rightPanel.code && (
            <>
              <div className="rounded-xl bg-[#0d1117] border border-slate-700/40 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 border-b border-slate-700/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-[10px] text-slate-500 font-medium uppercase">
                    {block.rightPanel.language ?? 'python'}
                  </span>
                </div>
                <pre className="p-4 text-sm leading-relaxed font-mono">
                  <code className="text-slate-200">{block.rightPanel.code}</code>
                </pre>
              </div>
              {block.rightPanel.output !== undefined && (
                <div className="mt-2 rounded-xl bg-slate-900/80 border border-slate-700/30 overflow-hidden">
                  <div className="px-3 py-1 bg-slate-800/40 border-b border-slate-700/30">
                    <span className="text-[10px] text-slate-500 font-medium uppercase">Output</span>
                  </div>
                  <pre className="p-3 text-sm text-green-400 font-mono">{block.rightPanel.output}</pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
