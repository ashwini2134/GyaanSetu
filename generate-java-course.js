const fs = require('fs');
const path = require('path');

const courseDir = path.join(__dirname, 'frontend', 'public', 'data', 'java-beginners');

if (!fs.existsSync(courseDir)) {
  fs.mkdirSync(courseDir, { recursive: true });
}

// 1. GENERATE lectures.json
const lecturesData = [
  { number: 0, label: "Week 1", title: "Introduction to Java & JShell" },
  { number: 1, label: "Week 2", title: "Variables & Data Types" },
  { number: 2, label: "Week 3", title: "Methods & Multiplication Table" },
  { number: 3, label: "Week 4", title: "Object Oriented Programming" },
  { number: 4, label: "Week 5", title: "Conditionals" },
  { number: 5, label: "Week 6", title: "Loops" },
  { number: 6, label: "Week 7", title: "Arrays & ArrayLists" },
  { number: 7, label: "Week 8", title: "Object Oriented Programming - Advanced" },
  { number: 8, label: "Week 9", title: "Collections" },
  { number: 9, label: "Week 10", title: "Functional Programming" }
];

fs.writeFileSync(
  path.join(courseDir, 'lectures.json'),
  JSON.stringify(lecturesData, null, 2)
);

// 2. GENERATE LECTURE 0 (Exact Content)
const lecture0Lesson = {
  id: "java-beginners-lecture-0",
  courseSlug: "java-beginners",
  number: 0,
  title: "Introduction to Java & JShell",
  overview: "Java is one of the most popular programming languages. In this first lecture, you will learn what Java is, why it's a great language, and how to run your first Java code.",
  estimatedMinutes: 45,
  sections: [
    {
      id: "what-is-java",
      label: "What is Java?",
      blocks: [
        {
          type: "explanation",
          accentColor: "blue",
          title: "What is Java?",
          body: "Java is a high-level, object-oriented programming language \ndesigned to run on any device via the JVM (Java Virtual Machine).",
          bullets: [
            "Java is one of the most popular languages in the world",
            "Write Once, Run Anywhere — Java code runs on any OS",
            "Java is used in Android apps, web backends, and enterprise systems",
            "Java is strongly typed — every variable must have a declared type",
            "Java compiles to bytecode, not machine code directly"
          ]
        },
        {
          type: "analogy",
          title: "THINK OF JAVA AS A BLUEPRINT FOR A BUILDING",
          emoji: "",
          text: "A blueprint defines the structure — rooms, doors, windows. \nJava classes are blueprints. Objects are the actual buildings \nbuilt from those blueprints. You define the class once and \ncreate many objects from it."
        },
        {
          type: "think_of",
          analogy: {
            title: "THINK OF A CLASS AS A BLUEPRINT",
            description: "Blueprint → Building",
            image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"
          },
          visualization: {
            type: "flow",
            title: "PROGRAMMING CONCEPT",
            items: [
              "Define",
              "Instantiate",
              "Use"
            ]
          },
          code: {
            language: "java",
            code: "// JAVA\nclass Car {\n  String color = \"Red\";\n  void drive() {\n    System.out.println(\"Driving!\");\n  }\n}",
            output: "Car object created"
          }
        },
        {
          type: "explanation",
          accentColor: "blue",
          title: "Java Platform",
          body: "Java programs run on the JVM (Java Virtual Machine), \nwhich is why Java is platform independent.",
          bullets: [
            "javac compiles .java files to .class bytecode",
            "JVM reads and executes the bytecode",
            "JDK = Java Development Kit (to write and compile)",
            "JRE = Java Runtime Environment (to run)",
            "Java 9+ introduced JShell — interactive Java shell"
          ]
        },
        {
          type: "practice",
          title: "PRACTICE EXERCISE\nHello Java",
          instructions: "Write a Java program that prints \"Hello, World!\" \nto the console using System.out.println.",
          starterCode: "// Write your Java code here\nSystem.out.println(\"\");",
          solution: "System.out.println(\"Hello, World!\");",
          hint: "Put Hello, World! inside the quotes.",
          expectedOutput: "Hello, World!"
        }
      ]
    },
    {
      id: "why-java",
      label: "Why Java?",
      blocks: [
        {
          type: "explanation",
          accentColor: "purple",
          title: "Why Java is Perfect for Beginners",
          body: "Java was designed with simplicity and structure in mind. \nIt enforces good programming habits from day one.",
          bullets: [
            "Strongly typed — catches errors at compile time",
            "Object-oriented — teaches real-world programming patterns",
            "Huge community — millions of tutorials and libraries",
            "Used everywhere — Android, Spring, banking systems, games",
            "Excellent job market — Java is top 3 in demand worldwide"
          ]
        },
        {
          type: "explanation",
          accentColor: "purple",
          title: "Real-World Applications of Java",
          body: "Java is not just for learning — it powers some of the \nmost important technology in the world.",
          bullets: [
            "Android Development — most Android apps are written in Java",
            "Enterprise Backend — Spring Framework powers thousands of companies",
            "Big Data — Apache Hadoop and Spark are Java-based",
            "Games — Minecraft is written in Java"
          ]
        },
        {
          type: "analogy",
          title: "THINK OF JAVA AS A SWISS ARMY KNIFE",
          emoji: "",
          text: "A Swiss Army knife has many tools — blade, scissors, screwdriver \n— all in one device. Java is the same: you can build Android apps, \nweb servers, desktop apps, and data pipelines all with one language."
        },
        {
          type: "think_of",
          analogy: {
            title: "THINK OF SWISS ARMY KNIFE",
            description: "One tool, many uses",
            image: "https://images.unsplash.com/photo-1615127717889-8945dba1f05a?w=800&q=80"
          },
          visualization: {
            type: "categories",
            title: "Java's Versatility",
            centerLabel: "JAVA",
            items: [
              "Android",
              "Backend",
              "Big Data",
              "Games"
            ]
          },
          code: {
            language: "java",
            code: "// JAVA\nSystem.out.println(\"Android apps\");\nSystem.out.println(\"Web servers\");\nSystem.out.println(\"Data pipelines\");",
            output: "Android apps\nWeb servers\nData pipelines"
          }
        }
      ]
    },
    {
      id: "getting-started",
      label: "Getting Started",
      blocks: [
        {
          type: "explanation",
          accentColor: "green",
          title: "Installing Java",
          body: "Before you can write Java programs, you need to install \nthe JDK. It's free and takes just a few minutes.",
          bullets: [
            "Go to oracle.com/java and download JDK 17 or later",
            "Run the installer and follow the steps",
            "Open Terminal (Mac/Linux) or Command Prompt (Windows)",
            "Type: java -version to verify it installed correctly",
            "Type: javac -version to verify the compiler works"
          ]
        },
        {
          type: "think_of",
          analogy: {
            title: "THINK OF SETTING UP YOUR KITCHEN",
            description: "Gather tools before you cook",
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
          },
          visualization: {
            type: "flow",
            title: "Environment Setup",
            items: [
              "Computer",
              "JDK Installed",
              "Ready to Code"
            ]
          },
          code: {
            language: "java",
            code: "// JAVA\nimport java.lang.*;\nSystem.out.println(\"Java \" + \n  System.getProperty(\"java.version\"));",
            output: "Java 17.0.1 ready"
          }
        },
        {
          type: "explanation",
          accentColor: "green",
          title: "JShell — Interactive Mode",
          body: "JShell lets you type Java commands one at a time \nand see results immediately.",
          bullets: [
            "Type jshell in your terminal to start",
            "You'll see jshell> prompt — Java is waiting",
            "Type any expression and press Enter — Java runs it",
            "Type /exit to leave JShell"
          ]
        },
        {
          type: "explanation",
          accentColor: "green",
          title: "Writing .java Files",
          body: "For real programs, save your code in a file with .java extension.",
          bullets: [
            "Create a new file called Hello.java",
            "Write your Java code in any text editor",
            "Open terminal, navigate to the folder",
            "Type: javac Hello.java to compile",
            "Type: java java Hello to run"
          ]
        },
        {
          type: "explanation",
          accentColor: "green",
          title: "Java is Compiled then Interpreted",
          body: "Java first compiles to bytecode (.class file), then the \nJVM interprets and runs it.",
          bullets: [
            "javac compiles — catches syntax errors immediately",
            "JVM runs bytecode on any operating system",
            "This makes Java both fast and portable",
            "You can test small pieces of code in JShell without files"
          ]
        },
        {
          type: "practice",
          title: "PRACTICE EXERCISE\nJava Facts Printer",
          instructions: "Print 3 things Java can do, each on a separate line:\n'Java builds Android apps', 'Java runs on any OS', \n'Java powers enterprise systems'",
          starterCode: "",
          solution: "System.out.println(\"Java builds Android apps\");\nSystem.out.println(\"Java runs on any OS\");\nSystem.out.println(\"Java powers enterprise systems\");",
          hint: "Use System.out.println() for each line.",
          expectedOutput: "Java builds Android apps\nJava runs on any OS\nJava powers enterprise systems"
        }
      ]
    }
  ],
  summary: {
    keyTakeaways: [
      { text: "Java is a class-based, object-oriented language" },
      { text: "Java is beginner-friendly, runs on any OS via JVM" },
      { text: "javac compiles .java files to bytecode" },
      { text: "JShell lets you test Java code interactively" },
      { text: "System.out.println() displays text on screen" },
      { text: "Java is used in Android, backends, and enterprise" }
    ],
    whatYouLearned: [
      "What Java is and how it works",
      "Why Java is great for beginners",
      "Real-world applications of Java",
      "How to install Java and JDK",
      "The difference between JShell and .java files",
      "How to use System.out.println() to display output"
    ],
    nextUp: "Methods & Multiplication Table"
  }
};

