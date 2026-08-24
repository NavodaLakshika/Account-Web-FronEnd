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
            maxWidth="max-w-[700px]"
        >
            <div className="space-y-4 font-['Tahoma'] select-none">
                {/* Global Archive Search */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                    <div className="relative flex-grow group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0285fd] transition-colors" size={15} />
                        <input 
                            type="text" 
                            placeholder="Filter archives..." 
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* History Table */}
                <div className="border border-gray-200 rounded-[3px] overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] border-b border-gray-200">
                            <tr>
                                <th className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-5 py-3">Database</th>
                                <th className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center px-5 py-3">Date</th>
                                <th className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-right px-5 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((log, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50/40 transition-all group cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{log.databaseName}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                            {new Date(log.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                                        </td>
                                        <td className="text-right px-5 py-3">
                                            <button 
                                                onClick={() => onRetrieve(log)}
                                                className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase"
                                            >
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
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
