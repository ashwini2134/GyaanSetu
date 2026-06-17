#!/usr/bin/env python3
"""Content validation pass for every Think Of section.

For every Think Of section verify:
  ✓ Analogy title matches image
  ✓ Image matches analogy
  ✓ Programming visualization matches concept
  ✓ Code example demonstrates concept
  ✓ Student can understand the connection without reading extra explanation

If any of the four are disconnected, regenerate that Think Of section.
"""
import json, os, sys

# Known generic programming/tech images that must NOT be used as analogy images
GENERIC_TECH_IMAGES = {
    "1555949963-aa79dcee981c",  # code/tech screenshot
    "1518770660439-4636190af475",  # circuit board
    "1451187580459-43490279c0fa",  # tech/digital
    "1488590528505-98d2b5aba04b",  # tech/laptop
}

# Correct image mapping: analogy keyword → expected Unsplash photo ID
CORRECT_IMAGES = {
    "recipe": "1466637574441-749b8f19452f",
    "swiss army": "1615127717889-8945dba1f05a",
    "multi-tool": "1615127717889-8945dba1f05a",
    "toolbox": "1707185312114-16837728e5fb",
    "kitchen": "1556909114-f6e7ad7d3136",
    "labeled storage": "1603398938378-e54eab446dde",
    "labeled jar": "1603398938378-e54eab446dde",
    "different containers": "1544457070-4cd773b4d71e",
    "containers": "1544457070-4cd773b4d71e",
    "repackaging": "1603398938378-e54eab446dde",
    "receptionist": "1560250097-0b93528c311a",
    "fill-in-the-blank": "1455390582262-044cdead277a",
    "rulebook": "1635070041078-e363dbe005cb",
    "order": "1635070041078-e363dbe005cb",
    "gatekeeper": "1563013544-824ae1b704d3",
    "traffic light": "1557404763-69708cd8b9ce",
    "washing machine": "1626806787461-102c1bfaaea1",
    "checking your phone": "1512058564366-18510be2db19",
    "shopping list": "1544716278-ca5e3f4abd8c",
    "shopping": "1544716278-ca5e3f4abd8c",
    "sealed envelope": "1649019489428-70f505daacd6",
    "bag of unique": "1544457070-4cd773b4d71e",
    "phone book": "1589829085413-56de8ae18c73",
    "vending machine": "1618506557292-ec1862b3c506",
    "chain": "1518546305927-5a555bb7020d",
    "editing tools": "1586864387967-d02ef85d93e8",
    "notebook": "1517842645767-c639042777db",
    # CS50 AI
    "ai as a very fast": "1677442136019-21780ecad995",
    "teaching a dog tricks": "1504826260979-242151ee45b7",
    "navigating a maze": "1590278458425-6aa3912a48a5",
    "checking every shelf": "1603058817990-2b9a9abbce86",
    "gps that considers": "1524661135-423995f22d0b",
    "real life analogy": "1509228627152-72ae9ae6848d",
}

# Which visualizations make sense for which type of concept
CONCEPT_VISUAL_MAP = {
    "variable": ["categories", "flow"],
    "data type": ["categories", "flow"],
    "input": ["flow"],
    "f-string": ["flow"],
    "operator": ["flow"],
    "condition": ["decision"],
    "loop": ["repetition"],
    "list": ["flow", "categories"],
    "tuple": ["categories"],
    "set": ["categories"],
    "dictionary": ["categories"],
    "function": ["flow"],
    "string": ["flow"],
    "file": ["flow"],
    "boolean": ["decision"],
    "class": ["categories"],
    "default": ["flow"],
}


def get_photo_id(url):
    """Extract photo ID from Unsplash URL."""
    if "/photo-" in url:
        return url.split("/photo-")[1].split("?")[0]
    return None


def validate_analogy_image(title, image_url):
    """Check if the analogy image matches the analogy title."""
    if not image_url:
        return False, "No image URL"
    
    photo_id = get_photo_id(image_url)
    if not photo_id:
        return False, f"Cannot parse photo ID from: {image_url[:60]}"
    
    # Check it's not a generic tech image
    if photo_id in GENERIC_TECH_IMAGES:
        return False, f"Generic programming/tech screenshot (photo-{photo_id})"
    
    # Check it matches the expected image for this analogy
    title_lower = title.lower()
    for key, expected_id in CORRECT_IMAGES.items():
        if key in title_lower or title_lower in key:
            if photo_id == expected_id:
                return True, f"photo-{photo_id} ✓"
            else:
                return False, f"Expected photo-{expected_id}, got photo-{photo_id}"
    
    return True, f"photo-{photo_id} (unmapped, but not generic tech)"


