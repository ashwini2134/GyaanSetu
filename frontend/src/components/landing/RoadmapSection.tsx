import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";

const PATHS = {
  python: {
    label: "Python",
    theme: "indigo",
    lectures: [
      "What is Python?", "Variables & Data Types", "Input & Output", "Operators",
      "Conditional Statements", "For Loops", "While Loops", "Lists",
      "Tuples & Sets", "Dictionaries", "Functions", "String Operations",
      "File Handling", "Mini Project",
    ],
  },
  ai: {
    label: "Artificial Intelligence",
    theme: "violet",
    lectures: [
      "Introduction to AI", "Search Algorithms", "Knowledge & Logic", "Probability & Uncertainty",
      "Optimization", "Machine Learning", "Neural Networks", "Natural Language Processing",
      "AI Ethics & Responsible Use", "Final Project",
    ],
  },
} as const;

type PathKey = keyof typeof PATHS;

export default function RoadmapSection() {
  const [active, setActive] = useState<PathKey>("python");
  const [hovered, setHovered] = useState<number | null>(null);
  const path = PATHS[active];
  const accentVar = path.theme === "indigo" ? "var(--accent-indigo)" : "var(--accent-violet)";

  return (
    <section className="py-24 bg-gradient-to-b from-[var(--bg-main)] via-[#F3F5FC] to-[var(--bg-main)] border-t border-[var(--border-primary)]/60 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <Reveal delay={0.1}>
            <h2 className="text-xs uppercase tracking-widest text-[var(--accent-indigo)] font-bold font-mono">
              Learning Roadmap — Every Lecture, In Order
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mt-3">
              See the whole path before you start.
            </h3>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
              This is the actual lecture-by-lecture sequence, not a vague syllabus. Python takes you from zero to shipping CLI tools. AI Fundamentals takes you from search algorithms to a working agent. Pick a path — or do both.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.25}>
          <div className="flex justify-center gap-3 mb-12">
            {(Object.keys(PATHS) as PathKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border ${
                  active === key
                    ? "bg-[var(--text-primary)] text-[var(--bg-main)] border-[var(--text-primary)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--accent-indigo)]/40"
                }`}
              >
                {PATHS[key].label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="overflow-x-auto pt-20 -mt-20 pb-4 -mx-6 px-6">
            <div className="relative flex items-start gap-0 min-w-max">
              <div
                className="absolute top-5 left-5 right-5 h-[2px]"
                style={{ background: `linear-gradient(to right, ${accentVar}66, ${accentVar}22)` }}
              />
              {path.lectures.map((title, i) => (
                <motion.div
                  key={`${active}-${title}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex flex-col items-center w-[128px] shrink-0 relative z-10 group"
                >
                  <AnimatePresence>
                    {hovered === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-3 w-40 rounded-xl border p-3 shadow-lg bg-[var(--bg-main)] z-20 pointer-events-none"
                        style={{ borderColor: `${accentVar}40` }}
                      >
                        <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: accentVar }}>
                          Lecture {i + 1} of {path.lectures.length}
                        </div>
                        <div className="mt-1 text-xs font-bold text-[var(--text-primary)] leading-snug">
                          {title}
                        </div>
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b"
                          style={{ borderColor: `${accentVar}40`, background: "var(--bg-main)" }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold bg-[var(--bg-main)] transition-transform duration-200 group-hover:scale-110"
                    style={{ borderColor: accentVar, color: accentVar }}
                  >
                    {i + 1}
                  </div>
                  <div className="mt-3 text-center px-1">
                    <div className="text-[11px] font-semibold text-[var(--text-primary)] leading-snug">
                      {title}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="text-center mt-8">
            <Link
              to="/register"
              className="inline-block px-7 py-3 border border-[var(--border-primary)] hover:border-[var(--accent-indigo)] rounded-lg font-bold text-sm text-[var(--text-primary)] transition-all"
            >
              View Full Roadmap
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
