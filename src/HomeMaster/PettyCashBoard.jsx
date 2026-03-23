import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw, X, Save, RotateCcw, Loader2, Landmark, Wallet, Layers, Users } from 'lucide-react';
import { pettyCashService } from '../services/pettyCash.service';
import { toast } from 'react-hot-toast';

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
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={() => { fetchLookups(); handleGenerateDoc(); }} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RefreshCw size={14} className="text-[#0078d4]" />
                            Refresh
                        </button>
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 p-1 font-['Inter'] text-slate-700">
                    {/* 1. Header Information Section */}
                    <div className="grid grid-cols-12 gap-x-10 gap-y-2.5 bg-white p-5 border border-gray-200 rounded shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <Wallet size={120} />
                        </div>

                        {/* Left & Middle Column Fields */}
                        <div className="col-span-8 space-y-2.5">
                            <div className="flex items-center justify-between gap-4">
                                <FormRow label="Doc No" width="w-24">
                                    <div className="flex gap-1 w-48">
                                        <input
                                            type="text"
                                            value={formData.docNo}
                                            readOnly
                                            className="flex-1 h-7 border border-[#0078d4]/30 px-2 text-[12px] font-black text-[#0078d4] outline-none bg-blue-50/30 rounded-sm"
                                        />
                                        <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </FormRow>
                                <FormRow label="Date">
                                    <div className="flex items-center border border-gray-300 bg-white h-7 w-44 rounded-sm shadow-sm px-2 hover:border-blue-400 transition-colors">
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="flex-1 text-[12px] outline-none bg-transparent font-bold text-slate-700"
                                        />
                                        <Calendar size={12} className="text-blue-500" />
                                    </div>
                                </FormRow>
                            </div>

                            <FormRow label="Account" width="w-24">
                                <div className="flex-1 flex gap-1 items-center">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.account ? `${formData.account} - ${lookups.pettyAccounts.find(a => a.code === formData.account)?.name || ''}` : ''}
                                        placeholder="Select Petty Cash Account..."
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] bg-gray-50 outline-none rounded-sm font-bold text-slate-700"
                                    />
                                    <button onClick={() => setShowAccModal(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </FormRow>

                            <div className="bg-slate-50/50 p-3 border border-gray-200 space-y-2.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                <FormRow label="Vender" width="w-24">
                                    <div className="flex-1 flex gap-2 items-center">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={formData.isVendor}
                                                onChange={(e) => setFormData({ ...formData, isVendor: e.target.checked, vendorId: '', payee: '' })}
                                                className="w-4 h-4 rounded border-gray-300 text-[#0078d4] focus:ring-blue-500 transition-all"
                                            />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Active Vendor</span>
                                        </label>
                                        <div className="flex-1 flex gap-1">
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData.vendorId || ''}
                                                placeholder="Vendor ID..."
                                                className="w-48 h-7 border border-gray-300 px-2 text-[12px] outline-none bg-gray-100 font-bold rounded-sm"
                                            />
                                            <input
                                                type="text"
                                                readOnly={formData.isVendor}
                                                value={formData.payee}
                                                onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                                                placeholder="Payee Name..."
                                                className={`flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none rounded-sm ${formData.isVendor ? 'bg-gray-50 font-bold text-slate-800' : 'bg-white'}`}
                                            />
                                            <button
                                                disabled={!formData.isVendor}
                                                onClick={() => setShowVendorModal(true)}
                                                className={`w-8 h-7 flex items-center justify-center rounded-sm transition-colors shadow-sm ${formData.isVendor ? 'bg-[#0078d4] text-white hover:bg-[#005a9e]' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                <Search size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </FormRow>
                            </div>

                            <FormRow label="Cost Center" width="w-24">
                                <div className="flex-1 flex gap-1 items-center">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || ''}
                                        placeholder="Select Cost Center..."
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] bg-gray-50 rounded-sm outline-none"
                                    />
                                    <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </FormRow>

                            <div className="grid grid-cols-2 gap-4">
                                <FormRow label="Location">
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none rounded-sm hover:border-blue-300 focus:border-blue-500 transition-colors"
                                    />
                                </FormRow>
                                <FormRow label="Memo">
                                    <input
                                        type="text"
                                        value={formData.memo}
                                        onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none rounded-sm hover:border-blue-300 focus:border-blue-500 transition-colors"
                                    />
                                </FormRow>
                            </div>
                        </div>

                        {/* Right Column Fields */}
                        <div className="col-span-4 space-y-3 pl-6 border-l border-slate-100 flex flex-col justify-center">
                            <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-sm border border-blue-100/50">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Account Balance</label>
                                <div className="text-lg font-black text-[#0078d4] tabular-nums leading-none">
                                    <span className="text-[10px] font-bold text-slate-400 mr-1 italic">LKR</span>
                                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <FormRow label="Vouch No">
                                    <input
                                        type="text"
                                        value={formData.vouchNo}
                                        onChange={(e) => setFormData({ ...formData, vouchNo: e.target.value })}
                                        className="w-full h-7 border border-gray-300 px-2 text-[12px] outline-none rounded-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                    />
                                </FormRow>
                                <FormRow label="Due Date">
                                    <div className="flex items-center border border-gray-300 bg-white h-7 w-full rounded-sm px-2">
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="flex-1 text-[12px] outline-none bg-transparent"
                                        />
                                        <Calendar size={12} className="text-slate-400" />
                                    </div>
                                </FormRow>
                                <FormRow label="Ref No">
                                    <input
                                        type="text"
                                        value={formData.refNo}
                                        onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                                        className="w-full h-7 border border-gray-300 px-2 text-[12px] outline-none rounded-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                    />
                                </FormRow>
                                <FormRow label="Vou. Amount">
                                    <div className="flex-1 relative flex items-center">
                                        <input
                                            type="number"
                                            value={formData.billAmount}
                                            onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
                                            className="w-full h-8 border border-blue-200 px-2 text-right text-[14px] font-black text-[#0078d4] outline-none bg-blue-50/20 rounded-sm shadow-sm"
                                        />
                                    </div>
                                </FormRow>
                            </div>
                        </div>
                    </div>

                    {/* 2. Tabs & Items Table Section */}
                    <div className="space-y-0">
                        <div className="flex">
                            {['Expenses', 'Cost Center'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-10 py-2.5 text-[11px] font-black border-t border-x rounded-t-md transition-all uppercase tracking-widest ${selectedTab === tab ? 'bg-white border-gray-300 text-[#0078d4] shadow-sm z-10' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:text-slate-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="border border-gray-300 rounded-b-lg shadow-sm bg-white overflow-hidden -mt-[1px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8fafd] border-b border-gray-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.1em] sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 border-r border-gray-200">#</th>
                                        <th className="px-4 py-3 border-r border-gray-200">Expense Account</th>
                                        <th className="px-4 py-3 border-r border-gray-200 w-64">Cost Center</th>
                                        <th className="px-4 py-3 border-r border-gray-200 w-44 text-right">Amount</th>
                                        <th className="px-4 py-3">Memo / Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 min-h-[160px]">
                                    {rows.map((row, idx) => (
                                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                                            <td className="px-4 py-2 text-center text-[11px] font-black text-slate-300">{idx + 1}</td>
                                            <td className="px-1 py-1 border-r border-gray-100">
                                                <div className="flex gap-1 items-center">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={lookups.expenseAccounts.find(e => e.code === row.accCode)?.name || ''}
                                                        placeholder="Select Account..."
                                                        className="flex-1 h-7 px-2 text-[12px] outline-none bg-white border border-gray-200 rounded-sm font-semibold text-slate-700"
                                                    />
                                                    <button onClick={() => { setExpIndex(idx); setShowExpAccModal(true); }} className="w-7 h-7 bg-blue-50 text-[#0078d4] flex items-center justify-center hover:bg-blue-100 rounded-sm transition-colors border border-blue-100/50">
                                                        <Search size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-1 py-1 border-r border-gray-100">
                                                <div className="flex gap-1 items-center">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={lookups.costCenters.find(cc => cc.code === row.costCode)?.name || ''}
                                                        placeholder="Default Cost Center..."
                                                        className="flex-1 h-7 border border-gray-200 px-2 text-[12px] outline-none bg-white rounded-sm font-medium text-slate-600"
                                                    />
                                                    <button onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }} className="w-7 h-7 bg-blue-50 text-[#0078d4] flex items-center justify-center hover:bg-blue-100 rounded-sm transition-colors border border-blue-100/50">
                                                        <Search size={12} />
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
                                                    className="w-full h-7 px-2 text-[12px] text-right outline-none font-bold text-slate-800 border border-transparent focus:border-blue-300 rounded-sm tabular-nums"
                                                />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input
                                                    type="text"
                                                    value={row.memo}
                                                    onChange={(e) => handleRowUpdate(row.id, 'memo', e.target.value)}
                                                    className="w-full h-7 px-2 text-[12px] outline-none text-slate-600 italic border border-transparent focus:border-blue-300 rounded-sm"
                                                    placeholder="Enter line details..."
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="h-12 bg-slate-50/10">
                                        <td colSpan={5}>
                                            <button onClick={addRow} className="w-full h-full text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                                + ADD NEW TRANSACTION LINE
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Bottom Actions & Totals Area */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-1 group cursor-pointer transition-all hover:translate-x-1">
                                <Users size={14} className="text-blue-400" />
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">New Customer</span>
                            </div>
                            <div className="h-4 w-[1px] bg-slate-200" />
                            <div className="flex items-center gap-1 group cursor-pointer transition-all hover:translate-x-1">
                                <Layers size={14} className="text-blue-400" />
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">New Account</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-10">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#0078d4] focus:ring-blue-500 shadow-sm transition-all" />
                                </div>
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight group-hover:text-[#0078d4] transition-colors">Queue for Printing</span>
                            </label>

                            <div className="flex items-center gap-6 bg-blue-50/50 px-6 py-3 rounded-sm border border-blue-100 shadow-sm">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Difference</span>
                                    <div className={`text-sm font-black tabular-nums tracking-tighter ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="h-8 w-[1px] bg-blue-200/50 mx-2" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-[#0078d4] uppercase tracking-[0.2em] leading-none mb-1">Total Distribution</span>
                                    <div className="text-2xl font-black text-[#0078d4] tabular-nums tracking-tighter flex items-baseline gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LKR</span>
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
            {showAccModal && (
                <SearchModal
                    title="Search Petty Cash Accounts"
                    query={accSearch}
                    setQuery={setAccSearch}
                    onClose={() => setShowAccModal(false)}
                    data={lookups.pettyAccounts}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Account Name', key: 'name' }]}
                    onSelect={(a) => {
                        setFormData({ ...formData, account: a.code });
                        setShowAccModal(false);
                    }}
                />
            )}

            {/* Vendor Search Modal */}
            {showVendorModal && (
                <SearchModal
                    title="Search Active Vendors"
                    query={vendorSearch}
                    setQuery={setVendorSearch}
                    onClose={() => setShowVendorModal(false)}
                    data={lookups.suppliers}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Vendor Name', key: 'name' }]}
                    onSelect={(v) => {
                        setFormData({ ...formData, vendorId: v.code, payee: v.name });
                        setShowVendorModal(false);
                    }}
                />
            )}

            {/* Cost Center Search Modal */}
            {showCCModal && (
                <SearchModal
                    title="Search Cost Centers"
                    query={ccSearch}
                    setQuery={setCcSearch}
                    onClose={() => setShowCCModal(false)}
                    data={lookups.costCenters}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Center Name', key: 'name' }]}
                    onSelect={(c) => {
                        if (ccSource === 'header') {
                            setFormData({ ...formData, costCenter: c.code });
                        } else if (ccIndex !== null) {
                            const newRows = [...rows];
                            newRows[ccIndex].costCode = c.code;
                            setRows(newRows);
                        }
                        setShowCCModal(false);
                    }}
                />
            )}

            {/* Expense Account Search Modal (Lines) */}
            {showExpAccModal && (
                <SearchModal
                    title="Search Expense Accounts"
                    query={expAccSearch}
                    setQuery={setExpAccSearch}
                    onClose={() => setShowExpAccModal(false)}
                    data={lookups.expenseAccounts}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Account Name', key: 'name' }]}
                    onSelect={(e) => {
                        if (expIndex !== null) {
                            const newRows = [...rows];
                            newRows[expIndex].accCode = e.code;
                            setRows(newRows);
                        }
                        setShowExpAccModal(false);
                    }}
                />
            )}
        </>
    );
};

const FormRow = ({ label, children, width = "w-24" }) => (
    <div className="flex items-center min-h-[32px] gap-3">
        <label className={`${width} shrink-0 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none`}>{label}</label>
        {children}
    </div>
);

const SearchModal = ({ title, query, setQuery, onClose, data, columns, onSelect }) => (
    <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-500/30 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] font-['Inter']">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-base font-black text-slate-800 tracking-tight uppercase tracking-[0.05em]">{title}</h3>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search..." className="h-9 border border-gray-200 pl-9 pr-3 text-sm rounded-lg w-64 focus:border-blue-500 outline-none shadow-sm transition-all" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-white text-slate-400 hover:text-red-500 transition-all rounded-full border border-transparent hover:border-gray-200"><X size={20} /></button>
                </div>
            </div>
            <div className="overflow-y-auto p-2">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 sticky top-0 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                        <tr>
                            {columns.map((col, idx) => <th key={idx} className="p-4 border-b border-slate-100">{col.label}</th>)}
                            <th className="p-4 border-b border-slate-100 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.filter(item =>
                            columns.some(col => (item[col.key] || '').toLowerCase().includes(query.toLowerCase()))
                        ).map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => onSelect(item)}>
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} className={`p-4 border-b border-slate-50 text-[13px] ${cIdx === 0 ? 'font-black text-slate-700' : 'font-medium text-slate-600'}`}>
                                        {item[col.key]}
                                    </td>
                                ))}
                                <td className="p-4 border-b border-slate-50 text-center">
                                    <button className="bg-white text-[#0078d4] text-[10px] px-4 py-1.5 rounded-md font-black border border-blue-200 shadow-sm transition-all hover:bg-[#0078d4] hover:text-white uppercase tracking-tighter">SELECT</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default PettyCashBoard;
