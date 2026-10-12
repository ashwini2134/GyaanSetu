import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, ChevronRight, Send, Loader2, Trophy, ShieldAlert, Check, Award, CheckSquare, Terminal, ArrowRight
} from 'lucide-react';
import { useAuth } from '../auth';
import { useProjectStatus } from '../hooks/useProjectStatus';
import { COURSE_FULL_NAMES } from '../data/courseNames';
import { authFetch } from '../authClient';
import ProjectOverviewCard from '../components/project/ProjectOverviewCard';
import StarterFilesStep from '../components/project/StarterFilesStep';
import FileGuideStep from '../components/project/FileGuideStep';
import CommonMistakesCard from '../components/project/CommonMistakesCard';
import GitHubGuideStep from '../components/project/GitHubGuideStep';
import TaskChecklist from '../components/project/TaskChecklist';
import TestLocallyStep from '../components/project/TestLocallyStep';
import SubmissionChecklist from '../components/project/SubmissionChecklist';
import ReviewPipelineStatus from '../components/project/ReviewPipelineStatus';
import { deriveMainFile } from '../components/project/deriveMainFile';

type MilestoneProject = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: string;
  estimatedTime: string;
  goal: string;
  features: string[];
  sampleFlow: string[];
  requirements: string[];
  guidelines: { title: string; description: string }[];
  evaluationChecklist: { label: string; description: string; check: (staticChecks: any[], dynamicChecks: any[]) => boolean }[];
  downloadUrl?: string;
};



type ProjectConfig = {
  isSequential: boolean;
  projects: MilestoneProject[];
};

