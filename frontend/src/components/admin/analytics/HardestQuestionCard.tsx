import React from 'react';
import { Check, X } from 'lucide-react';

interface HardestQuestionProps {
  rank: number;
  question: {
    id: string;
    question: string;
    courseName: string;
    quizName: string;
    correctRate: number;
    answers: Array<{
      text: string;
      percentage: number;
      isCorrect: boolean;
      count: number;
    }>;
  };
}

export function HardestQuestionCard({ rank, question }: HardestQuestionProps) {
  // Sort answers by percentage descending
  const sortedAnswers = [...question.answers].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg overflow-hidden flex flex-col">
      <div className="border-l-4 border-red-500 p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)] font-bold">#{rank}</span>
            <span className="uppercase text-xs font-bold text-[var(--text-muted)] tracking-wider">Hardest</span>
          </div>
          <div className={`font-bold ${question.correctRate < 50 ? 'text-red-500' : 'text-yellow-500'}`}>
            {question.correctRate}% correct
          </div>
        </div>

        <div className="text-xs text-[var(--text-secondary)] mb-1">
          Course: {question.courseName}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mb-3">
          Quiz: {question.quizName}
        </div>

        <div className="text-base text-[var(--text-main)] font-medium mb-5 bg-[var(--bg-surface)] p-3 rounded border border-[var(--border-light)]">
          "{question.question}"
        </div>

        <div className="space-y-3">
          <div className="text-xs text-[var(--text-muted)] uppercase font-medium">Answer breakdown:</div>
          
          {sortedAnswers.map((ans, idx) => (
            <div key={idx} className="flex items-center text-sm">
              <div className="w-6 flex-shrink-0 flex justify-center">
                {ans.isCorrect ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex-grow flex items-center pr-2">
                <div className={`truncate max-w-[140px] md:max-w-[180px] ${ans.isCorrect ? 'text-green-500' : 'text-[var(--text-secondary)]'}`} title={ans.text}>
                  "{ans.text}"
                </div>
                <div className="mx-2 text-[var(--text-muted)] flex-grow border-b border-dashed border-[var(--border-light)]"></div>
                <div className={`font-medium ${ans.isCorrect ? 'text-green-500' : 'text-[var(--text-secondary)]'}`}>
                  {ans.percentage}%
                </div>
              </div>
              <div className="w-24 bg-[var(--bg-dark-surface)] rounded-full h-1.5 flex-shrink-0">
                <div 
                  className={`h-1.5 rounded-full ${ans.isCorrect ? 'bg-green-500' : 'bg-[var(--text-muted)]'}`}
                  style={{ width: `${Math.max(0, Math.min(100, ans.percentage))}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
