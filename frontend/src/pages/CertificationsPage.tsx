import { useNavigate } from 'react-router-dom';
import { Award, LayoutDashboard, Sparkles } from 'lucide-react';

export default function CertificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              <LayoutDashboard size={12} /> Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-medium">Certifications</span>
          </nav>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Award size={28} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Certifications</h1>
              <p className="text-slate-400 text-sm mt-1">Earn certificates by completing courses and projects.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-5">
            <Sparkles size={36} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">Coming Soon</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Complete courses and projects to earn certifications that validate your skills. This feature will showcase your earned credentials here.
          </p>
        </div>
      </div>
    </div>
  );
}
