"""
Shorten think_of code examples to fit within fixed card height:
  code:    max 5 lines
  output:  max 4 lines
"""

import json, os

DATA_DIR = "frontend/public/data"

# Map of (lecture_path, analogy_title) -> (new_code, new_output)
FIXES = {
    # ── lecture_7 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_7/lesson.json", "Think of an LLM as a Very Well-Read Librarian"): (
        'text = {"the": ["cat", "dog"], "cat": ["sat"]}\n'
        'word = "the"\n'
        'for _ in range(3):\n'
        '    word = text[word][0]\n'
        '    print(word, end=" ")',
        "cat sat on"
    ),

    # ── lecture_0 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_0/lesson.json", "Think of AI as a Very Fast, Tireless Assistant"): (
        'words = ["win", "free", "money"]\n'
        'if "free" in words and "money" in words:\n'
        '    print("Spam: promotional keywords")\n'
        'else:\n'
        '    print("Not spam")',
        "Spam: promotional keywords"
    ),

    # ── lecture_9 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_9/lesson.json", "Think of Project Planning as a Blueprint"): (
        'def build(problem, data, model):\n'
        '    print(f"1. Problem: {problem}")\n'
        '    print(f"2. Data: {len(data)} samples")\n'
        '    print(f"3. Model: {model}")\n'
        'build("Spam", ["e1", "e2"], "NB")',
        "1. Problem: Spam\n2. Data: 2 samples\n3. Model: NB"
    ),
    ("cs50ai/lecture_9/lesson.json", "Think of Project Workflow as a Recipe"): (
        'steps = ["Prepare", "Train", "Evaluate", "Deploy"]\n'
        'for s in steps:\n'
        '    print(f"  \\u2192 {s}")\n'
        'print("\\u2705 Complete!")',
        "  \u2192 Prepare\n  \u2192 Train\n  \u2192 Evaluate\n  \u2192 Deploy\n\u2705 Complete!"
    ),

    # ── lecture_8 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_8/lesson.json", "Think of AI Bias as a One-Sided Story"): (
        'scores = [("Alice", 85), ("Bob", 78), ("Eve", 92)]\n'
        'avg = sum(s for _, s in scores[:2]) / 2\n'
        'print(f"Trained on male-only: avg {avg}")\n'
        'print("Eve scored higher but was excluded")',
        "Trained on male-only: avg 81.5\nEve scored higher but was excluded"
    ),
    ("cs50ai/lecture_8/lesson.json", "Think of Responsible AI as a Safety Checklist"): (
        'def audit(transparent, fair, private):\n'
        '    passed = sum([transparent, fair, private])\n'
        '    print("Pass" if passed == 3 else f"{3-passed} fail(s)")\n'
        'audit(True, False, True)',
        "1 fail(s)"
    ),

    # ── lecture_1 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_1/lesson.json", "Think of Navigating a Maze"): (
        'maze = {"start": ["A", "B"], "A": ["exit"]}\n'
        'path = ["start"]\n'
        'while path[-1] != "exit":\n'
        '    path.append(maze[path[-1]][0])\n'
        'print(" \\u2192 ".join(path))',
        "start \u2192 A \u2192 exit"
    ),
    ("cs50ai/lecture_1/lesson.json", "BFS = Checking Every Shelf on Floor 1 First"): (
        'graph = {"A": ["B", "C"], "B": ["D"], "C": ["E"]}\n'
        'seen, queue = [], ["A"]\n'
        'while queue:\n'
        '    node = queue.pop(0)\n'
        '    seen.append(node)\n'
        '    queue.extend(graph.get(node, []))\n'
        'print(" \\u2192 ".join(seen))',
        "A \u2192 B \u2192 C \u2192 D \u2192 E"
    ),
    ("cs50ai/lecture_1/lesson.json",
     "A* = GPS That Considers Distance Traveled AND Estimated Distance"): (
        'graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"]}\n'
        'path, node = ["A"], "A"\n'
        'while node != "D":\n'
        '    node = graph[node][0]\n'
        '    path.append(node)\n'
        'print(" \\u2192 ".join(path))',
        "A \u2192 B \u2192 D"
    ),

    # ── lecture_6 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_6/lesson.json", "Think of Neural Networks as a Team of Detectives"): (
        'inputs = [0.5, 0.8, 0.2]\n'
        'weights = [0.4, -0.3, 0.6]\n'
        'output = sum(i * w for i, w in zip(inputs, weights))\n'
        'print(f"Output: {output:.2f}")\n'
        'print("Fired!" if output > 0 else "Silent")',
        "Output: 0.08\nFired!"
    ),
    ("cs50ai/lecture_6/lesson.json", "Think of CNN as a Magnifying Glass Scanning a Photo"): (
        'image = [1, 0, 1, 0, 1]\n'
        'filter = [1, -1]\n'
        'out = [image[i]*filter[0] + image[i+1]*filter[1] for i in range(4)]\n'
        'print(f"Convolved: {out}")',
        "Convolved: [1, -1, 1, -1]"
    ),
    ("cs50ai/lecture_6/lesson.json",
     "Think of Neural Network Layers as a Factory Assembly Line"): (
        'x = [1, 0, 1]\n'
        'w = [[0.5, -0.2, 0.1], [-0.3, 0.8, -0.1]]\n'
        'h1 = [max(0, sum(i*w for i,w in zip(x,row))) for row in w]\n'
        'print(f"After layer 1: {h1}")',
        "After layer 1: [0.6, 0]"
    ),

    # ── lecture_3 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_3/lesson.json", "Think of Bayes' Rule as Updating Your Belief"): (
        'prior, sens, fp = 0.3, 0.8, 0.1\n'
        'post = (prior * sens) / (prior * sens + (1 - prior) * fp)\n'
        'print(f"P(spam | word) = {post:.0%}")',
        "P(spam | word) = 77%"
    ),

    # ── lecture_4 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_4/lesson.json", "Think of Optimization as Packing a Suitcase"): (
        'items = [("phone",1,800), ("laptop",3,1000)]\n'
        'cap = 4\n'
        'for name, w, _ in sorted(items, key=lambda x: -x[2]/x[1]):\n'
        '    if w <= cap: print(name); cap -= w',
        "phone\nlaptop"
    ),
    ("cs50ai/lecture_4/lesson.json", "Think of CSP as a Classroom Seating Chart"): (
        'enemies = {"Alice": {"Bob"}, "Bob": {"Alice"}}\n'
        'seats = ["Alice", "Bob"]\n'
        'if seats[1] in enemies[seats[0]]:\n'
        '    print("Conflict: adjacent enemies")',
        "Conflict: adjacent enemies"
    ),

    # ── lecture_5 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_5/lesson.json", "Think of ML as Learning to Sort Laundry"): (
        'seen = {"t-shirt": "small", "jeans": "large"}\n'
        'new = "shirt"\n'
        'print(seen.get(new, "predicting small"))',
        "predicting small"
    ),
    ("cs50ai/lecture_5/lesson.json", "Think of Reinforcement Learning as Training a Puppy"): (
        'rewards = {"sit": 5, "stay": 3, "jump": -1}\n'
        'best = max(rewards, key=rewards.get)\n'
        'print(f"Learned: {best} is best")',
        "Learned: sit is best"
    ),
    ("cs50ai/lecture_5/lesson.json", "Think of ML Pipeline as a Factory Assembly Line"): (
        'raw = ["  Hello  ", "WORLD", "  AI  "]\n'
        'clean = [s.strip().lower() for s in raw]\n'
        'print(f"Cleaned: {clean}")',
        "Cleaned: ['hello', 'world', 'ai']"
    ),

    # ── lecture_2 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_2/lesson.json", "Think of Logic as a Detective"): (
        'is_human, is_alive = True, True\n'
        'if is_human and is_alive:\n'
        '    print("Needs oxygen")\n'
        'if is_human:\n'
        '    print("Mortal")',
        "Needs oxygen\nMortal"
    ),
    ("cs50ai/lecture_2/lesson.json", "Think of Inference as a Puzzle Solver"): (
        'facts = ["bird"]\n'
        'rules = {"bird": "has_wings", "has_wings": "can_fly"}\n'
        'for fact in facts:\n'
        '    if fact in rules:\n'
        '        print(f"\\u2192 {rules[fact]}")',
        "\u2192 has_wings"
    ),
}


def main():
    count = 0
    for (rel_path, title), (new_code, new_output) in FIXES.items():
        full = os.path.join(DATA_DIR, rel_path)
        with open(full) as f:
            data = json.load(f)
        modified = False
        for sec in data.get("sections", []):
            for blk in sec.get("blocks", []):
                if blk.get("type") == "think_of" and blk.get("analogy", {}).get("title") == title:
                    blk["code"]["code"] = new_code
                    blk["code"]["output"] = new_output
                    modified = True
                    count += 1
                    print(f"  Fixed: {title}")
        if modified:
            with open(full, "w") as f:
                json.dump(data, f, indent=2)
                f.write("\n")
    print(f"\nDone. {count} examples fixed.")


if __name__ == "__main__":
    main()
