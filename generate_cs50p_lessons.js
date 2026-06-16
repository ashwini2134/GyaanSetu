const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'frontend', 'public', 'data', 'cs50p');

const ANALOGIES = {
  "conditionals": {
    "title": "A Traffic Light",
    "description": "Green light means GO (True), Red light means STOP (False). The condition determines which path your code takes.",
    "image": "https://images.unsplash.com/photo-1557404763-69708cd8b9ce?w=800&q=80",
    "visual": {
      "type": "decision",
      "title": "If/Else Condition",
      "condition": "x < y",
      "trueLabel": "x is less",
      "falseLabel": "x is not less"
    },
    "code": "if x < y:\n    print('x is less')\nelse:\n    print('x is not less')",
    "output": "x is less",
    "reflection": {
      "question": "Does an if-else statement always execute exactly one branch?",
      "answer": "Yes! If the condition is True, the 'if' branch runs. If False, the 'else' branch runs. They never run together."
    }
  },
  "loops": {
    "title": "A Washing Machine Cycle",
    "description": "It repeats the washing, rinsing, and spinning cycles over and over again until the timer hits zero.",
    "image": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
    "visual": {
      "type": "repetition",
      "title": "Loop Execution",
      "items": ["Initialize", "Check condition", "Run loop body", "Update value"]
    },
    "code": "for i in range(3):\n    print('Meow')",
    "output": "Meow\nMeow\nMeow",
    "reflection": {
      "question": "What happens if a while loop condition never becomes False?",
      "answer": "The loop will run forever, creating an 'infinite loop'. You can break out of it in the terminal using Ctrl+C."
    }
  },
  "exceptions": {
    "title": "A Trapeze Safety Net",
    "description": "Performers try daring moves. If they slip, the net catches them safely so they don't crash onto the ground.",
    "image": "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80",
    "visual": {
      "type": "decision",
      "title": "Try / Except Handling",
      "condition": "Error occurs?",
      "trueLabel": "Except block runs",
      "falseLabel": "Continues normally"
    },
    "code": "try:\n    x = int(input('x: '))\nexcept ValueError:\n    print('Not an integer!')",
    "output": "x: cat\nNot an integer!",
    "reflection": {
      "question": "Does using try-except stop your program from crashing when an error occurs?",
      "answer": "Yes! The except block catches the error (exception) and lets the program handle it gracefully and keep running."
    }
  },
  "libraries": {
    "title": "A Swiss Army Knife",
    "description": "Instead of manufacturing a knife, scissors, and file from scratch, you import a tool with everything pre-built.",
    "image": "https://images.unsplash.com/photo-1615127717889-8945dba1f05a?w=800&q=80",
    "visual": {
      "type": "categories",
      "title": "Module Functions",
      "centerLabel": "random",
      "items": ["choice()", "randint()", "shuffle()"]
    },
    "code": "import random\ncards = ['jack', 'queen', 'king']\nprint(random.choice(cards))",
    "output": "queen",
    "reflection": {
      "question": "Why do we import libraries instead of writing all code ourselves?",
      "answer": "Libraries contain pre-written, tested code by other developers, saving us time and making our programs more reliable."
    }
  },
  "unit tests": {
    "title": "A Manufacturing Inspector",
    "description": "Inspects each item coming off the assembly line against a checklist to make sure there are no defects.",
    "image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    "visual": {
      "type": "flow",
      "title": "Test Cycle",
      "items": ["Write function", "Run pytest", "Verify assertions"]
    },
    "code": "def test_square():\n    assert square(2) == 4\n    assert square(-2) == 4",
    "output": "====== 1 passed in 0.01s ======",
    "reflection": {
      "question": "Should unit tests cover both normal cases and boundary/edge cases?",
      "answer": "Yes! Good unit tests check standard inputs (like 2) as well as boundary or negative inputs (like -2 or 0) to ensure robustness."
    }
  },
  "file": {
    "title": "A Notebook",
    "description": "You open the notebook, read notes, write down new entries, and close the cover so nothing gets lost or smudged.",
    "image": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
    "visual": {
      "type": "flow",
      "title": "File operations",
      "items": ["Open file", "Read / Write lines", "Close file"]
    },
    "code": "with open('names.txt', 'a') as f:\n    f.write('Alice\\n')",
    "output": "(writes 'Alice' to names.txt)",
    "reflection": {
      "question": "Why is using 'with open' preferred over manually calling open() and close()?",
      "answer": "Using 'with' creates a context manager that automatically closes the file for you, even if your code encounters an error."
    }
  },
  "regular expressions": {
    "title": "A Metal Detector Search",
    "description": "Sweep over the ground. It ignores dirt and rocks, beep-beeping only when it matches the exact pattern of metal.",
    "image": "https://images.unsplash.com/photo-1590278458425-6aa3912a48a5?w=800&q=80",
    "visual": {
      "type": "decision",
      "title": "Pattern Validation",
      "condition": "Pattern matches?",
      "trueLabel": "Valid Input",
      "falseLabel": "Invalid Input"
    },
    "code": "import re\nemail = input('Email: ')\nif re.search(r'^\\w+@\\w+\\.edu$', email):\n    print('Valid')",
    "output": "Email: malan@harvard.edu\nValid",
    "reflection": {
      "question": "What do the '^' and '$' anchors do in a regular expression?",
      "answer": "They match the start (^) and end ($) of the string, ensuring the entire input matches the pattern, not just a substring."
    }
  },
  "oop": {
    "title": "An Architectural Blueprint",
    "description": "A blueprint is a drawing (class) that defines rooms and doors. You build real physical houses (objects) from it.",
    "image": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
    "visual": {
      "type": "categories",
      "title": "Class Structure",
      "centerLabel": "Student Class",
      "items": ["__init__()", "name attribute", "house attribute"]
    },
    "code": "class Student:\n    def __init__(self, name):\n        self.name = name\n\ns = Student('Harry')\nprint(s.name)",
    "output": "Harry",
    "reflection": {
      "question": "What is the difference between a class and an object?",
      "answer": "A class is the template or blueprint (like Student). An object is a concrete instance created from that class (like s)."
    }
  },
  "generators": {
    "title": "A Water Tap",
    "description": "You turn it on to get water when needed (yield). Turn it off to save water, rather than flooding the room with a full tank.",
    "image": "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80",
    "visual": {
      "type": "flow",
      "title": "Generator Stream",
      "items": ["Call next()", "Yield single value", "Pause execution"]
    },
    "code": "def count():\n    yield 1\n    yield 2\n\ng = count()\nprint(next(g))",
    "output": "1",
    "reflection": {
      "question": "How do generators save memory in Python?",
      "answer": "They yield values one at a time on demand (lazily) instead of creating and holding the entire list in memory at once."
    }
  }
};

