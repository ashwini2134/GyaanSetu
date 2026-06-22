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
  'cs50ai_0': {
    title: "Introduction to AI",
    learningGoal: "Understand what AI is and where it appears in daily life.",
    challenge: "Ask the AI to identify tools that genuinely use AI versus regular software tools that students use.",
    promptHint: "Can you identify which tools students use that genuinely use AI versus regular software?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer their question factually in 2-4 short sentences. Only mention tools that genuinely use AI/ML. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_1': {
    title: "Search Algorithms",
    learningGoal: "Understand how AI finds paths and solutions.",
    challenge: "Ask the AI to explain how navigation apps like Google Maps find the best route by searching for a path.",
    promptHint: "How do navigation apps like Google Maps find the best route? How do they search for a path?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer their question factually in 2-4 short sentences. Use simple examples. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_2': {
    title: "Knowledge & Logic",
    learningGoal: "Understand how AI uses rules and logic.",
    challenge: "Ask the AI to create logical IF-THEN rules for a real-world system.",
    promptHint: "Can you create some logical IF-THEN rules for a real-world system?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Generate clear IF-THEN rules in 2-4 short sentences. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_3': {
    title: "Probability & Uncertainty",
    learningGoal: "Understand probability and confidence.",
    challenge: "Ask the AI to explain probability and uncertainty.",
    promptHint: "Can you explain probability and uncertainty?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer factually in 2-4 short sentences. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_4': {
    title: "Optimization",
    learningGoal: "Understand how AI chooses the best option.",
    challenge: "Ask the AI to plan something with constraints.",
    promptHint: "Can you plan something with constraints?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer factually in 2-4 short sentences. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_5': {
    title: "Machine Learning",
    learningGoal: "Understand how AI learns from examples.",
    challenge: "Ask the AI to explain how a machine learning model learns from data.",
    promptHint: "How does a machine learning model learn from data?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer factually in 2-4 short sentences. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_6': {
    title: "Neural Networks",
    learningGoal: "Understand how neural networks process information.",
    challenge: "Ask the AI to explain how multiple inputs combine in a neural network to produce a prediction.",
    promptHint: "How do multiple inputs combine in a neural network to produce a prediction?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer factually in 2-4 short sentences. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_7': {
    title: "NLP",
    learningGoal: "Understand how prompts affect AI responses.",
    challenge: "Ask the AI to explain NLP to a 5-year old, and then explain it again to a college student.",
    promptHint: "Can you explain NLP to a 5-year old, and then explain it again to a college student?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer factually in 2-4 short sentences. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_8': {
    title: "AI Ethics",
    learningGoal: "Understand responsible AI usage.",
    challenge: "Ask the AI what are some real examples where AI caused harm or bias.",
    promptHint: "What are some real examples where AI caused harm or bias?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer factually in 2-4 short sentences. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_9': {
    title: "Final Project",
    learningGoal: "Synthesize the core concepts of the AI course.",
    challenge: "Ask the AI which is better for playing chess: Minimax search or a Neural Network.",
    promptHint: "Which is better for playing chess: Minimax search or a Neural Network?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer factually in 2-4 short sentences. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_0_what-is-ai': {
    title: "What is AI",
    learningGoal: "Understand the difference between traditional programming and Artificial Intelligence.",
    challenge: "Ask the AI to compare how a traditional calculator works versus how an AI spam filter works.",
    promptHint: "Compare how a traditional calculator works versus how an AI spam filter works. Which one is rule-based and which one learns?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Briefly explain the difference between a calculator (rules) and a spam filter (learning). Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_0_ai-ml-dl': {
    title: "AI vs ML vs DL",
    learningGoal: "Understand how Artificial Intelligence, Machine Learning, and Deep Learning relate to each other.",
    challenge: "Ask the AI to give an example of a smart home feature that is AI, one that is ML, and one that is Deep Learning.",
    promptHint: "Give me an example of a smart home feature that is AI, one that is ML, and one that is Deep Learning.",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Give a smart home example distinguishing AI, ML, and DL. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_0_getting-started': {
    title: "Getting Started with AI",
    learningGoal: "Identify how Artificial Intelligence is already being used in your daily life.",
    challenge: "Ask the AI what kind of AI runs in the background when you use Netflix or TikTok.",
    promptHint: "What kind of AI runs in the background when I use Netflix or TikTok?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Briefly explain the recommendation algorithms used in apps like Netflix/TikTok. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_1_search-problem': {
    title: "What is a Search Problem",
    learningGoal: "Understand the core components of a search problem: initial state, actions, and goal state.",
    challenge: "Ask the AI what the initial state, actions, and goal state are for a game of Tic-Tac-Toe.",
    promptHint: "If I am playing Tic-Tac-Toe, what is the initial state, what are the actions, and what is the goal state?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Briefly define the initial state, actions, and goal state for Tic-Tac-Toe. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_1_bfs-dfs': {
    title: "BFS and DFS",
    learningGoal: "Understand the difference in how Breadth-First Search and Depth-First Search explore paths.",
    challenge: "Ask the AI why Breadth-First Search is better for finding a nearby hospital, but Depth-First Search might be used for exploring a maze.",
    promptHint: "Why is Breadth-First Search better for finding a nearby hospital, but Depth-First Search might be used for exploring a maze?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain that BFS finds the shallowest/closest goal (hospital) while DFS dives deep down one path (maze). Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_1_getting-started': {
    title: "Getting Started with Search",
    learningGoal: "Understand how search algorithms are applied in modern navigation technology.",
    challenge: "Ask the AI how Google Maps uses informed search algorithms like A* to find your route quickly without checking every road.",
    promptHint: "How does Google Maps use informed search algorithms like A* to find my route quickly without checking every road?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Briefly explain how GPS apps use heuristics (informed search) to guess the right direction rather than blind search. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_2_propositional-logic': {
    title: "Propositional Logic",
    learningGoal: "Understand how to convert everyday English statements into strict logical propositions.",
    challenge: "Ask the AI how to write the sentence 'If it is raining and I go outside, then I will get wet' using logical symbols.",
    promptHint: "How do I write the sentence 'If it is raining and I go outside, then I will get wet' using logical symbols?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Translate the student's sentence into propositional logic (e.g., P ^ Q => R) and define the variables. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_2_knowledge-base': {
    title: "Knowledge Base and Inference",
    learningGoal: "Understand how an AI can infer new facts from a set of known rules in its knowledge base.",
    challenge: "Ask the AI what it can infer from the following: 1) All birds have feathers. 2) A penguin is a bird.",
    promptHint: "My knowledge base says: 1) All birds have feathers. 2) A penguin is a bird. What can you infer from this?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. State the logical inference (the penguin has feathers) and briefly explain the deduction process. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_2_getting-started': {
    title: "Getting Started with Logic",
    learningGoal: "Understand how logical rules are used to control non-player characters in video games.",
    challenge: "Ask the AI what the logical IF-THEN rules would look like for a video game guard who sees the player.",
    promptHint: "What would the logical IF-THEN rules look like for a video game guard who sees the player?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Provide 2-3 simple IF-THEN rules for a game guard (e.g., IF see player THEN attack). Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_3_prob-basics': {
    title: "Probability Basics",
    learningGoal: "Understand how to calculate basic probabilities for multiple events occurring.",
    challenge: "Ask the AI what the exact probability is of getting a 4 and a Heads if you roll a 6-sided die and flip a coin.",
    promptHint: "If I roll a 6-sided die and flip a coin, what is the exact probability I get a 4 and a Heads?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Answer the math question directly (1/6 * 1/2 = 1/12) and briefly explain the multiplication rule. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_3_bayes-theorem': {
    title: "Conditional Probability and Bayes Theorem",
    learningGoal: "Understand how Bayes Theorem updates probability based on new evidence.",
    challenge: "Ask the AI to explain step by step the real probability of having a disease if it affects 1 in 1000 people, the test is 99% accurate, and you test positive.",
    promptHint: "If a disease affects 1 in 1000 people and a test is 99 percent accurate, what is the real probability I have the disease if I test positive? Explain step by step.",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Briefly explain the base rate fallacy using their medical test example. Explain why the probability is lower than 99%. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_3_getting-started': {
    title: "Getting Started with Probability",
    learningGoal: "Understand how AI systems handle uncertainty in messy, real-world environments.",
    challenge: "Ask the AI how a self-driving car uses probability to decide what to do if its camera is only 75% sure the object ahead is a person.",
    promptHint: "If a self-driving car camera is only 75% sure the object ahead is a person, how does it use probability to decide what to do?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain how autonomous systems weigh the probability of a risk against the cost of a mistake to make safe decisions. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_4_what-is-optimization': {
    title: "What is Optimization and Hill Climbing",
    learningGoal: "Understand the goal of optimization algorithms and the problem of getting stuck in local maxima.",
    challenge: "Ask the AI how the Hill Climbing algorithm works, and why a hiker in the fog might get stuck on a smaller hill instead of the true summit.",
    promptHint: "How does the Hill Climbing algorithm work, and why might a hiker in the fog get stuck on a smaller hill instead of the true summit?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain Hill Climbing and the local maximum problem using the hiker in the fog analogy. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_4_simulated-annealing': {
    title: "Simulated Annealing and Constraint Satisfaction",
    learningGoal: "Understand how simulated annealing uses randomness to escape local maxima.",
    challenge: "Ask the AI why Simulated Annealing is sometimes programmed to choose a worse state instead of always climbing higher.",
    promptHint: "In Simulated Annealing, why is the algorithm sometimes programmed to choose a worse state instead of always climbing higher?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain how accepting worse states early on allows the algorithm to escape local maxima and find the global maximum. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_4_getting-started': {
    title: "Getting Started with Optimization",
    learningGoal: "Understand how optimization and constraint satisfaction are used to solve complex scheduling problems.",
    challenge: "Ask the AI how it uses constraint satisfaction to schedule 500 college classes without double-booking any rooms or professors.",
    promptHint: "How does an AI use constraint satisfaction to schedule 500 college classes without double-booking any rooms or professors?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Briefly explain how variables (classes) must be assigned values (times/rooms) without violating constraints (double-booking). Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_5_what-is-ml': {
    title: "What is Machine Learning and Supervised Learning",
    learningGoal: "Understand how supervised learning algorithms are trained using labeled datasets.",
    challenge: "Ask the AI why you need a dataset of labeled photos to train an AI to recognize dogs, and how the AI uses them.",
    promptHint: "If I want to train an AI to recognize dogs, why do I need a dataset of labeled photos, and how does the AI use them?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain that labeled photos act as the 'answer key' allowing the model to learn the patterns of a dog. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_5_unsupervised-rl': {
    title: "Unsupervised and Reinforcement Learning",
    learningGoal: "Understand the difference between finding hidden patterns (Unsupervised) and learning through rewards (Reinforcement).",
    challenge: "Ask the AI if a chess-playing AI is an example of Unsupervised Learning or Reinforcement Learning, and ask the same about an AI that groups shoppers by buying habits.",
    promptHint: "Is a chess-playing AI an example of Unsupervised Learning or Reinforcement Learning? What about an AI that groups shoppers by buying habits?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Confirm chess is Reinforcement Learning (rewards) and shopper grouping is Unsupervised Learning (clustering). Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_5_getting-started': {
    title: "Getting Started with Machine Learning",
    learningGoal: "Understand how Machine Learning algorithms power features in everyday applications.",
    challenge: "Ask the AI if a spam filter uses Supervised Learning, Unsupervised Learning, or Reinforcement Learning to catch junk mail.",
    promptHint: "Does a spam filter use Supervised Learning, Unsupervised Learning, or Reinforcement Learning to catch junk mail?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain that spam filters use Supervised Learning because they are trained on examples of emails explicitly labeled as spam or not spam. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_6_what-is-nn': {
    title: "What is a Neural Network",
    learningGoal: "Understand the basic structure of a neural network including weights and activation functions.",
    challenge: "Ask the AI to explain what an activation function in a neural network does, using the analogy of a bouncer at a nightclub.",
    promptHint: "Can you explain what an activation function in a neural network does, using the analogy of a bouncer at a nightclub?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain activation functions using the bouncer analogy (deciding whether the signal is strong enough to pass through). Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_6_deep-learning-cnns': {
    title: "Deep Learning and CNNs",
    learningGoal: "Understand how Convolutional Neural Networks are specially designed to process image data.",
    challenge: "Ask the AI what a CNN detects in the first layer versus what it detects in the final layer when it looks at a picture of a car.",
    promptHint: "When a CNN looks at a picture of a car, what does it detect in the first layer versus what it detects in the final layer?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain that early CNN layers detect simple edges/lines, while later layers combine them to detect complex shapes like wheels or cars. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_6_getting-started': {
    title: "Getting Started with Neural Networks",
    learningGoal: "Understand why deep neural networks are required for certain complex modern tasks.",
    challenge: "Ask the AI why FaceID on your phone needs a Deep Neural Network instead of just a basic machine learning algorithm.",
    promptHint: "Why does FaceID on my phone need a Deep Neural Network instead of just a basic machine learning algorithm?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain that facial recognition requires detecting incredibly complex, hierarchical patterns (eyes, contours) that basic ML cannot capture. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_7_what-is-nlp': {
    title: "What is NLP and Tokenization",
    learningGoal: "Understand how computers break down and process human language text using tokenization.",
    challenge: "Ask the AI how it tokenizes the sentence 'I love coding!' and why it needs to convert those tokens into numbers.",
    promptHint: "How does an AI tokenize the sentence 'I love coding!' and why does it need to convert those tokens into numbers?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain how the sentence is split into tokens (words/punctuation) and mapped to IDs, because neural networks only understand math/numbers. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_7_word-embeddings': {
    title: "Word Embeddings and Large Language Models",
    learningGoal: "Understand how word embeddings capture the semantic meaning and relationships of words mathematically.",
    challenge: "Ask the AI how word embeddings use math to prove that King minus Man plus Woman equals Queen.",
    promptHint: "How do word embeddings use math to prove that King minus Man plus Woman equals Queen?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain that words are vectors in space; subtracting the 'male' direction and adding 'female' moves the vector from King to Queen. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_7_getting-started': {
    title: "Getting Started with NLP",
    learningGoal: "Understand the core mechanism of how Large Language Models generate text.",
    challenge: "Ask the AI if it is true that Large Language Models are just advanced autocomplete engines predicting the next word.",
    promptHint: "Is it true that Large Language Models like you are just advanced autocomplete engines predicting the next word?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Confirm that LLMs fundamentally predict the next token based on context, leveraging deep patterns learned from massive text data. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_8_ai-bias': {
    title: "AI Bias and Privacy",
    learningGoal: "Understand how historical human bias can become embedded in AI algorithms through training data.",
    challenge: "Ask the AI how an AI trained entirely on historical hiring data from the 1990s might become biased against certain applicants.",
    promptHint: "If an AI is trained entirely on historical hiring data from the 1990s, how might it become biased against certain applicants?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain that if past hiring data favored certain demographics, the AI will learn those patterns and penalize others, perpetuating the bias. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_8_hallucinations-deepfakes': {
    title: "Hallucinations Deepfakes and Accountability",
    learningGoal: "Understand why AI language models sometimes generate false information confidently.",
    challenge: "Ask the AI why Large Language Models sometimes confidently invent fake facts or hallucinate instead of just saying 'I don't know'.",
    promptHint: "Why do Large Language Models sometimes confidently invent fake facts or hallucinate instead of just saying 'I don't know'?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Explain that LLMs are designed to generate plausible text, not retrieve facts, so they will confidently string together likely words even if untrue. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_8_getting-started': {
    title: "Getting Started with AI Ethics",
    learningGoal: "Understand the real-world complexities of assigning responsibility when AI systems fail.",
    challenge: "Ask the AI who is generally considered responsible (the driver, the manufacturer, or the AI programmer) if a self-driving car makes a mistake and causes an accident.",
    promptHint: "If a self-driving car makes a mistake and causes an accident, who is generally considered responsible: the driver, the manufacturer, or the AI programmer?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Briefly highlight that accountability is a complex, unresolved legal debate involving the human driver, the software developer, and the manufacturer. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_9_what-learned': {
    title: "What You Have Learned",
    learningGoal: "Synthesize the core difference between the two major eras of AI taught in the course.",
    challenge: "Ask the AI what the biggest difference is between classical AI (like Minimax search) and modern AI (like Deep Learning).",
    promptHint: "What is the biggest difference between classical AI (like Minimax search) and modern AI (like Deep Learning)?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Contrast classical AI (explicit rules/search) with modern AI (learning patterns from massive data). Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_9_choose-project': {
    title: "Choose Your Project",
    learningGoal: "Apply the AI concepts you've learned to formulate a practical project idea.",
    challenge: "Ask the AI for a beginner AI or Machine Learning project you could build related to fitness and working out.",
    promptHint: "I am really interested in fitness and working out. What is a beginner AI or Machine Learning project I could build related to that?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Suggest one simple, realistic AI/ML project related to fitness (e.g., a form-checker or workout recommender). Be encouraging. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  },
  'cs50ai_9_getting-started': {
    title: "Getting Started with Your Project",
    learningGoal: "Identify the concrete next steps and skills needed to continue building AI projects.",
    challenge: "Ask the AI if you need to master Calculus to build real Machine Learning projects, or if you should just focus on learning Python and libraries like TensorFlow.",
    promptHint: "If I want to build real Machine Learning projects, do I need to master Calculus, or should I just focus on learning Python and libraries like TensorFlow?",
    successCriteria: ["Good work exploring this concept. Try the prompt hint if you want to go deeper."],
    systemInstruction: "You are an AI tutor. Recommend focusing heavily on Python and its libraries first, noting that high-level math isn't strictly required to start building practical models. Reply in maximum 2 sentences only. Be direct and simple. No bullet points. No long explanations. Beginner friendly language only."
  }
};

export function getPracticeExercise(courseSlug: string, lectureId: string, sectionId?: string): PracticeExerciseConfig | null {
  if (sectionId && PRACTICE_EXERCISES[`${courseSlug}_${lectureId}_${sectionId}`]) {
    return PRACTICE_EXERCISES[`${courseSlug}_${lectureId}_${sectionId}`];
  }
  return PRACTICE_EXERCISES[`${courseSlug}_${lectureId}`] ?? null;
}
