import json
import os

base = r'C:\Users\priya\OneDrive\Desktop\fraylon 05\june 16\LMS-main\frontend\public\data\cs50ai'

lectures = {}

# LECTURE 2
lectures[2] = [
    {
        "id": "maze_bfs_trace",
        "title": "BFS Queue Simulator",
        "description": "In Breadth-First Search (BFS), we use a Queue (First-In, First-Out) to explore nodes. Write a program that simulates a single step of a BFS queue.\n\nYour program must:\n1. Read a comma-separated string of current queue nodes (e.g., 'A,B,C').\n2. Read a new node to add to the queue (e.g., 'D').\n3. Remove the FIRST node from the queue.\n4. Add the new node to the END of the queue.\n5. Print the removed node and the new queue.\n\nSample Input:\nA,B,C\nD\n\nSample Output:\nRemoved: A\nNew Queue: ['B', 'C', 'D']",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "current_queue = input().strip().split(',')\nnew_node = input().strip()\n\n# Your code here\n",
        "solution": "current_queue = input().strip().split(',')\nnew_node = input().strip()\nremoved = current_queue.pop(0)\ncurrent_queue.append(new_node)\nprint(f'Removed: {removed}')\nprint(f'New Queue: {current_queue}')",
        "hints": [
            "Use `.pop(0)` to remove the first element of the list.",
            "Use `.append()` to add the new node to the end.",
            "Use f-strings to match the exact output format."
        ],
        "testCases": [
            {"label": "Standard Queue", "input": "A,B,C\nD", "expectedOutput": "Removed: A\nNew Queue: ['B', 'C', 'D']\n"},
            {"label": "Two items", "input": "X,Y\nZ", "expectedOutput": "Removed: X\nNew Queue: ['Y', 'Z']\n"},
            {"label": "Single item", "input": "A\nB", "expectedOutput": "Removed: A\nNew Queue: ['B']\n"}
        ]
    },
    {
        "id": "graph_neighbors",
        "title": "Graph Representation",
        "description": "Write a Python program that defines a hardcoded graph and prints the neighbors of a given node.\n\nYour program must:\n1. Use this exact dictionary for the graph:\n   `graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}`\n2. Ask the user to input a node letter.\n3. Print the list of neighbors for that node. If the node doesn't exist, print 'Node not found'.\n\nSample Input:\nB\n\nSample Output:\n['A', 'D']",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}\nnode = input().strip().upper()\n\n# Your code here\n",
        "solution": "graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}\nnode = input().strip().upper()\nif node in graph:\n    print(graph[node])\nelse:\n    print('Node not found')",
        "hints": [
            "Use the `in` keyword to check if the node exists as a key in the dictionary.",
            "If it exists, you can access the neighbors using `graph[node]`."
        ],
        "testCases": [
            {"label": "Node A", "input": "A", "expectedOutput": "['B', 'C']\n"},
            {"label": "Node C", "input": "C", "expectedOutput": "['A']\n"},
            {"label": "Invalid Node", "input": "Z", "expectedOutput": "Node not found\n"}
        ]
    },
    {
        "id": "maze_dfs_trace_sim1",
        "title": "DFS Stack Simulator (Similar A)",
        "description": "In Depth-First Search (DFS), we use a Stack (Last-In, First-Out) to explore nodes. Write a program that simulates a single step of a DFS stack.\n\nYour program must:\n1. Read a comma-separated string of current stack nodes (e.g., 'A,B,C').\n2. Read a new node to add to the stack (e.g., 'D').\n3. Remove the LAST node from the stack.\n4. Add the new node to the END of the stack.\n5. Print the removed node and the new stack.\n\nSample Input:\nA,B,C\nD\n\nSample Output:\nRemoved: C\nNew Stack: ['A', 'B', 'D']",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "current_stack = input().strip().split(',')\nnew_node = input().strip()\n\n# Your code here\n",
        "solution": "current_stack = input().strip().split(',')\nnew_node = input().strip()\nremoved = current_stack.pop()\ncurrent_stack.append(new_node)\nprint(f'Removed: {removed}')\nprint(f'New Stack: {current_stack}')",
        "hints": [
            "Use `.pop()` (without an index) to remove the last element of the list.",
            "Use `.append()` to add the new node to the top of the stack.",
            "Compare this LIFO behavior to the FIFO behavior of BFS!"
        ],
        "testCases": [
            {"label": "Standard Stack", "input": "A,B,C\nD", "expectedOutput": "Removed: C\nNew Stack: ['A', 'B', 'D']\n"},
            {"label": "Two items", "input": "X,Y\nZ", "expectedOutput": "Removed: Y\nNew Stack: ['X', 'Z']\n"},
            {"label": "Single item", "input": "A\nB", "expectedOutput": "Removed: A\nNew Stack: ['B']\n"}
        ]
    },
    {
        "id": "graph_connection_sim2",
        "title": "Graph Connection Check (Similar B)",
        "description": "Write a Python program that checks if two nodes are directly connected in a graph.\n\nYour program must:\n1. Use this exact dictionary for the graph:\n   `graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}`\n2. Ask the user for Node 1.\n3. Ask the user for Node 2.\n4. If Node 2 is in Node 1's neighbor list, print 'Connected'. Otherwise, print 'Not Connected'.\n\nSample Input:\nA\nC\n\nSample Output:\nConnected",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}\nnode1 = input().strip().upper()\nnode2 = input().strip().upper()\n\n# Your code here\n",
        "solution": "graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}\nnode1 = input().strip().upper()\nnode2 = input().strip().upper()\nif node1 in graph and node2 in graph[node1]:\n    print('Connected')\nelse:\n    print('Not Connected')",
        "hints": [
            "First, make sure Node 1 actually exists in the graph dictionary.",
            "Then, check if Node 2 is `in` the list `graph[node1]`."
        ],
        "testCases": [
            {"label": "Connected nodes", "input": "A\nC", "expectedOutput": "Connected\n"},
            {"label": "Not connected", "input": "C\nD", "expectedOutput": "Not Connected\n"},
            {"label": "Invalid node", "input": "Z\nA", "expectedOutput": "Not Connected\n"}
        ]
    }
]

