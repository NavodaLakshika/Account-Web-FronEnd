import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, CheckCircle, Trash2, RotateCcw, Save, X, Plus, Check, FileText } from 'lucide-react';
import { receivePaymentService } from '../services/receivePayment.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SearchableSelect from '../components/SearchableSelect';

const ReceivePaymentBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({
        customers: [],
        paymentMethods: [],
        banks: [],
        costCenters: [],
        accountTypes: []
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
        accountType: 'Medical Members',
        docStatus: 'New'
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [invoices, setInvoices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newDocNo, setNewDocNo] = useState('');
    const [advanceBalance, setAdvanceBalance] = useState(0);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

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
            const [data, historyData] = await Promise.all([
                receivePaymentService.getLookups(company, currentType),
                receivePaymentService.getHistory(company)
            ]);
            setLookups(prev => ({
                ...prev,
                customers: data.customers || [],
                paymentMethods: data.paymentMethods || [],
                banks: data.banks || [],
                costCenters: data.costCenters || [],
                accountTypes: data.accountTypes?.length > 0 ? data.accountTypes : [
                    { code: 'All', name: 'All Customers' },
                    { code: 'Medical Members', name: 'Medical Members' },
                    { code: 'Staff Credit', name: 'Staff Credit' },
                    { code: 'Other', name: 'Other Accounts' }
                ],
                documents: historyData || []
            }));
        } catch (error) {
            console.error("Lookup Load Error:", error);
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await receivePaymentService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
            setNewDocNo(data.docNo);
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
        if (formData.docStatus === 'Applied') return;
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
        if (formData.docStatus === 'Applied') return;
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
        if (formData.docStatus === 'Applied') return;
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
        if (formData.docStatus === 'Applied') return;
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
                branchCode: header.remarks,
                costCenter: header.costCenter,
                chequeNo: header.reduceRemarks,
                chequeDate: header.expected_Date?.split('T')[0],
                remarks: header.memo,
                reference: header.reference,
                comment: header.comment,
                accountType: header.acc_Type === 'Other' ? 'Other' : 'Medical Members',
                docStatus: data.type || 'Applied'
            }));

            setInvoices(details.map(d => ({
                doc_No: d.docNo,
                payment: d.amount || 0,
                selected: true,
                inv_Amount: d.amount || 0,
                balance: 0,
                discount: 0,
                setOff: 0,
                ref_No: d.docNo,
                date_Due: header.post_Date || header.postDate || header.date
            })));

            setShowSearchModal(false);
            showSuccessToast("Document retrieved successfully");
        } catch (error) {
            showErrorToast("Failed to retrieve document");
        }
    };

    const handleDateSelect = (formattedDate) => {
        setFormData(prev => ({ ...prev, [datePickerField]: formattedDate }));
        setShowDatePicker(false);
    };

    const loadPaymentModes = async () => {
        try {
            const data = await paymentMethodService.getAll(formData.company);
            setLookups(prev => ({ ...prev, paymentModes: data || [] }));
        } catch (error) {
            console.error("Error loading payment modes:", error);
        }
    };

    return (
        <>
            <style>{`@keyframes toastProgress { 0% { width: 100%; } 100% { width: 0%; } }`}</style>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Receive Payment"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleDelete} className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100">
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleSaveDraft} disabled={isSaving || formData.docStatus === 'Applied'} className="px-6 h-10 border-2 border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button type="button" onClick={handleApply} disabled={isSaving || formData.docStatus === 'Applied'} className={`px-6 py-2 ${isSaving || formData.docStatus === 'Applied' ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0285fd] hover:bg-[#0073ff]'} text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2`}>
                                <CheckCircle size={14} /> APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Document ID</label>
                                <div className="relative">
                                    <select
                                        name="docNo"
                                        value={formData.docNo}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            if (val === newDocNo) {
                                                handleClear();
                                            } else {
                                                await handleRetrieve(val);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        {newDocNo && <option value={newDocNo}>{newDocNo} (New)</option>}
                                        {lookups.documents?.map((doc, idx) => (
                                            <option key={idx} value={doc.docNo || doc.doc_No}>{doc.docNo || doc.doc_No} - {doc.date?.split('T')[0]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date} onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Amount</label>
                                <input type="text" name="amount" value={formData.amount} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer Type</label>
                                <div className="relative">
                                    <select
                                        value={formData.accountType}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            setFormData(prev => ({ ...prev, accountType: newType, customerId: '', customerName: '' }));
                                            setInvoices([]);
                                            setAdvanceBalance(0);
                                            fetchLookups(formData.company, newType);
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        {lookups.accountTypes?.map((a) => (
                                            <option key={a.code} value={a.code}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer</label>
                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={formData.customerId} className="w-24 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none text-gray-700 font-mono shrink-0" />
                                        {/* <div className="relative flex-1">
                                            <input type="text" readOnly value={lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.Name || lookups.customers.find(c => (c.code || c.Code) === formData.customerId)?.Cust_Name || ''} onClick={() => setShowCustomerSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" placeholder="Click to select customer..." style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                        </div>  */}
                                        <div className="flex-1">
                                            <select
                                                value={formData.customerId || ""}
                                                onChange={async (e) => {
                                                    const sel = lookups.customers.find(c => c.code === e.target.value);
                                                    if (sel) {
                                                        setFormData(prev => ({ ...prev, customerName: sel.name || '' }));
                                                        await handleCustomerSelect(sel);
                                                    } else {
                                                        setFormData(prev => ({ ...prev, customerId: '', customerName: '' }));
                                                        setInvoices([]);
                                                        setAdvanceBalance(0);
                                                    }
                                                }}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer"
                                                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                            >
                                                <option value="">Select customer...</option>
                                                {lookups.customers.map((c) => (
                                                    <option key={c.code} value={c.code}>
                                                        {c.code} — {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay Method</label>
                                <div className="relative">
                                    {/* <input type="text" readOnly value={lookups.paymentMethods?.find(m => m.code === formData.payType)?.name || formData.payType || ''} onClick={() => setShowPayMethodSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                     */}
                                    <select
                                        value={formData.payType || ""}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                payType: e.target.value
                                            }));
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select pay Mode</option>

                                        {lookups.paymentMethods?.map((mode) => (
                                            <option key={mode.code} value={mode.code}>
                                                {mode.code} — {mode.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque No</label>
                                <input type="text" name="chequeNo" value={formData.chequeNo} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bank / Branch</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        {/* <input type="text" readOnly value={lookups.banks?.find(b => (b.bank_Code || b.Bank_Code) === formData.bankCode)?.bank_Name || ''} onClick={() => setShowBankSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" placeholder="Select Bank" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                    </div> */}
                                        <select
                                            value={formData.bankCode
                                                || ""}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    bankCode: e.target.value,

                                                }));
                                            }}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select Bank</option>

                                            {lookups.banks?.map((bank) => {
                                                const code = bank.bank_Code || bank.Bank_Code;
                                                const name = bank.bank_Name || bank_Name;
                                                return (
                                                    <option key={code} value={code}>
                                                        {code} — {name}
                                                    </option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <input type="text" name="branchCode" value={formData.branchCode} onChange={handleInput} placeholder="Branch" className="w-32 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                <div className="relative">
                                    {/* <input type="text" readOnly value={lookups.costCenters?.find(c => 
                                        (c.CostCenterCode || c.costCenterCode || c.Code || c.code) === formData.costCenter)?.CostCenterName || 
                                        lookups.costCenters?.find(c => (c.CostCenterCode || c.costCenterCode || c.Code || c.code) === formData.costCenter)?.name || ''} onClick={() => 
                                        setShowCostCenterSearch(true)} 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" 
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} /> */}
                                    <select
                                        value={formData.costCenter
                                            || ""}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                costCenter: e.target.value,

                                            }));
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select Cost Center</option>

                                        {lookups.costCenters?.map((costCenter) => {
                                            const code = costCenter.CostCenterCode || costCenter.costCenterCode || costCenter.Code || costCenter.code;
                                            const name = costCenter.CostCenterName || costCenter.CostCenterName || costCenter.Name || costCenter.name;
                                            return (
                                                <option key={code} value={code}>
                                                    {code} — {name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.chequeDate} onClick={() => { setDatePickerField('chequeDate'); setShowDatePicker(true); }} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => { setDatePickerField('chequeDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Brief Remarks</label>
                                <input type="text" name="remarks" value={formData.remarks} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">B.Ref / Shift</label>
                                <input type="text" name="reference" value={formData.reference} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-[3px] bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding Invoices</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="w-12 px-3 text-center">Chk</th>
                                        <th className="w-24 px-3">Due Date</th>
                                        <th className="w-32 px-3">Doc No</th>
                                        <th className="px-3">Ref No</th>
                                        <th className="w-28 px-3 text-right">Inv Amount</th>
                                        <th className="w-24 px-2 text-right">Discount</th>
                                        <th className="w-24 px-2 text-right">SetOff</th>
                                        <th className="w-28 px-3 text-right">Balance</th>
                                        <th className="w-32 px-4 text-right">Payment</th>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-10 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                                                No outstanding invoices for this customer
                                            </td>
                                        </tr>
                                    ) : invoices.map((inv, idx) => (
                                        <tr key={idx} className={`text-[11px] font-bold text-gray-700 border-b border-gray-50 hover:bg-slate-50/30 transition-colors ${inv.selected ? 'bg-blue-50/10' : ''}`}>
                                            <td className="w-12 px-3 py-2 text-center">
                                                <input type="checkbox" disabled={formData.docStatus === 'Applied'} checked={inv.selected} onChange={() => handleInvoiceCheck(idx)} className="text-[#0285fd] focus:ring-[#0285fd]" />
                                            </td>
                                            <td className="w-24 px-3 py-2 font-mono text-[10px] text-gray-500">{inv.date_Due?.split('T')[0]}</td>
                                            <td className="w-32 px-3 py-2 font-mono text-blue-700">{inv.doc_No}</td>
                                            <td className="px-3 py-2 truncate italic text-gray-400">{inv.ref_No}</td>
                                            <td className="w-28 px-3 py-2 text-right font-mono">{inv.inv_Amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="w-24 px-1 py-1">
                                                <input type="text" disabled={!inv.selected || formData.docStatus === 'Applied'} value={inv.discount} onChange={(e) => handleInvoiceChange(idx, 'discount', e.target.value)} className="w-full h-7 border border-gray-200 rounded-[3px] text-right font-mono text-[11px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2 disabled:opacity-30 disabled:bg-gray-50" />
                                            </td>
                                            <td className="w-24 px-1 py-1">
                                                <input type="text" disabled={!inv.selected || formData.docStatus === 'Applied'} value={inv.setOff} onChange={(e) => handleInvoiceChange(idx, 'setOff', e.target.value)} className="w-full h-7 border border-gray-200 rounded-[3px] text-right font-mono text-[11px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2 disabled:opacity-30 disabled:bg-gray-50" />
                                            </td>
                                            <td className="w-28 px-3 py-2 text-right font-mono text-gray-500">{inv.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="w-32 px-2 py-1 text-right">
                                                <input type="text" disabled={!inv.selected || formData.docStatus === 'Applied'} value={inv.payment} onChange={(e) => handleInvoiceChange(idx, 'payment', e.target.value)} className="w-full h-7 border border-gray-200 rounded-[3px] text-right font-mono font-black text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2 disabled:opacity-30 disabled:bg-gray-50" />
                                            </td>
                                            <td className="text-right px-5 py-2">
                                                <button type="button" onClick={() => updateBackendRow(inv)} disabled={!inv.selected || formData.docStatus === 'Applied'} className="text-[#0285fd] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                    Update
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-x-6">
                        <div className="col-span-7 space-y-3">
                            <div className="flex gap-3 items-start">
                                <div className="flex flex-col gap-2">
                                    <button type="button" onClick={handleSelectAll} disabled={formData.docStatus === 'Applied'} className="h-8 px-4 bg-white border-2 border-[#0285fd] hover:bg-blue-50 text-[#0285fd] text-[11px] font-bold uppercase tracking-widest rounded-[3px] transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">SELECT ALL DUE</button>
                                    <button type="button" onClick={handleClearSelections} disabled={formData.docStatus === 'Applied'} className="h-8 px-4 bg-white border-2 border-gray-400 hover:bg-gray-50 text-gray-700 text-[11px] font-bold uppercase tracking-widest rounded-[3px] transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">CLEAR ALL</button>
                                </div>
                                <div className="flex-1 bg-[#fff8e6] border border-[#ffe082] p-3 rounded-[3px] flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-[#b8860b] uppercase tracking-widest">Current Over Payment / Advance</span>
                                        <span className="text-[18px] font-black text-[#856404] font-mono leading-none">{advanceBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
                                        <Plus className="text-[#856404]" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 space-y-3">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-2.5">
                                <div className="flex justify-between items-center text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                    <span>Total Amount Due</span>
                                    <span className="text-[13px] text-gray-700">{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#0285fd] font-bold text-[10px] uppercase tracking-widest">
                                    <span>Payment Received</span>
                                    <span className="text-[14px] font-black">{parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-purple-600 font-bold text-[10px] uppercase tracking-widest">
                                    <span>Total Allocated</span>
                                    <span className="text-[13px]">{totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-orange-500 font-bold text-[10px] uppercase tracking-widest">
                                    <span>Over Payment</span>
                                    <span className="text-[13px]">{Math.max(0, parseFloat(formData.amount) - totalAllocated).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-500 font-bold text-[10px] uppercase tracking-widest">
                                    <span>Discount Applied</span>
                                    <span className="text-[13px]">{totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                    <span>Debit / SetOff</span>
                                    <span className="text-[13px]">{totalSetOff.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-1" />
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-[3px]">
                                    <span className="text-[13px] font-black text-gray-800 uppercase tracking-widest">Ending Balance</span>
                                    <span className="text-[18px] font-black text-[#0285fd] font-mono tracking-tight">
                                        {(totalDue - totalAllocated - totalDiscount - totalSetOff).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} currentDate={formData[datePickerField]} onDateChange={(d) => { setFormData(prev => ({ ...prev, [datePickerField]: d })); setShowDatePicker(false); }} title="Select Date" />

            <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Confirm Transaction" message="Are you sure you want to apply this payment? This action will update ledger records." isLoading={isSaving} />

            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Delete Document" message="Are you sure you want to delete this document? This action cannot be undone." isLoading={isDeleting} variant="danger" />

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Historical Document Directory" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Global Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by document id..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={archiveSearchQuery} onChange={(e) => setArchiveSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Reference ID</th><th className=" px-5 py-3">Posting Date</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
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

        </>
    );
};

export default ReceivePaymentBoard;
