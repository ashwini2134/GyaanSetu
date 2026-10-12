import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Dumbbell, Target, Hammer, FolderGit2, Award, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

const STAGES = [
  { icon: BookOpen, title: "Learn", desc: "A concept explained in plain language, not jargon.", color: "#1B2B44" },
  { icon: Sparkles, title: "Interact", desc: "A simulation you drive yourself — drag it, break it, watch it respond.", color: "#134457" },
  { icon: Dumbbell, title: "Practice", desc: "Try It Yourself, live, in a real code editor.", color: "#0F5C69" },
  { icon: Target, title: "Solve", desc: "A graded problem with a right answer — not a multiple-choice quiz.", color: "#0C757C" },
  { icon: Hammer, title: "Build", desc: "A real project or milestone you can point to later.", color: "#088E8E" },
  { icon: FolderGit2, title: "Reflect", desc: "The finished work is saved — nothing you build gets thrown away.", color: "#04A6A1" },
  { icon: Award, title: "Certify", desc: "A certificate tied to the actual work behind it, not attendance.", color: "#00BFB3" },
];

export default function TeachingMethodologySection() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-[var(--bg-main)] via-[#EFFAF9] to-[var(--bg-main)] border-t border-[var(--border-primary)]/60 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Reveal delay={0.1}>
            <h2 className="text-xs uppercase tracking-widest text-[var(--accent-indigo)] font-bold font-mono">
              Teaching Methodology
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mt-3">
              Every lecture runs the same loop.
            </h3>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Seven steps, every time. Hover each one — it's graded by AI at every stage, not left to chance.
            </p>
          </Reveal>
        </div>

        {/* Stepper */}
        <div className="overflow-x-auto pb-6 -mx-6 px-6">
          <div className="relative grid grid-cols-7 gap-2 min-w-[720px] md:min-w-0">
            {/* Continuous connecting line, aligned to the fixed icon row height — not per-item calc, so it never drifts */}
            <div className="absolute top-6 left-[calc(100%/14)] right-[calc(100%/14)] h-[2px] bg-gradient-to-r from-[#1B2B44] via-[#0C757C] to-[#00BFB3] opacity-25" />

            {/* A pulse of light travels the loop, on repeat — the loop shown in motion, not just described */}
            <div className="absolute top-6 left-[calc(100%/14)] right-[calc(100%/14)] h-[2px] pointer-events-none">
              <motion.span
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#00BFB3]"
                style={{ boxShadow: "0 0 14px 3px rgba(0,191,179,0.65)" }}
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
              />
            </div>

            {STAGES.map((stage, i) => {
              const isActive = active === i;
              return (
                <motion.button
                  key={stage.title}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative flex flex-col items-center text-center bg-transparent border-0 p-0 cursor-pointer focus:outline-none"
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10 bg-[var(--bg-main)] border-2 shrink-0"
                    style={{
                      borderColor: isActive ? stage.color : `${stage.color}40`,
                      boxShadow: isActive ? `0 0 0 6px ${stage.color}1A` : "none",
                    }}
                  >
                    <stage.icon className="w-5 h-5 transition-colors" style={{ color: stage.color }} />
                  </motion.div>
                  <div className="mt-3 text-sm font-bold text-[var(--text-primary)]">{stage.title}</div>
                  <div
                    className={`mt-1.5 text-[11px] leading-snug px-1 transition-colors duration-200 ${isActive ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}
                  >
                    {stage.desc}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.5}>
          <p className="text-center text-xs text-[var(--text-muted)] mt-6 max-w-lg mx-auto">
            This loop is already live — it's how the Truth Table Explorer, the Modus Ponens flashcards, and the K-Means widget in the AI course were built.
          </p>
        </Reveal>

        <Reveal delay={0.55}>
          <div className="text-center mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[var(--accent-indigo)] hover:opacity-90 text-[#fff] rounded-lg font-bold text-sm transition-all shadow-lg shadow-[var(--accent-indigo)]/20"
            >
              See What a Lecture Looks Like <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
