import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { authFetch } from '../authClient';
import { 
  Trophy, 
  Flame, 
  BookOpen, 
  Brain, 
  Code, 
  LayoutDashboard, 
  Search,
  Sparkles,
  Info,
  Award,
  TrendingUp
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  streak: number;
  longestStreak: number;
  problemsSolved: number;
  coursesCompleted: number;
  projectsCompleted: number;
  score: number;
  allTimeXp: number;
  rankTitle: string;
  rankMovement: string;
}

interface CurrentUserCard {
  rank: number;
  totalLearners: number;
  score: number;
  allTimeXp: number;
  streak: number;
  longestStreak: number;
  problemsSolved: number;
  coursesCompleted: number;
  projectsCompleted: number;
  rankTitle: string;
  currentTitle: string;
  nextTitle: string | null;
  nextThreshold: number;
  progressPercent: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  totalLearners: number;
  currentUser: CurrentUserCard | null;
}

function getTitleColorClass(title: string) {
  const t = title.toLowerCase();
  if (t === 'legend') return 'text-red-400 bg-red-500/10 border-red-500/20 font-black animate-pulse';
  if (t === 'grandmaster') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 font-extrabold';
  if (t === 'master') return 'text-purple-400 bg-purple-500/10 border-purple-500/20 font-extrabold';
  if (t === 'builder') return 'text-blue-400 bg-blue-500/10 border-blue-500/20 font-extrabold';
  if (t === 'explorer') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-extrabold';
  return 'text-slate-400 bg-slate-500/10 border-slate-500/20 font-extrabold';
}

