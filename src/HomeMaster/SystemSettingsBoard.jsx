import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Settings, Lock, Unlock, ShieldAlert, CheckCircle, X, Layers, ShieldCheck, ShoppingCart, Search, BarChart2 } from 'lucide-react';
import { systemLocksService } from '../services/systemLocks.service';
import api from '../services/api';
import SystemUpdateAuthModal from '../components/modals/SystemAdmin/SystemUpdateAuthModal';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const SystemSettingsBoard = ({ isOpen = true, onClose, isInline = false }) => {
    // List of all keys we manage
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
        { label: 'System Logoff Action', id: 'master_logoff' },
        { label: 'Create Area', id: 'master_area' },
        { label: 'Create Route', id: 'master_route' }
    ];

    const adminItems = [
        { label: 'Data Backup', id: 'backup' },
        { label: 'Stock Balance Update', id: 'stockUpdate' },
        { label: 'Inventory Download', id: 'inventoryDownload' },
        { label: 'Delete Account', id: 'deleteAccount' },
        { label: 'Transaction Search', id: 'search' },
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

    const [settings, setSettings] = useState({});
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, pendingLock: null });
    const [globalSearch, setGlobalSearch] = useState('');

    // Filter states
    const [companies, setCompanies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [systemRoles, setSystemRoles] = useState([]);
    const [empSearch, setEmpSearch] = useState('');
    const [compSearch, setCompSearch] = useState('');
    const [empSearchTriggered, setEmpSearchTriggered] = useState(false);
    const [compSearchTriggered, setCompSearchTriggered] = useState(false);

    const loadLocks = async () => {
        try {
            const locksFromDb = await systemLocksService.getAllLocks(selectedEmployee, selectedCompany, null);
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
        } catch (error) {
            console.error("Failed to fetch locks from server", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadLocks();
        }
    }, [isOpen, selectedEmployee, selectedCompany]);

    useEffect(() => {
        // Fetch selection data
        api.get('/SuperAdmin/companies').then(res => setCompanies(res.data)).catch(console.error);
        api.get('/SuperAdmin/employees').then(res => setEmployees(res.data)).catch(console.error);
        api.get('/SuperAdmin/hierarchy').then(res => setHierarchy(res.data)).catch(console.error);
        api.get('/UserRole/system-roles').then(res => {
            const roles = (res.data || []).map(r => ({
                id: r.id || r.Id,
                name: r.name || r.Name
            }));
            setSystemRoles(roles);
        }).catch(console.error);
    }, []);

    // Filter companies based on selected employee
    const getAvailableCompanies = () => {
        if (!selectedEmployee) return companies;
        const empNode = hierarchy.find(h => h.empCode === selectedEmployee || h.emp_Code === selectedEmployee);
        if (empNode && empNode.companies) {
            return empNode.companies.map(c => ({
                code: c.companyCode || c.company_Code,
                comp_Name: c.companyName || c.company_Name
            }));
        }
        return [];
    };

    const availableCompanies = getAvailableCompanies();

    useEffect(() => {
        if (selectedCompany && !availableCompanies.find(c => c.code === selectedCompany)) {
            setSelectedCompany('');
        }
    }, [selectedEmployee, availableCompanies, selectedCompany]);

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
        
        // Optimistic UI update
        setSettings(prev => ({ ...prev, [id]: newValue }));
        showSuccessToast(`${label} ${newValue ? 'Locked' : 'Unlocked'} Successfully`);

        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const currentCompany = JSON.parse(localStorage.getItem('selectedCompany') || '{}');
            const empCode = currentUser?.EmpCode || currentUser?.empCode || currentUser?.emp_Code || currentUser?.id_No || currentUser?.Id_No || currentUser?.IdNo;
            const companyCode = currentCompany?.Company_Id || currentCompany?.code || currentCompany?.companyCode;

            const isGlobal = !selectedEmployee && !selectedCompany;
            const isMatch = (selectedEmployee === empCode || !selectedEmployee) && (selectedCompany === companyCode || !selectedCompany);

            if (isGlobal || isMatch) {
                localStorage.setItem(key, newValue ? 'true' : 'false');
                // Dispatch event so other components can react
                window.dispatchEvent(new Event('storage'));
            }
        } catch (e) {
            console.error("Error updating local storage:", e);
        }

        // Push to server
        try {
            await systemLocksService.updateLock(key, newValue, selectedEmployee, selectedCompany, null);
        } catch (err) {
            console.error("Failed to update lock on server", err);
        }
        
        setAuthModalConfig({ isOpen: false, pendingLock: null });
    };

    const renderItem = (item) => {
        const isLocked = settings[item.id] || false;
        return (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-blue-50/30 rounded-lg transition-all border border-transparent hover:border-blue-100/50 group">
                <div className="flex items-center gap-2.5">
                    <div className={`w-[32px] h-[32px] flex items-center justify-center transition-all duration-300 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm ${isLocked ? 'bg-red-50 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.2)]' : 'bg-[#f8fafd] text-[#0285fd] hover:bg-blue-50'}`}>
                        {isLocked ? <Lock size={14} strokeWidth={2.5} /> : <Unlock size={14} strokeWidth={2.5} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide line-clamp-1">{item.label}</span>
                    </div>
                </div>

                <button
                    onClick={() => handleToggle(item.id, item.label)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-500 focus:outline-none shadow-inner border-2 shrink-0 ${isLocked ? 'bg-red-500 border-red-600' : 'bg-slate-200 border-slate-300 hover:border-blue-300'}`}
                >
                    <div className={`absolute top-[1px] left-[1px] bg-white w-3.5 h-3.5 rounded-full transition-all duration-500 shadow-md flex items-center justify-center ${isLocked ? 'translate-x-[18px] scale-110' : 'translate-x-0'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-red-500' : 'bg-slate-300'}`} />
                    </div>
                </button>
            </div>
        );
    };

    const chunkArray = (arr, size) => {
        const chunked = [];
        for (let i = 0; i < arr.length; i += size) {
            chunked.push(arr.slice(i, i + size));
        }
        return chunked;
    };

    const renderSection = (title, IconComponent, items) => {
        const filteredItems = items.filter(item => 
            item.label.toLowerCase().includes(globalSearch.toLowerCase()) || 
            item.id.toLowerCase().includes(globalSearch.toLowerCase())
        );
        if (filteredItems.length === 0) return null;
        
        const chunks = chunkArray(filteredItems, 8);
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/80 rounded-[10px] border border-slate-100 shadow-sm sticky top-0 z-10 mx-2">
                    <h4 className="text-[12px] font-[900] text-slate-700 uppercase tracking-[0.25em]">{title}</h4>
                </div>
                <div className="flex flex-col gap-4 px-2">
                    {chunks.map((chunk, idx) => (
                        <div key={idx} className="border-2 border-slate-100 rounded-xl p-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-blue-100 hover:shadow-md transition-all duration-300">
                            <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                                {chunk.map(renderItem)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const content = (
        <div className="font-sans flex flex-col h-full overflow-hidden p-4">
            {isInline && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 shrink-0 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Settings className="text-[#00acee]" size={20} />
                            System Admin Configuration
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">Configure global locks and access control restrictions for specific targets.</p>
                    </div>
                </div>
            )}
            <div className="bg-slate-50 p-4 mb-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shrink-0">
                <div className="flex flex-col w-full sm:w-auto">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Configuration Target</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-sm font-bold text-slate-700">
                            {selectedEmployee ? employees.find(e => e.emp_Code === selectedEmployee)?.empName || employees.find(e => e.emp_Code === selectedEmployee)?.emp_Name || selectedEmployee : 'Global Employees'}
                        </span>
                        <span className="hidden sm:inline text-slate-300">/</span>
                        <span className="text-sm font-bold text-[#00acee]">
                            {selectedCompany ? companies.find(c => c.code === selectedCompany || c.companyCode === selectedCompany)?.companyName || selectedCompany : 'Global Companies'}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setShowTargetModal(true)} 
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all shrink-0"
                >
                    Change Target
                </button>
            </div>

            <div className="px-1 mb-4 shrink-0">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search configuration items..." 
                        className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all shadow-sm font-['Tahoma']"
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-y-auto no-scrollbar pr-2 flex-grow space-y-10 pb-6 opacity-100 transition-opacity">
                {renderSection('Master File Access Control', Layers, masterItems)}
                {renderSection('Admin Module Access Control', ShieldCheck, adminItems)}
                {renderSection('Transaction Module Access Control', ShoppingCart, transactionItems)}
                {renderSection('Reporting & Utility Access Control', BarChart2, utilityItems)}
                {renderSection('Transaction Action Controls', Settings, productActions)}
                {renderSection('System Management & Configuration', ShieldAlert, systemManagementItems)}
            </div>
        </div>
    );

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
        {isInline ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200 h-full max-h-[82vh]">
                {content}
            </div>
        ) : (
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="SYSTEM ADMIN CONFIGURATION"
                maxWidth="max-w-[1250px]"
                showHeaderClose={true}
            >
                {content}
            </SimpleModal>
        )}

        {/* Target Selection Sub-Modal */}
        {showTargetModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Select Target Scope</h3>
                        <button onClick={() => setShowTargetModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="p-6 flex flex-col gap-5 h-full max-h-[70vh] overflow-visible">
                        
                        <div className="flex flex-col gap-4 relative z-20">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Employee</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search Employee..." 
                                    value={empSearch}
                                    onChange={e => {
                                        setEmpSearch(e.target.value);
                                        setEmpSearchTriggered(false);
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && setEmpSearchTriggered(true)}
                                    className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-xl text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                />
                                <button 
                                    onClick={() => setEmpSearchTriggered(true)}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                >
                                    Load
                                </button>
                                
                                {empSearchTriggered && (
                                    <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto flex flex-col">
                                        <div 
                                            onClick={() => {
                                                setSelectedEmployee('');
                                                setEmpSearch('-- All Employees (Global) --');
                                                setEmpSearchTriggered(false);
                                                setSelectedCompany('');
                                                setCompSearch('-- All Companies (Global) --');
                                            }}
                                            className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all bg-[#00acee]/5 text-[#00acee] font-bold hover:bg-[#00acee]/10"
                                        >
                                            -- All Employees (Global) --
                                        </div>
                                        {(() => {
                                            const filteredEmployees = employees.filter(e => (e.emp_Name || e.empName || '').toLowerCase().includes(empSearch.toLowerCase()) || (e.emp_Code || '').toLowerCase().includes(empSearch.toLowerCase()));
                                            return (
                                                <>
                                                    {filteredEmployees.map(e => {
                                                        const roleName = systemRoles.find(r => r.id === e.userRole_Id || r.id === e.role)?.name || 'No Role';
                                                        return (
                                                            <div 
                                                                key={e.emp_Code}
                                                                onClick={() => {
                                                                    setSelectedEmployee(e.emp_Code);
                                                                    setEmpSearch(e.emp_Name || e.empName);
                                                                    setEmpSearchTriggered(false);
                                                                    
                                                                    // Auto-load & auto-select company
                                                                    const empNode = hierarchy.find(h => h.empCode === e.emp_Code || h.emp_Code === e.emp_Code);
                                                                    if (empNode && empNode.companies && empNode.companies.length === 1) {
                                                                        setSelectedCompany(empNode.companies[0].companyCode || empNode.companies[0].company_Code);
                                                                        setCompSearch(empNode.companies[0].companyName || empNode.companies[0].company_Name);
                                                                    } else {
                                                                        setSelectedCompany('');
                                                                        setCompSearch('');
                                                                    }
                                                                }}
                                                                className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all text-slate-600 hover:bg-slate-50 font-medium"
                                                            >
                                                                {e.emp_Name || e.empName} <span className="text-slate-400 font-normal ml-1">[{roleName}]</span>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 relative z-10 mt-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Company</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search Company..." 
                                    value={compSearch}
                                    onChange={e => {
                                        setCompSearch(e.target.value);
                                        setCompSearchTriggered(false);
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && setCompSearchTriggered(true)}
                                    className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-xl text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                />
                                <button 
                                    onClick={() => setCompSearchTriggered(true)}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                >
                                    Load
                                </button>

                                {compSearchTriggered && (
                                    <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto flex flex-col">
                                        <div 
                                            onClick={() => {
                                                setSelectedCompany('');
                                                setCompSearch('-- All Companies (Global) --');
                                                setCompSearchTriggered(false);
                                            }}
                                            className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all bg-[#00acee]/5 text-[#00acee] font-bold hover:bg-[#00acee]/10"
                                        >
                                            -- All Companies (Global) --
                                        </div>
                                        {(() => {
                                            const filteredCompanies = availableCompanies.filter(c => (c.comp_Name || c.companyName || c.code || '').toLowerCase().includes(compSearch.toLowerCase()));
                                            return (
                                                <>
                                                    {filteredCompanies.map(c => (
                                                        <div 
                                                            key={c.code}
                                                            onClick={() => {
                                                                setSelectedCompany(c.code);
                                                                setCompSearch(c.comp_Name || c.companyName || c.code);
                                                                setCompSearchTriggered(false);
                                                            }}
                                                            className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all text-slate-600 hover:bg-slate-50 font-medium"
                                                        >
                                                            {c.comp_Name || c.companyName || c.code}
                                                        </div>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button onClick={() => setShowTargetModal(false)} className="w-full py-3 mt-4 bg-[#00acee] hover:bg-[#009adb] text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] shrink-0">
                            Apply Target Configuration
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        <SystemUpdateAuthModal
            isOpen={authModalConfig.isOpen}
            onClose={() => setAuthModalConfig({ isOpen: false, pendingLock: null })}
            onVerified={executeToggle}
        />
        </>
    );
};

export default SystemSettingsBoard;
