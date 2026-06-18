import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: `"I finished the full Python course in 2 weeks. The section-by-section structure kept me on track."`,
      name: "Arjun S.",
      initial: "A"
    },
    {
      quote: `"The AI course covers exactly what CS50AI covers but you actually write code at every step."`,
      name: "Preethi R.",
      initial: "P"
    },
    {
      quote: `"The green circle system made me want to complete every section properly. It actually works."`,
      name: "Karthik M.",
      initial: "K"
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
          <span className="text-sm font-bold uppercase tracking-widest text-[#6b7280] mb-4 block">STUDENT REVIEWS</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Learners who stuck with it. Here's what they say.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-[#0d0d16] border border-white/8 p-8 rounded-xl flex flex-col"
            >
              <p className="text-[#6b7280] italic leading-relaxed flex-1 mb-8">
                {test.quote}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] font-bold text-sm border border-[#3b82f6]/20">
                  {test.initial}
                </div>
                <div className="text-sm font-bold text-white">{test.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
