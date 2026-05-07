import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, RefreshCw, X, Save, Loader2, Trash2, CheckCircle, RotateCcw, Plus } from 'lucide-react';
import { salesReceiptService } from '../services/salesReceipt.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import CalendarModal from '../components/CalendarModal';

const SalesReceiptBoard = ({ isOpen, onClose }) => {
    // --- State ---
    const [formData, setFormData] = useState({
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

    const [rows, setRows] = useState([]);
    const [entry, setEntry] = useState({ prodCode: '', prodName: '', qty: '', sellingPrice: '', amount: '0.00' });
    
    const [lookups, setLookups] = useState({ customers: [], products: [] });
    const [existingDocs, setExistingDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

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
    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    // --- Initialization ---
    useEffect(() => {
        if (isOpen) {
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
            handleClear();
            setShowConfirmModal(false);
        } catch (error) {
            showErrorToast("Failed to finalize receipt.");
        } finally {
            setIsApplying(false);
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
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Create Sales Receipt"
                maxWidth="max-w-[1050px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="px-6 h-10 bg-[#ff3b30] text-white text-sm font-black rounded-[5px] shadow-md shadow-red-100 hover:bg-[#e03127] transition-all active:scale-95 flex items-center gap-2 border-none"
                            >
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={isApplying || rows.length === 0}
                                className={`px-8 h-10 ${isApplying || rows.length === 0 ? 'bg-gray-300' : 'bg-[#2bb744] shadow-md shadow-green-100 hover:bg-[#259b3a]'} text-white text-sm font-black rounded-[5px] transition-all active:scale-95 flex items-center gap-2 border-none`}
                            >
                                {isApplying ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} 
                                SAVE & APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Document ID */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Document ID</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" value={formData.docNo} onChange={(e) => setFormData(p => ({ ...p, docNo: e.target.value }))} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none shadow-sm" />
                                    <button onClick={handleSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Customer</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0" onClick={() => setShowCustLookup(true)}>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        placeholder="Select customer..." 
                                        value={formData.customerName ? `${formData.customerId} - ${formData.customerName}` : ''}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-red-600 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer" 
                                    />
                                    <button className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Post Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Post Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0" onClick={() => setShowCalendar(true)}>
                                    <input type="text" readOnly value={formData.date} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Reference */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Reference</label>
                                <input 
                                    type="text" 
                                    value={formData.reference}
                                    onChange={(e) => setFormData(p => ({ ...p, reference: e.target.value }))}
                                    className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" 
                                />
                            </div>

                            {/* Subject */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Subject</label>
                                <input 
                                    type="text" 
                                    value={formData.subject}
                                    onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                                    className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" 
                                />
                            </div>

                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[250px] overflow-hidden">
                        {/* Table header */}
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                            <div className="flex-[2.5] py-2.5 px-4 border-r border-gray-100 flex items-center justify-between">
                                <span>Item Selection Portfolio</span>
                                <button
                                    onClick={() => setShowProdLookup(true)}
                                    className="w-8 h-7 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                ><Plus size={14} /></button>
                            </div>
                            <div className="w-32 py-2.5 px-4 border-r border-gray-100 text-right">Unit Rate</div>
                            <div className="w-24 py-2.5 px-4 border-r border-gray-100 text-center">Usage</div>
                            <div className="w-36 py-2.5 px-4 text-right">Extended Net</div>
                            <div className="w-10"></div>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 bg-white overflow-y-auto max-h-[280px] divide-y divide-gray-50">
                            {rows.length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                                    No items allocated to this document
                                </div>
                            ) : rows.map((row, idx) => (
                                <div key={idx} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="flex-[2.5] py-2 px-4 border-r border-gray-100 truncate flex flex-col">
                                        <span className="text-blue-600 font-mono text-[10px]">{row.prodCode}</span>
                                        <span className="truncate">{row.prodName}</span>
                                    </div>
                                    <div className="w-32 py-2 px-4 border-r border-gray-100 text-right text-slate-500 font-mono">
                                        {parseFloat(row.sellingPrice).toFixed(2)}
                                    </div>
                                    <div className="w-24 py-2 px-4 border-r border-gray-100 text-center font-mono font-black text-slate-900">
                                        {row.qty}
                                    </div>
                                    <div className="w-36 py-2 px-4 text-right font-mono font-black text-slate-800">
                                        {parseFloat(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="w-10 flex justify-center">
                                        <button onClick={() => setRows(prev => prev.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[5px] group-hover:opacity-100 opacity-0">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Area */}
                    <div className="flex flex-row justify-between items-end gap-x-12">
                        <div className="flex-1 space-y-2">
                            <label className="text-[12.5px] font-bold text-gray-700">Internal Remarks & Comments</label>
                            <textarea 
                                value={formData.comment}
                                onChange={(e) => setFormData(p => ({ ...p, comment: e.target.value }))}
                                className="w-full h-[80px] border border-gray-300 rounded-lg p-3 text-[12.5px] font-mono outline-none focus:border-[#0285fd] resize-none shadow-sm bg-gray-50/30" 
                                placeholder="Type any additional information here..."
                            ></textarea>
                        </div>

                        <div className="w-[320px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex flex-col gap-1 items-end bg-slate-50 p-3 rounded-md border border-slate-100">
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Net Liability Total</span>
                                <div className="text-[26px] font-mono font-black text-blue-700 leading-none tracking-tighter">
                                    LKR {totalAmount}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Lookups --- */}
                
                {/* Historical Document Picker Modal */}
                <SimpleModal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    title="Historical Document Directory"
                    maxWidth="max-w-[700px]"
                >
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Global Archive Search</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input type="text" placeholder="Filter by document id or creation date..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" />
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Reference ID</th>
                                        <th className="px-5 py-3">Ledger Posting Date</th>
                                        <th className="px-5 py-3 text-right">Interaction</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {existingDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-10 text-gray-300 text-[12px] font-bold uppercase tracking-widest">Archive is currently empty</td>
                                        </tr>
                                    ) : existingDocs.map((doc, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleSelectJob(doc.docNo)}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-mono text-gray-600 ">{doc.docNo}</td>
                                            <td className="px-5 py-3 text-[13px] font-mono text-gray-600 ">{doc.date?.split('T')[0]}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">RETRIEVE</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                {/* Customer Lookup Modal */}
                <SimpleModal
                    isOpen={showCustLookup}
                    onClose={() => setShowCustLookup(false)}
                    title="Customer Directory Lookup"
                    maxWidth="max-w-[600px]"
                >
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Find customer by legal name or code..."
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                    value={custSearch}
                                    onChange={(e) => setCustSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3">Code</th>
                                            <th className="px-5 py-3">Customer Portfolio Name</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredCustomers.map(c => (
                                            <tr key={c.code} className="group hover:bg-blue-50/50 cursor-pointer transition-all" onClick={() => {
                                                setFormData(p => ({ ...p, customerId: c.code, customerName: c.name }));
                                                setShowCustLookup(false);
                                                setCustSearch('');
                                            }}>
                                                <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{c.code}</td>
                                                <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{c.name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SimpleModal>

                {/* Product Selection Portal */}
                <SimpleModal
                    isOpen={showProdLookup}
                    onClose={() => setShowProdLookup(false)}
                    title="Global Itemized Lookup"
                    maxWidth="max-w-[700px]"
                >
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Scan items by generic title or reference code..."
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                    value={prodSearch}
                                    onChange={(e) => setProdSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3">Code</th>
                                            <th className="px-5 py-3">Item Description</th>
                                            <th className="px-5 py-3 text-right">Selling Price</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredProducts.map(p => (
                                            <tr key={p.code} className="group hover:bg-blue-50/50 cursor-pointer transition-all" onClick={() => {
                                                setEntry({
                                                    prodCode: p.code,
                                                    prodName: p.name,
                                                    sellingPrice: p.sellingPrice?.toFixed(2) || '0.00',
                                                    qty: '',
                                                    amount: '0.00'
                                                });
                                                setShowQtyModal(true);
                                            }}>
                                                <td className="px-5 py-3 font-mono text-[12px] font-bold text-blue-600">{p.code}</td>
                                                <td className="px-5 py-3 text-[13px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{p.name}</td>
                                                <td className="px-5 py-3 text-right font-mono font-black text-gray-400">{p.sellingPrice?.toFixed(2)}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#0285fd] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#0073ff] shadow-md transition-all active:scale-95">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SimpleModal>

                {/* Line Item Configuration Modal (Qty/Price) */}
                <SimpleModal
                    isOpen={showQtyModal}
                    onClose={() => setShowQtyModal(false)}
                    title="Line Item Configuration"
                    maxWidth="max-w-[450px]"
                >
                    <div className="space-y-6 px-1 py-2 font-['Tahoma']">
                        <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Active Selection</span>
                            <h3 className="text-[18px] font-black text-slate-700 uppercase leading-[1.2] tracking-tight max-w-[90%] break-words">
                                {entry.prodName}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[11px] font-mono font-bold text-blue-500 bg-white px-3 py-0.5 rounded-md shadow-sm border border-slate-100">{entry.prodCode}</span>
                                <span className="text-[10px] font-black text-slate-300 uppercase">Product Code</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                    <span>Unit Selling Price</span>
                                    <span className="text-blue-500 font-mono">LKR</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={entry.sellingPrice} 
                                    onChange={(e) => {
                                        const p = e.target.value;
                                        setEntry(prev => ({ ...prev, sellingPrice: p, amount: (parseFloat(prev.qty || 0) * parseFloat(p || 0)).toFixed(2) }));
                                    }}
                                    className="w-full h-12 border border-gray-300 px-5 text-right text-[16px] font-mono font-black rounded-xl outline-none focus:border-[#0285fd] focus:ring-4 focus:ring-blue-50 transition-all bg-white" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Transaction Quantity</label>
                                <input 
                                    type="number" 
                                    ref={qtyRef}
                                    value={entry.qty} 
                                    onChange={(e) => {
                                        const q = e.target.value;
                                        setEntry(prev => ({ ...prev, qty: q, amount: (parseFloat(q || 0) * parseFloat(prev.sellingPrice || 0)).toFixed(2) }));
                                    }}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveLine(); }}
                                    className="w-full h-12 border border-[#0285fd] px-5 text-center text-[18px] font-mono font-black rounded-xl outline-none bg-blue-50/20 focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" 
                                    autoFocus 
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Line Item Total</span>
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span className="text-[12px] font-bold text-blue-500">LKR</span>
                                    <span className="text-[26px] font-mono font-black text-slate-800 tracking-tight">
                                        {parseFloat(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveLine}
                                className="h-11 px-8 bg-[#0285fd] text-white text-[13px] font-bold rounded-lg hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 border-none"
                            >
                                <Plus size={16} /> ADD TO LIST
                            </button>
                        </div>
                    </div>
                </SimpleModal>

                <CalendarModal 
                    isOpen={showCalendar}
                    onClose={() => setShowCalendar(false)}
                    onDateSelect={(d) => {
                        const parts = d.split('/');
                        if (parts.length === 3) {
                            setFormData(p => ({ ...p, date: `${parts[2]}-${parts[1]}-${parts[0]}` }));
                        }
                        setShowCalendar(false);
                    }}
                    initialDate={formData.date}
                />

                <ConfirmModal 
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmApply}
                    title="Finalize Sales Receipt"
                    message={`Are you sure you want to save and apply this Sales Receipt (${formData.docNo})? This action will update the ledger.`}
                    loading={isApplying}
                    confirmText="Apply Receipt"
                />

            </SimpleModal>
        </>
    );
};

export default SalesReceiptBoard;
