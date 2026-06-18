import { motion } from "framer-motion";
import { AlertTriangle, MonitorPlay, FileX } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      title: "Too Many Distractions",
      description: "Bloated platforms kill focus before you learn anything",
      borderColor: "border-l-red-500/50"
    },
    {
      icon: <MonitorPlay className="w-6 h-6 text-orange-400" />,
      title: "Passive Video Watching",
      description: "Watching code being written is not the same as writing it",
      borderColor: "border-l-orange-500/50"
    },
    {
      icon: <FileX className="w-6 h-6 text-yellow-400" />,
      title: "No Proof of Skills",
      description: "Completing a course means nothing without verified output",
      borderColor: "border-l-yellow-500/50"
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#05050a]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-[#3b82f6] mb-4 block">THE PROBLEM</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Most learners quit before they finish.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((prob, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`bg-[#0d0d16] border border-white/8 ${prob.borderColor} border-l-4 p-8 rounded-xl`}
            >
              <div className="mb-6">
                {prob.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{prob.title}</h3>
              <p className="text-[#6b7280] leading-relaxed">
                {prob.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
