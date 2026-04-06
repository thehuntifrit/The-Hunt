import re
import os

# 1. Load safe lists from the previous extraction
# IDs, Classes we extracted earlier.
SAFE_IDS = set()
SAFE_CLASSES = set()

# Re-extracting for certainty in this script's context
def load_safe_lists():
    global SAFE_IDS, SAFE_CLASSES
    # Use global tags as always safe
    ALWAYS_SAFE_TAGS = {
        'html', 'body', '*', '::before', '::after', 'input', 'textarea', 'button', 'a', 
        'ul', 'ol', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 
        'footer', 'header', 'nav', 'main', 'section', 'article', 'canvas', 'svg', 'path',
        'details', 'summary', 'label', 'hr'
    }
    SAFE_CLASSES.update(ALWAYS_SAFE_TAGS)
    
    # Re-extract logic (same as extract_css.py)
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
            SAFE_IDS.update(re.findall(r'id=["\']([^"\']+)["\']', content))
            for m in re.findall(r'class=["\']([^"\']+)["\']', content):
                SAFE_CLASSES.update(m.split())
    
    js_dir = 'js'
    if os.path.exists(js_dir):
        for root, _, files in os.walk(js_dir):
            for file in files:
                if file.endswith('.js') and 'lib' not in root and '_old' not in root:
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        SAFE_CLASSES.update(re.findall(r'classList\.(?:add|remove|toggle|contains)\(["\']([^"\']+)["\']\)', content))
                        cn_matches = re.findall(r'className\s*=\s*["\']([^"\']+)["\']', content)
                        for m in cn_matches: SAFE_CLASSES.update(m.split())
                        SAFE_CLASSES.update(re.findall(r'class=\\"([^\\"]+)\\"', content))
                        SAFE_IDS.update(re.findall(r'getElementById\(["\']([^"\']+)["\']\)', content))
                        SAFE_IDS.update(re.findall(r'querySelector\(["\']#([^"\'\[\s\.:]+)["\']\)', content))
                        SAFE_CLASSES.update(re.findall(r'querySelector\(["\']\.([^"\'\[\s\.:]+)["\']\)', content))

def is_selector_used(selector):
    selector = selector.strip()
    if not selector: return False
    # Check for variables or special blocks
    if selector.startswith(':root') or selector.startswith('@'): return True
    
    # Check for pseudo-elements or specific attributes
    # [data-rank="S"] or similar
    if '[' in selector or 'data-' in selector: return True

    # Tokenize the selector to check parts
    # Splits by space, >, +, ~, and other punctuations but keeping IDs and Classes together
    tokens = re.split(r'[\s\>\+\~\.\#\:]+', selector)
    for token in tokens:
        if not token: continue
        # Root tags like body, html are already in SAFE_CLASSES or handled
        if token in SAFE_IDS or token in SAFE_CLASSES:
            return True
    
    # Check if single class is inside (e.g. .pc-detail-card:hover contains pc-detail-card)
    classes_in_selector = re.findall(r'\.([a-zA-Z0-9_-]+)', selector)
    for c in classes_in_selector:
        if c in SAFE_CLASSES: return True
        
    ids_in_selector = re.findall(r'#([a-zA-Z0-9_-]+)', selector)
    for i in ids_in_selector:
        if i in SAFE_IDS: return True

    return False

def parse_and_purge(css_content):
    # Simplistic block parser
    # Handles nested braces by tracking depth
    lines = css_content.split('\n')
    output = []
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Keep empty lines and comments (optional, but safer)
        if not line or line.startswith('/*'):
            output.append(lines[i])
            i += 1
            continue
            
        # Check rule blocks
        if '{' in line:
            # Detect full selector part (might span multiple lines)
            selector_start = i
            while '{' not in lines[i]: i += 1 # Should already be at { but just in case
            
            # Reconstruct selector if it was multi-line
            full_selector = ""
            for s_line in range(selector_start, i + 1):
                full_selector += lines[s_line]
            
            # Simple check for @rules
            if full_selector.strip().startswith('@media'):
                # Media query block - keep and process inner contents
                output.append(lines[i])
                i += 1
                continue # The processor will continue depth-based matching below
            
            if full_selector.strip().startswith('@keyframes'):
                 # Keep animations for now
                 output.append(lines[i])
                 i += 1
                 continue

            # Evaluate standard selectors
            clean_selectors = full_selector.split('{')[0].strip()
            # Split by comma to check any part
            individual_selectors = clean_selectors.split(',')
            used = any(is_selector_used(s) for s in individual_selectors)
            
            if used:
                # Keep the block
                depth = 1
                output.append(lines[i])
                i += 1
                while i < len(lines) and depth > 0:
                    if '{' in lines[i]: depth += 1
                    if '}' in lines[i]: depth -= 1
                    output.append(lines[i])
                    i += 1
            else:
                # Omit the block
                depth = 1
                i += 1
                while i < len(lines) and depth > 0:
                    if '{' in lines[i]: depth += 1
                    if '}' in lines[i]: depth -= 1
                    i += 1
        else:
            output.append(lines[i])
            i += 1
            
    return '\n'.join(output)

# Since pure regex/line-based parsing is hard for nested CSS, 
# especially with media queries, we'll use a more surgical approach.
# However, given the environment, we'll perform a multi-pass purge.

load_safe_lists()
if os.path.exists('css/style.css'):
    with open('css/style.css', 'r', encoding='utf-8') as f:
        content = f.read()
    
    purged = parse_and_purge(content)
    
    # Save the result
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(purged)
    
    print("Purge complete.")
else:
    print("style.css not found.")
