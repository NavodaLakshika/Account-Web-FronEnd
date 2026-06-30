import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import { Search, Calendar, X, Save, RotateCcw, Loader2, Wallet, CheckCircle, Plus, Users, Layers } from 'lucide-react';
import { pettyCashService } from '../services/pettyCash.service';


import { getSessionData } from '../utils/session';
import CalendarModal from '../components/CalendarModal';
import CustomerMasterBoard from '../components/modals/MasterSubModal/CustomerMasterBoard';
import NewAccountBoard from '../pages/NewAccountBoard';
import PettyCashDetailModal from '../components/PettyCashDetailModal';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const PettyCashBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState('');

    const getInitialFormData = () => ({
        docNo: '',
        company: company,
        account: '',
        vendorId: '',
        payee: '',
        isVendor: false,
        location: '',
        memo: '',
        date: new Date().toISOString().split('T')[0],
        vouchNo: '',
        dueDate: new Date().toISOString().split('T')[0],
        refNo: '',
        billAmount: 0,
        costCenter: '',
        items: []
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [lookups, setLookups] = useState({
        pettyAccounts: [],
        expenseAccounts: [],
        products: [],
        suppliers: [],
        costCenters: [],
        customers: []
    });

    const safePetty = lookups.pettyAccounts || [];
    const safeExp = lookups.expenseAccounts || lookups.allAccounts || [];
    const safeCC = lookups.costCenters || [];
    const safeSuppliers = lookups.suppliers || [];
    const safeCustomers = lookups.customers || [];

    const [expenseRows, setExpenseRows] = useState([{ id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);
    const [itemRows, setItemRows] = useState([{ id: Date.now(), prodCode: '', qty: 1, cost: 0, memo: '' }]);
    const [selectedTab, setSelectedTab] = useState('Expenses');
    const [balance, setBalance] = useState(0.00);

    // Modal States
    const [showAccModal, setShowAccModal] = useState(false);
    const [accSearch, setAccSearch] = useState('');
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const [showCCModal, setShowCCModal] = useState(false);
    const [ccSearch, setCcSearch] = useState('');
    const [ccSource, setCcSource] = useState('header');
    const [ccIndex, setCcIndex] = useState(null);
    const [showExpAccModal, setShowExpAccModal] = useState(false);
    const [expAccSearch, setExpAccSearch] = useState('');
    const [expIndex, setExpIndex] = useState(null);
    const [showProdModal, setShowProdModal] = useState(false);
    const [prodSearch, setProdSearch] = useState('');
    const [prodIndex, setProdIndex] = useState(null);

    const [showDateModal, setShowDateModal] = useState(false);
    const [showDueDateModal, setShowDueDateModal] = useState(false);

    const [showDocSearchModal, setShowDocSearchModal] = useState(false);
    const [docSearch, setDocSearch] = useState('');
    const [pastDocs, setPastDocs] = useState([]);

    const [showCustomerMasterBoard, setShowCustomerMasterBoard] = useState(false);
    const [showAccountBoard, setShowAccountBoard] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [printedDocNo, setPrintedDocNo] = useState(null);

    const parseDateInternal = (dateStr) => {
        if (!dateStr) return new Date();
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
        }
        return new Date(dateStr);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = parseDateInternal(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const toISODate = (dateStr) => {
        const d = parseDateInternal(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toISOString().split('T')[0];
    };

    const fetchBalance = useCallback(async () => {
        if (formData.account && formData.costCenter) {
            try {
                const { balance } = await pettyCashService.getBalance(formData.account, formData.costCenter, company);
                setBalance(balance);
            } catch (error) {
                console.error("Balance fetch failed");
            }
        } else {
            setBalance(0.00);
        }
    }, [formData.account, formData.costCenter, company]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const fetchLookups = useCallback(async (comp) => {
        try {
            const data = await pettyCashService.getLookups(comp || company);
            setLookups(data);
        } catch (error) {
            showErrorToast('Failed to load lookup data');
        }
    }, [company]);

    const handleGenerateDoc = async (comp) => {
        try {
            const { docNo } = await pettyCashService.generateDocNo(comp || company);
            setFormData(prev => ({ ...prev, docNo }));
        } catch (error) {
            showErrorToast('Failed to generate document number');
        }
    };

    const handleSearchDocs = async () => {
        try {
            const docs = await pettyCashService.searchDocs(company);
            setPastDocs(docs);
            setShowDocSearchModal(true);
        } catch (error) {
            showErrorToast('Failed to fetch document history');
        }
    };

    const handleLoadDoc = async (docNo) => {
        try {
            setLoading(true);
            const data = await pettyCashService.getDraft(docNo, company);
            setFormData({
                ...getInitialFormData(),
                ...data.header,
                date: toISODate(data.header.date),
                dueDate: toISODate(data.header.dueDate),
                items: []
            });
            
            if (data.items) {
                setExpenseRows(data.items.filter(i => i.detailsType === 'Exp').map(i => ({
                    id: Date.now() + Math.random(),
                    accCode: i.code,
                    costCode: i.costCode,
                    amount: i.amount,
                    memo: i.memo
                })));
                
                setItemRows(data.items.filter(i => i.detailsType === 'ItP').map(i => ({
                    id: Date.now() + Math.random(),
                    prodCode: i.code,
                    qty: i.qty || 1,
                    cost: i.cost || 0,
                    memo: i.memo
                })));
            }
            setShowDocSearchModal(false);
        } catch (error) {
            showErrorToast('Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode } = getSessionData();
            setCompany(companyCode);
            setFormData(prev => ({ ...prev, company: companyCode }));
            
            fetchLookups(companyCode);
            handleGenerateDoc(companyCode);
            setExpenseRows([{ id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);
            setItemRows([{ id: Date.now(), prodCode: '', qty: 1, cost: 0, memo: '' }]);
        }
    }, [isOpen]);

    const handleExpenseRowUpdate = (id, field, value) => {
        setExpenseRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleItemRowUpdate = (id, field, value) => {
        setItemRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const addExpenseRow = () => {
        setExpenseRows(prev => [...prev, { id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);
    };

    const addItemRow = () => {
        setItemRows(prev => [...prev, { id: Date.now(), prodCode: '', qty: 1, cost: 0, memo: '' }]);
    };

    const totalExpenses = expenseRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const totalItems = itemRows.reduce((sum, row) => sum + ((Number(row.qty) * Number(row.cost)) || 0), 0);
    const totalAmount = totalExpenses + totalItems;
    const difference = Number(formData.billAmount) - totalAmount;

    const handleSaveDraft = async () => {
        try {
            if (!formData.account) return showErrorToast('Please select the relevant petty cash account.');
            if (formData.billAmount <= 0) return showErrorToast('Enter bill amount.');
            if (!formData.payee && !formData.vendorId) return showErrorToast('Please enter Payee or Vendor.');
            if (difference !== 0) return showErrorToast('Your bill amount and total amount not balanced.');

            setLoading(true);
            const payload = {
                ...formData,
                date: toISODate(formData.date),
                dueDate: toISODate(formData.dueDate),
                items: [
                    ...expenseRows.filter(r => r.accCode || r.amount > 0).map(r => ({
                        detailsType: 'Exp',
                        code: r.accCode,
                        amount: Number(r.amount),
                        memo: r.memo,
                        costCode: r.costCode || formData.costCenter
                    })),
                    ...itemRows.filter(r => r.prodCode || r.cost > 0).map(r => ({
                        detailsType: 'ItP',
                        code: r.prodCode,
                        amount: Number(r.cost) * Number(r.qty),
                        memo: r.memo,
                        qty: Number(r.qty),
                        cost: Number(r.cost),
                        costCode: formData.costCenter
                    }))
                ]
            };

            const response = await pettyCashService.saveDraft(payload);
            showSuccessToast(`${response.docNo} Draft Saved Successfully.`);
            handleClear();
        } catch (error) {
            showErrorToast(error.response?.data || 'Failed to save Petty Cash draft');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!formData.account) return showErrorToast('Please select the relevant petty cash account.');
            if (formData.billAmount <= 0) return showErrorToast('Enter bill amount.');
            if (!formData.payee && !formData.vendorId) return showErrorToast('Please enter Payee or Vendor.');
            if (difference !== 0) return showErrorToast('Your bill amount and total amount not balanced.');

            setLoading(true);
            const payload = {
                ...formData,
                date: toISODate(formData.date),
                dueDate: toISODate(formData.dueDate),
                items: [
                    ...expenseRows.filter(r => r.accCode || r.amount > 0).map(r => ({
                        detailsType: 'Exp',
                        code: r.accCode,
                        amount: Number(r.amount),
                        memo: r.memo,
                        costCode: r.costCode || formData.costCenter
                    })),
                    ...itemRows.filter(r => r.prodCode || r.cost > 0).map(r => ({
                        detailsType: 'ItP',
                        code: r.prodCode,
                        amount: Number(r.cost) * Number(r.qty),
                        memo: r.memo,
                        qty: Number(r.qty),
                        cost: Number(r.cost),
                        costCode: formData.costCenter
                    }))
                ]
            };

            const response = await pettyCashService.applyPettyCash(payload);
            showSuccessToast(`${response.docNo || response.orgDocNo} Record Applied Successfully.`);
            setPrintedDocNo(response.docNo || response.orgDocNo || formData.docNo);
            setShowReceiptModal(true);
            handleClear();
        } catch (error) {
            showErrorToast(error.response?.data || 'Failed to apply Petty Cash');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(getInitialFormData());
        setExpenseRows([{ id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);
        setItemRows([{ id: Date.now(), prodCode: '', qty: 1, cost: 0, memo: '' }]);
        setAccSearch('');
        setVendorSearch('');
        setCcSearch('');
        setExpAccSearch('');
        setProdSearch('');
        handleGenerateDoc();
    };

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
            <TransactionFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Petty Cash Entry"
                subtitle="Petty Cash Management"
                icon={Wallet}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-4 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={() => setShowCustomerMasterBoard(true)} className="px-6 py-2 border border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Users size={14} /> NEW CUSTOMER
                            </button>
                            <button onClick={() => setShowAccountBoard(true)} className="px-6 py-2 border border-teal-300 text-teal-600 bg-white hover:bg-teal-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Layers size={14} /> NEW ACCOUNT
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                            <button onClick={handleSaveDraft} disabled={loading} className="px-6 py-2 border border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE DRAFT
                            </button>
                            <button onClick={handleSave} disabled={loading} className={`px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma']">
                    {/* Header Information Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2">
                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc No</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="docNo"
                                        value={formData.docNo}
                                        readOnly
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={handleSearchDocs}
                                    />
                                    <button onClick={handleSearchDocs} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Account Balance</label>
                                <div className="w-full h-10 border border-blue-200 bg-blue-50/50 px-3 text-[14px] font-bold text-blue-700 text-right flex items-center justify-end rounded-[3px] min-w-[140px]">
                                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formatDate(formData.date)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setShowDateModal(true)}
                                    />
                                    <button onClick={() => setShowDateModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Due Date</label>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formatDate(formData.dueDate)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setShowDueDateModal(true)}
                                    />
                                    <button onClick={() => setShowDueDateModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Left Column */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Petty Cash Account</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formData.account ? `${formData.account} - ${safePetty.find(a => a.code === formData.account)?.name || ''}` : ''}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                            onClick={() => setShowAccModal(true)}
                                        />
                                        <button onClick={() => setShowAccModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={safeCC.find(c => c.code === formData.costCenter)?.name || ''}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                            onClick={() => { setCcSource('header'); setShowCCModal(true); }}
                                        />
                                        <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">General Memo</label>
                                    <input value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[13px] font-medium text-gray-700">Payee / Vendor</label>
                                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                            <div onClick={() => setFormData({ ...formData, isVendor: !formData.isVendor, vendorId: '', payee: '' })}
                                                className={`w-8 h-4 rounded-full transition-colors ${formData.isVendor ? 'bg-[#0285fd]' : 'bg-gray-300'} relative cursor-pointer`}>
                                                <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${formData.isVendor ? 'translate-x-[17px]' : 'translate-x-0.5'}`} />
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">VENDOR</span>
                                        </label>
                                    </div>
                                    {formData.isVendor ? (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData.payee || formData.vendorId}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                                onClick={() => setShowVendorModal(true)}
                                                placeholder="Select vendor"
                                            />
                                            <button onClick={() => setShowVendorModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <input value={formData.payee} onChange={(e) => setFormData({ ...formData, payee: e.target.value })} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Enter payee name" />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vouch No</label>
                                        <input value={formData.vouchNo} onChange={(e) => setFormData({ ...formData, vouchNo: e.target.value })} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                    </div>
                                    <div className="">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bill Amount</label>
                                        <input type="number" value={formData.billAmount} onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Voucher Amount</label>
                                        <div className="w-full h-10 border border-blue-200 bg-blue-50/50 px-3 text-[14px] font-bold text-blue-700 text-right flex items-center justify-end rounded-[3px]">
                                            {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Difference</label>
                                        <div className={`w-full h-10 border rounded-[3px] px-3 text-[14px] font-bold text-right flex items-center justify-end ${difference === 0 ? 'border-green-200 bg-blue-50/50 text-blue-700' : 'border-red-200 bg-red-50/50 text-red-600'}`}>
                                            {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs: Expenses / Items Purchase */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 mb-2 px-2 border-b border-gray-200 pb-2">
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setSelectedTab('Expenses')}
                                    className={`text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${selectedTab === 'Expenses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Expenses
                                </button>
                                <button 
                                    onClick={() => setSelectedTab('Items Purchase')}
                                    className={`text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${selectedTab === 'Items Purchase' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Items Purchase
                                </button>
                            </div>
                            <div className="flex-1 text-right">
                                <span className="text-[11px] font-bold text-gray-400">
                                    {selectedTab === 'Expenses' ? 'Expense' : 'Item'} Lines: <span className="text-blue-600">{selectedTab === 'Expenses' ? expenseRows.length : itemRows.length}</span>
                                </span>
                            </div>
                        </div>

                        {selectedTab === 'Expenses' ? (
                            <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[200px]">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                        <tr>
                                            <th className="px-4 w-[5%]">#</th>
                                            <th className="px-4 w-[30%]">Expense Account</th>
                                            <th className="px-4 w-[20%]">Cost Center</th>
                                            <th className="px-4 w-[15%] text-right">Amount</th>
                                            <th className="px-4 w-[25%]">Memo</th>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {expenseRows.map((row, idx) => (
                                            <tr key={row.id} className="border-b border-gray-50 text-[12px] font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-2.5 font-mono text-gray-300">{idx + 1}</td>
                                                <td className="px-2 py-2.5">
                                                    <div className="flex gap-1 items-center">
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={safeExp.find(e => e.code === row.accCode)?.name || ''}
                                                            className="flex-1 h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate"
                                                            onClick={() => { setExpIndex(idx); setShowExpAccModal(true); }}
                                                            placeholder="Select account"
                                                        />
                                                        <button onClick={() => { setExpIndex(idx); setShowExpAccModal(true); }} className="h-8 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer shrink-0">
                                                            <Search size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <div className="flex gap-1 items-center">
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={safeCC.find(cc => cc.code === row.costCode)?.name || ''}
                                                            className="flex-1 h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate"
                                                            onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }}
                                                            placeholder="Cost center"
                                                        />
                                                        <button onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }} className="h-8 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer shrink-0">
                                                            <Search size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <input type="number" value={row.amount} onChange={(e) => handleExpenseRowUpdate(row.id, 'amount', e.target.value)} className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" />
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <input type="text" value={row.memo} onChange={(e) => handleExpenseRowUpdate(row.id, 'memo', e.target.value)} className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Memo" />
                                                </td>
                                            </tr>
                                        ))}
                                        {expenseRows.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No expense items added.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="mt-auto border-t border-slate-200 bg-slate-50 p-2">
                                    <button onClick={addExpenseRow} className="w-full py-2.5 text-[#0285fd] font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 border border-dashed border-[#0285fd]/30 rounded-[3px] bg-transparent">
                                        <Plus size={12} /> ADD EXPENSE LINE
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[200px]">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                        <tr>
                                            <th className="px-4 w-[5%]">#</th>
                                            <th className="px-4 w-[30%]">Item</th>
                                            <th className="px-4 w-[10%] text-center">Qty</th>
                                            <th className="px-4 w-[13%] text-right">Unit Cost</th>
                                            <th className="px-4 w-[13%] text-right">Total</th>
                                            <th className="px-4 w-[24%]">Memo</th>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {itemRows.map((row, idx) => (
                                            <tr key={row.id} className="border-b border-gray-50 text-[12px] font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-2.5 font-mono text-gray-300">{idx + 1}</td>
                                                <td className="px-2 py-2.5">
                                                    <div className="flex gap-1 items-center">
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={lookups.products?.find(p => p.code === row.prodCode)?.name || ''}
                                                            className="flex-1 h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate"
                                                            onClick={() => { setProdIndex(idx); setShowProdModal(true); }}
                                                            placeholder="Select product"
                                                        />
                                                        <button onClick={() => { setProdIndex(idx); setShowProdModal(true); }} className="h-8 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer shrink-0">
                                                            <Search size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <input type="number" value={row.qty} onChange={(e) => handleItemRowUpdate(row.id, 'qty', e.target.value)} className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" />
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <input type="number" value={row.cost} onChange={(e) => handleItemRowUpdate(row.id, 'cost', e.target.value)} className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" />
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-black text-gray-700 bg-gray-50/30">
                                                    {(Number(row.qty) * Number(row.cost)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-2 py-2.5">
                                                    <input type="text" value={row.memo} onChange={(e) => handleItemRowUpdate(row.id, 'memo', e.target.value)} className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Notes" />
                                                </td>
                                            </tr>
                                        ))}
                                        {itemRows.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No items added.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="mt-auto border-t border-slate-200 bg-slate-50 p-2">
                                    <button onClick={addItemRow} className="w-full py-2.5 text-[#0285fd] font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 border border-dashed border-[#0285fd]/30 rounded-[3px] bg-transparent">
                                        <Plus size={12} /> ADD ITEM LINE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Validation Summary */}
                    <div className="mt-4 bg-white p-3 border border-slate-200 rounded-[3px] flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#0285fd] focus:ring-[#0285fd] transition-all" />
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Queue for Printing</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Balance Diff.</span>
                                <span className={`text-[14px] font-mono font-black tracking-tighter ${difference === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-slate-200" />
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Allocated</span>
                                <span className="text-[18px] font-mono font-black text-slate-800 tracking-tighter">
                                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* --- MODALS --- */}

            {/* Petty Account Search Modal */}
            <SimpleModal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title={`Petty Cash Accounts - ${safePetty.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" value={accSearch} onChange={(e) => setAccSearch(e.target.value)} />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Account Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safePetty.filter(a => a.name?.toLowerCase().includes(accSearch.toLowerCase()) || a.code?.toLowerCase().includes(accSearch.toLowerCase())).map((a, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => { setFormData({ ...formData, account: a.code }); setShowAccModal(false); }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Search Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Vendors - ${safeSuppliers.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Vendor Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safeSuppliers.filter(v => v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) || v.code?.toLowerCase().includes(vendorSearch.toLowerCase())).map((v, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{v.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => { setFormData({ ...formData, vendorId: v.code, payee: v.name }); setShowVendorModal(false); }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Search Modal */}
            <SimpleModal isOpen={showCCModal} onClose={() => setShowCCModal(false)} title={`Cost Centers - ${safeCC.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" value={ccSearch} onChange={(e) => setCcSearch(e.target.value)} />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Cost Center</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safeCC.filter(c => c.name?.toLowerCase().includes(ccSearch.toLowerCase()) || c.code?.toLowerCase().includes(ccSearch.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                if (ccSource === 'header') {
                                                    setFormData({ ...formData, costCenter: c.code });
                                                } else if (ccIndex !== null) {
                                                    const newRows = [...expenseRows];
                                                    newRows[ccIndex].costCode = c.code;
                                                    setExpenseRows(newRows);
                                                }
                                                setShowCCModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Expense Account Search Modal */}
            <SimpleModal isOpen={showExpAccModal} onClose={() => setShowExpAccModal(false)} title={`Expense Accounts - ${safeExp.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" value={expAccSearch} onChange={(e) => setExpAccSearch(e.target.value)} />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Account Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safeExp.filter(e => e.name?.toLowerCase().includes(expAccSearch.toLowerCase()) || e.code?.toLowerCase().includes(expAccSearch.toLowerCase())).map((e, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{e.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{e.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                if (expIndex !== null) {
                                                    const newRows = [...expenseRows];
                                                    newRows[expIndex].accCode = e.code;
                                                    setExpenseRows(newRows);
                                                }
                                                setShowExpAccModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Product Search Modal */}
            <SimpleModal isOpen={showProdModal} onClose={() => setShowProdModal(false)} title={`Products - ${(lookups.products || []).length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Product Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(lookups.products || []).filter(p => p.name?.toLowerCase().includes(prodSearch.toLowerCase()) || p.code?.toLowerCase().includes(prodSearch.toLowerCase())).map((p, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{p.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                if (prodIndex !== null) {
                                                    const newRows = [...itemRows];
                                                    newRows[prodIndex].prodCode = p.code;
                                                    setItemRows(newRows);
                                                }
                                                setShowProdModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Document Search Modal */}
            <SimpleModal isOpen={showDocSearchModal} onClose={() => setShowDocSearchModal(false)} title={`Saved Drafts - ${pastDocs.length} Found`} maxWidth="max-w-[700px]">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Document / Payee</span>
                        <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" value={docSearch} onChange={(e) => setDocSearch(e.target.value)} placeholder="Enter Doc No or Payee..." />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Doc No</th>
                                    <th className="border-b px-5 py-3">Date</th>
                                    <th className="border-b px-5 py-3">Payee / Vendor</th>
                                    <th className="border-b text-right px-5 py-3">Amount</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pastDocs.filter(d => d.docNo?.toLowerCase().includes(docSearch.toLowerCase()) || d.payee?.toLowerCase().includes(docSearch.toLowerCase())).map((d, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{d.docNo}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{formatDate(d.date)}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{d.payee || d.vendorId}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{d.billAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => handleLoadDoc(d.docNo)} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                                {pastDocs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No saved drafts found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {showDateModal && (
                <CalendarModal
                    isOpen={showDateModal}
                    onClose={() => setShowDateModal(false)}
                    currentDate={formData.date}
                    onDateChange={(d) => { setFormData({ ...formData, date: d }); setShowDateModal(false); }}
                />
            )}

            {showDueDateModal && (
                <CalendarModal
                    isOpen={showDueDateModal}
                    onClose={() => setShowDueDateModal(false)}
                    currentDate={formData.dueDate}
                    onDateChange={(d) => { setFormData({ ...formData, dueDate: d }); setShowDueDateModal(false); }}
                />
            )}

            {showReceiptModal && (
                <PettyCashDetailModal 
                    docNo={printedDocNo} 
                    onClose={() => setShowReceiptModal(false)} 
                />
            )}

            {showCustomerMasterBoard && (
                <CustomerMasterBoard
                    isOpen={showCustomerMasterBoard}
                    onClose={() => setShowCustomerMasterBoard(false)}
                />
            )}

            {showAccountBoard && (
                <NewAccountBoard
                    isOpen={showAccountBoard}
                    onClose={() => setShowAccountBoard(false)}
                />
            )}
        </>
    );
};

export default PettyCashBoard;
