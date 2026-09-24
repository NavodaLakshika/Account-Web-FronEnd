import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import { Save, RotateCcw, X, ChevronDown, List, AlertCircle, Info, Search, ChevronRight, FileText, Layers, CheckCircle2 } from 'lucide-react';
import { accountService } from '../services/account.service';
import ConfirmModal from '../components/modals/ConfirmModal';

import { getSessionData, getCompanyModule } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const AccountBoard = ({ isOpen, onClose, selectedType, initialData }) => {
    const [loading, setLoading] = useState(false);
    const getInitialFormData = () => ({
        accountType: selectedType || 'Assets',
        subAccountOfCode: '',
        subAccountOfName: '',
        accountId: '',
        accountName: '',
        shortId: '',
        isSubAccount: false,
        description: '',
        note: '',
        user: '',
        inactiveAcc: false,
        editSubAccount: false
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [errors, setErrors] = useState({});
    const [companyCode, setCompanyCode] = useState('');

    const [parentAccounts, setParentAccounts] = useState([]);
    const [mainAccountTypes, setMainAccountTypes] = useState([]);
    const [customerAccounts, setCustomerAccounts] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (typeof setErrors === "function") setErrors({});
            const { companyCode: comp, userName: user } = getSessionData();
            const isService = getCompanyModule(comp) === 'Service';
            const initialType = (isService && selectedType === 'Cost of Sales') ? 'Assets' : (selectedType || 'Assets');
            setFormData({
                ...getInitialFormData(),
                accountType: initialType
            });
            setCompanyCode(comp);
            setFormData(prev => ({ ...prev, user, accountType: initialType }));
            loadMainAccountTypes(comp);
            loadParentAccounts(initialType, comp, true);
        }
    }, [isOpen, selectedType]);

    const loadMainAccountTypes = async (comp) => {
        try {
            const data = await accountService.getMainTypes(comp || companyCode);
            const isService = getCompanyModule(comp || companyCode) === 'Service';
            const filtered = isService
                ? (data || []).filter(t => !t.main_Acc_Name?.toLowerCase().includes('cost of sales') && String(t.main_Acc_Code) !== '50000')
                : (data || []);
            setMainAccountTypes(filtered);
        } catch (error) {
            console.error('Failed to load main types', error);
        }
    };

    const loadParentAccounts = async (type, comp, autoSelectFirst = true) => {
        setLoading(true);
        try {
            const currentComp = comp || companyCode;
            const data = await accountService.getParentAccounts(type, currentComp);

            const validParents = (data || []).map(p => ({
                code: String(p.code || p.Code || p.sub_Code || p.Sub_Code || ''),
                name: p.name || p.Name || p.sub_Acc_Name || p.Sub_Acc_Name || ''
            })).filter(p => p.code && p.name).sort((a, b) => {
                const numA = parseInt(a.code, 10);
                const numB = parseInt(b.code, 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return (a.code || '').localeCompare(b.code || '');
            });
            setParentAccounts(validParents);

            if (autoSelectFirst && validParents.length > 0) {
                const firstParent = validParents[0];
                setFormData(prev => ({
                    ...prev,
                    subAccountOfCode: firstParent.code,
                    subAccountOfName: firstParent.name
                }));

                try {
                    const nextId = await accountService.getNextId(firstParent.code);
                    setFormData(prev => ({ ...prev, accountId: nextId || '' }));
                    const customers = await accountService.getCustomerAccounts(firstParent.code);
                    setCustomerAccounts(customers || []);
                } catch (e) {
                    console.error('Failed to generate next ID or customer accounts', e);
                }
            } else if (validParents.length === 0) {
                setCustomerAccounts([]);
                setFormData(prev => ({ ...prev, subAccountOfCode: '', subAccountOfName: '', accountId: '' }));
            }
        } catch (error) {
            console.error('Failed to load parent accounts', error);
            setParentAccounts([]);
            setCustomerAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectType = (e) => {
        const val = e.target.value;
        if (val) {
            setFormData(prev => ({
                ...prev,
                accountType: val,
                subAccountOfCode: '',
                subAccountOfName: '',
                accountId: '',
                accountName: ''
            }));
            loadParentAccounts(val, companyCode, true);
        } else {
            setFormData(prev => ({
                ...prev,
                accountType: '',
                subAccountOfCode: '',
                subAccountOfName: '',
                accountId: '',
                accountName: ''
            }));
            setParentAccounts([]);
            setCustomerAccounts([]);
        }
    };

    const handleSelectParent = async (e) => {
        const val = e.target.value;
        const parent = parentAccounts.find(p => p.code === val);
        if (parent) {
            setFormData(prev => ({
                ...prev,
                subAccountOfCode: parent.code,
                subAccountOfName: parent.name
            }));

            try {
                const nextId = await accountService.getNextId(parent.code);
                setFormData(prev => ({ ...prev, accountId: nextId }));

                const customers = await accountService.getCustomerAccounts(parent.code);
                setCustomerAccounts(customers || []);
            } catch (error) {
                console.error('Failed to generate next ID or customers', error);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                subAccountOfCode: '',
                subAccountOfName: '',
                accountId: ''
            }));
            setCustomerAccounts([]);
        }
    };

    const handleModifierAccountSelect = async (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, accountId: val }));

        if (val) {
            setLoading(true);
            try {
                const details = await accountService.getAccountDetails(val, companyCode);
                if (details) {
                    setFormData(prev => ({
                        ...prev,
                        accountId: details.sub_Code || val,
                        accountName: details.sub_Acc_Name || '',
                        description: details.description || '',
                        note: details.note || '',
                        inactiveAcc: details.inactiveAcc || false,
                    }));
                }
            } catch (error) {
                console.error("Failed to load account details", error);
                showErrorToast("Failed to load account details");
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleModifierMode = async (e) => {
        const checked = e.target.checked;
        setFormData(prev => ({ ...prev, editSubAccount: checked }));

        if (!checked && formData.subAccountOfCode) {
            try {
                const nextId = await accountService.getNextId(formData.subAccountOfCode);
                setFormData(prev => ({ ...prev, accountId: nextId, accountName: '', description: '', note: '' }));
            } catch (err) {
                console.error(err);
            }
        } else if (checked) {
            setFormData(prev => ({ ...prev, accountId: '', accountName: '', description: '', note: '' }));
        }
    };

    const handleSave = async () => {
        const newErrors = {};
        if (!formData.accountType) newErrors.accountType = 'Primary Category is required';
        if (!formData.accountId) newErrors.accountId = 'Account ID is required';
        if (!formData.accountName) newErrors.accountName = 'Account Name is required';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showErrorToast('Please enter required fields');
            return;
        }

        setLoading(true);
        try {
            await accountService.createAccount({ ...formData, companyCode });
            showSuccessToast('Account Saved Successfully');

            // Refresh customer accounts for the current parent
            if (formData.subAccountOfCode) {
                const customers = await accountService.getCustomerAccounts(formData.subAccountOfCode);
                setCustomerAccounts(customers || []);

                if (!formData.editSubAccount) {
                    try {
                        const nextId = await accountService.getNextId(formData.subAccountOfCode);
                        setFormData(prev => ({
                            ...prev,
                            accountId: nextId,
                            accountName: '',
                            description: '',
                            note: ''
                        }));
                    } catch (e) {
                        // ignore
                    }
                }
            } else {
                handleClear();
            }
        } catch (error) {
            showErrorToast(error.response?.data?.message || error.response?.data || error.message || 'Failed to save account');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.editSubAccount || !formData.accountId) {
            showErrorToast('Please select an account to delete in Modifier Mode');
            return;
        }

        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await accountService.deleteAccount(formData.accountId);
            showSuccessToast('Account Deleted Successfully');

            if (formData.subAccountOfCode) {
                const customers = await accountService.getCustomerAccounts(formData.subAccountOfCode);
                setCustomerAccounts(customers || []);
            }
            handleClear();
            setDeleteModalOpen(false);
        } catch (error) {
            showErrorToast(error.response?.data?.message || error.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(prev => ({
            ...getInitialFormData(),
            accountType: prev.accountType,
            subAccountOfCode: prev.subAccountOfCode,
            subAccountOfName: prev.subAccountOfName,
            user: prev.user
        }));
        setErrors({});
        if (formData.subAccountOfCode) {
            accountService.getNextId(formData.subAccountOfCode).then(id => {
                setFormData(prev => ({ ...prev, accountId: id }));
            });
        }
    };



const getHierarchyForParent = (parentCode, parentName, apiCustomers = []) => {
    if (!parentCode) return [];

    const map = new Map();

    // 1. Ensure parent account itself is present
    if (parentCode && parentName) {
        map.set(String(parentCode), { 
            sub_Cust_Acc_Code: String(parentCode), 
            sub_Cust_Acc_Name: parentName 
        });
    }

    // 2. Add dynamic accounts from API
    (apiCustomers || []).forEach(item => {
        const code = String(item.sub_Cust_Acc_Code || item.sub_Code || item.Sub_Code || item.code || '');
        const name = item.sub_Cust_Acc_Name || item.sub_Acc_Name || item.Sub_Acc_Name || item.name || '';
        if (code && !map.has(code)) {
            map.set(code, {
                ...item,
                sub_Cust_Acc_Code: code,
                sub_Cust_Acc_Name: name
            });
        }
    });

    return Array.from(map.values()).sort((a, b) => {
        const numA = parseInt(a.sub_Cust_Acc_Code, 10);
        const numB = parseInt(b.sub_Cust_Acc_Code, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return (a.sub_Cust_Acc_Code || '').localeCompare(b.sub_Cust_Acc_Code || '');
    });
};

    // Complete hierarchy: parent account at the top followed by all child accounts
    const displayedHierarchy = getHierarchyForParent(
        formData.subAccountOfCode,
        formData.subAccountOfName,
        customerAccounts
    );

    return (
        <>
            <style>{`@keyframes toastProgress{0%{width:100%}100%{width:0%}}`}</style>
            <TransactionFormWrapper boardName="AccountBoard" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Account Master"
                footer={
                    <div className="bg-slate-50 px-6 py-3.5 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex items-center">
                            <button
                                onClick={handleClear}
                                className="px-5 h-9 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-xs text-[12.5px] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <RotateCcw size={13} /> CLEAR
                            </button>
                            {formData.editSubAccount && (
                                <button
                                    onClick={handleDelete}
                                    disabled={loading || !formData.accountId}
                                    className="px-5 h-9 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-semibold rounded-[3px] shadow-xs text-[12.5px] transition-all flex items-center gap-2 ml-3 cursor-pointer"
                                >
                                    DELETE
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 h-9 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[12.5px] transition-all flex items-center gap-2 cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <RotateCcw className="animate-spin" size={13} /> : <Save size={13} />} SAVE
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4 shadow-2xs">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Primary Category: Loads only the selected main account */}
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                                    Primary Category <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.accountType}
                                        onChange={handleSelectType}
                                        className={`w-full h-10 border ${errors.accountType ? 'border-red-500' : 'border-gray-300'} rounded-[3px] px-3 text-[13.5px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-800 appearance-none font-medium`}
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.6rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select Primary Category...</option>
                                        {mainAccountTypes.map((type, i) => {
                                            const val = type.main_Acc_Name || type.name || (typeof type === 'string' ? type : '');
                                            return (
                                                <option key={i} value={val}>{val}</option>
                                            );
                                        })}
                                        {formData.accountType && !mainAccountTypes.some(t => (t.main_Acc_Name || t.name || t) === formData.accountType) && (
                                            <option value={formData.accountType}>{formData.accountType}</option>
                                        )}
                                    </select>
                                </div>
                                {errors.accountType && <div className="text-red-500 text-[11px] mt-1">{errors.accountType}</div>}
                            </div>

                            {/* Parent Identifier: Lists parent headings under category */}
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                                    Parent Identifier
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.subAccountOfCode}
                                        onChange={handleSelectParent}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[13.5px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-800 truncate appearance-none font-medium"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.6rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select parent account...</option>
                                        {parentAccounts.map((parent, i) => (
                                            <option key={i} value={parent.code}>{parent.code} - {parent.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* A/C Code */}
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">A/C Code <span className="text-red-500">*</span></label>
                                {formData.editSubAccount ? (
                                    <div className="relative">
                                        <select
                                            value={formData.accountId}
                                            onChange={handleModifierAccountSelect}
                                            className={`w-full h-10 border ${errors.accountId ? 'border-red-500' : 'border-gray-300'} rounded-[3px] px-3 text-[13.5px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-800 appearance-none font-mono font-bold`}
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.6rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select Account to Modify...</option>
                                            {displayedHierarchy.map((cust, i) => (
                                                <option key={i} value={cust.sub_Cust_Acc_Code}>{cust.sub_Cust_Acc_Code} - {cust.sub_Cust_Acc_Name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className={`w-full h-10 border ${errors.accountId ? 'border-red-500' : 'border-gray-300'} rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800 font-mono font-bold disabled:bg-gray-50`}
                                        value={formData.accountId}
                                        onChange={(e) => {
                                            setFormData({ ...formData, accountId: e.target.value });
                                            if (errors.accountId) setErrors(prev => ({ ...prev, accountId: null }));
                                        }}
                                        disabled={loading}
                                        placeholder="e.g. 61100"
                                    />
                                )}
                                {errors.accountId && <div className="text-red-500 text-[11px] mt-1">{errors.accountId}</div>}
                            </div>

                            {/* A/C Title */}
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">A/C Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className={`w-full h-10 border ${errors.accountName ? 'border-red-500' : 'border-gray-300'} rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800 font-medium`}
                                    value={formData.accountName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, accountName: e.target.value });
                                        if (errors.accountName) setErrors(prev => ({ ...prev, accountName: null }));
                                    }}
                                    placeholder="e.g. Electricity Bill Main Office"
                                />
                                {errors.accountName && <div className="text-red-500 text-[11px] mt-1">{errors.accountName}</div>}
                            </div>

                            {/* Checkboxes */}
                            <div className="col-span-12 flex items-center gap-8 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={!formData.inactiveAcc}
                                        onChange={(e) => setFormData({ ...formData, inactiveAcc: !e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]"
                                    />
                                    <span className="text-[13px] font-medium text-gray-700">Active in Ledger</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={formData.editSubAccount}
                                        onChange={toggleModifierMode}
                                        className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]"
                                    />
                                    <span className="text-[13px] font-medium text-gray-700">Modifier Mode</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4 shadow-2xs">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[3px] text-[13.5px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] resize-none text-gray-800"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional account description..."
                                />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Internal Note</label>
                                <input
                                    type="text"
                                    className="w-full h-[61px] border border-gray-300 rounded-[3px] px-3 text-[13.5px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Internal memo or ledger note..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hierarchy Visualizer */}
                    <div className="border border-slate-200 rounded-[3px] bg-white shadow-2xs">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Layers size={13} className="text-gray-400" />
                                <span className="text-[10.5px] font-black text-gray-500 uppercase tracking-widest">
                                    Account Hierarchy {formData.subAccountOfName ? `— ${formData.subAccountOfName} (${formData.subAccountOfCode})` : ''}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-[#0285fd] rounded border border-blue-100 uppercase">
                                {displayedHierarchy.length} Records Found
                            </span>
                        </div>
                        <div className="max-h-[190px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/70 sticky top-0 z-10 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 border-r border-gray-200 w-36">Reference ID</th>
                                        <th className="px-4 py-2">Account Nomenclature</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayedHierarchy.length > 0 ? (
                                        displayedHierarchy.map((cust, i) => (
                                            <tr 
                                                key={i} 
                                                className={`transition-colors group text-[12px] ${
                                                    formData.editSubAccount 
                                                        ? 'cursor-pointer hover:bg-blue-50/60' 
                                                        : 'hover:bg-gray-50'
                                                } ${formData.accountId === cust.sub_Cust_Acc_Code ? 'bg-blue-50/90 font-bold' : ''}`}
                                                onClick={() => {
                                                    if (formData.editSubAccount) {
                                                        handleModifierAccountSelect({ target: { value: cust.sub_Cust_Acc_Code } });
                                                    }
                                                }}
                                            >
                                                <td className="px-4 py-2.5 font-mono font-bold text-blue-600 border-r border-gray-200">
                                                    {cust.sub_Cust_Acc_Code}
                                                </td>
                                                <td className="px-4 py-2.5 font-bold text-slate-700 uppercase flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cust.sub_Cust_Acc_Code === formData.subAccountOfCode ? 'text-[#0285fd] font-extrabold' : ''}>
                                                            {cust.sub_Cust_Acc_Name}
                                                        </span>
                                                        {cust.sub_Cust_Acc_Code === formData.subAccountOfCode && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-[#0285fd] border border-blue-200 rounded tracking-wider">
                                                                PARENT
                                                            </span>
                                                        )}
                                                    </div>
                                                    {formData.editSubAccount && (
                                                        <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 uppercase tracking-wider font-semibold">
                                                            Click to modify
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="py-12 text-center text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                                {formData.subAccountOfCode ? 'No sub-accounts recorded under this parent yet' : 'Select a parent account to view hierarchy'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="DELETE ACCOUNT"
                message={`Are you sure you want to permanently delete account ${formData.accountId} - ${formData.accountName}? This action cannot be undone.`}
                loading={loading}
                confirmText="DELETE"
                variant="danger"
            />
        </>
    );
};

export default AccountBoard;
