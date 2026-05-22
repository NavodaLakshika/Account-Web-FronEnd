const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/modals/AdminReports/SystemLogReportModal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("import ReportTemplate")) {
    content = content.replace(
        "import CalendarModal from '../../CalendarModal';",
        "import CalendarModal from '../../CalendarModal';\nimport ReportTemplate from '../../ReportTemplate';"
    );
}

if (!content.includes("showReport")) {
    content = content.replace(
        "const [loading, setLoading] = useState(false);",
        "const [loading, setLoading] = useState(false);\n    const [showReport, setShowReport] = useState(false);\n    const [reportData, setReportData] = useState([]);"
    );
}

const handleDisplayRegex = /const handleDisplay = \(\) => \{\s*setLoading\(true\);\s*setTimeout\(\(\) => setLoading\(false\), 1500\);\s*\};/;

const newHandleDisplay = `const handleDisplay = () => {
        setLoading(true);
        // Generate mock log data since there's no backend endpoint for it yet
        setTimeout(() => {
            setReportData([
                { id: 'LOG-001', date: dateFrom, action: 'Super Admin Login', user: 'Navoda', ip: '192.168.1.1', status: 'Success' },
                { id: 'LOG-002', date: dateFrom, action: 'Updated Role Permissions', user: 'LAKSHIKA', ip: '192.168.1.5', status: 'Success' },
                { id: 'LOG-003', date: dateFrom, action: 'System Backup Complete', user: 'System', ip: 'localhost', status: 'Success' },
                { id: 'LOG-004', date: dateTo, action: 'Created New Company', user: 'Admin', ip: '192.168.1.1', status: 'Success' },
                { id: 'LOG-005', date: dateTo, action: 'Failed Login Attempt', user: 'Unknown', ip: '10.0.0.45', status: 'Failed' },
                { id: 'LOG-006', date: dateTo, action: 'Deleted Transaction', user: 'Navoda', ip: '192.168.1.1', status: 'Warning' },
            ]);
            setLoading(false);
            setShowReport(true);
        }, 800);
    };`;

if (handleDisplayRegex.test(content)) {
    content = content.replace(handleDisplayRegex, newHandleDisplay);
}

const returnRegex = /return \(\s*<>\s*<SimpleModal/;

const newReturn = `return (
        <>
            {showReport ? (
                <div className="fixed inset-0 z-[200]">
                    <div className="absolute top-4 right-4 z-[300]">
                        <button 
                            onClick={() => setShowReport(false)} 
                            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <ReportTemplate
                        title="System Log & Audit Report"
                        subtitle={\`Audit Trail From \${dateFrom} To \${dateTo}\`}
                        data={reportData}
                        columns={[
                            { header: 'Log ID', key: 'id' },
                            { header: 'Date', key: 'date' },
                            { header: 'Action Performed', key: 'action' },
                            { header: 'User', key: 'user' },
                            { header: 'IP Address', key: 'ip' },
                            { header: 'Status', key: 'status' }
                        ]}
                        companyName="Super Admin Portal"
                        isStandalone={true}
                    />
                </div>
            ) : (
            <SimpleModal`;

if (returnRegex.test(content)) {
    content = content.replace(returnRegex, newReturn);
    
    // We need to close the parentheses and braces correctly. 
    // Since we wrapped SimpleModal in showReport ? ... : ( <SimpleModal ... /> )
    // We need to find the end of the SimpleModal block.
    // Let's replace the last </SimpleModal> with </SimpleModal>\n            )}
    content = content.replace(/<\/SimpleModal>/g, "</SimpleModal>\n            )}");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("updated");
