import React from 'react';
import { X, HelpCircle, Layout } from 'lucide-react';

const SimpleModal = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-4xl" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Dialog Container */}
            <div className={`relative w-full ${maxWidth} bg-white shadow-2xl border border-gray-100 rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200`}>
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Layout size={16} className="text-blue-600" />
                        </div>
                        <span className="text-lg font-bold text-slate-800 tracking-tight">{title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-400 rounded-full transition-colors group outline-none">
                            <HelpCircle size={18} className="group-hover:text-slate-600" />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full group outline-none"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-6 bg-white flex-1 flex flex-col overflow-y-auto max-h-[80vh] no-scrollbar">
                    {children}
                </div>

                {/* Footer Buttons */}
                {footer && (
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleModal;
