import { useEffect, useState } from "react";
import { authFetch } from "../../authClient";
import { Sparkles, Wand2, CheckCircle, ArrowRight } from "lucide-react";

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
}

export default function PracticeExercise({ lessonId }: PracticeExerciseProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<SubmissionResult["submission"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [promptUsed, setPromptUsed] = useState("");
  const [prompt2, setPrompt2] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [generatedOutput2, setGeneratedOutput2] = useState("");
  const [reflection, setReflection] = useState("");
  const [step, setStep] = useState<"input" | "result">("input");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const practiceType = exercise?.type ?? "generate";

  useEffect(() => {
    async function load() {
      try {
        const [exercisesData, submissionsData] = await Promise.all([
          authFetch<Exercise[]>(`/practice-exercises/${lessonId}`),
          authFetch<{ exercise: Exercise }[]>(`/practice-exercises/submissions/${lessonId}`),
        ]);
        if (exercisesData.length > 0) {
          setExercise(exercisesData[0]);
        }
        if (submissionsData.length > 0) {
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

  const handleGenerate = async (prompt: string) => {
    if (!exercise || !prompt.trim()) return "";
    try {
      const data = await authFetch<{ generatedOutput: string }>("/practice-exercises/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          prompt: prompt.trim(),
          exerciseType: exercise.type,
          exerciseTitle: exercise.title,
          exerciseDescription: exercise.description,
        }),
      });
      return data.generatedOutput;
    } catch {
      setError("AI generation failed. Please try again.");
      return "";
    }
  };

  const handleGenerateClick = async () => {
    if (!exercise || !promptUsed.trim()) return;
    setGenerating(true);
    setError(null);
    const output = await handleGenerate(promptUsed);
    if (output) {
      setGeneratedOutput(output);
      if (practiceType === "prompt-compare") {
        setStep("result");
      } else {
        setStep("result");
      }
    }
    setGenerating(false);
  };

  const handleSecondGenerate = async () => {
    if (!exercise || !prompt2.trim()) return;
    setGenerating(true);
    setError(null);
    const output = await handleGenerate(prompt2);
    if (output) {
      setGeneratedOutput2(output);
    }
    setGenerating(false);
  };

  const handleSubmit = async () => {
    if (!exercise) return;
    const payload = practiceType === "prompt-compare"
      ? `Weak prompt: "${promptUsed}"\n\nWeak output: ${generatedOutput}\n\nStrong prompt: "${prompt2}"\n\nStrong output: ${generatedOutput2}`
      : generatedOutput;
    if (!promptUsed.trim() || !payload.trim() || !reflection.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authFetch<SubmissionResult>("/practice-exercises/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: exercise.id,
          promptUsed: promptUsed.trim(),
          generatedOutput: payload,
          reflection: reflection.trim(),
        }),
      });
      setResult(res);
    } catch (err: any) {
      setError(err.status === 409 ? "You already submitted this exercise." : "Failed to submit. Please try again.");
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

  if (!exercise) return null;

  if (result) {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">Practice Submitted!</p>
            <p className="text-slate-400 mt-2">Your practice exercise has been recorded.</p>
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
          <p className="text-sm text-slate-400">You have already completed the practice for this lecture.</p>
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
          Practice Exercise
        </h2>
      </div>

      <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-6 space-y-4">
        <div>
          <p className="text-base font-semibold text-white">{exercise.title}</p>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">{exercise.description}</p>
        </div>

        {practiceType === "generate" && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Prompt</label>
              <textarea value={promptUsed} onChange={e => setPromptUsed(e.target.value)} rows={3}
                placeholder="Describe what you want the AI to generate..."
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <GenerateButton onClick={handleGenerateClick} loading={generating} disabled={!promptUsed.trim()} />
            {generatedOutput && <OutputBlock label="Generated Output" content={generatedOutput} />}
            {generatedOutput && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Reflection</label>
                <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={3}
                  placeholder="What did the AI produce? How could it be improved? What did you learn?"
                  className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>
            )}
          </>
        )}

        {practiceType === "compare" && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">What would you like the AI to compare?</label>
              <textarea value={promptUsed} onChange={e => setPromptUsed(e.target.value)} rows={3}
                placeholder="Ask the AI to explain or compare the key concepts from this lesson..."
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <GenerateButton onClick={handleGenerateClick} loading={generating} disabled={!promptUsed.trim()} />
            {generatedOutput && <OutputBlock label="AI's Explanation" content={generatedOutput} />}
            {generatedOutput && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Own Understanding</label>
                <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={4}
                  placeholder="Based on the AI's explanation, write your own understanding in your own words. How would you explain these concepts to someone else?"
                  className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>
            )}
          </>
        )}

        {practiceType === "reflect" && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Ask the AI to describe a scenario</label>
              <textarea value={promptUsed} onChange={e => setPromptUsed(e.target.value)} rows={3}
                placeholder="Ask the AI to generate a real-world scenario related to this lesson's topic..."
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <GenerateButton onClick={handleGenerateClick} loading={generating} disabled={!promptUsed.trim()} />
            {generatedOutput && <OutputBlock label="AI Scenario" content={generatedOutput} />}
            {generatedOutput && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Reflection</label>
                <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={4}
                  placeholder="Reflect on this scenario. What are the key takeaways? How does it connect to what you learned? What would you do differently?"
                  className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>
            )}
          </>
        )}

        {practiceType === "prompt-compare" && (
          <>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
              Step 1: Write a weak/vague prompt first, then Step 2: write a specific, well-structured prompt on the same topic. Compare the results.
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Step 1: Weak / Vague Prompt</label>
              <textarea value={promptUsed} onChange={e => setPromptUsed(e.target.value)} rows={2}
                placeholder="Write a vague, poorly structured prompt..."
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>
            <GenerateButton onClick={handleGenerateClick} loading={generating} disabled={!promptUsed.trim()} label="Generate with Weak Prompt" />
            {generatedOutput && <OutputBlock label="Weak Prompt Output" content={generatedOutput} />}
            {generatedOutput && (
              <>
                <div className="mt-4 pt-4 border-t border-slate-700/30">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Step 2: Strong / Specific Prompt</label>
                    <textarea value={prompt2} onChange={e => setPrompt2(e.target.value)} rows={2}
                      placeholder="Write a specific, detailed, well-structured prompt on the SAME topic..."
                      className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 resize-none" />
                  </div>
                  <div className="mt-3">
                    <GenerateButton onClick={handleSecondGenerate} loading={generating} disabled={!prompt2.trim()} label="Generate with Strong Prompt" color="green" />
                  </div>
                  {generatedOutput2 && <OutputBlock label="Strong Prompt Output" content={generatedOutput2} />}
                </div>
                {generatedOutput2 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Comparison & Reflection</label>
                    <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={4}
                      placeholder="Compare the two outputs. What differences do you notice? Why did the strong prompt produce better results? What did you learn about prompt design?"
                      className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-sm text-red-300">{error}</div>
        )}

        {((practiceType === "generate" && generatedOutput && reflection) ||
          (practiceType === "compare" && reflection) ||
          (practiceType === "reflect" && reflection) ||
          (practiceType === "prompt-compare" && generatedOutput2 && reflection)) && (
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20">
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><Sparkles size={16} /> Submit Practice</>
            )}
          </button>
        )}
      </div>
    </section>
  );
}

function GenerateButton({ onClick, loading, disabled, label = "Generate with AI", color = "violet" }: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  label?: string;
  color?: string;
}) {
  const bg = color === "green" ? "from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-600/20" : "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-600/20";
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className={`w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r ${bg} disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg`}>
      {loading ? (
        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
      ) : (
        <><Wand2 size={16} /> {label}</>
      )}
    </button>
  );
}

function OutputBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="w-full bg-slate-900/60 border border-violet-500/30 rounded-xl px-4 py-3 text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed max-h-72 overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
