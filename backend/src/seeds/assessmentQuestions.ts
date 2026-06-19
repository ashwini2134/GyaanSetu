import { prisma } from "../prisma.js";

const seedData = [
  // APTITUDE
  // Quantitative Aptitude
  {
    category: "Aptitude", subsection: "Quantitative Aptitude", type: "mcq",
    question: "If the cost price of 20 articles is equal to the selling price of 15 articles, what is the profit percentage?",
    options: ["25%", "33.33%", "20%", "30%"], correctAnswer: "33.33%"
  },
  {
    category: "Aptitude", subsection: "Quantitative Aptitude", type: "mcq",
    question: "A sum of money doubles itself in 5 years at simple interest. In how many years will it become 4 times of itself?",
    options: ["10 years", "15 years", "20 years", "25 years"], correctAnswer: "15 years"
  },
  {
    category: "Aptitude", subsection: "Quantitative Aptitude", type: "mcq",
    question: "The ratio of ages of two persons is 4:7 and the age of one of them is greater than the age of the other by 30 years. The sum of their ages (in years) is?",
    options: ["110", "100", "70", "40"], correctAnswer: "110"
  },
  {
    category: "Aptitude", subsection: "Quantitative Aptitude", type: "coding",
    question: "Write a function `calculateSimpleInterest(principal, rate, time)` that returns the simple interest.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function calculateSimpleInterest(principal, rate, time) {\n  // Write your code here\n  return (principal * rate * time) / 100;\n}"
  },

  // Logical Reasoning
  {
    category: "Aptitude", subsection: "Logical Reasoning", type: "mcq",
    question: "Find the next number in the series: 2, 6, 12, 20, 30, ...",
    options: ["40", "42", "44", "48"], correctAnswer: "42"
  },
  {
    category: "Aptitude", subsection: "Logical Reasoning", type: "mcq",
    question: "Which word does NOT belong with the others?",
    options: ["Ounce", "Inch", "Yard", "Meter"], correctAnswer: "Ounce"
  },
  {
    category: "Aptitude", subsection: "Logical Reasoning", type: "mcq",
    question: "If All cats are dogs, and Some dogs are birds, which conclusion is logically true?",
    options: ["Some cats are birds", "All birds are cats", "Some dogs are cats", "No conclusion can be drawn safely"], correctAnswer: "Some dogs are cats"
  },
  {
    category: "Aptitude", subsection: "Logical Reasoning", type: "coding",
    question: "Write a function `findOdd(arr)` that returns the number that appears an odd number of times in the array.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function findOdd(arr) {\n  // Write your code here\n  return arr.reduce((a, b) => a ^ b, 0);\n}"
  },

  // Analytical Reasoning
  {
    category: "Aptitude", subsection: "Analytical Reasoning", type: "mcq",
    question: "Five children are sitting in a row. A is next to B but not C. D is next to E who sits on the extreme left. Who is sitting in the middle?",
    options: ["A", "B", "C", "D"], correctAnswer: "Cannot be determined without more info" // Assuming a general puzzle logic, but let's make it solvable
  },
  {
    category: "Aptitude", subsection: "Analytical Reasoning", type: "mcq",
    question: "If day before yesterday was Tuesday, the day after tomorrow will be?",
    options: ["Saturday", "Sunday", "Friday", "Monday"], correctAnswer: "Saturday"
  },
  {
    category: "Aptitude", subsection: "Analytical Reasoning", type: "mcq",
    question: "Which of the following is essential for interpreting a pie chart?",
    options: ["Total number of items", "Angles of sectors", "Both total and angles", "Neither"], correctAnswer: "Both total and angles"
  },
  {
    category: "Aptitude", subsection: "Analytical Reasoning", type: "coding",
    question: "Write a function `solveSeating(n)` that returns an array of seats from 1 to n.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function solveSeating(n) {\n  // Write your code here\n  return Array.from({length: n}, (_, i) => i + 1);\n}"
  },

  // Verbal Ability
  {
    category: "Aptitude", subsection: "Verbal Ability", type: "mcq",
    question: "What is the synonym of 'ABUNDANT'?",
    options: ["Plentiful", "Scarce", "Brief", "Happy"], correctAnswer: "Plentiful"
  },
  {
    category: "Aptitude", subsection: "Verbal Ability", type: "mcq",
    question: "What is the antonym of 'COMPLEX'?",
    options: ["Complicated", "Simple", "Hard", "Intricate"], correctAnswer: "Simple"
  },
  {
    category: "Aptitude", subsection: "Verbal Ability", type: "mcq",
    question: "Fill in the blank: She has been working here ___ 2015.",
    options: ["for", "since", "from", "in"], correctAnswer: "since"
  },
  {
    category: "Aptitude", subsection: "Verbal Ability", type: "coding",
    question: "Write a function `countVowels(str)` that returns the number of vowels in a string.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function countVowels(str) {\n  // Write your code here\n  return (str.match(/[aeiou]/gi) || []).length;\n}"
  },

  // COMMUNICATION SKILLS
  // Grammar
  {
    category: "Communication Skills", subsection: "Grammar", type: "mcq",
    question: "Which sentence is grammatically correct?",
    options: ["He do not like apples.", "He does not likes apples.", "He does not like apples.", "He do not likes apples."], correctAnswer: "He does not like apples."
  },
  {
    category: "Communication Skills", subsection: "Grammar", type: "mcq",
    question: "Identify the article in the sentence: 'She bought an umbrella.'",
    options: ["She", "bought", "an", "umbrella"], correctAnswer: "an"
  },
  {
    category: "Communication Skills", subsection: "Grammar", type: "mcq",
    question: "Which preposition fits best: 'The cat jumped ___ the wall.'",
    options: ["over", "in", "under", "with"], correctAnswer: "over"
  },
  {
    category: "Communication Skills", subsection: "Grammar", type: "coding",
    question: "Write a function `capitalizeSentence(str)` that capitalizes the first letter of a sentence.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function capitalizeSentence(str) {\n  // Write your code here\n  if (!str) return str;\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}"
  },

  // Vocabulary
  {
    category: "Communication Skills", subsection: "Vocabulary", type: "mcq",
    question: "What does the word 'ELOQUENT' mean?",
    options: ["Fluent and persuasive", "Quiet and shy", "Angry and loud", "Confused and lost"], correctAnswer: "Fluent and persuasive"
  },
  {
    category: "Communication Skills", subsection: "Vocabulary", type: "mcq",
    question: "Choose the word with the correct spelling.",
    options: ["Accommodate", "Acommodate", "Accomodate", "Acomodate"], correctAnswer: "Accommodate"
  },
  {
    category: "Communication Skills", subsection: "Vocabulary", type: "mcq",
    question: "A person who hates mankind is called?",
    options: ["Philanthropist", "Misanthrope", "Optimist", "Pessimist"], correctAnswer: "Misanthrope"
  },
  {
    category: "Communication Skills", subsection: "Vocabulary", type: "coding",
    question: "Write a function `longestWord(sentence)` that returns the longest word in the sentence.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function longestWord(sentence) {\n  // Write your code here\n  let words = sentence.split(' ');\n  return words.reduce((longest, current) => current.length > longest.length ? current : longest, '');\n}"
  },

  // Reading Comprehension
  {
    category: "Communication Skills", subsection: "Reading Comprehension", type: "mcq",
    question: "What is the primary purpose of skimming a passage?",
    options: ["To find a specific date", "To get the general idea", "To memorize facts", "To find grammar mistakes"], correctAnswer: "To get the general idea"
  },
  {
    category: "Communication Skills", subsection: "Reading Comprehension", type: "mcq",
    question: "Which of the following helps in answering inference questions?",
    options: ["Looking for exact words", "Reading between the lines", "Skipping paragraphs", "Looking at the title only"], correctAnswer: "Reading between the lines"
  },
  {
    category: "Communication Skills", subsection: "Reading Comprehension", type: "mcq",
    question: "The tone of a passage indicates:",
    options: ["The author's attitude", "The length of the passage", "The publication year", "The font size"], correctAnswer: "The author's attitude"
  },
  {
    category: "Communication Skills", subsection: "Reading Comprehension", type: "coding",
    question: "Write a function `extractKeywords(paragraph)` that returns an array of words longer than 5 characters.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function extractKeywords(paragraph) {\n  // Write your code here\n  let words = paragraph.split(/\\W+/);\n  return words.filter(word => word.length > 5);\n}"
  },

  // Email Writing
  {
    category: "Communication Skills", subsection: "Email Writing", type: "mcq",
    question: "What is the best way to start a professional email to someone you don't know well?",
    options: ["Hey buddy,", "Dear [Name],", "What's up,", "To whom it may concern,"], correctAnswer: "Dear [Name],"
  },
  {
    category: "Communication Skills", subsection: "Email Writing", type: "mcq",
    question: "What does 'Bcc' stand for in an email?",
    options: ["Blind carbon copy", "Before carbon copy", "Basic carbon copy", "Blind clear copy"], correctAnswer: "Blind carbon copy"
  },
  {
    category: "Communication Skills", subsection: "Email Writing", type: "mcq",
    question: "Which is a polite way to end a formal email?",
    options: ["See ya", "Later", "Sincerely,", "Cheers"], correctAnswer: "Sincerely,"
  },
  {
    category: "Communication Skills", subsection: "Email Writing", type: "coding",
    question: "Write a function `formatEmail(subject, body)` that returns a formatted string: 'Subject: <subject>\\n<body>'.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function formatEmail(subject, body) {\n  // Write your code here\n  return `Subject: ${subject}\\n${body}`;\n}"
  },

  // Resume Writing
  {
    category: "Communication Skills", subsection: "Resume Writing", type: "mcq",
    question: "What is the ideal length of a standard resume for a fresh graduate?",
    options: ["1 page", "3 pages", "5 pages", "Doesn't matter"], correctAnswer: "1 page"
  },
  {
    category: "Communication Skills", subsection: "Resume Writing", type: "mcq",
    question: "Which of the following should you NOT include in a professional resume?",
    options: ["Contact Info", "Education", "Hobbies like eating", "Work Experience"], correctAnswer: "Hobbies like eating"
  },
  {
    category: "Communication Skills", subsection: "Resume Writing", type: "mcq",
    question: "What format is best for listing work experience?",
    options: ["Chronological (oldest first)", "Reverse chronological (newest first)", "Alphabetical", "Random"], correctAnswer: "Reverse chronological (newest first)"
  },
  {
    category: "Communication Skills", subsection: "Resume Writing", type: "coding",
    question: "Write a function `countSections(resumeStr)` that counts the number of lines starting with '##' representing sections.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function countSections(resumeStr) {\n  // Write your code here\n  return (resumeStr.match(/^## /gm) || []).length;\n}"
  },

  // PSEUDOCODE & PROBLEM SOLVING
  // Flowcharts
  {
    category: "Pseudocode & Problem Solving", subsection: "Flowcharts", type: "mcq",
    question: "What does a diamond shape represent in a flowchart?",
    options: ["Process", "Input/Output", "Decision", "Start/End"], correctAnswer: "Decision"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Flowcharts", type: "mcq",
    question: "What does an oval shape represent?",
    options: ["Process", "Input", "Start/End terminal", "Decision"], correctAnswer: "Start/End terminal"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Flowcharts", type: "mcq",
    question: "Flowlines in a flowchart indicate:",
    options: ["Data types", "Direction of flow of logic", "Comments", "Loops"], correctAnswer: "Direction of flow of logic"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Flowcharts", type: "coding",
    question: "Write a simple function `traceLogic(n)` that returns 'Even' if n is even, else 'Odd'.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function traceLogic(n) {\n  // Write your code here\n  return n % 2 === 0 ? 'Even' : 'Odd';\n}"
  },

  // Loops
  {
    category: "Pseudocode & Problem Solving", subsection: "Loops", type: "mcq",
    question: "Which loop is guaranteed to execute at least once?",
    options: ["for loop", "while loop", "do-while loop", "infinite loop"], correctAnswer: "do-while loop"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Loops", type: "mcq",
    question: "What happens if the condition in a while loop is false initially?",
    options: ["It executes once", "It runs forever", "It throws an error", "It does not execute at all"], correctAnswer: "It does not execute at all"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Loops", type: "mcq",
    question: "What statement is used to exit a loop early?",
    options: ["continue", "break", "return", "exit"], correctAnswer: "break"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Loops", type: "coding",
    question: "Write a function `multiplyTable(n)` that returns an array of the first 10 multiples of n.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function multiplyTable(n) {\n  // Write your code here\n  let table = [];\n  for(let i=1; i<=10; i++) {\n    table.push(n * i);\n  }\n  return table;\n}"
  },

  // Arrays
  {
    category: "Pseudocode & Problem Solving", subsection: "Arrays", type: "mcq",
    question: "In most programming languages, array indices start at:",
    options: ["1", "0", "-1", "Depends on the array size"], correctAnswer: "0"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Arrays", type: "mcq",
    question: "An array of arrays is often called a:",
    options: ["1D Array", "Nested Array / 2D Array", "Pointer", "Struct"], correctAnswer: "Nested Array / 2D Array"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Arrays", type: "mcq",
    question: "Which search algorithm is fastest on a sorted array?",
    options: ["Linear Search", "Binary Search", "Random Search", "Bubble Search"], correctAnswer: "Binary Search"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Arrays", type: "coding",
    question: "Write a function `findMax(arr)` that returns the largest element in an array of numbers.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function findMax(arr) {\n  // Write your code here\n  if (arr.length === 0) return null;\n  return Math.max(...arr);\n}"
  },

  // Functions
  {
    category: "Pseudocode & Problem Solving", subsection: "Functions", type: "mcq",
    question: "The variables declared inside a function are said to have what type of scope?",
    options: ["Global", "Local", "Static", "Dynamic"], correctAnswer: "Local"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Functions", type: "mcq",
    question: "Values passed to a function when it is called are known as:",
    options: ["Arguments", "Parameters", "Variables", "Constants"], correctAnswer: "Arguments"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Functions", type: "mcq",
    question: "What is the purpose of the 'return' statement?",
    options: ["To start a loop", "To output a value and exit the function", "To import a module", "To print to console"], correctAnswer: "To output a value and exit the function"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Functions", type: "coding",
    question: "Write a recursive function `factorial(n)` that calculates the factorial of n.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function factorial(n) {\n  // Write your code here\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}"
  },

  // Recursion
  {
    category: "Pseudocode & Problem Solving", subsection: "Recursion", type: "mcq",
    question: "What is a base case in recursion?",
    options: ["The start of the function", "The condition that stops the recursion", "An infinite loop", "The recursive call itself"], correctAnswer: "The condition that stops the recursion"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Recursion", type: "mcq",
    question: "What happens if a recursive function lacks a proper base case?",
    options: ["It runs faster", "It returns undefined", "It causes a stack overflow error", "It converts to a while loop"], correctAnswer: "It causes a stack overflow error"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Recursion", type: "mcq",
    question: "Which data structure is inherently related to recursion?",
    options: ["Queue", "Stack", "Linked List", "Graph"], correctAnswer: "Stack"
  },
  {
    category: "Pseudocode & Problem Solving", subsection: "Recursion", type: "coding",
    question: "Write a recursive function `fibonacci(n)` returning the nth Fibonacci number.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function fibonacci(n) {\n  // Write your code here\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}"
  },

  // TECHNICAL ASSESSMENTS
  // Python
  {
    category: "Technical Assessments", subsection: "Python", type: "mcq",
    question: "Which of the following is used to define a block of code in Python?",
    options: ["Brackets {}", "Indentation", "Parentheses ()", "Keywords start/end"], correctAnswer: "Indentation"
  },
  {
    category: "Technical Assessments", subsection: "Python", type: "mcq",
    question: "What is the output of print(type([]))?",
    options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"], correctAnswer: "<class 'list'>"
  },
  {
    category: "Technical Assessments", subsection: "Python", type: "mcq",
    question: "Which keyword is used to handle exceptions in Python?",
    options: ["catch", "except", "error", "handle"], correctAnswer: "except"
  },
  {
    category: "Technical Assessments", subsection: "Python", type: "coding",
    question: "Write a python function `reverse_string(s)` that returns the reversed string.",
    options: [], correctAnswer: "", language: "python",
    starterCode: "def reverse_string(s):\n  # Write your code here\n  return s[::-1]\n"
  },

  // Java
  {
    category: "Technical Assessments", subsection: "Java", type: "mcq",
    question: "Which of these is not a Java primitive data type?",
    options: ["int", "boolean", "String", "double"], correctAnswer: "String"
  },
  {
    category: "Technical Assessments", subsection: "Java", type: "mcq",
    question: "What is the size of int in Java?",
    options: ["2 bytes", "4 bytes", "8 bytes", "Depends on OS"], correctAnswer: "4 bytes"
  },
  {
    category: "Technical Assessments", subsection: "Java", type: "mcq",
    question: "Which keyword is used by a class to inherit another class?",
    options: ["implements", "extends", "inherits", "overrides"], correctAnswer: "extends"
  },
  {
    category: "Technical Assessments", subsection: "Java", type: "coding",
    question: "Write a simple Java method `public int add(int a, int b)` inside a class.",
    options: [], correctAnswer: "", language: "java",
    starterCode: "class Solution {\n  public int add(int a, int b) {\n    // Write your code here\n    return a + b;\n  }\n}"
  },

  // JavaScript
  {
    category: "Technical Assessments", subsection: "JavaScript", type: "mcq",
    question: "Which of the following is not a JS framework/library?",
    options: ["React", "Angular", "Django", "Vue"], correctAnswer: "Django"
  },
  {
    category: "Technical Assessments", subsection: "JavaScript", type: "mcq",
    question: "What does 'typeof null' return in JavaScript?",
    options: ["'null'", "'undefined'", "'object'", "'number'"], correctAnswer: "'object'"
  },
  {
    category: "Technical Assessments", subsection: "JavaScript", type: "mcq",
    question: "Which keyword is used to declare a constant in ES6?",
    options: ["var", "let", "const", "static"], correctAnswer: "const"
  },
  {
    category: "Technical Assessments", subsection: "JavaScript", type: "coding",
    question: "Write a function `flatten(arr)` to flatten a nested array by one level.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function flatten(arr) {\n  // Write your code here\n  return arr.flat();\n}"
  },

  // SQL
  {
    category: "Technical Assessments", subsection: "SQL", type: "mcq",
    question: "Which statement is used to extract data from a database?",
    options: ["GET", "OPEN", "EXTRACT", "SELECT"], correctAnswer: "SELECT"
  },
  {
    category: "Technical Assessments", subsection: "SQL", type: "mcq",
    question: "Which clause is used to filter records?",
    options: ["ORDER BY", "WHERE", "FILTER", "SORT"], correctAnswer: "WHERE"
  },
  {
    category: "Technical Assessments", subsection: "SQL", type: "mcq",
    question: "What does SQL stand for?",
    options: ["Structured Question Language", "Strong Question Language", "Structured Query Language", "System Query Language"], correctAnswer: "Structured Query Language"
  },
  {
    category: "Technical Assessments", subsection: "SQL", type: "coding",
    question: "Write a query to find the second highest salary from a table `Employee`.",
    options: [], correctAnswer: "", language: "sql",
    starterCode: "SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);"
  },

  // DBMS
  {
    category: "Technical Assessments", subsection: "DBMS", type: "mcq",
    question: "What does ACID stand for in DBMS?",
    options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Consistency, Information, Data", "Automated, Concurrent, Isolated, Durable", "None of the above"], correctAnswer: "Atomicity, Consistency, Isolation, Durability"
  },
  {
    category: "Technical Assessments", subsection: "DBMS", type: "mcq",
    question: "Which normal form removes transitive dependencies?",
    options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: "3NF"
  },
  {
    category: "Technical Assessments", subsection: "DBMS", type: "mcq",
    question: "What is a foreign key?",
    options: ["A primary key in the same table", "A key that links two tables together", "A key used for encryption", "A random unique identifier"], correctAnswer: "A key that links two tables together"
  },
  {
    category: "Technical Assessments", subsection: "DBMS", type: "coding",
    question: "Write SQL to create a table `Users` with `id` as primary key.",
    options: [], correctAnswer: "", language: "sql",
    starterCode: "CREATE TABLE Users (\n  id INT PRIMARY KEY,\n  name VARCHAR(50)\n);"
  },

  // OS
  {
    category: "Technical Assessments", subsection: "OS", type: "mcq",
    question: "What is the core of the Linux operating system?",
    options: ["Shell", "Kernel", "Terminal", "Command Line"], correctAnswer: "Kernel"
  },
  {
    category: "Technical Assessments", subsection: "OS", type: "mcq",
    question: "Which scheduling algorithm assigns a fixed time quantum to each process?",
    options: ["First Come First Serve", "Shortest Job First", "Round Robin", "Priority Scheduling"], correctAnswer: "Round Robin"
  },
  {
    category: "Technical Assessments", subsection: "OS", type: "mcq",
    question: "What is virtual memory?",
    options: ["A technique to execute processes that are not completely in memory", "RAM attached to the CPU", "Cloud storage", "A backup mechanism"], correctAnswer: "A technique to execute processes that are not completely in memory"
  },
  {
    category: "Technical Assessments", subsection: "OS", type: "coding",
    question: "Simulate a round-robin schedule by returning the first process after one tick.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function simulateRR(queue) {\n  let p = queue.shift();\n  queue.push(p);\n  return p;\n}"
  },

  // Computer Networks
  {
    category: "Technical Assessments", subsection: "Computer Networks", type: "mcq",
    question: "How many layers are in the OSI model?",
    options: ["5", "6", "7", "8"], correctAnswer: "7"
  },
  {
    category: "Technical Assessments", subsection: "Computer Networks", type: "mcq",
    question: "Which protocol is used for securely browsing the web?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"], correctAnswer: "HTTPS"
  },
  {
    category: "Technical Assessments", subsection: "Computer Networks", type: "mcq",
    question: "What is the loopback IP address in IPv4?",
    options: ["192.168.1.1", "127.0.0.1", "0.0.0.0", "255.255.255.255"], correctAnswer: "127.0.0.1"
  },
  {
    category: "Technical Assessments", subsection: "Computer Networks", type: "coding",
    question: "Write a function `isValidIP(ip)` that returns true if it matches an IPv4 format.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function isValidIP(ip) {\n  return /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(ip);\n}"
  },

  // AI INTERVIEW PRACTICE
  // HR Questions
  {
    category: "AI Interview Practice", subsection: "HR Questions", type: "mcq",
    question: "What is the best way to answer 'What is your greatest weakness?'",
    options: ["Say you have none", "Mention a real weakness and how you are working to improve it", "Say you work too hard", "Mention a flaw that makes you un-hireable"], correctAnswer: "Mention a real weakness and how you are working to improve it"
  },
  {
    category: "AI Interview Practice", subsection: "HR Questions", type: "mcq",
    question: "Why do interviewers ask 'Where do you see yourself in 5 years?'",
    options: ["To see if you want their job", "To gauge your career goals and alignment with the company", "To check if you plan to retire soon", "To see if you are a threat"], correctAnswer: "To gauge your career goals and alignment with the company"
  },
  {
    category: "AI Interview Practice", subsection: "HR Questions", type: "mcq",
    question: "When asked about expected salary, what is a good strategy?",
    options: ["Provide a specific high number", "Refuse to answer", "Provide a range based on market research", "Say 'whatever you think is fair'"], correctAnswer: "Provide a range based on market research"
  },
  {
    category: "AI Interview Practice", subsection: "HR Questions", type: "coding",
    question: "Format a STAR method response: Situation, Task, Action, Result.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function formatSTAR(s, t, a, r) {\n  return `S: ${s}\\nT: ${t}\\nA: ${a}\\nR: ${r}`;\n}"
  },

  // Technical Interview
  {
    category: "AI Interview Practice", subsection: "Technical Interview", type: "mcq",
    question: "What is the time complexity of searching in a Hash Map (average case)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correctAnswer: "O(1)"
  },
  {
    category: "AI Interview Practice", subsection: "Technical Interview", type: "mcq",
    question: "Which data structure operates on a Last In First Out (LIFO) principle?",
    options: ["Queue", "Stack", "Tree", "Graph"], correctAnswer: "Stack"
  },
  {
    category: "AI Interview Practice", subsection: "Technical Interview", type: "mcq",
    question: "If you need fast lookups and don't care about order, what should you use?",
    options: ["Array", "Linked List", "Hash Set", "Binary Search Tree"], correctAnswer: "Hash Set"
  },
  {
    category: "AI Interview Practice", subsection: "Technical Interview", type: "coding",
    question: "Write a function to reverse a linked list node.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function reverseList(head) {\n  let prev = null, curr = head;\n  while(curr) {\n    let next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}"
  },

  // Behavioral Questions
  {
    category: "AI Interview Practice", subsection: "Behavioral Questions", type: "mcq",
    question: "What does the STAR method stand for?",
    options: ["Situation, Task, Action, Result", "Start, Target, Aim, Result", "Situation, Team, Action, Response", "System, Test, Analyze, Refactor"], correctAnswer: "Situation, Task, Action, Result"
  },
  {
    category: "AI Interview Practice", subsection: "Behavioral Questions", type: "mcq",
    question: "When discussing a past conflict with a coworker, you should focus on:",
    options: ["How the coworker was wrong", "How you escalated to management", "How you professionally communicated and resolved the issue", "How you ignored them"], correctAnswer: "How you professionally communicated and resolved the issue"
  },
  {
    category: "AI Interview Practice", subsection: "Behavioral Questions", type: "mcq",
    question: "A behavioral interview question typically starts with:",
    options: ["How would you...", "Tell me about a time when...", "What is the definition of...", "Can you write a code for..."], correctAnswer: "Tell me about a time when..."
  },
  {
    category: "AI Interview Practice", subsection: "Behavioral Questions", type: "coding",
    question: "Write a function that counts words in a behavioral answer.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function countWords(answer) {\n  return answer.split(' ').length;\n}"
  },

  // Mock Interviews
  {
    category: "AI Interview Practice", subsection: "Mock Interviews", type: "mcq",
    question: "Which of these is the most important during an interview?",
    options: ["Memorizing answers", "Active listening and clear communication", "Speaking as fast as possible", "Never asking the interviewer any questions"], correctAnswer: "Active listening and clear communication"
  },
  {
    category: "AI Interview Practice", subsection: "Mock Interviews", type: "mcq",
    question: "At the end of an interview, when asked 'Do you have any questions for us?', you should:",
    options: ["Say 'No, I have no questions.'", "Ask about salary and vacation immediately", "Ask thoughtful questions about the role or company culture", "Ask if you got the job"], correctAnswer: "Ask thoughtful questions about the role or company culture"
  },
  {
    category: "AI Interview Practice", subsection: "Mock Interviews", type: "mcq",
    question: "Body language during a mock interview should show:",
    options: ["Confidence and engagement (eye contact, posture)", "Slouching to look relaxed", "Fidgeting to show energy", "Looking at your phone occasionally"], correctAnswer: "Confidence and engagement (eye contact, posture)"
  },
  {
    category: "AI Interview Practice", subsection: "Mock Interviews", type: "coding",
    question: "Write a function that outputs a basic greeting.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function greet(name) {\n  return `Hello, my name is ${name} and I am excited to be here.`;\n}"
  },

  // MOCK TESTS (Full Mock)
  {
    category: "Mock Tests", subsection: "Full Mock", type: "mcq",
    question: "If 5 machines can make 5 widgets in 5 minutes, how long does it take 100 machines to make 100 widgets?",
    options: ["5 minutes", "100 minutes", "1 minute", "20 minutes"], correctAnswer: "5 minutes"
  },
  {
    category: "Mock Tests", subsection: "Full Mock", type: "mcq",
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"], correctAnswer: "Merge Sort"
  },
  {
    category: "Mock Tests", subsection: "Full Mock", type: "mcq",
    question: "Identify the incorrectly spelled word:",
    options: ["Definite", "Separate", "Recieve", "Occurred"], correctAnswer: "Recieve"
  },
  {
    category: "Mock Tests", subsection: "Full Mock", type: "mcq",
    question: "What does the 'C' in ACID stand for?",
    options: ["Concurrency", "Consistency", "Calculated", "Complex"], correctAnswer: "Consistency"
  },
  {
    category: "Mock Tests", subsection: "Full Mock", type: "mcq",
    question: "What is the output of `2 + '2'` in JavaScript?",
    options: ["4", "NaN", "'22'", "TypeError"], correctAnswer: "'22'"
  },
  {
    category: "Mock Tests", subsection: "Full Mock", type: "coding",
    question: "Write a function to reverse a string.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function reverseStr(str) {\n  return str.split('').reverse().join('');\n}"
  },
  {
    category: "Mock Tests", subsection: "Full Mock", type: "coding",
    question: "Find duplicates in an array and return them.",
    options: [], correctAnswer: "", language: "javascript",
    starterCode: "function findDuplicates(arr) {\n  const seen = new Set();\n  const dups = new Set();\n  for(let x of arr) {\n    if (seen.has(x)) dups.add(x);\n    else seen.add(x);\n  }\n  return Array.from(dups);\n}"
  }
];

async function main() {
  console.log("Seeding Assessment Questions...");

  // Optional: clear existing questions to prevent duplicates on multiple runs
  await prisma.assessmentQuestion.deleteMany({});

  for (const q of seedData) {
    await prisma.assessmentQuestion.create({
      data: {
        category: q.category,
        subsection: q.subsection,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        starterCode: q.starterCode,
        language: q.language
      }
    });
  }

  console.log("Seeding complete! Added", seedData.length, "questions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