const lecture0Quiz = [
  {
    question: "What does JVM stand for?",
    options: [
      "Java Virtual Machine",
      "Java Verified Module",
      "Java Variable Manager",
      "Java Version Manager"
    ],
    answer: "Java Virtual Machine",
    explanation: "JVM is the engine that executes Java bytecode."
  },
  {
    question: "Which command compiles a Java file?",
    options: [
      "java Hello.java",
      "run Hello.java",
      "javac Hello.java",
      "compile Hello.java"
    ],
    answer: "javac Hello.java",
    explanation: "javac stands for Java Compiler."
  },
  {
    question: "What does System.out.println() do?",
    options: [
      "Reads user input",
      "Creates a new file",
      "Displays output on the screen",
      "Calculates math"
    ],
    answer: "Displays output on the screen",
    explanation: "It prints text to the standard output."
  },
  {
    question: "What is JShell?",
    options: [
      "A Java IDE",
      "An interactive Java shell for testing code",
      "A Java compiler",
      "A Java debugger"
    ],
    answer: "An interactive Java shell for testing code",
    explanation: "JShell was introduced in Java 9 for REPL functionality."
  },
  {
    question: "What file extension do Java source files use?",
    options: [
      ".jav",
      ".class",
      ".java",
      ".js"
    ],
    answer: ".java",
    explanation: "Java source code is written in .java files, which compile to .class files."
  }
];

