import React from 'react';
import { X, FileText, Files } from 'lucide-react';

const OfficeDocumentModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: FileText, label: 'Word Document', color: 'text-blue-500' },
        { icon: Files, label: 'Excel Spreadsheet', color: 'text-green-500' },
    ];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" 
                onClick={onClose} 
            />
            
            {/* Modal Container */}
            <div 
                className="relative w-full max-w-[260px] bg-[#f0f0f0] border border-gray-400 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Title Bar */}
                <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-300 select-none">
                    <div className="flex items-center gap-2">
                        <Files size={14} className="text-[#0078d4]" />
                        <span className="text-xs font-bold text-gray-700">Office Integration</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-6 flex items-center justify-center bg-white hover:bg-[#e81123] hover:text-white transition-colors border border-gray-100 rounded group"
                    >
                        <X size={14} className="group-hover:stroke-white text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-1 bg-white m-1 border border-gray-200 rounded flex-1 overflow-y-auto no-scrollbar shadow-inner">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
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
                <div className="bg-[#f0f0f0] px-3 py-1.5 border-t border-gray-300 flex justify-end">
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic">Ready</span>
                </div>
            </div>
        </div>
    );
};

export default OfficeDocumentModal;
