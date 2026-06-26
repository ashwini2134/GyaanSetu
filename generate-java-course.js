const fs = require('fs');
const path = require('path');

const courseSlug = 'java-beginners';
const courseDir = path.join(__dirname, 'frontend', 'public', 'data', courseSlug);

if (!fs.existsSync(courseDir)) {
  fs.mkdirSync(courseDir, { recursive: true });
}

const lectures = [
  { "number": 0, "label": "Week 0", "title": "Introduction to Java & JShell" },
  { "number": 1, "label": "Week 1", "title": "Methods & Multiplication Table" },
  { "number": 2, "label": "Week 2", "title": "Java Platform Overview" },
  { "number": 3, "label": "Week 3", "title": "Object Oriented Programming Basics" },
  { "number": 4, "label": "Week 4", "title": "Primitive Data Types" },
  { "number": 5, "label": "Week 5", "title": "Conditionals" },
  { "number": 6, "label": "Week 6", "title": "Loops" },
  { "number": 7, "label": "Week 7", "title": "Arrays and ArrayList" },
  { "number": 8, "label": "Week 8", "title": "Collections" },
  { "number": 9, "label": "Week 9", "title": "Final Project" }
];

fs.writeFileSync(path.join(courseDir, 'lectures.json'), JSON.stringify(lectures, null, 2));

