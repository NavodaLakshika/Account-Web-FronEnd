import React from 'react';
import { X, HelpCircle, Layout } from 'lucide-react';

const SimpleModal = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-4xl" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            
            {/* Dialog Container */}
            <div className={`relative w-full ${maxWidth} bg-[#f0f0f0] shadow-2xl border border-gray-400 rounded-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200`}>
                
                {/* Header */}
                <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-300 select-none">
                    <div className="flex items-center gap-2">
                        <Layout size={14} className="text-[#0078d4]" />
                        <span className="text-xs font-bold text-gray-700">{title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-5 flex items-center justify-center hover:bg-gray-100 text-gray-400 rounded transition-colors group">
                            <HelpCircle size={14} className="group-hover:text-gray-600" />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-5 flex items-center justify-center bg-white hover:bg-[#e81123] hover:text-white transition-colors border border-gray-300 rounded group"
                        >
                            <X size={12} className="group-hover:stroke-white" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-4 bg-white m-1 border border-gray-300 flex-1 flex flex-col overflow-y-auto max-h-[85vh] no-scrollbar">
                    {children}
                </div>

                {/* Footer Buttons */}
                {footer && (
                    <div className="bg-[#f0f0f0] px-4 py-3 flex justify-end gap-3 border-t border-gray-300">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleModal;
