import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, ChevronDown, CheckCircle, Trash2, XCircle, Save, X, RotateCcw, ChevronLeft, ChevronRight, ClipboardList, Plus } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { grnService } from '../services/grn.service';
import { paymentMethodService } from '../services/paymentMethod.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

import ItemMasterBoard from './ItemMasterBoard';

const GRNBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [], pos: [], paymentMethods: [] });
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [showSupplierSearch, setShowSupplierSearch] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showItemMasterModal, setShowItemMasterModal] = useState(false);
    const [showPOSearch, setShowPOSearch] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('grnDate');
    const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [poSearchQuery, setPOSearchQuery] = useState('');
    const [showExpenseSearch, setShowExpenseSearch] = useState(false);
    const [showPayMethodSearch, setShowPayMethodSearch] = useState(false);
    const [payMethodSearchQuery, setPayMethodSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);

    const [formData, setFormData] = useState({
        docNo: '',
        grnDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date().toISOString().split('T')[0],
        suppCode: '',
        poNo: '',
        payType: 'Cash',
        suppInv: '',
        invAmount: '0.00',
        consignmentBasis: false,
        acceptOtherSupp: false,
        comment: '',
        company: 'C001',
        createUser: 'SYSTEM',
        taxPer: '0',
        nbtPer: '0',
        discPer: '0',
        adjType: '',
        adjAmt: '0.00'
    });

    const [products, setProducts] = useState([]);
    const [entry, setEntry] = useState({
        prodCode: '',
        prodName: '',
        unit: '',
        packSize: 1,
        qty: '',
        free: '',
        cost: '',
        selling: '',
        amount: '0.00'
    });

    const [showProductQtyModal, setShowProductQtyModal] = useState(false);
    const [productMasterData, setProductMasterData] = useState({
        code: '', name: '', unit: 'Nos', purchasePrice: '', sellingPrice: '', packSize: 1
    });
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);

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

    useEffect(() => {
        if (isOpen) {
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            const initCompany = companyCode;
            const initUser = user?.emp_Name || user?.empName || 'SYSTEM';

            setFormData(prev => ({ ...prev, company: initCompany, createUser: initUser }));
            fetchLookups(initCompany);
            generateDocNo(initCompany);
        }
    }, [isOpen]);

    const fetchLookups = async (company) => {
        try {
            const data = await grnService.getLookups(company);
            const methods = await paymentMethodService.getAll(company);
            setLookups({ ...data, paymentMethods: methods });
        } catch (error) {
            toast.error('Failed to load lookups.');
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await grnService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            showErrorToast('Failed to generate document number.');
        }
    };

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateSelect = (date) => {
        setFormData(prev => ({ ...prev, [datePickerField]: date }));
        setShowDatePicker(false);
    };

    const handleEntryInput = (e) => {
        const { name, value } = e.target;
        let newEntry = { ...entry, [name]: value };

        if (name === 'prodCode' && value) {
            const prod = lookups.products.find(p => p.code?.trim().toUpperCase() === value.trim().toUpperCase());
            if (prod) {
                newEntry = {
                    ...newEntry,
                    prodName: prod.name,
                    unit: prod.unit || '',
                    packSize: prod.packSize || 1,
                    cost: prod.price?.toString() || '0.00',
                    selling: prod.sellingPrice?.toString() || '0.00'
                };
                setTimeout(() => qtyRef.current?.focus(), 50);
            }
        }

        if (name === 'qty' || name === 'cost') {
            const q = parseFloat(name === 'qty' ? value : newEntry.qty) || 0;
            const c = parseFloat(name === 'cost' ? value : newEntry.cost) || 0;
            newEntry.amount = (q * c).toFixed(2);
        }
        setEntry(newEntry);
    };

    const addProduct = () => {
        if (!entry.prodCode) return showErrorToast('Select a Product.');
        if (!entry.qty || parseFloat(entry.qty) <= 0) return showErrorToast('Enter valid Quantity.');

        setProducts([...products, { ...entry }]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', free: '', cost: '', selling: '', amount: '0.00' });
        showSuccessToast("Product added to GRN listing.");
    };

    const totals = useMemo(() => {
        const sumTotal = products.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        const sumQty = products.reduce((acc, p) => acc + (parseFloat(p.qty) || 0), 0);
        const sumFree = products.reduce((acc, p) => acc + (parseFloat(p.free) || 0), 0);
        const discAmt = sumTotal * (parseFloat(formData.discPer) || 0) / 100;
        const discountedSum = sumTotal - discAmt;
        const nbtAmt = discountedSum * (parseFloat(formData.nbtPer) || 0) / 100;
        const taxAmt = discountedSum * (parseFloat(formData.taxPer) || 0) / 100;
        const adj = parseFloat(formData.adjAmt) || 0;
        const finalAdj = formData.adjType === 'Add' ? adj : -adj;
        const netAmount = discountedSum + nbtAmt + taxAmt + finalAdj;
        return { sumTotal, sumQty, sumFree, discAmt, nbtAmt, taxAmt, netAmount };
    }, [products, formData]);

    const handleSaveDraft = async () => {
        if (!formData.suppCode) return showErrorToast('Select Supplier.');
        if (products.length === 0) return showErrorToast('No products entered.');
        const payload = preparePayload();
        try {
            await grnService.save(payload);
            showSuccessToast('Draft saved successfully.');
        } catch (error) { showErrorToast(error.toString()); }
    };

    const handleApply = async () => {
        if (!formData.suppCode) return showErrorToast('Select Supplier.');
        if (products.length === 0) return showErrorToast('No products entered.');
        setShowConfirmModal(true);
    };

    const confirmApply = async () => {
        setIsApplying(true);
        const payload = preparePayload();
        try {
            await grnService.apply(payload);
            showSuccessToast('GRN Applied successfully.');
            handleClear();
            setShowConfirmModal(false);
        } catch (error) { showErrorToast(error.toString()); } finally { setIsApplying(false); }
    };

    const handleSelectPO = async (poNo) => {
        try {
            const data = await grnService.getPODetails(poNo, formData.company);
            const h = data.header;
            setFormData(prev => ({
                ...prev,
                poNo: h.doc_No,
                suppCode: h.vendor_Id?.trim() || prev.suppCode,
                payType: h.pay_Type || prev.payType,
                remarks: h.remarks || prev.remarks,
                comment: h.comment || prev.comment,
                taxPer: h.taxPer || '0',
                nbtPer: h.nbt?.toString() || '0'
            }));

            setProducts(data.details.map(d => ({
                prodCode: d.prod_Code,
                prodName: d.prod_Name,
                unit: d.unit,
                packSize: d.pack_Size,
                qty: d.qty?.toString() || '0',
                free: d.free_Qty?.toString() || '0',
                cost: d.purchase_Price?.toString() || '0.00',
                selling: d.selling_Price?.toString() || '0.00',
                amount: d.amount?.toString() || '0.00'
            })));
            setShowPOSearch(false);
            setPOSearchQuery('');
            showSuccessToast(`Purchase Order ${poNo} loaded.`);
        } catch (error) { showErrorToast('Failed to fetch PO details.'); }
    };

    const preparePayload = () => ({
        ...formData,
        total: totals.sumTotal,
        totQty: totals.sumQty,
        totFree: totals.sumFree,
        taxAmt: totals.taxAmt,
        nbtAmnt: totals.nbtAmt,
        discount: totals.discAmt,
        netAmount: totals.netAmount,
        products: products.map((p, i) => ({
            ...p,
            lnNo: i + 1,
            qty: parseFloat(p.qty) || 0,
            free: parseFloat(p.free) || 0,
            cost: parseFloat(p.cost) || 0,
            selling: parseFloat(p.selling) || 0,
            amount: parseFloat(p.amount) || 0
        }))
    });

    const handleClear = () => {
        setProducts([]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', free: '', cost: '', selling: '', amount: '0.00' });
        setFormData(prev => ({
            ...prev,
            suppCode: '', poNo: '', suppInv: '', invAmount: '0.00', consignmentBasis: false,
            acceptOtherSupp: false, comment: '', taxPer: '0', nbtPer: '0', discPer: '0', adjType: '', adjAmt: '0.00'
        }));
        generateDocNo(formData.company);
    };

    const handleSearchClick = async () => {
        try {
            const data = await grnService.searchDocs(formData.company);
            setOrders(data);
            setShowSearchModal(true);
        } catch (error) { showErrorToast('Failed to load saved GRNs.'); }
    };

    const handleSelectRow = async (docNo) => {
        try {
            const data = await grnService.getOrder(docNo, formData.company);
            const h = data.header;
            setFormData(prev => ({
                ...prev,
                docNo: h.doc_No,
                grnDate: h.post_Date?.split('T')[0] || prev.grnDate,
                expectedDate: h.expected_Date?.split('T')[0] || prev.expectedDate,
                suppCode: h.vendor_Id?.trim() || '',
                payType: h.pay_Type || 'Cash',
                suppInv: h.inv_No || '',
                invAmount: h.inv_Amount?.toString() || '0.00',
                consignmentBasis: h.bill_Type || false,
                comment: h.comment || '',
                poNo: h.pO_No || '',
                taxPer: h.taxPer || '0',
                nbtPer: h.nbt?.toString() || '0',
                discPer: h.purDiscount?.toString() || '0',
                adjType: h.adjType || '',
                adjAmt: h.adjst?.toString() || '0.00'
            }));

            setProducts(data.details.map(d => ({
                prodCode: d.prod_Code,
                prodName: d.prod_Name,
                unit: d.unit,
                packSize: d.pack_Size,
                qty: d.qty?.toString() || '0',
                free: d.free_Qty?.toString() || '0',
                cost: d.purchase_Price?.toString() || '0.00',
                selling: d.selling_Price?.toString() || '0.00',
                amount: d.amount?.toString() || '0.00'
            })));
            setShowSearchModal(false);
            showSuccessToast('Record Loaded Successfully.');
        } catch (error) { showErrorToast('Failed to fetch order details.'); }
    };

    const handleCreateProduct = async () => {
        if (!productMasterData.code || !productMasterData.name) {
            return showErrorToast('Code and Name are required.');
        }
        setIsCreatingProduct(true);
        try {
            await grnService.createProduct({
                ...productMasterData,
                createUser: formData.createUser
            });
            showSuccessToast('Product created successfully.');
            setShowItemMasterModal(false);
            setProductMasterData({ code: '', name: '', unit: 'Nos', purchasePrice: '', sellingPrice: '', packSize: 1 });
            // Refresh products list
            const results = await grnService.getLookups(formData.company);
            setLookups(prev => ({ ...prev, products: results.products }));
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsCreatingProduct(false);
        }
    };

    const currentSupplierName = useMemo(() => {
        if (!formData.suppCode) return '';
        const s = lookups.suppliers.find(x => x.code?.trim().toUpperCase() === formData.suppCode.trim().toUpperCase());
        return s ? s.name : formData.suppCode;
    }, [formData.suppCode, lookups.suppliers]);

    return (
        <>
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Good Received Note (GRN)"
            maxWidth="max-w-[1200px]"
            footer={
                <div className="bg-slate-50 px-6 py-3 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClear}
                            className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none"
                        >
                            <RotateCcw size={14} /> CLEAR FORM
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveDraft}
                            className="px-6 h-10 bg-white text-[#0285fd] text-sm font-black rounded-[5px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Save size={14} /> SAVE DRAFT
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={isApplying}
                            className="px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none disabled:opacity-50"
                        >
                            {isApplying ? <Search className="animate-spin" size={14} /> : <CheckCircle size={14} />} SAVE & APPLY
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-sm space-y-3">
                    <div className="grid grid-cols-12 gap-x-4 gap-y-2.5">
                        {/* Row 1: Document ID | Post Date | Exp. Timeline */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Document ID</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm" />
                                <button onClick={handleSearchClick} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Search size={16} /></button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">Post Date</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" readOnly value={formData.grnDate} onClick={() => { setDatePickerField('grnDate'); setShowDatePicker(true); }} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                <button onClick={() => { setDatePickerField('grnDate'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Calendar size={16} /></button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">Exp. Date</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" readOnly value={formData.expectedDate} onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                <button onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Calendar size={16} /></button>
                            </div>
                        </div>

                        {/* Row 2: Supplier (8) | PO Number (4) */}
                        <div className="col-span-8 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Supplier</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" readOnly value={currentSupplierName} onClick={() => setShowSupplierSearch(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-red-600 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                <button onClick={() => setShowSupplierSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Search size={16} /></button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">PO Number</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" readOnly value={formData.poNo || ''} onClick={() => setShowPOSearch(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-[#0285fd] bg-blue-50/20 rounded-[5px] outline-none cursor-pointer shadow-sm" />
                                <button onClick={() => setShowPOSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md shrink-0"><ClipboardList size={16} /></button>
                            </div>
                        </div>

                        {/* Row 3: Supp. Inv | Amount | Payment */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Supp. Inv.</label>
                            <input type="text" name="suppInv" value={formData.suppInv} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">Inv. Amount</label>
                            <input type="text" name="invAmount" value={formData.invAmount} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] font-black text-right outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-center">Pay Method</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input
                                    type="text"
                                    readOnly
                                    value={lookups.paymentMethods?.find(m => m.code === formData.payType)?.name || formData.payType || 'Select...'}
                                    className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer"
                                    onClick={() => setShowPayMethodSearch(true)}
                                />
                                <button onClick={() => setShowPayMethodSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Row 4: Comment (8) | Consignment/Other (4) */}
                        <div className="col-span-8 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Comment</label>
                            <input type="text" name="comment" value={formData.comment} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                        </div>
                        <div className="col-span-4 flex items-center justify-start gap-4 pl-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" name="consignmentBasis" checked={formData.consignmentBasis} onChange={handleInput} className="w-3.5 h-3.5 text-[#0285fd] border-gray-300 rounded focus:ring-[#0285fd] transition-all" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Consign.</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" name="acceptOtherSupp" checked={formData.acceptOtherSupp} onChange={handleInput} className="w-3.5 h-3.5 text-[#0285fd] border-gray-300 rounded focus:ring-[#0285fd] transition-all" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Other Sup.</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[200px] overflow-hidden">
                    {/* Table header */}
                    <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                        <div className="flex-[2.5] py-2.5 px-4 border-r border-gray-100 truncate flex items-center justify-between">
                            <span>Inventory Allocation</span>
                            <button
                                onClick={() => {
                                    setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', free: '', cost: '', selling: '', amount: '0.00' });
                                    grnService.getLookups(formData.company).then(data => setLookups(prev => ({ ...prev, products: data.products })));
                                    setShowAddProductModal(true);
                                }}
                                className="w-8 h-7 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                title="Add Product"
                            ><Plus size={14} /></button>
                        </div>
                        <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">UM</div>
                        <div className="w-24 py-2.5 px-3 border-r border-gray-100 text-right">Cost Rate</div>
                        <div className="w-24 py-2.5 px-3 border-r border-gray-100 text-right">M.R.P</div>
                        <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">Qty</div>
                        <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">Free</div>
                        <div className="w-32 py-2.5 px-4 text-right">Extended Net</div>
                        <div className="w-10"></div>
                    </div>
                    <div className="flex-1 bg-white overflow-y-auto max-h-[170px] divide-y divide-gray-50">
                        {products.length === 0 ? (
                            <div className="h-24 flex items-center justify-center text-gray-300 text-[11px] font-bold uppercase tracking-widest italic">
                            </div>
                        ) : products.map((p, idx) => (
                            <div key={idx} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                <div className="flex-[2.5] py-2 px-4 border-r border-gray-100 truncate">
                                    <div className="flex flex-col">
                                        <span className="text-blue-600 font-mono text-[10px]">{p.prodCode}</span>
                                        <span className="truncate">{p.prodName}</span>
                                    </div>
                                </div>
                                <div className="w-16 py-2 px-3 border-r border-gray-100 text-center text-gray-400">{p.unit}</div>
                                <div className="w-24 py-2 px-3 border-r border-gray-100 text-right font-mono text-gray-800">{parseFloat(p.cost).toFixed(2)}</div>
                                <div className="w-24 py-2 px-3 border-r border-gray-100 text-right font-mono text-blue-600">{parseFloat(p.selling).toFixed(2)}</div>
                                <div className="w-16 border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent">
                                    <input
                                        type="text"
                                        value={p.qty}
                                        onChange={(e) => {
                                            const newQty = e.target.value;
                                            const newAmount = (parseFloat(newQty) || 0) * (parseFloat(p.cost) || 0);
                                            setProducts(products.map((item, i) =>
                                                i === idx ? { ...item, qty: newQty, amount: newAmount.toFixed(2) } : item
                                            ));
                                        }}
                                        className="w-full h-7 bg-transparent text-center text-[12px] font-mono font-black text-slate-900 outline-none focus:bg-white border-none px-1"
                                    />
                                </div>
                                <div className="w-16 border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent">
                                    <input
                                        type="text"
                                        value={p.free}
                                        onChange={(e) => {
                                            setProducts(products.map((item, i) =>
                                                i === idx ? { ...item, free: e.target.value } : item
                                            ));
                                        }}
                                        className="w-full h-7 bg-transparent text-center text-[12px] font-mono font-bold text-green-700 outline-none focus:bg-white border-none px-1"
                                    />
                                </div>
                                <div className="w-32 py-1.5 px-4 text-right font-mono font-black text-slate-800">
                                    {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="w-10 flex justify-center py-1">
                                    <button onClick={() => setProducts(products.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[5px]">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-row justify-between items-start gap-x-4">
                    <div className="flex-1 bg-white border border-gray-100 rounded-lg p-3 shadow-sm space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Expense Ac.</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value="" className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-500 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer" onClick={() => setShowExpenseSearch(true)} />
                                    <button onClick={() => setShowExpenseSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Search size={16} /></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0 text-right">Other Chg.</label>
                                <input type="text" defaultValue="0.00" className="flex-1 h-8 border border-gray-300 px-3 rounded-[5px] text-[12px] text-right font-mono font-bold shadow-sm outline-none focus:border-[#0285fd]" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-700 ml-1">Internal Remarks & Disclaimers</label>
                            <textarea name="comment" value={formData.comment} onChange={handleInput} className="w-full h-[54px] border border-gray-300 rounded-lg p-3 text-[12px] font-mono outline-none focus:border-[#0285fd] resize-none shadow-sm bg-gray-50/10" placeholder="Type here..."></textarea>
                        </div>
                    </div>

                    <div className="w-[350px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between text-[12.5px]">
                            <span className="font-bold text-gray-500 uppercase tracking-tight text-[11px]">Gross Inventory</span>
                            <div className="text-[14px] font-mono font-black text-slate-800">
                                {totals.sumTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Disc. Volume %</span>
                            <div className="flex items-center gap-2">
                                <input type="text" name="discPer" value={formData.discPer} onChange={handleInput} className="w-12 h-7 bg-white border border-gray-200 px-2 text-center text-[12px] font-mono font-bold rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]" />
                                <div className="w-24 h-7 bg-gray-50 border border-gray-100 rounded-[5px] flex items-center justify-end px-2 text-[12px] font-mono text-gray-400">
                                    {totals.discAmt.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Tax / NBT Levies</span>
                            <div className="flex items-center gap-1">
                                <input type="text" name="taxPer" value={formData.taxPer} onChange={handleInput} placeholder="T" className="w-10 h-7 bg-white border border-gray-200 px-1 text-center text-[11px] font-mono rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]" />
                                <input type="text" name="nbtPer" value={formData.nbtPer} onChange={handleInput} placeholder="N" className="w-10 h-7 bg-white border border-gray-200 px-1 text-center text-[11px] font-mono rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]" />
                                <div className="w-24 h-7 bg-gray-50 border border-gray-100 rounded-[5px] flex items-center justify-end px-2 text-[12px] font-mono text-gray-400">
                                    {(totals.taxAmt + totals.nbtAmt).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Manual Adj.</span>
                            <div className="flex items-center gap-1">
                                <select name="adjType" value={formData.adjType} onChange={handleInput} className="w-12 h-7 bg-white border border-gray-200 text-[10px] rounded-[5px] outline-none shadow-sm cursor-pointer">
                                    <option value="">±</option>
                                    <option value="Add">+</option>
                                    <option value="Less">-</option>
                                </select>
                                <input type="text" name="adjAmt" value={formData.adjAmt} onChange={handleInput} className="w-24 h-7 bg-white border border-gray-200 px-2 text-right text-[12px] font-mono font-bold rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]" />
                            </div>
                        </div>
                        <div className="h-[1px] bg-gray-100 my-1" />
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                            <span className="text-[13px] font-black text-slate-900 uppercase">Net Liability</span>
                            <div className="text-[18px] font-mono font-black text-blue-700 tracking-tighter">
                                {totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Archived GRN Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter archived GRNs..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Doc No</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Supplier Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map((o, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleSelectRow(o.docNo)}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-bold text-gray-700">{o.docNo}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono font-bold text-gray-600 uppercase ">{o.date?.split('T')[0]}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{o.supplier}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">RETRIEVE</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && <tr><td colSpan="4" className="py-10 text-center text-gray-300 font-bold uppercase tracking-widest">Archive is empty</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showSupplierSearch} onClose={() => setShowSupplierSearch(false)} title="Supplier Directory Lookup" maxWidth="max-w-[650px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find supplier by legal name or code..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={supplierSearchQuery} onChange={(e) => setSupplierSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Legal Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.suppliers.filter(s => s.name?.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || s.code?.toLowerCase().includes(supplierSearchQuery.toLowerCase())).map((s) => (
                                        <tr key={s.code} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData(prev => ({ ...prev, suppCode: s.code?.trim() })); setShowSupplierSearch(false); setSupplierSearchQuery(''); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-black text-blue-700">{s.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{s.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {lookups.suppliers.filter(s => s.name?.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || s.code?.toLowerCase().includes(supplierSearchQuery.toLowerCase())).length === 0 && <tr><td colSpan="3" className="py-6 text-center text-gray-300 font-bold uppercase tracking-widest">No suppliers found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* ── Add Product Modal (Catalog) ──────────────────────────────────── */}
            <SimpleModal isOpen={showAddProductModal} onClose={() => { setShowAddProductModal(false); setProductSearchQuery(''); }} title="Inventory Acquisition Portal" maxWidth="max-w-[650px]">
                <div className="space-y-4 px-1 font-['Tahoma']">
                    <div className="flex items-center justify-between gap-4 bg-slate-50/80 p-3 rounded-xl border border-gray-100 mb-2">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex-1 max-w-[400px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Inventory"
                                    className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-white shadow-sm font-medium"
                                    value={productSearchQuery}
                                    onChange={async (e) => {
                                        const val = e.target.value; setProductSearchQuery(val);
                                        if (val.length >= 2) { try { const r = await grnService.searchProducts(val); setLookups(prev => ({ ...prev, products: r })); } catch (_) {} }
                                        else if (val.length === 0) { const init = await grnService.getLookups(formData.company); setLookups(prev => ({ ...prev, products: init.products })); }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowItemMasterModal(true)}
                            className="h-10 px-5 bg-[#2bb744] text-white text-[12px] font-black rounded-lg hover:bg-[#259b3a] transition-all flex items-center gap-2 border-none shadow-md shadow-green-100 active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={14} /> CREATE NEW ITEM
                        </button>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="max-h-[420px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                                    <tr>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Item Description</th>
                                        <th className="px-6 py-4 text-right">Base Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.products || []).map(p => (
                                        <tr key={p.code}
                                            onClick={() => {
                                                setEntry(prev => ({
                                                    ...prev,
                                                    prodCode: p.code, prodName: p.name, unit: p.unit || '',
                                                    packSize: p.packSize || 1,
                                                    cost: parseFloat(p.price || 0).toFixed(2),
                                                    selling: parseFloat(p.sellingPrice || 0).toFixed(2),
                                                    qty: prev.qty || '',
                                                    amount: ((parseFloat(prev.qty) || 0) * parseFloat(p.price || 0)).toFixed(2)
                                                }));
                                                setShowProductQtyModal(true);
                                            }}
                                            className={`group hover:bg-blue-50/50 cursor-pointer transition-all duration-200 ${
                                                entry.prodCode === p.code ? 'bg-blue-50/70' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 font-mono text-[13px] font-bold text-blue-600">{p.code}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-[13px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 max-w-[320px]">
                                                    {p.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-black text-gray-500">
                                                <span className="text-[10px] text-gray-300 mr-1">Rs.</span>
                                                {parseFloat(p.price || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* ── Line Item Configuration Modal (Quantity/Cost) ──────────────────────────────────── */}
            <SimpleModal
                isOpen={showProductQtyModal}
                onClose={() => setShowProductQtyModal(false)}
                title="Line Item Configuration"
                maxWidth="max-w-[450px]"
            >
                <div className="space-y-4 px-1 py-1 font-['Tahoma']">
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                    Unit Price <span className="text-blue-500 font-mono">LKR</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="cost" 
                                    value={entry.cost} 
                                    onChange={handleEntryInput}
                                    className="w-full h-12 border border-gray-300 px-5 text-right text-[16px] font-mono font-black rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-white" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                    Selling Price <span className="text-blue-500 font-mono">LKR</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="selling" 
                                    value={entry.selling} 
                                    onChange={handleEntryInput}
                                    className="w-full h-12 border border-gray-300 px-5 text-right text-[16px] font-mono font-black text-blue-600 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-white" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Received Qty</label>
                                <input 
                                    type="text" 
                                    name="qty" 
                                    value={entry.qty} 
                                    onChange={handleEntryInput}
                                    onKeyDown={e => { if (e.key === 'Enter') { addProduct(); setShowProductQtyModal(false); setShowAddProductModal(false); setProductSearchQuery(''); } }}
                                    className="w-full h-12 border border-blue-500 px-5 text-center text-[18px] font-mono font-black rounded-xl outline-none bg-blue-50/20 focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" 
                                    autoFocus 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Free Issue</label>
                                <input 
                                    type="text" 
                                    name="free" 
                                    value={entry.free} 
                                    onChange={handleEntryInput}
                                    className="w-full h-12 border border-gray-300 px-5 text-center text-[18px] font-mono font-black text-green-600 rounded-xl outline-none focus:border-blue-500 transition-all bg-white shadow-sm" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Valuation</span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-[12px] font-bold text-blue-500">LKR</span>
                                <span className="text-[26px] font-mono font-black text-slate-800 tracking-tight">
                                    {parseFloat(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => { addProduct(); setShowProductQtyModal(false); setShowAddProductModal(false); setProductSearchQuery(''); }}
                            className="h-11 px-8 bg-[#0285fd] text-white text-[13px] font-bold rounded-lg hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 border-none"
                        >
                            <Plus size={16} /> ADD TO LIST
                        </button>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showProductSearch} onClose={() => { setShowProductSearch(false); setProductSearchQuery(''); }} title="Global Itemized Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Scan items by generic title or reference code..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={productSearchQuery} onChange={async (e) => { const val = e.target.value; setProductSearchQuery(val); if (val.length >= 2) { try { const results = await grnService.searchProducts(val); setLookups(prev => ({ ...prev, products: results })); } catch (err) { } } else if (val.length === 0) { const init = await grnService.getLookups(formData.company); setLookups(prev => ({ ...prev, products: init.products })); } }} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Acquisition Title</th>
                                        <th className="px-5 py-3 text-right">Cost</th>
                                        <th className="px-5 py-3 text-right">Selling</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.products || []).map(p => (
                                        <tr key={p.code} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { handleEntryInput({ target: { name: 'prodCode', value: p.code } }); setShowProductSearch(false); setProductSearchQuery(''); }}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-bold text-blue-600">{p.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{p.name}</td>
                                            <td className="px-5 py-3 text-right font-mono font-black text-gray-400">{parseFloat(p.price || 0).toFixed(2)}</td>
                                            <td className="px-5 py-3 text-right font-mono font-black text-blue-600">{parseFloat(p.sellingPrice || 0).toFixed(2)}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#0285fd] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#0073ff] shadow-md transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {lookups.products?.length === 0 && <tr><td colSpan="5" className="py-10 text-center text-gray-300 font-bold uppercase tracking-widest">No products available for capture</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showPOSearch} onClose={() => setShowPOSearch(false)} title="Select Purchase Order Lookup" maxWidth="max-w-[600px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter active PO documents..." value={poSearchQuery} onChange={(e) => setPOSearchQuery(e.target.value)} className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Document ID</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.pos.filter(p => p.docNo.toLowerCase().includes(poSearchQuery.toLowerCase())).map((p) => (
                                        <tr key={p.docNo} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleSelectPO(p.docNo)}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-bold text-gray-700">{p.docNo}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT ORDER</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {lookups.pos.length === 0 && <tr><td colSpan="2" className="py-10 text-center text-gray-300 font-bold uppercase tracking-widest">No active orders available</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Save & Apply GRN" message={`Are you sure you want to Save and Apply GRN document ${formData.docNo}?`} loading={isApplying} confirmText="Apply GRN" />

            {/* Date Selection Modal */}
            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData[datePickerField]}
            />

            {/* Payment Method Modal */}
            <SimpleModal
                isOpen={showPayMethodSearch}
                onClose={() => {
                    setShowPayMethodSearch(false);
                    setPayMethodSearchQuery('');
                }}
                title="Payment Method Lookup"
                maxWidth="max-w-[450px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Filter payment methods..."
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={payMethodSearchQuery}
                                onChange={(e) => setPayMethodSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Method Title</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.paymentMethods || [])
                                        .filter(m => !payMethodSearchQuery || m.name.toLowerCase().includes(payMethodSearchQuery.toLowerCase()) || m.code.toLowerCase().includes(payMethodSearchQuery.toLowerCase()))
                                        .map(m => (
                                            <tr key={m.code} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                                setFormData(prev => ({ ...prev, payType: m.code }));
                                                setShowPayMethodSearch(false);
                                                setPayMethodSearchQuery('');
                                            }}>
                                                <td className="px-5 py-3 font-mono text-[12px] font-bold text-gray-700">{m.code}</td>
                                                <td className="px-5 py-3 text-[12px] font-mono font-bold text-gray-600 uppercase group-hover:text-blue-600">{m.name}</td>
                                            </tr>
                                        ))}
                                    {(lookups.paymentMethods || []).length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-6 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No methods found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal
                isOpen={showExpenseSearch}
                onClose={() => setShowExpenseSearch(false)}
                title="Expense Account Lookup"
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Filter ledger accounts..."
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Account Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr>
                                        <td colSpan="2" className="text-center py-6 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No accounts configured</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            </SimpleModal>

            {/* Product Master Creation Modal (Quick Create) */}
            <SimpleModal
                isOpen={showItemMasterModal}
                onClose={() => setShowItemMasterModal(false)}
                title="Product Master Creation"
                maxWidth="max-w-[500px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={() => setShowItemMasterModal(false)} className="px-6 h-9 bg-white text-gray-500 text-[13px] font-bold rounded-[5px] border border-gray-300 hover:bg-gray-50 transition-all active:scale-95 font-tahoma">CANCEL</button>
                        <button onClick={handleCreateProduct} disabled={isCreatingProduct} className="px-8 h-9 bg-[#2bb744] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-50 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none font-tahoma">
                            {isCreatingProduct ? 'CREATING...' : 'CREATE PRODUCT'}
                        </button>
                    </div>
                }
            >
                <div className="py-2 px-1 font-['Tahoma'] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Product Code</label>
                            <input type="text" value={productMasterData.code} onChange={e => setProductMasterData({...productMasterData, code: e.target.value})} className="w-full h-10 border border-gray-300 rounded-lg px-4 text-[13px] outline-none focus:border-[#0285fd] bg-white font-mono uppercase shadow-sm" placeholder="" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Unit of Measure</label>
                            <input type="text" value={productMasterData.unit} onChange={e => setProductMasterData({...productMasterData, unit: e.target.value})} className="w-full h-10 border border-gray-300 rounded-lg px-4 text-[13px] outline-none focus:border-[#0285fd] bg-white shadow-sm" placeholder="Nos" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Product Description</label>
                        <input type="text" value={productMasterData.name} onChange={e => setProductMasterData({...productMasterData, name: e.target.value})} className="w-full h-10 border border-gray-300 rounded-lg px-4 text-[13px] outline-none focus:border-[#0285fd] bg-white uppercase shadow-sm font-bold" placeholder="" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Purchase Price</label>
                            <input type="text" value={productMasterData.purchasePrice} onChange={e => setProductMasterData({...productMasterData, purchasePrice: e.target.value})} className="w-full h-10 border border-gray-300 rounded-lg px-4 text-right text-[13px] font-mono outline-none focus:border-[#0285fd] bg-white shadow-sm" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Selling Price</label>
                            <input type="text" value={productMasterData.sellingPrice} onChange={e => setProductMasterData({...productMasterData, sellingPrice: e.target.value})} className="w-full h-10 border border-gray-300 rounded-lg px-4 text-right text-[13px] font-mono outline-none focus:border-[#0285fd] bg-white shadow-sm" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Pack Size</label>
                            <input type="text" value={productMasterData.packSize} onChange={e => setProductMasterData({...productMasterData, packSize: e.target.value})} className="w-full h-10 border border-gray-300 rounded-lg px-4 text-center text-[13px] font-mono outline-none focus:border-[#0285fd] bg-white shadow-sm" placeholder="1" />
                        </div>
                    </div>
                    <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/50 flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-relaxed">System Defaults: Category (1) and Department (1) will be automatically assigned to this record.</p>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default GRNBoard;
