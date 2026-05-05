import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import {
    Search,
    Calendar,
    CheckCircle,
    Trash2,
    X,
    Save,
    RotateCcw,
    Plus,
    Loader2,
    Package
} from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { quotationService } from '../services/quotation.service';

const EstimateBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ customers: [], products: [], terms: [] });
    const [formData, setFormData] = useState({
        docNo: '',
        company: 'C001',
        createUser: 'SYSTEM',
        postDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date().toISOString().split('T')[0],
        customerId: '',
        paymentTerms: '',
        remarks: '',
        comment: '',
        taxPer: '',
        nbtAmnt: 0
    });

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
    const [archiveSearchQuery, setArchiveSearchQuery] = useState('');

    const qtyRef = useRef(null);

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
                    <div className="flex-grow text-left py-1 text-red-600">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    useEffect(() => {
        if (isOpen) {
            console.log('EstimateBoard Opening - Initializing Data...');
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';

            if (companyData) {
                try {
                    // Try to parse if it's a JSON string
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) {
                    // It's a plain string
                    companyCode = companyData;
                }
            }

            console.log('Target Company Code:', companyCode);
            const initUser = user?.emp_Name || user?.empName || 'SYSTEM';
            setFormData(prev => ({ ...prev, company: companyCode, createUser: initUser }));

            fetchInitialData(companyCode);
        }
    }, [isOpen]);

    const fetchInitialData = async (company) => {
        try {
            const [lookupsData, docData] = await Promise.all([
                quotationService.getLookups(company),
                quotationService.generateDocNo(company)
            ]);
            console.log('Lookups Loaded:', lookupsData);
            setLookups(lookupsData);
            setFormData(prev => ({ ...prev, docNo: docData.docNo }));
        } catch (error) {
            console.error('Initialization Error:', error);
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
            cost: product.price || 0, // Using purchase price if needed, but for estimate we use selling
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
            ...prev,
            customerId: '', paymentTerms: '', remarks: '', comment: '', taxPer: '15', nbtAmnt: 0
        }));
        fetchInitialData(formData.company);
    };
    const handleApply = async () => {
        if (!formData.customerId) return showErrorToast('Please select a customer.');
        if (items.length === 0) return showErrorToast('No products added.');

        setIsApplying(true);
        try {
            const payload = {
                docNo: formData.docNo,
                company: formData.company,
                createUser: formData.createUser,
                postDate: formData.postDate,
                expectedDate: formData.expectedDate,
                customerId: formData.customerId,
                paymentTerms: formData.paymentTerms,
                remarks: formData.remarks,
                comment: formData.comment,
                taxPer: formData.taxPer || '0',
                total: totals.sum,
                netAmount: totals.netAmount,
                items: items.map(i => ({
                    prodCode: i.prodCode,
                    prodName: i.prodName,
                    unit: i.unit,
                    packSize: parseFloat(i.packSize) || 1,
                    qty: parseFloat(i.qty) || 0,
                    price: parseFloat(i.selling) || 0,   // ✅ i.selling → price
                    amount: parseFloat(i.amount) || 0
                }))
            };

            const resp = await quotationService.apply(payload);
            showSuccessToast(`Quotation ${resp.docNo} applied successfully.`);
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsApplying(false);
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
                ...prev,
                docNo: header.doc_No,
                postDate: header.post_Date?.split('T')[0],
                expectedDate: header.expected_Date?.split('T')[0],
                customerId: header.vendor_Id,
                paymentTerms: header.pay_Type,
                remarks: header.remarks,
                comment: header.comment,
                taxPer: header.taxper || '15'
            }));

            setItems(details.map(d => ({
                prodCode: d.prod_Code,
                prodName: d.prod_Name,
                unit: d.unit,
                packSize: d.pack_Size,
                qty: d.qty.toString(),
                selling: d.selling_Price.toString(),
                amount: d.amount.toString()
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Quotation - Estimate"
                maxWidth="max-w-[1050px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        <div className="flex gap-3">
                            <button className="px-6 h-10 bg-[#ff3b30] text-white text-sm font-black rounded-[5px] shadow-md shadow-red-100 hover:bg-[#e03127] transition-all active:scale-95 flex items-center gap-2 border-none">
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                            <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleApply}
                                disabled={isApplying || items.length === 0}
                                className="px-10 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none disabled:opacity-50"
                            >
                                {isApplying ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                                CONFIRM & SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Document ID</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.docNo} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none" />
                                    <button onClick={handleSearchDocs} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Post Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.postDate} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" onClick={() => { setDatePickerField('postDate'); setShowDatePicker(true); }} />
                                    <button onClick={() => { setDatePickerField('postDate'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md shrink-0"><Calendar size={16} /></button>
                                </div>
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">EDD Timeline</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.expectedDate} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} />
                                    <button onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md shrink-0"><Calendar size={16} /></button>
                                </div>
                            </div>

                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Customer</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={lookups.customers.find(s => s.code === formData.customerId)?.name || ''} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-red-600 bg-gray-50 rounded-[5px] cursor-pointer" onClick={() => setShowCustomerSearch(true)} />
                                    <button onClick={() => setShowCustomerSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md shrink-0"><Search size={16} /></button>
                                </div>
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Set Terms</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.paymentTerms} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] cursor-pointer" onClick={() => setShowTermsSearch(true)} />
                                    <button onClick={() => setShowTermsSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md shrink-0"><Search size={16} /></button>
                                </div>
                            </div>

                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Brief Remarks</label>
                                <input type="text" name="remarks" value={formData.remarks} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 focus:border-[#0285fd]" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[250px] overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                            <div className="flex-[2.5] py-2.5 px-4 border-r border-gray-100 truncate flex items-center justify-between">
                                <span>Item Selection Portfolio</span>
                                <button onClick={() => setShowProductSearch(true)} className="w-8 h-7 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shrink-0"><Plus size={14} /></button>
                            </div>
                            <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">UM</div>
                            <div className="w-28 py-2.5 px-3 border-r border-gray-100 text-right">Unit Rate</div>
                            <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">Usage</div>
                            <div className="w-32 py-2.5 px-4 text-right">Extended Net</div>
                            <div className="w-10"></div>
                        </div>

                        <div className="flex-1 bg-white overflow-y-auto max-h-[220px] divide-y divide-gray-50">
                            {items.length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest ">No items allocated</div>
                            ) : items.map((p, idx) => (
                                <div key={idx} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="flex-[2.5] py-2 px-4 border-r border-gray-100 truncate">
                                        <div className="flex flex-col"><span className="text-blue-600 font-mono text-[10px]">{p.prodCode}</span><span className="truncate">{p.prodName}</span></div>
                                    </div>
                                    <div className="w-16 py-2 px-3 border-r border-gray-100 text-center text-gray-400">{p.unit}</div>
                                    <div className="w-28 border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent">
                                        <input type="text" value={p.selling} onChange={(e) => {
                                            const newSelling = e.target.value;
                                            const newAmount = (parseFloat(p.qty) || 0) * (parseFloat(newSelling) || 0);
                                            setItems(items.map((item, i) => i === idx ? { ...item, selling: newSelling, amount: newAmount.toFixed(2) } : item));
                                        }} className="w-full h-7 bg-transparent text-right text-[12px] font-mono font-bold text-slate-800 outline-none px-2" />
                                    </div>
                                    <div className="w-16 border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent">
                                        <input type="text" value={p.qty} onChange={(e) => {
                                            const newQty = e.target.value;
                                            const newAmount = (parseFloat(newQty) || 0) * (parseFloat(p.selling) || 0);
                                            setItems(items.map((item, i) => i === idx ? { ...item, qty: newQty, amount: newAmount.toFixed(2) } : item));
                                        }} className="w-full h-7 bg-transparent text-center text-[12px] font-mono font-black text-slate-900 outline-none px-1" />
                                    </div>
                                    <div className="w-32 py-1.5 px-4 text-right font-mono font-black text-slate-800">{parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    <div className="w-10 flex justify-center py-1">
                                        <button onClick={() => removeItem(idx)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[5px]"><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-end gap-x-12">
                        <div className="flex-1 space-y-2">
                            <label className="text-[12.5px] font-bold text-gray-700">Client Terms & Conditions</label>
                            <textarea name="comment" value={formData.comment} onChange={handleInput} className="w-full h-[100px] border border-gray-300 rounded-lg p-3 text-[12.5px] font-mono outline-none focus:border-[#0285fd] resize-none shadow-sm bg-gray-50/30" />
                        </div>

                        <div className="w-[320px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between"><span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">Portfolio Total</span><div className="text-[15px] font-mono font-black text-slate-800">{totals.sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">TAX (VAT</span>
                                    <input
                                        type="text"
                                        value={formData.taxPer}
                                        onChange={(e) => setFormData({ ...formData, taxPer: e.target.value })}
                                        className="w-10 h-6 border-b border-gray-300 text-center font-mono font-black text-slate-800 focus:border-blue-500 outline-none bg-transparent"
                                    />
                                    <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">%)</span>
                                </div>
                                <div className="text-[15px] font-mono font-bold text-slate-600">{totals.taxValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="h-[1px] bg-gray-100 my-1" />
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md"><span className="text-[13px] font-black text-slate-900 uppercase">Proposal Total</span><div className="text-[18px] font-mono font-black text-blue-700 tracking-tighter">{totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Lookups */}
            <SimpleModal isOpen={showCustomerSearch} onClose={() => setShowCustomerSearch(false)} title="Client Registry Discovery" maxWidth="max-w-[600px]">
                <div className="space-y-4 font-['Tahoma'] p-2">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Filter Registry</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Search by name or code..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={customerSearchQuery} onChange={(e) => setCustomerSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-5 py-3">Client Code</th>
                                    <th className="px-5 py-3">Entity Descriptor</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.customers.filter(c => !customerSearchQuery || c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || c.code.toLowerCase().includes(customerSearchQuery.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => { setFormData({ ...formData, customerId: c.code }); setShowCustomerSearch(false); }}>
                                        <td className="px-5 py-3 font-mono text-[12px] font-bold text-blue-600 uppercase">{c.code}</td>
                                        <td className="px-5 py-3 text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors">{c.name}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all whitespace-nowrap">SELECT CLIENT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showProductSearch} onClose={() => setShowProductSearch(false)} title="Product Master Directory" maxWidth="max-w-[650px]">
                <div className="space-y-4 font-['Tahoma'] p-2">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by product name..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0">
                                <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Description</th><th className="px-5 py-3 text-right">Rate</th><th className="px-5 py-3 text-right">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.products.filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.code.toLowerCase().includes(productSearchQuery.toLowerCase())).map((p, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-5 py-3 font-mono font-bold text-blue-600">{p.code}</td>
                                        <td className="px-5 py-3 font-bold text-slate-700 uppercase">{p.name}</td>
                                        <td className="px-5 py-3 text-right font-mono font-bold">{(p.sellingPrice || p.price || 0).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button onClick={() => addItem(p)} className="bg-[#e49e1b] text-white text-[10px] px-4 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all whitespace-nowrap min-w-[90px]">ADD ITEM</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showTermsSearch} onClose={() => setShowTermsSearch(false)} title="Settlement Terms Directory" maxWidth="max-w-[500px]">
                <div className="space-y-4 font-['Tahoma'] p-2">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Quick Filter</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Search terms..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={termSearchQuery} onChange={(e) => setTermSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[350px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Settlement Profile</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.terms.filter(t => !termSearchQuery || t.name.toLowerCase().includes(termSearchQuery.toLowerCase()) || t.code.toLowerCase().includes(termSearchQuery.toLowerCase())).map((t, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={() => { setFormData({ ...formData, paymentTerms: t.name }); setShowTermsSearch(false); }}>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold  text-slate-700 uppercase group-hover:text-blue-600 transition-colors">{t.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all whitespace-nowrap">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Historical Search */}
            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Quotation Archive (Drafts)" maxWidth="max-w-[650px]">
                <div className="space-y-4 font-['Tahoma'] p-2">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest text-center">Refine List</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by document number..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={archiveSearchQuery} onChange={(e) => setArchiveSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-5 py-3">Document Sequence</th>
                                    <th className="px-5 py-3">Creation Date</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.filter(o => !archiveSearchQuery || o.docNo.toLowerCase().includes(archiveSearchQuery.toLowerCase())).map((order, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50 cursor-pointer transition-all group" onClick={() => handleSelectOrder(order.docNo)}>
                                        <td className="px-5 py-3 font-mono font-bold text-blue-600 uppercase group-hover:text-blue-700">{order.docNo}</td>
                                        <td className="px-5 py-3 font-mono text-[12px] text-slate-500 font-bold">{order.date?.split('T')[0]}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black shadow-md hover:bg-[#cb9b34] transition-all whitespace-nowrap min-w-[100px]">RETRIEVE</button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="3" className="text-center py-10 text-gray-300 font-bold uppercase tracking-widest">No drafts found in archive</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onSelect={handleDateSelect} initialDate={formData[datePickerField]} />
        </>
    );
};

export default EstimateBoard;
