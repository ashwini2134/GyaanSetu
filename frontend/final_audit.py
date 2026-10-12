import json
import os

base = r'C:\Users\priya\OneDrive\Desktop\fraylon 05\june 16\LMS-main\frontend\public\data\cs50ai'

exceptions = {
    'news_story_ai',
    'medical_decisions_debate',
    'ai_education_sim1',
    'autonomous_vehicles_sim2',
    'ethical_consideration',
    'bias_mitigation_sim2'
}

all_perfect = True
issues = []
all_ids = set()
all_titles = set()

for i in range(10):
    path = os.path.join(base, f'lecture_{i}', 'problems.json')
    if not os.path.exists(path):
        issues.append(f"Lecture {i+1} missing problems.json")
        all_perfect = False
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            issues.append(f"Lecture {i+1} problems.json is not valid JSON")
            all_perfect = False
            continue
            
    if len(data) != 4:
        issues.append(f"Lecture {i+1} has {len(data)} problems instead of 4")
        all_perfect = False
        
    for p in data:
        pid = p.get('id', 'MISSING_ID')
        title = p.get('title', 'MISSING_TITLE')
        
        if pid in all_ids:
            issues.append(f"Duplicate ID found: {pid}")
            all_perfect = False
        else:
            all_ids.add(pid)
            
        if title in all_titles:
            issues.append(f"Duplicate Title found: {title}")
            all_perfect = False
        else:
            all_titles.add(title)
            
        # Check required fields
        for field in ['id', 'title', 'description', 'type', 'hints']:
            if field not in p:
                issues.append(f"Lecture {i+1} Problem {pid} is missing '{field}'")
                all_perfect = False
                
        # Check exceptions vs coding
        ptype = p.get('type')
        if pid in exceptions:
            if ptype != 'reflection':
                issues.append(f"Lecture {i+1} Problem {pid} should be 'reflection' but is '{ptype}'")
                all_perfect = False
        else:
            if ptype != 'coding':
                issues.append(f"Lecture {i+1} Problem {pid} should be 'coding' but is '{ptype}'")
                all_perfect = False
            
            # If coding, must have test cases
            tc = p.get('testCases', [])
            if len(tc) < 1:
                issues.append(f"Lecture {i+1} Problem {pid} is coding but has no test cases")
                all_perfect = False

if all_perfect:
    print("EVERYTHING IS PERFECT")
else:
    print("ISSUES FOUND:")
    for issue in issues:
        print("-", issue)
