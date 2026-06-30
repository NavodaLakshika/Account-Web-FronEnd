import os, re
pattern = re.compile(r'<(?:h1|h2|h3|h4|h5|h6)[^>]*className=[\'\"\`][^\'\"\`]*text-\[?(?:[2-9][0-9]|[2-9][0-9]px|[3-9]xl)\]?[^\'\"\`]*[\'\"\`][^>]*>([^<]+)</(?:h1|h2|h3|h4|h5|h6)>', re.MULTILINE | re.IGNORECASE)
for root, _, files in os.walk(r'e:\Project\Accounts\Accounts Web\src'):
    for f in files:
        if f.endswith('.jsx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                matches = pattern.findall(content)
                for m in matches:
                    print(f'{f}: {m.strip()}')
