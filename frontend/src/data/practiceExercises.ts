// IMPORTANT: This file is strict TypeScript. 
// Every object entry must be separated by a comma.
// The last entry in any object or array must NOT have a trailing comma.
// Validate syntax before saving.

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
  'cs50ai_0_what-is-ai': {
    title: "Classify Daily Tech",
    learningGoal: "Distinguish between rule-based software and true AI.",
    challenge: "Think of an app you use daily. Ask the AI if its core feature relies on Artificial Intelligence or hardcoded rules.",
    promptHint: "Try asking: 'Does the calculator app use AI?' or 'Does Spotify Discover Weekly use AI?'",
    successCriteria: ["You identified one rule-based app and one AI-driven app."],
    systemInstruction: "You are an AI tutor. The student is asking if a specific app feature uses AI. Briefly explain if it uses ML/AI (and why) or if it's just rule-based logic. Keep it to 2-3 short sentences. Be direct and conversational."
  },
  'cs50ai_0_ai-ml-dl': {
    title: "AI vs ML vs DL Break Down",
    learningGoal: "Understand the nested relationship between AI, ML, and DL.",
    challenge: "Give the AI a real-world task (like 'recognizing voices') and ask it to categorize the task into AI, ML, or DL.",
    promptHint: "Try asking: 'Which category does self-driving car vision fall into: AI, ML, or Deep Learning?'",
    successCriteria: ["You can correctly place a technology into the AI, ML, or DL umbrella."],
    systemInstruction: "You are an AI tutor. The student will give you a tech task. Briefly categorize it as AI, ML, or Deep Learning (be as specific as possible) and explain why in 2 short sentences."
  },
  'cs50ai_0_getting-started': {
    title: "Spot the AI Around You",
    learningGoal: "Recognize AI in your immediate environment.",
    challenge: "Look around your room. Ask the AI if any object you see contains hidden AI capabilities.",
    promptHint: "Try asking: 'Is there any AI inside my smart thermostat or my TV remote?'",
    successCriteria: ["You discovered an unexpected AI application in a common device."],
    systemInstruction: "You are an AI tutor. The student is asking about an object in their room. Briefly explain if and how it might use AI. Keep it to 2-3 short sentences. Be fun and curious."
  },
  'cs50ai_1_search-problem': {
    title: "Define Your Own Search Problem",
    learningGoal: "Identify the components of a search problem (state, actions, goal).",
    challenge: "Pick a puzzle like Sudoku or a maze. Ask the AI to define its 'initial state' and 'goal state'.",
    promptHint: "Try asking: 'If I am solving a Rubik cube, what are the states and the goal?'",
    successCriteria: ["You understand how real puzzles translate to search algorithms."],
    systemInstruction: "You are an AI tutor. The student asks about a puzzle/game. Briefly define its initial state, actions, and goal state in search problem terms. 3 short sentences max."
  },
  'cs50ai_1_bfs-dfs': {
    title: "BFS vs DFS Showdown",
    learningGoal: "Understand the trade-offs between Breadth-First and Depth-First Search.",
    challenge: "Ask the AI which search strategy is better for finding a needle in a haystack vs finding the shortest path out of a maze.",
    promptHint: "Try asking: 'Should I use BFS or DFS to find the shortest driving route?'",
    successCriteria: ["You learned when to apply BFS and when to apply DFS."],
    systemInstruction: "You are an AI tutor. The student asks about BFS vs DFS for a specific scenario. Give a direct recommendation and briefly explain why based on space complexity or optimality. 2-3 sentences."
  },
  'cs50ai_1_getting-started': {
    title: "Search Algorithms in Action",
    learningGoal: "Connect search algorithms to everyday navigation.",
    challenge: "Ask the AI how your GPS app uses search algorithms to get you home during rush hour.",
    promptHint: "Try asking: 'Does Google Maps use BFS to find the fastest route?'",
    successCriteria: ["You understand how search applies to modern routing."],
    systemInstruction: "You are an AI tutor. Briefly explain how GPS apps use informed search (like A*) rather than blind BFS/DFS to find fast routes. 2-3 short sentences."
  },
  'cs50ai_2_propositional-logic': {
    title: "Translating Logic",
    learningGoal: "Convert English sentences into logical propositions.",
    challenge: "Give the AI a sentence like 'If it rains, I take an umbrella' and ask it to write the propositional logic.",
    promptHint: "Try asking: 'How do I write \\\"If it is sunny and I have money, I will buy ice cream\\\" in logic?'",
    successCriteria: ["You saw how human language maps to logical symbols."],
    systemInstruction: "You are an AI tutor. Translate the student's English sentence into propositional logic symbols (e.g., P ^ Q => R). Briefly define the variables. 2-3 short sentences."
  },
  'cs50ai_2_knowledge-base': {
    title: "Sherlock Holmes Inference",
    learningGoal: "Understand how a knowledge base infers new facts.",
    challenge: "Give the AI two facts (e.g., 'All humans are mortal' and 'Socrates is human') and ask what it can infer.",
    promptHint: "Try asking: 'If A implies B, and B implies C, and A is true, what else is true?'",
    successCriteria: ["You successfully used facts to derive a new conclusion."],
    systemInstruction: "You are an AI tutor. Look at the facts the student provides and state the logical inference. Briefly explain the deduction. Keep it under 3 sentences."
  },
  'cs50ai_2_getting-started': {
    title: "Logic in Video Games",
    learningGoal: "See how game AI uses logic and knowledge bases.",
    challenge: "Ask the AI how an enemy NPC in a stealth game uses a knowledge base to decide whether to attack or hide.",
    promptHint: "Try asking: 'What rules does a Skyrim guard use to decide if they should attack me?'",
    successCriteria: ["You learned how logic rules govern simple AI agents."],
    systemInstruction: "You are an AI tutor. Explain how game NPCs use simple 'IF-THEN' rules or state machines (knowledge bases) to react to the player. 2-3 short sentences."
  },
  'cs50ai_3_prob-basics': {
    title: "Coin Flips and Weather",
    learningGoal: "Grasp basic probability concepts in AI.",
    challenge: "Ask the AI to calculate a simple probability based on an everyday event.",
    promptHint: "Try asking: 'If there's a 30% chance of rain and 20% chance of snow, what is the chance of either happening?'",
    successCriteria: ["You practiced calculating basic probabilities."],
    systemInstruction: "You are an AI tutor. Answer the student's probability question directly. Provide the brief math logic behind the answer. 2-3 sentences max."
  },
  'cs50ai_3_bayes-theorem': {
    title: "Medical Diagnoses and Bayes",
    learningGoal: "Understand Bayes Theorem through real-world scenarios.",
    challenge: "Ask the AI why a rare disease test being 99% accurate doesn't mean you have a 99% chance of being sick if you test positive.",
    promptHint: "Try asking: 'Can you explain the base rate fallacy using Bayes Theorem?'",
    successCriteria: ["You understood how prior probabilities affect outcomes."],
    systemInstruction: "You are an AI tutor. Briefly explain Bayes Theorem or the base rate fallacy using the student's example. Keep it intuitive and under 4 sentences."
  },
  'cs50ai_3_getting-started': {
    title: "Uncertainty in Self-Driving",
    learningGoal: "Recognize how AI handles unpredictable real-world data.",
    challenge: "Ask the AI how a self-driving car uses probability when it sees a blurry stop sign.",
    promptHint: "Try asking: 'If a self-driving car is only 80% sure it sees a pedestrian, what does it do?'",
    successCriteria: ["You learned how AI acts under uncertainty."],
    systemInstruction: "You are an AI tutor. Briefly explain how autonomous systems use probability thresholds to make safe decisions when sensor data is noisy. 2-3 short sentences."
  },
  'cs50ai_4_what-is-optimization': {
    title: "Climbing the Hill",
    learningGoal: "Understand local vs global maxima in optimization.",
    challenge: "Ask the AI to explain the 'local maximum' problem using an analogy of climbing a mountain in the fog.",
    promptHint: "Try asking: 'Why does Hill Climbing sometimes fail to find the highest peak?'",
    successCriteria: ["You understood the limitations of basic optimization algorithms."],
    systemInstruction: "You are an AI tutor. Explain the concept of a 'local maximum' using a simple real-world analogy. Keep it under 3 sentences."
  },
  'cs50ai_4_simulated-annealing': {
    title: "Cooling Down the Search",
    learningGoal: "Grasp how simulated annealing avoids local maxima.",
    challenge: "Ask the AI why simulated annealing sometimes intentionally makes a 'bad' move.",
    promptHint: "Try asking: 'Why would an optimization algorithm ever choose a worse state on purpose?'",
    successCriteria: ["You learned how randomness helps find better global solutions."],
    systemInstruction: "You are an AI tutor. Briefly explain how accepting worse states early in simulated annealing helps the algorithm escape local maxima. 2-3 sentences max."
  },
  'cs50ai_4_getting-started': {
    title: "Scheduling Optimization",
    learningGoal: "See optimization applied to constraint satisfaction.",
    challenge: "Ask the AI how optimization algorithms are used to generate your school or university timetable.",
    promptHint: "Try asking: 'How does constraint satisfaction help a school schedule 100 classes without conflicts?'",
    successCriteria: ["You connected optimization to real-world scheduling problems."],
    systemInstruction: "You are an AI tutor. Briefly explain how scheduling is a constraint satisfaction problem (CSP) where variables (classes) must meet constraints (rooms/times). 2-3 short sentences."
  },
  'cs50ai_5_what-is-ml': {
    title: "Supervising the Machine",
    learningGoal: "Understand supervised learning and labeled data.",
    challenge: "Ask the AI what 'labeled data' means in the context of training a spam filter.",
    promptHint: "Try asking: 'How do you train an AI to recognize a cat using supervised learning?'",
    successCriteria: ["You grasped the concept of training with inputs and known outputs."],
    systemInstruction: "You are an AI tutor. Briefly define supervised learning and labeled data using the student's example. Keep it under 3 sentences."
  },
  'cs50ai_5_unsupervised-rl': {
    title: "Grouping vs Rewarding",
    learningGoal: "Differentiate unsupervised learning from reinforcement learning.",
    challenge: "Ask the AI which learning method Netflix uses to group similar movies, and which method an AI uses to learn Mario.",
    promptHint: "Try asking: 'Is a recommendation engine unsupervised learning or reinforcement learning?'",
    successCriteria: ["You can correctly identify clustering vs reward-based learning."],
    systemInstruction: "You are an AI tutor. Briefly differentiate unsupervised learning (finding patterns/clusters) from reinforcement learning (maximizing rewards). 2-3 short sentences."
  },
  'cs50ai_5_getting-started': {
    title: "ML in Your Inbox",
    learningGoal: "Identify ML algorithms running in daily apps.",
    challenge: "Ask the AI how your email provider uses different types of machine learning to sort your inbox.",
    promptHint: "Try asking: 'Does Gmail use supervised or unsupervised learning to sort my promotions tab?'",
    successCriteria: ["You connected ML theory to real application features."],
    systemInstruction: "You are an AI tutor. Briefly explain how email clients use supervised learning for spam, and maybe unsupervised for smart grouping. Keep it concise. 2-3 sentences."
  },
  'cs50ai_6_what-is-nn': {
    title: "Inside the Artificial Brain",
    learningGoal: "Understand weights, biases, and activation functions.",
    challenge: "Ask the AI to explain what an 'activation function' is using an analogy of a light switch or a bouncer at a club.",
    promptHint: "Try asking: 'Why do neural networks need activation functions?'",
    successCriteria: ["You learned why non-linearity is crucial for neural networks."],
    systemInstruction: "You are an AI tutor. Briefly explain activation functions using a simple, intuitive analogy. Keep it under 3 sentences."
  },
  'cs50ai_6_deep-learning-cnns': {
    title: "How AI Sees Images",
    learningGoal: "Understand how Convolutional Neural Networks process pixels.",
    challenge: "Ask the AI why a CNN is better at recognizing a dog in a photo than a standard feed-forward neural network.",
    promptHint: "Try asking: 'How does a CNN use filters to detect edges in a picture?'",
    successCriteria: ["You grasped the concept of spatial features and convolutions."],
    systemInstruction: "You are an AI tutor. Briefly explain how CNNs use spatial filters to detect edges, shapes, and patterns, making them ideal for images. 2-3 short sentences."
  },
  'cs50ai_6_getting-started': {
    title: "Deep Learning Everywhere",
    learningGoal: "Recognize deep learning use cases.",
    challenge: "Ask the AI to list two everyday applications that rely specifically on Deep Learning rather than basic ML.",
    promptHint: "Try asking: 'Does FaceID on my phone use Deep Learning?'",
    successCriteria: ["You can identify applications that require deep neural networks."],
    systemInstruction: "You are an AI tutor. Name two everyday apps (like FaceID or Voice Assistants) that use Deep Learning and briefly state why they need it over basic ML. 2-3 sentences."
  },
  'cs50ai_7_what-is-nlp': {
    title: "Talking to Machines",
    learningGoal: "Understand tokenization and language processing.",
    challenge: "Ask the AI how it 'tokenizes' the sentence: 'I love AI!'",
    promptHint: "Try asking: 'Do you read words, or do you convert words into numbers first?'",
    successCriteria: ["You learned how text is prepared for machine learning."],
    systemInstruction: "You are an AI tutor. Briefly explain how NLP models break text into tokens (words or subwords) and convert them to numbers. Give a quick example. 2-3 sentences."
  },
  'cs50ai_7_word-embeddings': {
    title: "Math with Words",
    learningGoal: "Grasp how word embeddings capture meaning.",
    challenge: "Ask the AI to explain the famous equation: King - Man + Woman = Queen.",
    promptHint: "Try asking: 'How do word vectors know that Paris is to France as Tokyo is to Japan?'",
    successCriteria: ["You understood how meaning is represented as vectors in space."],
    systemInstruction: "You are an AI tutor. Briefly explain how word embeddings represent words as coordinates, allowing math to capture semantic relationships. Keep it under 3 sentences."
  },
  'cs50ai_7_getting-started': {
    title: "The Magic of LLMs",
    learningGoal: "Connect NLP theory to modern Large Language Models.",
    challenge: "Ask the AI how models like ChatGPT predict the next word in a sentence.",
    promptHint: "Try asking: 'Are you just basically a giant autocomplete engine?'",
    successCriteria: ["You learned the core predictive mechanism of LLMs."],
    systemInstruction: "You are an AI tutor. Briefly confirm that LLMs predict the next token based on context, much like a highly advanced autocomplete. Keep it conversational. 2-3 sentences."
  },
  'cs50ai_8_ai-bias': {
    title: "Uncovering Algorithmic Bias",
    learningGoal: "Understand how training data introduces bias.",
    challenge: "Ask the AI how a resume-screening algorithm could accidentally become biased against female applicants.",
    promptHint: "Try asking: 'If an AI is trained on historical hiring data, how does it learn bias?'",
    successCriteria: ["You understood the phrase 'garbage in, garbage out' in AI ethics."],
    systemInstruction: "You are an AI tutor. Briefly explain how AI learns historical biases present in its training data. Use the resume-screening example. Keep it under 3 sentences."
  },
  'cs50ai_8_hallucinations-deepfakes': {
    title: "When AI Lies",
    learningGoal: "Recognize AI hallucinations and generated media.",
    challenge: "Ask the AI why Large Language Models sometimes confidently invent fake facts (hallucinate).",
    promptHint: "Try asking: 'Why do you sometimes make up answers instead of saying \\\"I don't know\\\"?'",
    successCriteria: ["You learned the limitations of LLM factuality."],
    systemInstruction: "You are an AI tutor. Briefly explain that LLMs predict plausible-sounding text, not verified facts, which can lead to hallucinations. Keep it concise. 2-3 sentences."
  },
  'cs50ai_8_getting-started': {
    title: "Responsible AI in Practice",
    learningGoal: "Consider accountability in AI deployment.",
    challenge: "Ask the AI who is legally or morally responsible if a self-driving car gets into an accident.",
    promptHint: "Try asking: 'If an AI makes a mistake, is it the programmer fault or the AI fault?'",
    successCriteria: ["You explored the complex issue of AI accountability."],
    systemInstruction: "You are an AI tutor. Briefly highlight the ongoing debate around AI accountability (driver, manufacturer, or software developer). Do not take a definitive legal stance. 2-3 sentences."
  },
  'cs50ai_9_what-learned': {
    title: "Reflecting on the Journey",
    learningGoal: "Synthesize the core concepts of the AI course.",
    challenge: "Ask the AI to summarize the biggest difference between classical search algorithms (Lecture 1) and neural networks (Lecture 6).",
    promptHint: "Try asking: 'Which is better for playing chess: Minimax search or a Neural Network?'",
    successCriteria: ["You successfully contrasted two major eras of AI."],
    systemInstruction: "You are an AI tutor. Briefly contrast classical search (rules/logic) with neural networks (learning from data/patterns). Keep it under 3 sentences."
  },
  'cs50ai_9_choose-project': {
    title: "Project Brainstorming",
    learningGoal: "Apply AI concepts to a practical project idea.",
    challenge: "Tell the AI about a hobby you have, and ask it to suggest a simple AI project related to that hobby.",
    promptHint: "Try asking: 'I love playing guitar. What is a beginner AI project I could build for that?'",
    successCriteria: ["You received a personalized, actionable project idea."],
    systemInstruction: "You are an AI tutor. The student will share a hobby. Suggest one simple, realistic AI/ML project they could build related to it. Be encouraging. 2-3 sentences."
  },
  'cs50ai_9_getting-started': {
    title: "Your Future in AI",
    learningGoal: "Identify next steps for learning AI.",
    challenge: "Ask the AI what programming language or math topic you should study next to get better at building AI.",
    promptHint: "Try asking: 'Do I need to learn Calculus to build AI, or just Python?'",
    successCriteria: ["You gained clarity on the skills needed to advance in AI."],
    systemInstruction: "You are an AI tutor. Briefly recommend learning Python and basic linear algebra/statistics for practical AI, assuring them that high-level math isn't strictly required for beginners. 2-3 sentences."
  },
};

export function getPracticeExercise(courseSlug: string, lectureId: string, sectionId?: string): PracticeExerciseConfig | null {
  if (sectionId && PRACTICE_EXERCISES[`${courseSlug}_${lectureId}_${sectionId}`]) {
    return PRACTICE_EXERCISES[`${courseSlug}_${lectureId}_${sectionId}`];
  }
  return PRACTICE_EXERCISES[`${courseSlug}_${lectureId}`] ?? null;
}
