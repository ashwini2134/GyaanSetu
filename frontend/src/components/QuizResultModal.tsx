import React from 'react';
import { PartyPopper, AlertCircle, XCircle, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

interface FeedbackItem {
  questionId: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface QuizResult {
  score: number;
  passed: boolean;
  feedback: FeedbackItem[];
}

interface QuizResultModalProps {
  result: QuizResult | null;
  onClose: () => void;
  onRetry: () => void;
}

export function QuizResultModal({ result, onClose, onRetry }: QuizResultModalProps) {
  if (!result) return null;

  const { score, passed, feedback } = result;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border shadow-2xl ${
        passed 
          ? 'bg-slate-900 border-green-500/30 shadow-green-900/20' 
          : 'bg-slate-900 border-red-500/30 shadow-red-900/20'
      }`}>
        
        {/* Header section */}
        <div className={`p-8 text-center border-b ${
          passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 ring-4 ring-green-500/10">
                <PartyPopper size={40} />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 ring-4 ring-red-500/10">
                <AlertCircle size={40} />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {passed ? 'Quiz Passed!' : 'Quiz Failed'}
          </h2>
          <p className={`text-lg font-medium ${passed ? 'text-green-400' : 'text-red-400'}`}>
            You scored {Math.round(score)}%
          </p>
          <p className="text-sm text-slate-400 mt-2">
            {passed 
              ? 'Great job! You have unlocked the next lesson.' 
              : 'You need at least 70% to pass. Review the feedback below and try again.'}
          </p>
        </div>

        {/* Feedback section (only if failed and has feedback) */}
        {!passed && feedback.length > 0 && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 px-2">Areas to Review</h3>
            {feedback.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-3 w-full">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Your Answer</p>
                      <p className="text-sm font-medium text-red-300 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        {item.yourAnswer || "(Blank)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Correct Answer</p>
                      <p className="text-sm font-medium text-green-300 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {item.correctAnswer}
                      </p>
                    </div>
                    {item.explanation && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          <span className="font-semibold text-white">Explanation: </span> 
                          {item.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4 shrink-0">
          {passed ? (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
            >
              Continue to Next Lesson
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
