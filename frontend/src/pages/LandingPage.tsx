import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Award,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Flame,
  Terminal,
  Sparkle,
  BookOpen,
  Users,
  Check,
  FileCode,
  Code,
  Zap,
  Shield,
  Activity,
  Calendar,
  MapPin,
  Play,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Search
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<"certificates" | "skills" | "projects" | "timeline" | "achievements">("certificates");
  const [chatStep, setChatStep] = useState(0);
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [innerSlideIndex, setInnerSlideIndex] = useState(0);

  // Auto-rotate the main hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate the inner slides of the first hero slide
  useEffect(() => {
    if (currentHeroSlide !== 0) return;
    const interval = setInterval(() => {
      setInnerSlideIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentHeroSlide]);

  // Socratic mentor simulation script
  const chatDialogue = [
    {
      sender: "student",
      code: `def total(numbers):\n    for n in numbers:\n        sum = 0\n        sum = sum + n\n    return sum`,
      question: "My grade total function is failing empty list inputs and returning incorrect sums. Why?",
      time: "10:14 PM"
    },
    {
      sender: "mentor",
      text: "Let's trace your code execution together. If the `numbers` list is empty, what does the loop do? What will the function return? Also, check where `sum` is initialized.",
      time: "10:15 PM"
    },
    {
      sender: "student",
      code: `def total(numbers):\n    sum = 0  # Moved outside loop\n    for n in numbers:\n        sum = sum + n\n    return sum`,
      question: "Ah! I initialized 'sum = 0' inside the loop, so it was resetting on each iteration. Let me move it outside the loop.",
      time: "10:16 PM"
    },
    {
      sender: "mentor",
      text: "Spot on! By initializing it outside, it accumulates the sum. Now test your code. Let's see if the empty list returns 0 as expected.",
      time: "10:17 PM"
    },
    {
      sender: "system",
      text: "Test passed: total([]) -> 0; total([1,2,3]) -> 6. Well done!",
      time: "10:18 PM"
    }
  ];


  // Helper to handle smooth scrolls
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#06080e] text-[#94a3b8] font-sans selection:bg-blue-500/25 overflow-x-hidden relative">
      
      {/* Background Glows for Subtle Depth */}
      <div className="absolute top-[-5%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/10 to-indigo-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-blue-500/5 to-purple-500/10 blur-[150px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#06080e]/95 backdrop-blur-md border-b border-slate-900">
        {/* Main Nav Bar */}
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#60a5fa] to-[#2563eb] flex items-center justify-center font-sans font-black text-[#0c1222] text-[13px] select-none shadow-sm shadow-blue-500/10">
              FA
            </div>
            <span className="font-bold text-white text-sm tracking-wide">Fraylon Academy</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-350">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#ff6b35] transition-colors cursor-pointer tracking-wider">HOME</button>
            
            {/* PROGRAMS WITH DROPDOWN */}
            <div 
              className="relative" 
              onMouseEnter={() => setProgramsDropdownOpen(true)}
              onMouseLeave={() => setProgramsDropdownOpen(false)}
            >
              <button className="hover:text-[#ff6b35] transition-colors cursor-pointer flex items-center gap-1 tracking-wider uppercase">
                PROGRAMS
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {programsDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-48 bg-[#0c1222] border border-slate-800 rounded-lg shadow-xl py-2 z-50"
                  >
                    <button onClick={() => scrollToSection("paths")} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#121829] hover:text-[#ff6b35] font-semibold transition-colors">
                      Python Programming
                    </button>
                    <button onClick={() => scrollToSection("paths")} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#121829] hover:text-[#ff6b35] font-semibold transition-colors">
                      Artificial Intelligence
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            <Link to="/register" className="hover:text-[#ff6b35] transition-colors tracking-wider">FRAYLON APP</Link>
            <button onClick={() => scrollToSection("why-fraylon")} className="hover:text-[#ff6b35] transition-colors cursor-pointer tracking-wider">ABOUT US</button>
            <button onClick={() => scrollToSection("outcomes")} className="hover:text-[#ff6b35] transition-colors cursor-pointer tracking-wider">BLOG</button>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-[#ff6b35] transition-colors tracking-wider">
              LOG IN
            </Link>
            <Link to="/register" className="px-5 py-2.5 rounded-lg bg-[#ff6b35] hover:bg-[#e0531f] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/10 active:scale-[0.98] tracking-wider">
              START LEARNING
            </Link>
          </div>

          {/* Hamburger button */}
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
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
            className="fixed inset-x-0 top-0 z-50 bg-[#0c1222] border-b border-slate-900 p-6 flex flex-col gap-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#60a5fa] to-[#2563eb] flex items-center justify-center font-sans font-black text-[#0c1222] text-[11px] select-none">
                  FA
                </div>
                <span className="font-bold text-white text-xs tracking-wide">Fraylon Academy</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-450 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 text-xs font-bold text-slate-300">
              <button onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left hover:text-[#ff6b35] transition-colors">HOME</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection("paths"); }} className="text-left hover:text-[#ff6b35] transition-colors">PROGRAMS</button>

              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#ff6b35] transition-colors">FRAYLON APP</Link>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection("why-fraylon"); }} className="text-left hover:text-[#ff6b35] transition-colors">ABOUT US</button>
              <button onClick={() => { setMobileMenuOpen(false); scrollToSection("outcomes"); }} className="text-left hover:text-[#ff6b35] transition-colors">BLOG</button>
            </nav>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-900">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-900">
                LOG IN
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-[#ff6b35] rounded-lg text-xs font-bold text-white shadow-sm hover:bg-[#e0531f]">
                START LEARNING
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Hero Section - NIMBUS */}
      <section id="nimbus-section" className="relative w-full bg-black py-20 overflow-hidden border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left: Brand logo, tagline & CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start text-left space-y-6"
          >
            
            {/* Fraylon Academy Logo/Brand */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#2563eb] flex items-center justify-center font-sans font-black text-[#0c1222] text-lg shadow-lg shadow-blue-500/15 select-none">
                  FA
                </div>
                <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
                  Fraylon <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#ff6b35]">Academy</span>
                </span>
              </div>
              
              {/* Tagline */}
              <h2 className="text-slate-300 text-2xl md:text-3xl font-bold tracking-normal pt-4 font-sans">
                Learn. Build. Grow.
              </h2>
            </div>

            {/* CTA LEARN MORE */}
            <button 
              onClick={() => scrollToSection("paths")} 
              className="px-8 py-3.5 bg-[#ff6b35] hover:bg-[#e0531f] text-white text-xs font-extrabold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98] cursor-pointer"
            >
              LEARN MORE
            </button>
          </motion.div>

          {/* Right: Laptop template builder mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative w-full flex flex-col items-center"
          >
            {/* Glowing background */}
            <div className="absolute -top-10 w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Laptop Screen */}
            <div 
              onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % 3)}
              className="relative w-full aspect-[1.6] bg-[#0c101b] rounded-t-2xl border-4 border-[#1e293b] p-2 flex flex-col overflow-hidden shadow-2xl cursor-pointer select-none"
            >
              {/* Top Camera notches */}
              <div className="absolute top-0 inset-x-0 h-4 bg-[#121829] flex items-center justify-center border-b border-slate-900/50 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              </div>

              {/* Slider Viewport Container */}
              <div className="relative w-full h-full overflow-hidden mt-2 flex-1">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentHeroSlide}
                    initial={{ x: 150, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -150, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full h-full flex flex-col"
                  >
                    {currentHeroSlide === 0 && (
                      <div className="w-full h-full bg-[#0c101b] rounded-lg overflow-hidden flex flex-col text-slate-350 font-sans p-3 relative text-left">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                          <h3 className="text-[11px] md:text-[12px] font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">+</span>
                            Create a Workspace
                          </h3>
                          <div className="relative w-32" onClick={(e) => e.stopPropagation()}>
                            <Search className="w-2.5 h-2.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input 
                              type="text" 
                              placeholder="Search template..." 
                              disabled 
                              className="w-full bg-[#121829] border border-slate-900 rounded py-0.5 pl-6 pr-2 text-[8px] text-slate-400 placeholder-slate-650 focus:outline-none" 
                            />
                          </div>
                        </div>

                        {/* Categories & Interactive Slideshow */}
                        <div className="flex-1 flex overflow-hidden pt-2 gap-2">
                          {/* Left Sidebar categories mapping to inner slides */}
                          <div className="w-1/4 flex flex-col gap-1 pr-1.5 border-r border-slate-900 text-[8px] md:text-[9.5px] font-bold text-slate-500">
                            {[
                              { name: "All", idx: 0 },
                              { name: "Backend", idx: 0 },
                              { name: "Frontend", idx: 1 },
                              { name: "Database", idx: 2 }
                            ].map((category) => (
                              <button 
                                key={category.name} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInnerSlideIndex(category.idx);
                                }}
                                className={`w-full text-left px-1.5 py-1 rounded transition-colors ${innerSlideIndex === category.idx ? 'bg-blue-950/40 text-blue-400' : 'hover:bg-[#121829]/60 hover:text-slate-350'}`}
                              >
                                {category.name}
                              </button>
                            ))}
                          </div>

                          {/* Inner Slide Showcase */}
                          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
                            {/* The Mockup Image representing Fraylon */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setInnerSlideIndex((prev) => (prev + 1) % 3);
                              }}
                              className="flex-1 relative rounded border border-slate-900 bg-slate-950 overflow-hidden group/image cursor-pointer"
                            >
                              {innerSlideIndex === 0 && (
                                <img 
                                  src={`${import.meta.env.BASE_URL}static/images/fraylon_compiler.png`} 
                                  alt="Fraylon Compiler Workspace" 
                                  className="w-full h-full object-cover animate-fadeIn"
                                />
                              )}
                              {innerSlideIndex === 1 && (
                                <img 
                                  src={`${import.meta.env.BASE_URL}static/images/fraylon_mentor.png`} 
                                  alt="Fraylon AI Mentor" 
                                  className="w-full h-full object-cover animate-fadeIn"
                                />
                              )}
                              {innerSlideIndex === 2 && (
                                <img 
                                  src={`${import.meta.env.BASE_URL}static/images/fraylon_portfolio.png`} 
                                  alt="Fraylon Portfolios" 
                                  className="w-full h-full object-cover animate-fadeIn"
                                />
                              )}

                              {/* Manual Slide navigation arrows */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInnerSlideIndex((prev) => (prev === 0 ? 2 : prev - 1));
                                }}
                                className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-[10px] opacity-0 group-hover/image:opacity-100 transition-opacity border border-slate-800"
                              >
                                ‹
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInnerSlideIndex((prev) => (prev === 2 ? 0 : prev + 1));
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-[10px] opacity-0 group-hover/image:opacity-100 transition-opacity border border-slate-800"
                              >
                                ›
                              </button>
                            </div>

                            {/* 1 line about it caption bar */}
                            <div className="mt-1 py-0.5 px-1.5 rounded bg-[#090d16] border border-slate-900 flex items-center text-[7px] md:text-[8.5px]">
                              <span className="font-medium text-slate-350 truncate">
                                {innerSlideIndex === 0 && "Interactive Compiler: Compile Python and AI scripts inline with test verification."}
                                {innerSlideIndex === 1 && "Socratic Mentor: Get logic prompts and suggestions directly inside the workspace."}
                                {innerSlideIndex === 2 && "Verified Portfolios: Showcase badges, certificates, and runnable project portfolios."}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentHeroSlide === 1 && (
                      <div className="w-full h-full bg-[#080a11] rounded-lg overflow-hidden flex flex-col text-slate-350 font-mono p-4 relative text-[10px] md:text-[11px] leading-relaxed text-left">
                        {/* Tab header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-3">
                          <div className="flex items-center gap-1.5 text-slate-450 font-semibold">
                            <FileCode className="w-3.5 h-3.5 text-blue-400" />
                            <span>fuel.py</span>
                          </div>
                          <div className="bg-[#121622] rounded px-2 py-0.5 text-[8px] text-slate-500 border border-slate-900 select-none">
                            Workspace Compiler Active
                          </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-y-auto space-y-1 text-slate-300">
                          <div><span className="text-blue-450">def</span> <span className="text-yellow-400">main</span>():</div>
                          <div className="pl-4">fraction = get_fraction(<span className="text-orange-400">"Fraction: "</span>)</div>
                          <div className="pl-4"><span className="text-yellow-400">print</span>(f<span className="text-orange-400">{"\"{fraction}%\""}</span>)</div>
                          <div className="pt-2"><span className="text-blue-450">def</span> <span className="text-yellow-400">get_fraction</span>(prompt):</div>
                          <div className="pl-4"><span className="text-blue-450">while</span> <span className="text-purple-400">True</span>:</div>
                          <div className="pl-8 text-slate-500"><span className="text-blue-450">try</span>:</div>
                          <div className="pl-12">val = <span className="text-yellow-400">input</span>(prompt)</div>
                          <div className="pl-12">x, y = val.split(<span className="text-orange-400">'/'</span>)</div>
                        </div>

                        {/* Compiler Output */}
                        <div className="mt-3 pt-2 border-t border-slate-900 text-[8.5px] md:text-[9.5px] text-green-400 flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span>Compiler Status: Ready | All tests passed (2/2)</span>
                        </div>
                      </div>
                    )}

                    {currentHeroSlide === 2 && (
                      <div className="w-full h-full bg-[#07090e] rounded-lg overflow-hidden flex flex-col text-slate-350 font-sans p-4 relative text-[10px] md:text-[11px] leading-relaxed text-left">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-3">
                          <div className="flex items-center gap-1.5 text-slate-450 font-bold">
                            <Brain className="w-3.5 h-3.5 text-purple-450 animate-pulse" />
                            <span>Socratic AI Assistant</span>
                          </div>
                        </div>

                        {/* Conversation bubbles */}
                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                          <div className="bg-[#121622]/40 rounded-lg p-2.5 border border-slate-900">
                            <div className="text-[8px] font-bold text-slate-500 uppercase">Your Question</div>
                            <p className="text-slate-300 mt-0.5">"My fraction code crashes when y is zero. How do I fix it?"</p>
                          </div>

                          <div className="bg-blue-950/15 rounded-lg p-2.5 border border-blue-500/10">
                            <div className="text-[8px] font-bold text-blue-450 uppercase">AI Mentor Suggestion</div>
                            <p className="text-slate-300 mt-0.5">"Think about what exception y = 0 causes in Python? Wrap your input logic in try-except and catch ZeroDivisionError."</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          {/* Laptop Base (Keyboard Part) */}
          <div className="relative w-[112%] h-3.5 bg-[#475569] rounded-b-xl shadow-xl flex items-center justify-center border-t border-slate-600 z-20">
            <div className="w-16 h-1 bg-[#1e293b] rounded-full absolute -top-0.5"></div>
            <div className="absolute bottom-[-2px] w-[90%] h-1 bg-[#334155] rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* Carousel caption */}
      <div className="flex flex-col items-center mt-8 justify-center z-10 relative">
        {/* Caption */}
        <p className="text-slate-400 text-[10.5px] font-sans text-center max-w-lg h-4 transition-all">
          {currentHeroSlide === 0 && "Platform Showcase: Explore Fraylon's features, including the Interactive compiler, AI mentor, and verified developer portfolios. (Click screen to slide)"}
          {currentHeroSlide === 1 && "Interactive Compiler: Write and compile code directly inside browser compilers right next to lecture notes. (Click screen to slide)"}
          {currentHeroSlide === 2 && "Socratic AI Mentor: Get interactive prompts and hints on logic checks without copy-pasting code. (Click screen to slide)"}
        </p>
      </div>
      </section>

      {/* 2. Learning Paths (Question: What can I learn?) */}
      <section id="paths" className="py-24 max-w-6xl mx-auto px-6 relative border-t border-slate-900/60">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold font-mono">Curriculum</h2>
          <p className="text-3xl font-extrabold text-white tracking-tight mt-2 font-sans">
            What can I learn?
          </p>
          <p className="text-sm text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">
            Discover our practical learning paths and start coding instantly. Each path contains structured lectures, quiz checkpoints, and capstone projects.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Path 1: Python */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 border border-slate-900 bg-gradient-to-b from-[#090d16] to-[#06080e] rounded-2xl text-left flex flex-col justify-between hover:border-slate-800 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:border-blue-500/30 transition-all">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">Beginner</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-850 text-slate-400">14 Lectures</span>
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors font-sans">Python Programming</h4>
                <p className="text-[10px] text-slate-500 mt-1">Language: Python • Interactive Sandbox Active</p>
              </div>
              <div className="space-y-2.5">
                <p className="text-xs text-slate-450 leading-relaxed">
                  Start from scratch. Master variables, loops, conditional statement branching, exceptions, functions, dictionaries, and persistent File I/O by building scripts.
                </p>
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Key Topics Covered:</span>
                  <div className="flex flex-wrap gap-1.5 text-[9px] text-slate-400">
                    {["Variables & Types", "Conditional Logic", "While/For Loops", "Exceptions Syntax", "File I/O", "OOP Classes", "Grade Tracker Capstone"].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-[#0c1017] border border-slate-900">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Link to="/courses" className="mt-6 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-550 hover:to-indigo-600 text-center text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow-[0_4px_15px_rgba(37,99,235,0.2)]">
              Start Python Path
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Path 2: AI */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 border border-slate-900 bg-gradient-to-b from-[#0f0916] to-[#06080e] rounded-2xl text-left flex flex-col justify-between hover:border-slate-800 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-center justify-center group-hover:bg-purple-650/10 group-hover:border-purple-500/30 transition-all">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-450">Advanced</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-850 text-slate-400">7 Lectures</span>
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors font-sans">Artificial Intelligence (AI)</h4>
                <p className="text-[10px] text-slate-500 mt-1">Language: Python • Advanced AI Concepts</p>
              </div>
              <div className="space-y-2.5">
                <p className="text-xs text-slate-455 leading-relaxed">
                  Harvard's Intro to AI. Dive deep into search optimization (DFS, BFS, A*), adversarial search, probability, neural network classification models, and NLP parser processing.
                </p>
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Key Topics Covered:</span>
                  <div className="flex flex-wrap gap-1.5 text-[9px] text-slate-400">
                    {["DFS & BFS Search", "A* Optimization", "Adversarial Minimax", "Probability Filters", "Neural Networks", "NLP Parsing", "Game AI Capstones"].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-[#0c1017] border border-slate-900">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Link to="/courses" className="mt-6 w-full py-2.5 bg-[#141824] border border-slate-850 hover:bg-[#181d2c] hover:border-slate-800 text-center text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1">
              Start AI Path
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. Why Fraylon Academy (Question: Why should I care?) */}
      <section id="why-fraylon" className="py-24 max-w-6xl mx-auto px-6 border-t border-slate-900/60 relative">
        <div className="grid md:grid-cols-12 gap-12 items-center max-w-5xl mx-auto text-left">
          {/* Left: Headline & Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="md:col-span-5 space-y-6"
          >
            <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold font-mono">Why Fraylon</h2>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight font-sans">
              Build Skills Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#ff6b35] font-sans font-extrabold">Learning, Practice, and Projects</span>
            </h3>
            <div className="w-20 h-1 bg-blue-500" />
            <p className="text-slate-400 text-sm leading-relaxed font-sans">
              Learning technology is not just about watching lessons—it's about applying knowledge, solving problems, and creating real projects.
            </p>
            <p className="text-slate-450 text-xs leading-relaxed font-sans">
              Fraylon Academy helps learners develop practical Python and Artificial Intelligence skills through structured learning paths, hands-on exercises, assessments, and project-based learning. By combining guided instruction with active practice, learners can track their progress, showcase their achievements, and build confidence through real-world implementation.
            </p>
          </motion.div>

          {/* Right: SVG Graphs */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="md:col-span-7 grid grid-cols-2 gap-6 items-end bg-[#07090f]/60 p-6 rounded-2xl border border-slate-900 relative"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            
            {/* Graph 1: Inadequate Employability */}
            <div className="space-y-4">
              <div className="text-left">
                <h4 className="text-[11px] font-bold text-red-500 uppercase tracking-wide font-mono">Regular Education</h4>
                <p className="text-[9.5px] text-slate-500 mt-1 leading-normal font-sans">Timeline leading to inadequate skills</p>
              </div>
              <div className="relative h-44 border-l border-b border-slate-800 pb-2 pl-2">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="#101524" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#101524" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="#101524" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  {/* Red sagging curve */}
                  <path
                    d="M 0 65 Q 25 80, 50 65 T 100 25"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Points on curve */}
                  <circle cx="0" cy="65" r="2" fill="#ef4444" />
                  <circle cx="33" cy="74" r="2" fill="#ef4444" />
                  <circle cx="66" cy="55" r="2" fill="#ef4444" />
                  <circle cx="100" cy="25" r="2.5" fill="#ef4444" />
                </svg>
                {/* X-axis Labels */}
                <div className="flex justify-between text-[8px] font-mono text-slate-600 mt-1.5 px-0.5">
                  <span>1st Yr</span>
                  <span>2nd Yr</span>
                  <span>3rd Yr</span>
                  <span>4th Yr</span>
                </div>
              </div>
            </div>

            {/* Graph 2: Fraylon Influenced */}
            <div className="space-y-4">
              <div className="text-left">
                <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wide font-mono">Fraylon Influenced</h4>
                <p className="text-[9.5px] text-slate-500 mt-1 leading-normal font-sans">Education timeline leading to placement</p>
              </div>
              <div className="relative h-44 border-l border-b border-slate-800 pb-2 pl-2">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="#101524" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#101524" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="#101524" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  {/* Blue line shooting up */}
                  <path
                    d="M 0 85 L 33 60 L 66 35 L 100 10"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Target Point */}
                  <circle cx="100" cy="10" r="4.5" fill="#f97316" className="animate-ping" />
                  <circle cx="100" cy="10" r="3.5" fill="#f97316" />
                  <circle cx="0" cy="85" r="2" fill="#3b82f6" />
                  <circle cx="33" cy="60" r="2" fill="#3b82f6" />
                  <circle cx="66" cy="35" r="2" fill="#3b82f6" />
                </svg>
                {/* X-axis Labels */}
                <div className="flex justify-between text-[8px] font-mono text-slate-600 mt-1.5 px-0.5">
                  <span>1st Yr</span>
                  <span>2nd Yr</span>
                  <span>3rd Yr</span>
                  <span>4th Yr</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Problems We Address & How We Address (id="how-it-works") */}
      <section id="how-it-works" className="py-24 bg-[#0d121f]/5 border-y border-slate-900/60 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto text-left relative z-10">
            {/* Left Column: Challenges */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-xs uppercase tracking-widest text-red-500 font-bold font-mono">CHALLENGES LEARNERS FACE</h2>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed font-sans">
                  Many learners struggle to convert knowledge into practical skills. Fraylon Academy is designed to solve the most common learning challenges through structured, hands-on education.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    num: "1",
                    title: "Learning Without Application",
                    desc: "Many courses focus heavily on theory, leaving learners with limited opportunities to practice and build confidence."
                  },
                  {
                    num: "2",
                    title: "Unstructured Learning Paths",
                    desc: "Jumping between videos, tutorials, and articles often creates confusion and slows progress."
                  },
                  {
                    num: "3",
                    title: "Passive Learning Habits",
                    desc: "Watching content alone is not enough. Learners need consistent practice, feedback, and project-based experience."
                  },
                  {
                    num: "4",
                    title: "Lack of Progress Visibility",
                    desc: "Without clear milestones, certificates, and achievements, it is difficult to measure growth and stay motivated."
                  }
                ].map((c) => (
                  <div key={c.num} className="p-5 rounded-xl border border-red-500/10 bg-[#07090f]/90 hover:border-slate-800 transition-all flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center font-mono font-bold text-red-400 shrink-0">
                      {c.num}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-white tracking-wider font-mono">{c.title}</h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-sans">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Solutions */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold font-mono">HOW FRAYLON ADDRESSES THEM</h2>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed font-sans">
                  We replace passive consumption with an active, project-driven sandbox platform built for real engineering skills.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Structured Python & AI Learning",
                    desc: "Follow carefully designed learning paths focused on practical Python programming and Artificial Intelligence concepts."
                  },
                  {
                    title: "Hands-On Coding Experience",
                    desc: "Write, run, and test code directly within interactive learning environments instead of only watching tutorials.",
                    highlight: true
                  },
                  {
                    title: "Project-Based Skill Development",
                    desc: "Apply concepts through real exercises, assessments, and projects that reinforce understanding."
                  },
                  {
                    title: "Progress Tracking & Achievement System",
                    desc: "Track completed lessons, certificates, projects, skills gained, milestones, and learning streaks in one place."
                  }
                ].map((s) => (
                  <div 
                    key={s.title} 
                    className={`p-5 rounded-xl border transition-all flex gap-4 ${
                      s.highlight 
                        ? 'border-blue-500/25 bg-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.15)] text-white' 
                        : 'border-blue-500/10 bg-[#07090f]/90 hover:border-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      s.highlight ? 'bg-white/20 text-white' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    }`}>
                      <Check className="w-4 h-4 font-bold" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">{s.title}</h4>
                      <p className={`text-[11px] leading-relaxed font-sans ${s.highlight ? 'text-blue-100' : 'text-slate-450'}`}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Integrated Transformation Model sub-layout */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto pt-24 border-t border-slate-900/60 mt-20 text-left">
            {/* Left: Node Diagram */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative w-[340px] h-[340px] mx-auto shrink-0 select-none"
            >
              {/* SVG Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 340">
                <line x1="80" y1="170" x2="220" y2="70" stroke="#1e293b" strokeWidth="2" />
                <line x1="80" y1="170" x2="270" y2="170" stroke="#1e293b" strokeWidth="2" />
                <line x1="80" y1="170" x2="220" y2="270" stroke="#1e293b" strokeWidth="2" />
              </svg>

              {/* Central Node: Fraylon */}
              <div className="absolute left-2 top-[120px] w-24 h-24 rounded-full border-4 border-blue-500/35 bg-[#07090f] flex flex-col items-center justify-center z-10 shadow-2xl">
                <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider">ACADEMY</span>
                <span className="font-extrabold text-white text-[12px] tracking-tight">Fraylon</span>
              </div>

              {/* Top Node: ENGAGE */}
              <div className="absolute left-[170px] top-[30px] flex items-center gap-2">
                <div className="w-16 h-16 rounded-full border-2 border-slate-800 bg-[#07090f] flex items-center justify-center text-orange-400 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500 font-bold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">ENGAGE</span>
                </div>
              </div>

              {/* Right Node: FACILITATE */}
              <div className="absolute left-[220px] top-[135px] flex items-center gap-2">
                <div className="w-16 h-16 rounded-full border-2 border-slate-800 bg-[#07090f] flex items-center justify-center text-blue-400 shadow-md">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-orange-500 font-bold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">FACILITATE</span>
                </div>
              </div>

              {/* Bottom Node: ELEVATE */}
              <div className="absolute left-[170px] bottom-[30px] flex items-center gap-2">
                <div className="w-16 h-16 rounded-full border-2 border-slate-800 bg-[#07090f] flex items-center justify-center text-purple-400 shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500 font-bold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">ELEVATE</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Transformation text description */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold font-mono">The Fraylon Learning Framework</h2>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight font-sans">
                Build skills through a structured journey of learning, practice, project development, and measurable progress.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-sans">
                Fraylon Academy helps learners move beyond passive content consumption by combining guided learning paths, hands-on coding, assessments, and real-world projects into a single learning experience.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => scrollToSection("paths")}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-[#ff6b35] hover:from-blue-550 hover:to-[#e0531f] text-white rounded-lg font-semibold text-xs transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1.5"
                >
                  Explore the Learning Framework <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Learner Profile Showcase (Question: How do I prove it?) */}
      <section id="profile-showcase" className="py-24 max-w-6xl mx-auto px-6 border-t border-slate-900/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Learner Profile</h2>
          <p className="text-3xl font-extrabold text-white tracking-tight mt-2 font-sans">
            Build a Portfolio That Reflects Your Growth
          </p>
          <p className="text-sm text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">
            Document your learning journey through certificates, completed projects, skills gained, and progress milestones—all accessible from your personal learner profile.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
          {/* Profile sidebar controller */}
          <div className="bg-[#07090f]/90 border border-slate-900 rounded-2xl p-4 space-y-2">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block px-2 mb-2">Profile Sections</span>
            {[
              { id: "certificates", label: "Certificates", desc: "Earned course certificates and accomplishments" },
              { id: "skills", label: "Skills & Competencies", desc: "Skills gained through completed learning paths" },
              { id: "projects", label: "Projects", desc: "Projects built during your learning journey" },
              { id: "timeline", label: "Learning Timeline", desc: "Track completed courses, projects, and milestones" },
              { id: "achievements", label: "Achievements & Milestones", desc: "Milestones and learning achievements earned" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setProfileTab(t.id as any)}
                className={`w-full flex flex-col items-start px-4 py-3 rounded-xl transition-all ${
                  profileTab === t.id
                    ? "bg-blue-600/10 border-l-2 border-blue-500 text-white"
                    : "text-slate-455 hover:bg-[#10141f]/30 border-l-2 border-transparent"
                }`}
              >
                <span className="text-xs font-bold font-sans">{t.label}</span>
                <span className="text-[9.5px] text-slate-500 mt-0.5">{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Interactive Profile Widget Box */}
          <div className="lg:col-span-2 bg-[#07090f]/90 border border-slate-900 rounded-2xl p-6 shadow-2xl min-h-[300px] text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" />
            
            <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center font-bold text-xs text-white">
                FL
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Fraylon Learner</h4>
                <p className="text-[10px] text-slate-500">Learner Profile • Active Student</p>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="mt-6">
              {profileTab === "certificates" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0b0e17] border border-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Python Programming</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Completed: May 12, 2026 • 14 Lectures</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded">Certificate Earned</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0b0e17] border border-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Artificial Intelligence</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Completed: Jun 04, 2026 • 7 Lectures</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded">Certificate Earned</span>
                  </div>
                </div>
              )}

              {profileTab === "skills" && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { skill: "Python Syntax & Loops", level: "100%" },
                    { skill: "Exception Handling", level: "100%" },
                    { skill: "File I/O Parsing", level: "95%" },
                    { skill: "Regular Expressions (Regex)", level: "90%" },
                    { skill: "Graph Search (BFS/DFS/A*)", level: "85%" },
                    { skill: "Object-Oriented Programming", level: "92%" }
                  ].map((s) => (
                    <div key={s.skill} className="p-3 bg-[#0b0e17] border border-slate-900 rounded-xl">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-semibold text-slate-300">{s.skill}</span>
                        <span className="font-mono text-blue-400 font-bold">{s.level}</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full" style={{ width: s.level }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profileTab === "projects" && (
                <div className="space-y-3">
                  {[
                    { name: "grade_tracker.py", path: "python/capstone", status: "PASSED", tests: "12/12" },
                    { name: "numb3rs.py", path: "python/regular_expressions", status: "PASSED", tests: "8/8" },
                    { name: "fuel.py", path: "python/exceptions", status: "PASSED", tests: "6/6" },
                    { name: "degrees.py", path: "ai/search", status: "PASSED", tests: "15/15" }
                  ].map((p) => (
                    <div key={p.name} className="p-3 bg-[#0b0e17] border border-slate-900 rounded-xl flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-blue-450" />
                        <div>
                          <span className="text-white font-semibold text-[11px]">{p.name}</span>
                          <span className="text-[9px] text-slate-500 block">{p.path}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-slate-455">{p.tests} Tests</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 font-bold">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profileTab === "timeline" && (
                <div className="space-y-4 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                  {[
                    { date: "May 10", title: "Completed Lecture 14: Grade Tracker Capstone", desc: "Submitted grade_tracker.py and passed all 12 test assertions." },
                    { date: "May 06", title: "Passed Regular Expressions Quiz", desc: "Answered 10/10 concepts correctly on regex boundary checks." },
                    { date: "Apr 28", title: "Completed Lecture 3: Exceptions Checkpoint", desc: "Fixed try/except blocks to handle ValueError and ZeroDivisionError inputs." }
                  ].map((t) => (
                    <div key={t.title} className="relative space-y-1">
                      <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#07090f]" />
                      <div className="text-[10px] text-slate-500 font-mono">{t.date}</div>
                      <h6 className="text-xs font-bold text-white leading-tight">{t.title}</h6>
                      <p className="text-[10.5px] text-slate-450 leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {profileTab === "achievements" && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "First Step", badge: "FS", desc: "First script compiled" },
                    { name: "Pythonista", badge: "PY", desc: "Completed 14 python lectures" },
                    { name: "Streak Star", badge: "ST", desc: "7-day study streak" }
                  ].map((a) => (
                    <div key={a.name} className="p-3 bg-[#0b0e17] border border-slate-900 rounded-xl text-center space-y-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-450 font-bold text-xs font-mono">
                        {a.badge}
                      </div>
                      <h6 className="text-[11px] font-bold text-white">{a.name}</h6>
                      <p className="text-[9px] text-slate-500 leading-normal">{a.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Guided Learning Section (id="mentorship") */}
      <section id="mentorship" className="py-24 bg-[#0d121f]/5 border-t border-slate-900/60 relative">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold font-mono">GUIDED LEARNING</h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans">
              Learn With Confidence
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fraylon Academy combines structured lessons, practical exercises, assessments, and progress tracking to help learners stay on track throughout their learning journey.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex gap-3 font-sans">
                <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Structured Learning Paths</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Follow a clear roadmap designed to help you master Python and Artificial Intelligence step by step.</p>
                </div>
              </div>
              <div className="flex gap-3 font-sans">
                <div className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <Code className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Hands-On Practice</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Apply concepts through coding exercises, quizzes, and practical learning activities.</p>
                </div>
              </div>
              <div className="flex gap-3 font-sans">
                <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Project-Based Learning</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Build projects that reinforce concepts and help demonstrate your growing skills.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Dialogue Simulator */}
          <div className="bg-[#10141d] rounded-2xl border border-slate-800 p-1.5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex flex-col md:flex-row gap-2.5 relative min-h-[380px] max-w-xl mx-auto w-full backdrop-blur-sm">
            
            {/* Mock IDE Side */}
            <div className="flex-1 bg-[#07090e] border border-slate-850 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-3">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-mono text-slate-300">total.py</span>
                </div>
                {/* Syntax Highlighted Code Viewer */}
                <div className="font-mono text-[10px] space-y-1 select-none">
                  <div>
                    <span className="text-blue-450">def </span>
                    <span className="text-yellow-400">total</span>
                    <span className="text-slate-300">(numbers):</span>
                  </div>
                  
                  {/* Dynamic Code lines depending on step */}
                  {chatStep < 2 ? (
                    <>
                      <div className="pl-4">
                        <span className="text-blue-450">for </span>
                        <span className="text-slate-300">n </span>
                        <span className="text-blue-450">in </span>
                        <span className="text-slate-300">numbers:</span>
                      </div>
                      <div className="pl-8 bg-red-950/25 border-l-2 border-red-500 py-0.5">
                        <span className="text-slate-300">sum = </span>
                        <span className="text-purple-400">0</span>
                        <span className="text-slate-400 font-semibold ml-2"># Bug: local scope reset</span>
                      </div>
                      <div className="pl-8">
                        <span className="text-slate-300">sum = sum + n</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pl-4 bg-green-950/25 border-l-2 border-green-500 py-0.5">
                        <span className="text-slate-300">sum = </span>
                        <span className="text-purple-400">0</span>
                        <span className="text-slate-400 font-semibold ml-2"># Moved outside loop</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-blue-450">for </span>
                        <span className="text-slate-300">n </span>
                        <span className="text-blue-450">in </span>
                        <span className="text-slate-300">numbers:</span>
                      </div>
                      <div className="pl-8">
                        <span className="text-slate-300">sum = sum + n</span>
                      </div>
                    </>
                  )}
                  <div className="pl-4">
                    <span className="text-blue-450">return </span>
                    <span className="text-slate-300">sum</span>
                  </div>
                </div>
              </div>

              {/* Shell check logs */}
              <div className="mt-4 pt-2 border-t border-slate-900 text-[9px] font-mono">
                {chatStep < 4 ? (
                  <div className="text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                    <span>Failed: empty list sum returns None / throws UnboundError</span>
                  </div>
                ) : (
                  <div className="text-green-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    <span>Unit Tests: 5/5 passed. 100% correct.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Side */}
            <div className="w-full md:w-60 flex flex-col justify-between bg-[#080b12] border border-slate-850 rounded-xl p-4 min-h-[280px]">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                <span className="text-[9px] text-slate-500 font-mono font-semibold tracking-wider">Code Feedback</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>

              <div className="flex-1 space-y-3 text-[10.5px] overflow-y-auto max-h-[200px] pr-1">
                {chatStep >= 0 && (
                  <div className="space-y-1">
                    <div className="text-[8px] text-slate-500 font-bold uppercase">Student</div>
                    <div className="p-2 bg-[#10141d] rounded text-slate-300 border border-slate-900/60 leading-normal">
                      {chatDialogue[0].question}
                    </div>
                  </div>
                )}

                {chatStep >= 1 && (
                  <div className="space-y-1">
                    <div className="text-[8px] text-blue-400 font-bold uppercase">Assistant</div>
                    <div className="p-2 bg-blue-950/15 border border-blue-500/10 text-slate-300 rounded leading-relaxed">
                      {chatDialogue[1].text}
                    </div>
                  </div>
                )}

                {chatStep >= 2 && (
                  <div className="space-y-1">
                    <div className="text-[8px] text-slate-500 font-bold uppercase">Student</div>
                    <div className="p-2 bg-[#10141d] rounded text-slate-300 border border-slate-900/60 leading-normal">
                      {chatDialogue[2].question}
                    </div>
                  </div>
                )}

                {chatStep >= 3 && (
                  <div className="space-y-1">
                    <div className="text-[8px] text-blue-400 font-bold uppercase">Assistant</div>
                    <div className="p-2 bg-blue-950/15 border border-blue-500/10 text-slate-300 rounded leading-relaxed">
                      {chatDialogue[3].text}
                    </div>
                  </div>
                )}

                {chatStep >= 4 && (
                  <div className="space-y-1">
                    <div className="text-[8px] text-green-400 font-bold uppercase">Compiler Log</div>
                    <div className="p-2 bg-green-950/10 border border-green-500/15 text-slate-300 rounded leading-relaxed">
                      {chatDialogue[4].text}
                    </div>
                  </div>
                )}
              </div>

              {/* Controls to trigger simulator steps */}
              <div className="mt-4 pt-3 border-t border-slate-900">
                {chatStep < 4 ? (
                  <button
                    onClick={() => setChatStep((prev) => prev + 1)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-550 text-white rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-all"
                  >
                    Next Debug Step
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setChatStep(0)}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded text-[10px] font-semibold transition-all"
                  >
                    Reset Chat Simulation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Learning Outcomes (Question: What will I achieve?) */}
      <section id="outcomes" className="py-24 max-w-6xl mx-auto px-6 border-t border-slate-900/60 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold font-mono">WHAT WILL I ACHIEVE?</h2>
          <p className="text-3xl font-extrabold text-white tracking-tight mt-2 font-sans">
            What You'll Achieve at Fraylon
          </p>
          <p className="text-sm text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">
            Develop practical Python and AI skills through structured learning, hands-on exercises, assessments, and projects.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch">
          {/* Deliverable Competencies */}
          <div className="space-y-6 text-left">
            <h4 className="text-sm font-bold uppercase text-white font-mono tracking-wider border-b border-slate-900 pb-2">Technical Competencies</h4>
            
            {[
              { title: "Python Programming Fundamentals", desc: "Build a strong foundation in Python including variables, functions, loops, data structures, object-oriented programming, and problem-solving." },
              { title: "Data Handling & Automation", desc: "Work with files, CSV data, APIs, and automation workflows to solve real-world tasks efficiently." },
              { title: "Artificial Intelligence Concepts", desc: "Learn core AI concepts, machine learning fundamentals, intelligent systems, and practical AI applications." },
              { title: "Project Development Skills", desc: "Apply your knowledge by building projects that strengthen logical thinking, debugging, and software development skills." }
            ].map((outcome, idx) => (
              <div key={idx} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-455 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white font-mono tracking-wide">{outcome.title}</h5>
                  <p className="text-[11px] text-slate-450 mt-1 leading-relaxed">{outcome.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right side: ByteXL Style Outcome Card */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-[#07090f] text-left space-y-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider border-b border-slate-900 pb-2">LEARNING OUTCOMES</h4>
              <p className="text-[11px] text-slate-455 leading-relaxed font-sans mt-3">
                Our platform is outcome-driven, preparing learners for actual implementation, design, and deployment of intelligent systems.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-2">
              {/* Skills You'll Build */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-bold text-orange-400 uppercase tracking-wider font-mono">Skills You'll Build</h5>
                <ul className="space-y-2 text-[11px] text-slate-300 font-sans">
                  {[
                    "Python Programming",
                    "Problem Solving",
                    "Data Handling",
                    "Artificial Intelligence Fundamentals",
                    "Project Development",
                    "Portfolio Building"
                  ].map((skill) => (
                    <li key={skill} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How You'll Demonstrate Them */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider font-mono">How You'll Demonstrate Them</h5>
                <ul className="space-y-2 text-[11px] text-slate-300 font-sans">
                  {[
                    "Assessments",
                    "Projects",
                    "Certificates",
                    "Learner Profile",
                    "Learning Timeline",
                    "Achievements"
                  ].map((demo) => (
                    <li key={demo} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-450 shrink-0" />
                      <span>{demo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final CTA (Question: What should I do next?) */}

      <section className="py-24 max-w-5xl mx-auto px-6 text-center border-t border-slate-900/60 z-10 relative">
        <div className="space-y-6 py-6">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold font-mono">Onboarding Path</h2>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Start Building Skills That Matter
          </h3>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
            What should I do next? Create your free account today and start your first interactive programming path. Build verified portfolios and showcase your skills.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4">
            <Link to="/register" className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_4px_18px_rgba(37,99,235,0.25)] active:scale-[0.98]">
              Create Account
            </Link>
            <button onClick={() => scrollToSection("paths")} className="w-full sm:w-auto px-6 py-3.5 border border-slate-800 bg-[#0d111a]/40 text-slate-350 hover:text-white rounded-lg font-semibold flex items-center justify-center transition-all cursor-pointer">
              Explore Learning Paths
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-[#06080e]/90 py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-7 gap-8 text-left text-xs">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#60a5fa] to-[#2563eb] flex items-center justify-center font-sans font-black text-[#0c1222] text-[11px] select-none shadow-sm shadow-blue-500/15">
                FA
              </div>
              <span className="font-bold text-white text-sm">Fraylon Academy</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-xs text-[11px]">
              A structured learning platform focused on helping students build practical technology skills through sandboxes, projects, and verified digital credentials.
            </p>
            <div className="text-slate-650 text-[10px] pt-4 font-mono">
              © {new Date().getFullYear()} Fraylon Academy. All rights reserved.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest font-mono">About</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <button onClick={() => scrollToSection("why-fraylon")} className="text-left hover:text-white transition-colors cursor-pointer">Why Fraylon</button>
              <button onClick={() => scrollToSection("who-is-it-for")} className="text-left hover:text-white transition-colors cursor-pointer">Who It's For</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest font-mono">Courses</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <button onClick={() => scrollToSection("paths")} className="text-left hover:text-white transition-colors cursor-pointer">Python Programming</button>
              <button onClick={() => scrollToSection("paths")} className="text-left hover:text-white transition-colors cursor-pointer">AI</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest font-mono">Projects</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <button onClick={() => scrollToSection("profile-showcase")} className="text-left hover:text-white transition-colors cursor-pointer">Capstone Projects</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest font-mono">Community</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <button onClick={() => scrollToSection("mentorship")} className="text-left hover:text-white transition-colors cursor-pointer">Mentorship</button>
              <button onClick={() => scrollToSection("mentorship")} className="text-left hover:text-white transition-colors cursor-pointer">Peer Learning</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest font-mono">Contact</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <a href="mailto:support@fraylon.academy" className="hover:text-[#ff6b35] transition-colors text-left">Support Email</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
