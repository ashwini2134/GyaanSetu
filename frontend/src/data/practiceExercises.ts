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
    title: "What is AI",
    learningGoal: "Understand the difference between traditional programming and Artificial Intelligence",
    challenge: "Ask the AI to compare how a traditional calculator works versus how a spam filter works",
    promptHint: "Try asking — 'Can you explain the difference between a rule-based calculator and an AI spam filter?'",
    successCriteria: ["You understand the difference between hardcoded rules and learning from data."],
    systemInstruction: "You are an AI tutor. Briefly explain the difference between a calculator (rules) and a spam filter (learning). Keep it under 3 sentences."
  },
  'cs50ai_0_ai-ml-dl': {
    title: "AI vs ML vs DL",
    learningGoal: "Understand how Artificial Intelligence, Machine Learning, and Deep Learning relate to each other",
    challenge: "Ask the AI to give a real-life example that clearly shows the difference between AI, ML, and DL",
    promptHint: "Try asking — 'Give me an example of a smart home feature that is AI, one that is ML, and one that is Deep Learning.'",
    successCriteria: ["You can distinguish between AI, ML, and DL using a concrete example."],
    systemInstruction: "You are an AI tutor. Give a smart home example distinguishing AI, ML, and DL. Keep it to 3 short sentences."
  },
  'cs50ai_0_getting-started': {
    title: "Getting Started with AI",
    learningGoal: "Identify how Artificial Intelligence is already being used in your daily life",
    challenge: "Ask the AI to explain the hidden AI running behind a specific app or device you use every day",
    promptHint: "Try asking — 'What kind of AI runs in the background when I use Netflix or TikTok?'",
    successCriteria: ["You discovered real AI applications in your daily routine."],
    systemInstruction: "You are an AI tutor. Briefly explain the recommendation algorithms used in apps like Netflix/TikTok. 2-3 short sentences."
  },
  'cs50ai_1_search-problem': {
    title: "What is a Search Problem",
    learningGoal: "Understand the core components of a search problem: initial state, actions, and goal state",
    challenge: "Ask the AI to break down a simple game like Tic-Tac-Toe into the three components of a search problem",
    promptHint: "Try asking — 'If I am playing Tic-Tac-Toe, what is the initial state, what are the actions, and what is the goal state?'",
    successCriteria: ["You understand how to frame a real game as a search problem."],
    systemInstruction: "You are an AI tutor. Briefly define the initial state, actions, and goal state for Tic-Tac-Toe. Keep it under 3 sentences."
  },
  'cs50ai_1_bfs-dfs': {
    title: "BFS and DFS",
    learningGoal: "Understand the difference in how Breadth-First Search and Depth-First Search explore paths",
    challenge: "Ask the AI to explain which search algorithm you would use to find the nearest hospital versus exploring a deep cave",
    promptHint: "Try asking — 'Why is Breadth-First Search better for finding a nearby hospital, but Depth-First Search might be used for exploring a maze?'",
    successCriteria: ["You understand when to apply BFS vs DFS based on the goal."],
    systemInstruction: "You are an AI tutor. Explain that BFS finds the shallowest/closest goal (hospital) while DFS dives deep down one path (maze). 3 short sentences."
  },
  'cs50ai_1_getting-started': {
    title: "Getting Started with Search",
    learningGoal: "Understand how search algorithms are applied in modern navigation technology",
    challenge: "Ask the AI to explain how a GPS app avoids checking every single road when finding the fastest route to your destination",
    promptHint: "Try asking — 'How does Google Maps use informed search algorithms like A* to find my route quickly without checking every road?'",
    successCriteria: ["You learned how heuristics make search algorithms efficient in the real world."],
    systemInstruction: "You are an AI tutor. Briefly explain how GPS apps use heuristics (informed search) to guess the right direction rather than blind search. 2-3 sentences."
  },
  'cs50ai_2_propositional-logic': {
    title: "Propositional Logic",
    learningGoal: "Understand how to convert everyday English statements into strict logical propositions",
    challenge: "Give the AI a conditional sentence about the weather and ask it to translate it into propositional logic symbols",
    promptHint: "Try asking — 'How do I write the sentence \"If it is raining and I go outside, then I will get wet\" using logical symbols?'",
    successCriteria: ["You learned how human language maps to logical variables and connectors."],
    systemInstruction: "You are an AI tutor. Translate the student's sentence into propositional logic (e.g., P ^ Q => R) and define the variables. 2-3 sentences."
  },
  'cs50ai_2_knowledge-base': {
    title: "Knowledge Base and Inference",
    learningGoal: "Understand how an AI can infer new facts from a set of known rules in its knowledge base",
    challenge: "Give the AI two simple facts and ask it to use inference to tell you a third fact that must be true",
    promptHint: "Try asking — 'My knowledge base says: 1) All birds have feathers. 2) A penguin is a bird. What can you infer from this?'",
    successCriteria: ["You saw how AI derives new information using logical deduction."],
    systemInstruction: "You are an AI tutor. State the logical inference (the penguin has feathers) and briefly explain the deduction process. 2-3 sentences."
  },
  'cs50ai_2_getting-started': {
    title: "Getting Started with Logic",
    learningGoal: "Understand how logical rules are used to control non-player characters in video games",
    challenge: "Ask the AI to write a simple knowledge base of IF-THEN rules for a stealth game enemy",
    promptHint: "Try asking — 'What would the logical IF-THEN rules look like for a video game guard who sees the player?'",
    successCriteria: ["You connected formal logic to game development concepts."],
    systemInstruction: "You are an AI tutor. Provide 2-3 simple IF-THEN rules for a game guard (e.g., IF see player THEN attack). Keep it short and engaging."
  },
  'cs50ai_3_prob-basics': {
    title: "Probability Basics",
    learningGoal: "Understand how to calculate basic probabilities for multiple events occurring",
    challenge: "Ask the AI to explain the probability of rolling a specific number on a die and flipping a specific side of a coin at the same time",
    promptHint: "Try asking — 'If I roll a 6-sided die and flip a coin, what is the exact probability I get a 4 and a Heads?'",
    successCriteria: ["You practiced calculating joint probabilities."],
    systemInstruction: "You are an AI tutor. Answer the math question directly (1/6 * 1/2 = 1/12) and briefly explain the multiplication rule. 2-3 sentences."
  },
  'cs50ai_3_bayes-theorem': {
    title: "Conditional Probability and Bayes Theorem",
    learningGoal: "Understand how Bayes Theorem updates probability based on new evidence",
    challenge: "Ask the AI to walk you through a real life example of Bayes Theorem such as a medical test result and calculate the probability step by step",
    promptHint: "Try asking — 'If a disease affects 1 in 1000 people and a test is 99 percent accurate, what is the probability I actually have the disease if I test positive?'",
    successCriteria: ["You understood how prior probabilities heavily affect conditional outcomes."],
    systemInstruction: "You are an AI tutor. Briefly explain the base rate fallacy using their medical test example. Explain why the probability is lower than 99%. 3-4 sentences."
  },
  'cs50ai_3_getting-started': {
    title: "Getting Started with Probability",
    learningGoal: "Understand how AI systems handle uncertainty in messy, real-world environments",
    challenge: "Ask the AI how self-driving cars use probability thresholds to decide whether to brake or keep driving when sensor data is unclear",
    promptHint: "Try asking — 'If a self-driving car camera is only 75% sure the object ahead is a person, how does it use probability to decide what to do?'",
    successCriteria: ["You learned how probability drives safe decision making in autonomous systems."],
    systemInstruction: "You are an AI tutor. Explain how autonomous systems weigh the probability of a risk against the cost of a mistake to make safe decisions. 2-3 sentences."
  },
  'cs50ai_4_what-is-optimization': {
    title: "What is Optimization and Hill Climbing",
    learningGoal: "Understand the goal of optimization algorithms and the problem of getting stuck in local maxima",
    challenge: "Ask the AI to explain the concept of a 'local maximum' using an analogy of a hiker trying to reach the highest peak in thick fog",
    promptHint: "Try asking — 'How does the Hill Climbing algorithm work, and why might a hiker in the fog get stuck on a smaller hill instead of the true summit?'",
    successCriteria: ["You grasped the limitation of greedy optimization algorithms."],
    systemInstruction: "You are an AI tutor. Explain Hill Climbing and the local maximum problem using the hiker in the fog analogy. Keep it under 3 sentences."
  },
  'cs50ai_4_simulated-annealing': {
    title: "Simulated Annealing and Constraint Satisfaction",
    learningGoal: "Understand how simulated annealing uses randomness to escape local maxima",
    challenge: "Ask the AI why an optimization algorithm would ever intentionally make a 'bad' move that lowers its score",
    promptHint: "Try asking — 'In Simulated Annealing, why is the algorithm sometimes programmed to choose a worse state instead of always climbing higher?'",
    successCriteria: ["You learned how controlled randomness leads to better overall solutions."],
    systemInstruction: "You are an AI tutor. Explain how accepting worse states early on allows the algorithm to escape local maxima and find the global maximum. 2-3 sentences."
  },
  'cs50ai_4_getting-started': {
    title: "Getting Started with Optimization",
    learningGoal: "Understand how optimization and constraint satisfaction are used to solve complex scheduling problems",
    challenge: "Ask the AI to explain how a university uses constraint satisfaction algorithms to create a master schedule without conflicts",
    promptHint: "Try asking — 'How does an AI use constraint satisfaction to schedule 500 college classes without double-booking any rooms or professors?'",
    successCriteria: ["You connected abstract constraint satisfaction to real-world logistics."],
    systemInstruction: "You are an AI tutor. Briefly explain how variables (classes) must be assigned values (times/rooms) without violating constraints (double-booking). 2-3 sentences."
  },
  'cs50ai_5_what-is-ml': {
    title: "What is Machine Learning and Supervised Learning",
    learningGoal: "Understand how supervised learning algorithms are trained using labeled datasets",
    challenge: "Ask the AI to explain the role of 'labels' in supervised learning using an image classification example",
    promptHint: "Try asking — 'If I want to train an AI to recognize dogs, why do I need a dataset of labeled photos, and how does the AI use them?'",
    successCriteria: ["You learned how algorithms map inputs to known outputs during training."],
    systemInstruction: "You are an AI tutor. Explain that labeled photos act as the 'answer key' allowing the model to learn the patterns of a dog. 2-3 sentences."
  },
  'cs50ai_5_unsupervised-rl': {
    title: "Unsupervised and Reinforcement Learning",
    learningGoal: "Understand the difference between finding hidden patterns (Unsupervised) and learning through rewards (Reinforcement)",
    challenge: "Ask the AI to categorize two different AI tasks into either Unsupervised Learning or Reinforcement Learning",
    promptHint: "Try asking — 'Is a chess-playing AI an example of Unsupervised Learning or Reinforcement Learning? What about an AI that groups shoppers by buying habits?'",
    successCriteria: ["You can correctly identify the learning paradigm based on the task structure."],
    systemInstruction: "You are an AI tutor. Confirm chess is Reinforcement Learning (rewards) and shopper grouping is Unsupervised Learning (clustering). Keep it to 2-3 sentences."
  },
  'cs50ai_5_getting-started': {
    title: "Getting Started with Machine Learning",
    learningGoal: "Understand how Machine Learning algorithms power features in everyday applications",
    challenge: "Ask the AI to explain which specific type of machine learning is used to filter out spam emails in your inbox",
    promptHint: "Try asking — 'Does a spam filter use Supervised Learning, Unsupervised Learning, or Reinforcement Learning to catch junk mail?'",
    successCriteria: ["You connected ML theory to a concrete software feature."],
    systemInstruction: "You are an AI tutor. Explain that spam filters use Supervised Learning because they are trained on examples of emails explicitly labeled as spam or not spam. 2 sentences."
  },
  'cs50ai_6_what-is-nn': {
    title: "What is a Neural Network",
    learningGoal: "Understand the basic structure of a neural network including weights and activation functions",
    challenge: "Ask the AI to explain what an activation function does using a simple real-world analogy",
    promptHint: "Try asking — 'Can you explain what an activation function in a neural network does, using the analogy of a bouncer at a nightclub?'",
    successCriteria: ["You learned how neural networks introduce non-linearity to make decisions."],
    systemInstruction: "You are an AI tutor. Explain activation functions using the bouncer analogy (deciding whether the signal is strong enough to pass through). 2-3 sentences."
  },
  'cs50ai_6_deep-learning-cnns': {
    title: "Deep Learning and CNNs",
    learningGoal: "Understand how Convolutional Neural Networks are specially designed to process image data",
    challenge: "Ask the AI to explain how a CNN uses layers of filters to slowly build an understanding of an image",
    promptHint: "Try asking — 'When a CNN looks at a picture of a car, what does it detect in the first layer versus what it detects in the final layer?'",
    successCriteria: ["You grasped the concept of hierarchical feature extraction in deep learning."],
    systemInstruction: "You are an AI tutor. Explain that early CNN layers detect simple edges/lines, while later layers combine them to detect complex shapes like wheels or cars. 2-3 sentences."
  },
  'cs50ai_6_getting-started': {
    title: "Getting Started with Neural Networks",
    learningGoal: "Understand why deep neural networks are required for certain complex modern tasks",
    challenge: "Ask the AI to explain why simple machine learning isn't enough for facial recognition and why deep learning is required",
    promptHint: "Try asking — 'Why does FaceID on my phone need a Deep Neural Network instead of just a basic machine learning algorithm?'",
    successCriteria: ["You learned the advantages of deep architecture for complex pattern recognition."],
    systemInstruction: "You are an AI tutor. Explain that facial recognition requires detecting incredibly complex, hierarchical patterns (eyes, contours) that basic ML cannot capture. 2-3 sentences."
  },
  'cs50ai_7_what-is-nlp': {
    title: "What is NLP and Tokenization",
    learningGoal: "Understand how computers break down and process human language text using tokenization",
    challenge: "Ask the AI to explain how it would tokenize a specific sentence and why words are turned into numbers",
    promptHint: "Try asking — 'How does an AI tokenize the sentence \"I love coding!\" and why does it need to convert those tokens into numbers?'",
    successCriteria: ["You understand the preprocessing steps required before text can be fed into an AI."],
    systemInstruction: "You are an AI tutor. Explain how the sentence is split into tokens (words/punctuation) and mapped to IDs, because neural networks only understand math/numbers. 2-3 sentences."
  },
  'cs50ai_7_word-embeddings': {
    title: "Word Embeddings and Large Language Models",
    learningGoal: "Understand how word embeddings capture the semantic meaning and relationships of words mathematically",
    challenge: "Ask the AI to explain how word vectors can be used to solve word analogies using math",
    promptHint: "Try asking — 'How do word embeddings use math to prove that King minus Man plus Woman equals Queen?'",
    successCriteria: ["You learned how words are plotted in high-dimensional space based on their context."],
    systemInstruction: "You are an AI tutor. Explain that words are vectors in space; subtracting the 'male' direction and adding 'female' moves the vector from King to Queen. 2-3 sentences."
  },
  'cs50ai_7_getting-started': {
    title: "Getting Started with NLP",
    learningGoal: "Understand the core mechanism of how Large Language Models generate text",
    challenge: "Ask the AI to explain its own fundamental text generation process in simple terms",
    promptHint: "Try asking — 'Is it true that Large Language Models like you are just advanced autocomplete engines predicting the next word?'",
    successCriteria: ["You demystified LLMs by understanding their next-token prediction mechanism."],
    systemInstruction: "You are an AI tutor. Confirm that LLMs fundamentally predict the next token based on context, leveraging deep patterns learned from massive text data. 2-3 sentences."
  },
  'cs50ai_8_ai-bias': {
    title: "AI Bias and Privacy",
    learningGoal: "Understand how historical human bias can become embedded in AI algorithms through training data",
    challenge: "Ask the AI to explain how a resume-screening algorithm could inadvertently learn to discriminate",
    promptHint: "Try asking — 'If an AI is trained entirely on historical hiring data from the 1990s, how might it become biased against certain applicants?'",
    successCriteria: ["You understood the concept of 'garbage in, garbage out' regarding algorithmic fairness."],
    systemInstruction: "You are an AI tutor. Explain that if past hiring data favored certain demographics, the AI will learn those patterns and penalize others, perpetuating the bias. 2-3 sentences."
  },
  'cs50ai_8_hallucinations-deepfakes': {
    title: "Hallucinations Deepfakes and Accountability",
    learningGoal: "Understand why AI language models sometimes generate false information confidently",
    challenge: "Ask the AI to explain the concept of 'hallucinations' in language models and why they occur",
    promptHint: "Try asking — 'Why do Large Language Models sometimes confidently invent fake facts or hallucinate instead of just saying \"I don't know\"?'",
    successCriteria: ["You learned the limitations of generative AI when it comes to strict factuality."],
    systemInstruction: "You are an AI tutor. Explain that LLMs are designed to generate plausible text, not retrieve facts, so they will confidently string together likely words even if untrue. 2-3 sentences."
  },
  'cs50ai_8_getting-started': {
    title: "Getting Started with AI Ethics",
    learningGoal: "Understand the real-world complexities of assigning responsibility when AI systems fail",
    challenge: "Ask the AI to discuss the legal and moral accountability issues surrounding autonomous vehicles",
    promptHint: "Try asking — 'If a self-driving car makes a mistake and causes an accident, who is generally considered responsible: the driver, the manufacturer, or the AI programmer?'",
    successCriteria: ["You explored the difficult ethical questions surrounding AI deployment."],
    systemInstruction: "You are an AI tutor. Briefly highlight that accountability is a complex, unresolved legal debate involving the human driver, the software developer, and the manufacturer. 2-3 sentences."
  },
  'cs50ai_9_what-learned': {
    title: "What You Have Learned",
    learningGoal: "Synthesize the core difference between the two major eras of AI taught in the course",
    challenge: "Ask the AI to summarize the fundamental difference between classical search algorithms and modern neural networks",
    promptHint: "Try asking — 'What is the biggest difference between classical AI (like Minimax search) and modern AI (like Deep Learning)?'",
    successCriteria: ["You successfully contrasted logic-based AI with data-driven AI."],
    systemInstruction: "You are an AI tutor. Contrast classical AI (explicit rules/search) with modern AI (learning patterns from massive data). Keep it under 3 sentences."
  },
  'cs50ai_9_choose-project': {
    title: "Choose Your Project",
    learningGoal: "Apply the AI concepts you've learned to formulate a practical project idea",
    challenge: "Tell the AI about a specific hobby or interest you have, and ask it to suggest a beginner-friendly AI project",
    promptHint: "Try asking — 'I am really interested in fitness and working out. What is a beginner AI or Machine Learning project I could build related to that?'",
    successCriteria: ["You received a personalized, actionable idea for your final project."],
    systemInstruction: "You are an AI tutor. Suggest one simple, realistic AI/ML project related to fitness (e.g., a form-checker or workout recommender). Be encouraging. 2-3 sentences."
  },
  'cs50ai_9_getting-started': {
    title: "Getting Started with Your Project",
    learningGoal: "Identify the concrete next steps and skills needed to continue building AI projects",
    challenge: "Ask the AI to recommend the most important programming languages or math concepts to study next",
    promptHint: "Try asking — 'If I want to build real Machine Learning projects, do I need to master Calculus, or should I just focus on learning Python and libraries like TensorFlow?'",
    successCriteria: ["You gained clarity on the practical skills needed to advance in the AI field."],
    systemInstruction: "You are an AI tutor. Recommend focusing heavily on Python and its libraries first, noting that high-level math isn't strictly required to start building practical models. 2-3 sentences."
  }
};

export function getPracticeExercise(courseSlug: string, lectureId: string, sectionId?: string): PracticeExerciseConfig | null {
  if (sectionId && PRACTICE_EXERCISES[`${courseSlug}_${lectureId}_${sectionId}`]) {
    return PRACTICE_EXERCISES[`${courseSlug}_${lectureId}_${sectionId}`];
  }
  return PRACTICE_EXERCISES[`${courseSlug}_${lectureId}`] ?? null;
}
