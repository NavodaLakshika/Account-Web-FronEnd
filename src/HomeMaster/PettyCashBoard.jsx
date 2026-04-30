import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw, X, Save, RotateCcw, Loader2, Landmark, Wallet, Layers, Users } from 'lucide-react';
import { pettyCashService } from '../services/pettyCash.service';
import { toast } from 'react-hot-toast';
import CalendarModal from '../components/CalendarModal';
import CustomerMasterBoard from '../components/modals/MasterSubModal/CustomerMasterBoard';
import NewAccountBoard from '../pages/NewAccountBoard';

const PettyCashBoard = ({ isOpen, onClose }) => {
    const company = localStorage.getItem('companyCode') || 'C002';
    const [loading, setLoading] = useState(false);

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

    const [selectedTab, setSelectedTab] = useState('Expenses');
    const [balance, setBalance] = useState(0.00);
    const [rows, setRows] = useState([{ id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);

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

    const [showDateModal, setShowDateModal] = useState(false);
    const [showDueDateModal, setShowDueDateModal] = useState(false);

    const [showCustomerMasterBoard, setShowCustomerMasterBoard] = useState(false);
    const [showAccountBoard, setShowAccountBoard] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

    const fetchLookups = useCallback(async () => {
        try {
            const data = await pettyCashService.getLookups(company);
            setLookups(data);
        } catch (error) {
            toast.error('Failed to load lookup data');
        }
    }, [company]);

    const handleGenerateDoc = async () => {
        try {
            const { docNo } = await pettyCashService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo }));
        } catch (error) {
            toast.error('Failed to generate document number');
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            handleGenerateDoc();
            setRows([{ id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);
        }
    }, [isOpen, fetchLookups]);

    const handleRowUpdate = (id, field, value) => {
        setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const addRow = () => {
        setRows(prev => [...prev, { id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);
    };

    const totalAmount = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const difference = Number(formData.billAmount) - totalAmount;

    const handleSave = async () => {
        try {
            if (!formData.account) return toast.error('Please select the relevant petty cash account.');
            if (formData.billAmount <= 0) return toast.error('Enter bill amount.');
            if (!formData.payee && !formData.vendorId) return toast.error('Please enter Payee or Vendor.');
            if (difference !== 0) return toast.error('Your bill amount and total amount not balanced.');

            setLoading(true);
            const payload = {
                ...formData,
                items: rows.filter(r => r.accCode || r.amount > 0).map(r => ({
                    detailsType: 'Exp',
                    code: r.accCode,
                    amount: Number(r.amount),
                    memo: r.memo,
                    costCode: r.costCode || formData.costCenter
                }))
            };

            const response = await pettyCashService.applyPettyCash(payload);
            toast.success(`${response.docNo} Record Saved Successfully.`);
            handleClear();
        } catch (error) {
            toast.error(error.response?.data || 'Failed to save Petty Cash');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(initialFormState);
        setRows([{ id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);
        setAccSearch('');
        setVendorSearch('');
        setCcSearch('');
        setExpAccSearch('');
        handleGenerateDoc();
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Petty Cash Entry"
                maxWidth="max-w-[1100px]"
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
                <div className="space-y-4 p-1 font-['Tahoma',_sans-serif] text-slate-700">
                    {/* 1. Header Information Section */}
                    <div className="grid grid-cols-12 gap-x-10 gap-y-4 bg-white p-5 border border-gray-200 rounded-[5px] shadow-sm relative overflow-hidden">
                        {/* Left & Middle Column Fields */}
                        <div className="col-span-8 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <FormRow label="Doc No" width="w-24">
                                    <div className="flex gap-1 w-48">
                                        <input
                                            type="text"
                                            value={formData.docNo}
                                            readOnly
                                            className="flex-1 h-9 border border-gray-200 px-2 text-[13px] font-mono font-black text-[#0285fd] outline-none bg-gray-50 rounded-[5px]"
                                        />
                                        <button className="w-9 h-9 shrink-0 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-colors border-none shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </FormRow>
                                <FormRow label="Date">
                                    <div className="flex gap-1 w-[200px]">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formatDate(formData.date)}
                                            className="flex-1 h-9 border border-gray-300 px-2 text-[13px] font-mono font-bold bg-gray-50 outline-none rounded-[5px] text-slate-700"
                                        />
                                        <button onClick={() => setShowDateModal(true)} className="w-9 h-9 shrink-0 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-colors border-none shadow-sm">
                                            <Calendar size={14} />
                                        </button>
                                    </div>
                                </FormRow>
                            </div>

                            <FormRow label="Account" width="w-24">
                                <div className="flex-1 flex gap-1 items-center">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.account ? `${formData.account} - ${lookups.pettyAccounts.find(a => a.code === formData.account)?.name || ''}` : ''}
                                        className="flex-1 h-9 border border-gray-300 px-2 text-[13px] font-mono font-bold bg-gray-50 outline-none rounded-[5px] text-slate-700"
                                    />
                                    <button onClick={() => setShowAccModal(true)} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-colors shadow-sm">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </FormRow>

                            <div className="bg-gray-50/50 p-4 border border-gray-200 space-y-3 rounded-[5px]">
                                <FormRow label="Vendor" width="w-24">
                                    <div className="flex-1 flex gap-3 items-center">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={formData.isVendor}
                                                onChange={(e) => setFormData({ ...formData, isVendor: e.target.checked, vendorId: '', payee: '' })}
                                                className="w-4 h-4 rounded border-gray-300 text-[#0078d4] focus:ring-blue-500 transition-all"
                                            />
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Active Vendor</span>
                                        </label>
                                        <div className="flex-1 flex gap-1">
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData.vendorId || ''}
                                                placeholder="ID"
                                                className="w-24 h-8 border border-gray-300 px-2 text-[12px] outline-none bg-gray-50 rounded-[5px] font-mono font-bold text-[#0285fd]"
                                            />
                                            <input
                                                type="text"
                                                readOnly={formData.isVendor}
                                                value={formData.payee}
                                                onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                                                className={`flex-1 h-9 border border-gray-300 px-2 text-[13px] font-mono font-bold outline-none rounded-[5px] ${formData.isVendor ? 'bg-gray-50 text-slate-800' : 'bg-white shadow-inner'}`}
                                            />
                                            <button
                                                disabled={!formData.isVendor}
                                                onClick={() => setShowVendorModal(true)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-[5px] transition-colors ${formData.isVendor ? 'bg-[#0285fd] text-white hover:bg-[#0073ff]' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                <Search size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </FormRow>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormRow label="Cost Center">
                                    <div className="flex-1 flex gap-1 items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || ''}
                                            className="flex-1 h-9 border border-gray-300 px-2 text-[13px] font-mono font-bold bg-gray-50 rounded-[5px] text-slate-700"
                                        />
                                        <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] border-none shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </FormRow>
                                <FormRow label="Location">
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="flex-1 h-9 border border-gray-300 px-2 text-[13px] font-mono font-bold outline-none rounded-[5px] focus:border-blue-500 bg-white"
                                    />
                                </FormRow>
                            </div>

                            <FormRow label="Memo/Rem" width="w-24">
                                <input
                                    type="text"
                                    value={formData.memo}
                                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                                    className="flex-1 h-9 border border-gray-300 px-2 text-[13px] font-mono font-bold outline-none rounded-[5px] focus:border-blue-500 bg-white"
                                />
                            </FormRow>
                        </div>

                        {/* Right Column Fields */}
                        <div className="col-span-4 space-y-4 pl-6 border-l border-gray-100 flex flex-col justify-center">
                            <div className="bg-blue-50/50 p-3 rounded-[5px] border border-blue-100">
                                <label className="text-xs font-bold text-blue-600 uppercase tracking-tight mb-1 block text-center">Petty A/C Balance</label>
                                <div className="text-2xl font-mono font-bold text-[#0285fd] text-center tabular-nums">
                                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <FormRow label="Vouch No">
                                    <input
                                        type="text"
                                        value={formData.vouchNo}
                                        onChange={(e) => setFormData({ ...formData, vouchNo: e.target.value })}
                                        className="w-full h-9 border border-gray-300 px-2 text-[13px] font-mono font-black outline-none rounded-[5px] bg-white text-gray-700"
                                    />
                                </FormRow>
                                <FormRow label="Due Date">
                                    <div className="flex gap-1 w-full mt-1">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formatDate(formData.dueDate)}
                                            className="w-full h-9 border border-gray-300 px-2 text-[13px] font-mono font-bold bg-gray-50 outline-none rounded-[5px] text-slate-700"
                                        />
                                        <button onClick={() => setShowDueDateModal(true)} className="w-9 h-9 shrink-0 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-colors border-none shadow-sm">
                                            <Calendar size={14} />
                                        </button>
                                    </div>
                                </FormRow>
                                <FormRow label="Ref No">
                                    <input
                                        type="text"
                                        value={formData.refNo}
                                        onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                                        className="w-full h-9 border border-gray-300 px-2 text-[13px] font-mono font-bold outline-none rounded-[5px] bg-white"
                                    />
                                </FormRow>
                                <FormRow label="Pay. Amount">
                                    <div className="flex-1 relative flex items-center">
                                        <input
                                            type="number"
                                            value={formData.billAmount}
                                            onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
                                            className="w-full h-10 border-2 border-[#0285fd] px-3 text-right text-lg font-mono font-black text-[#0285fd] outline-none bg-white rounded-[5px]"
                                        />
                                    </div>
                                </FormRow>
                            </div>
                        </div>
                    </div>

                    {/* 2. Tabs & Items Table Section */}
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            {['Expenses', 'Cost Center'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-12 py-2.5 text-xs font-bold border rounded-t-[8px] transition-all uppercase tracking-tight ${selectedTab === tab ? 'bg-[#ecc913] border-[#ecc913] text-white shadow-md z-10' : 'bg-gray-50 border-gray-200 text-slate-500 hover:bg-white hover:text-[#0285fd]'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="border border-gray-200 rounded-[5px] shadow-sm bg-white overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 text-xs font-bold uppercase tracking-tight sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 border-r border-gray-200 w-16 text-center">#</th>
                                        <th className="px-4 py-3 border-r border-gray-200">Expense Account</th>
                                        <th className="px-4 py-3 border-r border-gray-200 w-64">Cost Center</th>
                                        <th className="px-4 py-3 border-r border-gray-200 w-44 text-right">Amount</th>
                                        <th className="px-4 py-3">Memo / Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 min-h-[160px]">
                                    {rows.map((row, idx) => (
                                        <tr key={row.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-2 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                                            <td className="px-1 py-1 border-r border-gray-100">
                                                <div className="flex gap-2 items-center px-1">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={lookups.expenseAccounts.find(e => e.code === row.accCode)?.name || ''}
                                                        className="flex-1 h-8 px-2 text-[12px] font-mono font-bold outline-none bg-white border border-gray-200 rounded-[5px] text-slate-700 focus:border-blue-400"
                                                    />
                                                    <button onClick={() => { setExpIndex(idx); setShowExpAccModal(true); }} className="w-8 h-8 bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] flex items-center justify-center hover:bg-blue-100/80 rounded-[5px] transition-all shadow-sm active:scale-90">
                                                        <Search size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-1 py-1 border-r border-gray-100">
                                                <div className="flex gap-2 items-center px-1">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={lookups.costCenters.find(cc => cc.code === row.costCode)?.name || ''}
                                                        className="flex-1 h-8 border border-gray-200 px-2 text-[12px] font-mono font-bold outline-none bg-white rounded-[5px] text-slate-600"
                                                    />
                                                    <button onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }} className="w-8 h-8 bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] flex items-center justify-center hover:bg-blue-100/80 rounded-[5px] transition-all shadow-sm active:scale-90">
                                                        <Search size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-1 py-1 border-r border-gray-100 text-right">
                                                <input
                                                    type="number"
                                                    value={row.amount}
                                                    onChange={(e) => {
                                                        handleRowUpdate(row.id, 'amount', e.target.value);
                                                        if (idx === rows.length - 1 && e.target.value > 0) addRow();
                                                    }}
                                                    className="w-full h-8 px-2 text-[12px] font-mono font-black text-right outline-none text-slate-800 border-transparent focus:border-blue-400 focus:bg-white rounded-[5px] tabular-nums"
                                                />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input
                                                    type="text"
                                                    value={row.memo}
                                                    onChange={(e) => handleRowUpdate(row.id, 'memo', e.target.value)}
                                                    className="w-full h-8 px-2 text-[12px] font-mono font-bold outline-none text-slate-600 italic border-transparent focus:border-blue-400 focus:bg-white rounded-[5px]"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="h-10">
                                        <td colSpan={5}>
                                            <button onClick={addRow} className="w-full h-full text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
                                                + Click to Add Another Line Item
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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

                            <div className="flex items-center gap-6 bg-blue-50/50 px-6 py-3 rounded-sm border border-blue-100 shadow-sm">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight leading-none mb-1">Difference</span>
                                    <div className={`text-sm font-mono font-black tabular-nums tracking-tighter ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="h-8 w-[1px] bg-blue-200/50 mx-2" />
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-[#0078d4] uppercase tracking-tight leading-none mb-1">Total Distribution</span>
                                    <div className="text-2xl font-mono font-black text-[#0285fd] tabular-nums tracking-tighter flex items-baseline gap-1">
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
                                    {lookups.pettyAccounts.filter(a => a.name?.toLowerCase().includes(accSearch.toLowerCase()) || a.code?.toLowerCase().includes(accSearch.toLowerCase())).map((a, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, account: a.code }); setShowAccModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{a.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase italic transition-colors group-hover:text-blue-600">{a.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-blue-100/80 shadow-sm transition-all active:scale-95">SELECT ACCOUNT</button>
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
                                    {lookups.suppliers.filter(v => v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) || v.code?.toLowerCase().includes(vendorSearch.toLowerCase())).map((v, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, vendorId: v.code, payee: v.name }); setShowVendorModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{v.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase italic group-hover:text-blue-600 transition-colors">{v.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-blue-100/80 shadow-sm transition-all active:scale-95">SELECT VENDOR</button>
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
                                    {lookups.costCenters.filter(c => c.name?.toLowerCase().includes(ccSearch.toLowerCase()) || c.code?.toLowerCase().includes(ccSearch.toLowerCase())).map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                            if (ccSource === 'header') {
                                                setFormData({ ...formData, costCenter: c.code });
                                            } else if (ccIndex !== null) {
                                                const newRows = [...rows];
                                                newRows[ccIndex].costCode = c.code;
                                                setRows(newRows);
                                            }
                                            setShowCCModal(false);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{c.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-700 uppercase italic group-hover:text-blue-600 transition-colors">{c.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-blue-100/80 shadow-sm transition-all active:scale-95">SELECT CENTER</button>
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
                                    {lookups.expenseAccounts.filter(e => e.name?.toLowerCase().includes(expAccSearch.toLowerCase()) || e.code?.toLowerCase().includes(expAccSearch.toLowerCase())).map((e, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                            if (expIndex !== null) {
                                                const newRows = [...rows];
                                                newRows[expIndex].accCode = e.code;
                                                setRows(newRows);
                                            }
                                            setShowExpAccModal(false);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{e.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-700 uppercase italic group-hover:text-blue-600 transition-colors">{e.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-blue-100/80 shadow-sm transition-all active:scale-95">SELECT ACCOUNT</button>
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
