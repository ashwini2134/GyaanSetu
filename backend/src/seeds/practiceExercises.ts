import { prisma } from "../prisma.js";

interface PracticeExerciseConfig {
  title: string;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  successCriteria: string[];
  systemInstruction: string;
}

const PRACTICE_EXERCISES: Record<string, PracticeExerciseConfig> = {
  'fundamentals-of-ai_0': { title: "Introduction to AI", learningGoal: "The difference between AI tools and regular software.", challenge: "Identify which common tools genuinely use AI.", promptHint: "Which student tools use AI versus regular software?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_1': { title: "Search Algorithms", learningGoal: "How AI finds paths and solutions.", challenge: "Explain how navigation apps find the best route.", promptHint: "How do navigation apps search for a path?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_2': { title: "Knowledge & Logic", learningGoal: "How AI uses rules and logic.", challenge: "Create logical IF-THEN rules for a real-world system.", promptHint: "What are some logical IF-THEN rules for a real system?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_3': { title: "Probability & Uncertainty", learningGoal: "The concept of probability and uncertainty in AI.", challenge: "Explain probability and uncertainty in simple terms.", promptHint: "How do you explain probability and uncertainty?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_4': { title: "Optimization", learningGoal: "How AI chooses the best option under constraints.", challenge: "Plan a schedule or route with specific constraints.", promptHint: "How would you plan something with constraints?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_5': { title: "Machine Learning", learningGoal: "How an AI model learns from examples and data.", challenge: "Explain how machine learning models use data to learn.", promptHint: "How does a machine learning model learn from data?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_6': { title: "Neural Networks", learningGoal: "How neural networks process complex information.", challenge: "Explain how inputs combine to produce a prediction.", promptHint: "How do multiple inputs combine in a neural network?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_7': { title: "NLP", learningGoal: "How AI processes and generates human language.", challenge: "Explain NLP to a 5-year-old, and then to a college student.", promptHint: "Can you explain NLP for two different age groups?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_8': { title: "AI Ethics", learningGoal: "The importance of responsible AI usage.", challenge: "Identify real examples where AI caused harm or bias.", promptHint: "What are real examples of AI causing harm or bias?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_9': { title: "Final Project", learningGoal: "Synthesis of core AI course concepts.", challenge: "Compare Minimax search and Neural Networks for playing chess.", promptHint: "Which is better for chess: Minimax or Neural Networks?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_0_what-is-ai': { title: "What is AI", learningGoal: "The difference between traditional programs and AI systems.", challenge: "Classify real-world applications as traditional programming or AI.", promptHint: "Does the application follow rules or learn from data?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_0_ai-ml-dl': { title: "AI vs ML vs DL", learningGoal: "The relationship between AI, Machine Learning, and Deep Learning.", challenge: "Provide examples distinguishing AI, ML, and DL in a smart home.", promptHint: "What is an example of AI, ML, and DL in a smart home?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_0_getting-started': { title: "Getting Started with AI", learningGoal: "How AI algorithms are used in daily life applications.", challenge: "Identify the AI running behind apps like Netflix or TikTok.", promptHint: "What kind of AI runs in the background of Netflix or TikTok?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_1_search-problem': { title: "What is a Search Problem", learningGoal: "The components of a search problem: initial state, actions, and goal state.", challenge: "Define the initial state, actions, and goal state for Tic-Tac-Toe.", promptHint: "What are the states and actions in Tic-Tac-Toe?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_1_bfs-dfs': { title: "BFS and DFS", learningGoal: "The difference in exploration between BFS and DFS.", challenge: "Explain why BFS is better for finding hospitals and DFS for mazes.", promptHint: "Why use BFS for hospitals and DFS for mazes?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_1_getting-started': { title: "Getting Started with Search", learningGoal: "The application of search algorithms in modern navigation.", challenge: "Explain how Google Maps uses A* to find routes efficiently.", promptHint: "How does Google Maps find routes without checking every road?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_2_propositional-logic': { title: "Propositional Logic", learningGoal: "The conversion of English statements into logical propositions.", challenge: "Write an English sentence using strict logical symbols.", promptHint: "How do you write 'If it rains, I get wet' in logic?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_2_knowledge-base': { title: "Knowledge Base and Inference", learningGoal: "The process of inferring facts from a set of known rules.", challenge: "Deduce a new fact from two given statements about birds.", promptHint: "If all birds have feathers and penguins are birds, what can you infer?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_2_getting-started': { title: "Getting Started with Logic", learningGoal: "The use of logical rules to control video game NPCs.", challenge: "Create IF-THEN rules for a video game guard detecting a player.", promptHint: "What are the IF-THEN rules for a guard seeing a player?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_3_prob-basics': { title: "Probability Basics", learningGoal: "The calculation of probabilities for multiple events.", challenge: "Calculate the exact probability of rolling a 4 and flipping Heads.", promptHint: "What is the probability of rolling a 4 and getting Heads?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_3_bayes-theorem': { title: "Conditional Probability and Bayes Theorem", learningGoal: "The way Bayes Theorem updates probability based on evidence.", challenge: "Explain the real probability of having a disease after a positive test.", promptHint: "Why is the probability lower than the test's accuracy?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_3_getting-started': { title: "Getting Started with Probability", learningGoal: "The handling of uncertainty in real-world AI systems.", challenge: "Explain how self-driving cars use probability for uncertain obstacles.", promptHint: "How do cars decide what to do if only 75% sure it's a person?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_4_what-is-optimization': { title: "What is Optimization and Hill Climbing", learningGoal: "The problem of getting stuck in local maxima during optimization.", challenge: "Explain Hill Climbing and why you might get stuck on a smaller hill.", promptHint: "Why might a hiker in fog get stuck on a small hill?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_4_simulated-annealing': { title: "Simulated Annealing and Constraint Satisfaction", learningGoal: "The use of randomness to escape local maxima.", challenge: "Explain why Simulated Annealing sometimes chooses a worse state.", promptHint: "Why would an algorithm choose a worse state instead of climbing?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_4_getting-started': { title: "Getting Started with Optimization", learningGoal: "The solution to complex scheduling via constraint satisfaction.", challenge: "Explain how to schedule classes without double-booking rooms.", promptHint: "How do you schedule 500 classes without double-booking?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_5_supervised-learning': { title: "What is Machine Learning and Supervised Learning", learningGoal: "The training of algorithms using labeled datasets.", challenge: "Explain why AI needs labeled photos to recognize dogs.", promptHint: "Why do you need labeled photos to train an AI on dogs?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_5_reinforcement-learning': { title: "Reinforcement Learning", learningGoal: "The difference between unsupervised and reinforcement learning.", challenge: "Classify AI tasks as Unsupervised or Reinforcement Learning.", promptHint: "Is playing chess unsupervised or reinforcement learning?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_5_overfitting-generalisation': { title: "Overfitting & Generalisation", learningGoal: "The difference between memorising training data and learning general patterns.", challenge: "Explain why a model scoring 100% on training data might fail on new data.", promptHint: "What happens when a model memorises the training data instead of learning the pattern?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_5_classification-regression': { title: "Classification & Regression", learningGoal: "The difference between classification and regression problems.", challenge: "Classify each prediction task as classification or regression.", promptHint: "Does the task predict a category or a number?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_6_neurons-architecture': { title: "What is a Neural Network", learningGoal: "The structure of neural networks and activation functions.", challenge: "Explain activation functions using a nightclub bouncer analogy.", promptHint: "How is an activation function like a bouncer at a club?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_6_activation-functions': { title: "Activation Functions & Forward Pass", learningGoal: "The role of non-linear activation functions in neural networks.", challenge: "Explain why ReLU is preferred over Sigmoid in deep networks.", promptHint: "What problem does ReLU solve that Sigmoid struggles with in deep networks?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_6_deep-learning-cnns': { title: "Deep Learning and CNNs", learningGoal: "The processing of image data through Convolutional Neural Networks.", challenge: "Compare what CNNs detect in early layers versus final layers.", promptHint: "What do early CNN layers detect compared to final layers?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_6_getting-started': { title: "Getting Started with Neural Networks", learningGoal: "The necessity of deep networks for complex modern tasks.", challenge: "Explain why FaceID requires a Deep Neural Network.", promptHint: "Why does FaceID need Deep Learning instead of basic ML?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_7_text-processing': { title: "What is NLP and Tokenization", learningGoal: "The breakdown of text into numerical tokens for processing.", challenge: "Explain how to tokenize a sentence into numbers.", promptHint: "Why does AI need to convert tokens into numbers?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_7_word-embeddings': { title: "Word Embeddings and Large Language Models", learningGoal: "The representation of word semantics as vectors.", challenge: "Explain the math behind King - Man + Woman = Queen.", promptHint: "How do embeddings prove King - Man + Woman = Queen?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_7_language-models': { title: "Language Models", learningGoal: "The predictive nature of Large Language Models.", challenge: "Determine if LLMs are just advanced autocomplete engines.", promptHint: "Are LLMs just advanced autocomplete predicting the next word?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_8_algorithmic-bias': { title: "AI Bias and Privacy", learningGoal: "The embedding of historical human bias into algorithms.", challenge: "Explain how an AI trained on old data becomes biased.", promptHint: "How does training on 1990s hiring data cause AI bias?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_8_hallucinations-deepfakes': { title: "Hallucinations Deepfakes and Accountability", learningGoal: "The reason language models generate false information confidently.", challenge: "Explain why LLMs hallucinate instead of admitting ignorance.", promptHint: "Why do models invent fake facts instead of saying 'I don't know'?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_8_responsible-ai': { title: "Responsible AI", learningGoal: "The complexities of assigning responsibility in AI failures.", challenge: "Determine accountability when a self-driving car crashes.", promptHint: "Who is responsible if a self-driving car causes an accident?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_9_what-you-learned': { title: "What You Have Learned", learningGoal: "The difference between classical search and modern learning AI.", challenge: "Contrast classical AI with modern Deep Learning.", promptHint: "What is the difference between Minimax and Deep Learning?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_9_choosing-project': { title: "Choose Your Project", learningGoal: "The formulation of practical, beginner-friendly AI projects.", challenge: "Request a beginner Machine Learning project for fitness.", promptHint: "What is a good beginner AI project for fitness?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
  'fundamentals-of-ai_9_building-presenting': { title: "Building & Presenting", learningGoal: "The prerequisite skills for building real AI projects.", challenge: "Determine if Calculus is required to start building ML projects.", promptHint: "Do I need Calculus for ML, or just Python and libraries?", successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."], systemInstruction: "You are an AI tutor..." },
};

function parseKey(key: string): { courseId: string; lectureId: string; sectionId: string | null } {
  const parts = key.split("_");
  if (key.startsWith("fundamentals-of-ai")) {
    const courseId = parts[0];
    const lectureId = parts[1];
    const sectionId = parts.slice(2).join("-") || null;
    return { courseId, lectureId, sectionId };
  }
  return { courseId: parts[0], lectureId: parts[1], sectionId: parts.slice(2).join("-") || null };
}

export async function seedPracticeExercises() {
  console.log("Seeding practice exercises...");

  let created = 0;
  let updated = 0;

  for (const [key, config] of Object.entries(PRACTICE_EXERCISES)) {
    const { courseId, lectureId, sectionId } = parseKey(key);

    const existing = await prisma.practiceExercise.findFirst({
      where: { courseId, lectureId, sectionId, type: "ai" },
    });

    if (existing) {
      await prisma.practiceExercise.update({
        where: { id: existing.id },
        data: {
          title: config.title,
          learningGoal: config.learningGoal,
          challenge: config.challenge,
          promptHint: config.promptHint,
          completionCriteria: config.successCriteria,
          suggestedPrompt: config.promptHint,
          aiCompletionRequirements: config.successCriteria,
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
          type: "ai",
          status: "published",
          learningGoal: config.learningGoal,
          challenge: config.challenge,
          promptHint: config.promptHint,
          validationRules: [],
          completionCriteria: config.successCriteria,
          difficulty: "beginner",
          estimatedTime: 10,
          aiWorkspaceEnabled: true,
          suggestedPrompt: config.promptHint,
          aiResponseEvalCriteria: [],
          reflectionRequirements: [],
          aiCompletionRequirements: config.successCriteria,
        },
      });
      created++;
    }
  }

  // Remove orphaned records where sectionId no longer matches any current key
  const validSectionIds = new Set(
    Object.keys(PRACTICE_EXERCISES)
      .filter(k => k.includes('_'))
      .map(k => parseKey(k).sectionId)
      .filter(Boolean) as string[]
  );
  const deleted = await prisma.practiceExercise.deleteMany({
    where: {
      courseId: "fundamentals-of-ai",
      type: "ai",
      sectionId: { not: null },
      NOT: { sectionId: { in: Array.from(validSectionIds) } },
    },
  });

  console.log(`  Created ${created} new, updated ${updated} existing, deleted ${deleted.count} orphaned practice exercises.`);
}

// Run directly
const isMain = process.argv[1]?.includes("practiceExercises");
if (isMain) {
  seedPracticeExercises()
    .then(() => { console.log("Done."); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
