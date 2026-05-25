import React from 'react';
import { X } from 'lucide-react';

const ModalWrapper = ({ isOpen, onClose, title, subtitle, icon: Icon, children, size = 'max-w-lg' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className={`animate-in fade-in zoom-in-95 duration-300 w-full ${size}`}>
                <div className="bg-slate-50/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/60 p-5 relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 shadow-sm transition-all z-10"
                    >
                        <X size={15} />
                    </button>

                    {/* Optional Header */}
                    {(title || Icon) && (
                        <div className="flex items-center gap-3 mb-5">
                            {Icon && (
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <Icon size={18} className="text-blue-600" />
                                </div>
                            )}
                            <div>
                                {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
                                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                            </div>
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalWrapper;
