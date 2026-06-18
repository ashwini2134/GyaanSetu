import type { ChecklistItem, ProjectConfig, ProjectDefinition } from './types';

// ── SVG icon components for project configs ──
function BookIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
}
function GameIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function GridIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
}
function CheckListIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}
function PeopleIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function ConvertIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
}
function ChartIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}
function DiaryIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
}
function GradeIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
}

// ── Shared helpers for checklist items ──
const codeChecks = {
  hasInput: (c: string) => c.includes('input('),
  hasPrint: (c: string) => /print\s*\(/.test(c),
  hasFstrings: (c: string) => /f['"]/.test(c),
  hasVariables: (c: string) => /\w+\s*=/.test(c),
  hasRandom: (c: string) => /random/.test(c),
  hasConditionals: (c: string) => /\bif\b|\belif\b|\belse\b/.test(c),
  hasLoop: (c: string) => /\bwhile\b|\bfor\b/.test(c),
  hasList: (c: string) => /\w+\s*=\s*\[/.test(c) || /\.append\(/.test(c),
  hasMath: (c: string) => /[*\/+\-]|\bsum\b|\blen\b/.test(c),
};

// ── All project definitions ──
const PROJECT_DEFINITIONS: Record<string, ProjectDefinition> = {
  story_generator: {
    id: 'story_generator',
    title: 'Story Generator',
    description: 'Build a personalized story creator that generates unique stories based on user input.',
    difficulty: 'Easy',
    estimatedTime: '20 min',
    tags: ['I/O', 'f-Strings', 'Variables'],
    xp: 50,
    concepts: ['input()', 'variables', 'print()', 'f-strings'],
    learningGoal: 'Use user input and variables to generate a simple story.',
    config: { title: 'Generated Story', icon: <BookIcon />, gradient: 'from-amber-900/15 via-slate-900/60 to-rose-900/15' },
    checklist: [
      { id: 'input', label: 'Ask for user name', check: codeChecks.hasInput },
      { id: 'variables', label: 'Store answers in variables', check: codeChecks.hasVariables },
      { id: 'fstrings', label: 'Use f-strings to build story', check: codeChecks.hasFstrings },
      { id: 'print', label: 'Print the story', check: codeChecks.hasPrint },
    ],
    defaultInput: 'Maya\n22\nblue\npainting',
  },

  rock_paper_scissors: {
    id: 'rock_paper_scissors',
    title: 'Rock Paper Scissors',
    description: 'Build a rock-paper-scissors game where you play against the computer.',
    difficulty: 'Medium',
    estimatedTime: '30 min',
    tags: ['Conditionals', 'Random', 'Loops'],
    xp: 100,
    concepts: ['if/elif/else', 'comparison operators', 'random.choice()'],
    learningGoal: 'Build a rock-paper-scissors game using conditional logic.',
    config: { title: 'Rock Paper Scissors', icon: <GameIcon />, gradient: 'from-indigo-900/15 via-slate-900/60 to-purple-900/15' },
    checklist: [
      { id: 'input', label: 'Get player choice', check: codeChecks.hasInput },
      { id: 'random', label: 'Random computer choice', check: codeChecks.hasRandom },
      { id: 'conditionals', label: 'Determine winner', check: codeChecks.hasConditionals },
      { id: 'loop', label: 'Allow replay', check: codeChecks.hasLoop },
      { id: 'print', label: 'Show game results', check: codeChecks.hasPrint },
    ],
    defaultInput: 'rock\ny\npaper\ny\nscissors\nn',
  },

  multiplication_explorer: {
    id: 'multiplication_explorer',
    title: 'Multiplication Explorer',
    description: 'Build a multiplication table generator using nested loops.',
    difficulty: 'Easy',
    estimatedTime: '25 min',
    tags: ['Loops', 'Nested Loops', 'Formatting'],
    xp: 50,
    concepts: ['for loops', 'range()', 'nested loops', 'formatted output'],
    learningGoal: 'Generate a multiplication table using nested loops.',
    config: { title: 'Multiplication Table', icon: <GridIcon />, gradient: 'from-teal-900/15 via-slate-900/60 to-emerald-900/15' },
    checklist: [
      { id: 'input', label: 'Get number from user', check: codeChecks.hasInput },
      { id: 'loop', label: 'Loop through multipliers', check: codeChecks.hasLoop },
      { id: 'print', label: 'Print the table', check: codeChecks.hasPrint },
      { id: 'fstrings', label: 'Format with f-strings', check: codeChecks.hasFstrings },
    ],
    defaultInput: '5\n10',
  },

  guessing_game_project: {
    id: 'guessing_game_project',
    title: 'Number Guessing Game',
    description: 'Create a number guessing game where the player tries to guess a secret number.',
    difficulty: 'Medium',
    estimatedTime: '35 min',
    tags: ['While Loops', 'Random', 'Input Validation'],
    xp: 100,
    concepts: ['while loops', 'break', 'random.randint()', 'input validation'],
    learningGoal: 'Create a number guessing game with loop control.',
    config: { title: 'Number Guessing Game', icon: <GameIcon />, gradient: 'from-orange-900/15 via-slate-900/60 to-yellow-900/15' },
    checklist: [
      { id: 'input', label: 'Get player guess', check: codeChecks.hasInput },
      { id: 'random', label: 'Generate secret number', check: codeChecks.hasRandom },
      { id: 'conditionals', label: 'Check guess (too high/low)', check: codeChecks.hasConditionals },
      { id: 'loop', label: 'Allow multiple attempts', check: codeChecks.hasLoop },
      { id: 'print', label: 'Show game messages', check: codeChecks.hasPrint },
    ],
    defaultInput: '50\n25\n75\n62\n68\n71\n70',
  },

  shopping_list: {
    id: 'shopping_list',
    title: 'Shopping List',
    description: 'Build an interactive shopping list manager that stores and displays items.',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['Lists', 'Dictionaries', 'Menu-Driven'],
    xp: 50,
    concepts: ['lists', 'list methods', 'menu-driven programs', 'loops'],
    learningGoal: 'Build an interactive shopping list manager.',
    config: { title: 'Shopping List', icon: <CheckListIcon />, gradient: 'from-sky-900/15 via-slate-900/60 to-blue-900/15' },
    checklist: [
      { id: 'input', label: 'Get item from user', check: codeChecks.hasInput },
      { id: 'list', label: 'Store items in a list', check: codeChecks.hasList },
      { id: 'loop', label: 'Keep adding until done', check: (c) => /\bwhile\b/.test(c) },
      { id: 'print', label: 'Display the list', check: codeChecks.hasPrint },
    ],
    defaultInput: 'milk\neggs\nbread\ndone',
  },

  contact_book: {
    id: 'contact_book',
    title: 'Contact Book',
    description: 'Create a contact book that stores and retrieves contact information.',
    difficulty: 'Medium',
    estimatedTime: '35 min',
    tags: ['Dictionaries', 'CRUD', 'Search'],
    xp: 100,
    concepts: ['dictionaries', 'key-value pairs', 'dict methods', 'search'],
    learningGoal: 'Create a contact book that stores and retrieves information.',
    config: { title: 'Contact Book', icon: <PeopleIcon />, gradient: 'from-violet-900/15 via-slate-900/60 to-fuchsia-900/15' },
    checklist: [
      { id: 'input', label: 'Get contact details', check: codeChecks.hasInput },
      { id: 'datastore', label: 'Store contacts', check: (c) => /\w+\s*=\s*\[|\w+\s*=\s*\{|\w+\.append\(/.test(c) },
      { id: 'loop', label: 'Loop through contacts', check: (c) => /\bfor\b/.test(c) },
      { id: 'print', label: 'Display contact list', check: codeChecks.hasPrint },
    ],
    defaultInput: 'Alice\n123-456-7890\nBob\n987-654-3210',
  },

  unit_converter: {
    id: 'unit_converter',
    title: 'Unit Converter',
    description: 'Build a unit converter using reusable functions.',
    difficulty: 'Medium',
    estimatedTime: '30 min',
    tags: ['Functions', 'Modular Design', 'Math'],
    xp: 100,
    concepts: ['function definitions', 'parameters', 'return values', 'modular design'],
    learningGoal: 'Build a unit converter using reusable functions.',
    config: { title: 'Conversion Result', icon: <ConvertIcon />, gradient: 'from-cyan-900/15 via-slate-900/60 to-blue-900/15' },
    checklist: [
      { id: 'input', label: 'Get value from user', check: codeChecks.hasInput },
      { id: 'math', label: 'Perform conversion', check: codeChecks.hasMath },
      { id: 'print', label: 'Show result', check: codeChecks.hasPrint },
    ],
    defaultInput: '100\n1',
  },

  text_analyzer: {
    id: 'text_analyzer',
    title: 'Text Analyzer',
    description: 'Analyze text to count characters, words, and letter frequency.',
    difficulty: 'Medium',
    estimatedTime: '35 min',
    tags: ['Strings', 'Methods', 'Frequency Analysis'],
    xp: 100,
    concepts: ['string methods', 'character iteration', 'frequency analysis', 'slicing'],
    learningGoal: 'Analyze text to count characters, words, and letter frequency.',
    config: { title: 'Analysis Results', icon: <ChartIcon />, gradient: 'from-pink-900/15 via-slate-900/60 to-rose-900/15' },
    checklist: [
      { id: 'input', label: 'Get text from user', check: codeChecks.hasInput },
      { id: 'analysis', label: 'Count words/characters', check: (c) => /\.split\(|\blen\b/.test(c) },
      { id: 'print', label: 'Show analysis results', check: codeChecks.hasPrint },
    ],
    defaultInput: 'Hello world! This is a test.',
  },

  personal_diary: {
    id: 'personal_diary',
    title: 'Personal Diary',
    description: 'Build a personal diary app that saves entries and displays them.',
    difficulty: 'Hard',
    estimatedTime: '45 min',
    tags: ['File I/O', 'Persistence', 'CRUD'],
    xp: 150,
    concepts: ['file reading/writing', 'append mode', 'persistence', 'CRUD operations'],
    learningGoal: 'Build a personal diary app that saves entries to files.',
    config: { title: 'Diary Entries', icon: <DiaryIcon />, gradient: 'from-amber-900/15 via-slate-900/60 to-yellow-900/15' },
    checklist: [
      { id: 'input', label: 'Get diary entry', check: codeChecks.hasInput },
      { id: 'datastore', label: 'Store entries', check: (c) => /\w+\.append\(|\[\]/.test(c) },
      { id: 'loop', label: 'Allow multiple entries', check: codeChecks.hasLoop },
      { id: 'print', label: 'Display diary', check: codeChecks.hasPrint },
    ],
    defaultInput: '2024-01-01\nNew Year\nStarted my coding journey!',
  },

  grade_tracker: {
    id: 'grade_tracker',
    title: 'Grade Tracker',
    description: 'Create a complete grade tracking system that reads, processes, and saves student grades.',
    difficulty: 'Hard',
    estimatedTime: '60 min',
    tags: ['Functions', 'Dictionaries', 'File I/O', 'Capstone'],
    xp: 150,
    concepts: ['functions', 'dictionaries', 'file I/O', 'data processing', 'capstone'],
    learningGoal: 'Create a complete grade tracking system that reads, processes, and saves student grades.',
    config: { title: 'Student Report Card', icon: <GradeIcon />, gradient: 'from-emerald-900/15 via-slate-900/60 to-green-900/15' },
    checklist: [
      { id: 'input', label: 'Get grades from user', check: codeChecks.hasInput },
      { id: 'datastore', label: 'Store grades', check: (c) => /\w+\.append\(|\w+\s*=\s*\[/.test(c) },
      { id: 'math', label: 'Calculate average', check: codeChecks.hasMath },
      { id: 'print', label: 'Display report card', check: codeChecks.hasPrint },
    ],
    defaultInput: 'Math\n85\nScience\n92\nHistory\n78',
  },
};

// ── Registry accessors ──

export function getProjectDefinition(id: string): ProjectDefinition | undefined {
  return PROJECT_DEFINITIONS[id];
}

export function getProjectChecklist(id: string): ChecklistItem[] {
  return PROJECT_DEFINITIONS[id]?.checklist ?? [];
}

export function getProjectDefaultInput(id: string): string {
  return PROJECT_DEFINITIONS[id]?.defaultInput ?? '';
}

export function getProjectConfig(id: string): ProjectConfig | undefined {
  return PROJECT_DEFINITIONS[id]?.config;
}

export function getAllProjectIds(): string[] {
  return Object.keys(PROJECT_DEFINITIONS);
}

/** Run checklist checks against code text */
export function runChecklist(code: string, projectId: string): Record<string, boolean> {
  const items = PROJECT_DEFINITIONS[projectId]?.checklist;
  if (!items) return {};
  const results: Record<string, boolean> = {};
  const cleanCode = code.split('\n').map(l => l.replace(/#.*$/, '')).join('\n');
  for (const item of items) {
    results[item.id] = item.check(cleanCode);
  }
  return results;
}

/** Generate example output for the "What You Will Create" section */
export function generateExampleOutput(projectId: string): string {
  const def = PROJECT_DEFINITIONS[projectId];
  if (!def) return '';
  const parts = def.defaultInput.split('\n').filter(Boolean);
  const mockLines: string[] = [];
  switch (projectId) {
    case 'story_generator': {
      const [name = 'Maya', age = '22', color = 'blue', hobby = 'painting'] = parts;
      mockLines.push(`Once upon a time, there was a person named ${name}.`);
      mockLines.push(`At ${age} years old, ${name} loved the color ${color}.`);
      mockLines.push(`Every day, ${name} would spend hours ${hobby}.`);
      mockLines.push(`And that is how ${name} lived a happy life!`);
      break;
    }
    case 'shopping_list':
      mockLines.push('Shopping List:');
      parts.slice(0, -1).forEach((item, i) => mockLines.push(`${i + 1}. ${item}`));
      mockLines.push(`Total: ${parts.length - 1} items`);
      break;
    case 'contact_book':
      for (let i = 0; i < parts.length; i += 2) {
        mockLines.push(`Name: ${parts[i]}`);
        mockLines.push(`Phone: ${parts[i + 1] || ''}`);
        mockLines.push('---');
      }
      break;
    case 'rock_paper_scissors':
      mockLines.push('Welcome to Rock Paper Scissors!');
      mockLines.push('Round 1: You chose rock, Computer chose scissors');
      mockLines.push('You win!');
      mockLines.push('Round 2: You chose paper, Computer chose rock');
      mockLines.push('You win!');
      mockLines.push('Final score - You: 2, Computer: 0');
      break;
    case 'grade_tracker':
      mockLines.push('Math: 85');
      mockLines.push('Science: 92');
      mockLines.push('History: 78');
      mockLines.push('Average: 85.0');
      break;
    case 'multiplication_explorer':
      mockLines.push('5 x 1 = 5');
      mockLines.push('5 x 2 = 10');
      mockLines.push('5 x 3 = 15');
      mockLines.push('5 x 4 = 20');
      mockLines.push('5 x 5 = 25');
      mockLines.push('5 x 10 = 50');
      break;
    case 'unit_converter':
      mockLines.push('100°F = 37.78°C');
      break;
    case 'text_analyzer':
      mockLines.push('Words: 7');
      mockLines.push('Characters: 30');
      mockLines.push('Lines: 1');
      break;
    case 'personal_diary':
      mockLines.push('[2024-01-01] New Year');
      mockLines.push('Started my coding journey today!');
      mockLines.push('---');
      mockLines.push('[2024-01-02] First Program');
      mockLines.push('Wrote my first Python program.');
      break;
    case 'guessing_game_project':
      mockLines.push('Welcome to the Number Guessing Game!');
      mockLines.push('Guess the number (1-100): 50');
      mockLines.push('Too high!');
      mockLines.push('Guess the number (1-100): 25');
      mockLines.push('Correct! You got it in 2 attempts!');
      break;
    default:
      mockLines.push('Run your project to see the result!');
  }
  return mockLines.join('\n');
}

export { PROJECT_DEFINITIONS };
