import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Clock, Trophy, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { authFetch } from "../api";
import { useAuth } from "../auth";

import { Editor } from "@monaco-editor/react";

interface Question {
  id: string;
  type: "mcq" | "coding";
  question: string;
  options: string[] | null;
  correctAnswer: string;
  starterCode?: string;
  language?: string;
}

interface AssessmentPlayerProps {
  category: string;
  subsection: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function AssessmentPlayer({ category, subsection, onClose, onComplete }: AssessmentPlayerProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    // Fetch questions
    let isMounted = true;
    const fetchQuestions = async () => {
      try {
        const encodedCategory = encodeURIComponent(category.trim());
        const encodedSubsection = encodeURIComponent(subsection.trim());
        const data = await authFetch<{ questions: any[] }>(`/assessments/questions/${encodedCategory}/${encodedSubsection}`);
        
        if (!data.questions || data.questions.length === 0) {
          if (isMounted) {
            setError('No questions found for this assessment.');
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setQuestions(data.questions);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Failed to fetch questions:", err);
        if (isMounted) {
          setError(err?.message || 'Failed to connect to server.');
          setLoading(false);
        }
      }
    };
    fetchQuestions();

    return () => { isMounted = false; };
  }, [category, subsection]);

  useEffect(() => {
    // Timer
    if (loading || result) return;
    const interval = setInterval(() => {
      setTimeSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, result]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const userId = user?.id;

      if (!userId) {
        alert('You must be logged in to submit.');
        setIsSubmitting(false);
        return;
      }

      // Note: Score is now securely calculated on the backend since
      // correctAnswer is stripped from the payload for non-admins.
      const correctCount = 0;

      const requestBody = {
        category,
        subsection,
        score: correctCount,
        totalQuestions: questions.length,
        timeTaken: timeSeconds,
        answers: questions.map((q) => ({
          questionId: q.id,
          userAnswer: answers[q.id] || ''
        }))
      };

      const data = await authFetch<{ score: number; passed: boolean }>('/assessments/submit', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      setResult(data);

    } catch (err) {
      console.error("Failed to submit assessment:", err);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-surface)] backdrop-blur-md">
        <Loader2 size={48} className="text-[var(--brand-primary)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-surface)] backdrop-blur-md">
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-10 max-w-md w-full text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[var(--danger)]/10 flex items-center justify-center mb-6">
            <AlertCircle size={40} className="text-[var(--danger)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Unable to Load Assessment</h2>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-3.5 bg-[var(--button-secondary-bg)] hover:bg-[var(--bg-elevated)] border border-[var(--button-secondary-border)] text-[var(--button-secondary-text)] font-semibold rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-surface)] backdrop-blur-md">
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-10 max-w-md w-full text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[var(--warning)]/10 flex items-center justify-center mb-6">
            <AlertCircle size={40} className="text-[var(--warning)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Questions Coming Soon</h2>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            We are still preparing questions for <span className="text-[var(--text-primary)] font-medium">{subsection}</span>. Please check back soon.
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-3.5 bg-[var(--button-secondary-bg)] hover:bg-[var(--bg-elevated)] border border-[var(--button-secondary-border)] text-[var(--button-secondary-text)] font-semibold rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-main)] overflow-hidden">
        
        <div className="relative z-10 p-10 max-w-md w-full bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-primary)] rounded-3xl text-center transform transition-all duration-500 scale-100 shadow-xl">
          <div className="mb-6 flex justify-center">
            {result.passed ? (
              <div className="w-24 h-24 rounded-full bg-[var(--success)]/15 flex items-center justify-center ring-4 ring-[var(--success)]/20">
                <Trophy size={48} className="text-[var(--success)]" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-[var(--warning)]/15 flex items-center justify-center ring-4 ring-[var(--warning)]/20">
                <RefreshCw size={48} className="text-[var(--warning)]" />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">
            {result.passed ? "Assessment Passed!" : "Keep Practicing!"}
          </h2>
          
          <div className="text-5xl font-black text-[var(--brand-primary)] my-6">
            {result.score} <span className="text-2xl text-[var(--text-muted)]">/ {questions.length}</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] mb-8">
            <Clock size={16} />
            <span>Time Taken: {formatTime(timeSeconds)}</span>
          </div>

          <button
            onClick={() => {
              onComplete();
              onClose();
            }}
            className="w-full py-4 rounded-xl font-bold text-[var(--button-primary-text)] bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] transition-all shadow-md hover:scale-[1.02]"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-main)] overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
        <button onClick={handleExit} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Exit</span>
        </button>
        
        <h1 className="text-xl font-bold text-[var(--text-primary)] absolute left-1/2 -translate-x-1/2 hidden md:block">
          {subsection}
        </h1>
        
        <div className="flex items-center gap-2 text-[var(--text-secondary)] bg-[var(--bg-surface)] px-4 py-1.5 rounded-full border border-[var(--border-primary)] shadow-sm">
          <Clock size={16} className="text-[var(--brand-primary)]" />
          <span className="font-mono font-medium">{formatTime(timeSeconds)}</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col max-w-4xl mx-auto w-full">
        
        {/* Progress Tracker */}
        <div className="flex flex-col items-center mb-10">
          <div className="text-[var(--text-muted)] text-sm font-medium mb-4">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="flex gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id].trim() !== "";
              const isActive = idx === currentIndex;
              return (
                <div 
                  key={q.id} 
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isActive ? "bg-[var(--brand-primary)] scale-125" : isAnswered ? "bg-[var(--brand-primary)]/40" : "bg-[var(--border-primary)]"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* QUESTION AREA */}
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 leading-relaxed">
            {currentQ.question}
          </h2>

          {currentQ.type === "mcq" && currentQ.options && currentQ.options.length > 0 && (
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                      isSelected 
                        ? "bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] shadow-sm" 
                        : "bg-[var(--surface-card)] border-[var(--border-primary)] hover:border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)]/5 hover:shadow-sm"
                    }`}
                  >
                    <span className={`text-lg transition-colors ${isSelected ? "text-[var(--brand-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>{opt}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border ${
                      isSelected ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]" : "bg-transparent text-transparent border-[var(--border-primary)] group-hover:border-[var(--brand-primary)]/50"
                    }`}>
                      {isSelected && <CheckCircle size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === "coding" && (
            <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] p-5 rounded-2xl shadow-sm transition-all duration-300">
              <div className="mb-4">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-surface)] px-3 py-1.5 rounded-lg border border-[var(--border-primary)] shadow-sm inline-block">
                  {currentQ.language || 'Code'}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-surface)]">
                <Editor
                  height="300px"
                  language={currentQ.language?.toLowerCase()}
                  theme="vs-light"
                  value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : (currentQ.starterCode || "")}
                  onChange={(value) => setAnswers({ ...answers, [currentQ.id]: value || "" })}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'monospace',
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                  }}
                  loading={
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NAVIGATION */}
        <div className="mt-12 flex items-center justify-between pt-6 border-t border-[var(--border-primary)]">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(i => i - 1)}
            className="px-6 py-3 rounded-xl font-bold text-[var(--button-secondary-text)] bg-[var(--button-secondary-bg)] border border-[var(--button-secondary-border)] hover:bg-[var(--bg-elevated)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              className="px-8 py-3 rounded-xl font-bold text-[var(--button-primary-text)] bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] transition-all shadow-sm"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-[var(--button-primary-text)] bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] transition-all shadow-md disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Submit Assessment"}
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
