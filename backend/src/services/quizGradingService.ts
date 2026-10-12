import { prisma } from "../prisma.js";
import { awardXp } from "./gamificationService.js";
import { certificateQueue } from "../lib/queue.js";
import { sendNotification } from "./notificationService.js";
import { COURSE_LECTURE_COUNTS } from "../routes/courses.js";
import { COURSE_FULL_NAMES } from "../lib/courseNames.js";

const COURSE_TITLE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(COURSE_FULL_NAMES).map(([slug, title]) => [title, slug])
);

export interface QuizQuestionData {
  id: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export async function unlockNextLesson(userId: string, lectureId: string, courseId: string) {
  // lectureId from the frontend is formatted as '{courseSlug}-{index}' (e.g., 'fundamentals-of-ai-0')
  // or occasionally as a plain numeric string. Extract the index from the last '-' segment.
  const parts = lectureId.split('-');
  const currentIndex = parseInt(parts[parts.length - 1], 10);
  if (isNaN(currentIndex)) return;

  const nextIndex = currentIndex + 1;

  // Resolve courseId → courseSlug for the Progress table.
  // The frontend may send a slug directly ('fundamentals-of-ai') or a DB cuid.
  let courseSlug = courseId;
  if (!COURSE_LECTURE_COUNTS[courseId]) {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true },
      });
      if (course) {
        courseSlug =
          COURSE_TITLE_TO_SLUG[course.title] ??
          course.title.toLowerCase().replace(/\s+/g, '-');
      }
    } catch { /* use courseId as-is */ }
  }

  // Primary: update the Progress table (the source of truth for lecture access control)
  try {
    await prisma.progress.upsert({
      where: {
        userId_courseSlug_lectureId: {
          userId,
          courseSlug,
          lectureId: String(nextIndex),
        },
      },
      update: { status: 'unlocked' },
      create: {
        userId,
        courseSlug,
        lectureId: String(nextIndex),
        status: 'unlocked',
      },
    });
  } catch (err) {
    console.error('[unlockNextLesson] Failed to update Progress table:', err);
  }

  // Best-effort: also update StudentProgress if DB-backed Lesson records exist
  // (used by exercise-based lessons stored in the DB, distinct from JSON course content)
  try {
    const currentLesson = await prisma.lesson.findFirst({
      where: { courseId, order: currentIndex },
    });
    if (currentLesson) {
      const nextLesson = await prisma.lesson.findFirst({
        where: { courseId, order: { gt: currentLesson.order } },
        orderBy: { order: 'asc' },
      });
      if (nextLesson) {
        await prisma.studentProgress.upsert({
          where: { studentId_lessonId: { studentId: userId, lessonId: nextLesson.id } },
          update: {},
          create: { studentId: userId, courseId, lessonId: nextLesson.id, completed: false },
        });
      }
    }
  } catch { /* StudentProgress is best-effort; ignore if no DB lessons exist */ }
}

export async function gradeQuiz(
  userId: string,
  lectureId: string,
  courseId: string,
  submittedAnswers: Record<string, string>,
  questions: QuizQuestionData[],
  timeTaken?: number
) {
  let earnedPoints = 0;
  let totalPoints = 0;
  const feedback: any[] = [];

  for (const q of questions) {
    totalPoints += q.points;
    const userAnswer = submittedAnswers[q.id] || "";
    
    if (userAnswer === q.correctAnswer) {
      earnedPoints += q.points;
    } else {
      feedback.push({
        questionId: q.id,
        yourAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ""
      });
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= 70;

  // Calculate attempt number
  const previousAttempts = await prisma.quizAttempt.count({
    where: { userId, courseId, ...(lectureId && { lectureId }) }
  });
  const attemptNumber = previousAttempts + 1;

  // Save the attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      lectureId: lectureId || null,
      courseId,
      answers: submittedAnswers,
      score,
      passed,
      timeTaken,
      attemptNumber,
      feedback
    }
  });

  if (passed && lectureId) {
    await unlockNextLesson(userId, lectureId, courseId);

    const xpReward = Math.round(50 * (score / 100));
    await awardXp(userId, xpReward, `Passed Quiz in course ${courseId}`, `quiz_pass_${courseId}_${lectureId}`);

    // Trigger certificate eligibility check asynchronously
    await certificateQueue.add('checkCertificate', { studentId: userId, courseId });

    // Notify student of passing result
    if (score === 100) {
      await sendNotification(
        userId,
        'perfect_score',
        'Perfect Score',
        `You scored 100% on the quiz in ${courseId}.`,
        `/courses/${courseId}`,
        'medium'
      );
    } else {
      await sendNotification(
        userId,
        'quiz_result',
        'Quiz Passed',
        `You scored ${score}% and passed the quiz.`,
        `/courses/${courseId}`,
        'medium'
      );
    }
  } else {
    await sendNotification(
      userId,
      'quiz_result',
      'Quiz Result',
      `You scored ${score}%. You need 70% to pass — give it another try!`,
      `/courses/${courseId}`,
      'low'
    );
  }

  return {
    attemptId: attempt.id,
    score,
    passed,
    feedback
  };
}