# LECTURE 3
lectures[3] = [
    {
        "id": "logic_puzzle",
        "title": "Logic Puzzle Solver",
        "description": "Write a program that solves a logic puzzle based on strict rules. We know that Alice has a dog, a cat, or a bird.\n\nYour program must:\n1. Read what animal Alice has (user input).\n2. Apply the following logical rules:\n   - If Alice has a 'dog', then Bob has a 'bird'.\n   - If Alice has a 'cat', then Bob has a 'dog'.\n   - If Alice has a 'bird', then Bob has a 'cat'.\n3. Print what Bob has in the format 'Bob has a [animal]'.\n   If the input is not dog, cat, or bird, print 'Invalid input'.\n\nSample Input:\ndog\n\nSample Output:\nBob has a bird",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "alice_animal = input().strip().lower()\n\n# Your code here\n",
        "solution": "alice_animal = input().strip().lower()\nif alice_animal == 'dog':\n    print('Bob has a bird')\nelif alice_animal == 'cat':\n    print('Bob has a dog')\nelif alice_animal == 'bird':\n    print('Bob has a cat')\nelse:\n    print('Invalid input')",
        "hints": [
            "Use an `if/elif/else` structure to check each possible animal Alice might have.",
            "Remember to handle the fallback case with `else` for invalid inputs."
        ],
        "testCases": [
            {"label": "Alice has dog", "input": "dog", "expectedOutput": "Bob has a bird\n"},
            {"label": "Alice has bird", "input": "bird", "expectedOutput": "Bob has a cat\n"},
            {"label": "Invalid", "input": "fish", "expectedOutput": "Invalid input\n"}
        ]
    },
    {
        "id": "daily_rules",
        "title": "Daily Rules Validator",
        "description": "Write a Python program that applies multiple conditions to decide an outcome based on weather and the day of the week.\n\nYour program must:\n1. Read the weather ('rain' or 'sun').\n2. Read the day type ('weekend' or 'weekday').\n3. Apply these rules:\n   - If weekday AND rain -> Print 'Work from home'\n   - If weekday AND sun -> Print 'Go to office'\n   - If weekend -> Print 'Relax at home'\n   - Otherwise -> Print 'Invalid input'\n\nSample Input:\nrain\nweekday\n\nSample Output:\nWork from home",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "weather = input().strip().lower()\nday_type = input().strip().lower()\n\n# Your code here\n",
        "solution": "weather = input().strip().lower()\nday_type = input().strip().lower()\nif day_type == 'weekday' and weather == 'rain':\n    print('Work from home')\nelif day_type == 'weekday' and weather == 'sun':\n    print('Go to office')\nelif day_type == 'weekend':\n    print('Relax at home')\nelse:\n    print('Invalid input')",
        "hints": [
            "Use the `and` logical operator to check two conditions at once in your `if` statement.",
            "Make sure you handle exactly 'weekend' correctly without needing to check the weather."
        ],
        "testCases": [
            {"label": "Rainy weekday", "input": "rain\nweekday", "expectedOutput": "Work from home\n"},
            {"label": "Sunny weekday", "input": "sun\nweekday", "expectedOutput": "Go to office\n"},
            {"label": "Sunny weekend", "input": "sun\nweekend", "expectedOutput": "Relax at home\n"}
        ]
    },
    {
        "id": "deductive_reasoning_sim1",
        "title": "Deductive Reasoning Checker (Similar A)",
        "description": "Write a program that evaluates the logical consistency of an event based on a premise. Premise: 'If it snows, the flight is canceled.'\n\nYour program must:\n1. Read whether it snowed ('yes' or 'no').\n2. Read whether the flight was canceled ('yes' or 'no').\n3. Print 'Consistent' if the outcomes obey the premise.\n4. Print 'Inconsistent' if it snowed but the flight was NOT canceled (which violates the premise!).\n\nNote: If it didn't snow, the flight could be canceled for another reason, so that's still 'Consistent'.\n\nSample Input:\nyes\nno\n\nSample Output:\nInconsistent",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "snowed = input().strip().lower()\ncanceled = input().strip().lower()\n\n# Your code here\n",
        "solution": "snowed = input().strip().lower()\ncanceled = input().strip().lower()\nif snowed == 'yes' and canceled == 'no':\n    print('Inconsistent')\nelse:\n    print('Consistent')",
        "hints": [
            "The only way this premise is violated (inconsistent) is if the condition happens (snows) but the guaranteed result does NOT happen.",
            "You only need one `if` statement for the violation, and an `else` for everything else!"
        ],
        "testCases": [
            {"label": "Violates premise", "input": "yes\nno", "expectedOutput": "Inconsistent\n"},
            {"label": "Follows premise", "input": "yes\nyes", "expectedOutput": "Consistent\n"},
            {"label": "Other reason", "input": "no\nyes", "expectedOutput": "Consistent\n"}
        ]
    },
    {
        "id": "movie_recommendation_sim2",
        "title": "Movie Recommendation Rules (Similar B)",
        "description": "Write a Python program that uses logic to recommend a movie rating based on age and genre.\n\nYour program must:\n1. Ask the user for a genre ('action' or 'comedy').\n2. Ask for their age (integer).\n3. Apply these rules:\n   - If age < 13 AND genre is 'action' -> Print 'PG Action'\n   - If age >= 13 AND genre is 'action' -> Print 'PG-13 Action'\n   - If genre is 'comedy' -> Print 'PG Comedy' (regardless of age)\n   - Otherwise -> Print 'Unknown'\n\nSample Input:\naction\n10\n\nSample Output:\nPG Action",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "genre = input().strip().lower()\nage = int(input().strip())\n\n# Your code here\n",
        "solution": "genre = input().strip().lower()\nage = int(input().strip())\nif age < 13 and genre == 'action':\n    print('PG Action')\nelif age >= 13 and genre == 'action':\n    print('PG-13 Action')\nelif genre == 'comedy':\n    print('PG Comedy')\nelse:\n    print('Unknown')",
        "hints": [
            "Remember to convert the `age` input to an integer before comparing it with `< 13`.",
            "Use `and` to combine age and genre conditions."
        ],
        "testCases": [
            {"label": "Young Action", "input": "action\n10", "expectedOutput": "PG Action\n"},
            {"label": "Older Action", "input": "action\n15", "expectedOutput": "PG-13 Action\n"},
            {"label": "Comedy ignores age", "input": "comedy\n40", "expectedOutput": "PG Comedy\n"}
        ]
    }
]

