import React, { useState, useEffect, useCallback } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw , X, Save} from 'lucide-react';
import { pettyCashService } from '../services/pettyCash.service';
import { toast } from 'react-hot-toast';

const PettyCashBoard = ({ isOpen, onClose }) => {
    const company = localStorage.getItem('companyCode') || 'C002';

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
            // Reset rows with one empty row
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
        }
    };

    const handleClear = () => {
        setFormData(initialFormState);
        setRows([{ id: Date.now(), accCode: '', costCode: '', amount: 0, memo: '' }]);
        handleGenerateDoc();
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Petty Cash Entry"
            maxWidth="max-w-[1100px]"
            footer={
                <div className="flex items-center justify-end w-full gap-2 px-1 pb-1">
                    <button onClick={() => { fetchLookups(); handleGenerateDoc(); }} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="text-[#0078d4]" />
                        Refresh
                    </button>
                    <button onClick={handleSave} className="px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95">
                        Save
                    </button>
                    <button onClick={handleClear} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                        Clear
                    </button>
                    <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                        <X size={14} /> Exit
                    </button>
                </div>
            }
        >
            <div className="space-y-4 p-1 font-['Plus_Jakarta_Sans'] text-slate-700">
                {/* 1. Header Information Section */}
                <div className="grid grid-cols-12 gap-x-10 gap-y-2.5 bg-[#f8f9fa] p-5 border border-gray-200 rounded shadow-sm">

                    {/* Left & Middle Column Fields */}
                    <div className="col-span-8 space-y-2.5">
                        {/* Doc No & Date row */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600 w-24">Doc No</label>
                                <div className="flex gap-1 w-48">
                                    <input
                                        type="text"
                                        value={formData.docNo}
                                        readOnly
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#0078d4] outline-none bg-white"
                                    />
                                    <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e]">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600">Date</label>
                                <div className="flex items-center border border-gray-300 bg-white h-7 w-44">
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="flex-1 px-2 text-[12px] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account row */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Account</label>
                            <div className="flex-1 flex gap-2">
                                <select
                                    value={formData.account}
                                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                    className="w-48 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white font-bold"
                                >
                                    <option value="">Account ID...</option>
                                    {lookups.pettyAccounts.map(a => <option key={a.code} value={a.code}>{a.code}</option>)}
                                </select>
                                <select
                                    value={formData.account}
                                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                    className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white font-medium"
                                >
                                    <option value="">Account Name...</option>
                                    {lookups.pettyAccounts.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Vender row */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Vender</label>
                            <div className="flex-1 flex gap-2 items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isVendor}
                                    onChange={(e) => setFormData({ ...formData, isVendor: e.target.checked, vendorId: '', payee: '' })}
                                    className="w-4 h-4 border-gray-300 text-[#0078d4]"
                                />
                                <div className="flex-1 flex gap-1">
                                    <select
                                        disabled={!formData.isVendor}
                                        value={formData.vendorId}
                                        onChange={(e) => {
                                            const v = lookups.suppliers.find(s => s.code === e.target.value);
                                            setFormData({ ...formData, vendorId: e.target.value, payee: v?.name || '' });
                                        }}
                                        className="w-48 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white disabled:bg-gray-100"
                                    >
                                        <option value="">Vendor ID...</option>
                                        {lookups.suppliers.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                                    </select>
                                    <input
                                        type="text"
                                        readOnly={formData.isVendor}
                                        value={formData.payee}
                                        onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                                        placeholder="Payee Name..."
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none bg-white"
                                    />
                                    <button className="w-8 h-7 bg-gray-200 border border-gray-300 flex items-center justify-center">
                                        <Search size={14} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cost Center, Payee, Location, Memo */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Cost Center</label>
                            <select
                                value={formData.costCenter}
                                onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                                className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"
                            >
                                <option value="">Select Cost Center...</option>
                                {lookups.costCenters.map(cc => <option key={cc.code} value={cc.code}>{cc.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Payee</label>
                            <input
                                type="text"
                                value={formData.payee}
                                onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                                className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Memo</label>
                            <input
                                type="text"
                                value={formData.memo}
                                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                                className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none"
                            />
                        </div>
                    </div>

                    {/* Right Column Fields */}
                    <div className="col-span-4 space-y-3.5 pl-4 border-l border-gray-200">
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Balance</label>
                            <input type="text" value={balance.toFixed(2)} className="w-40 h-7 border-b border-gray-300 bg-transparent text-right text-[12px] outline-none font-bold" readOnly />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Vouch No</label>
                            <input
                                type="text"
                                value={formData.vouchNo}
                                onChange={(e) => setFormData({ ...formData, vouchNo: e.target.value })}
                                className="w-40 h-7 border border-gray-300 px-2 text-[12px] outline-none"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Bill Due Date</label>
                            <div className="flex items-center border border-gray-300 bg-white h-7 w-40">
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="flex-1 px-2 text-[12px] outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Reference No</label>
                            <input
                                type="text"
                                value={formData.refNo}
                                onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                                className="w-40 h-7 border border-gray-300 px-2 text-[12px] outline-none"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Vou. Amount</label>
                            <input
                                type="number"
                                value={formData.billAmount}
                                onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
                                className="w-40 h-7 border border-gray-300 px-2 text-right text-[12px] font-bold text-[#0078d4] outline-none bg-blue-50/20"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Tabs & Items Table Section */}
                <div className="space-y-0">
                    <div className="flex">
                        <button
                            onClick={() => setSelectedTab('Expenses')}
                            className={`px-8 py-2 text-[12px] font-bold border-t border-x rounded-t transition-all ${selectedTab === 'Expenses' ? 'bg-white border-gray-300 text-[#0078d4] z-10' : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setSelectedTab('Cost Center')}
                            className={`px-8 py-2 text-[12px] font-bold border-t border-x rounded-t -ml-[1px] transition-all ${selectedTab === 'Cost Center' ? 'bg-white border-gray-300 text-[#0078d4] z-10' : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            Cost Center
                        </button>
                    </div>

                    <div className="border border-gray-300 rounded-b shadow-inner bg-white overflow-hidden -mt-[1px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f1f3f5] border-b border-gray-300 text-gray-600 text-[11px] font-black uppercase tracking-wider sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 border-r border-gray-300">Expense Account</th>
                                    <th className="px-3 py-2 border-r border-gray-300 w-64">Cost Center</th>
                                    <th className="px-3 py-2 border-r border-gray-300 w-44 text-right">Amount</th>
                                    <th className="px-3 py-2">Memo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row, idx) => (
                                    <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                                        <td className="px-1 py-0.5 border-r border-gray-100">
                                            <select
                                                value={row.accCode}
                                                onChange={(e) => handleRowUpdate(row.id, 'accCode', e.target.value)}
                                                className="w-full h-7 px-1 text-[12px] outline-none bg-transparent"
                                            >
                                                <option value="">Select Account...</option>
                                                {lookups.expenseAccounts.map(e => <option key={e.code} value={e.code}>{e.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-1 py-0.5 border-r border-gray-100">
                                            <select
                                                value={row.costCode}
                                                onChange={(e) => handleRowUpdate(row.id, 'costCode', e.target.value)}
                                                className="w-full h-7 text-[12px] outline-none bg-transparent"
                                            >
                                                <option value="">Default Cost Center</option>
                                                {lookups.costCenters.map(cc => <option key={cc.code} value={cc.code}>{cc.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-1 py-0.5 border-r border-gray-100 text-right">
                                            <input
                                                type="number"
                                                value={row.amount}
                                                onChange={(e) => {
                                                    handleRowUpdate(row.id, 'amount', e.target.value);
                                                    if (idx === rows.length - 1) addRow();
                                                }}
                                                className="w-full h-7 px-1 text-[12px] text-right outline-none"
                                            />
                                        </td>
                                        <td className="px-1 py-0.5">
                                            <input
                                                type="text"
                                                value={row.memo}
                                                onChange={(e) => handleRowUpdate(row.id, 'memo', e.target.value)}
                                                className="w-full h-7 px-1 text-[12px] outline-none"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50/10 h-20">
                                    <td colSpan={4}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Bottom Actions & Totals Area */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-4 items-center">
                        <button className="text-[12px] font-bold text-blue-600 hover:underline">Add New Account..</button>
                        <button className="text-[12px] font-bold text-blue-600 hover:underline ml-4">Add New Customer</button>
                    </div>

                    <div className="flex items-center gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                            <span className="text-[12px] font-bold text-gray-600">To be print</span>
                        </label>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-black text-gray-700 uppercase">Difference</span>
                                <input type="text" value={difference.toFixed(2)} className="w-32 h-7 border border-gray-300 bg-white px-2 text-right text-[12px] font-bold outline-none" readOnly />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-black text-[#0078d4] uppercase">Total</span>
                                <div className="w-44 h-8 bg-blue-50 border-2 border-[#0078d4]/30 flex items-center px-3">
                                    <input type="text" value={totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} className="w-full text-right text-[15px] font-black text-[#0078d4] outline-none bg-transparent" readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style hmr-ignore="true">{`
                * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
            `}</style>
        </SimpleModal>
    );
};

export default PettyCashBoard;
