import { Router } from "express";
import { prisma } from "../../prisma.js";

const router = Router();

const DEFAULT_TEMPLATES = [
  {
    templateKey: "welcome_email",
    name: "Welcome Email",
    trigger: "Sent when student registers",
    subject: "Welcome to {{platform_name}}! 🎉",
    body: "Hi {{student_name}},\n\nWelcome to {{platform_name}}! 🎉\n\nWe're excited to have you join our learning community.\nYour account is ready — start learning right away!\n\n{{login_url}}\n\nHappy learning!\nThe {{platform_name}} Team",
    variables: ["student_name", "platform_name", "login_url"]
  },
  {
    templateKey: "course_enrollment",
    name: "Course Enrollment",
    trigger: "Sent when student enrolls in a course",
    subject: "You're enrolled in {{course_name}}! 🚀",
    body: "Hi {{student_name}},\n\nYou're now enrolled in {{course_name}}! 🚀\n\nYour learning journey starts now. Dive into \nthe first lesson whenever you're ready.\n\n{{course_url}}\n\nSee you in class!\nThe {{platform_name}} Team",
    variables: ["student_name", "course_name", "course_url", "instructor_name", "platform_name"]
  },
  {
    templateKey: "quiz_results",
    name: "Quiz Results",
    trigger: "Sent after quiz is graded",
    subject: "Your quiz results are in!",
    body: "Hi {{student_name}},\n\nYour results for {{quiz_name}} in {{course_name}}:\n\nScore: {{score}}\nResult: {{passed}}\n\n{{next_step}}\n\nKeep it up!\nThe {{platform_name}} Team",
    variables: ["student_name", "course_name", "quiz_name", "score", "passed", "next_step", "platform_name"]
  },
  {
    templateKey: "project_review_result",
    name: "Project Review Result",
    trigger: "Sent after AI reviews a project",
    subject: "Your project has been reviewed!",
    body: "Hi {{student_name}},\n\nYour project {{project_name}} has been reviewed!\n\nScore: {{score}}\nStatus: {{status}}\n\nFeedback: {{feedback}}\n\n{{resubmit_url}}\n\nThe {{platform_name}} Team",
    variables: ["student_name", "project_name", "course_name", "score", "status", "feedback", "resubmit_url", "platform_name"]
  },
  {
    templateKey: "certificate_issued",
    name: "Certificate Issued",
    trigger: "Sent when certificate is generated",
    subject: "🎓 Your certificate is ready!",
    body: "Hi {{student_name}},\n\nCongratulations! 🎓 You completed {{course_name}}!\n\nDownload your certificate here:\n{{certificate_url}}\n\nCertificate ID: {{verification_id}}\nDate: {{completion_date}}\n\nWe're proud of you!\nThe {{platform_name}} Team",
    variables: ["student_name", "course_name", "certificate_url", "completion_date", "verification_id", "platform_name"]
  },
  {
    templateKey: "inactivity_reminder",
    name: "Inactivity Reminder",
    trigger: "Sent when student inactive 3+ days",
    subject: "We miss you, {{student_name}}!",
    body: "Hi {{student_name}},\n\nWe miss you! You haven't visited in \n{{days_inactive}} days. 👋\n\nLast studied: {{last_lesson}} in {{course_name}}\n\nContinue where you left off:\n{{continue_url}}\n\nThe {{platform_name}} Team",
    variables: ["student_name", "course_name", "last_lesson", "continue_url", "days_inactive", "platform_name"]
  }
];

const seedTemplatesIfEmpty = async () => {
  const count = await prisma.emailTemplate.count();
  if (count === 0) {
    console.log("Seeding default email templates...");
    for (const tmpl of DEFAULT_TEMPLATES) {
      await prisma.emailTemplate.create({
        data: {
          templateKey: tmpl.templateKey,
          name: tmpl.name,
          trigger: tmpl.trigger,
          subject: tmpl.subject,
          body: tmpl.body,
          variables: tmpl.variables,
          isCustomized: false
        }
      });
    }
  }
};

// Seed on startup (asynchronous, so it runs in background)
seedTemplatesIfEmpty().catch(console.error);

// GET /api/admin/email-templates
router.get("/", async (req, res, next) => {
  try {
    // Ensure seeded
    await seedTemplatesIfEmpty();
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { id: 'asc' } // Keep order consistent
    });
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/email-templates (create new custom template)
router.post("/", async (req, res, next) => {
  try {
    const { templateKey, name, trigger, subject, body, variables } = req.body;

    if (!templateKey || !name || !subject || !body) {
      return res.status(400).json({ error: "Missing required fields: templateKey, name, subject, body" });
    }

    const existing = await prisma.emailTemplate.findUnique({ where: { templateKey } });
    if (existing) {
      return res.status(409).json({ error: "A template with this key already exists" });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        templateKey,
        name,
        trigger: trigger || "",
        subject,
        body,
        variables: variables || [],
        isCustomized: true
      }
    });
    res.json(template);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/email-templates/:templateKey
router.post("/:templateKey", async (req, res, next) => {
  try {
    const { templateKey } = req.params;
    const { subject, body } = req.body;

    const template = await prisma.emailTemplate.update({
      where: { templateKey },
      data: {
        subject,
        body,
        isCustomized: true
      }
    });
    res.json(template);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/email-templates/:templateKey/reset
router.post("/:templateKey/reset", async (req, res, next) => {
  try {
    const { templateKey } = req.params;
    const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.templateKey === templateKey);
    
    if (!defaultTemplate) {
      return res.status(404).json({ error: "Template not found" });
    }

    const template = await prisma.emailTemplate.update({
      where: { templateKey },
      data: {
        subject: defaultTemplate.subject,
        body: defaultTemplate.body,
        isCustomized: false
      }
    });
    res.json(template);
  } catch (err) {
    next(err);
  }
});

export default router;