# LECTURE 4
lectures[4] = [
    {
        "id": "flip_coin",
        "title": "Simulate Coin Flips",
        "description": "Write a Python program that simulates flipping a coin multiple times using a random number generator.\n\nYour program must:\n1. Read an integer `n` representing the number of flips.\n2. Use a `for` loop to flip a coin `n` times.\n3. For each flip, generate a random number between 0 and 1 using `random.random()`. If it's < 0.5, count it as Heads, otherwise Tails.\n4. Print the total number of Heads.\n\n*Note: A random seed is set automatically so test cases output predictable numbers!*\n\nSample Input:\n10\n\nSample Output:\nHeads: 5",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "import random\nrandom.seed(42) # Do not remove this line\n\nflips = int(input())\nheads_count = 0\n\n# Your loop here\n\nprint(f'Heads: {heads_count}')",
        "solution": "import random\nrandom.seed(42)\nflips = int(input())\nheads_count = 0\nfor _ in range(flips):\n    if random.random() < 0.5:\n        heads_count += 1\nprint(f'Heads: {heads_count}')",
        "hints": [
            "Use `for _ in range(flips):` to loop exactly `n` times.",
            "Inside the loop, use an `if random.random() < 0.5:` block to increment your `heads_count`."
        ],
        "testCases": [
            {"label": "10 Flips", "input": "10", "expectedOutput": "Heads: 5\n"},
            {"label": "100 Flips", "input": "100", "expectedOutput": "Heads: 49\n"},
            {"label": "1 Flip", "input": "1", "expectedOutput": "Heads: 0\n"}
        ]
    },
    {
        "id": "coin_sim",
        "title": "Python Coin Simulator",
        "description": "Let's use the random module to simulate 100 coin flips. We want to see if we get exactly 50 heads and 50 tails.\n\nYour program must:\n1. Use a loop to simulate 100 flips.\n2. Use `random.choice(['H', 'T'])` to pick Heads or Tails.\n3. Count the total number of Heads.\n4. Print ONLY the integer number of Heads.\n\n*Note: We've hardcoded a random seed so the output is predictable for grading.*\n\nSample Input:\n(no input needed, just run 100 iterations)\n\nSample Output:\n47",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "import random\nrandom.seed(10) # Do not remove\n\n# Your code here to simulate 100 flips\n",
        "solution": "import random\nrandom.seed(10)\nheads = 0\nfor _ in range(100):\n    if random.choice(['H', 'T']) == 'H':\n        heads += 1\nprint(heads)",
        "hints": [
            "You don't need any `input()` for this problem. Just write a `for` loop that runs 100 times.",
            "Keep a counter variable. If `random.choice(['H', 'T'])` returns `'H'`, increase the counter."
        ],
        "testCases": [
            {"label": "Run 100 flips", "input": "", "expectedOutput": "53\n"}
        ]
    },
    {
        "id": "dice_roll_exp_sim1",
        "title": "Dice Roll Experiment (Similar A)",
        "description": "If you roll a 6-sided die, the theoretical probability of rolling a '3' is 1/6. Let's test this experimentally!\n\nYour program must:\n1. Read an integer `n` representing the number of dice rolls.\n2. Simulate `n` rolls using `random.randint(1, 6)`.\n3. Count how many times a '3' is rolled.\n4. Print the final count in the format: `Rolled a 3 [X] times`\n\nSample Input:\n10\n\nSample Output:\nRolled a 3 1 times",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "import random\nrandom.seed(7) # Do not remove\n\nrolls = int(input())\ncount_of_threes = 0\n\n# Your loop here\n\nprint(f'Rolled a 3 {count_of_threes} times')",
        "solution": "import random\nrandom.seed(7)\nrolls = int(input())\ncount_of_threes = 0\nfor _ in range(rolls):\n    if random.randint(1, 6) == 3:\n        count_of_threes += 1\nprint(f'Rolled a 3 {count_of_threes} times')",
        "hints": [
            "Use `random.randint(1, 6)` to generate a number from 1 to 6 inclusive.",
            "Compare the result to `3` and increment your counter if they match."
        ],
        "testCases": [
            {"label": "10 Rolls", "input": "10", "expectedOutput": "Rolled a 3 1 times\n"},
            {"label": "60 Rolls", "input": "60", "expectedOutput": "Rolled a 3 11 times\n"},
            {"label": "0 Rolls", "input": "0", "expectedOutput": "Rolled a 3 0 times\n"}
        ]
    },
    {
        "id": "python_dice_sim2",
        "title": "Python Dice Simulator (Similar B)",
        "description": "Write Python using the random module to simulate rolling a 6-sided die exactly 1000 times.\n\nYour program must:\n1. Run a loop 1000 times.\n2. Use `random.randint(1, 6)` for each roll.\n3. Count how many times you roll a '6'.\n4. Print just that integer count.\n\n*Note: We've hardcoded a random seed so the output is predictable.*\n\nSample Output:\n163",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "import random\nrandom.seed(99) # Do not remove\n\n# Your code here to simulate 1000 rolls\n",
        "solution": "import random\nrandom.seed(99)\nsixes = 0\nfor _ in range(1000):\n    if random.randint(1, 6) == 6:\n        sixes += 1\nprint(sixes)",
        "hints": [
            "This is very similar to the coin flip simulator, but the loop runs 1000 times.",
            "Only count the iterations where `random.randint(1, 6) == 6`."
        ],
        "testCases": [
            {"label": "Run 1000 rolls", "input": "", "expectedOutput": "153\n"}
        ]
    }
]

