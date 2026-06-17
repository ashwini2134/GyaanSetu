import { Brain, Globe, Database, BookOpen } from 'lucide-react';

export function getCourseIconDetails(courseName: string, category: string) {
  const nameLow = (courseName || '').toLowerCase();
  const catLow = (category || '').toLowerCase();

  // Python Programming (or any python course)
  if (nameLow.includes('python')) {
    return {
      type: 'py-image',
      bgClass: 'bg-[#1a1a2e]',
      borderClass: 'border-[#2D3748]',
      subtitle: ''
    };
  }

  // AI
  if (catLow.includes('artificial intelligence') || nameLow === 'ai' || nameLow.includes(' ai ') || nameLow.endsWith(' ai') || nameLow.startsWith('ai ')) {
    return {
      type: 'ai-image',
      bgClass: 'bg-[#0d1117]',
      borderClass: 'border-[#2D3748]',
      subtitle: ''
    };
  }

  // Web Development
  if (catLow.includes('web development')) {
    return {
      type: 'icon',
      icon: Globe,
      bgClass: 'bg-[#22C55E]/15',
      borderClass: 'border-[#22C55E]/30',
      color: '#22C55E',
      subtitle: 'Web Dev'
    };
  }

  // Database
  if (catLow.includes('database')) {
    return {
      type: 'icon',
      icon: Database,
      bgClass: 'bg-[#F59E0B]/15',
      borderClass: 'border-[#F59E0B]/30',
      color: '#F59E0B',
      subtitle: 'Database'
    };
  }

  // Default fallback
  return {
    type: 'icon',
    icon: BookOpen,
    bgClass: 'bg-[#64748B]/15',
    borderClass: 'border-[#64748B]/30',
    color: '#64748B',
    subtitle: courseName.split(' ')[0]
  };
}

export function DynamicCourseIcon({ courseName, category }: { courseName: string; category: string }) {
  const details = getCourseIconDetails(courseName, category);
  
  if (details.type === 'py-image') {
    return (
      <div className="w-[160px] h-[120px] rounded-[12px] overflow-hidden relative flex items-center justify-center shrink-0 border border-[#2D3748] bg-[#1a1a2e]">
        {/* Faint code editor background graphic */}
        <div className="absolute right-2 top-2 bottom-2 w-1/2 bg-[#0d1117]/50 rounded-lg border border-white/5 flex flex-col p-2 gap-1.5 opacity-60">
          <div className="flex gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
          </div>
          <div className="h-1 w-3/4 bg-blue-400/30 rounded-full"></div>
          <div className="h-1 w-1/2 bg-green-400/30 rounded-full"></div>
          <div className="h-1 w-full bg-slate-500/30 rounded-full"></div>
          <div className="h-1 w-2/3 bg-purple-400/30 rounded-full"></div>
        </div>
        <div className="absolute left-3 bottom-4 text-slate-600/30 font-mono text-2xl font-bold">
          &lt;/&gt;
        </div>
        
        {/* Python Logo */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" 
          alt="Python"
          className="w-[64px] h-[64px] object-contain z-10 drop-shadow-xl"
        />
      </div>
    );
  }

  if (details.type === 'ai-image') {
    return (
      <div className="w-[160px] h-[120px] rounded-[12px] overflow-hidden relative flex items-center px-6 justify-between shrink-0 border border-[#2D3748] bg-[#0d1117]">
        {/* Glowing brain network background */}
        <div className="absolute right-0 top-0 bottom-0 w-3/4 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)]"></div>
          <Brain className="absolute right-2 top-1/2 -translate-y-1/2 w-24 h-24 text-blue-500/20 stroke-[1px]" />
        </div>
        
        <span className="text-white font-extrabold text-[32px] z-10 tracking-tight drop-shadow-md">
          AI
        </span>
        <Brain className="w-10 h-10 text-slate-300 z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div 
        className={`w-[64px] h-[64px] rounded-[16px] flex items-center justify-center border backdrop-blur-[10px] ${details.bgClass} ${details.borderClass}`} 
        style={{ WebkitBackdropFilter: 'blur(10px)' }}
      >
        {details.icon && <details.icon size={32} color={details.color} />}
      </div>
      {details.subtitle && (
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{details.subtitle}</span>
      )}
    </div>
  );
}
