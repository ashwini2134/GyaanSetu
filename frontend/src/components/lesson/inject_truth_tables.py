import re

file_path = r'c:\Users\priya\OneDrive\Desktop\fraylon 05\june 16\LMS-main\frontend\src\components\lesson\AILearnSection.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new component
new_component = """
// ── Truth Table Explorer (Interactive Light Bulb Widget) ─────────────────────────────
const LightbulbIcon = ({ on }: { on: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" height="32" 
    viewBox="0 0 24 24" 
    fill={on ? "#facc15" : "none"} 
    stroke={on ? "#facc15" : "#64748b"} 
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
    'IMP': { label: 'IMPLICATION (→)', note: 'False only when P is true and Q is false. Why is F → T trivially true? Like a promise: "If it rains (P), I bring an umbrella (Q)". The promise is only broken if it rains and I don\'t bring it!' },
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
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${connective === c ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'bg-slate-950/50 text-slate-500 border border-slate-800/50 hover:bg-slate-800/50 hover:text-slate-300'}`}
          >
            {connectiveInfo[c].label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-8 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm font-bold text-slate-400">Proposition P</div>
          <button 
            onClick={() => setP(!p)}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <LightbulbIcon on={p} />
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${p ? 'bg-violet-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${p ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className={`text-xs font-bold ${p ? 'text-violet-400' : 'text-slate-500'}`}>{p ? 'TRUE' : 'FALSE'}</span>
          </button>
        </div>

        <div className="text-3xl font-black text-slate-600">
          {connective === 'NOT' ? '¬' : connective === 'AND' ? '∧' : connective === 'OR' ? '∨' : connective === 'IMP' ? '→' : '↔'}
        </div>

        <div className={`flex flex-col items-center gap-4 transition-opacity duration-300 ${connective === 'NOT' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <div className="text-sm font-bold text-slate-400">Proposition Q</div>
          <button 
            onClick={() => setQ(!q)}
            disabled={connective === 'NOT'}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <LightbulbIcon on={q} />
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${q ? 'bg-violet-600' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${q ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className={`text-xs font-bold ${q ? 'text-violet-400' : 'text-slate-500'}`}>{q ? 'TRUE' : 'FALSE'}</span>
          </button>
        </div>

        <div className="text-3xl font-black text-slate-600">=</div>

        <div className="flex flex-col items-center gap-4">
          <div className="text-sm font-bold text-white">Result</div>
          <div className="flex flex-col items-center gap-3">
            <LightbulbIcon on={result} />
            <div className={`px-4 py-1.5 rounded-lg border-2 transition-colors duration-300 ${result ? 'border-amber-400/50 bg-amber-400/10 text-amber-400' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">{result ? 'TRUE' : 'FALSE'}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 px-5 py-4 bg-slate-950/50 rounded-lg border border-slate-800/50 flex gap-3">
        <span className="text-violet-400 text-lg mt-0.5 flex-shrink-0">💡</span>
        <p className="text-sm text-slate-400 leading-relaxed">
          {connectiveInfo[connective].note}
        </p>
      </div>
    </div>
  );
}

"""

# Inject component before AILearnSection if it doesn't exist
if "function TruthTableExplorer()" not in content:
    content = content.replace("export default function AILearnSection(", new_component + "export default function AILearnSection(")

# Replace the tables HTML with <TruthTableExplorer />
# The tables start after '<h3 className="text-lg font-bold text-white">Logical Connectives & Truth Tables</h3>'
# And end right before '</div>\n            </div>\n          </div>\n        </div>\n      )}'
# We need a robust extraction since it's quite long.

start_marker = '<h3 className="text-lg font-bold text-white">Logical Connectives & Truth Tables</h3>\n              </div>'
end_marker = '</div>\n            </div>\n          </div>\n        </div>\n      )}'

start_idx = content.find(start_marker)
if start_idx != -1:
    end_idx = content.find(end_marker, start_idx)
    if end_idx != -1:
        # The section to replace is from start_marker + len(start_marker) to end_idx
        before = content[:start_idx + len(start_marker)]
        after = content[end_idx:]
        
        replacement = '\n              <TruthTableExplorer />\n              '
        
        # Only replace if the tables are still there
        if '1. Not (¬)' in content[start_idx:end_idx]:
            content = before + replacement + after
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Successfully replaced static tables with TruthTableExplorer!")
        else:
            print("Already replaced or could not find the 5 tables.")
    else:
        print("Could not find end marker.")
else:
    print("Could not find start marker.")
