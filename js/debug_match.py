import os
import re

js_dir = r"c:\Users\teamm\test\js"

def get_block(filepath, func_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

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
            
        if name == func_name:
            return code[start_idx:i]

orig = get_block(os.path.join(js_dir, 'app.js'), 'renderMaintenanceStatus')
new = get_block(os.path.join(js_dir, '2app.js'), 'renderMaintenanceStatus')

with open('orig_out.txt', 'w', encoding='utf-8') as f:
    f.write(orig if orig else "")

with open('new_out.txt', 'w', encoding='utf-8') as f:
    f.write(new if new else "")

with open('check_status.txt', 'w', encoding='utf-8') as f:
    f.write(f"orig length: {len(orig) if orig else 0}, new length: {len(new) if new else 0}\n")
    f.write(f"Is exactly identical: {orig == new}\n")
