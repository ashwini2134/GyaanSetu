import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { authApi, authFetch } from '../authClient';
import { useGamification } from '../progress';
import { projectsData } from '../data/projectsData';
import { 
  MapPin, 
  Calendar,
  Download, 
  BookOpen, 
  Code, 
  Award, 
  Target,
  User, 
  Lock, 
  Bell, 
  Settings as SettingsIcon, 
  Link as LinkIcon, 
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

type TabView = 'profile' | 'settings';

const LOCATIONS = [
  { group: 'India', options: [
    'Bengaluru, India', 'Mumbai, India', 'Delhi, India', 'Chennai, India',
    'Hyderabad, India', 'Pune, India', 'Kolkata, India', 'Ahmedabad, India',
    'Jaipur, India', 'Lucknow, India', 'Chandigarh, India', 'Indore, India',
    'Bhopal, India', 'Surat, India', 'Kochi, India', 'Nagpur, India',
    'Thiruvananthapuram, India', 'Coimbatore, India', 'Visakhapatnam, India',
    'Patna, India',
  ]},
  { group: 'Global', options: [
    'New York, USA', 'San Francisco, USA', 'Seattle, USA', 'Austin, USA',
    'London, UK', 'Berlin, Germany', 'Toronto, Canada', 'Vancouver, Canada',
    'Singapore', 'Dubai, UAE', 'Sydney, Australia', 'Amsterdam, Netherlands',
    'Tokyo, Japan', 'Paris, France', 'Stockholm, Sweden', 'Zurich, Switzerland',
  ]},
];

function LocationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const allOptions = LOCATIONS.flatMap(g => g.options);
  const filtered = query
    ? allOptions.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : allOptions;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery(''); }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
      <input
        type="text"
        value={open ? query : value}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); setQuery(''); }}
        placeholder="Search or enter your location"
        className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] pl-9 pr-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow"
      />
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-[#161B22] border border-[#2D3748] rounded-[8px] max-h-48 overflow-y-auto z-50 shadow-xl">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
          ) : (
            filtered.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => { onChange(loc); setQuery(''); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#1F2937] ${
                  loc === value ? 'text-blue-400 bg-[#1F2937]/50' : 'text-white'
                }`}
              >
                {loc}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const { stats, overallProgress } = useGamification();
  const location = useLocation();
  const [view, setView] = useState<TabView>(location.pathname === '/settings' ? 'settings' : 'profile');
  const [settingsTab, setSettingsTab] = useState('profileInfo');

  const [formName, setFormName] = useState(user?.name || '');
  const [formBio, setFormBio] = useState(user?.bio || '');
  const [formLocation, setFormLocation] = useState('Bengaluru, India');
  const [formDateJoined, setFormDateJoined] = useState(
    user?.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : ''
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const defaultNotifPrefs = {
    emailCourseUpdates: true,
    emailDeadlines: true,
    emailQuizResults: true,
    emailAchievements: true,
    emailStreakReminders: true,
    inAppMessages: true,
    inAppProjectReviews: true,
    inAppDailyMissions: true,
  };
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(defaultNotifPrefs);
  const [notifSaving, setNotifSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotification('error', 'Image must be under 2MB.');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload: { name?: string; bio?: string; avatarUrl?: string } = {};
      if (formName !== user?.name) payload.name = formName;
      if (formBio !== user?.bio) payload.bio = formBio;
      if (avatarPreview && avatarFile) payload.avatarUrl = avatarPreview;

      await authApi.updateProfile(payload);
      await checkAuth();
      showNotification('success', 'Profile updated successfully!');
      setAvatarFile(null);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationPrefs = async () => {
    if (!notifPrefs) return;
    setNotifSaving(true);
    try {
      await authApi.updateProfile({ notificationPrefs: notifPrefs });
      showNotification('success', 'Notification preferences saved.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save preferences.');
    } finally {
      setNotifSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!passwordForm.current) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!passwordForm.newPass) {
      setPasswordError('New password is required.');
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      await authApi.changePassword(passwordForm.current, passwordForm.newPass);
      showNotification('success', 'Password changed successfully!');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Real-time dynamic data states
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<any[]>([]);

  const completedCourses = courseProgress.filter((c: any) => c.status === 'completed');
  const derivedSkills = React.useMemo(() => {
    const skills = new Set<string>();
    const skillGroups: Record<string, string[]> = {};

    completedCourses.forEach((c: any) => {
      const group = c.courseId === 'python' ? 'Languages' : 'AI Tools';
      if (!skillGroups[group]) skillGroups[group] = [];
      skillGroups[group].push(c.courseId === 'python' ? 'Python' : 'AI Foundations');
      skills.add(c.courseId === 'python' ? 'Python' : 'AI Foundations');
    });

    projects.forEach((p: any) => {
      const techs = (p.techStack || '').split(',').map((t: string) => t.trim()).filter(Boolean);
      techs.forEach((t: string) => {
        if (!skills.has(t)) {
          skills.add(t);
          const group = ['Python', 'JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(t) ? 'Languages' : 'Concepts';
          if (!skillGroups[group]) skillGroups[group] = [];
          if (!skillGroups[group].includes(t)) skillGroups[group].push(t);
        }
      });
    });

    if (completedCourses.length > 0 || projects.length > 0) {
      if (!skillGroups['Concepts']) skillGroups['Concepts'] = [];
      if (projects.length > 0 && !skillGroups['Concepts'].includes('Problem Solving')) skillGroups['Concepts'].push('Problem Solving');
    }

    return Object.entries(skillGroups).map(([group, skills]) => ({ group, skills }));
  }, [courseProgress, projects]);

  React.useEffect(() => {
    setView(location.pathname === '/settings' ? 'settings' : 'profile');
  }, [location.pathname]);

  React.useEffect(() => {
    if (view === 'settings' && settingsTab === 'notifications') {
      authApi.getNotificationPrefs().then((data) => setNotifPrefs(data.prefs)).catch(() => {});
    }
  }, [view, settingsTab]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, timeRes, courseRes] = await Promise.all([
          authFetch<any[]>('/profile/projects').catch(() => []),
          authFetch<any[]>('/profile/timeline').catch(() => []),
          authFetch<any[]>('/courses/progress').catch(() => [])
        ]);
        
        const enrichedProjects = projRes.map(p => {
          const matched = projectsData.find(d => d.id === p.projectId);
          if (matched) {
            return {
              ...p,
              name: matched.title,
              techStack: matched.technologies.join(', '),
              difficulty: matched.difficulty,
            };
          }
          return p;
        });

        setProjects(enrichedProjects);
        setTimelineEvents(timeRes);
        setCourseProgress(courseRes);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setProjectsLoading(false);
        setTimelineLoading(false);
      }
    }
    fetchData();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const initials = user ? getInitials(user.name) : "U";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const displayLocation = 'Bengaluru, India'; // Fallback since not in AuthUser
  const displayTagline = user?.bio || 'Learning today, building tomorrow.';

  if (view === 'settings') {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white p-4 md:p-8 font-sans">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* LEFT MENU */}
          <div className="w-full md:w-64 flex-shrink-0">
            <button 
              onClick={() => setView('profile')}
              className="text-sm text-blue-400 hover:text-blue-300 mb-6 inline-block"
            >
              ← Back to Profile
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'profileInfo', icon: User, label: 'Profile Information' },
                { id: 'password', icon: Lock, label: 'Change Password' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'preferences', icon: SettingsIcon, label: 'Account Preferences' },
                { id: 'connections', icon: LinkIcon, label: 'Connected Accounts' },
                { id: 'privacy', icon: Shield, label: 'Privacy' },
              ].map((item) => {
                const active = settingsTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active 
                        ? 'bg-[#1F2937] text-blue-400 border-l-2 border-blue-500' 
                        : 'text-slate-400 hover:bg-[#1F2937]/50 hover:text-slate-300 border-l-2 border-transparent'
                    }`}
                  >
                    <Icon size={18} className={active ? "text-blue-500" : "text-slate-500"} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1">
            {/* Notification Toast */}
            {notification && (
              <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                notification.type === 'success' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {notification.message}
              </div>
            )}

            {settingsTab === 'profileInfo' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-[18px] font-bold text-white">Profile Information</h3>
                  <p className="text-[13px] text-slate-400 mt-1">Update your personal information and how it appears on your profile.</p>
                </div>
                
                <div className="bg-[#161B22] p-6 rounded-[12px] border border-[#2D3748] space-y-6">
                  
                  {/* Row 1: Profile Picture */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="w-[72px] h-[72px] rounded-full bg-[#1F2937] flex items-center justify-center border-[3px] border-transparent overflow-hidden"
                           style={{ background: 'linear-gradient(#1F2937, #1F2937) padding-box, linear-gradient(135deg, #3B82F6, #A855F7) border-box' }}>
                        {avatarPreview || user?.avatarUrl ? (
                          <img src={avatarPreview || user?.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-white tracking-widest">{initials}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-transparent border border-blue-500 text-blue-400 rounded-[8px] text-sm font-medium hover:bg-blue-500/10 transition-colors w-fit"
                        >
                          Upload New
                        </button>
                        {avatarPreview && (
                          <button
                            onClick={() => { setAvatarPreview(null); setAvatarFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="text-[11px] text-red-400 hover:text-red-300 text-left"
                          >
                            Remove
                          </button>
                        )}
                        <span className="text-[11px] text-slate-500">JPG, PNG or GIF. Max size 2MB.</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] px-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        readOnly
                        className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] px-3 text-slate-300 text-sm focus:outline-none opacity-70 cursor-not-allowed"
                      />
                      <p className="text-[11px] text-slate-500 mt-1.5">Email address cannot be changed.</p>
                    </div>
                  </div>

                  {/* Row 3: Bio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Portfolio Tagline</label>
                    <textarea
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      rows={3}
                      maxLength={140}
                      className="w-full bg-[#0D1117] border border-[#2D3748] rounded-[8px] p-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow resize-none"
                    />
                    <div className="text-right mt-1">
                      <span className="text-[11px] text-slate-500">{formBio.length}/140 characters</span>
                    </div>
                  </div>

                  {/* Row 4: Location & Date Joined */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                      <LocationPicker
                        value={formLocation}
                        onChange={setFormLocation}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date Joined</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="date"
                          value={formDateJoined}
                          onChange={(e) => setFormDateJoined(e.target.value)}
                          className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] pl-9 pr-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#2D3748]">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="h-[44px] px-6 bg-blue-500 text-white rounded-[8px] font-medium text-sm hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving && <Loader2 size={16} className="animate-spin" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'password' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-[18px] font-bold text-white">Change Password</h3>
                  <p className="text-[13px] text-slate-400 mt-1">Update your account password.</p>
                </div>
                <div className="bg-[#161B22] p-6 rounded-[12px] border border-[#2D3748] space-y-6">
                  {passwordError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertCircle size={16} />
                      {passwordError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] px-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.newPass}
                        onChange={(e) => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
                        placeholder="Enter new password"
                        className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] px-3 pr-10 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] px-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow"
                    />
                  </div>
                  <div className="flex justify-end pt-4 border-t border-[#2D3748]">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="h-[44px] px-6 bg-blue-500 text-white rounded-[8px] font-medium text-sm hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {changingPassword && <Loader2 size={16} className="animate-spin" />}
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-[18px] font-bold text-white">Notifications</h3>
                  <p className="text-[13px] text-slate-400 mt-1">Manage how and when you receive notifications.</p>
                </div>
                <div className="bg-[#161B22] p-6 rounded-[12px] border border-[#2D3748] space-y-6">
                  <>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Email Notifications</h4>
                        <div className="space-y-3">
                          {[
                            { key: 'emailCourseUpdates', label: 'Course updates & new content' },
                            { key: 'emailDeadlines', label: 'Assignment deadlines & reminders' },
                            { key: 'emailQuizResults', label: 'Quiz results & feedback' },
                            { key: 'emailAchievements', label: 'Achievements & milestones' },
                            { key: 'emailStreakReminders', label: 'Streak reminders' },
                          ].map((item) => (
                            <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer group">
                              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                              <button
                                type="button"
                                onClick={() => setNotifPrefs(p => ({ ...p!, [item.key]: !p![item.key] }))}
                                className={`relative w-10 h-5 rounded-full transition-colors ${
                                  notifPrefs[item.key] ? 'bg-blue-500' : 'bg-[#2D3748]'
                                }`}
                              >
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                  notifPrefs[item.key] ? 'translate-x-5' : ''
                                }`} />
                              </button>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#2D3748]">
                        <h4 className="text-sm font-semibold text-white mb-3">In-App Notifications</h4>
                        <div className="space-y-3">
                          {[
                            { key: 'inAppMessages', label: 'Messages & announcements' },
                            { key: 'inAppProjectReviews', label: 'Project reviews & feedback' },
                            { key: 'inAppDailyMissions', label: 'Daily missions & challenges' },
                          ].map((item) => (
                            <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer group">
                              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                              <button
                                type="button"
                                onClick={() => setNotifPrefs(p => ({ ...p!, [item.key]: !p![item.key] }))}
                                className={`relative w-10 h-5 rounded-full transition-colors ${
                                  notifPrefs[item.key] ? 'bg-blue-500' : 'bg-[#2D3748]'
                                }`}
                              >
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                  notifPrefs[item.key] ? 'translate-x-5' : ''
                                }`} />
                              </button>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t border-[#2D3748]">
                        <button
                          onClick={handleSaveNotificationPrefs}
                          disabled={notifSaving}
                          className="h-[44px] px-6 bg-blue-500 text-white rounded-[8px] font-medium text-sm hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {notifSaving && <Loader2 size={16} className="animate-spin" />}
                          {notifSaving ? 'Saving...' : 'Save Preferences'}
                        </button>
                      </div>
                  </>
                </div>
              </div>
            )}

            {settingsTab !== 'profileInfo' && settingsTab !== 'password' && settingsTab !== 'notifications' && (
              <div className="flex items-center justify-center h-64 text-slate-500">
                This section is under construction.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#0D1117] text-white pb-16 font-sans">
      
      {/* PROFILE HEADER */}
      <div className="w-full h-[120px] relative" style={{ background: 'linear-gradient(to right, #1E3A5F, #0D1117)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-10 mb-8 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-full bg-[#1F2937] flex items-center justify-center border-[3px] border-transparent shadow-lg z-10 overflow-hidden"
                 style={{ background: 'linear-gradient(#1F2937, #1F2937) padding-box, linear-gradient(135deg, #3B82F6, #A855F7) border-box' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-white tracking-widest">{initials}</span>
              )}
            </div>
            <div className="mb-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[22px] font-bold text-white">{user?.name || "User"}</h1>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-[20px] border border-blue-500/30">
                  {user?.role === 'admin' ? 'Admin' : 'Student Learner'}
                </span>
              </div>
              <p className="text-[14px] text-slate-400">{displayTagline}</p>
              <div className="flex items-center gap-4 mt-2 text-[12px] text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin size={14}/> {displayLocation}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14}/> Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Courses Completed', value: stats.coursesCompleted.toString(), icon: BookOpen, color: 'blue', colorHex: '#3B82F6' },
            { label: 'Projects Built', value: stats.projectsSolved.toString(), icon: Code, color: 'purple', colorHex: '#A855F7' },
            { label: 'Lectures Completed', value: stats.lecturesCompleted.toString(), icon: Award, color: 'green', colorHex: '#22C55E' },
            { label: 'Tasks Submitted', value: stats.tasksSubmitted.toString(), icon: Target, color: 'amber', colorHex: '#F59E0B' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-[#161B22] rounded-[12px] border border-[#2D3748] p-5 relative overflow-hidden group hover:shadow-[0_0_12px_rgba(59,130,246,0.1)] transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[32px] font-bold text-white leading-none">{stat.value}</span>
                  <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400`}>
                    <Icon size={20} color={stat.colorHex} />
                  </div>
                </div>
                <div className="text-[13px] text-slate-400 font-medium">{stat.label}</div>
                <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#1F2937]">
                  <div className="h-full" style={{ width: '100%', backgroundColor: stat.colorHex }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* MY PROJECTS SECTION */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-white">My Projects</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300">View all projects →</button>
          </div>
          
          {projectsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-[#161B22] border border-[#2D3748] rounded-[12px] p-8 text-center">
              <p className="text-slate-400 text-sm">No projects yet. Start building to see them here!</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
              {projects.map((proj, i) => {
                const color = proj.status === 'COMPLETED' ? 'green' : proj.status === 'IN_PROGRESS' ? 'amber' : 'slate';
                const displayStatus = proj.status === 'COMPLETED' ? 'Completed' : proj.status === 'IN_PROGRESS' ? 'In Progress' : proj.status;
                
                return (
                  <div key={i} className="min-w-[320px] max-w-[320px] bg-[#161B22] rounded-[12px] border border-[#2D3748] p-5 snap-start group hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-all cursor-pointer flex flex-col">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="font-bold text-white text-[15px] leading-tight truncate">{proj.name}</h3>
                      {proj.difficulty && (
                        <span className="px-2 py-0.5 rounded-[20px] text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                          {proj.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-slate-400 mb-4 line-clamp-1">{proj.techStack}</p>
                    <div className="flex justify-between items-center text-[11px] mt-auto">
                      <span className={`px-2 py-0.5 rounded-[20px] font-medium border ${
                        color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {displayStatus}
                      </span>
                      <span className="text-slate-500">{proj.completedAt || proj.createdAt}</span>
                    </div>
                    
                    {proj.status === 'COMPLETED' && (
                      <div className="mt-4 pt-4 border-t border-[#2D3748] space-y-2">
                        <div className="flex items-center gap-3">
                          {proj.githubUrl && (
                            <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 hover:underline">
                              <Code size={12} /> GitHub
                            </a>
                          )}
                          {proj.liveDemoUrl && (
                            <a href={proj.liveDemoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 hover:underline">
                              <LinkIcon size={12} /> Live Demo
                            </a>
                          )}
                        </div>
                        {proj.submittedDescription && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic" title={proj.submittedDescription}>
                            "{proj.submittedDescription}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CERTIFICATES & SKILLS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          
          {/* Certificates */}
          <div className="bg-[#161B22] rounded-[12px] border border-[#2D3748] p-6">
            <h2 className="text-[18px] font-bold text-white mb-5">Certificates Earned</h2>
            {completedCourses.length === 0 ? (
              <div className="text-center py-8">
                <Award size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Complete a course to earn your first certificate!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedCourses.map((c: any, i: number) => {
                  const certName = c.courseId === 'python' ? 'Python Fundamentals' : c.courseId === 'cs50ai' ? 'AI Foundations' : c.courseId;
                  return (
                    <div key={i} className="relative bg-[#0D1117] rounded-[8px] border border-[#2D3748] p-4 flex items-center justify-between group overflow-hidden">
                      <div className="absolute top-0 left-0 w-8 h-8 bg-amber-500/20 rounded-br-full" />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Award size={20} className="text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[14px] text-white">{certName}</h4>
                          <p className="text-[12px] text-slate-400">Earned</p>
                        </div>
                      </div>
                      <button className="p-2 border border-[#2D3748] rounded-[8px] text-slate-400 hover:text-white hover:border-slate-500 transition-colors" title="Download">
                        <Download size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-[#161B22] rounded-[12px] border border-[#2D3748] p-6">
            <h2 className="text-[18px] font-bold text-white mb-5">Skills</h2>
            {derivedSkills.length === 0 ? (
              <div className="text-center py-8">
                <Code size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Complete courses and projects to build your skills!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {derivedSkills.map((cat, i) => (
                  <div key={i}>
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">{cat.group}</h4>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill, j) => (
                        <span key={j} className="bg-[#1F2937] border border-[#2D3748] rounded-[20px] text-white text-[13px] font-medium px-4 py-1.5">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* TIMELINE & NEXT STEPS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Timeline */}
          <div className="bg-[#161B22] rounded-[12px] border border-[#2D3748] p-6">
            <h2 className="text-[18px] font-bold text-white mb-6">Learning Timeline</h2>
            
            {timelineLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
            ) : timelineEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No activity yet. Complete a course to start your timeline!</p>
              </div>
            ) : (
              <>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#2D3748] before:to-transparent">
                  {[...timelineEvents].reverse().map((item, i) => {
                    const color = item.type === 'joined' ? 'blue' : 
                                  (item.type === 'course' || item.type === 'certificate') ? 'green' : 
                                  item.type === 'project' ? 'purple' : 
                                  item.type === 'quiz' ? 'amber' : 'slate';
                    return (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-[#161B22] bg-${color}-500 absolute left-0 md:left-1/2 -translate-x-1/2 shrink-0 ${i === 0 ? 'shadow-[0_0_0_2px_rgba(255,255,255,0.2)] animate-pulse' : ''}`} />
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] ml-8 md:ml-0 p-4 rounded-[8px] bg-[#0D1117] border border-[#2D3748]">
                          <span className={`text-[11px] font-bold text-${color}-400 block mb-1`}>{item.date}</span>
                          <p className="text-[13px] text-slate-300">{item.title}</p>
                          {item.description && <p className="text-[11px] text-slate-500 mt-1">{item.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {timelineEvents.length > 3 && (
                  <button className="w-full mt-6 text-sm text-blue-400 hover:text-blue-300 font-medium">
                    View full timeline ↓
                  </button>
                )}
              </>
            )}
          </div>

          {/* Next Steps CTA */}
          <div className="rounded-[12px] border border-[#2D3748] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #1E3A5F, #1F2937)' }}>
            <div className="relative w-[80px] h-[80px] mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - overallProgress / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">{overallProgress}%</div>
            </div>
            <h3 className="text-[20px] font-bold text-white mb-2">Take the next step in your learning journey</h3>
            <p className="text-[14px] text-slate-300 mb-8 max-w-sm">
              You're 1 challenge away from your next achievement. Keep going!
            </p>
            <button className="w-full h-[44px] bg-blue-500 text-white rounded-[8px] font-bold text-sm hover:bg-blue-600 transition-colors">
              Explore Next Steps →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
