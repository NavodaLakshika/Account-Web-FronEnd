import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Activity } from 'lucide-react';

const DatabaseInstanceLookupModal = ({ isOpen, onClose, databases, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDatabases = databases.filter(db => 
        db.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="LOOKUP"
            maxWidth="max-w-[700px]"
        >
            <div className="space-y-4 font-['Tahoma'] select-none">
                {/* Search Bar Container */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0285fd] transition-colors" size={15} />
                        <input 
                            type="text" 
                            placeholder="Find..." 
                            autoFocus
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List Container with Table Style */}
                <div className="border border-gray-200 rounded-[3px] overflow-hidden bg-white shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                <tr>
                                    <th className=" px-5 py-3">Instance Name</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredDatabases.length > 0 ? (
                                    filteredDatabases.map((db, i) => (
                                        <tr 
                                            key={i} 
                                            onClick={() => {
                                                onSelect(db);
                                                onClose();
                                            }}
                                            className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50"
                                        >
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                                <span className="font-bold text-[13px] text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                    {db}
                                                </span>
                                            </td>
                                            <td className="text-right px-5 py-3">
                                                <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">
                                                    SELECT
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <Activity size={32} className="text-gray-400" />
                                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">No Matches Found</span>
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

export default DatabaseInstanceLookupModal;
