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
        } else if (file.endsWith('Board.jsx') || file.endsWith('Modal.jsx')) {
            results.push(file.replace(/\\/g, '/'));
        }
    });
    return results;
}
const allFiles = walk('src');
let lazy = '';
let reg = '';
let count = 0;
const seen = new Set();

allFiles.forEach(f => {
    const name = path.basename(f, '.jsx');
    if(seen.has(name)) return;
    seen.add(name);
    
    let relPath = path.relative('src/pages', f).replace(/\\/g, '/');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    lazy += `const ${name} = lazy(() => import('${relPath}'));\n`;
    reg += `    ${name}': ${name},\n`;
    count++;
});
let out = `import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import SystemLoader from '../components/SystemLoader';

${lazy}
const boardRegistry = {
${reg}};

const BoardViewerPage = () => {
    const [searchParams] = useSearchParams();
    const boardName = searchParams.get('name');
    const BoardComponent = boardRegistry[boardName];
    if (!BoardComponent) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Board "{boardName}" not found or not mapped yet.</div>;
    return <Suspense fallback={<SystemLoader />}><BoardComponent isOpen={true} onClose={() => window.close()} isInline={false} /></Suspense>;
};
export default BoardViewerPage;
`;
fs.writeFileSync('e:/Project/Accounts/Accounts Web/src/pages/BoardViewerPage.jsx', out);
console.log('Mapped ' + count + ' components.');
