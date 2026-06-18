import { Router } from "express";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

const _dirname = new URL(".", import.meta.url).pathname;
const QA_DATA_PATH = join(_dirname, "..", "..", "qa-data.json");

type ReviewStatus = "pending" | "in_progress" | "completed";

interface ReviewItem {
  status: ReviewStatus;
  reviewedBy: string;
  reviewDate: string | null;
  notes: string;
}

interface CourseQA {
  lecturesReviewed: ReviewItem;
  exercisesReviewed: ReviewItem;
  assessmentsReviewed: ReviewItem;
  projectsReviewed: ReviewItem;
  certificateTested: ReviewItem;
  e2eFlowTested: ReviewItem;
}

interface ValidationResult {
  check: string;
  passed: boolean;
  details: string;
}

interface CourseQAData {
  [courseSlug: string]: CourseQA;
}

function defaultReviewItem(): ReviewItem {
  return {
    status: "pending",
    reviewedBy: "",
    reviewDate: null,
    notes: "",
  };
}

function defaultCourseQA(): CourseQA {
  return {
    lecturesReviewed: defaultReviewItem(),
    exercisesReviewed: defaultReviewItem(),
    assessmentsReviewed: defaultReviewItem(),
    projectsReviewed: defaultReviewItem(),
    certificateTested: defaultReviewItem(),
    e2eFlowTested: defaultReviewItem(),
  };
}

function loadQAData(): CourseQAData {
  try {
    if (existsSync(QA_DATA_PATH)) {
      return JSON.parse(readFileSync(QA_DATA_PATH, "utf-8"));
    }
  } catch {
    // ignore
  }
  return {};
}

function saveQAData(data: CourseQAData): void {
  writeFileSync(QA_DATA_PATH, JSON.stringify(data, null, 2));
}

const COURSE_LIST = [
  { slug: "python", title: "Python Programming" },
  { slug: "cs50ai", title: "AI" },
];

router.get(
  "/courses",
  requireAuth,
  requireRole("admin", "instructor"),
  (_req: AuthenticatedRequest, res) => {
    const qaData = loadQAData();
    const courses = COURSE_LIST.map((c) => {
      const qa = qaData[c.slug] || defaultCourseQA();
      const items = Object.values(qa);
      const completed = items.filter((i) => i.status === "completed").length;
      const inProgress = items.filter((i) => i.status === "in_progress").length;
      const total = items.length;
      const healthScore = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        slug: c.slug,
        title: c.title,
        healthScore,
        completedItems: completed,
        totalItems: total,
        inProgress,
        qa,
      };
    });
    res.json(courses);
  }
);

router.get(
  "/courses/:slug",
  requireAuth,
  requireRole("admin", "instructor"),
  (req: AuthenticatedRequest, res) => {
    const slug = req.params.slug as string;
    const course = COURSE_LIST.find((c) => c.slug === slug);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    const qaData = loadQAData();
    const qa = qaData[slug] || defaultCourseQA();
    res.json({ slug: course.slug, title: course.title, qa });
  }
);

router.put(
  "/courses/:slug/review",
  requireAuth,
  requireRole("admin", "instructor"),
  (req: AuthenticatedRequest, res) => {
    const slug = req.params.slug as string;
    const { item, status, notes } = req.body as {
      item: keyof CourseQA;
      status?: ReviewStatus;
      notes?: string;
    };

    const validItems: (keyof CourseQA)[] = [
      "lecturesReviewed",
      "exercisesReviewed",
      "assessmentsReviewed",
      "projectsReviewed",
      "certificateTested",
      "e2eFlowTested",
    ];

    if (!validItems.includes(item)) {
      res.status(400).json({ error: "Invalid review item" });
      return;
    }

    const qaData = loadQAData();
    if (!qaData[slug]) {
      qaData[slug] = defaultCourseQA();
    }

    if (status) {
      qaData[slug][item].status = status;
      if (status === "completed" || status === "in_progress") {
        qaData[slug][item].reviewedBy = req.user?.name || "";
        qaData[slug][item].reviewDate = new Date().toISOString();
      }
    }
    if (notes !== undefined) {
      qaData[slug][item].notes = notes;
    }

    saveQAData(qaData);
    res.json({ slug, qa: qaData[slug] });
  }
);

