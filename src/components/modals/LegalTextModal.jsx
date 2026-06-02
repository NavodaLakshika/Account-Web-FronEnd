import React from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

const LegalTextModal = ({ isOpen, onClose, title, content, type }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'Privacy': return <ShieldCheck className="text-[#8a2be2]" size={28} />;
            case 'Security': return <Lock className="text-[#0078d4]" size={28} />;
            case 'SLA': return <FileText className="text-[#0078d4]" size={28} />;
            default: return <FileText className="text-[#0078d4]" size={28} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center font-sans">
            {/* Soft Backdrop */}
            <div
                className="absolute inset-0 bg-[#001c3d]/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-[90%] max-w-2xl bg-white rounded- shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 p-2 rounded-full transition-all"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-8 overflow-y-auto no-scrollbar text-slate-600 text-[14px] leading-relaxed space-y-4">
                    {content}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#0078d4] text-white text-sm font-bold rounded-lg hover:bg-[#006abc] transition-colors shadow-sm active:scale-95"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalTextModal;
