import React from 'react';
import { X, HelpCircle, Layout } from 'lucide-react';

const SimpleModal = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-4xl", zoom = 1, showHeaderClose = true, accentColor = localStorage.getItem('topBarColor') || "#0285fd" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            {/* Dialog Container */}
            <div
                className={`relative w-full ${maxWidth} bg-white shadow-2xl border border-gray-100 rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200`}
                style={{ zoom }}
            >

                {/* Header */}
                <div className="bg-white px-6 h-14 flex items-center border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: accentColor }}
                    />
                    
                    <div className="flex-1 flex items-center">
                        <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto shrink-0">
                        {showHeaderClose ? (
                            <button
                                onClick={onClose}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        ) : (
                            <>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-400 rounded-full transition-colors group outline-none">
                                    <HelpCircle size={18} className="group-hover:text-slate-600" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full group outline-none"
                                >
                                    <X size={18} />
                                </button>
                            </>
                        )}
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
