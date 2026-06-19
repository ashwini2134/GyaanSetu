import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { authFetch } from '../authClient';
import { Trophy, Flame, Medal, Crown, TrendingUp, BookOpen, Brain, Code, LayoutDashboard } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  lecturesCompleted: number;
  quizzesPassed: number;
  problemsSolved: number;
  projectsCompleted: number;
  streak: number;
  score: number;
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const data = await authFetch<{ leaderboard?: LeaderboardEntry[] }>('/progress/leaderboard');
    return data.leaderboard ?? [];
  } catch (err) {
    console.warn('Failed to fetch leaderboard:', err);
    return [];
  }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getGradient(index: number) {
  const gradients = [
    'from-yellow-400 to-amber-600',
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

function getLevel(score: number) {
  if (score >= 2000) return { label: 'Grandmaster', color: 'text-red-400', tier: 6 };
  if (score >= 1000) return { label: 'Master', color: 'text-purple-400', tier: 5 };
  if (score >= 500) return { label: 'Expert', color: 'text-blue-400', tier: 4 };
  if (score >= 250) return { label: 'Intermediate', color: 'text-emerald-400', tier: 3 };
  if (score >= 100) return { label: 'Apprentice', color: 'text-amber-400', tier: 2 };
  return { label: 'Beginner', color: 'text-slate-400', tier: 1 };
}

function nextLevelXp(score: number) {
  if (score >= 2000) return 0;
  if (score >= 1000) return 2000 - score;
  if (score >= 500) return 1000 - score;
  if (score >= 250) return 500 - score;
  if (score >= 100) return 250 - score;
  return 100 - score;
}

function levelProgress(score: number) {
  const thresholds = [0, 100, 250, 500, 1000, 2000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (score >= thresholds[i]) {
      const current = thresholds[i];
      const next = thresholds[i + 1] || current;
      const range = next - current;
      const progress = score - current;
      return Math.min(100, Math.round((progress / range) * 100));
    }
  }
  return 0;
}

const rankColors = [
  { ring: 'ring-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { ring: 'ring-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-400/20', text: 'text-slate-300' },
  { ring: 'ring-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/20', text: 'text-amber-600' },
];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, [user]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const currentUserEntry = entries.find(e => e.email === user?.email);

  function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 'first' | 'second' | 'third' }) {
    const heights = { first: 'h-48', second: 'h-36', third: 'h-28' };
    const icons = {
      first: <Crown size={32} className="text-yellow-400 drop-shadow-lg" />,
      second: <Medal size={28} className="text-slate-300" />,
      third: <Medal size={24} className="text-amber-600" />,
    };
    const label = { first: '1st', second: '2nd', third: '3rd' };
    const colors = rankColors[position === 'first' ? 0 : position === 'second' ? 1 : 2];

    return (
      <div className={`flex-1 flex flex-col items-center ${position === 'first' ? 'order-2 scale-105 z-10' : position === 'second' ? 'order-1' : 'order-3'}`}>
        <div className="flex flex-col items-center mb-3">
          {icons[position]}
          <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${colors.text}`}>{label[position]}</span>
        </div>
        <div className={`w-16 h-16 rounded-full ring-2 ${colors.ring} bg-gradient-to-br ${getGradient(entry.rank - 1)} flex items-center justify-center text-lg font-bold text-white shadow-xl mb-2`}>
          {getInitials(entry.name)}
        </div>
        <p className="text-sm font-bold text-white text-center truncate max-w-[120px]">{entry.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className={`text-[10px] font-semibold uppercase ${getLevel(entry.score).color}`}>{getLevel(entry.score).label}</span>
        </div>
        <p className="text-lg font-extrabold text-blue-400 mt-1">{entry.score}</p>
        <div className={`w-full max-w-[140px] ${heights[position]} rounded-t-xl border-t border-l border-r flex flex-col items-center justify-start pt-4 gap-1`} style={{
          background: `linear-gradient(180deg, ${position === 'first' ? 'rgba(234,179,8,0.08)' : position === 'second' ? 'rgba(203,213,225,0.06)' : 'rgba(217,119,6,0.06)'}, transparent)`,
          borderColor: position === 'first' ? 'rgba(234,179,8,0.3)' : position === 'second' ? 'rgba(203,213,225,0.2)' : 'rgba(217,119,6,0.2)',
        }}>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Flame size={12} className="text-amber-400" /> {entry.streak}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <BookOpen size={12} className="text-blue-400" /> {entry.lecturesCompleted}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Brain size={12} className="text-purple-400" /> {entry.quizzesPassed}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              <LayoutDashboard size={12} /> Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-medium">Leaderboard</span>
          </nav>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
              <Trophy size={28} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Leaderboard</h1>
              <p className="text-slate-400 text-sm mt-1">Top learners ranked by XP — complete courses, solve problems, and climb the ranks.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">No Rankings Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Complete lectures, pass quizzes, and submit projects to earn XP and appear on the leaderboard.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all"
            >
              <TrendingUp size={16} /> Start Learning
            </button>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length === 3 && (
              <div className="mb-10">
                <div className="flex items-end justify-center gap-3 md:gap-6">
                  <PodiumCard entry={top3[1]} position="second" />
                  <PodiumCard entry={top3[0]} position="first" />
                  <PodiumCard entry={top3[2]} position="third" />
                </div>
              </div>
            )}

            {/* Current user mini-card (if not in top 3) */}
            {currentUserEntry && top3.length === 3 && !top3.find(e => e.email === user?.email) && (
              <div className="mb-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full ring-2 ring-blue-400/50 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {getInitials(currentUserEntry.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">#{currentUserEntry.rank} — {currentUserEntry.name} <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full ml-1">You</span></p>
                    <p className="text-xs text-slate-400">{currentUserEntry.score} XP — {currentUserEntry.lecturesCompleted} lectures, {currentUserEntry.quizzesPassed} quizzes, {currentUserEntry.projectsCompleted} projects</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[11px] font-semibold uppercase ${getLevel(currentUserEntry.score).color}`}>{getLevel(currentUserEntry.score).label}</p>
                  {nextLevelXp(currentUserEntry.score) > 0 && (
                    <p className="text-[10px] text-slate-500">{nextLevelXp(currentUserEntry.score)} XP to next level</p>
                  )}
                </div>
              </div>
            )}

            {/* Leaderboard list */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-5 py-3.5 border-b border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-1 md:col-span-1">#</div>
                <div className="col-span-4 md:col-span-4">Name</div>
                <div className="col-span-2 text-center hidden md:block">Lectures</div>
                <div className="col-span-2 text-center hidden md:block">Quizzes</div>
                <div className="col-span-2 text-center hidden md:block">Projects</div>
                <div className="col-span-2 md:col-span-1 text-center hidden md:block">Streak</div>
                <div className="col-span-3 md:col-span-2 text-right">XP</div>
              </div>

              <div className="divide-y divide-slate-800/40">
                {rest.length > 0 ? (
                  rest.map((entry, i) => {
                    const actualRank = i + 4;
                    const isYou = entry.email === user?.email;
                    return (
                      <div
                        key={entry.email}
                        className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors hover:bg-slate-800/20 ${
                          isYou ? 'bg-blue-500/5 relative' : ''
                        }`}
                      >
                        {isYou && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400" />}
                        <div className="col-span-1 flex items-center">
                          <span className="text-sm font-mono text-slate-500 w-6">{actualRank}</span>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(actualRank - 1)} flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0`}>
                            {getInitials(entry.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-200 truncate flex items-center gap-2">
                              {entry.name}
                              {isYou && <span className="text-[9px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">You</span>}
                            </p>
                            <span className={`text-[10px] font-medium ${getLevel(entry.score).color}`}>{getLevel(entry.score).label}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center text-xs text-slate-400 hidden md:block">{entry.lecturesCompleted}</div>
                        <div className="col-span-2 text-center text-xs text-slate-400 hidden md:block">{entry.quizzesPassed}</div>
                        <div className="col-span-2 text-center text-xs text-slate-400 hidden md:block">{entry.projectsCompleted}</div>
                        <div className="col-span-1 text-center hidden md:block">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Flame size={12} className={entry.streak > 0 ? 'text-amber-400' : 'text-slate-600'} />
                            <span className={entry.streak > 0 ? 'text-amber-400' : 'text-slate-500'}>{entry.streak}</span>
                          </span>
                        </div>
                        <div className="col-span-3 md:col-span-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="hidden md:block w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${levelProgress(entry.score)}%` }} />
                            </div>
                            <span className="text-sm font-bold text-blue-400">{entry.score}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    {entries.length <= 3 ? 'Only top 3 ranked so far. Keep learning to see more competitors!' : 'No more entries.'}
                  </div>
                )}
              </div>
            </div>

            {/* Rules card */}
            <div className="mt-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-sm font-bold">i</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-1">How XP is Earned</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {[
                      { label: 'Lecture', xp: 50, icon: BookOpen, color: 'text-blue-400' },
                      { label: 'Quiz Pass', xp: 30, icon: Brain, color: 'text-purple-400' },
                      { label: 'Problem', xp: 20, icon: Code, color: 'text-emerald-400' },
                      { label: 'Project', xp: 100, icon: Trophy, color: 'text-amber-400' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <Icon size={14} className={item.color} />
                          <div>
                            <p className="text-[11px] text-slate-400">{item.label}</p>
                            <p className={`text-xs font-bold ${item.color}`}>+{item.xp} XP</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Daily streaks also multiply your learning momentum. Rankings update in real-time as you progress.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
