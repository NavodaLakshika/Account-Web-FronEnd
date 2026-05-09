import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, ChevronDown, CheckCircle, Trash2, Printer, X, Save, RotateCcw, ChevronLeft, ChevronRight, Plus, Lock, Unlock } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { purchOrderService } from '../services/purchOrder.service';
import { paymentMethodService } from '../services/paymentMethod.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../utils/session';

const PurchaseOrderBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [], paymentMethods: [] });

    const [formData, setFormData] = useState({
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

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]); // List of existing POs for picker
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
        prodCode: '',
        prodName: '',
        unit: '',
        packSize: 1,
        qty: '',
        purchasePrice: '',
        amount: ''
    });

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

        if (name === 'docNo' && value.length >= 5) {
            // Optional: Auto fetch if they manually type a DocNo
        }
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

        setEntry({
            prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', purchasePrice: '', amount: ''
        });
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
            ...prev,
            vendorId: '', payType: '', remarks: '', reference: '', comment: '', taxPer: '0', nbtAmnt: 0
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

            const detailedProducts = data.details.map(d => ({
                prodCode: d.prod_Code,
                prodName: d.prod_Name,
                unit: d.unit,
                packSize: d.pack_Size,
                qty: d.qty?.toString(),
                purchasePrice: d.purchase_Price?.toString(),
                amount: d.amount?.toString()
            }));
            setProducts(detailedProducts);
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
        setEntry({
            ...entry,
            prodCode: product.code,
            prodName: product.name,
            unit: product.unit || '',
            packSize: product.packSize || 1,
            purchasePrice: product.price?.toString() || '0',
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
            await purchOrderService.createProduct({
                ...productMasterData,
                createUser: formData.createUser
            });
            showSuccessToast('Product created successfully.');
            setShowProductMaster(false);
            setProductMasterData({ code: '', name: '', unit: 'Nos', purchasePrice: '', sellingPrice: '', packSize: 1 });
            // Refresh products list
            const results = await purchOrderService.getLookups(formData.company);
            setLookups(prev => ({ ...prev, products: results.products }));
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsCreatingProduct(false);
        }
    };

    const preparePayload = () => {
        return {
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
                lnNo: idx + 1,
                prodCode: p.prodCode,
                prodName: p.prodName,
                unit: p.unit,
                packSize: p.packSize,
                qty: parseFloat(p.qty) || 0,
                purchasePrice: parseFloat(p.purchasePrice) || 0,
                amount: parseFloat(p.amount) || 0
            }))
        };
    };

    const handleDelete = async () => {
        if (!formData.docNo) return;
        setShowDeleteConfirm(true);
    };

    const handleOpenAddProduct = () => {
        if (isAddProductLocked) {
            setShowLockModal(true);
            return;
        }
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
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Purchase Order"
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
                                onClick={handleSave}
                                className="px-6 h-10 bg-white text-[#0285fd] text-sm font-black rounded-[5px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none"
                            >
                                <CheckCircle size={14} /> SAVE & APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* PO Number - Column 1 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Document ID</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} onKeyDown={(e) => e.key === 'Enter' && handleSelectOrder(formData.docNo)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm" />
                                    <button onClick={handleSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* PO Date - Column 2 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Post Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.postDate}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm"
                                        onClick={() => { setDatePickerField('postDate'); setShowDatePicker(true); }}
                                    />
                                    <button
                                        onClick={() => { setDatePickerField('postDate'); setShowDatePicker(true); }}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Expected Date - Column 3 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">EDD Timeline</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.expectedDate}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm"
                                        onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }}
                                    />
                                    <button
                                        onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Supplier - Column 1 & 2 */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Supplier</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.suppliers.find(s => s.code === formData.vendorId)?.name || ''}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-red-600 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer"
                                        onClick={() => setShowSupplierSearch(true)}
                                    />
                                    <button onClick={() => setShowSupplierSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method - Column 3 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Pay Method</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.paymentMethods?.find(m => m.code === formData.payType)?.name || formData.payType || ''}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer"
                                        onClick={() => setShowPayMethodSearch(true)}
                                    />
                                    <button onClick={() => setShowPayMethodSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Remarks - Column 1 & 2 */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Brief Remarks</label>
                                <input type="text" name="remarks" value={formData.remarks} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                            </div>

                            {/* B.Ref / Shift - Column 3 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">B.Ref / Shift</label>
                                <input type="text" name="reference" value={formData.reference} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[250px] overflow-hidden">
                        {/* Table header */}
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                            <div className="flex-[2.5] py-2.5 px-4 border-r border-gray-100 truncate flex items-center justify-between">
                                <span>Item Selection Portfolio</span>
                                <button
                                    onClick={handleOpenAddProduct}
                                    className="w-8 h-7 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    title="Add Product"
                                ><Plus size={14} /></button>
                            </div>
                            <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">UM</div>
                            <div className="w-28 py-2.5 px-3 border-r border-gray-100 text-right">Unit Rate</div>
                            <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">Usage</div>
                            <div className="w-32 py-2.5 px-4 text-right">Extended Net</div>
                            <div className="w-10"></div>
                        </div>

                        <div className="flex-1 bg-white overflow-y-auto max-h-[220px] divide-y divide-gray-50">
                            {products.length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest ">
                                    No items allocated to this document
                                </div>
                            ) : products.map((p, idx) => (
                                <div key={idx} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="flex-[2.5] py-2 px-4 border-r border-gray-100 truncate" title={p.prodName}>
                                        <div className="flex flex-col">
                                            <span className="text-blue-600 font-mono text-[10px]">{p.prodCode}</span>
                                            <span className="truncate">{p.prodName}</span>
                                        </div>
                                    </div>
                                    <div className="w-16 py-2 px-3 border-r border-gray-100 text-center text-gray-400">{p.unit}</div>
                                    <div className="w-28 border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent">
                                        <input
                                            type="text"
                                            value={p.purchasePrice}
                                            onChange={(e) => {
                                                const newPrice = e.target.value;
                                                const newAmount = (parseFloat(p.qty) || 0) * (parseFloat(newPrice) || 0);
                                                setProducts(products.map((item, i) =>
                                                    i === idx ? { ...item, purchasePrice: newPrice, amount: newAmount.toFixed(2) } : item
                                                ));
                                            }}
                                            className="w-full h-7 bg-transparent text-right text-[12px] font-mono font-bold text-slate-800 outline-none focus:bg-white border-none px-2"
                                        />
                                    </div>
                                    <div className="w-16 border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent">
                                        <input
                                            type="text"
                                            value={p.qty}
                                            onChange={(e) => {
                                                const newQty = e.target.value;
                                                const newAmount = (parseFloat(newQty) || 0) * (parseFloat(p.purchasePrice) || 0);
                                                setProducts(products.map((item, i) =>
                                                    i === idx ? { ...item, qty: newQty, amount: newAmount.toFixed(2) } : item
                                                ));
                                            }}
                                            className="w-full h-7 bg-transparent text-center text-[12px] font-mono font-black text-slate-900 outline-none focus:bg-white border-none px-1"
                                        />
                                    </div>
                                    <div className="w-32 py-1.5 px-4 text-right font-mono font-black text-slate-800">
                                        {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="w-10 flex justify-center py-1">
                                        <button onClick={() => removeProduct(idx)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[5px]">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-end gap-x-12">
                        <div className="flex-1 space-y-2">
                            <label className="text-[12.5px] font-bold text-gray-700">Internal Remarks & Comments</label>
                            <textarea name="comment" value={formData.comment} onChange={handleInput} className="w-full h-[100px] border border-gray-300 rounded-lg p-3 text-[12.5px] font-mono outline-none focus:border-[#0285fd] resize-none shadow-sm bg-gray-50/30" placeholder=""></textarea>
                        </div>

                        <div className="w-[320px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">Portfolio Total</span>
                                <div className="text-[15px] font-mono font-black text-slate-800">
                                    {totals.sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">NBT Levy %</span>
                                <input type="text" name="nbtAmnt" value={formData.nbtAmnt} onChange={handleInput} className="w-24 h-7 bg-white border border-gray-200 px-2 text-right text-[13px] font-mono font-bold rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm" />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">Tax Value %</span>
                                <input type="text" name="taxPer" value={formData.taxPer} onChange={handleInput} className="w-24 h-7 bg-white border border-gray-200 px-2 text-right text-[13px] font-mono font-bold rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm" />
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
            </SimpleModal>

            {/* Existing PO Picker Modal */}
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
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-10 text-gray-300 text-[12px] font-bold uppercase tracking-widest">Archive is currently empty</td>
                                    </tr>
                                ) : orders.map((order, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleSelectOrder(order.docNo)}>
                                        <td className="px-5 py-3 font-mono text-[13px] font-mono text-gray-600 ">{order.docNo}</td>
                                        <td className="px-5 py-3 text-[13px] font-mono text-gray-600 ">{order.date?.split('T')[0]}</td>
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
                                                <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{m.code}</td>
                                                <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{m.name}</td>
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

            {/* Supplier Search Modal */}
            <SimpleModal
                isOpen={showSupplierSearch}
                onClose={() => setShowSupplierSearch(false)}
                title="Supplier Directory Lookup"
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find supplier by legal name or code..."
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={supplierSearchQuery}
                                onChange={(e) => setSupplierSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Credential / Supplier Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.suppliers
                                        .filter(s => s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || s.code.toLowerCase().includes(supplierSearchQuery.toLowerCase()))
                                        .map(s => (
                                            <tr key={s.code} className="group hover:bg-blue-50/50 cursor-pointer transition-all" onClick={() => handleSelectSupplier(s)}>
                                                <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{s.code}</td>
                                                <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{s.name}</td>
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

            {/* Product Search Modal */}
            {/* ── Add Product Modal ──────────────────────────────────── */}
            <SimpleModal isOpen={showAddProductModal} onClose={() => { setShowAddProductModal(false); setProductSearchQuery(''); }} title="Inventory Acquisition Portal" maxWidth="max-w-[650px]">
                <div className="space-y-4 px-1 font-['Tahoma']">
                    <div className="flex items-center justify-between gap-4 bg-slate-50/80 p-3 rounded-xl border border-gray-100 mb-2">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex-1 max-w-[400px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Inventory.."
                                    className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-white shadow-sm font-medium"
                                    value={productSearchQuery}
                                    onChange={async (e) => {
                                        const val = e.target.value; setProductSearchQuery(val);
                                        if (val.length >= 2) { try { const r = await purchOrderService.searchProducts(val); setLookups(prev => ({ ...prev, products: r })); } catch (_) {} }
                                        else if (val.length === 0) { const init = await purchOrderService.getLookups(formData.company); setLookups(prev => ({ ...prev, products: init.products })); }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowProductMaster(true)}
                            className="h-10 px-5 bg-[#2bb744] text-white text-[12px] font-black rounded-lg hover:bg-[#259b3a] transition-all flex items-center gap-2 border-none shadow-md shadow-green-100 active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={14} /> CREATE NEW ITEM
                        </button>
                    </div>

                    {/* Product Selection List */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-0">
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
                                                    purchasePrice: parseFloat(p.price || 0).toFixed(2),
                                                    qty: '',
                                                    amount: '0.00'
                                                }));
                                                setShowProductQtyModal(true);
                                            }}
                                            className={`group hover:bg-blue-50/50 cursor-pointer transition-all duration-200 ${
                                                entry.prodCode === p.code ? 'bg-blue-50/80' : ''
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

            {/* Product Quantity & Price Input Modal */}
            <SimpleModal
                isOpen={showProductQtyModal}
                onClose={() => setShowProductQtyModal(false)}
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
                                <span>Adjusted Unit Price</span>
                                <span className="text-blue-500 font-mono">LKR</span>
                            </label>
                            <input 
                                type="text" 
                                name="purchasePrice" 
                                value={entry.purchasePrice} 
                                onChange={handleEntryInput}
                                className="w-full h-12 border border-gray-300 px-5 text-right text-[16px] font-mono font-black rounded-xl outline-none focus:border-[#0285fd] focus:ring-4 focus:ring-blue-50 transition-all bg-white" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Acquisition Quantity</label>
                            <input 
                                type="text" 
                                name="qty" 
                                value={entry.qty} 
                                onChange={handleEntryInput}
                                onKeyDown={e => { if (e.key === 'Enter') { addProduct(); setShowProductQtyModal(false); setShowAddProductModal(false); setProductSearchQuery(''); } }}
                                className="w-full h-12 border border-[#0285fd] px-5 text-center text-[18px] font-mono font-black rounded-xl outline-none bg-blue-50/20 focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" 
                                autoFocus 
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
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

            {/* ── Global Itemized Search ──────────────────────────────────── */}
            <SimpleModal
                isOpen={showProductSearch}
                onClose={() => {
                    setShowProductSearch(false);
                    setProductSearchQuery('');
                }}
                title="Global Itemized Lookup"
                maxWidth="max-w-[700px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Scan items by generic title or reference code..."
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={productSearchQuery}
                                onChange={async (e) => {
                                    const val = e.target.value;
                                    setProductSearchQuery(val);
                                    if (val.length >= 2) {
                                        try {
                                            const results = await purchOrderService.searchProducts(val);
                                            setLookups(prev => ({ ...prev, products: results }));
                                        } catch (err) {}
                                    } else if (val.length === 0) {
                                        const init = await purchOrderService.getLookups(formData.company);
                                        setLookups(prev => ({ ...prev, products: init.products }));
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Acquisition Title</th>
                                        <th className="px-5 py-3 text-right">Acq. Price</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.products || []).map(p => (
                                        <tr key={p.code} className="group hover:bg-blue-50/50 cursor-pointer transition-all" onClick={() => handleSelectProduct(p)}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-bold text-blue-600">{p.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{p.name}</td>
                                            <td className="px-5 py-3 text-right font-mono font-black text-gray-400">{p.price?.toFixed(2)}</td>
                                            <td className="px-5 py-3 text-right">
                                                 <button className="bg-[#0285fd] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#0073ff] shadow-md transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {lookups.products?.length === 0 && (
                                         <tr>
                                             <td colSpan={4} className="py-10 text-center text-gray-300 font-bold uppercase tracking-widest">No products available for capture</td>
                                         </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Date Selection Modal */}
            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData[datePickerField]}
            />

            <ConfirmModal 
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmApply}
                title="Create Purchase Order"
                message={`Are you sure you want to save and apply this Purchase Order (${formData.docNo})? This action will finalize the transaction.`}
                loading={isApplying}
                confirmText="Apply Order"
            />

            <ConfirmModal 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Purchase Order"
                message={`Are you sure you want to delete this record (${formData.docNo})? This action cannot be undone and will permanently remove the document.`}
                loading={isDeleting}
                confirmText="Delete Record"
                variant="danger"
            />

            {/* Product Master Creation Modal */}
            <SimpleModal
                isOpen={showProductMaster}
                onClose={() => setShowProductMaster(false)}
                title="Product Master Creation"
                maxWidth="max-w-[500px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={() => setShowProductMaster(false)} className="px-6 h-9 bg-white text-gray-500 text-[13px] font-bold rounded-[5px] border border-gray-300 hover:bg-gray-50 transition-all active:scale-95">CANCEL</button>
                        <button onClick={handleCreateProduct} disabled={isCreatingProduct} className="px-8 h-9 bg-[#2bb744] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-50 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none">
                            {isCreatingProduct ? 'CREATING...' : 'CREATE PRODUCT'}
                        </button>
                    </div>
                }
            >
                <div className="py-2 px-1 font-['Tahoma'] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600">Product Code</label>
                            <input type="text" value={productMasterData.code} onChange={e => setProductMasterData({...productMasterData, code: e.target.value})} className="w-full h-9 border border-gray-300 rounded-[5px] px-3 text-[13px] outline-none focus:border-[#0285fd] bg-white font-mono uppercase" placeholder="" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600">Unit of Measure</label>
                            <input type="text" value={productMasterData.unit} onChange={e => setProductMasterData({...productMasterData, unit: e.target.value})} className="w-full h-9 border border-gray-300 rounded-[5px] px-3 text-[13px] outline-none focus:border-[#0285fd] bg-white" placeholder="Nos" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[12px] font-bold text-gray-600">Product Description</label>
                        <input type="text" value={productMasterData.name} onChange={e => setProductMasterData({...productMasterData, name: e.target.value})} className="w-full h-9 border border-gray-300 rounded-[5px] px-3 text-[13px] outline-none focus:border-[#0285fd] bg-white uppercase" placeholder="" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600">Purchase Price</label>
                            <input type="text" value={productMasterData.purchasePrice} onChange={e => setProductMasterData({...productMasterData, purchasePrice: e.target.value})} className="w-full h-9 border border-gray-300 rounded-[5px] px-3 text-right text-[13px] font-mono outline-none focus:border-[#0285fd] bg-white" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600">Selling Price</label>
                            <input type="text" value={productMasterData.sellingPrice} onChange={e => setProductMasterData({...productMasterData, sellingPrice: e.target.value})} className="w-full h-9 border border-gray-300 rounded-[5px] px-3 text-right text-[13px] font-mono outline-none focus:border-[#0285fd] bg-white" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600">Pack Size</label>
                            <input type="text" value={productMasterData.packSize} onChange={e => setProductMasterData({...productMasterData, packSize: e.target.value})} className="w-full h-9 border border-gray-300 rounded-[5px] px-3 text-center text-[13px] font-mono outline-none focus:border-[#0285fd] bg-white" placeholder="1" />
                        </div>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight text-center">Default Category (1) and Department (1) will be assigned.</p>
                    </div>
                </div>
            </SimpleModal>
            
            <SimpleModal
                isOpen={showLockModal}
                onClose={() => setShowLockModal(false)}
                title="LOCK STATUS"
                maxWidth="max-w-[360px]"
                showHeaderClose={false}
            >
                <div className="flex flex-col items-center text-center space-y-6 font-['Plus_Jakarta_Sans'] py-2">
                    <div className="w-28 h-28 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Forgot Password1.lottie" autoplay loop />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-[18px] font-bold text-slate-800 uppercase tracking-tight">Access Locked</h3>
                        <p className="text-[12px] text-slate-500 font-medium">
                            Please contact supporters to unlock this feature.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowLockModal(false)}
                        className="w-full h-10 bg-[#0285fd] text-white text-[12px] font-black rounded-[5px] hover:bg-[#0073ff] transition-all active:scale-95 uppercase tracking-widest"
                    >
                        CLOSE
                    </button>
                </div>
            </SimpleModal>
        </>
    );
};

export default PurchaseOrderBoard;
