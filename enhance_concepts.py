#!/usr/bin/env python3
"""Per-concept educational visualizations — 3-column concept_visualization blocks
for every 'Think Of' analogy, followed by 'Is This Correct?' reflection cards.
Replaces all old process_flow / architecture_diagram / memory_layout / lifecycle_diagram
visual_aid kinds with meaningful educational content.

IMPORTANT: Every analogy image must visually represent the analogy itself
(never use generic programming screenshots). The image field is the actual
Unsplash URL that matches the analogy concept.
"""
import json, os

BASE = "frontend/public/data/python"

# Analogy title keywords → matching visually representative Unsplash images
ANALOGY_IMAGES = {
    "recipe": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
    "swiss army": "https://images.unsplash.com/photo-1615127717889-8945dba1f05a?w=800&q=80",
    "toolbox": "https://images.unsplash.com/photo-1707185312114-16837728e5fb?w=800&q=80",
    "kitchen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    "labeled storage": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
    "labeled jar": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
    "containers": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800&q=80",
    "repackaging": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
    "receptionist": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    "fill-in-the-blank": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    "rulebook": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    "gatekeeper": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
    "traffic light": "https://images.unsplash.com/photo-1557404763-69708cd8b9ce?w=800&q=80",
    "washing machine": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
    "checking your phone": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",
    "shopping list": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    "shopping": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    "sealed envelope": "https://images.unsplash.com/photo-1649019489428-70f505daacd6?w=800&q=80",
    "bag of unique": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800&q=80",
    "phone book": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
    "vending machine": "https://images.unsplash.com/photo-1618506557292-ec1862b3c506?w=800&q=80",
    "chain": "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
    "editing tools": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    "notebook": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
    "installing python": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    "setting": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
}

def get_analogy_image(title):
    """Look up the correct visual image for an analogy title."""
    title_lower = title.lower()
    for key, url in ANALOGY_IMAGES.items():
        if key in title_lower:
            return url
    return None

def cv(title, left, center, right, color="blue"):
    # Auto-detect the matching analogy image from the title
    image_url = get_analogy_image(title) or get_analogy_image(left.get("title", "")) or left.get("image")
    return {
        "type": "concept_visualization",
        "title": title,
        "accentColor": color,
        "leftPanel": {
            "label": "Real Life Analogy",
            "emoji": left.get("emoji", "💡"),
            "title": left.get("title", ""),
            "description": left.get("desc", ""),
            "image": image_url,
        },
        "centerPanel": {
            "label": "Programming Concept",
            "visualType": center.get("visualType", "text"),
            "varName": center.get("varName"),
            "varValue": center.get("varValue"),
            "flowSteps": center.get("flowSteps"),
            "textContent": center.get("text"),
        },
        "rightPanel": {
            "label": "Code Example",
            "code": right.get("code", ""),
            "language": "python",
            "output": right.get("output", ""),
        },
    }

def rf(question, answer, followup_code=None, followup_output=None):
    return {
        "type": "reflection",
        "question": question,
        "answer": answer,
        "followupCode": followup_code,
        "followupOutput": followup_output,
    }

# ── Per-lecture mappings ──────────────────────────────────────────────────
# Each entry: (keywords, concept_visualization, reflection)
# Both the CV and reflection are inserted after the matching explanation/analogy.

