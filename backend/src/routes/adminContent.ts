import { Router } from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

const _dirname = new URL(".", import.meta.url).pathname;
const DATA_ROOT = join(_dirname, "..", "..", "..", "frontend", "public", "data");

const p = (x: unknown) => (typeof x === "string" ? x : Array.isArray(x) ? x[0] || "" : "");

function readJSON<T>(fp: string): T {
  return JSON.parse(readFileSync(fp, "utf-8"));
}
function writeJSON(fp: string, data: unknown) {
  writeFileSync(fp, JSON.stringify(data, null, 2));
}

// ── Courses ──

router.get("/courses", requireAuth, requireRole("admin"), (_req: AuthenticatedRequest, res, next) => {
  try {
    const courses = readJSON<any[]>(join(DATA_ROOT, "courses.json"));
    const enriched = courses.map(c => {
      const lp = join(DATA_ROOT, c.slug, "lectures.json");
      const lectures = existsSync(lp) ? readJSON<{ number: number; title: string }[]>(lp) : [];
      return { ...c, lectureCount: lectures.length };
    });
    res.json({ courses: enriched });
  } catch (err) { next(err); }
});

router.get("/courses/:slug", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const courses = readJSON<any[]>(join(DATA_ROOT, "courses.json"));
    const course = courses.find(c => c.slug === slug);
    if (!course) { res.status(404).json({ error: "Course not found" }); return; }
    const lp = join(DATA_ROOT, slug, "lectures.json");
    const lectures = existsSync(lp) ? readJSON<{ number: number; title: string }[]>(lp) : [];
    res.json({ course, lectures });
  } catch (err) { next(err); }
});

router.post("/courses", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const { slug, title, description, level, category, language } = req.body;
    if (!slug || !title) { res.status(400).json({ error: "slug and title required" }); return; }
    const coursesPath = join(DATA_ROOT, "courses.json");
    const courses = readJSON<any[]>(coursesPath);
    if (courses.some(c => c.slug === slug)) { res.status(409).json({ error: "Course slug already exists" }); return; }
    courses.push({ slug, title, description: description || "", level: level || "Beginner", category: category || "", language: language || "" });
    writeJSON(coursesPath, courses);
    mkdirSync(join(DATA_ROOT, slug), { recursive: true });
    writeJSON(join(DATA_ROOT, slug, "lectures.json"), []);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put("/courses/:slug", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const coursesPath = join(DATA_ROOT, "courses.json");
    const courses = readJSON<any[]>(coursesPath);
    const idx = courses.findIndex(c => c.slug === slug);
    if (idx === -1) { res.status(404).json({ error: "Course not found" }); return; }
    const { title, description, level, category, language } = req.body;
    Object.assign(courses[idx], { title, description, level, category, language });
    writeJSON(coursesPath, courses);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete("/courses/:slug", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const coursesPath = join(DATA_ROOT, "courses.json");
    const courses = readJSON<any[]>(coursesPath);
    const filtered = courses.filter(c => c.slug !== slug);
    if (filtered.length === courses.length) { res.status(404).json({ error: "Course not found" }); return; }
    writeJSON(coursesPath, filtered);
    const courseDir = join(DATA_ROOT, slug);
    if (existsSync(courseDir)) rmSync(courseDir, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── Lectures ──

router.get("/courses/:slug/lectures", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const lp = join(DATA_ROOT, slug, "lectures.json");
    if (!existsSync(lp)) { res.json({ lectures: [] }); return; }
    const lectures = readJSON<any[]>(lp);
    const enriched = lectures.map((l: any) => {
      const dir = join(DATA_ROOT, slug, `lecture_${l.number}`);
      return { ...l, hasLesson: existsSync(join(dir, "lesson.json")), hasProblems: existsSync(join(dir, "problems.json")), hasQuiz: existsSync(join(dir, "quiz.json")), hasProject: existsSync(join(dir, "project.md")) };
    });
    res.json({ lectures: enriched });
  } catch (err) { next(err); }
});

router.post("/courses/:slug/lectures", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const { title, number } = req.body;
    if (!title || number == null) { res.status(400).json({ error: "title and number required" }); return; }
    const lp = join(DATA_ROOT, slug, "lectures.json");
    const lectures = readJSON<any[]>(lp);
    if (lectures.some(l => l.number === number)) { res.status(409).json({ error: `Lecture ${number} already exists` }); return; }
    lectures.push({ number, title });
    lectures.sort((a: any, b: any) => a.number - b.number);
    writeJSON(lp, lectures);
    mkdirSync(join(DATA_ROOT, slug, `lecture_${number}`), { recursive: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put("/courses/:slug/lectures/:num", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const num = parseInt(p(req.params.num));
    const lp = join(DATA_ROOT, slug, "lectures.json");
    const lectures = readJSON<any[]>(lp);
    const idx = lectures.findIndex(l => l.number === num);
    if (idx === -1) { res.status(404).json({ error: "Lecture not found" }); return; }
    if (req.body.title) lectures[idx].title = req.body.title;
    writeJSON(lp, lectures);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put("/courses/:slug/lectures/reorder", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const { order } = req.body;
    if (!Array.isArray(order)) { res.status(400).json({ error: "order array required" }); return; }
    const lp = join(DATA_ROOT, slug, "lectures.json");
    const lectures = readJSON<any[]>(lp);
    const reordered = order.map((num: number, i: number) => {
      const l = lectures.find((l: any) => l.number === num);
      return l ? { ...l, number: i } : null;
    }).filter(Boolean);
    writeJSON(lp, reordered);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete("/courses/:slug/lectures/:num", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const num = parseInt(p(req.params.num));
    const lp = join(DATA_ROOT, slug, "lectures.json");
    const lectures = readJSON<any[]>(lp);
    const filtered = lectures.filter((l: any) => l.number !== num);
    if (filtered.length === lectures.length) { res.status(404).json({ error: "Lecture not found" }); return; }
    writeJSON(lp, filtered);
    const dir = join(DATA_ROOT, slug, `lecture_${num}`);
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── Lecture Content ──

router.get("/courses/:slug/lectures/:num/:file(lesson|quiz|problems)", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const num = p(req.params.num);
    const file = p(req.params.file);
    const fp = join(DATA_ROOT, slug, `lecture_${num}`, `${file}.json`);
    if (!existsSync(fp)) { res.json({ content: null }); return; }
    res.json({ content: readJSON(fp) });
  } catch (err) { next(err); }
});

router.put("/courses/:slug/lectures/:num/:file(lesson|quiz|problems)", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const num = p(req.params.num);
    const file = p(req.params.file);
    writeJSON(join(DATA_ROOT, slug, `lecture_${num}`, `${file}.json`), req.body.content);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get("/courses/:slug/lectures/:num/project", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const num = p(req.params.num);
    const fp = join(DATA_ROOT, slug, `lecture_${num}`, "project.md");
    if (!existsSync(fp)) { res.json({ content: "" }); return; }
    res.json({ content: readFileSync(fp, "utf-8") });
  } catch (err) { next(err); }
});

router.put("/courses/:slug/lectures/:num/project", requireAuth, requireRole("admin"), (req: AuthenticatedRequest, res, next) => {
  try {
    const slug = p(req.params.slug);
    const num = p(req.params.num);
    writeFileSync(join(DATA_ROOT, slug, `lecture_${num}`, "project.md"), req.body.content || "");
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
