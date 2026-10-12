import { useState, type CSSProperties } from 'react';
import { ChevronDown, Code, Link as LinkIcon } from 'lucide-react';
import type { EnrichedProject } from './types';
import { COLLAPSED_COUNT, groupProjectsByCategory } from './projectGrouping';

// Shared, themeable "real completed projects grouped by category" block,
// reused across every portfolio template. Each template passes its own
// palette (colors only — layout/typography stays consistent) so the visual
// language never leaks between templates; only actual student-completed
// projects ever reach this component (enrichedProjects is pre-filtered to
// completedAt-having rows in PortfolioPage.tsx).
export interface ProjectsByCategoryTheme {
  accentHex: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  fontFamily?: string;
  /** Wrapper around each category group — set for a "card" look, omit for a flat list. */
  groupClassName?: string;
  groupStyle?: CSSProperties;
}

function ProjectRow({ proj, theme }: { proj: EnrichedProject; theme: ProjectsByCategoryTheme }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 min-w-0 border-b last:border-b-0"
      style={{ borderColor: `${theme.borderColor}` }}
    >
      <span className="font-semibold text-[13.5px] truncate" style={{ color: theme.textColor }}>{proj.name}</span>
      {proj.techStack && <span className="text-[12px] truncate hidden sm:inline" style={{ color: theme.mutedColor }}>{proj.techStack}</span>}
      {proj.difficulty && (
        <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border flex-shrink-0" style={{ borderColor: theme.accentHex, color: theme.accentHex }}>
          {proj.difficulty}
        </span>
      )}
      <span className="ml-auto flex items-center gap-3 flex-shrink-0 text-[11px]">
        {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: theme.accentHex }}><Code size={11} /> Code</a>}
        {proj.liveDemoUrl && <a href={proj.liveDemoUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: theme.accentHex }}><LinkIcon size={11} /> Demo</a>}
        <span className="tabular-nums" style={{ color: theme.mutedColor }}>
          {proj.completedAt ? new Date(proj.completedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
        </span>
      </span>
    </div>
  );
}

function CategoryGroup({ category, projects, theme }: { category: string; projects: EnrichedProject[]; theme: ProjectsByCategoryTheme }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? projects : projects.slice(0, COLLAPSED_COUNT);
  const remaining = projects.length - COLLAPSED_COUNT;

  return (
    <div className={theme.groupClassName} style={theme.groupStyle}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[13px] font-bold" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>{category}</h3>
        <span className="text-[11px]" style={{ color: theme.mutedColor }}>{projects.length} completed</span>
      </div>
      <div>
        {visible.map((proj, i) => <ProjectRow key={i} proj={proj} theme={theme} />)}
      </div>
      {remaining > 0 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 mt-2 text-[12px] font-semibold hover:underline"
          style={{ color: theme.accentHex }}
        >
          {expanded ? 'Show less' : `View all ${projects.length}`}
          <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}

export default function ProjectsByCategory({ projects, theme, emptyMessage = 'No projects yet.' }: {
  projects: EnrichedProject[];
  theme: ProjectsByCategoryTheme;
  emptyMessage?: string;
}) {
  const groups = groupProjectsByCategory(projects);
  if (groups.length === 0) {
    return <p className="text-[13.5px] italic" style={{ color: theme.mutedColor }}>{emptyMessage}</p>;
  }
  return (
    <div className="space-y-4">
      {groups.map(([category, catProjects]) => (
        <CategoryGroup key={category} category={category} projects={catProjects} theme={theme} />
      ))}
    </div>
  );
}
