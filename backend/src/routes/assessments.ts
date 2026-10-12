import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { awardXp } from "../services/gamificationService.js";

const router = Router();

const CATEGORY_STRUCTURE: Record<string, string[]> = {
  "Aptitude": ["Quantitative Aptitude", "Logical Reasoning", "Analytical Reasoning", "Verbal Ability"],
  "Communication Skills": ["Grammar", "Vocabulary", "Reading Comprehension", "Email Writing", "Resume Writing"],
  "Pseudocode & Problem Solving": ["Flowcharts", "Loops", "Arrays", "Functions", "Recursion"],
  "Technical Assessments": ["Python", "Java", "JavaScript", "SQL", "DBMS", "OS", "Computer Networks"],
  "AI Interview Practice": ["HR Questions", "Technical Interview", "Behavioral Questions", "Mock Interviews"],
  "Mock Tests": ["Full Mock"],
  "Reports & Analytics": []
};

router.get("/categories", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    // 1. Fetch published dynamic assessments
    const publishedAssessments = await prisma.assessment.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { questions: true } }
      }
    });

    // 2. Fetch legacy questions
    const legacyGroups = await prisma.assessmentQuestion.groupBy({
      by: ['category', 'subsection'],
      where: { assessmentId: null },
      _count: { _all: true }
    });

    const categoriesMap: Record<string, any[]> = {};

    // Add legacy
    for (const group of legacyGroups) {
      if (!categoriesMap[group.category]) categoriesMap[group.category] = [];
      categoriesMap[group.category].push({
        name: group.subsection,
        questionCount: group._count._all,
        isDynamic: false
      });
    }

    // Add dynamic
    for (const p of publishedAssessments) {
      if (!categoriesMap[p.category]) categoriesMap[p.category] = [];
      categoriesMap[p.category].push({
        name: p.subsection,
        questionCount: p._count.questions,
        description: p.description || "",
        isDynamic: true
      });
    }

    const result = Object.keys(categoriesMap).map(categoryName => {
      return {
        id: categoryName.toLowerCase().replace(/\s+/g, '-'),
        name: categoryName,
        subsections: categoriesMap[categoryName]
      };
    });

    res.json({ categories: result });
  } catch (error) {
    next(error);
  }
});

router.get("/progress/:userId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.userId as string;
    if (userId !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        lectureId: { startsWith: "assessment::" }
      },
      orderBy: { createdAt: "desc" }
    });

    const passedSubsections = new Set<string>();

    attempts.forEach(attempt => {
      if (attempt.passed && attempt.lectureId) {
        passedSubsections.add(attempt.lectureId);
      }
    });

    const progress: Record<string, number> = {};

    for (const [category, subsections] of Object.entries(CATEGORY_STRUCTURE)) {
      if (subsections.length === 0) {
        progress[category] = 0;
        continue;
      }

      let completedCount = 0;
      for (const sub of subsections) {
        const lectureId = `assessment::${category}::${sub}`;
        if (passedSubsections.has(lectureId)) {
          completedCount++;
        }
      }

      progress[category] = Math.round((completedCount / subsections.length) * 100);
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

router.get("/subsection-status/:userId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.userId as string;
    if (userId !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        lectureId: { startsWith: "assessment::" }
      },
      orderBy: { createdAt: "asc" }
    });

    const statusMap = new Map<string, string>();
    attempts.forEach(attempt => {
      if (attempt.lectureId) {
        if (attempt.passed) {
          statusMap.set(attempt.lectureId, "completed");
        } else {
          if (statusMap.get(attempt.lectureId) !== "completed") {
            statusMap.set(attempt.lectureId, "in_progress");
          }
        }
      }
    });

    const result: Record<string, Record<string, string>> = {};

    for (const [category, subsections] of Object.entries(CATEGORY_STRUCTURE)) {
      result[category] = {};
      for (const sub of subsections) {
        const lectureId = `assessment::${category}::${sub}`;
        result[category][sub] = statusMap.get(lectureId) || "not_started";
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/questions/:category/:subsection', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const category = decodeURIComponent(req.params.category as string).trim();
    const subsection = decodeURIComponent(req.params.subsection as string).trim();

    const questions = await prisma.assessmentQuestion.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive'
        },
        subsection: {
          equals: subsection,
          mode: 'insensitive'
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        error: 'No questions found',
        message: `No questions available for ${category} - ${subsection}`,
        category,
        subsection
      });
    }

    // Strip correctAnswer for non-admin users to prevent answer key leakage
    const isAdmin = req.user!.role === 'admin';
    const sanitized = isAdmin ? questions : questions.map(q => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    return res.status(200).json({ questions: sanitized });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/submit', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { category, subsection, score, totalQuestions, timeTaken, answers } = req.body;

    // Derive userId from authenticated JWT, never trust request body
    const userId = req.user!.id;

    if (!category || !subsection) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['category', 'subsection'] 
      });
    }

    const timeNum = Number(timeTaken) || 0;

    // Fetch questions to grade securely on the backend
    const dbQuestions = await prisma.assessmentQuestion.findMany({
      where: {
        category: { equals: category, mode: 'insensitive' },
        subsection: { equals: subsection, mode: 'insensitive' }
      },
      select: { id: true, correctAnswer: true }
    });

    const questionMap = new Map<string, string>();
    dbQuestions.forEach(q => questionMap.set(q.id, q.correctAnswer));

    let calculatedScore = 0;
    if (Array.isArray(answers)) {
      answers.forEach((ans: any) => {
        const correct = questionMap.get(ans.questionId);
        if (correct && ans.userAnswer === correct) {
          calculatedScore++;
        }
      });
    }

    const totalNum = dbQuestions.length || Number(totalQuestions) || 0;
    const passed = totalNum > 0 && (calculatedScore / totalNum) >= 0.6;
    const status = passed ? 'completed' : 'in_progress';

    // 1. Check if a completed record already exists BEFORE we update it
    const existingProgress = await prisma.assessmentProgress.findUnique({
      where: {
        userId_category_subsection: {
          userId,
          category,
          subsection
        }
      }
    });
    
    const wasAlreadyCompleted = existingProgress?.status === 'completed';

    // 2. Perform the update
    const result = await prisma.assessmentProgress.upsert({
      where: {
        userId_category_subsection: {
          userId,
          category,
          subsection
        }
      },
      update: {
        score: calculatedScore,
        totalQuestions: totalNum,
        timeTaken: timeNum,
        status,
        attempts: { increment: 1 },
        lastAttemptAt: new Date()
      },
      create: {
        userId,
        category,
        subsection,
        score: calculatedScore,
        totalQuestions: totalNum,
        timeTaken: timeNum,
        status,
        attempts: 1,
        lastAttemptAt: new Date()
      }
    });

    // 3. Award XP if they just passed for the first time
    if (passed && !wasAlreadyCompleted) {
      await awardXp(userId, 50, "Assessment Passed", `assessment_passed_${category}_${subsection}`);
    }

    return res.status(200).json({
      success: true,
      score: calculatedScore,
      totalQuestions: totalNum,
      passed,
      status,
      result
    });

  } catch (error: any) {
    console.error('Assessment submit error:', error);
    return res.status(500).json({ 
      error: 'Failed to submit assessment', 
      details: error.message 
    });
  }
});

