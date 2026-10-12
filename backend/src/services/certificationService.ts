import { prisma } from '../prisma.js';
import { COURSE_LECTURE_COUNTS } from '../routes/courses.js';
import { COURSE_FULL_NAMES } from '../lib/courseNames.js';
import { evaluateAndUnlockAchievements } from '../achievements/evaluationEngine.js';
import { getCourseLectures, getTryItBlockCount, toInternalLectureIndex } from '../lib/courseLectures.js';

const AI_COURSE_SLUG = 'fundamentals-of-ai';

// Total real (non-similar) problems per course.
export const COURSE_PROBLEM_COUNTS: Record<string, number> = {
  python20: 42,
  'fundamentals-of-ai': 21,
};

// Per-course grading requirements. Python and the AI course share the same
// core five (lectures watched, practice exercises, try-it engagement,
// problems solved, quiz passed, final project approved) — the AI course
// additionally requires all milestone projects, since its curriculum has
// them and Python's doesn't.
interface CourseGradingConfig {
  requiresMilestones: boolean;
}
const COURSE_GRADING_CONFIG: Record<string, CourseGradingConfig> = {
  python20: { requiresMilestones: false },
  [AI_COURSE_SLUG]: { requiresMilestones: true },
};

// A student picks ONE final project from a shortlist and submits it through
// the same AI-review pipeline as everything else — these lists are the
// "is this an APPROVED submission for one of this course's final projects"
// match set. Keep in sync with CapstonePage.tsx's CAPSTONE_PROJECTS_BY_COURSE.
const FINAL_PROJECT_IDS: Record<string, string[]> = {
  python20: ['py_task_manager', 'py_text_adventure', 'py_contact_book', 'py_budget_tracker'],
  [AI_COURSE_SLUG]: ['search_trace', 'logic_puzzle', 'ml_classifier_intro', 'csp_formulation'],
};

const FINAL_PROJECT_NAMES: Record<string, string> = {
  search_trace: 'Search Algorithm Trace',
  logic_puzzle: 'Logic Puzzle Solver',
  ml_classifier_intro: 'ML Classifier',
  csp_formulation: 'CSP Formulation',
  py_task_manager: 'CLI Task Manager',
  py_text_adventure: 'Text Adventure Game',
  py_contact_book: 'File-Based Contact Book',
  py_budget_tracker: 'Budget Tracker',
};

// AI-course milestone "slots" — each slot is satisfied by an APPROVED
// submission for ANY ONE of its listed project ids (the student is offered
// a choice per slot, not required to do every listed project). Keep in
// sync with MilestonePage.tsx's LECTURE_PROJECT_MAP.
const MILESTONE_SLOTS: Record<string, string[][]> = {
  [AI_COURSE_SLUG]: [
    ['cs50ai-degrees', 'cs50ai-tictactoe'],
    ['fundamentals-of-ai-knights', 'fundamentals-of-ai-minesweeper'],
    ['fundamentals-of-ai-pagerank', 'fundamentals-of-ai-heredity'],
    ['fundamentals-of-ai-crossword'],
    ['fundamentals-of-ai-shopping', 'fundamentals-of-ai-nim'],
    ['fundamentals-of-ai-traffic'],
  ],
};

// A final project / milestone must clear this AI-reviewed score to count
// toward certificate eligibility — being marked "approved" alone isn't
// enough on its own. Matches the review pipeline's own pass bar
// (aiReviewService.ts).
const PROJECT_PASS_THRESHOLD = 60;

// Cumulative seconds with a try-it block expanded before it counts as
// "engaged" for grading purposes.
const TRYIT_ENGAGED_SECONDS = 20;

export interface ConditionDetail {
  done: number;
  required: number;
  passed: boolean;
  details?: {
    lectureNumbers?: number[];
    lectureIds?: string[];
    avgScore?: number | null;
  };
}

export interface LectureBreakdownRow {
  number: number;
  title: string;
  lectureCompleted: boolean;
  practiceCompleted: boolean;
  tryIt: { required: boolean; done: boolean };
  quizPassed: boolean;
}

