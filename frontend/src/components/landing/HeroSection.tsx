import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection({ scrollToSection }: { scrollToSection: (id: string) => void }) {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#05050a] overflow-hidden py-24">
      {/* Background Subtle Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#3b82f6]/10 blur-[150px] rounded-[100%] pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl mx-auto flex flex-col items-center z-10 pt-16"
      >
        {/* Top Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3b82f6]/30 bg-[#0d0d16] mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-xs font-bold text-[#3b82f6] tracking-wide">✦ Python & AI Courses — Free to Start</span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] md:leading-[1.1]">
          Build Skills That<br />
          <span className="bg-gradient-to-r from-[#3b82f6] to-blue-400 bg-clip-text text-transparent">Actually Get You Hired.</span>
        </h1>

        {/* Subtext */}
        <p className="mt-8 text-lg text-[#6b7280] max-w-2xl mx-auto leading-relaxed">
          Fraylon Academy is a structured, distraction-free learning platform for Python and AI. Real lectures. Real code. Real certificates.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_0px_rgba(59,130,246,0.6)] hover:scale-105">
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={() => scrollToSection("courses")} className="w-full sm:w-auto px-8 py-4 border border-white/20 bg-transparent hover:bg-white/5 text-white rounded-full font-bold transition-all duration-300 hover:scale-105 cursor-pointer">
            Explore Courses
          </button>
        </div>

        {/* Trust Stats */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm font-semibold text-[#6b7280] tracking-wide">
          <span>2 Courses</span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>24 Lectures</span>
          <span className="hidden sm:block text-white/20">|</span>
          <span>Built-in Code Editor</span>
        </div>
      </motion.div>
    </section>
  );
}
