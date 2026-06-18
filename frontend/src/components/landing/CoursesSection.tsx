import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Code2, BrainCircuit } from "lucide-react";

export default function CoursesSection() {
  const courses = [
    {
      badge: "Beginner",
      badgeColor: "text-green-400 border-green-400/30 bg-green-400/10",
      title: "Python Programming",
      description: "From Hello World to real programs — variables, loops, functions, file handling, and a mini project.",
      stats: "14 Lectures · 6 Sections each",
      buttonText: "Start Python",
      icon: (
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0d0d16] to-[#1e293b] border border-white/10 flex items-center justify-center mb-8 shadow-inner shadow-white/5">
          <Code2 className="w-8 h-8 text-white" />
        </div>
      )
    },
    {
      badge: "Advanced",
      badgeColor: "text-red-400 border-red-400/30 bg-red-400/10",
      title: "Artificial Intelligence",
      description: "Harvard-inspired AI curriculum — search algorithms, knowledge representation, machine learning, and NLP.",
      stats: "10 Lectures · 6 Sections each",
      buttonText: "Start AI",
      icon: (
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0d0d16] to-[#3b0764] border border-white/10 flex items-center justify-center mb-8 shadow-inner shadow-white/5">
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>
      )
    }
  ];

  return (
    <section id="courses" className="py-24 px-6 bg-[#05050a]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-[#6b7280] mb-4 block">COURSES</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Two paths. One goal: job-ready skills.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group flex flex-col bg-[#0d0d16] border border-white/8 rounded-2xl p-8 hover:-translate-y-2 hover:border-[#3b82f6] hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                {course.icon}
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${course.badgeColor}`}>
                  {course.badge}
                </span>
              </div>

              <h3 className="text-3xl font-black text-white mb-4">{course.title}</h3>
              <p className="text-[#6b7280] leading-relaxed mb-10 flex-1">
                {course.description}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-white/8 pt-6 mt-auto">
                <span className="text-sm font-medium text-[#6b7280]">{course.stats}</span>
                <Link to="/register" className="w-full sm:w-auto px-6 py-3 border border-[#3b82f6] hover:bg-[#3b82f6]/10 text-[#3b82f6] rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all group-hover:bg-[#3b82f6] group-hover:text-white">
                  {course.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
