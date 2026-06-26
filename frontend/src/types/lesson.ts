// ─────────────────────────────────────────────────────────────────────────────
// Lesson data types — all lesson content is driven from these shapes.
// Add a new lecture by creating lecture.json; zero UI changes needed.
// ─────────────────────────────────────────────────────────────────────────────

// ── Content blocks ────────────────────────────────────────────────────────────

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface ExplanationBlock {
  type: 'explanation';
  title: string;
  body: string;
  bullets?: string[];
  accentColor?: 'blue' | 'purple' | 'green' | 'orange' | 'amber';
}

export interface AnalogyBlock {
  type: 'analogy';
  title: string;
  text: string;
  accentColor?: 'blue' | 'purple' | 'green' | 'orange' | 'amber';
}

export interface VisualizationPanel {
  label: string;
  title?: string;
  description?: string;
  // For center panels
  visualType?: 'storage_box' | 'recipe_book' | 'flow_diagram' | 'text';
  varName?: string;
  varValue?: string;
  flowSteps?: string[];
  textContent?: string;
  // For code panels
  code?: string;
  language?: string;
  output?: string;
}

export interface ConceptVisualizationBlock {
  type: 'concept_visualization';
  title: string;
  accentColor: 'blue' | 'purple' | 'green' | 'orange' | 'amber';
  analogy: {
    title: string;
    description: string;
    image: string;
  };
  visual: {
    title: string;
    type: 'storage_box' | 'recipe_book' | 'flow_diagram' | 'text';
    flowSteps?: string[];
  };
  code: {
    language: string;
    code: string;
    output?: string;
  };
}

export type ThinkOfVisualType =
  | 'flow'
  | 'decision'
  | 'repetition'
  | 'categories';

export interface ThinkOfBlock {
  type: 'think_of';
  analogy: {
    title: string;
    description: string;
    image?: string;
  };
  visualization: {
    type: ThinkOfVisualType;
    title: string;
    items?: string[];
    condition?: string;
    trueLabel?: string;
    falseLabel?: string;
    centerLabel?: string;
  };
  code: {
    language: string;
    code: string;
    output?: string;
  };
  reflection: {
    question: string;
    answer: string;
    options?: string[];
    followupCode?: string;
    followupOutput?: string;
  };
}

// ── Visual Aid ──────────────────────────────────────────────────────────────

export type VisualAidKind =
  | 'index_visual'
  | 'mapping_visual'
  | 'transformation_demo';

export interface VisualAidBlock {
  type: 'visual_aid';
  kind: VisualAidKind;
  title: string;
  accentColor?: 'blue' | 'purple' | 'green' | 'orange' | 'amber';
  items?: Array<{ label: string; value?: string; desc?: string }>;
  code?: string;
  language?: string;
  output?: string;
}

export interface CodeExampleBlock {
  type: 'code_example';
  title: string;
  language: string;
  code: string;
  expectedOutput?: string;
  editable?: boolean;
}

export interface ReflectionBlock {
  type: 'reflection';
  question: string;
  answer: string;
  followupCode?: string;
  followupOutput?: string;
}

export interface DragDropZoneConfig {
  id: string;
  label: string;
  description?: string;
}

export interface DragDropCardConfig {
  id: string;
  text: string;
  correctZone: string;
  description?: string;
}

export interface DragDropConfig {
  zones: DragDropZoneConfig[];
  cards: DragDropCardConfig[];
}

export interface HierarchyExpandStep {
  id: string;
  type: 'yes_no' | 'mcq' | 'multi_select' | 'visual_reveal' | 'tree';
  question?: string;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  items?: { label: string; icon: string; category?: string; explanation?: string }[];
  visual?: {
    nodes: { label: string; icon: string; depth: number; children?: { label: string; icon: string; depth: number }[] }[];
  };
}

export interface HierarchyExpandConfig {
  root: { label: string; icon: string };
  child: { label: string; icon: string };
  grandchild: { label: string; icon: string };
  steps: HierarchyExpandStep[];
  finalTree: { label: string; icon: string; children: { label: string; icon: string; children?: { label: string; icon: string }[] }[] }[];
  nonAIExamples: string[];
  theme?: "ai" | "vision";
  onboarding?: string[];
  completionMessage?: string;
}

export interface PracticeExerciseConfig {
  id?: string;
  title: string;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  successCriteria: string[];
  systemInstruction: string;
  type?: string;
  difficulty?: string;
  estimatedTime?: number | null;
  dragDropConfig?: DragDropConfig;
  hierarchyExpandConfig?: HierarchyExpandConfig;
}

export interface BookPageContent {
  title?: string;
  paragraphs?: string[];
  image?: string;
  imageAlt?: string;
}

export interface BookSpread {
  left?: BookPageContent;
  right?: BookPageContent;
}

export interface InteractiveBookBlock {
  type: 'interactive_book';
  spreads: BookSpread[];
}

export interface PracticeBlock {
  type: 'practice';
  title: string;
  instructions: string;
  starterCode: string;
  solution: string;
  hint: string;
  expectedOutput?: string;
  requiredPatterns?: string[];
}

export type ContentBlock =
  | TextBlock
  | ExplanationBlock
  | AnalogyBlock
  | ConceptVisualizationBlock
  | ThinkOfBlock
  | VisualAidBlock
  | CodeExampleBlock
  | ReflectionBlock
  | InteractiveBookBlock
  | PracticeBlock;

// ── Section ───────────────────────────────────────────────────────────────────

export interface LessonSection {
  id: string;
  label: string;
  blocks: ContentBlock[];
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

// ── Problems ─────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TestCase {
  label: string;
  input: string;
  expectedOutput: string;
  matchType?: 'exact' | 'regex' | 'any_lines';
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface SummaryData {
  keyTakeaways: Array<{ text: string }>;
  whatYouLearned: string[];
  nextUp?: string;
}

// ── Root lesson data ──────────────────────────────────────────────────────────

export interface ProjectSummary {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
}

export interface LessonData {
  id: string;
  courseSlug: string;
  number: number;
  title: string;
  overview: string;
  estimatedMinutes: number;
  sections: LessonSection[];
  quiz?: QuizQuestion[];
  problems?: CodingProblem[];
  projects?: ProjectSummary[];
  summary?: SummaryData;
}

// ── Progress ─────────────────────────────────────────────────────────────────

export interface SectionProgress {
  visited: boolean;
  practiceAttempted: boolean;
  practiceCompleted: boolean;
}

export interface LectureProgress {
  courseSlug: string;
  lectureNumber: number;
  sections: Record<string, SectionProgress>;
  quizScore: number | null;
  quizCompleted: boolean;
  problemsCompleted: string[];
  handsOnTaskCompleted: boolean;
  lectureCompleted: boolean;
  lastSection: string;
  projectCompleted?: boolean;
  projectId?: string | null;
}
