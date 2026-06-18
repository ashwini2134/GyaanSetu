import { Link } from "react-router-dom";

export default function FooterSection() {
  return (
    <footer className="bg-[#05050a] border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-sm">
          
          {/* Left: Logo + Tagline */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Fraylon Academy" className="h-6 w-auto object-contain opacity-80" />
              <span className="font-bold text-white tracking-wide">Fraylon Academy</span>
            </div>
            <p className="text-[#6b7280] leading-relaxed">
              Structured learning for real outcomes.
            </p>
          </div>

          {/* Center: Courses */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-widest uppercase">Courses</h4>
            <div className="flex flex-col gap-3 text-[#6b7280]">
              <span className="cursor-default hover:text-white transition-colors">Python Programming</span>
              <span className="cursor-default hover:text-white transition-colors">Artificial Intelligence</span>
            </div>
          </div>

          {/* Right: Platform */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold tracking-widest uppercase">Platform</h4>
            <div className="flex flex-col gap-3 text-[#6b7280]">
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-white transition-colors">Get Started</Link>
            </div>
          </div>

        </div>
        
        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-[#6b7280]">
          <div>
            © {new Date().getFullYear()} Fraylon Academy. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