export interface EligibilityConditions {
  lecturesCompleted: ConditionDetail;
  practiceCompleted: ConditionDetail;
  tryItEngaged: ConditionDetail;
  quizzesPassed: ConditionDetail;
  problemsSubmitted: ConditionDetail;
  finalProjectApproved: { done: number; passed: boolean };
  milestonesCompleted?: ConditionDetail;
}

export interface EligibilityResult {
  eligible: boolean;
  alreadyIssued: boolean;
  conditions: EligibilityConditions;
  avgQuizScore: number | null;
  capstoneScore: number | null;
  overallScore: number | null;
  capstoneTitle?: string | null;
  lectureBreakdown: LectureBreakdownRow[];
  lectureDetails?: {
    total: number;
    completed: number[];
    remaining: number[];
  };
}

function computeOverallScore(avgQuiz: number | null, capstone: number | null): number | null {
  if (avgQuiz !== null && capstone !== null) return Math.round(avgQuiz * 0.4 + capstone * 0.6);
  if (capstone !== null) return capstone;
  if (avgQuiz !== null) return avgQuiz;
  return null;
}

// A single project-submission lookup shared by the final-project condition
// and the milestone-slot condition — "does this student have an APPROVED
// submission for any project id in this set, and if so what's its score".
async function findBestApprovedSubmission(userId: string, projectIds: string[]) {
  if (projectIds.length === 0) return null;
  return prisma.projectSubmission.findFirst({
    where: { userId, status: 'APPROVED', project: { projectId: { in: projectIds } } },
    orderBy: { updatedAt: 'desc' },
    select: { score: true, project: { select: { projectId: true } } },
  });
}

// Shared by certifications.ts' verify/list/download endpoints so they never
// re-derive "which final project did this student submit" with their own
// (previously buggy — lecture-index-based) query.
export async function getFinalProjectTitle(userId: string, courseSlug: string): Promise<string | null> {
  const submission = await findBestApprovedSubmission(userId, FINAL_PROJECT_IDS[courseSlug] ?? []);
  if (!submission?.project?.projectId) return null;
  return FINAL_PROJECT_NAMES[submission.project.projectId] ?? submission.project.projectId;
}

