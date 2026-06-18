import { motion } from "framer-motion";

export default function SocialProofSection() {
  const reviews = [
    {
      quote: `"Finally an LMS that makes me actually finish what I start."`,
      name: "Alex M.",
      initial: "A"
    },
    {
      quote: `"The code editor inside the lesson is a game changer."`,
      name: "Sarah K.",
      initial: "S"
    },
    {
      quote: `"Clean, fast, and no distractions. Love it."`,
      name: "David R.",
      initial: "D"
    }
  ];

  return (
    <section className="py-32 px-6 bg-[#050508]">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-16"
        >
          Built for learners who mean it.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {reviews.map((review, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <p className="text-gray-400 italic text-sm md:text-base leading-relaxed mb-6">
                {review.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                  {review.initial}
                </div>
                <span className="text-sm font-medium text-gray-500">{review.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
