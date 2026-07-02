const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Replace footer container padding
            content = content.replace(/className="bg-\[#fcfcfc\] px-6 py-4 w-full flex justify-between/g, 'className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between');
            content = content.replace(/className="bg-\[#fcfcfc\] px-6 py-3 w-full flex justify-between/g, 'className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between');
            
            // Replace button padding to h-10 inside footers
            // We want to target: className="px-6 py-2 border...
            // and className={`px-6 py-2 bg-[#0285fd]...
            content = content.replace(/px-6 py-2 border/g, 'px-6 h-10 border');
            content = content.replace(/px-6 py-2 bg-\[#0285fd\]/g, 'px-6 h-10 bg-[#0285fd]');
            content = content.replace(/px-6 py-2 text-white bg-blue-600/g, 'px-6 h-10 text-white bg-blue-600');
            
            // Also some might use px-4 or px-5
            content = content.replace(/px-5 py-2 border/g, 'px-5 h-10 border');
            content = content.replace(/px-5 py-2 bg-\[#0285fd\]/g, 'px-5 h-10 bg-[#0285fd]');
            
            // For submit buttons
            content = content.replace(/px-4 py-2 bg-\[#0285fd\]/g, 'px-4 h-10 bg-[#0285fd]');
            content = content.replace(/px-4 py-2 border/g, 'px-4 h-10 border');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src', 'pages'));
processDir(path.join(__dirname, 'src', 'components'));
