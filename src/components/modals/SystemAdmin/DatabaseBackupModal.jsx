import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    RotateCcw, 
    X, 
    Save, 
    Search, 
    Folder,
    Activity,
    History as HistoryIcon
} from 'lucide-react';
import { backupService } from '../../../services/backup.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../../../utils/session';
import DatabaseInstanceLookupModal from './DatabaseInstanceLookupModal';
import BackupHistoryModal from './BackupHistoryModal';
import BackupPathLookupModal from './BackupPathLookupModal';

const DatabaseBackupModal = ({ isOpen, onClose }) => {
    const [databases, setDatabases] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDbLookup, setShowDbLookup] = useState(false);
    const [showPathLookup, setShowPathLookup] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState('SYSTEM READY');
    
    const [formData, setFormData] = useState({
        databaseName: '',
        backupPath: 'C:\\Backups\\Accounts',
        userName: ''
    });

    useEffect(() => {
        if (isOpen) {
            const session = getSessionData();
            setFormData(prev => ({ ...prev, userName: session.userName }));
            
            const fetchData = async () => {
                try {
                    const [dbList, backupHistory, defaultPathData] = await Promise.all([
                        backupService.getDatabases(),
                        backupService.getHistory(),
                        backupService.getDefaultPath()
                    ]);
                    setDatabases(dbList);
                    setHistory(backupHistory);
                    if (defaultPathData?.path && !formData.backupPath) {
                        setFormData(prev => ({ ...prev, backupPath: defaultPathData.path }));
                    }
                } catch (error) {
                    setStatusMessage('OFFLINE');
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const fetchDatabases = async () => {
        try {
            const data = await backupService.getDatabases();
            setDatabases(data);
        } catch (error) {
            console.error('Error fetching databases:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const data = await backupService.getHistory();
            setHistory(data);
        } catch (error) {
            // Silently fail
        }
    };

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[400px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[400px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const handleCreateBackup = async () => {
        if (!formData.databaseName) return showErrorToast('Select target database.');
        setLoading(true);
        setStatusMessage('PLEASE WAIT...');
        try {
            const resp = await backupService.createBackup({
                databaseName: formData.databaseName,
                backupPath: formData.backupPath,
                userName: formData.userName
            });
            showSuccessToast(resp.message);
            setStatusMessage('SUCCESSFUL');
            fetchHistory();
            setTimeout(() => setStatusMessage('READY'), 3000);
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Backup failed.');
            setStatusMessage('ERROR');
            setTimeout(() => setStatusMessage('READY'), 3000);
        } finally {
            setLoading(false);
        }
    };



    const handleClear = () => {
        setFormData(prev => ({ ...prev, databaseName: '' }));
        setStatusMessage('READY');
    };

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                    .dashed-box {
                        background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23d1d5db' stroke-width='1.5' stroke-dasharray='4%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #e2e8f0;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #cbd5e1;
                    }
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={() => !loading && onClose()}
                title="Backup Utility"
                maxWidth="max-w-[420px]"
                showHeaderClose={!loading}
                footer={
                    <div className="bg-slate-50 px-5 py-3 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl font-['Tahoma']">
                        <button
                            onClick={handleClear}
                            className="px-4 h-8 bg-[#00adff] text-white text-[12px] font-black rounded-[4px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none shadow-sm"
                        >
                            <RotateCcw size={12} /> CLEAR
                        </button>
                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="px-4 h-8 bg-white border-2 border-gray-200 text-gray-500 text-[12px] font-black rounded-[4px] hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                        >
                            <HistoryIcon size={12} /> HISTORY
                        </button>
                    </div>
                }
            >
                <div className="relative space-y-3 font-['Tahoma'] select-none">
                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 -m-1 bg-white/80 backdrop-blur-[2px] z-[60] flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
                            <div className="w-28 h-28">
                                <DotLottiePlayer 
                                    src="/lottiefile/Loading animation blue.lottie" 
                                    autoplay 
                                    loop 
                                />
                            </div>
                            <div className="flex flex-col items-center gap-1 -mt-4">
                                <span className="text-[12px] font-black text-[#00adff] uppercase tracking-[0.2em] animate-pulse">
                                    {statusMessage}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                    Please do not close this window
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Compact Settings */}
                    <div className="relative border border-gray-100 rounded-lg p-3 bg-white shadow-sm mt-1">
                        <span className="absolute -top-2 left-3 px-2 bg-white text-[10px] font-black text-gray-500 uppercase tracking-widest border-x border-white">Settings</span>
                        <div className="dashed-box w-full h-16 rounded flex items-center justify-center bg-gray-50/20">
                            <div className="flex flex-col items-center">
                                <h2 className={`text-2xl font-bold tracking-tight ${loading ? 'text-blue-600 animate-pulse' : 'text-slate-700'}`}>
                                    {statusMessage}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Compact Backup */}
                    <div className="relative border border-gray-100 rounded-lg p-4 bg-white shadow-sm space-y-3 pt-5">
                        <span className="absolute -top-2 left-3 px-2 bg-white text-[10px] font-black text-gray-500 uppercase tracking-widest border-x border-white">Backup</span>
                        
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Database:</label>
                            <div className="flex-1 flex gap-1 h-7 min-w-0">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.databaseName} 
                                    onClick={() => setShowDbLookup(true)}
                                    placeholder="Click to Select..."
                                    className="flex-1 min-w-0 h-full border border-gray-300 px-3 text-[11.5px] font-bold text-blue-600 bg-gray-50 rounded-[4px] outline-none shadow-sm cursor-pointer hover:bg-gray-100 transition-colors" 
                                />
                                <button 
                                    onClick={() => setShowDbLookup(true)}
                                    className="w-8 h-full bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                             <label className="text-[12px] font-bold text-gray-700 block">Copy To:</label>
                             <div className="flex gap-1 h-7">
                                <input 
                                    type="text" 
                                    value={formData.backupPath} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, backupPath: e.target.value }))}
                                    className="flex-1 min-w-0 h-full border border-gray-300 px-3 font-mono text-[11px] font-bold outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd] rounded-[4px]" 
                                />
                                <button 
                                    onClick={() => setShowPathLookup(true)}
                                    className="w-8 h-full bg-gray-100 text-gray-500 flex items-center justify-center rounded-[4px] border border-gray-300 hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    <Folder size={12} />
                                </button>
                             </div>
                        </div>

                        <div className="pt-1">
                            <button
                                onClick={handleCreateBackup}
                                disabled={loading}
                                className="w-full h-11 bg-white border-2 border-gray-100 rounded-lg text-[16px] font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 group"
                            >
                                <Save size={18} className="group-hover:scale-110 transition-transform" />
                                Create Backup
                            </button>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <DatabaseInstanceLookupModal 
                isOpen={showDbLookup}
                onClose={() => setShowDbLookup(false)}
                databases={databases}
                onSelect={(db) => setFormData(prev => ({ ...prev, databaseName: db }))}
            />

            <BackupPathLookupModal 
                isOpen={showPathLookup}
                onClose={() => setShowPathLookup(false)}
                onSelect={(path) => setFormData(prev => ({ ...prev, backupPath: path }))}
            />

            <BackupHistoryModal 
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                history={history}
                onRetrieve={(log) => {
                    setFormData(prev => ({ ...prev, databaseName: log.databaseName }));
                    setShowHistoryModal(false);
                }}
            />
        </>
    );
};

export default DatabaseBackupModal;

