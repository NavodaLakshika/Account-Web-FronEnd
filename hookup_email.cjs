const fs = require('fs');

let content = fs.readFileSync('src/components/ReportTemplate.jsx', 'utf8');

// 1. Add Import
content = content.replace(
    /import ReportPrintModal from '\.\/modals\/AdminReports\/ReportPrintModal\.jsx';/g,
    "import ReportPrintModal from './modals/AdminReports/ReportPrintModal.jsx';\nimport ReportEmailModal from './modals/AdminReports/ReportEmailModal.jsx';"
);

// 2. Add State
content = content.replace(
    /const \[showPrintModal, setShowPrintModal\] = useState\(false\);/g,
    "const [showPrintModal, setShowPrintModal] = useState(false);\n    const [showEmailModal, setShowEmailModal] = useState(false);"
);

// 3. Wire Button
content = content.replace(
    /<button className="p-1\.5 hover:bg-gray-100 rounded text-gray-600" title="Email">/g,
    '<button className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Email" onClick={() => setShowEmailModal(true)}>'
);

// 4. Render Component
const modalJSX = `
            <ReportEmailModal 
                isOpen={showEmailModal} 
                onClose={() => setShowEmailModal(false)} 
                title={title}
                companyName={companyName}
                userName="nawoda lakshika"
            />
`;

content = content.replace(
    /<\/div>\n\s*<ReportPrintModal/g,
    `</div>\n${modalJSX}\n            <ReportPrintModal`
);

fs.writeFileSync('src/components/ReportTemplate.jsx', content);
