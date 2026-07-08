import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Download, Filter, CheckCircle, XCircle, AlertCircle, Activity, ChevronDown } from 'lucide-react';
import { systemLogService } from '../services/systemLog.service';

const SystemAnalyticsBoard = ({ allEmployees = [], allCompanies = [], hierarchy = [], pendingResets = [] }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

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

            // Sort by date descending
            formatted.sort((a, b) => new Date(b.date) - new Date(a.date));
            setLogs(formatted);
        } catch (error) {
            console.error("Failed to fetch logs", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.user?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.ip?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || log.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('success')) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (s.includes('fail') || s.includes('error')) return <XCircle className="w-4 h-4 text-red-500" />;
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    };

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('success')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (s.includes('fail') || s.includes('error')) return 'bg-red-50 text-red-600 border-red-200';
        return 'bg-orange-50 text-orange-600 border-orange-200';
    };

    const getTypeColor = (action) => {
        const a = action?.toLowerCase() || '';
        if (a.includes('login') || a.includes('auth')) return 'bg-blue-500';
        if (a.includes('fail') || a.includes('error')) return 'bg-red-500';
        if (a.includes('create') || a.includes('add')) return 'bg-emerald-500';
        if (a.includes('delete') || a.includes('remove')) return 'bg-orange-500';
        return 'bg-purple-500';
    };

    // Calculate Analytics Data
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

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return { date: d, count: 0, label: d.toLocaleDateString('en-US', { weekday: 'short' }) };
    });

    logs.forEach(log => {
        if (log.date) {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            const dayMatch = last7Days.find(d => d.date.getTime() === logDate.getTime());
            if (dayMatch) dayMatch.count++;
        }
    });
    const maxTraffic = Math.max(...last7Days.map(d => d.count), 1);
    const recentLogs = logs.slice(0, 5);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full max-h-[82vh] overflow-y-auto no-scrollbar pb-10">
            {/* Header */}
            <div className="bg-white rounded-none-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="text-emerald-500" size={20} />
                        System Analytics & Logs
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">Real-time system usage, user activity, and performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/report/system-analytics')}
                        className="px-4 py-2.5 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-500 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-none shadow-sm transition-all flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export Report
                    </button>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-none shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Stat Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                {[
                    { title: 'Total Employees', value: activeUsers.toString(), change: '+Active', colorClass: 'border-t-emerald-500', textClass: 'text-emerald-500' },
                    { title: 'Total Companies', value: totalCompanies.toString(), change: 'Growing', colorClass: 'border-t-blue-500', textClass: 'text-blue-500' },
                    { title: 'Total Transactions', value: totalTransactions.toString(), change: 'Volume', colorClass: 'border-t-purple-500', textClass: 'text-purple-500' },
                    { title: 'Pending Resets', value: pendingActions.toString(), change: pendingActions > 0 ? 'Needs Action' : 'Clear', colorClass: pendingActions > 0 ? 'border-t-red-500' : 'border-t-orange-500', textClass: pendingActions > 0 ? 'text-red-500' : 'text-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-5 rounded-none-2xl border border-slate-200 shadow-sm border-t-4 ${stat.colorClass}`}>
                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.title}</h3>
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            <span className={`text-xs font-bold mb-1 ${stat.textClass}`}>{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                <div className="lg:col-span-2 bg-white rounded-none-2xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[300px]">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Traffic Overview (Last 7 Days)</h3>
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex-1 flex items-end gap-2 h-48 mt-auto px-4 border-b border-slate-100 pb-2">
                                {last7Days.map((day, i) => {
                                    const h = day.count > 0 ? Math.max((day.count / maxTraffic) * 100, 5) : 0;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
                                            <div className="w-full bg-emerald-100 rounded-none-t-md relative group-hover:bg-emerald-500 transition-colors" style={{ height: `${h}%` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-none opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-md whitespace-nowrap">
                                                    {day.count} events
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                {day.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                </div>

                <div className="bg-white rounded-none-2xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[300px]">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Recent Audit Logs</h3>
                    <div className="flex flex-col gap-4 flex-1 overflow-auto">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                            </div>
                        ) : recentLogs.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic mt-4 text-center">No recent activity found.</p>
                        ) : (
                            recentLogs.map((log, i) => {
                                const timeStr = log.date ? new Date(log.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown time';
                                return (
                                    <div key={i} className="flex gap-3">
                                        <div className={`w-2 h-2 mt-1.5 rounded-none-full shrink-0 ${getTypeColor(log.action)}`} />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 line-clamp-1">{log.action || 'Unknown Action'}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{log.user || 'System'} • {timeStr}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Full Logs Table */}
            <div className="bg-white rounded-none-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0 min-h-[400px]">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest hidden md:block ml-2">Full Audit Trail</h3>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-none text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto max-h-[500px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500 dark:text-slate-400">
                            <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500 dark:text-slate-400">
                            <FileText className="w-12 h-12 text-slate-600 dark:text-slate-300" />
                            <p className="text-sm font-bold">No logs found matching your criteria.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 shadow-sm z-10">
                                    <th className="py-4 px-6 w-56">Timestamp</th>
                                    <th className="py-4 px-6 w-56">User</th>
                                    <th className="py-4 px-6 ">Action Performed</th>
                                    <th className="py-4 px-6 w-60">IP Address</th>
                                    <th className="py-4 px-6 w-36">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map((log, idx) => (
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
                                        <td className="py-3 px-6 text-xs font-mono text-slate-500 dark:text-slate-400">
                                            {log.ip || '0.0.0.0'}
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex justify-center">
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-none border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(log.status)}`}>
                                                    {getStatusIcon(log.status)}
                                                    {log.status || 'Success'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemAnalyticsBoard;






