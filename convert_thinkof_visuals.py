"""
Convert all think_of blocks in lesson JSON files from the old 10-type
visualization system to the new 4-type system (flow, decision, repetition, categories).

Old → New mapping:
  sequence        → flow         (items kept as-is)
  function_machine → flow         (inputLabel/processLabel/outputLabel → items)
  loop_cycle      → repetition   (loopSteps → items)
  hub_spoke       → categories   (centerLabel + branches → centerLabel + items)
  decision_branch → decision     (condition/trueLabel/falseLabel kept)
  key_value       → categories   (pairs → centerLabel + items as keys)
  string_beads    → flow         (concept-specific flow items)
  storage_box     → categories   (varName → centerLabel, varValue as item)
"""

import json, os, re

DATA_DIR = "frontend/public/data"

def convert_thinkof_block(blk: dict) -> dict | None:
    vis = blk.get("visualization", {})
    old_type = vis.get("type", "")

    conversions = {
        "sequence": convert_sequence,
        "function_machine": convert_function_machine,
        "loop_cycle": convert_loop_cycle,
        "hub_spoke": convert_hub_spoke,
        "decision_branch": convert_decision_branch,
        "key_value": convert_key_value,
        "string_beads": convert_string_beads,
        "storage_box": convert_storage_box,
    }

    converter = conversions.get(old_type)
    if converter is None:
        return None  # already new type or unknown

    new_vis = converter(vis)
    blk["visualization"] = new_vis
    return blk


def convert_sequence(vis: dict) -> dict:
    return {
        "type": "flow",
        "title": vis.get("title", ""),
        "items": vis.get("items", ["Step 1", "Step 2", "Step 3"]),
    }


def convert_function_machine(vis: dict) -> dict:
    input_label = vis.get("inputLabel", "Input")
    process_label = vis.get("processLabel", "Process")
    output_label = vis.get("outputLabel", "Output")
    items = [input_label, process_label, output_label]
    return {
        "type": "flow",
        "title": vis.get("title", ""),
        "items": items,
    }


def convert_loop_cycle(vis: dict) -> dict:
    steps = vis.get("loopSteps", ["Start", "Check", "Increment"])
    return {
        "type": "repetition",
        "title": vis.get("title", ""),
        "items": steps,
    }


def convert_hub_spoke(vis: dict) -> dict:
    branches = vis.get("branches", ["Web", "Data", "AI", "Auto"])
    return {
        "type": "categories",
        "title": vis.get("title", ""),
        "centerLabel": vis.get("centerLabel", "Python"),
        "items": branches,
    }


def convert_decision_branch(vis: dict) -> dict:
    return {
        "type": "decision",
        "title": vis.get("title", ""),
        "condition": vis.get("condition", "Condition"),
        "trueLabel": vis.get("trueLabel", "True"),
        "falseLabel": vis.get("falseLabel", "False"),
    }


def convert_key_value(vis: dict) -> dict:
    pairs = vis.get("pairs", [])
    keys = [p["key"] for p in pairs] if pairs else ["key1", "key2"]
    return {
        "type": "categories",
        "title": vis.get("title", ""),
        "centerLabel": vis.get("title", "Key → Value"),
        "items": keys,
    }


def convert_string_beads(vis: dict) -> dict:
    # Map by analogy context — uses title to determine flow items
    title = (vis.get("title") or "").lower()
    if "index" in title or "access" in title:
        items = ["Index", "Access", "Extract"]
    elif "method" in title:
        items = ["Original", "Method", "Result"]
    else:
        items = ["Access", "Process", "Result"]
    return {
        "type": "flow",
        "title": vis.get("title", ""),
        "items": items,
    }


def convert_storage_box(vis: dict) -> dict:
    var_name = vis.get("varName", "variable")
    return {
        "type": "categories",
        "title": vis.get("title", ""),
        "centerLabel": var_name,
        "items": ["Store value", "Access by name"],
    }


def process_file(filepath: str) -> bool:
    with open(filepath) as f:
        data = json.load(f)

    modified = False
    for section in data.get("sections", []):
        for i, block in enumerate(section.get("blocks", [])):
            if block.get("type") == "think_of":
                result = convert_thinkof_block(block)
                if result is not None:
                    section["blocks"][i] = result
                    modified = True

    if modified:
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
            f.write("\n")
        return True
    return False


def main():
    count = 0
    for root, dirs, files in os.walk(DATA_DIR):
        for fname in files:
            if fname == "lesson.json":
                path = os.path.join(root, fname)
                if process_file(path):
                    count += 1
                    print(f"  Updated: {path}")

    print(f"\nDone. {count} files modified.")


if __name__ == "__main__":
    main()
