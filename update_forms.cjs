const fs = require('fs');

function walk(dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { results = results.concat(walk(file)); } else if (file.endsWith('.jsx')) { results.push(file); }
    });
    return results;
}

const files = walk('e:/Project/Accounts/Accounts Web/src');
let modifyCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove subtitle prop from TransactionFormWrapper
    content = content.replace(/(<TransactionFormWrapper[^>]*)subtitle=["'][^"']*["']/g, '$1');

    // Simplify titles
    // E.g. title="Area Profile" -> title="Area"
    // title="Account Master Configuration — Definition Portal" -> title="Account Master" (already done)
    content = content.replace(/(<TransactionFormWrapper[^>]*)title=["']([^"']+)["']/g, (match, prefix, title) => {
        let newTitle = title;
        // Remove trailing descriptors
        newTitle = newTitle.replace(/\s+(Profile|Maintenance|Master|Dashboard|Board|Management)$/i, '');
        // Exceptions
        if (title.toLowerCase().includes('account master')) newTitle = 'Account Master';
        if (title === 'Vendor Types Master') newTitle = 'Vendor Types';
        
        return prefix + 'title="' + newTitle + '"';
    });
    
    // clean up multiple spaces left by replacing subtitle
    content = content.replace(/<TransactionFormWrapper\s+/g, '<TransactionFormWrapper ');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifyCount++;
        console.log('Modified:', file.split('/').pop());
    }
});

console.log('Total modified:', modifyCount);