router.get("/analytics/:userId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.userId as string;
    if (userId !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        lectureId: { startsWith: "assessment::" }
      },
      orderBy: { createdAt: "desc" }
    });

    if (attempts.length === 0) {
      return res.json({
        totalAttempted: 0,
        totalCompleted: 0,
        averageScore: 0,
        averageTimeTaken: 0,
        accuracyByCategory: {},
        recentAttempts: [],
        progressHistory: []
      });
    }

    let totalCompleted = 0;
    let totalScorePercent = 0;
    let totalTimeTaken = 0;
    
    const categoryScores: Record<string, { total: number, count: number }> = {};
    const passedSet = new Set<string>();
    
    const historyMap: Record<string, number> = {};

    attempts.forEach(attempt => {
      const percent = (attempt.score / 100) * 100;
      totalScorePercent += percent;

      const time = (attempt.answers as any)?.timeTaken || 0;
      totalTimeTaken += time;

      if (attempt.passed && attempt.lectureId && !passedSet.has(attempt.lectureId)) {
        passedSet.add(attempt.lectureId);
        totalCompleted++;
      }

      // Extract category from lectureId "assessment::Category::Subsection"
      if (attempt.lectureId) {
        const parts = attempt.lectureId.split("::");
        const category = parts[1];
        if (category) {
          if (!categoryScores[category]) {
            categoryScores[category] = { total: 0, count: 0 };
          }
          categoryScores[category].total += percent;
          categoryScores[category].count++;
        }
      }

      // Group for history chart (YYYY-MM-DD)
      const dateStr = attempt.createdAt.toISOString().split("T")[0];
      if (!historyMap[dateStr]) historyMap[dateStr] = 0;
      if (attempt.passed) {
        historyMap[dateStr]++;
      }
    });

    const averageScore = Math.round(totalScorePercent / attempts.length);
    const averageTimeTaken = Math.round(totalTimeTaken / attempts.length);

    const accuracyByCategory: Record<string, number> = {};
    for (const [cat, data] of Object.entries(categoryScores)) {
      accuracyByCategory[cat] = Math.round(data.total / data.count);
    }

    const recentAttempts = attempts.slice(0, 5).map(attempt => {
      const parts = attempt.lectureId ? attempt.lectureId.split("::") : ["unknown", "Unknown", "Unknown"];
      return {
        category: parts[1] || "Unknown",
        subsection: parts[2] || "Unknown",
        score: Math.round((attempt.score / 100) * 100),
        totalQuestions: 100,
        timeTaken: (attempt.answers as any)?.timeTaken || 0,
        lastAttemptAt: attempt.createdAt
      };
    });

    const progressHistory = Object.entries(historyMap)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, completed]) => ({ date, completed }));

    res.json({
      totalAttempted: attempts.length,
      totalCompleted,
      averageScore,
      averageTimeTaken,
      accuracyByCategory,
      recentAttempts,
      progressHistory
    });

  } catch (error) {
    next(error);
  }
});

export default router;
