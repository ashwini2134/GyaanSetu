import { prisma } from "../prisma.js";

interface DragDropZone {
  id: string;
  label: string;
  description?: string;
}

interface DragDropCard {
  id: string;
  text: string;
  correctZone: string;
  description?: string;
}

interface DragDropExerciseConfig {
  title: string;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  zones: DragDropZone[];
  cards: DragDropCard[];
}

const DRAG_DROP_EXERCISES: Record<string, DragDropExerciseConfig> = {
  // Lecture 1: Introduction to AI — AI vs Traditional Programs
  "cs50ai_0_what-is-ai": {
    title: "AI vs Traditional Programs",
    learningGoal: "Distinguish between AI systems and traditional programs.",
    challenge: "Classify each example as either an AI system or a traditional program.",
    promptHint: "Ask yourself: Does it learn from data or simply follow fixed rules?",
    zones: [
      { id: "ai", label: "AI System", description: "Learns from data to make decisions" },
      { id: "traditional", label: "Traditional Program", description: "Follows fixed rules to produce output" },
    ],
    cards: [
      { id: "c1", text: "Calculator", description: "Applies arithmetic operators to numbers", correctZone: "traditional" },
      { id: "c2", text: "Alarm Clock", description: "Triggers at a preset time every day", correctZone: "traditional" },
      { id: "c3", text: "Basic Multiplication Program", description: "Multiplies two numbers with a fixed algorithm", correctZone: "traditional" },
      { id: "c4", text: "Netflix Recommendations", description: "Suggests shows based on your viewing history", correctZone: "ai" },
      { id: "c5", text: "Spam Filter", description: "Learns which emails are junk from past examples", correctZone: "ai" },
      { id: "c6", text: "Face Unlock", description: "Recognizes your face from training on your photos", correctZone: "ai" },
      { id: "c7", text: "Google Maps Route Prediction", description: "Predicts traffic from historical driving data", correctZone: "ai" },
      { id: "c8", text: "Weather Forecasting AI", description: "Learns patterns from years of weather data", correctZone: "ai" },
    ],
  },

  // Lecture 2: Search Algorithms — BFS vs DFS vs Greedy vs A*
  "cs50ai_1_bfs-dfs": {
    title: "Search Algorithms",
    learningGoal: "Match each scenario to the correct search algorithm.",
    challenge: "Identify which search algorithm best fits each description.",
    promptHint: "Think about how each algorithm explores its options.",
    zones: [
      { id: "bfs", label: "BFS" },
      { id: "dfs", label: "DFS" },
      { id: "greedy", label: "Greedy" },
      { id: "astar", label: "A*" },
    ],
    cards: [
      { id: "c1", text: "Explores nearby options first", correctZone: "bfs" },
      { id: "c2", text: "Goes deep down one path", correctZone: "dfs" },
      { id: "c3", text: "Chooses what looks closest to goal", correctZone: "greedy" },
      { id: "c4", text: "Uses distance travelled + estimated distance", correctZone: "astar" },
    ],
  },

  // Lecture 3: Knowledge & Logic — Facts, Rules & Inference
  "cs50ai_2_knowledge-base": {
    title: "Facts, Rules & Inference",
    learningGoal: "Understand how facts and rules are used to make logical conclusions.",
    challenge: "Sort each statement into Fact, Rule, or Inference.",
    promptHint: "Facts are known information. Rules connect information. Inferences are conclusions derived from facts and rules.",
    zones: [
      { id: "fact", label: "Fact" },
      { id: "rule", label: "Rule" },
      { id: "inference", label: "Inference" },
    ],
    cards: [
      { id: "c1", text: "It is raining", correctZone: "fact" },
      { id: "c2", text: "Lakshanya is a student", correctZone: "fact" },
      { id: "c3", text: "Roads are wet", correctZone: "fact" },
      { id: "c4", text: "If it rains, roads become wet", correctZone: "rule" },
      { id: "c5", text: "If a student studies, they pass exams", correctZone: "rule" },
      { id: "c6", text: "If roads are wet, drive carefully", correctZone: "rule" },
      { id: "c7", text: "Drive carefully today", correctZone: "inference" },
      { id: "c8", text: "Lakshanya may pass the exam", correctZone: "inference" },
      { id: "c9", text: "The road is probably wet", correctZone: "inference" },
    ],
  },

  // Lecture 5: Optimization — Simulated Annealing & CSP
  "cs50ai_4_simulated-annealing": {
    title: "Optimization vs Constraint Satisfaction",
    learningGoal: "Understand the difference between optimization problems and constraint satisfaction problems.",
    challenge: "Classify each scenario into the correct category.",
    promptHint: "Optimization finds the best solution. Constraint Satisfaction finds any valid solution that satisfies all constraints.",
    zones: [
      { id: "optimization", label: "Optimization Problem" },
      { id: "csp", label: "Constraint Satisfaction Problem" },
    ],
    cards: [
      { id: "c1", text: "Find the shortest delivery route", correctZone: "optimization" },
      { id: "c2", text: "Maximize company profit", correctZone: "optimization" },
      { id: "c3", text: "Minimize fuel usage", correctZone: "optimization" },
      { id: "c4", text: "Find the fastest travel route", correctZone: "optimization" },
      { id: "c5", text: "Sudoku Puzzle", correctZone: "csp" },
      { id: "c6", text: "Exam Timetable Scheduling", correctZone: "csp" },
      { id: "c7", text: "Classroom Seating Arrangement", correctZone: "csp" },
      { id: "c8", text: "Employee Shift Scheduling", correctZone: "csp" },
    ],
  },

  // Lecture 6: Machine Learning — Supervised vs Unsupervised vs Reinforcement
  "cs50ai_5_unsupervised-rl": {
    title: "Machine Learning Paradigms",
    learningGoal: "Identify the three major machine learning paradigms.",
    challenge: "Classify each AI application by its learning type.",
    promptHint: "Supervised Learning uses labeled data. Unsupervised Learning discovers patterns without labels. Reinforcement Learning learns through rewards and penalties.",
    zones: [
      { id: "supervised", label: "Supervised Learning" },
      { id: "unsupervised", label: "Unsupervised Learning" },
      { id: "reinforcement", label: "Reinforcement Learning" },
    ],
    cards: [
      { id: "c1", text: "Email Spam Detection", correctZone: "supervised" },
      { id: "c2", text: "House Price Prediction", correctZone: "supervised" },
      { id: "c3", text: "Handwritten Digit Recognition", correctZone: "supervised" },
      { id: "c4", text: "Disease Diagnosis", correctZone: "supervised" },
      { id: "c5", text: "Customer Segmentation", correctZone: "unsupervised" },
      { id: "c6", text: "Market Basket Analysis", correctZone: "unsupervised" },
      { id: "c7", text: "Group Similar Users", correctZone: "unsupervised" },
      { id: "c8", text: "Discover Shopping Patterns", correctZone: "unsupervised" },
      { id: "c9", text: "Chess Playing AI", correctZone: "reinforcement" },
      { id: "c10", text: "Robot Learning to Walk", correctZone: "reinforcement" },
      { id: "c11", text: "Self Driving Reward System", correctZone: "reinforcement" },
      { id: "c12", text: "Game Playing Agent", correctZone: "reinforcement" },
    ],
  },

  // Lecture 7: Neural Networks — Neural Network Layers
  "cs50ai_6_what-is-nn": {
    title: "Neural Network Layers",
    learningGoal: "Understand the role of each layer in a neural network.",
    challenge: "Place each component into the correct layer.",
    promptHint: "Input layers receive information. Hidden layers process information. Output layers make predictions.",
    zones: [
      { id: "input", label: "Input Layer" },
      { id: "hidden", label: "Hidden Layer" },
      { id: "output", label: "Output Layer" },
    ],
    cards: [
      { id: "c1", text: "Study Hours", correctZone: "input" },
      { id: "c2", text: "Attendance", correctZone: "input" },
      { id: "c3", text: "Previous Exam Score", correctZone: "input" },
      { id: "c4", text: "Age", correctZone: "input" },
      { id: "c5", text: "Feature Detection", correctZone: "hidden" },
      { id: "c6", text: "Pattern Recognition", correctZone: "hidden" },
      { id: "c7", text: "Weight Calculation", correctZone: "hidden" },
      { id: "c8", text: "Information Processing", correctZone: "hidden" },
      { id: "c9", text: "Pass Prediction", correctZone: "output" },
      { id: "c10", text: "Fail Prediction", correctZone: "output" },
      { id: "c11", text: "Risk Score", correctZone: "output" },
      { id: "c12", text: "Final Decision", correctZone: "output" },
    ],
  },

  // Lecture 9: Responsible AI — Bias, Privacy, Hallucination, Deepfake
  "cs50ai_8_hallucinations-deepfakes": {
    title: "Responsible AI Ethics",
    learningGoal: "Identify the ethical issue shown in each scenario.",
    challenge: "Classify each example by the ethical issue it demonstrates.",
    promptHint: "Consider: is it unfair, invasive, false, or deceptive?",
    zones: [
      { id: "bias", label: "Bias" },
      { id: "privacy", label: "Privacy" },
      { id: "hallucination", label: "Hallucination" },
      { id: "deepfake", label: "Deepfake" },
    ],
    cards: [
      { id: "c1", text: "Hiring AI rejects women", correctZone: "bias" },
      { id: "c2", text: "AI shares personal information", correctZone: "privacy" },
      { id: "c3", text: "AI invents false facts", correctZone: "hallucination" },
      { id: "c4", text: "Fake celebrity video", correctZone: "deepfake" },
    ],
  },
};

