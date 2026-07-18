const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir);

const svgChevronStr = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 24 24\\\' fill=\\\'none\\\' stroke=\\\'%2364748b\\\'';

let updatedCount = 0;

for (const f of files) {
    if (!f.endsWith('.jsx')) continue;
    
    const fullPath = path.join(dir, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find what the search function is called in this file
    let searchFunc = null;
    if (content.includes('const handleSearch =') || content.includes('function handleSearch(')) {
        searchFunc = 'handleSearch';
    } else if (content.includes('const handleSearchClick =') || content.includes('function handleSearchClick(')) {
        searchFunc = 'handleSearchClick';
    } else if (content.includes('const handleSearchDocs =') || content.includes('function handleSearchDocs(')) {
        searchFunc = 'handleSearchDocs';
    }
    
    if (!searchFunc) continue;

    // Find the input element for docNo
    // Typically: <input type="text" name="docNo" value={formData.docNo} ... style={{ backgroundImage: `url("data:image/svg+xml...
    // Or: <input type="text" value={formData.docNo} ... name="docNo" ...
    
    // Regex to match <input ... formData.docNo ... >
    const inputRegex = /<input[^>]*value=\{formData\.docNo\}[^>]*style=\{\{\s*backgroundImage:\s*`url\("data:image\/svg\+xml;charset=UTF-8,%3csvg[^>]*>/g;
    
    const matches = [...content.matchAll(inputRegex)];
    let modified = false;
    
    for (const match of matches) {
        const inputStr = match[0];
        
        // Check if it already has onClick
        if (inputStr.includes('onClick={')) {
            // Already has onClick, skip or replace?
            // Actually, some have onClick={() => ...} for DatePicker, but this is docNo
            if (!inputStr.includes(`onClick={${searchFunc}}`)) {
                // Let's replace the first space after <input with onClick
                const replaced = inputStr.replace('<input ', `<input onClick={${searchFunc}} cursor="pointer" `);
                content = content.replace(inputStr, replaced);
                modified = true;
            }
        } else {
            // Add onClick
            const replaced = inputStr.replace('<input ', `<input onClick={${searchFunc}} cursor="pointer" `);
            content = content.replace(inputStr, replaced);
            modified = true;
        }
        
        // Also ensure cursor-pointer is in className if it isn't
        if (modified) {
            // we can just make sure cursor-pointer is in className
            let newStr = content; // we already replaced it in content, let's find it again
        }
    }
    
    if (modified) {
        // Find the modified input and add cursor-pointer to className if it exists
        const modifiedRegex = new RegExp(`<input onClick=\\{${searchFunc}\\} cursor="pointer" [^>]*className="([^"]*)"`, 'g');
        content = content.replace(modifiedRegex, (m, classNames) => {
            if (!classNames.includes('cursor-pointer')) {
                return m.replace(`className="${classNames}"`, `className="${classNames} cursor-pointer"`);
            }
            return m;
        });

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${f} with onClick={${searchFunc}}`);
        updatedCount++;
    }
}

console.log(`Total files updated: ${updatedCount}`);
