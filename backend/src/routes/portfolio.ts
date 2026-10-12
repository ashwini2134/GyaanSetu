import { Router } from "express";
import QRCode from "qrcode";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";
import { skillsForCourse, skillsForProject } from "../lib/skillMap.js";
import { extractGithubUsername } from "../lib/github.js";
import { getLifetimeStats } from "../services/weeklyXpService.js";
import { config } from "../config.js";

const ACCENT_HEX: Record<string, string> = {
  default: "#00BFB3",
  ocean: "#3B82F6",
  forest: "#22C55E",
  sunset: "#F97316",
  royal: "#A855F7",
};

const router = Router();

const experienceEntrySchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const serviceEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

const testimonialEntrySchema = z.object({
  id: z.string(),
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const portfolioSchema = z.object({
  skills: z.array(z.string()).optional(),
  screenshots: z.array(z.object({
    projectId: z.string(),
    url: z.string(),
    caption: z.string().optional()
  })).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  education: z.array(educationEntrySchema).optional(),
  services: z.array(serviceEntrySchema).optional(),
  testimonials: z.array(testimonialEntrySchema).optional(),
});

// Get user's portfolio
router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    let portfolio = await prisma.studentPortfolio.findUnique({
      where: { studentId: userId }
    });

    if (!portfolio) {
      portfolio = await prisma.studentPortfolio.create({
        data: { studentId: userId }
      });
    }

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

// Update user's portfolio
router.patch("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = portfolioSchema.parse(req.body);

    const portfolio = await prisma.studentPortfolio.upsert({
      where: { studentId: userId },
      update: {
        ...(body.skills && { skills: body.skills }),
        ...(body.screenshots && { screenshots: body.screenshots }),
        ...(body.experience && { experience: body.experience }),
        ...(body.education && { education: body.education }),
        ...(body.services && { services: body.services }),
        ...(body.testimonials && { testimonials: body.testimonials }),
      },
      create: {
        studentId: userId,
        ...(body.skills && { skills: body.skills }),
        ...(body.screenshots && { screenshots: body.screenshots }),
        ...(body.experience && { experience: body.experience }),
        ...(body.education && { education: body.education }),
        ...(body.services && { services: body.services }),
        ...(body.testimonials && { testimonials: body.testimonials }),
      }
    });

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

// Merge a fresh-from-source-tables entry list into whatever's already
// stored — new/changed attested fields (completedAt, links, etc.) always
// win, but any extra fields already on a stored entry that the source
// query doesn't know about (title/courseSlug backfilled by direct-issuance
// writers, future per-project edits) are preserved.
function mergeById<T extends Record<string, unknown>>(existing: T[], fresh: T[], idKey: keyof T): T[] {
  const byId = new Map<unknown, T>(existing.map((item) => [item[idKey], item]));
  for (const item of fresh) {
    const prev = byId.get(item[idKey]);
    byId.set(item[idKey], prev ? { ...prev, ...item } : item);
  }
  return Array.from(byId.values());
}

// Recompute courses/certificates/projects/skills from source tables and merge
// into whatever's already stored for this student — used by both the
// self-service sync route and the public-portfolio endpoint (visiting a
// student's portfolio keeps it fresh even if they never opened it themselves).
async function syncPortfolioForUser(userId: string) {
  const [existing, courses, certificates, projects] = await Promise.all([
    prisma.studentPortfolio.findUnique({ where: { studentId: userId } }),
    prisma.progress.findMany({
      where: { userId, status: "COMPLETED" },
      select: { courseSlug: true, lectureId: true, completedAt: true }
    }),
    prisma.issuedCertificate.findMany({
      where: { userId },
      select: { courseSlug: true, certNumber: true, issuedAt: true }
    }),
    prisma.project.findMany({
      where: { userId, status: "COMPLETED" },
      select: { projectId: true, completedAt: true, githubUrl: true, liveDemoUrl: true }
    }),
  ]);

  const mergedCourses = mergeById((existing?.courses as any[]) ?? [], courses as any[], "courseSlug");
  const mergedCertificates = mergeById((existing?.certificates as any[]) ?? [], certificates as any[], "certNumber");
  const mergedProjects = mergeById((existing?.projects as any[]) ?? [], projects as any[], "projectId");

  const skills = new Set<string>((existing?.skills as string[]) ?? []);
  courses.forEach((c) => skillsForCourse(c.courseSlug).forEach((s) => skills.add(s)));
  projects.forEach((p) => skillsForProject(p.projectId).forEach((s) => skills.add(s)));

  return prisma.studentPortfolio.upsert({
    where: { studentId: userId },
    update: {
      courses: mergedCourses as any,
      certificates: mergedCertificates as any,
      projects: mergedProjects as any,
      skills: Array.from(skills) as any,
    },
    create: {
      studentId: userId,
      courses: mergedCourses as any,
      certificates: mergedCertificates as any,
      projects: mergedProjects as any,
      skills: Array.from(skills) as any,
    }
  });
}

router.post("/sync", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const portfolio = await syncPortfolioForUser(req.user!.id);
    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

// Coding Journey stats — lifetime totals plus a difficulty breakdown (from
// Submission.difficulty, snapshotted at solve time) and a practice-exercise
// accuracy figure (the one place we have real per-attempt pass/fail history;
// "Problems to Solve" only stores the final PASSED status, not every attempt,
// so it can't honestly support an accuracy number the same way).
async function computeStats(userId: string) {
  const [lifetime, difficultyRows, practiceAttempts] = await Promise.all([
    getLifetimeStats(userId),
    prisma.submission.groupBy({
      by: ["difficulty"],
      where: { userId, status: "PASSED" },
      _count: { _all: true },
    }),
    prisma.practiceAttempt.findMany({
      where: { userId },
      select: { passed: true },
    }),
  ]);

  const byDifficulty = { easy: 0, medium: 0, hard: 0, unknown: 0 };
  for (const row of difficultyRows) {
    const key = (row.difficulty ?? "unknown").toLowerCase();
    if (key === "easy" || key === "medium" || key === "hard") byDifficulty[key] = row._count._all;
    else byDifficulty.unknown += row._count._all;
  }

  const practiceAccuracy = practiceAttempts.length > 0
    ? Math.round((practiceAttempts.filter((a) => a.passed).length / practiceAttempts.length) * 100)
    : null;

  return {
    ...lifetime,
    problemsByDifficulty: byDifficulty,
    practiceAccuracy,
    practiceAttemptCount: practiceAttempts.length,
  };
}

router.get("/stats", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    res.json(await computeStats(req.user!.id));
  } catch (error) {
    next(error);
  }
});

// Chronological activity feed assembled from tables that already track
// timestamps — no new storage, just an aggregation across three sources.
async function computeTimeline(userId: string) {
  const [courseCompletions, projectCompletions, certificates] = await Promise.all([
    prisma.progress.findMany({
      where: { userId, status: "COMPLETED", completedAt: { not: null } },
      select: { courseSlug: true, lectureId: true, completedAt: true },
      orderBy: { completedAt: "desc" },
      take: 25,
    }),
    prisma.project.findMany({
      where: { userId, status: "COMPLETED", completedAt: { not: null } },
      select: { projectId: true, completedAt: true },
      orderBy: { completedAt: "desc" },
      take: 25,
    }),
    prisma.issuedCertificate.findMany({
      where: { userId },
      select: { courseSlug: true, certNumber: true, issuedAt: true },
      orderBy: { issuedAt: "desc" },
      take: 25,
    }),
  ]);

  const events = [
    ...courseCompletions.map((c) => ({
      type: "lecture_completed" as const,
      label: `Completed a lecture in ${c.courseSlug}`,
      at: c.completedAt,
    })),
    ...projectCompletions.map((p) => ({
      type: "project_completed" as const,
      label: `Built ${p.projectId}`,
      at: p.completedAt,
    })),
    ...certificates.map((c) => ({
      type: "certificate_issued" as const,
      label: `Earned a certificate for ${c.courseSlug}`,
      at: c.issuedAt,
    })),
  ]
    .filter((e) => e.at !== null)
    .sort((a, b) => new Date(b.at as Date).getTime() - new Date(a.at as Date).getTime())
    .slice(0, 30);

  return { events };
}

router.get("/timeline", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    res.json(await computeTimeline(req.user!.id));
  } catch (error) {
    next(error);
  }
});

