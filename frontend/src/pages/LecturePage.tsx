import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
<<<<<<< HEAD
import { api, getProjectMetadata } from '../api';
=======
import { api } from '../api';
>>>>>>> 8245f18 (Initial commit)
import { useLessonData } from '../hooks/useLessonData';
import { useProgress, getCourseProgress, isLectureUnlocked, tryAutoCompleteLecture } from '../hooks/useProgress';
import {
  LessonSection,
  QuizEngine,
  ProblemCard,
  SummaryCard,
} from '../components/lesson';
<<<<<<< HEAD
import type { CodingProblem, ProjectSummary } from '../types/lesson';
=======
import type { CodingProblem } from '../types/lesson';
>>>>>>> 8245f18 (Initial commit)
import { ArrowLeft, ArrowRight, CheckCircle, Lock } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

type Page =
  | { type: 'section'; index: number }
  | { type: 'quiz' }
  | { type: 'problems' }
<<<<<<< HEAD
  | { type: 'project' }
=======
>>>>>>> 8245f18 (Initial commit)
  | { type: 'summary' };

function pageId(page: Page, sections: Array<{ id: string }>): string {
  if (page.type === 'section') return sections[page.index].id;
  return page.type;
}

function pageLabel(page: Page, sections: Array<{ label: string }>): string {
  if (page.type === 'section') return sections[page.index].label;
  if (page.type === 'quiz') return 'Quiz';
  if (page.type === 'problems') return 'Problems';
<<<<<<< HEAD
  if (page.type === 'project') return 'Project';
=======
>>>>>>> 8245f18 (Initial commit)
  return 'Summary';
}

type PageStatus = 'completed' | 'current' | 'upcoming';

<<<<<<< HEAD
function LockedLectureView({ slug, lectureNumber, courseTitle }: { slug: string; lectureNumber: number; courseTitle: string }) {
=======
function LockedLectureView({ slug, lectureNumber }: { slug: string; lectureNumber: number }) {
>>>>>>> 8245f18 (Initial commit)
  const navigate = useNavigate();
  const prevLecture = lectureNumber > 0 ? lectureNumber - 1 : null;

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0b0f19]">
      <div className="text-center max-w-md p-8">
        <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mx-auto mb-6">
          <Lock size={40} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Lecture Locked</h2>
        <p className="text-slate-400 text-sm mb-6">
          Complete all sections of the current lecture to unlock the next lecture.
        </p>
        <div className="space-y-3">
          {prevLecture !== null && (
            <button
              onClick={() => navigate(`/course/${slug}/lecture/${prevLecture}`)}
              className="inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all"
            >
              <ArrowLeft size={16} />
              Go to Lecture {prevLecture}
            </button>
          )}
          <br />
          <button
            onClick={() => navigate(`/course/${slug}`)}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
          >
            Back to Course
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fallback legacy renderer (notes.md) ──────────────────────────────────────

function LegacyLecturePage({ slug, lectureNumber }: { slug: string; lectureNumber: number }) {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const courseTitle = slug === 'cs50p' ? 'CS50 Python' : slug === 'cs50ai' ? 'AI' : slug.toUpperCase();
<<<<<<< HEAD
  const [retakingQuiz, setRetakingQuiz] = useState(false);
=======
>>>>>>> 8245f18 (Initial commit)

  useEffect(() => {
    const base = import.meta.env.BASE_URL ?? '/';
    const url = base.replace(/\/$/, '') + `/data/${slug}/lecture_${lectureNumber}/notes.md`;
    fetch(url).then(r => r.ok ? r.text() : '').then(setContent).catch(() => {});
  }, [slug, lectureNumber]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-b border-slate-700/20 px-6 py-3 bg-slate-900/40">
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300">Dashboard</button>
          <span className="text-slate-600">/</span>
          <button onClick={() => navigate(`/course/${slug}`)} className="text-blue-400 hover:text-blue-300">{courseTitle}</button>
          <span className="text-slate-600">/</span>
          <span className="text-white">Lecture {lectureNumber}</span>
        </nav>
      </div>
      <div className="p-6 max-w-3xl mx-auto">
        <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{content || 'Loading lecture content…'}</pre>
      </div>
    </div>
  );
}

// ── Main data-driven LecturePage ──────────────────────────────────────────────

export default function LecturePage() {
  const { slug, number } = useParams<{ slug: string; number: string }>();
  const navigate = useNavigate();
  const lectureNumber = parseInt(number ?? '0', 10);
  const [retakingQuiz, setRetakingQuiz] = useState(false);
  const [openProblemIndex, setOpenProblemIndex] = useState<number>(-1);
  const [openSimilarIndex, setOpenSimilarIndex] = useState<number>(-1);

  const { lessonData, loading, error } = useLessonData(slug, lectureNumber);
  const { 
    progress, markSectionVisited, markPracticeAttempted, markPracticeCompleted, 
    markQuizCompleted, markProblemCompleted, markHandsOnTaskCompleted, markLectureCompleted
  } = useProgress(slug, lectureNumber);

  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [allLectures, setAllLectures] = useState<Array<{ number: number; title: string }>>([]);
  const [hasResumed, setHasResumed] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const visitedRef = useRef<Set<number>>(new Set());

  // Reset state when navigating to a different lecture
  useEffect(() => {
    setCurrentPageIdx(0);
    setHasResumed(false);
    visitedRef.current.clear();
    setRetakingQuiz(false);
    setShowAllCompleted(false);
  }, [slug, lectureNumber]);

  // Load lecture list for prev/next lecture navigation
  useEffect(() => {
    if (!slug) return;
    api.courseLectures(slug).then(lectures => {
      setAllLectures(lectures.map(l => ({ number: l.number, title: l.title })));
<<<<<<< HEAD
    }).catch(() => {});
  }, [slug]);
=======
      // Redirect to capstone page for the last lecture
      const last = lectures[lectures.length - 1];
      if (last && lectureNumber >= last.number) {
        navigate(`/course/${slug}/capstone`, { replace: true });
      }
    }).catch(() => {});
  }, [slug, lectureNumber, navigate]);
