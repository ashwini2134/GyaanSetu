import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

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

router.get("/progress/:userId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.userId;
    if (userId !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId: { startsWith: "assessment::" }
      },
      orderBy: { createdAt: "desc" }
    });

    const passedSubsections = new Set<string>();
    
    attempts.forEach(attempt => {
      if (attempt.passed) {
        passedSubsections.add(attempt.quizId);
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
        const quizId = `assessment::${category}::${sub}`;
        if (passedSubsections.has(quizId)) {
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
    const userId = req.params.userId;
    if (userId !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId: { startsWith: "assessment::" }
      },
      orderBy: { createdAt: "asc" }
    });

    const statusMap = new Map<string, string>();
    attempts.forEach(attempt => {
      if (attempt.passed) {
        statusMap.set(attempt.quizId, "completed");
      } else {
        if (statusMap.get(attempt.quizId) !== "completed") {
          statusMap.set(attempt.quizId, "in_progress");
        }
      }
    });

    const result: Record<string, Record<string, string>> = {};

    for (const [category, subsections] of Object.entries(CATEGORY_STRUCTURE)) {
      result[category] = {};
      for (const sub of subsections) {
        const quizId = `assessment::${category}::${sub}`;
        result[category][sub] = statusMap.get(quizId) || "not_started";
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/questions/:category/:subsection', async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category).trim();
    const subsection = decodeURIComponent(req.params.subsection).trim();

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

    return res.status(200).json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { userId, category, subsection, score, totalQuestions, timeTaken, answers } = req.body;

    if (!userId || !category || !subsection) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['userId', 'category', 'subsection'] 
      });
    }

    const scoreNum = Number(score) || 0;
    const totalNum = Number(totalQuestions) || 0;
    const timeNum = Number(timeTaken) || 0;
    const passed = totalNum > 0 && (scoreNum / totalNum) >= 0.6;
    const status = passed ? 'completed' : 'in_progress';

    const result = await prisma.assessmentProgress.upsert({
      where: {
        userId_category_subsection: {
          userId,
          category,
          subsection
        }
      },
      update: {
        score: scoreNum,
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
        score: scoreNum,
        totalQuestions: totalNum,
        timeTaken: timeNum,
        status,
        attempts: 1,
        lastAttemptAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      score: scoreNum,
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
    const userId = req.params.userId;
    if (userId !== req.user!.id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId: { startsWith: "assessment::" }
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
      const percent = (attempt.score / attempt.total) * 100;
      totalScorePercent += percent;
      
      const time = (attempt.answers as any)?.timeTaken || 0;
      totalTimeTaken += time;

      if (attempt.passed && !passedSet.has(attempt.quizId)) {
        passedSet.add(attempt.quizId);
        totalCompleted++;
      }

      // Extract category from quizId "assessment::Category::Subsection"
      const parts = attempt.quizId.split("::");
      const category = parts[1];
      if (category) {
        if (!categoryScores[category]) {
          categoryScores[category] = { total: 0, count: 0 };
        }
        categoryScores[category].total += percent;
        categoryScores[category].count++;
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
      const parts = attempt.quizId.split("::");
      return {
        category: parts[1] || "Unknown",
        subsection: parts[2] || "Unknown",
        score: Math.round((attempt.score / attempt.total) * 100),
        totalQuestions: attempt.total,
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
