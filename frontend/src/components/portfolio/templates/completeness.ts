import type { DisplayUser, PortfolioData } from './types';

// Mirrors the backend's spotlight-qualification scoring (portfolio.ts) so
// the "complete your portfolio" nudge and the Spotlight's 50-point floor
// mean the same thing to a student.
export function computeCompleteness(displayUser: DisplayUser | null, portfolio: PortfolioData | null): number {
  let score = 0;
  if (displayUser?.bio?.trim()) score += 10;
  if (displayUser?.avatarUrl?.trim()) score += 10;
  if (displayUser?.githubUrl?.trim() || displayUser?.linkedinUrl?.trim() || displayUser?.portfolioUrl?.trim()) score += 10;
  if (portfolio) {
    if ((portfolio.experience ?? []).length > 0) score += 10;
    if ((portfolio.education ?? []).length > 0) score += 10;
    if ((portfolio.skills ?? []).length > 0) score += 10;
    if ((portfolio.projects ?? []).length > 0) score += 15;
    if ((portfolio.certificates ?? []).length > 0) score += 15;
    if ((portfolio.services ?? []).length > 0) score += 5;
    if ((portfolio.testimonials ?? []).length > 0) score += 5;
  }
  return score;
}
