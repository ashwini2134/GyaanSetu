import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Brain } from "lucide-react";

export default function CourseDiscoverySection() {
  const courses = [
    {
      title: "Python Programming",
      description: "A complete, hands-on introduction to Python. Write code from day one.",
      lectures: "14 Lectures",
      difficulty: "Beginner",
      difficultyColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      icon: <Terminal className="w-10 h-10 text-white" />
    },
    {
      title: "Artificial Intelligence",
      description: "Learn modern AI concepts, algorithms, and how to implement them.",
      lectures: "10 Lectures",
      difficulty: "Advanced",
      difficultyColor: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      icon: <Brain className="w-10 h-10 text-white" />
    }
  ];

  return (
    <section id="courses" className="py-32 px-6 bg-[#050508]">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4 block">Courses</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Two paths. One goal: getting you job-ready.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative flex flex-col bg-[#0d0d14] rounded-3xl p-8 border border-white/5 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
              
              {/* Top Row: Icon & Badge */}
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {course.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${course.difficultyColor}`}>
                  {course.difficulty}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-12 flex-1">
                {course.description}
              </p>

              {/* Bottom Row */}
              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <span className="text-sm font-medium text-gray-500">{course.lectures}</span>
                <Link to="/register" className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 group/link transition-colors">
                  View Curriculum
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
