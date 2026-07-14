import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, RefreshCw, Save, Trash2, CheckCircle, RotateCcw, Plus, FileText } from 'lucide-react';
import { salesReceiptService } from '../services/salesReceipt.service';
import CalendarModal from '../components/CalendarModal';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import SalesReceiptDetailModal from '../components/SalesReceiptDetailModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SearchableSelect from '../components/SearchableSelect';

const SalesReceiptBoard = ({ isOpen, onClose }) => {
    // --- State ---
    const getInitialFormData = () => ({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        customerId: '',
        customerName: '',
        reference: '',
        subject: '',
        comment: '',
        company: 'COM001',
        createUser: 'Admin'
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [rows, setRows] = useState([]);
    const [entry, setEntry] = useState({ prodCode: '', prodName: '', qty: '', sellingPrice: '', amount: '0.00' });
    
    const [lookups, setLookups] = useState({ customers: [], products: [] });
    const [existingDocs, setExistingDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [appliedDocNo, setAppliedDocNo] = useState(null);

    // Modals
    const [showCustLookup, setShowCustLookup] = useState(false);
    const [showProdLookup, setShowProdLookup] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showQtyModal, setShowQtyModal] = useState(false);
    
    const [custSearch, setCustSearch] = useState('');
    const [prodSearch, setProdSearch] = useState('');

    const qtyRef = useRef(null);

    // --- Custom Toasts ---
    // --- Initialization ---
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const initCompany = user?.company_Id || user?.companyId || 'COM001';
            const initUser = user?.emp_Name || user?.empName || 'Admin';

            const [lookupData, docData] = await Promise.all([
                salesReceiptService.getLookups(),
                salesReceiptService.generateDocNo(initCompany)
            ]);

            setLookups(lookupData);
            setFormData(prev => ({ 
                ...prev, 
                docNo: docData.docNo, 
                company: initCompany,
                createUser: initUser
            }));
        } catch (error) {
            showErrorToast("Failed to initialize module.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Actions ---
    const handleClear = () => {
        setRows([]);
        setEntry({ prodCode: '', prodName: '', qty: '', sellingPrice: '', amount: '0.00' });
        setFormData(prev => ({
            ...prev,
            customerId: '',
            customerName: '',
            reference: '',
            subject: '',
            comment: ''
        }));
        loadInitialData();
    };

    const handleSearch = async () => {
        try {
            const docs = await salesReceiptService.searchDocs(formData.company);
            setExistingDocs(docs || []);
            setShowSearchModal(true);
        } catch (error) {
            showErrorToast("Failed to load historical documents.");
        }
    };

    const handleSelectJob = async (docNo) => {
        try {
            const data = await salesReceiptService.getJob(docNo, formData.company);
            const header = data.header;
            const details = data.details;

            const cust = lookups.customers.find(c => c.code === header.cust_Code);

            setFormData(prev => ({
                ...prev,
                docNo: header.doc_No,
                date: header.cur_Date?.split('T')[0],
                customerId: header.cust_Code,
                customerName: cust?.name || header.cust_Code || '',
                reference: header.reference || '',
                subject: header.subject || '',
                comment: header.comment || ''
            }));

            setRows(details.map(d => ({
                prodCode: d.prod_Code,
                prodName: d.prod_Name,
                qty: d.qty.toString(),
                sellingPrice: d.selling_Price.toString(),
                amount: d.amount.toString()
            })));

            setShowSearchModal(false);
            showSuccessToast("Document Retrieved Successfully.");
        } catch (error) {
            showErrorToast("Failed to retrieve document.");
        }
    };

    const handleDelete = async () => {
        if (!formData.docNo) return;
        if (!window.confirm("Are you sure you want to delete this draft document?")) return;

        try {
            await salesReceiptService.deleteJob(formData.docNo, formData.company);
            showSuccessToast("Document Deleted Successfully.");
            handleClear();
        } catch (error) {
            showErrorToast("Failed to delete document.");
        }
    };

    const handleSaveLine = async () => {
        if (!formData.customerId) return showErrorToast("Please select a customer first.");
        if (!entry.prodCode) return showErrorToast("Please select a product.");
        if (!entry.qty || parseFloat(entry.qty) <= 0) return showErrorToast("Enter a valid quantity.");

        try {
            const payload = {
                ...formData,
                items: [{ 
                    ...entry, 
                    qty: parseFloat(entry.qty),
                    sellingPrice: parseFloat(entry.sellingPrice),
                    amount: parseFloat(entry.amount)
                }]
            };
            await salesReceiptService.saveLine(payload);
            
            setRows(prev => {
                const existing = prev.findIndex(r => r.prodCode === entry.prodCode);
                if (existing >= 0) {
                    const newRows = [...prev];
                    newRows[existing] = { ...entry };
                    return newRows;
                }
                return [...prev, { ...entry }];
            });
            
            setEntry({ prodCode: '', prodName: '', qty: '', sellingPrice: '', amount: '0.00' });
            showSuccessToast("Item Added to Receipt.");
            setShowQtyModal(false);
        } catch (error) {
            showErrorToast("Failed to save line item.");
        }
    };

    const confirmApply = async () => {
        setIsApplying(true);
        try {
            const payload = {
                docNo: formData.docNo,
                company: formData.company,
                comment: formData.comment || formData.subject,
                createUser: formData.createUser
            };
            const result = await salesReceiptService.apply(payload);
            showSuccessToast(`Receipt Finalized: ${result.appDocNo}`);
            setAppliedDocNo(result.appDocNo);
            handleClear();
            setShowConfirmModal(false);
        } catch (error) {
            showErrorToast("Failed to finalize receipt.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.customerId) return showErrorToast("Please select a customer first.");

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                items: rows.map(r => ({
                    ...r,
                    qty: parseFloat(r.qty),
                    sellingPrice: parseFloat(r.sellingPrice),
                    amount: parseFloat(r.amount)
                }))
            };
            await salesReceiptService.saveDraft(payload);
            showSuccessToast("Draft Saved Successfully.");
            handleClear();
        } catch (error) {
            showErrorToast("Failed to save draft.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Lookups ---
    const filteredCustomers = useMemo(() => {
        return lookups.customers.filter(c => 
            c.code.toLowerCase().includes(custSearch.toLowerCase()) || 
            c.name.toLowerCase().includes(custSearch.toLowerCase())
        );
    }, [lookups.customers, custSearch]);

    const filteredProducts = useMemo(() => {
        return lookups.products.filter(p => 
            p.code.toLowerCase().includes(prodSearch.toLowerCase()) || 
            p.name.toLowerCase().includes(prodSearch.toLowerCase())
        );
    }, [lookups.products, prodSearch]);

    const totalAmount = useMemo(() => {
        return rows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0).toFixed(2);
    }, [rows]);

    return (
        <>
            <style>{`@keyframes toastProgress { 0% { width: 100%; } 100% { width: 0%; } }`}</style>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Create Sales Receipt"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={handleDelete} className="px-6 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RefreshCw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSaveDraft} disabled={isSaving || isApplying} className="px-6 h-10 border-2 border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> SAVE
                            </button>
                            <button onClick={() => setShowConfirmModal(true)} disabled={isApplying || rows.length === 0} className={`px-6 py-2 ${isApplying || rows.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0285fd] hover:bg-[#0073ff]'} text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2`}>
                                <CheckCircle size={14} /> APPLY
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
                                    <input type="text" value={formData.docNo} onChange={(e) => setFormData(p => ({ ...p, docNo: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700" />
                                    <button onClick={handleSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date} onClick={() => setShowCalendar(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => setShowCalendar(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Reference</label>
                                <input type="text" value={formData.reference} onChange={(e) => setFormData(p => ({ ...p, reference: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer</label>
                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={formData.customerId} className="w-24 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none text-gray-700 font-mono shrink-0" />
                                        <div className="relative flex-1">
                                            <input type="text" readOnly placeholder="Select customer..." value={formData.customerName} onClick={() => setShowCustLookup(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                            <button onClick={() => setShowCustLookup(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Subject</label>
                                <input type="text" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-[3px] bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Selection Portfolio</span>
                            <button onClick={() => setShowProdLookup(true)} className="h-7 px-3 bg-[#0285fd] text-white text-[10px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all flex items-center gap-1.5 border-none shadow-sm active:scale-95">
                                <Plus size={13} /> ADD LINE ITEM
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-3 w-40">PRODUCT CODE</th>
                                        <th className="px-3">PRODUCT NAME</th>
                                        <th className="px-3 text-right w-28">UNIT RATE</th>
                                        <th className="px-2 text-center w-20">USAGE</th>
                                        <th className="px-4 text-right w-36">EXTENDED NET</th>
                                        <th className="w-12"></th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-10 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                                                No items allocated to this document
                                            </td>
                                        </tr>
                                    ) : rows.map((row, idx) => (
                                        <tr key={idx} className="text-[12px] font-bold text-gray-700 border-b border-gray-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-3 py-2.5">
                                                <div className="flex flex-col">
                                                    <span className="text-blue-700 font-mono text-[10px]">{row.prodCode}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 truncate">{row.prodName}</td>
                                            <td className="px-3 py-2.5 text-right font-mono text-gray-500">{parseFloat(row.sellingPrice).toFixed(2)}</td>
                                            <td className="px-3 py-2.5 text-center font-mono font-black">{row.qty}</td>
                                            <td className="px-4 py-2.5 text-right font-mono font-black">
                                                {parseFloat(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-1 text-center">
                                                <button onClick={() => setRows(prev => prev.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-full">
                                                    <Trash2 size={13} />
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
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Internal Remarks & Comments</label>
                                    <textarea value={formData.comment} onChange={(e) => setFormData(p => ({ ...p, comment: e.target.value }))} className="w-full h-[128px] border border-gray-300 rounded-[3px] p-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] resize-none text-gray-700" placeholder="Type any additional information here..." />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 space-y-3">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                                <div className="flex flex-col gap-1 items-end bg-slate-50 p-3 rounded-[3px]">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Net Liability Total</span>
                                    <div className="text-[26px] font-mono font-black text-[#0285fd] leading-none tracking-tight">
                                        {parseFloat(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Historical Document Directory" maxWidth="max-w-[700px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Global Archive Search</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input type="text" placeholder="Filter by document id or creation date..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" />
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Reference ID</th>
                                        <th className=" px-5 py-3">Ledger Posting Date</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {existingDocs.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Archive is currently empty</td></tr>
                                    ) : existingDocs.map((doc, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectJob(doc.docNo)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{doc.docNo}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{doc.date?.split('T')[0]}</td>
                                            <td className="text-right px-5 py-3">
                                                <button onClick={() => handleSelectJob(doc.docNo)} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RETRIEVE</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                <SimpleModal isOpen={showCustLookup} onClose={() => setShowCustLookup(false)} title="Customer Directory Lookup" maxWidth="max-w-[700px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input autoFocus type="text" placeholder="Find customer by legal name or code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={custSearch} onChange={(e) => setCustSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Customer Portfolio Name</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredCustomers.map(c => (
                                        <tr key={c.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(p => ({ ...p, customerId: c.code, customerName: c.name })); setShowCustLookup(false); setCustSearch(''); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.name}</td>
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

                <SimpleModal isOpen={showProdLookup} onClose={() => setShowProdLookup(false)} title="Global Itemized Lookup" maxWidth="max-w-[700px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input autoFocus type="text" placeholder="Scan items by generic title or reference code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Item Description</th>
                                        <th className="text-right px-5 py-3">Selling Price</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredProducts.map(p => (
                                        <tr key={p.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => {
                                            setEntry({
                                                prodCode: p.code,
                                                prodName: p.name,
                                                sellingPrice: p.sellingPrice?.toFixed(2) || '0.00',
                                                qty: '',
                                                amount: '0.00'
                                            });
                                            setShowQtyModal(true);
                                        }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{p.name}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.sellingPrice?.toFixed(2)}</td>
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

                <SimpleModal isOpen={showQtyModal} onClose={() => setShowQtyModal(false)} title="Line Item Configuration" maxWidth="max-w-[700px]">
                    <div className="space-y-6 px-1 py-2 font-['Tahoma']">
                        <div className="bg-slate-50/50 p-5 rounded-[3px] border border-slate-100 flex flex-col items-center text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Active Selection</span>
                            <h3 className="text-[18px] font-black text-slate-700 uppercase leading-[1.2] tracking-tight max-w-[90%] break-words">
                                {entry.prodName}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[11px] font-mono font-bold text-blue-500 bg-white px-3 py-0.5 rounded-[3px] shadow-sm border border-slate-100">{entry.prodCode}</span>
                                <span className="text-[10px] font-black text-slate-300 uppercase">Product Code</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                    <span>Unit Selling Price</span>
                                    <span className="text-blue-500 font-mono">LKR</span>
                                </label>
                                <input type="text" value={entry.sellingPrice} onChange={(e) => {
                                    const p = e.target.value;
                                    setEntry(prev => ({ ...prev, sellingPrice: p, amount: (parseFloat(prev.qty || 0) * parseFloat(p || 0)).toFixed(2) }));
                                }} className="w-full h-12 border border-gray-300 px-5 text-right text-[16px] font-mono font-black rounded-[3px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] transition-all bg-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Transaction Quantity</label>
                                <input type="number" ref={qtyRef} value={entry.qty} onChange={(e) => {
                                    const q = e.target.value;
                                    setEntry(prev => ({ ...prev, qty: q, amount: (parseFloat(q || 0) * parseFloat(prev.sellingPrice || 0)).toFixed(2) }));
                                }} onKeyDown={e => { if (e.key === 'Enter') handleSaveLine(); }} className="w-full h-12 border border-[#0285fd] px-5 text-center text-[18px] font-mono font-black rounded-[3px] outline-none bg-blue-50/20 focus:ring-1 focus:ring-[#0285fd] transition-all shadow-inner" autoFocus />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Line Item Total</span>
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span className="text-[12px] font-bold text-[#0285fd]">LKR</span>
                                    <span className="text-[26px] font-mono font-black text-slate-800 tracking-tight">
                                        {parseFloat(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                            <button onClick={handleSaveLine} className="h-11 px-8 bg-[#0285fd] text-white text-[13px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 border-none shadow-sm">
                                <Plus size={16} /> ADD TO LIST
                            </button>
                        </div>
                    </div>
                </SimpleModal>

                <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} currentDate={formData.date} onDateChange={(d) => { setFormData(p => ({ ...p, date: d })); setShowCalendar(false); }} title="Select Date" />

                <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Finalize Sales Receipt" message={`Are you sure you want to save and apply this Sales Receipt (${formData.docNo})? This action will update the ledger.`} isLoading={isApplying} />

                {appliedDocNo && (
                    <SalesReceiptDetailModal
                        docNo={appliedDocNo}
                        onClose={() => setAppliedDocNo(null)}
                    />
                )}

            </TransactionFormWrapper>
        </>
    );
};

export default SalesReceiptBoard;
