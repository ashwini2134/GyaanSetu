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
    finalTree: any[];
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
      onboarding: [
        "Tap the AI ring to discover what's inside",
        "Machine Learning is a subset of AI — tap to see deeper",
        "Deep Learning is a subset of Machine Learning — explore even further",
        "Finally, classify real-world examples into the right category",
      ],
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

// ── AI Conversation Exercises ────────────────────────────────────────────────────

interface AIConversationSeedConfig {
  title: string;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  validationRules: {
    slides: { title: string; body: string[]; button: string }[];
    missions: { title: string; starter: string }[];
    placeholder: string;
    mentorHints: string[];
    reflectionQuestion: string;
    reflectionOptions: string[];
    completionMessages: string[];
  };
}

const AI_CONVERSATION_EXERCISES: Record<string, AIConversationSeedConfig> = {
  "cs50ai_0_getting-started": {
    title: "AI Conversation Practice",
    learningGoal: "Practice communicating with an AI by crafting clear, specific prompts.",
    challenge: "Ask the AI a thoughtful question about how AI learns, then improve your prompt to get an even better answer.",
    promptHint: "A great prompt is specific, asks one question at a time, and provides context.",
    validationRules: {
      slides: [
        {
          title: "Before You Begin",
          body: [
            "You've already learned:",
            "✓ What Artificial Intelligence is",
            "✓ The difference between AI, ML and Deep Learning",
            "✓ Where AI is used in everyday life",
          ],
          button: "Next →",
        },
        {
          title: "Your Mission",
          body: [
            "You will be given one mission.",
            "Follow the prompt starter below.",
            "After the AI responds, reflect on how you could improve your question.",
            "Then rewrite it and compare.",
          ],
          button: "Next →",
        },
        {
          title: "Discover Something New",
          body: [
            "Ask your question.",
            "Read the answer.",
            "Then improve your question and ask again.",
            "Compare both responses.",
            "Notice how better prompts create better AI answers.",
          ],
          button: "Start Asking →",
        },
      ],
      missions: [
        { title: "Explain Artificial Intelligence to a 10-year-old child.", starter: "Explain AI to a 10-year-old child so that " },
        { title: "Explain Artificial Intelligence using a real-life example.", starter: "Explain AI using a real-life example. For instance, " },
        { title: "Explain Artificial Intelligence in under 100 words.", starter: "Explain AI in under 100 words: " },
        { title: "Explain Artificial Intelligence without using technical words.", starter: "Explain AI without technical jargon. Instead, " },
        { title: "Explain why Netflix recommendations are an example of AI.", starter: "Netflix recommendations are AI because " },
        { title: "Explain how a spam filter learns to identify junk emails.", starter: "A spam filter learns to identify junk emails by " },
        { title: "Explain how Google Maps finds the fastest route.", starter: "Google Maps finds the fastest route by " },
      ],
      placeholder: "Continue writing from where the starter left off...",
      mentorHints: [
        "Good start. Can you make your question more specific?",
        "You never mentioned who the answer is for.",
        "Try asking for a real-world example.",
        "Imagine explaining this to your younger sibling.",
      ],
      reflectionQuestion: "How could your prompt be improved?",
      reflectionOptions: [
        "Add a real-world example",
        "Mention the audience",
        "Ask for simpler language",
        "Limit the answer length",
      ],
      completionMessages: [
        "AI follows instructions.",
        "Better prompts produce better answers.",
        "Small changes in your prompt can greatly improve the result.",
      ],
    },
  },
};

export async function seedAIConversationExercises() {
  console.log("Seeding AI conversation exercises...");

  let created = 0;
  let updated = 0;

  for (const [key, config] of Object.entries(AI_CONVERSATION_EXERCISES)) {
    const { courseId, lectureId, sectionId } = parseKey(key);

    const existing = await prisma.practiceExercise.findFirst({
      where: { courseId, lectureId, sectionId, type: "ai_conversation" },
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
          type: "ai_conversation",
          status: "published",
          learningGoal: config.learningGoal,
          challenge: config.challenge,
          promptHint: config.promptHint,
          validationRules: JSON.parse(JSON.stringify(config.validationRules)),
          completionCriteria: ["Prompt submitted", "Reflection completed"],
          difficulty: "beginner",
          estimatedTime: 10,
          aiWorkspaceEnabled: false,
        },
      });
      created++;
    }
  }

  console.log(`  Created ${created} new, updated ${updated} existing AI conversation exercises.`);
}

