import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Settings, Shield, Users, Building, Plus, Trash2, CheckCircle, Save, X, Lock , FileText} from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const SystemSettingsBoard = ({ isOpen = true, onClose, isInline = false }) => {
    const allModules = [
        { group: 'Master Files', items: [
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
        ]},
        { group: 'Admin Tools', items: [
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
        ]},
        { group: 'Transactions', items: [
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
        ]},
        { group: 'Utilities', items: [
            { label: 'Trial Balance', id: 'util_trialBalance' },
            { label: 'Account Balance', id: 'util_accountBalance' },
            { label: 'Reminders Setup', id: 'util_reminders' },
            { label: 'Reminder List', id: 'util_reminderList' },
            { label: 'Expenses Dash', id: 'util_expensesDashboard' },
            { label: 'AI Chatbot', id: 'util_aiChatbot' },
            { label: 'Quick Launch', id: 'util_quickLaunch' },
            { label: 'GTD Dashboard', id: 'util_gtdDashboard' }
        ]},
        { group: 'Product Actions', items: [
            { label: 'GRN Product Action', id: 'isAddProductLocked' },
            { label: 'PO Product Action', id: 'isAddProductLocked_PO' }
        ]},
        { group: 'System Management', items: [
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
        ]}
    ];

    const [activeTab, setActiveTab] = useState('profiles'); // 'profiles' or 'assignments'
    
    // Data states
    const [profiles, setProfiles] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Editing states
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [profileName, setProfileName] = useState('');
    const [profileDesc, setProfileDesc] = useState('');
    const [lockedModules, setLockedModules] = useState({});

    // Assignment form states
    const [assignEmpCode, setAssignEmpCode] = useState('');
    const [assignProfileId, setAssignProfileId] = useState('');
    const [assignIsGlobal, setAssignIsGlobal] = useState(true);
    const [assignCompanies, setAssignCompanies] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadAllData();
        }
    }, [isOpen]);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [profRes, assRes, empRes, compRes] = await Promise.all([
                api.get('/SystemLocks/profiles'),
                api.get('/SystemLocks/assignments'),
                api.get('/superadmin/employees'),
                api.get('/superadmin/companies')
            ]);
            setProfiles(profRes.data || []);
            setAssignments(assRes.data || []);
            setEmployees(empRes.data || []);
            setCompanies(compRes.data || []);
        } catch (error) {
            console.error(error);
            showErrorToast('Failed to load security configurations.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Profile Management ---
    
    const handleSelectProfile = async (id) => {
        try {
            const res = await api.get(`/SystemLocks/profiles/${id}`);
            const data = res.data;
            setSelectedProfileId(data.profile.id);
            setProfileName(data.profile.profileName);
            setProfileDesc(data.profile.description || '');
            
            const locksObj = {};
            data.locks.forEach(l => {
                locksObj[l.moduleId] = l.isLocked;
            });
            setLockedModules(locksObj);
        } catch (error) {
            showErrorToast('Failed to load profile details.');
        }
    };

    const handleCreateNewProfile = () => {
        setSelectedProfileId(null);
        setProfileName('');
        setProfileDesc('');
        setLockedModules({});
    };

    const handleToggleModule = (moduleId) => {
        setLockedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleSaveProfile = async () => {
        if (!profileName.trim()) {
            showErrorToast('Profile name is required.');
            return;
        }

        const lockedIds = Object.keys(lockedModules).filter(k => lockedModules[k]);
        
        try {
            const payload = {
                profileName,
                description: profileDesc,
                lockedModules: lockedIds
            };

            if (selectedProfileId) {
                await api.put(`/SystemLocks/profiles/${selectedProfileId}`, payload);
                showSuccessToast('Profile updated successfully.');
            } else {
                const res = await api.post('/SystemLocks/profiles', payload);
                setSelectedProfileId(res.data.id);
                showSuccessToast('Profile created successfully.');
            }
            loadAllData();
        } catch (error) {
            showErrorToast('Failed to save profile.');
        }
    };

    const handleDeleteProfile = async (id) => {
        if (!window.confirm('Are you sure you want to delete this profile? Employees using it will lose their restrictions.')) return;
        try {
            await api.delete(`/SystemLocks/profiles/${id}`);
            showSuccessToast('Profile deleted.');
            if (selectedProfileId === id) handleCreateNewProfile();
            loadAllData();
        } catch (error) {
            showErrorToast('Failed to delete profile.');
        }
    };

    // --- Assignment Management ---

    const handleToggleCompanyForAssign = (compCode) => {
        setAssignCompanies(prev => 
            prev.includes(compCode) 
                ? prev.filter(c => c !== compCode) 
                : [...prev, compCode]
        );
    };

    const handleSaveAssignment = async () => {
        if (!assignEmpCode || !assignProfileId) {
            showErrorToast('Please select both an Employee and a Profile.');
            return;
        }
        if (!assignIsGlobal && assignCompanies.length === 0) {
            showErrorToast('Please select at least one company, or choose Global Access.');
            return;
        }

        try {
            await api.post('/SystemLocks/assignments', {
                emp_Code: assignEmpCode,
                profileId: parseInt(assignProfileId),
                isGlobal: assignIsGlobal,
                companies: assignCompanies
            });
            showSuccessToast('Profile assigned successfully.');
            setAssignEmpCode('');
            setAssignCompanies([]);
            loadAllData();
        } catch (error) {
            showErrorToast('Failed to save assignment.');
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm('Remove this profile assignment?')) return;
        try {
            await api.delete(`/SystemLocks/assignments/${id}`);
            showSuccessToast('Assignment removed.');
            loadAllData();
        } catch (error) {
            showErrorToast('Failed to remove assignment.');
        }
    };

    const content = (
        <div className="h-[80vh] flex flex-col bg-white dark:bg-slate-100 dark:bg-slate-900 rounded-[3px] overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-100 dark:bg-slate-900/50">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-800 dark:text-white flex items-center gap-2">
                        <Shield className="text-[#0078d4]" />
                        Security Profiles & Roles
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage enterprise-wide security templates and assign them across 100+ companies effortlessly.
                    </p>
                </div>
                {!isInline && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-[3px] transition-colors">
                        <X className="text-slate-500" />
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                <button
                    onClick={() => setActiveTab('profiles')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${activeTab === 'profiles' ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-600 dark:text-slate-300'}`}
                >
                    <Settings className="inline-block w-4 h-4 mr-2" />
                    Manage Profiles
                </button>
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${activeTab === 'assignments' ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-600 dark:text-slate-300'}`}
                >
                    <Users className="inline-block w-4 h-4 mr-2" />
                    Assign Profiles
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex bg-slate-50 dark:bg-slate-100 dark:bg-slate-900">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0078d4]"></div>
                    </div>
                ) : activeTab === 'profiles' ? (
                    // Profiles Tab
                    <div className="flex w-full h-full">
                        {/* Sidebar: Profile List */}
                        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-100 dark:bg-slate-900 overflow-y-auto">
                            <div className="p-4">
                                <button 
                                    onClick={handleCreateNewProfile}
                                    className="w-full py-2 px-4 bg-[#0078d4] hover:bg-[#006cbd] text-slate-800 dark:text-white rounded-[3px] flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                                >
                                    <Plus size={16} /> New Profile
                                </button>
                            </div>
                            <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                {profiles.map(p => (
                                    <div 
                                        key={p.id}
                                        onClick={() => handleSelectProfile(p.id)}
                                        className={`p-3 mb-1 rounded-[3px] cursor-pointer flex items-center justify-between group ${selectedProfileId === p.id ? 'bg-[#0078d4]/10 text-[#0078d4]' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-600 dark:text-slate-300'}`}
                                    >
                                        <span className="font-medium text-sm truncate">{p.profileName}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id); }}
                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main: Profile Editor */}
                        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-100 dark:bg-slate-900 overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-100 dark:bg-slate-900">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-800 dark:text-white mb-4">
                                    {selectedProfileId ? 'Edit Profile' : 'Create New Profile'}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Profile Name</label>
                                        <input 
                                            type="text" 
                                            value={profileName}
                                            onChange={e => setProfileName(e.target.value)}
                                            placeholder="e.g. Branch Manager"
                                            className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                                        <input 
                                            type="text" 
                                            value={profileDesc}
                                            onChange={e => setProfileDesc(e.target.value)}
                                            placeholder="Optional description..."
                                            className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-600 dark:text-slate-300">Module Restrictions</h4>
                                    <span className="text-xs text-slate-500">Toggle switch ON to <strong className="text-red-500">Lock</strong> the module.</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {allModules.map((group, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[3px] p-4 shadow-sm">
                                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{group.group}</h5>
                                            <div className="space-y-2">
                                                {group.items.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                        <span className="text-[13px] text-slate-700 dark:text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                            {lockedModules[item.id] ? <Lock size={12} className="text-red-500"/> : <CheckCircle size={12} className="text-green-500"/>}
                                                            {item.label}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleToggleModule(item.id)}
                                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${lockedModules[item.id] ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                        >
                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${lockedModules[item.id] ? 'translate-x-5' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-100 dark:bg-slate-900 flex justify-end">
                                <button 
                                    onClick={handleSaveProfile}
                                    className="px-6 py-2 bg-[#0078d4] hover:bg-[#006cbd] text-slate-800 dark:text-white rounded-[3px] font-medium flex items-center gap-2 transition-colors shadow-lg shadow-[#0078d4]/20"
                                >
                                    <Save size={16} /> Save Profile
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Assignments Tab
                    <div className="w-full h-full p-6 flex gap-6 overflow-hidden">
                        {/* Assignment Form */}
                        <div className="w-1/3 flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[3px] shadow-sm p-6 overflow-y-auto">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-800 dark:text-white mb-6">Assign Profile</h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-600 dark:text-slate-300 mb-1">Select Employee</label>
                                    <select 
                                        value={assignEmpCode}
                                        onChange={e => setAssignEmpCode(e.target.value)}
                                        className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100"
                                    >
                                        <option value="">-- Choose Employee --</option>
                                        {employees.map(e => (
                                            <option key={e.emp_Code || e.Emp_Code} value={e.emp_Code || e.Emp_Code}>{(e.emp_Name || e.Emp_Name)} ({e.emp_Code || e.Emp_Code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-600 dark:text-slate-300 mb-1">Select Security Profile</label>
                                    <select 
                                        value={assignProfileId}
                                        onChange={e => setAssignProfileId(e.target.value)}
                                        className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100"
                                    >
                                        <option value="">-- Choose Profile --</option>
                                        {profiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.profileName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-[3px] bg-slate-50 dark:bg-slate-100 dark:bg-slate-900/50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={assignIsGlobal}
                                            onChange={e => {
                                                setAssignIsGlobal(e.target.checked);
                                                if(e.target.checked) setAssignCompanies([]);
                                            }}
                                            className="w-4 h-4 text-[#0078d4] rounded"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-600 dark:text-slate-300">Global Access (All Companies)</span>
                                    </label>
                                </div>

                                {!assignIsGlobal && (
                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-2">
                                            <Building size={14}/> Select Target Companies
                                        </label>
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-[3px] max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-100 dark:bg-slate-900">
                                            {companies.map(c => {
                                                const code = c.company_Code || c.Code || c.code;
                                                const name = c.company_Name || c.Comp_Name || c.comp_Name || code;
                                                return (
                                                <label key={code} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={assignCompanies.includes(code)}
                                                        onChange={() => handleToggleCompanyForAssign(code)}
                                                        className="w-4 h-4 text-[#0078d4] rounded"
                                                    />
                                                    <span className="text-[13px] text-slate-700 dark:text-slate-600 dark:text-slate-300">{name}</span>
                                                </label>
                                                );
                                            })}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-2 text-right">
                                            {assignCompanies.length} companies selected
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleSaveAssignment}
                                    className="w-full py-2.5 bg-[#0078d4] hover:bg-[#006cbd] text-slate-800 dark:text-white rounded-[3px] font-medium shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
                                >
                                    <CheckCircle size={16} /> Assign Policy
                                </button>
                            </div>
                        </div>

                        {/* Active Assignments List */}
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[3px] shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-100 dark:bg-slate-900/50">
                                <h3 className="font-bold text-slate-800 dark:text-slate-800 dark:text-white">Active Assignments</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {assignments.length === 0 ? (
                                    <div className="text-center text-slate-500 mt-10 text-sm">No profiles assigned yet.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {assignments.map(a => {
                                            const emp = employees.find(e => e.emp_Code === a.emp_Code);
                                            const prof = profiles.find(p => p.id === a.profileId);
                                            
                                            return (
                                                <div key={a.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-[3px] hover:border-[#0078d4] transition-colors flex items-start justify-between bg-slate-50 dark:bg-slate-100 dark:bg-slate-900/50">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {(() => { 
                                                                const emp = employees.find(e => (e.emp_Code || e.Emp_Code) === a.emp_Code);
                                                                const empName = emp ? (emp.emp_Name || emp.Emp_Name) : a.emp_Code;
                                                                const prof = profiles.find(p => p.id === a.profileId);
                                                                return (
                                                                    <>
                                                                        <span className="font-bold text-slate-800 dark:text-slate-800 dark:text-white">{empName}</span>
                                                                        <span className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                                            {prof ? prof.profileName : 'Unknown Profile'}
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                                                            <Building size={12} />
                                                            {a.isGlobal ? 'Global Access (All Companies)' : `Restricted to ${a.allowedCompanies?.split(',').length || 0} Companies`}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteAssignment(a.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                        title="Revoke Assignment"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (isInline) return content;

    return (
        <TransactionFormWrapper subtitle="Transaction Management" icon={FileText} isOpen={isOpen} onClose={onClose} width="max-w-[1200px]" height="h-[80vh]">
            {content}
        </TransactionFormWrapper>
    );
};

export default SystemSettingsBoard;




