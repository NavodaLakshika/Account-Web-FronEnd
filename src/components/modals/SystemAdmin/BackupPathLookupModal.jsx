import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Folder, ChevronRight, HardDrive, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { backupService } from '../../../services/backup.service';

const BackupPathLookupModal = ({ isOpen, onClose, onSelect }) => {
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchDirectories(currentPath);
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
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="PATH LOOKUP"
            maxWidth="max-w-[500px]"
        >
            <div className="space-y-4 font-['Tahoma'] select-none">
                {/* Current Path Indicator */}
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-gray-100 overflow-hidden">
                    <Folder size={14} className="text-blue-500 shrink-0" />
                    <span className="text-[11px] font-mono font-bold text-slate-500 truncate">
                        {currentPath || "ROOT / COMPUTER"}
                    </span>
                    {currentPath && (
                        <button 
                            onClick={() => {
                                onSelect(currentPath);
                                onClose();
                            }}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-[4px] hover:bg-blue-700 transition-all shadow-sm shrink-0"
                        >
                            <CheckCircle2 size={12} /> SELECT
                        </button>
                    )}
                </div>

                {/* Search Facility */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0285fd] transition-colors" size={15} />
                    <input 
                        type="text" 
                        placeholder="Search in current directory..." 
                        className="w-full h-9 pl-10 pr-4 border border-gray-200 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm transition-all" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Directory List Container */}
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar min-h-[250px]">
                        {loading ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="text-blue-500 animate-spin" size={24} />
                                <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Scanning Drive...</span>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                                    <tr>
                                        <th className="px-5 py-2.5">Directory Name</th>
                                        <th className="px-5 py-2.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredItems.map((item, i) => (
                                        <tr 
                                            key={i} 
                                            className="group hover:bg-blue-50/50 cursor-pointer transition-all"
                                            onClick={() => item.isParent || item.isDrive || !item.isDrive ? handleNavigate(item.path) : null}
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    {item.isDrive ? (
                                                        <HardDrive size={15} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                    ) : item.isParent ? (
                                                        <ArrowLeft size={15} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                    ) : (
                                                        <Folder size={15} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                    )}
                                                    <span className={`text-[12px] font-bold transition-colors ${item.isParent ? 'text-blue-400' : 'text-slate-700 group-hover:text-blue-700'}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {!item.isParent && !item.isDrive && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSelect(item.path);
                                                            onClose();
                                                        }}
                                                        className="px-3 py-1.5 bg-[#e49e1b] text-white text-[10px] font-black rounded-[4px] shadow-sm hover:bg-[#d49218] transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        SELECT
                                                    </button>
                                                )}
                                                {(item.isParent || item.isDrive) && (
                                                    <ChevronRight size={14} className="text-gray-200 ml-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="2" className="py-20 text-center opacity-30 flex flex-col items-center gap-2">
                                                <Folder size={32} className="text-gray-400" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Empty or Access Denied</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <p className="text-[10.5px] font-bold text-blue-600 uppercase tracking-wide leading-relaxed">
                        Navigate through drives and folders. Click <span className="font-black text-blue-700 underline underline-offset-2">SELECT</span> at the top to use the current directory, or choose a folder from the list.
                    </p>
                </div>
            </div>
        </SimpleModal>
    );
};

export default BackupPathLookupModal;
