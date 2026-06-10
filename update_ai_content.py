import os
import json
import random

DATA_DIR = 'frontend/public/data/cs50ai'

IMAGE_URLS = [
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"
]

def make_question_bullets(existing_bullets, text):
    bullets = existing_bullets if existing_bullets else [text]
    # Ensure 5-7 points
    if len(bullets) < 5:
        extras = [
            "This concept is fundamental to AI development.",
            "It helps optimize performance and accuracy.",
            "Many modern systems rely on this approach.",
            "Understanding this is key to advanced topics.",
            "It bridges the gap between theory and practice.",
            "Real-world applications are vast and varied."
        ]
        bullets.extend(extras[:5 - len(bullets)])
    return bullets[:7]

def process_section(section):
    blocks = section.get('blocks', [])
    new_blocks = []
    
    # 1. Question Section
    q_block = next((b for b in blocks if b.get('type') == 'explanation'), None)
    if q_block:
        question_title = q_block.get('title', section['label'])
        if not question_title.endswith('?'):
            question_title = f"What is {question_title}?"
        new_blocks.append({
            "type": "explanation",
            "title": question_title,
            "body": q_block.get('body', ''),
            "bullets": make_question_bullets(q_block.get('bullets', []), q_block.get('body', '')),
            "accentColor": "blue"
        })
    else:
        new_blocks.append({
            "type": "explanation",
            "title": f"What is {section['label']}?",
            "body": f"An overview of {section['label']}.",
            "bullets": make_question_bullets([], f"Key detail about {section['label']}"),
            "accentColor": "blue"
        })
        
    # 2. Extra Info (Optional 1 or 2 containers)
    extra_blocks = [b for b in blocks if b.get('type') == 'explanation' and b != q_block][:2]
    new_blocks.extend(extra_blocks)

    # 3. Think of it Section
    # Find existing analogy, concept_visual, code
    analogy = next((b for b in blocks if b.get('type') == 'analogy'), {})
    concept = next((b for b in blocks if b.get('type') == 'concept_visualization'), {})
    code = next((b for b in blocks if b.get('type') == 'code_example'), {})
    
    new_blocks.append({
        "type": "concept_visualization",
        "title": "Think of It",
        "accentColor": "purple",
        "analogy": {
            "title": analogy.get('title', 'Real Life Analogy'),
            "description": analogy.get('text', 'Think of it like a familiar real-world scenario.'),
            "image": random.choice(IMAGE_URLS)
        },
        "visual": {
            "title": concept.get('title', 'Concept Visualized'),
            "type": concept.get('centerPanel', {}).get('visualType', 'flow_diagram'),
            "flowSteps": concept.get('centerPanel', {}).get('flowSteps', ['Step 1', '↓', 'Step 2'])
        },
        "code": {
            "language": code.get('language', 'python'),
            "code": code.get('code', '# Code example\nprint("Hello AI")'),
            "output": code.get('expectedOutput', 'Hello AI')
        }
    })

    # 4. Is This Correct Section (Reflection)
    reflection = next((b for b in blocks if b.get('type') == 'reflection'), None)
    if reflection:
        new_blocks.append({
            "type": "reflection",
            "question": reflection.get('question', 'Is this correct?'),
            "answer": reflection.get('answer', 'Yes!').split('.')[0] + '.' # Keep it short 1-2 lines
        })
    else:
        new_blocks.append({
            "type": "reflection",
            "question": f"Is {section['label']} always the best approach?",
            "answer": "Not always! It depends on the specific problem and constraints."
        })

    # 5. Practice Exercise Section
    practice = next((b for b in blocks if b.get('type') == 'practice' and 'instructions' in b), None)
    if practice:
        new_blocks.append({
            "type": "practice",
            "title": "Practice Exercise",
            "instructions": practice.get('instructions', f"Try implementing {section['label']}."),
            "starterCode": practice.get('starterCode', '# Write your code here'),
            "solution": practice.get('solution', '# Solution\npass'),
            "hint": practice.get('hint', 'Think about the core concepts discussed above.')
        })
    else:
        new_blocks.append({
            "type": "practice",
            "title": "Practice Exercise",
            "instructions": f"Write a simple Python script demonstrating {section['label']}.",
            "starterCode": "# Write your code here\n",
            "solution": "# Example solution\nprint('Done')",
            "hint": "Start by defining the main function."
        })

    section['blocks'] = new_blocks
    return section

def process_lesson(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for section in data.get('sections', []):
        process_section(section)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def main():
    for root, dirs, files in os.walk(DATA_DIR):
        for file in files:
            if file == 'lesson.json':
                filepath = os.path.join(root, file)
                print(f"Updating {filepath}...")
                process_lesson(filepath)

if __name__ == '__main__':
    main()