function getAnalogy(sectionTitle, lectureTitle) {
  const t = (sectionTitle + " " + lectureTitle).toLowerCase();
  if (t.includes("condition") || t.includes("if ") || t.includes("else")) {
    return ANALOGIES["conditionals"];
  }
  if (t.includes("loop") || t.includes("while") || t.includes("for")) {
    return ANALOGIES["loops"];
  }
  if (t.includes("exception") || t.includes("try") || t.includes("error")) {
    return ANALOGIES["exceptions"];
  }
  if (t.includes("librar") || t.includes("random") || t.includes("statistics") || t.includes("sys") || t.includes("package") || t.includes("api")) {
    return ANALOGIES["libraries"];
  }
  if (t.includes("test") || t.includes("assert") || t.includes("pytest")) {
    return ANALOGIES["unit tests"];
  }
  if (t.includes("file") || t.includes("open") || t.includes("io") || t.includes("csv") || t.includes("writer") || t.includes("reader")) {
    return ANALOGIES["file"];
  }
  if (t.includes("regex") || t.includes("regular expression") || t.includes("search") || t.includes("validate")) {
    return ANALOGIES["regular expressions"];
  }
  if (t.includes("object") || t.includes("class") || t.includes("oop") || t.includes("construct") || t.includes("method")) {
    return ANALOGIES["oop"];
  }
  if (t.includes("generator") || t.includes("yield") || t.includes("comprehension") || t.includes("map") || t.includes("filter")) {
    return ANALOGIES["generators"];
  }
  return ANALOGIES["conditionals"]; // default fallback
}

function cleanMarkdownBlock(lines) {
  let content = "";
  const bullets = [];
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith("- ") || l.startsWith("* ")) {
      bullets.push(l.slice(2));
    } else {
      if (content) {
        content += "\n" + line;
      } else {
        content = line;
      }
    }
  }
  return { content, bullets };
}

