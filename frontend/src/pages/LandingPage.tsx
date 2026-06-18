import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import HeroSection from "../components/landing/HeroSection";
import ProblemSection from "../components/landing/ProblemSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import CoursesSection from "../components/landing/CoursesSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import CTASection from "../components/landing/CTASection";
import FooterSection from "../components/landing/FooterSection";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#05050a] text-gray-400 font-sans selection:bg-[#3b82f6]/30 overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#05050a]/80 border-b border-white/5 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Fraylon Academy" className="h-6 w-auto object-contain" />
            <span className="font-bold text-white tracking-wide">Fraylon Academy</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => scrollToSection("courses")} className="text-gray-400 hover:text-white transition-colors cursor-pointer">Courses</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-gray-400 hover:text-white transition-colors cursor-pointer">How It Works</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2 rounded-full bg-[#3b82f6] hover:bg-blue-500 text-white text-sm font-bold transition-all hover:scale-105">
              Start Free
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-0 z-50 bg-[#05050a] border-b border-white/5 p-6 flex flex-col gap-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Fraylon Academy" className="h-6 w-auto object-contain" />
                <span className="font-bold text-white tracking-wide">Fraylon Academy</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 text-sm font-medium">
              <button onClick={() => scrollToSection("courses")} className="text-left text-gray-400 hover:text-white transition-colors">Courses</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left text-gray-400 hover:text-white transition-colors">How It Works</button>
            </nav>

            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
              <Link to="/login" className="w-full text-center py-3 border border-white/10 rounded-full text-sm font-bold text-gray-300">
                Sign In
              </Link>
              <Link to="/register" className="w-full text-center py-3 bg-[#3b82f6] hover:bg-blue-500 rounded-full text-sm font-bold text-white transition-all">
                Start Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <HeroSection scrollToSection={scrollToSection} />
        <ProblemSection />
        <HowItWorksSection />
        <CoursesSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
        <FooterSection />
      </main>
    </div>
  );
}
