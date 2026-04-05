import os
import re

js_dir = r"c:\Users\teamm\test\js"
original_files = ["app.js", "cal.js", "dataManager.js", "filterUI.js", "location.js", "magnifier.js", "mobCard.js", "mobSorter.js", "modal.js", "notificationManager.js", "readme.js", "server.js", "sidebar.js", "tooltip.js", "uiRender.js", "worker.js"]
new_files = ["2app.js", "2cal.js", "2dataManager.js", "2mobCard.js", "2mobSorter.js", "2modal.js", "2readme.js", "2server.js", "2sidebar.js", "2worker.js"]

def extract_toplevel_blocks(code):
    blocks = {}
    i = 0
    n = len(code)
    
    func_re = re.compile(r'^(?:export\s+)?(?:async\s+)?function\s+([\w\$]+)\s*\(')
    var_re = re.compile(r'^(?:export\s+)?(?:const|let|var)\s+([\w\$]+)\s*=')
    
    while i < n:
        if code[i].isspace(): i += 1; continue
        if code[i:i+2] == '//': i = code.find('\n', i); i = n if i == -1 else i; continue
        if code[i:i+2] == '/*': i = code.find('*/', i); i = n if i == -1 else i + 2; continue
            
        chunk = code[i:i+100]
        match_func = func_re.search(chunk)
        match_var = var_re.search(chunk)
        
        name = None
        start_idx = i
        
        if match_func and match_func.start() == 0:
            name = match_func.group(1)
            i += match_func.end() - 1
        elif match_var and match_var.start() == 0:
            name = match_var.group(1)
            i += match_var.end() - 1
        else:
            i += 1
            continue
            
        nest_brace, nest_paren, nest_bracket = 0, 0, 0
        in_string = False
        string_char = ''
        in_sl_comment, in_ml_comment = False, False
        has_started_block = False
        
        while i < n:
            c = code[i]
            if in_sl_comment:
                if c == '\n': in_sl_comment = False
                i += 1; continue
            if in_ml_comment:
                if c == '*' and i+1 < n and code[i+1] == '/': in_ml_comment = False; i += 2
                else: i += 1
                continue
            if in_string:
                if c == '\\': i += 2; continue
                if c == string_char: in_string = False
                i += 1; continue
            if c == '/' and i+1 < n:
                if code[i+1] == '/': in_sl_comment = True; i += 2; continue
                if code[i+1] == '*': in_ml_comment = True; i += 2; continue
            if c in ("'", '"', '`'): in_string = True; string_char = c; i += 1; continue
                
            if c == '{': nest_brace += 1; has_started_block = True
            elif c == '}': nest_brace -= 1
            elif c == '(': nest_paren += 1
            elif c == ')': nest_paren -= 1
            elif c == '[': nest_bracket += 1
            elif c == ']': nest_bracket -= 1
            elif c == ';' and nest_brace == 0 and nest_paren == 0 and nest_bracket == 0:
                i += 1; break
                
            if has_started_block and nest_brace == 0:
                i += 1; break
                
            i += 1
            
        blocks[name] = code[start_idx:i]
        
    return blocks

# 1. Gather all original blocks
all_original_blocks = {}
for f_name in original_files:
    f_path = os.path.join(js_dir, f_name)
    if os.path.exists(f_path):
        with open(f_path, 'r', encoding='utf-8') as f:
            for name, text in extract_toplevel_blocks(f.read()).items():
                all_original_blocks[name] = text

# 2. Track missing items to append later
missing_location = [
    'lastClickTime', 'lastClickLocationId', 'locationEventsAttached', 
    'CULLED_CLASS_MAP', 'UNCULLED_CLASS_MAP', 'applyOptimisticDOM', 
    'applyOptimisticState', 'handleCrushToggle', 'isCulled', 'attachLocationEvents'
]
missing_sidebar = ['PANELS', 'manualLoaded']
missing_readme = ['modal', 'container', 'response', 'text', 'html']

# 3. Apply fixes to 2... files
for f_name in new_files:
    f_path = os.path.join(js_dir, f_name)
    if not os.path.exists(f_path): continue
    
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    blocks = extract_toplevel_blocks(content)
    changed = False
    
    # Mismatch replace
    for name, old_text in blocks.items():
        if name in all_original_blocks:
            orig_text = all_original_blocks[name]
            if old_text.strip() != orig_text.strip():
                # Direct string replace in file content
                if old_text in content:
                    content = content.replace(old_text, orig_text)
                    changed = True
                    print(f"Replaced MISMATCH: {name} in {f_name}")
                else:
                    print(f"WARN: Could not direct replace {name} in {f_name} (chunk not identical to parser extraction)")
                    
    # Missing append
    appends = []
    if f_name == "2app.js":
        for m in missing_location:
            if m in all_original_blocks:
                appends.append(all_original_blocks[m])
                print(f"Adding MISSING: {m} to {f_name}")
    elif f_name == "2sidebar.js":
        for m in missing_sidebar:
            if m in all_original_blocks:
                appends.append(all_original_blocks[m])
                print(f"Adding MISSING: {m} to {f_name}")
    elif f_name == "2readme.js":
        for m in missing_readme:
            if m in all_original_blocks:
                appends.append(all_original_blocks[m])
                print(f"Adding MISSING: {m} to {f_name}")

    if appends:
        content += "\n\n// --- APPENDED MISSING FUNCTIONS ---\n\n"
        content += "\n\n".join(appends)
        content += "\n"
        changed = True
        
    if changed:
        with open(f_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
print("Fixes applied successfully.")
