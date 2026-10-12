import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  courseName: string;
  lessonName: string;
  avgAttempts: string | number;
  masteryRate: number;
  difficultyScore: number;
}

interface ExerciseDifficultyCardProps {
  title: string;
  type: 'hardest' | 'easiest';
  exercises: Exercise[];
}

export function ExerciseDifficultyCard({ title, type, exercises }: ExerciseDifficultyCardProps) {
  const isHard = type === 'hardest';
  const headerIcon = isHard ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />;
  const borderColor = isHard ? 'border-red-900/50' : 'border-green-900/50';
  const bgColor = isHard ? 'bg-red-900/10' : 'bg-green-900/10';

  return (
    <div className={`bg-[var(--bg-body)] border ${borderColor} rounded-lg overflow-hidden`}>
      <div className={`p-4 border-b border-[var(--border-light)] ${bgColor} flex items-center gap-2`}>
        {headerIcon}
        <h3 className="text-lg font-bold text-[var(--color-brand-navy)]">{title}</h3>
      </div>
      
      <div className="divide-y divide-[var(--border-light)]">
        {exercises.length === 0 ? (
          <div className="p-6 text-center text-[var(--text-muted)]">No exercise data available.</div>
        ) : (
          exercises.map((ex, idx) => (
            <div key={ex.id} className="p-4 hover:bg-[var(--bg-surface)] transition-colors">
              <div className="flex gap-3">
                <div className="text-[var(--text-muted)] font-bold mt-0.5">#{idx + 1}</div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--text-main)] mb-1">{ex.name}</div>
                  <div className="text-xs text-[var(--text-secondary)] mb-3">
                    {ex.courseName} &middot; {ex.lessonName}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-3">
                    <div className="text-[var(--text-main)]">
                      <span className="text-[var(--text-muted)]">Avg attempts:</span> {ex.avgAttempts}
                    </div>
                    <div className="text-[var(--text-main)]">
                      <span className="text-[var(--text-muted)]">Mastery:</span> {ex.masteryRate}%
                    </div>
                    <div className="text-[var(--text-main)]">
                      <span className="text-[var(--text-muted)]">Difficulty Score:</span> {ex.difficultyScore}/10
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[var(--bg-dark-surface)] rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full ${isHard ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${ex.difficultyScore * 10}%` }}
                      ></div>
                    </div>
                    <div className={`text-xs font-medium ${isHard ? 'text-red-400' : 'text-green-400'}`}>
                      {Math.round(ex.difficultyScore * 10)}% hard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
