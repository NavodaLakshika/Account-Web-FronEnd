import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, FileText } from 'lucide-react';

const BackupHistoryModal = ({ isOpen, onClose, history, onRetrieve }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = history.filter(log => 
        log.databaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(log.createdAt).toLocaleDateString().includes(searchQuery)
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Historical Document Directory"
            maxWidth="max-w-[450px]"
        >
            <div className="space-y-4 font-['Tahoma'] select-none">
                {/* Global Archive Search */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                    <div className="relative flex-grow group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0285fd] transition-colors" size={15} />
                        <input 
                            type="text" 
                            placeholder="Filter archives..." 
                            className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm transition-all" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* History Table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Database</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                                <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((log, i) => (
                                    <tr key={i} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-4 py-3 font-bold text-[12px] text-slate-600 uppercase tracking-tight">{log.databaseName}</td>
                                        <td className="px-4 py-3 text-center font-bold text-[11px] text-slate-400 font-mono">
                                            {new Date(log.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => onRetrieve(log)}
                                                className="h-7 px-4 bg-[#e49e1b] text-white text-[10px] font-black rounded-[4px] shadow-sm hover:bg-[#d49218] transition-all active:scale-95 uppercase"
                                            >
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-10">
                                            <FileText size={32} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Empty</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>
    );
};

export default BackupHistoryModal;
