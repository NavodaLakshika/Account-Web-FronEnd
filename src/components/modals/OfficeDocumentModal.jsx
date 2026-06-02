import React from 'react';
import { X, FileText, Files } from 'lucide-react';

const accent = localStorage.getItem('topBarColor') || '#0388cc';

const OfficeDocumentModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const menuItems = [
        {
            icon: FileText,
            label: 'Word Document',
            color: 'text-blue-500',
            onClick: () => {
                fetch('/api/utility/open-word');
                onClose();
            }
        },
        {
            icon: Files,
            label: 'Excel Spreadsheet',
            color: 'text-green-500',
            onClick: () => {
                fetch('/api/utility/open-excel');
                onClose();
            }
        },
    ];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-[280px] bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4f83ff]/10 flex items-center justify-center">
                            <Files size={16} className="text-[#4f83ff]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-[0.25em] text-slate-900 leading-tight">Office Integration</h2>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider">Create New Documents</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90">
                        <X size={28} strokeWidth={1.5} className="text-red-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-left group border border-transparent hover:border-slate-100 hover:shadow-sm"
                            >
 <div className="w-9 h-9 rounded-sm bg-white flex items-center justify-center shadow-sm group-hover:border-[#4f83ff]/20 group-hover:bg-[#4f83ff]/5 transition-all shrink-0">
                                    <Icon size={16} className={`${item.color} group-hover:text-[#4f83ff] transition-colors`} />
                                </div>
                                <span className="text-[11px] font-[700] tracking-widest text-slate-700 uppercase">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 px-6 py-4 rounded-b-[5px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ready</span>
                </div>
            </div>
        </div>
    );
};

export default OfficeDocumentModal;
