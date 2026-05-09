import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw, X, Save, RotateCcw, Loader2, Landmark, Wallet, Layers, Users } from 'lucide-react';
import { pettyCashService } from '../services/pettyCash.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../utils/session';
import CalendarModal from '../components/CalendarModal';
import CustomerMasterBoard from '../components/modals/MasterSubModal/CustomerMasterBoard';
import NewAccountBoard from '../pages/NewAccountBoard';

const PettyCashBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState('');

    const initialFormState = {
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
    };

    const [formData, setFormData] = useState(initialFormState);
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
    const [ccSource, setCcSource] = useState('header'); // 'header' or 'line'
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

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
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

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

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
            // Map backend data to frontend state
            setFormData({
                ...initialFormState,
                ...data.header,
                date: toISODate(data.header.date),
                dueDate: toISODate(data.header.dueDate),
                items: [] // Items are handled separately below
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
            showSuccessToast(`${response.docNo} Record Saved Successfully.`);
            handleClear();
        } catch (error) {
            showErrorToast(error.response?.data || 'Failed to save Petty Cash');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(initialFormState);
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Petty Cash Entry"
                maxWidth="max-w-[1100px] "
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl gap-3">
                        <div className="flex gap-3">
                            <button onClick={() => setShowCustomerMasterBoard(true)} className="px-6 h-10 bg-indigo-50/50 backdrop-blur-md border border-indigo-200 text-indigo-700 text-sm font-bold rounded-[5px] shadow-sm hover:bg-indigo-100/80 transition-all active:scale-95 flex items-center gap-2">
                                <Users size={14} /> NEW CUSTOMER
                            </button>
                            <button onClick={() => setShowAccountBoard(true)} className="px-6 h-10 bg-teal-50/50 backdrop-blur-md border border-teal-200 text-teal-700 text-sm font-bold rounded-[5px] shadow-sm hover:bg-teal-100/80 transition-all active:scale-95 flex items-center gap-2">
                                <Layers size={14} /> NEW ACCOUNT
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                            <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#2bb744] text-white text-sm font-bold rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                SAVE TRANSACTION
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* 1. Header Information Section */}
                    <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                            {/* Row 1: Document ID | Post Date | Exp. Timeline (Pay Date) */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Document ID</label>
                                <div className="flex-1 flex gap-1 h-10 min-w-0">
                                    <input type="text" name="docNo" value={formData.docNo} readOnly className="flex-1 min-w-0 h-10 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none shadow-sm" />
                                    <button onClick={handleSearchDocs} className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Search size={18} /></button>
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">Post Date</label>
                                <div className="flex-1 flex gap-1 h-10 min-w-0">
                                    <input type="text" readOnly value={formatDate(formData.date)} onClick={() => setShowDateModal(true)} className="flex-1 min-w-0 h-10 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowDateModal(true)} className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Calendar size={18} /></button>
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">Due Date</label>
                                <div className="flex-1 flex gap-1 h-10 min-w-0">
                                    <input type="text" readOnly value={formatDate(formData.dueDate)} onClick={() => setShowDueDateModal(true)} className="flex-1 min-w-0 h-10 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowDueDateModal(true)} className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Calendar size={18} /></button>
                                </div>
                            </div>

                            {/* Row 2: Petty Account (8) | Cost Center (4) */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Petty A/C</label>
                                <div className="flex-1 flex gap-1 h-10 min-w-0">
                                    <input type="text" readOnly value={formData.account ? `${formData.account} - ${safePetty.find(a => a.code === formData.account)?.name || ''}` : ''} onClick={() => setShowAccModal(true)} className="flex-1 min-w-0 h-10 border border-gray-300 px-3 text-[12px] font-bold text-[#0285fd] bg-blue-50/20 rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => setShowAccModal(true)} className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Search size={18} /></button>
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">Cost Center</label>
                                <div className="flex-1 flex gap-1 h-10 min-w-0">
                                    <input type="text" readOnly value={safeCC.find(c => c.code === formData.costCenter)?.name || ''} onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="flex-1 min-w-0 h-10 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md shrink-0"><Search size={18} /></button>
                                </div>
                            </div>

                            {/* Row 3: Vendor Selection & Payee (8) | Balance (4) */}
                            <div className="col-span-8 flex items-center gap-3">
                                <div className="flex items-center gap-2 w-24 shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={formData.isVendor}
                                        onChange={(e) => setFormData({ ...formData, isVendor: e.target.checked, vendorId: '', payee: '' })}
                                        className="w-4 h-4 text-[#0285fd] border-gray-300 rounded focus:ring-[#0285fd]"
                                    />
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tighter">Vendor A/C</span>
                                </div>
                                <div className="flex-1 flex gap-1 h-10 min-w-0">
                                    {formData.isVendor ? (
                                        <>
                                            <input type="text" readOnly value={formData.vendorId || ''} placeholder="ID" className="w-24 h-10 border border-gray-300 px-3 text-[12px] font-mono font-bold text-[#0285fd] bg-gray-50 rounded-[5px] outline-none" />
                                            <input type="text" readOnly value={formData.payee || ''} placeholder="Select Active Vendor..." className="flex-1 h-10 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" onClick={() => setShowVendorModal(true)} />
                                            <button onClick={() => setShowVendorModal(true)} className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md transition-all active:scale-95"><Search size={18} /></button>
                                        </>
                                    ) : (
                                        <input type="text" value={formData.payee} onChange={(e) => setFormData({ ...formData, payee: e.target.value })} placeholder="" className="flex-1 h-10 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm focus:border-[#0285fd] transition-all" />
                                    )}
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">A/C Balance</label>
                                <div className="flex-1 h-10 bg-blue-50/50 border border-blue-100 rounded-[5px] flex items-center justify-end px-4">
                                    <span className="text-[15px] font-mono font-black text-[#0285fd]">{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {/* Row 4: Memo (8) | Bill Amount (4) */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Memo/Rem.</label>
                                <input type="text" value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} className="flex-1 h-10 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none bg-white shadow-sm focus:border-[#0285fd] transition-all" placeholder="" />
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">Bill Amount</label>
                                <input type="number" value={formData.billAmount} onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })} className="flex-1 h-10 border-2 border-[#0285fd] px-4 text-[16px] font-mono font-black text-right text-[#0285fd] outline-none bg-white rounded-[5px] shadow-md transition-all focus:ring-2 focus:ring-blue-100" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Tabs & Items Table Section */}
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            {['Expenses', 'Items Purchase'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-12 py-3 text-[11px] font-black border rounded-t-[8px] transition-all uppercase tracking-widest ${selectedTab === tab ? 'bg-[#0285fd] border-[#0285fd] text-white shadow-md z-10' : 'bg-gray-50 border-gray-100 text-slate-500 hover:bg-white hover:text-[#0285fd]'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="border border-gray-100 rounded-lg shadow-sm bg-white overflow-hidden">
                            {selectedTab === 'Expenses' ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 border-b border-gray-100 text-slate-500 text-[10px] font-black uppercase tracking-widest sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2.5 border-r border-gray-100 w-12 text-center">#</th>
                                            <th className="px-4 py-2.5 border-r border-gray-100">Expense Portfolio</th>
                                            <th className="px-4 py-2.5 border-r border-gray-100 w-48">Cost Allocation</th>
                                            <th className="px-4 py-2.5 border-r border-gray-100 w-32 text-right">Valuation</th>
                                            <th className="px-4 py-2.5">Journal Memo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 min-h-[180px]">
                                        {expenseRows.map((row, idx) => (
                                            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-3 text-center text-[11px] font-bold text-slate-400">{idx + 1}</td>
                                                <td className="px-1.5 py-2 border-r border-gray-50">
                                                    <div className="flex gap-1 items-center">
                                                        <input type="text" readOnly value={safeExp.find(e => e.code === row.accCode)?.name || ''} className="flex-1 h-10 px-3 text-[11px] font-bold outline-none bg-gray-50/50 border border-gray-200 rounded-[4px] text-slate-700" placeholder="Select Account..." />
                                                        <button onClick={() => { setExpIndex(idx); setShowExpAccModal(true); }} className="w-9 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] transition-all shadow-sm active:scale-90"><Search size={14} /></button>
                                                    </div>
                                                </td>
                                                <td className="px-1.5 py-2 border-r border-gray-50">
                                                    <div className="flex gap-1 items-center">
                                                        <input type="text" readOnly value={safeCC.find(cc => cc.code === row.costCode)?.name || ''} className="flex-1 h-10 border border-gray-200 px-3 text-[11px] font-bold outline-none bg-white rounded-[4px] text-slate-600" placeholder="Alloc..." />
                                                        <button onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }} className="w-9 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] transition-all shadow-sm active:scale-90"><Search size={14} /></button>
                                                    </div>
                                                </td>
                                                <td className="px-1.5 py-2 border-r border-gray-50">
                                                    <input type="number" value={row.amount} onChange={(e) => handleExpenseRowUpdate(row.id, 'amount', e.target.value)} className="w-full h-10 px-3 text-[12px] font-mono font-black text-right outline-none text-blue-600 bg-white border-transparent focus:border-blue-400 rounded-[4px]" />
                                                </td>
                                                <td className="px-1.5 py-2">
                                                    <input type="text" value={row.memo} onChange={(e) => handleExpenseRowUpdate(row.id, 'memo', e.target.value)} className="w-full h-10 px-3 text-[11px] font-bold outline-none text-slate-600 bg-white border-transparent focus:border-blue-400 rounded-[4px]" placeholder="Optional description..." />
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="h-12">
                                            <td colSpan={5} className="bg-slate-50/30">
                                                <button onClick={addExpenseRow} className="w-full h-full text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#0285fd] transition-colors flex items-center justify-center gap-2">
                                                    + APPEND NEW EXPENSE LINE
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 border-b border-gray-100 text-slate-500 text-[10px] font-black uppercase tracking-widest sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2.5 border-r border-gray-100 w-12 text-center">#</th>
                                            <th className="px-4 py-2.5 border-r border-gray-100">Inventory Product</th>
                                            <th className="px-4 py-2.5 border-r border-gray-100 w-24 text-center">Qty</th>
                                            <th className="px-4 py-2.5 border-r border-gray-100 w-32 text-right">Unit Cost</th>
                                            <th className="px-4 py-2.5 border-r border-gray-100 w-32 text-right">Extension</th>
                                            <th className="px-4 py-2.5">Distribution Memo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 min-h-[180px]">
                                        {itemRows.map((row, idx) => (
                                            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-3 text-center text-[11px] font-bold text-slate-400">{idx + 1}</td>
                                                <td className="px-1.5 py-2 border-r border-gray-50">
                                                    <div className="flex gap-1 items-center">
                                                        <input type="text" readOnly value={lookups.products?.find(p => p.code === row.prodCode)?.name || ''} className="flex-1 h-10 px-3 text-[11px] font-bold outline-none bg-gray-50/50 border border-gray-200 rounded-[4px] text-slate-700" placeholder="Search Product..." />
                                                        <button onClick={() => { setProdIndex(idx); setShowProdModal(true); }} className="w-9 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] transition-all shadow-sm active:scale-90"><Search size={14} /></button>
                                                    </div>
                                                </td>
                                                <td className="px-1.5 py-2 border-r border-gray-50">
                                                    <input type="number" value={row.qty} onChange={(e) => handleItemRowUpdate(row.id, 'qty', e.target.value)} className="w-full h-10 px-3 text-[11px] font-mono font-bold text-center outline-none text-slate-700 bg-white border-transparent focus:border-blue-400 rounded-[4px]" />
                                                </td>
                                                <td className="px-1.5 py-2 border-r border-gray-50 text-right">
                                                    <input type="number" value={row.cost} onChange={(e) => handleItemRowUpdate(row.id, 'cost', e.target.value)} className="w-full h-10 px-3 text-[11px] font-mono font-bold text-right outline-none text-slate-700 bg-white border-transparent focus:border-blue-400 rounded-[4px]" />
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-50 text-right text-[12px] font-mono font-black text-blue-600">
                                                    {(Number(row.qty) * Number(row.cost)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-1.5 py-2">
                                                    <input type="text" value={row.memo} onChange={(e) => handleItemRowUpdate(row.id, 'memo', e.target.value)} className="w-full h-10 px-3 text-[11px] font-bold outline-none text-slate-600 bg-white border-transparent focus:border-blue-400 rounded-[4px]" placeholder="Notes..." />
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="h-12">
                                            <td colSpan={6} className="bg-slate-50/30">
                                                <button onClick={addItemRow} className="w-full h-full text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#0285fd] transition-colors flex items-center justify-center gap-2">
                                                    + APPEND NEW PRODUCT LINE
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* 3. Bottom Actions & Totals Area */}
                    <div className="flex items-center justify-end pt-2 border-t border-slate-100 mt-2">

                        <div className="flex items-center gap-10">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#0078d4] focus:ring-blue-500 shadow-sm transition-all" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight group-hover:text-[#0078d4] transition-colors">Queue for Printing</span>
                            </label>

                            <div className="flex items-center gap-6 bg-slate-50/80 px-6 py-2.5 rounded-lg border border-gray-100 shadow-sm">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Balance Diff.</span>
                                    <div className={`text-sm font-mono font-black tabular-nums tracking-tighter ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="h-8 w-[1px] bg-gray-200 mx-2" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-[#0285fd] uppercase tracking-widest leading-none mb-1">Total Allocated</span>
                                    <div className="text-xl font-mono font-black text-[#0285fd] tabular-nums tracking-tighter flex items-baseline gap-1">
                                        <span className="text-[12px] font-bold opacity-50">LKR</span>
                                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* --- MODALS --- */}

            {/* Petty Account Search Modal */}
            <SimpleModal
                isOpen={showAccModal}
                onClose={() => setShowAccModal(false)}
                title="Petty Cash Account Directory"
                maxWidth="max-w-[650px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Global Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={accSearch}
                                onChange={(e) => setAccSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Account Code</th>
                                        <th className="px-5 py-3">Account Title</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {safePetty.filter(a => a.name?.toLowerCase().includes(accSearch.toLowerCase()) || a.code?.toLowerCase().includes(accSearch.toLowerCase())).map((a, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, account: a.code }); setShowAccModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[11px] font-bold text-[#0285fd]">{a.code}</td>
                                            <td className="px-5 py-3 text-[11px] font-bold text-gray-600 uppercase  transition-colors group-hover:text-blue-600">{a.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT ACCOUNT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Search Modal */}
            <SimpleModal
                isOpen={showVendorModal}
                onClose={() => setShowVendorModal(false)}
                title="Active Vendor Directory"
                maxWidth="max-w-[650px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Vendor Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={vendorSearch}
                                onChange={(e) => setVendorSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Vendor ID</th>
                                        <th className="px-5 py-3">Legal Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {safeSuppliers.filter(v => v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) || v.code?.toLowerCase().includes(vendorSearch.toLowerCase())).map((v, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, vendorId: v.code, payee: v.name }); setShowVendorModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{v.code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-600 uppercase  group-hover:text-blue-600 transition-colors">{v.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT VENDOR</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Document Search Modal */}
            <SimpleModal
                isOpen={showDocSearchModal}
                onClose={() => setShowDocSearchModal(false)}
                title="Petty Cash Document History"
                maxWidth="max-w-[800px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Global Archive Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={docSearch}
                                onChange={(e) => setDocSearch(e.target.value)}
                                placeholder="Search by Doc No, Payee or Memo..."
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Doc No</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Payee / Vendor</th>
                                        <th className="px-5 py-3 text-right">Amount</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pastDocs.filter(d => d.docNo?.toLowerCase().includes(docSearch.toLowerCase()) || d.payee?.toLowerCase().includes(docSearch.toLowerCase())).map((d, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleLoadDoc(d.docNo)}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-black text-[#0285fd]">{d.docNo}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-slate-500">{formatDate(d.date)}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-600 uppercase  transition-colors group-hover:text-blue-600">{d.payee || d.vendorId}</td>
                                            <td className="px-5 py-3 text-right font-mono text-[13px] font-black text-slate-700">{d.billAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">RETRIEVE</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Search Modal */}
            <SimpleModal
                isOpen={showCCModal}
                onClose={() => setShowCCModal(false)}
                title="Operational Cost Centers"
                maxWidth="max-w-[650px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={ccSearch}
                                onChange={(e) => setCcSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Center Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {safeCC.filter(c => c.name?.toLowerCase().includes(ccSearch.toLowerCase()) || c.code?.toLowerCase().includes(ccSearch.toLowerCase())).map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                            if (ccSource === 'header') {
                                                setFormData({ ...formData, costCenter: c.code });
                                            } else if (ccIndex !== null) {
                                                const newRows = [...expenseRows];
                                                newRows[ccIndex].costCode = c.code;
                                                setExpenseRows(newRows);
                                            }
                                            setShowCCModal(false);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{c.code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-700 uppercase  group-hover:text-blue-600 transition-colors">{c.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT CENTER</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Product Search Modal */}
            <SimpleModal
                isOpen={showProdModal}
                onClose={() => setShowProdModal(false)}
                title="Inventory Product Directory"
                maxWidth="max-w-[700px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Master Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={prodSearch}
                                onChange={(e) => setProdSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Product Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.products || []).filter(p => p.name?.toLowerCase().includes(prodSearch.toLowerCase()) || p.code?.toLowerCase().includes(prodSearch.toLowerCase())).map((p, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                            if (prodIndex !== null) {
                                                const newRows = [...itemRows];
                                                newRows[prodIndex].prodCode = p.code;
                                                setItemRows(newRows);
                                            }
                                            setShowProdModal(false);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{p.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-700 uppercase italic group-hover:text-blue-600 transition-colors">{p.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-sm font-black hover:bg-blue-100/80 shadow-sm transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Expense Account Search Modal */}
            <SimpleModal
                isOpen={showExpAccModal}
                onClose={() => setShowExpAccModal(false)}
                title="GL Expense Account Directory"
                maxWidth="max-w-[650px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={expAccSearch}
                                onChange={(e) => setExpAccSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">GL Code</th>
                                        <th className="px-5 py-3">Interaction Title</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {safeExp.filter(e => e.name?.toLowerCase().includes(expAccSearch.toLowerCase()) || e.code?.toLowerCase().includes(expAccSearch.toLowerCase())).map((e, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                            if (expIndex !== null) {
                                                const newRows = [...expenseRows];
                                                newRows[expIndex].accCode = e.code;
                                                setExpenseRows(newRows);
                                            }
                                            setShowExpAccModal(false);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{e.code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-700 uppercase  group-hover:text-blue-600 transition-colors">{e.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT ACCOUNT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>
            {showDateModal && (
                <CalendarModal
                    isOpen={showDateModal}
                    onClose={() => setShowDateModal(false)}
                    currentDate={formData.date}
                    onDateChange={(d) => {
                        setFormData({ ...formData, date: d });
                        setShowDateModal(false);
                    }}
                    title="Select Ledger Posting Date"
                />
            )}

            {showDueDateModal && (
                <CalendarModal
                    isOpen={showDueDateModal}
                    onClose={() => setShowDueDateModal(false)}
                    currentDate={formData.dueDate}
                    onDateChange={(d) => {
                        setFormData({ ...formData, dueDate: d });
                        setShowDueDateModal(false);
                    }}
                    title="Select Document Due Date"
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

const FormRow = ({ label, children, width = "w-24" }) => (
    <div className="flex items-center min-h-[32px] gap-3">
        <label className={`${width} shrink-0 text-[12.5px] font-bold text-gray-700 uppercase tracking-tight leading-none`}>{label}</label>
        {children}
    </div>
);



export default PettyCashBoard;
