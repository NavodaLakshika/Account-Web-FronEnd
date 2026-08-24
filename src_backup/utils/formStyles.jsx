import React from 'react';
import { Search, X } from 'lucide-react';

export const accentColor = () => localStorage.getItem('topBarColor') || '#00D1FF';

export const labelClass = "text-[11px] font-bold text-gray-500 uppercase shrink-0";

export const inputClass = "flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono text-slate-700 bg-slate-50 rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20";

export const readOnlyClass = "flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-blue-600 bg-slate-100 rounded outline-none cursor-default";

export const readOnlyCodeClass = "w-24 h-8 border border-slate-200 px-2 text-sm font-mono font-bold text-blue-600 bg-slate-50 rounded outline-none text-center";

export const searchBtnClass = "w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all active:scale-95 shrink-0";

export const refreshBtnClass = "w-9 h-8 bg-white border border-slate-200 text-[#0285fd] flex items-center justify-center hover:bg-gray-50 rounded-[5px] transition-all active:scale-95 shrink-0";

export const formSectionClass = "py-2 select-none font-['Tahoma'] space-y-3.5";

export const formRowClass = "flex items-center gap-5";

export const gridRowClass = "flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-5";

export const pageTitleClass = "text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest text-center border-b border-slate-200 pb-3.5 mb-1";

export const footerBtnBase = "px-6 py-3 text-sm font-mono font-bold uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2";

export const saveBtnClass = `${footerBtnBase} bg-[#2bb744] hover:bg-[#259b3a] text-white shadow-md shadow-green-100`;
export const updateBtnClass = `${footerBtnBase} bg-[#2bb744] hover:bg-[#259b3a] text-white shadow-md shadow-green-100`;
export const deleteBtnClass = `${footerBtnBase} bg-[#ff3b30] hover:bg-[#e03127] text-white shadow-md shadow-red-100`;
export const clearBtnClass = `${footerBtnBase} bg-[#00adff] hover:bg-[#0099e6] text-white`;
export const addBtnClass = `${footerBtnBase} bg-[#2bb744] hover:bg-[#259b3a] text-white shadow-md shadow-green-100`;
export const editBtnClass = `${footerBtnBase} bg-[#00adff] hover:bg-[#0099e6] text-white`;

export const disabledClass = "opacity-50 cursor-not-allowed";

export const footerBarClass = "bg-slate-50/80 px-4 w-full flex justify-end gap-2.5 border-t border-slate-200 mt-4 py-3 rounded-b-[5px]";

export const FormRow = ({ label, children, labelWidth = "w-32" }) => (
    <div className="flex items-center gap-5">
        <label className={`${labelWidth} text-[11px] font-bold text-gray-500 uppercase shrink-0`}>{label}</label>
        {children}
    </div>
);

export const SearchModal = ({ title, list, onSelect, onClose, placeholder = "Search by code or name...", columns = ['code', 'name'], labelKey = null }) => {
    const [query, setQuery] = React.useState('');

    const filterFn = (item) => {
        const q = query.toLowerCase();
        return columns.some(col => {
            let val = item[col] || '';
            if (typeof val === 'object' && val !== null) val = '';
            return String(val).toLowerCase().includes(q);
        });
    };

    const getDisplayVal = (item, col) => {
        let val = item[col];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return '';
        return val;
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
 <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="bg-white px-6 py-3.5 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-500" style={{ backgroundColor: accentColor() }} />
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#0285fd]/10 flex items-center justify-center">
                            <Search size={14} className="text-[#0285fd]" />
                        </div>
                        <span className="text-[14px] font-[700] text-slate-900 uppercase tracking-[2px] truncate">{title} Lookup</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[6px] transition-all active:scale-90 outline-none border-none group" title="Close">
                        <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="p-3 bg-slate-50/80 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[2px]">Search Facility</span>
                    <input type="text" placeholder={placeholder} className="h-8 border border-gray-200 px-3 text-[11px] rounded-[5px] w-64 focus:border-[#0285fd] outline-none shadow-sm transition-all bg-white" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>

                <div className="p-2">
                    <div className="px-3 py-1.5 flex text-[9px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                        {columns.map((col, i) => (
                            <span key={col} className={`${i === 0 ? 'w-20 text-center shrink-0' : 'flex-1 px-2'} ${i > 0 && i < columns.length - 1 ? '' : ''}`}>
                                {col.replace(/_/g, ' ')}
                            </span>
                        ))}
                        <span className="w-[68px] text-center shrink-0">Action</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {list.filter(filterFn).length > 0 ? (
                            list.filter(filterFn).map((item, idx) => (
                                <button key={idx} onClick={() => onSelect(item)} className="w-full flex items-center justify-between px-3 py-2 text-[11px] border-b border-gray-100 hover:bg-blue-50/60 transition-all text-left group">
                                    <div className="flex items-center gap-2 flex-1">
                                        {columns.map((col, i) => (
                                            <span key={col} className={`${i === 0 ? 'w-20 text-center shrink-0 font-mono font-bold text-[#0285fd]' : 'flex-1 px-2 font-medium text-gray-700'} truncate`}>
                                                {getDisplayVal(item, col)}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="bg-[#e49e1b] text-white text-[9px] px-4 py-1.5 rounded-md font-bold hover:bg-[#d08f16] shadow-sm transition-all active:scale-95 uppercase shrink-0">Select</div>
                                </button>
                            ))
                        ) : (
                            <div className="py-10 text-center text-gray-400 italic text-[12px]">No results found.</div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[9px] text-gray-400">
                    <span>{list.filter(filterFn).length} of {list.length} Result(s)</span>
                </div>
            </div>
        </div>
    );
};
