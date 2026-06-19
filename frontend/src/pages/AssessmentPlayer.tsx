import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Clock, PlayCircle, Trophy, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../auth";

interface Question {
  id: string;
  type: "mcq";
  question: string;
  options: string[] | null;
  correctAnswer: string;
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
        const response = await fetch(`/api/assessments/questions/${encodedCategory}/${encodedSubsection}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          if (isMounted) {
            setError(errorData.message || 'No questions found for this assessment.');
            setLoading(false);
          }
          return;
        }

        const data = await response.json();
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
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        if (isMounted) {
          setError('Failed to connect to server.');
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

      const correctCount = questions.reduce((count, q) => {
        return answers[q.id] === q.correctAnswer ? count + 1 : count;
      }, 0);

      const requestBody = {
        userId,
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

      const response = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Submit failed:', errorData);
        throw new Error(errorData.error || 'Submission failed');
      }

      const data = await response.json();
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1e]/95 backdrop-blur-md">
        <Loader2 size={48} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  if (questions.length === 0 || error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1e]/95 backdrop-blur-md">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-md w-full text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
            <AlertCircle size={40} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Questions Coming Soon</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            We are still preparing questions for <span className="text-white font-medium">{subsection}</span>. Please check back soon.
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1e] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0a0f1e] to-blue-900/40 opacity-50"></div>
        
        <div className="relative z-10 p-10 max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl text-center transform transition-all duration-500 scale-100 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="mb-6 flex justify-center">
            {result.passed ? (
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <Trophy size={48} className="text-green-400" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <RefreshCw size={48} className="text-amber-400" />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold text-white mb-2">
            {result.passed ? "Assessment Passed!" : "Keep Practicing!"}
          </h2>
          
          <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent my-6">
            {result.score} <span className="text-2xl text-white/40">/ {questions.length}</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/60 mb-8">
            <Clock size={16} />
            <span>Time Taken: {formatTime(timeSeconds)}</span>
          </div>

          <button
            onClick={() => {
              onComplete();
              onClose();
            }}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0f1e] overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md">
        <button onClick={handleExit} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Exit</span>
        </button>
        
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent absolute left-1/2 -translate-x-1/2 hidden md:block">
          {subsection}
        </h1>
        
        <div className="flex items-center gap-2 text-white/80 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
          <Clock size={16} className="text-blue-400" />
          <span className="font-mono font-medium">{formatTime(timeSeconds)}</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col max-w-4xl mx-auto w-full">
        
        {/* Progress Tracker */}
        <div className="flex flex-col items-center mb-10">
          <div className="text-white/50 text-sm font-medium mb-4">
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
                    isActive ? "bg-white scale-125" : isAnswered ? "bg-blue-500" : "bg-white/20"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* QUESTION AREA */}
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
            {currentQ.question}
          </h2>

          {currentQ.options && (
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                      isSelected 
                        ? "bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    <span className={`text-lg ${isSelected ? "text-white" : "text-white/80"}`}>{opt}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? "bg-purple-500 text-white" : "bg-white/10 text-transparent border border-white/20 group-hover:border-white/40"
                    }`}>
                      {isSelected && <CheckCircle size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER NAVIGATION */}
        <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/10">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(i => i - 1)}
            className="px-6 py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              className="px-8 py-3 rounded-xl font-bold text-[#0a0f1e] bg-white hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Submit Assessment"}
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
