import type { RefObject } from 'react';
import {
  User, Lock, Bell, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, LayoutGrid, FileText,
} from 'lucide-react';
import { ACCENT_THEMES, PORTFOLIO_TEMPLATES } from './templates/types';
import type { ExperienceEntry, EducationEntry, ServiceEntry, TestimonialEntry } from './templates/types';
import { ExperienceEditor, EducationEditor, ServicesEditor, TestimonialsEditor } from './PortfolioContentEditor';

export interface SettingsPanelProps {
  settingsSection: 'profileInfo' | 'password' | 'notifications' | 'portfolioContent';
  setSettingsSection: (s: 'profileInfo' | 'password' | 'notifications' | 'portfolioContent') => void;

  userEmail?: string;
  initials: string;
  avatarPreview: string | null;
  userAvatarUrl?: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;

  formName: string; setFormName: (v: string) => void;
  formBio: string; setFormBio: (v: string) => void;
  formGithubUrl: string; setFormGithubUrl: (v: string) => void;
  formLinkedinUrl: string; setFormLinkedinUrl: (v: string) => void;
  formPortfolioUrl: string; setFormPortfolioUrl: (v: string) => void;
  formProfileVisibility: string; setFormProfileVisibility: (v: string) => void;
  formProfileTheme: string; setFormProfileTheme: (v: string) => void;
  formPortfolioTemplate: string; setFormPortfolioTemplate: (v: string) => void;
  onBrowseTemplates: () => void;
  saving: boolean;
  onSaveProfile: () => void;

  passwordForm: { current: string; newPass: string; confirm: string };
  setPasswordForm: (updater: (p: { current: string; newPass: string; confirm: string }) => { current: string; newPass: string; confirm: string }) => void;
  passwordError: string;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  changingPassword: boolean;
  onChangePassword: () => void;

  notifPrefs: Record<string, boolean>;
  setNotifPrefs: (updater: (p: Record<string, boolean>) => Record<string, boolean>) => void;
  defaultNotifPrefs: Record<string, boolean>;
  notifSaving: boolean;
  onSaveNotificationPrefs: () => void;

  formExperience: ExperienceEntry[]; setFormExperience: (items: ExperienceEntry[]) => void;
  formEducation: EducationEntry[]; setFormEducation: (items: EducationEntry[]) => void;
  formServices: ServiceEntry[]; setFormServices: (items: ServiceEntry[]) => void;
  formTestimonials: TestimonialEntry[]; setFormTestimonials: (items: TestimonialEntry[]) => void;
  portfolioContentSaving: boolean;
  onSavePortfolioContent: () => void;
}

const inputClass = "w-full h-[44px] bg-[var(--bg-body)] border border-[var(--border-light)] rounded-[8px] px-3 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[var(--shadow-sm)] transition-shadow";
const labelClass = "block text-sm font-medium text-[var(--text-secondary)] mb-2";
const cardClass = "bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-light)] space-y-6";