const PROJECT_CONFIGS_LEGACY: Record<string, ProjectConfig> = {
  '2': {
    isSequential: false,
    projects: [
      {
    id: 'fundamentals-of-ai-degrees',
    title: 'Degrees',
    description: 'Write an AI to find the shortest path between two actors using Breadth-First Search.',
    skills: ['Search Algorithms', 'BFS', 'Graph Traversal', 'Python'],
    difficulty: 'Intermediate',
    estimatedTime: '2-4 Hours',
    goal: 'According to the Six Degrees of Kevin Bacon game, anyone in the Hollywood film industry can be connected to Kevin Bacon within six steps. You will use breadth-first search to find the shortest path between any two actors.',
    features: [
      'Load CSV data into memory',
      'Model the data as a graph',
      'Implement Breadth-First Search (BFS)',
      'Trace path back from target to source'
    ],
    sampleFlow: [
      'Download the small dataset distribution',
      'Review the provided data structures (Node, StackFrontier, QueueFrontier)',
      'Implement the shortest_path function in degrees.py',
      'Run the program to see the shortest path between two given actors'
    ],
    requirements: [
      'Complete the shortest_path function in degrees.py',
      'The function should return a list of (movie_id, person_id) tuples',
      'Your program should work for any two actors in the dataset',
      'Do not modify the existing data loading logic'
    ],
    guidelines: [
      { title: 'Data Structures', description: 'Use a QueueFrontier for Breadth-First Search. This guarantees finding the shortest path.' },
      { title: 'Node Representation', description: 'Each state is a person. The action is the movie they starred in to reach the next person.' },
      { title: 'Performance', description: 'Make sure you do not explore the same state multiple times by keeping track of an explored set.' }
    ],
    evaluationChecklist: [
      { label: 'shortest_path implemented', description: 'Returns correct sequence of movies and actors', check: () => true },
      { label: 'Uses BFS', description: 'Utilizes QueueFrontier for optimal path finding', check: () => true },
      { label: 'Handles disconnected actors', description: 'Returns None if no path exists', check: () => true }
    ],
    downloadUrl: '/data/fundamentals-of-ai/lecture_2/degrees/small.zip'
  },
  {
    id: 'fundamentals-of-ai-tictactoe',
    title: 'Tic-Tac-Toe',
    description: 'Write an AI to play Tic-Tac-Toe optimally using the Minimax algorithm.',
    skills: ['Adversarial Search', 'Minimax', 'Game Trees', 'Python'],
    difficulty: 'Intermediate',
    estimatedTime: '3-5 Hours',
    goal: 'Implement an AI that plays Tic-Tac-Toe optimally. The AI should never lose. If the human plays optimally, the game will tie. If the human makes a mistake, the AI will win.',
    features: [
      'Implement player(), actions(), result(), winner(), terminal(), utility(), and minimax()',
      'Ensure the AI plays optimally',
      'Optional: Implement Alpha-Beta Pruning for speed'
    ],
    sampleFlow: [
      'Download the tictactoe starter code and requirements.txt',
      'Install pygame via pip',
      'Implement the minimax algorithm and helper functions',
      'Play the game against your AI to verify it never loses'
    ],
    requirements: [
      'Complete all the missing functions in tictactoe.py',
      'Do not modify runner.py',
      'Your AI must play optimally (never lose)',
      'Your AI should evaluate game states correctly'
    ],
    guidelines: [
      { title: 'Minimax Logic', description: 'The max player tries to maximize the score, and the min player tries to minimize it.' },
      { title: 'Helper Functions', description: 'Implement terminal() and utility() first. Then build minimax() on top of them.' },
      { title: 'Alpha-Beta Pruning', description: 'If your AI takes too long to think, add alpha-beta pruning to speed it up.' }
    ],
    evaluationChecklist: [
      { label: 'Helper functions working', description: 'actions, result, winner, terminal, utility are correct', check: () => true },
      { label: 'Minimax implemented', description: 'AI makes optimal moves and never loses', check: () => true },
      { label: 'Plays correctly', description: 'Game logic properly ends with a win, loss, or tie', check: () => true }
    ],
    downloadUrl: '/data/fundamentals-of-ai/lecture_2/tictactoe/tictactoe.zip'
  }
    ]
  },
  '3': {
    isSequential: false,
    projects: [
  {
    id: 'fundamentals-of-ai-knights',
    title: 'Knights',
    description: 'Write a program to solve logic puzzles based on Knights and Knaves using propositional logic.',
    skills: ['Propositional Logic', 'Model Checking', 'Python'],
    difficulty: 'Intermediate',
    estimatedTime: '2-4 Hours',
    goal: 'Represent the rules of Knights and Knaves puzzles in propositional logic, and write a model-checking algorithm to solve them automatically.',
    features: [
      'Represent clues as logical sentences',
      'Use logical connectives (And, Or, Not, Implication, Biconditional)',
      'Run a model checking algorithm to find the unique solution'
    ],
    sampleFlow: [
      'Download the knights starter code',
      'Review logic.py to understand the logic representation',
      'Translate the puzzles into knowledge bases in puzzle.py',
      'Run the program to let the AI solve the puzzles'
    ],
    requirements: [
      'Complete the knowledge bases (knowledge0, knowledge1, knowledge2, knowledge3) in puzzle.py',
      'Do not modify logic.py',
      'Each knowledge base must contain the rules of the game and the specific spoken clues'
    ],
    guidelines: [
      { title: 'Game Rules', description: 'Every character is either a knight (always tells the truth) or a knave (always lies). They cannot be both.' },
      { title: 'Translating Clues', description: 'If character A says "I am a knight", that is a biconditional: A is a knight if and only if "I am a knight" is true.' },
      { title: 'Testing', description: 'The model checking algorithm should print exactly one solution per puzzle.' }
    ],
    evaluationChecklist: [
      { label: 'Puzzle 0 solved', description: 'AI correctly identifies characters in Puzzle 0', check: () => true },
      { label: 'Puzzle 3 solved', description: 'AI correctly identifies characters in the hardest puzzle', check: () => true },
      { label: 'Proper constraints', description: 'Rules of Knights and Knaves are included in every knowledge base', check: () => true }
    ],
    downloadUrl: '/data/fundamentals-of-ai/lecture_3/knights/knights.zip'
  },
  {
    id: 'fundamentals-of-ai-minesweeper',
    title: 'Minesweeper',
    description: 'Write an AI to play Minesweeper using propositional logic and inference.',
    skills: ['Knowledge Representation', 'Inference', 'Python'],
    difficulty: 'Hard',
    estimatedTime: '4-6 Hours',
    goal: 'Build a knowledge-based agent that plays Minesweeper. The AI will deduce which cells are safe and which contain mines based on the numbers revealed on the board.',
    features: [
      'Maintain a knowledge base of logical sentences',
      'Infer new safe cells and mines',
      'Make safe moves when possible, and random moves when necessary'
    ],
    sampleFlow: [
      'Download the minesweeper starter code and install pygame',
      'Implement the Sentence class methods for logic evaluation',
      'Implement the MinesweeperAI methods to manage knowledge and make moves',
      'Play the game with the AI button to watch it win automatically'
    ],
    requirements: [
      'Complete the Sentence class in minesweeper.py (known_mines, known_safes, mark_mine, mark_safe)',
      'Complete the MinesweeperAI class (add_knowledge, make_safe_move, make_random_move)',
      'Do not modify runner.py'
    ],
    guidelines: [
      { title: 'Subsets Inference', description: 'If set1 is a subset of set2, you can infer new rules by subtracting set1 from set2 and updating the mine count.' },
      { title: 'Updating Knowledge', description: 'When you deduce a mine or safe cell, you must update ALL sentences in the knowledge base that contain that cell.' },
      { title: 'Random Moves', description: 'Only make a random move if no safe moves are guaranteed. Never guess a cell known to be a mine.' }
    ],
    evaluationChecklist: [
      { label: 'Sentence methods work', description: 'Can correctly identify known mines and safe cells from a single sentence', check: () => true },
      { label: 'AI adds knowledge', description: 'add_knowledge correctly creates sentences and infers new information', check: () => true },
      { label: 'AI makes safe moves', description: 'The AI never blows up when a guaranteed safe move exists', check: () => true }
    ],
    downloadUrl: '/data/fundamentals-of-ai/lecture_3/minesweeper/minesweeper.zip'
  }
    ]
  },
  '4': {
    isSequential: false,
    projects: [
  {
    id: 'fundamentals-of-ai-pagerank',
    title: 'PageRank',
    description: 'Write an AI to rank web pages by importance.',
    skills: ['Probability', 'Markov Models', 'Python'],
    difficulty: 'Intermediate',
    estimatedTime: '2-4 Hours',
    goal: 'Implement a model of a random surfer to calculate the PageRank of web pages. Use both a sampling method and an iterative mathematical method.',
    features: [
      'Parse a corpus of HTML pages',
      'Implement the random surfer model using a Markov Chain',
      'Calculate probabilities through sampling',
      'Calculate exact probabilities iteratively'
    ],
    sampleFlow: [
      'Download the pagerank starter code',
      'Review the provided corpus data',
      'Implement transition_model, sample_pagerank, and iterate_pagerank',
      'Run the program to see page rankings for different corpora'
    ],
    requirements: [
      'Complete transition_model to return a probability distribution',
      'Complete sample_pagerank to estimate PageRank by sampling',
      'Complete iterate_pagerank to calculate PageRank iteratively',
      'Use DAMPING = 0.85 and SAMPLES = 10000 constants'
    ],
    guidelines: [
      { title: 'Damping Factor', description: 'With probability 0.85, the surfer chooses a link on the current page. With probability 0.15, the surfer chooses randomly among all pages.' },
      { title: 'Dead Ends', description: 'If a page has no links, assume it links to all pages in the corpus (including itself).' },
      { title: 'Convergence', description: 'The iterative algorithm stops when no PageRank value changes by more than 0.001.' }
    ],
    evaluationChecklist: [
      { label: 'Transition model correct', description: 'Correctly handles damping factor and dead ends', check: () => true },
      { label: 'Sampling approach works', description: 'Estimates match expected values closely', check: () => true },
      { label: 'Iterative approach works', description: 'Converges to the correct mathematical probabilities', check: () => true }
    ],
    downloadUrl: '/data/fundamentals-of-ai/lecture_4/pagerank/pagerank.zip'
  },
  {
    id: 'fundamentals-of-ai-heredity',
    title: 'Heredity',
    description: 'Write an AI to assess the likelihood a person has a genetic trait.',
    skills: ['Bayesian Networks', 'Inference', 'Python'],
    difficulty: 'Hard',
    estimatedTime: '3-5 Hours',
    goal: 'Implement a Bayesian Network to calculate the probability that a person has a specific gene mutation and exhibits a trait, based on their family tree.',
    features: [
      'Parse family tree data from CSV',
      'Use a Bayesian Network representing genes and traits',
      'Calculate joint probabilities',
      'Update marginal probabilities and normalize them'
    ],
    sampleFlow: [
      'Download the heredity starter code',
      'Understand the PROBS dictionary containing genetic probabilities',
      'Implement joint_probability, update, and normalize',
      'Run the program to see probability distributions for each person'
    ],
    requirements: [
      'Complete joint_probability to calculate the probability of a specific state',
      'Complete update to add a new joint probability to the existing distribution',
      'Complete normalize to ensure probabilities sum to 1'
    ],
    guidelines: [
      { title: 'Joint Probability', description: 'For anyone with parents in the dataset, their genes depend on their parents. For anyone without parents, use the unconditional probability.' },
      { title: 'Mutations', description: 'Remember that genes can mutate. A parent passing a gene might mutate (fail to pass), and a parent not passing a gene might mutate (pass it anyway).' },
      { title: 'Normalization', description: 'To normalize a dictionary of values, divide each value by the sum of all values.' }
    ],
    evaluationChecklist: [
      { label: 'Joint probability accurate', description: 'Correctly multiplies probabilities across the family tree', check: () => true },
      { label: 'Update function', description: 'Properly accumulates probabilities', check: () => true },
      { label: 'Normalization works', description: 'Final distributions sum exactly to 1.0', check: () => true }
    ],
    downloadUrl: '/data/fundamentals-of-ai/lecture_4/heredity/heredity.zip'
  }
    ]
  },
  '5': {
    isSequential: false,
    projects: [
      {
        id: 'fundamentals-of-ai-crossword',
        title: 'Crossword',
        description: 'Write an AI to generate crossword puzzles.',
        skills: ['Constraint Satisfaction', 'Search', 'Python'],
        difficulty: 'Hard',
        estimatedTime: '3-6 Hours',
        goal: 'Model the generation of a crossword puzzle as a Constraint Satisfaction Problem (CSP). Implement node consistency, arc consistency (AC3), and backtracking search to find a valid assignment of words to the puzzle structure.',
        features: [
          'Parse crossword structures and vocabulary lists',
          'Enforce unary constraints (node consistency)',
          'Enforce binary constraints (arc consistency)',
          'Solve the CSP using backtracking search'
        ],
        sampleFlow: [
          'Download the crossword starter code',
          'Implement enforce_node_consistency and revise',
          'Implement the ac3 algorithm for arc consistency',
          'Complete the assignment_complete and consistent checks',
          'Implement the backtrack search algorithm to solve the puzzle'
        ],
        requirements: [
          'Complete enforce_node_consistency to remove words that don\'t match variable lengths',
          'Complete revise to remove words from a domain that conflict with a neighbor',
          'Complete ac3 to enforce arc consistency across the entire puzzle',
          'Complete assignment_complete and consistent to check if a state is a valid solution',
          'Complete order_domain_values and select_unassigned_variable as heuristics',
          'Complete backtrack to perform the recursive search'
        ],
        guidelines: [
          { title: 'Node Consistency', description: 'A variable is node-consistent if every value in its domain has the correct length. Remove any values that don\'t match the variable\'s length.' },
          { title: 'Arc Consistency', description: 'Variable X is arc-consistent with Y if for every value in X\'s domain, there is a possible value for Y that doesn\'t cause a conflict (overlapping characters must match).' },
          { title: 'Heuristics', description: 'Use the Minimum Remaining Values (MRV) heuristic for selecting variables, and the Least Constraining Value (LCV) heuristic for ordering values to speed up search.' },
          { title: 'Dependencies', description: 'This project requires the Pillow library. Run pip3 install Pillow to install it before testing your code.' }
        ],
        evaluationChecklist: [
          { label: 'Consistency enforcement', description: 'Node and arc consistency correctly reduce domains', check: () => true },
          { label: 'Heuristics implemented', description: 'MRV and LCV properly order choices', check: () => true },
          { label: 'Backtracking succeeds', description: 'Algorithm finds valid puzzles without failing or running forever', check: () => true }
        ],
        downloadUrl: '/data/fundamentals-of-ai/lecture_5/crossword/crossword.zip'
      }
    ]
  },
  '6': {
    isSequential: false,
    projects: [
      {
        id: 'fundamentals-of-ai-shopping',
        title: 'Shopping',
        description: 'Write an AI to predict whether online shopping customers will complete a purchase.',
        skills: ['Machine Learning', 'Classification', 'Python'],
        difficulty: 'Medium',
        estimatedTime: '2-4 Hours',
        goal: 'Train a nearest-neighbor classifier (k=1) using scikit-learn\'s KNeighborsClassifier to predict online shopping purchase behavior based on customer session data.',
        features: [
          'Load and process a dataset of shopping sessions',
          'Map categorical features to numerical values',
          'Train a k-nearest neighbor classifier',
          'Evaluate model sensitivity and specificity'
        ],
        sampleFlow: [
          'Download the shopping starter code and dataset',
          'Implement load_data to parse the CSV file',
          'Implement train_model to fit the classifier',
          'Implement evaluate to calculate true positive and true negative rates',
          'Run the model and verify its accuracy metrics'
        ],
        requirements: [
          'Complete load_data to return a tuple (evidence, labels) formatted correctly',
          'Convert string categories (like month names, VisitorType, and boolean values) to proper integers/floats',
          'Complete train_model to return an instantiated, trained KNeighborsClassifier with k=1',
          'Complete evaluate to calculate sensitivity (True Positive Rate) and specificity (True Negative Rate)'
        ],
        guidelines: [
          { title: 'Data Formatting', description: 'Be meticulous about converting types. Evidence lists should contain ints or floats, and labels should be 1 (True) or 0 (False).' },
          { title: 'Sensitivity', description: 'Sensitivity is the proportion of actual positive cases (made a purchase) that were correctly identified.' },
          { title: 'Specificity', description: 'Specificity is the proportion of actual negative cases (did not purchase) that were correctly identified.' },
          { title: 'Dependencies', description: 'This project requires the scikit-learn library. Run pip3 install scikit-learn to install it.' }
        ],
        evaluationChecklist: [
          { label: 'Data loading is robust', description: 'Correctly parses CSV strings into appropriate numeric types', check: () => true },
          { label: 'Classifier trains correctly', description: 'Model is fit onto the training data successfully', check: () => true },
          { label: 'Evaluation metrics accurate', description: 'Calculates exact sensitivity and specificity', check: () => true }
        ],
        downloadUrl: '/data/fundamentals-of-ai/lecture_6/shopping/shopping.zip'
      },
      {
        id: 'fundamentals-of-ai-nim',
        title: 'Nim',
        description: 'Write an AI that teaches itself to play Nim through reinforcement learning.',
        skills: ['Reinforcement Learning', 'Q-Learning', 'Python'],
        difficulty: 'Hard',
        estimatedTime: '3-6 Hours',
        goal: 'Implement a Q-learning agent that learns to play the game of Nim by playing against itself and updating its Q-values based on rewards.',
        features: [
          'Calculate Q-values for state-action pairs',
          'Implement the Q-learning update equation',
          'Determine the best future reward from a state',
          'Choose actions using an epsilon-greedy strategy'
        ],
        sampleFlow: [
          'Download the nim starter code',
          'Implement get_q_value to fetch or initialize values',
          'Implement update_q_value with the Q-learning formula',
          'Implement best_future_reward to look ahead one step',
          'Implement choose_action to balance exploration and exploitation',
          'Train the AI by playing 10,000 games and challenge it'
        ],
        requirements: [
          'Complete get_q_value to return the current Q-value for a given state and action (default 0)',
          'Complete update_q_value using the old Q-value, reward, and future reward',
          'Complete best_future_reward to return the maximum possible Q-value from all available actions',
          'Complete choose_action using epsilon-greedy: explore with probability epsilon, else exploit the best action'
        ],
        guidelines: [
          { title: 'States and Actions', description: 'States are represented as lists (piles). Actions are tuples (pile_index, count).' },
          { title: 'Epsilon-Greedy', description: 'Generate a random number. If it is less than epsilon, choose randomly. Otherwise, choose the action with the highest Q-value.' },
          { title: 'Q-Learning Formula', description: 'Q(s, a) <- Q(s, a) + alpha * (reward + gamma * max(Q(s\', a\')) - Q(s, a))' }
        ],
        evaluationChecklist: [
          { label: 'Q-values initialize to zero', description: 'Unseen state-action pairs default to 0', check: () => true },
          { label: 'Q-learning update formula', description: 'Accurately applies alpha, gamma, and rewards', check: () => true },
          { label: 'Epsilon-greedy choice', description: 'Correctly balances random actions vs best actions', check: () => true }
        ],
        downloadUrl: '/data/fundamentals-of-ai/lecture_6/nim/nim.zip'
      }
    ]
  },
  '7': {
    isSequential: false,
    projects: [
      {
        id: 'fundamentals-of-ai-traffic',
        title: 'Traffic',
        description: 'Write an AI to identify which traffic sign appears in a photograph.',
        skills: ['Deep Learning', 'Computer Vision', 'TensorFlow', 'Python'],
        difficulty: 'Hard',
        estimatedTime: '4-8 Hours',
        goal: 'Train a compiled Keras neural network to classify road signs from the German Traffic Sign Recognition Benchmark (GTSRB) dataset using convolutional neural networks (CNNs).',
        features: [
          'Load and resize thousands of images using OpenCV',
          'Design a neural network architecture with convolutional and pooling layers',
          'Add hidden layers and dropout to prevent overfitting',
          'Compile and train the model on image categories',
          'Document the experimentation process in a README.md'
        ],
        sampleFlow: [
          'Download the traffic starter code and the GTSRB dataset',
          'Implement load_data to read and resize all images',
          'Implement get_model to build and compile the CNN',
          'Experiment with different layers, sizes, and dropout rates',
          'Write a README.md explaining your design choices and results'
        ],
        requirements: [
          'Complete load_data: return a tuple (images, labels) where images is a list of numpy arrays, and labels is a list of integers representing categories',
          'Images must be resized to exactly EPOCHS (defined as 30x30 in starter code)',
          'Complete get_model: return a compiled Keras neural network model',
          'The model must have an output layer with NUM_CATEGORIES units and softmax activation',
          'Include a README.md file documenting the architecture choices (layers, node counts, dropout)'
        ],
        guidelines: [
          { title: 'Dataset Note', description: 'The GTSRB dataset is quite large. Download it separately using the link provided in the course instructions. Do not attempt to push the dataset to GitHub.' },
          { title: 'OpenCV Basics', description: 'Use cv2.imread to read images and cv2.resize to resize them to the required dimensions.' },
          { title: 'Overfitting', description: 'If your training accuracy is high but testing accuracy is low, your model might be overfitting. Try adding a Dropout layer.' },
          { title: 'Dependencies', description: 'This project requires opencv-python, scikit-learn, and tensorflow. Run pip3 install -r requirements.txt.' }
        ],
        evaluationChecklist: [
          { label: 'Image loading', description: 'load_data successfully parses and resizes all categories', check: () => true },
          { label: 'Model compiles', description: 'get_model returns a valid compiled keras Sequential model', check: () => true },
          { label: 'Documentation', description: 'README.md exists and explains the design process', check: () => true }
        ],
        downloadUrl: '/data/fundamentals-of-ai/lecture_7/traffic/traffic.zip'
      }
    ]
  }
};