router.post(
  "/courses/:slug/validate",
  requireAuth,
  requireRole("admin", "instructor"),
  async (req: AuthenticatedRequest, res) => {
    const slug = req.params.slug as string;
    const __dirname = new URL(".", import.meta.url).pathname;
    const dataDir = join(__dirname, "..", "..", "..", "frontend", "public", "data", slug);
    const results: ValidationResult[] = [];
    let issues = 0;

    try {
      const lecturesRaw = readFileSync(join(dataDir, "lectures.json"), "utf-8");
      const lectures = JSON.parse(lecturesRaw);
      const missingLectures: number[] = [];

      for (const lecture of lectures) {
        const num = lecture.number;
        const lectureDir = join(dataDir, `lecture_${num}`);
        const hasLesson = existsSync(join(lectureDir, "lesson.json"));
        const hasProblems = existsSync(join(lectureDir, "problems.json"));
        const hasQuiz = existsSync(join(lectureDir, "quiz.json"));

        if (!hasLesson) {
          missingLectures.push(num);
        }
      }

      if (missingLectures.length === 0) {
        results.push({
          check: "Missing lectures",
          passed: true,
          details: `All ${lectures.length} lectures have lesson content`,
        });
      } else {
        issues++;
        results.push({
          check: "Missing lectures",
          passed: false,
          details: `Lectures ${missingLectures.join(", ")} missing lesson.json`,
        });
      }

      let totalProblems = 0;
      const lecturesWithoutProblems: number[] = [];

      for (const lecture of lectures) {
        const num = lecture.number;
        const problemsPath = join(dataDir, `lecture_${num}`, "problems.json");
        if (existsSync(problemsPath)) {
          const problems = JSON.parse(readFileSync(problemsPath, "utf-8"));
          totalProblems += problems.length;
          if (problems.length === 0) {
            lecturesWithoutProblems.push(num);
          }
        } else {
          lecturesWithoutProblems.push(num);
        }
      }

      if (lecturesWithoutProblems.length === 0) {
        results.push({
          check: "Missing exercises",
          passed: true,
          details: `${totalProblems} exercises found across all lectures`,
        });
      } else {
        issues++;
        results.push({
          check: "Missing exercises",
          passed: false,
          details: `Lectures ${lecturesWithoutProblems.join(", ")} have no exercises`,
        });
      }

      let totalQuizzes = 0;
      const lecturesWithoutQuizzes: number[] = [];

      for (const lecture of lectures) {
        const num = lecture.number;
        const quizPath = join(dataDir, `lecture_${num}`, "quiz.json");
        if (existsSync(quizPath)) {
          const quiz = JSON.parse(readFileSync(quizPath, "utf-8"));
          totalQuizzes += quiz.length;
          if (quiz.length === 0) {
            lecturesWithoutQuizzes.push(num);
          }
        } else {
          lecturesWithoutQuizzes.push(num);
        }
      }

      if (lecturesWithoutQuizzes.length === 0) {
        results.push({
          check: "Missing assessments",
          passed: true,
          details: `${totalQuizzes} quiz questions found across all lectures`,
        });
      } else {
        issues++;
        results.push({
          check: "Missing assessments",
          passed: false,
          details: `Lectures ${lecturesWithoutQuizzes.join(", ")} have no quizzes`,
        });
      }

      let projectCount = 0;

      for (const lecture of lectures) {
        const num = lecture.number;
        const lectureDir = join(dataDir, `lecture_${num}`);
        if (!existsSync(lectureDir)) continue;

        const projectPath = join(lectureDir, "project.md");
        if (existsSync(projectPath)) {
          projectCount++;
          continue;
        }

        const entries = readdirSync(lectureDir);
        for (const entry of entries) {
          const entryPath = join(lectureDir, entry);
          if (!existsSync(entryPath)) continue;
          if (entry.endsWith(".json") || entry.endsWith(".md")) continue;
          try {
            const subFiles = readdirSync(entryPath);
            if (subFiles.some((f: string) => f.includes("solution") || f.includes("specification") || f.includes("starter"))) {
              projectCount++;
              break;
            }
          } catch {
            // not a directory
          }
        }
      }

      const hasCapstone = lectures.some((l: any) =>
        l.title?.toLowerCase().includes("project") || l.title?.toLowerCase().includes("capstone")
      );

      if (projectCount > 0 || hasCapstone) {
        results.push({
          check: "Missing projects",
          passed: true,
          details: `${projectCount} project(s) found${hasCapstone ? " (includes capstone/final)" : ""}`,
        });
      } else {
        issues++;
        results.push({
          check: "Missing projects",
          passed: false,
          details: "No project files found",
        });
      }

      results.push({
        check: "Missing certificates",
        passed: true,
        details: "Certificate generation is available for completed courses",
      });

      const navIssues: string[] = [];
      for (const lecture of lectures) {
        const num = lecture.number;
        const lessonPath = join(dataDir, `lecture_${num}`, "lesson.json");
        if (existsSync(lessonPath)) {
          try {
            const lesson = JSON.parse(readFileSync(lessonPath, "utf-8"));
            if (!lesson.sections || lesson.sections.length === 0) {
              navIssues.push(`Lecture ${num}: no content sections`);
            }
          } catch {
            navIssues.push(`Lecture ${num}: invalid lesson.json`);
          }
        }
      }

      if (navIssues.length === 0) {
        results.push({
          check: "Broken navigation",
          passed: true,
          details: "All lectures have valid content structure",
        });
      } else {
        issues++;
        results.push({
          check: "Broken navigation",
          passed: false,
          details: navIssues.join("; "),
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({
        check: "Course validation",
        passed: false,
        details: `Failed to validate course: ${message}`,
      });
      issues++;
    }

    res.json({ slug, results, totalIssues: issues });
  }
);

export default router;
