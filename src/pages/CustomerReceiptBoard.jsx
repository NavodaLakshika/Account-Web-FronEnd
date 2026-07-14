import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, CheckCircle, Trash2, RotateCcw, Save, X, Check, Receipt, Loader2 } from 'lucide-react';

import { customerReceiptService } from '../services/customerReceipt.service';
import { salesOrderService } from '../services/salesOrder.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';
import SearchableSelect from '../components/SearchableSelect';

const SearchModal = ({ isOpen, onClose, title, items, searchQuery, setSearchQuery, onSelect, codeKey, nameKey, searchPlaceholder = '' }) => {
    if (!isOpen) return null;
    const filtered = (items || []).filter(item => {
        const q = (searchQuery || '').toLowerCase();
        const code = ((Array.isArray(codeKey) ? codeKey.reduce((o, k) => o?.[k], item) : item[codeKey]) || '').toString().toLowerCase();
        const name = ((Array.isArray(nameKey) ? nameKey.reduce((o, k) => o?.[k], item) : item[nameKey]) || '').toString().toLowerCase();
        return code.includes(q) || name.includes(q);
    });
    return (
        <SimpleModal isOpen={isOpen} onClose={() => { onClose(); setSearchQuery?.(''); }} title={title}>
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="text" placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={searchQuery} onChange={e => setSearchQuery?.(e.target.value)} autoFocus />
                    </div>
                </div>
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No matching records discovered</td></tr>
                                ) : filtered.map((item, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { onSelect(item); onClose(); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{(Array.isArray(codeKey) ? codeKey.reduce((o, k) => o?.[k], item) : item[codeKey]) || ''}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{(Array.isArray(nameKey) ? nameKey.reduce((o, k) => o?.[k], item) : item[nameKey]) || ''}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const CustomerReceiptBoard = ({ isOpen, onClose }) => {
    const { companyCode, userName } = getSessionData();
    const [lookups, setLookups] = useState({ customers: [], paymentMethods: [], banks: [], costCenters: [] });

    const getInitialFormData = () => ({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        customerId: '',
        amount: '0.00',
        payType: '',
        bankCode: '',
        branchCode: '',
        costCenter: '',
        chequeNo: '',
        chequeDate: new Date().toISOString().split('T')[0],
        memo: '',
        reference: '',
        company: companyCode,
        createUser: userName
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [invoices, setInvoices] = useState([]);
    const [advanceBalance, setAdvanceBalance] = useState(0);
    const [overPayment, setOverPayment] = useState(0);

    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showBankSearch, setShowBankSearch] = useState(false);
    const [showPayMethodSearch, setShowPayMethodSearch] = useState(false);
    const [showCostCenterSearch, setShowCostCenterSearch] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [receiptTx, setReceiptTx] = useState(null);

    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [bankSearchQuery, setBankSearchQuery] = useState('');
    const [payMethodSearchQuery, setPayMethodSearchQuery] = useState('');
    const [costCenterSearchQuery, setCostCenterSearchQuery] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: comp, userName: user } = getSessionData();
            fetchLookups(comp);
            generateDocNo(comp);
        }
    }, [isOpen]);

    const fetchLookups = async (company) => {
        try {
            let soData = { customers: [], costCenters: [] };
            let invData = { customers: [], banks: [], costCenters: [] };
            try { soData = await salesOrderService.getInitData(company); } catch (e) { console.warn("Failed to load sales order fallback data:", e); }
            try { invData = await customerReceiptService.getInitData(company, "All"); } catch (e) { console.warn("Failed to load receipt init data:", e); }
            setLookups({
                customers: invData.customers?.length > 0 ? invData.customers : (soData.customers || []),
                paymentMethods: invData.paymentMethods?.length > 0 ? invData.paymentMethods : [],
                banks: invData.banks?.length > 0 ? invData.banks : [],
                costCenters: invData.costCenters?.length > 0 ? invData.costCenters : (soData.costCenters || [])
            });
        } catch (error) { console.error("Lookup Load Error:", error); }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await customerReceiptService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) { showErrorToast("Failed to generate Document Number"); }
    };

    const handleInput = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleCustomerSelect = async (customer) => {
        setFormData(prev => ({ ...prev, customerId: customer.code || customer.Code }));
        setShowCustomerSearch(false);
        try {
            const data = await customerReceiptService.getOutstanding(customer.code || customer.Code, formData.company, formData.docNo);
            setAdvanceBalance(data.advanceBalance || 0);
            setInvoices(data.outstandingRows.map(inv => ({
                ...inv, selected: inv.payment > 0,
                doc_No: inv.doc_No, date_Due: inv.date_Due, ref_No: inv.ref_No,
                inv_Amount: inv.inv_Amount, balance: inv.balance,
                discount: inv.discount || 0, setOff: inv.setOffVal || 0, payment: inv.payment || 0
            })));
        } catch (error) { showErrorToast("Failed to load outstanding invoices"); }
    };

    const handleInvoiceCheck = async (idx) => {
        const newInvoices = [...invoices];
        newInvoices[idx].selected = !newInvoices[idx].selected;
        if (newInvoices[idx].selected) {
            const remainingToPay = parseFloat(formData.amount) - totalAllocated;
            const canPay = Math.min(newInvoices[idx].balance, Math.max(0, remainingToPay));
            newInvoices[idx].payment = canPay;
        } else {
            newInvoices[idx].payment = 0;
            newInvoices[idx].discount = 0;
            newInvoices[idx].setOff = 0;
        }
        setInvoices(newInvoices);
        await updateBackendRow(newInvoices[idx]);
    };

    const handleInvoiceChange = async (idx, field, value) => {
        const newInvoices = [...invoices];
        newInvoices[idx][field] = parseFloat(value) || 0;
        setInvoices(newInvoices);
        if (newInvoices[idx].selected) { await updateBackendRow(newInvoices[idx]); }
    };

    const updateBackendRow = async (inv) => {
        try { await customerReceiptService.updateRow({ docNo: inv.doc_No, payment: inv.payment, discount: inv.discount, setOff: inv.setOff }, formData.company, formData.docNo, formData.customerId, "All"); } catch (e) { console.error("Row Update Fail:", e); }
    };

    const totalAllocated = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? inv.payment : 0), 0), [invoices]);
    const totalDiscount = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? inv.discount : 0), 0), [invoices]);
    const totalSetOff = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? inv.setOff : 0), 0), [invoices]);

    useEffect(() => {
        const receivedAmount = parseFloat(formData.amount) || 0;
        const allocated = totalAllocated;
        setOverPayment(receivedAmount > allocated ? receivedAmount - allocated : 0);
    }, [formData.amount, totalAllocated]);

    const handleClear = () => {
        setFormData(prev => ({ ...prev, customerId: '', amount: '0.00', payType: '', bankCode: '', branchCode: '', costCenter: '', chequeNo: '', memo: '', reference: '' }));
        setInvoices([]);
        setAdvanceBalance(0);
        setOverPayment(0);
        generateDocNo(formData.company);
    };

    const handleSelectAll = async () => {
        const newInvoices = invoices.map(inv => ({ ...inv, selected: true, payment: inv.balance }));
        setInvoices(newInvoices);
        for (const inv of newInvoices) { await updateBackendRow(inv); }
    };

    const handleClearSelections = async () => {
        const newInvoices = invoices.map(inv => ({ ...inv, selected: false, payment: 0, discount: 0, setOff: 0 }));
        setInvoices(newInvoices);
        for (const inv of newInvoices) { await updateBackendRow(inv); }
    };

    const handleApply = async () => {
        if (!formData.customerId) return showErrorToast("Please select a customer");
        if (parseFloat(formData.amount) <= 0) return showErrorToast("Please enter receipt amount");
        setIsSaving(true);
        try {
            const payload = {
                ...formData, postDate: formData.date,
                bankName: lookups.banks.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || lookups.banks.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.Bank_Name || '',
                bankId: formData.bankCode, branch: formData.branchCode, accountType: "All", overPayment
            };
            const response = await customerReceiptService.apply(payload);
            showSuccessToast("Payment Applied Successfully");
            setReceiptTx({
                type: 'CUSTOMER RECEIPT',
                docNo: response.docNo || formData.docNo,
                date: formData.date,
                payee: lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.Cust_Name || '',
                total: parseFloat(formData.amount),
                details: {
                    header: {
                        memo: formData.memo, customerCode: formData.customerId, refNo: formData.reference,
                        postDate: formData.date, payType: formData.payType,
                        bank: lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.Bank_Name || formData.bankCode || '',
                        branch: formData.branchCode, chequeNo: formData.chequeNo, chequeDate: formData.chequeDate,
                        costCenter: (() => { const cc = lookups.costCenters?.find(c => (c.code || c.Code || c.CostCenterCode || c.costCenterCode) === formData.costCenter); return cc ? (cc.name || cc.Name || cc.CostCenterName || cc.costCenterName || '') : formData.costCenter; })(),
                        discountAmount: totalDiscount, setOff: totalSetOff, overPayment
                    },
                    expenses: invoices.filter(i => i.selected && i.payment > 0).map(i => ({ accCode: i.doc_No, memo: i.ref_No || '', amount: i.payment }))
                }
            });
            handleClear();
        } catch (error) { showErrorToast(error.message); } finally { setIsSaving(false); }
    };

    const handleDelete = async () => { if (!formData.docNo) return; setShowDeleteConfirm(true); };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try { await customerReceiptService.deleteReceipt(formData.docNo, formData.company); showSuccessToast("Receipt Draft Deleted Successfully"); handleClear(); setShowDeleteConfirm(false); if (onClose) onClose(); } catch (error) { showErrorToast(error.toString()); } finally { setIsDeleting(false); }
    };

    const handleReceiptClose = () => { setReceiptTx(null); if (onClose) onClose(); };

    const handleSave = async () => {
        if (!formData.customerId) return showErrorToast("Please select a customer");
        setIsSaving(true);
        try {
            const payload = {
                ...formData, postDate: formData.date,
                bankName: lookups.banks.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || lookups.banks.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.Bank_Name || '',
                bankId: formData.bankCode, branch: formData.branchCode, accountType: "All", totalAllocated
            };
            await customerReceiptService.saveDraft(payload);
            showSuccessToast("Draft Saved Successfully");
        } catch (error) { showErrorToast(error.message); } finally { setIsSaving(false); }
    };

    if (!isOpen) return null;

    return (
        <>
            <TransactionFormWrapper
                isOpen={isOpen} onClose={onClose}
                title="Customer Receipt" subtitle="Sales Receipts" icon={null}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={handleDelete}
                                className="px-5 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                            <button onClick={handleClear}
                                className="px-5 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={isSaving}
                                className="px-5 h-10 border-2 border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button onClick={handleApply} disabled={isSaving}
                                className="px-5 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} SAVE &amp; APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Top Inputs */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Document ID</label>
                                <input type="text" name="docNo" value={formData.docNo} onChange={handleInput}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date}
                                        onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Amount</label>
                                <input type="text" name="amount" value={formData.amount} onChange={handleInput}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Received From</label>
                                <div className="relative">
                                    <input type="text" readOnly
                                        value={lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.Cust_Name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.cust_Name || ''}
                                        onClick={() => setShowCustomerSearch(true)}
                                        placeholder="Select Customer..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-[#0285fd] font-mono pr-10 cursor-pointer" />
                                    <button onClick={() => setShowCustomerSearch(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay Method</label>
                                <div className="relative">
                                    <input type="text" readOnly
                                        value={lookups.paymentMethods?.find(m => m.code === formData.payType)?.name || formData.payType || ''}
                                        onClick={() => setShowPayMethodSearch(true)}
                                        placeholder="Select method..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer" />
                                    <button onClick={() => setShowPayMethodSearch(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bank / Branch</label>
                                <div className="relative">
                                    <input type="text" readOnly
                                        value={lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.Bank_Name || ''}
                                        onClick={() => setShowBankSearch(true)}
                                        placeholder="Select Bank"
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer" />
                                    <button onClick={() => setShowBankSearch(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <input type="text" name="branchCode" value={formData.branchCode} onChange={handleInput}
                                    placeholder="Branch"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 mt-2" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                <div className="relative">
                                    <input type="text" readOnly
                                        value={(() => { const cc = lookups.costCenters?.find(c => (c.code || c.Code || c.CostCenterCode || c.costCenterCode) === formData.costCenter); return cc ? (cc.name || cc.Name || cc.CostCenterName || cc.costCenterName || '') : ''; })()}
                                        onClick={() => setShowCostCenterSearch(true)}
                                        placeholder="Select cost center..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer" />
                                    <button onClick={() => setShowCostCenterSearch(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque No</label>
                                <input type="text" name="chequeNo" value={formData.chequeNo} onChange={handleInput}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.chequeDate}
                                        onClick={() => { setDatePickerField('chequeDate'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => { setDatePickerField('chequeDate'); setShowDatePicker(true); }}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Memo / Ref</label>
                                <input type="text" name="memo" value={formData.memo} onChange={handleInput}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Grid */}
                    <div className="border border-slate-200 rounded-[3px] bg-white flex flex-col min-h-[200px] overflow-hidden">
                        <div className="flex bg-slate-50 border-b border-gray-200 text-[11px] font-black text-gray-400 uppercase tracking-widest items-center leading-10">
                            <div className="w-12 py-2.5 px-3 border-r border-gray-200 text-center">Chk</div>
                            <div className="w-24 py-2.5 px-3 border-r border-gray-200">Due Date</div>
                            <div className="w-32 py-2.5 px-3 border-r border-gray-200">Doc No</div>
                            <div className="flex-1 py-2.5 px-3 border-r border-gray-200">Ref No</div>
                            <div className="w-28 py-2.5 px-3 border-r border-gray-200 text-right">Inv Amount</div>
                            <div className="w-24 py-2.5 px-3 border-r border-gray-200 text-right">Discount</div>
                            <div className="w-24 py-2.5 px-3 border-r border-gray-200 text-right">SetOff</div>
                            <div className="w-28 py-2.5 px-3 border-r border-gray-200 text-right">Balance</div>
                            <div className="w-32 py-2.5 px-4 text-right">Payment</div>
                        </div>
                        <div className="bg-white overflow-y-auto max-h-[220px] divide-y divide-gray-50">
                            {invoices.length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                                    No outstanding invoices for this customer
                                </div>
                            ) : invoices.map((inv, idx) => (
                                <div key={idx} className={`flex text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors border-b border-gray-50 ${inv.selected ? 'bg-blue-50/20' : ''}`}>
                                    <div className="w-12 py-2 px-3 border-r border-gray-50 text-center flex items-center justify-center">
                                        <button onClick={() => handleInvoiceCheck(idx)}
                                            className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all ${inv.selected ? 'bg-[#0285fd] border-[#0285fd] text-white' : 'bg-white border-gray-300 text-transparent'}`}>
                                            {inv.selected && <Check size={12} strokeWidth={4} />}
                                        </button>
                                    </div>
                                    <div className="w-24 py-2 px-3 border-r border-gray-50 font-mono text-[10px] text-gray-500">{inv.date_Due}</div>
                                    <div className="w-32 py-2 px-3 border-r border-gray-50 font-mono">{inv.doc_No}</div>
                                    <div className="flex-1 py-2 px-3 border-r border-gray-50 truncate italic text-gray-400">{inv.ref_No}</div>
                                    <div className="w-28 py-2 px-3 border-r border-gray-50 text-right font-mono">{inv.inv_Amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    <div className="w-24 py-1.5 px-2 border-r border-gray-50 text-right">
                                        <input type="text" disabled={!inv.selected} value={inv.discount}
                                            onChange={(e) => handleInvoiceChange(idx, 'discount', e.target.value)}
                                            className="w-full h-6 border border-gray-200 rounded-[3px] text-right font-mono text-[11px] text-red-500 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] disabled:bg-gray-50" />
                                    </div>
                                    <div className="w-24 py-1.5 px-2 border-r border-gray-50 text-right">
                                        <input type="text" disabled={!inv.selected} value={inv.setOff}
                                            onChange={(e) => handleInvoiceChange(idx, 'setOff', e.target.value)}
                                            className="w-full h-6 border border-gray-200 rounded-[3px] text-right font-mono text-[11px] text-orange-500 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] disabled:bg-gray-50" />
                                    </div>
                                    <div className="w-28 py-2 px-3 border-r border-gray-50 text-right font-mono text-[#0285fd]">{inv.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    <div className="w-32 py-1.5 px-2 text-right">
                                        <input type="text" disabled={!inv.selected} value={inv.payment}
                                            onChange={(e) => handleInvoiceChange(idx, 'payment', e.target.value)}
                                            className="w-full h-6 border border-gray-200 rounded-[3px] text-right font-mono font-black text-[12px] text-emerald-600 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] disabled:bg-gray-50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions and Summary */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4 flex flex-col gap-2">
                            <div className="flex flex-col gap-2 border border-[#0285fd]/30 bg-blue-50/20 p-3 rounded-[3px] relative">
                                <span className="absolute -top-[9px] left-3 bg-white text-[10px] px-2 font-mono font-bold text-[#0285fd]">Bill Reference Actions</span>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleSelectAll}
                                        className="flex-1 h-8 bg-[#0285fd] hover:bg-[#0073ff] text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all rounded-full border-none">
                                        Select All Bills
                                    </button>
                                    <button onClick={handleClearSelections}
                                        className="flex-1 h-8 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-bold shadow-sm active:scale-95 transition-all rounded-full">
                                        Clear Selections
                                    </button>
                                </div>
                            </div>
                            <textarea name="reference" value={formData.reference} onChange={handleInput}
                                placeholder="Additional Reference / Notes"
                                className="w-full flex-1 min-h-[80px] border border-gray-300 outline-none p-2.5 text-[12px] font-mono shadow-sm resize-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] rounded-[3px] bg-white transition-all" />
                        </div>

                        <div className="col-span-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-[3px] border border-gray-200">
                                <span className="text-[13px] font-medium text-gray-700 shrink-0">Current Over Payment</span>
                                <span className="min-w-[100px] h-8 font-mono bg-gray-50 border border-gray-200 px-3 text-[14px] font-black text-blue-700 text-right flex items-center justify-end rounded-[3px]">
                                    {advanceBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-[3px] border border-gray-200">
                                <span className="text-[13px] font-medium text-gray-700 shrink-0">Over Payment Usage</span>
                                <span className="min-w-[100px] h-8 font-mono bg-gray-50 border border-gray-200 px-3 text-[14px] font-black text-[#0285fd] text-right flex items-center justify-end rounded-[3px]">
                                    {overPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="col-span-4 space-y-1.5 bg-white p-4 rounded-[3px] border border-slate-200">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12px] font-bold text-gray-700">Number Of Debit</span>
                                <span className="w-24 h-6 border border-gray-200 px-2 text-[11px] text-right font-semibold text-gray-600 rounded-sm bg-gray-50/30 flex items-center justify-end">{invoices.filter(i => i.selected).length}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12px] font-bold text-gray-700">Total Debit Available</span>
                                <span className="w-24 h-6 border border-gray-200 px-2 text-[11px] text-right font-semibold text-gray-600 rounded-sm bg-gray-50/30 flex items-center justify-end">{advanceBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12px] font-bold text-gray-700">Total Amount Due</span>
                                <span className="w-24 h-6 border border-gray-200 px-2 text-[11px] text-right font-semibold text-gray-600 rounded-sm bg-gray-50/30 flex items-center justify-end">{invoices.reduce((a, b) => a + b.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12px] font-bold text-gray-700">Payment Received</span>
                                <span className="w-24 h-6 border border-gray-200 px-2 text-[11px] text-right font-semibold text-gray-600 rounded-sm bg-gray-50/30 flex items-center justify-end">{parseFloat(formData.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12px] font-bold text-gray-700">Discount Applied</span>
                                <span className="w-24 h-6 border border-gray-200 px-2 text-[11px] text-right font-semibold text-gray-600 rounded-sm bg-gray-50/30 flex items-center justify-end">{totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12px] font-bold text-gray-700">Debit Applied</span>
                                <span className="w-24 h-6 border border-gray-200 px-2 text-[11px] text-right font-semibold text-gray-600 rounded-sm bg-gray-50/30 flex items-center justify-end">{totalSetOff.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200 mt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-[#0285fd] uppercase tracking-[0.2em]">ENDING BALANCE</span>
                                    <span className="text-[20px] font-black text-slate-900 tracking-tighter tabular-nums">
                                        {(invoices.reduce((a, b) => a + b.balance, 0) - totalAllocated - totalDiscount - totalSetOff).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}
                onDateSelect={(d) => { setFormData(prev => ({ ...prev, [datePickerField]: d })); setShowDatePicker(false); }}
                initialDate={formData[datePickerField]} />

            <SearchModal isOpen={showCustomerSearch} onClose={() => { setShowCustomerSearch(false); setCustomerSearchQuery(''); }}
                title="Customer Directory Lookup" items={lookups.customers}
                searchQuery={customerSearchQuery} setSearchQuery={setCustomerSearchQuery}
                onSelect={handleCustomerSelect}
                codeKey={['code', 'Code']} nameKey={['name', 'Cust_Name', 'cust_Name']}
                searchPlaceholder="Find customer by name or code..." />

            <SearchModal isOpen={showPayMethodSearch} onClose={() => { setShowPayMethodSearch(false); setPayMethodSearchQuery(''); }}
                title="Payment Method Lookup" items={lookups.paymentMethods}
                searchQuery={payMethodSearchQuery} setSearchQuery={setPayMethodSearchQuery}
                onSelect={(m) => { setFormData(prev => ({ ...prev, payType: m.code })); setShowPayMethodSearch(false); }}
                codeKey="code" nameKey="name"
                searchPlaceholder="Filter payment methods..." />

            <SearchModal isOpen={showBankSearch} onClose={() => { setShowBankSearch(false); setBankSearchQuery(''); }}
                title="Bank Directory Lookup" items={lookups.banks}
                searchQuery={bankSearchQuery} setSearchQuery={setBankSearchQuery}
                onSelect={(b) => { setFormData(prev => ({ ...prev, bankCode: b.bank_Code || b.Bank_Code })); setShowBankSearch(false); }}
                codeKey={['bank_Code', 'Bank_Code']} nameKey={['bank_Name', 'Bank_Name']}
                searchPlaceholder="Filter banks..." />

            <SearchModal isOpen={showCostCenterSearch} onClose={() => { setShowCostCenterSearch(false); setCostCenterSearchQuery(''); }}
                title="Cost Center Lookup" items={lookups.costCenters}
                searchQuery={costCenterSearchQuery} setSearchQuery={setCostCenterSearchQuery}
                onSelect={(c) => { setFormData(prev => ({ ...prev, costCenter: c.code || c.Code || c.CostCenterCode || c.costCenterCode })); setShowCostCenterSearch(false); }}
                codeKey={['code', 'Code', 'CostCenterCode', 'costCenterCode']} nameKey={['name', 'Name', 'CostCenterName', 'costCenterName']}
                searchPlaceholder="Filter cost centers..." />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><Trash2 size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Delete</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete this draft receipt?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}
                                    className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-[3px] hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmDelete} disabled={isDeleting}
                                    className="flex-1 h-11 bg-red-500 text-white text-[11px] font-black rounded-[3px] hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">
                                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete Now'}
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Transaction Integrity Guaranteed</span></div>
                    </div>
                </div>
            )}

            {receiptTx && <TransactionReceiptModal selectedTx={receiptTx} onClose={handleReceiptClose} />}
        </>
    );
};

export default CustomerReceiptBoard;
