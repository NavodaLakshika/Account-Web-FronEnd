import React from 'react';
import { X } from 'lucide-react';

const ModalWrapper = ({ isOpen, onClose, title, subtitle, icon: Icon, children, size = 'max-w-lg' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
            <div className={`animate-in fade-in zoom-in-95 duration-300 w-full ${size} relative z-10`}>
 <div className="bg-white rounded-none shadow-2xl p-5 relative overflow-hidden">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors z-10 border-none bg-transparent"
                    >
                        <X size={28} strokeWidth={1.5} />
                    </button>

                    {/* Optional Header */}
                    {(title || Icon) && (
                        <div className="flex items-center gap-3 mb-5">
                            {Icon && (
                                <div className="w-10 h-10 rounded-none bg-blue-50 border border-blue-100 flex items-center justify-center">
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
