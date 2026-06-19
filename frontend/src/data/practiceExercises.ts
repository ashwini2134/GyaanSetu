export interface PracticeExerciseConfig {
  title: string;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  successCriteria: string[];
  systemInstruction: string;
}

const PRACTICE_EXERCISES: Record<string, PracticeExerciseConfig> = {
  "cs50ai_0": {
    title: "Introduction to AI",
    learningGoal: "Understand what AI is and where it appears in daily life.",
    challenge: "Identify AI tools used by students and understand their purpose.",
    promptHint: "Ask the AI about AI tools that students use. See if it correctly identifies tools that genuinely use AI vs regular software.",
    successCriteria: [
      "You listed at least 3 real AI tools with their purpose.",
      "You understand the difference between a tool that uses AI and one that doesn't.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning what AI is. Answer their question factually in 2-4 short sentences. Only mention tools that genuinely use AI/ML (e.g., Grammarly uses ML for grammar correction). Do not list non-AI tools as AI. Be direct — no paragraphs or extra commentary.",
  },
  "cs50ai_1": {
    title: "Search",
    learningGoal: "Understand how AI finds paths and solutions.",
    challenge: "Ask AI how Google Maps finds the shortest route.",
    promptHint: "Ask the AI to explain how navigation apps find the best route. Focus on the concept of searching for a path.",
    successCriteria: [
      "You understand the concept of a search problem (states, actions, goal).",
      "You can explain how AI explores different paths to find the best one.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning about search algorithms. Answer their question factually in 2-4 short sentences. Use simple examples. Be direct — no paragraphs or extra commentary.",
  },
  "cs50ai_2": {
    title: "Knowledge & Logic",
    learningGoal: "Understand how AI uses rules and logic.",
    challenge: "Create IF-THEN rules for a real-world system.",
    promptHint: "Ask the AI to create logical rules for a real-world system. See if the rules make sense and cover different scenarios.",
    successCriteria: [
      "You created at least 3 logical IF-THEN rules with clear conditions and outcomes.",
      "You can explain how such rules help an AI make decisions.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning about logical rules and knowledge representation. Answer their question factually in 2-4 short sentences. Generate clear IF-THEN rules. Be direct — no paragraphs or extra commentary.",
  },
  "cs50ai_3": {
    title: "Probability & Uncertainty",
    learningGoal: "Understand probability and confidence.",
    challenge: "Explore how AI makes decisions when information is uncertain.",
    promptHint: "Ask the AI about probability and uncertainty. Try asking what a weather forecast percentage actually means.",
    successCriteria: [
      "You understand what a probability percentage actually represents.",
      "You can explain why AI often expresses uncertainty instead of giving a single answer.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning about probability and uncertainty. Answer their question factually in 2-4 short sentences. Use the weather forecast as an example. Be direct — no paragraphs or extra commentary.",
  },
  "cs50ai_4": {
    title: "Optimization",
    learningGoal: "Understand how AI chooses the best option.",
    challenge: "Use AI to find an optimized solution.",
    promptHint: "Ask the AI to plan something with constraints (budget, time). See if it compares options and picks the best one.",
    successCriteria: [
      "You understand how constraints (budget, time) affect the optimal choice.",
      "You can explain how AI compares trade-offs to pick the best option.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning about optimization. Answer their question factually in 2-4 short sentences. Consider trade-offs and constraints. Be direct — no paragraphs or extra commentary.",
  },
  "cs50ai_5": {
    title: "Machine Learning",
    learningGoal: "Understand how AI learns from examples.",
    challenge: "Explore how a machine learning model is trained.",
    promptHint: "Ask the AI to explain how a model learns from data. Ask about training data, features, and how predictions are made.",
    successCriteria: [
      "You understand the role of training data, features, and labels.",
      "You can describe the basic learning loop: data → train → predict → improve.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning about machine learning. Answer their question factually in 2-4 short sentences. Use the spam filter example. Be direct — no paragraphs or extra commentary.",
  },
  "cs50ai_6": {
    title: "Neural Networks",
    learningGoal: "Understand how neural networks process information.",
    challenge: "See how inputs become predictions.",
    promptHint: "Ask the AI to explain how multiple inputs (like attendance and marks) combine to produce a prediction.",
    successCriteria: [
      "You understand the concept of inputs, weights, and outputs in a neural network.",
      "You can explain how multiple factors combine to produce a prediction.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning about neural networks. Answer their question factually in 2-4 short sentences. Use the pass/fail predictor as an example. Be direct — no paragraphs or extra commentary.",
  },
  "cs50ai_7": {
    title: "NLP",
    learningGoal: "Understand how prompts affect AI responses.",
    challenge: "Ask the same question in different ways and compare results.",
    promptHint: "Try asking the AI the same question with different wording or audience. Compare how the responses change.",
    successCriteria: [
      "You observed how changing the audience changes the response.",
      "You understand that prompt specificity improves AI output quality.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning how prompts affect responses. Answer each version of their question. Vary your vocabulary and depth based on the audience they specify. Use 2-4 short sentences each time. No paragraphs.",
  },
  "cs50ai_8": {
    title: "AI Ethics",
    learningGoal: "Understand responsible AI usage.",
    challenge: "Explore real-world AI risks and ethical concerns.",
    promptHint: "Ask the AI about real examples where AI caused harm or bias. Think about who was affected.",
    successCriteria: [
      "You identified a concrete example of AI bias or ethical risk.",
      "You can explain who is affected and why responsible AI development matters.",
    ],
    systemInstruction: "You are an AI tutor. The student is learning about AI ethics. Answer their question factually in 2-4 short sentences. Give a real example of bias or ethical risk. Be direct — no paragraphs or extra commentary.",
  },
};

export function getPracticeExercise(courseSlug: string, lectureId: string): PracticeExerciseConfig | null {
  return PRACTICE_EXERCISES[`${courseSlug}_${lectureId}`] ?? null;
}