// ── Path Builder Exercises ────────────────────────────────────────────────────

interface PathBuilderSeedConfig {
  title: string;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  validationRules: {
    rounds: {
      gridSize: number;
      start: { row: number; col: number };
      goal: { row: number; col: number };
      walls: { row: number; col: number }[];
      optimalPathLength?: number;
      reveal: { startState: string; goalState: string; actions: string; path: string; pathCost: string };
    }[];
    completionMessages: string[];
  };
}

const PATH_BUILDER_EXERCISES: Record<string, PathBuilderSeedConfig> = {
  "cs50ai_1_search-problem": {
    title: "Practice Exercise",
    learningGoal: "Guide a cat to its food by finding a path through a room. Learn what a search problem is.",
    challenge: "Help the cat reach the food bowl. Walls are furniture that cannot be crossed. Find a shorter path on the second round.",
    promptHint: "Click adjacent cells to move the cat. Each click is one step.",
    validationRules: {
      rounds: [
        {
          gridSize: 5,
          start: { row: 0, col: 0 },
          goal: { row: 4, col: 4 },
          walls: [
            { row: 1, col: 1 }, { row: 2, col: 1 },
            { row: 3, col: 2 }, { row: 3, col: 3 },
          ],
          reveal: {
            startState: "Where the cat started.",
            goalState: "Where the food is.",
            actions: "Every step the cat took.",
            path: "The route the cat followed.",
            pathCost: "Number of steps taken.",
          },
        },
        {
          gridSize: 5,
          start: { row: 0, col: 0 },
          goal: { row: 4, col: 4 },
          walls: [
            { row: 1, col: 2 }, { row: 2, col: 1 },
            { row: 2, col: 3 }, { row: 3, col: 4 },
          ],
          optimalPathLength: 8,
          reveal: {
            startState: "Where the cat started.",
            goalState: "Where the food is.",
            actions: "Every step the cat took.",
            path: "The route the cat followed.",
            pathCost: "Number of steps taken.",
          },
        },
      ],
      completionMessages: [
        "Every search begins somewhere.",
        "The destination is the Goal.",
        "Each move is an Action.",
        "Actions together form a Path.",
        "AI prefers shorter paths.",
      ],
    },
  },
};

export async function seedPathBuilderExercises() {
  console.log("Seeding path builder exercises...");

  let created = 0;
  let updated = 0;

  for (const [key, config] of Object.entries(PATH_BUILDER_EXERCISES)) {
    const { courseId, lectureId, sectionId } = parseKey(key);

    const existing = await prisma.practiceExercise.findFirst({
      where: { courseId, lectureId, sectionId, type: "path_builder" },
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
          type: "path_builder",
          status: "published",
          learningGoal: config.learningGoal,
          challenge: config.challenge,
          promptHint: config.promptHint,
          validationRules: JSON.parse(JSON.stringify(config.validationRules)),
          completionCriteria: ["All rounds completed", "Search concepts understood"],
          difficulty: "beginner",
          estimatedTime: 8,
          aiWorkspaceEnabled: false,
        },
      });
      created++;
    }
  }

  console.log(`  Created ${created} new, updated ${updated} existing path builder exercises.`);
}

// ── BFS/DFS Graph Traversal Exercises ─────────────────────────────────────────

interface BFSDFSSeedConfig {
  title: string;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  validationRules: {
    slides: { title: string; body: string[]; button: string }[];
    scenario: string;
    graph: { nodes: { id: string; label: string; x: number; y: number }[]; edges: { from: string; to: string }[]; startNode: string };
    bfsOrder: string[];
    dfsOrder: string[];
    comparison: { bfs: string[]; dfs: string[] };
    reflection: { question: string; options: string[]; correctIndex: number; explanation: string };
    completionMessages: string[];
  };
}

