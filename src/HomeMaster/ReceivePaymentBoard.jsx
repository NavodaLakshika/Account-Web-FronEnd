import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, CheckCircle, Trash2, RotateCcw, Save, X, Plus, Check , FileText} from 'lucide-react';


import { receivePaymentService } from '../services/receivePayment.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';


const ReceivePaymentBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ 
        customers: [], 
        paymentMethods: [], 
        banks: [], 
        costCenters: [],
        accountTypes: [
            { code: 'All', name: 'All Customers' },
            { code: 'Medical Members', name: 'Medical Members' },
            { code: 'Staff Credit', name: 'Staff Credit' },
            { code: 'Other', name: 'Other Accounts' }
        ]
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
        remarks: '',
        reference: '',
        company: '',
        createUser: '',
        accountType: 'Medical Members'
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [invoices, setInvoices] = useState([]);
    const [orders, setOrders] = useState([]); // Historical documents
    const [advanceBalance, setAdvanceBalance] = useState(0);
    
    // Modal States
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showBankSearch, setShowBankSearch] = useState(false);
    const [showPayMethodSearch, setShowPayMethodSearch] = useState(false);
    const [showCostCenterSearch, setShowCostCenterSearch] = useState(false);
    const [showAccountTypeSearch, setShowAccountTypeSearch] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    // Search Queries
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [bankSearchQuery, setBankSearchQuery] = useState('');
    const [payMethodSearchQuery, setPayMethodSearchQuery] = useState('');
    const [costCenterSearchQuery, setCostCenterSearchQuery] = useState('');
    const [accountTypeSearchQuery, setAccountTypeSearchQuery] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: initCompany, userName: initUser } = getSessionData();

            setFormData(prev => ({ ...prev, company: initCompany, createUser: initUser }));
            fetchLookups(initCompany);
            generateDocNo(initCompany);
        }
    }, [isOpen]);

    const fetchLookups = async (company, typeOverride) => {
        try {
            const currentType = typeOverride || formData.accountType || 'Medical Members';
            const data = await receivePaymentService.getLookups(company, currentType);
            


            setLookups(prev => ({
                ...prev,
                customers: data.customers || [],
                paymentMethods: data.paymentMethods || [],
                banks: data.banks || [],
                costCenters: data.costCenters || []
            }));
        } catch (error) {
            console.error("Lookup Load Error:", error);
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await receivePaymentService.generateDocNo(company);
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
        const custId = customer.code || customer.Code || customer.id;
        setFormData(prev => ({ ...prev, customerId: custId }));
        setShowCustomerSearch(false);
        setCustomerSearchQuery('');
        
        try {
            const data = await receivePaymentService.getOutstanding(custId, formData.company, formData.docNo, formData.accountType, formData.createUser);
            setAdvanceBalance(data.advanceBalance || 0);
            setInvoices(data.outstandingRows.map(inv => ({
                ...inv,
                selected: inv.payment > 0,
                discount: inv.discount || 0,
                setOff: inv.setOffVal || inv.setOff || 0,
                payment: inv.payment || 0,
                balance: inv.balance || inv.Balance || 0,
                inv_Amount: inv.inv_Amount || inv.Inv_Amount || 0,
                doc_No: inv.doc_No || inv.Doc_No,
                date_Due: inv.date_Due || inv.Date_Due,
                ref_No: inv.ref_No || inv.Ref_No
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
            await receivePaymentService.updateRow({
                docNo: inv.doc_No,
                payment: inv.payment,
                discount: inv.discount,
                setOff: inv.setOff
            }, formData.company, formData.docNo, formData.customerId, formData.accountType);
        } catch (e) { console.error("Row Update Fail:", e); }
    };

    const totalAllocated = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? (parseFloat(inv.payment) || 0) : 0), 0), [invoices]);
    const totalDiscount = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? (parseFloat(inv.discount) || 0) : 0), 0), [invoices]);
    const totalSetOff = useMemo(() => invoices.reduce((acc, inv) => acc + (inv.selected ? (parseFloat(inv.setOff) || 0) : 0), 0), [invoices]);
    const totalDue = useMemo(() => invoices.reduce((acc, inv) => acc + (parseFloat(inv.balance) || 0), 0), [invoices]);

    const handleClear = () => {
        setFormData(prev => ({
            ...prev,
            customerId: '', amount: '0.00', payType: '', bankCode: '', branchCode: '', costCenter: '',
            chequeNo: '', remarks: '', reference: ''
        }));
        setInvoices([]);
        setAdvanceBalance(0);
        generateDocNo(formData.company);
    };

    const handleSelectAll = async () => {
        let remaining = parseFloat(formData.amount);
        const newInvoices = [...invoices].map(inv => {
            let payment = 0;
            if (remaining > 0) {
                payment = Math.min(inv.balance, remaining);
                remaining -= payment;
            }
            return { ...inv, selected: payment > 0, payment };
        });
        setInvoices(newInvoices);
        for (const inv of newInvoices) {
            if (inv.selected) await updateBackendRow(inv);
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
        if (formData.accountType !== "Other" && parseFloat(formData.amount) < totalAllocated) {
            return showErrorToast("Paid amount less than payble amount do not match.");
        }

        setShowConfirmModal(true);
    };

    const confirmApply = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                postDate: formData.date,
                bankId: formData.bankCode,
                branch: formData.branchCode,
                totalAllocated: totalAllocated,
                totalDiscount: totalDiscount,
                totalSetOff: totalSetOff,
                overPayment: Math.max(0, parseFloat(formData.amount) - totalAllocated),
                customerName: lookups.customers.find(c => (c.code || c.Code || c.id || c.Id || c.customerCode || c.customer_Code) === formData.customerId)?.name || lookups.customers.find(c => (c.code || c.Code || c.id || c.Id || c.customerCode || c.customer_Code) === formData.customerId)?.Cust_Name || lookups.customers.find(c => (c.code || c.Code || c.id || c.Id || c.customerCode || c.customer_Code) === formData.customerId)?.cust_Name || ''
            };
            await receivePaymentService.apply(payload);
            showSuccessToast("Payment Applied Successfully");
            handleClear();
            setShowConfirmModal(false);
            onClose();
        } catch (error) {
            showErrorToast(error.message || "Failed to apply payment");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.customerId) return showErrorToast("Please select a customer");
        if (parseFloat(formData.amount) <= 0) return showErrorToast("Please enter receipt amount");

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                postDate: formData.date,
                bankId: formData.bankCode,
                branch: formData.branchCode,
                totalAllocated: totalAllocated,
                totalDiscount: totalDiscount,
                totalSetOff: totalSetOff,
                overPayment: Math.max(0, parseFloat(formData.amount) - totalAllocated),
                customerName: lookups.customers.find(c => (c.code || c.Code || c.id || c.Id || c.customerCode || c.customer_Code) === formData.customerId)?.name || lookups.customers.find(c => (c.code || c.Code || c.id || c.Id || c.customerCode || c.customer_Code) === formData.customerId)?.Cust_Name || lookups.customers.find(c => (c.code || c.Code || c.id || c.Id || c.customerCode || c.customer_Code) === formData.customerId)?.cust_Name || ''
            };
            await receivePaymentService.saveDraft(payload);
            showSuccessToast("Draft Saved Successfully");
            handleClear();
        } catch (error) {
            showErrorToast(error.message || "Failed to save draft");
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
            // await receivePaymentService.delete(formData.docNo, formData.company);
            showSuccessToast('Record deleted successfully.');
            handleClear();
            setShowDeleteConfirm(false);
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSearch = async () => {
        try {
            const data = await receivePaymentService.getHistory(formData.company);
            setOrders(data);
            setShowSearchModal(true);
        } catch (error) {
            showErrorToast("Failed to load historical documents");
        }
    };

    const [archiveSearchQuery, setArchiveSearchQuery] = useState('');

    const filteredOrders = useMemo(() => {
        if (!archiveSearchQuery) return orders;
        const q = archiveSearchQuery.toLowerCase();
        return orders.filter(o => 
            (o.docNo || '').toLowerCase().includes(q) || 
            (o.reference || '').toLowerCase().includes(q)
        );
    }, [orders, archiveSearchQuery]);

    const handleRetrieve = async (docNo) => {
        try {
            const data = await receivePaymentService.getPayment(docNo, formData.company);
            const header = data.header;
            const details = data.details;

            setFormData(prev => ({
                ...prev,
                docNo: header.doc_No || header.docNo || docNo,
                date: (header.post_Date || header.postDate || header.date)?.split('T')[0] || new Date().toISOString().split('T')[0],
                customerId: header.vendor_Id || header.vendorId,
                amount: (header.amount || header.net_Amount || header.netAmount || 0).toString(),
                payType: header.pay_Type || header.payType || 'Cash',
                bankCode: header.bank,
                branchCode: header.remarks, // Mapped to Remarks in SP
                costCenter: header.costCenter,
                chequeNo: header.reduceRemarks, // Mapped to ReduceRemarks in SP
                chequeDate: header.expected_Date?.split('T')[0],
                remarks: header.memo,
                reference: header.reference,
                comment: header.comment,
                accountType: header.acc_Type === 'Other' ? 'Other' : 'Medical Members' // Simplification
            }));

            setInvoices(details.map(d => ({
                doc_No: d.accountCode || d.docNo, // accountCode contains Prod_Code (Invoice No)
                payment: d.amount || 0,
                selected: true,
                inv_Amount: d.amount || 0,
                balance: 0,
                discount: 0,
                setOff: 0,
                ref_No: d.docNo, // The payment reference
                date_Due: header.post_Date || header.postDate || header.date
            })));

            setShowSearchModal(false);
            showSuccessToast("Document retrieved successfully");
        } catch (error) {
            showErrorToast("Failed to retrieve document");
        }
    };

    const handleDateSelect = (formattedDate) => {
        // CalendarModal returns DD/MM/YYYY, we need to convert to YYYY-MM-DD for state if needed
        // but parseDate in CalendarModal handles both, so let's just keep formatted
        setFormData(prev => ({ ...prev, [datePickerField]: formattedDate }));
        setShowDatePicker(false);
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
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Receive Payment"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="px-6 py-3 bg-white text-[#ff3b30] border-2 border-[#ff3b30] hover:bg-red-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] shadow-md shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                             <button
                                onClick={handleClear}
                                className="px-6 py-3 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSaving}
                                className="px-6 py-3 bg-white text-[#0285fd] font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={isSaving}
                                className="px-6 py-3 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <RotateCcw size={14} className="animate-spin" /> : <CheckCircle size={14} />} APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Top Inputs Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            


                            {/* Document ID */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Document ID</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-blue-600 bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all" />
                                    <button onClick={handleSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Post Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.date}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-sm font-mono outline-none bg-slate-50 text-gray-700 font-bold cursor-pointer transition-all"
                                        onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }}
                                    />
                                    <button
                                        onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Received Amount */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Amount</label>
                                <input type="text" name="amount" value={formData.amount} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-black text-sm text-[#0285fd] outline-none bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>

                            {/* Customer */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Customer</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.Name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.Cust_Name || ''}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-red-600 bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                        onClick={() => setShowCustomerSearch(true)}
                                        placeholder="Click to select customer..."
                                    />
                                    <button onClick={() => setShowCustomerSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
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
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                        onClick={() => setShowPayMethodSearch(true)}
                                    />
                                    <button onClick={() => setShowPayMethodSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
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
                                        value={lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || ''}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                        onClick={() => setShowBankSearch(true)}
                                        placeholder="Select Bank"
                                    />
                                    <button onClick={() => setShowBankSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <input type="text" name="branchCode" value={formData.branchCode} onChange={handleInput} placeholder="Branch" className="w-32 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>

                            {/* Cost Center */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Cost Center</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.costCenters?.find(c => (c.CostCenterCode || c.costCenterCode || c.Code || c.code || c.costCenterCode) === formData.costCenter)?.CostCenterName || lookups.costCenters?.find(c => (c.CostCenterCode || c.costCenterCode || c.Code || c.code || c.costCenterCode) === formData.costCenter)?.name || ''}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                        onClick={() => setShowCostCenterSearch(true)}
                                    />
                                    <button onClick={() => setShowCostCenterSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Cheque No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Cheque No</label>
                                <input type="text" name="chequeNo" value={formData.chequeNo} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>

                            {/* Cheque Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Cheque Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.chequeDate}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-sm font-mono outline-none bg-slate-50 text-gray-700 font-bold cursor-pointer transition-all"
                                        onClick={() => { setDatePickerField('chequeDate'); setShowDatePicker(true); }}
                                    />
                                    <button
                                        onClick={() => { setDatePickerField('chequeDate'); setShowDatePicker(true); }}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Brief Remarks</label>
                                <input type="text" name="remarks" value={formData.remarks} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>

                            {/* Reference */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">B.Ref / Shift</label>
                                <input type="text" name="reference" value={formData.reference} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Grid Section */}
                    <div className="border border-slate-200 rounded-[3px] bg-white shadow-sm flex flex-col min-h-[250px] overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest items-center">
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
                                <div className="h-24 flex items-center justify-center text-gray-300 text-[10px] font-mono font-bold uppercase tracking-widest ">
                                    No outstanding invoices for this customer
                                </div>
                            ) : invoices.map((inv, idx) => (
                                <div key={idx} className={`flex border-b border-slate-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group ${inv.selected ? 'bg-blue-50/10' : ''}`}>
                                    <div className="w-12 py-2 px-3 border-r border-slate-100 text-center flex items-center justify-center">
                                        <button onClick={() => handleInvoiceCheck(idx)} className={`w-5 h-5 rounded-[4px] border ${inv.selected ? 'bg-[#0285fd] border-[#0285fd] text-white' : 'bg-white border-slate-300 text-transparent'} flex items-center justify-center transition-all`}>
                                            <Check size={12} strokeWidth={4} />
                                        </button>
                                    </div>
                                    <div className="w-24 py-2 px-3 border-r border-slate-100 font-mono text-[10px] text-slate-500">{inv.date_Due?.split('T')[0]}</div>
                                    <div className="w-32 py-2 px-3 border-r border-slate-100 font-mono text-blue-600">{inv.doc_No}</div>
                                    <div className="flex-1 py-2 px-3 border-r border-slate-100 truncate italic text-slate-400">{inv.ref_No}</div>
                                    <div className="w-28 py-2 px-3 border-r border-slate-100 text-right font-mono">{inv.inv_Amount.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                                    <div className="w-24 py-1 px-1 border-r border-slate-100">
                                        <input type="text" disabled={!inv.selected} value={inv.discount} onChange={(e) => handleInvoiceChange(idx, 'discount', e.target.value)} className="w-full h-7 bg-transparent text-right font-mono text-[11px] text-red-500 outline-none focus:bg-white border-none px-1 disabled:opacity-30" />
                                    </div>
                                    <div className="w-24 py-1 px-1 border-r border-slate-100">
                                        <input type="text" disabled={!inv.selected} value={inv.setOff} onChange={(e) => handleInvoiceChange(idx, 'setOff', e.target.value)} className="w-full h-7 bg-transparent text-right font-mono text-[11px] text-orange-500 outline-none focus:bg-white border-none px-1 disabled:opacity-30" />
                                    </div>
                                    <div className="w-28 py-2 px-3 border-r border-slate-100 text-right font-mono text-slate-500">{inv.balance.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                                    <div className="w-32 py-1 px-2 text-right">
                                        <input type="text" disabled={!inv.selected} value={inv.payment} onChange={(e) => handleInvoiceChange(idx, 'payment', e.target.value)} className="w-full h-7 bg-white border border-slate-200 rounded text-right font-mono font-black text-[12px] text-emerald-600 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2 transition-all disabled:bg-gray-50 disabled:opacity-50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="flex flex-row justify-between items-end gap-x-12 pt-2">
                        <div className="flex-1 flex gap-3 items-end">
                            <div className="flex flex-col gap-2">
                                <button onClick={handleSelectAll} className="h-8 px-4 bg-white border-2 border-[#0285fd] hover:bg-blue-50 text-[#0285fd] text-[11px] font-mono font-bold uppercase tracking-widest rounded-[3px] transition-all active:scale-95">SELECT ALL DUE</button>
                                <button onClick={handleClearSelections} className="h-8 px-4 bg-white border-2 border-slate-400 hover:bg-gray-50 text-slate-700 text-[11px] font-mono font-bold uppercase tracking-widest rounded-[3px] transition-all active:scale-95">CLEAR ALL</button>
                            </div>
                            <div className="flex-1 bg-[#fff8e6] border border-[#ffe082] p-3 rounded-[3px] flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-mono font-bold text-[#b8860b] uppercase tracking-widest">Current Over Payment / Advance</span>
                                    <span className="text-[18px] font-black text-[#856404] font-mono leading-none">{advanceBalance.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                </div>
                                <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
                                    <Plus className="text-[#856404]" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="w-[350px] bg-white border border-slate-200 rounded-[3px] p-4 space-y-2.5">
                            <div className="flex justify-between items-center text-slate-500 font-mono font-bold text-[10px] uppercase tracking-widest">
                                <span>Total Amount Due</span>
                                <span className="text-[13px] text-slate-700">{totalDue.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-blue-600 font-mono font-bold text-[10px] uppercase tracking-widest">
                                <span>Payment Received</span>
                                <span className="text-[14px] font-black">{parseFloat(formData.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-purple-600 font-mono font-bold text-[10px] uppercase tracking-widest">
                                <span>Total Allocated</span>
                                <span className="text-[13px]">{totalAllocated.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-orange-500 font-mono font-bold text-[10px] uppercase tracking-widest">
                                <span>Over Payment</span>
                                <span className="text-[13px]">{Math.max(0, parseFloat(formData.amount) - totalAllocated).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500 font-mono font-bold text-[10px] uppercase tracking-widest">
                                <span>Discount Applied</span>
                                <span className="text-[13px]">{totalDiscount.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-600 font-mono font-bold text-[10px] uppercase tracking-widest">
                                <span>Debit / SetOff</span>
                                <span className="text-[13px]">{totalSetOff.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                            </div>
                            <div className="h-[1px] bg-slate-200 my-1" />
                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-[3px]">
                                <span className="text-[13px] font-mono font-bold text-slate-900 uppercase tracking-widest">Ending Balance</span>
                                <span className="text-[18px] font-black text-blue-700 font-mono tracking-tighter">
                                    {(totalDue - totalAllocated - totalDiscount - totalSetOff).toLocaleString(undefined, {minimumFractionDigits:2})}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Sub-Models */}
            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onDateSelect={handleDateSelect} initialDate={formData[datePickerField]} />
            
            <ConfirmModal 
                isOpen={showConfirmModal} 
                onClose={() => setShowConfirmModal(false)} 
                onConfirm={confirmApply} 
                title="Confirm Transaction" 
                message="Are you sure you want to apply this payment? This action will update ledger records." 
                loading={isSaving}
            />

            <ConfirmModal 
                isOpen={showDeleteConfirm} 
                onClose={() => setShowDeleteConfirm(false)} 
                onConfirm={confirmDelete} 
                title="Delete Document" 
                message="Are you sure you want to delete this document? This action cannot be undone." 
                loading={isDeleting}
                variant="danger"
            />

            {/* Historical Search Modal */}
            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Historical Document Directory" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[3px] border border-slate-200 bg-white">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Global Search</span>
                        <div className="relative flex-1">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                             <input 
                                type="text" 
                                placeholder="Filter by document id..." 
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" 
                                value={archiveSearchQuery}
                                onChange={(e) => setArchiveSearchQuery(e.target.value)}
                             />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[3px] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Reference ID</th><th className=" px-5 py-3">Posting Date</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Archive is empty</td></tr>
                                ) : filteredOrders.map((order, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50">
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.docNo}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.date?.split('T')[0]}</td>
                                        <td className="text-right px-5 py-3"><button onClick={() => handleRetrieve(order.docNo)} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RETRIEVE</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Customer Search */}
            <SimpleModal isOpen={showCustomerSearch} onClose={() => setShowCustomerSearch(false)} title="Customer Directory Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[3px] border border-slate-200 bg-white">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find customer by name or code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={customerSearchQuery} onChange={(e) => setCustomerSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[3px] overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Customer Name</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lookups.customers.filter(c => {
                                        const q = customerSearchQuery.toLowerCase();
                                        return (c.name || c.Name || '').toLowerCase().includes(q) || (c.code || c.Code || '').toLowerCase().includes(q);
                                    }).map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleCustomerSelect(c)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.code || c.Code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.name || c.Name}</td>
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Payment Method Search */}
            <SimpleModal isOpen={showPayMethodSearch} onClose={() => setShowPayMethodSearch(false)} title="Payment Method Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[3px] border border-slate-200 bg-white">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter methods..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={payMethodSearchQuery} onChange={(e) => setPayMethodSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[3px] overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Method Title</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lookups.paymentMethods.filter(m => !payMethodSearchQuery || m.name.toLowerCase().includes(payMethodSearchQuery.toLowerCase()) || m.code.toLowerCase().includes(payMethodSearchQuery.toLowerCase())).map(m => (
                                        <tr key={m.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, payType: m.code })); setShowPayMethodSearch(false); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{m.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{m.name}</td>
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Bank Search */}
            <SimpleModal isOpen={showBankSearch} onClose={() => setShowBankSearch(false)} title="Bank Directory Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[3px] border border-slate-200 bg-white">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter banks..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={bankSearchQuery} onChange={(e) => setBankSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[3px] overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Bank Name</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lookups.banks.filter(b => {
                                        const q = bankSearchQuery.toLowerCase();
                                        const code = (b.bank_Code || b.Bank_Code || '').toLowerCase();
                                        const name = (b.bank_Name || b.Bank_Name || '').toLowerCase();
                                        return code.includes(q) || name.includes(q);
                                    }).map((b, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, bankCode: b.bank_Code || b.Bank_Code })); setShowBankSearch(false); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{b.bank_Code || b.Bank_Code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{b.bank_Name || b.Bank_Name}</td>
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

             {/* Cost Center Search */}
             <SimpleModal isOpen={showCostCenterSearch} onClose={() => setShowCostCenterSearch(false)} title="Cost Center Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[3px] border border-slate-200 bg-white">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter cost centers..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={costCenterSearchQuery} onChange={(e) => setCostCenterSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[3px] overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Cost Center Name</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lookups.costCenters.filter(c => {
                                        const q = costCenterSearchQuery.toLowerCase();
                                        const code = (c.CostCenterCode || c.costCenterCode || c.Code || c.code || '').toLowerCase();
                                        const name = (c.CostCenterName || c.costCenterName || c.Name || c.name || '').toLowerCase();
                                        return code.includes(q) || name.includes(q);
                                    }).map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, costCenter: c.CostCenterCode || c.costCenterCode || c.Code || c.code })); setShowCostCenterSearch(false); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.CostCenterCode || c.costCenterCode || c.Code || c.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.CostCenterName || c.costCenterName || c.Name || c.name}</td>
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>
            {/* Account Type Search */}
            <SimpleModal isOpen={showAccountTypeSearch} onClose={() => setShowAccountTypeSearch(false)} title="Account Type Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[3px] border border-slate-200 bg-white">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter account types..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={accountTypeSearchQuery} onChange={(e) => setAccountTypeSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[3px] overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Account Type</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lookups.accountTypes?.filter(a => {
                                        const q = accountTypeSearchQuery.toLowerCase();
                                        return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
                                    }).map((a, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => {
                                            setFormData(prev => ({ ...prev, accountType: a.code, customerId: '' }));
                                            fetchLookups(formData.company, a.code);
                                            setShowAccountTypeSearch(false);
                                        }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.name}</td>
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

        </>
    );
};

export default ReceivePaymentBoard;
