import React from 'react';
import { X } from 'lucide-react';

const SimpleModal = ({ isOpen, onClose, title, subtitle, children, footer, maxWidth = "max-w-4xl", zoom = 1, showHeaderClose = true, accentColor: accent = localStorage.getItem('topBarColor') || '#0285fd' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 pt-12 font-['Tahoma']">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${maxWidth} bg-white shadow-2xl rounded-[3px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-400`} style={{ zoom }}>
                <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-slate-200 select-none relative shrink-0">
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest truncate">
                            {title}
                        </span>
                        {subtitle && (
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                {subtitle}
                            </span>
                        )}
                    </div>

                    {showHeaderClose && (
                        <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all shrink-0 border-none ml-4" title="Close">
                            <X size={28} strokeWidth={1.5} />
                        </button>
                    )}
                </div>

                <div className="p-4 bg-white flex-1 flex flex-col overflow-y-auto max-h-[75vh] no-scrollbar">
                    {children}
                </div>

                {footer && (
                    <div className="bg-slate-50/80 px-4 py-3 flex justify-end gap-2.5 border-t border-slate-200 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleModal;
