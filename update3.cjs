const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}
const files = walk('src');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('<TransactionFormWrapper')) {
        const name = path.basename(f, '.jsx');
        if (!content.includes('boardName=') && name !== 'TransactionFormWrapper') {
            content = content.replace(/<TransactionFormWrapper/g, '<TransactionFormWrapper boardName="' + name + '"');
            fs.writeFileSync(f, content);
            console.log('Updated ' + name);
        }
    }
});