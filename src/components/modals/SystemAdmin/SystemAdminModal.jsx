import React, { useState } from 'react';
import { X, ShieldCheck, Database, RefreshCw, Download, Trash2, Search, FileEdit, Settings, CloudLightning, Eraser, Lock, FileText, Key, Layout } from 'lucide-react';
import SimpleModal from '../../SimpleModal';
import DatabaseBackupModal from './DatabaseBackupModal';
import StockBalanceUpdateModal from './StockBalanceUpdateModal';
import InventoryDownloadModal from './InventoryDownloadModal';
import DeleteAccountModal from './DeleteAccountModal';
import TransactionSearchModal from './TransactionSearchModal';
import SystemUpdateModal from './SystemUpdateModal';
import ClearTempDataModal from './ClearTempDataModal';
import FeatureLockedModal from '../FeatureLockedModal';
import JournalEntryEditorModal from './JournalEntryEditorModal';
import TransactionEditorModal from './TransactionEditorModal';
import SystemSettingsBoard from '../../../HomeMaster/SystemSettingsBoard';
import ChangePasswordBoard from '../MasterSubModal/ChangePasswordBoard';
import PeriodLockModal from './PeriodLockModal';

const SystemAdminModal = ({ isOpen, onClose }) => {
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showStockUpdateModal, setShowStockUpdateModal] = useState(false);
    const [showInventoryDownloadModal, setShowInventoryDownloadModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [showPeriodLockModal, setShowPeriodLockModal] = useState(false);
    const [showJournalEditorModal, setShowJournalEditorModal] = useState(false);
    const [showTransactionEditorModal, setShowTransactionEditorModal] = useState(false);
    const [showSystemSettings, setShowSystemSettings] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showFeatureLockedModal, setShowFeatureLockedModal] = useState(false);

    if (!isOpen) return null;

    const handleAction = (action) => {
        switch (action) {
            case 'backup': setShowBackupModal(true); break;
            case 'stockUpdate': setShowStockUpdateModal(true); break;
            case 'inventoryDownload': setShowInventoryDownloadModal(true); break;
            case 'deleteAccount': setShowDeleteAccountModal(true); break;
            case 'search': setShowSearchModal(true); break;
            case 'journalEditor': setShowJournalEditorModal(true); break;
            case 'transactionEditor': setShowTransactionEditorModal(true); break;
            case 'update': setShowUpdateModal(true); break;
            case 'clear': setShowClearModal(true); break;
            case 'lock': setShowPeriodLockModal(true); break;
            case 'systemSettings': setShowSystemSettings(true); break;
            case 'changePassword': setShowChangePassword(true); break;
        }
    };

    const menuItems = [
        { icon: Database, label: 'Data Backup', action: 'backup' },
        { icon: RefreshCw, label: 'Stock Balance Update', action: 'stockUpdate' },
        { icon: Download, label: 'Inventory Download', action: 'inventoryDownload' },
        { icon: Trash2, label: 'Delete Account', action: 'deleteAccount' },
        { icon: Search, label: 'Transaction Search', action: 'search' },
        { icon: FileEdit, label: 'Document Editor', action: 'journalEditor' },
        { icon: FileText, label: 'Transaction Editor', action: 'transactionEditor' },
        { icon: CloudLightning, label: 'System Update', action: 'update' },
        { icon: Eraser, label: 'Clear Temp Data', action: 'clear' },
        { icon: Lock, label: 'Period Lock Facility', action: 'lock' },
        { icon: Key, label: 'Change Password', action: 'changePassword' },
        { icon: Settings, label: 'Admin Configuration', action: 'systemSettings' }
    ];

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

                {/* List Style Modal Container */}
                <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                        {/* System Color Left Accent */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500 bg-[#0078d4]" 
                        />
                        
                        <div className="flex items-center gap-3">
                            <Layout size={14} className="text-[#0078d4]" />
                            <div className="flex flex-col">
                                <span className="text-[14px] font-[700] text-slate-900 uppercase tracking-[2px] font-mono leading-none">System Admin Hub</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest opacity-80">Security Engine Active</span>
                                </div>
                            </div>
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
                            const isLocked = item.action !== 'systemSettings' && localStorage.getItem(`isLocked_${item.action}`) === 'true';

                            return (
                                <React.Fragment key={idx}>
                                    {/* Separator before Admin Configuration */}
                                    {item.action === 'systemSettings' && (
                                        <div className="my-1.5 h-[1px] bg-gray-200 mx-2" />
                                    )}
                                    
                                    <button
                                        onClick={() => {
                                            if (isLocked) {
                                                setShowFeatureLockedModal(true);
                                                return;
                                            }
                                            handleAction(item.action);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all relative overflow-hidden text-left"
                                    >
                                        {/* Hover Indicator Bar */}
                                        <div 
                                            className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0078d4]"
                                        />

                                        <div className="flex items-center gap-3 relative z-10 w-full">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm group-hover:shadow-md ${isLocked ? 'bg-red-50 group-hover:bg-red-100' : 'bg-slate-100 group-hover:bg-white'}`}>
                                                {isLocked ? <Lock size={16} className="text-red-500 transition-colors" /> : <Icon size={16} className="text-slate-500 group-hover:text-[#0078d4] transition-colors" />}
                                            </div>
                                            <div className="flex flex-col">
                                                {isLocked && (
                                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em] mb-0.5 opacity-80">Secured Module</span>
                                                )}
                                                <span className={`text-[14px] font-bold transition-colors ${isLocked ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            <FeatureLockedModal
                isOpen={showFeatureLockedModal}
                onClose={() => setShowFeatureLockedModal(false)}
            />

            {/* Sub Modals */}
            <DatabaseBackupModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
            <StockBalanceUpdateModal isOpen={showStockUpdateModal} onClose={() => setShowStockUpdateModal(false)} />
            <InventoryDownloadModal isOpen={showInventoryDownloadModal} onClose={() => setShowInventoryDownloadModal(false)} />
            <DeleteAccountModal isOpen={showDeleteAccountModal} onClose={() => setShowDeleteAccountModal(false)} />
            <TransactionSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
            <SystemUpdateModal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} />
            <ClearTempDataModal isOpen={showClearModal} onClose={() => setShowClearModal(false)} />
            <PeriodLockModal isOpen={showPeriodLockModal} onClose={() => setShowPeriodLockModal(false)} />
            <JournalEntryEditorModal isOpen={showJournalEditorModal} onClose={() => setShowJournalEditorModal(false)} />
            <TransactionEditorModal isOpen={showTransactionEditorModal} onClose={() => setShowTransactionEditorModal(false)} />
            <SystemSettingsBoard isOpen={showSystemSettings} onClose={() => setShowSystemSettings(false)} />
            <ChangePasswordBoard isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
        </>
    );
};

export default SystemAdminModal;
