import { CheckCircle2, XCircle, Bot, Sparkles, ChevronDown, MessageSquare, Lightbulb, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjectTask, ValidationRule } from "../../data/projectsData";

interface RequirementsPanelProps {
  task: ProjectTask | null;
  validationResults: { ruleId: string; passed: boolean }[];
  taskStatus: string;
}

const TASK_QUESTIONS: Record<string, { q: string; a: string }[]> = {
  setup: [
    { q: "What goes in the HTML head?", a: "The <head> contains meta tags (charset, viewport), the <title>, and linked CSS files via <link>." },
    { q: "Where does the script tag go?", a: "Place <script src='script.js'></script> just before the closing </body> tag for optimal loading." },
  ],
  display: [
    { q: "How do I create the display?", a: "Use a <div> element with an id like 'display' or class 'display'. Set its initial text to '0'." },
    { q: "How do I right-align the display text?", a: "Use CSS: #display { text-align: right; } or .display { text-align: right; }" },
  ],
  "number-buttons": [
    { q: "How do I create number buttons?", a: "Use <button class='btn-number' data-value='7'>7</button> for each digit. Add data-value attribute for easy JS access." },
    { q: "How do I layout buttons in a grid?", a: "Use display: grid on the container and grid-template-columns: repeat(4, 1fr) for 4 equal columns." },
  ],
  "operator-buttons": [
    { q: "How do I style operator buttons differently?", a: "Give them a distinct class (btn-operator) and apply a different background color like red or orange." },
    { q: "How do I make the equal button stand out?", a: "Use a unique class (btn-equal) with a different color, or make it span multiple columns." },
  ],
  logic: [
    { q: "How do I handle button clicks?", a: "Use document.querySelectorAll() to select buttons, then addEventListener('click', handler) to each." },
    { q: "Why is my calculator returning NaN?", a: "Use parseFloat() to convert display text to numbers before doing math. Check for empty strings too." },
  ],
  clear: [
    { q: "How do I reset the calculator?", a: "Create a function that sets currentValue, previousValue, and operation back to initial values, then update the display to '0'." },
  ],
  "edge-cases": [
    { q: "How do I handle division by zero?", a: "Check if the divisor is 0 before dividing. If so, display an error message like 'Error' instead of computing." },
    { q: "How do I prevent multiple decimals?", a: "Use if (number === '.' && currentValue.includes('.')) return; to ignore extra decimal points." },
  ],
  "final-testing": [
    { q: "How do I test my calculator?", a: "Try simple calculations (2+2=4), then edge cases like division by zero, decimal math, and chained operations." },
  ],
};

export default function RequirementsPanel({ task, validationResults: results, taskStatus }: RequirementsPanelProps) {
  const [mentorOpen, setMentorOpen] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const questions = task ? TASK_QUESTIONS[task.id] || [] : [];
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Requirements</h3>

      {/* Requirements checklist */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 space-y-2">
          {results.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">
              Click Run Project to validate requirements
            </p>
          )}
          {results.map((r) => (
            <div
              key={r.ruleId}
              className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-all ${
                r.passed ? "text-green-300" : "text-slate-400"
              }`}
            >
              {r.passed ? (
                <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
              )}
              <span className={r.passed ? "" : "text-slate-500"}>{r.label}</span>
            </div>
          ))}
        </div>
        {results.length > 0 && (
          <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {passedCount}/{totalCount} passed
            </span>
            {passedCount === totalCount && totalCount > 0 && (
              <span className="text-green-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} />
                All requirements met
              </span>
            )}
          </div>
        )}
      </div>

      {/* AI Mentor */}
      <div className="rounded-xl bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-slate-900/80 border border-purple-500/20 overflow-hidden">
        <button
          onClick={() => setMentorOpen(!mentorOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Bot size={16} className="text-purple-400" />
            <span className="text-xs font-bold text-white">AI Mentor</span>
            <Sparkles size={12} className="text-purple-400" />
          </div>
          <motion.div animate={{ rotate: mentorOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-slate-500" />
          </motion.div>
        </button>
        <AnimatePresence>
          {mentorOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2 border-t border-purple-500/10 pt-3">
                {questions.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-2">No questions for this task.</p>
                )}
                {questions.map((item, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-white/5">
                    <button
                      onClick={() => setExpandedQ(expandedQ === item.q ? null : item.q)}
                      className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <MessageSquare size={12} className="text-purple-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300 leading-snug">{item.q}</span>
                      <ChevronDown size={12} className={`text-slate-600 ml-auto transition-transform ${expandedQ === item.q ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {expandedQ === item.q && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-2.5 pb-2.5">
                            <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10 flex items-start gap-2">
                              <Bot size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task status */}
      {taskStatus === "COMPLETED" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
          <span className="text-xs text-green-300 font-semibold">Task completed automatically</span>
        </div>
      )}
    </div>
  );
}
