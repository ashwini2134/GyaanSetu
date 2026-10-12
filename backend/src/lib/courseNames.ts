// Single source of truth for course display names. These are GyanSetu's
// own courses, so certificates, resumes, and admin UI must not
// print "CS50P"/"Fundamentals of AI".
export const COURSE_FULL_NAMES: Record<string, string> = {
  python20: 'Python Beginner Course',
  'fundamentals-of-ai': 'Artificial Intelligence Fundamentals',
};

export const COURSE_SHORT_LABELS: Record<string, string> = {
  python20: 'Python',
  'fundamentals-of-ai': 'AI',
};
