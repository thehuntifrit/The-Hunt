import os
import glob
import re

js_dir = 'c:/Users/teamm/test/js'

orig_files = [f for f in glob.glob(js_dir + '/*.js') if not os.path.basename(f).startswith('2')]

orig_funcs = {}

def get_functions(filepath):
    funcs = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = re.finditer(r'^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(', content, re.MULTILINE)
    for match in matches:
        func_name = match.group(1)
        start_idx = match.start()
        
        brace_start = content.find('{', start_idx)
        if brace_start == -1:
            continue
            
        brace_count = 1
        pos = brace_start + 1
        in_string = False
        string_char = ''
        in_escape = False
        in_comment_line = False
        in_comment_block = False
        
        while pos < len(content) and brace_count > 0:
            char = content[pos]
            
            if in_escape:
                in_escape = False
                pos += 1
                continue
                
            if char == '\\':
                in_escape = True
                pos += 1
                continue
                
            if not in_string and not in_comment_line and not in_comment_block:
                if char == '"' or char == "'" or char == '`':
                    in_string = True
                    string_char = char
                elif char == '/' and pos + 1 < len(content):
                    next_char = content[pos+1]
                    if next_char == '/':
                        in_comment_line = True
                        pos += 1
                    elif next_char == '*':
                        in_comment_block = True
                        pos += 1
                elif char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
            elif in_string:
                if char == string_char:
                    in_string = False
            elif in_comment_line:
                if char == '\n':
                    in_comment_line = False
            elif in_comment_block:
                if char == '*' and pos + 1 < len(content) and content[pos+1] == '/':
                    in_comment_block = False
                    pos += 1
                    
            if brace_count == 0:
                break
                
            pos += 1
            
        if brace_count == 0:
            funcs[func_name] = content[start_idx:pos+1]
            
    return funcs

for filepath in orig_files:
    funcs = get_functions(filepath)
    orig_funcs.update(funcs)

print(f"Loaded {len(orig_funcs)} original functions.")

target_files = glob.glob(js_dir + '/2*.js')

for filepath in target_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    t_matches = list(re.finditer(r'^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(', content, re.MULTILINE))
    
    for match in reversed(t_matches):
        func_name = match.group(1)
        if func_name not in orig_funcs:
            continue
            
        orig_body = orig_funcs[func_name]
        is_export = "export " in match.group(0)
        replace_text = orig_body
        if is_export and not orig_body.startswith("export"):
            replace_text = "export " + orig_body
            
        start_idx = match.start()
        brace_start = content.find('{', start_idx)
        if brace_start == -1:
            continue
            
        brace_count = 1
        pos = brace_start + 1
        in_string = False
        string_char = ''
        in_escape = False
        in_comment_line = False
        in_comment_block = False
        
        while pos < len(content) and brace_count > 0:
            char = content[pos]
            
            if in_escape:
                in_escape = False
                pos += 1
                continue
                
            if char == '\\':
                in_escape = True
                pos += 1
                continue
                
            if not in_string and not in_comment_line and not in_comment_block:
                if char == '"' or char == "'" or char == '`':
                    in_string = True
                    string_char = char
                elif char == '/' and pos + 1 < len(content):
                    next_char = content[pos+1]
                    if next_char == '/':
                        in_comment_line = True
                        pos += 1
                    elif next_char == '*':
                        in_comment_block = True
                        pos += 1
                elif char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
            elif in_string:
                if char == string_char:
                    in_string = False
            elif in_comment_line:
                if char == '\n':
                    in_comment_line = False
            elif in_comment_block:
                if char == '*' and pos+1 < len(content) and content[pos+1] == '/':
                    in_comment_block = False
                    pos += 1
                    
            if brace_count == 0:
                break
            pos += 1
            
        if brace_count == 0:
            end_idx = pos + 1
            new_content = new_content[:start_idx] + replace_text + new_content[end_idx:]
            
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Completely restored all functions in {os.path.basename(filepath)}")