const courseContent = [
  {
    notes: `# Introduction to Java & JShell\n\n## 1. What is Java?\nJava is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible.\n\n## 2. Using JShell\nJShell is an interactive Java Shell tool, it allows us to execute Java code snippets and get immediate results.\n\n\`\`\`java\njshell> System.out.println("Hello World");\nHello World\n\`\`\`\n\n## 3. Variables\nYou can declare variables easily:\n\`\`\`java\nint age = 25;\nString name = "Java";\n\`\`\``,
    problems: [
      {
        "id": "hello-java",
        "title": "Hello Java",
        "description": "Write a Java program that prints 'Hello, World!' to the console using System.out.println.",
        "difficulty": "Easy",
        "common_mistakes": ["Forgetting semicolons", "Using wrong method name - it's println not print"]
      },
      {
        "id": "multiplication-expression",
        "title": "Multiplication Expression",
        "description": "Using JShell, evaluate the expression 5 * 3 and print the result. Then try 10 * 10.",
        "difficulty": "Easy",
        "common_mistakes": ["Confusing * operator with x"]
      },
      {
        "id": "variable-declaration",
        "title": "Declare and Print Variables",
        "description": "Declare an integer variable called age with value 25 and a String variable called name with value 'Java'. Print both.",
        "difficulty": "Easy",
        "common_mistakes": ["Forgetting data type in declaration", "Missing quotes around String value"]
      }
    ]
  },
  {
    notes: `# Methods & Multiplication Table\n\n## 1. What is a Method?\nA method is a block of code which only runs when it is called. You can pass data, known as parameters, into a method.\n\n## 2. Creating a Method\n\`\`\`java\nvoid printTable(int number) {\n  for(int i=1; i<=10; i++) {\n    System.out.printf("%d * %d = %d", number, i, number * i).println();\n  }\n}\n\`\`\`\n\n## 3. Return Values\nMethods can return values using the \`return\` keyword.\n\`\`\`java\nint multiply(int a, int b) {\n  return a * b;\n}\n\`\`\``,
    problems: [
      {
        "id": "print-multiplication-table",
        "title": "Print Multiplication Table",
        "description": "Write a method called printTable(int number) that prints the multiplication table for the given number from 1 to 10.",
        "difficulty": "Easy",
        "common_mistakes": ["Off by one in loop", "Not using parameters correctly"]
      },
      {
        "id": "method-return-value",
        "title": "Method with Return Value",
        "description": "Write a method called multiply(int a, int b) that returns the product of two integers.",
        "difficulty": "Easy",
        "common_mistakes": ["Forgetting return statement", "Wrong return type"]
      },
      {
        "id": "method-overloading",
        "title": "Method Overloading",
        "description": "Create two methods both named add — one that adds two integers and one that adds three integers.",
        "difficulty": "Medium",
        "common_mistakes": ["Same parameter count causes compile error"]
      }
    ]
  },
  {
    notes: `# Java Platform Overview\n\n## 1. JDK vs JRE vs JVM\n- **JDK**: Java Development Kit. Includes tools for compiling and debugging.\n- **JRE**: Java Runtime Environment. Includes JVM and libraries to run Java apps.\n- **JVM**: Java Virtual Machine. Executes the bytecode.\n\n## 2. Write Once, Run Anywhere\nJava compiles source code into platform-independent bytecode.\n\n## 3. Bytecode Example\n\`\`\`java\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("WORA!");\n  }\n}\n\`\`\``,
    problems: [
      { "id": "jvm-understanding", "title": "JVM Understanding", "description": "Write a simple Java program that prints 'JVM executes bytecode'.", "difficulty": "Easy", "common_mistakes": ["Missing main method"] },
      { "id": "jdk-tools", "title": "JDK Tools", "description": "Write a program that demonstrates usage of command line arguments by printing args[0].", "difficulty": "Medium", "common_mistakes": ["Index out of bounds"] },
      { "id": "compile-run", "title": "Compile and Run", "description": "Create a class 'Platform' with a method that prints the current Java version property 'java.version'.", "difficulty": "Medium", "common_mistakes": ["Typo in property name"] }
    ]
  },
  {
    notes: `# Object Oriented Programming Basics\n\n## 1. Classes and Objects\nA Class is a blueprint, an Object is an instance.\n\`\`\`java\nclass Car {\n  String color;\n}\nCar myCar = new Car();\n\`\`\`\n\n## 2. Encapsulation\nHiding internal state and requiring all interaction to be performed through an object's methods.\n\n## 3. Constructors\nSpecial methods invoked when an object is created.\n\`\`\`java\nclass Car {\n  public Car(String c) { this.color = c; }\n}\n\`\`\``,
    problems: [
      { "id": "create-class", "title": "Create a Class", "description": "Create a class Book with title and author properties.", "difficulty": "Easy", "common_mistakes": ["Missing class keyword"] },
      { "id": "constructor-practice", "title": "Constructor Practice", "description": "Add a constructor to Book that takes title and author as parameters.", "difficulty": "Medium", "common_mistakes": ["Return type on constructor"] },
      { "id": "encapsulation-practice", "title": "Encapsulation", "description": "Make the fields of Book private and add getters and setters.", "difficulty": "Medium", "common_mistakes": ["Not using this keyword"] }
    ]
  },
  {
    notes: `# Primitive Data Types\n\n## 1. Integer Types\nbyte (8-bit), short (16-bit), int (32-bit), long (64-bit).\n\n## 2. Floating Point Types\nfloat (32-bit), double (64-bit).\n\n## 3. Char and Boolean\n\`\`\`java\nchar letter = 'A';\nboolean isTrue = true;\n\`\`\``,
    problems: [
      { "id": "declare-primitives", "title": "Declare Primitives", "description": "Declare an int, double, boolean, and char variable and print them.", "difficulty": "Easy", "common_mistakes": ["Wrong primitive size"] },
      { "id": "type-casting", "title": "Type Casting", "description": "Cast a double value 9.78 to an int and print it.", "difficulty": "Easy", "common_mistakes": ["Missing cast operator"] },
      { "id": "char-math", "title": "Char Math", "description": "Add 1 to the char 'A' and print the resulting character.", "difficulty": "Medium", "common_mistakes": ["Printing as integer instead of char"] }
    ]
  },
  {
    notes: `# Conditionals\n\n## 1. if-else Statements\nExecute code if a condition is true, otherwise execute another block.\n\`\`\`java\nif (x > 10) { ... } else { ... }\n\`\`\`\n\n## 2. switch Statement\nSelect one of many code blocks to be executed.\n\`\`\`java\nswitch(day) {\n  case 1: print("Monday"); break;\n}\n\`\`\`\n\n## 3. Ternary Operator\nShorthand for if-else.\n\`\`\`java\nint max = (a > b) ? a : b;\n\`\`\``,
    problems: [
      { "id": "even-odd", "title": "Even or Odd", "description": "Write a method that takes an int and prints whether it is Even or Odd.", "difficulty": "Easy", "common_mistakes": ["Using / instead of %"] },
      { "id": "grade-calculator", "title": "Grade Calculator", "description": "Write an if-else chain to return a letter grade (A, B, C, F) given a score out of 100.", "difficulty": "Medium", "common_mistakes": ["Wrong order of conditions"] },
      { "id": "day-of-week", "title": "Day of Week", "description": "Use a switch statement to return the name of the day given a number 1-7.", "difficulty": "Medium", "common_mistakes": ["Missing break statements"] }
    ]
  },
  {
    notes: `# Loops\n\n## 1. for Loop\nUsed when the number of iterations is known.\n\`\`\`java\nfor (int i = 0; i < 5; i++) { ... }\n\`\`\`\n\n## 2. while Loop\nLoops through a block of code as long as a specified condition is true.\n\`\`\`java\nwhile (x < 10) { ... }\n\`\`\`\n\n## 3. do-while Loop\nExecutes the code block once, before checking if the condition is true.\n\`\`\`java\ndo { ... } while (x < 10);\n\`\`\``,
    problems: [
      { "id": "sum-of-n", "title": "Sum of N", "description": "Write a for loop to calculate the sum of numbers from 1 to N.", "difficulty": "Easy", "common_mistakes": ["Loop bounds"] },
      { "id": "print-evens", "title": "Print Evens", "description": "Use a while loop to print all even numbers between 1 and 20.", "difficulty": "Medium", "common_mistakes": ["Infinite loop"] },
      { "id": "do-while-prompt", "title": "Do-While Prompt", "description": "Simulate a prompt that keeps asking for input until the value is positive using a do-while loop.", "difficulty": "Medium", "common_mistakes": ["Condition logic reversed"] }
    ]
  },
  {
    notes: `# Arrays and ArrayList\n\n## 1. Arrays\nFixed-size data structure that stores elements of the same type.\n\`\`\`java\nint[] numbers = {1, 2, 3};\n\`\`\`\n\n## 2. ArrayList\nResizable array implementation of the List interface.\n\`\`\`java\nArrayList<String> names = new ArrayList<>();\nnames.add("Java");\n\`\`\`\n\n## 3. Enhanced for Loop\nUsed to iterate through arrays and collections.\n\`\`\`java\nfor(String name : names) { ... }\n\`\`\``,
    problems: [
      { "id": "array-sum", "title": "Array Sum", "description": "Write a method that takes an array of integers and returns their sum.", "difficulty": "Easy", "common_mistakes": ["Index out of bounds"] },
      { "id": "arraylist-ops", "title": "ArrayList Operations", "description": "Create an ArrayList of Strings, add 3 items, remove 1, and print the size.", "difficulty": "Medium", "common_mistakes": ["Using length instead of size()"] },
      { "id": "find-max", "title": "Find Maximum", "description": "Find the maximum value in an array of integers using an enhanced for loop.", "difficulty": "Medium", "common_mistakes": ["Initializing max with 0 instead of Integer.MIN_VALUE"] }
    ]
  },
  {
    notes: `# Collections\n\n## 1. Set Interface\nA collection that contains no duplicate elements (e.g., HashSet).\n\`\`\`java\nSet<Integer> uniqueNums = new HashSet<>();\n\`\`\`\n\n## 2. Map Interface\nAn object that maps keys to values (e.g., HashMap). Keys must be unique.\n\`\`\`java\nMap<String, String> capitals = new HashMap<>();\ncapitals.put("England", "London");\n\`\`\`\n\n## 3. Sorting Collections\nUse Collections.sort() for Lists.\n\`\`\`java\nCollections.sort(myList);\n\`\`\``,
    problems: [
      { "id": "remove-duplicates", "title": "Remove Duplicates", "description": "Given a List with duplicate values, use a Set to remove duplicates and return the unique values.", "difficulty": "Medium", "common_mistakes": ["Not understanding Set properties"] },
      { "id": "word-frequency", "title": "Word Frequency", "description": "Count the frequency of words in an array of strings using a Map.", "difficulty": "Hard", "common_mistakes": ["Null pointer when adding new keys"] },
      { "id": "sort-strings", "title": "Sort Strings", "description": "Sort an ArrayList of strings in alphabetical order.", "difficulty": "Easy", "common_mistakes": ["Using Arrays.sort instead of Collections.sort"] }
    ]
  },
  {
    notes: `# Final Project\n\n## 1. Project Overview\nBuild a simple Student Management System.\n\n## 2. Requirements\n- A Student class with properties.\n- A StudentManager class using Collections.\n- Add, Remove, and Search functionality.\n\n## 3. Putting it all together\nApply OOP, conditionals, loops, and Collections to build the complete application.`,
    problems: [
      { "id": "student-class", "title": "Student Class", "description": "Create the Student class with id, name, and grade. Provide constructors and getters.", "difficulty": "Easy", "common_mistakes": ["Missing encapsulation"] },
      { "id": "add-search-student", "title": "Add and Search Student", "description": "Implement a method to add a student to a list, and a method to find a student by ID.", "difficulty": "Medium", "common_mistakes": ["Not handling student not found"] },
      { "id": "student-manager-app", "title": "Student Manager App", "description": "Create a console menu using a while loop and switch statement to run the Student Management System.", "difficulty": "Hard", "common_mistakes": ["Scanner input issues with nextLine"] }
    ]
  }
];

courseContent.forEach((content, i) => {
  const lectureDir = path.join(courseDir, 'lecture_' + i);
  if (!fs.existsSync(lectureDir)) {
    fs.mkdirSync(lectureDir, { recursive: true });
  }
  fs.writeFileSync(path.join(lectureDir, 'notes.md'), content.notes);
  fs.writeFileSync(path.join(lectureDir, 'problems.json'), JSON.stringify(content.problems, null, 2));
});

console.log("Generated course data structure successfully!");