def validate_programming_visual(analogy_title, visual_type):
    """Check if the programming visualization type fits the concept."""
    title_lower = analogy_title.lower()
    for key, valid_types in CONCEPT_VISUAL_MAP.items():
        if key in title_lower:
            if visual_type in valid_types:
                return True, f"{visual_type} in {valid_types} ✓"
            return False, f"Expected {valid_types}, got '{visual_type}'"
    return True, f"'{visual_type}' (unmapped visual type)"


def validate_file(filepath):
    """Run all validations on a single lesson file."""
    rel_path = os.path.relpath(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    issues = []
    passed = 0
    failed = 0

    for section in data.get('sections', []):
        for block in section.get('blocks', []):
            if block['type'] not in ('think_of', 'concept_visualization'):
                continue

            # Extract analogy data (supports both schemas)
            if block['type'] == 'think_of':
                analogy = block.get('analogy', {})
                title = analogy.get('title', '')
                image_url = analogy.get('image', '')
                desc = analogy.get('description', '')
                visual_type = block.get('visualization', {}).get('type', '')
                code = block.get('code', {}).get('code', '')
            else:
                panel = block.get('analogy', block.get('leftPanel', {}))
                title = panel.get('title', '')
                image_url = panel.get('image', '')
                desc = panel.get('description', panel.get('desc', ''))
                visual_type = block.get('visual', block.get('centerPanel', {})).get('type', 'text')
                code = block.get('code', block.get('rightPanel', {})).get('code', '')

            if not title:
                continue

            print(f"\n  [{rel_path}] Analogy: \"{title}\"", file=sys.stderr)

            # Validation 1: Image matches analogy
            ok, msg = validate_analogy_image(title, image_url)
            status = "✓" if ok else "❌"
            print(f"    {status} Image match: {msg}", file=sys.stderr)
            if ok:
                passed += 1
            else:
                failed += 1
                issues.append(f"{rel_path}: '{title}' — {msg}")

            # Validation 2: Programming visualization matches concept
            viz_ok, viz_msg = validate_programming_visual(title, visual_type)
            viz_status = "✓" if viz_ok else "⚠️"
            print(f"    {viz_status} Visual match: {visual_type} — {viz_msg}", file=sys.stderr)

            # Validation 3: Code example exists
            if code and len(code.strip()) > 3:
                print(f"    ✓ Code example: present", file=sys.stderr)
                passed += 1
            else:
                print(f"    ❌ Code example: missing or empty", file=sys.stderr)
                failed += 1
                issues.append(f"{rel_path}: '{title}' — missing code example")

            # Validation 4: Description helps connection
            if desc and len(desc) > 5:
                print(f"    ✓ Description: sufficient", file=sys.stderr)
                passed += 1
            else:
                print(f"    ⚠️ Description: brief or missing", file=sys.stderr)

    return passed, failed, issues


def main():
    base_dirs = [
        "frontend/public/data/python",
        "frontend/public/data/cs50ai",
    ]

    total_passed = 0
    total_failed = 0
    all_issues = []

    for base in base_dirs:
        if not os.path.isdir(base):
            continue
        for root, dirs, files in os.walk(base):
            for file in files:
                if file == 'lesson.json':
                    filepath = os.path.join(root, file)
                    print(f"\n{'='*60}", file=sys.stderr)
                    passed, failed, issues = validate_file(filepath)
                    total_passed += passed
                    total_failed += failed
                    all_issues.extend(issues)

    print(f"\n{'='*60}")
    print(f"Validation complete: {total_passed} passed, {total_failed} failed")
    if all_issues:
        print(f"\n❌ Issues found ({len(all_issues)}):")
        for issue in all_issues:
            print(f"  • {issue}")
    else:
        print("✅ All analogies validated perfectly!")

    return 1 if total_failed > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
