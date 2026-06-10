import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useLessonData } from '../hooks/useLessonData';
import { useProgress, getCourseProgress, isLectureUnlocked, tryAutoCompleteLecture } from '../hooks/useProgress';
import {
  LessonSection,
  QuizEngine,
  ProblemCard,
  SummaryCard,
} from '../components/lesson';
import type { CodingProblem } from '../types/lesson';
import { ArrowLeft, ArrowRight, CheckCircle, Lock } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

type Page =
  | { type: 'section'; index: number }
  | { type: 'quiz' }
  | { type: 'problems' }
  | { type: 'summary' };

function pageId(page: Page, sections: Array<{ id: string }>): string {
  if (page.type === 'section') return sections[page.index].id;
  return page.type;
}

function pageLabel(page: Page, sections: Array<{ label: string }>): string {
  if (page.type === 'section') return sections[page.index].label;
  if (page.type === 'quiz') return 'Quiz';
  if (page.type === 'problems') return 'Problems';
  return 'Summary';
}

type PageStatus = 'completed' | 'current' | 'upcoming';

function LockedLectureView({ slug, lectureNumber, courseTitle }: { slug: string; lectureNumber: number; courseTitle: string }) {
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
  const [retakingQuiz, setRetakingQuiz] = useState(false);

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
    }).catch(() => {});
  }, [slug]);

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
    const summary = lessonData.summary;

    const result: Page[] = lessonData.sections.map((_, i) => ({ type: 'section', index: i }));
    if (quiz.length > 0) result.push({ type: 'quiz' });
    if (problems.length > 0) result.push({ type: 'problems' });
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
      const lastId = progress.lastSection;
      if (lastId && lastId !== 'overview' && lastId !== 'summary') {
        const idx = pages.findIndex(p => {
          if (p.type === 'section') return lessonData.sections[p.index]?.id === lastId;
          return p.type === lastId;
        });
        if (idx > 0) {
          setCurrentPageIdx(idx);
          targetIdx = idx; // Update our local ref so we mark the correct one visited
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
      tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, totalProblems, hasQuiz);
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
          (lessonData.quiz?.length ?? 0) > 0
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
      else if (id === 'summary') isVisited = progress.lectureCompleted;
      else isVisited = !!progress.sections[id]?.visited;

      return isVisited ? 'completed' : 'upcoming';
    });
  }, [pages, currentPageIdx, progress, lessonData]);

  if (!slug) return null;

  // Show locked view
  if (unlocked === false) {
    const courseTitle = slug === 'cs50p' ? 'CS50 Python' : slug === 'cs50ai' ? 'AI' : slug.toUpperCase();
    return <LockedLectureView slug={slug} lectureNumber={lectureNumber} courseTitle={courseTitle} />;
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

  const prevLecture = allLectures.find(l => l.number === lectureNumber - 1);
  const nextLecture = allLectures.find(l => l.number === lectureNumber + 1);
  const courseTitle = slug === 'cs50p' ? 'CS50 Python' : slug === 'cs50ai' ? 'AI' : slug.toUpperCase();
  const quiz = lessonData.quiz ?? [];
  const problems: CodingProblem[] = lessonData.problems ?? [];
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
                    {progress.sections[id]?.visited ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : status === 'current' ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
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
                      tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0);
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
                        if (score / total >= 0.7) {
                          markSectionVisited('quiz');
                          if (slug && lessonData) {
                            tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0);
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
                            tryAutoCompleteLecture(slug, lectureNumber, lessonData.sections.length, problems.length, quiz.length > 0);
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
                    if (allSectionsDone && quizDone && problemsDone) {
                      markLectureCompleted();
                      if (nextLecture) navigate(`/course/${slug}/lecture/${nextLecture.number}`);
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