export default function SettingsPanel(p: SettingsPanelProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 pb-4">
      <div className="w-full md:w-56 flex-shrink-0">
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {[
            { id: 'profileInfo' as const, icon: User, label: 'Profile Information' },
            { id: 'portfolioContent' as const, icon: FileText, label: 'Portfolio Content' },
            { id: 'password' as const, icon: Lock, label: 'Change Password' },
            { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
          ].map((item) => {
            const active = p.settingsSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => p.setSettingsSection(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)] border-l-2 border-[var(--color-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-dark-surface)]/50 hover:text-[var(--text-secondary)] border-l-2 border-transparent'
                }`}
              >
                <Icon size={18} className={active ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1">
        {p.settingsSection === 'profileInfo' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[18px] font-bold text-[var(--text-main)]">Profile Information</h3>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">Update your personal information and how it appears on your portfolio.</p>
            </div>
            <div className={cardClass}>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-[72px] h-[72px] rounded-full bg-[var(--bg-dark-surface)] flex items-center justify-center border-[3px] border-transparent overflow-hidden"
                       style={{ background: 'linear-gradient(#1F2937, #1F2937) padding-box, linear-gradient(135deg, #3B82F6, #A855F7) border-box' }}>
                    {p.avatarPreview || p.userAvatarUrl ? (
                      <img src={p.avatarPreview || p.userAvatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-[var(--text-main)] tracking-widest">{p.initials}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input ref={p.fileInputRef} type="file" accept="image/*" onChange={p.onAvatarChange} className="hidden" />
                    <button
                      onClick={() => p.fileInputRef.current?.click()}
                      className="px-4 py-2 bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] rounded-[8px] text-sm font-medium hover:bg-[var(--color-primary)]/10 transition-colors w-fit"
                    >
                      Upload New
                    </button>
                    {p.avatarPreview && (
                      <button onClick={p.onRemoveAvatar} className="text-[11px] text-red-400 hover:text-red-300 text-left">
                        Remove
                      </button>
                    )}
                    <span className="text-[11px] text-[var(--text-muted)]">JPG, PNG or GIF. Max size 2MB.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" value={p.formName} onChange={(e) => p.setFormName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" defaultValue={p.userEmail || ''} readOnly className={`${inputClass} text-[var(--text-secondary)] opacity-70 cursor-not-allowed`} />
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Email address cannot be changed.</p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Portfolio Tagline</label>
                <textarea
                  value={p.formBio} onChange={(e) => p.setFormBio(e.target.value)} rows={3} maxLength={140}
                  className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] rounded-[8px] p-3 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[var(--shadow-sm)] transition-shadow resize-none"
                />
                <div className="text-right mt-1">
                  <span className="text-[11px] text-[var(--text-muted)]">{p.formBio.length}/140 characters</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className={labelClass}>GitHub Profile Link</label>
                  <input type="url" placeholder="https://github.com/username" value={p.formGithubUrl} onChange={(e) => p.setFormGithubUrl(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn Profile Link</label>
                  <input type="url" placeholder="https://linkedin.com/in/username" value={p.formLinkedinUrl} onChange={(e) => p.setFormLinkedinUrl(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Personal Portfolio Link</label>
                  <input type="url" placeholder="https://yourwebsite.com" value={p.formPortfolioUrl} onChange={(e) => p.setFormPortfolioUrl(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="pt-2">
                <label className={labelClass}>Portfolio Visibility</label>
                <select
                  value={p.formProfileVisibility} onChange={(e) => p.setFormProfileVisibility(e.target.value)}
                  className={`${inputClass} w-full md:w-1/2`}
                >
                  <option value="public">Public - Anyone can view</option>
                  <option value="private">Private - Only you</option>
                  <option value="connections">Connections only</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Accent Color</label>
                <div className="flex items-center gap-3">
                  {Object.entries(ACCENT_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      type="button"
                      title={theme.label}
                      onClick={() => p.setFormProfileTheme(key)}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{
                        backgroundColor: theme.hex,
                        boxShadow: p.formProfileTheme === key ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${theme.hex}` : 'none',
                      }}
                    >
                      {p.formProfileTheme === key && <CheckCircle size={16} className="text-[#ffffff]" />}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-2">Sets the accent color across your whole portfolio, including for visitors.</p>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Portfolio Template</label>
                <button
                  type="button"
                  onClick={p.onBrowseTemplates}
                  className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-light)] hover:border-[var(--color-primary)]/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <LayoutGrid size={18} className="text-[var(--color-primary)]" />
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--text-main)]">
                        {PORTFOLIO_TEMPLATES.find((t) => t.id === p.formPortfolioTemplate)?.label ?? 'Bento'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">Currently selected — click to browse all templates</div>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--color-primary)] whitespace-nowrap">Browse Templates →</span>
                </button>
                <p className="text-[11px] text-[var(--text-muted)] mt-2">Changes how your whole portfolio is laid out — try one and switch back anytime.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border-light)]">
                <button
                  onClick={p.onSaveProfile} disabled={p.saving}
                  className="h-[44px] px-6 bg-[var(--color-primary)] text-[var(--bg-body)] rounded-[8px] font-medium text-sm hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {p.saving && <Loader2 size={16} className="animate-spin" />}
                  {p.saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {p.settingsSection === 'portfolioContent' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[18px] font-bold text-[var(--text-main)]">Portfolio Content</h3>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">Add experience, education, services and testimonials — shown on narrative-style portfolio templates.</p>
            </div>
            <ExperienceEditor items={p.formExperience} onChange={p.setFormExperience} />
            <EducationEditor items={p.formEducation} onChange={p.setFormEducation} />
            <ServicesEditor items={p.formServices} onChange={p.setFormServices} />
            <TestimonialsEditor items={p.formTestimonials} onChange={p.setFormTestimonials} />
            <div className="flex justify-end pt-2">
              <button
                onClick={p.onSavePortfolioContent} disabled={p.portfolioContentSaving}
                className="h-[44px] px-6 bg-[var(--color-primary)] text-[var(--bg-body)] rounded-[8px] font-medium text-sm hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {p.portfolioContentSaving && <Loader2 size={16} className="animate-spin" />}
                {p.portfolioContentSaving ? 'Saving...' : 'Save Portfolio Content'}
              </button>
            </div>
          </div>
        )}

        {p.settingsSection === 'password' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[18px] font-bold text-[var(--text-main)]">Change Password</h3>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">Update your account password.</p>
            </div>
            <div className={cardClass}>
              {p.passwordError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertCircle size={16} /> {p.passwordError}
                </div>
              )}
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type={p.showPassword ? 'text' : 'password'} value={p.passwordForm.current}
                  onChange={(e) => p.setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                  placeholder="Enter current password" className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <input
                    type={p.showPassword ? 'text' : 'password'} value={p.passwordForm.newPass}
                    onChange={(e) => p.setPasswordForm((f) => ({ ...f, newPass: e.target.value }))}
                    placeholder="Enter new password" className={`${inputClass} pr-10`}
                  />
                  <button type="button" onClick={() => p.setShowPassword(!p.showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                    {p.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input
                  type={p.showPassword ? 'text' : 'password'} value={p.passwordForm.confirm}
                  onChange={(e) => p.setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Confirm new password" className={inputClass}
                />
              </div>
              <div className="flex justify-end pt-4 border-t border-[var(--border-light)]">
                <button
                  onClick={p.onChangePassword} disabled={p.changingPassword}
                  className="h-[44px] px-6 bg-[var(--color-primary)] text-[var(--bg-body)] rounded-[8px] font-medium text-sm hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {p.changingPassword && <Loader2 size={16} className="animate-spin" />}
                  {p.changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {p.settingsSection === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[18px] font-bold text-[var(--text-main)]">Notifications</h3>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">Manage how and when you receive notifications.</p>
            </div>
            <div className={cardClass}>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-main)] mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  {[
                    { key: 'emailCourseUpdates', label: 'Course updates & new content' },
                    { key: 'emailDeadlines', label: 'Assignment deadlines & reminders' },
                    { key: 'emailQuizResults', label: 'Quiz results & feedback' },
                    { key: 'emailAchievements', label: 'Achievements & milestones' },
                    { key: 'emailStreakReminders', label: 'Streak reminders' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer group">
                      <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-main)] transition-colors">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => p.setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${p.notifPrefs[item.key] ? 'bg-[var(--color-primary)]' : 'bg-[#2D3748]'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${p.notifPrefs[item.key] ? 'translate-x-5' : ''}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border-light)]">
                <h4 className="text-sm font-semibold text-[var(--text-main)] mb-3">In-App Notifications</h4>
                <div className="space-y-3">
                  {[
                    { key: 'inAppMessages', label: 'Messages & announcements' },
                    { key: 'inAppProjectReviews', label: 'Project reviews & feedback' },
                    { key: 'inAppDailyMissions', label: 'Daily missions & challenges' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer group">
                      <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-main)] transition-colors">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => p.setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${p.notifPrefs[item.key] ? 'bg-[var(--color-primary)]' : 'bg-[#2D3748]'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${p.notifPrefs[item.key] ? 'translate-x-5' : ''}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-light)]">
                <button
                  onClick={() => p.setNotifPrefs(() => p.defaultNotifPrefs)}
                  className="h-[44px] px-6 bg-transparent text-[var(--text-secondary)] border border-[var(--border-light)] rounded-[8px] font-medium text-sm hover:bg-[var(--bg-surface)] transition-all"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={p.onSaveNotificationPrefs} disabled={p.notifSaving}
                  className="h-[44px] px-6 bg-[var(--color-primary)] text-[var(--bg-body)] rounded-[8px] font-medium text-sm hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {p.notifSaving && <Loader2 size={16} className="animate-spin" />}
                  {p.notifSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
