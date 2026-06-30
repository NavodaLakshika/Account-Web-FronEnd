import os
import re

count = 0
for root, _, files in os.walk(r'e:\Project\Accounts\Accounts Web\src\pages'):
    for f in files:
        if f.endswith('.jsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Using regex to find the tags and remove maxWidth attribute
            def replacer(match):
                tag_content = match.group(0)
                new_tag = re.sub(r'\s*maxWidth=(?:"[^"]*"|\'[^\']*\'|\{[^}]*\})', '', tag_content)
                return new_tag

            new_content = re.sub(r'<(TransactionFormWrapper|MasterFormWrapper)[^>]*>', replacer, content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f'Updated {f}')
                count += 1

print(f'Total updated: {count}')
