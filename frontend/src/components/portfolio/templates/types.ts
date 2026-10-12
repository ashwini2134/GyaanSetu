import type { GithubActivityResponse } from '../GitHubContributionChart';
import type { SettingsPanelProps } from '../SettingsPanel';

export interface PortfolioCert { courseSlug?: string; title?: string; certNumber: string; issuedAt?: string }
export interface PortfolioProjectRaw { projectId: string; title?: string; completedAt?: string | null; githubUrl?: string; liveDemoUrl?: string; isCapstone?: boolean }
export interface EnrichedProject extends PortfolioProjectRaw {
  name: string;
  techStack: string;
  difficulty?: string;
  category?: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface ServiceEntry {
  id: string;
  title: string;
  description: string;
}

export interface TestimonialEntry {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
}

export interface PortfolioData {
  skills: string[];
  courses: Array<{ courseSlug: string; lectureId?: string; completedAt: string | null }>;
  certificates: PortfolioCert[];
  projects: PortfolioProjectRaw[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  services: ServiceEntry[];
  testimonials: TestimonialEntry[];
}

export interface PortfolioStats {
  totalXp: number;
  lecturesCompleted: number;
  quizzesPassed: number;
  problemsSolved: number;
  practiceCompleted: number;
  milestoneProjects: number;
  capstoneProjects: number;
  coursesCompleted: number;
  problemsByDifficulty: { easy: number; medium: number; hard: number; unknown: number };
  practiceAccuracy: number | null;
  practiceAttemptCount: number;
}

export interface DisplayUser {
  id?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt?: string;
  profileTheme?: string;
  portfolioTemplate?: string;
}

export interface AccentTheme {
  label: string;
  hex: string;
  darkHex: string;
}

export const ACCENT_THEMES: Record<string, AccentTheme> = {
  default: { label: 'Teal', hex: '#00BFB3', darkHex: '#009E95' },
  ocean: { label: 'Ocean Blue', hex: '#3B82F6', darkHex: '#2563EB' },
  forest: { label: 'Forest Green', hex: '#22C55E', darkHex: '#16A34A' },
  sunset: { label: 'Sunset Orange', hex: '#F97316', darkHex: '#EA580C' },
  royal: { label: 'Royal Purple', hex: '#A855F7', darkHex: '#9333EA' },
};

export function accentThemeFor(theme?: string): AccentTheme {
  return (theme && ACCENT_THEMES[theme]) || ACCENT_THEMES.default;
}

export const COURSE_NAMES: Record<string, string> = {
  python: 'Python Fundamentals',
  'fundamentals-of-ai': 'AI Foundations',
};

export function courseDisplayName(slug?: string): string {
  if (!slug) return 'Certificate';
  return COURSE_NAMES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export interface PortfolioTemplateId {
  id: 'bento' | 'minimal' | 'sidebar' | 'editorial' | 'terminal' | 'story' | 'resume' | 'ledger' | 'journey' | 'atelier';
  label: string;
  description: string;
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplateId[] = [
  { id: 'bento', label: 'Bento', description: 'Card-grid dashboard, data-forward' },
  { id: 'minimal', label: 'Minimal', description: 'Spacious document, resume-style' },
  { id: 'sidebar', label: 'Sidebar', description: 'Fixed identity rail, app-like' },
  { id: 'editorial', label: 'Editorial', description: 'Bold hero, showcase-first' },
  { id: 'terminal', label: 'Terminal', description: 'Dark, monospace, code-first' },
  { id: 'story', label: 'Story', description: 'Narrative one-pager, dark hero-to-CTA flow' },
  { id: 'resume', label: 'Resume', description: 'Paper-style document, chronological & printable' },
  { id: 'ledger', label: 'Ledger', description: 'Dense register, tabular & scannable' },
  { id: 'journey', label: 'Journey', description: 'One unified timeline of your whole path' },
  { id: 'atelier', label: 'Atelier', description: 'Boutique studio, testimonial-led' },
];

export interface TemplateProps {
  displayUser: DisplayUser | null;
  stats: PortfolioStats | null;
  portfolio: PortfolioData | null;
  enrichedProjects: EnrichedProject[];
  githubActivity: GithubActivityResponse | null;
  accentTheme: AccentTheme;
  isOwn: boolean;
  initials: string;
  joinedDate: string;
  loading: boolean;
  avatarPreview: string | null;

  tab: 'overview' | 'settings';
  setTab: (t: 'overview' | 'settings') => void;
  downloading: boolean;
  onDownloadPdf: () => void;

  settingsProps: SettingsPanelProps;
}
