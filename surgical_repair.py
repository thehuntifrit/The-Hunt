import re

def final_restoration(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. 座標点カラークラスの注入（存在しない場合のみ）
    if '.color-b1 {' not in content:
        color_classes = """
.color-b1 { background-color: var(--color-b1); border: 2px solid #fff; }
.color-b2 { background-color: var(--color-b2); border: 2px solid #fff; }
.color-b1-culled { background-color: var(--color-culled); border: 2px solid var(--color-b1); opacity: 0.7; }
.color-b2-culled { background-color: var(--color-culled); border: 2px solid var(--color-b2); opacity: 0.7; }
.color-lastone { background-color: var(--color-lastone); border: 2px solid #fff; box-shadow: 0 0 10px var(--color-lastone); }
.color-b1-only { background-color: var(--color-culled); border: 2px solid var(--color-b1); width: 10px; height: 10px; opacity: 0.6; }
.color-b2-only { background-color: var(--color-culled); border: 2px solid var(--color-b2); width: 10px; height: 10px; opacity: 0.6; }
"""
        # .spawn-point { ... } の閉じ括弧の直後に挿入
        content = re.sub(r'(\.spawn-point\s*\{[^}]+\})', r'\1' + color_classes, content)

    # 2. pulse-sync 破損箇所の修復
    pulse_sync_pattern = r'(@keyframes\s+pulse-sync\s*\{[\s\n]*0%,\s*[\s\n]*\})'
    pulse_sync_replacement = """@keyframes pulse-sync {
    0%,
    100% {
        opacity: 0.7;
        filter: brightness(1);
    }
    50% {
        opacity: 1;
        filter: brightness(1.3);
    }
}"""
    content = re.sub(pulse_sync_pattern, pulse_sync_replacement, content)

    # 3. mobile-alert-pulse 破損箇所の修復
    mobile_pulse_pattern = r'(@keyframes\s+mobile-alert-pulse\s*\{[\s\n]*0%,\s*[\s\n]*\})'
    mobile_pulse_replacement = """    @keyframes mobile-alert-pulse {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.6;
            transform: scale(0.9);
        }
    }"""
    content = re.sub(mobile_pulse_pattern, mobile_pulse_replacement, content)

    # 4. pc-glow-bg の追加
    if 'pc-glow-bg' not in content:
        glow_anim = """
@keyframes pc-glow-bg {
    0%, 100% {
        background-color: rgba(48, 64, 94, 0.6);
        box-shadow: inset 0 0 50px rgba(var(--cyan-rgb), 0.05);
    }
    50% {
        background-color: rgba(60, 80, 120, 0.7);
        box-shadow: inset 0 0 80px rgba(var(--cyan-rgb), 0.15);
    }
}"""
        # .text-glow { ... } の直後に追加
        content = re.sub(r'(\.text-glow\s*\{[^}]+\})', r'\1' + glow_anim, content)

    # 5. 浮浪プロパティの除去
    content = re.sub(r'[\n\s]+font-weight:\s*700;\s*\}', '', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    final_restoration('css/style.css')
    print("Final restoration completed successfully.")
