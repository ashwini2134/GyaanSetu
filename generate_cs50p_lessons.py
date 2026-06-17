import os
import json
import re

DATA_DIR = "frontend/public/data/cs50p"

ANALOGIES = {
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
}

def get_analogy(section_title, lecture_title):
    t = (section_title + " " + lecture_title).lower()
    if "condition" in t or "if " in t or "else" in t:
        return ANALOGIES["conditionals"]
    if "loop" in t or "while" in t or "for" in t:
        return ANALOGIES["loops"]
    if "exception" in t or "try" in t or "error" in t:
        return ANALOGIES["exceptions"]
    if "librar" in t or "random" in t or "statistics" in t or "sys" in t or "package" in t or "api" in t:
        return ANALOGIES["libraries"]
    if "test" in t or "assert" in t or "pytest" in t:
        return ANALOGIES["unit tests"]
    if "file" in t or "open" in t or "io" in t or "csv" in t or "writer" in t or "reader" in t:
        return ANALOGIES["file"]
    if "regex" in t or "regular expression" in t or "search" in t or "validate" in t:
        return ANALOGIES["regular expressions"]
    if "object" in t or "class" in t or "oop" in t or "construct" in t or "method" in t:
        return ANALOGIES["oop"]
    if "generator" in t or "yield" in t or "comprehension" in t or "map" in t or "filter" in t:
        return ANALOGIES["generators"]
    return ANALOGIES["conditionals"]  # default fallback

def clean_markdown_block(lines):
    content = ""
    bullets = []
    for line in lines:
        l = line.strip()
        if not l:
            continue
        if l.startswith("- ") or l.startswith("* "):
            bullets.append(l[2:])
        else:
            if content:
                content += "\n" + line
            else:
                content = line
    return content, bullets

