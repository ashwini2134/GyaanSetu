"""
Shorten long analogy descriptions and trim oversized categories.
"""

import json, os

DATA_DIR = "frontend/public/data"

DESCRIPTION_FIXES = {
    # ── lecture_0 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_0/lesson.json", "Think of AI as a Very Fast, Tireless Assistant"):
        "Processes millions of examples instantly",
    ("cs50ai/lecture_0/lesson.json", "Think of ML as Teaching a Dog Tricks"):
        "Show examples, reward correct predictions",
    ("cs50ai/lecture_0/lesson.json", "Think of AI as a GPS Navigator"):
        "Uses data and heuristics to find the best route",

    # ── lecture_1 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_1/lesson.json", "Think of Navigating a Maze"):
        "Explore paths until you find the exit",
    ("cs50ai/lecture_1/lesson.json", "BFS = Checking Every Shelf on Floor 1 First"):
        "Explore all paths level by level",
    ("cs50ai/lecture_1/lesson.json", "A* = GPS That Considers Distance Traveled AND Estimated Distance"):
        "Chooses the most promising path using heuristics",

    # ── lecture_2 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_2/lesson.json", "Think of Logic as a Detective"):
        "Use facts and rules to deduce conclusions",
    ("cs50ai/lecture_2/lesson.json", "Think of Inference as a Puzzle Solver"):
        "Apply rules to known facts to derive new facts",
    ("cs50ai/lecture_2/lesson.json", "Think of Knowledge as a Family Tree"):
        "Organized facts connected by relationships",

    # ── lecture_3 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_3/lesson.json", "Think of Probability as a Weather Forecast"):
        "Quantify uncertainty with numbers between 0 and 1",
    ("cs50ai/lecture_3/lesson.json", "Think of Bayes' Rule as Updating Your Belief"):
        "Update probabilities when new evidence arrives",
    ("cs50ai/lecture_3/lesson.json", "Think of Probability Flow as a Branching Path"):
        "Each decision leads to different possible outcomes",

    # ── lecture_4 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_4/lesson.json", "Think of Optimization as Packing a Suitcase"):
        "Choose the best combination within constraints",
    ("cs50ai/lecture_4/lesson.json", "Think of CSP as a Classroom Seating Chart"):
        "Assign values to variables while respecting constraints",
    ("cs50ai/lecture_4/lesson.json", "Think of Optimization Flow as a Delivery Route"):
        "Find the shortest or cheapest path through a network",

    # ── lecture_5 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_5/lesson.json", "Think of ML as Learning to Sort Laundry"):
        "Learn patterns from labeled examples",
    ("cs50ai/lecture_5/lesson.json", "Think of Reinforcement Learning as Training a Puppy"):
        "Learn by trial and error with rewards",
    ("cs50ai/lecture_5/lesson.json", "Think of ML Pipeline as a Factory Assembly Line"):
        "Raw data goes through stages to produce predictions",

    # ── lecture_6 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_6/lesson.json", "Think of Neural Networks as a Team of Detectives"):
        "Each neuron detects a specific pattern",
    ("cs50ai/lecture_6/lesson.json", "Think of CNN as a Magnifying Glass Scanning a Photo"):
        "A filter slides across the image to detect features",
    ("cs50ai/lecture_6/lesson.json", "Think of Neural Network Layers as a Factory Assembly Line"):
        "Each layer transforms data before passing it forward",

    # ── lecture_7 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_7/lesson.json", "Think of Tokenization as Slicing a Pizza"):
        "Split text into smaller pieces for processing",
    ("cs50ai/lecture_7/lesson.json", "Think of Word Embeddings as a Map of Meanings"):
        "Similar words are close together in vector space",
    ("cs50ai/lecture_7/lesson.json", "Think of an LLM as a Very Well-Read Librarian"):
        "Predicts the next word based on billions of examples",

    # ── lecture_8 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_8/lesson.json", "Think of AI Bias as a One-Sided Story"):
        "Biased training data leads to unfair outcomes",
    ("cs50ai/lecture_8/lesson.json", "Think of Hallucination as an Over-Confident Friend"):
        "AI confidently generates false information",
    ("cs50ai/lecture_8/lesson.json", "Think of Responsible AI as a Safety Checklist"):
        "Ensure AI is transparent, fair, and private",

    # ── lecture_9 ──────────────────────────────────────────────────────────
    ("cs50ai/lecture_9/lesson.json", "Think of the AI Journey as Learning to Ride a Bike"):
        "Start simple, practice, then handle complex tasks",
    ("cs50ai/lecture_9/lesson.json", "Think of Project Planning as a Blueprint"):
        "Define the problem, gather data, choose a model",
    ("cs50ai/lecture_9/lesson.json", "Think of Project Workflow as a Recipe"):
        "Follow a sequence of steps to build and deploy AI",
}


CATEGORIES_TRIM = {
    # Trim to max 4 items
    ("cs50ai/lecture_9/lesson.json", "Think of the AI Journey as Learning to Ride a Bike"): 4,
    ("python/lecture_0/lesson.json", "Swiss Army Knife"): 4,
}


def main():
    # Fix descriptions
    desc_count = 0
    for (rel_path, title), new_desc in DESCRIPTION_FIXES.items():
        full = os.path.join(DATA_DIR, rel_path)
        with open(full) as f:
            data = json.load(f)
        modified = False
        for sec in data.get("sections", []):
            for blk in sec.get("blocks", []):
                if blk.get("type") == "think_of" and blk.get("analogy", {}).get("title") == title:
                    blk["analogy"]["description"] = new_desc
                    modified = True
                    desc_count += 1
        if modified:
            with open(full, "w") as f:
                json.dump(data, f, indent=2)
                f.write("\n")

    # Trim categories
    cat_count = 0
    for (rel_path, title), max_items in CATEGORIES_TRIM.items():
        full = os.path.join(DATA_DIR, rel_path)
        with open(full) as f:
            data = json.load(f)
        modified = False
        for sec in data.get("sections", []):
            for blk in sec.get("blocks", []):
                if blk.get("type") == "think_of" and blk.get("analogy", {}).get("title") == title:
                    vis = blk.get("visualization", {})
                    if vis.get("items") and len(vis["items"]) > max_items:
                        vis["items"] = vis["items"][:max_items]
                        modified = True
                        cat_count += 1
        if modified:
            with open(full, "w") as f:
                json.dump(data, f, indent=2)
                f.write("\n")

    print(f"Fixed {desc_count} descriptions, trimmed {cat_count} categories")


if __name__ == "__main__":
    main()
