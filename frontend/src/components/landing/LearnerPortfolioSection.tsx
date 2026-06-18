import { motion } from "framer-motion";
import { CheckCircle2, Flame, Award } from "lucide-react";

export default function LearnerPortfolioSection() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      id="portfolio" 
      className="py-24 bg-[#0d121f]/10 border-t border-slate-900"
    >
      <div className="max-w-6xl mx-auto px-6 grid gap-16 lg:grid-cols-2 items-center">
        <div className="text-left space-y-6">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Learner Portfolio</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Prove your capabilities with a validated public profile.
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every course you pass, project you build, and daily streak you maintain updates your student profile. Share a verifiable, clean page that shows recruiters your actual project achievements instead of listing generic bullet points.
          </p>
          
          <ul className="space-y-4 pt-4 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <span>Track skills in real-time as you complete validation exercises</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <span>Showcase code files and test logs of completed projects</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <span>Earn cryptographically signed certificates with verify codes</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <span>Maintain learning streaks to build disciplined study habits</span>
            </li>
          </ul>
        </div>

        {/* Portfolio mockup widget */}
        <div className="p-8 border border-white/10 bg-[#0d121f]/80 rounded-2xl max-w-sm mx-auto w-full text-left space-y-6 shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)] hover:shadow-[0_0_50px_-5px_rgba(59,130,246,0.2)] hover:border-blue-500/20 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-sm text-white">
              JD
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">John Doe</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                Student Profile • Verified
              </p>
            </div>
          </div>

          <hr className="border-slate-800" />

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Technical Streaks</div>
              <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-white">12 Days Coding Habit</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Earned Credentials</div>
              <div className="space-y-3">
                <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-xs">Python Core Certificate</div>
                    <div className="text-[10px] text-slate-500 mt-1">Issued June 2026 • Verified</div>
                  </div>
                </div>
                <div className="p-3 bg-[#080c14] border border-slate-800 rounded-lg flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-xs">Artificial Intelligence</div>
                    <div className="text-[10px] text-slate-500 mt-1">Issued June 2026 • Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
