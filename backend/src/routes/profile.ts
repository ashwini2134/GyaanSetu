import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// Simple dictionary mapping projectId to metadata.
const PROJECT_METADATA: Record<string, { name: string; techStack: string; description: string }> = {
  "story_generator": { name: "Story Generator", techStack: "Python", description: "Use user input and variables to generate a simple story." },
  "rock_paper_scissors": { name: "Rock Paper Scissors", techStack: "Python", description: "Build a rock-paper-scissors game using conditional logic." },
  "multiplication_explorer": { name: "Multiplication Explorer", techStack: "Python", description: "Generate a multiplication table using nested loops." },
  "guessing_game_project": { name: "Guessing Game", techStack: "Python", description: "Create a number guessing game with loop control." },
  "shopping_list": { name: "Shopping List", techStack: "Python", description: "Build an interactive shopping list manager." },
  "contact_book": { name: "Contact Book", techStack: "Python", description: "Create a contact book that stores and retrieves information." },
  "unit_converter": { name: "Unit Converter", techStack: "Python", description: "Build a unit converter using reusable functions." },
  "text_analyzer": { name: "Text Analyzer", techStack: "Python", description: "Analyze text to count characters, words, and letter frequency." },
  "personal_diary": { name: "Personal Diary", techStack: "Python", description: "Build a personal diary app that saves entries to files." },
  "grade_tracker": { name: "Grade Tracker", techStack: "Python", description: "Create a complete grade tracking system that reads, processes, and saves student grades." }
};

function formatMetadata(projectId: string) {
  if (PROJECT_METADATA[projectId]) {
    return PROJECT_METADATA[projectId];
  }
  const name = projectId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return { name, techStack: "Programming", description: "A programming project." };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

router.get("/projects", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });

    const formattedProjects = projects.map(p => {
      const meta = formatMetadata(p.projectId);
      return {
        id: p.id,
        name: meta.name,
        description: meta.description,
        techStack: meta.techStack,
        status: p.status === "Completed" ? "Completed" : "In Progress",
        completedAt: p.completedAt ? formatDate(p.completedAt) : null,
        createdAt: formatDate(p.updatedAt) // using updatedAt since createdAt isn't in Prisma schema for Project
      };
    });

    res.json(formattedProjects);
  } catch (err) {
    next(err);
  }
});

router.get("/timeline", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const events: { date: string; rawDate: Date; type: string; title: string; description?: string }[] = [];

    // 1. User joined event
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      events.push({
        rawDate: user.createdAt,
        date: formatDate(user.createdAt),
        type: "joined",
        title: "Joined Fraylon Academy"
      });
    }

    // 2. CourseProgress / Progress
    const progress = await prisma.progress.findMany({
      where: { userId, completedAt: { not: null } }
    });
    
    // We group progress by courseSlug if we only want "Completed [Course Name]"
    // Or we emit "Completed [Lecture]" for each lecture. The prompt says:
    // each row = "Completed [Course Name]" event. In this schema, Progress is per lecture.
    // Let's emit an event per completed lecture to match "Completed Python Fundamentals"
    progress.forEach(p => {
      if (p.completedAt) {
        const title = `Completed ${p.courseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Lecture ${p.lectureId}`;
        events.push({
          rawDate: p.completedAt,
          date: formatDate(p.completedAt),
          type: "course",
          title
        });
      }
    });

    // 3. Projects
    const projects = await prisma.project.findMany({
      where: { userId, status: "Completed", completedAt: { not: null } }
    });
    projects.forEach(p => {
      if (p.completedAt) {
        const meta = formatMetadata(p.projectId);
        events.push({
          rawDate: p.completedAt,
          date: formatDate(p.completedAt),
          type: "project",
          title: `Completed ${meta.name} Project`
        });
      }
    });

    // 4. QuizAttempt
    const quizzes = await prisma.quizAttempt.findMany({
      where: { userId, passed: true }
    });
    quizzes.forEach(q => {
      const quizName = q.quizId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      events.push({
        rawDate: q.createdAt,
        date: formatDate(q.createdAt),
        type: "quiz",
        title: `Passed ${quizName} Quiz`
      });
    });

    // Sort ascending by rawDate
    events.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    // Map to remove rawDate
    const formattedEvents = events.map(e => ({
      date: e.date,
      type: e.type,
      title: e.title,
      description: e.description
    }));

    res.json(formattedEvents);
  } catch (err) {
    next(err);
  }
});

export default router;
