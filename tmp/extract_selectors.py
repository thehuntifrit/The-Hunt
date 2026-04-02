import re
import os
import sys

css_files = [
    r'c:\Users\teamm\The-Hunt\css\style.css',
    r'c:\Users\teamm\The-Hunt\css\mobile.css',
    r'c:\Users\teamm\The-Hunt\css\pc.css',
    r'c:\Users\teamm\The-Hunt\css\sidebar.css'
]

selectors = set()

for css_path in css_files:
    if not os.path.exists(css_path):
        print(f"File not found: {css_path}")
        continue
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Simple regex to find classes and ids
        # This is not perfect but should catch most
        classes = re.findall(r'\.([a-zA-Z0-9_-]+)', content)
        ids = re.findall(r'#([a-zA-Z0-9_-]+)', content)
        selectors.update(classes)
        selectors.update(ids)

# Print unique selectors
for s in sorted(list(selectors)):
    print(s)
