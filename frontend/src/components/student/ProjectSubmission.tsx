import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Target, Clock, GitBranch, AlertCircle, XCircle, FileText } from 'lucide-react';

interface ProjectSubmissionProps {
  projectId: string;
  submission: any;
  loading: boolean;
  error: string | null;
  submitProject: (githubUrl: string, content: string) => Promise<void>;
  cancelSubmission?: () => Promise<void>;
}

export default function ProjectSubmission({ projectId, submission, loading, error, submitProject, cancelSubmission }: ProjectSubmissionProps) {
  const [activeTab, setActiveTab] = useState<'github' | 'text'>('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    if (submission?.status === 'REJECTED') {
      if (submission.githubUrl && !githubUrl) setGithubUrl(submission.githubUrl);
      if (submission.content && !description) setDescription(submission.content);
      if (submission.githubUrl) setActiveTab('github');
      else if (submission.content) setActiveTab('text');
    }
  }, [submission]);

  const currentStatus = isDrafting ? 'NOT_SUBMITTED' : (submission?.status || 'NOT_SUBMITTED');
  const attemptsCount = submission?.attemptsCount || submission?.attemptNumber || 0;
  const maxAttempts = 3;
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsCount);

  const handleComplete = async () => {
    if (activeTab === 'github' && (!githubUrl.trim() || !githubUrl.startsWith('https://github.com/'))) {
      setSubmitError('A valid GitHub Repository URL is required.');
      return;
    }
    if (activeTab === 'text' && description.trim().length < 10) {
      setSubmitError('Description must be at least 10 characters.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      const urlToSubmit = activeTab === 'github' ? githubUrl : '';
      const textToSubmit = activeTab === 'text' ? description : '';
      await submitProject(urlToSubmit, textToSubmit);
      setIsDrafting(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToDraft = () => {
    if (submission?.githubUrl) setGithubUrl(submission.githubUrl);
    if (submission?.content) setDescription(submission.content);
    setSubmitError('');
    setIsDrafting(true);
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <p className="text-slate-400">Loading project status...</p>
      </section>
    );
  }

  if (currentStatus === 'APPROVED') {
    return (
      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-900/10 backdrop-blur-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 shrink-0">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-400">🎉 Project Approved!</h2>
              <p className="text-sm text-emerald-500/70">You passed all checks successfully!</p>
            </div>
          </div>
          {submission?.score !== null && (
            <div className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30 text-center">
              <div className="text-xs text-emerald-500/70 font-semibold uppercase tracking-wider mb-1">Score</div>
              <div className="text-2xl font-bold text-emerald-400">{submission?.score}/100</div>
            </div>
          )}
        </div>
        
        {submission?.feedback && (
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 mb-6">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Feedback</h4>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}

        {submission?.aiReview?.strengths && submission.aiReview.strengths.length > 0 && (
          <div className="space-y-3 mb-8">
            <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target size={16} /> Key Strengths
            </h4>
            {submission.aiReview.strengths.map((strength: string, idx: number) => (
              <div key={idx} className="flex gap-3 bg-slate-800/30 p-3 rounded-lg border border-emerald-500/20">
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <div className="font-medium text-slate-200 text-sm">{strength}</div>
              </div>
            ))}
          </div>
        )}

        <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium transition-all">
          Continue to Next Section →
        </button>
      </section>
    );
  }

  if (currentStatus === 'REJECTED') {
    return (
      <section className="rounded-2xl border border-red-500/30 bg-red-900/10 backdrop-blur-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400 shrink-0">
              <XCircle size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-400">Project Needs Improvement</h2>
              <p className="text-sm text-red-500/70">It did not pass all review criteria.</p>
            </div>
          </div>
          {submission?.score !== null && (
            <div className="bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/30 text-center">
              <div className="text-xs text-red-500/70 font-semibold uppercase tracking-wider mb-1">Score</div>
              <div className="text-2xl font-bold text-red-400">{submission?.score}/100</div>
            </div>
          )}
        </div>
        
        {submission?.feedback && (
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 mb-6">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Feedback</h4>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}

        {submission?.aiReview?.improvements && submission.aiReview.improvements.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle size={16} /> Areas for Improvement
            </h4>
            {submission.aiReview.improvements.map((improvement: string, idx: number) => (
              <div key={idx} className="flex gap-3 bg-slate-800/30 p-3 rounded-lg border border-red-500/20">
                <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div className="font-medium text-slate-200 text-sm">{improvement}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-700/50">
          <div className="text-slate-400 text-sm">
            <span className="font-bold text-white">{attemptsRemaining}</span> attempts remaining
          </div>
          {attemptsRemaining > 0 ? (
            <button
              onClick={handleResetToDraft}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
            >
              Revise and Resubmit
            </button>
          ) : (
            <div className="text-red-400 text-sm font-semibold bg-red-500/10 px-4 py-2 rounded-lg">
              Maximum attempts reached
            </div>
          )}
        </div>
      </section>
    );
  }

  if (currentStatus === 'ERROR') {
    return (
      <section className="rounded-2xl border border-orange-500/30 bg-orange-900/10 backdrop-blur-sm p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 text-orange-400 mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-orange-400 mb-2">Something went wrong on our end</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">There was a system error while processing your submission. Our team has been notified.</p>
        <button
          onClick={handleResetToDraft}
          className="px-6 py-3 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-400 font-medium transition-all"
        >
          Try submitting again
        </button>
      </section>
    );
  }

  if (currentStatus === 'PENDING' || currentStatus === 'REVIEWING') {
    return (
      <section className="rounded-2xl border border-blue-500/30 bg-blue-900/10 backdrop-blur-sm p-6 md:p-8">
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Target size={20} className="text-blue-300" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-400 mb-2">🤖 AI is reviewing your project...</h2>
            <p className="text-slate-400 text-sm">Evaluating your code against the requirements.</p>
          </div>
          
          <div className="w-full max-w-md bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mt-4 text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submitted Content</p>
            <div className="flex items-center gap-2 text-slate-300">
              {submission?.githubUrl ? (
                <><GitBranch size={16} className="text-slate-400 shrink-0" /><span className="truncate">{submission.githubUrl}</span></>
              ) : (
                <><FileText size={16} className="text-slate-400 shrink-0" /><span className="truncate">Text/Code Description</span></>
              )}
            </div>
          </div>

          {cancelSubmission && (
            <button
              onClick={async () => {
                if (window.confirm('Cancel this submission and start over?')) {
                  try {
                    await cancelSubmission();
                  } catch {}
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all text-sm font-medium"
            >
              <XCircle size={16} />
              Cancel Submission
            </button>
          )}
        </div>
      </section>
    );
  }

  if (currentStatus === 'CANCELLED') {
    return (
      <section className="rounded-2xl border border-slate-600/30 bg-slate-800/30 backdrop-blur-sm p-6 md:p-8">
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-700/40 flex items-center justify-center border border-slate-600/50 text-slate-400">
            <XCircle size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-300 mb-1">Submission Cancelled</h2>
            <p className="text-slate-500 text-sm">Your review was cancelled. You can submit again when ready.</p>
          </div>
          <button
            onClick={() => {
              setGithubUrl('');
              setDescription('');
              setSubmitError('');
              setIsDrafting(true);
            }}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
          >
            Submit Again
          </button>
        </div>
      </section>
    );
  }

  // NOT_SUBMITTED State
  return (
    <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-6 md:p-8">
      <h2 className="text-xl font-bold text-white mb-2">Submit Your Project</h2>
      <p className="text-slate-400 mb-6 text-sm">Ready to share what you built? Choose how you'd like to submit.</p>
      
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex border-b border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('github')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'github' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <GitBranch size={16} /> GitHub Link
          </div>
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'text' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText size={16} /> Text
          </div>
        </button>
      </div>

      <div className="space-y-5">
        {activeTab === 'github' ? (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">GitHub Repository URL <span className="text-red-400">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <GitBranch size={18} />
              </div>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={isSubmitting}
                placeholder="https://github.com/yourusername/project-name"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-300 mb-1.5">
              <span>What did you build? <span className="text-red-400">*</span></span>
              <span className={description.trim().length < 10 ? "text-slate-500" : "text-emerald-500"}>
                {description.trim().length} / 10 min chars
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="Paste your code or briefly describe what you built..."
              rows={6}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-y disabled:opacity-50"
            ></textarea>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Submitting...</>
            ) : (
              'Submit for AI Review'
            )}
          </button>
          <p className="text-center text-xs text-slate-500">
            Note: AI reviews automatically (1–2 minutes)
          </p>
        </div>
      </div>
    </section>
  );
}
