import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Check, ListChecks } from 'lucide-react';

const TransactionTypeLookupModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const transactionTypes = [
        { code: 'PUR', name: 'Purchase Order', category: 'Inventory' },
        { code: 'GRN', name: 'Good Receive Note', category: 'Inventory' },
        { code: 'SIN', name: 'Sales Invoice', category: 'Sales' },
        { code: 'SRN', name: 'Sales Return Note', category: 'Sales' },
        { code: 'PV', name: 'Payment Voucher', category: 'Finance' },
        { code: 'RV', name: 'Receipt Voucher', category: 'Finance' },
        { code: 'JE', name: 'Journal Entry', category: 'Finance' },
        { code: 'STK', name: 'Stock Adjustment', category: 'Inventory' },
        { code: 'PCV', name: 'Petty Cash Voucher', category: 'Finance' },
    ];

    const filteredTypes = transactionTypes.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="SELECT TRANSACTION TYPE"
            maxWidth="max-w-md"
        >
            <div className="py-2 select-none font-['Tahoma']">
                {/* Search Header */}
                <div className="relative mb-4">
                    <input 
                        type="text" 
                        placeholder="Search type or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none focus:border-blue-400 font-bold text-[13px] shadow-sm"
                        autoFocus
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 rounded-t-[5px] border-b border-gray-200">
                    <div className="col-span-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Code</div>
                    <div className="col-span-9 text-[11px] font-black text-slate-500 uppercase tracking-wider">Transaction Name</div>
                </div>

                {/* List Content */}
                <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-b-[5px] no-scrollbar">
                    {filteredTypes.length > 0 ? (
                        filteredTypes.map((type, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelect(type.name)}
                                className="w-full grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-none group text-left"
                            >
                                <div className="col-span-3 font-bold text-[13px] text-[#0078d4] group-hover:scale-105 transition-transform">{type.code}</div>
                                <div className="col-span-8 font-bold text-[13px] text-slate-700">{type.name}</div>
                                <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100">
                                    <Check size={14} className="text-blue-500" />
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-10 text-center text-slate-400 italic text-[13px]">
                            No matching types found
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-slate-400">
                    <ListChecks size={14} className="text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest italic">Double click to select and return to report</span>
                </div>
            </div>
        </SimpleModal>
    );
};

export default TransactionTypeLookupModal;
