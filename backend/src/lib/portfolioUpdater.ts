// Fraylon - Phase 2.5 & 3
import { PrismaClient } from '@prisma/client';
import { prisma } from "../prisma.js";

export async function updatePortfolio(studentId: string, type: 'courses' | 'projects' | 'certificates', data: any) {
  let portfolio = await prisma.studentPortfolio.findUnique({ where: { studentId } });
  if (!portfolio) {
    portfolio = await prisma.studentPortfolio.create({
      data: { studentId, courses: [], projects: [], certificates: [] }
    });
  }

  const items = (portfolio as any)[type] || [];
  items.push(data);

  await prisma.studentPortfolio.update({
    where: { studentId },
    data: { [type]: items }
  });
  console.log(`[PortfolioUpdater] Added ${type} to student ${studentId}`);
}
