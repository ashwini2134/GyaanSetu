import type { EnrichedProject } from './types';

// Category order matches the /projects catalog's own tab order — anything
// without a catalog match (e.g. a project removed from the catalog since
// completion) falls into a trailing "Other Projects" bucket instead of
// being dropped.
export const CATEGORY_ORDER = ['Beginner Level', 'Intermediate Level', 'Advanced Level', 'AI/ML Projects', 'Industry Projects'];
export const OTHER_CATEGORY = 'Other Projects';
export const COLLAPSED_COUNT = 3;

export function groupProjectsByCategory(projects: EnrichedProject[]): Array<[string, EnrichedProject[]]> {
  const byCategory = new Map<string, EnrichedProject[]>();
  for (const p of projects) {
    const key = p.category ?? OTHER_CATEGORY;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(p);
  }
  const order = [...CATEGORY_ORDER, OTHER_CATEGORY];
  return order
    .filter((cat) => byCategory.has(cat))
    .map((cat) => [cat, byCategory.get(cat)!] as [string, EnrichedProject[]]);
}