const SKILLS_MASTERED = [
  'Search Algorithms', 'Propositional Logic', 'Inference', 'Machine Learning',
  'NLP', 'Optimization', 'CSP', 'Heuristics', 'Model Evaluation',
];

const STEPS = ['Choose Project', 'Before You Begin', 'Open the Project', 'Requirements', 'Submit Project'] as const;
type Step = typeof STEPS[number];


const LECTURE_PROJECT_MAP: Record<string, { isSequential: boolean; projectIds: string[] }> = {
  '2': { isSequential: true, projectIds: ['cs50ai-degrees', 'cs50ai-tictactoe'] },
  '3': { isSequential: true, projectIds: ['fundamentals-of-ai-knights', 'fundamentals-of-ai-minesweeper'] },
  '4': { isSequential: true, projectIds: ['fundamentals-of-ai-pagerank', 'fundamentals-of-ai-heredity'] },
  '5': { isSequential: false, projectIds: ['fundamentals-of-ai-crossword'] },
  '6': { isSequential: true, projectIds: ['fundamentals-of-ai-shopping', 'fundamentals-of-ai-nim'] },
  '7': { isSequential: false, projectIds: ['fundamentals-of-ai-traffic'] }
};

const EVALUATION_CHECKS: Record<string, Record<string, Function>> = {
  'cs50ai-degrees': {
    'shortest_path implemented': () => true,
    'Uses BFS': () => true,
    'Handles disconnected actors': () => true
  },
  'cs50ai-tictactoe': {
    'Helper functions working': () => true,
    'Minimax implemented': () => true,
    'Plays correctly': () => true
  },
  'fundamentals-of-ai-knights': {
    'Puzzle 0 solved': () => true,
    'Puzzle 3 solved': () => true,
    'Proper constraints': () => true
  },
  'fundamentals-of-ai-minesweeper': {
    'Sentence methods work': () => true,
    'AI adds knowledge': () => true,
    'AI makes safe moves': () => true
  },
  'fundamentals-of-ai-pagerank': {
    'Transition model correct': () => true,
    'Sampling approach works': () => true,
    'Iterative approach works': () => true
  },
  'fundamentals-of-ai-heredity': {
    'Joint probability accurate': () => true,
    'Update function': () => true,
    'Normalization works': () => true
  },
  'fundamentals-of-ai-crossword': {
    'Consistency enforcement': () => true,
    'Heuristics implemented': () => true,
    'Backtracking succeeds': () => true
  },
  'fundamentals-of-ai-shopping': {
    'Data loading is robust': () => true,
    'Classifier trains correctly': () => true,
    'Evaluation metrics accurate': () => true
  },
  'fundamentals-of-ai-nim': {
    'Q-values initialize to zero': () => true,
    'Q-learning update formula': () => true,
    'Epsilon-greedy choice': () => true
  },
  'fundamentals-of-ai-traffic': {
    'Image loading': () => true,
    'Model compiles': () => true,
    'Documentation': () => true
  }
};

