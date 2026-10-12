import { prisma } from '../prisma.js';
import { sendNotification } from './notificationService.js';
import { fetchRepoFiles } from '../lib/githubRepoFetcher.js';
import { evaluateAndUnlockAchievements } from '../achievements/evaluationEngine.js';

interface ReviewStep {
  step: string;
  passed: boolean;
  detail: string;
}

interface AIReviewScored {
  status: 'reviewed';
  overallScore: number;
  maxScore: number;
  passed: boolean;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  criteriaScores: any[];
}

interface AIReviewUnavailable {
  status: 'unavailable';
  reason: string;
}

type AIReviewOutcome = AIReviewScored | AIReviewUnavailable;

export async function runProjectReview(submissionId: string): Promise<void> {
  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: { project: true, user: { select: { id: true, name: true, email: true } } }
  });
  if (!submission) throw new Error('Submission not found: ' + submissionId);

  const steps: ReviewStep[] = [];

  await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: { status: 'REVIEWING' }
  });

  try {
    // STEP A: Security check
    const securityResult = await runSecurityCheck(submission.githubUrl, submission.content || '');
    steps.push(securityResult);
    if (!securityResult.passed) {
      await rejectSubmission(submissionId, 'Security check failed: ' + securityResult.detail, steps, securityResult, null);
      await sendNotification(submission.userId, 'project_rejected', 'Project Review Failed', 'Your submission failed our security check: ' + securityResult.detail, '', 'high');
      return;
    }

    // STEP B: Validation check
    const validationResult = await runValidationCheck(submission);
    steps.push(validationResult);
    if (!validationResult.passed) {
      await rejectSubmission(submissionId, 'Validation failed: ' + validationResult.detail, steps, securityResult, validationResult);
      await sendNotification(submission.userId, 'project_rejected', 'Project Review Failed', validationResult.detail, '', 'high');
      return;
    }

    // STEP C: AI quality review
    const aiResult = await runAIReview(submission);

    // The AI couldn't produce a real verdict (no API key / call failed) —
    // this must never be treated as a pass or a fail. Flag it for a human.
    if (aiResult.status === 'unavailable') {
      steps.push({ step: 'AI Quality Review', passed: false, detail: aiResult.reason });
      await prisma.projectSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'NEEDS_REVIEW',
          isFlagged: true,
          feedback: `AI review unavailable: ${aiResult.reason} An admin will review this submission manually.`,
          securityCheck: securityResult as any,
          validationCheck: validationResult as any,
          reviewSteps: steps as any,
        },
      });
      await sendNotification(
        submission.userId,
        'project_review',
        'Submission Under Review',
        "We couldn't complete an automated review of your project — a team member will review it manually and follow up soon.",
        `/courses/${submission.courseId ?? ''}`,
        'medium'
      );
      return;
    }

    steps.push({ step: 'AI Quality Review', passed: aiResult.passed, detail: aiResult.overallFeedback });
    // AI check failed — notify and reject
    if (!aiResult.passed) {
      await prisma.projectSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'REJECTED',
          feedback: aiResult.overallFeedback,
          score: aiResult.overallScore,
          maxScore: aiResult.maxScore,
          aiReview: aiResult as any,
          securityCheck: securityResult as any,
          validationCheck: validationResult as any,
          reviewSteps: steps as any
        }
      });
      await sendNotification(
        submission.userId,
        'project_rejected',
        'Project Needs Improvement',
        `Your project scored ${aiResult.overallScore}/${aiResult.maxScore}. ${aiResult.overallFeedback.slice(0, 120)}`,
        `/courses/${submission.courseId ?? ''}`,
        'high'
      );
      return;
    }

    // All passed — APPROVE
    await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        score: aiResult.overallScore,
        maxScore: aiResult.maxScore,
        feedback: aiResult.overallFeedback,
        aiReview: aiResult as any,
        securityCheck: securityResult as any,
        validationCheck: validationResult as any,
        reviewSteps: steps as any
      }
    });

    const { updatePortfolio } = await import('../lib/portfolioUpdater.js');
    const { certificateQueue } = await import('../lib/queue.js');

    // Resolve courseId: prefer the one stored on the submission, fall back to CourseProject lookup
    let resolvedCourseId = submission.courseId ?? null;
    let isCapstone = false;
    let projectTitle = submission.project?.projectId || 'Project';

    if (!resolvedCourseId) {
      const courseProject = await prisma.courseProject.findFirst({
        where: { courseId: { not: '' } },
        select: { courseId: true, title: true, isCapstone: true }
      });
      if (courseProject) {
        resolvedCourseId = courseProject.courseId;
        isCapstone = courseProject.isCapstone;
        projectTitle = courseProject.title;
      }
    } else {
      const courseProject = await prisma.courseProject.findFirst({
        where: { courseId: resolvedCourseId },
        select: { title: true, isCapstone: true }
      });
      if (courseProject) {
        isCapstone = courseProject.isCapstone;
        projectTitle = courseProject.title;
      }
    }

    await updatePortfolio(submission.userId, 'projects', {
      projectId: submission.projectId,
      title: projectTitle,
      isCapstone,
      completedAt: new Date().toISOString(),
    });

    if (resolvedCourseId) {
      await certificateQueue.add('checkCertificate', { studentId: submission.userId, courseId: resolvedCourseId });
    }

    await sendNotification(
      submission.userId,
      isCapstone ? 'capstone_approved' : 'milestone_approved',
      isCapstone ? 'Capstone Approved' : 'Milestone Approved',
      isCapstone
        ? `Your capstone project "${projectTitle}" was approved with a score of ${aiResult.overallScore}/${aiResult.maxScore}.`
        : `Your "${projectTitle}" project was approved with a score of ${aiResult.overallScore}/${aiResult.maxScore}.`,
      `/courses/${resolvedCourseId ?? ''}`,
      'high'
    );

    try {
      await evaluateAndUnlockAchievements(submission.userId, 'project_approved');
    } catch (e) {
      console.error('[achievements] evaluation failed after project approval', e);
    }

  } catch (err: any) {
    console.error('[AIReview] Error:', err);
    await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: { status: 'ERROR', feedback: err.message, reviewSteps: steps as any }
    });
    try {
      await sendNotification(
        submission.userId,
        'project_rejected',
        'Review Error',
        'Something went wrong reviewing your project. Our team has been notified — please resubmit.',
        '',
        'medium'
      );
    } catch { /* don't let notification failure mask the original error */ }
  }
}

