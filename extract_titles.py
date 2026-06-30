import os, re
results = set()
pattern = re.compile(r'<TransactionFormWrapper[^>]*title=[\'\"\`]?([^\'\"\`\>]+)[\'\"\`]?', re.MULTILINE | re.DOTALL)
for root, _, files in os.walk(r'e:\Project\Accounts\Accounts Web\src'):
    for f in files:
        if f.endswith('.jsx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                matches = pattern.findall(content)
                for m in matches:
                    results.add((f, m))

for f, title in results:
    print(f'{f}: {title}')
