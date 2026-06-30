import React, { useState, useEffect } from 'react';
import { Settings, Lock, Unlock, ShieldAlert, Layers, ShieldCheck, ShoppingCart, BarChart2, ChevronDown, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { systemLocksService } from '../../services/systemLocks.service';
import SystemUpdateAuthModal from './SystemAdmin/SystemUpdateAuthModal';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const masterItems = [
    { label: 'Open Company', id: 'master_company' },
    { label: 'Cost Center Master', id: 'master_costCenter' },
    { label: 'Create Department', id: 'master_department' },
    { label: 'Create Category', id: 'master_category' },
    { label: 'Supplier Master', id: 'master_supplier' },
    { label: 'Customer Master', id: 'master_customer' },
    { label: 'Customer Types', id: 'master_customerType' },
    { label: 'Card Sale Commission', id: 'master_cardSale' },
    { label: 'Chart of Accountant', id: 'master_chartOfAccount' },
    { label: 'User Profile Maint', id: 'master_userProfile' },
    { label: 'Vendor Types', id: 'master_vendorTypes' },
    { label: 'Change Password', id: 'master_changePassword' },
    { label: 'System Logoff Action', id: 'master_logoff' }
];

const adminItems = [
    { label: 'Data Backup', id: 'backup' },
    { label: 'Stock Balance Update', id: 'stockUpdate' },
    { label: 'Inventory Download', id: 'inventoryDownload' },
    { label: 'Delete Account', id: 'deleteAccount' },
    { label: 'Document Editor', id: 'journalEditor' },
    { label: 'Transaction Editor', id: 'transactionEditor' },
    { label: 'System Update', id: 'update' },
    { label: 'Clear Temp Data', id: 'clear' },
    { label: 'Period Lock Facility', id: 'lock' },
    { label: 'Admin Change Pwd', id: 'changePassword' },
    { label: 'User & Role Mgmt', id: 'users' },
    { label: 'Admin Config Setting', id: 'systemSettings' },
    { label: 'Dashboard Access Lock', id: 'dashboardLock' }
];

const transactionItems = [
    { label: 'Purchase Order', id: 'trans_po' },
    { label: 'GRN', id: 'trans_grn' },
    { label: 'Bulk GRN', id: 'trans_bulkGrn' },
    { label: 'Petty Cash', id: 'trans_pettyCash' },
    { label: 'Enter Bills', id: 'trans_enterBills' },
    { label: 'Pay Bills', id: 'trans_payBills' },
    { label: 'Estimate', id: 'trans_estimate' },
    { label: 'Sales Order', id: 'trans_salesOrder' },
    { label: 'Create Invoice', id: 'trans_invoice' },
    { label: 'Receive Payment', id: 'trans_receivePayment' },
    { label: 'Create Sales Receipt', id: 'trans_salesReceipt' },
    { label: 'Refunds and Credit', id: 'trans_refunds' },
    { label: 'Items and Services', id: 'trans_items' },
    { label: 'Journal Entry', id: 'trans_journal' },
    { label: 'Marketing Tool', id: 'trans_marketing' },
    { label: 'Collection Deposit', id: 'trans_collection' },
    { label: 'Cheque Register', id: 'trans_chequeRegister' },
    { label: 'Write Cheque', id: 'trans_writeCheque' },
    { label: 'Bank Reconciliation', id: 'trans_bankRec' },
    { label: 'Advance Pay', id: 'trans_advancePay' },
    { label: 'Customer Advance', id: 'trans_customerAdvance' },
    { label: 'Customer Invoice', id: 'trans_customerInvoice' },
    { label: 'Received Payment', id: 'trans_receivedPayment' },
    { label: 'Customer Receipt', id: 'trans_customerReceipt' },
    { label: 'Opening Balance', id: 'trans_openingBalance' },
    { label: 'Main Cash', id: 'trans_mainCash' },
    { label: 'Reversal Entry', id: 'trans_reversalEntry' },
    { label: 'Payment Setoff', id: 'trans_paymentSetoff' },
    { label: 'Direct Bank Trans', id: 'trans_directBank' },
    { label: 'Funds Transfer', id: 'trans_fundsTransfer' },
    { label: 'Cheque Cancel', id: 'trans_chequeCancel' },
    { label: 'Cust Cheque Return', id: 'trans_customerChequeReturn' },
    { label: 'Cheque Book Entry', id: 'trans_chequeBookEntry' },
    { label: 'Cheque In Hand', id: 'trans_chequeInHand' },
    { label: 'Not Presented Chq', id: 'trans_notPresentedCheques' }
];

const utilityItems = [
    { label: 'Trial Balance', id: 'util_trialBalance' },
    { label: 'Account Balance', id: 'util_accountBalance' },
    { label: 'Reminders Setup', id: 'util_reminders' },
    { label: 'Reminder List', id: 'util_reminderList' },
    { label: 'Expenses Dash', id: 'util_expensesDashboard' },
    { label: 'AI Chatbot', id: 'util_aiChatbot' },
    { label: 'Quick Launch', id: 'util_quickLaunch' },
    { label: 'GTD Dashboard', id: 'util_gtdDashboard' }
];

const productActions = [
    { label: 'GRN Product Action', id: 'isAddProductLocked' },
    { label: 'PO Product Action', id: 'isAddProductLocked_PO' }
];

const systemManagementItems = [
    { label: 'System Logs', id: 'sys_logs' },
    { label: 'Server Health', id: 'sys_health' },
    { label: 'Database Config', id: 'sys_dbConfig' },
    { label: 'Security Policies', id: 'sys_security' },
    { label: 'API Integrations', id: 'sys_api' },
    { label: 'Email Settings', id: 'sys_email' },
    { label: 'SMS Gateway', id: 'sys_sms' },
    { label: 'Payment Gateway', id: 'sys_payment' },
    { label: 'Theme Config', id: 'sys_theme' },
    { label: 'Localization', id: 'sys_localization' },
    { label: 'License Mgmt', id: 'sys_license' },
    { label: 'Audit Trail', id: 'sys_audit' },
    { label: 'Session Mgmt', id: 'sys_session' },
    { label: 'Cache Control', id: 'sys_cache' },
    { label: 'Error Tracking', id: 'sys_error' },
    { label: 'Notification Rules', id: 'sys_notification' }
];

const SECTIONS = [
    { title: 'Master File Access Control', Icon: Layers, items: masterItems },
    { title: 'Admin Module Access Control', Icon: ShieldCheck, items: adminItems },
    { title: 'Transaction Module Access Control', Icon: ShoppingCart, items: transactionItems },
    { title: 'Reporting & Utility Access Control', Icon: BarChart2, items: utilityItems },
    { title: 'Transaction Action Controls', Icon: Settings, items: productActions },
    { title: 'System Management & Configuration', Icon: ShieldAlert, items: systemManagementItems }
];

const AdminConfigPanel = ({ entityType, entityCode, company }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [settings, setSettings] = useState({});
    const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, pendingLock: null });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isExpanded && Object.keys(settings).length === 0) {
            loadLocks();
        }
    }, [isExpanded]);

    const loadLocks = async () => {
        setLoading(true);
        try {
            const locksFromDb = await systemLocksService.getAllLocks(null, company, null);
            const initialState = {};
            const allItems = [...masterItems, ...adminItems, ...transactionItems, ...productActions, ...utilityItems, ...systemManagementItems];
            allItems.forEach(item => {
                let key = '';
                if (item.id === 'isAddProductLocked' || item.id === 'isAddProductLocked_PO') {
                    key = item.id;
                } else {
                    key = `isLocked_${item.id}`;
                }
                initialState[item.id] = locksFromDb[key] === true;
            });
            setSettings(initialState);
        } catch (err) {
            showErrorToast('Failed to load system locks');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id, label) => {
        setAuthModalConfig({
            isOpen: true,
            pendingLock: { id, label }
        });
    };

    const executeToggle = async () => {
        if (!authModalConfig.pendingLock) return;
        const { id, label } = authModalConfig.pendingLock;
        const newValue = !settings[id];
        let key = '';
        if (id === 'isAddProductLocked' || id === 'isAddProductLocked_PO') {
            key = id;
        } else {
            key = `isLocked_${id}`;
        }

        setSettings(prev => ({ ...prev, [id]: newValue }));
        showSuccessToast(`${label} ${newValue ? 'Locked' : 'Unlocked'} Successfully`);

        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const currentCompany = JSON.parse(localStorage.getItem('selectedCompany') || '{}');
            const empCode = currentUser?.EmpCode || currentUser?.empCode || currentUser?.emp_Code || currentUser?.id_No || currentUser?.Id_No || currentUser?.IdNo;
            const companyCode = currentCompany?.Company_Id || currentCompany?.code || currentCompany?.companyCode;

            if ((!company || company === companyCode) && companyCode) {
                localStorage.setItem(key, newValue ? 'true' : 'false');
                window.dispatchEvent(new Event('storage'));
            }
        } catch (e) {
            console.error("Error updating local storage:", e);
        }

        try {
            await systemLocksService.updateLock(key, newValue, null, company, null);
        } catch (err) {
            console.error("Failed to update lock on server", err);
        }

        setAuthModalConfig({ isOpen: false, pendingLock: null });
    };

    const renderItem = (item) => {
        const isLocked = settings[item.id] || false;
        return (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-blue-50/30 rounded-[3px] transition-all border border-transparent hover:border-blue-100/50 group">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-[32px] h-[32px] flex items-center justify-center transition-all duration-300 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm shrink-0 ${isLocked ? 'bg-red-50 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.2)]' : 'bg-[#f8fafd] text-[#0285fd] hover:bg-blue-50'}`}>
                        {isLocked ? <Lock size={14} strokeWidth={2.5} /> : <Unlock size={14} strokeWidth={2.5} />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide truncate">{item.label}</span>
                </div>
                <button
                    onClick={() => handleToggle(item.id, item.label)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-500 focus:outline-none shadow-inner border-2 shrink-0 ml-2 ${isLocked ? 'bg-red-500 border-red-600' : 'bg-slate-200 border-slate-300 hover:border-blue-300'}`}
                >
                    <div className={`absolute top-[1px] left-[1px] bg-white w-3.5 h-3.5 rounded-full transition-all duration-500 shadow-md flex items-center justify-center ${isLocked ? 'translate-x-[18px] scale-110' : 'translate-x-0'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-red-500' : 'bg-slate-300'}`} />
                    </div>
                </button>
            </div>
        );
    };

    const renderSection = (title, Icon, items) => {
        const count = items.filter(i => settings[i.id]).length;
        return (
            <div className="border border-slate-200 rounded-[3px] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
                    <Icon size={12} className="text-slate-400" />
                    <h4 className="text-[10px] font-[900] text-slate-600 uppercase tracking-[0.2em]">{title}</h4>
                    <span className="ml-auto text-[9px] text-slate-400 font-mono">{count}/{items.length} locked</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {items.map(renderItem)}
                </div>
            </div>
        );
    };

    const allItems = [...masterItems, ...adminItems, ...transactionItems, ...productActions, ...utilityItems, ...systemManagementItems];
    const lockedCount = allItems.filter(i => settings[i.id]).length;

    return (
        <div className="mt-4 border-t border-gray-200 pt-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-[3px] transition-all"
            >
                <div className="flex items-center gap-2">
                    <Settings size={14} className="text-slate-500" />
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Admin Config</span>
                    <span className="text-[9px] text-slate-400 font-mono">({lockedCount}/{allItems.length} locked)</span>
                </div>
                <div className="flex items-center gap-2">
                    {isExpanded && (
                        <button onClick={(e) => { e.stopPropagation(); loadLocks(); }} className="p-1 hover:bg-slate-200 rounded transition-all">
                            <RefreshCw size={12} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                </div>
            </button>

            {isExpanded && (
                <div className="mt-2">
                    <div className="bg-slate-50 p-2.5 rounded-[3px] border border-slate-200 shadow-sm shrink-0 mb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search setting names..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full h-7 pl-8 pr-8 text-[10px] border border-slate-300 rounded-[3px] bg-white outline-none focus:border-blue-400 transition-all font-['Tahoma']"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-all">
                                        <span className="text-[10px] font-bold">&times;</span>
                                    </button>
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                                {(() => {
                                    const total = allItems.length;
                                    const shown = SECTIONS.reduce((sum, s) => sum + s.items.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()) || i.id.toLowerCase().includes(searchQuery.toLowerCase())).length, 0);
                                    return searchQuery ? `${shown}/${total}` : `${total}`;
                                })()}
                            </span>
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-6 text-center text-[10px] text-slate-400 italic">Loading locks...</div>
                    ) : (
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
                            {SECTIONS.map(s => {
                                const filteredItems = s.items.filter(item => 
                                    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    item.id.toLowerCase().includes(searchQuery.toLowerCase())
                                );
                                if (filteredItems.length === 0) return null;
                                return renderSection(s.title, s.Icon, filteredItems);
                            })}
                        </div>
                    )}
                </div>
            )}

            <SystemUpdateAuthModal
                isOpen={authModalConfig.isOpen}
                onClose={() => setAuthModalConfig({ isOpen: false, pendingLock: null })}
                onVerified={executeToggle}
            />
        </div>
    );
};

export default AdminConfigPanel;
