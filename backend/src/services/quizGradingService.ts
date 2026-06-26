import { prisma } from "../prisma.js";

export interface QuizQuestionData {
  id: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export async function unlockNextLesson(userId: string, lectureId: string, courseId: string) {
  // Find current lesson to get its order
  const currentLesson = await prisma.lesson.findUnique({
    where: { id: lectureId }
  });

  if (!currentLesson) return;

  // Find the next lesson in the sequence
  const nextLesson = await prisma.lesson.findFirst({
    where: {
      courseId,
      order: {
        gt: currentLesson.order
      }
    },
    orderBy: {
      order: 'asc'
    }
  });

  if (nextLesson) {
    // Upsert StudentProgress to mark it as unlocked (completed = false)
    await prisma.studentProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: userId,
          lessonId: nextLesson.id
        }
      },
      update: {},
      create: {
        studentId: userId,
        courseId: courseId,
        lessonId: nextLesson.id,
        completed: false
      }
    });

    // For backward compatibility if the old Progress table is still used:
    try {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        // Assume slug is title lowercased and hyphenated, or fallback to courseId
        const slug = course.title.toLowerCase().replace(/\s+/g, '-');
        await prisma.progress.upsert({
          where: {
            userId_courseSlug_lectureId: {
              userId,
              courseSlug: slug,
              lectureId: nextLesson.id
            }
          },
          update: { status: "unlocked" },
          create: {
            userId,
            courseSlug: slug,
            lectureId: nextLesson.id,
            status: "unlocked"
          }
        });
      }
    } catch (err) {
      // Ignore if courseSlug doesn't match
    }
  }
}

export async function gradeQuiz(
  userId: string,
  lectureId: string,
  courseId: string,
  submittedAnswers: Record<string, string>,
  questions: QuizQuestionData[]
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

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = score >= 70;

  // Save the attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      lectureId,
      courseId,
      answers: submittedAnswers,
      score,
      passed,
      feedback
    }
  });

  if (passed) {
    await unlockNextLesson(userId, lectureId, courseId);
  }

  return {
    attemptId: attempt.id,
    score,
    passed,
    feedback
  };
}
