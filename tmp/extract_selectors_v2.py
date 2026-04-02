import re
import os

css_files = [
    r'c:\Users\teamm\The-Hunt\css\style.css',
    r'c:\Users\teamm\The-Hunt\css\mobile.css',
    r'c:\Users\teamm\The-Hunt\css\pc.css',
    r'c:\Users\teamm\The-Hunt\css\sidebar.css'
]

selectors = set()

# Regex to find .class or #id, but follow it until a space, comma, dot, hash, bracket or brace.
# Exclude things like hex colors in values or numbers.
def extract_from_content(content):
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Simple regex for selectors: starts with . or #, followed by alphanumeric/hyphen
    # Must be at the start of a line or after a comma/space/brace/bracket
    # This is still a bit fuzzy but better.
    matches = re.finditer(r'(?<=[\s,{}])([.#])([a-zA-Z0-9_-]+)', ' ' + content)
    for m in matches:
        selectors.add(m.group(1) + m.group(2))

for css_path in css_files:
    if os.path.exists(css_path):
        with open(css_path, 'r', encoding='utf-8') as f:
            extract_from_content(f.read())

# Filter out common false positives
# 1. Colors (#ffffff, #000)
# 2. Numbers (.5em, #1)
filtered = []
for s in selectors:
    # If it's a hex color (#abc, #abcdef)
    if s.startswith('#') and re.match(r'^#[0-9a-fA-F]{3,6}$', s):
        continue
    # If it starts with a number (#123, .5em)
    if re.match(r'^[.#][0-9]', s):
        continue
    filtered.append(s)

for s in sorted(filtered):
    print(s)
