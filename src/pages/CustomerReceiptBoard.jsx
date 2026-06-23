import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, CheckCircle, Trash2, RotateCcw, Save, X, Plus, Check, Receipt } from 'lucide-react';


import { customerReceiptService } from '../services/customerReceipt.service';
import { salesOrderService } from '../services/salesOrder.service'; // For customer lookup initially
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';

const CustomerReceiptBoard = ({ isOpen, onClose }) => {
    const { companyCode, userName } = getSessionData();
    const [lookups, setLookups] = useState({ 
        customers: [], 
        paymentMethods: [], 
        banks: [], 
        costCenters: [] 
    });

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
    
    // Modal States
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showBankSearch, setShowBankSearch] = useState(false);
    const [showPayMethodSearch, setShowPayMethodSearch] = useState(false);
    const [showCostCenterSearch, setShowCostCenterSearch] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [receiptTx, setReceiptTx] = useState(null);

    // Search Queries
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

            try {
                soData = await salesOrderService.getInitData(company);
            } catch (e) { console.warn("Failed to load sales order fallback data:", e); }

            try {
                invData = await customerReceiptService.getInitData(company, "All");
            } catch (e) { console.warn("Failed to load receipt init data:", e); }

            setLookups({
                customers: invData.customers?.length > 0 ? invData.customers : (soData.customers || []),
                paymentMethods: invData.paymentMethods?.length > 0 ? invData.paymentMethods : [],
                banks: invData.banks?.length > 0 ? invData.banks : [],
                costCenters: invData.costCenters?.length > 0 ? invData.costCenters : (soData.costCenters || [])
            });
        } catch (error) {
            console.error("Lookup Load Error:", error);
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await customerReceiptService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            showErrorToast("Failed to generate Document Number");
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomerSelect = async (customer) => {
        setFormData(prev => ({ ...prev, customerId: customer.code || customer.Code }));
        setShowCustomerSearch(false);
        try {
            const data = await customerReceiptService.getOutstanding(customer.code || customer.Code, formData.company, formData.docNo);
            setAdvanceBalance(data.advanceBalance || 0);
            setInvoices(data.outstandingRows.map(inv => ({
                ...inv,
                selected: inv.payment > 0,
                doc_No: inv.doc_No,
                date_Due: inv.date_Due,
                ref_No: inv.ref_No,
                inv_Amount: inv.inv_Amount,
                balance: inv.balance,
                discount: inv.discount || 0,
                setOff: inv.setOffVal || 0,
                payment: inv.payment || 0
            })));
        } catch (error) {
            showErrorToast("Failed to load outstanding invoices");
        }
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
        if (newInvoices[idx].selected) {
            await updateBackendRow(newInvoices[idx]);
        }
    };

    const updateBackendRow = async (inv) => {
        try {
            await customerReceiptService.updateRow({
                docNo: inv.doc_No,
                payment: inv.payment,
                discount: inv.discount,
                setOff: inv.setOff
            }, formData.company, formData.docNo, formData.customerId, "All");
        } catch (e) { console.error("Row Update Fail:", e); }
    };

    const totalAllocated = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? inv.payment : 0), 0), [invoices]);
    const totalDiscount = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? inv.discount : 0), 0), [invoices]);
    const totalSetOff = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? inv.setOff : 0), 0), [invoices]);

    useEffect(() => {
        const receivedAmount = parseFloat(formData.amount) || 0;
        const allocated = totalAllocated;
        if (receivedAmount > allocated) {
            setOverPayment(receivedAmount - allocated);
        } else {
            setOverPayment(0);
        }
    }, [formData.amount, totalAllocated]);

    const handleClear = () => {
        setFormData(prev => ({
            ...prev,
            customerId: '', amount: '0.00', payType: '', bankCode: '', branchCode: '', costCenter: '',
            chequeNo: '', memo: '', reference: ''
        }));
        setInvoices([]);
        setAdvanceBalance(0);
        setOverPayment(0);
        generateDocNo(formData.company);
    };

    const handleSelectAll = async () => {
        const newInvoices = [...invoices].map(inv => {
            return { ...inv, selected: true, payment: inv.balance };
        });
        setInvoices(newInvoices);
        for (const inv of newInvoices) {
            await updateBackendRow(inv);
        }
    };

    const handleClearSelections = async () => {
        const newInvoices = invoices.map(inv => ({ ...inv, selected: false, payment: 0, discount: 0, setOff: 0 }));
        setInvoices(newInvoices);
        for (const inv of newInvoices) {
            await updateBackendRow(inv);
        }
    };

    const handleApply = async () => {
        if (!formData.customerId) return showErrorToast("Please select a customer");
        if (parseFloat(formData.amount) <= 0) return showErrorToast("Please enter receipt amount");

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                postDate: formData.date,
                bankName: lookups.banks.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || lookups.banks.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.Bank_Name || '',
                bankId: formData.bankCode,
                branch: formData.branchCode,
                accountType: "All",
                overPayment: overPayment
            };
            const response = await customerReceiptService.apply(payload);
            showSuccessToast("Payment Applied Successfully");

            // Format receipt data
            setReceiptTx({
                type: 'CUSTOMER RECEIPT',
                docNo: response.docNo || formData.docNo,
                date: formData.date,
                payee: lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.Cust_Name || '',
                total: parseFloat(formData.amount),
                details: {
                    header: {
                        memo: formData.memo,
                        customerCode: formData.customerId,
                        refNo: formData.reference,
                        postDate: formData.date,
                        payType: formData.payType,
                        bank: lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.Bank_Name || formData.bankCode || '',
                        branch: formData.branchCode,
                        chequeNo: formData.chequeNo,
                        chequeDate: formData.chequeDate,
                        costCenter: (() => {
                            const cc = lookups.costCenters?.find(c => (c.code || c.Code || c.CostCenterCode || c.costCenterCode) === formData.costCenter);
                            return cc ? (cc.name || cc.Name || cc.CostCenterName || cc.costCenterName || '') : formData.costCenter;
                        })(),
                        discountAmount: totalDiscount,
                        setOff: totalSetOff,
                        overPayment: overPayment
                    },
                    expenses: invoices.filter(i => i.selected && i.payment > 0).map(i => ({
                        accCode: i.doc_No,
                        memo: i.ref_No || '',
                        amount: i.payment
                    }))
                }
            });

            handleClear();
        } catch (error) {
            showErrorToast(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.docNo) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await customerReceiptService.deleteReceipt(formData.docNo, formData.company);
            showSuccessToast("Receipt Draft Deleted Successfully");
            handleClear();
            setShowDeleteConfirm(false);
            if (onClose) onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReceiptClose = () => {
        setReceiptTx(null);
        if (onClose) onClose();
    };

    const handleSave = async () => {
        if (!formData.customerId) return showErrorToast("Please select a customer");
        
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                postDate: formData.date,
                bankName: lookups.banks.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || lookups.banks.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.Bank_Name || '',
                bankId: formData.bankCode,
                branch: formData.branchCode,
                accountType: "All",
                totalAllocated: totalAllocated
            };
            await customerReceiptService.saveDraft(payload);
            showSuccessToast("Draft Saved Successfully");
        } catch (error) {
            showErrorToast(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

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
                title="Customer Receipt"
                subtitle="Sales Receipts"
                icon={Receipt}
                maxWidth="max-w-6xl"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl font-['Tahoma']">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="px-6 py-3 bg-[#ff3b30] hover:bg-[#e03127] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                             <button
                                onClick={handleClear}
                                className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-3 bg-white border-2 border-[#0285fd] text-[#0285fd] font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-sm transition-all hover:bg-blue-50 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={isSaving}
                                className="px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50"
                            >
                                {isSaving ? <RotateCcw size={14} className="animate-spin" /> : <CheckCircle size={14} />} SAVE & APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Top Inputs Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Document ID */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Document ID</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-blue-600 bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 shadow-sm" />
                                    <button className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.date}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 font-bold cursor-pointer shadow-sm"
                                        onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }}
                                    />
                                    <button
                                        onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Received Amount */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Amount</label>
                                <input type="text" name="amount" value={formData.amount} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-black text-[14px] text-[#0285fd] outline-none bg-slate-50 shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>

                            {/* Customer */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Received From</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.Cust_Name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.cust_Name || ''}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-red-600 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                        onClick={() => setShowCustomerSearch(true)}
                                        placeholder="Select Customer..."
                                    />
                                    <button onClick={() => setShowCustomerSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Pay Method</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.paymentMethods?.find(m => m.code === formData.payType)?.name || formData.payType || ''}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-gray-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                        onClick={() => setShowPayMethodSearch(true)}
                                    />
                                    <button onClick={() => setShowPayMethodSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Bank and Branch */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Bank / Branch</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.Bank_Name || ''}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-gray-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                        onClick={() => setShowBankSearch(true)}
                                        placeholder="Select Bank"
                                    />
                                    <button onClick={() => setShowBankSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <input type="text" name="branchCode" value={formData.branchCode} onChange={handleInput} placeholder="Branch" className="w-32 h-8 border border-slate-200 rounded px-3 font-mono text-[12px] outline-none bg-slate-50 text-gray-700 shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>

                            {/* Cost Center */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Cost Center</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={(() => {
                                            const cc = lookups.costCenters?.find(c => (c.code || c.Code || c.CostCenterCode || c.costCenterCode) === formData.costCenter);
                                            return cc ? (cc.name || cc.Name || cc.CostCenterName || cc.costCenterName || '') : '';
                                        })()}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-gray-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                        onClick={() => setShowCostCenterSearch(true)}
                                    />
                                    <button onClick={() => setShowCostCenterSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Cheque No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Cheque No</label>
                                <input type="text" name="chequeNo" value={formData.chequeNo} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-[12px] outline-none bg-slate-50 text-gray-700 shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>

                            {/* Cheque Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Cheque Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.chequeDate}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 font-bold cursor-pointer shadow-sm"
                                        onClick={() => { setDatePickerField('chequeDate'); setShowDatePicker(true); }}
                                    />
                                    <button
                                        onClick={() => { setDatePickerField('chequeDate'); setShowDatePicker(true); }}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Memo */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Memo / Ref</label>
                                <input type="text" name="memo" value={formData.memo} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-[12px] outline-none bg-slate-50 text-gray-700 shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Grid Section */}
                    <div className="border border-slate-200 rounded-[5px] bg-white shadow-sm flex flex-col min-h-[250px] overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                            <div className="w-12 py-2.5 px-3 border-r border-slate-200 text-center">Chk</div>
                            <div className="w-24 py-2.5 px-3 border-r border-slate-200">Due Date</div>
                            <div className="w-32 py-2.5 px-3 border-r border-slate-200">Doc No</div>
                            <div className="flex-1 py-2.5 px-3 border-r border-slate-200">Ref No</div>
                            <div className="w-28 py-2.5 px-3 border-r border-slate-200 text-right">Inv Amount</div>
                            <div className="w-24 py-2.5 px-3 border-r border-slate-200 text-right">Discount</div>
                            <div className="w-24 py-2.5 px-3 border-r border-slate-200 text-right">SetOff</div>
                            <div className="w-28 py-2.5 px-3 border-r border-slate-200 text-right">Balance</div>
                            <div className="w-32 py-2.5 px-4 text-right">Payment</div>
                        </div>

                        <div className="flex-1 bg-white overflow-y-auto max-h-[220px] divide-y divide-slate-100">
                            {invoices.length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest ">
                                    No outstanding invoices for this customer
                                </div>
                            ) : invoices.map((inv, idx) => (
                                <div key={idx} className={`flex border-b border-slate-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group ${inv.selected ? 'bg-blue-50/10' : ''}`}>
                                    <div className="w-12 py-2 px-3 border-r border-slate-100 text-center flex items-center justify-center">
                                        <button onClick={() => handleInvoiceCheck(idx)} className={`w-5 h-5 rounded-[4px] border ${inv.selected ? 'bg-[#0285fd] border-[#0285fd] text-white' : 'bg-white border-gray-300 text-transparent'} flex items-center justify-center transition-all shadow-sm`}>
                                            <Check size={12} strokeWidth={4} />
                                        </button>
                                    </div>
                                    <div className="w-24 py-2 px-3 border-r border-slate-100 font-mono text-[10px] text-gray-500">{inv.date_Due}</div>
                                    <div className="w-32 py-2 px-3 border-r border-slate-100 font-mono">{inv.doc_No}</div>
                                    <div className="flex-1 py-2 px-3 border-r border-slate-100 truncate italic text-gray-400">{inv.ref_No}</div>
                                    <div className="w-28 py-2 px-3 border-r border-slate-100 text-right font-mono">{inv.inv_Amount.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                                    <div className="w-24 py-1.5 px-2 border-r border-slate-100 text-right">
                                        <input type="text" disabled={!inv.selected} value={inv.discount} onChange={(e) => handleInvoiceChange(idx, 'discount', e.target.value)} className="w-full h-6 border border-slate-200 rounded-[3px] text-right font-mono text-[11px] text-red-500 outline-none focus:border-[#0285fd] disabled:bg-gray-50" />
                                    </div>
                                    <div className="w-24 py-1.5 px-2 border-r border-slate-100 text-right">
                                        <input type="text" disabled={!inv.selected} value={inv.setOff} onChange={(e) => handleInvoiceChange(idx, 'setOff', e.target.value)} className="w-full h-6 border border-slate-200 rounded-[3px] text-right font-mono text-[11px] text-orange-500 outline-none focus:border-[#0285fd] disabled:bg-gray-50" />
                                    </div>
                                    <div className="w-28 py-2 px-3 border-r border-slate-100 text-right font-mono text-[#0285fd]">{inv.balance.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                                    <div className="w-32 py-1.5 px-2 text-right">
                                        <input type="text" disabled={!inv.selected} value={inv.payment} onChange={(e) => handleInvoiceChange(idx, 'payment', e.target.value)} className="w-full h-6 border border-slate-200 rounded-[3px] text-right font-mono font-black text-[12px] text-emerald-600 outline-none focus:border-[#0285fd] shadow-inner disabled:bg-gray-50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions and Summary Section */}
                    <div className="grid grid-cols-12 gap-4 mt-2">
                        {/* Left Side: Buttons & Memo */}
                        <div className="col-span-4 flex flex-col gap-3">
                            <div className="flex flex-col gap-3 border border-[#0285fd]/30 bg-blue-50/20 p-3 rounded-md relative mt-2">
                                <span className="absolute -top-[10px] left-3 bg-white text-[10px] px-2 font-mono font-bold text-[#0285fd]">Bill Reference Actions</span>
                                <div className="flex gap-2">
                                    <button onClick={handleSelectAll} className="flex-1 h-8 bg-[#0285fd] hover:bg-blue-600 text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all rounded-[4px] border-none">Select All Bills</button>
                                    <button onClick={handleClearSelections} className="flex-1 h-8 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-bold shadow-sm active:scale-95 transition-all rounded-[4px]">Clear Selections</button>
                                </div>
                            </div>
                            <textarea name="reference" value={formData.reference} onChange={handleInput} placeholder="Additional Reference / Notes" className="w-full flex-1 border border-slate-200 outline-none p-3 text-[12px] font-mono shadow-sm resize-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 rounded-md bg-slate-50 transition-all"></textarea>
                        </div>

                        {/* Middle Side: Over Payment Display */}
                        <div className="col-span-4 flex flex-col gap-2 pt-2">
                            <div className="flex items-center gap-4 bg-green-50/50 p-1.5 rounded-lg border border-green-200">
                                <label className="text-[12px] font-black text-green-800 w-32 shrink-0 uppercase tracking-tighter">Current Over Payment</label>
                                <div className="flex-1 h-8 font-mono bg-white border border-green-200 px-3 text-[14px] font-black text-green-700 text-right flex items-center justify-end rounded-[5px] shadow-sm">
                                    {advanceBalance.toLocaleString(undefined, {minimumFractionDigits:2})}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-blue-50/50 p-1.5 rounded-lg border border-blue-100">
                                <label className="text-[12px] font-black text-blue-800 w-32 shrink-0 uppercase tracking-tighter">Over Payment Usage</label>
                                <div className="flex-1 h-8 font-mono bg-white border border-blue-200 px-3 text-[14px] font-black text-blue-700 text-right flex items-center justify-end rounded-[5px] shadow-sm">
                                    {overPayment.toLocaleString(undefined, {minimumFractionDigits:2})}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Totals */}
                        <div className="col-span-4 space-y-1.5 bg-slate-50 p-4 rounded-[5px] border border-slate-200">
                            <StatRow label="Number Of Debit" value={invoices.filter(i => i.selected).length} />
                            <StatRow label="Total Debit Available" value={advanceBalance.toLocaleString(undefined, {minimumFractionDigits:2})} />
                            <StatRow label="Total Amount Due" value={invoices.reduce((a,b) => a + b.balance, 0).toLocaleString(undefined, {minimumFractionDigits:2})} />
                            <StatRow label="Payment Received" value={parseFloat(formData.amount || 0).toLocaleString(undefined, {minimumFractionDigits:2})} />
                            <StatRow label="Discount Applied" value={totalDiscount.toLocaleString(undefined, {minimumFractionDigits:2})} />
                            <StatRow label="Debit Applied" value={totalSetOff.toLocaleString(undefined, {minimumFractionDigits:2})} />
                            <div className="pt-2 border-t border-slate-200 mt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">ENDING BALANCE</span>
                                    <span className="text-[20px] font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">
                                        {(invoices.reduce((a,b) => a + b.balance, 0) - totalAllocated - totalDiscount - totalSetOff).toLocaleString(undefined, {minimumFractionDigits:2})}
                                    </span>
                                </div>
                            </div>
                        </div>

                </div>
                </div>
            </TransactionFormWrapper>

            {/* Sub Modals */}
            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onDateSelect={(d) => { setFormData(prev => ({ ...prev, [datePickerField]: d })); setShowDatePicker(false); }} initialDate={formData[datePickerField]} />
            <SimpleModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete" maxWidth="max-w-[400px]">
                <div className="p-4 flex flex-col gap-4">
                    <p className="text-sm font-bold text-gray-700">Are you sure you want to delete this draft receipt?</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs font-bold">CANCEL</button>
                        <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 bg-red-500 text-white rounded text-xs font-bold">{isDeleting ? 'DELETING...' : 'DELETE'}</button>
                    </div>
                </div>
            </SimpleModal>

            {/* Customer Search Modal */}
            <SimpleModal isOpen={showCustomerSearch} onClose={() => { setShowCustomerSearch(false); setCustomerSearchQuery(''); }} title="Customer Directory Lookup" maxWidth="max-w-[600px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find customer by name or code..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={customerSearchQuery} onChange={(e) => setCustomerSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Customer Name</th><th className="px-5 py-3 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.customers.filter(c => {
                                        const q = customerSearchQuery.toLowerCase();
                                        const code = (c.code || c.Code || '').toString().toLowerCase();
                                        const name = (c.name || c.Cust_Name || c.cust_Name || '').toString().toLowerCase();
                                        return code.includes(q) || name.includes(q);
                                    }).map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-all" onClick={() => handleCustomerSelect(c)}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{c.code || c.Code}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{c.name || c.Cust_Name || c.cust_Name}</td>
                                            <td className="px-5 py-3 text-right"><button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Payment Method Search Modal */}
            <SimpleModal isOpen={showPayMethodSearch} onClose={() => { setShowPayMethodSearch(false); setPayMethodSearchQuery(''); }} title="Payment Method Lookup" maxWidth="max-w-[450px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter payment methods..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={payMethodSearchQuery} onChange={(e) => setPayMethodSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Method Title</th><th className="px-5 py-3 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.paymentMethods.filter(m => !payMethodSearchQuery || m.name.toLowerCase().includes(payMethodSearchQuery.toLowerCase()) || m.code.toLowerCase().includes(payMethodSearchQuery.toLowerCase())).map(m => (
                                        <tr key={m.code} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData(prev => ({ ...prev, payType: m.code })); setShowPayMethodSearch(false); setPayMethodSearchQuery(''); }}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{m.code}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{m.name}</td>
                                            <td className="px-5 py-3 text-right"><button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Bank Search Modal */}
            <SimpleModal isOpen={showBankSearch} onClose={() => { setShowBankSearch(false); setBankSearchQuery(''); }} title="Bank Directory Lookup" maxWidth="max-w-[450px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter banks..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={bankSearchQuery} onChange={(e) => setBankSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Bank Name</th><th className="px-5 py-3 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.banks.filter(b => {
                                        const q = bankSearchQuery.toLowerCase();
                                        const code = (b.bank_Code || b.Bank_Code || '').toLowerCase();
                                        const name = (b.bank_Name || b.Bank_Name || '').toLowerCase();
                                        return code.includes(q) || name.includes(q);
                                    }).map((b, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData(prev => ({ ...prev, bankCode: b.bank_Code || b.Bank_Code })); setShowBankSearch(false); setBankSearchQuery(''); }}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{b.bank_Code || b.Bank_Code}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{b.bank_Name || b.Bank_Name}</td>
                                            <td className="px-5 py-3 text-right"><button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Search Modal */}
            <SimpleModal isOpen={showCostCenterSearch} onClose={() => { setShowCostCenterSearch(false); setCostCenterSearchQuery(''); }} title="Cost Center Lookup" maxWidth="max-w-[450px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter cost centers..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={costCenterSearchQuery} onChange={(e) => setCostCenterSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Cost Center Name</th><th className="px-5 py-3 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.costCenters.filter(c => {
                                        const q = costCenterSearchQuery.toLowerCase();
                                        const code = (c.code || c.Code || c.CostCenterCode || c.costCenterCode || '').toLowerCase();
                                        const name = (c.name || c.Name || c.CostCenterName || c.costCenterName || '').toLowerCase();
                                        return code.includes(q) || name.includes(q);
                                    }).map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData(prev => ({ ...prev, costCenter: c.code || c.Code || c.CostCenterCode || c.costCenterCode })); setShowCostCenterSearch(false); setCostCenterSearchQuery(''); }}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{c.code || c.Code || c.CostCenterCode || c.costCenterCode}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{c.name || c.Name || c.CostCenterName || c.costCenterName}</td>
                                            <td className="px-5 py-3 text-right"><button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {receiptTx && (
                <TransactionReceiptModal 
                    selectedTx={receiptTx} 
                    onClose={handleReceiptClose} 
                />
            )}

        </>
    );
};

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

export default CustomerReceiptBoard;
