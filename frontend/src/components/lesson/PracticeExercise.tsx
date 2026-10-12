import { useEffect, useState } from "react";
import { authFetch } from "../../authClient";
import type { PracticeExerciseConfig } from "../../types/lesson";
import { Wand2, CheckCircle, SendHorizonal, Target, Lightbulb, Sparkles, ListChecks } from "lucide-react";
import DragDropPracticeExercise from "./DragDropPracticeExercise";

interface PracticeExerciseProps {
  courseSlug: string;
  lectureId: string;
  onComplete?: () => void;
}

interface SubmissionStatus {
  completed: boolean;
  submission: {
    id: string;
    prompt: string;
    response: string;
    createdAt: string;
  } | null;
}

export default function PracticeExercise({ courseSlug, lectureId, onComplete }: PracticeExerciseProps) {
  const [config, setConfig] = useState<PracticeExerciseConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await authFetch<{ exercise: PracticeExerciseConfig | null }>(
          `/practice-exercises/config/${courseSlug}/${lectureId}`
        );
        setConfig(data.exercise);
      } catch {
        setConfig(null);
      } finally {
        setConfigLoading(false);
      }
    }
    loadConfig();
  }, [courseSlug, lectureId]);

  useEffect(() => {
    async function load() {
      try {
        const data = await authFetch<SubmissionStatus>(`/practice-exercises/${courseSlug}/${lectureId}/status`);
        setStatus(data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseSlug, lectureId]);

  if (configLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
          <p className="text-slate-300 text-sm">No practice exercise for this lecture.</p>
        </div>
      </section>
    );
  }

  if (status?.completed) {
    return (
      <div className="ai-card-surface rounded-2xl border border-green-500/20 bg-white shadow-sm p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-[var(--success)]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[var(--success)] uppercase tracking-wider mb-1">Practice Completed</p>
            <p className="text-sm text-slate-300">Great work! You completed this practice exercise.</p>
            {status.submission && (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Your Prompt</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap">
                    {status.submission.prompt}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">AI Response</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {status.submission.response}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="ai-card-surface rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1">Practice Exercise</p>
            <p className="text-sm font-medium text-slate-900 mb-1">{config.title}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{config.challenge}</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-[var(--brand-primary)]/80 hover:bg-[var(--brand-primary)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-[280ms]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Start Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const data = await authFetch<{ generatedOutput: string }>("/practice-exercises/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: `${courseSlug}_${lectureId}`,
          prompt: prompt.trim(),
          exerciseType: "ai-practice",
          exerciseTitle: config.title,
          exerciseDescription: config.challenge,
          systemInstruction: config.systemInstruction,
        }),
      });
      setResponse(data.generatedOutput);
    } catch {
      setError("AI generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || !response.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await authFetch<{ submission: any; xpAwarded: number }>(
        `/practice-exercises/${courseSlug}/${lectureId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: courseSlug,
            lectureId,
            prompt: prompt.trim(),
            response: response.trim(),
          }),
        }
      );
      setStatus({ completed: true, submission: result.submission });
      onComplete?.();
    } catch (err: any) {
      setError(err.status === 409 ? "Practice already completed." : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const isDragDrop = config.type === 'drag_drop' && config.dragDropConfig;

  return (
    <div className="ai-card-surface rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Practice Exercise</p>
          <p className="text-sm font-medium text-slate-900 mt-0.5">{config.title}</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-300 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-5">
        {isDragDrop ? (
          <DragDropPracticeExercise
            config={config.dragDropConfig!}
            title={config.title}
            challenge={config.challenge}
            learningGoal={config.learningGoal}
            promptHint={config.promptHint}
            onComplete={() => { handleSubmit(); }}
            onAttempt={() => {}}
          />
        ) : (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">What You'll Learn</p>
                <p className="text-sm text-slate-700 leading-relaxed">{config.learningGoal}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--brand-primary)]/[0.06] border border-[var(--brand-primary)]/10">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb size={16} className="text-[var(--brand-primary)]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1">Your Challenge</p>
                <p className="text-sm text-slate-700 leading-relaxed">{config.challenge}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--brand-primary)]/[0.06] border border-[var(--brand-primary)]/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[var(--brand-primary)]" />
                <p className="text-[11px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Prompt Hint</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{config.promptHint}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Your Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question for the AI here..."
                rows={3}
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--brand-primary)]/50 resize-none"
              />
              <p className="text-[11px] text-slate-300 mt-1">Enter to generate, Shift+Enter for new line</p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)] hover:from-[var(--brand-primary)] hover:to-[var(--brand-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]"
            >
              {generating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
              ) : (
                <><Wand2 size={16} /> Generate with AI</>
              )}
            </button>

            {response && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">AI Response</label>
                <div className="w-full bg-slate-900/60 border border-[var(--brand-primary)]/20 rounded-xl px-4 py-3 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {response}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-sm text-red-300">{error}</div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-600/10 to-slate-800/40 border border-emerald-500/20">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ListChecks size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Success Criteria</p>
                    <ul className="space-y-1">
                      {config.successCriteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-300/80">
                          <span className="mt-0.5">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)] hover:from-[var(--brand-primary)] hover:to-[var(--brand-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                  ) : (
                    <><SendHorizonal size={16} /> Mark Complete</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