function getInitials(name: string) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getGradient(index: number) {
  const gradients = [
    'from-amber-400 to-yellow-600',
    'from-slate-300 to-slate-500',
    'from-amber-600 to-orange-700',
    'from-blue-400 to-purple-600',
    'from-emerald-400 to-teal-600',
    'from-rose-400 to-pink-600',
    'from-cyan-400 to-blue-600',
    'from-violet-400 to-indigo-600',
  ];
  return gradients[index % gradients.length];
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalLearners, setTotalLearners] = useState(0);
  const [currentUserCard, setCurrentUserCard] = useState<CurrentUserCard | null>(null);
  
  const [timeframe, setTimeframe] = useState<'all-time' | 'weekly' | 'monthly'>('all-time');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    authFetch<LeaderboardResponse>(`/progress/leaderboard?timeframe=${timeframe}`)
      .then(data => {
        if (!active) return;
        setEntries(data.leaderboard ?? []);
        setTotalLearners(data.totalLearners ?? 0);
        setCurrentUserCard(data.currentUser ?? null);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Failed to fetch leaderboard:', err);
        if (active) setLoading(false);
      });
      
    return () => {
      active = false;
    };
  }, [timeframe, user]);

  const filteredEntries = entries.filter(entry => 
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = entries.slice(0, 3);
  const rest = filteredEntries.filter(e => !top3.find(t => t.id === e.id));

  function renderMovement(movement: string) {
    if (movement === 'NEW') {
      return (
        <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
          NEW
        </span>
      );
    }
    if (movement.startsWith('↑')) {
      return <span className="text-xs font-bold text-emerald-400 flex items-center">{movement}</span>;
    }
    if (movement.startsWith('↓')) {
      return <span className="text-xs font-bold text-rose-400 flex items-center">{movement}</span>;
    }
    return <span className="text-xs text-slate-500 font-medium">—</span>;
  }

  function getPodiumBorder(position: 'first' | 'second' | 'third') {
    if (position === 'first') return 'border-yellow-400/40 shadow-yellow-400/5 bg-[#1F190D]/50';
    if (position === 'second') return 'border-slate-400/30 shadow-slate-400/5 bg-[#131722]/50';
    return 'border-amber-600/30 shadow-amber-600/5 bg-[#1C1610]/50';
  }

  function getPodiumBadge(position: 'first' | 'second' | 'third') {
    if (position === 'first') return 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30';
    if (position === 'second') return 'bg-slate-300/20 text-slate-200 border border-slate-300/30';
    return 'bg-amber-600/20 text-amber-400 border border-amber-600/30';
  }

  function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 'first' | 'second' | 'third' }) {
    const label = { first: 'Gold #1', second: 'Silver #2', third: 'Bronze #3' };
    const order = position === 'first' ? 'order-1 md:order-2 scale-105 z-10' : position === 'second' ? 'order-2 md:order-1' : 'order-3';

    return (
      <div 
        onClick={() => navigate('/profile/' + entry.id)}
        className={`flex-1 flex flex-col items-center p-5 rounded-2xl border backdrop-blur-md shadow-xl transition-all hover:scale-[1.02] cursor-pointer ${getPodiumBorder(position)} ${order}`}
      >
        <div className="flex flex-col items-center mb-3">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${getPodiumBadge(position)}`}>
            {label[position]}
          </span>
        </div>
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 flex items-center justify-center text-lg font-bold text-white shadow-lg overflow-hidden">
            {entry.avatarUrl ? (
              <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className={`bg-gradient-to-br ${getGradient(entry.rank - 1)} w-full h-full flex items-center justify-center`}>
                {getInitials(entry.name)}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-300">
            {entry.rank}
          </div>
        </div>
        
        <p className="text-sm font-bold text-white text-center truncate max-w-[130px]">{entry.name}</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${getTitleColorClass(entry.rankTitle)}`}>
          {entry.rankTitle}
        </span>
        
        <div className="my-3 text-center">
          <p className="text-2xl font-black text-blue-400 bg-blue-500/5 border border-blue-500/10 shadow-inner px-3 py-1 rounded-xl">
            {entry.score} XP
          </p>
        </div>

        <div className="w-full flex flex-col gap-1.5 text-xs border-t border-slate-800/60 pt-3 mt-1">
          <div className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <Flame size={13} className="text-amber-500 fill-amber-500" />
            <span className="font-semibold text-slate-200">{entry.streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <Brain size={13} className="text-purple-400" />
            <span className="font-semibold text-slate-200">{entry.problemsSolved} Problems Solved</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <BookOpen size={13} className="text-blue-400" />
            <span className="font-semibold text-slate-200">{entry.coursesCompleted} Courses Completed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <Code size={13} className="text-emerald-400" />
            <span className="font-semibold text-slate-200">{entry.projectsCompleted} Projects Completed</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 pb-16 font-sans">
      <div className="relative overflow-hidden border-b border-slate-900 bg-[#080d1a]/50">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium bg-transparent border-0 cursor-pointer">
              <LayoutDashboard size={12} /> Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-semibold">Leaderboard</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 shadow-lg shadow-yellow-500/2">
                <Trophy size={28} className="text-yellow-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                  🏆 Leaderboard
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="text-slate-400 text-sm font-bold">Learn. Build. Compete.</span>
                  <button 
                    onClick={() => setShowRulesModal(true)} 
                    className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
                  >
                    <Info size={11} /> How Rankings Work
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-1.5 max-w-xl">
                  Rankings are determined by XP, consistency, problem solving, course completion, and project completion.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 self-start md:self-center">
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 px-4 py-2.5 rounded-2xl shadow-xl shadow-blue-500/2">
                <Sparkles size={16} className="text-blue-400" />
                <span className="text-sm font-extrabold text-blue-300">{totalLearners.toLocaleString()} Active Learners Competing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        
        {currentUserCard ? (
          <div className="mb-8 bg-gradient-to-r from-blue-950/40 via-slate-900/50 to-purple-950/40 border border-blue-500/25 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
            
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col items-center justify-center bg-slate-950/60 border border-blue-500/30 rounded-2xl p-6 min-w-[200px] text-center shadow-xl flex-shrink-0">
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {currentUserCard.score} XP
                </p>
                <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border mt-2 ${getTitleColorClass(currentUserCard.rankTitle)}`}>
                  {currentUserCard.rankTitle}
                </span>
                <p className="text-sm text-yellow-400 font-extrabold mt-3 bg-yellow-500/10 border border-yellow-500/25 px-3 py-1 rounded-full shadow-inner">
                  Rank #{currentUserCard.rank}
                </p>
              </div>

              <div className="flex flex-col gap-4 flex-grow">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border border-blue-400/20 flex items-center justify-center text-sm font-bold text-white shadow-xl flex-shrink-0 overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name || 'User')
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white">
                      {user?.name || 'Your Profile'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <Sparkles size={11} className="text-emerald-400 animate-pulse" />
                      <span>
                        You are ahead of {currentUserCard.totalLearners - currentUserCard.rank} learners ({currentUserCard.rank === 1 ? 'Top Ranker' : `Top ${Math.max(1, Math.ceil((currentUserCard.rank / currentUserCard.totalLearners) * 100))}%`})!
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 max-w-xl">
                  <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Streak</p>
                    <p className="text-sm font-black text-amber-500 mt-0.5">{currentUserCard.streak} Days</p>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Problems Solved</p>
                    <p className="text-sm font-black text-purple-400 mt-0.5">{currentUserCard.problemsSolved}</p>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Courses Completed</p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">{currentUserCard.coursesCompleted}</p>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Projects Completed</p>
                    <p className="text-sm font-black text-rose-400 mt-0.5">{currentUserCard.projectsCompleted}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center min-w-[200px] lg:border-l lg:border-slate-800/80 lg:pl-6">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
                  <span className="font-extrabold text-blue-400">{currentUserCard.allTimeXp} / {currentUserCard.nextThreshold} XP</span>
                  {currentUserCard.nextTitle ? (
                    <span className="text-slate-400 font-medium">Next Rank: <span className="font-bold text-white">{currentUserCard.nextTitle}</span></span>
                  ) : (
                    <span className="text-amber-400 font-bold">Max Rank Achieved</span>
                  )}
                </div>
                <div className="w-full bg-slate-950/80 border border-slate-850 h-3.5 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500" 
                    style={{ width: `${currentUserCard.progressPercent}%` }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1.5 self-end">
                  {currentUserCard.progressPercent}% Complete
                </span>
              </div>
            </div>
          </div>
        ) : (
          user && (
            <div className="mb-8 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-sm text-slate-500">
              Your Position Card loading... Make sure your profile matches student status.
            </div>
          )
        )}

        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex bg-[#0E1324] border border-slate-800 p-1 rounded-xl">
            {(['all-time', 'weekly', 'monthly'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTimeframe(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide cursor-pointer border-0 ${
                  timeframe === tab 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                    : 'text-slate-400 hover:text-slate-200 bg-transparent'
                }`}
              >
                {tab === 'all-time' ? 'All-Time' : tab === 'weekly' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Learner..."
              className="w-full bg-[#0E1324] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-slate-850 flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-black text-slate-300 mb-2">No Rankings Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Start learning to climb the leaderboard. Real-time metrics will show up once a learner completes dynamic exercises.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer border-0"
            >
              <TrendingUp size={16} /> Start Learning
            </button>
          </div>
        ) : (
          <>
            {top3.length > 0 && searchQuery === '' && (
              <div className="mb-10">
                <div className="flex flex-col md:flex-row items-stretch md:items-end justify-center gap-4 md:gap-6">
                  {top3[1] && <PodiumCard entry={top3[1]} position="second" />}
                  {top3[0] && <PodiumCard entry={top3[0]} position="first" />}
                  {top3[2] && <PodiumCard entry={top3[2]} position="third" />}
                </div>
              </div>
            )}

            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-4 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-900/50">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-1 text-center">Trend</div>
                <div className="col-span-3">Learner</div>
                <div className="col-span-2 text-center">Streak</div>
                <div className="col-span-1 text-center">Problems Solved</div>
                <div className="col-span-1 text-center">Courses Completed</div>
                <div className="col-span-1 text-center">Projects Completed</div>
                <div className="col-span-2 text-right">XP</div>
              </div>

              <div className="divide-y divide-slate-800/40">
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => {
                    const isYou = entry.email === user?.email;
                    return (
                      <div
                        key={entry.id}
                        onClick={() => navigate('/profile/' + entry.id)}
                        className={`grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 items-center transition-colors cursor-pointer ${
                          isYou 
                            ? 'bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-l-4 border-blue-500 shadow-[inset_1px_0_0_rgba(59,130,246,0.3)] relative font-bold' 
                            : 'hover:bg-slate-800/20'
                        }`}
                      >
                        <div className="col-span-1 flex items-center justify-between md:justify-center">
                          <span className="text-xs text-slate-400 font-bold md:hidden">RANK</span>
                          <span className="text-sm font-extrabold font-mono text-slate-300">#{entry.rank}</span>
                        </div>

                        <div className="col-span-1 flex items-center justify-between md:justify-center">
                          <span className="text-xs text-slate-400 font-bold md:hidden">TREND</span>
                          {renderMovement(entry.rankMovement)}
                        </div>

                        <div className="col-span-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0 overflow-hidden">
                            {entry.avatarUrl ? (
                              <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className={`bg-gradient-to-br ${getGradient(entry.rank - 1)} w-full h-full flex items-center justify-center`}>
                                {getInitials(entry.name)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-200 truncate flex items-center gap-1.5">
                              {entry.name}
                              {isYou && <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full uppercase">You</span>}
                            </p>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border mt-1 inline-block ${getTitleColorClass(entry.rankTitle)}`}>
                              {entry.rankTitle}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-between md:justify-center">
                          <span className="text-xs text-slate-400 font-bold md:hidden">STREAK</span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                            <Flame size={13} className="text-amber-500 fill-amber-500" />
                            <span>{entry.streak} Days</span>
                          </span>
                        </div>

                        <div className="col-span-1 flex items-center justify-between md:justify-center">
                          <span className="text-xs text-slate-400 font-bold md:hidden">PROBLEMS SOLVED</span>
                          <span className="text-xs text-slate-300 font-semibold">{entry.problemsSolved}</span>
                        </div>

                        <div className="col-span-1 flex items-center justify-between md:justify-center">
                          <span className="text-xs text-slate-400 font-bold md:hidden">COURSES COMPLETED</span>
                          <span className="text-xs text-slate-300 font-semibold">{entry.coursesCompleted}</span>
                        </div>

                        <div className="col-span-1 flex items-center justify-between md:justify-center">
                          <span className="text-xs text-slate-400 font-bold md:hidden">PROJECTS COMPLETED</span>
                          <span className="text-xs text-slate-300 font-semibold">{entry.projectsCompleted}</span>
                        </div>

                        <div className="col-span-2 flex items-center justify-between md:justify-end">
                          <span className="text-xs text-slate-400 font-bold md:hidden">XP</span>
                          <span className="text-sm font-black text-blue-400 bg-blue-500/5 px-3 py-1 rounded-lg border border-blue-500/10 shadow-sm">{entry.score} XP</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    No results match your search query "{searchQuery}".
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              
              <div className="bg-[#0b0f19] border border-slate-900 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <Info size={16} className="text-blue-500" />
                  How Ranking Works
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Ranking priority is calculated using the following strict hierarchy to reward consistent and capstone-oriented learning:
                </p>
                <ol className="space-y-2 text-xs">
                  {[
                    'Overall XP or timeframe XP (Highest)',
                    'Consistency / Current Streak',
                    'Coding Problems Solved',
                    'Courses Completed & Certified',
                    'Capstone Projects Completed (Tie-Breaker)'
                  ].map((step, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-300 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 font-semibold">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                  If metrics are completely equal, users who joined Fraylon Academy earlier are ranked higher.
                </p>
              </div>

              <div className="bg-[#0b0f19] border border-slate-900 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-yellow-500" />
                  How to Climb
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Complete challenges to earn XP points:
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Complete a Project', xp: '+100 XP', color: 'text-amber-400 bg-amber-500/10' },
                    { label: 'Finish a Lecture', xp: '+50 XP', color: 'text-blue-400 bg-blue-500/10' },
                    { label: 'Pass a Quiz', xp: '+30 XP', color: 'text-purple-400 bg-purple-500/10' },
                    { label: 'Solve a Problem', xp: '+20 XP', color: 'text-emerald-400 bg-emerald-500/10' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900/40 border border-slate-800/40">
                      <span className="text-slate-300 font-bold">{item.label}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${item.color}`}>
                        {item.xp}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-center text-[10px] text-amber-500 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl mt-4">
                  <Flame size={12} className="fill-amber-500 animate-bounce" />
                  <span className="font-semibold">Current Streak multiplies learning momentum!</span>
                </div>
              </div>

              <div className="bg-[#0b0f19] border border-slate-900 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <Award size={16} className="text-purple-500" />
                  Rank Titles Reference
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Earn points to unlock prestigious status titles displayed on your profile:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { title: 'Beginner', xp: '0-99 XP' },
                    { title: 'Explorer', xp: '100-499 XP' },
                    { title: 'Builder', xp: '500-999 XP' },
                    { title: 'Master', xp: '1000-1999 XP' },
                    { title: 'Grandmaster', xp: '2000-4999 XP' },
                    { title: 'Legend', xp: '5000+ XP' },
                  ].map((tier, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-center text-center ${getTitleColorClass(tier.title)}`}>
                      <span className="font-extrabold">{tier.title}</span>
                      <span className="text-[9px] opacity-80 mt-0.5">{tier.xp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0E1324] border border-blue-500/35 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <Award size={20} className="text-yellow-400" />
              How Rankings Work
            </h3>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Fraylon Academy rankings are computed dynamically using a strict hierarchy to reward consistent learning and capstone achievements.
            </p>
            
            <div className="space-y-2.5">
              {[
                { title: "1. Timeframe or Overall XP", desc: "Highest XP earned within the selected period." },
                { title: "2. Consistency / Current Streak", desc: "Higher learning consistency breaks XP ties." },
                { title: "3. Coding Problems Solved", desc: "More coding exercises solved breaks streak ties." },
                { title: "4. Courses Completed", desc: "More completed modules breaks problem ties." },
                { title: "5. Projects Completed", desc: "More completed capstone projects breaks course ties." },
                { title: "6. Join Date", desc: "Earlier registration date wins if all metrics are equal." }
              ].map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
                  <p className="text-xs font-extrabold text-slate-200">{rule.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{rule.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer border-0"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
