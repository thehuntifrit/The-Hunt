import re
from collections import defaultdict

def parse_css(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find selectors and their blocks
    # Note: This doesn't handle nested rules perfectly, but it's a start.
    # Given the user uses CSS nesting, we might need a better parser if it's complex.
    # However, let's look for exact property-value matches first.
    
    properties = defaultdict(list)
    # Find things like "property: value;"
    matches = re.finditer(r'([\w-]+)\s*:\s*([^;{}]+)\s*;', content)
    for m in matches:
        prop = m.group(1).strip()
        val = m.group(2).strip()
        properties[f"{prop}: {val}"].append(file_path)
    
    return properties

pc_props = parse_css('c:/Users/teamm/The-Hunt/css/pc.css')
mobile_props = parse_css('c:/Users/teamm/The-Hunt/css/mobile.css')

common = []
for kv, files in pc_props.items():
    if kv in mobile_props:
        print(f"Common: {kv}")
