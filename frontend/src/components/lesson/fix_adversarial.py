import re

file_path = r'c:\Users\priya\OneDrive\Desktop\fraylon 05\june 16\LMS-main\frontend\src\components\lesson\AILearnSection.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"(\{\s*isAdversarial && block\.adversarialContent && \(\s*<>\s*<AdversarialBreakdown content=\{block\.adversarialContent\} />\s*<MinimaxExplorer />\s*</>\s*\})"

def replacer(match):
    return """{isAdversarial && block.adversarialContent && (
          <AdversarialBreakdown content={block.adversarialContent} />
        )}
        {isAdversarial && (
          <MinimaxExplorer />
        )}"""

new_content = re.sub(pattern, replacer, content)

if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed!")
else:
    print("Not found. Trying fallback.")
    # Fallback if the original was different:
    fb_pattern = r"\{isAdversarial && block\.adversarialContent && \(\s*<AdversarialBreakdown content=\{block\.adversarialContent\} />\s*\)\}"
    fb_new_content = re.sub(fb_pattern, """{isAdversarial && block.adversarialContent && (
          <AdversarialBreakdown content={block.adversarialContent} />
        )}
        {isAdversarial && (
          <MinimaxExplorer />
        )}""", content)
    if fb_new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fb_new_content)
        print("Fixed with fallback!")
    else:
        print("Still not found.")