# LECTURE 5
lectures[5] = [
    {
        "id": "simple_sudoku",
        "title": "Sudoku Row Validator",
        "description": "In Constraint Satisfaction, Sudoku requires each row to have exactly one of each digit (1-9). Let's validate a mini 1x3 Sudoku row (digits 1-3).\n\nYour program must:\n1. Read a comma-separated string of 3 integers (e.g., '1,2,3').\n2. Check if the numbers contain exactly one '1', one '2', and one '3'.\n3. Print 'Valid' if it satisfies the constraint, or 'Invalid' if it has duplicates or missing numbers.\n\nSample Input:\n1,2,3\n\nSample Output:\nValid",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "row_input = input().strip().split(',')\n\n# Convert strings to integers, or keep as strings and check for '1', '2', '3'\n# Your code here\n",
        "solution": "row_input = input().strip().split(',')\nif sorted(row_input) == ['1', '2', '3']:\n    print('Valid')\nelse:\n    print('Invalid')",
        "hints": [
            "You can use the `sorted()` function on the list and check if it equals `['1', '2', '3']`.",
            "Alternatively, use `if '1' in row_input and '2' in row_input and '3' in row_input:`."
        ],
        "testCases": [
            {"label": "Valid row", "input": "3,1,2", "expectedOutput": "Valid\n"},
            {"label": "Duplicate 1s", "input": "1,1,3", "expectedOutput": "Invalid\n"},
            {"label": "Wrong numbers", "input": "4,5,6", "expectedOutput": "Invalid\n"}
        ]
    },
    {
        "id": "hill_climbing_code",
        "title": "Hill Climbing Code",
        "description": "Write Python to find the local maximum value in a list by checking neighbors one step at a time (like Hill Climbing).\n\nYour program must:\n1. Read a comma-separated list of integers.\n2. Start at index 0.\n3. Compare the current value with the next value (index + 1).\n4. If the next value is strictly GREATER, move to it and repeat.\n5. If the next value is smaller or equal, STOP and print the current value.\n\nSample Input:\n1,3,7,5,8\n\nSample Output:\n7",
        "difficulty": "medium",
        "type": "coding",
        "starterCode": "nums = [int(x) for x in input().strip().split(',')]\ncurrent_idx = 0\n\n# Your loop here\n\nprint(nums[current_idx])",
        "solution": "nums = [int(x) for x in input().strip().split(',')]\ncurrent_idx = 0\nwhile current_idx < len(nums) - 1:\n    if nums[current_idx + 1] > nums[current_idx]:\n        current_idx += 1\n    else:\n        break\nprint(nums[current_idx])",
        "hints": [
            "Use a `while` loop to ensure `current_idx` doesn't go beyond `len(nums) - 1`.",
            "Compare `nums[current_idx + 1]` with `nums[current_idx]`. If greater, increment `current_idx`. Else, `break` the loop."
        ],
        "testCases": [
            {"label": "Peak in middle", "input": "1,3,7,5,8", "expectedOutput": "7\n"},
            {"label": "Peak at start", "input": "9,4,5", "expectedOutput": "9\n"},
            {"label": "Peak at end", "input": "1,2,3", "expectedOutput": "3\n"}
        ]
    },
    {
        "id": "crossword_constraint_sim1",
        "title": "Crossword Constraint Checker (Similar A)",
        "description": "In a crossword puzzle, if 1-Across and 1-Down intersect at the first letter, those first letters MUST be identical. Let's validate this constraint.\n\nYour program must:\n1. Read Word 1 (the Across word).\n2. Read Word 2 (the Down word).\n3. Check if the first character of Word 1 matches the first character of Word 2 (case-insensitive!).\n4. Print 'Constraint Satisfied' if they match, or 'Constraint Failed' if they do not.\n\nSample Input:\nfeline\nfire\n\nSample Output:\nConstraint Satisfied",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "word1 = input().strip().lower()\nword2 = input().strip().lower()\n\n# Your code here\n",
        "solution": "word1 = input().strip().lower()\nword2 = input().strip().lower()\nif word1[0] == word2[0]:\n    print('Constraint Satisfied')\nelse:\n    print('Constraint Failed')",
        "hints": [
            "Use string indexing `[0]` to grab the very first letter of each word.",
            "Ensure you apply `.lower()` to both words so that 'Feline' and 'fire' match correctly."
        ],
        "testCases": [
            {"label": "Match", "input": "feline\nfire", "expectedOutput": "Constraint Satisfied\n"},
            {"label": "No Match", "input": "cat\ndog", "expectedOutput": "Constraint Failed\n"},
            {"label": "Case match", "input": "Apple\nAnt", "expectedOutput": "Constraint Satisfied\n"}
        ]
    },
    {
        "id": "simulated_annealing_sim2",
        "title": "Simulated Annealing Concept (Similar B)",
        "description": "Simulated Annealing sometimes accepts worse moves to escape local maximums. Let's build the decision logic.\n\nYour program must:\n1. Read an integer for `current_value`.\n2. Read an integer for `next_value`.\n3. If `next_value` > `current_value`, print 'Accept' (we always take improvements!).\n4. If `next_value` <= `current_value`, print 'Maybe' (representing the random chance to accept a worse move).\n\nSample Input:\n10\n8\n\nSample Output:\nMaybe",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "current_value = int(input())\nnext_value = int(input())\n\n# Your code here\n",
        "solution": "current_value = int(input())\nnext_value = int(input())\nif next_value > current_value:\n    print('Accept')\nelse:\n    print('Maybe')",
        "hints": [
            "Use a simple `if/else` block.",
            "Check `next_value > current_value` for the 'Accept' condition."
        ],
        "testCases": [
            {"label": "Worse move", "input": "10\n8", "expectedOutput": "Maybe\n"},
            {"label": "Better move", "input": "5\n20", "expectedOutput": "Accept\n"},
            {"label": "Equal move", "input": "7\n7", "expectedOutput": "Maybe\n"}
        ]
    }
]

