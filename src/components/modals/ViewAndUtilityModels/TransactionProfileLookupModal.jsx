import React, { useState, useMemo } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Database } from 'lucide-react';

const TransactionProfileLookupModal = ({ isOpen, onClose, onSelect, data, loading }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(item =>
            (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="TRANSACTION PROFILE LOOKUP"
            maxWidth="max-w-[700px]"
        >
            <div className="space-y-4 font-['Tahoma']">
                {/* Search Header - Matching PO Board Style */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Global Archive Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder="Filter by document id or creation date..."
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table - Matching PO Board Style */}
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className=" px-5 py-3">Reference ID</th>
                                    <th className=" px-5 py-3">Profile Description</th>
                                    <th className="text-right px-5 py-3">Interaction</th>
                                <th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-[#0285fd] border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[3px]">Syncing Archive...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((item, i) => (
                                        <tr
                                            key={i}
                                            className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50"
                                            onClick={() => onSelect(item)}
                                        >
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                                {item.code}
                                            </td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                                {item.name}
                                            </td>
                                            <td className="text-right px-5 py-3">
                                                <button 
                                                    className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelect(item);
                                                    }}
                                                >
                                                    SELECT
                                                </button>
                                            </td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Database size={40} strokeWidth={1} />
                                                <span>Archive is currently empty</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default TransactionProfileLookupModal;



