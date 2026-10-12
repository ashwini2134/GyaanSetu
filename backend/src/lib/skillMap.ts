// Single source of truth for course/project → skill derivation, used by both
// portfolioUpdater.ts (on-approval writes) and routes/portfolio.ts (sync).
// Previously these were three separate, drifting maps — see the "three
// skill dictionaries" gap this consolidates.

export const COURSE_SKILLS: Record<string, string[]> = {
  python: ["Python", "Programming Fundamentals", "Problem Solving"],
  "fundamentals-of-ai": ["AI/ML", "Python", "Machine Learning", "Search Algorithms"],
};

export const PROJECT_SKILLS: Record<string, string[]> = {
  search_visualizer: ["Search Algorithms", "BFS", "DFS", "A*", "Heuristics", "Python"],
  inference_engine: ["Propositional Logic", "Inference", "Model Checking", "Knowledge Representation", "Python"],
  text_classifier: ["Machine Learning", "NLP", "TF-IDF", "k-NN", "Model Evaluation", "Python"],
  csp_solver: ["CSP", "Backtracking", "AC-3", "Constraint Propagation", "Optimization", "Python"],
};

export function skillsForCourse(courseSlug: string): string[] {
  return COURSE_SKILLS[courseSlug] ?? [];
}

export function skillsForProject(projectId: string): string[] {
  return PROJECT_SKILLS[projectId] ?? [];
}
