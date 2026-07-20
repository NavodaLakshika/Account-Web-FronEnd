import React, { useState, useEffect, useCallback } from 'react';
import {
    Globe, ExternalLink, RefreshCw, CheckCircle2, XCircle,
    Mail, MessageSquare, CreditCard, Key, Database, Wifi,
    AlertCircle, ChevronRight, Terminal, Puzzle
} from 'lucide-react';
import api from '../services/api';

const integrationModules = [
    { id: 'sys_api', label: 'API Integrations', icon: Key, desc: 'Third-party API connections and webhooks' },
    { id: 'sys_email', label: 'Email Settings', icon: Mail, desc: 'SMTP server configuration for emails' },
    { id: 'sys_sms', label: 'SMS Gateway', icon: MessageSquare, desc: 'SMS gateway provider connection' },
    { id: 'sys_payment', label: 'Payment Gateway', icon: CreditCard, desc: 'Payment processor integration' },
];

const IntegrationsBoard = () => {
    const [configs, setConfigs] = useState([]);
    const [locks, setLocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [configRes, locksRes] = await Promise.all([
                api.get('/AdminConfig', { params: { entityType: 'SYSTEM', entityCode: 'ALL' } }),
                api.get('/SystemLocks/getAll'),
            ]);
            setConfigs(Array.isArray(configRes.data) ? configRes.data : []);
            setLocks(Array.isArray(locksRes.data) ? locksRes.data : []);
        } catch (err) {
            setError('Failed to load integration data from backend');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const isLocked = (moduleId) => {
        const lock = locks.find(l => l.moduleId === moduleId || l.Module_Id === moduleId);
        return lock ? (lock.isLocked ?? lock.Is_Locked ?? false) : false;
    };

    const getConfig = (key) => configs.find(c => c.configKey === key || c.Config_Key === key);

    const integrationStatus = (moduleId) => {
        const locked = isLocked(moduleId);
        if (locked) return {
            status: 'locked',
            color: 'text-slate-500 dark:text-slate-400',
            bg: 'bg-white dark:bg-[#0f172a]/50',
            border: 'border-slate-200 dark:border-[#334155]',
            icon: XCircle,
            label: 'Disabled'
        };
        const cfg = getConfig(`${moduleId}_status`);
        if (!cfg || cfg.configValue === 'false') return {
            status: 'inactive',
            color: 'text-amber-400',
            bg: 'bg-amber-600/20',
            border: 'border-amber-500/50',
            icon: AlertCircle,
            label: 'Not Configured'
        };
        return {
            status: 'active',
            color: 'text-emerald-400',
            bg: 'bg-emerald-600/20',
            border: 'border-emerald-500/50',
            icon: CheckCircle2,
            label: 'Active'
        };
    };

    return (
        <div className="bg-white dark:bg-[#0f172a]/50 backdrop-blur-md shadow-lg border border-slate-200 dark:border-[#334155] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 rounded-none-[12px] overflow-hidden mb-6">
            {/* Header */}
            <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/20 flex items-center justify-center rounded-none">
                        <Puzzle className="w-4 h-4 text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Integrations</h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Connect external services and APIs</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-start">
                    <button onClick={fetchData} disabled={loading}
                        className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold rounded-none transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mx-6 bg-red-600/10 border border-red-500/50 p-6 flex flex-col items-center justify-center gap-4 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 font-medium">{error}</p>
                    <button onClick={fetchData}
                        className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold rounded-none transition-all flex items-center gap-2 shadow-sm">
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            )}

            {/* API Documentation Card */}
            <div className="border border-slate-200 dark:border-[#334155] mx-6 bg-white dark:bg-[#0f172a]/50 rounded-none shadow-sm">
                <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-none">
                        <Terminal className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">API Documentation</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Explore and test backend REST APIs</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-slate-200/50 dark:bg-black/40 border border-slate-200 dark:border-[#334155]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Globe className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-slate-800 dark:text-white">Swagger UI</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">REST API documentation with live testing</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => window.open('/swagger/index.html', '_blank')}
                                className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold rounded-none transition-all flex items-center gap-2 shadow-sm"
                            >
                                <ExternalLink size={14} /> Open Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration Status Cards */}
            <div className="mx-6">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Connected Services</h3>
                    {loading && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155]">
                            <RefreshCw size={12} className="text-slate-500 dark:text-slate-400 animate-spin" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loading</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrationModules.map(mod => {
                        const st = integrationStatus(mod.id);
                        const Icon = mod.icon;
                        const StatusIcon = st.icon;
                        return (
                            <div key={mod.id} className={`bg-white dark:bg-[#0f172a]/50 border ${st.border} transition-all hover:bg-white/[0.07]`}>
                                <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 ${st.bg} flex items-center justify-center`}>
                                            <Icon className={`w-4 h-4 ${st.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-slate-800 dark:text-white">{mod.label}</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{mod.desc}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border ${st.bg} ${st.color} ${st.border}`}>
                                        <StatusIcon size={10} /> {st.label}
                                    </span>
                                </div>
                                <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        {st.status === 'active' ? 'Service is running' : st.status === 'locked' ? 'Access restricted by admin' : 'Configure in system settings'}
                                    </span>
                                    <ChevronRight size={16} className="text-slate-600" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsBoard;






