import { motion } from "framer-motion";
import { BookOpen, Code, Flame, Sparkles, Award, Compass } from "lucide-react";

export default function LearningExperienceSection() {
  const features = [
    {
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      title: "Interactive Courses",
      description: "Learn concepts through concise modules. No long theoretical videos, just content paired immediately with exercises."
    },
    {
      icon: <Code className="w-5 h-5 text-blue-500" />,
      title: "Project-Based Learning",
      description: "Build real-world applications. Solve challenges by writing functional code verified against testing suites."
    },
    {
      icon: <Flame className="w-5 h-5 text-blue-500" />,
      title: "Progress Tracking",
      description: "Visualize your learning consistency with gamified streaks, experience points, and detailed activity heatmaps."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-blue-500" />,
      title: "Achievements & Milestones",
      description: "Unlock badges as you complete complex programming challenges and stay consistent in your studies."
    },
    {
      icon: <Award className="w-5 h-5 text-blue-500" />,
      title: "Certifications",
      description: "Earn cryptographic, shareable digital certificates to verify your skills on your resume and LinkedIn."
    },
    {
      icon: <Compass className="w-5 h-5 text-blue-500" />,
      title: "Personalized Learning Journey",
      description: "Define your engineering goals and follow structured paths calibrated to take you from beginner to job-ready."
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="py-24 max-w-6xl mx-auto px-6 border-t border-slate-900"
    >
      <div className="max-w-2xl text-left mb-16">
        <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Learning Experience</h2>
        <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-3">
          The features that power practical technology learning.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => (
          <div key={idx} className="group p-8 border border-white/10 bg-[#0d121f]/30 rounded-2xl text-left hover:border-blue-500/30 hover:bg-[#0d121f]/60 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.15)] transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h4 className="text-lg font-bold text-white mb-3">{feature.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