ENTRIES = {
    0: [
        ("cooking recipe",
         cv("Think Of A Program As A Cooking Recipe",
            {"emoji": "📖", "title": "Recipe", "desc": "Ingredients + Steps → Dish"},
            {"visualType": "flow_diagram", "flowSteps": ["Ingredients", "↓", "Instructions", "↓", "Dish"]},
            {"code": "print('Hello World')", "output": "Hello World"},
            "orange"),
         rf("Is it true that a programming language is like a recipe because both have a list of steps that must be followed exactly?",
            "Yes! Both recipes and programs are sequences of instructions. A recipe tells a cook what to do step by step. A program tells the computer what to do step by step. If you skip a step in a recipe, the dish may not turn out right. If you skip a step in code, the program may crash or give the wrong output.")),
        ("swiss army knife",
         cv("Think Of Python As A Swiss Army Knife",
            {"emoji": "🔧", "title": "Swiss Army Knife", "desc": "One tool, many uses"},
            {"visualType": "text", "text": "Python is a multi-purpose language:\n• Web Development\n• Data Science\n• AI / Machine Learning\n• Automation"},
            {"code": "# Python can build anything\nprint('Hello from Python!')", "output": "Hello from Python!"},
            "purple"),
         rf("Can you build a website with Python even though we only printed text?",
            "Absolutely! Printing text is just the beginning. Python has special libraries (Django, Flask) that help build websites, and libraries (Pandas, NumPy) for data science. The Swiss Army Knife idea means one language can do all of these things — you just pick the right tool (library) for the job.")),
        ("installing python",
         cv("Think Of Installing Python As Setting Up A Kitchen",
            {"emoji": "🔨", "title": "Setting Up Your Kitchen", "desc": "Gather tools before you cook"},
            {"visualType": "text", "text": "Install once, use anywhere.\n1. Download from python.org\n2. Run installer\n3. Verify with python --version"},
            {"code": "python --version\nPython 3.12.0", "output": "Python 3.12.0"},
            "blue"),
         rf("Do you need to reinstall Python every time you want to write a new program?",
            "No! You install Python once, and it stays on your computer. After that, you can write and run any number of programs — just like a kitchen stays ready for you to cook again and again.")),
    ],
    1: [
        ("labeled jar",
         cv("Think Of A Variable As A Labeled Storage Box",
            {"emoji": "🏷️", "title": "Labeled Storage Box", "desc": "Each box has a label and holds one item"},
            {"visualType": "storage_box", "varName": "name", "varValue": '"Lakshanya"'},
            {"code": "name = 'Lakshanya'\nprint(name)", "output": "Lakshanya"},
            "blue"),
         rf("After writing name = 'Lakshanya', does the variable name store the word 'name' or the value 'Lakshanya'?",
            "The variable name stores the value 'Lakshanya'. Think of it like a box labeled 'name' that contains the item 'Lakshanya'. The label (variable name) helps you find the box, but the content is the actual value you stored.")),
        ("every value has a type",
         cv("Think Of Data Types As Different Containers",
            {"emoji": "📦", "title": "Different Containers", "desc": "Each container type holds specific kinds of items"},
            {"visualType": "text", "text": "int → stores whole numbers (42)\nfloat → stores decimals (3.14)\nstr → stores text ('Hello')\nbool → stores True/False"},
            {"code": "age = 20\npi = 3.14\nname = 'Alice'\nis_student = True\nprint(age, pi, name, is_student)", "output": "20 3.14 Alice True"},
            "purple"),
         rf("Can you put text inside an int container? For example, int_name = 'Alice'.",
            "No! An int container only holds whole numbers. If you try age = 'Alice', Python will treat it as text (a string), not a number. The type matters because Python behaves differently with each type — you can do math with ints but not with strings.")),
        ("type conversion",
         cv("Think Of Type Conversion As Repackaging",
            {"emoji": "🔄", "title": "Repackaging Items", "desc": "Change the container type while preserving the value"},
            {"visualType": "text", "text": '"42" (str) → int("42") → 42 (int)\n42 (int) → float(42) → 42.0 (float)'},
            {"code": "print(int('42') + 8)\nprint(float(42))", "output": "50\n42.0"},
            "green"),
         rf("If you have '42' (a string) and you call int('42'), does the original '42' string change permanently?",
            "No! Type conversion creates a new value in the new type. The original string '42' still exists as a string if you stored it in a variable. Python does not modify the original — it just converts it temporarily for the operation.")),
    ],
    2: [
        ("receptionist",
         cv("Think Of input() As A Receptionist",
            {"emoji": "🧑‍💼", "title": "Receptionist", "desc": "Receptionist asks a question, waits for your answer, then tells the program"},
            {"visualType": "text", "text": "input():\n1. Displays a prompt\n2. Pauses and waits\n3. Captures what you type\n4. Returns it as a string"},
            {"code": "name = input('Enter your name: ')\nprint('Hello, ' + name + '!')", "output": "Enter your name: Alice\nHello, Alice!"},
            "green"),
         rf("Does input() let the program continue running while waiting for the user to type something?",
            "No! input() pauses the program completely and waits. The program sits at that line and does nothing else until the user presses Enter. This is like a receptionist who stops everything to listen to your question before continuing their work.")),
        ("formatting with f-strings",
         cv("Think Of f-Strings As Fill-In-The-Blank Templates",
            {"emoji": "📝", "title": "Fill-In-The-Blank", "desc": "Write the sentence with blanks { }, then fill them with variable values"},
            {"visualType": "text", "text": 'f"Hello, {name}!"\nThe {name} gets replaced\nwith the variable value'},
            {"code": "name = 'Bob'\nage = 25\nprint(f'{name} is {age} years old')", "output": "Bob is 25 years old"},
            "blue"),
         rf("Does f'Hello, {name}' work the same as f'Hello, {name}' with double quotes?",
            "Yes! f-strings work with both single quotes f'...' and double quotes f\"...\". The f before the quote tells Python this is a special string where {curly braces} are replaced with variable values.")),
    ],
    3: [
        ("pemdas",
         cv("Think Of PEMDAS As Math's Rulebook",
            {"emoji": "📏", "title": "The Order Rulebook", "desc": "PEMDAS tells Python which math operation to perform first"},
            {"visualType": "text", "text": "P → Parentheses first\nE → Exponents next\nMD → Multiply/Divide left to right\nAS → Add/Subtract left to right"},
            {"code": "result = (2 + 3) * 4\nprint(result)\nresult2 = 2 + 3 * 4\nprint(result2)", "output": "20\n14"},
            "orange"),
         rf("Does Python always calculate left to right no matter what?",
            "No! Python follows PEMDAS rules, not simple left-to-right. In 2 + 3 * 4, multiplication happens first (3 * 4 = 12), then addition (2 + 12 = 14). If you want addition first, use parentheses: (2 + 3) * 4 = 20.")),
        ("gatekeepers",
         cv("Think Of and / or As Gatekeepers",
            {"emoji": "🚧", "title": "Gatekeepers", "desc": "and = BOTH must pass. or = AT LEAST ONE must pass."},
            {"visualType": "text", "text": "and: Both True → True\nor: At least one True → True\nnot: True ↔ False"},
            {"code": "age = 20\nhas_id = True\nprint(age >= 18 and has_id)\nprint(age < 18 or not has_id)", "output": "True\nFalse"},
            "purple"),
         rf("If you are 17 years old (age = 17) and have an ID (has_id = True), does age >= 18 and has_id evaluate to True?",
            "No! The 'and' gatekeeper requires BOTH conditions to be True. age >= 18 is False (you're 17), so even though has_id is True, the whole expression is False. With 'or', only one needs to be True.")),
    ],
    4: [
        ("traffic light",
         cv("Think Of If/Else As A Traffic Light",
            {"emoji": "🚦", "title": "Traffic Light", "desc": "Green → GO, Red → STOP. The condition decides which path to take."},
            {"visualType": "text", "text": "if condition == True → run code inside if\nif condition == False → skip to else"},
            {"code": "light = 'green'\nif light == 'green':\n    print('Go!')\nelse:\n    print('Stop!')", "output": "Go!"},
            "green"),
         rf("Does an if/else statement always run both the if block and the else block?",
            "No! An if/else runs exactly ONE of the two blocks — never both. If the condition is True, the if block runs and the else block is skipped. If the condition is False, the if block is skipped and the else block runs. Like a traffic light, it's either green or red — not both at the same time.")),
    ],
    5: [
        ("washing machine",
         cv("Think Of A For Loop As A Washing Machine Cycle",
            {"emoji": "🧺", "title": "Washing Machine Cycle", "desc": "The machine runs through each step automatically for every item"},
            {"visualType": "text", "text": "For each item in the list:\n1. Take the next item\n2. Process it\n3. Move to the next\n4. Repeat until done"},
            {"code": "for i in range(3):\n    print(f'Wash cycle {i + 1}')", "output": "Wash cycle 1\nWash cycle 2\nWash cycle 3"},
            "blue"),
         rf("If you use for i in range(3), does the loop body run 3 times or 4 times?",
            "The loop body runs exactly 3 times — for i = 0, 1, and 2. range(3) gives you the numbers 0, 1, 2 (three numbers total). The loop stops after processing the last number, just like a washing machine stops after its final spin cycle.")),
    ],
    6: [
        ("checking your phone",
         cv("Think Of A While Loop As Checking Your Phone",
            {"emoji": "📱", "title": "Checking Your Phone", "desc": "Keep checking until there are no more notifications"},
            {"visualType": "text", "text": "while condition is True:\n    Do something\n    Update the condition\nStop when condition becomes False"},
            {"code": "count = 3\nwhile count > 0:\n    print(f'{count} notifications left')\n    count -= 1\nprint('All caught up!')", "output": "3 notifications left\n2 notifications left\n1 notifications left\nAll caught up!"},
            "green"),
         rf("What happens if you forget to update count inside the while loop?",
            "The loop would run forever! If count never decreases, the condition count > 0 stays True forever. This is called an infinite loop. It's like checking your phone for notifications, but the number never goes down — you'd be stuck checking forever. Always update the variable that controls the condition.")),
    ],
    7: [
        ("shopping list",
         cv("Think Of A List As A Shopping List",
            {"emoji": "🛒", "title": "Shopping List", "desc": "Items in order. Add, remove, or access by position."},
            {"visualType": "text", "text": "A list is an ordered collection:\n• Items stay in order\n• Access by position (index)\n• Add/remove items anytime"},
            {"code": "fruits = ['apple', 'banana', 'cherry']\nprint(fruits[0])\nfruits.append('date')\nprint(fruits)", "output": "apple\n['apple', 'banana', 'cherry', 'date']"},
            "blue"),
         rf("Does fruits[0] give you the first item or the last item in the list?",
            "fruits[0] gives you the first item ('apple'). In Python, indexing starts at 0, not 1. So index 0 = first item, index 1 = second, and so on. This is like saying 'position 0' on your shopping list is the very first item you wrote down.")),
    ],
    8: [
        ("sealed envelope",
         cv("Think Of A Tuple As A Sealed Envelope",
            {"emoji": "✉️", "title": "Sealed Envelope", "desc": "Once sealed, contents cannot change. Safe and tamper-proof."},
            {"visualType": "text", "text": "Tuple = Sealed Envelope:\n• Create once with ( )\n• Contents are fixed\n• Cannot add/remove/change"},
            {"code": "coords = (10, 20)\nprint(coords[0])\n# coords[0] = 5  ← Error!", "output": "10"},
            "purple"),
         rf("Can you change the first value of coords = (10, 20) by writing coords[0] = 5?",
            "No! Tuples are immutable — once created, their contents cannot change. Trying coords[0] = 5 would give an error. This is the whole point of a tuple: it guarantees the data stays the same, like a sealed envelope.")),
        ("what is a set",
         cv("Think Of A Set As A Bag Of Unique Marbles",
            {"emoji": "🎒", "title": "Bag Of Unique Items", "desc": "Every marble appears only once. No duplicates allowed."},
            {"visualType": "text", "text": "Set = Unique Collection:\n• No duplicate items\n• Unordered (no index)\n• Fast membership testing"},
            {"code": "numbers = {1, 2, 2, 3, 3, 3}\nprint(numbers)\nprint(2 in numbers)", "output": "{1, 2, 3}\nTrue"},
            "blue"),
         rf("If you create a set with {1, 2, 2, 3, 3, 3}, how many items will it contain?",
            "The set will contain 3 items: {1, 2, 3}. All duplicates are automatically removed because a set only stores unique values. This is like having a bag of marbles where you toss out any duplicates — only one of each color remains.")),
    ],
    9: [
        ("phone book",
         cv("Think Of A Dictionary As A Phone Book",
            {"emoji": "📞", "title": "Phone Book", "desc": "Look up a name (key) to find the number (value)."},
            {"visualType": "text", "text": "Dictionary = Key→Value Pairs:\n• Keys are unique labels\n• Each key maps to a value\n• Fast lookup by key"},
            {"code": "phone = {'Alice': '123', 'Bob': '456'}\nprint(phone['Alice'])\nphone['Charlie'] = '789'\nprint(phone)", "output": "123\n{'Alice': '123', 'Bob': '456', 'Charlie': '789'}"},
            "green"),
         rf("Can two people have the same phone number in a dictionary? Can two keys have the same value?",
            "Yes! Values can be duplicated. Two different keys (people) could have the same value (phone number). But the keys themselves must be unique — you cannot have two 'Alice' entries. It's like a real phone book: two people can share a number, but you can't have two listings for Alice.")),
    ],
    10: [
        ("vending machine",
         cv("Think Of A Function As A Vending Machine",
            {"emoji": "🏪", "title": "Vending Machine", "desc": "Insert coins (input) → Press button (call) → Get item (output)"},
            {"visualType": "flow_diagram", "flowSteps": ["Input (Arguments)", "↓", "Function (Process)", "↓", "Output (Return Value)"]},
            {"code": "def add(a, b):\n    return a + b\n\nresult = add(3, 5)\nprint(result)", "output": "8"},
            "orange"),
         rf("Does every function need a return statement? What happens if you don't include one?",
            "No, a function does not need a return statement. If you don't include return, the function still runs its code but returns None (Python's way of saying 'nothing'). It's like a vending machine that takes your money and lights up but doesn't actually give you anything — the process happens, but there's no output.")),
    ],
    11: [
        ("strings are sequences",
         cv("Think Of A String As A Chain Of Characters",
            {"emoji": "⛓️", "title": "Chain of Characters", "desc": "Each character has a position. You can access individual links."},
            {"visualType": "text", "text": "String = ordered sequence of characters:\n• Each character has an index\n• Index starts at 0\n• Access with [ ] brackets"},
            {"code": "word = 'Python'\nprint(word[0])\nprint(word[-1])\nprint(word[1:4])", "output": "P\nn\nyth"},
            "blue"),
         rf("What does word[-1] give you for word = 'Python'?",
            "word[-1] gives you 'n', the last character. Negative indices count from the end of the string: -1 is the last character, -2 is the second-to-last, and so on. It's like asking 'what's the last link in the chain?' without having to count all the links first.")),
        ("powerful string methods",
         cv("Think Of String Methods As Editing Tools",
            {"emoji": "🛠️", "title": "Editing Tools", "desc": "Each method transforms the string in a specific way"},
            {"visualType": "text", "text": ".upper() → ALL CAPS\n.lower() → all lowercase\n.strip() → removes spaces\n.split() → breaks into list"},
            {"code": "msg = '  Hello World  '\nprint(msg.strip())\nprint(msg.strip().upper())", "output": "Hello World\nHELLO WORLD"},
            "purple"),
         rf("Does calling msg.upper() permanently change the original msg variable?",
            "No! String methods return a NEW string — they don't modify the original. If you want to keep the change, you must store it back: msg = msg.upper(). This is because strings in Python are immutable (cannot be changed after creation).")),
    ],
    12: [
        ("notebook",
         cv("Think Of File Handling As A Notebook",
            {"emoji": "📓", "title": "Notebook", "desc": "Open it, read/write pages, close it when done."},
            {"visualType": "text", "text": "File = Notebook:\n1. Open: file = open('notes.txt', 'r')\n2. Read/Write: content = file.read()\n3. Close: file.close()"},
            {"code": "with open('notes.txt', 'w') as f:\n    f.write('Hello, file!')\nwith open('notes.txt', 'r') as f:\n    print(f.read())", "output": "Hello, file!"},
            "blue"),
         rf("What happens if you forget to close a file after writing to it?",
            "The data you wrote might not be saved! Python buffers writes in memory for efficiency, and close() flushes that buffer to disk. Using 'with open(...) as f:' is safer because Python automatically closes the file for you — even if an error occurs. It's like always remembering to close your notebook after writing so you don't lose your notes.")),
    ],
}


def apply_entries():
    for n in range(14):
        path = os.path.join(BASE, f"lecture_{n}", "lesson.json")
        with open(path) as f:
            data = json.load(f)

        entries = ENTRIES.get(n, [])
        added = 0

        for section in data["sections"]:
            old = section["blocks"]
            new = []
            i = 0
            while i < len(old):
                block = old[i]
                new.append(block)

                if block["type"] in ("explanation", "analogy"):
                    title = (block.get("title") or block.get("text") or block.get("body") or "").lower()
                    for keywords, visual, reflection in entries:
                        kw_list = keywords if isinstance(keywords, (list, tuple)) else [keywords]
                        if any(kw in title for kw in kw_list):
                            new.append(visual)
                            new.append(reflection)
                            added += 2
                            break
                i += 1

            section["blocks"] = new

        with open(path, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"  Lecture {n}: {added} items added ({added//2} CV + {added//2} reflection)")

    print("Concept visualizations and reflections applied!")


if __name__ == "__main__":
    apply_entries()
