import { updatePortfolio } from '../lib/portfolioUpdater.js';
import { sendNotification } from '../services/notificationService.js';
import { checkEligibility, issueCertForStudent } from '../services/certificationService.js';
import { COURSE_LECTURE_COUNTS } from '../routes/courses.js';
import { COURSE_FULL_NAMES } from '../lib/courseNames.js';
import { prisma } from '../prisma.js';

const COURSE_TITLE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(COURSE_FULL_NAMES).map(([slug, title]) => [title, slug])
);

async function resolveCourseSlug(courseId: string): Promise<string | null> {
  // If courseId is already a known slug, use it directly
  if (COURSE_LECTURE_COUNTS[courseId]) return courseId;

  // Otherwise treat it as a DB cuid and look up the Course title
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });
  if (!course) return null;

  return COURSE_TITLE_TO_SLUG[course.title] ?? course.title.toLowerCase().replace(/\s+/g, '-');
}

export async function processCertificate(job: any) {
  const { studentId, courseId } = job.data;
  console.log(`[CertificateWorker] Checking eligibility — student=${studentId} course=${courseId}`);

  const courseSlug = await resolveCourseSlug(courseId);
  if (!courseSlug) {
    console.warn(`[CertificateWorker] Could not resolve courseSlug for courseId=${courseId} — skipping`);
    return;
  }

  // Idempotency guard — never double-issue
  const existing = await prisma.issuedCertificate.findUnique({
    where: { userId_courseSlug: { userId: studentId, courseSlug } },
  });
  if (existing) {
    console.log(`[CertificateWorker] Certificate already issued (${existing.certNumber}) — skipping`);
    return;
  }

  // Real eligibility check
  const eligibility = await checkEligibility(studentId, courseSlug);
  if (!eligibility.eligible) {
    const missing = Object.entries(eligibility.conditions)
      .filter(([, v]) => !v.passed)
      .map(([k]) => k)
      .join(', ');
    console.log(`[CertificateWorker] Not eligible yet. Incomplete: ${missing}`);
    return;
  }

  // Attempt to issue via the external cert API
  try {
    const { certNumber } = await issueCertForStudent('system', studentId, courseSlug);

    const course = await prisma.course.findFirst({
      where: { title: Object.entries(COURSE_TITLE_TO_SLUG).find(([, s]) => s === courseSlug)?.[0] ?? '' },
      select: { title: true, id: true },
    });
    const courseTitle = course?.title ?? courseSlug;

    await updatePortfolio(studentId, 'certificates', {
      courseId: course?.id ?? courseId,
      courseSlug,
      title: courseTitle,
      certNumber,
      issuedAt: new Date().toISOString(),
    });

    await sendNotification(
      studentId,
      'certificate_ready',
      'Certificate Ready',
      `Your ${courseTitle} certificate is ready to download.`,
      `/verify/${certNumber}`,
      'high',
      `certificate_${studentId}_${courseSlug}`
    );

    console.log(`[CertificateWorker] Issued certificate ${certNumber} for student ${studentId}`);
  } catch (err: any) {
    if (err.message?.includes('CERTS_APP_URL') || err.message?.includes('CERTS_BEARER_TOKEN')) {
      // External API not configured — issue locally so the student still gets their certificate
      await issueLocalCertificate(studentId, courseId, courseSlug, eligibility.avgQuizScore);
    } else {
      throw err; // Re-throw so BullMQ retries on transient failures
    }
  }
}

async function issueLocalCertificate(
  studentId: string,
  courseId: string,
  courseSlug: string,
  avgScore: number | null
): Promise<void> {
  console.log(`[CertificateWorker] External cert API not configured — issuing local certificate`);

  const courseTitle = Object.entries(COURSE_TITLE_TO_SLUG).find(([, s]) => s === courseSlug)?.[0] ?? courseSlug;
  // Include student ID suffix to guarantee uniqueness under concurrent issuance
  const certNumber = `CERT-${courseSlug.toUpperCase()}-${Date.now()}-${studentId.slice(-6)}`;

  await prisma.issuedCertificate.create({
    data: {
      userId: studentId,
      courseSlug,
      certNumber,
      issuedBy: 'system',
      avgScore,
      templateId: 'default',
    },
  });

  await updatePortfolio(studentId, 'certificates', {
    courseId,
    courseSlug,
    title: courseTitle,
    certNumber,
    issuedAt: new Date().toISOString(),
  });

  await sendNotification(
    studentId,
    'certificate_ready',
    'Certificate Ready',
    `Your ${courseTitle} certificate is ready to download. Certificate number: ${certNumber}.`,
    `/verify/${certNumber}`,
    'high',
    `certificate_${studentId}_${courseSlug}`
  );

  console.log(`[CertificateWorker] Local certificate ${certNumber} issued for student ${studentId}`);
}
