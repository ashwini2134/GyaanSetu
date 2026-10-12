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
    <aside className="w-[220px] flex-shrink-0 border-r border-[var(--lesson-nav-border)] flex-col overflow-y-auto hidden md:flex">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Progress */}
        <ProgressWidget progress={progress} totalSections={navItems.length} />

        {/* Navigation */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--lesson-nav-header)] mb-2 px-1">
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
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 border ${
                    isActive
                      ? 'bg-[var(--lesson-nav-active-bg)] text-[var(--lesson-nav-text-active)] border-[var(--lesson-nav-active-border)]'
                      : 'text-[var(--lesson-nav-text)] hover:text-[var(--lesson-nav-text-active)] hover:bg-[var(--lesson-nav-hover-bg)] border-[var(--lesson-nav-border)] hover:border-[var(--lesson-nav-hover-border)]'
                  }`}
                >
                  <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                    {visited ? (
                      <svg className="w-5 h-5 text-[var(--lesson-nav-icon-completed)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--lesson-nav-icon-active)] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[var(--lesson-nav-icon-active)]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--lesson-nav-icon)]" />
                    )}
                    {i < navItems.length - 1 && (
                      <div className={`absolute top-5 left-2.5 w-0.5 h-4 ${visited ? 'bg-[var(--lesson-nav-connector-completed)]' : 'bg-[var(--lesson-nav-connector-default)]'}`} />
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
