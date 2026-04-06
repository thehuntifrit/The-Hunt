import re
import os

def tidy_css(css_content):
    # 1. First pass: Handle blocks and remove literal empty ones
    def get_blocks(text):
        blocks = []
        i = 0
        while i < len(text):
            if text[i] == '{':
                depth = 1
                j = i + 1
                while j < len(text) and depth > 0:
                    if text[j] == '{': depth += 1
                    elif text[j] == '}': depth -= 1
                    j += 1
                
                # Extract selector(s) before {
                # Look back for start of selector or end of previous block
                start_search = text.rfind('}', 0, i)
                if start_search == -1: start_search = 0
                else: start_search += 1
                
                selector = text[start_search:i].strip()
                body = text[i+1:j-1].strip()
                
                # Recursively tidy inner if media query
                if selector.startswith('@media'):
                    body = tidy_css(body)
                
                blocks.append({'selector': selector, 'body': body, 'full': text[start_search:j]})
                i = j
            else:
                i += 1
        return blocks

    # Simplification: Let's use a line-based + depth-tracking approach for preserving structure
    lines = css_content.split('\n')
    tidied_lines = []
    i = 0
    current_block_selector = ""
    current_block_body = []
    depth = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        if '{' in line:
            if depth == 0:
                current_block_selector = line.split('{')[0].strip()
                # If selector was multi-line, we might need a better parser. 
                # But for standard CSS, this is usually okay.
            
            depth += line.count('{')
            depth -= line.count('}')
            
            if depth > 0:
                # Still inside OR starting
                # For simplicity, we just keep lines of bodies that aren't empty
                pass
        
        # This is getting complex for a one-shot script. 
        # Let's use a more robust regex-based approach for dead shells.
        i += 1

    # REVISED STRATEGY: 
    # 1. Remove all empty rule blocks: selector { } 
    # 2. Remove all empty @rules: @media ... { } or @keyframes ... { }
    # 3. Repeat until no more empty blocks found (handles nested empty media queries)
    
    processed = css_content
    previous = ""
    while processed != previous:
        previous = processed
        # Remove empty blocks { \s* }
        processed = re.sub(r'[^{}]+\s*\{\s*\}', '', processed)
        # Remove empty media or keyframes
        processed = re.sub(r'@[^{}]+\s*\{\s*\}', '', processed)
    
    # 4. Normalize whitespace
    # Replace 3+ newlines with 2
    processed = re.sub(r'\n\s*\n\s*\n+', '\n\n', processed)
    # Remove trailing spaces
    processed = '\n'.join([line.rstrip() for line in processed.split('\n')])
    
    # 5. Fix indentation (very basic)
    lines = processed.split('\n')
    indented = []
    level = 0
    for line in lines:
        stripped = line.strip()
        if not stripped:
            indented.append('')
            continue
            
        # Decrease level if line starts with closing brace
        if stripped.startswith('}'): level = max(0, level - 1)
        
        indented.append('    ' * level + stripped)
        
        # Increase level if line ends with opening brace OR contains it
        if '{' in stripped:
            level += stripped.count('{')
        if '}' in stripped:
            if not stripped.startswith('}'): # Case: prop: val; }
                 level -= stripped.count('}')
            elif stripped.count('}') > 1:
                 level -= (stripped.count('}') - 1)

    return '\n'.join(indented)

# Execute
if os.path.exists('css/style.css'):
    with open('css/style.css', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Categorization logic - we'll group by reading and sorting if possible
    # For now, let's just do the cleanup and basic sorting of rules
    
    result = tidy_css(content)
    
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(result)
    
    print("Tidying complete.")
else:
    print("style.css not found.")
