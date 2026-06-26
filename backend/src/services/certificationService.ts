import { prisma } from '../prisma.js';
import { COURSE_LECTURE_COUNTS } from '../routes/courses.js';

const COURSE_NAMES: Record<string, string> = {
  python:  'CS50P: Introduction to Python Programming',
  cs50ai:  'CS50 AI with Python',
};

// Total real (non-similar) problems per course
const COURSE_PROBLEM_COUNTS: Record<string, number> = {
  python:  37,
  cs50ai:  20,
};

// Per-lecture quiz count for score averaging
const COURSE_QUIZ_COUNTS: Record<string, number> = {
  python: 10,
  cs50ai: 10,
};

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

export interface EligibilityConditions {
  lecturesCompleted:  ConditionDetail;
  practiceCompleted:  ConditionDetail;
  quizzesAttempted:   ConditionDetail;
  problemsSubmitted:  ConditionDetail;
  projectCompleted:   { done: number; passed: boolean };
}

export interface EligibilityResult {
  eligible:      boolean;
  alreadyIssued: boolean;
  conditions:    EligibilityConditions;
  avgQuizScore:  number | null;
  lectureDetails?: {
    total: number;
    completed: number[];
    remaining: number[];
  };
}

export async function checkEligibility(userId: string, courseSlug: string): Promise<EligibilityResult> {
  const totalLectures = COURSE_LECTURE_COUNTS[courseSlug];
  if (!totalLectures) throw new Error(`Unknown course: ${courseSlug}`);

  const totalProblems = COURSE_PROBLEM_COUNTS[courseSlug] ?? 0;

  const [
    existing,
    progressRecords,
    quizLectures,
    submissionsDone,
    projectsDone,
    quizScores,
  ] = await Promise.all([
    prisma.issuedCertificate.findUnique({ where: { userId_courseSlug: { userId, courseSlug } } }),
    prisma.progress.findMany({
      where: { userId, courseSlug },
      select: { lectureId: true, status: true, practiceCompleted: true },
    }),
    prisma.quizAttempt.groupBy({
      by: ['lectureId'],
      where: { userId, lectureId: { startsWith: `${courseSlug}-` } },
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
    prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.quizAttempt.findMany({
      where: { userId, lectureId: { startsWith: `${courseSlug}-` } },
      select: { score: true, lectureId: true },
    }),
  ]);

  const lecturesDone = progressRecords.filter(p => p.status === 'COMPLETED').length;
  const practiceDone = progressRecords.filter(p => p.practiceCompleted).length;
  const completedLectureIds = progressRecords.filter(p => p.status === 'COMPLETED').map(p => Number(p.lectureId)).sort((a, b) => a - b);
  const allLectureNumbers = Array.from({ length: totalLectures }, (_, i) => i);
  const remainingLectures = allLectureNumbers.filter(n => !completedLectureIds.includes(n));

  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((s, q) => s + q.score, 0) / quizScores.length)
      : null;

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
    quizzesAttempted: {
      done: quizLectures.length,
      required: totalLectures,
      passed: quizLectures.length >= totalLectures,
      details: { lectureIds: quizLectures.map(q => q.lectureId), avgScore: avgQuizScore },
    },
    problemsSubmitted: {
      done: submissionsDone,
      required: totalProblems,
      passed: submissionsDone >= totalProblems,
    },
    projectCompleted: { done: projectsDone, passed: projectsDone > 0 },
  };

  const eligible = Object.values(conditions).every(c => c.passed);
  return {
    eligible,
    alreadyIssued: !!existing,
    conditions,
    avgQuizScore,
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
      program:        COURSE_NAMES[courseSlug] ?? courseSlug,
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
    data: { userId, courseSlug, certNumber, issuedBy: adminId, avgScore: result.avgQuizScore },
  });

  return { certNumber };
}
