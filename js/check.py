import os
import re
import json

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
        if code[i].isspace():
            i += 1
            continue
        if code[i:i+2] == '//':
            i = code.find('\n', i)
            if i == -1: break
            continue
        if code[i:i+2] == '/*':
            i = code.find('*/', i)
            if i == -1: break
            i += 2
            continue
            
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
            
        nest_brace = 0
        nest_paren = 0
        nest_bracket = 0
        in_string = False
        string_char = ''
        in_sl_comment = False
        in_ml_comment = False
        has_started_block = False
        
        while i < n:
            c = code[i]
            
            if in_sl_comment:
                if c == '\n': in_sl_comment = False
                i += 1
                continue
                
            if in_ml_comment:
                if c == '*' and i+1 < n and code[i+1] == '/':
                    in_ml_comment = False
                    i += 2
                else:
                    i += 1
                continue
                
            if in_string:
                if c == '\\':
                    i += 2
                    continue
                if c == string_char:
                    in_string = False
                i += 1
                continue
                
            if c == '/' and i+1 < n:
                if code[i+1] == '/':
                    in_sl_comment = True
                    i += 2
                    continue
                if code[i+1] == '*':
                    in_ml_comment = True
                    i += 2
                    continue
                    
            if c in ("'", '"', '`'):
                in_string = True
                string_char = c
                i += 1
                continue
                
            if c == '{': 
                nest_brace += 1
                has_started_block = True
            elif c == '}': 
                nest_brace -= 1
            elif c == '(': nest_paren += 1
            elif c == ')': nest_paren -= 1
            elif c == '[': nest_bracket += 1
            elif c == ']': nest_bracket -= 1
            elif c == ';' and nest_brace == 0 and nest_paren == 0 and nest_bracket == 0:
                i += 1
                break
                
            if has_started_block and nest_brace == 0:
                i += 1
                break
                
            i += 1
            
        blocks[name] = code[start_idx:i]
        
    return blocks

all_original_blocks = {}
file_of_block = {}

for f_name in original_files:
    f_path = os.path.join(js_dir, f_name)
    if not os.path.exists(f_path):
        continue
    with open(f_path, 'r', encoding='utf-8') as file:
        blocks = extract_toplevel_blocks(file.read())
        for name, text in blocks.items():
            all_original_blocks[name] = text
            file_of_block[name] = f_name

new_blocks = {}
for f_name in new_files:
    f_path = os.path.join(js_dir, f_name)
    if not os.path.exists(f_path):
        continue
    with open(f_path, 'r', encoding='utf-8') as file:
        blocks = extract_toplevel_blocks(file.read())
        for name, text in blocks.items():
            new_blocks[name] = { 'text': text, 'file': f_name }

report = []
missing_names = []
mismatch_names = []

for name, orig_text in all_original_blocks.items():
    if name not in new_blocks:
        missing_names.append(name)
        report.append(f"MISSING: Function/Variable '{name}' from {file_of_block[name]} not found in any 2xxx file.")
    else:
        new_text = new_blocks[name]['text']
        if orig_text.strip() != new_text.strip():
            mismatch_names.append(name)
            report.append(f"MISMATCH: '{name}' (from {file_of_block[name]}, found in {new_blocks[name]['file']}) has modified code.")

with open(r"c:\Users\teamm\test\js\report.txt", "w", encoding="utf-8") as out:
    out.write("==== MISSING DEFINITIONS ====\n")
    for msg in [r for r in report if r.startswith("MISSING")]:
        out.write(msg + "\n")
    out.write("\n==== MISMATCHED DEFINITIONS ====\n")
    for msg in [r for r in report if r.startswith("MISMATCH")]:
        out.write(msg + "\n")

    if not missing_names and not mismatch_names:
        out.write("\nSUCCESS: All functions are present and identical!\n")
