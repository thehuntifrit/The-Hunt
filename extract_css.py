import re
import os

def extract_selectors():
    classes = set()
    ids = set()

    # HTML extraction
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
            # Simple attribute extraction
            ids.update(re.findall(r'id=["\']([^"\']+)["\']', content))
            class_matches = re.findall(r'class=["\']([^"\']+)["\']', content)
            for m in class_matches:
                classes.update(m.split())

    # JS extraction
    js_dir = 'js'
    if os.path.exists(js_dir):
        for root, dirs, files in os.walk(js_dir):
            if 'lib' in dirs: dirs.remove('lib')
            if '_old' in dirs: dirs.remove('_old')
            for file in files:
                if file.endswith('.js'):
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        # classList
                        classes.update(re.findall(r'classList\.(?:add|remove|toggle|contains)\(["\']([^"\']+)["\']\)', content))
                        # className
                        cn_matches = re.findall(r'className\s*=\s*["\']([^"\']+)["\']', content)
                        for m in cn_matches:
                            classes.update(m.split())
                        # Template strings class="xxx"
                        classes.update(re.findall(r'class=\\"([^\\"]+)\\"', content))
                        # getElementById
                        ids.update(re.findall(r'getElementById\(["\']([^"\']+)["\']\)', content))
                        # querySelector
                        ids.update(re.findall(r'querySelector\(["\']#([^"\'\[\s\.:]+)["\']\)', content))
                        classes.update(re.findall(r'querySelector\(["\']\.([^"\'\[\s\.:]+)["\']\)', content))

    return sorted(list(ids)), sorted(list(classes))

ids, classes = extract_selectors()

# Defined properties from previous turn
props = [
    "left", "top", "width", "height", "transform", "transition", 
    "background", "gap", "flex", "min-width", "text-align", 
    "color", "margin-left"
]

with open('css/style2.css', 'w', encoding='utf-8') as f:
    f.write("/* Used CSS Properties from logic: \n")
    for p in props:
        f.write(f"   - {p}\n")
    f.write("*/\n\n")

    f.write("/* IDs */\n")
    for i in ids:
        f.write(f"#{i} {{ }}\n")
    
    f.write("\n/* Classes */\n")
    for c in classes:
        f.write(f".{c} {{ }}\n")

print(f"Extracted {len(ids)} IDs and {len(classes)} classes.")
