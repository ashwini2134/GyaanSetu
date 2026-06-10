import type { ConceptVisualizationBlock } from '../../types/lesson';

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

const MISSING_VISUAL = { title: '', type: 'text' as const };
const MISSING_CODE = { language: 'python', code: '', output: undefined };

export default function ConceptVisualizationCard({ block }: { block: ConceptVisualizationBlock }) {
  const accent = ACCENT[block?.accentColor as keyof typeof ACCENT] ?? ACCENT.blue;

  // Normalize data: support both cs50ai schema (analogy/visual/code) and python/cs50p schema (leftPanel/centerPanel/rightPanel)
  const panel = block as unknown as Record<string, unknown>;
  const analogyData = (block.analogy ?? panel.leftPanel) as Record<string, unknown> | undefined;
  const visualData = (block.visual ?? panel.centerPanel ?? MISSING_VISUAL) as Record<string, unknown>;
  const codeData = (block.code ?? panel.rightPanel ?? MISSING_CODE) as Record<string, unknown>;

  const analogyImage = analogyData?.image as string | undefined;
  const analogyTitle = (analogyData?.title ?? '') as string;
  const analogyDescription = (analogyData?.description ?? '') as string;

  const visualTitle = (visualData?.title ?? visualData?.label ?? '') as string;
  const visualType = (visualData?.type ?? visualData?.visualType ?? 'text') as string;
  const flowSteps = (visualData?.flowSteps ?? undefined) as string[] | undefined;

  const codeLanguage = (codeData?.language ?? 'python') as string;
  const codeText = (codeData?.code ?? '') as string;
  const codeOutput = (codeData?.output ?? undefined) as string | undefined;

  const panelVarName = visualData?.varName as string | undefined;
  const panelVarValue = visualData?.varValue as string | undefined;
  const panelEmoji = (panel as Record<string, unknown>).leftPanel
    ? ((panel as Record<string, unknown>).leftPanel as Record<string, unknown>)?.emoji as string | undefined
    : undefined;

  const renderCenter = () => {
    if (visualType === 'storage_box') {
      return <StorageBoxVisual varName={panelVarName} varValue={panelVarValue} accent={accent} />;
    }
    if (visualType === 'recipe_book') {
      return <RecipeBookVisual accent={accent} />;
    }
    if (visualType === 'flow_diagram') {
      return <FlowDiagramVisual steps={flowSteps} accent={accent} />;
    }
    return <p className="text-sm text-slate-300 text-center">{visualTitle}</p>;
  };

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className={`p-4 bg-gradient-to-r ${accent.gradFrom} ${accent.gradTo} border-b border-slate-700/30`}>
        <p className="text-xs text-white font-bold uppercase tracking-wider text-center">
          {block?.title ?? ''}
        </p>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: Analogy */}
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Real-Life Analogy
          </p>
          <div className="rounded-xl overflow-hidden border border-slate-700/30 aspect-video relative">
            {analogyImage ? (
              <>
                <img src={analogyImage} alt={analogyTitle} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center">
                <div className="text-center p-4">
                  <span className="text-3xl block mb-2">{panelEmoji ?? '💡'}</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-bold text-white mb-1">{analogyTitle || 'Concept'}</p>
              <p className="text-xs text-slate-300">{analogyDescription}</p>
            </div>
          </div>
        </div>

        {/* Panel 2: Visual */}
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Programming Concept
          </p>
          <div className={`flex-1 rounded-xl bg-gradient-to-br ${accent.bg} border ${accent.border} flex flex-col items-center justify-center p-4`}>
            <p className={`text-xs ${accent.label} font-bold mb-4 text-center`}>
              {visualTitle}
            </p>
            {renderCenter()}
          </div>
        </div>

        {/* Panel 3: Code */}
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Code Example
          </p>
          <div className="flex-1 rounded-xl bg-[#0d1117] border border-slate-700/40 flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/40 border-b border-slate-700/30">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[10px] text-slate-500 font-medium uppercase">
                {codeLanguage}
              </span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <pre className="text-sm leading-relaxed font-mono">
                <code className="text-slate-200">{codeText}</code>
              </pre>
            </div>
            {codeOutput && (
              <div className="mt-auto border-t border-slate-700/30 bg-slate-900/80">
                <div className="px-3 py-1 bg-slate-800/40 border-b border-slate-700/30">
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Output</span>
                </div>
                <div className="p-3">
                  <pre className="text-xs text-green-400 font-mono">{codeOutput}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
