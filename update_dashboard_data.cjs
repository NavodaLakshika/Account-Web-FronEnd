const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/SuperAdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes("import SystemLogReportModal")) {
    content = content.replace(
        "import SystemSettingsBoard from '../HomeMaster/SystemSettingsBoard';",
        "import SystemSettingsBoard from '../HomeMaster/SystemSettingsBoard';\nimport SystemLogReportModal from '../components/modals/AdminReports/SystemLogReportModal';"
    );
}

// 2. Add state variable
if (!content.includes("const [showSystemLogReport, setShowSystemLogReport]")) {
    content = content.replace(
        "const [showAdminConfig, setShowAdminConfig] = useState(false);",
        "const [showAdminConfig, setShowAdminConfig] = useState(false);\n    const [showSystemLogReport, setShowSystemLogReport] = useState(false);"
    );
}

// 3. Update the Analytics View to use real data and attach onClick
const analyticsRegex = /\{\/\* ANALYTICS VIEW \*\/\}\s*\{activeMenu === 'Analytics' && \(\s*<div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full max-h-\[82vh\] overflow-y-auto no-scrollbar pb-10">[\s\S]*?<h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">[\s\S]*?<Activity className="text-emerald-500" size=\{20\} \/>[\s\S]*?System Analytics[\s\S]*?<\/h2>[\s\S]*?<p className="text-slate-500 text-xs mt-1">Real-time system usage, user activity, and performance metrics.<\/p>[\s\S]*?<\/div>[\s\S]*?<div className="flex items-center gap-3">[\s\S]*?<select className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm outline-none focus:border-emerald-500">[\s\S]*?<option>Today<\/option>[\s\S]*?<option>Last 7 Days<\/option>[\s\S]*?<option>Last 30 Days<\/option>[\s\S]*?<\/select>[\s\S]*?<button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">[\s\S]*?Export Report[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">[\s\S]*?\{\[[\s\S]*?\{ title: 'Active Users', value: '1,245', change: '\+12%', colorClass: 'border-t-emerald-500' \},[\s\S]*?\{ title: 'API Requests', value: '45.2K', change: '\+5.4%', colorClass: 'border-t-blue-500' \},[\s\S]*?\{ title: 'System Uptime', value: '99.99%', change: 'Stable', colorClass: 'border-t-purple-500' \},[\s\S]*?\{ title: 'Error Rate', value: '0.01%', change: '-0.05%', colorClass: 'border-t-orange-500' \},[\s\S]*?\]\.map\(\(stat, i\) => \([\s\S]*?<div key=\{i\} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 \$\{stat\.colorClass\}`}>[\s\S]*?<h3 className="text-slate-500 text-\[10px\] font-black uppercase tracking-widest mb-2">\{stat\.title\}<\/h3>[\s\S]*?<div className="flex items-end gap-2">[\s\S]*?<p className="text-3xl font-black text-slate-900">\{stat\.value\}<\/p>[\s\S]*?<span className={`text-xs font-bold mb-1 \$\{stat\.change\.startsWith\('\+'\) \|\| stat\.change === 'Stable' \? 'text-emerald-500' : 'text-red-500'\}`}>\{stat\.change\}<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\)}/;

const newAnalyticsView = `{/* ANALYTICS VIEW */}
                    {activeMenu === 'Analytics' && (
                        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full max-h-[82vh] overflow-y-auto no-scrollbar pb-10">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Activity className="text-emerald-500" size={20} />
                                        System Analytics
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1">Real-time system usage, user activity, and performance metrics.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm outline-none focus:border-emerald-500">
                                        <option>Today</option>
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                    </select>
                                    <button 
                                        onClick={() => setShowSystemLogReport(true)}
                                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        Export Report
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                                {(() => {
                                    const activeUsers = allEmployees.length;
                                    const totalCompanies = allCompanies.length;
                                    const pendingActions = pendingResets.length;
                                    let totalTransactions = 0;
                                    hierarchy.forEach(emp => {
                                        if (emp.companies) {
                                            emp.companies.forEach(comp => {
                                                totalTransactions += (comp.transactions || comp.Transactions || 0);
                                            });
                                        }
                                    });

                                    return [
                                        { title: 'Total Employees', value: activeUsers.toString(), change: '+Active', colorClass: 'border-t-emerald-500' },
                                        { title: 'Total Companies', value: totalCompanies.toString(), change: 'Growing', colorClass: 'border-t-blue-500' },
                                        { title: 'Total Transactions', value: totalTransactions.toString(), change: 'Volume', colorClass: 'border-t-purple-500' },
                                        { title: 'Pending Resets', value: pendingActions.toString(), change: pendingActions > 0 ? 'Needs Action' : 'Clear', colorClass: pendingActions > 0 ? 'border-t-red-500' : 'border-t-orange-500' },
                                    ].map((stat, i) => (
                                        <div key={i} className={\`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 \${stat.colorClass}\`}>
                                            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.title}</h3>
                                            <div className="flex items-end gap-2">
                                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                                                <span className={\`text-xs font-bold mb-1 \${stat.change === 'Needs Action' ? 'text-red-500' : 'text-emerald-500'}\`}>{stat.change}</span>
                                            </div>
                                        </div>
                                    ));
                                })()}`;

if (analyticsRegex.test(content)) {
    content = content.replace(analyticsRegex, newAnalyticsView);
    console.log("Analytics View updated with real data mapping.");
} else {
    console.log("Analytics View Regex did not match.");
}

// 4. Add the component at the bottom of the main div
if (!content.includes("<SystemLogReportModal")) {
    const componentStr = `
            {/* System Log Report Modal */}
            <SystemLogReportModal 
                isOpen={showSystemLogReport} 
                onClose={() => setShowSystemLogReport(false)} 
            />
        </div>
    );
};`;
    content = content.replace("        </div>\n    );\n};\n", componentStr);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("update complete");
