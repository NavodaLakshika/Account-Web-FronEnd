const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'src', 'pages');

// Simple helper to get all jsx files
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.jsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // 1. Add import for SearchableSelect if not exists, but we know it's needed if we find SimpleModal Lookups
    if (content.includes('title="') && content.includes('Lookup"') && content.includes('<SimpleModal')) {
        if (!content.includes('SearchableSelect')) {
            // Insert import after the last import
            const lastImportIndex = content.lastIndexOf('import ');
            const endOfLastImport = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLastImport + 1) + "import SearchableSelect from '../components/SearchableSelect';\n" + content.slice(endOfLastImport + 1);
            hasChanges = true;
        }

        // 2. We can attempt to regex match the generic SimpleModal lookup block and remove it.
        // This regex looks for <SimpleModal ... Lookup ...> ... </SimpleModal>
        // Note: Regex for nested HTML is dangerous, but this is a best-effort script.
        const modalRegex = /<SimpleModal[^>]*title="[^"]*Lookup"[^>]*>[\s\S]*?<\/SimpleModal>/g;
        
        const matches = content.match(modalRegex);
        if (matches) {
            console.log(`Found ${matches.length} lookups in ${path.basename(filePath)}`);
            // We won't automatically delete them via regex because it might leave trailing state variables.
            // Instead we comment them out so the developer can review.
            content = content.replace(modalRegex, (match) => {
                return `{/* TODO: Replaced with SearchableSelect \n ${match} \n*/}`;
            });
            hasChanges = true;
        }
    }

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.basename(filePath)}`);
    }
}

function run() {
    console.log("Starting Refactoring Script...");
    const files = getAllFiles(PAGES_DIR);
    console.log(`Scanning ${files.length} files...`);
    
    files.forEach(file => {
        try {
            processFile(file);
        } catch (e) {
            console.error(`Error processing ${file}: ${e.message}`);
        }
    });
    console.log("Finished. Please search your project for 'TODO: Replaced with SearchableSelect' to manually wire up the new SearchableSelect component.");
}

run();
