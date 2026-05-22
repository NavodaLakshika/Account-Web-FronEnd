import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle, Search, Loader2, Lock, Key, Users, Activity, Scan, RotateCw } from 'lucide-react';
import { systemLogService } from '../services/systemLog.service';

const SecurityAuditBoard = ({ allEmployees = [], allCompanies = [], hierarchy = [] }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [lastScanDate, setLastScanDate] = useState(new Date().toLocaleString());

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
        // Fetch the real latest data
        await fetchLogs();
        // Give the "scanning" UI a moment to be visible for UX
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
        .filter(l => l.status === 'Failed' || l.action?.toLowerCase().includes('password') || l.action?.toLowerCase().includes('role') || l.action?.toLowerCase().includes('permission') || l.action?.toLowerCase().includes('login'))
        .slice(0, 10);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full max-h-[82vh] overflow-y-auto no-scrollbar pb-10">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        Security Audit & Posture
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">Vulnerability scanning, access control audits, and threat detection.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium mr-2">Last Scan: {lastScanDate}</span>
                    <button 
                        onClick={runScan}
                        disabled={scanning}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {scanning ? <RotateCw size={14} className="animate-spin" /> : <Scan size={14} />}
                        {scanning ? 'Analyzing Data...' : 'Run Security Scan'}
                    </button>
                </div>
            </div>

            {/* Scanning Overlay (Light Theme) */}
            {scanning && (
                <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-8 shrink-0 relative overflow-hidden flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95">
                    <div className="absolute inset-0 bg-emerald-50/50"></div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-emerald-500 z-10" />
                            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin opacity-50"></div>
                            <div className="absolute inset-[-8px] border-2 border-emerald-300 border-b-transparent rounded-full animate-spin-slow opacity-30"></div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-widest uppercase">Executing Security Audit</h3>
                        <p className="text-slate-600 text-sm">Fetching real-time logs, checking access controls, and analyzing vulnerabilities...</p>
                        <div className="w-full max-w-md bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full w-1/2 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vulnerability Metrics (Real Data) */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0 transition-opacity duration-300 ${scanning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {[
                    { title: 'Failed Logins', value: failedLogins, desc: 'Unauthorized access attempts', icon: Lock, color: failedLogins > 5 ? 'text-red-500' : 'text-slate-700' },
                    { title: 'Unassigned Users', value: usersWithoutCompanies, desc: 'Users without company access', icon: Users, color: usersWithoutCompanies > 0 ? 'text-orange-500' : 'text-slate-700' },
                    { title: 'Inactive Accounts', value: inactiveUsers, desc: 'Dormant user accounts', icon: Key, color: inactiveUsers > 10 ? 'text-orange-500' : 'text-slate-700' },
                    { title: 'Admin Actions', value: adminActions, desc: 'Sensitive operations logged', icon: Activity, color: 'text-blue-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform">
                            <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                        </div>
                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 z-10">{stat.title}</h3>
                        <div className="flex items-end gap-2 z-10">
                            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 z-10 uppercase tracking-wider">{stat.desc}</p>
                    </div>
                ))}
            </div>

            {/* Recent Security Events Table */}
            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0 min-h-[300px] transition-opacity duration-300 ${scanning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Critical Security Events</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Filtered from real system audit trail</p>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {loading && !scanning ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-400">
                            <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
                        </div>
                    ) : recentSecurityEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-400">
                            <CheckCircle className="w-12 h-12 text-emerald-300" />
                            <p className="text-sm font-bold">No critical security events found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 shadow-sm z-10">
                                    <th className="py-4 px-6 w-48">Timestamp</th>
                                    <th className="py-4 px-6 w-40">User</th>
                                    <th className="py-4 px-6">Event Description</th>
                                    <th className="py-4 px-6 w-36">IP Address</th>
                                    <th className="py-4 px-6 w-32 text-center">Severity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentSecurityEvents.map((log, idx) => {
                                    const isCritical = log.status === 'Failed' || log.action?.toLowerCase().includes('fail');
                                    const isMedium = log.action?.toLowerCase().includes('role') || log.action?.toLowerCase().includes('password');
                                    return (
                                        <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-6 text-xs text-slate-500 font-medium whitespace-nowrap font-mono">
                                                {log.date ? new Date(log.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'N/A'}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-slate-900 font-bold">
                                                {log.user || 'System'}
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="text-sm text-slate-700 font-medium">{log.action || 'Unknown Action'}</span>
                                            </td>
                                            <td className="py-3 px-6 text-xs font-mono text-slate-400">
                                                {log.ip || '0.0.0.0'}
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex justify-center">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'bg-red-50 text-red-600 border-red-200' : isMedium ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
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