# LECTURE 6
lectures[6] = [
    {
        "id": "ml_workflow",
        "title": "ML Workflow Validator",
        "description": "In Machine Learning, it's critical that data is cleaned BEFORE training the model. Write a script to validate the order of workflow steps.\n\nYour program must:\n1. Read a comma-separated list of workflow steps from the user.\n2. Find the index of 'Clean Data' and the index of 'Train Model' in the list.\n3. If 'Clean Data' comes before 'Train Model', print 'Valid Workflow'.\n4. Otherwise (or if either is missing), print 'Invalid Workflow'.\n\nSample Input:\nCollect Data,Clean Data,Train Model,Test Model\n\nSample Output:\nValid Workflow",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "workflow = input().strip().split(',')\n\n# Your code here\n",
        "solution": "workflow = input().strip().split(',')\nif 'Clean Data' in workflow and 'Train Model' in workflow:\n    idx_clean = workflow.index('Clean Data')\n    idx_train = workflow.index('Train Model')\n    if idx_clean < idx_train:\n        print('Valid Workflow')\n    else:\n        print('Invalid Workflow')\nelse:\n    print('Invalid Workflow')",
        "hints": [
            "First verify that both strings exist in the list using the `in` operator.",
            "Use `.index('Clean Data')` to find its position in the list, and compare it to `.index('Train Model')`."
        ],
        "testCases": [
            {"label": "Valid order", "input": "Collect Data,Clean Data,Train Model", "expectedOutput": "Valid Workflow\n"},
            {"label": "Reversed order", "input": "Train Model,Clean Data", "expectedOutput": "Invalid Workflow\n"},
            {"label": "Missing step", "input": "Collect Data,Train Model", "expectedOutput": "Invalid Workflow\n"}
        ]
    },
    {
        "id": "simple_classifier_l6",
        "title": "Simple Number Classifier",
        "description": "Write Python code to classify a number entered by the user as Positive, Negative, or Zero.\n\nYour program must:\n1. Read an integer input.\n2. Apply the rules:\n   - Greater than 0 -> Print 'Positive'\n   - Less than 0 -> Print 'Negative'\n   - Exactly 0 -> Print 'Zero'\n\nSample Input:\n-5\n\nSample Output:\nNegative",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "number = int(input())\n\n# Your code here\n",
        "solution": "number = int(input())\nif number > 0:\n    print('Positive')\nelif number < 0:\n    print('Negative')\nelse:\n    print('Zero')",
        "hints": [
            "Use an `if / elif / else` block.",
            "Remember that 0 is neither positive nor negative."
        ],
        "testCases": [
            {"label": "Negative", "input": "-5", "expectedOutput": "Negative\n"},
            {"label": "Positive", "input": "100", "expectedOutput": "Positive\n"},
            {"label": "Zero", "input": "0", "expectedOutput": "Zero\n"}
        ]
    },
    {
        "id": "data_cleaning_sim1",
        "title": "Data Cleaner (Similar A)",
        "description": "Real world data is messy! Write a program that takes a 'dirty' string of data and cleans it up for a machine learning algorithm.\n\nYour program must:\n1. Read a string input.\n2. Strip all leading and trailing whitespace.\n3. Convert the entire string to lowercase.\n4. Replace all occurrences of the word 'error' with an empty string ''.\n5. Print the cleaned string.\n\nSample Input:\n   This ERROR is bad data   \n\nSample Output:\nthis  is bad data",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "dirty_data = input()\n\n# Your cleaning steps here\n",
        "solution": "dirty_data = input()\nclean = dirty_data.strip().lower().replace('error', '')\nprint(clean)",
        "hints": [
            "You can chain string methods together like `input().strip().lower()`.",
            "Use `.replace('error', '')` to remove the specific word."
        ],
        "testCases": [
            {"label": "Has errors and spaces", "input": "   This ERROR is bad data   ", "expectedOutput": "this  is bad data\n"},
            {"label": "Clean already", "input": "good data", "expectedOutput": "good data\n"},
            {"label": "Multiple errors", "input": "ERRORERROR", "expectedOutput": "\n"}
        ]
    },
    {
        "id": "simple_categorizer_sim2",
        "title": "Age Categorizer (Similar B)",
        "description": "Write a Python script that takes a user's age as input and categorizes them into life stages.\n\nYour program must:\n1. Read an integer age.\n2. Print 'Child' if under 13.\n3. Print 'Teen' if 13 to 19 (inclusive).\n4. Print 'Adult' if 20 or older.\n\nSample Input:\n15\n\nSample Output:\nTeen",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "age = int(input())\n\n# Your code here\n",
        "solution": "age = int(input())\nif age < 13:\n    print('Child')\nelif age <= 19:\n    print('Teen')\nelse:\n    print('Adult')",
        "hints": [
            "Since an `if age < 13` block catches all younger ages, the `elif` only needs to check `<= 19`.",
            "Use a final `else:` statement for Adults."
        ],
        "testCases": [
            {"label": "Teen", "input": "15", "expectedOutput": "Teen\n"},
            {"label": "Child", "input": "12", "expectedOutput": "Child\n"},
            {"label": "Adult boundary", "input": "20", "expectedOutput": "Adult\n"}
        ]
    }
]

