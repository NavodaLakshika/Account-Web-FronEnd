import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle, Search, Loader2, Lock, Key, Users, Activity, Scan, RotateCw } from 'lucide-react';
import { systemLogService } from '../services/systemLog.service';

const SecurityAuditBoard = ({ allEmployees = [], allCompanies = [], hierarchy = [] }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [lastScanDate, setLastScanDate] = useState(new Date().toLocaleString());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await systemLogService.getAllLogs();
            let formatted = (data || []).map(log => ({
                id: log.id || log.Id || log.logId || log.LogId,
                date: log.date || log.Date || log.createdAt || log.CreatedAt,
                action: log.action || log.Action || log.actionPerformed || log.ActionPerformed,
                user: log.user || log.User || log.userName || log.UserName,
                ip: log.ip || log.Ip || log.ipAddress || log.IpAddress,
                status: log.status || log.Status || 'Success'
            }));

            formatted.sort((a, b) => new Date(b.date) - new Date(a.date));
            setLogs(formatted);
        } catch (error) {
            console.error("Failed to fetch logs", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const runScan = async () => {
        setScanning(true);
        await fetchLogs();
        setTimeout(() => {
            setScanning(false);
            setLastScanDate(new Date().toLocaleString());
        }, 2000);
    };

    // Derived Security Metrics from Real Data
    const failedLogins = logs.filter(l => l.status === 'Failed' || (l.action && l.action.toLowerCase().includes('fail'))).length;
    const usersWithoutCompanies = hierarchy.filter(e => !e.companies || e.companies.length === 0).length;
    const inactiveUsers = allEmployees.filter(e => e.isActive === false || e.isActive === 'F').length;
    const adminActions = logs.filter(l => l.action && l.action.toLowerCase().includes('admin')).length;

    const recentSecurityEvents = logs
        .filter(l => {
            const q = searchQuery.toLowerCase();
            if (!q) return l.status === 'Failed' || l.action?.toLowerCase().includes('password') || l.action?.toLowerCase().includes('role') || l.action?.toLowerCase().includes('permission') || l.action?.toLowerCase().includes('login');
            return (l.user?.toLowerCase().includes(q) || l.action?.toLowerCase().includes(q) || l.ip?.toLowerCase().includes(q) || l.status?.toLowerCase().includes(q));
        })
        .slice(0, 10);

    const metrics = [
        { title: 'Failed Logins', value: failedLogins, desc: 'Unauthorized access attempts', icon: Lock, severity: failedLogins > 5 ? 'high' : failedLogins > 0 ? 'medium' : 'low' },
        { title: 'Unassigned Users', value: usersWithoutCompanies, desc: 'Users without company access', icon: Users, severity: usersWithoutCompanies > 0 ? 'medium' : 'low' },
        { title: 'Inactive Accounts', value: inactiveUsers, desc: 'Dormant user accounts', icon: Key, severity: inactiveUsers > 10 ? 'high' : inactiveUsers > 0 ? 'medium' : 'low' },
        { title: 'Admin Actions', value: adminActions, desc: 'Sensitive operations logged', icon: Activity, severity: 'info' },
    ];

    const severityColors = {
        high: { text: 'text-red-400', bg: 'bg-red-600/20', border: 'border-red-500/50', icon: 'text-red-400' },
        medium: { text: 'text-orange-400', bg: 'bg-orange-600/20', border: 'border-orange-500/50', icon: 'text-orange-400' },
        low: { text: 'text-emerald-400', bg: 'bg-emerald-600/20', border: 'border-emerald-500/50', icon: 'text-emerald-400' },
        info: { text: 'text-blue-400', bg: 'bg-blue-600/20', border: 'border-blue-500/50', icon: 'text-blue-400' },
    };

    return (
        <div className="bg-white dark:bg-[#0f172a]/50 backdrop-blur-md shadow-lg border border-slate-200 dark:border-[#334155] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 rounded-none-[12px] overflow-hidden mb-6">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100/50 dark:bg-purple-900/20 flex items-center justify-center rounded-[5px] border border-purple-200/50 dark:border-purple-800/50">
                        <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">Security Audit & Posture</h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Vulnerability scanning, access control audits, and threat detection</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Last Scan: {lastScanDate}</span>
                    <button
                        onClick={runScan}
                        disabled={scanning}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm rounded-none transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {scanning ? <RotateCw size={14} className="animate-spin" /> : <Scan size={14} />}
                        {scanning ? 'Analyzing Data...' : 'Run Security Scan'}
                    </button>
                </div>
            </div>

            {/* Scanning Overlay */}
            {scanning && (
                <div className="bg-white dark:bg-[#0f172a]/50 border border-emerald-500/30 mx-6 p-8 relative overflow-hidden flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95">
                    <div className="absolute inset-0 bg-emerald-900/10"></div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-emerald-400 z-10" />
                            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-none-full animate-spin opacity-50"></div>
                            <div className="absolute inset-[-8px] border-2 border-emerald-400 border-b-transparent rounded-none-full animate-spin opacity-30"></div>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-widest uppercase">Executing Security Audit</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fetching real-time logs, checking access controls, and analyzing vulnerabilities...</p>
                        <div className="w-full max-w-md bg-slate-200 dark:bg-white/10 h-2 mt-2 overflow-hidden rounded-none">
                            <div className="bg-emerald-500 h-full w-1/2 animate-pulse rounded-none"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vulnerability Metrics */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mx-6 transition-opacity duration-300 ${scanning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {metrics.map((stat, i) => {
                    const Icon = stat.icon;
                    // Define gradient based on index to match dashboard
                    const gradients = [
                        "from-red-500 to-rose-600 hover:shadow-red-500/30",
                        "from-amber-400 to-orange-500 hover:shadow-orange-500/30",
                        "from-slate-500 to-gray-600 hover:shadow-slate-500/30",
                        "from-[#0285fd] to-indigo-600 hover:shadow-blue-500/30"
                    ];
                    
                    return (
                        <div key={i} className={`bg-gradient-to-br ${gradients[i]} py-10 px-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-[3px] flex items-center gap-5 relative overflow-hidden group`}>
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform">
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="w-12 h-12 bg-white/15 rounded-[3px] flex items-center justify-center shrink-0 z-10">
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0 z-10">
                                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-0.5 truncate">{stat.title}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-white">{stat.value}</span>
                                </div>
                                <p className="text-[9px] font-bold text-white/60 mt-1 uppercase tracking-wider truncate">{stat.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Critical Security Events Table */}
            <div className={`border border-slate-200 dark:border-[#334155] overflow-hidden mx-6 bg-white dark:bg-[#0f172a]/50 rounded-none shadow-sm transition-opacity duration-300 ${scanning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">Critical Security Events</span>
                        <span className="text-[10px] text-slate-500 font-medium ml-2 uppercase tracking-widest">Filtered from real system audit trail</span>
                    </div>
                    <div className="relative w-56">
                        <Search className="absolute left-3 top-2 text-slate-500 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="Filter events..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1 border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0f172a]/50 text-slate-800 dark:text-white text-[11px] w-full outline-none focus:border-purple-500 focus:bg-slate-200 dark:bg-white/10 rounded-none transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    {loading && !scanning ? (
                        <div className="flex items-center justify-center py-16 text-slate-500">
                            <Loader2 className="animate-spin text-purple-400 w-8 h-8" />
                        </div>
                    ) : recentSecurityEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
                            <CheckCircle className="w-10 h-10 text-emerald-400/60" />
                            <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400">No critical security events found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafc] border-b border-gray-100">
                                    <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Timestamp</th>
                                    <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">User</th>
                                    <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Event Description</th>
                                    <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">IP Address</th>
                                    <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap text-right">Severity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentSecurityEvents.map((log, idx) => {
                                    const isCritical = log.status === 'Failed' || log.action?.toLowerCase().includes('fail');
                                    const isMedium = log.action?.toLowerCase().includes('role') || log.action?.toLowerCase().includes('password');
                                    
                                    // Custom colors mapping based on severity for the badge
                                    const sevColors = isCritical 
                                        ? { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
                                        : isMedium
                                            ? { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' }
                                            : { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };

                                    return (
                                        <tr key={log.id || idx} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all group">
                                            <td className="py-3.5 px-6">
                                                <span className="text-[13px] font-medium text-gray-700">
                                                    {log.date ? new Date(log.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <span className="text-[13px] font-bold text-slate-700 uppercase">{log.user || 'System'}</span>
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <span className="text-[12px] text-slate-500 font-semibold">{log.action || 'Unknown Action'}</span>
                                            </td>
                                            <td className="py-3.5 px-6">
                                                <span className="text-[12px] text-slate-500 font-mono">{log.ip || '0.0.0.0'}</span>
                                            </td>
                                            <td className="py-3.5 px-6 text-right">
                                                <div className="flex items-center justify-end">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-[3px] shadow-sm border ${sevColors.bg} ${sevColors.text} ${sevColors.border}`}>
                                                        {isCritical ? <XCircle className="w-3 h-3" /> : isMedium ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                                        {isCritical ? 'High' : isMedium ? 'Medium' : 'Low'}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityAuditBoard;






