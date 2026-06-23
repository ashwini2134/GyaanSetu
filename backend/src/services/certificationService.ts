import { prisma } from '../prisma.js';
import { COURSE_LECTURE_COUNTS } from '../routes/courses.js';

const COURSE_NAMES: Record<string, string> = {
  python:  'CS50P: Introduction to Python Programming',
  cs50ai:  'CS50 AI with Python',
};

export interface EligibilityConditions {
  lecturesCompleted:  { done: number; required: number; passed: boolean };
  practiceCompleted:  { done: number; required: number; passed: boolean };
  quizzesAttempted:   { done: number; required: number; passed: boolean };
  problemsSubmitted:  { done: number; passed: boolean };
  projectCompleted:   { done: number; passed: boolean };
}

export interface EligibilityResult {
  eligible:      boolean;
  alreadyIssued: boolean;
  conditions:    EligibilityConditions;
  avgQuizScore:  number | null;
}

export async function checkEligibility(userId: string, courseSlug: string): Promise<EligibilityResult> {
  const totalLectures = COURSE_LECTURE_COUNTS[courseSlug];
  if (!totalLectures) throw new Error(`Unknown course: ${courseSlug}`);

  const [
    existing,
    lecturesDone,
    practiceDone,
    quizLectures,
    submissionsDone,
    projectsDone,
    quizScores,
  ] = await Promise.all([
    prisma.issuedCertificate.findUnique({ where: { userId_courseSlug: { userId, courseSlug } } }),
    prisma.progress.count({ where: { userId, courseSlug, status: 'COMPLETED' } }),
    prisma.progress.count({ where: { userId, courseSlug, practiceCompleted: true } }),
    // one row per distinct quiz (lecture) attempted
    prisma.quizAttempt.groupBy({
      by: ['quizId'],
      where: { userId, quizId: { startsWith: `${courseSlug}-` } },
    }),
    prisma.submission.count({ where: { userId, status: 'PASSED' } }),
    prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.quizAttempt.findMany({
      where: { userId, quizId: { startsWith: `${courseSlug}-` } },
      select: { score: true, total: true },
    }),
  ]);

  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((s, q) => s + (q.score / q.total) * 100, 0) / quizScores.length)
      : null;

  const conditions: EligibilityConditions = {
    lecturesCompleted: { done: lecturesDone,          required: totalLectures, passed: lecturesDone >= totalLectures },
    practiceCompleted: { done: practiceDone,          required: totalLectures, passed: practiceDone >= totalLectures },
    quizzesAttempted:  { done: quizLectures.length,   required: totalLectures, passed: quizLectures.length >= totalLectures },
    problemsSubmitted: { done: submissionsDone,        passed: submissionsDone > 0 },
    projectCompleted:  { done: projectsDone,           passed: projectsDone > 0 },
  };

  const eligible = Object.values(conditions).every(c => c.passed);
  return { eligible, alreadyIssued: !!existing, conditions, avgQuizScore };
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
