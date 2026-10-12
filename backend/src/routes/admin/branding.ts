import { Router } from "express";
import { prisma } from "../../prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router({ mergeParams: true });

// Setup multer for local file uploads to frontend/public/uploads/branding
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../../../frontend/public/uploads/branding");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = file.fieldname; // 'logo' or 'favicon'
    cb(null, `${basename}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/svg+xml" ||
      file.mimetype === "image/x-icon"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  }
});

// GET current branding
router.get("/", async (req, res, next) => {
  try {
    let branding = await prisma.brandingSettings.findFirst();
    if (!branding) {
      // return default
      branding = {
        id: "default",
        platformName: "GyanSetu",
        tagline: "Bridge Your Learning. Build Your Future.",
        primaryColor: "#4F46E5",
        secondaryColor: "#0F1117",
        logoUrl: null,
        faviconUrl: null,
        updatedAt: new Date()
      };
    }
    res.json(branding);
  } catch (err) {
    next(err);
  }
});

// POST save branding
router.post("/save", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { platformName, tagline, primaryColor, secondaryColor, logoUrl, faviconUrl } = req.body;
    const existing = await prisma.brandingSettings.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.brandingSettings.update({
        where: { id: existing.id },
        data: { platformName, tagline, primaryColor, secondaryColor, logoUrl, faviconUrl }
      });
    } else {
      updated = await prisma.brandingSettings.create({
        data: { platformName, tagline, primaryColor, secondaryColor, logoUrl, faviconUrl }
      });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST upload logo
router.post("/upload-logo", requireAuth, requireRole("admin"), upload.single("logo"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const ext = path.extname(req.file.originalname);
    res.json({ logoUrl: `/uploads/branding/logo${ext}` });
  } catch (err) {
    next(err);
  }
});

// POST upload favicon
router.post("/upload-favicon", requireAuth, requireRole("admin"), upload.single("favicon"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const ext = path.extname(req.file.originalname);
    res.json({ faviconUrl: `/uploads/branding/favicon${ext}` });
  } catch (err) {
    next(err);
  }
});

export default router;
