import { motion } from "framer-motion";
import { Brain, Users, Code, Compass } from "lucide-react";

export default function CommunitySection() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      id="community" 
      className="py-24 bg-[#0d121f]/10 border-t border-slate-900"
    >
      <div className="max-w-6xl mx-auto px-6 grid gap-16 lg:grid-cols-2 items-center">
        <div className="p-8 border border-white/10 bg-[#0d121f]/80 rounded-2xl max-w-sm mx-auto w-full text-left space-y-5 shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)] hover:shadow-[0_0_50px_-5px_rgba(59,130,246,0.2)] hover:border-blue-500/20 transition-all duration-300">
          <div className="text-[10px] text-blue-500 font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Live Activity Log
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-[#080c14] border border-slate-800 rounded-xl text-xs hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between font-bold text-white mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Mentorship Review
                </div>
                <span className="text-slate-500 font-normal">10m ago</span>
              </div>
              <p className="text-slate-400 leading-relaxed ml-4">Review complete: <code className="text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">task-solver.py</code>. Feedback logged inside the dashboard.</p>
            </div>

            <div className="p-4 bg-[#080c14] border border-slate-800 rounded-xl text-xs hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between font-bold text-white mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Peer Discussion
                </div>
                <span className="text-slate-500 font-normal">1h ago</span>
              </div>
              <p className="text-slate-400 leading-relaxed ml-4">Alternative list-comprehension method posted for lesson 4.</p>
            </div>
          </div>
        </div>

        <div className="text-left space-y-6">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Community & Growth</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Collaborate and code with active learners.
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Gain input on your scripting choices through mentor feedback channels. Share, discuss, and optimize your implementations alongside other students on course dashboards, preparing yourself for professional development settings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-5 border border-white/5 bg-slate-900/30 rounded-xl hover:bg-slate-900/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Brain className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Mentorship</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Ask questions and review scripts with assistant logs.</p>
            </div>
            <div className="p-5 border border-white/5 bg-slate-900/30 rounded-xl hover:bg-slate-900/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Peer learning</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Discuss optimizations inside lesson discussion panels.</p>
            </div>
            <div className="p-5 border border-white/5 bg-slate-900/30 rounded-xl hover:bg-slate-900/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Code className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Collaboration</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Solve challenges and work together on programming logic.</p>
            </div>
            <div className="p-5 border border-white/5 bg-slate-900/30 rounded-xl hover:bg-slate-900/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Compass className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Career readiness</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Showcase clean code portfolios directly to hiring systems.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
