import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Code,
  Award,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  Flame,
  Terminal,
  Sparkle
} from "lucide-react";

// Types for components
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

type PathCardProps = {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  icon: React.ReactNode;
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle the horizontal "How It Works" steps for preview interactivity
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Features list for Section 3 (Learning Experience)
  const features: FeatureCardProps[] = [
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

  // Learning paths for Section 5 (Featured Learning Paths)
  const paths: PathCardProps[] = [
    {
      title: "Python Programming",
      description: "A beginner-friendly introduction to programming with Python — from your first Hello World through variables, conditionals, loops, functions, data structures, file handling, and a mini project.",
      duration: "10 Lessons",
      difficulty: "Beginner",
      icon: <Terminal className="w-6 h-6 text-blue-500" />
    },
    {
      title: "AI",
      description: "Harvard's Introduction to Artificial Intelligence with Python — search algorithms, knowledge representation, uncertainty, optimization, machine learning, and natural language processing.",
      duration: "7 Lessons",
      difficulty: "Advanced",
      icon: <Brain className="w-6 h-6 text-blue-500" />
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
    <div className="w-full min-h-screen bg-[#080b11] text-[#94a3b8] font-sans selection:bg-blue-500/25 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080b11]/80 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Fraylon Academy" className="h-7 w-auto object-contain" />
            <span className="font-bold text-white text-sm tracking-wide">Fraylon Academy</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold">
            <button onClick={() => scrollToSection("why-fraylon")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Why Fraylon</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection("paths")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Paths</button>
            <button onClick={() => scrollToSection("portfolio")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Portfolio</button>
            <button onClick={() => scrollToSection("community")} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Community</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/10 active:scale-[0.98]">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
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
            className="fixed inset-x-0 top-0 z-50 bg-[#080b11] border-b border-slate-900 p-6 flex flex-col gap-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Fraylon Academy" className="h-7 w-auto object-contain" />
                <span className="font-bold text-white text-sm">Fraylon Academy</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 text-sm font-semibold">
              <button onClick={() => scrollToSection("why-fraylon")} className="text-left text-slate-400 hover:text-white transition-colors">Why Fraylon</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left text-slate-400 hover:text-white transition-colors">How It Works</button>
              <button onClick={() => scrollToSection("paths")} className="text-left text-slate-400 hover:text-white transition-colors">Paths</button>
              <button onClick={() => scrollToSection("portfolio")} className="text-left text-slate-400 hover:text-white transition-colors">Portfolio</button>
              <button onClick={() => scrollToSection("community")} className="text-left text-slate-400 hover:text-white transition-colors">Community</button>
            </nav>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-900">
              <Link to="/login" className="w-full text-center py-2 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300">
                Sign In
              </Link>
              <Link to="/register" className="w-full text-center py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-20 flex flex-col items-center text-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/5 px-3 py-1 text-xs text-blue-400 font-semibold mb-6">
          <Sparkle className="w-3 h-3 text-blue-500" />
          Interactive Code Compiler Built In
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl">
          Learn Skills. Build Projects. <br />
          <span className="text-blue-500">Showcase Your Growth.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-slate-400 text-base md:text-lg max-w-3xl mt-6 leading-relaxed">
          Fraylon Academy helps learners gain practical technology skills through structured learning, hands-on projects, certifications, and measurable progress.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]">
            Start Learning
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={() => scrollToSection("paths")} className="w-full sm:w-auto px-6 py-3 border border-slate-800 bg-[#0d111a]/40 hover:bg-[#0d111a]/60 text-slate-300 hover:text-white rounded-lg font-semibold flex items-center justify-center transition-all cursor-pointer">
            Explore Courses
          </button>
        </div>

        {/* Realistic LMS Mockup Visual */}
        <div className="relative mt-16 w-full max-w-4xl rounded-2xl border border-slate-900 bg-[#0d121f] shadow-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>
            <div className="text-[10px] text-slate-500 font-medium tracking-wide bg-[#070b13] px-3 py-0.5 rounded border border-slate-900">
              lms.fraylon.academy
            </div>
            <div className="w-10" />
          </div>

          {/* Clean Dashboard Simulation */}
          <div className="grid grid-cols-4 gap-4 h-[350px] text-left text-xs text-slate-400">
            {/* Sidebar Mock */}
            <div className="col-span-1 border-r border-slate-900/60 pr-4 space-y-2 hidden md:block">
              <div className="px-2 py-1.5 bg-[#141b2e] text-white rounded-md font-semibold flex items-center gap-2 border border-blue-500/20">
                <LayoutIcon className="w-4 h-4 text-blue-500" />
                <span>Dashboard</span>
              </div>
              <div className="px-2 py-1.5 hover:bg-slate-900/40 rounded-md flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Courses</span>
              </div>
              <div className="px-2 py-1.5 hover:bg-slate-900/40 rounded-md flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-500" />
                <span>Certificates</span>
              </div>
              <div className="px-2 py-1.5 hover:bg-slate-900/40 rounded-md flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Leaderboard</span>
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="col-span-4 md:col-span-3 space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#080c14] border border-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-500">Completed Courses</div>
                  <div className="text-base font-bold text-white mt-1">2 / 4 Completed</div>
                </div>
                <div className="p-3 bg-[#080c14] border border-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-500">Learning Streak</div>
                  <div className="text-base font-bold text-white mt-1 flex items-center gap-1">
                    <Flame className="w-4.5 h-4.5 text-blue-500" />
                    4 Days Active
                  </div>
                </div>
                <div className="p-3 bg-[#080c14] border border-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-500">Achievements Unlocked</div>
                  <div className="text-base font-bold text-white mt-1">3 Badges</div>
                </div>
              </div>

              {/* Active Course Progress */}
              <div className="p-4 bg-[#080c14] border border-slate-900 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">In Progress</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">CS50P: Introduction to Programming with Python</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">55% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: "55%" }} />
                </div>
              </div>

              {/* Console Sandbox Mock */}
              <div className="bg-[#070b13] border border-slate-900 rounded-lg p-3 font-mono text-[10px] space-y-2">
                <div className="flex items-center justify-between text-slate-600 border-b border-slate-900 pb-1">
                  <span>python_editor.py</span>
                  <span className="text-[9px] text-blue-500 font-bold">● Active Sandbox</span>
                </div>
                <div className="text-slate-400">
                  <span className="text-blue-400">def</span> <span className="text-blue-200">main</span>():<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;tasks = [<span className="text-green-400">"Learn"</span>, <span className="text-green-400">"Build"</span>, <span className="text-green-400">"Grow"</span>]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">for</span> task <span className="text-blue-400">in</span> tasks:<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print(<span className="text-green-400">f"Step complete: {"{task}"}"</span>)
                </div>
                <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-900 flex items-center justify-between">
                  <span>Console: [1/1] test suite passed successfully</span>
                  <span className="text-blue-500">Run code (Ctrl + Enter)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Why Fraylon Academy */}
      <section id="why-fraylon" className="py-20 max-w-6xl mx-auto px-6 border-t border-slate-900">
        <div className="max-w-2xl text-left mb-12">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Why Fraylon Academy</h2>
          <p className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-2">
            Built for active learning, not passive consumption.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 rounded-xl border border-slate-900 bg-[#0d121f]/40 text-left">
            <h3 className="text-sm font-bold text-white mb-2">Learning by Doing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Skip theoretical slides. Run and compile code instantly inside browser sandboxes configured specifically for each lecture module.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-900 bg-[#0d121f]/40 text-left">
            <h3 className="text-sm font-bold text-white mb-2">Real Projects</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Graduate from basic code syntax. Code complete scripts and applications that are automatically verified using test assertions.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-900 bg-[#0d121f]/40 text-left">
            <h3 className="text-sm font-bold text-white mb-2">Skill Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn digitally signed certificates that reflect true project completion metrics, suitable for professional credentials.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-900 bg-[#0d121f]/40 text-left">
            <h3 className="text-sm font-bold text-white mb-2">Portfolio Building</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically track your completed assignments and projects, rendering them into a clean, public profile for review.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-900 bg-[#0d121f]/40 text-left md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-bold text-white mb-2">Consistent Progress</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build developer routines with built-in daily streaks and milestone indicators that measure actual hands-on coding time.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section id="how-it-works" className="py-20 bg-[#0d121f]/10 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl text-left mb-16">
            <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">How It Works</h2>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-2">
              A structured roadmap to build functional skillsets.
            </p>
          </div>

          {/* Step Timeline */}
          <div className="grid gap-6 lg:grid-cols-5 text-left relative">
            {[
              { num: "01", step: "Learn", desc: "Gain fundamental insights from structured modules designed by tech professionals." },
              { num: "02", step: "Practice", desc: "Validate concepts immediately using code sandboxes built directly in the lessons." },
              { num: "03", step: "Build", desc: "Integrate multiple skills into comprehensive capstone projects that verify functionality." },
              { num: "04", step: "Earn", desc: "Obtain digital credentials that prove your practical ability to write clean code." },
              { num: "05", step: "Showcase", desc: "Organize your milestones into a public developer portfolio to present your work." }
            ].map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeStep === idx
                    ? "border-blue-500 bg-[#0d121f] text-white"
                    : "border-slate-900 bg-[#0d121f]/20 hover:border-slate-800"
                }`}
              >
                <div className={`text-xs font-mono font-bold tracking-widest ${activeStep === idx ? "text-blue-400" : "text-slate-600"}`}>
                  STEP {step.num}
                </div>
                <h4 className="text-sm font-bold mt-2">{step.step}</h4>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Learning Experience */}
      <section className="py-20 max-w-6xl mx-auto px-6 border-t border-slate-900">
        <div className="max-w-2xl text-left mb-12">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Learning Experience</h2>
          <p className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-2">
            The features that power practical technology learning.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 border border-slate-900 bg-[#0d121f]/30 rounded-xl text-left hover:border-slate-850 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#0d121f] border border-slate-900 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h4 className="text-sm font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Learner Portfolio */}
      <section id="portfolio" className="py-20 bg-[#0d121f]/10 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 grid gap-12 lg:grid-cols-2 items-center">
          <div className="text-left space-y-5">
            <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Learner Portfolio</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              Prove your capabilities with a validated public profile.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every course you pass, project you build, and daily streak you maintain updates your student profile. Share a verifiable, clean page that shows recruiters your actual project achievements instead of listing generic bullet points.
            </p>
            
            <ul className="space-y-2 pt-2 text-xs">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Track skills in real-time as you complete validation exercises</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Showcase code files and test logs of completed projects</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Earn crypographically signed certificates with verify codes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Maintain learning streaks to build disciplined study habits</span>
              </li>
            </ul>
          </div>

          {/* Portfolio mockup widget */}
          <div className="p-5 border border-slate-900 bg-[#0d121f] rounded-2xl max-w-sm mx-auto w-full text-left space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-white">
                JD
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">John Doe</h4>
                <p className="text-[10px] text-slate-500">Student Profile • Verified</p>
              </div>
            </div>

            <hr className="border-slate-900" />

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-[9px] text-slate-500 uppercase font-semibold">Technical Streaks</div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-blue-500" />
                  12 Days Coding Habit
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[9px] text-slate-500 uppercase font-semibold">Earned Credentials</div>
                <div className="space-y-1.5">
                  <div className="p-2 bg-[#080c14] border border-slate-900 rounded flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="text-[10px]">
                      <div className="font-semibold text-white">Python Core Certificate</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">Issued June 2026 • Verified</div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#080c14] border border-slate-900 rounded flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="text-[10px]">
                      <div className="font-semibold text-white">Artificial Intelligence</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">Issued June 2026 • Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Featured Learning Paths */}
      <section id="paths" className="py-20 max-w-6xl mx-auto px-6 border-t border-slate-900">
        <div className="max-w-2xl text-left mb-12">
          <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Learning Paths</h2>
          <p className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-2">
            Structured curricula targeting core domains.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {paths.map((path, idx) => (
            <div key={idx} className="p-5 border border-slate-900 bg-[#0d121f]/30 rounded-xl text-left flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#0d121f] border border-slate-900 flex items-center justify-center">
                  {path.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">{path.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">{path.duration} • {path.difficulty}</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">{path.description}</p>
              </div>

              <Link to="/register" className="mt-6 w-full py-2 bg-[#0d121f] border border-slate-800 hover:bg-slate-900 text-center text-white rounded font-medium text-[10px] transition-colors flex items-center justify-center gap-1">
                View Curriculum
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: Community & Growth */}
      <section id="community" className="py-20 bg-[#0d121f]/10 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 grid gap-12 lg:grid-cols-2 items-center">
          <div className="p-5 border border-slate-900 bg-[#0d121f] rounded-2xl max-w-sm mx-auto w-full text-left space-y-3 shadow-xl">
            <div className="text-[10px] text-blue-500 font-bold tracking-wider uppercase">Active Activity log</div>
            
            <div className="space-y-2">
              <div className="p-2.5 bg-[#080c14] border border-slate-900 rounded-lg text-[10px]">
                <div className="flex justify-between font-bold text-white">
                  <span>Mentorship Review</span>
                  <span className="text-slate-500">10m ago</span>
                </div>
                <p className="text-slate-400 mt-1">Review complete: task-solver.py. Feedback logged inside the dashboard.</p>
              </div>

              <div className="p-2.5 bg-[#080c14] border border-slate-900 rounded-lg text-[10px]">
                <div className="flex justify-between font-bold text-white">
                  <span>Peer Discussion</span>
                  <span className="text-slate-500">1h ago</span>
                </div>
                <p className="text-slate-400 mt-1">Alternative list-comprehension method posted for lesson 4.</p>
              </div>
            </div>
          </div>

          <div className="text-left space-y-5">
            <h2 className="text-xs uppercase tracking-widest text-blue-500 font-bold">Community & Growth</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              Collaborate and code with active learners.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gain input on your scripting choices through mentor feedback channels. Share, discuss, and optimize your implementations alongside other students on course dashboards, preparing yourself for professional development settings.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="text-xs font-bold text-white">Mentorship</h4>
                <p className="text-[10px] text-slate-500 mt-1">Ask questions and review scripts with assistant logs.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Peer learning</h4>
                <p className="text-[10px] text-slate-500 mt-1">Discuss optimizations inside lesson discussion panels.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Collaboration</h4>
                <p className="text-[10px] text-slate-500 mt-1">Solve challenges and work together on programming logic.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Career readiness</h4>
                <p className="text-[10px] text-slate-500 mt-1">Showcase clean code portfolios directly to hiring systems.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Call To Action */}
      <section className="py-20 max-w-5xl mx-auto px-6 text-center border-t border-slate-900">
        <div className="space-y-6 py-6">
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            Start Your Learning Journey
          </h3>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
            Build skills that matter through structured learning and hands-on experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4">
            <Link to="/register" className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]">
              Join Fraylon Academy
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => scrollToSection("paths")} className="w-full sm:w-auto px-6 py-3 border border-slate-800 bg-[#0d111a]/40 text-slate-300 hover:text-white rounded-lg font-semibold flex items-center justify-center transition-all cursor-pointer">
              Browse Courses
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#080b11]/80 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-7 gap-8 text-left text-xs">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Fraylon Academy" className="h-7 w-auto object-contain" />
              <span className="font-bold text-white text-sm">Fraylon Academy</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-xs text-[11px]">
              A structured learning platform focused on helping students build practical technology skills through sandboxes, projects, and verified digital credentials.
            </p>
            <div className="text-slate-600 text-[10px] pt-4">
              © {new Date().getFullYear()} Fraylon Academy. All rights reserved.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest">About</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <button onClick={() => scrollToSection("why-fraylon")} className="text-left hover:text-white transition-colors cursor-pointer">Why Fraylon</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left hover:text-white transition-colors cursor-pointer">How It Works</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest">Courses</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <button onClick={() => scrollToSection("paths")} className="text-left hover:text-white transition-colors cursor-pointer">Python Programming</button>
              <button onClick={() => scrollToSection("paths")} className="text-left hover:text-white transition-colors cursor-pointer">AI</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest">Projects</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <button onClick={() => scrollToSection("portfolio")} className="text-left hover:text-white transition-colors cursor-pointer">Capstone Projects</button>
              <button onClick={() => scrollToSection("portfolio")} className="text-left hover:text-white transition-colors cursor-pointer">Interactive Sandboxes</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest">Community</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <button onClick={() => scrollToSection("community")} className="text-left hover:text-white transition-colors cursor-pointer">Mentorship</button>
              <button onClick={() => scrollToSection("community")} className="text-left hover:text-white transition-colors cursor-pointer">Peer Learning</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white tracking-widest">Contact</h4>
            <div className="flex flex-col gap-2 text-slate-500">
              <a href="mailto:support@fraylon.academy" className="hover:text-white transition-colors text-left">Support Email</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-left">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Minimal icons matching dashboard widgets
function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
