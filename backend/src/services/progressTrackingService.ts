import { prisma } from "../prisma.js";
import { awardXp } from "./gamificationService.js";
import { sendInAppNotification, sendNotification } from "./notificationService.js";

export async function recordQuizAttempt(
  userId: string,
  courseSlug: string,
  lectureId: string,
  quizId: string,
  score: number,
  total: number,
  answers: any
) {
  const passed = score / total >= 0.7; // assuming 70% to pass
  
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      total,
      passed,
      answers: answers ?? {},
    },
  });

  if (!passed) {
    await awardXp(userId, 0, "Attempted Quiz", undefined);
  }

  await sendNotification(
    userId,
    "quiz_result",
    passed ? "✅ Quiz Passed!" : "📝 Quiz Attempted",
    passed
      ? `You passed with ${score}/${total}!`
      : `You scored ${score}/${total}. Keep trying!`,
    `/course/${courseSlug}/lecture/${lectureId}`
  );

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
