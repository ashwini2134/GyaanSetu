import { useState } from 'react';

interface Task { id: string; name: string; icon: string; hours: number; marks: number; }

const ALL_TASKS: Task[] = [
  { id: 'theory', name: 'AI Theory', icon: '📘', hours: 2, marks: 30 },
  { id: 'coding', name: 'Coding Practice', icon: '💻', hours: 2, marks: 40 },
  { id: 'revision', name: 'Revision', icon: '📝', hours: 1, marks: 20 },
  { id: 'break', name: 'Break (no marks)', icon: '☕', hours: 1, marks: 0 },
  { id: 'lecture', name: 'Watch Lecture', icon: '🎥', hours: 2, marks: 25 },
];

const MAX_HOURS = 5;

export default function StudyDayPlanner() {
  const [schedule, setSchedule] = useState<string[]>([]);
  const [bestSchedule, setBestSchedule] = useState<string[] | null>(null);
  const [bestMarks, setBestMarks] = useState(0);

  const available = ALL_TASKS.filter(t => !schedule.includes(t.id) && t.hours > 0);

  const addTask = (id: string) => {
    const task = ALL_TASKS.find(t => t.id === id)!;
    const currentHours = schedule.reduce((s, tid) => s + ALL_TASKS.find(t => t.id === tid)!.hours, 0);
    if (currentHours + task.hours <= MAX_HOURS) {
      setSchedule(prev => [...prev, id]);
    }
  };

  const removeTask = (id: string) => {
    setSchedule(prev => prev.filter(x => x !== id));
  };

  const moveTask = (from: number, to: number) => {
    const copy = [...schedule];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    setSchedule(copy);
  };

  const totalHours = schedule.reduce((s, id) => s + ALL_TASKS.find(t => t.id === id)!.hours, 0);
  const totalMarks = schedule.reduce((s, id) => s + ALL_TASKS.find(t => t.id === id)!.marks, 0);

  const checkBest = () => {
    let bestM = 0;
    let bestSched: string[] = [];

    const findBest = (selected: string[], remaining: Task[], hoursLeft: number): void => {
      const marks = selected.reduce((s, id) => s + ALL_TASKS.find(t => t.id === id)!.marks, 0);
      if (marks > bestM) {
        bestM = marks;
        bestSched = [...selected];
      }
      for (const task of remaining) {
        if (task.hours <= hoursLeft) {
          findBest([...selected, task.id], remaining.filter(t => t.id !== task.id), hoursLeft - task.hours);
        }
      }
    };

    findBest([], ALL_TASKS, MAX_HOURS);
    setBestSchedule(bestSched);
    setBestMarks(bestM);
  };

  return (
    <div className="mt-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        <span className="text-rose-300 font-medium">Organize Your Study Day!</span> You have <strong>5 hours</strong> before the exam.
        Each task takes time and gives marks. Build a schedule to maximize your marks.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <h4 className="text-[10px] font-bold text-slate-300 mb-3">Available Tasks</h4>
          <div className="space-y-2">
            {ALL_TASKS.map(task => {
              const inSchedule = schedule.includes(task.id);
              const disabled = !inSchedule && (totalHours + task.hours > MAX_HOURS);
              return (
                <div key={task.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                    inSchedule
                      ? 'bg-rose-600/10 border border-rose-500/20 text-rose-300'
                      : disabled
                      ? 'bg-slate-800/20 border border-slate-700/30 text-slate-300'
                      : 'bg-slate-800/40 border border-slate-700/50 text-slate-300'
                  }`}>
                  <span className="text-base">{task.icon}</span>
                  <span className="flex-1">{task.name}</span>
                  <span className="text-slate-300">{task.hours}h</span>
                  <span className="text-amber-400">+{task.marks} marks</span>
                  {!inSchedule ? (
                    <button onClick={() => addTask(task.id)} disabled={disabled}
                      className="px-2 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-[10px] disabled:opacity-30">
                      Add
                    </button>
                  ) : (
                    <button onClick={() => removeTask(task.id)}
                      className="px-2 py-1 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-[10px]">
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <h4 className="text-[10px] font-bold text-slate-300 mb-3">Your Schedule</h4>
          {schedule.length === 0 ? (
            <p className="text-xs text-slate-300 italic">Add tasks to build your schedule...</p>
          ) : (
            <div className="space-y-1.5 mb-3">
              {schedule.map((id, i) => {
                const task = ALL_TASKS.find(t => t.id === id)!;
                return (
                  <div key={id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300">
                    <span className="text-slate-300 w-4">{i + 1}.</span>
                    <span className="text-base">{task.icon}</span>
                    <span className="flex-1">{task.name}</span>
                    <span className="text-slate-300">{task.hours}h</span>
                    <span className="text-amber-400">+{task.marks}</span>
                    <div className="flex gap-0.5">
                      {i > 0 && <button onClick={() => moveTask(i, i - 1)} className="text-slate-300 hover:text-slate-300 text-[10px]">↑</button>}
                      {i < schedule.length - 1 && <button onClick={() => moveTask(i, i + 1)} className="text-slate-300 hover:text-slate-300 text-[10px]">↓</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Time Used</span>
              <span className={totalHours > MAX_HOURS ? 'text-red-400 font-bold' : 'text-slate-300'}>{totalHours} / {MAX_HOURS} hours</span>
            </div>
            <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden mb-2">
              <div className={`h-full rounded-full ${totalHours > MAX_HOURS ? 'bg-red-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, (totalHours / MAX_HOURS) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Marks Expected</span>
              <span className="text-amber-400 font-bold">{totalMarks}</span>
            </div>
          </div>

          {schedule.length > 0 && (
            <button onClick={checkBest}
              className="mt-3 w-full px-3 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-xs font-bold text-rose-300 hover:bg-rose-600/30 transition-colors">
              Find Optimal Schedule
            </button>
          )}

          {bestSchedule && (
            <div className="mt-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 p-3">
              <p className="text-xs text-emerald-300 font-bold mb-1">Optimal schedule found!</p>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Best: {bestSchedule.map(id => ALL_TASKS.find(t => t.id === id)!.icon).join(' ')} = {bestMarks} marks
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-rose-400 font-semibold">State Space + Optimization:</span> Each schedule is a <span className="text-rose-300">state</span>.
          All possible schedules form the <span className="text-rose-300">state space</span>.
          Optimization finds the schedule with the <span className="text-rose-300">highest marks</span> within the time constraint.
        </p>
      </div>
    </div>
  );
}
