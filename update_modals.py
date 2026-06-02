import os, glob, re

files = glob.glob('src/**/*.jsx', recursive=True)
count = 0

backdrops = [
    (re.compile(r'bg-slate-900/70\s+backdrop-blur-sm'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-slate-900/60\s+backdrop-blur-md'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-slate-900/60\s+backdrop-blur-sm'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-slate-900/50\s+backdrop-blur-sm'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-black/60\s+backdrop-blur-md'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-black/60\s+backdrop-blur-sm'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-black/40\s+backdrop-blur-sm'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-black/50\s+backdrop-blur-sm'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-slate-900/70(?!\s+backdrop)'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-slate-900/60(?!\s+backdrop)'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-black/60(?!\s+backdrop)'), 'bg-slate-900/30 backdrop-blur-sm'),
    (re.compile(r'bg-black/50(?!\s+backdrop)'), 'bg-slate-900/30 backdrop-blur-sm'),
]

for f in files:
    try:
        content = open(f, encoding='utf-8').read()
        if 'fixed' not in content or 'inset-0' not in content:
            continue

        original = content

        for pattern, repl in backdrops:
            content = pattern.sub(repl, content)

        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'bg-white' in line and 'shadow-' in line and 'rounded-' in line and '<div' in line:
                line = re.sub(r'\bborder\s+border-[a-zA-Z0-9/-]+', '', line)
                line = re.sub(r'\brounded-\w+\b', 'rounded-sm', line)
                line = re.sub(r'\brounded-\[.*?\]\b', 'rounded-sm', line)
                line = re.sub(r'\s+', ' ', line)
                lines[i] = line
            
            # Update Close buttons explicitly if they contain <X ... />
            if '<X ' in line or '<X/>' in line or '<X></X>' in line:
                if 'size=' in line or 'strokeWidth=' in line:
                    line = re.sub(r'size=\{\d+\}', 'size={28}', line)
                    line = re.sub(r'strokeWidth=\{\d+(\.\d+)?\}', 'strokeWidth={1.5}', line)
                    if 'size=' not in line:
                        line = line.replace('<X ', '<X size={28} strokeWidth={1.5} ')
                else:
                    line = line.replace('<X', '<X size={28} strokeWidth={1.5}')
                
                lines[i] = line
            
            # Clean up button backgrounds around close buttons (basic heuristic)
            if 'hover:bg-red-100' in line and 'text-red-600' in line and '<button' in line and ('onClose' in line or 'setShow' in line):
                 line = re.sub(r'\bbg-red-50 hover:bg-red-100 text-red-600 rounded-\[6px\]\b', 'text-gray-400 hover:text-gray-800 transition-colors border-none bg-transparent', line)
                 lines[i] = line

        content = '\n'.join(lines)

        if content != original:
            count += 1
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)

    except Exception as e:
        print("Error on", f, e)

print(f"Updated {count} files")
