import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'frontend/src/pages/MilestonePage.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// First replace component name CapstonePage with MilestonePage
content = content.replace(/export default function CapstonePage/g, 'export default function MilestonePage');
content = content.replace(/CapstoneProject/g, 'MilestoneProject');

content = content.replace(/const PROJECTS: MilestoneProject\[\] = \[[\s\S]*?\];\n/g, `const PROJECTS: MilestoneProject[] = [
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
    downloadUrl: '/data/fundamentals-of-ai/lecture_1/degrees/small.zip'
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
    downloadUrl: '/data/fundamentals-of-ai/lecture_1/tictactoe/tictactoe.zip'
  }
];\n`);

content = content.replace(/Capstone/g, 'Milestone');
content = content.replace(/capstone/g, 'milestone');
content = content.replace(/type MilestoneProject = \{([\s\S]*?)\};/g, 'type MilestoneProject = {$1  downloadUrl?: string;\n};');

fs.writeFileSync(filePath, content);
console.log('MilestonePage patched successfully.');
