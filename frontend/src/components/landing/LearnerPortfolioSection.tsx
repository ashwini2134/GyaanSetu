import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { GraduationCap, Dumbbell, FolderGit2, Sparkles, Briefcase, Trophy, CheckCircle2, Flame, Award } from "lucide-react";
import Reveal from "./Reveal";

const PIPELINE = [
  { icon: GraduationCap, label: "Learning", desc: "Concepts, animations, interactive demos" },
  { icon: Dumbbell, label: "Practice", desc: "Try It Yourself + Practice Exercises" },
  { icon: FolderGit2, label: "Projects", desc: "Problems to Solve + Milestones" },
  { icon: Sparkles, label: "Portfolio", desc: "Every artifact lands here automatically" },
  { icon: Briefcase, label: "Placement", desc: "A verified link a recruiter can open" },
  { icon: Trophy, label: "Career", desc: "The reason any of it mattered" },
];

export default function LearnerPortfolioSection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(useSpring(y, { stiffness: 300, damping: 30 }), [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(useSpring(x, { stiffness: 300, damping: 30 }), [-0.5, 0.5], [-6, 6]);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { if (!isTouchDevice) { x.set(0); y.set(0); } };

  return (
    <section
      id="portfolio"
      className="py-24 bg-[var(--bg-main)] border-t border-[var(--border-primary)]/60 overflow-hidden relative"
    >
      {/* Ambient glow, matching the rest of the page's sections */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-indigo)]/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#00BFB3]/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 grid gap-16 lg:grid-cols-2 items-center relative z-10">

        {/* Left: message + pipeline */}
        <div className="text-left space-y-8">
          <Reveal delay={0.1}>
            <h2 className="text-xs uppercase tracking-widest text-[var(--accent-indigo)] font-bold font-mono">
              The Portfolio Engine
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mt-3">
              Your portfolio isn't something you build later.<br />
              <span className="text-[#00BFB3]">It's built by finishing.</span>
            </h3>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Every Try It Yourself, every Practice Exercise, every Problem Solved, every Milestone, every Capstone — automatically becomes proof of work.
            </p>
          </Reveal>

          <div className="relative pt-2">
            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--accent-indigo)]/40 via-[var(--accent-indigo)]/20 to-transparent" />
            <div className="space-y-5">
              {PIPELINE.map((stage, i) => (
                <Reveal key={stage.label} delay={0.15 + i * 0.08}>
                  <div className="flex items-center gap-4 relative">
                    <div className={`w-10 h-10 shrink-0 rounded-full border flex items-center justify-center relative z-10 ${
                      stage.label === "Portfolio"
                        ? "bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-[#fff] shadow-lg shadow-[var(--accent-indigo)]/30"
                        : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)]"
                    }`}>
                      <stage.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{stage.label}</div>
                      <div className="text-xs text-[var(--text-muted)]">{stage.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.7}>
            <Link
              to="/register"
              className="inline-block mt-2 px-7 py-3 bg-[var(--accent-indigo)] hover:opacity-90 text-[#fff] rounded-lg font-bold text-sm transition-all shadow-lg shadow-[var(--accent-indigo)]/20"
            >
              Start Building Yours
            </Link>
          </Reveal>
        </div>

        {/* Right: portfolio mockup, docked at the "Portfolio" stage */}
        <Reveal delay={0.3} direction="right">
          <motion.div
            ref={cardRef}
            onMouseMove={!isTouchDevice ? handleMouseMove : undefined}
            onMouseLeave={!isTouchDevice ? handleMouseLeave : undefined}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            style={!prefersReducedMotion && !isTouchDevice ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
            className="relative p-8 border border-[var(--border-primary)] bg-[var(--bg-surface)] rounded-2xl max-w-sm mx-auto w-full text-left space-y-6 shadow-[0_0_40px_-10px_rgba(15,159,182,0.15)] hover:shadow-[0_0_50px_-5px_rgba(15,159,182,0.25)] hover:border-[var(--accent-indigo)]/30 transition-shadow duration-300 [perspective:1000px]"
          >
            <div className="absolute top-5 right-6 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BFB3] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BFB3]" />
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Live</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-indigo)]/10 border-2 border-[var(--accent-indigo)]/30 flex items-center justify-center font-bold text-sm text-[var(--accent-indigo)]">
                JD
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Jordan Diaz</h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[var(--accent-indigo)]" />
                  Student Profile &bull; Verified
                </p>
              </div>
            </div>

            <hr className="border-[var(--border-primary)]" />

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Technical Streaks</div>
                <div className="p-3 bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-lg flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">12 Days Coding Habit</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Earned Credentials</div>
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: 0.1, duration: 0.35 }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-lg flex items-center gap-3"
                  >
                    <Award className="w-5 h-5 text-[var(--accent-indigo)] shrink-0" />
                    <div>
                      <div className="font-bold text-[var(--text-primary)] text-xs">Python Certificate</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">Issued June 2026 &bull; Verified</div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: 0.2, duration: 0.35 }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-lg flex items-center gap-3"
                  >
                    <Award className="w-5 h-5 text-[var(--accent-indigo)] shrink-0" />
                    <div>
                      <div className="font-bold text-[var(--text-primary)] text-xs">Artificial Intelligence</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">In Progress &bull; 3 Milestones Complete</div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Recent Portfolio Entries</div>
                <div className="space-y-2">
                  {["CLI Expense Tracker", "A* Maze Solver", "Tic-Tac-Toe Minimax Agent"].map((entry, i) => (
                    <motion.div
                      key={entry}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                      className="p-2.5 bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-lg flex items-center gap-2.5"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{entry}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </Reveal>

      </div>
    </section>
  );
}
