import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { COURSE_LECTURE_COUNTS } from "./courses.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth, requireRole("admin"));

const isTestEnv = process.env.NODE_ENV === "test";
const emailFilter = isTestEnv
  ? { NOT: [{ email: { endsWith: "@test.com" } }] }
  : { NOT: [{ email: { endsWith: "@test.com" } }, { email: { endsWith: "@example.com" } }] };

router.get("/stats", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalAdmins,
      totalCourses,
      totalProjects,
      pendingProjects,
      totalCertsIssued,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "student", ...emailFilter } }),
      prisma.user.count({ where: { role: "student", status: "active", ...emailFilter } }),
      prisma.user.count({ where: { role: "admin" } }),
      Promise.resolve(Object.keys(COURSE_LECTURE_COUNTS).length),
      prisma.project.count({ where: { status: "COMPLETED", user: { ...emailFilter } } }),
      prisma.project.count({ where: { status: "PENDING_REVIEW", user: { ...emailFilter } } }),
      prisma.issuedCertificate.count({ where: { user: { ...emailFilter } } }),
    ]);

    res.json({ totalStudents, activeStudents, totalAdmins, totalCourses, totalProjects, pendingProjects, totalCertsIssued });
  } catch (err) { next(err); }
});

router.get("/students", async (req: AuthenticatedRequest, res, next) => {
  try {
    const search = (req.query.search as string || "").trim();
    const status = req.query.status as string | undefined;
    const sortBy = (req.query.sortBy as string) || "totalXp";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" as const : "desc" as const;

    const where: any = {
      role: "student",
      ...emailFilter
    };
    if (status && ["active", "suspended"].includes(status)) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          totalXp: true,
          currentStreak: true,
          status: true,
          createdAt: true,
          lastActiveAt: true,
          _count: {
            select: {
              progress: { where: { status: "COMPLETED" } },
              quizAttempts: { where: { passed: true } },
              submissions: { where: { status: "PASSED" } },
              projects: {},
              issuedCertificates: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const result = students.map(s => ({
      id: s.id, name: s.name, email: s.email, xp: s.totalXp, streak: s.currentStreak,
      status: s.status, joinedAt: s.createdAt, lastActive: s.lastActiveAt,
      lecturesCompleted: s._count.progress, quizzesPassed: s._count.quizAttempts,
      problemsSolved: s._count.submissions, projectsCount: s._count.projects,
      certificatesIssued: s._count.issuedCertificates,
    }));

    res.json({ students: result, total });
  } catch (err) { next(err); }
});

const studentInclude = {
  select: {
    id: true, name: true, email: true, totalXp: true, currentStreak: true,
    longestStreak: true, status: true, createdAt: true, lastActiveAt: true,
    avatarUrl: true, bio: true,
  },
};

router.get("/students/:userId", async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.userId as string;
    const [user, progress, quizAttempts, submissions, projects, certs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: studentInclude.select }),
      prisma.progress.findMany({ where: { userId }, orderBy: [{ courseSlug: "asc" }, { lectureId: "asc" }] }),
      prisma.quizAttempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.submission.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
      prisma.project.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
      prisma.issuedCertificate.findMany({ where: { userId }, orderBy: { issuedAt: "desc" } }),
    ]);
    if (!user) return res.status(404).json({ error: "Student not found" });
    res.json({ user, progress, quizAttempts, submissions, projects, certificates: certs });
  } catch (err) { next(err); }
});