export async function checkEligibility(userId: string, courseSlug: string): Promise<EligibilityResult> {
  const totalLectures = COURSE_LECTURE_COUNTS[courseSlug];
  if (!totalLectures) throw new Error(`Unknown course: ${courseSlug}`);

  const gradingConfig = COURSE_GRADING_CONFIG[courseSlug] ?? { requiresMilestones: false };
  const totalProblems = COURSE_PROBLEM_COUNTS[courseSlug] ?? 0;
  const lectures = getCourseLectures(courseSlug);

  const [
    existing,
    progressRecords,
    quizAttempts,
    submissionsDone,
    tryItRows,
    finalProjectSubmission,
  ] = await Promise.all([
    prisma.issuedCertificate.findUnique({ where: { userId_courseSlug: { userId, courseSlug } } }),
    prisma.progress.findMany({
      where: { userId, courseSlug },
      select: { lectureId: true, status: true, practiceCompleted: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, lectureId: { startsWith: `${courseSlug}-` } },
      select: { lectureId: true, score: true, passed: true },
    }),
    // count PASSED submissions excluding auto-generated similar-question variants (_sim1, _sim2)
    prisma.submission.count({
      where: {
        userId,
        status: 'PASSED',
        NOT: [
          { problemId: { endsWith: '_sim1' } },
          { problemId: { endsWith: '_sim2' } },
        ],
      },
    }),
    prisma.tryItEngagement.findMany({
      where: { userId, courseSlug },
      select: { lectureId: true, secondsSpent: true },
    }),
    findBestApprovedSubmission(userId, FINAL_PROJECT_IDS[courseSlug] ?? []),
  ]);

  const milestoneSlots = gradingConfig.requiresMilestones ? (MILESTONE_SLOTS[courseSlug] ?? []) : [];
  const milestoneResults = gradingConfig.requiresMilestones
    ? await Promise.all(milestoneSlots.map((slot) => findBestApprovedSubmission(userId, slot)))
    : [];

  const progressByLecture = new Map(progressRecords.map((p) => [p.lectureId, p]));
  // QuizAttempt stores one row PER ATTEMPT (retakes included), not one per
  // lecture — collapse to the best attempt per lecture (highest score, and
  // "ever passed" wins over a later worse retake) before counting anything,
  // otherwise a retaken quiz inflates done-counts past the lecture total.
  const quizByLecture = new Map<string, { lectureId: string; score: number; passed: boolean }>();
  for (const q of quizAttempts) {
    if (q.lectureId) {
      const existing = quizByLecture.get(q.lectureId);
      if (!existing || q.passed && !existing.passed || q.score > existing.score) {
        quizByLecture.set(q.lectureId, { lectureId: q.lectureId, score: Math.max(q.score, existing?.score ?? 0), passed: q.passed || !!existing?.passed });
      }
    }
  }
  const bestQuizAttempts = Array.from(quizByLecture.values());
  const tryItByLecture = new Map<number, number>(); // displayNumber -> total seconds across blocks
  for (const row of tryItRows) {
    const n = Number(row.lectureId);
    tryItByLecture.set(n, (tryItByLecture.get(n) ?? 0) + row.secondsSpent);
  }

  const lecturesDone = progressRecords.filter((p) => p.status === 'COMPLETED').length;
  const practiceDone = progressRecords.filter((p) => p.practiceCompleted).length;
  const completedLectureIds = progressRecords
    .filter((p) => p.status === 'COMPLETED')
    .map((p) => Number(p.lectureId))
    .sort((a, b) => a - b);

  const avgQuizScore =
    bestQuizAttempts.length > 0
      ? Math.round(bestQuizAttempts.reduce((s, q) => s + q.score, 0) / bestQuizAttempts.length)
      : null;
  const quizzesPassedCount = bestQuizAttempts.filter((q) => q.passed).length;

  // Per-lecture breakdown — the same raw signals above, broken out per
  // lecture number for the certification-readiness checklist. Problems
  // aren't broken down per-lecture here: the eligibility gate itself only
  // ever evaluated them as a single course-wide total, so a per-lecture
  // split would show a distinction that doesn't actually affect grading.
  const lectureBreakdown: LectureBreakdownRow[] = lectures.map((lec) => {
    const internalIndex = toInternalLectureIndex(courseSlug, lec.number);
    const quizLectureId = `${courseSlug}-lecture-${internalIndex}`;
    const progress = progressByLecture.get(String(lec.number));
    const quiz = quizByLecture.get(quizLectureId);
    const tryItBlockCount = getTryItBlockCount(courseSlug, lec.number);
    const tryItSeconds = tryItByLecture.get(lec.number) ?? 0;

    return {
      number: lec.number,
      title: lec.title,
      lectureCompleted: progress?.status === 'COMPLETED',
      practiceCompleted: !!progress?.practiceCompleted,
      tryIt: {
        required: tryItBlockCount > 0,
        done: tryItBlockCount === 0 || tryItSeconds >= TRYIT_ENGAGED_SECONDS,
      },
      quizPassed: !!quiz?.passed,
    };
  });

  const tryItLecturesRequired = lectureBreakdown.filter((r) => r.tryIt.required).length;
  const tryItLecturesDone = lectureBreakdown.filter((r) => r.tryIt.required && r.tryIt.done).length;

  const finalProjectScore = finalProjectSubmission?.score ?? null;
  // No score on record (e.g. legacy data) falls back to "approved" alone so
  // we don't regress past students — matches the review pipeline's own
  // "approved implies passed" default when no numeric score was recorded.
  const finalProjectScorePassed = finalProjectScore === null || finalProjectScore >= PROJECT_PASS_THRESHOLD;
  const finalProjectPassed = !!finalProjectSubmission && finalProjectScorePassed;
  const capstoneTitle = finalProjectSubmission?.project?.projectId
    ? (FINAL_PROJECT_NAMES[finalProjectSubmission.project.projectId] ?? finalProjectSubmission.project.projectId)
    : null;

  const overallScore = computeOverallScore(avgQuizScore, finalProjectScore);

  const conditions: EligibilityConditions = {
    lecturesCompleted: {
      done: lecturesDone,
      required: totalLectures,
      passed: lecturesDone >= totalLectures,
      details: { lectureNumbers: completedLectureIds },
    },
    practiceCompleted: {
      done: practiceDone,
      required: totalLectures,
      passed: practiceDone >= totalLectures,
    },
    tryItEngaged: {
      done: tryItLecturesDone,
      required: tryItLecturesRequired,
      passed: tryItLecturesDone >= tryItLecturesRequired,
    },
    quizzesPassed: {
      done: quizzesPassedCount,
      required: totalLectures,
      passed: quizzesPassedCount >= totalLectures,
      details: { lectureIds: bestQuizAttempts.map((q) => q.lectureId), avgScore: avgQuizScore },
    },
    problemsSubmitted: {
      done: submissionsDone,
      required: totalProblems,
      passed: submissionsDone >= totalProblems,
    },
    finalProjectApproved: { done: finalProjectPassed ? 1 : 0, passed: finalProjectPassed },
  };

  if (gradingConfig.requiresMilestones) {
    const milestonesDone = milestoneResults.filter((r) => {
      if (!r) return false;
      const score = r.score ?? null;
      return score === null || score >= PROJECT_PASS_THRESHOLD;
    }).length;
    conditions.milestonesCompleted = {
      done: milestonesDone,
      required: milestoneSlots.length,
      passed: milestonesDone >= milestoneSlots.length,
    };
  }

  const eligible = Object.values(conditions).every((c) => c!.passed);
  const allLectureNumbers = lectures.map((l) => l.number);
  const remainingLectures = allLectureNumbers.filter((n) => !completedLectureIds.includes(n));

  return {
    eligible,
    alreadyIssued: !!existing,
    conditions,
    avgQuizScore,
    capstoneScore: finalProjectScore,
    overallScore,
    capstoneTitle,
    lectureBreakdown,
    lectureDetails: {
      total: totalLectures,
      completed: completedLectureIds,
      remaining: remainingLectures,
    },
  };
}

