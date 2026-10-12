import { Clock, Sparkles, Target } from 'lucide-react';

interface ProjectOverviewCardProps {
  title: string;
  goal: string;
  skills: string[];
  difficulty: string;
  estimatedTime: string;
  framing?: 'milestone' | 'capstone';
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: 'bg-[rgba(34,197,94,0.1)] text-[var(--success)] border-[rgba(34,197,94,0.2)]',
  Easy: 'bg-[rgba(34,197,94,0.1)] text-[var(--success)] border-[rgba(34,197,94,0.2)]',
  Medium: 'bg-[rgba(34,197,94,0.1)] text-[var(--success)] border-[rgba(34,197,94,0.2)]',
  Intermediate: 'bg-[rgba(0,191,179,0.1)] text-[var(--brand-primary)] border-[rgba(0,191,179,0.2)]',
  Hard: 'bg-[rgba(59,130,246,0.1)] text-[var(--info)] border-[rgba(59,130,246,0.2)]',
  Advanced: 'bg-[rgba(59,130,246,0.1)] text-[var(--info)] border-[rgba(59,130,246,0.2)]',
};

/** "Before You Begin" style overview — what/why, skills, difficulty, time, outcome. Shared by Milestone and Capstone. */
export default function ProjectOverviewCard({ title, goal, skills, difficulty, estimatedTime, framing = 'milestone' }: ProjectOverviewCardProps) {
  const diffCls = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.Intermediate;
  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm space-y-5">
      <div>
        <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest">
          {framing === 'capstone' ? 'Before You Begin — Final Project' : 'Before You Begin'}
        </span>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1">{title}</h3>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="flex items-start gap-2.5">
          <Clock size={16} className="text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Estimated Time</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{estimatedTime}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Target size={16} className="text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Difficulty</p>
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${diffCls}`}>{difficulty}</span>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Sparkles size={16} className="text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Skills Covered</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{skills.length} concepts</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span key={s} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[var(--surface-container)] text-[var(--text-secondary)] border border-[var(--border-light)]">{s}</span>
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--border-light)]">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Final Outcome</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{goal}</p>
      </div>
    </div>
  );
}