router.post("/students/:userId/activate", async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.userId as string;
    const user = await prisma.user.update({ where: { id: userId }, data: { status: "active" }, select: { id: true, name: true, status: true } });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

router.post("/students/:userId/suspend", async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.userId as string;
    const user = await prisma.user.update({ where: { id: userId }, data: { status: "suspended" }, select: { id: true, name: true, status: true } });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

router.get("/students/:userId/activity", async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.userId as string;
    const daysAgo = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const [progress, quizAttempts, submissions, projects, xpHistory, notifs] = await Promise.all([
      prisma.progress.findMany({ where: { userId, completedAt: { gte: since } }, orderBy: { completedAt: "desc" }, take: 100 }),
      prisma.quizAttempt.findMany({ where: { userId, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.submission.findMany({ where: { userId, updatedAt: { gte: since } }, orderBy: { updatedAt: "desc" }, take: 100 }),
      prisma.project.findMany({ where: { userId, updatedAt: { gte: since } }, orderBy: { updatedAt: "desc" }, take: 100 }),
      prisma.xpTransaction.findMany({ where: { userId, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.inAppNotification.findMany({ where: { userId, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 100 }),
    ]);

    const activities: any[] = [];
    progress.forEach(p => activities.push({ type: "progress", action: `Completed lecture ${p.lectureId} in ${p.courseSlug}`, date: p.completedAt }));
    quizAttempts.forEach(q => activities.push({ type: "quiz", action: `Quiz ${q.passed ? "passed" : "failed"} (${q.score}%)`, date: q.createdAt }));
    submissions.forEach(s => activities.push({ type: "submission", action: `Problem ${s.problemId} — ${s.status}`, date: s.updatedAt }));
    projects.forEach(p => activities.push({ type: "project", action: `Project ${p.projectId} — ${p.status}`, date: p.updatedAt }));
    xpHistory.forEach(x => activities.push({ type: "xp", action: `${x.reason} (+${x.amount} XP)`, date: x.createdAt }));
    notifs.forEach(n => activities.push({ type: "notification", action: n.title, date: n.createdAt }));

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json({ activities: activities.slice(0, 200) });
  } catch (err) { next(err); }
});

router.get("/courses", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const courseSlugs = Object.keys(COURSE_LECTURE_COUNTS);
    const courseStats = await Promise.all(
      courseSlugs.map(async (slug) => {
        const totalLectures = COURSE_LECTURE_COUNTS[slug];
        const [progressRows, completedRows] = await Promise.all([
          prisma.progress.groupBy({
            by: ["userId"],
            where: { courseSlug: slug },
            _count: { id: true },
          }),
          prisma.progress.count({
            where: { courseSlug: slug, status: "COMPLETED" },
          }),
        ]);
        const enrolledCount = progressRows.length;
        const totalProgressEntries = progressRows.reduce((sum, r) => sum + r._count.id, 0);
        const avgProgress = enrolledCount > 0 ? Math.round((totalProgressEntries / (enrolledCount * totalLectures)) * 100) : 0;
        return {
          slug,
          totalLectures,
          studentsEnrolled: enrolledCount,
          completedLectures: completedRows,
          avgProgress,
          completionRate: enrolledCount > 0 ? Math.round((completedRows / (enrolledCount * totalLectures)) * 100) : 0,
        };
      })
    );
    res.json({ courses: courseStats });
  } catch (err) { next(err); }
});

router.get("/courses/:slug", async (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = req.params.slug as string;
    const totalLectures = COURSE_LECTURE_COUNTS[slug];
    if (!totalLectures) return res.status(404).json({ error: "Course not found" });

    const enrolled = await prisma.user.findMany({
      where: {
        role: "student",
        ...emailFilter,
        progress: { some: { courseSlug: slug } },
      },
      select: {
        id: true, name: true, email: true, totalXp: true, status: true,
        _count: {
          select: {
            progress: { where: { courseSlug: slug, status: "COMPLETED" } },
            quizAttempts: { where: { passed: true } },
          },
        },
      },
      orderBy: { totalXp: "desc" },
    });

    const students = enrolled.map(s => ({
      id: s.id, name: s.name, email: s.email, xp: s.totalXp, status: s.status,
      completedLectures: s._count.progress,
      quizzesPassed: s._count.quizAttempts,
      progress: Math.round((s._count.progress / totalLectures) * 100),
    }));

    res.json({ slug, totalLectures, studentsEnrolled: students.length, students });
  } catch (err) { next(err); }
});

router.get("/notifications", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [notifications, totalSent, readCount, unreadCount] = await Promise.all([
      prisma.inAppNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.inAppNotification.count(),
      prisma.inAppNotification.count({ where: { readAt: { not: null } } }),
      prisma.inAppNotification.count({ where: { readAt: null } }),
    ]);
    res.json({ notifications, stats: { totalSent, readCount, unreadCount, readRate: totalSent > 0 ? Math.round((readCount / totalSent) * 100) : 0 } });
  } catch (err) { next(err); }
});

const sendSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  type: z.string().default("course_update"),
  userIds: z.array(z.string()).optional(),
  link: z.string().optional(),
});

