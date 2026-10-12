import { prisma } from '../prisma.js';

async function main() {
  const degrees = await prisma.projectTemplate.upsert({
    where: { id: 'fundamentals-of-ai-degrees' },
    update: {},
    create: {
      id: 'fundamentals-of-ai-degrees',
      title: 'Degrees',
      category: 'Search Algorithms',
      difficulty: 'Intermediate',
      shortDescription: 'Write an AI to find the shortest path between two actors.',
      longDescription: 'According to the Six Degrees of Kevin Bacon game, anyone in the Hollywood film industry can be connected to Kevin Bacon within six steps. In this project, you will use breadth-first search to find the shortest path between any two actors by choosing a sequence of movies that connects them.',
      technologies: ['Python', 'Search Algorithms', 'BFS'],
      features: ['Load CSV data into memory', 'Model the data as a graph', 'Implement Breadth-First Search (BFS)', 'Trace path back from target to source'],
      instructions: ['Complete the shortest_path function in degrees.py', 'Use a QueueFrontier for BFS', 'Return the path as a list of (movie_id, person_id) tuples'],
      expectedOutput: 'The shortest sequence of movies and actors connecting the two given names.',
      estimatedDuration: '2-4 Hours',
      prerequisites: ['Python basics', 'Understanding of BFS vs DFS'],
      learningOutcomes: ['Graph traversal', 'Queue data structures', 'State representation'],
    }
  });

  const tictactoe = await prisma.projectTemplate.upsert({
    where: { id: 'fundamentals-of-ai-tictactoe' },
    update: {},
    create: {
      id: 'fundamentals-of-ai-tictactoe',
      title: 'Tic-Tac-Toe',
      category: 'Adversarial Search',
      difficulty: 'Intermediate',
      shortDescription: 'Write an AI to play Tic-Tac-Toe optimally.',
      longDescription: 'Using Minimax, implement an AI that plays Tic-Tac-Toe optimally. The AI should never lose. If the human plays optimally, the game will tie. If the human makes a mistake, the AI will win.',
      technologies: ['Python', 'Minimax', 'Adversarial Search'],
      features: ['Implement player(), actions(), result(), winner(), terminal(), utility(), and minimax()', 'Ensure the AI plays optimally'],
      instructions: ['Complete the missing functions in tictactoe.py', 'Do not modify runner.py', 'Use Minimax with alpha-beta pruning (optional but recommended)'],
      expectedOutput: 'An AI that can play Tic-Tac-Toe against you using Pygame.',
      estimatedDuration: '3-5 Hours',
      prerequisites: ['Python basics', 'Understanding of Minimax'],
      learningOutcomes: ['Minimax algorithm', 'Game trees', 'State evaluation'],
    }
  });

  console.log('Created project templates:', degrees.id, tictactoe.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
