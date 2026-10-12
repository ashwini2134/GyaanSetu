const fs = require('fs');
const path = require('path');

const data = {
  0: [
    {
      "id": "ai_daily_tools",
      "title": "AI Tools You Use Daily",
      "description": "List 5 AI tools or services you use daily and identify what task each one performs.\n\nFor each tool, write:\n1. The name of the AI tool/service\n2. The primary task it performs\n3. A brief sentence about how it uses AI\n\nExample:\n- Google Maps: Routes traffic using AI to predict fastest paths\n- Spotify: Recommends songs based on your listening history using ML\n- Gmail: Filters spam emails using AI\n\nNo code editor needed for this problem — submit your written answer in the editor as comments.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Activity: List 5 AI tools you use daily\n# Tool 1:\n# Task:\n# How it uses AI:\n\n# Tool 2:\n# ... (repeat for 5 tools)",
      "solution": "# Example answers:\n# 1. Google Maps - navigation - uses search and optimization\n# 2. Spotify - music recommendations - uses ML\n# 3. Gmail - spam filtering - uses AI classification\n# 4. Siri/Alexa - voice commands - uses NLP\n# 5. Netflix - show recommendations - uses ML",
      "hints": [
        "Think about the apps you use on your phone every day.",
        "Consider how services recommend content or filter out unwanted information for you."
      ],
      "testCases": []
    },
    {
      "id": "ai_classifier",
      "title": "AI/ML/DL Classifier",
      "description": "Write a Python program that takes a user's input and prints whether it sounds like AI, Machine Learning, or Deep Learning based on keywords in their answer.\n\nKeyword matching rules:\n- If input contains keywords like 'learn', 'data', 'pattern', 'train', 'example' → Machine Learning\n- If input contains keywords like 'brain', 'network', 'layer', 'neuron', 'node' → Deep Learning\n- Otherwise or with keywords like 'task', 'perform', 'think', 'compute' → Artificial Intelligence\n\nSample Input: A system that learns patterns from examples\nSample Output: Machine Learning",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "# AI/ML/DL Classifier\nuser_input = input().lower()\n\n# Check keywords and classify\n# Hint: use 'in' to check if keyword is in user_input",
      "solution": "user_input = input().lower()\ndl_keywords = ['brain', 'network', 'layer', 'neuron', 'node']\nml_keywords = ['learn', 'data', 'pattern', 'train', 'example']\nif any(k in user_input for k in dl_keywords):\n    print('Deep Learning')\nelif any(k in user_input for k in ml_keywords):\n    print('Machine Learning')\nelse:\n    print('Artificial Intelligence')",
      "hints": [
        "Create lists of keywords for Deep Learning and Machine Learning.",
        "Use a loop or the 'any()' function to check if a keyword from your list is in the user's input.",
        "Use an if/elif/else structure to prioritize the checks."
      ],
      "testCases": [
        {"label": "Machine Learning keywords", "input": "A system that learns patterns from examples", "expectedOutput": "Machine Learning\n"},
        {"label": "Deep Learning keywords", "input": "Brain-like networks with many layers", "expectedOutput": "Deep Learning\n"},
        {"label": "Edge Case - Capitalized Input", "input": "BRAIN-like", "expectedOutput": "Deep Learning\n"},
        {"label": "Fallback AI keywords", "input": "A system to perform a task", "expectedOutput": "Artificial Intelligence\n"}
      ]
    },
    {
      "id": "ai_tools_avoid_sim1",
      "title": "AI Tools You Avoid (Similar A)",
      "description": "Think about AI tools or features you actively choose NOT to use, or that you are skeptical about. List 2 AI tools or features that you avoid, and briefly explain why (e.g., privacy concerns, lack of trust, or preferring to do it manually).",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Activity: List 2 AI tools you avoid\n# Tool 1:\n# Reason:\n\n# Tool 2:\n# Reason:",
      "solution": "# Example answers:\n# 1. AI writing assistants - I prefer to keep my own voice and writing style instead of having a bot write for me.\n# 2. Facial recognition on smart home cameras - I have privacy concerns about the data storage and who has access to it.",
      "hints": [
        "Think about tools that collect a lot of personal data (like location or photos).",
        "Consider tasks where human judgment feels more important to you than speed or convenience."
      ],
      "testCases": []
    },
    {
      "id": "spam_classifier_sim2",
      "title": "Spam / Ham / Phishing Classifier (Similar B)",
      "description": "Write a Python program that takes a user's email subject as input and classifies it as 'Spam', 'Phishing', or 'Ham' (normal email).\n\nKeyword rules:\n- If input contains 'win', 'money', 'free', or 'prize' → Spam\n- If input contains 'password', 'urgent', 'account', or 'verify' → Phishing\n- Otherwise → Ham\n\nSample Input: Urgent: verify your account password\nSample Output: Phishing",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "# Email Classifier\nsubject = input().lower()\n\n# Check keywords and classify\n# Remember to use if/elif/else",
      "solution": "subject = input().lower()\nspam_words = ['win', 'money', 'free', 'prize']\nphish_words = ['password', 'urgent', 'account', 'verify']\nif any(w in subject for w in phish_words):\n    print('Phishing')\nelif any(w in subject for w in spam_words):\n    print('Spam')\nelse:\n    print('Ham')",
      "hints": [
        "Define two separate lists: one for spam keywords and one for phishing keywords.",
        "Use the 'in' operator to check if a word from your list exists in the subject.",
        "Order matters! Check for phishing or spam before falling back to the 'else' block for Ham."
      ],
      "testCases": [
        {"label": "Phishing keyword detection", "input": "Urgent: verify your account password", "expectedOutput": "Phishing\n"},
        {"label": "Spam keyword detection", "input": "Claim your free prize now!", "expectedOutput": "Spam\n"},
        {"label": "Normal email (Ham)", "input": "Meeting notes from yesterday", "expectedOutput": "Ham\n"},
        {"label": "Edge Case - ALL CAPS", "input": "FREE MONEY", "expectedOutput": "Spam\n"}
      ]
    }
  ],
  1: [
    {
      "id": "maze_bfs_trace",
      "title": "Trace BFS Through a Maze",
      "description": "Given this grid maze, trace the path that BFS would take — mark each cell in the order visited.\n\nMaze (S = start, G = goal, # = wall, . = open path):\nS . . # .\n# . # . .\n. . . . G\n\nYour task: Mark each cell in the order BFS would visit it.\nHint: BFS uses a queue (FIFO). Process nodes in discovery order, level by level.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Activity: Trace BFS visit order\n# Write the visit order for each cell\n# Example format: S=1, then neighbors=2,3...\n\n# Your answer:",
      "solution": "# BFS visits level by level from S\n# Level 0: S (1)\n# Level 1: Node to the right of S (2)\n# Level 2: Node to the right of 2 (3)\n# ... and so on, filling outwardly in rings.",
      "hints": [
        "Remember that BFS explores all neighbors at the current depth before moving deeper.",
        "Imagine pouring water onto the grid starting at 'S'. The order the cells get wet is the BFS visit order."
      ],
      "testCases": []
    },
    {
      "id": "graph_neighbors",
      "title": "Graph Representation",
      "description": "Write Python code to represent a simple graph as a dictionary and print all neighbors of a given node.\n\nExample graph:\ngraph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}\n\nYour program should:\n1. Define a graph\n2. Ask for a node name\n3. Print all neighbors\n\nSample Input: B\nSample Output: Neighbors of B: ['A', 'D']",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "# Represent a graph as a dictionary\ngraph = {\n    'A': ['B', 'C'],\n    'B': ['A', 'D'],\n    'C': ['A'],\n    'D': ['B']\n}\n\nnode = input().strip().upper()\n# Print neighbors of the node",
      "solution": "graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}\nnode = input().strip().upper()\nif node in graph:\n    print(f\"Neighbors of {node}: {graph[node]}\")\nelse:\n    print(\"Node not found\")",
      "hints": [
        "You can access dictionary values using the key: `graph[node]`.",
        "Make sure to format the string exactly as requested using an f-string."
      ],
      "testCases": [
        {"label": "Neighbors of B", "input": "B", "expectedOutput": "Neighbors of B: ['A', 'D']\n"},
        {"label": "Neighbors of A", "input": "A", "expectedOutput": "Neighbors of A: ['B', 'C']\n"},
        {"label": "Edge Case - Lowercase input", "input": "c", "expectedOutput": "Neighbors of C: ['A']\n"},
        {"label": "Edge Case - Invalid node", "input": "Z", "expectedOutput": "Node not found\n"}
      ]
    },
    {
      "id": "maze_dfs_trace_sim1",
      "title": "Trace DFS Through a Maze (Similar A)",
      "description": "Given the same grid maze, trace the path that DFS would take. \n\nMaze (S = start, G = goal, # = wall, . = open path):\nS . . # .\n# . # . .\n. . . . G\n\nYour task: Describe how DFS differs from BFS. Which one would find a longer, winding path first? Explain why.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Activity: Compare DFS to BFS\n# 1. How does the visit order differ?\n# 2. Does DFS find the shortest path?\n\n# Your answer:",
      "solution": "# 1. DFS dives deep into one path until it hits a dead end before backtracking, while BFS explores outwardly level-by-level.\n# 2. No, DFS does not guarantee the shortest path. It just finds the first path it stumbles upon.",
      "hints": [
        "Think of DFS like exploring a maze by keeping your hand on the left wall.",
        "DFS uses a Stack (LIFO), whereas BFS uses a Queue (FIFO)."
      ],
      "testCases": []
    },
    {
      "id": "graph_connection_sim2",
      "title": "Graph Connection Check (Similar B)",
      "description": "Write a Python program that defines a graph (same as before) and takes TWO nodes as input. Print whether they are directly connected (i.e. one is in the neighbor list of the other).\n\nSample Input 1:\nA\nB\nSample Output 1: Connected\n\nSample Input 2:\nA\nD\nSample Output 2: Not connected",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "graph = {\n    'A': ['B', 'C'],\n    'B': ['A', 'D'],\n    'C': ['A'],\n    'D': ['B']\n}\n\nnode1 = input().strip().upper()\nnode2 = input().strip().upper()\n# Check if they are connected and print result",
      "solution": "graph = {\n    'A': ['B', 'C'],\n    'B': ['A', 'D'],\n    'C': ['A'],\n    'D': ['B']\n}\nnode1 = input().strip().upper()\nnode2 = input().strip().upper()\nif node1 in graph and node2 in graph[node1]:\n    print('Connected')\nelse:\n    print('Not connected')",
      "hints": [
        "Check if `node2` is in the list `graph[node1]`.",
        "Make sure to handle the case where a node doesn't exist in the graph at all."
      ],
      "testCases": [
        {"label": "Direct connection A to B", "input": "A\nB", "expectedOutput": "Connected\n"},
        {"label": "No connection A to D", "input": "A\nD", "expectedOutput": "Not connected\n"},
        {"label": "Edge Case - Lowercase input", "input": "b\nd", "expectedOutput": "Connected\n"},
        {"label": "Edge Case - Invalid nodes", "input": "X\nY", "expectedOutput": "Not connected\n"}
      ]
    }
  ],
  2: [
    {
      "id": "logic_puzzle",
      "title": "Logic Puzzle",
      "description": "Given these 3 clues: (1) Alice has a cat or a dog. (2) Alice does not have a cat. (3) If Alice has a dog, then Bob has a bird.\n\nWho has what? Write your step-by-step reasoning.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Logic Puzzle Reasoning\n# Step 1:\n# Step 2:\n# Step 3:\n# Conclusion:",
      "solution": "# Step 1: From clue 2, Alice does not have a cat.\n# Step 2: From clue 1, since she doesn't have a cat, she MUST have a dog.\n# Step 3: From clue 3, since Alice has a dog, Bob MUST have a bird.\n# Conclusion: Alice has a dog, Bob has a bird.",
      "hints": [
        "Start with the most definitive clue (Clue 2).",
        "Use process of elimination with Clue 1."
      ],
      "testCases": []
    },
    {
      "id": "daily_rules",
      "title": "Daily Rules",
      "description": "Write a Python program with IF-THEN rules. Ask the user for the current weather (either 'rain' or 'sun') and whether it is a 'weekend' or 'weekday'.\n\nRules:\n- If it's a weekday and raining -> Print 'Work from home'\n- If it's a weekday and sunny -> Print 'Go to office'\n- If it's a weekend (regardless of weather) -> Print 'Relax'\n\nSample Input:\nrain\nweekday\nSample Output: Work from home",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "weather = input().strip().lower()\nday_type = input().strip().lower()\n\n# Add your logic rules here",
      "solution": "weather = input().strip().lower()\nday_type = input().strip().lower()\nif day_type == 'weekend':\n    print('Relax')\nelif day_type == 'weekday' and weather == 'rain':\n    print('Work from home')\nelif day_type == 'weekday' and weather == 'sun':\n    print('Go to office')\nelse:\n    print('Unknown')",
      "hints": [
        "You can use the 'and' keyword to combine two conditions in an if statement.",
        "Check the weekend condition first, since it doesn't depend on the weather!"
      ],
      "testCases": [
        {"label": "Weekday Rain", "input": "rain\nweekday", "expectedOutput": "Work from home\n"},
        {"label": "Weekday Sun", "input": "sun\nweekday", "expectedOutput": "Go to office\n"},
        {"label": "Weekend", "input": "rain\nweekend", "expectedOutput": "Relax\n"},
        {"label": "Edge Case - Capitalized inputs", "input": "SUN\nWEEKDAY", "expectedOutput": "Go to office\n"}
      ]
    },
    {
      "id": "deductive_reasoning_sim1",
      "title": "Deductive Reasoning (Similar A)",
      "description": "Consider this rule: \"If it snows, the flight will be canceled.\" We are told that the flight was NOT canceled. Can we conclude whether it snowed or not? Explain your logical reasoning.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Deductive Reasoning\n# Conclusion: \n# Explanation:",
      "solution": "# Conclusion: It did not snow.\n# Explanation: This is an example of Modus Tollens. If A implies B, and B is false, then A must also be false.",
      "hints": [
        "Think about what MUST be true if the flight wasn't canceled.",
        "If it had snowed, what would have happened?"
      ],
      "testCases": []
    },
    {
      "id": "movie_recommendation_sim2",
      "title": "Movie Recommendation Rules (Similar B)",
      "description": "Write a Python program that asks the user for a genre ('action' or 'comedy') and an age. \n\nRules:\n- If age < 13 and genre is 'action' -> Print 'PG Action'\n- If age >= 13 and genre is 'action' -> Print 'PG-13 Action'\n- If genre is 'comedy' -> Print 'Family Comedy' (regardless of age)\n\nSample Input:\naction\n14\nSample Output: PG-13 Action",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "genre = input().strip().lower()\nage = int(input().strip())\n\n# Add your logic rules here",
      "solution": "genre = input().strip().lower()\ntry:\n    age = int(input().strip())\nexcept:\n    age = 0\nif genre == 'comedy':\n    print('Family Comedy')\nelif genre == 'action' and age < 13:\n    print('PG Action')\nelif genre == 'action' and age >= 13:\n    print('PG-13 Action')\nelse:\n    print('Unknown')",
      "hints": [
        "Convert the age input to an integer using int().",
        "Handle the 'comedy' case first since it ignores age."
      ],
      "testCases": [
        {"label": "Action older", "input": "action\n14", "expectedOutput": "PG-13 Action\n"},
        {"label": "Action younger", "input": "action\n10", "expectedOutput": "PG Action\n"},
        {"label": "Comedy", "input": "comedy\n50", "expectedOutput": "Family Comedy\n"},
        {"label": "Edge Case - Exactly 13", "input": "action\n13", "expectedOutput": "PG-13 Action\n"}
      ]
    }
  ],
  3: [
    {
      "id": "flip_coin",
      "title": "Flip a coin 20 times",
      "description": "Flip a coin 20 times (use random.random() in Python or physically flip). Record your results. Calculate: How many heads? What is the probability of heads in your experiment? Is it close to 0.5?",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Activity: Record 20 coin flips\n# Number of heads:\n# Probability (heads/20):\n# Is it close to 0.5?",
      "solution": "# Example:\n# Number of heads: 11\n# Probability: 11/20 = 0.55\n# Yes, it is very close to the theoretical probability of 0.5.",
      "hints": [
        "Remember that the theoretical probability of a fair coin is 0.5.",
        "In small samples (like 20), variance means you probably won't get exactly 10 heads."
      ],
      "testCases": []
    },
    {
      "id": "coin_sim",
      "title": "Python Coin Simulator",
      "description": "Write Python using the random module to simulate 100 coin flips. Count heads and tails. Print just the number of heads.\nNote: We've hardcoded a random seed so the output is predictable for grading.",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "import random\nrandom.seed(42) # Do not change the seed!\n\nheads = 0\n# Simulate 100 flips (use a loop)\n# If random.choice(['H', 'T']) == 'H': ...\n\nprint(heads)",
      "solution": "import random\nrandom.seed(42)\nheads = 0\nfor _ in range(100):\n    if random.choice(['H', 'T']) == 'H':\n        heads += 1\nprint(heads)",
      "hints": [
        "Use a `for` loop with `range(100)`.",
        "Use `random.choice(['H', 'T'])` to simulate a single flip."
      ],
      "testCases": [
        {"label": "100 Flips Simulation (Seed 42)", "input": "", "expectedOutput": "49\n"}
      ]
    },
    {
      "id": "dice_roll_exp_sim1",
      "title": "Dice Roll Experiment (Similar A)",
      "description": "If you roll a standard 6-sided die, the theoretical probability of rolling a '3' is 1/6 (approx 16.6%). If you roll the die 6 times, are you guaranteed to get exactly one '3'? Explain the difference between theoretical probability and experimental results.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Activity: Probability concepts\n# Guaranteed to get exactly one 3? \n# Why or why not?",
      "solution": "# No, you are not guaranteed to get exactly one 3.\n# Theoretical probability predicts the average over an infinite number of trials. Experimental results in small samples can vary wildly due to randomness.",
      "hints": [
        "Think about what happens in the real world when you play a board game.",
        "Probability is about long-term averages, not short-term guarantees."
      ],
      "testCases": []
    },
    {
      "id": "python_dice_sim2",
      "title": "Python Dice Simulator (Similar B)",
      "description": "Write Python using the random module to simulate rolling a 6-sided die 1000 times. Count how many times you roll a '6'. Print just that count.\nNote: We've hardcoded a random seed so the output is predictable for grading.",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "import random\nrandom.seed(123) # Do not change the seed!\n\nsixes = 0\n# Simulate 1000 rolls (use random.randint(1, 6))\n\nprint(sixes)",
      "solution": "import random\nrandom.seed(123)\nsixes = 0\nfor _ in range(1000):\n    if random.randint(1, 6) == 6:\n        sixes += 1\nprint(sixes)",
      "hints": [
        "Use `random.randint(1, 6)` to get a random number between 1 and 6 inclusive.",
        "Use a `for` loop that runs 1000 times."
      ],
      "testCases": [
        {"label": "1000 Rolls Simulation (Seed 123)", "input": "", "expectedOutput": "153\n"}
      ]
    }
  ],
  4: [
    {
      "id": "simple_sudoku",
      "title": "Simple Sudoku",
      "description": "Solve this simple Sudoku (3x3 version — 9 cells, digits 1-3, each row and column must have 1, 2, 3 once each). Write which constraint you checked at each step.\n\nGrid:\n1 . 3\n. 1 .\n. . 1",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Sudoku Solver Steps\n# Step 1:\n# Step 2:",
      "solution": "# Step 1: Top row has 1 and 3, so middle cell must be 2.\n# Step 2: Middle column has 2 and 1, so bottom cell must be 3.\n# Step 3: Bottom row has 3 and 1, so left cell must be 2.\n# Grid solved.",
      "hints": [
        "Look for the row or column that already has the most numbers filled in.",
        "Remember, every row and column needs exactly one '1', one '2', and one '3'."
      ],
      "testCases": []
    },
    {
      "id": "hill_climbing_code",
      "title": "Hill Climbing Code",
      "description": "Write Python to find the local maximum value in a list by checking neighbors one step at a time, starting from index 0. Stop when the current value is greater than or equal to the next value. Print the local maximum found.\nList: [2, 4, 6, 5, 3, 7, 4, 2]",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "data = [2, 4, 6, 5, 3, 7, 4, 2]\ncurrent_idx = 0\n\n# Write a while loop to climb the hill\n\nprint(data[current_idx])",
      "solution": "data = [2, 4, 6, 5, 3, 7, 4, 2]\ncurrent_idx = 0\nwhile current_idx < len(data) - 1:\n    if data[current_idx + 1] > data[current_idx]:\n        current_idx += 1\n    else:\n        break\nprint(data[current_idx])",
      "hints": [
        "Use a `while` loop that continues as long as `data[current_idx + 1]` is greater than `data[current_idx]`.",
        "Don't forget to break out of the loop when you reach a peak (where the next number is smaller)."
      ],
      "testCases": [
        {"label": "Find Local Max from index 0", "input": "", "expectedOutput": "6\n"}
      ]
    },
    {
      "id": "crossword_constraint_sim1",
      "title": "Crossword Constraint (Similar A)",
      "description": "In a crossword puzzle, 1-Across is a 3-letter word for 'feline' and 1-Down is a 3-letter word for 'vehicle'. They share the first letter. Explain how Constraint Satisfaction helps solve this intersection.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Constraint Satisfaction\n# 1-Across possible word:\n# 1-Down possible word:\n# Shared letter constraint:",
      "solution": "# 1-Across: CAT\n# 1-Down: CAR\n# Shared letter constraint: The first letter of both words must be the same (C). Constraint satisfaction problems require all such overlapping rules to be met simultaneously.",
      "hints": [
        "Think of synonyms for 'feline' and 'vehicle'.",
        "The constraint is that the first letter must be identical in both words."
      ],
      "testCases": []
    },
    {
      "id": "simulated_annealing_sim2",
      "title": "Simulated Annealing Concept (Similar B)",
      "description": "Write a Python script that takes a current value and a next value as input. If the next value is strictly greater, print 'Accept'. If the next value is smaller or equal, print 'Maybe' (representing the randomness of Simulated Annealing accepting a worse state).",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "current_val = int(input())\nnext_val = int(input())\n\n# Your if/else logic here",
      "solution": "current_val = int(input())\nnext_val = int(input())\nif next_val > current_val:\n    print('Accept')\nelse:\n    print('Maybe')",
      "hints": [
        "Convert the inputs to integers before comparing them.",
        "Check if `next_val > current_val`."
      ],
      "testCases": [
        {"label": "Better state", "input": "10\n15", "expectedOutput": "Accept\n"},
        {"label": "Worse state", "input": "20\n15", "expectedOutput": "Maybe\n"},
        {"label": "Edge case - Equal state", "input": "5\n5", "expectedOutput": "Maybe\n"}
      ]
    }
  ],
  5: [
    {
      "id": "ml_workflow",
      "title": "ML Workflow Flowchart",
      "description": "Write out the machine learning workflow steps in order: Collect Data, Clean Data, Train Model, Test Model, Predict. Briefly describe what happens at the 'Test Model' stage.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# ML Workflow\n# Step 1:\n# Step 2:\n# Step 3:\n# Step 4:\n# Step 5:\n# Description of 'Test Model':",
      "solution": "# Step 1: Collect Data\n# Step 2: Clean Data\n# Step 3: Train Model\n# Step 4: Test Model\n# Step 5: Predict\n# Test Model means evaluating the trained model on unseen data to see how accurate it is before deploying it.",
      "hints": [
        "Testing is crucial so we don't deploy a model that just memorized the training data.",
        "The workflow flows from getting raw data, preparing it, learning from it, verifying the learning, and finally using it."
      ],
      "testCases": []
    },
    {
      "id": "simple_classifier_l6",
      "title": "Simple Classifier",
      "description": "Write Python to classify a number entered by the user as Positive / Negative / Zero.",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "num = int(input())\n# Add your if/elif/else statements here",
      "solution": "num = int(input())\nif num > 0:\n    print('Positive')\nelif num < 0:\n    print('Negative')\nelse:\n    print('Zero')",
      "hints": [
        "Use the > operator to check if the number is greater than 0.",
        "Don't forget the case where the number exactly equals 0."
      ],
      "testCases": [
        {"label": "Positive number", "input": "5", "expectedOutput": "Positive\n"},
        {"label": "Negative number", "input": "-3", "expectedOutput": "Negative\n"},
        {"label": "Exactly Zero", "input": "0", "expectedOutput": "Zero\n"}
      ]
    },
    {
      "id": "data_cleaning_sim1",
      "title": "Data Cleaning Steps (Similar A)",
      "description": "Why is 'Clean Data' a necessary step in the machine learning workflow? Give one example of what 'dirty data' might look like.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Importance of Data Cleaning:\n# \n# Example of dirty data:\n# ",
      "solution": "# Importance: If you train a model on garbage data, it will learn garbage patterns (Garbage In, Garbage Out).\n# Example: A dataset of ages where someone's age is listed as -5, or missing values (NaN) in important columns.",
      "hints": [
        "Think about the phrase 'Garbage In, Garbage Out'.",
        "What happens if a user accidentally types their name in the 'Phone Number' field?"
      ],
      "testCases": []
    },
    {
      "id": "simple_categorizer_sim2",
      "title": "Simple Categorizer (Similar B)",
      "description": "Write a Python script that takes a user's age as input. Categorize the user: print 'Child' if under 13, 'Teen' if 13-19, and 'Adult' if 20 or older.",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "age = int(input())\n# Add your if/elif/else statements here",
      "solution": "age = int(input())\nif age < 13:\n    print('Child')\nelif age <= 19:\n    print('Teen')\nelse:\n    print('Adult')",
      "hints": [
        "Use `<= 19` or `< 20` for the Teen check.",
        "Make sure to use an if/elif/else chain so only one category prints."
      ],
      "testCases": [
        {"label": "Child", "input": "10", "expectedOutput": "Child\n"},
        {"label": "Teen", "input": "15", "expectedOutput": "Teen\n"},
        {"label": "Adult", "input": "30", "expectedOutput": "Adult\n"},
        {"label": "Edge Case - Exactly 13", "input": "13", "expectedOutput": "Teen\n"},
        {"label": "Edge Case - Exactly 20", "input": "20", "expectedOutput": "Adult\n"}
      ]
    }
  ],
  6: [
    {
      "id": "draw_nn",
      "title": "Draw a 3-layer neural network",
      "description": "Describe the architecture of a 3-layer neural network for predicting if a student passes a class. Inputs: attendance, test scores. What is the output? What is the hidden layer doing?",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Input Layer (2 nodes):\n# Hidden Layer:\n# Output Layer (1 node):\n# What the hidden layer does:",
      "solution": "# Input Layer: Node 1 (Attendance), Node 2 (Test Scores)\n# Hidden Layer: Intermediary nodes that combine attendance and test scores to find non-linear patterns.\n# Output Layer: Node 1 (Pass or Fail prediction).\n# The hidden layer allows the network to learn complex relationships, like if high test scores can compensate for low attendance.",
      "hints": [
        "The output layer should give us the final answer we are looking for.",
        "Hidden layers act as pattern matchers that combine the raw inputs into more abstract concepts."
      ],
      "testCases": []
    },
    {
      "id": "weighted_sum",
      "title": "Weighted Sum",
      "description": "Write Python to calculate a weighted sum of two inputs. Input 1 has a weight of 0.5, Input 2 has a weight of -0.2. Take the two inputs from the user, calculate the sum, and print it.",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "in1 = float(input())\nin2 = float(input())\n\n# Calculate weighted sum: (in1 * weight1) + (in2 * weight2)\n# Print the result",
      "solution": "in1 = float(input())\nin2 = float(input())\nresult = (in1 * 0.5) + (in2 * -0.2)\nprint(result)",
      "hints": [
        "Multiply `in1` by 0.5.",
        "Multiply `in2` by -0.2.",
        "Add them together and print the result."
      ],
      "testCases": [
        {"label": "Standard inputs", "input": "10\n10", "expectedOutput": "3.0\n"},
        {"label": "Zero inputs", "input": "0\n0", "expectedOutput": "0.0\n"},
        {"label": "Edge Case - Negative inputs", "input": "-2\n-5", "expectedOutput": "0.0\n"}
      ]
    },
    {
      "id": "activation_functions_sim1",
      "title": "Activation Functions (Similar A)",
      "description": "Why do neural networks need 'activation functions' (like ReLU or Sigmoid) after calculating the weighted sum? What would happen if we didn't use them?",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Purpose of activation functions:\n# What if we didn't use them:",
      "solution": "# Activation functions introduce non-linearity into the network.\n# Without them, no matter how many layers the network has, it would just act like a single linear regression model and couldn't solve complex problems.",
      "hints": [
        "Think about linear vs. non-linear problems.",
        "If you just add and multiply numbers repeatedly, what kind of mathematical function do you always end up with?"
      ],
      "testCases": []
    },
    {
      "id": "nn_threshold_sim2",
      "title": "Neural Net Threshold (Similar B)",
      "description": "Write a Python script that takes a calculated 'weighted sum' as input. Implement a simple Step Activation Function: if the sum is greater than or equal to 0, print '1' (Activated). Otherwise, print '0' (Not Activated).",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "weighted_sum = float(input())\n\n# Your activation function logic here",
      "solution": "weighted_sum = float(input())\nif weighted_sum >= 0:\n    print(1)\nelse:\n    print(0)",
      "hints": [
        "Use a simple if/else statement.",
        "Make sure to handle the case where the sum is exactly 0."
      ],
      "testCases": [
        {"label": "Positive sum", "input": "3.5", "expectedOutput": "1\n"},
        {"label": "Negative sum", "input": "-1.2", "expectedOutput": "0\n"},
        {"label": "Edge case - Exactly 0", "input": "0.0", "expectedOutput": "1\n"}
      ]
    }
  ],
  7: [
    {
      "id": "ask_chatgpt",
      "title": "Ask ChatGPT",
      "description": "Ask ChatGPT (or any LLM) the same question in 3 different ways (change the prompt style, add context, etc). Write the question, your 3 prompts, and briefly compare how the answers changed.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Core Question:\n# Prompt 1 (Simple):\n# Prompt 2 (With persona/context):\n# Prompt 3 (With constraints):\n# Comparison:",
      "solution": "# Core Question: Explain quantum computing\n# Prompt 1: What is quantum computing?\n# Prompt 2: Explain quantum computing to a 5 year old.\n# Prompt 3: Explain quantum computing in exactly 3 sentences using an analogy about sports.\n# Comparison: Providing a persona and constraints drastically changed the output format and vocabulary.",
      "hints": [
        "Try giving the AI a persona, like 'Act as a pirate' or 'Act as a kindergarten teacher'.",
        "Try giving the AI a constraint, like 'Use less than 20 words'."
      ],
      "testCases": []
    },
    {
      "id": "tokenize_sentence",
      "title": "Tokenize sentence",
      "description": "Write Python to tokenize a sentence (split it into words) and count how many words it contains. Take the sentence as user input.",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "sentence = input()\n\n# Split the sentence into words\n# Print the number of words",
      "solution": "sentence = input()\nwords = sentence.split()\nprint(len(words))",
      "hints": [
        "Use the `.split()` method on the string to break it into a list of words.",
        "Use the `len()` function to count how many items are in the list."
      ],
      "testCases": [
        {"label": "Standard sentence", "input": "Hello world this is AI", "expectedOutput": "5\n"},
        {"label": "Single word", "input": "Hello", "expectedOutput": "1\n"},
        {"label": "Edge case - Empty input", "input": " ", "expectedOutput": "0\n"}
      ]
    },
    {
      "id": "hallucination_check_sim1",
      "title": "Hallucination Check (Similar A)",
      "description": "What does it mean when an AI 'hallucinates'? Give a hypothetical example of a dangerous or problematic AI hallucination.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Definition of hallucination:\n# Problematic example:",
      "solution": "# Definition: When an AI confidently generates false, fabricated, or nonsensical information.\n# Example: An AI used in a law firm hallucinates fake court cases and citations, leading a lawyer to submit fake evidence to a judge.",
      "hints": [
        "LLMs predict the next most likely word; they don't actually 'know' facts.",
        "Think about situations where accuracy is a matter of life or death, or legal compliance."
      ],
      "testCases": []
    },
    {
      "id": "word_freq_counter_sim2",
      "title": "Word Frequency Counter (Similar B)",
      "description": "Write a Python script that takes a sentence and a target word as input. Tokenize the sentence and count how many times the exact target word appears (case-sensitive). Print the count.",
      "difficulty": "easy",
      "type": "coding",
      "starterCode": "sentence = input()\ntarget = input()\n\n# Split sentence and count occurrences of target",
      "solution": "sentence = input()\ntarget = input()\nwords = sentence.split()\ncount = words.count(target)\nprint(count)",
      "hints": [
        "Use `.split()` to get a list of words.",
        "You can use a `for` loop to count matches, or the built-in `.count()` method on the list."
      ],
      "testCases": [
        {"label": "Word appears multiple times", "input": "the cat in the hat\nthe", "expectedOutput": "2\n"},
        {"label": "Word does not appear", "input": "hello world\npython", "expectedOutput": "0\n"},
        {"label": "Edge Case - Case sensitivity", "input": "The the THE\nthe", "expectedOutput": "1\n"}
      ]
    }
  ],
  8: [
    {
      "id": "news_story_ai",
      "title": "News story about AI",
      "description": "Find one real news story about AI causing harm (e.g., bias, hallucination, deepfakes, or job displacement). Briefly summarize the story and the specific ethical issue it highlights.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Headline/Topic:\n# Summary:\n# Ethical Issue Highlighted:",
      "solution": "# Headline: AI Hiring Tool Biased Against Women\n# Summary: A major tech company built an AI to screen resumes, but trained it on historical data consisting mostly of men. The AI learned to penalize resumes containing the word 'women's'.\n# Ethical Issue: Algorithmic bias and unfairness.",
      "hints": [
        "Think about deepfakes used in elections, or facial recognition failing for certain demographics.",
        "Search online for 'AI bias examples' or 'ChatGPT lawyer hallucination'."
      ],
      "testCases": []
    },
    {
      "id": "medical_decisions_debate",
      "title": "Medical decisions debate",
      "description": "Discussion — Should AI be allowed to make medical diagnoses and treatment decisions without a human doctor reviewing them? Argue for or against, using at least two reasons.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Stance (For or Against):\n# Reason 1:\n# Reason 2:",
      "solution": "# Stance: Against\n# Reason 1: Lack of accountability - if the AI makes a fatal mistake, who is legally and morally responsible?\n# Reason 2: AI lacks empathy and human intuition, which is often crucial for patient care and understanding nuanced symptoms.",
      "hints": [
        "Consider accountability: who is sued if a mistake is made?",
        "Consider scale: an AI can review 10,000 X-rays in a minute, while a doctor might take days."
      ],
      "testCases": []
    },
    {
      "id": "ai_education_sim1",
      "title": "AI in Education (Similar A)",
      "description": "How should schools handle generative AI tools like ChatGPT? Should they be completely banned, fully integrated into the curriculum, or something in between? State your opinion and one supporting reason.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# My opinion on AI in schools:\n# Supporting reason:",
      "solution": "# Opinion: They should be integrated, but guided.\n# Reason: Students will use these tools in the future workforce anyway, so schools need to teach them how to use AI responsibly and how to spot its mistakes.",
      "hints": [
        "Think about calculators: they used to be banned in math class, but are now required.",
        "Consider the risk of students not learning how to write or think critically."
      ],
      "testCases": []
    },
    {
      "id": "autonomous_vehicles_sim2",
      "title": "Autonomous Vehicles Debate (Similar B)",
      "description": "If a self-driving car gets into an accident, who should be held legally responsible: the person sitting in the driver's seat, the software developer, or the car manufacturer? Defend your choice.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Who is responsible:\n# Defense:",
      "solution": "# Who is responsible: The car manufacturer.\n# Defense: If the car was sold as 'fully autonomous', the human driver is not expected to be in control. The manufacturer released the software, so they must bear the liability for its failures.",
      "hints": [
        "If a human is told to 'always pay attention', does the blame shift to them?",
        "Think about how liability works with normal product defects (like faulty brakes)."
      ],
      "testCases": []
    }
  ],
  9: [
    {
      "id": "write_project_plan",
      "title": "Write project plan",
      "description": "Write your full project plan for your capstone. Include: Project name, which AI concept it uses (e.g., search, logic, ML, NLP), what input it takes, and what output it produces.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Project Name:\n# AI Concept used:\n# Input:\n# Expected Output:",
      "solution": "# Project Name: Smart Recipe Recommender\n# AI Concept used: Machine Learning / Classification\n# Input: A list of ingredients the user has in their fridge.\n# Expected Output: A classification of what cuisine they can cook, and a recommended recipe.",
      "hints": [
        "Keep the scope small and manageable. You don't need to build the next ChatGPT!",
        "Clearly define what data goes in, and what result comes out."
      ],
      "testCases": []
    },
    {
      "id": "ethical_consideration",
      "title": "Ethical consideration",
      "description": "Write one ethical consideration for your chosen project and explain it. For example, could it be biased? Could it be misused? How will you mitigate this?",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Ethical Consideration:\n# Mitigation Plan:",
      "solution": "# Ethical Consideration: My resume-screening AI might become biased against certain demographics if the historical hiring data I use was biased.\n# Mitigation Plan: I will ensure my training dataset is balanced across genders and ethnicities, and I will test the model's fairness before deployment.",
      "hints": [
        "Does your project handle sensitive user data?",
        "Could bad actors use your project to spam or harm others?"
      ],
      "testCases": []
    },
    {
      "id": "project_milestones_sim1",
      "title": "Project Milestones (Similar A)",
      "description": "Break your project plan down into 3 actionable milestones. What will you build first, second, and last?",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Milestone 1 (Foundation):\n# Milestone 2 (Core Logic):\n# Milestone 3 (Polish/UI):",
      "solution": "# Milestone 1: Gather the dataset and set up the basic Python script to read the data.\n# Milestone 2: Implement the actual machine learning algorithm and get basic predictions working.\n# Milestone 3: Format the output nicely and add a text-based menu for the user to interact with.",
      "hints": [
        "Start with data collection or basic setup.",
        "Leave styling, UI, and edge-case handling for the final milestone."
      ],
      "testCases": []
    },
    {
      "id": "bias_mitigation_sim2",
      "title": "Bias Mitigation (Similar B)",
      "description": "Imagine your AI model is accidentally producing biased results against a certain group. List two technical steps you could take to fix or mitigate this bias.",
      "difficulty": "easy",
      "type": "reflection",
      "starterCode": "# Step 1:\n# Step 2:",
      "solution": "# Step 1: Collect more diverse training data that properly represents the underrepresented group.\n# Step 2: Remove explicitly sensitive features (like race or gender) from the dataset, and audit for proxy variables.",
      "hints": [
        "Think about changing the data it learns from.",
        "Think about changing how the algorithm is scored or penalized during training."
      ],
      "testCases": []
    }
  ]
};

const baseDir = 'frontend/public/data/fundamentals-of-ai';

for (let i = 0; i < 10; i++) {
  const file = path.join(baseDir, `lecture_${i}`, 'problems.json');
  if (data[i]) {
    fs.writeFileSync(file, JSON.stringify(data[i], null, 2));
    console.log(`Updated ${file}`);
  }
}