function parseKey(key: string): { courseId: string; lectureId: string; sectionId: string | null } {
  const parts = key.split("_");
  if (key.startsWith("cs50ai")) {
    const courseId = parts[0];
    const lectureId = parts[1];
    const sectionId = parts.slice(2).join("-") || null;
    return { courseId, lectureId, sectionId };
  }
  return { courseId: parts[0], lectureId: parts[1], sectionId: parts.slice(2).join("-") || null };
}

export async function seedDragDropExercises() {
  console.log("Seeding drag-drop practice exercises...");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const [key, config] of Object.entries(DRAG_DROP_EXERCISES)) {
    const { courseId, lectureId, sectionId } = parseKey(key);

    const existing = await prisma.practiceExercise.findFirst({
      where: {
        courseId,
        lectureId,
        sectionId,
        type: "drag_drop",
      },
    });

    if (existing) {
      await prisma.practiceExercise.update({
        where: { id: existing.id },
        data: {
          title: config.title,
          learningGoal: config.learningGoal,
          challenge: config.challenge,
          promptHint: config.promptHint,
          validationRules: JSON.parse(JSON.stringify({ zones: config.zones, cards: config.cards })),
        },
      });
      updated++;
      continue;
    }

    await prisma.practiceExercise.create({
      data: {
        courseId,
        lectureId,
        sectionId,
        title: config.title,
        type: "drag_drop",
        status: "published",
        learningGoal: config.learningGoal,
        challenge: config.challenge,
        promptHint: config.promptHint,
        validationRules: JSON.parse(JSON.stringify({ zones: config.zones, cards: config.cards })),
        completionCriteria: ["All cards correctly placed", "Score calculated"],
        difficulty: "beginner",
        estimatedTime: 5,
        aiWorkspaceEnabled: false,
      },
    });
    created++;
  }

  console.log(`  Created ${created} new, updated ${updated} existing drag-drop exercises.`);
}

