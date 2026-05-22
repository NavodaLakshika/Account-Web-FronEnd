const fs = require('fs');

const original = fs.readFileSync('src/HomeMaster/SystemSettingsBoard.jsx', 'utf8');

const targetContent = `import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/modals/SimpleModal';
import { Settings, Lock, Unlock, ShieldAlert, CheckCircle, X, Layers, ShieldCheck, ShoppingCart, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { systemLocksService } from '../services/systemLocks.service';
import api from '../services/api';

const SystemSettingsBoard = ({ isOpen, onClose }) => {
    // List of all keys we manage
    const masterItems = [
        { label: 'Open Company', id: 'master_company' },
        { label: 'Cost Center Master', id: 'master_costCenter' },
        { label: 'Create Department', id: 'master_department' },
        { label: 'Create Category', id: 'master_category' },
        { label: 'Supplier Master', id: 'master_supplier' },
        { label: 'Customer Master', id: 'master_customer' },
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
        { label: 'Transaction Search', id: 'search' },
        { label: 'Document Editor', id: 'journalEditor' },
        { label: 'Transaction Editor', id: 'transactionEditor' },
        { label: 'System Update', id: 'update' },
        { label: 'Clear Temp Data', id: 'clear' },
        { label: 'Period Lock Facility', id: 'lock' },
        { label: 'Admin Change Pwd', id: 'changePassword' },
        { label: 'User & Role Mgmt', id: 'users' }
    ];

    const transactionItems = [
        { label: 'Purchase Order', id: 'trans_po' },
        { label: 'GRN', id: 'trans_grn' },
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
        { label: 'Write Cheque', id: 'trans_writeCheque' }
    ];

    const productActions = [
        { label: 'GRN Product Action', id: 'isAddProductLocked' },
        { label: 'PO Product Action', id: 'isAddProductLocked_PO' }
    ];

    const [settings, setSettings] = useState({});
    const [showTargetModal, setShowTargetModal] = useState(false);

    // Filter states
    const [companies, setCompanies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [systemRoles, setSystemRoles] = useState([]);
    const [empSearch, setEmpSearch] = useState('');
    const [compSearch, setCompSearch] = useState('');

    const loadLocks = async () => {
        try {
            const locksFromDb = await systemLocksService.getAllLocks(selectedEmployee, selectedCompany, null);
            const initialState = {};
            const allItems = [...masterItems, ...adminItems, ...transactionItems, ...productActions];
            allItems.forEach(item => {
                let key = '';
                if (item.id === 'isAddProductLocked' || item.id === 'isAddProductLocked_PO') {
                    key = item.id;
                } else {
                    key = \`isLocked_\${item.id}\`;
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

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={\`\${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']\`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const handleToggle = async (id, label) => {
        const newValue = !settings[id];
        let key = '';
        if (id === 'isAddProductLocked' || id === 'isAddProductLocked_PO') {
            key = id;
        } else {
            key = \`isLocked_\${id}\`;
        }
        
        // Optimistic UI update
        setSettings(prev => ({ ...prev, [id]: newValue }));
        showSuccessToast(\`\${label} \${newValue ? 'Locked' : 'Unlocked'} Successfully\`);

        // Push to server
        try {
            await systemLocksService.updateLock(key, newValue, selectedEmployee, selectedCompany, null);
        } catch (err) {
            console.error("Failed to update lock on server", err);
        }
    };

    const renderItem = (item) => {
        const isLocked = settings[item.id] || false;
        return (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-blue-50/30 rounded-lg transition-all border border-transparent hover:border-blue-100/50 group">
                <div className="flex items-center gap-2.5">
                    <div className={\`w-[32px] h-[32px] flex items-center justify-center transition-all duration-300 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm \${isLocked ? 'bg-red-50 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.2)]' : 'bg-[#f8fafd] text-[#0285fd] hover:bg-blue-50'}\`}>
                        {isLocked ? <Lock size={14} strokeWidth={2.5} /> : <Unlock size={14} strokeWidth={2.5} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide line-clamp-1">{item.label}</span>
                    </div>
                </div>

                <button
                    onClick={() => handleToggle(item.id, item.label)}
                    className={\`relative w-10 h-5 rounded-full transition-all duration-500 focus:outline-none shadow-inner border-2 shrink-0 \${isLocked ? 'bg-red-500 border-red-600' : 'bg-slate-200 border-slate-300 hover:border-blue-300'}\`}
                >
                    <div className={\`absolute top-[1px] left-[1px] bg-white w-3.5 h-3.5 rounded-full transition-all duration-500 shadow-md flex items-center justify-center \${isLocked ? 'translate-x-[18px] scale-110' : 'translate-x-0'}\`}>
                        <div className={\`w-1.5 h-1.5 rounded-full \${isLocked ? 'bg-red-500' : 'bg-slate-300'}\`} />
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
        const chunks = chunkArray(items, 8);
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

    return (
        <>
            <style>
                {\`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                \`}
            </style>
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="SYSTEM ADMIN CONFIGURATION"
            maxWidth="max-w-[1250px]"
            showHeaderClose={true}
        >
            <div className="font-sans flex flex-col h-full overflow-hidden p-4">
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
                        className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all"
                    >
                        Change Target
                    </button>
                </div>

                <div className="overflow-y-auto no-scrollbar pr-2 flex-grow space-y-10 pb-6 opacity-100 transition-opacity">
                    
                    {/* Sections */}
                    {renderSection('Master File Access Control', Layers, masterItems)}
                    {renderSection('Admin Module Access Control', ShieldCheck, adminItems)}
                    {renderSection('Transaction Module Access Control', ShoppingCart, transactionItems)}
                    {renderSection('Transaction Action Controls', Settings, productActions)}
                </div>
            </div>
        </SimpleModal>

        {/* Target Selection Sub-Modal */}
        {showTargetModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Select Target Scope</h3>
                        <button onClick={() => setShowTargetModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="p-6 flex flex-col gap-5 h-full max-h-[70vh] overflow-hidden">
                        <div className="flex flex-col gap-2 h-1/2 min-h-[200px]">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Employee</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search Employee..." 
                                    value={empSearch}
                                    onChange={e => setEmpSearch(e.target.value)}
                                    className="w-full pl-9 p-2 border border-slate-300 rounded-xl text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col shadow-inner">
                                <div 
                                    onClick={() => setSelectedEmployee('')}
                                    className={\`p-3 border-b border-slate-100 text-sm cursor-pointer transition-all \${selectedEmployee === '' ? 'bg-[#00acee]/10 text-[#00acee] font-bold border-l-4 border-l-[#00acee]' : 'text-slate-600 hover:bg-white font-medium border-l-4 border-l-transparent'}\`}
                                >
                                    -- All Employees (Global) --
                                </div>
                                {employees.filter(e => (e.emp_Name || e.empName || '').toLowerCase().includes(empSearch.toLowerCase()) || (e.emp_Code || '').toLowerCase().includes(empSearch.toLowerCase())).map(e => {
                                    const roleName = systemRoles.find(r => r.id === e.userRole_Id || r.id === e.role)?.name || 'No Role';
                                    return (
                                        <div 
                                            key={e.emp_Code}
                                            onClick={() => setSelectedEmployee(e.emp_Code)}
                                            className={\`p-3 border-b border-slate-100 text-sm cursor-pointer transition-all \${selectedEmployee === e.emp_Code ? 'bg-[#00acee]/10 text-[#00acee] font-bold border-l-4 border-l-[#00acee]' : 'text-slate-600 hover:bg-white font-medium border-l-4 border-l-transparent'}\`}
                                        >
                                            {e.emp_Name || e.empName} <span className="text-slate-400 font-normal ml-1">[{roleName}]</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 h-1/2 min-h-[200px]">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Company</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search Company..." 
                                    value={compSearch}
                                    onChange={e => setCompSearch(e.target.value)}
                                    className="w-full pl-9 p-2 border border-slate-300 rounded-xl text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col shadow-inner">
                                <div 
                                    onClick={() => setSelectedCompany('')}
                                    className={\`p-3 border-b border-slate-100 text-sm cursor-pointer transition-all \${selectedCompany === '' ? 'bg-[#00acee]/10 text-[#00acee] font-bold border-l-4 border-l-[#00acee]' : 'text-slate-600 hover:bg-white font-medium border-l-4 border-l-transparent'}\`}
                                >
                                    -- All Companies (Global) --
                                </div>
                                {availableCompanies.filter(c => (c.comp_Name || c.companyName || c.code || '').toLowerCase().includes(compSearch.toLowerCase())).map(c => (
                                    <div 
                                        key={c.code}
                                        onClick={() => setSelectedCompany(c.code)}
                                        className={\`p-3 border-b border-slate-100 text-sm cursor-pointer transition-all \${selectedCompany === c.code ? 'bg-[#00acee]/10 text-[#00acee] font-bold border-l-4 border-l-[#00acee]' : 'text-slate-600 hover:bg-white font-medium border-l-4 border-l-transparent'}\`}
                                    >
                                        {c.comp_Name || c.companyName || c.code}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button onClick={() => setShowTargetModal(false)} className="w-full py-3 bg-[#00acee] hover:bg-[#009adb] text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] shrink-0">
                            Apply Target Configuration
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default SystemSettingsBoard;
`;

fs.writeFileSync('src/HomeMaster/SystemSettingsBoard.jsx', targetContent);
