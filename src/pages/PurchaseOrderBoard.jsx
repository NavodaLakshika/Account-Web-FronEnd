import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import FeatureLockedModal from '../components/modals/FeatureLockedModal';
import { Search, Calendar, Plus, Trash2, Save, RotateCcw, Loader2, FileText, CheckCircle } from 'lucide-react';
import { purchOrderService } from '../services/purchOrder.service';
import { paymentMethodService } from '../services/paymentMethod.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const PurchaseOrderBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [], paymentMethods: [] });

    const getInitialFormData = () => ({
        docNo: '',
        company: '',
        createUser: '',
        postDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date().toISOString().split('T')[0],
        vendorId: '',
        payType: '',
        remarks: '',
        reference: '',
        comment: '',
        taxPer: '0',
        nbtAmnt: 0
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSupplierSearch, setShowSupplierSearch] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [showPayMethodSearch, setShowPayMethodSearch] = useState(false);
    const [payMethodSearchQuery, setPayMethodSearchQuery] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('postDate');
    const [showProductMaster, setShowProductMaster] = useState(false);
    const [showProductQtyModal, setShowProductQtyModal] = useState(false);
    const [productMasterData, setProductMasterData] = useState({
        code: '', name: '', unit: 'Nos', purchasePrice: '', sellingPrice: '', packSize: 1
    });
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [isAddProductLocked, setIsAddProductLocked] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAddProductLocked(localStorage.getItem('isAddProductLocked_PO') === 'true');
        }
    }, [isOpen]);

    const [entry, setEntry] = useState({
        prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', purchasePrice: '', amount: ''
    });

    const qtyRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: initCompany, userName: initUser } = getSessionData();
            setFormData(prev => ({ ...prev, company: initCompany, createUser: initUser }));
            fetchLookups(initCompany);
            generateDocNo(initCompany);
        }
    }, [isOpen]);

    const fetchLookups = async (company) => {
        try {
            const data = await purchOrderService.getLookups(company);
            const methods = await paymentMethodService.getAll(company).catch(() => []);
            setLookups(prev => ({ ...prev, ...data, paymentMethods: methods }));
        } catch (error) {
            showErrorToast('Failed to load suppliers/products.');
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await purchOrderService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            showErrorToast('Failed to generate document number.');
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEntryInput = (e) => {
        const { name, value } = e.target;
        let newEntry = { ...entry, [name]: value };

        if (name === 'prodCode' && value) {
            const prod = lookups.products.find(p => p.code === value);
            if (prod) {
                newEntry = {
                    ...newEntry,
                    prodName: prod.name,
                    unit: prod.unit || '',
                    packSize: prod.packSize || 1,
                    purchasePrice: prod.price?.toString() || '0'
                };
                setTimeout(() => qtyRef.current?.focus(), 50);
            }
        }

        if (name === 'qty' || name === 'purchasePrice') {
            const q = parseFloat(name === 'qty' ? value : newEntry.qty) || 0;
            const p = parseFloat(name === 'purchasePrice' ? value : newEntry.purchasePrice) || 0;
            newEntry.amount = (q * p).toFixed(2);
        }
        setEntry(newEntry);
    };

    const addProduct = () => {
        if (!entry.prodCode) return showErrorToast('Select a Product.');
        if (!entry.qty || parseFloat(entry.qty) <= 0) return showErrorToast('Enter valid Quantity.');
        setProducts([...products, { ...entry }]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', purchasePrice: '', amount: '' });
    };

    const removeProduct = (idx) => {
        setProducts(products.filter((_, i) => i !== idx));
    };

    const totals = useMemo(() => {
        const sum = products.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        const nbtAmtValue = parseFloat(formData.nbtAmnt) || 0;
        let taxPercent = 0;
        if (formData.taxPer.includes('%')) {
            taxPercent = parseFloat(formData.taxPer.replace('%', '')) || 0;
        } else {
            taxPercent = parseFloat(formData.taxPer) || 0;
        }
        const taxValue = (sum * nbtAmtValue / 100) + (sum * taxPercent / 100);
        const netAmount = sum + taxValue;
        return { sum, netAmount };
    }, [products, formData.nbtAmnt, formData.taxPer]);

    const handleClear = () => {
        setProducts([]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', purchasePrice: '', amount: '' });
        setFormData(prev => ({
            ...prev, vendorId: '', payType: '', remarks: '', reference: '', comment: '', taxPer: '0', nbtAmnt: 0
        }));
        generateDocNo(formData.company);
    };

    const handleSearch = async () => {
        try {
            const data = await purchOrderService.searchDocs(formData.company);
            setOrders(data || []);
            setShowSearchModal(true);
        } catch (error) {
            showErrorToast('Failed to load purchase orders.');
        }
    };

    const handleSelectOrder = async (docNo) => {
        try {
            const data = await purchOrderService.getOrder(docNo, formData.company);
            setFormData(prev => ({
                ...prev,
                docNo: data.header.doc_No || docNo,
                postDate: data.header.post_Date?.split('T')[0] || prev.postDate,
                expectedDate: data.header.expected_Date?.split('T')[0] || prev.expectedDate,
                vendorId: data.header.vendor_Id || '',
                payType: data.header.pay_Type || '',
                remarks: data.header.remarks || '',
                reference: data.header.reference || '',
                comment: data.header.comment || '',
                taxPer: data.header.taxPer || '0',
                nbtAmnt: data.header.nbtAmnt || 0
            }));
            setProducts(data.details.map(d => ({
                prodCode: d.prod_Code, prodName: d.prod_Name, unit: d.unit,
                packSize: d.pack_Size, qty: d.qty?.toString(),
                purchasePrice: d.purchase_Price?.toString(), amount: d.amount?.toString()
            })));
            setShowSearchModal(false);
            showSuccessToast("Order Loaded Successfully.");
        } catch (error) {
            showErrorToast(error.toString());
        }
    };

    const handleSave = async () => {
        if (!formData.vendorId) return showErrorToast('Select User/Supplier.');
        if (!formData.payType) return showErrorToast('Payment type has not been selected.');
        if (products.length === 0) return showErrorToast('No products entered.');
        const payload = preparePayload();
        try {
            const resp = await purchOrderService.save(payload);
            showSuccessToast(`Draft saved successfully (${resp.docNo}).`);
        } catch (error) {
            showErrorToast(error.toString());
        }
    };

    const handleApply = async () => {
        if (!formData.vendorId) return showErrorToast('Select User/Supplier.');
        if (!formData.payType) return showErrorToast('Payment type has not been selected.');
        if (products.length === 0) return showErrorToast('No products entered.');
        setShowConfirmModal(true);
    };

    const confirmApply = async () => {
        setIsApplying(true);
        const payload = preparePayload();
        try {
            const resp = await purchOrderService.apply(payload);
            showSuccessToast(`Record applied successfully (${resp.docNo}).`);
            handleClear();
            setShowConfirmModal(false);
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsApplying(false);
        }
    };

    const handleSelectSupplier = (supplier) => {
        setFormData(prev => ({ ...prev, vendorId: supplier.code }));
        setShowSupplierSearch(false);
        setSupplierSearchQuery('');
    };

    const handleSelectProduct = (product) => {
        setEntry({ ...entry, prodCode: product.code, prodName: product.name, unit: product.unit || '',
            packSize: product.packSize || 1, purchasePrice: product.price?.toString() || '0',
            amount: (1 * (product.price || 0)).toFixed(2)
        });
        setShowProductSearch(false);
        setProductSearchQuery('');
        setTimeout(() => qtyRef.current?.focus(), 50);
    };

    const handleDateSelect = (formattedDate) => {
        setFormData(prev => ({ ...prev, [datePickerField]: formattedDate }));
        setShowDatePicker(false);
    };

    const handleCreateProduct = async () => {
        if (!productMasterData.code || !productMasterData.name) {
            return showErrorToast('Code and Name are required.');
        }
        setIsCreatingProduct(true);
        try {
            await purchOrderService.createProduct({ ...productMasterData, createUser: formData.createUser });
            showSuccessToast('Product created successfully.');
            setShowProductMaster(false);
            setProductMasterData({ code: '', name: '', unit: 'Nos', purchasePrice: '', sellingPrice: '', packSize: 1 });
            const results = await purchOrderService.getLookups(formData.company);
            setLookups(prev => ({ ...prev, products: results.products }));
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsCreatingProduct(false);
        }
    };

    const preparePayload = () => ({
        docNo: formData.docNo,
        company: formData.company,
        createUser: formData.createUser,
        postDate: formData.postDate,
        expectedDate: formData.expectedDate,
        vendorId: formData.vendorId,
        payType: formData.payType,
        remarks: formData.remarks,
        reference: formData.reference,
        comment: formData.comment,
        total: totals.sum,
        taxPer: formData.taxPer,
        nbtAmnt: parseFloat(formData.nbtAmnt) || 0,
        netAmount: totals.netAmount,
        products: products.map((p, idx) => ({
            lnNo: idx + 1, prodCode: p.prodCode, prodName: p.prodName, unit: p.unit,
            packSize: p.packSize, qty: parseFloat(p.qty) || 0,
            purchasePrice: parseFloat(p.purchasePrice) || 0, amount: parseFloat(p.amount) || 0
        }))
    });

    const handleDelete = async () => {
        if (!formData.docNo) return;
        setShowDeleteConfirm(true);
    };

    const handleOpenAddProduct = () => {
        if (isAddProductLocked) { setShowLockModal(true); return; }
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', purchasePrice: '', amount: '0.00' });
        purchOrderService.getLookups(formData.company).then(data => setLookups(prev => ({ ...prev, products: data.products })));
        setShowAddProductModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await purchOrderService.delete(formData.docNo, formData.company);
            showSuccessToast('Record deleted successfully.');
            handleClear();
            setShowDeleteConfirm(false);
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <style>{`@keyframes toastProgress { 0% { width: 100%; } 100% { width: 0%; } }`}</style>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen} onClose={onClose}
                title="Purchase Order"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-4 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={handleDelete} className="px-6 py-2 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                            <button type="button" onClick={handleClear} className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleSave} className="px-6 py-2 border-2 border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button type="button" onClick={handleApply} disabled={isApplying} className={`px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isApplying ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} APPLY
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
                                    <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} onKeyDown={(e) => e.key === 'Enter' && handleSelectOrder(formData.docNo)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700" />
                                    <button onClick={handleSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.postDate} onClick={() => { setDatePickerField('postDate'); setShowDatePicker(true); }} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => { setDatePickerField('postDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Expected Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.expectedDate} onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Supplier</label>
                                <div className="relative">
                                    <input type="text" readOnly value={lookups.suppliers.find(s => s.code === formData.vendorId)?.name || ''} onClick={() => setShowSupplierSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowSupplierSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Method</label>
                                <div className="relative">
                                    <input type="text" readOnly value={lookups.paymentMethods?.find(m => m.code === formData.payType)?.name || formData.payType || ''} onClick={() => setShowPayMethodSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowPayMethodSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Brief Remarks</label>
                                <input type="text" name="remarks" value={formData.remarks} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">B.Ref / Shift</label>
                                <input type="text" name="reference" value={formData.reference} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-[3px] bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Selection Portfolio</span>
                            <button onClick={handleOpenAddProduct} className="h-7 px-3 bg-[#0285fd] text-white text-[10px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all flex items-center gap-1.5 border-none shadow-sm active:scale-95">
                                <Plus size={13} /> ADD PRODUCT
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
                                    {products.length === 0 ? (
                                        <tr><td colSpan="7" className="py-10 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No items allocated to this document</td></tr>
                                    ) : products.map((p, idx) => (
                                        <tr key={idx} className="text-[12px] font-bold text-gray-700 border-b border-gray-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-4 py-2.5 font-mono text-blue-700">{p.prodCode}</td>
                                            <td className="px-4 py-2.5 uppercase">{p.prodName}</td>
                                            <td className="px-3 py-2.5 text-center text-gray-400">{p.unit}</td>
                                            <td className="px-1 py-1">
                                                <input type="text" value={p.purchasePrice} onChange={(e) => {
                                                    const newPrice = e.target.value;
                                                    const newAmount = (parseFloat(p.qty) || 0) * (parseFloat(newPrice) || 0);
                                                    setProducts(products.map((item, i) => i === idx ? { ...item, purchasePrice: newPrice, amount: newAmount.toFixed(2) } : item));
                                                }} className="w-full h-8 border border-gray-200 rounded-[3px] text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2" />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input type="text" value={p.qty} onChange={(e) => {
                                                    const newQty = e.target.value;
                                                    const newAmount = (parseFloat(newQty) || 0) * (parseFloat(p.purchasePrice) || 0);
                                                    setProducts(products.map((item, i) => i === idx ? { ...item, qty: newQty, amount: newAmount.toFixed(2) } : item));
                                                }} className="w-full h-8 border border-gray-200 rounded-[3px] text-center text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-black">{parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-1 text-center">
                                                <button onClick={() => removeProduct(idx)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-full">
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
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Internal Remarks & Comments</label>
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
                                    <span className="text-[13px] font-medium text-gray-700">NBT Levy %</span>
                                    <input type="text" name="nbtAmnt" value={formData.nbtAmnt} onChange={handleInput} className="w-28 h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Tax Value %</span>
                                    <input type="text" name="taxPer" value={formData.taxPer} onChange={handleInput} className="w-28 h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                </div>
                                <div className="h-px bg-gray-200 my-1" />
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-[3px]">
                                    <span className="text-[14px] font-black text-gray-800 uppercase">Net Liability</span>
                                    <span className="text-[22px] font-mono font-black text-[#0285fd] tracking-tight">{totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Historical Document Directory" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Global Archive Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by document id..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className=" px-5 py-3">Reference ID</th>
                                    <th className=" px-5 py-3">Ledger Posting Date</th>
                                    <th className="text-right px-5 py-3">Interaction</th>
                                <th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Archive is currently empty</td></tr>
                                ) : orders.map((order, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectOrder(order.docNo)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.docNo}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.date?.split('T')[0]}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RETRIEVE</button>
                                        </td>
                                    
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showPayMethodSearch} onClose={() => { setShowPayMethodSearch(false); setPayMethodSearchQuery(''); }} title="Payment Method Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter payment methods..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={payMethodSearchQuery} onChange={(e) => setPayMethodSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Method Title</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.paymentMethods || []).filter(m => !payMethodSearchQuery || m.name.toLowerCase().includes(payMethodSearchQuery.toLowerCase()) || m.code.toLowerCase().includes(payMethodSearchQuery.toLowerCase())).map(m => (
                                        <tr key={m.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, payType: m.code })); setShowPayMethodSearch(false); setPayMethodSearchQuery(''); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{m.code}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{m.name}</td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                    {(lookups.paymentMethods || []).length === 0 && <tr><td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No methods found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showSupplierSearch} onClose={() => setShowSupplierSearch(false)} title="Supplier Directory Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find supplier by legal name or code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={supplierSearchQuery} onChange={(e) => setSupplierSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Credential / Supplier Name</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.suppliers.filter(s => s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || s.code.toLowerCase().includes(supplierSearchQuery.toLowerCase())).map(s => (
                                        <tr key={s.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectSupplier(s)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{s.code}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{s.name}</td>
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

            <SimpleModal isOpen={showAddProductModal} onClose={() => { setShowAddProductModal(false); setProductSearchQuery(''); }} title="Inventory Acquisition Portal" maxWidth="max-w-[700px]">
                <div className="space-y-4 px-1 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex-1 max-w-[400px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="text" placeholder="Search Inventory.." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={productSearchQuery} onChange={async (e) => {
                                    const val = e.target.value; setProductSearchQuery(val);
                                    if (val.length >= 2) { try { const r = await purchOrderService.searchProducts(val); setLookups(prev => ({ ...prev, products: r })); } catch (_) {} }
                                    else if (val.length === 0) { const init = await purchOrderService.getLookups(formData.company); setLookups(prev => ({ ...prev, products: init.products })); }
                                }} autoFocus />
                            </div>
                        </div>
                        <button onClick={() => setShowProductMaster(true)} className="h-10 px-5 bg-[#0285fd] text-white text-[12px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all flex items-center gap-2 border-none shadow-sm active:scale-95 whitespace-nowrap">
                            <Plus size={14} /> CREATE NEW ITEM
                        </button>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm bg-white">
                        <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Item Description</th><th className="text-right px-5 py-3">Base Price</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.products || []).map(p => (
                                        <tr key={p.code} onClick={() => {
                                            setEntry(prev => ({ ...prev, prodCode: p.code, prodName: p.name, unit: p.unit || '',
                                                packSize: p.packSize || 1, purchasePrice: parseFloat(p.price || 0).toFixed(2), qty: '', amount: '0.00'
                                            }));
                                            setShowProductQtyModal(true);
                                        }} className={`group hover:bg-blue-50/50 cursor-pointer transition-all duration-200 ${entry.prodCode === p.code ? 'bg-blue-50/80' : ''}`}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3"><div className="text-[13px] font-bold text-gray-700 uppercase group-hover:text-blue-600 leading-snug line-clamp-2 max-w-[320px]">{p.name}</div></td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3"><span className="text-[10px] text-gray-300 mr-1">Rs.</span>{parseFloat(p.price || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showProductQtyModal} onClose={() => setShowProductQtyModal(false)} title="Line Item Configuration" maxWidth="max-w-[700px]">
                <div className="space-y-4 px-1 py-1 font-['Tahoma']">
                    <div className="bg-slate-50/50 p-4 rounded-[3px] border border-slate-100 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Active Selection</span>
                        <h3 className="text-[18px] font-black text-slate-700 uppercase leading-[1.2] tracking-tight max-w-[90%] break-words">{entry.prodName}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] font-mono font-bold text-blue-500 bg-white px-3 py-0.5 rounded-[3px] shadow-sm border border-slate-100">{entry.prodCode}</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase">Product Code</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex justify-between">Unit Price <span className="text-blue-500 font-mono">LKR</span></label>
                            <input type="text" name="purchasePrice" value={entry.purchasePrice} onChange={handleEntryInput} className="w-full h-12 border border-gray-300 px-5 text-right text-[16px] font-mono font-black rounded-[3px] outline-none focus:border-blue-500 bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Order Qty</label>
                            <input type="text" name="qty" ref={qtyRef} value={entry.qty} onChange={handleEntryInput} onKeyDown={e => { if (e.key === 'Enter') { addProduct(); setShowProductQtyModal(false); setShowAddProductModal(false); setProductSearchQuery(''); } }} className="w-full h-12 border border-blue-500 px-5 text-center text-[18px] font-mono font-black rounded-[3px] outline-none bg-blue-50/20" autoFocus />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Valuation</span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-[12px] font-bold text-blue-500">LKR</span>
                                <span className="text-[26px] font-mono font-black text-slate-800 tracking-tight">{parseFloat(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <button onClick={() => { addProduct(); setShowProductQtyModal(false); setShowAddProductModal(false); setProductSearchQuery(''); }} className="h-11 px-8 bg-[#0285fd] text-white text-[13px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 border-none shadow-sm">
                            <Plus size={16} /> ADD TO LIST
                        </button>
                    </div>
                </div>
            </SimpleModal>

            <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Save & Apply" message={`Apply Purchase Order ${formData.docNo}?`} loading={isApplying} confirmText="Apply" />
            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Delete Document" message={`Delete Purchase Order ${formData.docNo}?`} loading={isDeleting} confirmText="Delete" variant="danger" />

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onDateSelect={handleDateSelect} initialDate={formData[datePickerField]} />

            <SimpleModal isOpen={showProductMaster} onClose={() => setShowProductMaster(false)} title="Product Master Creation" maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-200 rounded-b-xl">
                        <button onClick={() => setShowProductMaster(false)} className="px-6 h-9 bg-white text-gray-500 text-[13px] font-bold rounded-[3px] border border-gray-300 hover:bg-blue-50/50 transition-all active:scale-95 cursor-pointer group border-b border-gray-50">CANCEL</button>
                        <button onClick={handleCreateProduct} disabled={isCreatingProduct} className="px-8 h-9 bg-[#0285fd] text-white text-[13px] font-bold rounded-[3px] shadow-md hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 border-none">
                            {isCreatingProduct ? 'CREATING...' : 'CREATE PRODUCT'}
                        </button>
                    </div>
                }
            >
                <div className="py-2 px-1 font-['Tahoma'] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Product Code</label>
                            <input type="text" value={productMasterData.code} onChange={e => setProductMasterData({...productMasterData, code: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[13px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white font-mono uppercase shadow-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Unit of Measure</label>
                            <input type="text" value={productMasterData.unit} onChange={e => setProductMasterData({...productMasterData, unit: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[13px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" placeholder="Nos" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Product Description</label>
                        <input type="text" value={productMasterData.name} onChange={e => setProductMasterData({...productMasterData, name: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[13px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white uppercase shadow-sm font-bold" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Purchase Price</label>
                            <input type="text" value={productMasterData.purchasePrice} onChange={e => setProductMasterData({...productMasterData, purchasePrice: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-right text-[13px] font-mono outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Selling Price</label>
                            <input type="text" value={productMasterData.sellingPrice} onChange={e => setProductMasterData({...productMasterData, sellingPrice: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-right text-[13px] font-mono outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Pack Size</label>
                            <input type="text" value={productMasterData.packSize} onChange={e => setProductMasterData({...productMasterData, packSize: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-center text-[13px] font-mono outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" placeholder="1" />
                        </div>
                    </div>
                    <div className="bg-blue-50/50 p-3.5 rounded-[3px] border border-blue-100/50 flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-relaxed">System Defaults: Category (1) and Department (1) will be automatically assigned.</p>
                    </div>
                </div>
            </SimpleModal>

            <FeatureLockedModal isOpen={showLockModal} onClose={() => setShowLockModal(false)} />
        </>
    );
};

export default PurchaseOrderBoard;
