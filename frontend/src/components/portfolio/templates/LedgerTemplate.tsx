import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Code, Award, Globe, Download, Pencil, Loader2 } from 'lucide-react';
import GitHubContributionChart from '../GitHubContributionChart';
import SettingsPanel from '../SettingsPanel';
import AnimatedCounter from './AnimatedCounter';
import ProjectsByCategory from './ProjectsByCategory';
import ShareLinkButton from './ShareLinkButton';
import CompletenessNudge from './CompletenessNudge';
import { computeCompleteness } from './completeness';
import { courseDisplayName, type TemplateProps } from './types';

const LABEL_FONT = "var(--font-mono)";
const DISPLAY_FONT = "var(--font-sans)";

const row = "grid grid-cols-[100px_1fr_auto] sm:grid-cols-[130px_1fr_auto] gap-4 py-3.5 border-b border-[var(--border-light)] items-baseline";
const sectionHeading = "text-[11px] uppercase tracking-[0.16em] font-bold text-[var(--text-muted)] mb-1 mt-10 first:mt-0";
const dateCell = "text-[11.5px] text-[var(--text-muted)] tabular-nums";

export default function LedgerTemplate(props: TemplateProps) {
  const {
    displayUser, stats, portfolio, enrichedProjects, githubActivity, accentTheme,
    isOwn, initials, joinedDate, loading, avatarPreview,
    tab, setTab, downloading, onDownloadPdf, settingsProps,
  } = props;

  const completeness = computeCompleteness(displayUser, portfolio);
  const experience = portfolio?.experience ?? [];
  const education = portfolio?.education ?? [];

  return (
    <div
      className="min-h-screen bg-[#EEF2F6] text-[var(--text-main)] pb-20"
      style={{ '--color-primary': accentTheme.hex, '--color-primary-dark': accentTheme.darkHex, fontFamily: DISPLAY_FONT } as CSSProperties}
    >
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <div className="flex items-start justify-between gap-4 pb-6 border-b-2 border-[var(--text-main)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-[var(--bg-dark-surface)] flex items-center justify-center overflow-hidden flex-shrink-0">
              {(avatarPreview || displayUser?.avatarUrl) ? (
                <img src={avatarPreview || displayUser?.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold" style={{ fontFamily: LABEL_FONT }}>{initials}</span>
              )}
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight">{displayUser?.name || 'User'}</h1>
              <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5" style={{ fontFamily: LABEL_FONT }}>Record opened {joinedDate}</p>
            </div>
          </div>
          {isOwn && (
            <div className="flex items-center gap-3 text-[11.5px] font-medium" style={{ fontFamily: LABEL_FONT }}>
              <button onClick={() => setTab(tab === 'settings' ? 'overview' : 'settings')} className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">
                <Pencil size={11} /> {tab === 'settings' ? 'view' : 'edit'}
              </button>
              <button onClick={onDownloadPdf} disabled={downloading} className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50">
                {downloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />} pdf
              </button>
              <ShareLinkButton userId={displayUser?.id} label iconSize={11} className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors" />
            </div>
          )}
        </div>

        {isOwn && tab === 'settings' ? (
          <div className="pt-8"><SettingsPanel {...settingsProps} /></div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {isOwn && (
              <CompletenessNudge
                completeness={completeness}
                onComplete={() => setTab('settings')}
                theme={{
                  accentHex: accentTheme.hex,
                  textColor: 'var(--text-main)',
                  mutedColor: 'var(--text-muted)',
                  containerClassName: 'border border-[var(--border-light)] rounded-lg p-4 mt-6 flex items-center gap-4',
                }}
              />
            )}

            {displayUser?.bio && <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mt-6">{displayUser.bio}</p>}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-4 text-[11.5px]" style={{ fontFamily: LABEL_FONT }}>
              {displayUser?.githubUrl && <a href={displayUser.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"><Code size={12} /> github</a>}
              {displayUser?.linkedinUrl && <a href={displayUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"><Award size={12} /> linkedin</a>}
              {displayUser?.portfolioUrl && <a href={displayUser.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"><Globe size={12} /> site</a>}
            </div>

            {stats && (
              <div className="grid grid-cols-4 gap-4 mt-8 py-4 border-y border-[var(--border-light)]">
                {[
                  ['problems', stats.problemsSolved],
                  ['projects', stats.milestoneProjects + stats.capstoneProjects],
                  ['courses', stats.coursesCompleted],
                  ['accuracy', stats.practiceAccuracy != null ? `${stats.practiceAccuracy}%` : '—'],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="text-[22px] font-bold tabular-nums" style={{ color: accentTheme.hex }}>
                      {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
                    </div>
                    <div className="text-[10.5px] uppercase tracking-[0.1em] text-[var(--text-muted)] mt-0.5" style={{ fontFamily: LABEL_FONT }}>{label}</div>
                  </div>
                ))}
              </div>
            )}

            {experience.length > 0 && (
              <section>
                <h2 className={sectionHeading} style={{ fontFamily: LABEL_FONT }}>Experience</h2>
                {experience.map((e) => (
                  <motion.div key={e.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={row}>
                    <span className={dateCell}>{e.startDate}–{e.current ? 'now' : e.endDate}</span>
                    <span>
                      <span className="font-semibold text-[13.5px]">{e.role}</span>
                      <span className="text-[13px] text-[var(--text-muted)]"> · {e.company}</span>
                      {e.description && <p className="text-[12.5px] text-[var(--text-secondary)] mt-1">{e.description}</p>}
                    </span>
                    <span />
                  </motion.div>
                ))}
              </section>
            )}

            {education.length > 0 && (
              <section>
                <h2 className={sectionHeading} style={{ fontFamily: LABEL_FONT }}>Education</h2>
                {education.map((e) => (
                  <motion.div key={e.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={row}>
                    <span className={dateCell}>{e.startDate}–{e.endDate}</span>
                    <span>
                      <span className="font-semibold text-[13.5px]">{e.institution}</span>
                      <span className="text-[13px] text-[var(--text-muted)]"> · {[e.degree, e.field].filter(Boolean).join(', ')}</span>
                    </span>
                    <span />
                  </motion.div>
                ))}
              </section>
            )}

            <section>
              <h2 className={sectionHeading} style={{ fontFamily: LABEL_FONT }}>Projects</h2>
              <ProjectsByCategory
                projects={enrichedProjects}
                theme={{
                  accentHex: accentTheme.hex,
                  textColor: 'var(--text-main)',
                  mutedColor: 'var(--text-muted)',
                  borderColor: 'var(--border-light)',
                  fontFamily: LABEL_FONT,
                }}
              />
            </section>

            {(portfolio?.certificates ?? []).length > 0 && (
              <section>
                <h2 className={sectionHeading} style={{ fontFamily: LABEL_FONT }}>Certificates</h2>
                {portfolio!.certificates.map((cert, i) => (
                  <div key={i} className={row}>
                    <span className={dateCell}>{cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}</span>
                    <span className="font-semibold text-[13.5px]">{cert.title || courseDisplayName(cert.courseSlug)}</span>
                    <button onClick={() => window.open(`/verify/${cert.certNumber}`, '_blank')} className="text-[11.5px] hover:underline" style={{ color: accentTheme.hex, fontFamily: LABEL_FONT }}>verify</button>
                  </div>
                ))}
              </section>
            )}

            <section>
              <h2 className={sectionHeading} style={{ fontFamily: LABEL_FONT }}>Skills</h2>
              {(portfolio?.skills ?? []).length === 0 ? (
                <p className="text-[13px] text-[var(--text-muted)] italic py-3">No skills recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-x-3 gap-y-2 py-3 text-[13px]">
                  {portfolio!.skills.map((skill, i) => (
                    <span key={i}>
                      {skill}{i < portfolio!.skills.length - 1 && <span className="text-[var(--text-muted)]">,</span>}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className={sectionHeading} style={{ fontFamily: LABEL_FONT }}>GitHub Activity</h2>
              <div className="mt-3">
                <GitHubContributionChart data={githubActivity} loading={loading} isOwn={isOwn} hideTitle />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