function parseNotesFile(filePath, lectureNum, lectureTitle) {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const sectionsRaw = content.split(/\n##\s+/);

  const sections = [];
  let overviewText = "Learn about the core concepts of this week's lecture.";

  // Extract overview from the first part
  const firstPart = sectionsRaw[0].trim();
  if (firstPart) {
    const lines = firstPart.split("\n");
    const overviewLines = lines.map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith(">"));
    if (overviewLines.length > 0) {
      overviewText = overviewLines.slice(0, 3).join(" ");
    }
  }

  sections.push({
    "id": "overview",
    "label": "Overview",
    "blocks": [
      {
        "type": "explanation",
        "accentColor": "blue",
        "title": `Introduction to ${lectureTitle}`,
        "body": overviewText,
        "bullets": [
          `Understand the main principles of ${lectureTitle}`,
          "Learn through real-world visual analogies",
          "Practice code examples interactively",
          "Reinforce your knowledge with reflection checks"
        ]
      }
    ]
  });

  for (let idx = 1; idx < sectionsRaw.length; idx++) {
    const sec = sectionsRaw[idx];
    const lines = sec.split("\n");
    const title = lines[0].trim();
    const bodyLines = lines.slice(1);

    const blocks = [];
    let currentMdlins = [];

    let i = 0;
    while (i < bodyLines.length) {
      const line = bodyLines[i];
      if (line.trim().startsWith("```python")) {
        if (currentMdlins.length > 0) {
          const { content: txt, bullets: bul } = cleanMarkdownBlock(currentMdlins);
          if (txt || bul.length > 0) {
            blocks.push({
              "type": "explanation",
              "accentColor": "blue",
              "title": title,
              "body": txt,
              "bullets": bul.length > 0 ? bul : undefined
            });
          }
          currentMdlins = [];
        }

        const codeLines = [];
        i++;
        while (i < bodyLines.length && !bodyLines[i].trim().startsWith("```")) {
          codeLines.push(bodyLines[i]);
          i++;
        }

        blocks.push({
          "type": "code_example",
          "title": `${title} Example`,
          "language": "python",
          "code": codeLines.join("\n"),
          "expectedOutput": "Run this code to see the result."
        });
      } else {
        currentMdlins.push(line);
      }
      i++;
    }

    if (currentMdlins.length > 0) {
      const { content: txt, bullets: bul } = cleanMarkdownBlock(currentMdlins);
      if (txt || bul.length > 0) {
        blocks.push({
          "type": "explanation",
          "accentColor": "blue",
          "title": title,
          "body": txt,
          "bullets": bul.length > 0 ? bul : undefined
        });
      }
    }

    const analogy = getAnalogy(title, lectureTitle);

    blocks.push({
      "type": "concept_visualization",
      "title": `Think of ${title} as ${analogy.title}`,
      "accentColor": "purple",
      "leftPanel": {
        "label": "Real Life Analogy",
        "emoji": "💡",
        "title": analogy.title,
        "description": analogy.description,
        "image": analogy.image
      },
      "centerPanel": {
        "label": "Programming Concept",
        "visualType": analogy.visual.type,
        "condition": analogy.visual.condition,
        "trueLabel": analogy.visual.trueLabel,
        "falseLabel": analogy.visual.falseLabel,
        "flowSteps": analogy.visual.items,
        "textContent": "Learn and execute"
      },
      "rightPanel": {
        "label": "Code Example",
        "code": analogy.code,
        "language": "python",
        "output": analogy.output
      }
    });

    blocks.push({
      "type": "reflection",
      "question": analogy.reflection.question,
      "answer": analogy.reflection.answer
    });

    blocks.push({
      "type": "practice",
      "title": `Practice with ${title}`,
      "instructions": `Write a simple Python script implementing or demonstrating ${title}.`,
      "starterCode": `# Practice ${title}\n# Write your code below\n`,
      "solution": analogy.code,
      "hint": "Refer to the code example panel above."
    });

    sections.push({
      "id": title.toLowerCase().replace(/\W+/g, "-").replace(/(^-|-$)/g, ""),
      "label": title,
      "blocks": blocks
    });
  }

  sections.push({
    "id": "summary",
    "label": "Summary",
    "blocks": [
      {
        "type": "explanation",
        "accentColor": "green",
        "title": "Lecture Summary",
        "body": `Congratulations! You've finished Lecture ${lectureNum} on ${lectureTitle}.`,
        "bullets": [
          "You explored the core syntax and commands",
          "You viewed real-world analogies connecting physical objects to python code",
          "You ran exercises to test validation and error correction"
        ]
      }
    ]
  });

  return {
    "id": `cs50p-lecture-${lectureNum}`,
    "courseSlug": "cs50p",
    "number": lectureNum,
    "title": lectureTitle,
    "overview": overviewText,
    "estimatedMinutes": 45,
    "sections": sections,
    "summary": {
      "keyTakeaways": [
        { "emoji": "📝", "text": `Understand the core elements of ${lectureTitle}` },
        { "emoji": "💡", "text": "Apply physical analogies to visualize how Python processes statements" },
        { "emoji": "🎯", "text": "Run unit tests and exercises to ensure correctness" }
      ],
      "whatYouLearned": [
        `Core syntaxes of ${lectureTitle}`,
        "Applying functional concepts to resolve coding problems"
      ],
      "nextUp": "Next Lecture"
    }
  };
}

function main() {
  const lecturesPath = path.join(DATA_DIR, "lectures.json");
  const lectures = JSON.parse(fs.readFileSync(lecturesPath, "utf-8"));

  for (const l of lectures) {
    const num = l.number;
    if (num === 0) continue; // Already has lesson.json
    const title = l.title;
    const notesPath = path.join(DATA_DIR, `lecture_${num}`, "notes.md");
    const destPath = path.join(DATA_DIR, `lecture_${num}`, "lesson.json");

    console.log(`Processing Lecture ${num}: ${title}...`);
    const lesson = parseNotesFile(notesPath, num, title);
    if (lesson) {
      fs.writeFileSync(destPath, JSON.stringify(lesson, null, 2), "utf-8");
      console.log(`  Saved: ${destPath}`);
    } else {
      console.warn(`  Warning: notes.md not found for Lecture ${num}`);
    }
  }
}

main();