const lecture0Problems = [
  {
    id: "hello_java",
    title: "Hello Java",
    description: "Write a program that prints 'Hello, World!' to the console.",
    difficulty: "easy",
    starterCode: "public class Hello {\n  public static void main(String[] args) {\n    // Write your code here\n  }\n}",
    solution: "public class Hello {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}",
    testCases: [
      {
        label: "Prints Hello, World!",
        input: "",
        expectedOutput: "Hello, World!"
      }
    ]
  },
  {
    id: "print_name",
    title: "Print Your Name",
    description: "Write a program that prints your name to the console.",
    difficulty: "easy",
    starterCode: "public class Name {\n  public static void main(String[] args) {\n    // Write your code here\n  }\n}",
    solution: "public class Name {\n  public static void main(String[] args) {\n    System.out.println(\"Alice\");\n  }\n}",
    testCases: [
      {
        label: "Prints name",
        input: "",
        expectedOutput: "Alice",
        matchType: "any_lines"
      }
    ]
  },
  {
    id: "print_three_lines",
    title: "Print Three Lines",
    description: "Write a program that prints 3 lines of text.",
    difficulty: "easy",
    starterCode: "public class Lines {\n  public static void main(String[] args) {\n    // Write your code here\n  }\n}",
    solution: "public class Lines {\n  public static void main(String[] args) {\n    System.out.println(\"Line 1\");\n    System.out.println(\"Line 2\");\n    System.out.println(\"Line 3\");\n  }\n}",
    testCases: [
      {
        label: "Prints 3 lines",
        input: "",
        expectedOutput: "Line 1\nLine 2\nLine 3",
        matchType: "any_lines"
      }
    ]
  }
];

// Helper to write files
function writeLectureFiles(lectureNum, lessonObj, quizObj, problemsObj) {
  const dir = path.join(courseDir, 'lecture_' + lectureNum);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'lesson.json'), JSON.stringify(lessonObj, null, 2));
  fs.writeFileSync(path.join(dir, 'quiz.json'), JSON.stringify(quizObj, null, 2));
  fs.writeFileSync(path.join(dir, 'problems.json'), JSON.stringify(problemsObj, null, 2));
}