router.post("/notifications/send", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { title, body, type, userIds, link } = sendSchema.parse(req.body);
    const targets = userIds
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true } })
      : await prisma.user.findMany({
          where: {
            role: "student",
            ...emailFilter
          },
          select: { id: true }
        });

    await prisma.inAppNotification.createMany({
      data: targets.map(u => ({ userId: u.id, type, title, body, link: link || "" })),
    });

    res.json({ success: true, sent: targets.length });
  } catch (err) { next(err); }
});

// ── Project Management ──

const templateSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.string().min(1),
  shortDescription: z.string().min(1),
  longDescription: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  instructions: z.array(z.string()).default([]),
  expectedOutput: z.string().default(""),
  estimatedDuration: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
  githubLink: z.string().optional(),
  demoLink: z.string().optional(),
  image: z.string().optional(),
});

router.get("/projects", async (req: AuthenticatedRequest, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const search = (req.query.search as string || "").trim();
    const where: any = {};
    if (status && ["NOT_STARTED", "IN_PROGRESS", "PENDING_REVIEW", "COMPLETED", "REJECTED"].includes(status)) where.status = status;
    if (search) where.user = { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: 200,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.project.count({ where }),
    ]);
    res.json({ projects, total });
  } catch (err) { next(err); }
});

router.get("/projects/stats", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [total, byStatus, templatesCount] = await Promise.all([
      prisma.project.count(),
      prisma.project.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.projectTemplate.count(),
    ]);
    const statusCounts: Record<string, number> = {};
    byStatus.forEach(s => { statusCounts[s.status] = s._count.id; });
    res.json({ total, templatesCount, byStatus: statusCounts });
  } catch (err) { next(err); }
});

router.get("/projects/templates", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const templates = await prisma.projectTemplate.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ templates });
  } catch (err) { next(err); }
});

router.post("/projects/templates", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = templateSchema.parse(req.body);
    const template = await prisma.projectTemplate.create({
      data: { id: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), ...data },
    });
    res.json({ template });
  } catch (err) { next(err); }
});

router.put("/projects/templates/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const data = templateSchema.partial().parse(req.body);
    const template = await prisma.projectTemplate.update({ where: { id }, data });
    res.json({ template });
  } catch (err) { next(err); }
});

router.delete("/projects/templates/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    await prisma.projectTemplate.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── Practice Exercises ──

router.get("/practice-exercises", async (req: AuthenticatedRequest, res, next) => {
  try {
    const courseId = req.query.courseId as string | undefined;
    const search = (req.query.search as string || "").trim();
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (search) where.user = { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] };

    const [submissions, total] = await Promise.all([
      prisma.practiceSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.practiceSubmission.count({ where }),
    ]);
    res.json({ submissions, total });
  } catch (err) { next(err); }
});

router.get("/practice-exercises/stats", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [total, completed, byCourse] = await Promise.all([
      prisma.practiceSubmission.count(),
      prisma.practiceSubmission.count({ where: { completed: true } }),
      prisma.practiceSubmission.groupBy({ by: ["courseId"], _count: { id: true } }),
    ]);
    res.json({ total, completed, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0, byCourse });
  } catch (err) { next(err); }
});

router.get("/assessments", async (req: AuthenticatedRequest, res, next) => {
  try {
    const search = (req.query.search as string || "").trim();
    const statusFilter = req.query.status as string | undefined;
    const where: any = {};
    if (statusFilter) where.status = statusFilter;
    if (search) where.user = { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] };

    const [allProgress, total, completed] = await Promise.all([
      prisma.assessmentProgress.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { lastAttemptAt: "desc" },
        take: 200,
      }),
      prisma.assessmentProgress.count({ where }),
      prisma.assessmentProgress.count({ where: { ...where, status: "COMPLETED" } }),
    ]);
    res.json({ assessments: allProgress, total, completed });
  } catch (err) { next(err); }
});

router.get("/assessments/stats", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [total, completed, byCategory] = await Promise.all([
      prisma.assessmentProgress.count(),
      prisma.assessmentProgress.count({ where: { status: "COMPLETED" } }),
      prisma.assessmentProgress.groupBy({ by: ["category"], _count: { id: true }, _avg: { score: true } }),
    ]);
    res.json({ total, completed, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0, byCategory });
  } catch (err) { next(err); }
});

// ── Certifications ──

