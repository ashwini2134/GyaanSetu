import { motion } from "framer-motion";
import { Code2, BarChart2, GraduationCap } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Code2 className="w-6 h-6 text-[#3b82f6]" />,
      title: "Built-in Code Editor",
      description: "Write and run Python directly in your browser. Zero setup required."
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-[#3b82f6]" />,
      title: "Section-by-Section Tracking",
      description: "Every scroll, quiz, and problem tracked. Progress saved automatically."
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-[#3b82f6]" />,
      title: "Verified Certificates",
      description: "Earn a certificate only when every section is genuinely completed."
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
          <span className="text-sm font-bold uppercase tracking-widest text-[#6b7280] mb-4 block">THE PLATFORM</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Everything you need. Nothing you don't.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-transparent border border-white/8 p-8 rounded-xl hover:border-[#3b82f6]/40 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] transition-all duration-300 group"
            >
              <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-[#6b7280] leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
