import React, { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Network, Loader2, Activity, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { systemAnalysisService } from '../services/systemAnalysis.service';
import AlertModal from '../components/modals/AlertModal';

const SystemAnalysisBoard = () => {
    const [currentStats, setCurrentStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', variant: 'success' });

    const showAlert = (title, message, variant = 'success') => {
        setAlertConfig({ isOpen: true, title, message, variant });
    };

    const fetchAnalysisData = async () => {
        setLoading(true);
        try {
            const historyData = await systemAnalysisService.getHistory();
            if (historyData && historyData.length > 0) {
                setHistory(historyData);
                const current = await systemAnalysisService.getCurrentStatus();
                setCurrentStats(current);
            } else {
                setHistory([]);
                setCurrentStats(null);
            }
        } catch (error) {
            console.error("Failed to fetch system analysis", error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysisData();
    }, []);

    const handleInitDB = async () => {
        setIsInitializing(true);
        try {
            await systemAnalysisService.initTable();
            showAlert("Success", "Server diagnostics initialized successfully!", "success");
            await fetchAnalysisData();
        } catch (error) {
            showAlert("Error", "Failed to initialize diagnostics. Make sure API is running.", "danger");
        } finally {
            setIsInitializing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full gap-4 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading System Analysis...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500 dark:text-slate-400 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-blue-50 rounded-none-full flex items-center justify-center mb-2 shadow-inner">
                    <Server className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">System Analysis</h2>
                <p className="text-sm max-w-md text-center">Deep dive into hardware utilization, memory profiling, and server health.</p>
                <button 
                    onClick={handleInitDB}
                    disabled={isInitializing}
                    className="px-6 py-2.5 mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-none shadow-md transition-all disabled:opacity-70 flex items-center gap-2 active:scale-95"
                >
                    {isInitializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    {isInitializing ? 'INITIALIZING...' : 'RUN DIAGNOSTICS'}
                </button>
                <AlertModal isOpen={alertConfig.isOpen} onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} {...alertConfig} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full max-h-[82vh] pb-10">
            {/* Header */}
            <div className="bg-white rounded-none-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Server className="text-blue-500" size={20} />
                        System Analysis
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">Live hardware utilization, memory profiling, and server health monitoring.</p>
                </div>
                <button 
                    onClick={fetchAnalysisData}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-none transition-all active:scale-95 flex items-center gap-2 w-fit"
                >
                    <RefreshCw size={14} /> Refresh Stats
                </button>
            </div>

            {currentStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                    <div className="bg-white p-5 rounded-none-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-none-full ${currentStats.serverStatus === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {currentStats.serverStatus === 'Healthy' ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Server Status</p>
                            <h3 className={`text-xl font-bold ${currentStats.serverStatus === 'Healthy' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {currentStats.serverStatus}
                            </h3>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-none-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-none-full">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CPU Usage</p>
                            <h3 className="text-xl font-bold text-slate-800">{currentStats.cpuUsagePercentage}%</h3>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-none-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-none-full">
                            <HardDrive size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Memory (RAM)</p>
                            <h3 className="text-xl font-bold text-slate-800">
                                {(currentStats.memoryUsageMB / 1024).toFixed(1)} GB <span className="text-xs text-slate-500 dark:text-slate-400">/ 16 GB</span>
                            </h3>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-none-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-none-full">
                            <Network size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Connections</p>
                            <h3 className="text-xl font-bold text-slate-800">{currentStats.activeConnections}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[300px]">
                {/* CPU History Chart */}
                <div className="bg-white rounded-none-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">CPU Load (Last 24 Hours)</h3>
                    <div className="flex-1 flex items-end gap-1.5 mt-auto px-2 border-b border-slate-100 pb-2">
                        {history.map((snapshot, i) => {
                            const h = Math.max(snapshot.cpuUsagePercentage, 5);
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
                                    <div className={`w-full rounded-none-t-sm relative transition-colors ${h > 80 ? 'bg-red-200 group-hover:bg-red-500' : 'bg-blue-100 group-hover:bg-blue-500'}`} style={{ height: `${h}%` }}>
                                        <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                            {snapshot.cpuUsagePercentage}%
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate max-w-full">
                                        {new Date(snapshot.timestamp).getHours()}h
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Memory History Chart */}
                <div className="bg-white rounded-none-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Memory Usage (Last 24 Hours)</h3>
                    <div className="flex-1 flex items-end gap-1.5 mt-auto px-2 border-b border-slate-100 pb-2">
                        {history.map((snapshot, i) => {
                            const percent = (snapshot.memoryUsageMB / snapshot.totalMemoryMB) * 100;
                            const h = Math.max(percent, 5);
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
                                    <div className={`w-full rounded-none-t-sm relative transition-colors ${h > 80 ? 'bg-orange-200 group-hover:bg-orange-500' : 'bg-purple-100 group-hover:bg-purple-500'}`} style={{ height: `${h}%` }}>
                                        <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                            {(snapshot.memoryUsageMB / 1024).toFixed(1)}GB
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate max-w-full">
                                        {new Date(snapshot.timestamp).getHours()}h
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <AlertModal isOpen={alertConfig.isOpen} onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} {...alertConfig} />
        </div>
    );
};

export default SystemAnalysisBoard;






