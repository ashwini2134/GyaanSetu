#!/usr/bin/env python3
"""Fix all Real-Life Analogy images to match their analogy text.

Every think_of block's analogy.image must visually represent the analogy title.
This script:
1. Defines correct image mappings for each known analogy
2. Patches all lesson JSON files
3. Validates consistency
"""
import json, os, re, sys

# ── Correct image mappings ────────────────────────────────────────────────
# Each analogy title (lowercase substring match) → correct Unsplash image URL
# Using images verified to exist and visually represent the analogy concept.

IMAGE_MAP = {
    # ── Lecture 0 ──
    "recipe": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
    "swiss army knife": "https://images.unsplash.com/photo-1615127717889-8945dba1f05a?w=800&q=80",
    "multi-tool": "https://images.unsplash.com/photo-1615127717889-8945dba1f05a?w=800&q=80",
    "toolbox": "https://images.unsplash.com/photo-1707185312114-16837728e5fb?w=800&q=80",
    "setting up your kitchen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",

    # ── Lecture 1 ──
    "labeled storage box": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
    "different containers": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800&q=80",
    "repackaging": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",

    # ── Lecture 2 ──
    "receptionist": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    "fill-in-the-blank": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",

    # ── Lecture 3 ──
    "the order rulebook": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    "gatekeepers": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",

    # ── Lecture 4 ──
    "traffic light": "https://images.unsplash.com/photo-1557404763-69708cd8b9ce?w=800&q=80",

    # ── Lecture 5 ──
    "washing machine cycle": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",

    # ── Lecture 6 ──
    "checking your phone": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",

    # ── Lecture 7 ──
    "shopping list": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    "shopping": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",

    # ── Lecture 8 ──
    "sealed envelope": "https://images.unsplash.com/photo-1649019489428-70f505daacd6?w=800&q=80",
    "bag of unique": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800&q=80",

    # ── Lecture 9 ──
    "phone book": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",

    # ── Lecture 10 ──
    "vending machine": "https://images.unsplash.com/photo-1618506557292-ec1862b3c506?w=800&q=80",

    # ── Lecture 11 ──
    "chain of characters": "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
    "editing tools": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",

    # ── Lecture 12 ──
    "notebook": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",

    # ── CS50P ──
    "a labeled storage box": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
    "a recipe book": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",

    # ── CS50 AI specific analogies ──
    "ai as a very fast": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    "teaching a dog tricks": "https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=800&q=80",
    "navigating a maze": "https://images.unsplash.com/photo-1590278458425-6aa3912a48a5?w=800&q=80",
    "checking every shelf": "https://images.unsplash.com/photo-1603058817990-2b9a9abbce86?w=800&q=80",
    "gps that considers": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
    "real life analogy": "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80",
}


def find_matching_image(analogy_title):
    """Find the best matching image for a given analogy title."""
    title_lower = analogy_title.lower().strip()

    # Direct match first
    for key, url in IMAGE_MAP.items():
        if key in title_lower or title_lower in key:
            return url

    # Partial match
    for key, url in IMAGE_MAP.items():
        words = key.split()
        if len(words) >= 2 and all(w in title_lower for w in words):
            return url

    return None


def fix_lesson_json(filepath):
    """Fix all think_of and concept_visualization blocks in a lesson file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    fixed_count = 0
    for section in data.get('sections', []):
        for block in section.get('blocks', []):
            if block['type'] == 'think_of':
                analogy = block.get('analogy', {})
                title = analogy.get('title', '')
                new_image = find_matching_image(title)
                if new_image:
                    old_image = analogy.get('image', '')
                    if old_image != new_image:
                        analogy['image'] = new_image
                        fixed_count += 1
                        print(f"  ✓ Fixed: '{title}'")

            elif block['type'] == 'concept_visualization':
                analogy = block.get('analogy', {})
                title = analogy.get('title', '')
                if not title:
                    title = block.get('leftPanel', {}).get('title', '')
                new_image = find_matching_image(title)
                if new_image:
                    old_image = analogy.get('image', '')
                    if old_image != new_image:
                        # Support both schemas
                        if 'analogy' in block:
                            block['analogy']['image'] = new_image
                        elif 'leftPanel' in block:
                            block['leftPanel']['image'] = new_image
                        fixed_count += 1
                        print(f"  ✓ Fixed CV: '{title}'")

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return fixed_count


def validate_consistency(filepath):
    """Validate that all think_of blocks have matching images."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    issues = []
    for section in data.get('sections', []):
        for block in section.get('blocks', []):
            if block['type'] == 'think_of':
                analogy = block.get('analogy', {})
                title = analogy.get('title', '')
                image = analogy.get('image', '')
                new_image = find_matching_image(title)
                if new_image and image != new_image:
                    issues.append(f"  ❌ '{title}' — image still mismatched")
                elif not new_image:
                    issues.append(f"  ⚠️ '{title}' — no image mapping found, current: {image.split('/photo-')[1].split('?')[0] if '/photo-' in image else 'unknown'}")

    return issues


def main():
    base_dirs = [
        "frontend/public/data/python",
        "frontend/public/data/cs50p",
        "frontend/public/data/cs50ai",
    ]

    total_fixed = 0
    total_files = 0
    all_issues = []

    for base in base_dirs:
        if not os.path.isdir(base):
            print(f"Skipping {base} (not found)")
            continue
        for root, dirs, files in os.walk(base):
            for file in files:
                if file == 'lesson.json':
                    filepath = os.path.join(root, file)
                    rel_path = os.path.relpath(filepath)
                    print(f"\n📁 {rel_path}")
                    fixed = fix_lesson_json(filepath)
                    total_fixed += fixed
                    total_files += 1
                    issues = validate_consistency(filepath)
                    all_issues.extend([f"{rel_path}: {i}" for i in issues])

    print(f"\n{'='*60}")
    print(f"✅ Fixed {total_fixed} images across {total_files} files")
    if all_issues:
        print(f"\n⚠️  Remaining issues ({len(all_issues)}):")
        for issue in all_issues:
            print(issue)
    else:
        print("✅ All images verified consistent!")


if __name__ == "__main__":
    main()
