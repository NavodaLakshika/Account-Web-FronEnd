const fs = require('fs');

const d = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
const imports = d.split('\n').filter(l => l.includes('import ') && (l.includes('Board') || l.includes('Modal')));

let lazy = '';
let reg = '';
let seen = new Set();

imports.forEach(l => {
    const m = l.match(/import\s+([A-Za-z0-9_]+)\s+from\s+'([^']+)'/);
    if(m) {
        const name = m[1];
        if(seen.has(name)) return;
        seen.add(name);
        let p = m[2];
        lazy += `const ${name} = lazy(() => import('${p}'));\n`;
        reg += `    ${name}': ${name},\n`;
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
    if (!BoardComponent) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Board "{boardName}" not found or not mapped yet.</div>;
    return <Suspense fallback={<SystemLoader />}><BoardComponent isOpen={true} onClose={() => window.close()} isInline={false} /></Suspense>;
};
export default BoardViewerPage;
`;

fs.writeFileSync('src/pages/BoardViewerPage.jsx', out);