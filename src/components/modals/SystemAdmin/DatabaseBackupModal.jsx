import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import {
    RotateCcw,
    Save,
    Search,
    Folder,
    History as HistoryIcon,
    Database,
    Loader2
} from 'lucide-react';
import { backupService } from '../../../services/backup.service';
import { getSessionData } from '../../../utils/session';
import DatabaseInstanceLookupModal from './DatabaseInstanceLookupModal';
import BackupHistoryModal from './BackupHistoryModal';
import BackupPathLookupModal from './BackupPathLookupModal';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const labelStyle = "text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block";
const inputStyle = "w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20";
const pickerStyle = "w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-blue-600 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer flex items-center";

const DatabaseBackupModal = ({ isOpen, onClose }) => {
    const [databases, setDatabases] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDbLookup, setShowDbLookup] = useState(false);
    const [showPathLookup, setShowPathLookup] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const [formData, setFormData] = useState({
        databaseName: '',
        backupPath: '',
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
                    if (defaultPathData?.path) {
                        setFormData(prev => ({ ...prev, backupPath: defaultPathData.path }));
                    }
                } catch (error) {
                    // silently fail
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        try {
            const data = await backupService.getHistory();
            setHistory(data);
        } catch (error) {
            // silently fail
        }
    };

    const handleCreateBackup = async () => {
        if (!formData.databaseName) return showErrorToast('Select target database.');
        setLoading(true);
        try {
            const resp = await backupService.createBackup({
                databaseName: formData.databaseName,
                backupPath: formData.backupPath,
                userName: formData.userName
            });
            showSuccessToast(resp.message);
            fetchHistory();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Backup failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(prev => ({ ...prev, databaseName: '' }));
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={() => !loading && onClose()}
                title="Backup Utility"
                maxWidth="max-w-[700px]"
                showHeaderClose={!loading}
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-white text-slate-500 border border-slate-200 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowHistoryModal(true)} disabled={loading} className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <HistoryIcon size={14} /> HISTORY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="relative space-y-4 font-['Tahoma'] select-none p-2">
                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 -m-1 bg-white/80 backdrop-blur-[2px] z-[60] flex flex-col items-center justify-center rounded-[3px] animate-in fade-in duration-300">
                            <Loader2 size={40} className="text-[#0285fd] animate-spin mb-3" />
                            <span className="text-[12px] font-black text-[#0285fd] uppercase tracking-[0.2em] animate-pulse">Creating backup...</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Please do not close this window</span>
                        </div>
                    )}

                    {/* Backup Parameters */}
                    <div className="border border-slate-200 rounded-[3px] p-4 bg-white shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Database size={14} className="text-[#0285fd]" />
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Backup Parameters</span>
                        </div>

                        <div>
                            <label className={labelStyle}>Target Database</label>
                            <div className="flex gap-1 h-8">
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.databaseName}
                                    onClick={() => setShowDbLookup(true)}
                                    placeholder="Click to Select..."
                                    className={`${pickerStyle} cursor-pointer`}
                                />
                                <button
                                    onClick={() => setShowDbLookup(true)}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Destination Path</label>
                            <div className="flex gap-1 h-8">
                                <input
                                    type="text"
                                    value={formData.backupPath}
                                    onChange={(e) => setFormData(prev => ({ ...prev, backupPath: e.target.value }))}
                                    className={inputStyle}
                                />
                                <button
                                    onClick={() => setShowPathLookup(true)}
                                    className="w-10 h-8 bg-white border border-slate-300 text-slate-500 flex items-center justify-center rounded-[3px] hover:bg-slate-50 transition-all active:scale-95 shrink-0"
                                >
                                    <Folder size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="pt-1">
                            <button
                                onClick={handleCreateBackup}
                                disabled={loading}
                                className="w-full h-10 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-[#2bb744]/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {loading ? 'CREATING...' : 'CREATE BACKUP'}
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
