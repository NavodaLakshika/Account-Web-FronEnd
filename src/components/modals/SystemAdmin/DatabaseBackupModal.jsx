import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    RotateCcw, 
    X, 
    Save, 
    Search, 
    Folder,
    Activity,
    History as HistoryIcon,
    Database
} from 'lucide-react';
import { backupService } from '../../../services/backup.service';

import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../../../utils/session';
import DatabaseInstanceLookupModal from './DatabaseInstanceLookupModal';
import BackupHistoryModal from './BackupHistoryModal';
import BackupPathLookupModal from './BackupPathLookupModal';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';


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
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={() => !loading && onClose()}
                title="Backup Utility"
                maxWidth="max-w-[500px]"
                showHeaderClose={!loading}
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowHistoryModal(true)} disabled={loading} className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2">
                                <HistoryIcon size={14} /> HISTORY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="relative space-y-4 font-['Tahoma'] select-none p-2">
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
                    <div className="relative border border-slate-200 rounded-[5px] p-4 bg-slate-50/50 shadow-sm mt-1 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <Activity size={80} />
                        </div>
                        <div className="flex flex-col items-center justify-center py-2 relative z-10">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status Indicator</span>
                            <h2 className={`text-2xl font-black tracking-widest uppercase ${loading ? 'text-[#0285fd] animate-pulse' : 'text-slate-700'}`}>
                                {statusMessage}
                            </h2>
                        </div>
                    </div>

                    {/* Compact Backup */}
                    <div className="relative border border-slate-200 rounded-[5px] p-4 bg-white shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                            <Database size={14} className="text-[#0285fd]" />
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Backup Parameters</span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase">Target Database</label>
                            <div className="flex gap-1 h-8 min-w-0">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.databaseName} 
                                    onClick={() => setShowDbLookup(true)}
                                    placeholder="Click to Select..."
                                    className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                />
                                <button 
                                    onClick={() => setShowDbLookup(true)}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                             <label className="text-[11px] font-bold text-gray-500 uppercase">Destination Path</label>
                             <div className="flex gap-1 h-8 min-w-0">
                                <input 
                                    type="text" 
                                    value={formData.backupPath} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, backupPath: e.target.value }))}
                                    className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold outline-none bg-white text-slate-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 rounded-[5px]" 
                                />
                                <button 
                                    onClick={() => setShowPathLookup(true)}
                                    className="w-10 h-8 bg-white border border-slate-300 text-slate-500 flex items-center justify-center rounded-[5px] hover:bg-slate-50 transition-all active:scale-95 shrink-0"
                                >
                                    <Folder size={16} />
                                </button>
                             </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleCreateBackup}
                                disabled={loading}
                                className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <Save size={16} /> Create Backup
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