# LECTURE 7
lectures[7] = [
    {
        "id": "draw_nn",
        "title": "3-Layer NN Simulator",
        "description": "Let's simulate a simple 3-layer neural network (Input -> Hidden -> Output).\n\nYour program must:\n1. Read a float value representing the Input Node.\n2. Calculate the Hidden Node value: `Input * 0.5`.\n3. Calculate the Output Node value: `Hidden * 0.8`.\n4. Print the final Output Node value exactly.\n\nSample Input:\n10.0\n\nSample Output:\n4.0",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "input_val = float(input())\n\n# Calculate hidden_val\n\n# Calculate output_val\n\n# Print output_val\n",
        "solution": "input_val = float(input())\nhidden_val = input_val * 0.5\noutput_val = hidden_val * 0.8\nprint(output_val)",
        "hints": [
            "You just need two multiplication steps in sequence.",
            "Store the result of the first multiplication in a variable so you can use it in the second."
        ],
        "testCases": [
            {"label": "Input 10", "input": "10.0", "expectedOutput": "4.0\n"},
            {"label": "Input 0", "input": "0.0", "expectedOutput": "0.0\n"},
            {"label": "Input 2.5", "input": "2.5", "expectedOutput": "1.0\n"}
        ]
    },
    {
        "id": "weighted_sum",
        "title": "Weighted Sum Calculator",
        "description": "Write Python to calculate a weighted sum of two inputs, like a neuron does.\n\nYour program must:\n1. Read Input 1 as a float. It has a weight of 0.5.\n2. Read Input 2 as a float. It has a weight of -0.2.\n3. Calculate the weighted sum: `(Input1 * 0.5) + (Input2 * -0.2)`.\n4. Print the final calculated sum.\n\nSample Input:\n10.0\n5.0\n\nSample Output:\n4.0",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "in1 = float(input())\nin2 = float(input())\n\n# Your code here\n",
        "solution": "in1 = float(input())\nin2 = float(input())\ntotal = (in1 * 0.5) + (in2 * -0.2)\nprint(total)",
        "hints": [
            "Multiply each input by its respective weight, then add them together.",
            "Be careful with the negative weight."
        ],
        "testCases": [
            {"label": "Standard", "input": "10.0\n5.0", "expectedOutput": "4.0\n"},
            {"label": "Both zero", "input": "0.0\n0.0", "expectedOutput": "0.0\n"},
            {"label": "Negative input", "input": "-10.0\n10.0", "expectedOutput": "-7.0\n"}
        ]
    },
    {
        "id": "activation_functions_sim1",
        "title": "ReLU Activation Function (Similar A)",
        "description": "A very common activation function in deep learning is ReLU (Rectified Linear Unit). It is very simple: if the input is greater than 0, it outputs the input. Otherwise, it outputs 0.\n\nYour program must:\n1. Read a float input.\n2. Apply the ReLU logic.\n3. Print the result.\n\nSample Input:\n-3.5\n\nSample Output:\n0.0",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "val = float(input())\n\n# Apply ReLU logic and print\n",
        "solution": "val = float(input())\nif val > 0:\n    print(val)\nelse:\n    print(0.0)",
        "hints": [
            "Use a simple `if val > 0:` block.",
            "You can use `max(0.0, val)` as a single-line trick if you know how it works!"
        ],
        "testCases": [
            {"label": "Negative", "input": "-3.5", "expectedOutput": "0.0\n"},
            {"label": "Positive", "input": "7.2", "expectedOutput": "7.2\n"},
            {"label": "Zero", "input": "0.0", "expectedOutput": "0.0\n"}
        ]
    },
    {
        "id": "nn_threshold_sim2",
        "title": "Step Activation Function (Similar B)",
        "description": "Write a Python script that acts like a simple Step Activation Function neuron.\n\nYour program must:\n1. Read a float representing a calculated 'weighted sum'.\n2. If the sum is greater than or equal to 0, print '1' (Activated).\n3. Otherwise, print '0' (Deactivated).\n\nSample Input:\n1.5\n\nSample Output:\n1",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "weighted_sum = float(input())\n\n# Your code here\n",
        "solution": "weighted_sum = float(input())\nif weighted_sum >= 0:\n    print('1')\nelse:\n    print('0')",
        "hints": [
            "Use the `>=` operator to check for 'greater than or equal to 0'.",
            "Make sure to print integers or strings '1' and '0'."
        ],
        "testCases": [
            {"label": "Positive", "input": "1.5", "expectedOutput": "1\n"},
            {"label": "Negative", "input": "-0.1", "expectedOutput": "0\n"},
            {"label": "Zero boundary", "input": "0.0", "expectedOutput": "1\n"}
        ]
    }
]

