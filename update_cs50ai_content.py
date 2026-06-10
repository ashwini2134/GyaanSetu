import os
import json
import re

DATA_DIR = 'frontend/public/data/cs50ai'

def clean_asterisks(text):
    if not isinstance(text, str):
        return text
    text = text.replace('**', '')
    text = text.replace('*', '')
    return text

def clean_all_strings(obj):
    if isinstance(obj, str):
        return clean_asterisks(obj)
    elif isinstance(obj, list):
        return [clean_all_strings(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: clean_all_strings(v) for k, v in obj.items()}
    return obj

def process_visual_container(cp):
    # Change visualType "text" to "flow_diagram"
    if cp.get('visualType') == 'text' and cp.get('textContent'):
        text = cp['textContent']
        # Convert bullets or lines to flow steps
        lines = [line.strip().replace('• ', '').replace('- ', '') for line in text.split('\n') if line.strip()]
        steps = []
        for i, line in enumerate(lines):
            steps.append(line)
            if i < len(lines) - 1:
                steps.append('↓')
        cp['visualType'] = 'flow_diagram'
        cp['flowSteps'] = steps
    return cp

def rewrite_reflection(block):
    # Make questions and answers simpler and more conversational
    q = block.get('question', '')
    a = block.get('answer', '')
    
    # Very basic rewrite logic (or just leave it if it's already short)
    # We will just prepend a friendly tone and strip hard jargon
    if "Is a basic calculator an AI system" in q:
        block['question'] = "Is your basic desk calculator a form of AI? Why or why not?"
        block['answer'] = "Nope! A calculator just follows hardcoded math rules. AI is special because it can learn, adapt, or make decisions on its own."
    elif "Is an Excel spreadsheet an AI" in q:
        block['question'] = "Is a standard Excel spreadsheet considered AI?"
        block['answer'] = "Not really! Spreadsheets just calculate formulas you give them. AI actually learns from data."
    
    return block

def process_block(block):
    # 1. Emoji -> Icon
    if 'emoji' in block:
        # Simple mapping
        val = block.pop('emoji')
        if val == '🤖': block['icon'] = 'Bot'
        elif val == '🐕': block['icon'] = 'Dog'
        elif val == '🧠': block['icon'] = 'Brain'
        elif val == '👁️': block['icon'] = 'Eye'
        elif val == '🗣️': block['icon'] = 'MessageSquare'
        else: block['icon'] = 'Zap'
        
    if block.get('type') == 'concept_visualization':
        if 'leftPanel' in block and 'emoji' in block['leftPanel']:
            val = block['leftPanel'].pop('emoji')
            block['leftPanel']['icon'] = 'Zap' if not val else 'Star'
        block['centerPanel'] = process_visual_container(block.get('centerPanel', {}))
        
    if block.get('type') == 'reflection':
        block = rewrite_reflection(block)
        
    return block

def process_lesson(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # Clean asterisks from everything first
    data = clean_all_strings(data)
    
    for section in data.get('sections', []):
        new_blocks = []
        for block in section.get('blocks', []):
            block = process_block(block)
            new_blocks.append(block)
            
            # Inject Try It after theory (after reflection or concept_visualization if no reflection)
            if block.get('type') == 'reflection':
                new_blocks.append({
                    "type": "practice",
                    "title": "Try It: Hands-on Practice",
                    "description": "Let's put what we just learned into practice! Play around with the concepts below."
                })
                
        # If there wasn't a reflection block, maybe insert practice at the end of the section?
        # Let's ensure every section gets at least one practice block if it has an explanation
        has_practice = any(b.get('type') == 'practice' for b in new_blocks)
        if not has_practice:
            new_blocks.append({
                "type": "practice",
                "title": "Try It: Hands-on Practice",
                "description": "Let's put what we just learned into practice! Play around with the concepts below."
            })
            
        section['blocks'] = new_blocks
        
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def main():
    for root, dirs, files in os.walk(DATA_DIR):
        for file in files:
            if file == 'lesson.json':
                filepath = os.path.join(root, file)
                print(f"Processing {filepath}...")
                process_lesson(filepath)

if __name__ == '__main__':
    main()
