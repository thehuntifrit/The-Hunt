import os
import re

js_dir = r"c:\Users\teamm\test\js"

def sync_functions(orig_filename, new_filename):
    orig = os.path.join(js_dir, orig_filename)
    new_f = os.path.join(js_dir, new_filename)
    
    with open(orig, 'r', encoding='utf-8') as f:
        orig_content = f.read()
    with open(new_f, 'r', encoding='utf-8') as f:
        new_content = f.read()
        
    def extract_toplevel_blocks(code):
        blocks = {}
        i = 0
        n = len(code)
        
        func_re = re.compile(r'^(?:export\s+)?(?:async\s+)?function\s+([\w\$]+)\s*\(')
        
        while i < n:
            if code[i].isspace(): i += 1; continue
            if code[i:i+2] == '//': i = code.find('\n', i); i = n if i == -1 else i; continue
            if code[i:i+2] == '/*': i = code.find('*/', i); i = n if i == -1 else i + 2; continue
                
            chunk = code[i:i+100]
            match_func = func_re.search(chunk)
            
            name = None
            start_idx = i
            
            if match_func and match_func.start() == 0:
                name = match_func.group(1)
                i += match_func.end() - 1
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

    orig_blocks = extract_toplevel_blocks(orig_content)
    new_blocks = extract_toplevel_blocks(new_content)
    
    changed = False
    
    for name, orig_text in orig_blocks.items():
        if name in new_blocks:
            new_text = new_blocks[name]
            if orig_text != new_text:
                if new_text in new_content:
                    new_content = new_content.replace(new_text, orig_text)
                    changed = True
                    print(f"Replaced '{name}' exactly as original in {new_filename}")
                else:
                    print(f"Could not replace '{name}' (chunk mismatch)")
                
    if changed:
        with open(new_f, 'w', encoding='utf-8') as f:
            f.write(new_content)

files_to_sync = [
    ('app.js', '2app.js'),
    ('cal.js', '2cal.js'),
    ('dataManager.js', '2dataManager.js'),
    ('mobCard.js', '2mobCard.js'),
    ('mobSorter.js', '2mobSorter.js'),
    ('modal.js', '2modal.js'),
    ('readme.js', '2readme.js'),
    ('server.js', '2server.js'),
    ('sidebar.js', '2sidebar.js'),
    ('worker.js', '2worker.js')
]

for o_f, n_f in files_to_sync:
    sync_functions(o_f, n_f)
    
print("Sync complete.")
