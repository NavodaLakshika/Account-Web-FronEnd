import React, { useState } from 'react';
import { X, ClipboardList, History, FileText, Trash2, ShieldAlert, Search } from 'lucide-react';
import StockReportModal from './StockReportModal';
import SystemLogReportModal from './SystemLogReportModal';
import TransactionLogReportModal from './TransactionLogReportModal';
import CancelledTransactionReportModal from './CancelledTransactionReportModal';

const menuGroups = [
    {
        title: 'Inventory Reports',
        items: [
            { icon: ClipboardList, label: 'Stock Report', desc: 'View inventory stock reports', action: 'stock' },
        ]
    },
    {
        title: 'Audit Reports',
        items: [
            { icon: History, label: 'System Log Report', desc: 'View system activity and audit logs', action: 'systemLog' },
            { icon: FileText, label: 'Transaction Log Report', desc: 'View transaction history logs', action: 'transactionLog' },
        ]
    },
    {
        title: 'Exception Reports',
        items: [
            { icon: Trash2, label: 'Cancelled Transaction Report', desc: 'View cancelled transaction records', color: 'text-red-500', action: 'cancelled' },
        ]
    }
];

const AdminReportsModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showStockReport, setShowStockReport] = useState(false);
    const [showSystemLogReport, setShowSystemLogReport] = useState(false);
    const [showTransactionLogReport, setShowTransactionLogReport] = useState(false);
    const [showCancelledReport, setShowCancelledReport] = useState(false);

    if (!isOpen) return null;

    const filteredGroups = (() => {
        const q = searchQuery.toLowerCase();
        if (!q) return menuGroups;
        return menuGroups.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
            )
        })).filter(group => group.items.length > 0);
    })();

    const openReport = (action) => {
        switch (action) {
            case 'stock': setShowStockReport(true); break;
            case 'systemLog': setShowSystemLogReport(true); break;
            case 'transactionLog': setShowTransactionLogReport(true); break;
            case 'cancelled': setShowCancelledReport(true); break;
        }
    };

    const totalModules = menuGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-sm bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0285fd]" />

                        <div className="flex items-center gap-2.5 pl-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                <ShieldAlert size={13} className="text-[#0285fd]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-[700] text-slate-900 uppercase tracking-[2px] font-mono leading-none">Admin Reports Center</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">System, Audit &amp; Exception Reports</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                            <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="px-3 py-2 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white">
                            <Search size={12} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-6 text-[11px] font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[65vh] no-scrollbar">
                        {filteredGroups.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                                    <Search size={18} className="text-slate-300" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-400">No reports found</p>
                                <button onClick={() => setSearchQuery('')} className="mt-1.5 text-[9px] font-bold text-[#0285fd] uppercase tracking-wider hover:underline">Clear search</button>
                            </div>
                        ) : (
                            filteredGroups.map((group, gi) => (
                                <div key={gi}>
                                    <div className="flex items-center gap-2 px-4 py-2">
                                        <div className="w-1 h-1 rounded-full bg-[#0285fd]" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{group.title}</span>
                                        <div className="flex-1" />
                                        <span className="text-[9px] font-mono font-bold text-slate-300">{group.items.length}</span>
                                    </div>
                                    {group.items.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => openReport(item.action)}
                                                className="group w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all relative overflow-hidden text-left border-none"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0285fd]" />

                                                <div className="flex items-center gap-3 relative z-10 w-full">
 <div className="w-7 h-7 rounded-sm bg-slate-100 flex items-center justify-center transition-colors shadow-sm group-hover:bg-white">
                                                        <Icon size={14} className={`${item.color || 'text-slate-500'} group-hover:text-[#0285fd] transition-colors`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[12px] font-bold ${item.color || 'text-slate-700'} group-hover:text-slate-900 transition-colors`}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {totalModules} Modules
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Admin Reports</span>
                    </div>
                </div>
            </div>

            <StockReportModal isOpen={showStockReport} onClose={() => setShowStockReport(false)} />
            <SystemLogReportModal isOpen={showSystemLogReport} onClose={() => setShowSystemLogReport(false)} />
            <TransactionLogReportModal isOpen={showTransactionLogReport} onClose={() => setShowTransactionLogReport(false)} />
            <CancelledTransactionReportModal isOpen={showCancelledReport} onClose={() => setShowCancelledReport(false)} />
        </>
    );
};

export default AdminReportsModal;