async function fetchProjectTemplates(projectIds: string[]): Promise<MilestoneProject[]> {
  const projects: MilestoneProject[] = [];
  for (const id of projectIds) {
    try {
      const template = await authFetch<any>(`/projects/templates/${id}`);
      if (template) {
        const checks = EVALUATION_CHECKS[id] || {};
        
        const adapted: MilestoneProject = {
          id: template.id,
          title: template.title,
          description: template.shortDescription,
          skills: template.technologies || [],
          difficulty: template.difficulty,
          estimatedTime: template.estimatedDuration || '2-4 Hours',
          goal: template.longDescription,
          features: template.features || [],
          sampleFlow: template.instructions || [],
          requirements: template.instructions || [],
          guidelines: template.guidelines || [],
          evaluationChecklist: (template.evaluationChecklist || []).map((chk: any) => ({
            label: chk.label,
            description: chk.description,
            check: checks[chk.label] || (() => true)
          })),
          downloadUrl: template.downloadUrl || undefined
        };
        projects.push(adapted);
      }
    } catch (e) {
      console.error("Failed to fetch project template", id, e);
    }
  }
  return projects;
}


export default function MilestonePage() {
  const { slug, number } = useParams<{ slug: string; number: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  
  const [config, setConfig] = useState<{ isSequential: boolean; projects: MilestoneProject[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<Step>('Choose Project');
  const [selected, setSelected] = useState<MilestoneProject | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionReady, setSubmissionReady] = useState(false);
  const mainFile = selected ? deriveMainFile([selected.requirements[0], selected.description]) : null;

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      setIsLoading(true);
      const lectureKey = number || '2';
      const mapping = LECTURE_PROJECT_MAP[lectureKey] || LECTURE_PROJECT_MAP['2'];
      const fetchedProjects = await fetchProjectTemplates(mapping.projectIds);
      
      if (mounted) {
        setConfig({
          isSequential: mapping.isSequential,
          projects: fetchedProjects
        });
        setIsLoading(false);
      }
    }
    loadProjects();
    return () => { mounted = false; };
  }, [number]);

  const PROJECTS = config?.projects || [];
  const isSequential = config?.isSequential || false;
  const projectId1 = PROJECTS[0]?.id;
  const projectId2 = PROJECTS.length > 1 ? PROJECTS[1].id : 'none';
  
  const project1Status = useProjectStatus(projectId1 || 'none');
  const project2Status = useProjectStatus(projectId2 || 'none');

  // "Submitted" means any real status other than the frontend's NOT_SUBMITTED
  // sentinel — not just APPROVED/PENDING, otherwise the gate flickers locked
  // again the moment the AI review picks the submission up (PENDING ->
  // REVIEWING) or stays locked forever after a REJECTED/ERROR review.
  const isProject1Completed =
    !!project1Status.submission && project1Status.submission.status !== 'NOT_SUBMITTED';
  const isProject2Completed =
    PROJECTS.length === 1 || (!!project2Status.submission && project2Status.submission.status !== 'NOT_SUBMITTED');

  const bothCompleted = isProject1Completed && isProject2Completed;

  const activeStatus = selected?.id === projectId1 ? project1Status : project2Status;
  const isSubmitted = !!activeStatus?.submission && activeStatus.submission.status !== 'NOT_SUBMITTED';
  const isSubmitting = activeStatus?.loading;

  const submitError = activeStatus?.error;
  
  const handleSubmitProject = async () => {
    if (!selected || !githubUrl || isSubmitted) return;
    try {
      await activeStatus.submitProject(githubUrl, "Milestone submission");
      if (isSequential && selected.id === projectId1) {
        const nextProject = PROJECTS.find(p => p.id === projectId2);
        if (nextProject) setSelected(nextProject);
        setStep('Choose Project');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (bothCompleted) {
      const timer = setTimeout(() => {
        const nextLectureNum = parseInt(number || '1') + 1;
        navigate(`/course/${slug}/lecture/${nextLectureNum}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [bothCompleted, navigate]);

  
  

  // Handle selected project changes
  useEffect(() => {
    if (selected) {
      setGithubUrl('');
    }
  }, [selected]);

  const stepIdx = STEPS.indexOf(step);

  const difficultyStyles: Record<string, string> = {
    'Beginner': 'bg-[rgba(34,197,94,0.1)] text-[var(--success)] border-[rgba(34,197,94,0.2)]',
    'Easy': 'bg-[rgba(34,197,94,0.1)] text-[var(--success)] border-[rgba(34,197,94,0.2)]',
    'Medium': 'bg-[rgba(34,197,94,0.1)] text-[var(--success)] border-[rgba(34,197,94,0.2)]',
    'Intermediate': 'bg-[rgba(0,191,179,0.1)] text-[var(--brand-primary)] border-[rgba(0,191,179,0.2)]',
    'Hard': 'bg-[rgba(59,130,246,0.1)] text-[var(--info)] border-[rgba(59,130,246,0.2)]',
    'Advanced': 'bg-[rgba(59,130,246,0.1)] text-[var(--info)] border-[rgba(59,130,246,0.2)]',
  };

  function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const s = difficultyStyles[difficulty] || difficultyStyles['Intermediate'];
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s} border uppercase`}>
        {difficulty}
      </span>
    );
  }

  function goNext() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }

  function goPrev() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }

  

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* ── Top Bar ── */}
      <header className="border-b border-[var(--border-light)] bg-[var(--surface-card)]/80 backdrop-blur-md flex-shrink-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/course/${slug}`)}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 bg-[var(--surface-container)] hover:bg-[var(--surface-card-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-light)] font-medium"
          >
            <ArrowLeft size={14} />
            Back to Course
          </button>

          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => i <= stepIdx && setStep(s)}
                  disabled={i > stepIdx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < stepIdx
                      ? 'bg-[var(--brand-primary)] text-white'
                      : i === stepIdx
                      ? 'bg-[var(--brand-primary)] text-white ring-4 ring-[var(--brand-primary)]/20'
                      : 'bg-transparent text-[var(--text-muted)] border-2 border-[var(--border-light)] cursor-not-allowed'
                  }`}
                >
                  {i < stepIdx ? <Check size={14} strokeWidth={3} /> : i + 1}
                </button>
                <span className={`ml-2 text-xs font-medium hidden sm:inline ${
                  i <= stepIdx ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                }`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 mx-2 ${i < stepIdx ? 'bg-[var(--brand-primary)]/40' : 'bg-[var(--border-light)]'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="w-[100px]" />
        </div>
      </header>

      {/* ── Step 1: Choose Project ── */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center bg-[var(--surface-page)]">
          <Loader2 className="animate-spin text-[var(--brand-primary)]" size={48} />
        </div>
      )}
      {!isLoading && step === 'Choose Project' && (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F8FCFD] to-[#EEF8FA]">
          <div className="max-w-5xl mx-auto px-6 py-12">
            {isSubmitted && (
              <div className="mb-8 bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-2xl p-4 flex items-start gap-3">
                <ShieldAlert className="text-[var(--warning)] shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Project Already Submitted</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                    You have already submitted this project. Please proceed to the next required project to complete the milestone.
                  </p>
                </div>
              </div>
            )}

            {/* ── Hero Section ── */}
            <div className="relative overflow-hidden mb-16">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--brand-primary)]/[0.06] rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative text-center">
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand-primary)] bg-[rgba(0,191,179,0.08)] px-4 py-1.5 rounded-full border border-[rgba(0,191,179,0.2)]">
                  Milestone Challenge
                </span>
                <h1 className="text-4xl font-extrabold mt-5 tracking-tight">
                  Select Your <span className="text-[var(--brand-primary)]">Milestone</span>
                </h1>
                <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed mt-3">
                  Demonstrate your AI knowledge. Select one of the projects below to complete and submit via GitHub.
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-3xl mx-auto">
                  {SKILLS_MASTERED.map(s => (
                    <span key={s} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--surface-container)] border border-[var(--border-light)] px-3.5 py-2 rounded-xl transition-all hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] cursor-default">
                      <CheckCircle size={13} className="text-[var(--success)]" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Project Cards ── */}
            <div className={`grid gap-6 ${PROJECTS.length === 1 ? 'max-w-2xl mx-auto' : 'md:grid-cols-2'}`}>
              {PROJECTS.map(p => {
                const isSelected = selected?.id === p.id;
                const isLocked = !isAdmin && isSequential && p.id === projectId2 && !isProject1Completed;
                return (
                  <div
                    key={p.id}
                    onClick={() => !isLocked && setSelected(p)}
                    className={`rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[var(--brand-primary)] bg-[var(--surface-card)] shadow-[0_0_30px_rgba(0,191,179,0.12)]'
                        : isLocked
                        ? 'border-[var(--border-medium)] bg-[var(--surface-card)] opacity-50 cursor-not-allowed'
                        : 'border-[var(--border-medium)] bg-[var(--surface-card)] hover:-translate-y-1.5 hover:shadow-lg hover:border-[var(--brand-primary)]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{p.title}</h3>
                        <DifficultyBadge difficulty={p.difficulty} />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-5">{p.description}</p>
                      
                      <div className="mb-5">
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">Key Concepts</span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.skills.map(s => (
                            <span key={s} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[var(--surface-container)] text-[var(--text-secondary)] border border-[var(--border-light)]">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); if (!isLocked) setSelected(p); }}
                      disabled={isLocked}
                      className={`w-full text-xs font-bold py-3 rounded-xl transition-all border ${
                        isLocked
                          ? 'bg-[var(--surface-container)] text-[var(--text-muted)] border-[var(--border-light)] cursor-not-allowed'
                          : isSelected
                          ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-md shadow-[var(--brand-primary)]/20'
                          : 'bg-white text-[var(--text-primary)] border-[var(--border-medium)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
                      }`}
                    >
                      {isLocked ? 'Locked' : (isSelected ? 'Selected' : 'Select Project')}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Selected Project Details ── */}
            {selected && (
              <div className="mt-8 bg-[var(--surface-card)] border border-[var(--border-medium)] rounded-2xl p-6 shadow-sm">
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Estimated Time</span>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mt-1.5">{selected.estimatedTime}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Difficulty</span>
                    <div className="mt-1.5"><DifficultyBadge difficulty={selected.difficulty} /></div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Skills</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selected.skills.map(s => (
                        <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--surface-container)] text-[var(--text-secondary)] border border-[var(--border-light)]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">What You'll Build</span>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{selected.goal.slice(0, 100)}...</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--border-light)]">
              <p className="text-xs text-[var(--text-muted)]">
                {selected ? `${selected.title} selected` : 'Select a project to continue'}
              </p>
              <button
                onClick={goNext}
                disabled={!selected}
                className={`inline-flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl transition-all ${
                  selected 
                    ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white shadow-md shadow-[var(--brand-primary)]/20' 
                    : 'bg-[var(--surface-container)] text-[var(--text-muted)] border border-[var(--border-light)] cursor-not-allowed'
                }`}
              >
                Before You Begin
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Before You Begin ── */}
      {step === 'Before You Begin' && selected && (
        <div className="flex-1 overflow-y-auto bg-[var(--surface-page)]">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
            <ProjectOverviewCard
              title={selected.title}
              goal={selected.goal}
              skills={selected.skills}
              difficulty={selected.difficulty}
              estimatedTime={selected.estimatedTime}
              framing="milestone"
            />
            <StarterFilesStep downloadUrl={selected.downloadUrl} mainFile={mainFile} />
            <div className="flex items-center justify-between pt-2">
              <button onClick={goPrev} className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-white hover:bg-[var(--surface-card-hover)] px-4 py-2 rounded-xl border border-[var(--border-medium)]">
                &larr; Switch Project
              </button>
              <button onClick={goNext} className="inline-flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white shadow-md shadow-[var(--brand-primary)]/20 transition-all">
                Open the Project <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Open the Project ── */}
      {step === 'Open the Project' && selected && (
        <div className="flex-1 overflow-y-auto bg-[var(--surface-page)]">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
            <FileGuideStep mainFile={mainFile} />
            <GitHubGuideStep />
            <CommonMistakesCard />
            <div className="flex items-center justify-between pt-2">
              <button onClick={goPrev} className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-white hover:bg-[var(--surface-card-hover)] px-4 py-2 rounded-xl border border-[var(--border-medium)]">
                &larr; Back
              </button>
              <button onClick={goNext} className="inline-flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white shadow-md shadow-[var(--brand-primary)]/20 transition-all">
                Configure Requirements <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Requirements ── */}
      {step === 'Requirements' && (
        <div className="flex-1 overflow-y-auto bg-[var(--surface-page)]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-10 text-center md:text-left">
              <span className="text-xs text-[var(--brand-primary)] font-bold uppercase tracking-widest">Requirements & Scope</span>
              <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">{selected?.title}</h2>
            </div>

            <div className="space-y-8">
              <div className="bg-[var(--surface-card)] border border-[var(--border-medium)] p-6 rounded-2xl shadow-sm">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Core Objective</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">{selected?.goal}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckSquare size={14} className="text-[var(--brand-primary)]" />
                    Technical Checklist
                  </h3>
                  <div className="space-y-3">
                    {selected?.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-1.5 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Terminal size={14} className="text-[var(--brand-primary)]" />
                    Expected Program Execution Flow
                  </h3>
                  <div className="space-y-3">
                    {selected?.sampleFlow.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                        <span className="font-bold text-[var(--brand-primary)] min-w-[14px]">{i + 1}.</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selected && <TaskChecklist projectId={selected.id} tasks={selected.requirements} />}
              <TestLocallyStep mainFile={mainFile} />
            </div>

            <div className="flex items-center justify-between mt-12 pt-6 border-t border-[var(--border-light)]">
              <button
                onClick={goPrev}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-white hover:bg-[var(--surface-card-hover)] px-4 py-2 rounded-xl border border-[var(--border-medium)]"
              >
                &larr; Back
              </button>
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white shadow-md shadow-[var(--brand-primary)]/20 transition-all"
              >
                Submit Project
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Submit Project ── */}
      {!isLoading && step === 'Submit Project' && (
        <div className="flex-1 overflow-y-auto bg-[var(--surface-page)] p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Project Summary Card */}
            <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{selected?.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{selected?.description}</p>
                </div>
                {selected && <DifficultyBadge difficulty={selected.difficulty} />}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selected?.skills.map(skill => (
                  <span key={skill} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[var(--surface-container)] text-[var(--text-secondary)] border border-[var(--border-light)]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements Summary */}
            <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Requirements</h4>
              <ul className="space-y-2">
                {selected?.requirements.map((req, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                    <CheckCircle size={14} className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!isSubmitted && <SubmissionChecklist onAllChecked={setSubmissionReady} />}

            {/* GitHub Submission Form */}
            <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">Submit Your Project</h4>
              <p className="text-xs text-[var(--text-secondary)] mb-5">
                Push your completed project to a GitHub repository and submit the link below.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-username/your-repo"
                    className="w-full bg-[var(--surface-card)] border border-[var(--border-medium)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)]/40"
                    disabled={isSubmitted}
                  />
                  {githubUrl && !/^https:\/\/github\.com\//.test(githubUrl) && (
                    <p className="text-xs text-[var(--danger)] mt-1.5">URL must start with https://github.com/</p>
                  )}
                  {!isSubmitted && !submissionReady && (
                    <p className="text-xs text-[var(--text-muted)] mt-1.5">Check off everything above before you can submit.</p>
                  )}
                </div>

                <button
                  onClick={handleSubmitProject}
                  disabled={isSubmitted || !githubUrl || isSubmitting || !submissionReady}
                  className={`w-full flex items-center justify-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all ${
                    isSubmitted
                      ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30 cursor-default'
                      : !githubUrl || isSubmitting || !submissionReady
                      ? 'bg-[var(--surface-container)] text-[var(--text-muted)] border border-[var(--border-light)] cursor-not-allowed'
                      : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white border border-[var(--brand-primary)] shadow-md shadow-[var(--brand-primary)]/20'
                  }`}
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  ) : isSubmitted ? (
                    <><CheckCircle size={16} /> Project Submitted</>
                  ) : (
                    <><Send size={16} /> Submit Project</>
                  )}
                </button>

                {submitError && (
                  <div className="p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
                    {submitError}
                  </div>
                )}
              </div>
            </div>

            <ReviewPipelineStatus
              status={activeStatus?.submission?.status}
              feedback={activeStatus?.submission?.feedback}
              score={activeStatus?.submission?.score}
            />

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={goPrev}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-lg border border-[var(--border-medium)] hover:border-[var(--brand-primary)]/50 transition-all bg-white"
              >
                &larr; Back to Requirements
              </button>
            </div>
          </div>
        </div>
      )}

      {bothCompleted && !(step as string).startsWith('Certificate') && (
        <div className="mt-8 mx-auto max-w-4xl w-[calc(100%-3rem)] p-6 rounded-2xl bg-[var(--success)]/10 border border-[var(--success)]/20 text-center">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center justify-center gap-2">
            <CheckCircle className="text-[var(--success)]" /> All Milestones Completed
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">You have successfully submitted all milestone projects for this lecture.</p>
          <button
            onClick={() => navigate('/course/fundamentals-of-ai/lecture/3')}
            className="flex items-center justify-center gap-2 mx-auto px-8 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white font-bold transition-all shadow-md shadow-[var(--brand-primary)]/20"
          >
            Continue to Next Lecture <ArrowRight size={18} />
          </button>
        </div>
      )}
      
      {/* ── Step 4: Submit/Certificate Summary ── */}
      {(step as string) === 'Certificate' && (
        <div className="flex-1 overflow-y-auto bg-[var(--surface-page)] flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-4xl w-full space-y-8 py-10">
            {false ? (
              <div className="space-y-6">
                {/* Certificate Widget */}
                <div className="bg-[var(--surface-card)] rounded-2xl border-2 border-[var(--warning)]/40 p-8 shadow-[0_15px_40px_rgba(245,158,11,0.1)] relative overflow-hidden">
                  {/* Classic certificate borders */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--warning)] via-yellow-400 to-[var(--warning)]" />
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--warning)] via-yellow-400 to-[var(--warning)]" />
                  <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-[var(--warning)] via-yellow-400 to-[var(--warning)]" />
                  <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-[var(--warning)] via-yellow-400 to-[var(--warning)]" />

                  <div className="text-center space-y-6 py-6 font-serif">
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[var(--warning)]">Certificate of Completion</span>
                    <p className="text-[11px] font-sans text-[var(--text-secondary)]">This certifies that <span className="font-bold text-[var(--text-primary)]">{user?.name || 'Student'}</span> has successfully mastered all curriculum requirements for</p>
                    <h3 className="text-2xl font-black font-sans text-[var(--text-primary)] uppercase tracking-wider">
                      {slug ? (COURSE_FULL_NAMES[slug as keyof typeof COURSE_FULL_NAMES] ?? slug) : COURSE_FULL_NAMES.python}
                    </h3>
                    
                    <div className="w-16 h-px bg-[var(--warning)]/30 mx-auto" />
                    
                    <p className="text-xs text-[var(--text-secondary)] italic">Issued on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <div className="flex justify-around items-center pt-8 font-sans">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-[var(--surface-container)] border border-[var(--warning)]/20 flex flex-col items-center justify-center mx-auto text-[var(--warning)] font-bold text-[9px] leading-tight shadow-lg">
                          <span className="text-xs mb-0.5">✓</span>
                          <span>VERIFIED</span>
                        </div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-2 block">Curriculum Verified</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-[var(--text-secondary)] border-b border-[var(--border-light)] pb-1 px-4 italic">Course Assessment System</p>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1 block">Verified Completion</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={() => console.log(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white transition-all shadow-md shadow-[var(--brand-primary)]/20 cursor-pointer"
                  >
                    Back to Results
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Congratulations / Passed Banner */}
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[var(--success)]/15 border border-[var(--success)]/30 flex items-center justify-center mx-auto mb-4 relative">
                    <Check className="text-[var(--success)] stroke-[3]" size={32} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Project Passed!</h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                    Congratulations! You have successfully completed the project.
                  </p>
                </div>

                {/* 3 Grid Columns */}
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Card 1: Validation Results */}
                  <div className="bg-[var(--surface-card)] border border-[var(--border-medium)] rounded-2xl p-6 flex flex-col hover:border-[var(--brand-primary)]/30 hover:shadow-sm transition-all duration-300 shadow-sm">
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
                      Validation Results
                    </h3>
                    <div className="space-y-3.5 flex-1">
                      {(selected ? selected.evaluationChecklist : []).map((item, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-[var(--text-secondary)] text-xs">
                          <Check className="text-[var(--success)] stroke-[3] mt-0.5 flex-shrink-0" size={14} />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Project Summary */}
                  <div className="bg-[var(--surface-card)] border border-[var(--border-medium)] rounded-2xl p-6 flex flex-col hover:border-[var(--brand-primary)]/30 hover:shadow-sm transition-all duration-300 shadow-sm">
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
                      Project Summary
                    </h3>
                    <div className="space-y-3.5 flex-1">
                      {[
                        "All requirements completed",
                        "All tests passed",
                        "Code quality: Good",
                        "Execution successful"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-[var(--text-secondary)] text-xs">
                          <Check className="text-[var(--success)] stroke-[3] mt-0.5 flex-shrink-0" size={14} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Your Reward */}
                  <div className="bg-[var(--surface-card)] border border-[var(--border-medium)] rounded-2xl p-6 flex flex-col justify-between hover:border-[var(--brand-primary)]/30 hover:shadow-sm transition-all duration-300 shadow-sm">
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
                        Your Reward
                      </h3>
                      <div className="text-center py-4">
                        <Trophy size={40} className="text-[var(--warning)] mx-auto mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse" />
                        <span className="text-3xl font-black text-[var(--warning)] tracking-tight">+500 XP</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-[var(--border-light)] pt-4 mt-2">
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                        <Award size={14} className="text-[var(--brand-primary)]" />
                        <span>Certificate Unlocked</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                        <CheckCircle size={14} className="text-[var(--success)]" />
                        <span>Course Progress Updated</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="flex flex-col items-center gap-3 pt-4">
                  <button
                    onClick={() => console.log(true)}
                    className="px-8 py-3 rounded-xl text-xs font-bold bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white transition-all shadow-md shadow-[var(--brand-primary)]/20 w-48 text-center cursor-pointer"
                  >
                    View Summary
                  </button>
                  <button
                    onClick={() => navigate(`/course/${slug}`)}
                    className="text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] transition-all cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
