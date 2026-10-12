import { prisma } from '../prisma.js';
import { sendNotification } from '../services/notificationService.js';
import { skillsForCourse, skillsForProject } from './skillMap.js';

export async function updatePortfolio(
  studentId: string,
  type: 'courses' | 'projects' | 'certificates',
  data: any
): Promise<void> {
  // Use upsert to prevent race condition when concurrent calls both try to create the record.
  // On P2002 (concurrent create), fall back to findUnique which will now succeed.
  let portfolio;
  try {
    portfolio = await prisma.studentPortfolio.upsert({
      where: { studentId },
      create: { studentId },
      update: {},
    });
  } catch (e: any) {
    if (e.code === 'P2002') {
      portfolio = await prisma.studentPortfolio.findUnique({ where: { studentId } });
    } else {
      throw e;
    }
  }
  if (!portfolio) throw new Error(`[PortfolioUpdater] Could not create or find portfolio for student ${studentId}`);

  const items: any[] = ((portfolio as any)[type] as any[]) || [];

  // Deduplication — skip if this entry already exists
  const isDuplicate = items.some((item) => {
    if (type === 'courses')      return item.courseSlug === data.courseSlug;
    if (type === 'certificates') return item.certNumber === data.certNumber || item.courseId === data.courseId;
    if (type === 'projects')     return item.projectId === data.projectId;
    return false;
  });

  if (isDuplicate) {
    console.log(`[PortfolioUpdater] Skipping duplicate ${type} entry for student ${studentId}`);
    return;
  }

  items.push(data);

  // Auto-generate skills from the new entry
  const currentSkills: string[] = ((portfolio as any).skills as string[]) || [];
  const skillSet = new Set(currentSkills);

  if (type === 'courses' && data.courseSlug) {
    skillsForCourse(data.courseSlug).forEach((s) => skillSet.add(s));
  }
  if (type === 'projects' && data.projectId) {
    skillsForProject(data.projectId).forEach((s) => skillSet.add(s));
    if (data.isCapstone) skillSet.add('Capstone Project');
  }

  await prisma.studentPortfolio.update({
    where: { studentId },
    data: {
      [type]: items,
      skills: Array.from(skillSet),
    },
  });

  if (type === 'projects' && data.title) {
    await sendNotification(
      studentId,
      'portfolio_updated',
      'Portfolio Updated',
      `${data.title} has been added to your portfolio.`,
      '/portfolio',
      'high',
      `portfolio_project_${studentId}_${data.projectId ?? data.title}`
    );
  }

  console.log(`[PortfolioUpdater] Added ${type} entry for student ${studentId}`);
}