// Write Lecture 0
writeLectureFiles(0, lecture0Lesson, lecture0Quiz, lecture0Problems);

// 3. GENERATE LECTURES 1 TO 9 (Stubbed)
for (let i = 1; i <= 9; i++) {
  const lectureTitle = lecturesData[i].title;
  const nextUpTitle = (i < 9) ? lecturesData[i+1].title : "Final Project";
  
  const lessonObj = {
    id: `java-beginners-lecture-${i}`,
    courseSlug: "java-beginners",
    number: i,
    title: lectureTitle,
    overview: `Overview of ${lectureTitle}`,
    estimatedMinutes: 45,
    sections: [
      {
        id: `section-1-lecture-${i}`,
        label: "Theory Part 1",
        blocks: [
          {
            type: "explanation",
            accentColor: "blue",
            title: `Introduction to ${lectureTitle}`,
            body: `Content for ${lectureTitle}...`,
            bullets: [ "Point 1", "Point 2" ]
          }
        ]
      },
      {
        id: `section-2-lecture-${i}`,
        label: "Theory Part 2",
        blocks: [
          {
            type: "explanation",
            accentColor: "purple",
            title: `Deep dive into ${lectureTitle}`,
            body: `More content for ${lectureTitle}...`,
            bullets: [ "Point 1", "Point 2" ]
          }
        ]
      },
      {
        id: `section-3-lecture-${i}`,
        label: "Theory Part 3",
        blocks: [
          {
            type: "explanation",
            accentColor: "green",
            title: `Mastering ${lectureTitle}`,
            body: `Advanced content for ${lectureTitle}...`,
            bullets: [ "Point 1", "Point 2" ]
          }
        ]
      }
    ],
    summary: {
      keyTakeaways: [
        { text: `Takeaway 1 for ${lectureTitle}` },
        { text: `Takeaway 2 for ${lectureTitle}` }
      ],
      whatYouLearned: [
        `You learned about ${lectureTitle}`
      ],
      nextUp: nextUpTitle
    }
  };

  const quizObj = [
    {
      question: `Question 1 about ${lectureTitle}?`,
      options: ["A", "B", "C", "D"],
      answer: "A",
      explanation: "A is correct."
    },
    {
      question: `Question 2 about ${lectureTitle}?`,
      options: ["A", "B", "C", "D"],
      answer: "B",
      explanation: "B is correct."
    },
    {
      question: `Question 3 about ${lectureTitle}?`,
      options: ["A", "B", "C", "D"],
      answer: "C",
      explanation: "C is correct."
    },
    {
      question: `Question 4 about ${lectureTitle}?`,
      options: ["A", "B", "C", "D"],
      answer: "D",
      explanation: "D is correct."
    },
    {
      question: `Question 5 about ${lectureTitle}?`,
      options: ["A", "B", "C", "D"],
      answer: "A",
      explanation: "A is correct."
    }
  ];

  const problemsObj = [
    {
      id: `problem_1_lecture_${i}`,
      title: `Problem 1 - ${lectureTitle}`,
      description: `Solve this problem related to ${lectureTitle}.`,
      difficulty: "easy",
      starterCode: "public class Main {\n  public static void main(String[] args) {\n    \n  }\n}",
      solution: "public class Main {\n  public static void main(String[] args) {\n    \n  }\n}",
      testCases: [
        { label: "Test case 1", input: "", expectedOutput: "" }
      ]
    },
    {
      id: `problem_2_lecture_${i}`,
      title: `Problem 2 - ${lectureTitle}`,
      description: `Solve this problem related to ${lectureTitle}.`,
      difficulty: "medium",
      starterCode: "public class Main {\n  public static void main(String[] args) {\n    \n  }\n}",
      solution: "public class Main {\n  public static void main(String[] args) {\n    \n  }\n}",
      testCases: [
        { label: "Test case 1", input: "", expectedOutput: "" }
      ]
    },
    {
      id: `problem_3_lecture_${i}`,
      title: `Problem 3 - ${lectureTitle}`,
      description: `Solve this problem related to ${lectureTitle}.`,
      difficulty: "hard",
      starterCode: "public class Main {\n  public static void main(String[] args) {\n    \n  }\n}",
      solution: "public class Main {\n  public static void main(String[] args) {\n    \n  }\n}",
      testCases: [
        { label: "Test case 1", input: "", expectedOutput: "" }
      ]
    }
  ];

  writeLectureFiles(i, lessonObj, quizObj, problemsObj);
}

console.log('Successfully generated Java course files using the new 6-page lesson structure!');
