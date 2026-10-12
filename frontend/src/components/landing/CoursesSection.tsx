import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { useParallax } from "./hooks/useParallax";
import { DynamicCourseIcon } from "../DynamicCourseIcon";

const PROGRAMS = [
  {
    title: "Python",
    category: "Programming",
    level: "Beginner to Intermediate",
    desc: "14 Hands-on Lectures, 4 CLI Projects. Master everything from basic syntax to object-oriented programming by building real tools you can actually run in a terminal.",
    theme: "indigo",
    shadowColor: "rgba(91,110,245,0.2)", // accent-indigo
    features: ["Interactive Sandbox", "AI Code Reviews", "Terminal Projects"]
  },
  {
    title: "Artificial Intelligence",
    category: "Artificial Intelligence",
    level: "Advanced",
    desc: "7 Deep-dive Lectures, 2 Major Projects. Build real AI agents that solve mazes using A* and play games using MiniMax, transitioning theory into working code.",
    theme: "violet",
    shadowColor: "rgba(168,85,247,0.2)", // accent-violet
    features: ["A* Search", "MiniMax Algorithm", "AI Capstone"]
  }
];

function CourseCard({ prog, delay }: { prog: typeof PROGRAMS[0], delay: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const imageY = useParallax(containerRef, 15);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <Reveal delay={delay} direction="up" className="h-full relative [perspective:1000px]">
      <motion.div
        ref={containerRef}
        style={(!prefersReducedMotion && !isTouchDevice) ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
        onMouseMove={!isTouchDevice ? handleMouseMove : undefined}
        onMouseLeave={!isTouchDevice ? handleMouseLeave : undefined}
        className={`group relative h-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl flex flex-col transition-colors duration-500`}
        whileHover={{
          boxShadow: `0 0 40px ${prog.shadowColor}`,
          borderColor: prog.theme === 'indigo' ? 'rgba(91,110,245,0.5)' : 'rgba(168,85,247,0.5)'
        }}
      >
        {/* Top Code Preview Banner Area */}
        <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-t-2xl bg-[var(--surface-container)]">
          {/* Real course visual, shared with the Dashboard and Courses page */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ y: imageY }}
            whileHover={!prefersReducedMotion ? { scale: 1.04 } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <DynamicCourseIcon courseName={prog.title} category={prog.category} />
          </motion.div>

          {/* Level Badge Overlay (Top Right) */}
          <div className="absolute top-4 right-4 z-20">
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg-surface)]/90 backdrop-blur-md border ${prog.theme === 'indigo' ? 'border-[var(--accent-indigo)] text-[var(--accent-indigo)]' : 'border-[var(--accent-violet)] text-[var(--accent-violet)]'} shadow-sm`}>
              {prog.level}
            </span>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-1 flex flex-col z-10 relative bg-[var(--bg-surface)] rounded-b-2xl">
          <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-3" style={!prefersReducedMotion && !isTouchDevice ? { transform: "translateZ(20px)" } : {}}>
            {prog.title}
          </h4>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 flex-1" style={!prefersReducedMotion && !isTouchDevice ? { transform: "translateZ(10px)" } : {}}>
            {prog.desc}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8" style={!prefersReducedMotion && !isTouchDevice ? { transform: "translateZ(15px)" } : {}}>
            {prog.features.map(f => (
              <span key={f} className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-indigo)] bg-[var(--accent-indigo)]/8 hover:bg-[var(--accent-indigo)]/15 transition-colors px-2.5 py-1.5 rounded cursor-default border border-[var(--accent-indigo)]/20">
                {f}
              </span>
            ))}
          </div>

          {/* Call to action button — no translateZ here: 3D depth transforms on
              this nested-motion.div + whileHover combo were hiding the button's
              own text in some renderers. Not worth the risk on a CTA. */}
          <div>
            <Link to="/register" className="block focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)] rounded-lg">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 bg-[var(--text-primary)] hover:bg-[#00BFB3] text-[#fff] font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 group/btn shadow-md`}
              >
                <span>Start This Course</span>
                <motion.div
                  initial={{ width: 0, opacity: 0, x: -10 }}
                  whileHover={{ width: "auto", opacity: 1, x: 0 }}
                  className="flex items-center"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

export default function CoursesSection() {
  return (
    <section id="courses" className="scroll-mt-16 py-24 bg-transparent border-t border-slate-900/60 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <Reveal delay={0.1}>
            <h2 className="text-xs uppercase tracking-widest text-[var(--accent-indigo)] font-bold font-mono">Programs Spotlight</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mt-3">Start Building Today</h3>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PROGRAMS.map((prog, i) => (
            <CourseCard key={prog.title} prog={prog} delay={0.2 + (i * 0.15)} />
          ))}
        </div>

      </div>
    </section>
  );
}
