import type { LessonSection, LectureProgress } from '../../types/lesson';
import ProgressWidget from './ProgressWidget';

interface LessonSidebarProps {
  sections: LessonSection[];
  hasQuiz: boolean;
  hasProblems: boolean;
  hasSummary: boolean;
  activeSection: string;
  progress: LectureProgress;
  onNavigate: (id: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export default function LessonSidebar({
  sections,
  hasQuiz,
  hasProblems,
  hasSummary,
  activeSection,
  progress,
  onNavigate,
}: LessonSidebarProps) {
  const navItems: NavItem[] = [
    ...sections.map((s): NavItem => ({ id: s.id, label: s.label, icon: 'section' })),
    ...(hasQuiz ? [{ id: 'quiz', label: 'Quiz', icon: 'quiz' }] : []),
    ...(hasProblems ? [{ id: 'problems', label: 'Problems', icon: 'problems' }] : []),
    ...(hasSummary ? [{ id: 'summary', label: 'Summary', icon: 'summary' }] : []),
  ];

  const allIds = new Set(['overview', 'quiz', 'problems', 'summary', ...sections.map(s => s.id)]);

  const isVisited = (id: string) => {
    if (!allIds.has(id)) return false;
    return !!progress.sections[id]?.visited;
  };

  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-slate-700/20 flex-col overflow-y-auto hidden md:flex">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Progress */}
        <ProgressWidget progress={progress} totalSections={navItems.length} />

        {/* Navigation */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-2 px-1">
            Lecture Content
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item, i) => {
              const isActive = activeSection === item.id;
              const visited = isVisited(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-300 border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.12)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                    {visited ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                    )}
                    {i < navItems.length - 1 && (
                      <div className={`absolute top-5 left-2.5 w-0.5 h-4 ${visited ? 'bg-green-500/30' : 'bg-slate-700/30'}`} />
                    )}
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
