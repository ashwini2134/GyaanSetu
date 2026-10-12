import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Terminal } from "lucide-react";
import Reveal from "./Reveal";

const CodeEditor = lazy(() => import("../lesson/CodeEditor"));

const STARTER_CODE = `# Store student information
student_name = ""
roll_number = ""
department = ""

# Print each variable
`;

export default function LiveLearningPreviewSection() {
  return (
    <section className="py-24 bg-[var(--bg-main)] border-t border-[var(--border-primary)]/60 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <Reveal delay={0.1}>
            <h2 className="text-xs uppercase tracking-widest text-[var(--accent-indigo)] font-bold font-mono">
              Live Preview
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mt-3">
              Try it. Right now. No account needed.
            </h3>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
              This is a real practice exercise from Lecture 2 of the Python course — "Store a Student Profile." Fill in the three variables and hit Run.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.25}>
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[#0A0E1A] shadow-xl overflow-hidden">
            <div className="h-10 border-b border-[var(--border-primary)] flex items-center px-4 gap-2 bg-[#0c101b]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              <span className="ml-2 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                <Terminal className="w-3 h-3" /> student_profile.py
              </span>
            </div>
            <Suspense
              fallback={
                <div className="h-[180px] flex items-center justify-center text-sm text-[var(--text-muted)]">
                  Loading editor…
                </div>
              }
            >
              <CodeEditor
                initialCode={STARTER_CODE}
                language="python"
                height="200px"
                showRunButton
                showResetButton
              />
            </Suspense>
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <div className="text-center mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-indigo)] hover:opacity-80"
            >
              Want the full course? Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