router.get("/certifications", async (req: AuthenticatedRequest, res, next) => {
  try {
    const search = (req.query.search as string || "").trim();
    const statusFilter = (req.query.status as string || "");
    const where: any = {};
    if (search) where.user = { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] };
    if (statusFilter) where.status = statusFilter;

    const [certificates, total] = await Promise.all([
      prisma.issuedCertificate.findMany({
        where,
        orderBy: { issuedAt: "desc" },
        take: 200,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.issuedCertificate.count({ where }),
    ]);
    res.json({ certificates, total });
  } catch (err) { next(err); }
});

router.get("/certifications/stats", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, byCourse, byStatus, recentIssued, revoked] = await Promise.all([
      prisma.issuedCertificate.count(),
      prisma.issuedCertificate.groupBy({ by: ["courseSlug"], _count: { id: true } }),
      prisma.issuedCertificate.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.issuedCertificate.count({ where: { issuedAt: { gte: thirtyDaysAgo } } }),
      prisma.issuedCertificate.count({ where: { status: "revoked" } }),
    ]);
    res.json({ total, byCourse, byStatus, recentIssued, revoked });
  } catch (err) { next(err); }
});

// Admin: revoke a certificate
router.post("/certifications/revoke", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { certId, reason } = req.body as { certId: string; reason?: string };
    if (!certId) { res.status(400).json({ error: "certId is required" }); return; }

    const cert = await prisma.issuedCertificate.findUnique({ where: { id: certId } });
    if (!cert) { res.status(404).json({ error: "Certificate not found" }); return; }
    if (cert.status === "revoked") { res.status(400).json({ error: "Certificate already revoked" }); return; }

    // Sync revocation to Certs app (fire-and-forget)
    const certsUrl = process.env.CERTS_APP_URL;
    const bearerToken = process.env.CERTS_BEARER_TOKEN;
    if (certsUrl && bearerToken) {
      fetch(`${certsUrl}/api/admin/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${bearerToken}` },
        body: JSON.stringify({ certNumber: cert.certNumber, reason: reason || "Revoked by admin" }),
      }).catch(() => { /* non-blocking sync failure */ });
    }

    await prisma.issuedCertificate.update({
      where: { id: certId },
      data: { status: "revoked", revokedAt: new Date(), revokeReason: reason || null },
    });

    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Admin: certificate issuance trends (monthly)
router.get("/certifications/trends", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const certs = await prisma.issuedCertificate.findMany({
      select: { issuedAt: true, courseSlug: true },
      orderBy: { issuedAt: "asc" },
    });

    const byMonth: Record<string, number> = {};
    const byCourseMonth: Record<string, Record<string, number>> = {};
    for (const c of certs) {
      const key = c.issuedAt.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + 1;
      if (!byCourseMonth[c.courseSlug]) byCourseMonth[c.courseSlug] = {};
      byCourseMonth[c.courseSlug][key] = (byCourseMonth[c.courseSlug][key] || 0) + 1;
    }

    res.json({ byMonth, byCourseMonth });
  } catch (err) { next(err); }
});

// ── Reports ──

router.get("/reports/student-growth", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        ...emailFilter
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const byMonth: Record<string, number> = {};
    for (const s of students) {
      const key = s.createdAt.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + 1;
    }
    res.json({ byMonth, total: students.length });
  } catch (err) { next(err); }
});

router.get("/reports/overview", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [students, courses, practices, assessments, projects, certs, activeStudents] = await Promise.all([
      prisma.user.count({ where: { role: "student", ...emailFilter } }),
      Promise.resolve(Object.keys(COURSE_LECTURE_COUNTS).length),
      prisma.practiceSubmission.count({ where: { user: { ...emailFilter } } }),
      prisma.assessmentProgress.count({ where: { user: { ...emailFilter } } }),
      prisma.project.count({ where: { user: { ...emailFilter } } }),
      prisma.issuedCertificate.count({ where: { user: { ...emailFilter } } }),
      prisma.user.count({ where: { role: "student", status: "active", ...emailFilter } }),
    ]);
    res.json({ totalStudents: students, activeStudents, totalCourses: courses, totalPractices: practices, totalAssessments: assessments, totalProjects: projects, totalCertificates: certs });
  } catch (err) { next(err); }
});

// ── Automations ──

