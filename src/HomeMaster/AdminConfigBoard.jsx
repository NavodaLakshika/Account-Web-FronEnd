import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Building2, Users, Search, Lock, Unlock, X, Shield, ShieldOff, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import SystemUpdateAuthModal from '../components/modals/SystemAdmin/SystemUpdateAuthModal';

const ALL_MODULES = [
    {
        group: 'Master Files',
        color: 'blue',
        items: [
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
            { label: 'System Logoff', id: 'master_logoff' },
            { label: 'Create Area', id: 'master_area' },
            { label: 'Create Route', id: 'master_route' },
        ],
    },
    {
        group: 'Admin Tools',
        color: 'orange',
        items: [
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
            { label: 'Dashboard Access Lock', id: 'dashboardLock' },
        ],
    },
    {
        group: 'Transactions',
        color: 'green',
        items: [
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
            { label: 'Not Presented Chq', id: 'trans_notPresentedCheques' },
        ],
    },
    {
        group: 'Utilities',
        color: 'purple',
        items: [
            { label: 'Trial Balance', id: 'util_trialBalance' },
            { label: 'Account Balance', id: 'util_accountBalance' },
            { label: 'Reminders Setup', id: 'util_reminders' },
            { label: 'Reminder List', id: 'util_reminderList' },
            { label: 'Expenses Dashboard', id: 'util_expensesDashboard' },
            { label: 'AI Chatbot', id: 'util_aiChatbot' },
            { label: 'Quick Launch', id: 'util_quickLaunch' },
            { label: 'GTD Dashboard', id: 'util_gtdDashboard' },
        ],
    },
    {
        group: 'Product Actions',
        color: 'teal',
        items: [
            { label: 'GRN Product Action', id: 'isAddProductLocked' },
            { label: 'PO Product Action', id: 'isAddProductLocked_PO' },
        ],
    },
];

const COLOR_MAP = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
    green:  { bg: 'bg-emerald-50',icon: 'text-emerald-600',badge: 'bg-emerald-100 text-emerald-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
    teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   badge: 'bg-teal-100 text-teal-700' },
};

