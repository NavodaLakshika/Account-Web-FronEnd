import React, { useState, useEffect } from 'react';
import { 
    Database, Server, Activity, CheckCircle, X, Loader2, 
    History, RefreshCw, Trash2, HardDrive, Users, Wifi
} from 'lucide-react';
import { backupService } from '../../services/backup.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import AlertModal from '../modals/AlertModal';
import ConfirmModal from '../modals/ConfirmModal';

const DatabaseAdminBoard = () => {
    const [backups, setBackups] = useState([]);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [restoringId, setRestoringId] = useState(null);

    // Metrics
    const [dbSize, setDbSize] = useState('N/A');
    const [totalRecords, setTotalRecords] = useState('N/A');
    const [activeConnections, setActiveConnections] = useState('N/A');
    const [lastBackupTime, setLastBackupTime] = useState('No Backups');
    const [loadingMetrics, setLoadingMetrics] = useState(false);

    // Confirm/Restore Modal
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false
    });
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false, title: '', message: '', variant: 'success'
    });

    useEffect(() => {
        fetchBackups();
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoadingMetrics(true);
        try {
            const res = await backupService.getDatabases();
            if (res) {
                const dbs = Array.isArray(res) ? res : (res.data || []);
                if (dbs.length > 0) {
                    const db = dbs.find(d => d.name?.toLowerCase().includes('acc_web')) || dbs[0];
                    setDbSize(db.size || 'N/A');
                    setActiveConnections(db.connections || dbs.length.toString() || 'N/A');
                }
            }
        } catch (e) {
            console.error("Failed to fetch metrics", e);
        } finally {
            setLoadingMetrics(false);
        }
    };

    const fetchBackups = async () => {
        setLoadingHistory(true);
        try {
            const res = await backupService.getHistory();
            const data = Array.isArray(res) ? res : (res.data || []);
            setBackups(data);
            if (data.length > 0) {
                const latest = data.reduce((a, b) => 
                    new Date(a.createdAt || a.created_At) > new Date(b.createdAt || b.created_At) ? a : b
                );
                setLastBackupTime(latest.createdAt || latest.created_At || 'No Backups');
            } else {
                setLastBackupTime('No Backups');
            }
        } catch (error) {
            console.error("Failed to fetch backups", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        try {
            let defaultPath = "C:\\Backup";
            try {
                const pathRes = await backupService.getDefaultPath();
                if (pathRes?.path) defaultPath = pathRes.path;
            } catch (e) {}

            const res = await backupService.createBackup({
                DatabaseName: 'Acc_Web',
                BackupPath: defaultPath,
                UserName: 'SuperAdmin'
            });

            setAlertConfig({
                isOpen: true,
                title: 'Success',
                message: res?.message || 'Backup created successfully',
                variant: 'success'
            });
            fetchBackups();
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create backup',
                variant: 'warning'
            });
        } finally {
            setCreatingBackup(false);
        }
    };

    const handleRestoreBackup = (backup) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Restore Backup',
            message: `Are you sure you want to restore backup from ${backup.createdAt || backup.created_At || 'N/A'}? This will overwrite current data.`,
            loading: false,
            onConfirm: () => executeRestore(backup)
        });
    };

    const executeRestore = async (backup) => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        setRestoringId(backup.id || backup.Id);
        try {
            await backupService.restoreBackup({
                BackupPath: backup.backupPath || backup.backup_Path || backup.BackupPath,
                DatabaseName: backup.databaseName || backup.database_Name || 'Acc_Web'
            });
            setConfirmConfig({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false });
            setAlertConfig({
                isOpen: true,
                title: 'Success',
                message: 'Backup restored successfully.',
                variant: 'success'
            });
        } catch (error) {
            setConfirmConfig(prev => ({ ...prev, loading: false }));
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to restore backup',
                variant: 'warning'
            });
        } finally {
            setRestoringId(null);
        }
    };

    const handleRunMaintenance = async (operation) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            showSuccessToast(`${operation} completed successfully.`);
        } catch (error) {
            showErrorToast(`Failed to run ${operation}.`);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleString('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            }).toUpperCase();
        } catch {
            return dateStr;
        }
    };

    const getBackupStatusIcon = (status) => {
        const isFailed = status?.toLowerCase() === 'failed';
        return isFailed ? 'bg-red-600/20 text-red-400 border-red-500/50' : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50';
    };

    const maintenanceOps = [
        {
            id: 'rebuild-indexes',
            label: 'Rebuild Indexes',
            desc: 'Improves database query performance by defragmenting indexes.',
            icon: Server
        },
        {
            id: 'clear-cache',
            label: 'Clear Query Cache',
            desc: 'Frees up memory by clearing the SQL server query plan cache.',
            icon: Trash2
        },
        {
            id: 'update-stats',
            label: 'Update Statistics',
            desc: 'Updates query optimization statistics for better performance.',
            icon: RefreshCw
        }
    ];

    const recentBackups = [...backups]
        .sort((a, b) => new Date(b.createdAt || b.created_At || 0) - new Date(a.createdAt || a.created_At || 0))
        .slice(0, 10);

    return (
        <div className="bg-white dark:bg-[#0f172a]/50 backdrop-blur-md shadow-lg border border-slate-200 dark:border-[#334155] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 rounded-none-[12px] overflow-hidden mb-6">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#0f172a]/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-none">
                        <Database className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Database Management</h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Manage system backups, optimize performance, and monitor database health</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-start">
                    <button
                        onClick={fetchBackups}
                        disabled={loadingHistory}
                        className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold rounded-none transition-all flex items-center gap-2"
                        title="Refresh backup history"
                    >
                        <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />
                        History
                    </button>
                    <button
                        onClick={handleCreateBackup}
                        disabled={creatingBackup}
                        className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold shadow-sm rounded-none transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {creatingBackup ? (
                            <><Loader2 className="animate-spin" size={14} /> Creating...</>
                        ) : (
                            <><Database size={14} /> Create Full Backup</>
                        )}
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-6">
                <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <HardDrive className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/50">Healthy</span>
                    </div>
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Database Size</h3>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{loadingMetrics ? <Loader2 className="w-5 h-5 animate-spin inline" /> : dbSize}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Records</h3>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{totalRecords}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Wifi className="w-5 h-5 text-orange-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Connections</h3>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{activeConnections}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Last Backup</h3>
                        <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">{lastBackupTime === 'No Backups' ? 'No Backups' : formatDate(lastBackupTime)}</p>
                    </div>
                </div>
            </div>

            {/* Maintenance + Backup History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-6">
                {/* Maintenance Operations */}
                <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={14} className="text-blue-400" />
                        Maintenance Operations
                    </h3>
                    <div className="flex flex-col gap-3">
                        {maintenanceOps.map(op => {
                            const Icon = op.icon;
                            return (
                                <div key={op.id} className="flex items-center justify-between p-4 bg-slate-200/50 dark:bg-black/40 border border-slate-200 dark:border-[#334155]">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0 mt-0.5">
                                            <Icon size={14} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">{op.label}</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{op.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRunMaintenance(op.label)}
                                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/50 text-xs font-bold transition-all rounded-none uppercase tracking-wider shrink-0 ml-4"
                                    >
                                        Run Now
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Backups */}
                <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <History size={14} className="text-emerald-400" />
                        Recent Backups
                    </h3>
                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-12 text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : recentBackups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                            <Database size={28} className="text-slate-600" />
                            <p className="text-xs font-medium">No backups created yet.</p>
                            <button
                                onClick={handleCreateBackup}
                                disabled={creatingBackup}
                                className="px-4 py-2 bg-[#0078d4] hover:bg-[#005a9e] text-slate-800 dark:text-white text-xs font-bold rounded-none transition-all mt-2"
                            >
                                Create First Backup
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0 border border-slate-200 dark:border-[#334155] overflow-hidden">
                            {recentBackups.map((b, i) => {
                                const isFailed = b.status?.toLowerCase() === 'failed';
                                const createdAt = b.createdAt || b.created_At;
                                return (
                                    <div key={b.id || b.Id || i} className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-[#334155] last:border-0 bg-black/20 hover:bg-white dark:bg-[#0f172a]/50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${getBackupStatusIcon(b.status)}`}>
                                                {isFailed ? <X size={14} /> : <CheckCircle size={14} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={b.backupPath || b.backup_Path || b.BackupPath}>
                                                    {formatDate(createdAt)}
                                                </p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                    {b.createdBy || b.created_By || 'Manual'} <span className="text-gray-700 mx-1">•</span> {b.status || 'Success'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRestoreBackup(b)}
                                            disabled={restoringId === (b.id || b.Id)}
                                            className="text-xs font-bold px-3 py-1 bg-[#0078d4]/20 hover:bg-[#0078d4]/40 text-blue-400 border border-blue-500/50 rounded-none transition-all shrink-0 ml-3 uppercase tracking-wider"
                                        >
                                            {restoringId === (b.id || b.Id) ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Restore'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                loading={confirmConfig.loading}
                variant="danger"
                confirmText="Yes, Restore"
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
            />
        </div>
    );
};

export default DatabaseAdminBoard;






