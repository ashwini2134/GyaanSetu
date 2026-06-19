import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronDown, Sparkles, MessageSquare, Lightbulb, Code, AlertTriangle } from "lucide-react";
import type { ProjectTask } from "../../data/projectsData";

const TASK_QUESTIONS: Record<string, { q: string; a: string }[]> = {
  setup: [
    { q: "How do I create the HTML file?", a: "Create a new file called index.html and type the HTML5 boilerplate: <!DOCTYPE html>, <html>, <head> with <title>Calculator</title>, and <body>. Link your CSS in <head> and your JS before </body>." },
    { q: "How do I link CSS and JS files?", a: "Use <link rel='stylesheet' href='styles.css'> inside <head> for CSS, and <script src='script.js'></script> just before the closing </body> tag for JavaScript." },
    { q: "What folder structure should I use?", a: "Keep it simple: a single folder with index.html, styles.css, and script.js. As you grow, you can organize into css/ and js/ subfolders." }
  ],
  ui: [
    { q: "How do I create calculator buttons?", a: "Use HTML <button> elements inside a container div. Give each button a class or data attribute (like data-value='7') so your JavaScript can identify which button was clicked." },
    { q: "How do I layout buttons with CSS Grid?", a: "Set the button container to display: grid with grid-template-columns: repeat(4, 1fr). This creates 4 equal columns. Use gap: 8px or similar for spacing between buttons." },
    { q: "How do I make the display look good?", a: "Use a different background color for the display (dark gray or black), right-align the text, use a larger monospace font, and add some padding. Give it a distinct visual area above the buttons." }
  ],
  operations: [
    { q: "How do I handle click events?", a: "Use document.querySelectorAll('.btn') to select all buttons, then loop through them adding addEventListener('click', handler). Inside the handler, read the button's value from a data attribute or innerText." },
    { q: "Why is my calculation returning NaN?", a: "NaN means 'Not a Number'. This usually happens when you try to do math on string values. Use parseFloat() or Number() to convert display text to numbers before calculating. Check for empty strings too." },
    { q: "How do I chain multiple operations?", a: "Store the first number and operator when an operator button is pressed. Clear the display for the next input. When = is pressed, compute firstNumber operator currentNumber, show the result, and optionally allow chaining." }
  ],
  "clear-reset": [
    { q: "How do I reset only the current input?", a: "Create a variable tracking the current display value. On C press, just set that variable to '0' and update the display. Keep the stored firstNumber and operator unchanged." },
    { q: "How do I implement AC (all clear)?", a: "Create a resetAll() function that sets currentValue, previousValue, operator, and display back to their initial states. Call this on AC button press." }
  ],
  testing: [
    { q: "How do I handle division by zero?", a: "Before performing division, check if the second number is 0. If so, display an error message like 'Cannot divide by zero' instead of trying to compute. Use an if statement to catch this case." },
    { q: "How do I test decimal precision?", a: "JavaScript floating point can produce results like 0.1 + 0.2 = 0.30000000000000004. Use .toFixed(2) or Math.round(result * 100) / 100 to round to reasonable precision." }
  ]
};

const GENERIC_QUESTIONS = [
  { q: "How do I debug my code?", a: "Use console.log() to print values at key points. Open Chrome DevTools (F12) and check the Console tab. Set breakpoints in the Sources tab to step through your code line by line." },
  { q: "How do I test my calculator?", a: "Try simple calculations first (2 + 2 = 4). Then test edge cases: division by zero, chained operations (5 + 3 - 2), decimal numbers, and rapid button presses." }
];

interface AIMentorCardProps {
  task: ProjectTask | null;
}

export default function AIMentorCard({ task }: AIMentorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showGeneric, setShowGeneric] = useState(false);

  const taskQuestions = task ? TASK_QUESTIONS[task.id] || [] : [];
  const questions = showGeneric ? GENERIC_QUESTIONS : taskQuestions;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Bot size={18} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Mentor
              <Sparkles size={14} className="text-purple-400" />
            </h3>
            <p className="text-xs text-slate-400">
              {task ? `Ask about "${task.title}"` : "Ask for help"}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-purple-500/10 pt-4">
              {questions.length === 0 && !showGeneric && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <Lightbulb size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400">No specific questions for this task yet. Try the general questions below.</p>
                </div>
              )}

              {questions.map((item, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-white/5">
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === item.q ? null : item.q)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
                  >
                    <MessageSquare size={14} className="text-purple-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300 flex-1 leading-snug">{item.q}</span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-500 transition-transform duration-200 ${expandedQuestion === item.q ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedQuestion === item.q && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-0">
                          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                            <div className="flex items-start gap-2">
                              <Bot size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {taskQuestions.length > 0 && !showGeneric && (
                <button
                  onClick={() => setShowGeneric(true)}
                  className="w-full text-xs text-slate-400 hover:text-purple-400 transition-colors text-center py-2"
                >
                  Show more general questions
                </button>
              )}

              {showGeneric && taskQuestions.length > 0 && (
                <button
                  onClick={() => setShowGeneric(false)}
                  className="w-full text-xs text-slate-400 hover:text-purple-400 transition-colors text-center py-1"
                >
                  Show task-specific questions
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