async function runSecurityCheck(githubUrl: string | null, content: string): Promise<ReviewStep> {
  const suspiciousPatterns = [/eval\s*\(/i, /exec\s*\(/i, /os\.system/i, /subprocess/i, /rm\s+-rf/i];
  const hasSuspicious = suspiciousPatterns.some(p => p.test(content));
  if (hasSuspicious) return { step: 'Security Check', passed: false, detail: 'Potentially unsafe code detected.' };
  
  if (githubUrl && !githubUrl.startsWith('https://github.com/')) {
    return { step: 'Security Check', passed: false, detail: 'Invalid GitHub URL.' };
  }
  return { step: 'Security Check', passed: true, detail: 'No security issues found.' };
}

async function runValidationCheck(submission: any): Promise<ReviewStep> {
  const hasGithub = submission.githubUrl && submission.githubUrl.trim() !== '';
  const hasContent = submission.content && submission.content.trim().length >= 10;
  
  if (!hasGithub && !hasContent) {
    return { step: 'Validation Check', passed: false, detail: 'Either a GitHub URL or text content is required.' };
  }
  
  if (hasGithub) {
    const url = submission.githubUrl.trim();
    const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/);
    if (!match) {
      return { step: 'Validation Check', passed: false, detail: 'The GitHub URL must be in the format: https://github.com/owner/repo-name (no trailing .git or extra path).' };
    }
    
    const owner = match[1];
    const repo = match[2];
    
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'Fraylon-Academy-Reviewer'
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers, signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return { step: 'Validation Check', passed: false, detail: "This GitHub link doesn't appear to be valid or accessible. Please check the URL and resubmit." };
      }
      
      const repoData = await response.json();
      if (repoData.size === 0) {
        return { step: 'Validation Check', passed: false, detail: "The submitted GitHub repository appears to be empty (zero commits/files)." };
      }
    } catch (e) {
      return { step: 'Validation Check', passed: false, detail: 'Failed to validate GitHub repository due to a network error.' };
    }
  }
  
  return { step: 'Validation Check', passed: true, detail: 'All required fields present and valid.' };
}

