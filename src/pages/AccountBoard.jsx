import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import { Save, RotateCcw, X, ChevronDown, List, AlertCircle, Info, Search, ChevronRight, FileText, Layers, CheckCircle2 } from 'lucide-react';
import { accountService } from '../services/account.service';
import ConfirmModal from '../components/modals/ConfirmModal';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

export const CATEGORY_PARENT_ACCOUNTS = {
    Assets: [
        { code: '10000', name: 'Current Assets' },
        { code: '11000', name: 'Cash & Bank' },
        { code: '11100', name: 'Cash in Hand' },
        { code: '11200', name: 'Bank Current Account' },
        { code: '11300', name: 'Petty Cash' },
        { code: '12000', name: 'Receivables' },
        { code: '12100', name: 'Trade Debtors' },
        { code: '12200', name: 'Staff Advances' },
        { code: '13000', name: 'Inventory' },
        { code: '13100', name: 'Raw Materials' },
        { code: '13200', name: 'Finished Goods' },
        { code: '15000', name: 'Fixed Assets' },
        { code: '15100', name: 'Land' },
        { code: '15200', name: 'Buildings' },
        { code: '15300', name: 'Motor Vehicles' },
        { code: '15400', name: 'Office Equipment' },
        { code: '16000', name: 'Accumulated Depreciation' },
    ],
    Liabilities: [
        { code: '20000', name: 'Current Liabilities' },
        { code: '21000', name: 'Trade Creditors' },
        { code: '22000', name: 'VAT Payable' },
        { code: '23000', name: 'Salary Payable' },
        { code: '25000', name: 'Long Term Liabilities' },
        { code: '25100', name: 'Bank Loans' },
        { code: '25200', name: 'Lease Liability' },
    ],
    Equity: [
        { code: '30000', name: 'Capital' },
        { code: '31000', name: 'Owner Capital' },
        { code: '32000', name: 'Retained Earnings' },
        { code: '33000', name: 'Drawings' },
    ],
    Income: [
        { code: '40000', name: 'Sales Revenue' },
        { code: '41000', name: 'Local Sales' },
        { code: '42000', name: 'Export Sales' },
        { code: '43000', name: 'Service Income' },
    ],
    'Cost of Sales': [
        { code: '50000', name: 'Cost of Goods Sold' },
        { code: '51000', name: 'Material Cost' },
        { code: '52000', name: 'Direct Labour' },
    ],
    Expenses: [
        { code: '60000', name: 'Administrative Expenses' },
        { code: '61000', name: 'Salaries' },
        { code: '62000', name: 'Electricity' },
        { code: '63000', name: 'Telephone' },
        { code: '64000', name: 'Fuel' },
        { code: '65000', name: 'Repairs & Maintenance' },
        { code: '66000', name: 'Selling & Distribution' },
        { code: '66100', name: 'Marketing' },
        { code: '66200', name: 'Delivery Charges' },
    ],
    'Other Income': [
        { code: '70000', name: 'Interest Income' },
        { code: '71000', name: 'Gain on Disposal' },
    ],
    'Other Expenses': [
        { code: '80000', name: 'Bank Charges' },
        { code: '81000', name: 'Interest Expense' },
        { code: '82000', name: 'Exchange Loss' },
    ],
};

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
            const initialType = selectedType || 'Assets';
            setFormData({
                ...getInitialFormData(),
                accountType: initialType
            });
            const { companyCode: comp, userName: user } = getSessionData();
            setCompanyCode(comp);
            setFormData(prev => ({ ...prev, user, accountType: initialType }));
            loadMainAccountTypes(comp);
            loadParentAccounts(initialType, comp, true);
        }
    }, [isOpen, selectedType]);

    const loadMainAccountTypes = async (comp) => {
        try {
            const data = await accountService.getMainTypes(comp || companyCode);
            setMainAccountTypes(data || []);
        } catch (error) {
            console.error('Failed to load main types', error);
        }
    };

    const loadParentAccounts = async (type, comp, autoSelectFirst = true) => {
        setLoading(true);
        try {
            const currentComp = comp || companyCode;
            const data = await accountService.getParentAccounts(type, currentComp);

            const standardParents = CATEGORY_PARENT_ACCOUNTS[type] || [];
            const parentMap = new Map();
            standardParents.forEach(p => parentMap.set(p.code, p));
            (data || []).forEach(p => {
                if (!parentMap.has(p.code)) parentMap.set(p.code, p);
            });
            const validParents = Array.from(parentMap.values()).sort((a, b) => {
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
                    setFormData(prev => ({ ...prev, accountId: nextId }));
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



const STANDARD_ACCOUNT_HIERARCHY = {
    // 1 — ASSETS
    '10000': [ // Current Assets
        { sub_Cust_Acc_Code: '10000', sub_Cust_Acc_Name: 'Current Assets' },
        { sub_Cust_Acc_Code: '11000', sub_Cust_Acc_Name: 'Cash & Bank' },
        { sub_Cust_Acc_Code: '11100', sub_Cust_Acc_Name: 'Cash in Hand' },
        { sub_Cust_Acc_Code: '11200', sub_Cust_Acc_Name: 'Bank Current Account' },
        { sub_Cust_Acc_Code: '11300', sub_Cust_Acc_Name: 'Petty Cash' },
    ],
    '11000': [ // Cash & Bank
        { sub_Cust_Acc_Code: '11000', sub_Cust_Acc_Name: 'Cash & Bank' },
        { sub_Cust_Acc_Code: '11100', sub_Cust_Acc_Name: 'Cash in Hand' },
        { sub_Cust_Acc_Code: '11200', sub_Cust_Acc_Name: 'Bank Current Account' },
        { sub_Cust_Acc_Code: '11300', sub_Cust_Acc_Name: 'Petty Cash' },
    ],
    '12000': [ // Receivables
        { sub_Cust_Acc_Code: '12000', sub_Cust_Acc_Name: 'Receivables' },
        { sub_Cust_Acc_Code: '12100', sub_Cust_Acc_Name: 'Trade Debtors' },
        { sub_Cust_Acc_Code: '12200', sub_Cust_Acc_Name: 'Staff Advances' },
    ],
    '13000': [ // Inventory
        { sub_Cust_Acc_Code: '13000', sub_Cust_Acc_Name: 'Inventory' },
        { sub_Cust_Acc_Code: '13100', sub_Cust_Acc_Name: 'Raw Materials' },
        { sub_Cust_Acc_Code: '13200', sub_Cust_Acc_Name: 'Finished Goods' },
    ],
    '13100': [ // Raw Materials
        { sub_Cust_Acc_Code: '13100', sub_Cust_Acc_Name: 'Raw Materials' },
    ],
    '13200': [ // Finished Goods
        { sub_Cust_Acc_Code: '13200', sub_Cust_Acc_Name: 'Finished Goods' },
    ],
    '15000': [ // Fixed Assets
        { sub_Cust_Acc_Code: '15000', sub_Cust_Acc_Name: 'Fixed Assets' },
        { sub_Cust_Acc_Code: '15100', sub_Cust_Acc_Name: 'Land' },
        { sub_Cust_Acc_Code: '15200', sub_Cust_Acc_Name: 'Buildings' },
        { sub_Cust_Acc_Code: '15300', sub_Cust_Acc_Name: 'Motor Vehicles' },
        { sub_Cust_Acc_Code: '15400', sub_Cust_Acc_Name: 'Office Equipment' },
    ],
    '16000': [ // Accumulated Depreciation
        { sub_Cust_Acc_Code: '16000', sub_Cust_Acc_Name: 'Accumulated Depreciation' },
    ],

    // 2 — LIABILITIES
    '20000': [ // Current Liabilities
        { sub_Cust_Acc_Code: '20000', sub_Cust_Acc_Name: 'Current Liabilities' },
        { sub_Cust_Acc_Code: '21000', sub_Cust_Acc_Name: 'Trade Creditors' },
        { sub_Cust_Acc_Code: '22000', sub_Cust_Acc_Name: 'VAT Payable' },
        { sub_Cust_Acc_Code: '23000', sub_Cust_Acc_Name: 'Salary Payable' },
        { sub_Cust_Acc_Code: '25000', sub_Cust_Acc_Name: 'Long Term Liabilities' },
        { sub_Cust_Acc_Code: '25100', sub_Cust_Acc_Name: 'Bank Loans' },
        { sub_Cust_Acc_Code: '25200', sub_Cust_Acc_Name: 'Lease Liability' },
    ],
    '25000': [ // Long Term Liabilities
        { sub_Cust_Acc_Code: '25000', sub_Cust_Acc_Name: 'Long Term Liabilities' },
        { sub_Cust_Acc_Code: '25100', sub_Cust_Acc_Name: 'Bank Loans' },
        { sub_Cust_Acc_Code: '25200', sub_Cust_Acc_Name: 'Lease Liability' },
    ],

    // 3 — EQUITY
    '30000': [ // Capital
        { sub_Cust_Acc_Code: '30000', sub_Cust_Acc_Name: 'Capital' },
        { sub_Cust_Acc_Code: '31000', sub_Cust_Acc_Name: 'Owner Capital' },
        { sub_Cust_Acc_Code: '32000', sub_Cust_Acc_Name: 'Retained Earnings' },
        { sub_Cust_Acc_Code: '33000', sub_Cust_Acc_Name: 'Drawings' },
    ],

    // 4 — INCOME
    '40000': [ // Sales Revenue
        { sub_Cust_Acc_Code: '40000', sub_Cust_Acc_Name: 'Sales Revenue' },
        { sub_Cust_Acc_Code: '41000', sub_Cust_Acc_Name: 'Local Sales' },
        { sub_Cust_Acc_Code: '42000', sub_Cust_Acc_Name: 'Export Sales' },
        { sub_Cust_Acc_Code: '43000', sub_Cust_Acc_Name: 'Service Income' },
    ],

    // 5 — COST OF SALES
    '50000': [ // Cost of Goods Sold
        { sub_Cust_Acc_Code: '50000', sub_Cust_Acc_Name: 'Cost of Goods Sold' },
        { sub_Cust_Acc_Code: '51000', sub_Cust_Acc_Name: 'Material Cost' },
        { sub_Cust_Acc_Code: '52000', sub_Cust_Acc_Name: 'Direct Labour' },
    ],

    // 6 — EXPENSES
    '60000': [ // Administrative Expenses
        { sub_Cust_Acc_Code: '60000', sub_Cust_Acc_Name: 'Administrative Expenses' },
        { sub_Cust_Acc_Code: '61000', sub_Cust_Acc_Name: 'Salaries' },
        { sub_Cust_Acc_Code: '62000', sub_Cust_Acc_Name: 'Electricity' },
        { sub_Cust_Acc_Code: '63000', sub_Cust_Acc_Name: 'Telephone' },
        { sub_Cust_Acc_Code: '64000', sub_Cust_Acc_Name: 'Fuel' },
        { sub_Cust_Acc_Code: '65000', sub_Cust_Acc_Name: 'Repairs & Maintenance' },
        { sub_Cust_Acc_Code: '66000', sub_Cust_Acc_Name: 'Selling & Distribution' },
        { sub_Cust_Acc_Code: '66100', sub_Cust_Acc_Name: 'Marketing' },
        { sub_Cust_Acc_Code: '66200', sub_Cust_Acc_Name: 'Delivery Charges' },
    ],
    '66000': [ // Selling & Distribution
        { sub_Cust_Acc_Code: '66000', sub_Cust_Acc_Name: 'Selling & Distribution' },
        { sub_Cust_Acc_Code: '66100', sub_Cust_Acc_Name: 'Marketing' },
        { sub_Cust_Acc_Code: '66200', sub_Cust_Acc_Name: 'Delivery Charges' },
    ],

    // 7 — OTHER INCOME
    '70000': [ // Interest Income
        { sub_Cust_Acc_Code: '70000', sub_Cust_Acc_Name: 'Interest Income' },
        { sub_Cust_Acc_Code: '71000', sub_Cust_Acc_Name: 'Gain on Disposal' },
    ],

    // 8 — OTHER EXPENSES
    '80000': [ // Bank Charges
        { sub_Cust_Acc_Code: '80000', sub_Cust_Acc_Name: 'Bank Charges' },
        { sub_Cust_Acc_Code: '81000', sub_Cust_Acc_Name: 'Interest Expense' },
        { sub_Cust_Acc_Code: '82000', sub_Cust_Acc_Name: 'Exchange Loss' },
    ],
};

const getHierarchyForParent = (parentCode, parentName, apiCustomers = []) => {
    if (!parentCode) return [];

    const standardList = STANDARD_ACCOUNT_HIERARCHY[parentCode] || (
        parentName ? [{ sub_Cust_Acc_Code: parentCode, sub_Cust_Acc_Name: parentName }] : []
    );

    const map = new Map();

    // 1. Ensure parent account itself is present
    if (parentCode && parentName) {
        map.set(parentCode, { sub_Cust_Acc_Code: parentCode, sub_Cust_Acc_Name: parentName });
    }

    // 2. Add standard hierarchical accounts
    standardList.forEach(item => {
        map.set(item.sub_Cust_Acc_Code, item);
    });

    // 3. Add dynamic accounts from API while avoiding other root group conflicts
    apiCustomers.forEach(item => {
        if (!map.has(item.sub_Cust_Acc_Code)) {
            map.set(item.sub_Cust_Acc_Code, item);
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
                                        {formData.accountType ? (
                                            <option value={formData.accountType}>{formData.accountType}</option>
                                        ) : (
                                            <>
                                                <option value="">Select Primary Category...</option>
                                                {mainAccountTypes.map((type, i) => (
                                                    <option key={i} value={type.main_Acc_Name}>{type.main_Acc_Name}</option>
                                                ))}
                                            </>
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
