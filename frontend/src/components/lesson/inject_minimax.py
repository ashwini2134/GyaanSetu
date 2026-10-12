import re

file_path = r'c:\Users\priya\OneDrive\Desktop\fraylon 05\june 16\LMS-main\frontend\src\components\lesson\AILearnSection.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

minimax_component = """
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
          <p className="text-xs text-slate-400 mb-6">
            You are MAX. It's your turn at the root of the tree.
            Assuming MIN plays optimally, which move guarantees you the highest score?
          </p>
          
          <div className="flex justify-center items-start gap-8 mb-4 relative">
            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleMove('A')}
                disabled={selectedMove !== null}
                className={`px-6 py-3 rounded-xl font-bold border-2 transition-all duration-200 ${selectedMove === 'A' ? 'bg-violet-600 text-white border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : selectedMove === 'B' ? 'bg-slate-800/50 text-slate-500 border-slate-700' : 'bg-slate-800 text-violet-400 border-violet-500/30 hover:bg-slate-700 hover:border-violet-400 hover:scale-105'}`}
              >
                Move A
              </button>
              <div className="h-8 w-0.5 bg-slate-600 my-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-500"></div>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">MIN sees:</div>
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg border-2 ${selectedMove === 'A' && minTurnFinished ? 'border-violet-400 bg-violet-900/50 text-violet-300 font-bold scale-110 shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'border-slate-700 bg-slate-800 text-slate-400'} flex items-center justify-center text-sm transition-all duration-300`}>3</div>
                <div className={`w-10 h-10 rounded-lg border-2 border-slate-700 bg-slate-800 text-slate-400 flex items-center justify-center text-sm opacity-40 transition-all duration-300`}>12</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleMove('B')}
                disabled={selectedMove !== null}
                className={`px-6 py-3 rounded-xl font-bold border-2 transition-all duration-200 ${selectedMove === 'B' ? 'bg-violet-600 text-white border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : selectedMove === 'A' ? 'bg-slate-800/50 text-slate-500 border-slate-700' : 'bg-slate-800 text-violet-400 border-violet-500/30 hover:bg-slate-700 hover:border-violet-400 hover:scale-105'}`}
              >
                Move B
              </button>
              <div className="h-8 w-0.5 bg-slate-600 my-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-500"></div>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">MIN sees:</div>
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg border-2 border-slate-700 bg-slate-800 text-slate-400 flex items-center justify-center text-sm opacity-40 transition-all duration-300`}>8</div>
                <div className={`w-10 h-10 rounded-lg border-2 ${selectedMove === 'B' && minTurnFinished ? 'border-rose-400 bg-rose-900/50 text-rose-300 font-bold scale-110 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-slate-700 bg-slate-800 text-slate-400'} flex items-center justify-center text-sm transition-all duration-300`}>2</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-6 flex flex-col justify-center min-h-[220px]">
          {!selectedMove ? (
            <div className="text-center text-slate-500">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mx-auto mb-4 opacity-50">
                <span className="text-xl">?</span>
              </div>
              <p className="text-sm font-medium text-slate-400">Waiting for your move...</p>
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
                    <span className="text-emerald-400 font-bold text-xl">✓</span>
                  </div>
                  <h4 className="text-emerald-400 font-bold mb-2">Optimal Move!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    You chose <strong>Move A</strong>. MIN looked at options [3, 12] and chose the lowest score: <strong className="text-emerald-300">3</strong>.<br/><br/>
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
                    If you had chosen <strong>Move A</strong>, MIN would have been forced to give you a score of <strong className="text-emerald-300">3</strong>. 
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

"""

if 'function MinimaxExplorer()' not in content:
    content = content.replace('export default function AILearnSection(', minimax_component + 'export default function AILearnSection(')

adversarial_block_old = """      {/* 👉 Adversarial Breakdown 👈 */}
      {isAdversarial && block.adversarialContent && (
        <AdversarialBreakdown content={block.adversarialContent} />
      )}"""
      
# Sometimes the emoji could be different if there's encoding mismatch
# Let's use regex to replace it
import re

pattern = r"(\{\s*/\*\s*.?.?\s*Adversarial Breakdown\s*.?.?\s*\*/\s*\n\s*\{isAdversarial && block\.adversarialContent && \(\s*)(<AdversarialBreakdown content=\{block\.adversarialContent\} />)(\s*\)\})"

def replacer(match):
    return match.group(1) + "<>\n          <AdversarialBreakdown content={block.adversarialContent} />\n          <MinimaxExplorer />\n        </>" + match.group(3)

if '<MinimaxExplorer />' not in content:
    new_content = re.sub(pattern, replacer, content)
    if new_content == content:
        # Fallback if regex fails due to exact emoji characters
        # Just search for the tag
        content = content.replace('<AdversarialBreakdown content={block.adversarialContent} />', '<>\n          <AdversarialBreakdown content={block.adversarialContent} />\n          <MinimaxExplorer />\n        </>')
    else:
        content = new_content

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected MinimaxExplorer successfully!")