const AdminConfigBoard = ({ hierarchy, allEmployees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [globalSearch, setGlobalSearch] = useState('');
    const [lockedModules, setLockedModules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, pendingModule: null });

    const [showEmpModal, setShowEmpModal] = useState(false);
    const [showCompModal, setShowCompModal] = useState(false);
    const [empSearch, setEmpSearch] = useState('');
    const [compSearch, setCompSearch] = useState('');
    const [empSearchTriggered, setEmpSearchTriggered] = useState(false);
    const [compSearchTriggered, setCompSearchTriggered] = useState(false);

    const companies = useMemo(() => {
        if (!selectedEmployee) return [];
        const empNode = hierarchy.find(h => (h.empCode || h.emp_Code) === selectedEmployee);
        if (empNode && empNode.companies) {
            return empNode.companies.map(c => ({
                code: c.companyCode || c.company_Code,
                name: c.companyName || c.company_Name || c.comp_Name || 'Unknown Company'
            }));
        }
        return [];
    }, [selectedEmployee, hierarchy]);

    const selectedCompanyName = useMemo(() => {
        const comp = companies.find(c => c.code === selectedCompany);
        return comp ? comp.name : '';
    }, [selectedCompany, companies]);

    const selectedEmployeeName = useMemo(() => {
        if (!selectedEmployee) return '';
        const emp = allEmployees.find(e => (e.emp_Code || e.empCode) === selectedEmployee);
        return emp ? (emp.emp_Name || emp.empName || selectedEmployee) : selectedEmployee;
    }, [selectedEmployee, allEmployees]);

    const filteredEmployees = useMemo(() => {
        if (!empSearch) return allEmployees;
        return allEmployees.filter(e => {
            const name = (e.emp_Name || e.empName || '').toLowerCase();
            const code = (e.emp_Code || e.empCode || '').toLowerCase();
            return name.includes(empSearch.toLowerCase()) || code.includes(empSearch.toLowerCase());
        });
    }, [empSearch, allEmployees]);

    const filteredCompanies = useMemo(() => {
        if (!compSearch) return companies;
        return companies.filter(c =>
            c.name.toLowerCase().includes(compSearch.toLowerCase()) ||
            c.code.toLowerCase().includes(compSearch.toLowerCase())
        );
    }, [compSearch, companies]);

    useEffect(() => {
        if (selectedEmployee && selectedCompany) {
            setIsLoading(true);
            api.get(`/SuperAdmin/modules/hidden?empCode=${selectedEmployee}&companyCode=${selectedCompany}`)
                .then(res => setLockedModules(res.data || []))
                .catch(err => { console.error(err); showErrorToast('Failed to load module locks.'); })
                .finally(() => setIsLoading(false));
        } else {
            setLockedModules([]);
        }
    }, [selectedEmployee, selectedCompany]);

    const handleToggleLock = (e, moduleId, moduleLabel) => {
        e.stopPropagation();
        setAuthModalConfig({ isOpen: true, pendingModule: { moduleId, moduleLabel } });
    };

    const executeToggleLock = async () => {
        if (!authModalConfig.pendingModule) return;
        const { moduleId, moduleLabel } = authModalConfig.pendingModule;
        try {
            const res = await api.post('/SuperAdmin/modules/toggle-lock', {
                empCode: selectedEmployee,
                companyCode: selectedCompany,
                moduleId
            });
            if (res.data.locked) {
                setLockedModules(prev => [...prev, moduleId]);
                showSuccessToast(`'${moduleLabel}' is now locked 🔒`);
            } else {
                setLockedModules(prev => prev.filter(id => id !== moduleId));
                showSuccessToast(`'${moduleLabel}' is now unlocked 🔓`);
            }
        } catch (err) {
            console.error(err);
            showErrorToast('Failed to toggle module lock.');
        } finally {
            setAuthModalConfig({ isOpen: false, pendingModule: null });
        }
    };

    const lockedCount = lockedModules.length;
    const totalModules = ALL_MODULES.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white rounded-none-sm shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none bg-[#00acee]/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-[#00acee]" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-800">Admin Config — Module Access Control</h2>
                        <p className="text-[11px] text-slate-500 font-medium">Select an employee and company to lock or unlock specific modules</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200/60">
                    <div className="bg-white p-4 rounded-none-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="flex flex-col w-full sm:w-auto">
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Selection Target</span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-sm font-bold text-slate-700">
                                    {selectedEmployee ? selectedEmployeeName : 'No Employee Selected'}
                                </span>
                                <span className="hidden sm:inline text-slate-600 dark:text-slate-300">/</span>
                                <span className="text-sm font-bold text-[#00acee]">
                                    {selectedCompany ? selectedCompanyName : 'No Company Selected'}
                                </span>
                                {selectedEmployee && selectedCompany && (
                                    <span className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100">
                                        {lockedCount} / {totalModules} Locked
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => { setShowEmpModal(true); setEmpSearch(''); setEmpSearchTriggered(false); }}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-50 border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-none shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Users size={14} /> Employee
                            </button>
                            <button
                                onClick={() => { setShowCompModal(true); setCompSearch(''); setCompSearchTriggered(false); }}
                                disabled={!selectedEmployee}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-50 border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-none shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Building2 size={14} /> Company
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            {selectedCompany && (
                <div className="space-y-8">
                    {/* Search */}
                    <div className="bg-slate-50/50 p-3 rounded-none border border-slate-200/60 flex items-center">
                        <Search className="text-slate-500 dark:text-slate-400 ml-2 w-5 h-5 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search across all modules..."
                            value={globalSearch}
                            onChange={e => setGlobalSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full ml-3 placeholder:text-slate-500 dark:text-slate-400"
                        />
                        {globalSearch && (
                            <button onClick={() => setGlobalSearch('')} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <RefreshCw className="animate-spin text-[#00acee] w-8 h-8" />
                        </div>
                    ) : (
                        ALL_MODULES.map((group, gIdx) => {
                            const colors = COLOR_MAP[group.color] || COLOR_MAP.blue;
                            const filteredItems = group.items.filter(item =>
                                item.label.toLowerCase().includes(globalSearch.toLowerCase())
                            );
                            if (filteredItems.length === 0) return null;

                            return (
                                <div key={gIdx}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-8 h-8 rounded-none ${colors.bg} flex items-center justify-center`}>
                                            <Shield size={16} className={colors.icon} />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">{group.group}</h3>
                                        <span className={`ml-1 px-2 py-0.5 rounded-none text-[10px] font-bold ${colors.badge}`}>
                                            {filteredItems.filter(i => lockedModules.includes(i.id)).length} locked
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {filteredItems.map((item, idx) => {
                                            const isLocked = lockedModules.includes(item.id);
                                            return (
                                                <div key={idx} className="relative group">
                                                    <div className={`w-full bg-white shadow-sm border p-5 transition-all ${isLocked ? 'border-red-200 opacity-60 grayscale' : 'border-slate-200/50 hover:border-slate-400 hover:shadow-lg'}`}>
                                                        <div className={`w-10 h-10 rounded-none flex items-center justify-center mb-3 ${isLocked ? 'bg-red-50' : `${colors.bg} group-hover:scale-110 transition-transform`}`}>
                                                            {isLocked
                                                                ? <Lock className="w-5 h-5 text-red-500" />
                                                                : <Unlock className={`w-5 h-5 ${colors.icon}`} />
                                                            }
                                                        </div>
                                                        <h4 className="text-[13px] font-bold text-slate-900 mb-1.5 line-clamp-1" title={item.label}>{item.label}</h4>
                                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                            {isLocked ? '🔒 Access blocked for this user' : '✅ Access allowed for this user'}
                                                        </p>
                                                        <div className={`mt-3 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 ${isLocked ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                            {isLocked ? 'Click to Unlock' : 'Click to Lock'}
                                                        </div>
                                                    </div>

                                                    {/* Toggle Lock Button */}
                                                    <button
                                                        onClick={e => handleToggleLock(e, item.id, item.label)}
                                                        title={isLocked ? 'Unlock Module' : 'Lock Module'}
                                                        className={`absolute top-3 right-3 p-2 rounded-none transition-all opacity-0 group-hover:opacity-100 ${isLocked ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100' : 'bg-slate-50 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                                    >
                                                        {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {selectedEmployee && !selectedCompany && (
                <div className="bg-slate-50 border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <Building2 className="w-12 h-12 text-slate-600 dark:text-slate-300 mb-3" />
                    <h3 className="text-[15px] font-bold text-slate-600">Select a Company</h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                        Choose a company to configure module access for {selectedEmployeeName}.
                    </p>
                </div>
            )}

            {!selectedEmployee && (
                <div className="bg-slate-50 border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-slate-600 dark:text-slate-300 mb-3" />
                    <h3 className="text-[15px] font-bold text-slate-600">Select an Employee</h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                        Choose an employee to configure their module access permissions.
                    </p>
                </div>
            )}

            {/* Employee Selection Modal */}
            {showEmpModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-100 dark:bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-none-sm shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-[13px] font-bold tracking-wide uppercase text-slate-900">Select Employee</h3>
                            <button onClick={() => setShowEmpModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-visible">
                            <div className="flex flex-col gap-4 relative z-20">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Employee</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 text-slate-500 dark:text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Employee..."
                                        value={empSearch}
                                        onChange={e => { setEmpSearch(e.target.value); setEmpSearchTriggered(false); }}
                                        onKeyDown={e => e.key === 'Enter' && setEmpSearchTriggered(true)}
                                        className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-none text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setEmpSearchTriggered(true)}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-slate-800 dark:text-white text-[11px] font-bold uppercase tracking-wider rounded-none transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>
                                    {empSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white rounded-none-sm shadow-2xl max-h-[250px] overflow-y-auto">
                                            {filteredEmployees.map(e => {
                                                const code = e.emp_Code || e.empCode;
                                                const name = e.emp_Name || e.empName;
                                                const roleId = e.userRole_Id || e.role;
                                                const roleName = roleId === 99 ? 'Super Admin' : roleId === 1 ? 'Admin' : roleId === 2 ? 'Accountant' : roleId === 3 ? 'Data Entry' : `Role ${roleId}`;
                                                return (
                                                    <div
                                                        key={code}
                                                        onClick={() => {
                                                            setSelectedEmployee(code);
                                                            setSelectedCompany('');
                                                            setShowEmpModal(false);
                                                            setEmpSearch('');
                                                            setEmpSearchTriggered(false);
                                                        }}
                                                        className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all text-slate-600 hover:bg-slate-50 font-medium"
                                                    >
                                                        {name} <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">[{roleName}]</span>
                                                    </div>
                                                );
                                            })}
                                            {filteredEmployees.length === 0 && (
                                                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No employees found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Company Selection Modal */}
            {showCompModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-100 dark:bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-none-sm shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-none-t-2xl">
                            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Select Company</h3>
                            <button onClick={() => setShowCompModal(false)} className="w-8 h-8 flex items-center justify-center rounded-none text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-visible">
                            <div className="flex flex-col gap-4 relative z-20">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Company</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 text-slate-500 dark:text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Company..."
                                        value={compSearch}
                                        onChange={e => { setCompSearch(e.target.value); setCompSearchTriggered(false); }}
                                        onKeyDown={e => e.key === 'Enter' && setCompSearchTriggered(true)}
                                        className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-none text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setCompSearchTriggered(true)}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-slate-800 dark:text-white text-[11px] font-bold uppercase tracking-wider rounded-none transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>
                                    {compSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white rounded-none-sm shadow-2xl max-h-[250px] overflow-y-auto">
                                            {filteredCompanies.map(c => (
                                                <div
                                                    key={c.code}
                                                    onClick={() => { setSelectedCompany(c.code); setShowCompModal(false); setCompSearch(''); setCompSearchTriggered(false); }}
                                                    className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all text-slate-600 hover:bg-slate-50 font-medium"
                                                >
                                                    {c.name}
                                                </div>
                                            ))}
                                            {filteredCompanies.length === 0 && (
                                                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                                    {companies.length === 0 ? 'No companies available for this employee.' : 'No companies match your search.'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <SystemUpdateAuthModal
                isOpen={authModalConfig.isOpen}
                onClose={() => setAuthModalConfig({ isOpen: false, pendingModule: null })}
                onVerified={executeToggleLock}
            />
        </div>
    );
};

export default AdminConfigBoard;






