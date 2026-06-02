import React, { useState } from 'react';
import { X, ChevronRight, Landmark, FileText, RefreshCw, ClipboardList, ListChecks, BookOpen, BookCopy, Search } from 'lucide-react';

const accentColor = () => localStorage.getItem('topBarColor') || '#4f83ff';

const menuGroups = [
    {
        title: 'Bank Statements',
        items: [
            { icon: Landmark, label: 'Banking', desc: 'View banking reports', action: 'banking' },
            { icon: FileText, label: 'Bank Statement', desc: 'View bank statements', action: 'statement' },
        ]
    },
    {
        title: 'Reconciliation',
        items: [
            { icon: RefreshCw, label: 'Bank Reconciliation Statement', desc: 'View bank reconciliation reports', action: 'reconciliation' },
            { icon: ClipboardList, label: 'Reconciliation Summary', desc: 'View reconciliation summary', action: 'reconSummary' },
            { icon: ListChecks, label: 'Reconciliation Detail Summary', desc: 'View detailed reconciliation', action: 'reconDetail' },
        ]
    },
    {
        title: 'Cheque Books',
        items: [
            { icon: BookOpen, label: 'Entered Cheque Books Report', desc: 'View entered cheque books', action: 'chequeBooks' },
            { icon: BookCopy, label: 'Cheque Diary', desc: 'View cheque diary reports', action: 'chequeDiary' },
        ]
    }
];

const BankingReportsModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');

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

    const totalModules = menuGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accentColor() }} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4f83ff]/10 flex items-center justify-center">
                            <Landmark size={16} className="text-[#4f83ff]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-[0.25em] text-slate-900 leading-tight">
                                Banking Reports
                            </h2>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider">Statements, Reconciliation &amp; Cheque Books</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90">
                        <X size={28} strokeWidth={1.5} className="text-red-600" />
                    </button>
                </div>

                <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search banking reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 text-[12px] border border-slate-200 rounded-lg bg-white outline-none focus:border-[#4f83ff] focus:ring-1 focus:ring-[#4f83ff]/20 transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="px-5 py-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    {filteredGroups.length === 0 ? (
                        <div className="py-16 text-center">
                            <Search size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-[13px] text-slate-400 font-medium">No reports match your search</p>
                            <button onClick={() => setSearchQuery('')} className="mt-2 text-[11px] text-[#4f83ff] font-bold hover:underline">Clear search</button>
                        </div>
                    ) : (
                        filteredGroups.map((group, gi) => (
                            <div key={gi} className="mb-5 last:mb-0">
                                <div className="flex items-center gap-2.5 mb-2.5 px-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">{group.title}</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-[9px] text-slate-300 font-medium">{group.items.length}</span>
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    {group.items.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {}}
                                                className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100 hover:shadow-sm text-left"
                                            >
 <div className="w-9 h-9 rounded-sm bg-white flex items-center justify-center shadow-sm group-hover:border-[#4f83ff]/20 group-hover:bg-[#4f83ff]/5 transition-all shrink-0">
                                                    <Icon size={16} strokeWidth={1.8} className="text-slate-500 group-hover:text-[#4f83ff] transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-[700] tracking-tight text-slate-700">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10.5px] text-slate-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-medium">
                        {totalModules} Modules Available
                    </span>
                    <span className="text-[9px] text-slate-300">Banking Reports</span>
                </div>
            </div>
        </div>
    );
};

export default BankingReportsModal;
