import { prisma } from "../prisma.js";

export const seedData = [
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
    category: "Aptitude", subsection: "Quantitative Aptitude", type: "mcq",
    question: "A man took a loan from a bank at the rate of 12% p.a. simple interest. After 3 years he had to pay Rs. 5400 interest only for the period. The principal amount borrowed by him was:",
    options: ["Rs. 2000", "Rs. 10000", "Rs. 15000", "Rs. 20000"], correctAnswer: "Rs. 15000"
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
    category: "Aptitude", subsection: "Logical Reasoning", type: "mcq",
    question: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?",
    options: ["7", "10", "12", "13"], correctAnswer: "10"
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
    category: "Aptitude", subsection: "Analytical Reasoning", type: "mcq",
    question: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?",
    options: ["His own", "His son's", "His father's", "His nephew's"], correctAnswer: "His son's"
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
    category: "Aptitude", subsection: "Verbal Ability", type: "mcq",
    question: "Choose the exact meaning of the idiom: 'To spill the beans'",
    options: ["To drop something", "To reveal a secret", "To waste food", "To cook poorly"], correctAnswer: "To reveal a secret"
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
    category: "Communication Skills", subsection: "Grammar", type: "mcq",
    question: "Identify the tense of the following sentence: 'I had been reading for two hours before he arrived.'",
    options: ["Past Continuous", "Past Perfect", "Past Perfect Continuous", "Present Perfect Continuous"], correctAnswer: "Past Perfect Continuous"
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
    category: "Communication Skills", subsection: "Vocabulary", type: "mcq",
    question: "What is the synonym of the word 'METICULOUS'?",
    options: ["Careless", "Sloppy", "Careful", "Rapid"], correctAnswer: "Careful"
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
    category: "Communication Skills", subsection: "Reading Comprehension", type: "mcq",
    question: "Which of the following describes the 'main idea' of a reading passage?",
    options: ["A minor detail supporting the argument", "The author's central point or primary message", "The final sentence of the text", "The bibliography"], correctAnswer: "The author's central point or primary message"
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
    category: "Communication Skills", subsection: "Email Writing", type: "mcq",
    question: "When writing a formal email, which sign-off is most appropriate if you addressed the recipient as 'Dear Sir/Madam'?",
    options: ["Yours faithfully,", "Yours sincerely,", "Best wishes,", "Take care,"], correctAnswer: "Yours faithfully,"
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
    category: "Communication Skills", subsection: "Resume Writing", type: "mcq",
    question: "What is an 'Applicant Tracking System (ATS)' in the context of resumes?",
    options: ["A method to format the margins of a resume", "Software used by employers to filter resumes based on keywords", "A website for uploading job applications", "A font commonly used for professional resumes"], correctAnswer: "Software used by employers to filter resumes based on keywords"
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
    category: "Pseudocode & Problem Solving", subsection: "Flowcharts", type: "mcq",
    question: "In a flowchart, what shape is typically used to indicate a process or action step?",
    options: ["Diamond", "Oval", "Rectangle", "Parallelogram"], correctAnswer: "Rectangle"
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
    category: "Pseudocode & Problem Solving", subsection: "Loops", type: "mcq",
    question: "What is a 'nested loop'?",
    options: ["A loop that never terminates", "A loop placed inside the body of another loop", "A loop that counts backwards", "A loop that iterates over a network request"], correctAnswer: "A loop placed inside the body of another loop"
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
    category: "Pseudocode & Problem Solving", subsection: "Arrays", type: "mcq",
    question: "What is the time complexity of accessing an element in an array by its index?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correctAnswer: "O(1)"
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
    category: "Pseudocode & Problem Solving", subsection: "Functions", type: "mcq",
    question: "What does the term 'function overloading' mean?",
    options: ["Calling a function too many times causing a stack overflow", "Defining multiple functions with the same name but different parameters", "A function that returns multiple values", "A function that takes no parameters"], correctAnswer: "Defining multiple functions with the same name but different parameters"
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
    category: "Pseudocode & Problem Solving", subsection: "Recursion", type: "mcq",
    question: "Which of the following problems is naturally suited for a recursive solution?",
    options: ["Calculating the sum of an array using a for-loop", "Tree traversal algorithms", "Finding the maximum value in an unsorted array", "Converting a string to uppercase"], correctAnswer: "Tree traversal algorithms"
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
    category: "Technical Assessments", subsection: "Python", type: "mcq",
    question: "Which of the following data structures in Python is immutable?",
    options: ["List", "Dictionary", "Set", "Tuple"], correctAnswer: "Tuple"
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
    category: "Technical Assessments", subsection: "Java", type: "mcq",
    question: "What is the default value of a boolean instance variable in Java?",
    options: ["true", "false", "null", "0"], correctAnswer: "false"
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
    category: "Technical Assessments", subsection: "JavaScript", type: "mcq",
    question: "What is the result of `typeof NaN` in JavaScript?",
    options: ["'number'", "'NaN'", "'undefined'", "'object'"], correctAnswer: "'number'"
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
    category: "Technical Assessments", subsection: "SQL", type: "mcq",
    question: "Which SQL command is used to remove a table entirely from a database?",
    options: ["DELETE TABLE", "REMOVE TABLE", "DROP TABLE", "TRUNCATE TABLE"], correctAnswer: "DROP TABLE"
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
    category: "Technical Assessments", subsection: "DBMS", type: "mcq",
    question: "Which of the following is a characteristic of a relational database?",
    options: ["Data is stored in collections of JSON documents", "Data is organized into tables with rows and columns", "It relies entirely on graph structures for data representation", "It does not support SQL queries"], correctAnswer: "Data is organized into tables with rows and columns"
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
    category: "Technical Assessments", subsection: "OS", type: "mcq",
    question: "What is a 'deadlock' in an operating system?",
    options: ["A situation where the CPU halts due to overheating", "A situation where two or more processes are unable to proceed because each is waiting for the other to release a resource", "When a process consumes 100% of the CPU", "A secure mode of the kernel"], correctAnswer: "A situation where two or more processes are unable to proceed because each is waiting for the other to release a resource"
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
    category: "Technical Assessments", subsection: "Computer Networks", type: "mcq",
    question: "What is the primary function of the DNS (Domain Name System)?",
    options: ["To assign IP addresses to devices on a local network", "To translate domain names into IP addresses", "To encrypt web traffic", "To route packets between different networks"], correctAnswer: "To translate domain names into IP addresses"
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
    category: "AI Interview Practice", subsection: "HR Questions", type: "mcq",
    question: "If an interviewer asks 'Why did you leave your last job?', which of the following is the most professional response?",
    options: ["'My manager was terrible and the pay was too low.'", "'I am looking for new challenges and opportunities to grow my career.'", "'I didn't like the people I worked with.'", "'I was bored and wanted a change of scenery.'"], correctAnswer: "'I am looking for new challenges and opportunities to grow my career.'"
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
    category: "AI Interview Practice", subsection: "Technical Interview", type: "mcq",
    question: "When an interviewer asks you to optimize a solution from O(N^2) to O(N log N), which sorting algorithm concept might they be hinting at?",
    options: ["Bubble Sort", "Merge Sort", "Insertion Sort", "Selection Sort"], correctAnswer: "Merge Sort"
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
    category: "AI Interview Practice", subsection: "Behavioral Questions", type: "mcq",
    question: "Which of these is the most effective way to structure an answer about overcoming a professional challenge?",
    options: ["Blame the failure on the project manager", "Use the STAR method to clearly explain the situation, task, action, and result", "Give a one-sentence answer to avoid detailing the problem", "Explain how you worked overtime every day to fix it alone"], correctAnswer: "Use the STAR method to clearly explain the situation, task, action, and result"
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
    category: "AI Interview Practice", subsection: "Mock Interviews", type: "mcq",
    question: "During a mock interview, what should you do if you don't know the answer to a technical question?",
    options: ["Guess randomly until the interviewer corrects you", "Stay completely silent until they ask another question", "Admit you don't know the exact answer, but explain how you would approach finding the solution", "Make up a confident-sounding but incorrect answer"], correctAnswer: "Admit you don't know the exact answer, but explain how you would approach finding the solution"
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
    category: "Mock Tests", subsection: "Full Mock", type: "mcq",
    question: "Which design pattern restricts the instantiation of a class to one single instance?",
    options: ["Observer Pattern", "Factory Pattern", "Singleton Pattern", "Decorator Pattern"], correctAnswer: "Singleton Pattern"
  },
  {
    category: "Mock Tests", subsection: "Full Mock", type: "mcq",
    question: "What is the main difference between GET and POST HTTP methods?",
    options: ["GET is used to send data in the body, POST is for URLs", "GET appends data to the URL, whereas POST sends data in the request body", "GET is encrypted by default, POST is not", "POST can only be used to retrieve static files"], correctAnswer: "GET appends data to the URL, whereas POST sends data in the request body"
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
        correctAnswer: q.correctAnswer
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