// ── Hierarchy Expand Exercises ──────────────────────────────────────────────────

interface HierarchyExpandConfig {
  title: string;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  validationRules: {
    root: { label: string; icon: string };
    child: { label: string; icon: string };
    grandchild: { label: string; icon: string };
    theme?: string;
    onboarding?: string[];
    completionMessage?: string;
    steps: {
      id: string;
      type: string;
      question?: string;
      options?: string[];
      correctIndex?: number;
      correctIndices?: number[];
      items?: { label: string; icon: string; category?: string; explanation?: string }[];
      visual?: { nodes: { label: string; icon: string; depth: number }[] };
    }[];
    finalTree: { label: string; icon: string; children: { label: string; icon: string; children?: { label: string; icon: string }[] }[] }[];
    nonAIExamples: string[];
  };
}

const HIERARCHY_EXERCISES: Record<string, HierarchyExpandConfig> = {
  "cs50ai_0_ai-ml-dl": {
    title: "AI vs ML vs DL",
    learningGoal: "Understand that Artificial Intelligence is the largest field, Machine Learning is a subset of AI, and Deep Learning is a subset of Machine Learning.",
    challenge: "Discover the hierarchy by exploring how each field relates to the others.",
    promptHint: "Think of AI as the universe, ML as a galaxy within it, and DL as a solar system within that galaxy.",
    validationRules: {
      root: { label: "Artificial Intelligence", icon: "🤖" },
      child: { label: "Machine Learning", icon: "📊" },
      grandchild: { label: "Deep Learning", icon: "🧠" },
      steps: [
        {
          id: "discover-ai",
          type: "yes_no",
          question: "Can Artificial Intelligence contain smaller fields?",
          options: ["Yes", "No"],
          correctIndex: 0,
        },
        {
          id: "discover-ml",
          type: "mcq",
          question: "Machine Learning is:",
          options: ["Bigger than AI", "Part of AI"],
          correctIndex: 1,
        },
        {
          id: "discover-dl",
          type: "mcq",
          question: "Deep Learning is:",
          options: ["Part of AI only", "Part of Machine Learning"],
          correctIndex: 1,
        },
        {
          id: "real-world",
          type: "visual_reveal",
          question: "Which example is NOT Artificial Intelligence?",
          items: [
            { label: "Voice Assistant", icon: "🗣️", category: "ai" },
            { label: "Netflix Recommendations", icon: "🎬", category: "ai" },
            { label: "Spam Filter", icon: "📧", category: "ml" },
            { label: "Face Unlock", icon: "📷", category: "dl" },
            { label: "ChatGPT", icon: "🤖", category: "dl" },
            { label: "Calculator", icon: "🧮", category: "none" },
          ],
        },
        {
          id: "dl-examples",
          type: "multi_select",
          question: "Which examples use Deep Learning?",
          items: [
            { label: "Face Unlock", icon: "📷" },
            { label: "ChatGPT", icon: "🤖" },
            { label: "Voice Recognition", icon: "🎤" },
            { label: "Image Recognition", icon: "🖼️" },
          ],
          correctIndices: [0, 1, 2, 3],
        },
      ],
      finalTree: [
        {
          label: "Artificial Intelligence", icon: "🤖",
          children: [
            { label: "Voice Assistants", icon: "🗣️" },
            { label: "Recommendation Systems", icon: "🎬" },
            {
              label: "Machine Learning", icon: "📊",
              children: [
                { label: "Spam Detection", icon: "📧" },
                { label: "Predictions", icon: "📈" },
                {
                  label: "Deep Learning", icon: "🧠",
                  children: [
                    { label: "Face Unlock", icon: "📷" },
                    { label: "ChatGPT", icon: "🤖" },
                    { label: "Image Recognition", icon: "🖼️" },
                  ],
                },
              ],
            },
          ],
        },
      ],
      nonAIExamples: ["Calculator"],
    },
  },
  "cs50ai_7_deep-learning-cnn": {
    title: "Inside the Vision System",
    learningGoal: "Understand that Neural Networks enable Deep Learning, and Deep Learning powers CNNs for image understanding.",
    challenge: "Discover how Neural Networks, Deep Learning, and CNNs work together to help computers see.",
    promptHint: "Think of Neural Networks as the foundation, Deep Learning as the engine, and CNNs as the specialist for images.",
    validationRules: {
      root: { label: "Neural Network", icon: "🧠" },
      child: { label: "Deep Learning", icon: "⚡" },
      grandchild: { label: "CNN", icon: "👁️" },
      theme: "vision",
      onboarding: [
        "Discover how AI learns visual patterns",
        "See how Deep Learning powers image recognition",
        "Explore how CNNs understand images",
      ],
      completionMessage: "You discovered how Neural Networks enable Deep Learning and how CNNs help computers understand images.",
      steps: [
        {
          id: "discover-ai",
          type: "yes_no",
          question: "Can Neural Networks learn from data?",
          options: ["Yes", "No"],
          correctIndex: 0,
        },
        {
          id: "discover-ml",
          type: "mcq",
          question: "Deep Learning is:",
          options: ["Bigger than Neural Networks", "A type of Neural Network"],
          correctIndex: 1,
        },
        {
          id: "discover-dl",
          type: "mcq",
          question: "CNNs are specialized for:",
          options: ["Understanding images", "Playing chess"],
          correctIndex: 0,
        },
        {
          id: "real-world",
          type: "visual_reveal",
          question: "Which of these uses CNNs?",
          items: [
            { label: "Face Unlock", icon: "📷", category: "dl", explanation: "CNNs learn facial patterns from images." },
            { label: "Photo Tagging", icon: "🏷️", category: "dl", explanation: "CNNs identify people and objects inside photos." },
            { label: "Digit Recognition", icon: "✍️", category: "dl", explanation: "CNNs recognize visual shapes and patterns like handwritten digits." },
            { label: "Medical Scan Detection", icon: "🔬", category: "dl", explanation: "CNNs help detect patterns in X-rays and scans." },
            { label: "Image Search", icon: "🔍", category: "dl", explanation: "CNNs understand image content to find what you're looking for." },
            { label: "Object Detection", icon: "🎯", category: "dl", explanation: "CNNs identify and locate objects in images." },
          ],
        },
        {
          id: "dl-examples",
          type: "multi_select",
          question: "Which tasks use CNNs?",
          items: [
            { label: "Face Unlock", icon: "📷" },
            { label: "Photo Tagging", icon: "🏷️" },
            { label: "Object Detection", icon: "🎯" },
            { label: "Speech Recognition", icon: "🎤" },
          ],
          correctIndices: [0, 1, 2],
        },
      ],
      finalTree: [
        {
          label: "Neural Network", icon: "🧠",
          children: [
            {
              label: "Deep Learning", icon: "⚡",
              children: [
                { label: "Face Unlock", icon: "📷" },
                { label: "Photo Tagging", icon: "🏷️" },
                { label: "Digit Recognition", icon: "✍️" },
                { label: "Medical Scan Detection", icon: "🔬" },
                { label: "Image Search", icon: "🔍" },
                { label: "Object Detection", icon: "🎯" },
              ],
            },
          ],
        },
      ],
      nonAIExamples: [],
    },
  },
};