>>>>>>> 8245f18 (Initial commit)

  // Derive unlock status from stored progress (no state needed — avoids loops)
  const unlocked = useMemo(() => {
    if (!slug) return null;
    if (lectureNumber === 0) return true;
    const cp = getCourseProgress(slug);
    return isLectureUnlocked(lectureNumber, cp);
  }, [slug, lectureNumber]);

  // Build ordered page list
  const pages: Page[] = useMemo(() => {
    if (!lessonData) return [];
    const quiz = lessonData.quiz ?? [];
    const problems: CodingProblem[] = lessonData.problems ?? [];
<<<<<<< HEAD
    const projects: ProjectSummary[] = lessonData.projects ?? [];
=======
>>>>>>> 8245f18 (Initial commit)
    const summary = lessonData.summary;

    const result: Page[] = lessonData.sections.map((_, i) => ({ type: 'section', index: i }));
    if (quiz.length > 0) result.push({ type: 'quiz' });
    if (problems.length > 0) result.push({ type: 'problems' });
<<<<<<< HEAD
    if (projects.length > 0) result.push({ type: 'project' });
=======
>>>>>>> 8245f18 (Initial commit)
    if (summary) result.push({ type: 'summary' });
    return result;
  }, [lessonData]);

  // Keep currentPageIdx in bounds
  useEffect(() => {
    if (currentPageIdx >= pages.length) {
      setCurrentPageIdx(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPageIdx]);

  // Resume from last visited section when re-entering a lecture

  useEffect(() => {
    if (!lessonData || !pages.length) return;
    
    let targetIdx = currentPageIdx;
    
    // First run: attempt to resume
    if (!hasResumed) {
      setHasResumed(true);

      // Check for ?page=summary query param (set by CodingProjectPage completion)
      const params = new URLSearchParams(window.location.search);
      const targetPage = params.get('page');
      if (targetPage === 'summary') {
        const summaryIdx = pages.findIndex(p => p.type === 'summary');
        if (summaryIdx >= 0) {
          setCurrentPageIdx(summaryIdx);
          targetIdx = summaryIdx;
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else {
        const lastId = progress.lastSection;
        if (lastId && lastId !== 'overview' && lastId !== 'summary') {
          const idx = pages.findIndex(p => {
            if (p.type === 'section') return lessonData.sections[p.index]?.id === lastId;
            return p.type === lastId;
          });
          if (idx > 0) {
            setCurrentPageIdx(idx);
            targetIdx = idx;
          }
        }
      }
    }

    // Now mark as visited
    const page = pages[targetIdx];
    if (!page) return;
    if (visitedRef.current.has(targetIdx)) return;
    visitedRef.current.add(targetIdx);
    
    // Check if lecture can be auto-completed when summary is reached
    if (page.type === 'summary' && slug && lessonData) {
      const totalProblems = (lessonData.problems ?? []).length;
      const hasQuiz = (lessonData.quiz ?? []).length > 0;
<<<<<<< HEAD
      const hasProject = (lessonData.projects ?? []).length > 0;
      tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, totalProblems, hasQuiz, hasProject);
=======
      tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, totalProblems, hasQuiz);
>>>>>>> 8245f18 (Initial commit)
    }

    if (page.type === 'section') {
      markSectionVisited(lessonData.sections[page.index].id);
    } else {
      markSectionVisited(page.type);
    }

    // Trigger auto-complete check after marking section as visited
    setTimeout(() => {
      if (slug) {
        tryAutoCompleteLecture(
          slug, 
          lectureNumber, 
          lessonData.sections.length, 
          lessonData.problems?.length ?? 0, 
          (lessonData.quiz?.length ?? 0) > 0,
<<<<<<< HEAD
          (lessonData.projects?.length ?? 0) > 0,
=======
>>>>>>> 8245f18 (Initial commit)
        );
      }
    }, 0);
  }, [lessonData, pages, progress.lastSection, hasResumed, currentPageIdx, markSectionVisited, slug, lectureNumber]);

  // Compute status for each page item
  const pageStatuses: PageStatus[] = useMemo(() => {
    return pages.map((page, idx) => {
      if (idx === currentPageIdx) return 'current';
      
      const id = pageId(page, lessonData?.sections ?? []);
      let isVisited = false;
      if (id === 'quiz') isVisited = progress.quizCompleted;
      else if (id === 'problems') isVisited = progress.problemsCompleted.length > 0;
<<<<<<< HEAD
      else if (id === 'project') isVisited = progress.projectCompleted;
=======
>>>>>>> 8245f18 (Initial commit)
      else if (id === 'summary') isVisited = progress.lectureCompleted;
      else isVisited = !!progress.sections[id]?.visited;

      return isVisited ? 'completed' : 'upcoming';
    });
  }, [pages, currentPageIdx, progress, lessonData]);

  if (!slug) return null;

<<<<<<< HEAD
  // Show locked view
  if (unlocked === false) {
    const courseTitle = slug === 'cs50p' ? 'CS50 Python' : slug === 'cs50ai' ? 'AI' : slug.toUpperCase();
    return <LockedLectureView slug={slug} lectureNumber={lectureNumber} courseTitle={courseTitle} />;
=======
  if (unlocked === false) {
    return <LockedLectureView slug={slug} lectureNumber={lectureNumber} />;
>>>>>>> 8245f18 (Initial commit)
  }

  // Fallback to legacy renderer if no lesson.json
  if (!loading && (error === 'no-lesson-json' || (!lessonData && error))) {
    return <LegacyLecturePage slug={slug} lectureNumber={lectureNumber} />;
  }

  if (loading || unlocked === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="h-7 w-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!lessonData) return null;

<<<<<<< HEAD
  const prevLecture = allLectures.find(l => l.number === lectureNumber - 1);
=======
>>>>>>> 8245f18 (Initial commit)
  const nextLecture = allLectures.find(l => l.number === lectureNumber + 1);
  const courseTitle = slug === 'cs50p' ? 'CS50 Python' : slug === 'cs50ai' ? 'AI' : slug.toUpperCase();
  const quiz = lessonData.quiz ?? [];
  const problems: CodingProblem[] = lessonData.problems ?? [];
<<<<<<< HEAD
  const projects: ProjectSummary[] = lessonData.projects ?? [];
  const hasProject = projects.length > 0;
=======
>>>>>>> 8245f18 (Initial commit)
  const summary = lessonData.summary;

  const currentPage = pages[currentPageIdx];
  const isFirstPage = currentPageIdx === 0;
  const isLastPage = currentPageIdx === pages.length - 1;

  const goNext = () => {
    if (!isLastPage) setCurrentPageIdx(c => c + 1);
  };
  const goPrev = () => {
    if (!isFirstPage) setCurrentPageIdx(c => c - 1);
  };

  return (
    <div className="w-full flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── Top Bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-700/20 px-4 py-2 bg-slate-900/40 backdrop-blur-sm">
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 transition-colors">Dashboard</button>
          <span className="text-slate-600">/</span>
          <button onClick={() => navigate('/courses')} className="text-blue-400 hover:text-blue-300 transition-colors">Courses</button>
          <span className="text-slate-600">/</span>
          <button onClick={() => navigate(`/course/${slug}`)} className="text-blue-400 hover:text-blue-300 transition-colors">{courseTitle}</button>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">{lessonData.title}</span>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/course/${slug}`)}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Course
          </button>
          <span className="text-xs text-slate-500">{currentPageIdx + 1} / {pages.length}</span>
        </div>
      </div>

      {/* ── Body: nav panel + content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left nav panel */}
        <aside className="hidden md:flex self-start flex-shrink-0 w-56 flex-col border-r border-slate-700/30 bg-slate-900/60 rounded-br-xl">
          <div className="p-3 space-y-0.5">
            <button
              onClick={() => navigate(`/course/${slug}`)}
              className="w-full mb-4 px-3 py-2 flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors border border-slate-700/50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Course
            </button>
            {pages.map((page, idx) => {
              const status = pageStatuses[idx];
              const id = pageId(page, lessonData.sections);
              const label = pageLabel(page, lessonData.sections);

<<<<<<< HEAD
              const projectInProgress = id === 'project' && !progress.projectCompleted;

=======
>>>>>>> 8245f18 (Initial commit)
              return (
                <button
                  key={id}
                  onClick={() => setCurrentPageIdx(idx)}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 text-left ${
                    status === 'current'
                      ? 'bg-blue-600/15 text-blue-300 border border-blue-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  {/* Status indicator */}
                  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
<<<<<<< HEAD
                    {id === 'project' && progress.projectCompleted ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : projectInProgress ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400 ring-1 ring-blue-400/50" />
                    ) : status === 'current' ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    ) : progress.sections[id]?.visited ? (
=======
                    {status === 'current' ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    ) : progress.sections[id]?.visited || status === 'completed' ? (
>>>>>>> 8245f18 (Initial commit)
                      <CheckCircle size={14} className="text-green-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: lecture content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">
            {/* ── Current page ── */}
            {currentPage?.type === 'section' && (
              <LessonSection
                section={lessonData.sections[currentPage.index]}
                index={currentPage.index}
                  onPracticeAttempt={() => markPracticeAttempted(lessonData.sections[currentPage.index].id)}
                  onPracticeComplete={() => {
                    markPracticeCompleted(lessonData.sections[currentPage.index].id);
                    if (slug && lessonData) {
<<<<<<< HEAD
                      tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0, hasProject);
=======
                      tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0);
>>>>>>> 8245f18 (Initial commit)
                    }
                  }}
              />
            )}

            {currentPage?.type === 'quiz' && (
              <section id="section-quiz">
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-sm font-bold text-blue-400">
                      {lessonData.sections.length + 1}
                    </span>
                    Quiz
                  </h2>
                  
                  {progress.quizCompleted && progress.quizScore === quiz.length ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 p-8 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center mx-auto">
                        <CheckCircle size={32} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">Yay! You got a perfect score! 🎉</p>
                        <p className="text-slate-400 mt-2">You have completely mastered this section.</p>
                      </div>
                    </div>
                  ) : progress.quizCompleted && !retakingQuiz ? (
                    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 p-8 text-center space-y-4">
                      <div>
                        <p className="text-xl font-bold text-white">Quiz Completed</p>
                        <p className="text-slate-400 mt-2">You scored {progress.quizScore} out of {quiz.length}.</p>
                      </div>
                      <button
                        onClick={() => setRetakingQuiz(true)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  ) : (
                    <QuizEngine
                      quizId={`${lessonData.id}-quiz`}
                      questions={quiz}
                      onComplete={(score, total) => {
                        setRetakingQuiz(false);
                        markQuizCompleted(score, total);
<<<<<<< HEAD
                        if (score / total >= 0.6) {
                          markSectionVisited('quiz');
                          if (slug && lessonData) {
                            tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0, hasProject);
=======
                        if (score / total >= 0.7) {
                          markSectionVisited('quiz');
                          if (slug && lessonData) {
                            tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0);
>>>>>>> 8245f18 (Initial commit)
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </section>
            )}

            {currentPage?.type === 'problems' && (
              <section id="section-problems">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-orange-600/20 flex items-center justify-center text-sm font-bold text-orange-400">
                      {lessonData.sections.length + (quiz.length > 0 ? 2 : 1)}
                    </span>
                    Problems to Solve
                  </h2>
                  <p className="text-sm text-slate-400">
                    Apply what you've learned by solving these coding challenges.
                    {progress.problemsCompleted.length > 0 && (
                      <span className="ml-2 text-orange-400 font-medium">
                        {progress.problemsCompleted.length}/{problems.length} solved
                      </span>
                    )}
                  </p>
                  <div className="space-y-3">
                    {problems.map((problem, i) => (
                      <ProblemCard
                        key={problem.id}
                        problem={problem}
                        index={i}
                        isOpen={openProblemIndex === i}
                        onOpenChange={(isOpen) => setOpenProblemIndex(isOpen ? i : -1)}
                        completed={progress.problemsCompleted.includes(problem.id)}
                        onComplete={(id) => {
                          const alreadySolved = progress.problemsCompleted.includes(id);
                          markProblemCompleted(id);
                          markSectionVisited('problems');
                          markHandsOnTaskCompleted();
                          if (slug && lessonData) {
<<<<<<< HEAD
                            tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0, hasProject);
=======
                            tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0);
>>>>>>> 8245f18 (Initial commit)
                          }
                          if (!alreadySolved) {
                            if (progress.problemsCompleted.length + 1 >= problems.length) {
                              setTimeout(() => {
                                setOpenProblemIndex(-1);
                                setShowAllCompleted(true);
                              }, 1500);
                            } else if (i + 1 < problems.length) {
                              setTimeout(() => setOpenProblemIndex(i + 1), 1500);
                            }
                          }
                        }}
                      />
                    ))}
                  </div>

                  {problems.length > 0 && (() => {
                    const similarProblems = [
                      { ...problems[0], id: `${problems[0].id}_sim1`, title: problems[0].title.replace('Basic ', 'Advanced ').replace('Simple ', 'Complex ') + ' (Similar A)' },
                      { ...problems[0], id: `${problems[0].id}_sim2`, title: problems[0].title + ' (Similar B)' }
                    ];

                    return (
                      <div className="mt-8 pt-6 border-t border-slate-700/30">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Similar Questions
                        </h3>
                        <div className="space-y-3">
                          {similarProblems.map((problem, i) => (
                            <ProblemCard
                              key={problem.id}
                              problem={problem}
                              index={i}
                              isOpen={openSimilarIndex === i}
                              onOpenChange={(isOpen) => setOpenSimilarIndex(isOpen ? i : -1)}
                              completed={progress.problemsCompleted.includes(problem.id)}
                              onComplete={(id) => {
                                markProblemCompleted(id);
                                if (i + 1 < similarProblems.length) {
                                  setTimeout(() => setOpenSimilarIndex(i + 1), 1500);
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </section>
            )}

<<<<<<< HEAD
            {currentPage?.type === 'project' && (
              <section id="section-project">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600/30 to-violet-600/20 flex items-center justify-center shadow-lg shadow-purple-600/10">
                      <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.43-.576 48.1 48.1 0 00.57-5.571.555.555 0 00-.571-.545v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.34c-1.591.976-3.25 1.028-4.796.086-.28-.208-.461-.314-.662-.346a.64.64 0 01-.23-.111z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Milestone Project</span>
                      <h2 className="text-lg font-bold text-white">Apply what you've learned</h2>
                    </div>
                  </div>

                  {progress.projectCompleted && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">Project Completed</p>
                        <p className="text-[11px] text-emerald-400/60">Great work! This project has been submitted successfully.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {projects.map((project) => {
                      const meta = getProjectMetadata(project.id);
                      const projectIcon = meta.tags[0] === 'I/O' ? 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0' :
                        'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z';
                      return (
                        <div
                          key={project.id}
                          className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-purple-900/20 backdrop-blur-sm p-6 transition-all duration-200 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-600/5 group"
                        >
                          <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-600/10 flex items-center justify-center flex-shrink-0 border border-purple-500/10 group-hover:border-purple-400/30 transition-all">
                              <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={projectIcon} />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-base font-bold text-slate-100">{project.title}</h3>
                                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{project.description}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                                  project.difficulty === 'easy'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : project.difficulty === 'medium'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {project.difficulty === 'easy' ? 'Beginner' : project.difficulty === 'medium' ? 'Intermediate' : 'Advanced'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500">
                                <span>{meta.xp} XP</span>
                                <span className="text-slate-700">·</span>
                                <span>{meta.estimatedTime}</span>
                                <span className="text-slate-700">·</span>
                                <span className="flex gap-1.5">
                                  {meta.tags.slice(0, 3).map(t => (
                                    <span key={t} className="text-[9px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">{t}</span>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-700/20 flex items-center justify-between">
                            {progress.projectCompleted && progress.projectId === project.id ? (
                              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                                <CheckCircle size={12} /> Completed — review your workspace or continue
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Build a real mini-application using your new skills</span>
                            )}
                            <button
                              onClick={() => navigate(`/course/${slug}/lecture/${lectureNumber}/project/${project.id}`)}
                              className="text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 transition-all shadow-md shadow-purple-900/20 flex items-center gap-2"
                            >
                              {progress.projectCompleted && progress.projectId === project.id ? 'Open Workspace' : 'Start Building'}
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

=======
>>>>>>> 8245f18 (Initial commit)
            {showAllCompleted && (
              <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 text-center space-y-6 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">🎉 All Problems Completed</p>
                    <p className="text-sm text-slate-400 mt-2">You successfully completed all practice problems in this lecture.</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowAllCompleted(false)}
                      className="text-sm font-medium px-5 py-2.5 rounded-xl border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                    >
                      Review Solutions
                    </button>
                    <button
                      onClick={() => {
                        setShowAllCompleted(false);
                        const summaryIdx = pages.findIndex(p => p.type === 'summary');
                        if (summaryIdx >= 0) setCurrentPageIdx(summaryIdx);
                      }}
                      className="text-sm font-medium px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all"
                    >
                      Continue to Summary
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentPage?.type === 'summary' && (
              <section id="section-summary">
                <SummaryCard
                  summary={summary!}
                  lectureTitle={lessonData.title}
                  nextLectureTitle={nextLecture?.title}
                  onNext={() => {
                    const sectionsVisited = Object.values(progress.sections).filter(s => s.visited).length;
                    const allSectionsDone = sectionsVisited >= lessonData.sections.length;
                    const quizDone = !quiz.length || progress.quizCompleted;
                    const problemsDone = progress.problemsCompleted.length >= problems.length;
<<<<<<< HEAD
                    const projectDone = !hasProject || progress.projectCompleted;
                    if (allSectionsDone && quizDone && problemsDone && projectDone) {
=======
                    if (allSectionsDone && quizDone && problemsDone) {
>>>>>>> 8245f18 (Initial commit)
                      markLectureCompleted();
                    }
                    if (nextLecture) {
                      navigate(`/course/${slug}/lecture/${nextLecture.number}`);
                    } else {
                      navigate(`/course/${slug}`);
                    }
                  }}
                />
              </section>
            )}

            {/* ── Navigation — Previous / Next ── */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700/20">
              <div>
                {!isFirstPage && (
                  <button
                    onClick={goPrev}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/40 transition-all"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {currentPageIdx + 1} / {pages.length}
              </div>
              <div>
                {!isLastPage && (
                  <button
                    onClick={goNext}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
  );
}
