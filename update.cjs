const fs = require('fs');
const lines = fs.readFileSync('board_imports.txt', 'utf8').split('\n');
let lazy = '';
let reg = '';
lines.forEach(l => {
    const m = l.match(/import (?:\{)(\w+)(?:\})?\s+from\s+'([^']+)'/);
    if (m) {
        lazy += `const ${m[1]} = lazy(() => import('${m[2]}'));\n`;
        reg += `    ${m[1]}: ${m[1]},\n`;
    }
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
    if (!BoardComponent) return <div className=\"min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold\">Board \"{boardName}\" not found or not mapped yet.</div>;
    return <Suspense fallback={<SystemLoader />}><BoardComponent isOpen={true} onClose={() => window.close()} isInline={false} /></Suspense>;
};
export default BoardViewerPage;`;
fs.writeFileSync('e:/Project/Accounts/Accounts Web/src/pages/BoardViewerPage.jsx', out);