export async function seedHierarchyExercises() {
  console.log("Seeding hierarchy expand exercises...");

  let created = 0;
  let updated = 0;

  for (const [key, config] of Object.entries(HIERARCHY_EXERCISES)) {
    const { courseId, lectureId, sectionId } = parseKey(key);

    const existing = await prisma.practiceExercise.findFirst({
      where: { courseId, lectureId, sectionId, type: "hierarchy_expand" },
    });

    if (existing) {
      await prisma.practiceExercise.update({
        where: { id: existing.id },
        data: {
          title: config.title,
          learningGoal: config.learningGoal,
          challenge: config.challenge,
          promptHint: config.promptHint,
          validationRules: JSON.parse(JSON.stringify(config.validationRules)),
        },
      });
      updated++;
    } else {
      await prisma.practiceExercise.create({
        data: {
          courseId,
          lectureId,
          sectionId,
          title: config.title,
          type: "hierarchy_expand",
          status: "published",
          learningGoal: config.learningGoal,
          challenge: config.challenge,
          promptHint: config.promptHint,
          validationRules: JSON.parse(JSON.stringify(config.validationRules)),
          completionCriteria: ["All steps completed", "Hierarchy understood"],
          difficulty: "beginner",
          estimatedTime: 8,
          aiWorkspaceEnabled: false,
        },
      });
      created++;
    }
  }

  console.log(`  Created ${created} new, updated ${updated} existing hierarchy exercises.`);
}

// Run directly
const isMain = process.argv[1]?.includes("dragDropExercises");
if (isMain) {
  (async () => {
    await seedDragDropExercises();
    await seedHierarchyExercises();
    console.log("Done.");
    process.exit(0);
  })().catch((err) => { console.error(err); process.exit(1); });
}
