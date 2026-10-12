import json, os

base = r'C:\Users\priya\OneDrive\Desktop\fraylon 05\june 16\LMS-main\frontend\public\data\cs50ai'
with open('audit_lectures.txt', 'w', encoding='utf-8') as out:
    for i in range(1, 10):
        path = os.path.join(base, f'lecture_{i}', 'problems.json')
        if os.path.exists(path):
            out.write(f'\n--- LECTURE {i+1} ---\n')
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for p in data:
                    out.write(f"ID: {p.get('id')} | Title: {p.get('title')} | Type: {p.get('type')}\n")
                    desc = p.get('description', '')
                    out.write(f"Desc: {desc[:200].replace(chr(10), ' ')}...\n")