// In-memory, short-TTL cache — a contribution graph doesn't need to be
// re-fetched from GitHub on every portfolio view. Resets on server restart,
// which is fine for a few-hours-stale-at-worst cache.
const GITHUB_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const githubActivityCache = new Map<string, { fetchedAt: number; data: unknown }>();

// Live GitHub contribution activity. Requires a server-side GITHUB_TOKEN
// (GraphQL's contributionsCollection field isn't reachable unauthenticated)
// — if that isn't configured, or no GitHub profile is linked, returns a
// clear "unavailable" shape instead of an error.
async function computeGithubActivity(githubUrl: string | null | undefined) {
  const username = extractGithubUsername(githubUrl);
  if (!username) return { available: false as const, reason: "no_github_linked" as const };

  const token = process.env.GITHUB_TOKEN;
  if (!token) return { available: false as const, reason: "not_configured" as const, username };

  const cached = githubActivityCache.get(username);
  if (cached && Date.now() - cached.fetchedAt < GITHUB_CACHE_TTL_MS) {
    return { available: true as const, username, cached: true, ...(cached.data as object) };
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays { date contributionCount }
            }
          }
        }
      }
    }
  `;

  const ghRes = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  });

  if (!ghRes.ok) return { available: false as const, reason: "github_error" as const, username, status: ghRes.status };

  const ghJson: any = await ghRes.json();
  const calendar = ghJson?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return { available: false as const, reason: "github_user_not_found" as const, username };

  const data = { totalContributions: calendar.totalContributions, weeks: calendar.weeks };
  githubActivityCache.set(username, { fetchedAt: Date.now(), data });

  return { available: true as const, username, cached: false, ...data };
}

router.get("/github-activity", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { githubUrl: true } });
    res.json(await computeGithubActivity(user?.githubUrl));
  } catch (error) {
    next(error);
  }
});

// Portfolio completeness — how much of the "narrative" surface a student has
// actually filled in, independent of raw activity. Caps at 100 so it can be
// combined 1:1 with a normalized activity score without either dimension
// swamping the other.
//
// Projects/certificates are scored from a live count passed in by the
// caller, NOT from portfolio.projects/portfolio.certificates — those two
// fields on StudentPortfolio are only a cache, refreshed by
// syncPortfolioForUser whenever a student opens their own portfolio or
// someone views it publicly. A student who has genuinely completed
// projects but hasn't opened their portfolio page since would otherwise
// score as if they had none, which is exactly backwards for a "pick the
// best portfolios" feature.
function computeCompletenessScore(
  user: { bio: string; avatarUrl: string; githubUrl: string; linkedinUrl: string; portfolioUrl: string },
  portfolio: { experience: unknown; education: unknown; skills: unknown; services: unknown; testimonials: unknown } | null,
  liveProjectCount: number,
  liveCertificateCount: number
): number {
  const has = (v: unknown) => Array.isArray(v) && v.length > 0;
  let score = 0;
  if (user.bio?.trim()) score += 10;
  if (user.avatarUrl?.trim()) score += 10;
  if (user.githubUrl?.trim() || user.linkedinUrl?.trim() || user.portfolioUrl?.trim()) score += 10;
  if (portfolio) {
    if (has(portfolio.experience)) score += 10;
    if (has(portfolio.education)) score += 10;
    if (has(portfolio.skills)) score += 10;
    if (has(portfolio.services)) score += 5;
    if (has(portfolio.testimonials)) score += 5;
  }
  if (liveProjectCount > 0) score += 15;
  if (liveCertificateCount > 0) score += 15;
  return score;
}

const MIN_COMPLETENESS_TO_QUALIFY = 50;
const SPOTLIGHT_SIZE = 10;
const SPOTLIGHT_CACHE_TTL_MS = 15 * 60 * 1000; // 15 min — short enough that a freshly-improved portfolio shows up promptly
let spotlightCache: { month: string; fetchedAt: number; entries: SpotlightEntry[] } | null = null;

interface SpotlightEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string;
  bio: string;
  portfolioTemplate: string;
  profileTheme: string;
  completenessScore: number;
  monthlyXp: number;
  totalScore: number;
}

// Monthly "best portfolios" showcase — ranks every public student profile by
// a blend of portfolio completeness (2x weighted, since this is a portfolio
// contest, not a raw-grind leaderboard — that already exists separately)
// and this calendar month's XP, normalized onto the same 0-100 scale. Only
// profiles that clear a completeness floor qualify, so a highly active but
// blank profile can't crowd out an actually-filled-out one.
router.get("/spotlight", requireAuth, async (_req: AuthenticatedRequest, res, next) => {
  try {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    if (spotlightCache && spotlightCache.month === monthKey && Date.now() - spotlightCache.fetchedAt < SPOTLIGHT_CACHE_TTL_MS) {
      return res.json({ month: monthKey, entries: spotlightCache.entries });
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const students = await prisma.user.findMany({
      where: { role: "student", profileVisibility: "public" },
      select: { id: true, name: true, avatarUrl: true, bio: true, githubUrl: true, linkedinUrl: true, portfolioUrl: true, profileTheme: true, portfolioTemplate: true },
    });
    const studentIds = students.map((s) => s.id);

    const [portfolios, monthlyXpRows, projectCounts, certificateCounts] = await Promise.all([
      prisma.studentPortfolio.findMany({
        where: { studentId: { in: studentIds } },
        select: { studentId: true, experience: true, education: true, skills: true, services: true, testimonials: true },
      }),
      prisma.xpTransaction.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: startOfMonth }, userId: { in: studentIds } },
        _sum: { amount: true },
      }),
      prisma.project.groupBy({
        by: ["userId"],
        where: { status: "COMPLETED", userId: { in: studentIds } },
        _count: { _all: true },
      }),
      prisma.issuedCertificate.groupBy({
        by: ["userId"],
        where: { userId: { in: studentIds } },
        _count: { _all: true },
      }),
    ]);

    const portfolioByStudent = new Map(portfolios.map((p) => [p.studentId, p]));
    const monthlyXpByUser = new Map(monthlyXpRows.map((r) => [r.userId, r._sum.amount ?? 0]));
    const projectCountByUser = new Map(projectCounts.map((r) => [r.userId, r._count._all]));
    const certificateCountByUser = new Map(certificateCounts.map((r) => [r.userId, r._count._all]));

    const ranked = students
      .map((s) => {
        const completenessScore = computeCompletenessScore(
          s,
          portfolioByStudent.get(s.id) ?? null,
          projectCountByUser.get(s.id) ?? 0,
          certificateCountByUser.get(s.id) ?? 0
        );
        const monthlyXp = monthlyXpByUser.get(s.id) ?? 0;
        const activityScore = Math.min(monthlyXp, 1000) / 10; // 0-100
        return { s, completenessScore, monthlyXp, totalScore: completenessScore * 2 + activityScore };
      })
      .filter((r) => r.completenessScore >= MIN_COMPLETENESS_TO_QUALIFY)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, SPOTLIGHT_SIZE)
      .map((r, i): SpotlightEntry => ({
        rank: i + 1,
        userId: r.s.id,
        name: r.s.name,
        avatarUrl: r.s.avatarUrl,
        bio: r.s.bio,
        portfolioTemplate: r.s.portfolioTemplate,
        profileTheme: r.s.profileTheme,
        completenessScore: r.completenessScore,
        monthlyXp: r.monthlyXp,
        totalScore: Math.round(r.totalScore),
      }));

    spotlightCache = { month: monthKey, fetchedAt: Date.now(), entries: ranked };
    res.json({ month: monthKey, entries: ranked });
  } catch (error) {
    next(error);
  }
});

// Combined public view of another student's portfolio — same shape as
// self-service GET / + /stats + /timeline + /github-activity in one round
// trip. Freshens the target's stored portfolio as a side effect (harmless,
// idempotent) so a public view is never stale just because its owner
// hasn't opened their own portfolio recently.
router.get("/public/:userId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const targetUserId = req.params.userId as string;
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true, name: true, bio: true, avatarUrl: true,
        githubUrl: true, linkedinUrl: true, portfolioUrl: true,
        createdAt: true, profileVisibility: true, profileTheme: true, portfolioTemplate: true,
      }
    });

    if (!targetUser) return res.status(404).json({ error: "User not found" });
    if (targetUser.profileVisibility === "private" && targetUserId !== req.user!.id) {
      return res.status(403).json({ error: "Profile is private" });
    }

    const [portfolio, stats, timeline, github] = await Promise.all([
      syncPortfolioForUser(targetUserId),
      computeStats(targetUserId),
      computeTimeline(targetUserId),
      computeGithubActivity(targetUser.githubUrl),
    ]);

    res.json({
      user: {
        id: targetUser.id,
        name: targetUser.name,
        bio: targetUser.bio,
        avatarUrl: targetUser.avatarUrl,
        githubUrl: targetUser.githubUrl,
        linkedinUrl: targetUser.linkedinUrl,
        portfolioUrl: targetUser.portfolioUrl,
        createdAt: targetUser.createdAt,
        profileTheme: targetUser.profileTheme,
        portfolioTemplate: targetUser.portfolioTemplate,
      },
      portfolio,
      stats,
      timeline,
      github,
    });
  } catch (error) {
    next(error);
  }
});

// PDF snapshot of the student's own portfolio, rendered server-side by the
// puppeteer-service (same infra used for course certificates). Freshens
// the stored portfolio first so the PDF never lags behind what's on screen.
router.get("/download", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [user, portfolio, stats] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, bio: true, profileTheme: true } }),
      syncPortfolioForUser(userId),
      computeStats(userId),
    ]);

    if (!user) return res.status(404).json({ error: "User not found" });

    const serviceUrl = process.env.PUPPETEER_SERVICE_URL;
    const serviceToken = process.env.PUPPETEER_SERVICE_TOKEN;
    if (!serviceUrl || !serviceToken) {
      return res.status(503).json({ error: "PDF rendering service is not configured" });
    }

    const verifyUrl = `${config.frontendUrl}/#/portfolio/${userId}`;
    const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    });

    const certificates = ((portfolio.certificates as any[]) ?? []).map((c) => ({
      title: c.title || (c.courseSlug ? c.courseSlug.charAt(0).toUpperCase() + c.courseSlug.slice(1) : "Certificate"),
      issuedDateLabel: c.issuedAt
        ? new Date(c.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : undefined,
    }));

    const projects = ((portfolio.projects as any[]) ?? []).map((p) => ({
      name: p.title || p.projectId,
      completedDateLabel: p.completedAt
        ? new Date(p.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })
        : undefined,
    }));

    const renderRes = await fetch(`${serviceUrl}/pdf/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceToken}` },
      body: JSON.stringify({
        studentName: user.name,
        tagline: user.bio || undefined,
        generatedDateLabel: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        accentHex: ACCENT_HEX[user.profileTheme ?? "default"] ?? ACCENT_HEX.default,
        stats: {
          coursesCompleted: stats.coursesCompleted,
          problemsSolved: stats.problemsSolved,
          projectsBuilt: stats.milestoneProjects + stats.capstoneProjects,
          practiceAccuracy: stats.practiceAccuracy,
        },
        problemsByDifficulty: {
          easy: stats.problemsByDifficulty.easy,
          medium: stats.problemsByDifficulty.medium,
          hard: stats.problemsByDifficulty.hard,
        },
        skills: (portfolio.skills as string[]) ?? [],
        certificates,
        projects,
        qrPngBase64: qrPngBuffer.toString("base64"),
        verifyUrlLabel: verifyUrl.replace(/^https?:\/\//, ""),
      }),
    });

    if (!renderRes.ok) {
      const errBody = await renderRes.text().catch(() => "");
      console.error("Portfolio PDF render failed:", renderRes.status, errBody);
      return res.status(502).json({ error: "Failed to render portfolio PDF" });
    }

    const pdfBuffer = Buffer.from(await renderRes.arrayBuffer());
    const safeName = (user.name || "portfolio").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="gyansetu-portfolio-${safeName}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