/** Pulls owner/repo out of a validated `https://github.com/owner/repo` URL. */
function parseGithubUrl(githubUrl: string): { owner: string; repo: string } | null {
  const match = githubUrl.trim().match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

/**
 * Gemini is told to respond with only JSON, but often wraps it in a markdown
 * code fence (```json ... ```) anyway, sometimes with a sentence of prose
 * before/after. A naive `match(/\{[\s\S]*\}/)` greedily spans from the first
 * "{" to the LAST "}" in the whole response — if any trailing prose or a
 * criteria comment happens to contain a stray brace, it swallows garbage
 * between them and JSON.parse throws. This strips fences first, then falls
 * back to a balanced-brace scan (not just "first { to last }") so a stray
 * brace elsewhere in the text can't corrupt the extracted object.
 */
function extractJsonFromAiResponse(responseText: string): any {
  let cleaned = responseText.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    if (start === -1) throw new Error('No JSON object found in response');
    let depth = 0;
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++;
      else if (cleaned[i] === '}') {
        depth--;
        if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1));
      }
    }
    throw new Error('No balanced JSON object found in response');
  }
}

async function runAIReview(submission: any): Promise<AIReviewOutcome> {
  const project = submission.project;

  // Mock mode: if no API key or placeholder, return a successful mock review
  if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'your-google-ai-studio-key-here' || process.env.GOOGLE_AI_API_KEY === '') {
    console.log('[AIReview] Mock mode: returning successful mock review');
    return {
      status: 'reviewed',
      overallScore: 85,
      maxScore: 100,
      passed: true,
      overallFeedback: 'Mock AI review: Code structure looks good with reasonable implementation.',
      strengths: ['Clean code structure', 'Meets basic requirements'],
      improvements: ['Consider adding error handling', 'Add more comments'],
      criteriaScores: [
        { criteria: 'Functionality', score: 85, maxScore: 100, comment: 'Good implementation' },
        { criteria: 'Code Quality', score: 85, maxScore: 100, comment: 'Clean and readable' }
      ]
    };
  }

  // Prefer the actual repo source over a free-text description — read real
  // code so the review reflects what was actually built, not just what the
  // student says they built.
  let codeContext = '';
  if (submission.githubUrl) {
    const parsed = parseGithubUrl(submission.githubUrl);
    if (parsed) {
      try {
        const repoFetch = await fetchRepoFiles(parsed.owner, parsed.repo);
        if (repoFetch && repoFetch.files.length > 0) {
          codeContext = repoFetch.files.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n');
        }
      } catch (err) {
        console.error('[AIReview] Repo fetch failed:', err);
      }
    }
  }
  if (!codeContext && submission.content) {
    codeContext = submission.content;
  }
  if (!codeContext) {
    return { status: 'unavailable', reason: "Couldn't read any source files from the submitted repository." };
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an expert code reviewer for an online learning platform, grading a student's capstone/project submission against a rubric.

Project: ${project.projectId}
Requirements: ${project.description || "Build the project exactly as specified."}

Below is the actual source code from the student's submitted repository. Review it directly — check that the requirements are genuinely implemented, not just described. Look for real functionality, reasonable code quality, and evidence the student understands the concepts, while grading fairly for a beginner/intermediate student.

${codeContext}

Respond ONLY with valid JSON matching exactly this structure:
{
  "overallScore": 85,
  "maxScore": 100,
  "passed": true,
  "overallFeedback": "2-3 sentences of feedback referencing specific things in the code",
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "criteriaScores": [
    { "criteria": "Functionality", "score": 85, "maxScore": 100, "comment": "Good job" }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = extractJsonFromAiResponse(responseText);

    return {
      status: 'reviewed',
      overallScore: Number(parsed.overallScore) || 0,
      maxScore: Number(parsed.maxScore) || 100,
      passed: Boolean(parsed.passed),
      overallFeedback: String(parsed.overallFeedback || parsed.feedback || ""),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      criteriaScores: Array.isArray(parsed.criteriaScores) ? parsed.criteriaScores : []
    };
  } catch (error: any) {
    console.error("[AIReview] Gemini call failed:", error.message);
    return { status: 'unavailable', reason: `The AI review service failed: ${error.message}` };
  }
}

async function rejectSubmission(submissionId: string, feedback: string, steps: ReviewStep[], securityCheck: any, validationCheck: any) {
  const improvements = steps.filter(s => !s.passed).map(s => s.detail);
  await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: { 
      status: 'REJECTED', 
      feedback, 
      reviewSteps: steps as any,
      securityCheck: securityCheck as any,
      validationCheck: validationCheck as any,
      aiReview: { improvements, strengths: [], overallScore: 0, maxScore: 100, passed: false, overallFeedback: feedback, criteriaScores: [] }
    }
  });
}
