import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Edit2, 
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
  Shield 
} from 'lucide-react';

type TabView = 'profile' | 'settings';

export default function ProfilePage() {
  const [view, setView] = useState<TabView>('profile');
  const [settingsTab, setSettingsTab] = useState('profileInfo');

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
                      <div className="w-[72px] h-[72px] rounded-full bg-[#1F2937] flex items-center justify-center border-[3px] border-transparent"
                           style={{ background: 'linear-gradient(#1F2937, #1F2937) padding-box, linear-gradient(135deg, #3B82F6, #A855F7) border-box' }}>
                        <span className="text-xl font-bold text-white tracking-widest">NI</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="px-4 py-2 bg-transparent border border-blue-500 text-blue-400 rounded-[8px] text-sm font-medium hover:bg-blue-500/10 transition-colors w-fit">
                          Upload New
                        </button>
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
                        defaultValue="nishitha"
                        className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] px-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue="nishithaknidmegalpest@gmail.com"
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
                      defaultValue="Learning today, building tomorrow."
                      rows={3}
                      className="w-full bg-[#0D1117] border border-[#2D3748] rounded-[8px] p-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow resize-none"
                    />
                    <div className="text-right mt-1">
                      <span className="text-[11px] text-slate-500">35/140 characters</span>
                    </div>
                  </div>

                  {/* Row 4: Location & Date Joined */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] pl-9 pr-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-shadow appearance-none">
                          <option>Bengaluru, India</option>
                          <option>Mumbai, India</option>
                          <option>Delhi, India</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date Joined</label>
                      <div className="relative opacity-70">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text" 
                          defaultValue="June 17, 2026"
                          readOnly
                          className="w-full h-[44px] bg-[#0D1117] border border-[#2D3748] rounded-[8px] pl-9 pr-3 text-slate-300 text-sm focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#2D3748]">
                    <button className="h-[44px] px-6 bg-blue-500 text-white rounded-[8px] font-medium text-sm hover:bg-blue-600 active:scale-95 transition-all">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
            {settingsTab !== 'profileInfo' && (
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
            <div className="w-[72px] h-[72px] rounded-full bg-[#1F2937] flex items-center justify-center border-[3px] border-transparent shadow-lg z-10"
                 style={{ background: 'linear-gradient(#1F2937, #1F2937) padding-box, linear-gradient(135deg, #3B82F6, #A855F7) border-box' }}>
              <span className="text-xl font-bold text-white tracking-widest">NI</span>
            </div>
            <div className="mb-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[22px] font-bold text-white">nishitha</h1>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-[20px] border border-blue-500/30">
                  Student Learner
                </span>
              </div>
              <p className="text-[14px] text-slate-400">Learning today, building tomorrow.</p>
              <div className="flex items-center gap-4 mt-2 text-[12px] text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin size={14}/> Bengaluru, India</span>
                <span className="flex items-center gap-1.5"><Calendar size={14}/> Joined Jun 2026</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setView('settings')}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-blue-500 text-blue-400 rounded-[8px] text-sm font-medium hover:bg-blue-500/10 transition-colors"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Courses Completed', value: '2', icon: BookOpen, color: 'blue', colorHex: '#3B82F6' },
            { label: 'Projects Built', value: '4', icon: Code, color: 'purple', colorHex: '#A855F7' },
            { label: 'Certificates Earned', value: '2', icon: Award, color: 'green', colorHex: '#22C55E' },
            { label: 'Challenges Passed', value: '1', icon: Target, color: 'amber', colorHex: '#F59E0B' },
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
          
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {[
              { title: 'Calculator', tech: 'Python Flask', status: 'Completed', date: 'Jun 20 2026', color: 'green' },
              { title: 'Expense Tracker', tech: 'Python Flask', status: 'Completed', date: 'Jun 24 2026', color: 'green' },
              { title: 'Student Management System', tech: 'Python OOP', status: 'Completed', date: 'Jun 24 2026', color: 'green' },
              { title: 'AI Research Assistant', tech: 'Python AI', status: 'In Progress', date: 'Jun 05 2026', color: 'amber' },
            ].map((proj, i) => (
              <div key={i} className="min-w-[280px] bg-[#161B22] rounded-[12px] border border-[#2D3748] p-5 snap-start group hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-[15px] leading-tight">{proj.title}</h3>
                </div>
                <p className="text-[13px] text-slate-400 mb-4">{proj.tech}</p>
                <div className="flex justify-between items-center text-[11px]">
                  <span className={`px-2 py-0.5 rounded-[20px] font-medium border ${
                    proj.color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {proj.status}
                  </span>
                  <span className="text-slate-500">{proj.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CERTIFICATES & SKILLS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          
          {/* Certificates */}
          <div className="bg-[#161B22] rounded-[12px] border border-[#2D3748] p-6">
            <h2 className="text-[18px] font-bold text-white mb-5">Certificates Earned</h2>
            <div className="space-y-4">
              {[
                { name: 'Python Fundamentals', date: 'Jun 20 2026' },
                { name: 'AI Foundations', date: 'Jun 09 2026' },
              ].map((cert, i) => (
                <div key={i} className="relative bg-[#0D1117] rounded-[8px] border border-[#2D3748] p-4 flex items-center justify-between group overflow-hidden">
                  <div className="absolute top-0 left-0 w-8 h-8 bg-amber-500/20 rounded-br-full" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Award size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-white">{cert.name}</h4>
                      <p className="text-[12px] text-slate-400">Earned {cert.date}</p>
                    </div>
                  </div>
                  <button className="p-2 border border-[#2D3748] rounded-[8px] text-slate-400 hover:text-white hover:border-slate-500 transition-colors" title="Download">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-[#161B22] rounded-[12px] border border-[#2D3748] p-6">
            <h2 className="text-[18px] font-bold text-white mb-5">Skill Proficiency</h2>
            <div className="space-y-5">
              {[
                { group: 'Languages', skills: [{ name: 'Python Fundamentals', val: 85 }, { name: 'Prompt Engineering', val: 70 }] },
                { group: 'Concepts', skills: [{ name: 'Problem Solving', val: 90 }, { name: 'OOP Concepts', val: 65 }] },
                { group: 'AI Tools', skills: [{ name: 'AI Foundations', val: 80 }] },
              ].map((cat, i) => (
                <div key={i}>
                  <h4 className="text-[12px] uppercase tracking-wider text-slate-500 font-bold mb-3">{cat.group}</h4>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill, j) => (
                      <div key={j} className="relative group/pill">
                        <div className="overflow-hidden bg-[#1F2937] rounded-[20px] border border-[#2D3748] relative">
                          <div className="absolute top-0 left-0 h-full bg-blue-500/20" style={{ width: `${skill.val}%` }} />
                          <span className="relative z-10 text-[13px] text-slate-300 font-medium px-4 py-1.5 block">
                            {skill.name}
                          </span>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover/pill:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Proficiency: {skill.val}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* TIMELINE & NEXT STEPS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Timeline */}
          <div className="bg-[#161B22] rounded-[12px] border border-[#2D3748] p-6">
            <h2 className="text-[18px] font-bold text-white mb-6">Learning Timeline</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#2D3748] before:to-transparent">
              {[
                { date: 'Jun 28 2026', text: 'Completed Student Management System Project', color: 'purple' },
                { date: 'Jun 26 2026', text: 'Completed Python Fundamentals', color: 'green' },
                { date: 'Jun 17 2026', text: 'Joined Fraylon Academy', color: 'blue' },
              ].map((item, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-[#161B22] bg-${item.color}-500 absolute left-0 md:left-1/2 -translate-x-1/2 shrink-0 ${i === 0 ? 'shadow-[0_0_0_2px_rgba(255,255,255,0.2)] animate-pulse' : ''}`} />
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] ml-8 md:ml-0 p-4 rounded-[8px] bg-[#0D1117] border border-[#2D3748]">
                    <span className={`text-[11px] font-bold text-${item.color}-400 block mb-1`}>{item.date}</span>
                    <p className="text-[13px] text-slate-300">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 text-sm text-blue-400 hover:text-blue-300 font-medium">
              View full timeline ↓
            </button>
          </div>

          {/* Next Steps CTA */}
          <div className="rounded-[12px] border border-[#2D3748] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #1E3A5F, #1F2937)' }}>
            <div className="relative w-[80px] h-[80px] mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 * 0.25} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">75%</div>
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