def parse_notes_file(filepath, lecture_num, lecture_title):
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Split by ## headers
    sections_raw = re.split(r"\n##\s+", "\n" + content)
    
    sections = []
    overview_text = "Learn about the core concepts of this week's lecture."
    
    # The first split contains the # Lecture X title and potentially some overview text
    first_part = sections_raw[0].strip()
    if first_part:
        # Try to find overview or description lines
        lines = first_part.split("\n")
        overview_lines = [l.strip() for l in lines if l.strip() and not l.strip().startswith("#") and not l.strip().startswith(">")]
        if overview_lines:
            overview_text = " ".join(overview_lines[:3])

    sections.append({
        "id": "overview",
        "label": "Overview",
        "blocks": [
            {
                "type": "explanation",
                "accentColor": "blue",
                "title": f"Introduction to {lecture_title}",
                "body": overview_text,
                "bullets": [
                    f"Understand the main principles of {lecture_title}",
                    "Learn through real-world visual analogies",
                    "Practice code examples interactively",
                    "Reinforce your knowledge with reflection checks"
                ]
            }
        ]
    })
    
    for idx, sec in enumerate(sections_raw[1:]):
        lines = sec.split("\n")
        title = lines[0].strip()
        body_lines = lines[1:]
        
        # Segment body lines into code blocks vs general markdown text
        blocks = []
        current_md_lines = []
        
        i = 0
        while i < len(body_lines):
            line = body_lines[i]
            if line.strip().startswith("```python"):
                # End current explanation block if any
                if current_md_lines:
                    txt, bul = clean_markdown_block(current_md_lines)
                    if txt or bul:
                        blocks.append({
                            "type": "explanation",
                            "accentColor": "blue",
                            "title": title,
                            "body": txt,
                            "bullets": bul if bul else None
                        })
                    current_md_lines = []
                
                # Capture code block
                code_lines = []
                i += 1
                while i < len(body_lines) and not body_lines[i].strip().startswith("```"):
                    code_lines.append(body_lines[i])
                    i += 1
                
                code_text = "\n".join(code_lines)
                blocks.append({
                    "type": "code_example",
                    "title": f"{title} Example",
                    "language": "python",
                    "code": code_text,
                    "expectedOutput": "Run this code to see the result."
                })
            else:
                current_md_lines.append(line)
            i += 1
            
        if current_md_lines:
            txt, bul = clean_markdown_block(current_md_lines)
            if txt or bul:
                blocks.append({
                    "type": "explanation",
                    "accentColor": "blue",
                    "title": title,
                    "body": txt,
                    "bullets": bul if bul else None
                })
        
        # Append Concept Visualization & Reflection
        analogy = get_analogy(title, lecture_title)
        
        # Check if we should insert the visualization and reflection blocks
        blocks.append({
            "type": "concept_visualization",
            "title": f"Think of {title} as {analogy['title']}",
            "accentColor": "purple",
            "leftPanel": {
                "label": "Real Life Analogy",
                "emoji": "💡",
                "title": analogy["title"],
                "description": analogy["description"],
                "image": analogy["image"]
            },
            "centerPanel": {
                "label": "Programming Concept",
                "visualType": analogy["visual"]["type"],
                "condition": analogy["visual"].get("condition"),
                "trueLabel": analogy["visual"].get("trueLabel"),
                "falseLabel": analogy["visual"].get("falseLabel"),
                "flowSteps": analogy["visual"].get("items"),
                "textContent": "Learn and execute"
            },
            "rightPanel": {
                "label": "Code Example",
                "code": analogy["code"],
                "language": "python",
                "output": analogy["output"]
            }
        })
        
        blocks.append({
            "type": "reflection",
            "question": analogy["reflection"]["question"],
            "answer": analogy["reflection"]["answer"]
        })
        
        # Add a practice block at the end of each section
        blocks.append({
            "type": "practice",
            "title": f"Practice with {title}",
            "instructions": f"Write a simple Python script implementing or demonstrating {title}.",
            "starterCode": f"# Practice {title}\n# Write your code below\n",
            "solution": analogy["code"],
            "hint": "Refer to the code example panel above."
        })
        
        sections.append({
            "id": re.sub(r"\W+", "-", title.lower()).strip("-"),
            "label": title,
            "blocks": blocks
        })
        
    # Add summary
    sections.append({
        "id": "summary",
        "label": "Summary",
        "blocks": [
            {
                "type": "explanation",
                "accentColor": "green",
                "title": "Lecture Summary",
                "body": f"Congratulations! You've finished Lecture {lecture_num} on {lecture_title}.",
                "bullets": [
                    "You explored the core syntax and commands",
                    "You viewed real-world analogies connecting physical objects to python code",
                    "You ran exercises to test validation and error correction"
                ]
            }
        ]
    })
    
    # Save lesson.json structure
    lesson_data = {
        "id": f"cs50p-lecture-{lecture_num}",
        "courseSlug": "cs50p",
        "number": lecture_num,
        "title": lecture_title,
        "overview": overview_text,
        "estimatedMinutes": 45,
        "sections": sections,
        "summary": {
            "keyTakeaways": [
                {"emoji": "📝", "text": f"Understand the core elements of {lecture_title}"},
                {"emoji": "💡", "text": "Apply physical analogies to visualize how Python processes statements"},
                {"emoji": "🎯", "text": "Run unit tests and exercises to ensure correctness"}
            ],
            "whatYouLearned": [
                f"Core syntaxes of {lecture_title}",
                "Applying functional concepts to resolve coding problems"
            ],
            "nextUp": "Next Lecture"
        }
    }
    
    return lesson_data

def main():
    with open(os.path.join(DATA_DIR, "lectures.json"), "r", encoding="utf-8") as f:
        lectures = json.load(f)
        
    for l in lectures:
        num = l["number"]
        if num == 0:
            continue # Already has lesson.json
        title = l["title"]
        notes_path = os.path.join(DATA_DIR, f"lecture_{num}", "notes.md")
        dest_path = os.path.join(DATA_DIR, f"lecture_{num}", "lesson.json")
        
        print(f"Processing Lecture {num}: {title}...")
        lesson = parse_notes_file(notes_path, num, title)
        if lesson:
            with open(dest_path, "w", encoding="utf-8") as out:
                json.dump(lesson, out, indent=2, ensure_ascii=False)
            print(f"  Saved: {dest_path}")
        else:
            print(f"  Warning: notes.md not found for Lecture {num}")

if __name__ == "__main__":
    main()
