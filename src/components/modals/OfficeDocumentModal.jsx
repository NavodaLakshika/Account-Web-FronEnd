import React from 'react';
import { X, FileText, Files } from 'lucide-react';

const OfficeDocumentModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const menuItems = [
        { 
            icon: FileText, 
            label: 'Word Document', 
            color: 'text-blue-500',
            onClick: () => {
                // Fetching from backend is much more reliable than browser protocols
                fetch('/api/utility/open-word');
                onClose();
            }
        },
        { 
            icon: Files, 
            label: 'Excel Spreadsheet', 
            color: 'text-green-500',
            onClick: () => {
                // Fetching from backend is much more reliable than browser protocols
                fetch('/api/utility/open-excel');
                onClose();
            }
        },
    ];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                onClick={onClose} 
            />
            
            {/* Modal Container */}
            <div 
                className="relative w-full max-w-[260px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Title Bar */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                    />
                    
                    <div className="flex items-center gap-2">
                        <Files size={14} className="text-[#0078d4]" />
                        <span className="text-lg font-bold text-slate-800 tracking-tight">Office Integration</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                        title="Close"
                    >
                        <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-1 bg-white m-1 border border-gray-200 rounded flex-1 overflow-y-auto no-scrollbar shadow-inner">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#0078d4] group transition-all text-left"
                            >
                                <Icon size={20} className={`${item.color} group-hover:text-white transition-colors`} />
                                <span className="text-[14px] font-semibold text-gray-700 group-hover:text-white transition-colors">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Status Bar */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic">Ready</span>
                </div>
            </div>
        </div>
    );
};

export default OfficeDocumentModal;
