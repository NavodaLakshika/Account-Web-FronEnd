import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import PaymentDetailModal from '../components/PaymentDetailModal';
import { Search, Calendar, ChevronDown, RefreshCw, X, Save, RotateCcw, Loader2, CreditCard, Trash2, DollarSign } from 'lucide-react';
import { payBillService } from '../services/payBill.service';


import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const PayBillBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({
        costCenters: [], vendors: [], cashAccounts: [], chqAccounts: [], creditAccounts: [], settlementAccounts: []
    });

    const getInitialFormData = () => {
        const { companyCode, userName } = getSessionData();
        return {
            payDoc: '',
            vendorId: '',
            company: companyCode || '',
            accId: '',
            payDate: new Date().toISOString().split('T')[0],
            payType: '',
            chqNo: '',
            createUser: userName || '',
            voucherNo: '',
            memo: '',
            payAmount: 0,
            costCenter: '',
            payCostCenter: ''
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    const [bills, setBills] = useState([]);
    const [advanceCredits, setAdvanceCredits] = useState({ count: 0, total: 0 });
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showCCModal, setShowCCModal] = useState(false);
    const [ccSource, setCcSource] = useState('header');
    const [showPayTypeModal, setShowPayTypeModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarField, setCalendarField] = useState(null);

    // Search states
    const [vendorSearch, setVendorSearch] = useState('');
    const [ccSearch, setCcSearch] = useState('');
    const [accSearch, setAccSearch] = useState('');

    // Saved Payments Dropdown
    const [savedPayments, setSavedPayments] = useState([]);

    // Receipt Printing
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSavedPayDoc, setLastSavedPayDoc] = useState(null);
    const [lastSavedData, setLastSavedData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const initialData = getInitialFormData();
            setFormData(initialData);
            fetchLookups();
            generateDocNo(initialData.company);
            fetchSavedPayments();
        }
    }, [isOpen]);

    const fetchSavedPayments = async () => {
        try {
            const results = await payBillService.search('');
            setSavedPayments(results || []);
        } catch (error) {
            console.error('Failed to load saved payments:', error);
        }
    };

    const fetchLookups = async () => {
        try {
            const data = await payBillService.getLookups();
            setLookups(data);
        } catch (error) {
            showErrorToast('Failed to load lookups.');
        }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await payBillService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, payDoc: data.docNo }));
        } catch (error) {
            showErrorToast('Failed to generate document number.');
        }
    };

    // Removed old search modal logic

    const handleSelectPayment = async (payDoc) => {
        try {
            setLoading(true);
            const data = await payBillService.getPayment(payDoc);

            setFormData(prev => ({
                ...prev,
                payDoc: data.payDoc,
                vendorId: data.vendorId,
                payType: data.payType || '',
                payDate: data.payDate || prev.payDate,
                voucherNo: data.voucherNo || '',
                memo: data.memo || '',
                company: data.company || prev.company
            }));

            const enhancedBills = data.bills.map(b => ({
                docNo: b.docNo,
                discount: b.discount,
                toPay: b.toPay,
                setOfUse: b.setOfUse,
                balance: b.toPay,
                amount: b.toPay + b.discount + b.setOfUse,
                selected: true
            }));

            setBills(enhancedBills);
            setAdvanceCredits({ count: 0, total: 0 });
            showSuccessToast(`Payment ${payDoc} loaded.`);
        } catch (error) {
            showErrorToast('Failed to load payment details.');
        } finally {
            setLoading(false);
        }
    };

    const availableAccounts = useMemo(() => {
        switch (formData.payType) {
            case 'Cash': return lookups.cashAccounts;
            case 'Cheque':
            case 'Online': return lookups.chqAccounts;
            case 'Petty Cash': return lookups.creditAccounts;
            case 'Settlement': return lookups.settlementAccounts;
            default: return [];
        }
    }, [formData.payType, lookups]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'vendorId' && value) {
            loadVendorBills(value);
        }
    };

    const loadVendorBills = async (vendorId) => {
        try {
            setLoading(true);
            const data = await payBillService.getVendorBills(vendorId, formData.company || 'C001');
            const enhancedData = data.bills.map(b => ({
                ...b, selected: false, toPay: b.balance, discount: 0, setOfUse: 0
            }));
            setBills(enhancedData);
            setAdvanceCredits({ count: data.numCredits || 0, total: data.totCredits || 0 });
        } catch (error) {
            showErrorToast('Failed to load bills.');
        } finally {
            setLoading(false);
        }
    };

    const handleRowUpdate = (idx, field, value) => {
        const updated = [...bills];
        if (field === 'selected') {
            updated[idx].selected = value;
            if (value) {
                const balance = parseFloat(updated[idx].balance) || 0;
                const discount = parseFloat(updated[idx].discount) || 0;
                const setOfUse = parseFloat(updated[idx].setOfUse) || 0;
                updated[idx].toPay = Math.max(0, balance - discount - setOfUse).toString();
            } else {
                updated[idx].toPay = '';
                updated[idx].discount = '';
                updated[idx].setOfUse = '';
            }
        } else {
            let numStr = value.replace(/,/g, '');
            updated[idx][field] = numStr;

            if (field === 'discount' || field === 'setOfUse') {
                const balance = parseFloat(updated[idx].balance) || 0;
                const discount = parseFloat(updated[idx].discount) || 0;
                const setOfUse = parseFloat(updated[idx].setOfUse) || 0;
                const newToPay = balance - discount - setOfUse;
                updated[idx].toPay = Math.max(0, newToPay).toString();
            }

            if (field === 'toPay') {
                const parsedNum = parseFloat(numStr);
                const maxBalance = parseFloat(updated[idx].balance) || 0;
                if (!isNaN(parsedNum) && parsedNum > maxBalance) {
                    updated[idx].toPay = maxBalance.toString();
                }
            }
        }
        setBills(updated);
    };

    const handleSelectAll = () => {
        const allSelected = bills.every(b => b.selected);
        setBills(bills.map(b => ({ ...b, selected: !allSelected })));
    };

    const handleClearSelection = () => {
        setBills(bills.map(b => ({ ...b, selected: false, toPay: b.balance, discount: 0, setOfUse: 0 })));
    };

    const totals = useMemo(() => {
        const selected = bills.filter(b => b.selected);
        return {
            amountDue: selected.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0),
            discount: selected.reduce((sum, b) => sum + (parseFloat(b.discount) || 0), 0),
            setOfUse: selected.reduce((sum, b) => sum + (parseFloat(b.setOfUse) || 0), 0),
            toPay: selected.reduce((sum, b) => sum + (parseFloat(b.toPay) || 0), 0),
            balance: selected.reduce((sum, b) => sum + (parseFloat(b.balance) || 0), 0)
        };
    }, [bills]);

    const handleClear = () => {
        const initialData = getInitialFormData();
        setFormData(initialData);
        setBills([]);
        setAdvanceCredits({ count: 0, total: 0 });
        setVendorSearch('');
        setCcSearch('');
        setAccSearch('');
        generateDocNo(initialData.company);
    };

    const handleSave = async () => {
        if (!formData.vendorId) return showErrorToast('Select Vendor Name.');
        if (!formData.payType) return showErrorToast('Select Payment Method.');
        if (!formData.accId) return showErrorToast('Select an Account.');
        if (!formData.memo) return showErrorToast('Memo not found.');

        const selectedBills = bills.filter(b => b.selected);
        if (selectedBills.length === 0 || totals.toPay <= 0) {
            return showErrorToast('No valid bills selected to pay.');
        }

        setLoading(true);
        const payload = {
            payDoc: formData.payDoc,
            vendorId: formData.vendorId,
            company: formData.company,
            accId: formData.accId,
            payDate: formData.payDate,
            payType: formData.payType,
            chqNo: formData.chqNo,
            createUser: formData.createUser,
            voucherNo: formData.voucherNo,
            memo: formData.memo,
            payAmount: totals.toPay,
            costCenter: formData.costCenter,
            payCostCenter: formData.payCostCenter,
            bills: selectedBills.map(b => ({
                docNo: b.docNo,
                discount: parseFloat(b.discount) || 0,
                toPay: parseFloat(b.toPay) || 0,
                setOfUse: parseFloat(b.setOfUse) || 0,
                costCenter: b.costCenter
            }))
        };

        try {
            await payBillService.save(payload);
            showSuccessToast('Payment Applied Successfully.');

            const paymentDetailsForReceipt = {
                payDoc: formData.payDoc,
                vendorId: formData.vendorId,
                costCenter: formData.costCenter,
                payType: formData.payType,
                payDate: formData.payDate,
                bills: selectedBills.map(b => ({
                    docNo: b.docNo,
                    discount: parseFloat(b.discount) || 0,
                    setOfUse: parseFloat(b.setOfUse) || 0,
                    toPay: parseFloat(b.toPay) || 0
                }))
            };

            setLastSavedPayDoc(formData.payDoc);
            setLastSavedData(paymentDetailsForReceipt);
            setShowReceipt(true);

            setBills([]);
            setFormData(prev => ({
                ...prev,
                vendorId: '',
                accId: '',
                memo: '',
                chqNo: '',
                voucherNo: '',
                payAmount: 0
            }));
            generateDocNo();
            fetchSavedPayments();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const openCalendar = (field) => {
        setCalendarField(field);
        setShowCalendar(true);
    };

    const handleDateSelect = (date) => {
        if (calendarField) {
            setFormData(prev => ({ ...prev, [calendarField]: date }));
        }
        setShowCalendar(false);
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
                title="Pay Bill"
                subtitle="Bill Payment"
                icon={DollarSign}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} PAY BILL
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
                                    <select
                                        name="payDoc"
                                        value={formData.payDoc}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'NEW') {
                                                handleClear();
                                            } else if (val) {
                                                handleSelectPayment(val);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 appearance-none font-bold"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value={formData.payDoc}>{formData.payDoc} (Current)</option>
                                        <option value="NEW">-- Create New Payment --</option>
                                        {savedPayments.filter(p => p.payDoc !== formData.payDoc).map((p, idx) => (
                                            <option key={idx} value={p.payDoc}>
                                                {p.payDoc} - {p.vendorId} - {parseFloat(p.payAmount || p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Date</label>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.payDate}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                        onClick={() => openCalendar('payDate')}
                                    />
                                    <button onClick={() => openCalendar('payDate')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Left Column Fields */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor Name</label>
                                    <div className="relative">
                                        <select
                                        value={lookups.vendors}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const v = (lookups.vendors || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (v) {
                                                handleInput({ target: { name: 'vendorId', value: v.code } });
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.vendors || []).map((v, idx) => (
                                            <option key={idx} value={v.code || v.itemId || v.id || v.name || v}>
                                                {v.code ? `${v.code} - ${v.name}` : (v.itemId ? `${v.itemId} - ${v.itemName || v.name}` : (v.name || v))}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                    <div className="relative">
                                        <select
                                        value={lookups.costCenters}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const c = (lookups.costCenters || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (c) {
                                                const field = ccSource === 'header' ? 'costCenter' : 'payCostCenter';
                                                setFormData(prev => ({ ...prev, [field]: c.code }));
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.costCenters || []).map((c, idx) => (
                                            <option key={idx} value={c.code || c.itemId || c.id || c.name || c}>
                                                {c.code ? `${c.code} - ${c.name}` : (c.itemId ? `${c.itemId} - ${c.itemName || c.name}` : (c.name || c))}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column Fields */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Manual Voucher No</label>
                                    <input name="voucherNo" value={formData.voucherNo} onChange={handleInput} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Total Outstanding</label>
                                    <div className="w-full h-10 border border-red-200 bg-red-50/50 px-3 text-[14px] font-bold text-red-600 text-right flex items-center justify-end rounded-[3px]">
                                        {totals.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bills Selection Table Section */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 mb-2 px-2 border-b border-gray-200 pb-2">
                            <div className="flex gap-4">
                                <button className="text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all border-blue-600 text-blue-600">
                                    Outstanding Bills
                                </button>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[200px]">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-2 w-[4%] text-center">
                                            <input type="checkbox" onChange={handleSelectAll} checked={bills.length > 0 && bills.every(b => b.selected)} className="w-4 h-4 rounded border-slate-300 text-[#0285fd] focus:ring-[#0285fd] align-middle" />
                                        </th>
                                        <th className="px-4 w-[10%]">Due Date</th>
                                        <th className="px-4 w-[13%]">Doc No</th>
                                        <th className="px-4 w-[12%] text-right">Amount Due</th>
                                        <th className="px-4 w-[12%] text-right">Balance</th>
                                        <th className="px-3 w-[10%] text-right">Discount</th>
                                        <th className="px-3 w-[10%] text-right">Set Of Use</th>
                                        <th className="px-3 w-[12%] text-right">Amt. To Pay</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest animate-pulse">Fetching Vendor Ledgers...</td>
                                        </tr>
                                    )}
                                    {!loading && bills.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No outstanding bills found.</td>
                                        </tr>
                                    )}
                                    {bills.map((bill, idx) => (
                                        <tr key={idx} className={`border-b border-gray-50 text-[12px] font-bold text-gray-700 transition-colors ${bill.selected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                                            <td className="px-2 py-2.5 text-center align-middle">
                                                <input type="checkbox" checked={bill.selected} onChange={(e) => handleRowUpdate(idx, 'selected', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#0285fd] focus:ring-[#0285fd] align-middle" />
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-gray-500 align-middle">{bill.date?.split('T')[0]}</td>
                                            <td className="px-4 py-2.5 font-mono text-blue-700 uppercase align-middle">{bill.docNo}</td>
                                            <td className="px-4 py-2.5 font-mono text-gray-700 text-right align-middle">{parseFloat(bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-2.5 font-mono font-black text-red-600 bg-red-50/10 text-right align-middle">{parseFloat(bill.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-1 py-2 align-middle">
                                                <input type="text" disabled={!bill.selected} value={bill.discount || ''} onChange={(e) => handleRowUpdate(idx, 'discount', e.target.value)} className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] disabled:bg-transparent disabled:border-transparent disabled:opacity-50" />
                                            </td>
                                            <td className="px-1 py-2 align-middle">
                                                <input type="text" disabled={!bill.selected} value={bill.setOfUse || ''} onChange={(e) => handleRowUpdate(idx, 'setOfUse', e.target.value)} className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] disabled:bg-transparent disabled:border-transparent disabled:opacity-50" />
                                            </td>
                                            <td className="px-1 py-2 align-middle">
                                                <input type="text" disabled={!bill.selected} value={bill.toPay || ''} onChange={(e) => handleRowUpdate(idx, 'toPay', e.target.value)} className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[12px] font-mono font-bold text-blue-700 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] disabled:bg-transparent disabled:border-transparent disabled:opacity-50" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Action Buttons Row */}
                            <div className="mt-auto border-t border-slate-200 bg-slate-50/80 p-3 flex items-center gap-4">
                                <button onClick={() => setBills(bills.map(b => ({ ...b, selected: true })))} className="px-5 h-8 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[3px] hover:bg-blue-700 shadow-sm transition-all active:scale-95 leading-none">
                                    SELECT ALL
                                </button>
                                <button onClick={handleClearSelection} className="px-5 h-8 bg-white border border-gray-300 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-[3px] hover:bg-gray-50 shadow-sm transition-all active:scale-95 leading-none">
                                    RESET
                                </button>
                                <div className="h-5 w-px bg-gray-200"></div>
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                                    <CreditCard size={12} /> {bills.filter(b => b.selected).length} Invoice(s) Selected
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Totals & Payment Settlement Section */}
                    <div className="grid grid-cols-12 gap-x-6 mt-4">
                        {/* Left - Memo & Summary */}
                        <div className="col-span-7 space-y-4">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">General Memo</label>
                                    <input name="memo" value={formData.memo} onChange={handleInput} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                                <div className="grid grid-cols-12 gap-x-4">
                                    <div className="col-span-4">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Gross Amount</label>
                                        <div className="w-full h-10 border border-gray-200 bg-gray-50/50 px-3 text-[14px] font-bold text-gray-700 text-right flex items-center justify-end rounded-[3px]">
                                            {totals.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Trade Discount</label>
                                        <div className="w-full h-10 border border-gray-200 bg-gray-50/50 px-3 text-[14px] font-bold text-gray-600 text-right flex items-center justify-end rounded-[3px]">
                                            {totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit Setoffs</label>
                                        <div className="w-full h-10 border border-gray-200 bg-gray-50/50 px-3 text-[14px] font-bold text-gray-600 text-right flex items-center justify-end rounded-[3px]">
                                            {totals.setOfUse.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] font-black text-blue-600 uppercase tracking-widest">NET AMOUNT TO PAY</span>
                                        <span className="text-[22px] font-black text-slate-900 tracking-tighter">
                                            {totals.toPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Payment Settlement */}
                        <div className="col-span-5 space-y-4">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3.5">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="h-4 w-1.5 bg-[#0285fd] rounded"></div>
                                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">Payment Details</h4>
                                </div>

                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Method</label>
                                    <div className="relative">
                                        <select
                                            value={formData.payType || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, payType: e.target.value, accId: '' }))}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select...</option>
                                            {['Cash', 'Cheque', 'Online', 'Petty Cash', 'Settlement'].map((type, idx) => (
                                                <option key={idx} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Account</label>
                                    <div className="relative">
                                        <select
                                        value={availableAccounts.find}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const a = (availableAccounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (a) {
                                                setFormData(prev => ({ ...prev, accId: a.code }));
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(availableAccounts || []).map((a, idx) => (
                                            <option key={idx} value={a.code || a.itemId || a.id || a.name || a}>
                                                {a.code ? `${a.code} - ${a.name}` : (a.itemId ? `${a.itemId} - ${a.itemName || a.name}` : (a.name || a))}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
                                </div>

                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Ref No</label>
                                    <input name="chqNo" value={formData.chqNo} onChange={handleInput} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>

                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Allocation Cost Center</label>
                                    <div className="relative">
                                        <select
                                        value={lookups.costCenters}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const c = (lookups.costCenters || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (c) {
                                                const field = ccSource === 'header' ? 'costCenter' : 'payCostCenter';
                                                setFormData(prev => ({ ...prev, [field]: c.code }));
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.costCenters || []).map((c, idx) => (
                                            <option key={idx} value={c.code || c.itemId || c.id || c.name || c}>
                                                {c.code ? `${c.code} - ${c.name}` : (c.itemId ? `${c.itemId} - ${c.itemName || c.name}` : (c.name || c))}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
                                </div>

                                {advanceCredits.count > 0 && (
                                    <>
                                        <div className="pt-1">
                                            <div className="flex items-center gap-4 bg-yellow-50/50 p-2 rounded-[3px] border border-yellow-200">
                                                <label className="block text-[12px] font-bold text-yellow-800 shrink-0 uppercase">No of Credits</label>
                                                <div className="flex-1 h-10 border border-yellow-200 bg-white px-3 text-[14px] font-black text-yellow-700 text-right flex items-center justify-end rounded-[3px]">
                                                    {advanceCredits.count}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            <div className="flex items-center gap-4 bg-blue-50/50 p-2 rounded-[3px] border border-green-200">
                                                <label className="block text-[12px] font-bold text-green-800 shrink-0 uppercase">Available Credit</label>
                                                <div className="flex-1 h-10 border border-green-200 bg-white px-3 text-[14px] font-black text-blue-700 text-right flex items-center justify-end rounded-[3px]">
                                                    {advanceCredits.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-1">
                                    <div className="flex items-center gap-4 bg-blue-50/50 p-2 rounded-[3px] border border-blue-100">
                                        <label className="block text-[12px] font-black text-blue-800 shrink-0 uppercase">Funds Applied</label>
                                        <div className="flex-1 h-10 border border-blue-200 bg-white px-3 text-[18px] font-black text-blue-700 text-right flex items-center justify-end rounded-[3px]">
                                            {totals.toPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <CalendarModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData[calendarField]}
            />

            {/* Vendor Search Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Vendor Records - ${lookups.vendors.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input
                            type="text"
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1"
                            value={vendorSearch}
                            onChange={(e) => setVendorSearch(e.target.value)}
                        />
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
                                {lookups.vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase())).map((v, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{v.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                handleInput({ target: { name: 'vendorId', value: v.code } });
                                                setShowVendorModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Search Modal */}
            <SimpleModal isOpen={showCCModal} onClose={() => setShowCCModal(false)} title={`Cost Center Directory - ${lookups.costCenters.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input
                            type="text"
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1"
                            value={ccSearch}
                            onChange={(e) => setCcSearch(e.target.value)}
                        />
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
                                {lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(ccSearch.toLowerCase()) || (c.code || '').toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                const field = ccSource === 'header' ? 'costCenter' : 'payCostCenter';
                                                setFormData(prev => ({ ...prev, [field]: c.code }));
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

            {/* Payment Method dropdown used instead of modal */}

            {/* Payment Account Search Modal */}
            <SimpleModal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title={`Origin Accounts (${formData.payType})`} maxWidth="max-w-[700px]">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Search Available Ledgers</span>
                        <input
                            type="text"
                            placeholder="Filter accounts"
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1"
                            value={accSearch}
                            onChange={(e) => setAccSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Account Descriptor</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {availableAccounts.filter(a => (a.name || '').toLowerCase().includes(accSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setFormData(prev => ({ ...prev, accId: a.code }));
                                                setShowAccModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Saved Payments dropdown used instead of modal */}

            {/* Receipt Modal */}
            {showReceipt && lastSavedPayDoc && (
                <PaymentDetailModal
                    payDoc={lastSavedPayDoc}
                    preloadedData={lastSavedData}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </>
    );
};

export default PayBillBoard;
