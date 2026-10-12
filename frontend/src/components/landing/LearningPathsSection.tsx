import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Terminal } from "lucide-react";

export default function LearningPathsSection() {
  const paths = [
    {
      title: "Python Programming",
      description: "A beginner-friendly introduction to programming with Python — from your first Hello World through variables, conditionals, loops, functions, data structures, file handling, and a mini project.",
      duration: "10 Lessons",
      difficulty: "Beginner",
      icon: <Terminal className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Fundamentals of AI",
      description: "A rigorous introduction to Artificial Intelligence with Python — search algorithms, knowledge representation, uncertainty, optimization, machine learning, and natural language processing.",
      duration: "7 Lessons",
      difficulty: "Advanced",
      icon: <Brain className="w-6 h-6 text-blue-500" />
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      id="paths" 
      className="py-24 max-w-6xl mx-auto px-6 border-t border-slate-900"
    >
      <div className="max-w-2xl text-left mb-16">
        <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Learning Paths</h2>
        <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-3">
          Structured curricula targeting core domains.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
        {paths.map((path, idx) => (
          <div key={idx} className="group flex flex-col border border-white/10 bg-[#0d121f]/40 rounded-3xl overflow-hidden hover:border-[#0F9FB6]/30 hover:shadow-[0_0_18px_-5px_rgba(15,159,182,0.12)] transition-all duration-300">
            {/* Thumbnail Area */}
            <div className="h-40 w-full bg-[var(--bg-header)] relative overflow-hidden flex items-center justify-center border-b border-white/5">
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
              <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                {path.icon}
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-1">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  {path.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                  {path.duration}
                </span>
              </div>
              
              <h4 className="text-xl font-bold text-white tracking-tight mb-3">{path.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">{path.description}</p>

              <Link to="/register" className="w-full py-3.5 border-2 border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 text-center text-blue-400 font-bold rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3">
                View Curriculum
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
