import { motion } from "framer-motion";

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: "🎯",
      title: "Pick Your Path",
      description: "Choose Python for beginners or AI for advanced learners"
    },
    {
      num: "02",
      icon: "📖",
      title: "Learn Every Section",
      description: "Read structured notes and scroll through every page"
    },
    {
      num: "03",
      icon: "💻",
      title: "Solve Real Problems",
      description: "Write and run Python code in the built-in editor"
    },
    {
      num: "04",
      icon: "🏆",
      title: "Earn Your Certificate",
      description: "Complete all 6 sections per lecture to get certified"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#05050a]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-left"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-[#6b7280] mb-4 block">HOW IT WORKS</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            A structured path from zero to certified.
          </h2>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-12 md:gap-6 justify-between">
          {/* Desktop Connecting Dotted Line */}
          <div className="hidden md:block absolute top-12 left-10 right-10 h-px border-t-2 border-dotted border-white/10 -z-10" />

          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="relative flex flex-col items-start md:flex-1"
            >
              {/* Background faint number */}
              <div className="absolute -top-12 left-0 text-8xl font-black text-blue-500 opacity-5 pointer-events-none select-none">
                {step.num}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-[#0d0d16] border border-white/8 flex items-center justify-center text-2xl mb-6 relative z-10 shadow-lg">
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{step.title}</h3>
              <p className="text-[#6b7280] leading-relaxed relative z-10 pr-4">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
