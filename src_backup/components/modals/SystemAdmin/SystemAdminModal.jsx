import React, { useState } from 'react';
import { X, Database, RefreshCw, Download, Trash2, Search, FileEdit, CloudLightning, Eraser, Lock, FileText, Key, Layout, Users, ShieldAlert } from 'lucide-react';
import DatabaseBackupModal from './DatabaseBackupModal';
import StockBalanceUpdateModal from './StockBalanceUpdateModal';
import InventoryDownloadModal from './InventoryDownloadModal';
import DeleteAccountModal from './DeleteAccountModal';
import SystemUpdateModal from './SystemUpdateModal';
import ClearTempDataModal from './ClearTempDataModal';
import FeatureLockedModal from '../FeatureLockedModal';
import JournalEntryEditorModal from './JournalEntryEditorModal';
import TransactionEditorModal from './TransactionEditorModal';
import SystemSettingsBoard from '../../../HomeMaster/SystemSettingsBoard';
import ChangePasswordBoard from '../MasterSubModal/ChangePasswordBoard';
import PeriodLockModal from './PeriodLockModal';
import CompanyUsersModal from './CompanyUsersModal';
import TwoFactorSetupModal from './TwoFactorSetupModal';

const SystemAdminModal = ({ isOpen, onClose }) => {
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showStockUpdateModal, setShowStockUpdateModal] = useState(false);
    const [showInventoryDownloadModal, setShowInventoryDownloadModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [showPeriodLockModal, setShowPeriodLockModal] = useState(false);
    const [showJournalEditorModal, setShowJournalEditorModal] = useState(false);
    const [showTransactionEditorModal, setShowTransactionEditorModal] = useState(false);
    const [showSystemSettings, setShowSystemSettings] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [showFeatureLockedModal, setShowFeatureLockedModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const handleAction = (action) => {
        switch (action) {
            case 'backup': setShowBackupModal(true); break;
            case 'stockUpdate': setShowStockUpdateModal(true); break;
            case 'inventoryDownload': setShowInventoryDownloadModal(true); break;
            case 'deleteAccount': setShowDeleteAccountModal(true); break;
            case 'journalEditor': setShowJournalEditorModal(true); break;
            case 'transactionEditor': setShowTransactionEditorModal(true); break;
            case 'update': setShowUpdateModal(true); break;
            case 'clear': setShowClearModal(true); break;
            case 'lock': setShowPeriodLockModal(true); break;
            case 'systemSettings': setShowSystemSettings(true); break;
            case 'changePassword': setShowChangePassword(true); break;
            case 'users': setShowUsersModal(true); break;
            case 'twoFactor': setShowTwoFactorModal(true); break;
        }
    };

    const menuItems = [
        { icon: Database, label: 'Data Backup', action: 'backup' },
        { icon: RefreshCw, label: 'Stock Balance Update', action: 'stockUpdate' },
        { icon: Download, label: 'Inventory Download', action: 'inventoryDownload' },
        { icon: Trash2, label: 'Delete Account', action: 'deleteAccount' },
        { icon: FileEdit, label: 'Document Editor', action: 'journalEditor' },
        { icon: FileText, label: 'Transaction Editor', action: 'transactionEditor' },
        { icon: CloudLightning, label: 'System Update', action: 'update' },
        { icon: Eraser, label: 'Clear Temp Data', action: 'clear' },
        { icon: Lock, label: 'Period Lock Facility', action: 'lock' },
        { icon: Users, label: 'User & Role Management', action: 'users' },
        { icon: ShieldAlert, label: 'Two-Factor Verification', action: 'twoFactor' },
        { icon: Key, label: 'Change Password', action: 'changePassword' },
    ];

    const filteredItems = searchQuery
        ? menuItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : menuItems;

    const totalModules = menuItems.length;

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-sm bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0285fd]" />

                        <div className="flex items-center gap-2.5 pl-2">
                            <div className="w-7 h-7 rounded-[3px] bg-slate-100 flex items-center justify-center">
                                <Layout size={13} className="text-[#0285fd]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-[700] text-slate-900 uppercase tracking-[2px] font-mono leading-none">System Admin Hub</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Security & System Management</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                            <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="px-3 py-2 bg-white border-b border-gray-200">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] border border-gray-200 bg-white">
                            <Search size={12} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search modules..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-6 text-[11px] font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[65vh] no-scrollbar">
                        {filteredItems.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                                    <Search size={18} className="text-slate-300" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-400">No modules found</p>
                                <button onClick={() => setSearchQuery('')} className="mt-1.5 text-[9px] font-bold text-[#0285fd] uppercase tracking-wider hover:underline">Clear search</button>
                            </div>
                        ) : (
                            filteredItems.map((item, idx) => {
                            const Icon = item.icon;
                            const isLocked = item.action !== 'users' && localStorage.getItem(`isLocked_${item.action}`) === 'true';

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (isLocked) { setShowFeatureLockedModal(true); return; }
                                        handleAction(item.action);
                                    }}
                                    className="group w-full flex items-center justify-between px-4 py-2.5 rounded-[3px] hover:bg-slate-50 transition-all relative overflow-hidden text-left border-none"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0285fd]" />

                                    <div className="flex items-center gap-3 relative z-10 w-full">
 <div className={`w-7 h-7 rounded-sm flex items-center justify-center transition-colors shadow-sm ${isLocked ? 'bg-red-50' : 'bg-slate-100 group-hover:bg-white'}`}>
                                            {isLocked ? <Lock size={14} className="text-red-500" /> : <Icon size={14} className="text-slate-500 group-hover:text-[#0285fd] transition-colors" />}
                                        </div>
                                        <div className="flex flex-col">
                                            {isLocked && (
                                                <span className="text-[7px] font-black text-red-500 uppercase tracking-[0.2em] mb-0.5">Secured Module</span>
                                            )}
                                            <span className={`text-[12px] font-bold transition-colors ${isLocked ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        }))}
                    </div>

                    <div className="px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {totalModules} Modules
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Admin Panel</span>
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
            <SystemUpdateModal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} />
            <ClearTempDataModal isOpen={showClearModal} onClose={() => setShowClearModal(false)} />
            <PeriodLockModal isOpen={showPeriodLockModal} onClose={() => setShowPeriodLockModal(false)} />
            <JournalEntryEditorModal isOpen={showJournalEditorModal} onClose={() => setShowJournalEditorModal(false)} />
            <TransactionEditorModal isOpen={showTransactionEditorModal} onClose={() => setShowTransactionEditorModal(false)} />
            <SystemSettingsBoard isOpen={showSystemSettings} onClose={() => setShowSystemSettings(false)} />
            <ChangePasswordBoard isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
            <CompanyUsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />
            <TwoFactorSetupModal isOpen={showTwoFactorModal} onClose={() => setShowTwoFactorModal(false)} />
        </>
    );
};

export default SystemAdminModal;
