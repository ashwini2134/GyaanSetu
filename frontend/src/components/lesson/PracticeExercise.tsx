import { useEffect, useState } from "react";
import { authFetch } from "../../authClient";
import { Sparkles, Image, Quote, BookOpen, RefreshCw, CheckCircle } from "lucide-react";

interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
}

interface SubmissionResult {
  submission: {
    id: string;
    promptUsed: string;
    generatedOutput: string;
    reflection: string;
    submittedAt: string;
  };
  xpAwarded: number;
}

interface PracticeExerciseProps {
  lessonId: string;
  onComplete?: () => void;
}

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  image: { icon: <Image size={20} />, color: "from-purple-500 to-pink-500", label: "Generate an Image" },
  quote: { icon: <Quote size={20} />, color: "from-amber-500 to-orange-500", label: "Generate a Quote" },
  story: { icon: <BookOpen size={20} />, color: "from-blue-500 to-cyan-500", label: "Generate a Short Story" },
  reflection: { icon: <RefreshCw size={20} />, color: "from-green-500 to-emerald-500", label: "Write a Reflection" },
};

export default function PracticeExercise({ lessonId, onComplete }: PracticeExerciseProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<SubmissionResult["submission"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [promptUsed, setPromptUsed] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [exercisesData, submissionsData] = await Promise.all([
          authFetch<Exercise[]>(`/practice-exercises/${lessonId}`),
          authFetch<{ exercise: Exercise }[]>(`/practice-exercises/submissions/${lessonId}`),
        ]);
        setExercises(exercisesData);
        if (submissionsData.length > 0) {
          const sub = submissionsData[0];
          setSelected(sub.exercise);
          setExistingSubmission({
            id: "",
            promptUsed: "",
            generatedOutput: "",
            reflection: "",
            submittedAt: "",
          });
        }
      } catch (err) {
        console.error("[practice-exercise] load failed", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!selected || !promptUsed.trim() || !generatedOutput.trim() || !reflection.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authFetch<SubmissionResult>("/practice-exercises/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: selected.id,
          promptUsed: promptUsed.trim(),
          generatedOutput: generatedOutput.trim(),
          reflection: reflection.trim(),
        }),
      });
      setResult(res);
      onComplete?.();
    } catch (err: any) {
      if (err.status === 409) {
        setError("You already submitted this exercise.");
      } else {
        setError("Failed to submit. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return null;
  }

  if (result) {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">Practice Submitted!</p>
            <p className="text-slate-400 mt-2">Your AI practice exercise has been recorded.</p>
          </div>
          {result.xpAwarded > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">+{result.xpAwarded} XP</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (existingSubmission) {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 p-8 text-center space-y-4">
          <CheckCircle size={40} className="text-blue-400 mx-auto" />
          <p className="text-lg font-bold text-white">Practice Completed</p>
          <p className="text-sm text-slate-400">You have already completed the AI practice for this lecture.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
            <Sparkles size={16} className="text-blue-400" />
          </span>
          AI Practice Exercise
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Apply what you have learned by creating something with AI. Choose an exercise below, then fill in your prompt, the AI's output, and your reflection.
        </p>
      </div>

      {!selected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exercises.map((ex) => {
            const meta = TYPE_META[ex.type] || TYPE_META.reflection;
            return (
              <button
                key={ex.id}
                onClick={() => setSelected(ex)}
                className="text-left p-5 rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/40 to-slate-900/40 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center mb-3 shadow-lg`}>
                  {meta.icon}
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{ex.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{ex.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">+{ex.xpReward} XP</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${TYPE_META[selected.type]?.color || "from-blue-500 to-cyan-500"} flex items-center justify-center`}>
                {TYPE_META[selected.type]?.icon || <Sparkles size={16} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selected.title}</p>
                <p className="text-xs text-slate-400">{TYPE_META[selected.type]?.label || selected.type}</p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Change
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Prompt Used</label>
              <textarea
                value={promptUsed}
                onChange={(e) => setPromptUsed(e.target.value)}
                placeholder="What prompt did you use with the AI?"
                rows={3}
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Generated Result</label>
              <textarea
                value={generatedOutput}
                onChange={(e) => setGeneratedOutput(e.target.value)}
                placeholder="Paste the AI-generated output here"
                rows={5}
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Reflection</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What did you learn? How could you improve the result?"
                rows={3}
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !promptUsed.trim() || !generatedOutput.trim() || !reflection.trim()}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Submit Practice
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