# LECTURE 8
lectures[8] = [
    {
        "id": "ask_chatgpt",
        "title": "Prompt Length Checker",
        "description": "In Prompt Engineering, providing enough context is crucial for good outputs. Write a script to validate prompt length.\n\nYour program must:\n1. Read a prompt string from the user.\n2. Count the number of characters in the string.\n3. If the length is strictly less than 15 characters, print 'Too short'.\n4. Otherwise, print 'Good prompt'.\n\nSample Input:\nhello\n\nSample Output:\nToo short",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "prompt = input().strip()\n\n# Your code here\n",
        "solution": "prompt = input().strip()\nif len(prompt) < 15:\n    print('Too short')\nelse:\n    print('Good prompt')",
        "hints": [
            "Use the `len()` function to find the number of characters in the string.",
            "Compare the length to 15 using `<`."
        ],
        "testCases": [
            {"label": "Short prompt", "input": "hello", "expectedOutput": "Too short\n"},
            {"label": "Long prompt", "input": "Please explain quantum physics.", "expectedOutput": "Good prompt\n"},
            {"label": "Exactly 14", "input": "fourteen chars", "expectedOutput": "Too short\n"}
        ]
    },
    {
        "id": "tokenize_sentence",
        "title": "Tokenize Sentence",
        "description": "Write Python to tokenize a sentence (split it into words) and count how many words it contains.\n\nYour program must:\n1. Read a sentence string from user input.\n2. Use the `.split()` method to separate it into words based on spaces.\n3. Print the total number of words as an integer.\n\nSample Input:\nHello world this is AI\n\nSample Output:\n5",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "sentence = input().strip()\n\n# Your code here\n",
        "solution": "sentence = input().strip()\ntokens = sentence.split()\nprint(len(tokens))",
        "hints": [
            "The `.split()` method on a string automatically turns it into a list of words.",
            "Use `len()` on the resulting list to get the word count."
        ],
        "testCases": [
            {"label": "Five words", "input": "Hello world this is AI", "expectedOutput": "5\n"},
            {"label": "One word", "input": "Python", "expectedOutput": "1\n"},
            {"label": "Empty string", "input": "", "expectedOutput": "0\n"}
        ]
    },
    {
        "id": "hallucination_check_sim1",
        "title": "Hallucination Filter (Similar A)",
        "description": "Sometimes LLMs hallucinate by asserting a fact while also expressing uncertainty. Let's write a simple filter rule.\n\nYour program must:\n1. Read a response string.\n2. Check if the string contains the exact phrase 'not sure' (case-insensitive).\n3. If it does, print 'Potential Hallucination'.\n4. Otherwise, print 'Clear response'.\n\nSample Input:\nI am not sure, but the capital is Paris.\n\nSample Output:\nPotential Hallucination",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "response = input().strip().lower()\n\n# Your code here\n",
        "solution": "response = input().strip().lower()\nif 'not sure' in response:\n    print('Potential Hallucination')\nelse:\n    print('Clear response')",
        "hints": [
            "Convert the response to `.lower()` before checking.",
            "Use the `in` keyword to see if the substring `'not sure'` exists."
        ],
        "testCases": [
            {"label": "Contains phrase", "input": "I am not sure, but the capital is Paris.", "expectedOutput": "Potential Hallucination\n"},
            {"label": "Does not contain", "input": "The capital is Paris.", "expectedOutput": "Clear response\n"},
            {"label": "Case variations", "input": "I am NOT SURE about this", "expectedOutput": "Potential Hallucination\n"}
        ]
    },
    {
        "id": "word_freq_counter_sim2",
        "title": "Word Frequency Counter (Similar B)",
        "description": "Write a Python script that takes a sentence and a target word as input. Tokenize the sentence and count how many times the exact target word appears.\n\nYour program must:\n1. Read the sentence string.\n2. Read the target word string.\n3. Split the sentence into a list of words.\n4. Count how many times the target word appears in the list (case-sensitive).\n5. Print the integer count.\n\nSample Input:\nthe cat and the dog\nthe\n\nSample Output:\n2",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "sentence = input().strip()\ntarget = input().strip()\n\n# Your code here\n",
        "solution": "sentence = input().strip()\ntarget = input().strip()\nwords = sentence.split()\ncount = words.count(target)\nprint(count)",
        "hints": [
            "Use `sentence.split()` to make a list of words.",
            "Lists have a built-in `.count()` method that counts exact matches!"
        ],
        "testCases": [
            {"label": "Matches 2", "input": "the cat and the dog\nthe", "expectedOutput": "2\n"},
            {"label": "Matches 0", "input": "the cat and the dog\nbird", "expectedOutput": "0\n"},
            {"label": "Case sensitive check", "input": "The cat and the dog\nthe", "expectedOutput": "1\n"}
        ]
    }
]

# LECTURE 9
# Keep original reflection types, but format hints nicely if missing.
# Wait, let's load Lecture 9 from file and just ensure they are reflections and keep their current IDs/titles.
# Actually, I'll define them here to be perfectly formatted.
lectures[9] = [
    {
        "id": "news_story_ai",
        "title": "News story about AI",
        "description": "Find one real news story about AI causing harm (e.g., bias, hallucination, deepfakes, or job displacement). Briefly summarize the story and the specific ethical issue it highlights.\n\nProvide your written answer in the code editor as comments.",
        "difficulty": "easy",
        "type": "reflection",
        "starterCode": "# Summarize your news story here:\n",
        "solution": "# Example: The Amazon recruiting AI that was biased against women's resumes. It highlighted the issue of historical training data creating algorithmic bias.",
        "hints": [
            "Search for terms like 'AI bias in hiring', 'deepfake controversies', or 'facial recognition errors'.",
            "Focus on what went wrong and why it is an ethical problem."
        ],
        "testCases": []
    },
    {
        "id": "medical_decisions_debate",
        "title": "Medical decisions debate",
        "description": "Discussion — Should AI be allowed to make medical diagnoses and treatment decisions without a human doctor reviewing them? Argue for or against, using at least two reasons.\n\nProvide your written answer in the code editor as comments.",
        "difficulty": "easy",
        "type": "reflection",
        "starterCode": "# Write your argument here:\n",
        "solution": "# Example: No, AI should not make decisions alone. Reason 1: If an AI makes a fatal mistake, accountability is unclear. Reason 2: AI lacks human empathy, which is crucial for bedside manner and patient trust.",
        "hints": [
            "Think about accountability: who gets sued if the AI is wrong?",
            "Consider the accuracy of AI versus human doctors, and the importance of human empathy."
        ],
        "testCases": []
    },
    {
        "id": "ai_education_sim1",
        "title": "AI in Education (Similar A)",
        "description": "How should schools handle generative AI tools like ChatGPT? Should they be completely banned, fully integrated into the curriculum, or something in between? State your opinion and one supporting reason.\n\nProvide your written answer in the code editor as comments.",
        "difficulty": "easy",
        "type": "reflection",
        "starterCode": "# Write your opinion here:\n",
        "solution": "# Example: Schools should integrate it. Reason: Students need to learn how to use these tools safely because they will be required in the future workforce.",
        "hints": [
            "Consider how difficult it is to actually enforce a total ban.",
            "Think about what skills students will need when they enter the modern workforce."
        ],
        "testCases": []
    },
    {
        "id": "autonomous_vehicles_sim2",
        "title": "Autonomous Vehicles Debate (Similar B)",
        "description": "If a self-driving car gets into an accident, who should be held legally responsible: the person sitting in the driver's seat, the software developer, or the car manufacturer? Defend your choice.\n\nProvide your written answer in the code editor as comments.",
        "difficulty": "easy",
        "type": "reflection",
        "starterCode": "# Defend your choice here:\n",
        "solution": "# Example: The manufacturer should be responsible if the car was in full autonomous mode, because the driver has handed over control to the company's system.",
        "hints": [
            "Think about whether the 'driver' actually had the ability to intervene in time.",
            "How does consumer trust factor into who takes the blame?"
        ],
        "testCases": []
    }
]

