import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, LineChart } from "lucide-react";
import Reveal from "./Reveal";

function AnimatedNumber({ end, suffix = "", delay = 0, accent }: { end: number; suffix?: string; delay?: number; accent: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setTimeout(() => {
            let start = 0;
            const duration = 1600;
            const increment = end / (duration / 16);
            const timer = setInterval(() => {
              start += increment;
              if (start >= end) {
                setCount(end);
                clearInterval(timer);
              } else {
                setCount(Math.floor(start));
              }
            }, 16);
          }, delay * 1000);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, hasAnimated, delay]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-extrabold font-mono" style={{ color: accent }}>
      {count}{suffix}
    </div>
  );
}

const STATS = [
  { end: 24, suffix: "", label: "Hands-on Lectures", accent: "#1B2B44" },
  { end: 100, suffix: "%", label: "Projects Get AI Review", accent: "#0C757C" },
  { end: 10, suffix: "s", label: "Avg. AI Review Time", accent: "#7C3AED" },
  { end: 24, suffix: "/7", label: "Platform Availability", accent: "#00BFB3" },
];

export default function PlatformCapabilitiesSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 bg-gradient-to-b from-[var(--bg-main)] via-[#F5F3FB] to-[var(--bg-main)] border-t border-[var(--border-primary)]/60 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Reveal delay={0.1}>
            <h2 className="text-xs uppercase tracking-widest text-[var(--accent-indigo)] font-bold font-mono">
              Platform Capabilities
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mt-3">
              Everything else you'd expect. Done properly.
            </h3>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Feature tile: AI Code Review */}
          <Reveal delay={0.2} direction="up" className="md:col-span-2 h-full">
            <motion.div
              whileHover={!prefersReducedMotion ? { scale: 1.01 } : {}}
              className="group h-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl p-8 hover:border-[var(--accent-violet)]/40 transition-colors duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-violet)]/10 border border-[var(--accent-violet)]/20 flex items-center justify-center mb-5 group-hover:bg-[var(--accent-violet)]/20 transition-colors">
                  <Bot className="w-6 h-6 text-[var(--accent-violet)]" />
                </div>
                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">AI Code Review</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  Every submission is analyzed line-by-line — not a pass/fail script, but real feedback on logic, style, and efficiency, returned in seconds.
                </p>
              </div>
              <Link to="/about" className="mt-6 text-sm font-bold text-[var(--accent-violet)] hover:opacity-80 flex items-center gap-2">
                Learn how it works &rarr;
              </Link>
            </motion.div>
          </Reveal>

          {/* Feature tile: Learning Dashboard */}
          <Reveal delay={0.25} direction="up" className="md:col-span-2 h-full">
            <motion.div
              whileHover={!prefersReducedMotion ? { scale: 1.01 } : {}}
              className="group h-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl p-8 hover:border-[var(--accent-indigo)]/40 transition-colors duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-indigo)]/10 border border-[var(--accent-indigo)]/20 flex items-center justify-center mb-5 group-hover:bg-[var(--accent-indigo)]/20 transition-colors">
                  <LineChart className="w-6 h-6 text-[var(--accent-indigo)]" />
                </div>
                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your Learning Dashboard</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  Track XP, streaks, and certificates in one place. Completed projects convert automatically into your portfolio.
                </p>
              </div>
              <Link to="/" className="mt-6 text-sm font-bold text-[var(--accent-indigo)] hover:opacity-80 flex items-center gap-2">
                View dashboard &rarr;
              </Link>
            </motion.div>
          </Reveal>

          {/* Stat tiles — each carries its own accent so the row doesn't read as four identical boxes */}
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={0.3 + i * 0.06} direction="up">
              <motion.div
                whileHover={!prefersReducedMotion ? { y: -3 } : {}}
                className="h-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl p-6 pt-5 text-center transition-colors duration-300 relative overflow-hidden"
                style={{ borderTopColor: stat.accent, borderTopWidth: 3 }}
              >
                <AnimatedNumber end={stat.end} suffix={stat.suffix} delay={0.1 * i} accent={stat.accent} />
                <div className="mt-1 text-[11px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                  {stat.label}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
