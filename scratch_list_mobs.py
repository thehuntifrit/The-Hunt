import json
d = json.load(open('public/json/mob_data.json', encoding='utf-8'))
for k, v in d['mobs'].items():
    print(f'{k}: {v["n"]} ({v["r"]})')
