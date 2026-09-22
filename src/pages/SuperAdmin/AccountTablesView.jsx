import React, { useState, useEffect, useMemo } from 'react';
import { 
    Layers, Search, Plus, RefreshCw, Edit3, Trash2, X, Check, 
    Building2, Filter, AlertCircle, Loader2, ChevronLeft, ChevronRight,
    CheckCircle, ShieldCheck, Tag, Hash, FileSpreadsheet, Eye
} from 'lucide-react';
import { accountTablesService } from '../../services/accountTables.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import ConfirmModal from '../../components/modals/ConfirmModal';

const AccountTablesView = ({ allCompanies = [] }) => {
    // Active Tab: 'main' (Acc_Main_Accounts) or 'sub' (ACC_Sub_Accounts)
    const [activeTab, setActiveTab] = useState('sub');

    // Data States
    const [mainAccounts, setMainAccounts] = useState([]);
    const [subAccounts, setSubAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
    const [selectedParentFilter, setSelectedParentFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination for Sub Accounts
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    // Modals
    const [showMainModal, setShowMainModal] = useState(false);
    const [mainEditingItem, setMainEditingItem] = useState(null);
    const [mainForm, setMainForm] = useState({ Main_Acc_Code: '', Main_Acc_Name: '', Acc_Code: '' });
    const [savingMain, setSavingMain] = useState(false);

    const [showSubModal, setShowSubModal] = useState(false);
    const [subEditingItem, setSubEditingItem] = useState(null);
    const [subForm, setSubForm] = useState({
        Sub_Code: '',
        Sub_Acc_Name: '',
        Main_Acc_Code: '',
        Acc_Group: '',
        Acc_Type: '',
        Id: '',
        Company_Code: '',
        InactiveAcc: false
    });
    const [savingSub, setSavingSub] = useState(false);

    // Delete Confirmation
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        type: '', // 'main' or 'sub'
        item: null,
        loading: false
    });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [mList, sList] = await Promise.all([
                accountTablesService.getMainAccounts().catch(() => []),
                accountTablesService.getSubAccounts().catch(() => [])
            ]);
            setMainAccounts(Array.isArray(mList) ? mList : []);
            setSubAccounts(Array.isArray(sList) ? sList : []);
        } catch (error) {
            console.error('Error loading account tables', error);
            showErrorToast('Failed to load account tables');
        } finally {
            setLoading(false);
        }
    };

    // Sub account counts map per Main_Acc_Code
    const subCountByMainCode = useMemo(() => {
        const counts = {};
        subAccounts.forEach(s => {
            const code = s.main_Acc_Code || s.Main_Acc_Code;
            if (code) {
                counts[code] = (counts[code] || 0) + 1;
            }
        });
        return counts;
    }, [subAccounts]);

    // Distinct Company codes from Sub accounts and allCompanies
    const availableCompanies = useMemo(() => {
        const set = new Set();
        (allCompanies || []).forEach(c => {
            const code = c.code || c.companyCode;
            if (code) set.add(code);
        });
        subAccounts.forEach(s => {
            const code = s.company_Code || s.Company_Code;
            if (code) set.add(code);
        });
        return Array.from(set).sort();
    }, [allCompanies, subAccounts]);

    // Filtered Main Accounts
    const filteredMainAccounts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return mainAccounts.filter(m => {
            const code = (m.main_Acc_Code || m.Main_Acc_Code || '').toLowerCase();
            const name = (m.main_Acc_Name || m.Main_Acc_Name || '').toLowerCase();
            const accCode = (m.acc_Code || m.Acc_Code || '').toLowerCase();
            return !term || code.includes(term) || name.includes(term) || accCode.includes(term);
        });
    }, [mainAccounts, searchTerm]);

    // Filtered Sub Accounts
    const filteredSubAccounts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return subAccounts.filter(s => {
            const code = (s.sub_Code || s.Sub_Code || '').toLowerCase();
            const name = (s.sub_Acc_Name || s.Sub_Acc_Name || '').toLowerCase();
            const mainCode = s.main_Acc_Code || s.Main_Acc_Code || '';
            const comp = s.company_Code || s.Company_Code || '';
            const isInactive = s.inactiveAcc || s.InactiveAcc;

            // Search text
            const matchesSearch = !term || code.includes(term) || name.includes(term) || comp.toLowerCase().includes(term);
            
            // Company filter
            let matchesCompany = true;
            if (selectedCompanyFilter === 'GLOBAL') {
                matchesCompany = !comp;
            } else if (selectedCompanyFilter !== 'ALL') {
                matchesCompany = comp === selectedCompanyFilter;
            }

            // Parent category filter
            const matchesParent = selectedParentFilter === 'ALL' || mainCode === selectedParentFilter;

            // Status filter
            let matchesStatus = true;
            if (statusFilter === 'ACTIVE') matchesStatus = !isInactive;
            if (statusFilter === 'INACTIVE') matchesStatus = !!isInactive;

            return matchesSearch && matchesCompany && matchesParent && matchesStatus;
        });
    }, [subAccounts, searchTerm, selectedCompanyFilter, selectedParentFilter, statusFilter]);

    // Pagination slice for sub accounts
    const totalSubPages = Math.max(1, Math.ceil(filteredSubAccounts.length / pageSize));
    const paginatedSubAccounts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredSubAccounts.slice(start, start + pageSize);
    }, [filteredSubAccounts, currentPage]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCompanyFilter, selectedParentFilter, statusFilter, activeTab]);

    // Main Account Handlers
    const handleOpenCreateMain = () => {
        setMainEditingItem(null);
        setMainForm({ Main_Acc_Code: '', Main_Acc_Name: '', Acc_Code: '' });
        setActiveTab('main');
        setShowMainModal(true);
    };

    const handleOpenEditMain = (item) => {
        setMainEditingItem(item);
        setMainForm({
            Main_Acc_Code: item.main_Acc_Code || item.Main_Acc_Code || '',
            Main_Acc_Name: item.main_Acc_Name || item.Main_Acc_Name || '',
            Acc_Code: item.acc_Code || item.Acc_Code || ''
        });
        setShowMainModal(true);
    };

    const handleSaveMain = async (e) => {
        e.preventDefault();
        const code = mainForm.Main_Acc_Code?.trim();
        const name = mainForm.Main_Acc_Name?.trim();
        const accCode = mainForm.Acc_Code?.trim() || null;

        if (!code) {
            showErrorToast('Main Account Code is required');
            return;
        }
        if (!name) {
            showErrorToast('Category Nomenclature is required');
            return;
        }

        setSavingMain(true);
        try {
            const payload = {
                Main_Acc_Code: code,
                Main_Acc_Name: name,
                Acc_Code: accCode,
                main_Acc_Code: code,
                main_Acc_Name: name,
                acc_Code: accCode
            };

            if (mainEditingItem) {
                const origCode = mainEditingItem.main_Acc_Code || mainEditingItem.Main_Acc_Code;
                await accountTablesService.updateMainAccount(origCode, payload);
                showSuccessToast(`Main Category '${code}' updated successfully`);
            } else {
                await accountTablesService.createMainAccount(payload);
                showSuccessToast(`Main Category '${code}' created successfully`);
            }
            setShowMainModal(false);
            setActiveTab('main');
            await loadAllData();
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || error.message || 'Failed to save main account';
            showErrorToast(typeof msg === 'string' ? msg : 'Failed to save main account');
        } finally {
            setSavingMain(false);
        }
    };

    // Sub Account Handlers
    const handleOpenCreateSub = () => {
        setSubEditingItem(null);
        setSubForm({
            Sub_Code: '',
            Sub_Acc_Name: '',
            Main_Acc_Code: mainAccounts[0]?.main_Acc_Code || mainAccounts[0]?.Main_Acc_Code || '',
            Acc_Group: '',
            Acc_Type: '',
            Id: '',
            Company_Code: '',
            InactiveAcc: false
        });
        setShowSubModal(true);
    };

    const handleOpenEditSub = (item) => {
        setSubEditingItem(item);
        setSubForm({
            Sub_Code: item.sub_Code || item.Sub_Code || '',
            Sub_Acc_Name: item.sub_Acc_Name || item.Sub_Acc_Name || '',
            Main_Acc_Code: item.main_Acc_Code || item.Main_Acc_Code || '',
            Acc_Group: item.acc_Group || item.Acc_Group || '',
            Acc_Type: item.acc_Type || item.Acc_Type || '',
            Id: item.id || item.Id || '',
            Company_Code: item.company_Code || item.Company_Code || '',
            InactiveAcc: item.inactiveAcc || item.InactiveAcc || false
        });
        setShowSubModal(true);
    };

    const handleSaveSub = async (e) => {
        e.preventDefault();
        if (!subForm.Sub_Code?.trim()) {
            showErrorToast('Sub Account Code is required');
            return;
        }
        if (!subForm.Sub_Acc_Name?.trim()) {
            showErrorToast('Sub Account Name is required');
            return;
        }
        if (!subForm.Main_Acc_Code?.trim()) {
            showErrorToast('Parent Main Account is required');
            return;
        }

        setSavingSub(true);
        try {
            if (subEditingItem) {
                const subCode = subEditingItem.sub_Code || subEditingItem.Sub_Code;
                const comp = subEditingItem.company_Code || subEditingItem.Company_Code || '';
                await accountTablesService.updateSubAccount(subCode, subForm, comp);
                showSuccessToast('Sub Account updated successfully');
            } else {
                await accountTablesService.createSubAccount(subForm);
                showSuccessToast('Sub Account created successfully');
            }
            setShowSubModal(false);
            loadAllData();
        } catch (error) {
            showErrorToast(error.response?.data?.message || error.message || 'Failed to save sub account');
        } finally {
            setSavingSub(false);
        }
    };

    // Delete Handlers
    const promptDeleteMain = (item) => {
        const code = item.main_Acc_Code || item.Main_Acc_Code;
        const count = subCountByMainCode[code] || 0;
        setConfirmDelete({
            isOpen: true,
            type: 'main',
            item,
            title: `Delete Main Account: ${code}`,
            message: count > 0 
                ? `WARNING: This category has ${count} linked sub-account(s). Deleting it will be blocked by the database until sub-accounts are reassigned or deleted.`
                : `Are you sure you want to permanently delete main category "${code} - ${item.main_Acc_Name || item.Main_Acc_Name}" from Acc_Main_Accounts?`,
            loading: false
        });
    };

    const promptDeleteSub = (item) => {
        const code = item.sub_Code || item.Sub_Code;
        const name = item.sub_Acc_Name || item.Sub_Acc_Name;
        const comp = item.company_Code || item.Company_Code;
        setConfirmDelete({
            isOpen: true,
            type: 'sub',
            item,
            title: `Delete Sub Account: ${code}`,
            message: `Are you sure you want to permanently delete sub account "${code} - ${name}"${comp ? ` for company ${comp}` : ' (Global Template)'} from ACC_Sub_Accounts?`,
            loading: false
        });
    };

    const handleConfirmDelete = async () => {
        const { type, item } = confirmDelete;
        if (!item) return;

        setConfirmDelete(prev => ({ ...prev, loading: true }));
        try {
            if (type === 'main') {
                const code = item.main_Acc_Code || item.Main_Acc_Code;
                await accountTablesService.deleteMainAccount(code);
                showSuccessToast('Main Account deleted successfully');
            } else if (type === 'sub') {
                const code = item.sub_Code || item.Sub_Code;
                const comp = item.company_Code || item.Company_Code || '';
                await accountTablesService.deleteSubAccount(code, comp);
                showSuccessToast('Sub Account deleted successfully');
            }
            setConfirmDelete({ isOpen: false, type: '', item: null, loading: false });
            loadAllData();
        } catch (error) {
            showErrorToast(error.response?.data?.message || error.message || 'Delete operation failed');
            setConfirmDelete(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-200 space-y-6">
            {/* Header Block (Exact Super Admin Style) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-[4px] border border-blue-200 shadow-sm">
                        <Layers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-gray-800 tracking-tight leading-none mb-1">
                            Chart of Accounts Database Tables
                        </h3>
                        <p className="text-[12px] text-gray-500 font-medium">
                            Direct management for <code className="text-blue-600 font-bold">Acc_Main_Accounts</code> and <code className="text-blue-600 font-bold">ACC_Sub_Accounts</code>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
                    <div className="bg-white border border-gray-200 text-gray-700 text-[12px] font-bold px-3 py-1.5 rounded-[4px] shadow-sm flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        {activeTab === 'main' ? `${filteredMainAccounts.length} Categories` : `${filteredSubAccounts.length} Sub Accounts`}
                    </div>
                    <button
                        onClick={loadAllData}
                        disabled={loading}
                        className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold rounded-[6px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Reload both tables"
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={handleOpenCreateMain}
                        className={`px-3.5 py-1.5 rounded-[6px] text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'main'
                                ? 'bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white'
                                : 'bg-white hover:bg-gray-50 border border-blue-200 text-blue-700'
                        }`}
                        title="Create a new entry in Acc_Main_Accounts"
                    >
                        <Plus size={14} />
                        New Main Account
                    </button>
                    <button
                        onClick={handleOpenCreateSub}
                        className={`px-3.5 py-1.5 rounded-[6px] text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'sub'
                                ? 'bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white'
                                : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700'
                        }`}
                        title="Create a new entry in ACC_Sub_Accounts"
                    >
                        <Plus size={14} />
                        New Sub Account
                    </button>
                </div>
            </div>

            {/* Filter and Tab Select Panel (Matching RoleFeaturesView Panel) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Table / Identity Switcher */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1 shrink-0">Table:</span>
                        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200 shrink-0">
                            <button
                                onClick={() => setActiveTab('sub')}
                                className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[6px] transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'sub'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-transparent hover:bg-gray-200 text-gray-600'
                                }`}
                            >
                                <Building2 size={13} />
                                <span>ACC_Sub_Accounts</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${activeTab === 'sub' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {subAccounts.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('main')}
                                className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[6px] transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'main'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-transparent hover:bg-gray-200 text-gray-600'
                                }`}
                            >
                                <Layers size={13} />
                                <span>Acc_Main_Accounts</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${activeTab === 'main' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {mainAccounts.length}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-72 shrink-0">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={activeTab === 'main' ? 'Search main accounts...' : 'Search code, name, company...'}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 shadow-sm bg-white text-gray-700 text-xs w-full outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg transition-all"
                        />
                    </div>
                </div>

                {/* Sub Account Secondary Filters */}
                {activeTab === 'sub' && (
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
                        {/* Company Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Company:</span>
                            <select
                                value={selectedCompanyFilter}
                                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer"
                            >
                                <option value="ALL">All Scopes ({subAccounts.length})</option>
                                <option value="GLOBAL">Global Templates Only</option>
                                {availableCompanies.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Parent Category Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Parent Category:</span>
                            <select
                                value={selectedParentFilter}
                                onChange={(e) => setSelectedParentFilter(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer max-w-[240px]"
                            >
                                <option value="ALL">All Categories</option>
                                {mainAccounts.map(m => {
                                    const code = m.main_Acc_Code || m.Main_Acc_Code;
                                    const name = m.main_Acc_Name || m.Main_Acc_Name;
                                    return (
                                        <option key={code} value={code}>{code} - {name}</option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        {(searchTerm || selectedCompanyFilter !== 'ALL' || selectedParentFilter !== 'ALL' || statusFilter !== 'ALL') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCompanyFilter('ALL');
                                    setSelectedParentFilter('ALL');
                                    setStatusFilter('ALL');
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer ml-auto"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* TAB 1: Acc_Main_Accounts Table */}
            {activeTab === 'main' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 text-[11px] font-black text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Main Acc Code</th>
                                    <th className="py-3.5 px-5">Category Nomenclature</th>
                                    <th className="py-3.5 px-5">Reference Code</th>
                                    <th className="py-3.5 px-5 text-center">Sub Accounts</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-[13px]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                                                <span className="font-semibold text-xs text-gray-500">Loading Acc_Main_Accounts...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredMainAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertCircle className="w-8 h-8 text-gray-300" />
                                                <span className="font-semibold text-sm text-gray-600">No main accounts found</span>
                                                <p className="text-xs text-gray-400">Click "New Main Account" to insert a record into Acc_Main_Accounts.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMainAccounts.map((item) => {
                                        const code = item.main_Acc_Code || item.Main_Acc_Code;
                                        const name = item.main_Acc_Name || item.Main_Acc_Name;
                                        const accCode = item.acc_Code || item.Acc_Code;
                                        const count = subCountByMainCode[code] || 0;

                                        return (
                                            <tr key={code} className="hover:bg-blue-50/40 transition-colors group border-b border-gray-50">
                                                <td className="py-3.5 px-5">
                                                    <span className="text-[11px] font-mono text-blue-600 font-bold bg-blue-50/70 px-2.5 py-1 rounded border border-blue-100 flex items-center gap-1.5 w-fit">
                                                        <Hash className="w-3 h-3 text-blue-400" />
                                                        {code}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <span className="text-[14px] font-bold text-gray-800 leading-tight uppercase group-hover:text-blue-600 transition-colors">
                                                        {name}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    {accCode ? (
                                                        <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                            {accCode}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-5 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                        count > 0 
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                                            : 'bg-gray-100 text-gray-400 border-gray-200'
                                                    }`}>
                                                        {count} {count === 1 ? 'account' : 'accounts'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenEditMain(item)}
                                                            className="py-1 px-2.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-[6px] shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                            title="Edit Main Account"
                                                        >
                                                            <Edit3 size={13} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => promptDeleteMain(item)}
                                                            className="py-1 px-2.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-[6px] shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                            title="Delete Main Account"
                                                        >
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: ACC_Sub_Accounts Table */}
            {activeTab === 'sub' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 text-[11px] font-black text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Sub Code</th>
                                    <th className="py-3.5 px-5">Account Nomenclature</th>
                                    <th className="py-3.5 px-5">Parent Category</th>
                                    <th className="py-3.5 px-5">Group / Type</th>
                                    <th className="py-3.5 px-5">Company Scope</th>
                                    <th className="py-3.5 px-5 text-center">Status</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-[13px]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                                                <span className="font-semibold text-xs text-gray-500">Loading ACC_Sub_Accounts...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSubAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertCircle className="w-8 h-8 text-gray-300" />
                                                <span className="font-semibold text-sm text-gray-600">No sub accounts found</span>
                                                <p className="text-xs text-gray-400">Try adjusting your filters or click "New Sub Account" to add one.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSubAccounts.map((item, idx) => {
                                        const code = item.sub_Code || item.Sub_Code;
                                        const name = item.sub_Acc_Name || item.Sub_Acc_Name;
                                        const mainCode = item.main_Acc_Code || item.Main_Acc_Code;
                                        const group = item.acc_Group || item.Acc_Group;
                                        const type = item.acc_Type || item.Acc_Type;
                                        const comp = item.company_Code || item.Company_Code;
                                        const isInactive = item.inactiveAcc || item.InactiveAcc;

                                        // Lookup parent category name
                                        const parentObj = mainAccounts.find(m => (m.main_Acc_Code || m.Main_Acc_Code) === mainCode);
                                        const parentName = parentObj ? (parentObj.main_Acc_Name || parentObj.Main_Acc_Name) : '';

                                        return (
                                            <tr key={`${code}-${comp || 'global'}-${idx}`} className="hover:bg-blue-50/40 transition-colors group border-b border-gray-50">
                                                <td className="py-3 px-5">
                                                    <span className="text-[11px] font-mono text-blue-600 font-bold bg-blue-50/70 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1.5 w-fit">
                                                        <Hash className="w-3 h-3 text-blue-400" />
                                                        {code}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                                                            {name}
                                                        </span>
                                                        {item.id && item.id !== code && (
                                                            <span className="text-[10px] text-gray-400 font-mono">Ref ID: {item.id}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-[11px] text-blue-600 font-bold">{mainCode}</span>
                                                        {parentName && <span className="text-[11px] text-gray-400 truncate max-w-[160px]">{parentName}</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {group || type || '—'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5">
                                                    {comp ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-[4px] text-[11px] font-bold">
                                                            <Building2 className="w-3 h-3" />
                                                            {comp}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-[4px] text-[10px] font-black uppercase tracking-wider">
                                                            Global Template
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-5 text-center">
                                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[4px] shadow-sm ${
                                                        isInactive 
                                                            ? 'bg-red-50 text-red-600 border-red-200' 
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                    }`}>
                                                        {isInactive ? 'Inactive' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenEditSub(item)}
                                                            className="py-1 px-2.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-[6px] shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                            title="Edit Sub Account"
                                                        >
                                                            <Edit3 size={13} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => promptDeleteSub(item)}
                                                            className="py-1 px-2.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-[6px] shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                            title="Delete Sub Account"
                                                        >
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {filteredSubAccounts.length > pageSize && (
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500 bg-gray-50/50">
                            <span>
                                Showing <strong className="text-gray-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                                <strong className="text-gray-800">{Math.min(currentPage * pageSize, filteredSubAccounts.length)}</strong> of{' '}
                                <strong className="text-gray-800">{filteredSubAccounts.length}</strong> accounts
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-[6px] border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-gray-700 text-xs px-2">
                                    Page {currentPage} of {totalSubPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalSubPages, p + 1))}
                                    disabled={currentPage === totalSubPages}
                                    className="p-1.5 rounded-[6px] border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: Create / Edit Main Account */}
            {showMainModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-b from-gray-50/70 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-100 rounded-[6px] border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                                    <Layers size={18} />
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-bold text-gray-800 leading-tight">
                                        {mainEditingItem ? 'Edit Main Category' : 'New Main Category'}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-medium">Table: Acc_Main_Accounts</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMainModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveMain} className="p-5 space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-700 font-bold mb-1">
                                    Main Account Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!mainEditingItem}
                                    placeholder="e.g. 10000, 20000, 30000"
                                    value={mainForm.Main_Acc_Code}
                                    onChange={(e) => setMainForm({ ...mainForm, Main_Acc_Code: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg font-mono text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-500"
                                />
                                {mainEditingItem && (
                                    <span className="text-[10px] text-gray-400 mt-1 block">Primary key code cannot be altered while editing.</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">
                                    Category Nomenclature <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. CURRENT ASSETS, LIABILITIES, EQUITY"
                                    value={mainForm.Main_Acc_Name}
                                    onChange={(e) => setMainForm({ ...mainForm, Main_Acc_Name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">
                                    Acc Code Reference <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 10, 20, 80"
                                    value={mainForm.Acc_Code}
                                    onChange={(e) => setMainForm({ ...mainForm, Acc_Code: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg font-mono text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowMainModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-[6px] font-bold transition-all cursor-pointer text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingMain}
                                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[6px] shadow-sm transition-all cursor-pointer disabled:opacity-50 text-xs"
                                >
                                    {savingMain && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{mainEditingItem ? 'Save Changes' : 'Create Category'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Create / Edit Sub Account */}
            {showSubModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-[620px] overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-b from-gray-50/70 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-100 rounded-[6px] border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                                    <Building2 size={18} />
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-bold text-gray-800 leading-tight">
                                        {subEditingItem ? 'Edit Sub Account' : 'New Sub Account'}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-medium">Table: ACC_Sub_Accounts</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSubModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSub} className="p-5 space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">
                                        Sub Account Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!subEditingItem}
                                        placeholder="e.g. 11000, 21000, 11001"
                                        value={subForm.Sub_Code}
                                        onChange={(e) => setSubForm({ ...subForm, Sub_Code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg font-mono text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-gray-700 font-bold">
                                            Parent Category (Main_Acc_Code) <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSubModal(false);
                                                handleOpenCreateMain();
                                            }}
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Plus size={11} /> New Category
                                        </button>
                                    </div>
                                    <select
                                        required
                                        value={subForm.Main_Acc_Code}
                                        onChange={(e) => setSubForm({ ...subForm, Main_Acc_Code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                                    >
                                        <option value="">Select Parent Category...</option>
                                        {mainAccounts.map(m => {
                                            const code = m.main_Acc_Code || m.Main_Acc_Code;
                                            const name = m.main_Acc_Name || m.Main_Acc_Name;
                                            return (
                                                <option key={code} value={code}>{code} — {name}</option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">
                                    Account Nomenclature <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Petty Cash, Trade Creditors, Bank Operating Account"
                                    value={subForm.Sub_Acc_Name}
                                    onChange={(e) => setSubForm({ ...subForm, Sub_Acc_Name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">
                                        Account Group / Class
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Assets, Liabilities, Expenses"
                                        value={subForm.Acc_Group}
                                        onChange={(e) => setSubForm({ ...subForm, Acc_Group: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">
                                        Account Type
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BANK, CASH, CURRENT ASSET"
                                        value={subForm.Acc_Type}
                                        onChange={(e) => setSubForm({ ...subForm, Acc_Type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">
                                        Company Scope
                                    </label>
                                    <select
                                        value={subForm.Company_Code}
                                        onChange={(e) => setSubForm({ ...subForm, Company_Code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                                    >
                                        <option value="">Global Template (Shared across all companies)</option>
                                        {availableCompanies.map(c => (
                                            <option key={c} value={c}>Company: {c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">
                                        Reference ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 11000 or same as Sub Code"
                                        value={subForm.Id}
                                        onChange={(e) => setSubForm({ ...subForm, Id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 shadow-sm rounded-lg font-mono text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={subForm.InactiveAcc}
                                        onChange={(e) => setSubForm({ ...subForm, InactiveAcc: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-gray-700 font-bold text-xs">Set as Inactive Account (Disabled from transaction entry)</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowSubModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-[6px] font-bold transition-all cursor-pointer text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSub}
                                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[6px] shadow-sm transition-all cursor-pointer disabled:opacity-50 text-xs"
                                >
                                    {savingSub && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{subEditingItem ? 'Save Changes' : 'Create Account'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: Delete Confirmation */}
            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, type: '', item: null, loading: false })}
                onConfirm={handleConfirmDelete}
                title={confirmDelete.title}
                message={confirmDelete.message}
                loading={confirmDelete.loading}
                confirmText="Delete Record"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};

export default AccountTablesView;
