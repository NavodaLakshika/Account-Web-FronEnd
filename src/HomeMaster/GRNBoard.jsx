import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, ChevronDown, CheckCircle, Trash2, XCircle, Save, X, RotateCcw, ChevronLeft, ChevronRight, ClipboardList, Plus } from 'lucide-react';
import { grnService } from '../services/grn.service';
import { toast } from 'react-hot-toast';

import ItemMasterBoard from './ItemMasterBoard';

const GRNBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [], pos: [] });
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
    const [viewDate, setViewDate] = useState(new Date());
    const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [poSearchQuery, setPOSearchQuery] = useState('');
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

    const qtyRef = useRef(null);

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
            setLookups(data);
        } catch (error) {
            toast.error('Failed to load suppliers/products.');
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await grnService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            toast.error('Failed to generate document number.');
        }
    };

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dateStr = selectedDate.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, [datePickerField]: dateStr }));
        setShowDatePicker(false);
    };

    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    }, [viewDate]);

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
        if (!entry.prodCode) return toast.error('Select a Product.');
        if (!entry.qty || parseFloat(entry.qty) <= 0) return toast.error('Enter valid Quantity.');

        setProducts([...products, { ...entry }]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', free: '', cost: '', selling: '', amount: '0.00' });
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
        if (!formData.suppCode) return toast.error('Select Supplier.');
        if (products.length === 0) return toast.error('No products entered.');
        const payload = preparePayload();
        try {
            await grnService.save(payload);
            toast.success('Draft saved successfully.');
        } catch (error) { toast.error(error.toString()); }
    };

    const handleApply = async () => {
        if (!formData.suppCode) return toast.error('Select Supplier.');
        if (products.length === 0) return toast.error('No products entered.');
        setShowConfirmModal(true);
    };

    const confirmApply = async () => {
        setIsApplying(true);
        const payload = preparePayload();
        try {
            await grnService.apply(payload);
            toast.success('GRN Applied successfully.');
            handleClear();
            setShowConfirmModal(false);
        } catch (error) { toast.error(error.toString()); } finally { setIsApplying(false); }
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
            toast.success(`Purchase Order ${poNo} loaded.`);
        } catch (error) { toast.error('Failed to fetch PO details.'); }
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
        } catch (error) { toast.error('Failed to load saved GRNs.'); }
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
        } catch (error) { toast.error('Failed to fetch order details.'); }
    };

    const currentSupplierName = useMemo(() => {
        if (!formData.suppCode) return 'Select Supplier...';
        const s = lookups.suppliers.find(x => x.code?.trim().toUpperCase() === formData.suppCode.trim().toUpperCase());
        return s ? s.name : formData.suppCode;
    }, [formData.suppCode, lookups.suppliers]);

    return (
        <>
            <SimpleModal
                isOpen={isOpen} onClose={onClose} title="Good Received Note (GRN)" maxWidth="max-w-[1000px]"
                footer={
                    <div className="flex justify-between items-center w-full px-2">
                        <button onClick={handleClear} className="px-6 h-10 bg-white text-orange-500 text-sm font-bold rounded-md border border-orange-500 hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2"><RotateCcw size={14} /> Clear</button>
                        <div className="flex gap-3">
                            <button onClick={handleSaveDraft} className="px-6 h-10 bg-white text-[#0078d4] text-sm font-bold rounded-md border border-[#0078d4] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"><Save size={14} /> Save Draft</button>
                            <button onClick={handleApply} disabled={isApplying} className="px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">{isApplying ? <Search className="animate-spin" size={14} /> : <CheckCircle size={14} />} Save & Apply</button>
                            <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none"><X size={14} /> Exit</button>
                        </div>
                    </div>
                }
            >
            <div className="space-y-4 p-1 overflow-y-auto no-scrollbar font-['Inter']">
                <div className="bg-white p-3 border border-gray-200 rounded-sm shadow-sm space-y-3">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-3">
                        {/* Row 1: Doc No, Date, Exp On */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-14 shrink-0 whitespace-nowrap">Doc No</label>
                            <div className="flex-1 flex gap-1 items-center min-w-0">
                                <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} className="flex-1 h-7 border border-[#0078d4]/30 px-2 text-[12px] font-bold text-[#000080] bg-blue-50/20 rounded-sm outline-none w-full min-w-0" />
                                <button onClick={handleSearchClick} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm shrink-0"><Search size={14} /></button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-2 pl-4">
                            <label className="text-[12px] font-bold text-gray-700 w-10 shrink-0 whitespace-nowrap">Date</label>
                            <div className="flex-1 flex gap-1 items-center min-w-0">
                                <input type="text" readOnly value={formData.grnDate} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-gray-700 bg-gray-50 rounded-sm outline-none cursor-pointer w-full min-w-0" onClick={() => { setDatePickerField('grnDate'); setViewDate(new Date(formData.grnDate)); setShowDatePicker(true); }} />
                                <button onClick={() => { setDatePickerField('grnDate'); setViewDate(new Date(formData.grnDate)); setShowDatePicker(true); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm shrink-0"><Calendar size={14} /></button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-2 pl-4">
                            <label className="text-[12px] font-bold text-gray-700 w-16 shrink-0 whitespace-nowrap">Exp. On</label>
                            <div className="flex-1 flex gap-1 items-center min-w-0">
                                <input type="text" readOnly value={formData.expectedDate} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-gray-700 bg-gray-50 rounded-sm outline-none cursor-pointer w-full min-w-0" onClick={() => { setDatePickerField('expectedDate'); setViewDate(new Date(formData.expectedDate)); setShowDatePicker(true); }} />
                                <button onClick={() => { setDatePickerField('expectedDate'); setViewDate(new Date(formData.expectedDate)); setShowDatePicker(true); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm shrink-0"><Calendar size={14} /></button>
                            </div>
                        </div>

                        {/* Row 2: Supplier | PO Number | Payment */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-14 shrink-0 whitespace-nowrap">Supplier</label>
                            <div className="flex-1 flex gap-1 items-center min-w-0">
                                <input type="text" readOnly value={currentSupplierName}
                                       className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#b91c1c] bg-gray-50 rounded-sm outline-none overflow-hidden text-ellipsis w-full min-w-0" />
                                <button onClick={() => setShowSupplierSearch(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm shrink-0"><Search size={14} /></button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-2 pl-4">
                            <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0 whitespace-nowrap">PO Number</label>
                            <div className="flex-1 flex gap-1 items-center min-w-0">
                                <input type="text" readOnly value={formData.poNo || 'Select PO...'} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#000080] bg-blue-50/20 rounded-sm outline-none overflow-hidden text-ellipsis w-full min-w-0" />
                                <button onClick={() => setShowPOSearch(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm shrink-0"><ClipboardList size={14} /></button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-2 pl-4">
                            <label className="text-[12px] font-bold text-gray-700 w-16 shrink-0 whitespace-nowrap">Payment</label>
                            <select name="payType" value={formData.payType} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] rounded-sm bg-white outline-none font-bold text-[#000080] w-full min-w-0">
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Credit">Credit</option>
                            </select>
                        </div>

                        {/* Row 3: Supp Inv | Amount | Checkboxes */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-bold text-gray-700 w-14 shrink-0 whitespace-nowrap">Supp. Inv.</label>
                            <input type="text" name="suppInv" value={formData.suppInv} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] rounded-sm bg-white outline-none focus:border-[#0078d4] w-full min-w-0" />
                        </div>
                        <div className="col-span-4 flex items-center gap-2 pl-4">
                            <label className="text-[12px] font-bold text-gray-700 w-12 shrink-0 whitespace-nowrap">Amount</label>
                            <input type="text" name="invAmount" value={formData.invAmount} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] text-right font-black text-gray-800 rounded-sm bg-white outline-none w-full min-w-0" />
                        </div>
                        <div className="col-span-4 flex items-center gap-3 pl-4 min-w-0">
                            <label className="flex items-center gap-1 cursor-pointer shrink-0">
                                <input type="checkbox" name="consignmentBasis" checked={formData.consignmentBasis} onChange={handleInput} className="w-4 h-4 text-[#0078d4]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">CONSIGNMENT BASIS</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer shrink-0">
                                <input type="checkbox" name="acceptOtherSupp" checked={formData.acceptOtherSupp} onChange={handleInput} className="w-4 h-4 text-[#0078d4]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">OTHER SUP. PROD</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border border-[#0078d4]/20 rounded bg-white shadow-sm flex flex-col min-h-[220px]">
                    {/* Table header — columns exactly match product rows */}
                    <div className="flex bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase items-center">
                        <div className="flex-[2.5] py-2 px-3 border-r flex items-center justify-between">
                            <span>Product Name</span>
                            <button
                                onClick={() => {
                                    setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', free: '', cost: '', selling: '', amount: '0.00' });
                                    grnService.getLookups(formData.company).then(data => setLookups(prev => ({ ...prev, products: data.products })));
                                    setShowAddProductModal(true);
                                }}
                                className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm shrink-0"
                                title="Add Product"
                            ><Plus size={14} /></button>
                        </div>
                        <div className="w-16 py-2 px-3 border-r text-center">Unit</div>
                        <div className="w-24 py-2 px-3 border-r text-right">Cost</div>
                        <div className="w-24 py-2 px-3 border-r text-right">Selling</div>
                        <div className="w-16 py-2 px-3 border-r text-center">Qty</div>
                        <div className="w-16 py-2 px-3 border-r text-center">Free</div>
                        <div className="w-28 py-2 px-3 text-right">Amount</div>
                        <div className="w-8"></div>
                    </div>
                    <div className="flex-1 bg-white overflow-y-auto max-h-[160px]">
                        {products.map((p, idx) => (
                            <div key={idx} className="flex border-b border-gray-100 text-[12px] font-semibold text-gray-600 items-center">
                                <div className="flex-[2.5] py-1.5 px-3 border-r truncate">{p.prodName} [{p.prodCode}]</div>
                                <div className="w-16 py-1.5 px-3 border-r text-center">{p.unit}</div>
                                <div className="w-24 py-1.5 px-3 border-r text-right font-mono">{parseFloat(p.cost).toFixed(2)}</div>
                                <div className="w-24 py-1.5 px-3 border-r text-right font-mono text-blue-600">{parseFloat(p.selling).toFixed(2)}</div>
                                <div className="w-16 border-r px-1 py-1">
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
                                        className="w-full h-6 bg-transparent text-center text-[12px] font-black outline-none focus:bg-blue-50/60 border border-transparent focus:border-gray-300 rounded-sm"
                                    />
                                </div>
                                <div className="w-16 border-r px-1 py-1">
                                    <input
                                        type="text"
                                        value={p.free}
                                        onChange={(e) => {
                                            setProducts(products.map((item, i) =>
                                                i === idx ? { ...item, free: e.target.value } : item
                                            ));
                                        }}
                                        className="w-full h-6 bg-transparent text-center text-[12px] font-bold outline-none text-green-700 focus:bg-blue-50/60 border border-transparent focus:border-gray-300 rounded-sm"
                                    />
                                </div>
                                <div className="w-28 py-1.5 px-3 text-right font-bold text-[#000080]">{parseFloat(p.amount).toFixed(2)}</div>
                                <div className="w-8 flex justify-center"><button onClick={() => setProducts(products.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6 items-start">
                    <div className="col-span-12 lg:col-span-7 space-y-3">
                        <textarea name="comment" value={formData.comment} onChange={handleInput} placeholder="Add comments..." className="w-full h-[80px] border border-gray-300 p-2 text-[12px] outline-none resize-none rounded-sm bg-gray-50/30"></textarea>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-24">Expense Ac.</label>
                                <select className="flex-1 h-7 border border-gray-300 text-[12px] outline-none"><option>Select Account</option></select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700">Other Charges</label>
                                <input type="text" defaultValue="0.00" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] text-right" />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-5 bg-blue-50/40 p-3 border border-[#0078d4]/20 rounded-sm space-y-2">
                        {/* Total row */}
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-gray-700">total</span>
                            <div className="flex items-center gap-1 w-48">
                                <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">Qty: <b>{totals.sumQty}</b> Free: <b>{totals.sumFree}</b></span>
                                <input type="text" readOnly value={totals.sumTotal.toFixed(2)} className="flex-1 h-6 bg-white border border-gray-300 px-2 text-right font-bold text-[#000080] min-w-0" />
                            </div>
                        </div>
                        {/* Discount row */}
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-gray-700">Discount</span>
                            <div className="flex items-center gap-1 w-48">
                                <input type="text" name="discPer" value={formData.discPer} onChange={handleInput} className="w-10 h-6 border-b border-gray-300 bg-transparent text-center outline-none shrink-0" />
                                <span className="text-[10px] font-black text-gray-400 shrink-0">%</span>
                                <input type="text" readOnly value={totals.discAmt.toFixed(2)} className="flex-1 h-6 border bg-white px-2 text-right min-w-0" />
                            </div>
                        </div>
                        {/* Tax / NBT row */}
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-gray-700">Tax / NBT</span>
                            <div className="flex items-center gap-1 w-48">
                                <input type="text" name="taxPer" value={formData.taxPer} onChange={handleInput} className="w-8 h-6 border-b border-gray-300 bg-transparent text-center outline-none shrink-0" />
                                <input type="text" name="nbtPer" value={formData.nbtPer} onChange={handleInput} className="w-8 h-6 border-b border-gray-300 bg-transparent text-center outline-none shrink-0" />
                                <input type="text" readOnly value={(totals.taxAmt + totals.nbtAmt).toFixed(2)} className="flex-1 h-6 border bg-white px-2 text-right min-w-0" />
                            </div>
                        </div>
                        {/* Adjustment row */}
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-gray-700">Adjustment</span>
                            <div className="flex items-center gap-1 w-48">
                                <select name="adjType" value={formData.adjType} onChange={handleInput} className="w-14 h-6 text-[10px] border border-gray-300 bg-white outline-none shrink-0">
                                    <option value="">None</option>
                                    <option value="Add">Add</option>
                                    <option value="Less">Less</option>
                                </select>
                                <input type="text" name="adjAmt" value={formData.adjAmt} onChange={handleInput} className="flex-1 h-6 border bg-white px-2 text-right min-w-0" />
                            </div>
                        </div>
                        <div className="h-[1px] bg-blue-200 my-1" />
                        {/* NET AMOUNT row */}
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-black text-[#000080] uppercase tracking-tighter">NET AMOUNT</span>
                            <div className="w-48 h-8 bg-white border border-[#0078d4] flex items-center px-1 shadow-sm">
                                <span className="text-[10px] font-black text-gray-300 pr-1 shrink-0">Rs.</span>
                                <input type="text" readOnly value={totals.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="w-full text-right text-[16px] font-black text-[#0078d4] outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Select Saved GRN" maxWidth="max-w-[600px]">
                <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                    <table className="w-full text-[12px] border-collapse">
                        <thead className="bg-gray-100 text-gray-600 border-b">
                            <tr><th className="p-2 text-left">Doc No</th><th className="p-2 text-left">Date</th><th className="p-2 text-left">Supplier</th><th className="w-16"></th></tr>
                        </thead>
                        <tbody>
                            {orders.map((o, i) => (
                                <tr key={i} className="border-b hover:bg-blue-50 cursor-pointer" onClick={() => handleSelectRow(o.docNo)}>
                                    <td className="p-2 font-bold text-[#000080]">{o.docNo}</td>
                                    <td className="p-2">{o.date?.split('T')[0]}</td>
                                    <td className="p-2">{o.supplier}</td>
                                    <td className="p-2 text-[#0078d4] font-bold">Select</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showSupplierSearch} onClose={() => setShowSupplierSearch(false)} title="Select Supplier" maxWidth="max-w-[500px]">
                <div className="space-y-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Search supplier..." value={supplierSearchQuery} onChange={(e) => setSupplierSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-md outline-none text-sm" autoFocus /></div>
                    <div className="max-h-[350px] overflow-y-auto border rounded-md no-scrollbar">
                        {lookups.suppliers.filter(s => s.name?.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || s.code?.toLowerCase().includes(supplierSearchQuery.toLowerCase())).map((s) => (
                            <div key={s.code} onClick={() => { setFormData(prev => ({ ...prev, suppCode: s.code?.trim() })); setShowSupplierSearch(false); setSupplierSearchQuery(''); }} className="p-3 border-b hover:bg-blue-50 cursor-pointer flex justify-between items-center group"><div><div className="text-sm font-bold text-gray-800 group-hover:text-[#0078d4]">{s.name}</div><div className="text-[11px] text-gray-400 uppercase">{s.code}</div></div><div className="text-xs font-bold text-[#0078d4] opacity-0 group-hover:opacity-100 uppercase transition-opacity">Select →</div></div>
                        ))}
                    </div>
                </div>
            </SimpleModal>

            {/* ── Add Product Modal ──────────────────────────────────── */}
            <SimpleModal isOpen={showAddProductModal} onClose={() => { setShowAddProductModal(false); setProductSearchQuery(''); }} title="Add Product to GRN" maxWidth="max-w-[580px]">
                <div className="space-y-3 px-1">
                    {/* Product search */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Search 58,000+ products by code or name..."
                                className="w-full h-9 pl-9 pr-4 border border-gray-200 rounded-md outline-none text-[12px]"
                                value={productSearchQuery}
                                onChange={async (e) => {
                                    const val = e.target.value; setProductSearchQuery(val);
                                    if (val.length >= 2) { try { const r = await grnService.searchProducts(val); setLookups(prev => ({ ...prev, products: r })); } catch (_) {} }
                                    else if (val.length === 0) { const init = await grnService.getLookups(formData.company); setLookups(prev => ({ ...prev, products: init.products })); }
                                }}
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={() => setShowItemMasterModal(true)}
                            className="px-3 h-9 bg-green-600 text-white text-[11px] font-bold rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus size={14} /> New
                        </button>
                    </div>
                    {/* Product list */}
                    <div className="border border-gray-100 rounded-md overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-[11px]">
                                <thead className="bg-slate-50 sticky top-0 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase">Code</th>
                                        <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase">Product Name</th>
                                        <th className="px-3 py-2 text-right font-bold text-gray-500 uppercase">Cost</th>
                                        <th className="px-3 py-2 text-right font-bold text-gray-500 uppercase">Selling</th>
                                    </tr>
                                </thead>
                                <tbody>
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
                                                setProductSearchQuery('');
                                            }}
                                            className={`border-b border-gray-50 cursor-pointer transition-colors ${
                                                entry.prodCode === p.code ? 'bg-orange-50 border-l-2 border-l-orange-400' : 'hover:bg-orange-50/50'
                                            }`}
                                        >
                                            <td className="px-3 py-1.5 font-bold text-orange-600">{p.code}</td>
                                            <td className="px-3 py-1.5 text-gray-700 font-medium">{p.name}</td>
                                            <td className="px-3 py-1.5 text-right font-bold text-gray-600">{parseFloat(p.price || 0).toFixed(2)}</td>
                                            <td className="px-3 py-1.5 text-right font-bold text-blue-600">{parseFloat(p.sellingPrice || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Selected product detail + qty entry */}
                    {entry.prodCode && (
                        <div className="bg-blue-50/40 border border-[#0078d4]/20 rounded-md p-3 space-y-2">
                            <div className="text-[11px] font-black text-[#000080] uppercase tracking-tight">
                                {entry.prodName} <span className="text-orange-500">[{entry.prodCode}]</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Cost</label>
                                    <input type="text" name="cost" value={entry.cost} onChange={handleEntryInput}
                                        className="h-7 border border-gray-300 px-2 text-right text-[12px] font-bold rounded-sm outline-none focus:border-[#0078d4]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Selling</label>
                                    <input type="text" name="selling" value={entry.selling} onChange={handleEntryInput}
                                        className="h-7 border border-gray-300 px-2 text-right text-[12px] font-bold text-blue-600 rounded-sm outline-none focus:border-[#0078d4]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Qty</label>
                                    <input type="text" name="qty" value={entry.qty} onChange={handleEntryInput}
                                        onKeyDown={e => { if (e.key === 'Enter') { addProduct(); setShowAddProductModal(false); setProductSearchQuery(''); } }}
                                        className="h-7 border border-[#0078d4]/50 px-2 text-center text-[12px] font-black rounded-sm outline-none focus:border-[#0078d4] bg-blue-50/30" autoFocus />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Free</label>
                                    <input type="text" name="free" value={entry.free} onChange={handleEntryInput}
                                        className="h-7 border border-gray-300 px-2 text-center text-[12px] font-bold text-green-600 rounded-sm outline-none focus:border-[#0078d4]" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-[11px] text-gray-500">Amount: <strong className="text-[#b91c1c] text-[13px]">{parseFloat(entry.amount || 0).toFixed(2)}</strong></span>
                                <button
                                    onClick={() => { addProduct(); setShowAddProductModal(false); setProductSearchQuery(''); }}
                                    className="px-5 h-8 bg-orange-500 text-white text-[12px] font-black rounded-md hover:bg-orange-600 transition-colors active:scale-95 flex items-center gap-2"
                                >
                                    + Add to GRN
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showProductSearch} onClose={() => { setShowProductSearch(false); setProductSearchQuery(''); }} title="Select Product" maxWidth="max-w-[600px]">
                <div className="space-y-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Search 58,000+ products..." className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-md outline-none text-sm" value={productSearchQuery} onChange={async (e) => { const val = e.target.value; setProductSearchQuery(val); if (val.length >= 2) { try { const results = await grnService.searchProducts(val); setLookups(prev => ({ ...prev, products: results })); } catch (err) { } } else if (val.length === 0) { const init = await grnService.getLookups(formData.company); setLookups(prev => ({ ...prev, products: init.products })); } }} autoFocus /></div>
                    <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-md no-scrollbar">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr><th className="px-4 py-2.5 text-left font-bold text-gray-600 text-[11px] uppercase">Code</th><th className="px-4 py-2.5 text-left font-bold text-gray-600 text-[11px] uppercase">Name</th><th className="px-4 py-2.5 text-right font-bold text-gray-600 text-[11px] uppercase">Cost</th><th className="px-4 py-2.5 text-right font-bold text-gray-600 text-[11px] uppercase">Selling</th><th className="px-4 py-2.5 text-center font-bold text-gray-600 text-[11px] uppercase">Action</th></tr>
                            </thead>
                            <tbody>
                                {(lookups.products || []).map(p => (<tr key={p.code} className="border-t border-gray-50 hover:bg-orange-50 transition-colors cursor-pointer" onClick={() => { handleEntryInput({ target: { name: 'prodCode', value: p.code } }); setShowProductSearch(false); setProductSearchQuery(''); }}><td className="px-4 py-2 font-bold text-orange-600">{p.code}</td><td className="px-4 py-2 text-gray-700 font-medium">{p.name}</td><td className="px-4 py-2 text-right font-bold text-gray-600">{parseFloat(p.price || 0).toFixed(2)}</td><td className="px-4 py-2 text-right font-bold text-blue-600">{parseFloat(p.sellingPrice || 0).toFixed(2)}</td><td className="px-4 py-2 text-center text-orange-500 font-bold uppercase text-[10px]">Select</td></tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showPOSearch} onClose={() => setShowPOSearch(false)} title="Select Purchase Order" maxWidth="max-w-[500px]">
                <div className="space-y-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Filter POs..." value={poSearchQuery} onChange={(e) => setPOSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-md outline-none text-sm" /></div>
                    <div className="max-h-[350px] overflow-y-auto border rounded-md no-scrollbar">
                        {lookups.pos.filter(p => p.docNo.toLowerCase().includes(poSearchQuery.toLowerCase())).map((p) => (
                            <div key={p.docNo} onClick={() => handleSelectPO(p.docNo)} className="p-3 border-b hover:bg-blue-50 cursor-pointer flex justify-between items-center group"><span className="font-bold text-slate-700 group-hover:text-[#0078d4]">{p.docNo}</span><span className="text-xs font-bold text-[#0078d4] opacity-0 group-hover:opacity-100 uppercase tracking-tight">Select Order</span></div>
                        ))}
                    {(lookups.pos.length === 0) && <div className="p-8 text-center text-gray-400">No open Purchase Orders found.</div>}
                    </div>
                </div>
            </SimpleModal>

            <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Save & Apply GRN" message={`Are you sure you want to Save and Apply GRN document ${formData.docNo}?`} loading={isApplying} confirmText="Apply GRN" />

            {/* Date Selection Modal */}
            <SimpleModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} title={`Select ${datePickerField === 'grnDate' ? 'GRN Date' : 'Expected Date'}`} maxWidth="max-w-[320px]">
                <div className="p-1 px-2">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-all active:scale-90"><ChevronLeft size={18} /></button>
                        <div className="flex gap-2"><select value={viewDate.getMonth()} onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))} className="text-[14px] font-bold text-slate-700 outline-none bg-transparent hover:text-[#0078d4] cursor-pointer appearance-none px-1">{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i} value={i}>{m}</option>)}</select><select value={viewDate.getFullYear()} onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))} className="text-[14px] font-bold text-slate-700 outline-none bg-transparent hover:text-[#0078d4] cursor-pointer appearance-none px-1">{Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-all active:scale-90"><ChevronRight size={18} /></button>
                    </div>
                    <div className="grid grid-cols-7 mb-2">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (<div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d}</div>))}</div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            if (!day) return <div key={i} className="h-8" />;
                            const isSelected = formData[datePickerField] === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split('T')[0];
                            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
                            return (
                                <button key={i} onClick={() => handleDateSelect(day)} className={`h-8 w-8 rounded-full flex items-center justify-center text-[12px] transition-all ${isSelected ? 'bg-[#0078d4] text-white font-bold' : isToday ? 'bg-blue-50 text-[#0078d4] font-bold border border-blue-200' : 'hover:bg-slate-100 text-slate-600'}`}>{day}</button>
                            );
                        })}
                    </div>
                </div>
            </SimpleModal>

            {/* Closing the MAIN GRN SimpleModal opened at line 320 */}
            </SimpleModal>

            <ItemMasterBoard 
                isOpen={showItemMasterModal} 
                onClose={() => setShowItemMasterModal(false)} 
            />
        </>
    );
};

export default GRNBoard;