# LECTURE 10
lectures[10] = [
    {
        "id": "write_project_plan",
        "title": "Project Plan Validator",
        "description": "Write a script that validates if a project plan contains the required sections.\n\nYour program must:\n1. Read a multi-line project plan string from the user. (We will simulate this by reading a single long string).\n2. Check if the string contains the exact substrings: 'Input:', 'Output:', and 'Algorithm:'.\n3. If ALL THREE are present, print 'Plan Complete'.\n4. If any are missing, print 'Plan Incomplete'.\n\nSample Input:\nMy project. Input: images. Output: text. Algorithm: CNN.\n\nSample Output:\nPlan Complete",
        "difficulty": "medium",
        "type": "coding",
        "starterCode": "plan_text = input().strip()\n\n# Your code here\n",
        "solution": "plan_text = input().strip()\nif 'Input:' in plan_text and 'Output:' in plan_text and 'Algorithm:' in plan_text:\n    print('Plan Complete')\nelse:\n    print('Plan Incomplete')",
        "hints": [
            "Use the `in` operator multiple times combined with `and`.",
            "Make sure you match the case and colon exactly ('Input:')."
        ],
        "testCases": [
            {"label": "All present", "input": "My project. Input: images. Output: text. Algorithm: CNN.", "expectedOutput": "Plan Complete\n"},
            {"label": "Missing Algorithm", "input": "My project. Input: images. Output: text.", "expectedOutput": "Plan Incomplete\n"},
            {"label": "Empty", "input": "Nothing here", "expectedOutput": "Plan Incomplete\n"}
        ]
    },
    {
        "id": "ethical_consideration",
        "title": "Ethical consideration",
        "description": "Write one ethical consideration for your chosen project and explain it. For example, could it be biased? Could it be misused? How will you mitigate this?\n\nProvide your written answer in the code editor as comments.",
        "difficulty": "easy",
        "type": "reflection",
        "starterCode": "# Ethical consideration:\n# Mitigation:\n",
        "solution": "# Example: My face recognition app could be biased against certain demographics. I will mitigate this by ensuring my training data is highly diverse.",
        "hints": [
            "Think about the worst-case scenario if a malicious user got access to your project.",
            "Consider where your data comes from and if it represents everyone fairly."
        ],
        "testCases": []
    },
    {
        "id": "project_milestones_sim1",
        "title": "Milestone Tracker (Similar A)",
        "description": "Write a program that takes three project milestones and prints them in a formatted numbered list.\n\nYour program must:\n1. Read Milestone 1.\n2. Read Milestone 2.\n3. Read Milestone 3.\n4. Print them out as:\n   1. [Milestone 1]\n   2. [Milestone 2]\n   3. [Milestone 3]\n\nSample Input:\nGather Data\nTrain Model\nDeploy\n\nSample Output:\n1. Gather Data\n2. Train Model\n3. Deploy",
        "difficulty": "easy",
        "type": "coding",
        "starterCode": "m1 = input().strip()\nm2 = input().strip()\nm3 = input().strip()\n\n# Your code here\n",
        "solution": "m1 = input().strip()\nm2 = input().strip()\nm3 = input().strip()\nprint(f'1. {m1}')\nprint(f'2. {m2}')\nprint(f'3. {m3}')",
        "hints": [
            "Use three separate `print()` statements.",
            "Use f-strings to combine the number prefix with the variable."
        ],
        "testCases": [
            {"label": "Standard", "input": "Gather Data\nTrain Model\nDeploy", "expectedOutput": "1. Gather Data\n2. Train Model\n3. Deploy\n"},
            {"label": "Other tasks", "input": "Design\nCode\nTest", "expectedOutput": "1. Design\n2. Code\n3. Test\n"},
            {"label": "Short", "input": "A\nB\nC", "expectedOutput": "1. A\n2. B\n3. C\n"}
        ]
    },
    {
        "id": "bias_mitigation_sim2",
        "title": "Bias Mitigation (Similar B)",
        "description": "Imagine your AI model is accidentally producing biased results against a certain group. List two technical steps you could take to fix or mitigate this bias.\n\nProvide your written answer in the code editor as comments.",
        "difficulty": "easy",
        "type": "reflection",
        "starterCode": "# Mitigation Step 1:\n# Mitigation Step 2:\n",
        "solution": "# Example: Step 1: Collect more training data representing the underrepresented group. Step 2: Adjust the weights in the algorithm to penalize biased outcomes.",
        "hints": [
            "Think about fixing the DATA versus fixing the ALGORITHM.",
            "Can you measure the bias automatically during testing?"
        ],
        "testCases": []
    }
]

for num, data in lectures.items():
    file_path = os.path.join(base, f'lecture_{num-1}', 'problems.json') # lecture folder is zero-indexed!
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

print("SUCCESS")
