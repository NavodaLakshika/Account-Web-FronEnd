import React, { useState, useEffect, useCallback } from 'react';
import {
    Globe, ExternalLink, RefreshCw, CheckCircle2, XCircle,
    Mail, MessageSquare, CreditCard, Key, Database, Wifi,
    AlertCircle, ChevronRight, Terminal
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
        if (locked) return { status: 'locked', color: 'text-slate-300', bg: 'bg-slate-50', border: 'border-slate-100', icon: XCircle, label: 'Disabled' };
        const cfg = getConfig(`${moduleId}_status`);
        if (!cfg || cfg.configValue === 'false') return { status: 'inactive', color: 'text-amber-400', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle, label: 'Not Configured' };
        return { status: 'active', color: 'text-emerald-400', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, label: 'Active' };
    };

    if (error) {
        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="bg-white shadow-sm border border-slate-200/60 p-8 flex flex-col items-center justify-center gap-4 text-center">
                    <AlertCircle className="w-12 h-12 text-red-300" />
                    <p className="text-[13px] text-slate-500 font-medium">{error}</p>
                    <button onClick={fetchData}
                        className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold rounded-[12px] transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-[#0078d4]/20">
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* API Documentation Card */}
            <div className="bg-white shadow-sm border border-slate-200/60">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0078d4]/10 flex items-center justify-center">
                        <Terminal className="w-4 h-4 text-[#0078d4]" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-bold text-slate-800">API Documentation</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Explore and test backend REST APIs</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0078d4]/10 flex items-center justify-center">
                                <Globe className="w-5 h-5 text-[#0078d4]" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-slate-800">Swagger UI</p>
                                <p className="text-[11px] text-slate-500 font-medium">REST API documentation with live testing</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchData}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-[12px] transition-all active:scale-95 flex items-center gap-2">
                                <RefreshCw size={14} /> Refresh
                            </button>
                            <button onClick={() => window.open('/swagger/index.html', '_blank')}
                                className="px-4 py-2 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold rounded-[12px] transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-[#0078d4]/20">
                                <ExternalLink size={14} /> Open Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration Status Cards */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-[15px] font-bold text-slate-800">Connected Services</h3>
                    {loading && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100">
                            <RefreshCw size={12} className="text-slate-400 animate-spin" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loading</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrationModules.map(mod => {
                        const st = integrationStatus(mod.id);
                        const Icon = mod.icon;
                        const StatusIcon = st.icon;
                        return (
                            <div key={mod.id} className={`bg-white shadow-sm border ${st.border} transition-all`}>
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 ${st.bg} flex items-center justify-center`}>
                                            <Icon className={`w-4 h-4 ${st.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-slate-800">{mod.label}</h4>
                                            <p className="text-[10px] text-slate-400 font-medium">{mod.desc}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${st.bg} ${st.color}`}>
                                        <StatusIcon size={12} /> {st.label}
                                    </span>
                                </div>
                                <div className="px-5 py-3 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        {st.status === 'active' ? 'Service is running' : st.status === 'locked' ? 'Access restricted by admin' : 'Configure in system settings'}
                                    </span>
                                    <ChevronRight size={16} className="text-slate-300" />
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
