import React from 'react';
import { X, ShieldCheck, Database, RefreshCw, Download, Trash2, Search, FileEdit, Settings, CloudLightning, Eraser, Lock } from 'lucide-react';

const SystemAdminModal = ({ isOpen, onClose, onOpenChangePassword }) => {
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
        { icon: FileText, label: 'Change Password', shortcut: '', action: 'changePassword' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">

            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#0078d4]" />
                        <span className="text-lg font-bold text-slate-800 tracking-tight">System Administration</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                        title="Close"
                    >
                        <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Menu Content */}
                <div className="p-6 bg-white flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item.action === 'changePassword') onOpenChangePassword();
                                }}
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
                <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-medium">Administrator Access Only</span>
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic">Security Core</span>
                </div>
            </div>
        </div>
    );
};

export default SystemAdminModal;
