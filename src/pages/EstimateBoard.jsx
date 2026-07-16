import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, CheckCircle, Trash2, Save, RotateCcw, Plus, Loader2, Package, FileText } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import QuotationDetailModal from '../components/QuotationDetailModal';
import { quotationService } from '../services/quotation.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const EstimateBoard = ({ isOpen, onClose }) => {
    const { companyCode, userName } = getSessionData();
    const [lookups, setLookups] = useState({ customers: [], products: [], terms: [] });

    const getInitialFormData = () => ({
        docNo: '',
        company: companyCode,
        createUser: userName,
        postDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date().toISOString().split('T')[0],
        customerId: '',
        paymentTerms: '',
        remarks: '',
        comment: '',
        taxPer: '',
        nbtAmnt: 0
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [items, setItems] = useState([]);
    const [entry, setEntry] = useState({
        prodCode: '', prodName: '', unit: '', price: '', qty: '', amount: '', packSize: 1
    });

    const [orders, setOrders] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [showTermsSearch, setShowTermsSearch] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('postDate');
    const [isApplying, setIsApplying] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [termSearchQuery, setTermSearchQuery] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [lastSavedDoc, setLastSavedDoc] = useState(null);
    const [lastSavedData, setLastSavedData] = useState(null);
    const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
    const qtyRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: comp, userName: user } = getSessionData();
            fetchInitialData(comp);
        }
    }, [isOpen]);

    const fetchInitialData = async (company) => {
        try {
            const [lookupsData, docData] = await Promise.all([
                quotationService.getLookups(company),
                quotationService.generateDocNo(company)
            ]);
            setLookups(lookupsData);
            setFormData(prev => ({ ...prev, docNo: docData.docNo }));
        } catch (error) {
            showErrorToast('Failed to load initial data. Check API connection.');
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateSelect = (formattedDate) => {
        setFormData(prev => ({ ...prev, [datePickerField]: formattedDate }));
        setShowDatePicker(false);
    };

    const addItem = (product) => {
        const newItem = {
            prodCode: product.code,
            prodName: product.name,
            unit: product.unit,
            cost: product.price || 0,
            selling: product.sellingPrice || product.price || 0,
            qty: '1',
            amount: (product.sellingPrice || product.price || 0).toString(),
            packSize: product.packSize || 1
        };
        setItems([...items, newItem]);
        setShowProductSearch(false);
    };

    const removeItem = (idx) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    const totals = useMemo(() => {
        const sum = items.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        const taxPercent = parseFloat(formData.taxPer) || 0;
        const taxValue = (sum * taxPercent / 100);
        const netAmount = sum + taxValue;
        return { sum, netAmount, taxValue };
    }, [items, formData.taxPer]);

    const handleClear = () => {
        setItems([]);
        setFormData(prev => ({
            ...prev, customerId: '', paymentTerms: '', remarks: '', comment: '', taxPer: '15', nbtAmnt: 0
        }));
        fetchInitialData(formData.company);
    };

    const handleApply = async () => {
        if (!formData.customerId) return showErrorToast('Please select a customer.');
        if (items.length === 0) return showErrorToast('No products added.');
        setIsApplying(true);
        try {
            const payload = {
                docNo: formData.docNo, company: formData.company, createUser: formData.createUser,
                postDate: formData.postDate, expectedDate: formData.expectedDate,
                customerId: formData.customerId, paymentTerms: formData.paymentTerms,
                remarks: formData.remarks, comment: formData.comment,
                taxPer: formData.taxPer || '0', total: totals.sum, netAmount: totals.netAmount,
                items: items.map(i => ({
                    prodCode: i.prodCode, prodName: i.prodName, unit: i.unit,
                    packSize: parseFloat(i.packSize) || 1, qty: parseFloat(i.qty) || 0,
                    price: parseFloat(i.selling) || 0, amount: parseFloat(i.amount) || 0
                }))
            };
            const resp = await quotationService.apply(payload);
            showSuccessToast(`Quotation ${resp.docNo} applied successfully.`);
            setLastSavedDoc(resp.docNo);
            setLastSavedData(payload);
            setReceiptData(payload);
            setShowReceipt(true);
            handleClear();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsApplying(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.customerId) return showErrorToast('Please select a customer.');
        if (items.length === 0) return showErrorToast('No products added.');
        setIsApplying(true);
        try {
            const payload = {
                docNo: formData.docNo, company: formData.company, createUser: formData.createUser,
                postDate: formData.postDate, expectedDate: formData.expectedDate,
                customerId: formData.customerId, paymentTerms: formData.paymentTerms,
                remarks: formData.remarks, comment: formData.comment,
                taxPer: formData.taxPer || '0', total: totals.sum, netAmount: totals.netAmount,
                items: items.map(i => ({
                    prodCode: i.prodCode, prodName: i.prodName, unit: i.unit,
                    packSize: parseFloat(i.packSize) || 1, qty: parseFloat(i.qty) || 0,
                    price: parseFloat(i.selling) || 0, amount: parseFloat(i.amount) || 0
                }))
            };
            const resp = await quotationService.save(payload);
            showSuccessToast(`Draft ${resp.docNo} saved successfully.`);
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsApplying(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.docNo) return;
        try {
            await quotationService.delete(formData.docNo, formData.company);
            showSuccessToast(`Draft ${formData.docNo} deleted successfully.`);
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        }
    };

    const handleSearchDocs = async () => {
        try {
            const data = await quotationService.searchDocs(formData.company);
            setOrders(data);
            setShowSearchModal(true);
        } catch (error) {
            showErrorToast('Failed to load archive.');
        }
    };

    const handleSelectOrder = async (docNo) => {
        try {
            const data = await quotationService.getDoc(docNo, formData.company);
            const { header, details } = data;
            setFormData(prev => ({
                ...prev, docNo: header.doc_No,
                postDate: header.post_Date?.split('T')[0], expectedDate: header.expected_Date?.split('T')[0],
                customerId: header.vendor_Id, paymentTerms: header.pay_Type,
                remarks: header.remarks, comment: header.comment, taxPer: header.taxper || '15'
            }));
            setItems(details.map(d => ({
                prodCode: d.prod_Code, prodName: d.prod_Name, unit: d.unit,
                packSize: d.pack_Size, qty: d.qty.toString(),
                selling: d.selling_Price.toString(), amount: d.amount.toString()
            })));
            setShowSearchModal(false);
            showSuccessToast("Document loaded from buffer.");
        } catch (error) {
            showErrorToast('Failed to load document details.');
        }
    };

    return (
        <>
            <style>{`@keyframes toastProgress { 0% { width: 100%; } 100% { width: 0%; } }`}</style>
            <TransactionFormWrapper
                isOpen={isOpen} onClose={onClose}
                title="Quotation - Estimate"
                subtitle={`COMPANY: ${formData.company || 'N/A'}${formData.docNo ? `  |  DOC: ${formData.docNo}` : ''}`}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={handleDelete} className="px-6 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> DELETE
                            </button>
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSaveDraft} disabled={isApplying || items.length === 0} className="px-6 h-10 border-2 border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {isApplying ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} SAVE DRAFT
                            </button>
                            <button onClick={handleApply} disabled={isApplying || items.length === 0} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${(isApplying || items.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isApplying ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />} APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Document ID</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.docNo} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.postDate} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" onClick={() => { setDatePickerField('postDate'); setShowDatePicker(true); }} />
                                    <button onClick={() => { setDatePickerField('postDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"><Calendar size={16} /></button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Expected Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.expectedDate} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} />
                                    <button onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"><Calendar size={16} /></button>
                                </div>
                            </div>
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer</label>
                                <div className="relative">
                                    <input type="text" readOnly value={lookups.customers.find(s => s.code === formData.customerId)?.name || ''} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" onClick={() => setShowCustomerSearch(true)}  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Terms</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.paymentTerms} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none" onClick={() => setShowTermsSearch(true)}  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Brief Remarks</label>
                                <input type="text" name="remarks" value={formData.remarks} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-[3px] bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Selection Portfolio</span>
                            <button onClick={() => setShowProductSearch(true)} className="h-7 px-3 bg-[#0285fd] text-white text-[10px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all flex items-center gap-1.5 border-none shadow-sm active:scale-95">
                                <Plus size={13} /> ADD ITEM
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-4">Product Code</th>
                                        <th className="px-4">Product Name</th>
                                        <th className="px-3 text-center w-16">UM</th>
                                        <th className="px-3 text-right w-28">Unit Rate</th>
                                        <th className="px-2 text-center w-20">Usage</th>
                                        <th className="px-4 text-right w-36">Extended Net</th>
                                        <th className="w-12"></th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {items.length === 0 ? (
                                        <tr><td colSpan="7" className="py-10 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No items allocated</td></tr>
                                    ) : items.map((p, idx) => (
                                        <tr key={idx} className="text-[12px] font-bold text-gray-700 border-b border-gray-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-4 py-2.5 font-mono text-blue-700">{p.prodCode}</td>
                                            <td className="px-4 py-2.5 uppercase">{p.prodName}</td>
                                            <td className="px-3 py-2.5 text-center text-gray-400">{p.unit}</td>
                                            <td className="px-1 py-1">
                                                <input type="text" value={p.selling} onChange={(e) => {
                                                    const newSelling = e.target.value;
                                                    const newAmount = (parseFloat(p.qty) || 0) * (parseFloat(newSelling) || 0);
                                                    setItems(items.map((item, i) => i === idx ? { ...item, selling: newSelling, amount: newAmount.toFixed(2) } : item));
                                                }} className="w-full h-8 border border-gray-200 rounded-[3px] text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2" />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input type="text" value={p.qty} onChange={(e) => {
                                                    const newQty = e.target.value;
                                                    const newAmount = (parseFloat(newQty) || 0) * (parseFloat(p.selling) || 0);
                                                    setItems(items.map((item, i) => i === idx ? { ...item, qty: newQty, amount: newAmount.toFixed(2) } : item));
                                                }} className="w-full h-8 border border-gray-200 rounded-[3px] text-center text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-black">{parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-1 text-center">
                                                <button onClick={() => removeItem(idx)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-full"><Trash2 size={13} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-x-6">
                        <div className="col-span-7 space-y-3">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Client Terms & Conditions</label>
                                    <textarea name="comment" value={formData.comment} onChange={handleInput} className="w-full h-[128px] border border-gray-300 rounded-[3px] p-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] resize-none text-gray-700" />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 space-y-3">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-medium text-gray-700">Portfolio Total</span>
                                    <span className="text-[16px] font-mono font-black text-gray-800">{totals.sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Tax (VAT %)</span>
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={formData.taxPer} onChange={(e) => setFormData({ ...formData, taxPer: e.target.value })} className="w-16 h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                        <div className="w-28 h-8 bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-[13px] font-mono text-gray-500">{totals.taxValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200 my-1" />
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-[3px]">
                                    <span className="text-[14px] font-black text-gray-800 uppercase">Proposal Total</span>
                                    <span className="text-[22px] font-mono font-black text-[#0285fd] tracking-tight">{totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showCustomerSearch} onClose={() => setShowCustomerSearch(false)} title="Client Registry Discovery">
                <div className="space-y-4 font-['Tahoma'] p-2">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 border-b border-gray-200 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Filter Registry</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Search by name or code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={customerSearchQuery} onChange={(e) => setCustomerSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Client Code</th><th className=" px-5 py-3">Entity Descriptor</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.customers.filter(c => !customerSearchQuery || c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || c.code.toLowerCase().includes(customerSearchQuery.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50 transition-all  cursor-pointer group border-b border-gray-50" onClick={() => { setFormData({ ...formData, customerId: c.code }); setShowCustomerSearch(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT CLIENT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showProductSearch} onClose={() => setShowProductSearch(false)} title="Product Master Directory">
                <div className="space-y-4 font-['Tahoma'] p-2">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 border-b border-gray-200 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by product name..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Description</th><th className="text-right px-5 py-3">Rate</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.products.filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.code.toLowerCase().includes(productSearchQuery.toLowerCase())).map((p, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50 transition-all cursor-pointer group border-b border-gray-50">
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{p.name}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{(p.sellingPrice || p.price || 0).toLocaleString()}</td>
                                        <td className="text-right px-5 py-3">
                                            <button onClick={() => addItem(p)} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">ADD ITEM</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showTermsSearch} onClose={() => setShowTermsSearch(false)} title="Settlement Terms Directory">
                <div className="space-y-3 font-['Tahoma'] p-2">
                    <div className="flex items-center gap-3 bg-slate-50 p-3 border-b border-gray-200 mb-1">
                        <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Quick Filter</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input type="text" placeholder="Search terms..." className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" value={termSearchQuery} onChange={(e) => setTermSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[250px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Settlement Profile</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.terms.filter(t => !termSearchQuery || t.name.toLowerCase().includes(termSearchQuery.toLowerCase()) || t.code.toLowerCase().includes(termSearchQuery.toLowerCase())).map((t, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50  transition-all group cursor-pointer group border-b border-gray-50" onClick={() => { setFormData({ ...formData, paymentTerms: t.name }); setShowTermsSearch(false); }}>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-semibold text-slate-700 uppercase group-hover:text-blue-600 transition-colors">{t.name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.code}</span>
                                            </div>
                                        </td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Quotation Archive (Drafts)">
                <div className="space-y-4 font-['Tahoma'] p-2">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 border-b border-gray-200 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Refine List</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by document number..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={archiveSearchQuery} onChange={(e) => setArchiveSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Document Sequence</th><th className=" px-5 py-3">Creation Date</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.filter(o => !archiveSearchQuery || o.docNo.toLowerCase().includes(archiveSearchQuery.toLowerCase())).map((order, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50  transition-all group cursor-pointer group border-b border-gray-50" onClick={() => handleSelectOrder(order.docNo)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.docNo}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.date?.split('T')[0]}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RETRIEVE</button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No drafts found in archive</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onSelect={handleDateSelect} initialDate={formData[datePickerField]} />

            {showReceipt && receiptData && (
                <QuotationDetailModal
                    isOpen={showReceipt}
                    onClose={() => { setShowReceipt(false); setReceiptData(null); }}
                    preloadedData={receiptData}
                    docNo={receiptData.docNo}
                />
            )}
        </>
    );
};

export default EstimateBoard;
