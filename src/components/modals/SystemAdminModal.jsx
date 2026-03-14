import React from 'react';
import { X, ShieldCheck, Database, RefreshCw, Download, Trash2, Search, FileEdit, Settings, CloudLightning, Eraser, Lock } from 'lucide-react';

const SystemAdminModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: Database, label: 'Create a Data Backup', shortcut: '' },
        { icon: RefreshCw, label: 'Stock Balance Update', shortcut: '' },
        { icon: Download, label: 'Download Data', shortcut: '' },
        { icon: Trash2, label: 'Delete Account', color: 'text-red-600' },
        { icon: Search, label: 'Transaction Search', shortcut: '' },
        { icon: FileEdit, label: 'Document Editor', shortcut: '' },
        { icon: Settings, label: 'Transaction Editor', shortcut: '' },
        { icon: CloudLightning, label: 'System Update', shortcut: '' },
        { icon: Eraser, label: 'Clear Temporary Data', shortcut: '' },
        { icon: Lock, label: 'Period Lock Facility', shortcut: '' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-sm bg-[#f0f0f0] border border-gray-400 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-300 select-none">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#0078d4]" />
                        <span className="text-xs font-bold text-gray-700">System Administration</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-5 flex items-center justify-center bg-white hover:bg-[#e81123] hover:text-white transition-colors border border-gray-300 rounded group"
                    >
                        <X size={12} className="group-hover:stroke-white" />
                    </button>
                </div>

                {/* Menu Content */}
                <div className="p-1 bg-white m-1 border border-gray-300 flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-[#0078d4] group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={16} className={`${item.color || 'text-gray-500'} group-hover:text-white transition-colors`} />
                                    <span className={`text-[13px] font-medium ${item.color || 'text-gray-700'} group-hover:text-white transition-colors`}>
                                        {item.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="bg-[#f0f0f0] px-3 py-1.5 border-t border-gray-300 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-medium">Administrator Access Only</span>
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic">Security Core</span>
                </div>
            </div>
        </div>
    );
};

export default SystemAdminModal;
