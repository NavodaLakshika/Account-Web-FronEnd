import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import ReportPrintModal from '../components/modals/AdminReports/ReportPrintModal';
import PaymentDetailModal from '../components/PaymentDetailModal';
import { Search, Calendar, ChevronDown, RefreshCw, X, Save, RotateCcw, Loader2, CreditCard, Trash2 } from 'lucide-react';
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
    const [ccSource, setCcSource] = useState('header'); // 'header' or 'payment'
    const [showPayTypeModal, setShowPayTypeModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarField, setCalendarField] = useState(null);

    // Search states
    const [vendorSearch, setVendorSearch] = useState('');
    const [ccSearch, setCcSearch] = useState('');
    const [accSearch, setAccSearch] = useState('');

    // Search Payment Modal
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
    const [paymentSearchResults, setPaymentSearchResults] = useState([]);
    const [searchingPayments, setSearchingPayments] = useState(false);

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
        }
    }, [isOpen]);

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

    useEffect(() => {
        if (showSearchModal) {
            handlePaymentSearch();
        }
    }, [showSearchModal, paymentSearchQuery]);

    const handlePaymentSearch = async () => {
        try {
            setSearchingPayments(true);
            const results = await payBillService.search(paymentSearchQuery);
            setPaymentSearchResults(results);
        } catch (error) {
            showErrorToast('Failed to search payments');
        } finally {
            setSearchingPayments(false);
        }
    };

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
            setAdvanceCredits({ count: 0, total: 0 }); // reset advance credits
            setShowSearchModal(false);
            showSuccessToast(`Payment ${payDoc} loaded.`);
        } catch (error) {
            showErrorToast('Failed to load payment details.');
        } finally {
            setLoading(false);
        }
    };

    // Load available accounts based on Payment Method Dropdown
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
            updated[idx][field] = numStr; // Store as raw string to allow typing decimals

            // Recalculate toPay if discount or setOfUse changed
            if (field === 'discount' || field === 'setOfUse') {
                const balance = parseFloat(updated[idx].balance) || 0;
                const discount = parseFloat(updated[idx].discount) || 0;
                const setOfUse = parseFloat(updated[idx].setOfUse) || 0;
                const newToPay = balance - discount - setOfUse;
                updated[idx].toPay = Math.max(0, newToPay).toString();
            }

            // Still enforce cap logic if it's cleanly readable as a number
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

    // Computations
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

    const StatRow = ({ label, value }) => (
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
            <span>{label}</span>
            <span className="font-mono text-gray-700">{value}</span>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Pay Supplier Bills"
                maxWidth="max-w-[1050px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-slate-200 rounded-b-xl">
                        <button onClick={handleSave} disabled={loading} className={`px-8 h-10 bg-[#2bb744] text-white text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            PAY BILL
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none shadow-md shadow-blue-100">
                            <RotateCcw size={14} /> CLEAR FORM
                        </button>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma'] select-none px-1">
                    {/* 1. Header Detail Configuration Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-2">
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Doc Number</label>
                                <div className="flex items-center gap-1 h-8">
                                    <input type="text" name="payDoc" value={formData.payDoc} readOnly className="w-32 h-8 font-mono border border-slate-200 px-3 text-[12px] font-bold text-blue-600 bg-white rounded outline-none text-center transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => setShowSearchModal(true)} />
                                    <button onClick={() => setShowSearchModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Transaction Date</label>
                                <div className="flex h-8 gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.payDate}
                                        className="w-[210px] px-3 h-8 text-[12px] border border-slate-200 rounded outline-none text-gray-700 font-mono font-bold bg-white text-center transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer"
                                        onClick={() => openCalendar('payDate')}
                                    />
                                    <button onClick={() => openCalendar('payDate')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 hover:bg-[#0073ff]">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-10 gap-y-4">
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Vendor Name</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.vendors.find(v => v.code === formData.vendorId)?.name || ''}
                                        className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[12px] rounded outline-none font-bold text-blue-700 bg-white transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer truncate"
                                        onClick={() => setShowVendorModal(true)}
                                    />
                                    <button onClick={() => setShowVendorModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-6 flex items-center gap-4 text-center">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-left">Cost Center</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || ''}
                                        className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[12px] bg-white rounded font-bold text-gray-700 outline-none truncate transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer"
                                        onClick={() => { setCcSource('header'); setShowCCModal(true); }}
                                    />
                                    <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 hover:bg-[#0073ff]">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-6 flex items-center gap-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 px-4">Manual Vou.</label>
                                <input type="text" name="voucherNo" value={formData.voucherNo} onChange={handleInput} className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[12px] font-bold rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white transition-all text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Main Bills Table - Refined Distributions */}
                    <div className="bg-white border border-slate-200 rounded-[5px] shadow-sm overflow-hidden flex flex-col mt-4">
                        <div className="flex-1 bg-white overflow-y-auto max-h-[300px] custom-scrollbar">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="w-12 px-4 border-r border-slate-200 text-center align-middle font-black">
                                            <input type="checkbox" onChange={handleSelectAll} checked={bills.length > 0 && bills.every(b => b.selected)} className="w-4 h-4 rounded border-slate-300 text-[#00D1FF] focus:ring-[#00D1FF] align-middle" />
                                        </th>
                                        <th className="w-[10%] px-4 border-r border-slate-200 font-black whitespace-nowrap">Date Due</th>
                                        <th className="w-[15%] px-4 border-r border-slate-200 font-black whitespace-nowrap">Doc No</th>
                                        <th className="w-[15%] px-4 border-r border-slate-200 text-right font-black">Amount Due</th>
                                        <th className="w-[15%] px-4 border-r border-slate-200 text-right font-black">Balance</th>
                                        <th className="w-[15%] px-4 border-r border-slate-200 text-right font-black">Discount</th>
                                        <th className="w-[15%] px-4 border-r border-slate-200 text-right font-black">Set Of Use</th>
                                        <th className="w-[15%] px-4 text-right font-black">Amt. To Pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan="8" className="p-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest animate-pulse">Fetching Vendor Ledgers...</td>
                                        </tr>
                                    )}
                                    {!loading && bills.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="p-12 text-center text-gray-300 font-black text-[11px] uppercase tracking-widest">No outstanding bills found.</td>
                                        </tr>
                                    )}
                                    {bills.map((bill, idx) => (
                                        <tr key={idx} className={`border-b border-gray-50 text-[12px] font-bold text-gray-700 transition-colors ${bill.selected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                                            <td className="w-12 px-4 border-r border-gray-50 text-center align-middle">
                                                <input type="checkbox" checked={bill.selected} onChange={(e) => handleRowUpdate(idx, 'selected', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#00D1FF] focus:ring-[#00D1FF] align-middle" />
                                            </td>
                                            <td className="px-4 border-r border-gray-50 font-mono text-gray-500 align-middle whitespace-nowrap">{bill.date?.split('T')[0]}</td>
                                            <td className="px-4 border-r border-gray-50 font-mono text-blue-700 uppercase align-middle">{bill.docNo}</td>
                                            <td className="px-4 border-r border-gray-50 font-mono text-gray-700 text-right align-middle">{parseFloat(bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 border-r border-gray-50 font-mono font-black text-red-600 bg-red-50/10 text-right align-middle">{parseFloat(bill.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-2 border-r border-gray-50 align-middle py-1">
                                                <input type="text" disabled={!bill.selected} value={bill.discount || ''} onChange={(e) => handleRowUpdate(idx, 'discount', e.target.value)} className="w-full h-7 font-mono border border-slate-200 px-2 text-right text-[12px] outline-none rounded bg-white transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 disabled:bg-transparent disabled:border-transparent disabled:opacity-50" />
                                            </td>
                                            <td className="px-2 border-r border-gray-50 align-middle py-1">
                                                <input type="text" disabled={!bill.selected} value={bill.setOfUse || ''} onChange={(e) => handleRowUpdate(idx, 'setOfUse', e.target.value)} className="w-full h-7 font-mono border border-slate-200 px-2 text-right text-[12px] outline-none rounded bg-white transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 disabled:bg-transparent disabled:border-transparent disabled:opacity-50" />
                                            </td>
                                            <td className="px-2 align-middle py-1">
                                                <input type="text" disabled={!bill.selected} value={bill.toPay || ''} onChange={(e) => handleRowUpdate(idx, 'toPay', e.target.value)} className="w-full h-7 font-mono text-blue-700 font-bold border border-slate-200 px-2 text-right text-[12px] outline-none rounded bg-white transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 disabled:bg-transparent disabled:border-transparent disabled:opacity-50 shadow-sm" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Global Totals & Payment Summary Section */}
                    <div className="grid grid-cols-12 gap-x-10 items-start mt-4">
                        <div className="col-span-8 bg-white border border-slate-200 p-4 rounded-[5px] shadow-sm space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Outstanding</label>
                                <div className="flex-1 h-8 font-mono border border-red-100 bg-red-50/50 px-4 text-[15px] font-black text-red-600 text-right flex items-center justify-end rounded-[5px]">
                                    {totals.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">General Memo</label>
                                <input type="text" name="memo" value={formData.memo} onChange={handleInput} className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[12px] font-bold rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white transition-all text-gray-700" />
                            </div>

                            <div className="flex items-center gap-3 pt-0.5">
                                <button onClick={() => setBills(bills.map(b => ({ ...b, selected: true })))} className="px-5 h-7 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-blue-700 shadow-sm transition-all active:scale-95 leading-none">Select All Invoices</button>
                                <button onClick={handleClearSelection} className="px-5 h-7 bg-white border border-gray-300 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-gray-50 shadow-sm transition-all active:scale-95 leading-none">Reset Selection</button>
                                <div className="h-4 w-[1px] bg-gray-200"></div>
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-2"><CreditCard size={11} /> {bills.filter(b => b.selected).length} Active Invoices Selected</span>
                            </div>
                        </div>

                        <div className="col-span-4 space-y-1.5 bg-slate-50 p-4 rounded-[5px] border border-slate-200">
                            <StatRow label="Gross Amount" value={totals.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                            <StatRow label="Trade Discount" value={totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                            <StatRow label="Credit Setoffs" value={totals.setOfUse.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                            <div className="pt-2 border-t border-slate-200 mt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">NET TO PAY</span>
                                    <span className="text-[20px] font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">
                                        {totals.toPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Payment Finalization Execution Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] shadow-sm mb-2 mt-4">
                        <div className="grid grid-cols-12 gap-x-10 gap-y-4">
                            <div className="col-span-12">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="h-4 w-1.5 bg-blue-600 rounded"></div>
                                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">Financial Settlement Details</h4>
                                </div>
                            </div>

                            <div className="col-span-12 grid grid-cols-12 gap-x-10">
                                <div className="col-span-5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Payment Method</label>
                                        <div className="flex-1 flex gap-1 h-8">
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData.payType || ''}
                                                className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[12px] font-bold text-blue-700 bg-white rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer"
                                                onClick={() => setShowPayTypeModal(true)}
                                            />
                                            <button onClick={() => setShowPayTypeModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Cheque Ref No</label>
                                        <input type="text" name="chqNo" value={formData.chqNo} onChange={handleInput} disabled={formData.payType !== 'Cheque'} className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[12px] font-bold rounded outline-none bg-white focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 disabled:bg-slate-50 disabled:text-gray-400 transition-all" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Settlement Date</label>
                                        <input type="text" value={formData.payDate} readOnly className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[12px] font-bold bg-slate-50 rounded outline-none text-center text-gray-600" />
                                    </div>
                                </div>

                                <div className="col-span-7 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Payment Account</label>
                                        <div className="flex-1 flex gap-1 h-8">
                                            <input
                                                type="text"
                                                readOnly
                                                value={availableAccounts.find(a => a.code === formData.accId)?.name ? `${formData.accId} - ${availableAccounts.find(a => a.code === formData.accId).name}` : ''}
                                                className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[11px] font-bold bg-white rounded outline-none truncate transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer text-gray-700"
                                                onClick={() => setShowAccModal(true)}
                                            />
                                            <button onClick={() => setShowAccModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Allocation CC</label>
                                        <div className="flex-1 flex gap-1 h-8">
                                            <input
                                                type="text"
                                                readOnly
                                                value={lookups.costCenters.find(c => c.code === formData.payCostCenter)?.name || ''}
                                                className="flex-1 min-w-0 h-8 font-mono border border-slate-200 px-3 text-[12px] bg-white rounded font-bold text-gray-700 outline-none truncate transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer"
                                                onClick={() => { setCcSource('payment'); setShowCCModal(true); }}
                                            />
                                            <button onClick={() => { setCcSource('payment'); setShowCCModal(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 hover:bg-[#0073ff]">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {advanceCredits.count > 0 && (
                                        <>
                                            <div className="pt-0.5">
                                                <div className="flex items-center gap-4 bg-yellow-50/50 p-1.5 rounded-lg border border-yellow-200">
                                                    <label className="text-[12px] font-black text-yellow-800 w-32 shrink-0 uppercase tracking-tighter">No of Credits</label>
                                                    <div className="flex-1 h-8 font-mono bg-white border border-yellow-200 px-3 text-[14px] font-black text-yellow-700 text-right flex items-center justify-end rounded-[5px] shadow-sm">
                                                        {advanceCredits.count}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-0.5">
                                                <div className="flex items-center gap-4 bg-green-50/50 p-1.5 rounded-lg border border-green-200">
                                                    <label className="text-[12px] font-black text-green-800 w-32 shrink-0 uppercase tracking-tighter">Available Credit</label>
                                                    <div className="flex-1 h-8 font-mono bg-white border border-green-200 px-3 text-[14px] font-black text-green-700 text-right flex items-center justify-end rounded-[5px] shadow-sm">
                                                        {advanceCredits.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="pt-0.5">
                                        <div className="flex items-center gap-4 bg-blue-50/50 p-1.5 rounded-lg border border-blue-100">
                                            <label className="text-[12px] font-black text-blue-800 w-32 shrink-0 uppercase tracking-tighter">Funds Applied</label>
                                            <div className="flex-1 h-8 font-mono bg-white border border-blue-200 px-3 text-[18px] font-black text-blue-700 text-right flex items-center justify-end rounded-[5px] shadow-sm">
                                                {totals.toPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData[calendarField]}
            />

            {/* Vendor Search Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Search Vendors - ${lookups.vendors.length} Found`} maxWidth="max-w-xl">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input
                            type="text"
                            placeholder="Find vendor by name or ID"
                            className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm"
                            value={vendorSearch}
                            onChange={(e) => setVendorSearch(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Vendor Name</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase())).map((v, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-mono font-bold text-gray-700">{v.code}</td>
                                        <td className="p-3 font-mono uppercase text-blue-800">{v.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => {
                                                handleInput({ target: { name: 'vendorId', value: v.code } });
                                                setShowVendorModal(false);
                                            }} className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Search Modal */}
            <SimpleModal isOpen={showCCModal} onClose={() => setShowCCModal(false)} title={`Search Cost Centers - ${lookups.costCenters.length} Found`} maxWidth="max-w-xl">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input
                            type="text"
                            placeholder="Find cost center"
                            className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm"
                            value={ccSearch}
                            onChange={(e) => setCcSearch(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Center Description</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(ccSearch.toLowerCase()) || (c.code || '').toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-mono font-bold text-gray-700">{c.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700">{c.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => {
                                                const field = ccSource === 'header' ? 'costCenter' : 'payCostCenter';
                                                setFormData(prev => ({ ...prev, [field]: c.code }));
                                                setShowCCModal(false);
                                            }} className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Payment Method Search Modal */}
            <SimpleModal isOpen={showPayTypeModal} onClose={() => setShowPayTypeModal(false)} title="Select Settlement Mode" maxWidth="max-w-md">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-6 border-b">ID</th>
                                    <th className="px-6 border-b">Method Descriptor</th>
                                    <th className="px-6 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {['Cash', 'Cheque', 'Online', 'Petty Cash', 'Settlement'].map((type, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="px-6 py-3 font-mono font-bold text-gray-400">{idx + 1}</td>
                                        <td className="px-6 py-3 font-mono font-bold uppercase text-gray-700">{type}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, payType: type, accId: '' }));
                                                    setShowPayTypeModal(false);
                                                }}
                                                className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95"
                                            >
                                                SELECT
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Payment Account Search Modal */}
            <SimpleModal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title={`Origin Accounts (${formData.payType})`} maxWidth="max-w-xl">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Search Available Ledgers</span>
                        <input
                            type="text"
                            placeholder="Filter accounts"
                            className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm"
                            value={accSearch}
                            onChange={(e) => setAccSearch(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Account Descriptor</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {availableAccounts.filter(a => (a.name || '').toLowerCase().includes(accSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-mono font-bold text-gray-700">{a.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700">{a.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => {
                                                setFormData(prev => ({ ...prev, accId: a.code }));
                                                setShowAccModal(false);
                                            }} className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Search Payment Modal */}
            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title={`Saved Payments - ${paymentSearchResults?.length || 0} Found`} maxWidth="max-w-3xl">
                <div className="p-4 space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by Document No or Vendor..."
                            value={paymentSearchQuery}
                            onChange={(e) => setPaymentSearchQuery(e.target.value)}
                            className="flex-1 h-10 px-3 border border-gray-300 rounded-[5px] outline-none focus:border-blue-500 font-mono text-sm"
                        />
                    </div>
                    <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-[5px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] text-gray-700 uppercase bg-gray-100 sticky top-0 border-b border-gray-200 shadow-sm z-10">
                                <tr>
                                    <th className="px-4 py-3 font-black tracking-wider">Pay Doc</th>
                                    <th className="px-4 py-3 font-black tracking-wider">Vendor</th>
                                    <th className="px-4 py-3 font-black tracking-wider">Date</th>
                                    <th className="px-4 py-3 font-black tracking-wider text-right">Amount</th>
                                    <th className="px-4 py-3 font-black tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchingPayments ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500 font-bold"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />Searching...</td></tr>
                                ) : paymentSearchResults?.map((p, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                        <td className="px-4 py-2 font-bold font-mono text-blue-700 text-[13px]">{p.payDoc}</td>
                                        <td className="px-4 py-2 font-bold text-gray-600 text-[12px]">{p.vendorId}</td>
                                        <td className="px-4 py-2 font-mono text-[12px]">{p.date}</td>
                                        <td className="px-4 py-2 text-right font-mono font-bold text-[13px] text-gray-700">{parseFloat(p.amount || 0).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => handleSelectPayment(p.payDoc)} className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">Select</button>
                                        </td>
                                    </tr>
                                ))}
                                {(!paymentSearchResults || paymentSearchResults.length === 0) && !searchingPayments && (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-bold text-sm">No saved payments found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

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

const ActionButton = ({ label, onClick }) => (
    <button onClick={onClick} className="px-5 h-7 bg-white border border-gray-400 text-gray-700 text-[12px] font-bold rounded-sm hover:bg-gray-50 hover:border-gray-600 shadow-sm transition-all active:translate-y-0.5">
        {label}
    </button>
);

const StatRow = ({ label, value, isEmpty, emphasized }) => (
    <div className="flex items-center justify-between gap-4">
        <label className="text-[12.5px] font-bold text-gray-700 whitespace-nowrap">{label}</label>
        <input
            type="text"
            value={value}
            readOnly
            className={`
                w-32 h-6 border border-gray-200 px-2 text-[11px] text-right outline-none rounded-sm bg-gray-50/30
                ${emphasized ? 'font-black text-black border-[#0078d4]/50 bg-blue-50/50 shadow-sm text-[12px]' : 'font-semibold text-gray-600'}
                ${isEmpty ? 'bg-white border-gray-300' : ''}
            `}
        />
    </div>
);

export default PayBillBoard;
