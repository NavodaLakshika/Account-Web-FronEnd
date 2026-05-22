const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/SuperAdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace "Create Full Backup" button
const btnRegex = /<button className="px-5 py-2\.5 bg-\[\#00acee\] hover:bg-\[\#009adb\] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">\s*<Database size=\{14\} \/>\s*Create Full Backup\s*<\/button>/;
content = content.replace(btnRegex, `<button 
                                        onClick={handleCreateBackup}
                                        disabled={creatingBackup}
                                        className="px-5 py-2.5 bg-[#00acee] hover:bg-[#009adb] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {creatingBackup ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                                        {creatingBackup ? 'Creating...' : 'Create Full Backup'}
                                    </button>`);

// 2. Replace Database Size
const sizeRegex = /<h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Database Size<\/h3>\s*<p className="text-2xl font-bold text-slate-900">428\.5 <span className="text-sm text-slate-400 font-medium">MB<\/span><\/p>/;
content = content.replace(sizeRegex, `<h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Database Size</h3>
                                        <p className="text-2xl font-bold text-slate-900">N/A</p>`);

// 3. Replace Total Records
const recordsRegex = /<h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Records<\/h3>\s*<p className="text-2xl font-bold text-slate-900">1\.2 <span className="text-sm text-slate-400 font-medium">Million<\/span><\/p>/;
content = content.replace(recordsRegex, `<h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Records</h3>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {allCompanies.length + allEmployees.length + hierarchy.reduce((acc, emp) => acc + (emp.companies ? emp.companies.reduce((sum, comp) => sum + (comp.transactions || comp.Transactions || 0), 0) : 0), 0)}
                                        </p>`);

// 4. Replace Active Connections
const connectionsRegex = /<h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Active Connections<\/h3>\s*<p className="text-2xl font-bold text-slate-900">42<\/p>/;
content = content.replace(connectionsRegex, `<h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Active Connections</h3>
                                        <p className="text-2xl font-bold text-slate-900">{allEmployees.length || 0}</p>`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Update Complete!");