router.post("/automations/issue-all-certificates", async (req: AuthenticatedRequest, res, next) => {
  try {
    const adminId = req.user!.id;
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        ...emailFilter
      },
      select: { id: true, name: true, email: true },
    });

    const { checkEligibility, issueCertForStudent } = await import("../services/certificationService.js");
    const issues: { userId: string; name: string; courseSlug: string; certNumber: string }[] = [];
    const errors: { userId: string; courseSlug: string; error: string }[] = [];

    for (const student of students) {
      for (const courseSlug of Object.keys(COURSE_LECTURE_COUNTS)) {
        try {
          const result = await checkEligibility(student.id, courseSlug);
          if (result.eligible && !result.alreadyIssued) {
            const { certNumber } = await issueCertForStudent(adminId, student.id, courseSlug);
            issues.push({ userId: student.id, name: student.name, courseSlug, certNumber });
          }
        } catch (err: any) {
          errors.push({ userId: student.id, courseSlug, error: err.message });
        }
      }
    }

    res.json({ issuedCount: issues.length, errorCount: errors.length, issues: issues, errors: errors });
  } catch (err) { next(err); }
});

router.post("/automations/suspend-inactive", async (req: AuthenticatedRequest, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const inactive = await prisma.user.findMany({
      where: {
        role: "student",
        status: "active",
        ...emailFilter,
        lastActiveAt: { lt: cutoff },
      },
      select: { id: true, name: true, email: true, lastActiveAt: true },
    });

    await prisma.user.updateMany({
      where: { id: { in: inactive.map(s => s.id) } },
      data: { status: "suspended" },
    });

    res.json({ suspended: inactive.length, students: inactive });
  } catch (err) { next(err); }
});

// ── Settings ──

router.get("/settings", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const { existsSync, readFileSync, writeFileSync } = await import("fs");
    const { join } = await import("path");
    const _dirname = new URL(".", import.meta.url).pathname;
    const settingsPath = join(_dirname, "..", "..", "settings.json");
    const settings = existsSync(settingsPath) ? JSON.parse(readFileSync(settingsPath, "utf-8")) : { siteName: "GyanSetu", maintenanceMode: false, allowRegistrations: true };
    res.json(settings);
  } catch (err) { next(err); }
});

router.put("/settings", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { existsSync, writeFileSync } = await import("fs");
    const { join } = await import("path");
    const _dirname = new URL(".", import.meta.url).pathname;
    const settingsPath = join(_dirname, "..", "..", "settings.json");
    writeFileSync(settingsPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) { next(err); }
});
// ── Content Assessments (Admin) ──

const assessmentSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  subsection: z.string().min(1),
  description: z.string().optional(),
  isPublished: z.boolean().default(false),
});

const assessmentQuestionSchema = z.object({
  category: z.string().min(1),
  subsection: z.string().min(1),
  type: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().min(1),
  starterCode: z.string().optional(),
  language: z.string().optional(),
  difficulty: z.string().default("medium"),
});

router.get("/content-assessments", async (req: AuthenticatedRequest, res, next) => {
  try {
    const assessments = await prisma.assessment.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { questions: true } } },
    });
    res.json({ assessments });
  } catch (err) { next(err); }
});

router.get("/content-assessments/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });
    res.json({ assessment });
  } catch (err) { next(err); }
});

router.post("/content-assessments", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = assessmentSchema.parse(req.body);
    const assessment = await prisma.assessment.create({ data });
    res.json({ assessment });
  } catch (err) { next(err); }
});

router.put("/content-assessments/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const data = assessmentSchema.partial().parse(req.body);
    const assessment = await prisma.assessment.update({ where: { id }, data });
    res.json({ assessment });
  } catch (err) { next(err); }
});

router.delete("/content-assessments/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    await prisma.assessment.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post("/content-assessments/:id/questions", async (req: AuthenticatedRequest, res, next) => {
  try {
    const assessmentId = req.params.id as string;
    const data = assessmentQuestionSchema.parse(req.body);
    const question = await prisma.assessmentQuestion.create({
      data: { ...data, assessmentId },
    });
    res.json({ question });
  } catch (err) { next(err); }
});

router.put("/content-assessments/:id/questions/:questionId", async (req: AuthenticatedRequest, res, next) => {
  try {
    const questionId = req.params.questionId as string;
    const data = assessmentQuestionSchema.partial().parse(req.body);
    const question = await prisma.assessmentQuestion.update({
      where: { id: questionId },
      data,
    });
    res.json({ question });
  } catch (err) { next(err); }
});

router.delete("/content-assessments/:id/questions/:questionId", async (req: AuthenticatedRequest, res, next) => {
  try {
    const questionId = req.params.questionId as string;
    await prisma.assessmentQuestion.delete({ where: { id: questionId } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
