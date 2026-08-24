import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Folder, ChevronRight, HardDrive, ArrowLeft, CheckCircle2, Loader2, Plus, X } from 'lucide-react';
import { backupService } from '../../../services/backup.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const inputStyle = "w-full h-9 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20";
const iconBtnStyle = "w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0";

const BackupPathLookupModal = ({ isOpen, onClose, onSelect }) => {
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDirectories(currentPath);
            setShowNewFolder(false);
            setNewFolderName('');
        }
    }, [isOpen, currentPath]);

    const fetchDirectories = async (path) => {
        setLoading(true);
        try {
            const data = await backupService.browse(path);
            setItems(data);
        } catch (error) {
            console.error("Browse error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path) => {
        setCurrentPath(path);
        setShowNewFolder(false);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setCreatingFolder(true);
        try {
            const fullPath = currentPath
                ? currentPath.endsWith('\\') ? currentPath + newFolderName.trim() : currentPath + '\\' + newFolderName.trim()
                : newFolderName.trim();
            await backupService.createDirectory({ path: fullPath });
            showSuccessToast('Folder created successfully.');
            setNewFolderName('');
            setShowNewFolder(false);
            fetchDirectories(currentPath);
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Failed to create folder.');
        } finally {
            setCreatingFolder(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="PATH LOOKUP"
            maxWidth="max-w-[700px]"
        >
            <div className="space-y-3 font-['Tahoma'] select-none">
                {/* Current Path + SELECT */}
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-[3px] border border-slate-200">
                    <Folder size={14} className="text-[#0285fd] shrink-0" />
                    <span className="text-[11px] font-mono font-bold text-slate-500 truncate flex-1">
                        {currentPath || "ROOT / COMPUTER"}
                    </span>
                    {currentPath && (
                        <button
                            onClick={() => { onSelect(currentPath); onClose(); }}
                            className="flex items-center gap-1.5 px-3 h-7 bg-[#0285fd] text-white text-[10px] font-black uppercase tracking-widest rounded-[4px] hover:bg-[#0073ff] transition-all shadow-sm shrink-0"
                        >
                            <CheckCircle2 size={12} /> SELECT
                        </button>
                    )}
                </div>

                {/* New Folder */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setShowNewFolder(!showNewFolder); setNewFolderName(''); }}
                        className={`flex items-center gap-1.5 px-3 h-8 text-[10px] font-black uppercase tracking-widest rounded-[3px] transition-all shadow-sm shrink-0 border-none ${showNewFolder ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#e49e1b] hover:bg-[#d49218] text-white'}`}
                    >
                        {showNewFolder ? <X size={13} /> : <Plus size={13} />} {showNewFolder ? 'CANCEL' : 'NEW FOLDER'}
                    </button>
                    {showNewFolder && (
                        <div className="flex items-center gap-1.5 flex-1">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                placeholder="Folder name..."
                                className="flex-1 h-8 border border-slate-200 px-2.5 text-[12px] font-bold text-slate-700 outline-none rounded-[3px] bg-white focus:border-[#e49e1b] focus:ring-2 focus:ring-[#e49e1b]/20 transition-all"
                                autoFocus
                            />
                            <button
                                onClick={handleCreateFolder}
                                disabled={creatingFolder || !newFolderName.trim()}
                                className="flex items-center gap-1 px-3 h-8 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 text-[10px] font-black uppercase tracking-widest rounded-[3px] hover:bg-[#259b3a] transition-all shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingFolder ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} CREATE
                            </button>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0285fd] transition-colors" size={15} />
                    <input
                        type="text"
                        placeholder="Search in current directory..."
                        className={`${inputStyle} pl-10`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Directory List */}
                <div className="border border-slate-200 rounded-[3px] overflow-hidden bg-white shadow-sm">
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar min-h-[250px]">
                        {loading ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="text-[#0285fd] animate-spin" size={24} />
                                <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Scanning Drive...</span>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Name</th>
                                        <th className="text-right w-20 px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map((item, i) => (
                                        <tr
                                            key={i}
                                            className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50"
                                            onClick={() => item.isParent || item.isDrive || !item.isDrive ? handleNavigate(item.path) : null}
                                        >
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    {item.isDrive ? (
                                                        <HardDrive size={15} className="text-slate-400 group-hover:text-[#0285fd] transition-colors shrink-0" />
                                                    ) : item.isParent ? (
                                                        <ArrowLeft size={15} className="text-slate-400 group-hover:text-[#0285fd] transition-colors shrink-0" />
                                                    ) : (
                                                        <Folder size={15} className="text-slate-400 group-hover:text-[#0285fd] transition-colors shrink-0" />
                                                    )}
                                                    <span className={`text-[12px] font-bold transition-colors truncate ${item.isParent ? 'text-[#0285fd]' : 'text-slate-700 group-hover:text-[#0285fd]'}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right px-5 py-3">
                                                {!item.isParent && !item.isDrive && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onSelect(item.path); onClose(); }}
                                                        className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase"
                                                    >
                                                        SELECT
                                                    </button>
                                                )}
                                                {(item.isParent || item.isDrive) && (
                                                    <ChevronRight size={14} className="text-slate-300 ml-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                                <div className="flex flex-col items-center gap-2 opacity-40">
                                                    <Folder size={32} className="text-gray-400" />
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Empty or Access Denied</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-[3px] border border-blue-100/50 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0285fd] mt-1 shrink-0" />
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide leading-relaxed">
                        Click <span className="font-black text-blue-700 underline underline-offset-2">SELECT</span> at the top to use the current directory, or choose a folder from the list.
                    </p>
                </div>
            </div>
        </SimpleModal>
    );
};

export default BackupPathLookupModal;
