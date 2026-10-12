import { prisma } from "../prisma.js";
import { awardXp } from "./gamificationService.js";
import { sendInAppNotification, sendNotification } from "./notificationService.js";

export async function recordQuizAttempt(
  userId: string,
  courseSlug: string,
  lectureId: string,
  score: number,
  answers: any
) {
  const passed = score >= 50; 
  
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      lectureId: lectureId || null,
      courseId: 'unknown',
      score,
      passed,
      answers: answers ?? {},
    },
  });

  if (!passed) {
    await awardXp(userId, 0, "Attempted Quiz", undefined);
  }

  if (passed && score === 100) {
    await sendNotification(
      userId,
      "perfect_score",
      "Perfect Score",
      `You scored 100% in ${courseSlug}${lectureId ? `, lecture ${lectureId}` : ''}.`,
      `/course/${courseSlug}${lectureId ? `/lecture/${lectureId}` : ''}`,
      "medium"
    );
  } else {
    await sendNotification(
      userId,
      "quiz_result",
      passed ? "Quiz Passed" : "Quiz Attempted",
      passed
        ? `You passed with ${score}%.`
        : `You scored ${score}%. Keep trying!`,
      `/course/${courseSlug}/lecture/${lectureId}`,
      passed ? "medium" : "low"
    );
  }

  return { attempt, passed };
}

export async function completeLecture(
  userId: string,
  courseSlug: string,
  lectureId: string
) {
  const progress = await prisma.progress.upsert({
    where: {
      userId_courseSlug_lectureId: {
        userId,
        courseSlug,
        lectureId,
      },
    },
    update: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
    create: {
      userId,
      courseSlug,
      lectureId,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // Award 50 XP for lecture
  await awardXp(userId, 50, "Completed Lecture", `lecture_complete_${courseSlug}_${lectureId}`);

  return progress;
}