const BFSDFS_EXERCISES: Record<string, BFSDFSSeedConfig> = {
  "cs50ai_1_bfs-dfs": {
    title: "BFS & DFS Exploration",
    learningGoal: "Understand how BFS and DFS explore a graph differently by becoming the algorithm yourself.",
    challenge: "Click nodes in the order each search algorithm would choose.",
    promptHint: "BFS visits every neighbor before going deeper. DFS follows one path to the end.",
    validationRules: {
      slides: [
        {
          title: "Mission",
          body: [
            "Today you will become a search algorithm.",
            "Instead of reading how BFS and DFS work, you will make the same decisions they make.",
            "By the end of this exercise you will understand:",
            "- Why BFS finds the shortest path.",
            "- Why DFS goes deep before backtracking.",
          ],
          button: "Next \u2192",
        },
        {
          title: "How to Play",
          body: [
            "You will see a graph.",
            "Your job is to click the nodes in the order that the algorithm would visit them.",
            "Click only one node at a time.",
            "If your choice is correct, the algorithm continues.",
            "If your choice is incorrect, the exercise pauses and explains why before letting you try again.",
          ],
          button: "Next \u2192",
        },
        {
          title: "Think Like the Algorithm",
          body: [
            "Before every challenge ask yourself:",
            '"What would BFS do next?"',
            'or',
            '"What would DFS do next?"',
            "Don't guess.",
            "Think about the rule each algorithm follows.",
          ],
          button: "Start Challenge \u2192",
        },
      ],
      scenario: "A rescue robot enters a building. It must inspect every room.",
      graph: {
        nodes: [
          { id: "A", label: "A", x: 170, y: 40 },
          { id: "B", label: "B", x: 80, y: 120 },
          { id: "C", label: "C", x: 260, y: 120 },
          { id: "D", label: "D", x: 40, y: 200 },
          { id: "E", label: "E", x: 120, y: 200 },
          { id: "F", label: "F", x: 260, y: 200 },
        ],
        edges: [
          { from: "A", to: "B" },
          { from: "A", to: "C" },
          { from: "B", to: "D" },
          { from: "B", to: "E" },
          { from: "C", to: "F" },
        ],
        startNode: "A",
      },
      bfsOrder: ["A", "B", "C", "D", "E", "F"],
      dfsOrder: ["A", "B", "D", "E", "C", "F"],
      comparison: {
        bfs: [
          "Visits neighbors first",
          "Uses Queue",
          "Finds shortest path",
          "Uses more memory",
        ],
        dfs: [
          "Goes deep first",
          "Uses Stack",
          "May not find shortest path",
          "Uses less memory",
        ],
      },
      reflection: {
        question: "Imagine Google Maps needs the shortest route between two places. Which algorithm is the better choice?",
        options: ["BFS", "DFS"],
        correctIndex: 0,
        explanation: "BFS guarantees finding the shortest path in an unweighted graph because it explores all nearby routes before going deeper.",
      },
      completionMessages: [
        "Today you discovered that different search algorithms think differently.",
        "BFS explores widely. DFS explores deeply.",
        "In the next lesson you will learn how AI makes smarter choices than simply exploring every path.",
      ],
    },
  },
};

export async function seedBFSDFSExercises() {
  console.log("Seeding BFS/DFS graph traversal exercises...");

  let created = 0;
  let updated = 0;

  for (const [key, config] of Object.entries(BFSDFS_EXERCISES)) {
    const { courseId, lectureId, sectionId } = parseKey(key);

    const existing = await prisma.practiceExercise.findFirst({
      where: { courseId, lectureId, sectionId, type: "bfs_dfs" },
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
          type: "bfs_dfs",
          status: "published",
          learningGoal: config.learningGoal,
          challenge: config.challenge,
          promptHint: config.promptHint,
          validationRules: JSON.parse(JSON.stringify(config.validationRules)),
          completionCriteria: ["BFS completed", "DFS completed", "Reflection answered"],
          difficulty: "beginner",
          estimatedTime: 10,
          aiWorkspaceEnabled: false,
        },
      });
      created++;
    }
  }

  console.log(`  Created ${created} new, updated ${updated} existing BFS/DFS exercises.`);
}

// Run directly
const isMain = process.argv[1]?.includes("dragDropExercises");
if (isMain) {
  (async () => {
    await seedDragDropExercises();
    await seedHierarchyExercises();
    await seedAIConversationExercises();
    await seedPathBuilderExercises();
    await seedBFSDFSExercises();
    console.log("Done.");
    process.exit(0);
  })().catch((err) => { console.error(err); process.exit(1); });
}
