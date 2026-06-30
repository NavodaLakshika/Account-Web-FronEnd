import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { X, Save, RotateCcw, Search, Database, Folder, HardDrive, ArrowLeft, ChevronRight, Plus, Loader2, FileText, History } from 'lucide-react';
import { backupService } from '../services/backup.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const DatabaseSearchModal = ({ isOpen, onClose, items, onSelect }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title="Database Instance Lookup">
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="text" placeholder="Search by database name..."
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={query} onChange={e => setQuery(e.target.value)} autoFocus />
                    </div>
                </div>
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Instance Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No matching records discovered</td></tr>
                                ) : filtered.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { onSelect(item); onClose(); }}>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const BackupBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [databases, setDatabases] = useState([]);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const [formData, setFormData] = useState({
        databaseName: '',
        backupPath: '',
        userName: ''
    });

    const [activeModal, setActiveModal] = useState(null);

    // Path browser state
    const [browsePath, setBrowsePath] = useState('');
    const [browseItems, setBrowseItems] = useState([]);
    const [browseLoading, setBrowseLoading] = useState(false);
    const [showBrowse, setShowBrowse] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [creatingFolder, setCreatingFolder] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const session = getSessionData();
            setFormData(prev => ({ ...prev, userName: session.userName }));
            setShowHistory(false);
            setShowBrowse(false);
            setShowNewFolder(false);

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
                } catch (error) {}
            };
            fetchData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const fetchBrowse = async (path) => {
        setBrowseLoading(true);
        try {
            const data = await backupService.browse(path);
            setBrowseItems(data);
            setBrowsePath(path);
        } catch (error) {
            showErrorToast('Failed to browse directory');
        } finally {
            setBrowseLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setCreatingFolder(true);
        try {
            const fullPath = browsePath
                ? browsePath.endsWith('\\') ? browsePath + newFolderName.trim() : browsePath + '\\' + newFolderName.trim()
                : newFolderName.trim();
            await backupService.createDirectory({ path: fullPath });
            showSuccessToast('Folder created successfully.');
            setNewFolderName('');
            setShowNewFolder(false);
            fetchBrowse(browsePath);
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Failed to create folder.');
        } finally {
            setCreatingFolder(false);
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
            const data = await backupService.getHistory();
            setHistory(data);
            onClose();
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
        <div className="relative overflow-hidden flex flex-col h-full bg-white border-l border-slate-100 transition-all duration-500 ease-out shrink-0 w-full md:w-[450px] lg:w-[450px]">
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-[60] flex flex-col items-center justify-center">
                    <Loader2 size={40} className="text-[#0285fd] animate-spin mb-3" />
                    <span className="text-[12px] font-black text-[#0285fd] uppercase tracking-[0.2em] animate-pulse">Creating backup...</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Please do not close this window</span>
                </div>
            )}

            {/* Header */}
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0285fd]/10 rounded-[3px] flex items-center justify-center">
                        <Database size={16} className="text-[#0285fd]" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-semibold text-slate-800 leading-tight">Backup Utility</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATABASE BACKUP</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-[3px] transition-colors"><X size={20} /></button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-5 font-['Tahoma'] space-y-4">
                {/* Backup Parameters */}
                <div className="bg-white border border-slate-200 rounded-[3px] p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <Database size={14} className="text-[#0285fd]" />
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Backup Parameters</span>
                    </div>

                    {/* Target Database */}
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Target Database</label>
                        <div className="relative">
                            <input type="text" readOnly
                                value={formData.databaseName}
                                placeholder="Click to select database..."
                                onClick={() => setActiveModal('database')}
                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                            <button onClick={() => setActiveModal('database')}
                                className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Destination Path */}
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Destination Path</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input type="text" value={formData.backupPath}
                                    onChange={(e) => setFormData(prev => ({ ...prev, backupPath: e.target.value }))}
                                    placeholder="Backup directory path..."
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10" />
                                <Folder size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <button onClick={() => { setShowBrowse(!showBrowse); if (!showBrowse) fetchBrowse(browsePath || ''); }}
                                className={`px-4 h-10 border font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${showBrowse ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                                <Folder size={14} /> {showBrowse ? 'CLOSE' : 'BROWSE'}
                            </button>
                        </div>
                    </div>

                    {/* Inline Directory Browser */}
                    {showBrowse && (
                        <div className="border border-slate-200 rounded-[3px] overflow-hidden bg-[#fafafa]">
                            {/* Current Path + New Folder */}
                            <div className="flex items-center gap-2 p-2.5 border-b border-slate-200 bg-white">
                                <Folder size={14} className="text-[#0285fd] shrink-0" />
                                <span className="text-[11px] font-mono font-bold text-slate-500 truncate flex-1">
                                    {browsePath || "ROOT / COMPUTER"}
                                </span>
                                <button onClick={() => { setShowNewFolder(!showNewFolder); setNewFolderName(''); }}
                                    className={`flex items-center gap-1 px-2.5 h-7 text-[10px] font-black uppercase tracking-widest rounded-[4px] transition-all border-none shrink-0 ${showNewFolder ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#e49e1b] hover:bg-[#d49218] text-white'}`}>
                                    {showNewFolder ? <X size={12} /> : <Plus size={12} />} {showNewFolder ? 'CANCEL' : 'NEW'}
                                </button>
                            </div>

                            {/* New Folder Input */}
                            {showNewFolder && (
                                <div className="flex items-center gap-1.5 p-2.5 border-b border-slate-200 bg-white">
                                    <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                        placeholder="Folder name..." autoFocus
                                        className="flex-1 h-8 border border-gray-300 px-2.5 text-[12px] font-bold text-slate-700 outline-none rounded-[3px] bg-white focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                    <button onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()}
                                        className="flex items-center gap-1 px-3 h-8 bg-[#0285fd] hover:bg-[#0073ff] text-white text-[10px] font-black uppercase tracking-widest rounded-[3px] transition-all border-none shadow-sm disabled:opacity-50">
                                        {creatingFolder ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} CREATE
                                    </button>
                                </div>
                            )}

                            {/* Directory List */}
                            <div className="max-h-[200px] overflow-y-auto no-scrollbar">
                                {browseLoading ? (
                                    <div className="py-10 flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="text-[#0285fd] animate-spin" size={20} />
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Scanning...</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <tbody className="divide-y divide-slate-100">
                                            {browseItems.map((item, i) => (
                                                <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-all"
                                                    onClick={() => item.isParent || item.isDrive || !item.isDrive ? fetchBrowse(item.path) : null}>
                                                    <td className="px-3 py-2">
                                                        <div className="flex items-center gap-2">
                                                            {item.isDrive ? <HardDrive size={14} className="text-slate-400" />
                                                                : item.isParent ? <ArrowLeft size={14} className="text-[#0285fd]" />
                                                                : <Folder size={14} className="text-slate-400" />}
                                                            <span className={`text-[11px] font-bold truncate ${item.isParent ? 'text-[#0285fd]' : 'text-slate-700 group-hover:text-[#0285fd]'}`}>
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-right w-12">
                                                        {!item.isParent && !item.isDrive && (
                                                            <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, backupPath: item.path })); setShowBrowse(false); }}
                                                                className="px-2.5 h-6 bg-[#e49e1b] text-white text-[9px] font-black uppercase tracking-widest rounded-[3px] shadow-sm hover:bg-[#d49218] transition-all opacity-0 group-hover:opacity-100 border-none">
                                                                SEL
                                                            </button>
                                                        )}
                                                        {(item.isParent || item.isDrive) && (
                                                            <ChevronRight size={12} className="text-slate-300 ml-auto" />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {browseItems.length === 0 && !browseLoading && (
                                                <tr><td colSpan="2" className="py-10 text-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Empty</span>
                                                </td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Create Backup Button */}
                    <div className="pt-1">
                        <button onClick={handleCreateBackup} disabled={loading}
                            className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 border-none disabled:opacity-50">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {loading ? 'CREATING...' : 'CREATE BACKUP'}
                        </button>
                    </div>
                </div>

                {/* Backup History */}
                <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden">
                    <button onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer">
                        <div className="flex items-center gap-2">
                            <History size={14} className="text-[#0285fd]" />
                            <span className="text-[13px] font-medium text-gray-700">Backup History</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400">{history.length} records</span>
                            <ChevronRight size={14} className={`text-gray-400 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                        </div>
                    </button>
                    {showHistory && (
                        <div className="border-t border-slate-200 max-h-[250px] overflow-y-auto no-scrollbar">
                            {history.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                        <tr><th className="px-4 py-2.5">Database</th><th className="px-4 py-2.5 text-center">Date</th><th className="px-4 py-2.5 text-right w-14"></th><th className="text-right px-5 py-3">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((log, i) => (
                                            <tr key={i} className="group hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-2.5 font-bold text-[12px] text-slate-600 uppercase">{log.databaseName}</td>
                                                <td className="px-4 py-2.5 text-center font-bold text-[11px] text-slate-400 font-mono">
                                                    {new Date(log.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <button onClick={() => { setFormData(prev => ({ ...prev, databaseName: log.databaseName })); setShowHistory(false); }}
                                                        className="px-2.5 h-6 bg-[#e49e1b] text-white text-[9px] font-black uppercase rounded-[3px] shadow-sm hover:bg-[#d49218] transition-all border-none">
                                                        LOAD
                                                    </button>
                                                </td>
                                            
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <FileText size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">No backup history found</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#fcfcfc] px-5 py-4 border-t border-gray-200 shrink-0">
                <div className="flex justify-between items-center gap-3">
                    <button onClick={handleClear} disabled={loading}
                        className="px-5 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                        <RotateCcw size={14} /> CLEAR
                    </button>
                    <button onClick={handleCreateBackup} disabled={loading}
                        className="px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} CREATE BACKUP
                    </button>
                </div>
            </div>

            <DatabaseSearchModal
                isOpen={activeModal === 'database'}
                onClose={() => setActiveModal(null)}
                items={databases}
                onSelect={(db) => setFormData(prev => ({ ...prev, databaseName: db }))}
            />
        </div>
    );
};

export default BackupBoard;
