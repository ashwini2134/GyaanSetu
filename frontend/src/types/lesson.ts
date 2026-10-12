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
    bullets?: string[];
    highlightCard?: string;
  };
  stage1Transition?: string;
  visualization: {
    type: ThinkOfVisualType;
    title: string;
    items?: string[];
    condition?: string;
    trueLabel?: string;
    falseLabel?: string;
    centerLabel?: string;
    bullets?: string[];
    highlightCard?: string;
  };
  stage2Transition?: string;
  code: {
    language: string;
    code: string;
    output?: string;
    highlights?: string[];
    highlightCard?: string;
  };
  takeaway?: string;
  reflection?: {
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

export interface AIConversationSlide {
  title: string;
  body: string[];
  button: string;
}

export interface AIConversationMission {
  title: string;
  starter: string;
}

export interface AIConversationConfig {
  slides: AIConversationSlide[];
  missions: AIConversationMission[];
  placeholder: string;
  mentorHints: string[];
  reflectionQuestion: string;
  reflectionOptions: string[];
  completionMessages: string[];
}

export interface PathBuilderCell {
  row: number;
  col: number;
}

export interface PathBuilderReveal {
  startState: string;
  goalState: string;
  actions: string;
  path: string;
  pathCost: string;
}

export interface PathBuilderRound {
  gridSize: number;
  start: PathBuilderCell;
  goal: PathBuilderCell;
  walls: PathBuilderCell[];
  optimalPathLength?: number;
  reveal: PathBuilderReveal;
}

export interface PathBuilderConfig {
  rounds: PathBuilderRound[];
  completionMessages: string[];
}

export interface BFSDFSGraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface BFSDFSGraphEdge {
  from: string;
  to: string;
}

export interface BFSDFSGraphStructure {
  nodes: BFSDFSGraphNode[];
  edges: BFSDFSGraphEdge[];
  startNode: string;
}

export interface BFSDFSComparison {
  bfs: string[];
  dfs: string[];
}

export interface BFSDFSReflection {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BFSDFSConfig {
  slides: AIConversationSlide[];
  scenario: string;
  graph: BFSDFSGraphStructure;
  bfsOrder: string[];
  dfsOrder: string[];
  comparison: BFSDFSComparison;
  reflection: BFSDFSReflection;
  completionMessages: string[];
}

export interface InvestigationSlide {
  title: string;
  body: string;
}

export interface InvestigationQuestion {
  category: string;
  scenario: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface InvestigationConfig {
  slides: InvestigationSlide[];
  questions: InvestigationQuestion[];
  completionSummary: { label: string; value: string }[];
  completionMessage: string;
  completionTitle: string;
}

export interface SearchProblemBuilderLocation {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface SearchProblemBuilderOption {
  id: string;
  label: string;
  correct: boolean;
  feedback?: string;
}

export interface BFSDFSGameNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export type BFSDFSGameEdge = [string, string];

export interface BFSDFSGameRound {
  id: string;
  mission: string;
  treasureNode: string;
  startNode: string;
  bfsOrder: string[];
  dfsOrder: string[];
  winner: 'bfs' | 'dfs';
  explanation: string;
}

export interface BFSDFSGameConfig {
  slides: { title: string; body: string }[];
  nodes: BFSDFSGameNode[];
  edges: BFSDFSGameEdge[];
  rounds: BFSDFSGameRound[];
  completionTitle: string;
  completionMessage: string;
  closingMessage: string;
}

export interface ConfidenceScenario {
  id: string;
  title: string;
  situation: string;
  expectedMin: number;
  expectedMax: number;
  explanation: string;
}

export interface ConfidenceChallengeConfig {
  slides: { title: string; body: string }[];
  scenarios: ConfidenceScenario[];
  completionTitle: string;
  completionMessage: string;
  closeThreshold: number;
  farThreshold: number;
}

export interface CaseEvidence {
  id: string;
  title: string;
  evidence: string;
  question: string;
  correct: 'increase' | 'decrease' | 'stay_similar';
  newBelief: number;
  explanation: string;
}

export interface CaseFileInvestigationConfig {
  slides: { title: string; body: string }[];
  caseTitle: string;
  initialBelief: number;
  status: string;
  evidences: CaseEvidence[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface PipelineEvidence {
  id: string;
  label: string;
  description: string;
}

export interface DecisionPipelineConfig {
  slides: { title: string; body: string }[];
  scenarioTitle: string;
  priorBeliefPercent: number;
  priorBeliefCard: string;
  priorBeliefExplanation: string;
  evidences: PipelineEvidence[];
  evidenceExplanation: string;
  updatedConfidence: number;
  updatedConfidenceExplanation: string;
  options: { label: string; value: string }[];
  correctOption: string;
  decisionExplanation: string;
  summaryText: string;
}

export interface MarkovChainPracticeConfig {
  transitionMatrix: Record<string, Record<string, number>>;
  stateLabels: Record<string, string>;
  questions: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface HillClimbExerciseConfig {
  slides: { title: string; body: string }[];
  landscape: number[];
  scenarioText?: string;
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface SearchProblemBuilderConfig {
  slides: { title: string; body: string }[];
  scenarioText: string;
  locations: SearchProblemBuilderLocation[];
  edges: [string, string][];
  startState: { correctId: string; errorMessage: string };
  goalState: { correctId: string; errorMessage: string };
  actions: { options: SearchProblemBuilderOption[] };
  pathCost: { options: SearchProblemBuilderOption[] };
  validationSteps: { label: string }[];
  completionTitle: string;
  completionMessage: string;
  closingMessage: string;
}

export interface WarehouseOrderPosition {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface WarehouseStepOrder {
  id: string;
  g: number;
  h: number;
}

export interface WarehouseStep {
  robotX: number;
  robotY: number;
  availableOrders: WarehouseStepOrder[];
  correctOrderId: string;
  greedyOrderId: string;
  explanation: string;
}

export interface WarehouseAIGameConfig {
  slides: { title: string; body: string }[];
  orderPositions: WarehouseOrderPosition[];
  steps: WarehouseStep[];
  completionTitle: string;
  completionMessage: string;
  closingMessage: string;
}

export interface PropLogicGameConfig {
  slides: { title: string; body: string }[];
  completionTitle: string;
  completionMessage: string;
}

export interface KBGameConfig {
  slides: { title: string; body: string }[];
  completionTitle: string;
  completionMessage: string;
}

export interface InferenceGameConfig {
  slides: { title: string; body: string }[];
  completionTitle: string;
  completionMessage: string;
}

export interface PizzaToppingConfig {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface PizzaOptimizationConfig {
  slides: { title: string; body: string }[];
  toppings: PizzaToppingConfig[];
  baseScore: number;
  completionTitle: string;
  completionMessages: {
    high: string;
    medium: string;
    low: string;
  };
  takeaways: string[];
}

export interface LostAndFoundCategory {
  id: string;
  label: string;
}

export interface LostAndFoundItem {
  id: string;
  label: string;
  categoryId: string;
}

export interface LostAndFoundConfig {
  slides: { title: string; body: string }[];
  categories: LostAndFoundCategory[];
  round1Items: LostAndFoundItem[];
  newItems: LostAndFoundItem[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface MLWorkflowStep {
  id: string;
  label: string;
  explanation: string;
}

export interface MLWorkflowConfig {
  slides: { title: string; body: string }[];
  steps: MLWorkflowStep[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface FaceFeature {
  id: string;
  label: string;
  isFaceFeature: boolean;
  zoneX: number;
  zoneY: number;
  zoneW: number;
  zoneH: number;
  weight: number;
  feedback: string;
}

export interface FaceBuilderConfig {
  slides: { title: string; body: string }[];
  features: FaceFeature[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface NeuralNetworkConfig {
  slides: { title: string; body: string }[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface TokenizationConfig {
  slides: { title: string; body: string }[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface SearchEnginePipelineConfig {
  slides: { title: string; body: string }[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface PredictNextWordConfig {
  slides: { title: string; body: string }[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface BiasScenarioConfig {
  name: string;
  details: { label: string; value: string }[];
  question: string;
  correctAnswer: boolean;
  explanation: string;
}

export interface PrivacyScenarioConfig {
  appName: string;
  permissions: string[];
  requiredPermissions: string[];
  explanation: string;
}

export interface FairOrUnfairConfig {
  slides: { title: string; body: string }[];
  biasScenarios: BiasScenarioConfig[];
  privacyScenarios: PrivacyScenarioConfig[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface ApprovalCardConfig {
  id: string;
  text: string;
  expected: 'ready' | 'needs';
  explanation: string;
}

export interface DashboardItemConfig {
  label: string;
  cardIds: string[];
}

export interface AIApprovalChecklistConfig {
  slides: { title: string; body: string }[];
  systemName: string;
  systemPurpose: string;
  cards: ApprovalCardConfig[];
  dashboardItems: DashboardItemConfig[];
  completionTitle: string;
  completionMessage: string;
  takeaways: string[];
}

export interface StudyDayPlannerConfig {
  title?: string;
}

export interface NeuronCalculatorConfig {
  problems: NeuronCalcProblem[];
}

export interface ClusteringScenario {
  id: string;
  emoji: string;
  title: string;
  description: string;
  correctAlgorithm: 'kmeans' | 'hierarchical' | 'dbscan';
  explanation: string;
}

export interface ClusteringMatchConfig {
  scenarios: ClusteringScenario[];
}

export interface SmoothieIngredient {
  key: string;
  emoji: string;
  label: string;
  defaultInput: number;
  defaultWeight: number;
}

export interface SmoothieBlenderMode {
  key: 'relu' | 'sigmoid' | 'tanh';
  emoji: string;
  label: string;
  subtitle: string;
  description: string;
}

export interface SmoothieForwardPassConfig {
  targetScore: number;
  ingredients: SmoothieIngredient[];
  blenderModes: SmoothieBlenderMode[];
  finalChallenge: {
    targetScore: number;
    lockedKeys: string[];
  };
}

export interface NeuronCalcProblem {
  inputs: number[];
  weights: number[];
  bias: number;
  weightedSum: number;
  activated: number;
  activation: 'relu' | 'sigmoid';
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
  aiConversationConfig?: AIConversationConfig;
  pathBuilderConfig?: PathBuilderConfig;
  bfsdfsConfig?: BFSDFSConfig;
  investigationConfig?: InvestigationConfig;
  searchProblemBuilderConfig?: SearchProblemBuilderConfig;
  bfsdfsGameConfig?: BFSDFSGameConfig;
  warehouseAIGameConfig?: WarehouseAIGameConfig;
  propLogicGameConfig?: PropLogicGameConfig;
  kbGameConfig?: KBGameConfig;
  inferenceGameConfig?: InferenceGameConfig;
  confidenceChallengeConfig?: ConfidenceChallengeConfig;
  caseFileInvestigationConfig?: CaseFileInvestigationConfig;
  decisionPipelineConfig?: DecisionPipelineConfig;
  markovChainPracticeConfig?: MarkovChainPracticeConfig;
  hillClimbConfig?: HillClimbExerciseConfig;
  pizzaOptimizationConfig?: PizzaOptimizationConfig;
  lostAndFoundConfig?: LostAndFoundConfig;
  mlWorkflowConfig?: MLWorkflowConfig;
  faceBuilderConfig?: FaceBuilderConfig;
  neuralNetworkConfig?: NeuralNetworkConfig;
  tokenizationConfig?: TokenizationConfig;
  searchEnginePipelineConfig?: SearchEnginePipelineConfig;
  predictNextWordConfig?: PredictNextWordConfig;
  fairOrUnfairConfig?: FairOrUnfairConfig;
  aiApprovalChecklistConfig?: AIApprovalChecklistConfig;
  neuronCalculatorConfig?: NeuronCalculatorConfig;
  studyDayPlannerConfig?: StudyDayPlannerConfig;
  smoothieForwardPassConfig?: SmoothieForwardPassConfig;
  clusteringMatchConfig?: ClusteringMatchConfig;
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

// ── AI Course Premium Learning Blocks ─────────────────────────────────────────

export interface AIConceptCard {
  number: number;
  title: string;
  illustration?: string;
  description: string;
}

export interface BfsDfsStep {
  title: string;
  description: string;
}

export interface BfsDfsContent {
  bfsSentences: string[];
  bfsSteps: BfsDfsStep[];
  dfsSentences: string[];
  dfsSteps: BfsDfsStep[];
}

export interface GreedyAStarContent {
  greedySentences: string[];
  greedySteps: BfsDfsStep[];
  aStarSentences: string[];
  aStarSteps: BfsDfsStep[];
}

export interface ProbabilityChapter {
  title: string;
  sentences: string[];
  terms?: { term: string; definition: string }[];
  interactive?: 'conditional-probability' | 'random-variable' | 'joint-probability' | 'bayesian-network' | 'markov-chain' | 'local-search' | 'state-space' | 'simulated-annealing' | 'feasible-region' | 'arc-consistency' | 'knowledge-engineering-try-it-yourself' | 'k-means' | 'neural-network-structure' | 'activation-function-explorer' | 'training-hyperparameters' | 'perceptron-learning';
  image?: string;
  imageAlt?: string;
  example?: { title: string; table: string[][]; note?: string };
}

export interface ProbabilityContent {
  chapters: ProbabilityChapter[];
}

export interface AdversarialChapter {
  title: string;
  sentences: string[];
  pseudocode?: string;
}

export interface AdversarialContent {
  chapters: AdversarialChapter[];
}

export interface OverfittingInfographicData {
  takeaway: string;
}

export interface SectionBreakdown {
  sentences: string[];
  steps: { title: string; description: string }[];
}

export interface AILearnSectionBlock {
  type: 'ai_section';
  theme?: 'light' | 'dark';
  hero: {
    category: string;
    title: string;
    intro: string;
    illustration?: string;
  };
  concepts: AIConceptCard[];
  bfsDfsContent?: BfsDfsContent;
  greedyAStarContent?: GreedyAStarContent;
  probabilityContent?: ProbabilityContent;
  chapterContent?: ProbabilityContent;
  adversarialContent?: AdversarialContent;
  overfittingContent?: OverfittingInfographicData;
  sectionBreakdown?: SectionBreakdown;
  keyInsight: string;
}

export interface AIThinkOfPanel {
  number: number;
  label: string;
  illustration?: string;
  description: string;
  caption?: string;
  visual?: {
    type: string;
    items?: string[];
    conclusion?: string;
  };
}

export interface AIThinkOfPanelBlock {
  type: 'ai_think_of';
  title: string;
  subtitle: string;
  panels: AIThinkOfPanel[];
  insight: string;
  reinforcement?: string;
}

export interface InfographicPanel {
  title: string;
  caption: string;
  label: string;
}

export interface InfographicBlock {
  type: 'infographic';
  id: string;
  panels: InfographicPanel[];
  takeaway: string;
}

// ── AI Challenge Set ───────────────────────────────────────────────────────────

export interface AIChallengeCard {
  id: string;
  label: string;
  usesAI: boolean;
}

export interface AIClassifyApp {
  name: string;
  answer: string;
  explanation: string;
}

export interface AISituation {
  text: string;
  usesAI: boolean;
}

export interface AIRulesItem {
  text: string;
  answer: string;
}

export interface AIChallenge {
  id: string;
  title: string;
  difficulty: string;
  objective: string;
  instruction: string;
  type: 'select_cards' | 'classify' | 'situations' | 'rules_vs_learning';
  cards?: AIChallengeCard[];
  apps?: AIClassifyApp[];
  choices?: string[];
  situations?: AISituation[];
  items?: AIRulesItem[];
  explanation?: string;
}

export interface AIChallengeSetBlock {
  type: 'ai_challenge_set';
  challenges: AIChallenge[];
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
  | PracticeBlock
  | AILearnSectionBlock
  | AIThinkOfPanelBlock
  | AIChallengeSetBlock
  | InfographicBlock;

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
  type?: 'coding' | 'reflection';
  hints?: string[];
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  /** Optional per-problem override for the "Before You Start" card. Falls back to a sensible default when omitted. */
  beforeYouStart?: string[];
  /** Optional per-problem override for the "How We Evaluate" card. Falls back to a sensible default when omitted. */
  evaluationNotes?: string[];
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
