const fs = require('fs');
const path = require('path');

const dirsToScan = ['src/pages', 'src/components'];

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    let allFiles = [];
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            allFiles = allFiles.concat(scanDir(fullPath));
        } else if (fullPath.endsWith('.jsx')) {
            allFiles.push(fullPath);
        }
    }
    return allFiles;
}

let files = [];
dirsToScan.forEach(dir => {
    files = files.concat(scanDir(path.join(__dirname, dir)));
});

let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Match <button ... </button>
    content = content.replace(/<button([\s\S]*?)<\/button>/g, (match) => {
        // Only target buttons that have "DELETE" or "Delete" text (ignores icon-only buttons)
        if (!/>[^<]*(DELETE|Delete)/i.test(match)) return match;
        
        // Skip buttons that are already styled correctly to avoid double processing
        if (match.includes('bg-red-50 text-red-600')) return match;

        // Extract disabled condition if it exists
        let disabledCond = null;
        const disabledMatch = match.match(/disabled=\{([^}]+)\}/);
        if (disabledMatch) {
            disabledCond = disabledMatch[1];
        }

        const newClass = disabledCond 
            ? `className={\`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 \${(${disabledCond}) ? 'opacity-50 cursor-not-allowed' : ''}\`}`
            : `className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100"`;

        let newMatch = match;
        let classStart = match.indexOf('className=');
        
        if (classStart !== -1) {
            // Find the end of the className attribute
            let charAfterEq = match[classStart + 10];
            let endIdx = -1;
            if (charAfterEq === '"' || charAfterEq === "'") {
                endIdx = match.indexOf(charAfterEq, classStart + 11);
            } else if (charAfterEq === '{') {
                let braceCount = 0;
                for (let i = classStart + 10; i < match.length; i++) {
                    if (match[i] === '{') braceCount++;
                    if (match[i] === '}') braceCount--;
                    if (braceCount === 0) {
                        endIdx = i;
                        break;
                    }
                }
            }
            if (endIdx !== -1) {
                newMatch = match.substring(0, classStart) + newClass + match.substring(endIdx + 1);
            }
        } else {
            // If no className exists, insert it before the closing >
            const closeTagIndex = match.indexOf('>');
            newMatch = match.substring(0, closeTagIndex) + ' ' + newClass + match.substring(closeTagIndex);
        }

        return newMatch;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
        updatedCount++;
    }
});

console.log(`\nSuccessfully updated delete buttons in ${updatedCount} files!`);
