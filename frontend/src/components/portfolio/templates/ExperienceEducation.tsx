import type { CSSProperties } from 'react';
import type { EducationEntry, ExperienceEntry } from './types';

export interface ExperienceEducationTheme {
  accentHex: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  fontFamily?: string;
  headingClassName?: string;
  headingStyle?: CSSProperties;
}

function ExperienceRow({ e, theme }: { e: ExperienceEntry; theme: ExperienceEducationTheme }) {
  return (
    <div className="pl-4 border-l-2" style={{ borderColor: theme.borderColor }}>
      <h4 className="text-[14.5px] font-bold" style={{ color: theme.textColor }}>{e.role}</h4>
      <p className="text-[12.5px] mt-0.5" style={{ color: theme.mutedColor }}>{e.company}</p>
      <p className="text-[11px] uppercase tracking-[0.06em] mt-1" style={{ color: theme.mutedColor }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</p>
      {e.description && <p className="text-[12.5px] leading-relaxed mt-1.5" style={{ color: theme.textColor, opacity: 0.85 }}>{e.description}</p>}
    </div>
  );
}

function EducationRow({ e, theme }: { e: EducationEntry; theme: ExperienceEducationTheme }) {
  return (
    <div className="pl-4 border-l-2" style={{ borderColor: theme.borderColor }}>
      <h4 className="text-[14.5px] font-bold" style={{ color: theme.textColor }}>{e.institution}</h4>
      <p className="text-[12.5px] mt-0.5" style={{ color: theme.mutedColor }}>{[e.degree, e.field].filter(Boolean).join(', ')}</p>
      <p className="text-[11px] uppercase tracking-[0.06em] mt-1" style={{ color: theme.mutedColor }}>{e.startDate} – {e.endDate}</p>
      {e.description && <p className="text-[12.5px] leading-relaxed mt-1.5" style={{ color: theme.textColor, opacity: 0.85 }}>{e.description}</p>}
    </div>
  );
}

// Shared Experience + Education section, reused across every template that
// doesn't have a bespoke chronological layout of its own (Story/Resume/
// Ledger/Journey each render these inline instead, matching their own
// document structure). Renders nothing if both lists are empty.
export default function ExperienceEducation({ experience, education, theme }: {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  theme: ExperienceEducationTheme;
}) {
  if (experience.length === 0 && education.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-8">
      {experience.length > 0 && (
        <div>
          <h3 className={theme.headingClassName} style={theme.headingStyle}>Experience</h3>
          <div className="space-y-5 mt-4">
            {experience.map((e) => <ExperienceRow key={e.id} e={e} theme={theme} />)}
          </div>
        </div>
      )}
      {education.length > 0 && (
        <div>
          <h3 className={theme.headingClassName} style={theme.headingStyle}>Education</h3>
          <div className="space-y-5 mt-4">
            {education.map((e) => <EducationRow key={e.id} e={e} theme={theme} />)}
          </div>
        </div>
      )}
    </div>
  );
}
