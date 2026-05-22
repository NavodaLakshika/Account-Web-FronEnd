import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Download, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { systemLogService } from '../services/systemLog.service';

const SystemLogsBoard = () => {
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
            // Fallback mock data if API returns empty to demonstrate UI (since often local db is empty)
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

    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200 pb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="text-[#00acee]" size={20} />
                        System Audit Logs
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">Real-time monitoring of all system activities, security events, and user actions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8," 
                                + "Timestamp,User,Action,IP Address,Status\n"
                                + filteredLogs.map(e => `${e.date},${e.user},"${e.action}",${e.ip},${e.status}`).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "system_audit_logs.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="px-4 py-2.5 bg-white border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                    <button 
                        onClick={fetchLogs}
                        disabled={loading}
                        className="px-5 py-2.5 bg-[#00acee] hover:bg-[#009adb] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Refresh Logs
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden flex-1 max-h-[calc(100vh-220px)]">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 shrink-0">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search user, action, or IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-sm outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl outline-none focus:border-[#00acee] cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Success">Success</option>
                            <option value="Failed">Failed</option>
                            <option value="Warning">Warning</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-auto relative">
                    {loading ? (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-4 text-slate-400">
                            <Loader2 className="animate-spin text-[#00acee] w-8 h-8" />
                            <p className="text-sm font-bold tracking-wider uppercase">Loading Audit Logs...</p>
                        </div>
                    ) : null}
                    
                    {!loading && filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-slate-400">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2 border border-slate-100">
                                <FileText className="w-10 h-10 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold">No logs found matching your criteria.</p>
                            <button onClick={() => {setSearchTerm(''); setStatusFilter('All');}} className="text-[#00acee] hover:underline text-xs font-bold uppercase tracking-wider">Clear Filters</button>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 shadow-sm z-10">
                                    <th className="py-4 px-6 w-48">Timestamp</th>
                                    <th className="py-4 px-6 w-40">User</th>
                                    <th className="py-4 px-6">Action Performed</th>
                                    <th className="py-4 px-6 w-36">IP Address</th>
                                    <th className="py-4 px-6 w-32 text-center">Status</th>
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
                                        <td className="py-3 px-6 text-xs font-mono text-slate-400">
                                            {log.ip || '0.0.0.0'}
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex justify-center">
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(log.status)}`}>
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

export default SystemLogsBoard;
