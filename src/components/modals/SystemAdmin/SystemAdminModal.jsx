import React from 'react';
import { X, ShieldCheck, Database, RefreshCw, Download, Trash2, Search, FileEdit, Settings, CloudLightning, Eraser, Lock, FileText, ChevronRight } from 'lucide-react';

import DatabaseBackupModal from './DatabaseBackupModal';
import StockBalanceUpdateModal from './StockBalanceUpdateModal';
import DownloadDataModal from './DownloadDataModal';
import DeleteAccountModal from './DeleteAccountModal';
import TransactionSearchModal from './TransactionSearchModal';
import SystemUpdateModal from './SystemUpdateModal';
import ClearTempDataModal from './ClearTempDataModal';
import PeriodLockModal from './PeriodLockModal';

const SystemAdminModal = ({ isOpen, onClose, onOpenChangePassword, onOpenSystemSettings }) => {
    const [showBackupModal, setShowBackupModal] = React.useState(false);
    const [showStockUpdateModal, setShowStockUpdateModal] = React.useState(false);
    const [showDownloadModal, setShowDownloadModal] = React.useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = React.useState(false);
    const [showSearchModal, setShowSearchModal] = React.useState(false);
    const [showUpdateModal, setShowUpdateModal] = React.useState(false);
    const [showClearModal, setShowClearModal] = React.useState(false);
    const [showLockModal, setShowLockModal] = React.useState(false);

    if (!isOpen) return null;

    const menuItems = [
        { icon: Database, label: 'Create a Data Backup', shortcut: '', action: 'backup' },
        { icon: RefreshCw, label: 'Stock Balance Update', shortcut: '', action: 'stockUpdate' },
        { icon: Download, label: 'Download Data', shortcut: '', action: 'download' },
        { icon: Trash2, label: 'Delete Account', color: 'text-red-600', action: 'deleteAccount' },
        { icon: Search, label: 'Transaction Search', shortcut: '', action: 'search' },
        { icon: FileEdit, label: 'Document Editor', shortcut: '' },
        { icon: Settings, label: 'Transaction Editor', shortcut: '' },
        { icon: CloudLightning, label: 'System Update', shortcut: '', action: 'update' },
        { icon: Eraser, label: 'Clear Temporary Data', shortcut: '', action: 'clear' },
        { icon: Lock, label: 'Period Lock Facility', shortcut: '', action: 'lock' },
        { icon: Settings, label: 'System Configuration', action: 'systemSettings' },
        { icon: FileText, label: 'Change Password', shortcut: '', action: 'changePassword' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">

            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                    />
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
                <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item.action === 'changePassword') onOpenChangePassword();
                                    if (item.action === 'backup') setShowBackupModal(true);
                                    if (item.action === 'stockUpdate') setShowStockUpdateModal(true);
                                    if (item.action === 'download') setShowDownloadModal(true);
                                    if (item.action === 'deleteAccount') setShowDeleteAccountModal(true);
                                    if (item.action === 'search') setShowSearchModal(true);
                                    if (item.action === 'update') setShowUpdateModal(true);
                                    if (item.action === 'clear') setShowClearModal(true);
                                    if (item.action === 'lock') setShowLockModal(true);
                                    if (item.action === 'systemSettings') onOpenSystemSettings();
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all relative overflow-hidden text-left"
                            >
                                {/* Hover Indicator Bar */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                                />

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:shadow-md">
                                        <Icon size={16} className={`${item.color || 'text-slate-500 group-hover:text-[#0078d4]'} transition-colors`} />
                                    </div>
                                    <span className={`text-[13px] font-semibold ${item.color || 'text-slate-700'} group-hover:text-slate-900 transition-colors`}>
                                        {item.label}
                                    </span>
                                </div>
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all relative z-10" />
                            </button>
                        );
                    })}
                </div>
            </div>

            <DatabaseBackupModal 
                isOpen={showBackupModal} 
                onClose={() => setShowBackupModal(false)} 
            />

            <StockBalanceUpdateModal 
                isOpen={showStockUpdateModal} 
                onClose={() => setShowStockUpdateModal(false)} 
            />

            <DownloadDataModal 
                isOpen={showDownloadModal} 
                onClose={() => setShowDownloadModal(false)} 
            />

            <DeleteAccountModal 
                isOpen={showDeleteAccountModal} 
                onClose={() => setShowDeleteAccountModal(false)} 
            />

            <TransactionSearchModal 
                isOpen={showSearchModal} 
                onClose={() => setShowSearchModal(false)} 
            />

            <SystemUpdateModal 
                isOpen={showUpdateModal} 
                onClose={() => setShowUpdateModal(false)} 
            />

            <ClearTempDataModal 
                isOpen={showClearModal} 
                onClose={() => setShowClearModal(false)} 
            />

            <PeriodLockModal 
                isOpen={showLockModal} 
                onClose={() => setShowLockModal(false)} 
            />
        </div>
    );
};

export default SystemAdminModal;
