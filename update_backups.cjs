const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/SuperAdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add State for Backups
if (!content.includes('const [backups, setBackups]')) {
    content = content.replace(
        "const [showAdminConfig, setShowAdminConfig] = useState(false);",
        "const [showAdminConfig, setShowAdminConfig] = useState(false);\n    const [backups, setBackups] = useState([]);\n    const [creatingBackup, setCreatingBackup] = useState(false);"
    );
}

// 2. Fetch Backups function
if (!content.includes('const fetchBackups')) {
    content = content.replace(
        "const getAvailablePermCompanies = () => {",
        `const fetchBackups = async () => {
        try {
            const res = await api.get('/Backup/history');
            if (res.data) setBackups(res.data);
        } catch (error) {
            console.error("Failed to fetch backups", error);
        }
    };

    useEffect(() => {
        if (activeMenu === 'Database') {
            fetchBackups();
        }
    }, [activeMenu]);

    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        try {
            // Get default path
            let defaultPath = "C:\\\\Backup";
            try {
                const pathRes = await api.get('/Backup/default-path');
                if (pathRes.data?.path) defaultPath = pathRes.data.path;
            } catch (e) { }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = \`Acc_Web_\${timestamp}.bak\`;
            const fullPath = \`\${defaultPath}\\\\\${fileName}\`;
            
            const res = await api.post('/Backup/create', {
                DatabaseName: 'Acc_Web',
                BackupPath: fullPath,
                UserName: 'SuperAdmin'
            });
            
            toast.success(res.data?.message || 'Backup created successfully');
            fetchBackups(); // Refresh list
        } catch (error) {
            console.error("Backup failed", error);
            toast.error(error.response?.data?.message || 'Failed to create backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    const getAvailablePermCompanies = () => {`
    );
}

// 3. Update the button
const buttonRegex = /<button className="px-5 py-2\.5 bg-[#00acee] hover:bg-\[\#009adb\] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">\s*<Database size=\{16\} \/>\s*Create Full Backup\s*<\/button>/;

if (buttonRegex.test(content)) {
    content = content.replace(buttonRegex, `<button 
                                        onClick={handleCreateBackup}
                                        disabled={creatingBackup}
                                        className="px-5 py-2.5 bg-[#00acee] hover:bg-[#009adb] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {creatingBackup ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                                        {creatingBackup ? 'Creating...' : 'Create Full Backup'}
                                    </button>`);
}

// 4. Update the "Last Backup" hardcoded string
const lastBackupRegex = /<h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Last Backup<\/h3>\s*<p className="text-lg font-bold text-slate-900">Today, 02:30 AM<\/p>/;
if (lastBackupRegex.test(content)) {
    content = content.replace(lastBackupRegex, `<h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Last Backup</h3>
                                        <p className="text-lg font-bold text-slate-900">
                                            {backups.length > 0 && backups[0].createdAt 
                                                ? new Date(backups[backups.length - 1].createdAt || backups[0].createdAt).toLocaleString() 
                                                : 'No Backups'}
                                        </p>`);
}

// 5. Update the "Recent Backups" mapping
const recentBackupsRegex = /\{\[\s*\{ date: 'Today, 02:30 AM', size: '142\.5 MB', type: 'Automated' \},\s*\{ date: 'Yesterday, 02:30 AM', size: '141\.2 MB', type: 'Automated' \},\s*\{ date: 'Oct 24, 15:45 PM', size: '140\.8 MB', type: 'Manual' \},\s*\{ date: 'Oct 23, 02:30 AM', size: '139\.5 MB', type: 'Automated' \},\s*\]\.map\(\(b, i\) => \(/;

if (recentBackupsRegex.test(content)) {
    // Instead of completely replacing it, we can replace the map array with `backups`
    const replacement = `{(backups.length > 0 ? backups.slice().reverse().slice(0, 5) : []).map((b, i) => (`;
    content = content.replace(recentBackupsRegex, replacement);
    
    // Also we need to replace b.date, b.type, b.size inside the map
    // Inside the map we have: <p className="text-xs font-bold text-slate-800">{b.date}</p>
    // And <p className="text-[10px] text-slate-500 uppercase tracking-wider">{b.type} • {b.size}</p>
    content = content.replace(/<p className="text-xs font-bold text-slate-800">\{b\.date\}<\/p>/g, `<p className="text-xs font-bold text-slate-800" title={b.backupPath}>{b.createdAt ? new Date(b.createdAt).toLocaleString() : 'N/A'}</p>`);
    content = content.replace(/<p className="text-\[10px\] text-slate-500 uppercase tracking-wider">\{b\.type\} • \{b\.size\}<\/p>/g, `<p className="text-[10px] text-slate-500 uppercase tracking-wider">{b.createdBy || 'Manual'} • {b.status}</p>`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("update complete");
