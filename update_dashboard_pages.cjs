const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/SuperAdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Database View
const dbRegex = /\{\/\* DATABASE VIEW \*\/\}\s*\{activeMenu === 'Database' && \(\s*<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center animate-in fade-in zoom-in-95 duration-200">[\s\S]*?<\/div>\s*\)\}/;

const newDbView = `{/* DATABASE VIEW */}
                    {activeMenu === 'Database' && (
                        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full max-h-[82vh] overflow-y-auto no-scrollbar pb-10">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Database className="text-[#00acee]" size={20} />
                                        Database Management
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1">Manage system backups, optimize performance, and monitor database health.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="px-5 py-2.5 bg-[#00acee] hover:bg-[#009adb] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">
                                        <Database size={14} />
                                        Create Full Backup
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                            <Database size={18} />
                                        </div>
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">Healthy</span>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Database Size</h3>
                                        <p className="text-2xl font-bold text-slate-900">428.5 <span className="text-sm text-slate-400 font-medium">MB</span></p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                            <Users size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Records</h3>
                                        <p className="text-2xl font-bold text-slate-900">1.2 <span className="text-sm text-slate-400 font-medium">Million</span></p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                            <Activity size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Active Connections</h3>
                                        <p className="text-2xl font-bold text-slate-900">42</p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                            <CheckCircle size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Last Backup</h3>
                                        <p className="text-lg font-bold text-slate-900">Today, 02:30 AM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Maintenance Operations</h3>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">Rebuild Indexes</h4>
                                                <p className="text-xs text-slate-500 mt-1">Improves database query performance by defragmenting indexes.</p>
                                            </div>
                                            <button className="px-4 py-2 bg-white border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold rounded-lg shadow-sm transition-all shrink-0">Run Now</button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">Clear Query Cache</h4>
                                                <p className="text-xs text-slate-500 mt-1">Frees up memory by clearing the SQL server query plan cache.</p>
                                            </div>
                                            <button className="px-4 py-2 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-500 text-slate-600 text-xs font-bold rounded-lg shadow-sm transition-all shrink-0">Clear</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Recent Backups</h3>
                                    <div className="flex flex-col gap-0 border border-slate-100 rounded-xl overflow-hidden">
                                        {[
                                            { date: 'Today, 02:30 AM', size: '142.5 MB', type: 'Automated' },
                                            { date: 'Yesterday, 02:30 AM', size: '141.2 MB', type: 'Automated' },
                                            { date: 'Oct 24, 15:45 PM', size: '140.8 MB', type: 'Manual' },
                                            { date: 'Oct 23, 02:30 AM', size: '139.5 MB', type: 'Automated' },
                                        ].map((b, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 bg-white hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                                        <CheckCircle size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800">{b.date}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{b.type} • {b.size}</p>
                                                    </div>
                                                </div>
                                                <button className="text-[#00acee] hover:text-[#009adb] text-xs font-bold px-3 py-1 bg-[#00acee]/10 rounded-lg shrink-0">Restore</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}`;

const analyticsRegex = /\{\/\* ANALYTICS VIEW \*\/\}\s*\{activeMenu === 'Analytics' && \(\s*<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center animate-in fade-in zoom-in-95 duration-200">[\s\S]*?<\/div>\s*\)\}/;

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
                                    <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">
                                        Export Report
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                                {[
                                    { title: 'Active Users', value: '1,245', change: '+12%', colorClass: 'border-t-emerald-500' },
                                    { title: 'API Requests', value: '45.2K', change: '+5.4%', colorClass: 'border-t-blue-500' },
                                    { title: 'System Uptime', value: '99.99%', change: 'Stable', colorClass: 'border-t-purple-500' },
                                    { title: 'Error Rate', value: '0.01%', change: '-0.05%', colorClass: 'border-t-orange-500' },
                                ].map((stat, i) => (
                                    <div key={i} className={\`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 \${stat.colorClass}\`}>
                                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.title}</h3>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                                            <span className={\`text-xs font-bold mb-1 \${stat.change.startsWith('+') || stat.change === 'Stable' ? 'text-emerald-500' : 'text-red-500'}\`}>{stat.change}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Traffic Overview (Last 7 Days)</h3>
                                    <div className="flex-1 flex items-end gap-2 h-48 mt-auto px-4 border-b border-slate-100 pb-2">
                                        {/* CSS Bar Chart */}
                                        {[45, 60, 35, 80, 50, 90, 75].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
                                                <div className="w-full bg-[#00acee]/20 rounded-t-md relative group-hover:bg-[#00acee] transition-colors" style={{ height: \`\${h}%\` }}>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-md">
                                                        {h}k
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Recent Audit Logs</h3>
                                    <div className="flex flex-col gap-4 flex-1">
                                        {[
                                            { action: 'Super Admin Login', user: 'Navoda', time: '2 mins ago', type: 'auth' },
                                            { action: 'Updated Role Permissions', user: 'LAKSHIKA', time: '15 mins ago', type: 'security' },
                                            { action: 'System Backup Complete', user: 'System', time: '1 hour ago', type: 'system' },
                                            { action: 'Created New Company', user: 'Admin', time: '3 hours ago', type: 'data' },
                                            { action: 'Failed Login Attempt', user: 'Unknown', time: '5 hours ago', type: 'alert' },
                                        ].map((log, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className={\`w-2 h-2 mt-1.5 rounded-full shrink-0 \${log.type === 'auth' ? 'bg-blue-500' : log.type === 'security' ? 'bg-purple-500' : log.type === 'system' ? 'bg-emerald-500' : log.type === 'alert' ? 'bg-red-500' : 'bg-orange-500'}\`} />
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{log.action}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{log.user} • {log.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-2 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-colors mt-auto">View All Logs</button>
                                </div>
                            </div>
                        </div>
                    )}`;

let replaced = false;

if (dbRegex.test(content)) {
    content = content.replace(dbRegex, newDbView);
    console.log("Replaced Database View.");
    replaced = true;
} else {
    console.log("Could not find Database View block to replace.");
}

if (analyticsRegex.test(content)) {
    content = content.replace(analyticsRegex, newAnalyticsView);
    console.log("Replaced Analytics View.");
    replaced = true;
} else {
    console.log("Could not find Analytics View block to replace.");
}

if (replaced) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated successfully.");
}