export async function issueCertForStudent(
  adminId: string,
  userId: string,
  courseSlug: string,
  templateId?: string
): Promise<{ certNumber: string }> {
  const result = await checkEligibility(userId, courseSlug);
  if (result.alreadyIssued) throw new Error('Certificate already issued for this student and course');
  if (!result.eligible) throw new Error('Student has not met all eligibility conditions');

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, createdAt: true },
  });
  if (!student) throw new Error('Student not found');

  const firstProgress = await prisma.progress.findFirst({
    where: { userId, courseSlug },
    orderBy: { completedAt: 'asc' },
    select: { completedAt: true },
  });

  const startDate = (firstProgress?.completedAt ?? student.createdAt).toISOString().split('T')[0];
  const endDate   = new Date().toISOString().split('T')[0];

  const certsUrl    = process.env.CERTS_APP_URL;
  const bearerToken = process.env.CERTS_BEARER_TOKEN;
  if (!certsUrl || !bearerToken) throw new Error('CERTS_APP_URL or CERTS_BEARER_TOKEN not set in env');

  const scoreNote = result.avgQuizScore !== null ? `Average quiz score: ${result.avgQuizScore}%` : '';
  const programName = result.capstoneTitle
    ? `${COURSE_FULL_NAMES[courseSlug] ?? courseSlug} (Final Project: ${result.capstoneTitle})`
    : (COURSE_FULL_NAMES[courseSlug] ?? courseSlug);

  const response = await fetch(`${certsUrl}/api/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      type:           'CRS',
      recipientName:  student.name,
      recipientEmail: student.email,
      program:        programName,
      duration:       'Self-Paced Course',
      startDate,
      endDate,
      notes:          scoreNote,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Certs API error (${response.status}): ${JSON.stringify(err)}`);
  }

  const certNumber = response.headers.get('x-cert-number');
  if (!certNumber) throw new Error('Certs API did not return X-Cert-Number');

  await prisma.issuedCertificate.create({
    data: {
      userId,
      courseSlug,
      certNumber,
      issuedBy: adminId,
      avgScore: result.avgQuizScore,
      templateId: templateId || 'default'
    },
  });

  try {
    await evaluateAndUnlockAchievements(userId, `certificate_issued:${courseSlug}`);
  } catch (e) {
    console.error('[achievements] evaluation failed after certificate issuance', e);
  }

  return { certNumber };
}
