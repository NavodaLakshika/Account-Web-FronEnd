import React, { useState, useMemo } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Database, FileText, ChevronRight, Hash, Calendar } from 'lucide-react';

const HistoricalDocumentDirectoryModal = ({ isOpen, onClose, onSelect, data, loading }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(item => 
            (item.docNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.date || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.reference || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="HISTORICAL DOCUMENT DIRECTORY"
            maxWidth="max-w-[800px]"
        >
            <div className="flex flex-col h-[600px] font-['Tahoma'] bg-white">
                {/* Global Archive Search */}
                <div className="p-6 bg-slate-50/50 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#0285fd]">
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-widest leading-none">Global Archive Search</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Filter by document id or creation date...</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by document id or creation date..."
                            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#0285fd] focus:ring-4 focus:ring-[#0285fd]/5 transition-all shadow-sm"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0285fd] transition-colors">
                            <Search size={18} />
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="px-8 py-3 bg-slate-100/50 flex items-center text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100">
                    <div className="w-48 px-2 flex items-center gap-2">
                        <Hash size={12} />
                        REFERENCE ID
                    </div>
                    <div className="flex-1 px-2 flex items-center gap-2">
                        <Calendar size={12} />
                        LEDGER POSTING DATE
                    </div>
                    <div className="w-32 text-right px-4">INTERACTION</div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                    <div className="space-y-1">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                <div className="w-8 h-8 border-4 border-[#0285fd] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[12px] font-black uppercase tracking-[3px]">Synchronizing Archive...</p>
                            </div>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => onSelect(item)}
                                    className="flex items-center px-6 py-4 rounded-xl hover:bg-[#0285fd]/5 transition-all cursor-pointer group border border-transparent hover:border-[#0285fd]/10"
                                >
                                    <div className="w-48 px-2 text-[13px] font-black text-[#0285fd] tracking-tight uppercase font-mono">
                                        {item.docNo}
                                    </div>
                                    <div className="flex-1 px-2 text-[13px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors font-mono">
                                        {item.date?.split('T')[0]}
                                    </div>
                                    <div className="w-32 flex justify-end px-2">
                                        <button 
                                            className="bg-[#e49e1b] text-white text-[10px] px-6 py-2.5 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-widest"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(item);
                                            }}
                                        >
                                            SELECT
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                <FileText size={48} strokeWidth={1} className="mb-4" />
                                <p className="text-[12px] font-black uppercase tracking-[3px]">Archive is currently empty</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default HistoricalDocumentDirectoryModal;
