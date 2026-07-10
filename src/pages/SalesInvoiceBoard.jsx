import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, CheckCircle, Trash2, Save, RotateCcw, Plus, FileText } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { salesInvoiceService } from '../services/salesInvoice.service';
import { salesOrderService } from '../services/salesOrder.service';
import { paymentMethodService } from '../services/paymentMethod.service';
import { productService } from '../services/product.service';
import { grnService } from '../services/grn.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import SalesInvoiceDetailModal from '../components/SalesInvoiceDetailModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const SalesInvoiceBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ customers: [], products: [], paymentMethods: [], salesAssistants: [], salesOrders: [], taxAccounts: [] });

    const getInitialFormData = () => ({
        docNo: '',
        company: '',
        createUser: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        customerId: '',
        payType: '',
        remarks: '',
        reference: '',
        soNumber: '',
        salesAssistant: '',
        creditPeriod: '0',
        taxPer: '0',
        nbtPer: '0',
        discountPer: '0',
        taxAccount: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]); 
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [appliedDocNo, setAppliedDocNo] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [showPayMethodSearch, setShowPayMethodSearch] = useState(false);
    const [showTaxAccSearch, setShowTaxAccSearch] = useState(false);
    const [payMethodSearchQuery, setPayMethodSearchQuery] = useState('');
    const [showSOSearch, setShowSOSearch] = useState(false);
    const [soSearchQuery, setSOSearchQuery] = useState('');
    const [showAssistantSearch, setShowAssistantSearch] = useState(false);
    const [assistantSearchQuery, setAssistantSearchQuery] = useState('');
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');

    const [entry, setEntry] = useState({
        prodCode: '',
        prodName: '',
        unit: '',
        packSize: 1,
        qty: '',
        price: '',
        discount: '0',
        amount: '0.00'
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
            const soData = await salesOrderService.getInitData(company);
            const invData = await salesInvoiceService.getInitData(company);
            const methods = await paymentMethodService.getAll(company).catch(() => []);
            const grnLookups = await grnService.getLookups(company).catch(() => ({ products: [] }));
            const productsData = grnLookups.products || [];
            const soList = await salesOrderService.searchOrders(company).catch(() => []);

            setLookups(prev => ({ 
                ...prev, 
                customers: soData.customers || [], 
                products: productsData.map(p => ({
                    code: p.code,
                    name: p.name,
                    unit: p.unit || '',
                    cost: p.price || 0,
                    selling: p.sellingPrice || 0
                })),
                paymentMethods: methods,
                salesAssistants: (invData.salesAssistants || soData.salesAssistants || []).map(sa => ({
                    code: sa.code || sa.Code,
                    name: sa.name || sa.sales_Name || sa.salesName || sa.Sales_Name
                })),
                salesOrders: soList || [],
                taxAccounts: invData.taxAccounts || []
            }));
        } catch (error) {
            console.error("Lookup Load Error:", error);
            showErrorToast('Failed to load transaction lookups.');
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await salesInvoiceService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
            if (data.salesAssistants) setLookups(prev => ({ ...prev, salesAssistants: data.salesAssistants }));
        } catch (error) {
            console.error("DocNo Error:", error);
        }
    };

    const handleSelectSO = async (item) => {
        try {
            setFormData(prev => ({ ...prev, soNumber: item.docNo }));
            setShowSOSearch(false);
            await salesInvoiceService.recallSO(formData.docNo, item.docNo, formData.company, formData.date);
            await handleSelectInvoice(formData.docNo);
            showSuccessToast(`Sales Order ${item.docNo} recalled.`);
        } catch (error) {
            showErrorToast("Failed to recall Sales Order: " + error.message);
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'creditPeriod') {
                const days = parseInt(value) || 0;
                const date = new Date(prev.date);
                date.setDate(date.getDate() + days);
                newState.dueDate = date.toISOString().split('T')[0];
            }
            return newState;
        });
    };

    const handleEntryInput = (e) => {
        const { name, value } = e.target;
        let newEntry = { ...entry, [name]: value };

        if (name === 'qty' || name === 'price' || name === 'discount') {
            const q = parseFloat(name === 'qty' ? value : newEntry.qty) || 0;
            const p = parseFloat(name === 'price' ? value : newEntry.price) || 0;
            const d = parseFloat(name === 'discount' ? value : newEntry.discount) || 0;
            newEntry.amount = ((q * p) - d).toFixed(2);
        }

        setEntry(newEntry);
    };

    const addProduct = () => {
        if (!entry.prodCode) return showErrorToast('Select a Product.');
        if (!entry.qty || parseFloat(entry.qty) <= 0) return showErrorToast('Enter valid Quantity.');

        setProducts([...products, { ...entry }]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', price: '', discount: '0', amount: '0.00' });
    };

    const removeProduct = (idx) => {
        setProducts(products.filter((_, i) => i !== idx));
    };

    const totals = useMemo(() => {
        const gross = products.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        
        const discPerValue = parseFloat(formData.discountPer) || 0;
        const discAmt = (gross * discPerValue / 100);
        
        const nbtPerValue = parseFloat(formData.nbtPer) || 0;
        const nbtAmt = ((gross - discAmt) * nbtPerValue / 100);
        
        const taxPerValue = parseFloat(formData.taxPer) || 0;
        const taxAmt = ((gross - discAmt + nbtAmt) * taxPerValue / 100);
        
        const netAmount = gross - discAmt + nbtAmt + taxAmt;

        return { gross, discAmt, nbtAmt, taxAmt, netAmount };
    }, [products, formData.discountPer, formData.nbtPer, formData.taxPer]);

    const handleClear = () => {
        setProducts([]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', price: '', discount: '0', amount: '0.00' });
        setFormData(prev => ({
            ...prev,
            customerId: '', payType: '', remarks: '', reference: '', soNumber: '', salesAssistant: '', creditPeriod: '0',
            taxPer: '0', nbtPer: '0', discountPer: '0'
        }));
        generateDocNo(formData.company);
    };

    const handleSearch = async () => {
        try {
            const data = await salesInvoiceService.search(formData.company);
            setInvoices(data || []);
            setShowSearchModal(true);
        } catch (error) {
            showErrorToast('Failed to load invoices.');
        }
    };

    const handleSelectInvoice = async (docNo) => {
        try {
            const data = await salesInvoiceService.getInvoice(docNo, formData.company);
            setFormData(prev => ({
                ...prev,
                docNo: data.header.doc_No || docNo,
                date: data.header.date?.split('T')[0] || prev.date,
                dueDate: data.header.due_Date?.split('T')[0] || prev.dueDate,
                customerId: data.header.customer_Id || '',
                payType: data.header.pay_Type || '',
                remarks: data.header.remarks || '',
                reference: data.header.reference || '',
                soNumber: data.header.so_No || '',
                salesAssistant: data.header.sales_Assistant || '',
                creditPeriod: data.header.credit_Period?.toString() || '0',
                discountPer: data.header.discountPer?.toString() || '0',
                taxPer: data.header.taxPer?.toString() || '0',
                nbtPer: data.header.nbtPer?.toString() || '0'
            }));

            const detailedProducts = data.details.map(d => ({
                prodCode: d.prod_Code,
                prodName: d.prod_Name,
                unit: d.unit,
                packSize: d.pack_Size,
                qty: d.qty?.toString(),
                price: d.selling_Price?.toString() || d.price?.toString(),
                discount: d.discount?.toString() || '0',
                amount: d.amount?.toString()
            }));
            setProducts(detailedProducts);
            setShowSearchModal(false);
            showSuccessToast("Invoice Loaded Successfully.");
        } catch (error) {
            showErrorToast(error.toString());
        }
    };

    const handleSave = async () => {
        if (!formData.customerId) return showErrorToast('Select a Customer.');
        if (products.length === 0) return showErrorToast('No products entered.');

        const payload = preparePayload();
        try {
            await salesInvoiceService.save(payload);
            showSuccessToast(`Invoice saved successfully.`);
        } catch (error) {
            showErrorToast(error.toString());
        }
    };

    const handleApply = async () => {
        if (!formData.customerId) return showErrorToast('Select a Customer.');
        if (products.length === 0) return showErrorToast('No products entered.');
        setShowConfirmModal(true);
    };

    const confirmApply = async () => {
        setIsApplying(true);
        const payload = preparePayload();
        try {
            await salesInvoiceService.apply(payload);
            showSuccessToast(`Invoice applied successfully.`);
            setAppliedDocNo(payload.docNo);
            handleClear();
            setShowConfirmModal(false);
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsApplying(false);
        }
    };

    const preparePayload = () => {
        return {
            ...formData,
            grossAmount: totals.gross,
            discountAmount: totals.discAmt,
            nbtAmount: totals.nbtAmt,
            taxAmount: totals.taxAmt,
            netAmount: totals.netAmount,
            account: formData.taxAccount,
            products: products.map((p, idx) => ({
                lnNo: idx + 1,
                ...p,
                qty: parseFloat(p.qty) || 0,
                price: parseFloat(p.price) || 0,
                discount: parseFloat(p.discount) || 0,
                amount: parseFloat(p.amount) || 0
            }))
        };
    };

    const handleDelete = () => {
        if (!formData.docNo) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await salesInvoiceService.deleteInvoice(formData.docNo, formData.company);
            showSuccessToast(`Invoice deleted successfully.`);
            handleClear();
            setShowDeleteConfirm(false);
            if (onClose) onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Sales Invoice"
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
                            <button onClick={handleSave} className="px-6 h-10 border-2 border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Save size={14} /> SAVE
                            </button>
                            <button onClick={handleApply} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
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
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Document No</label>
                                <div className="relative">
                                    <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700" />
                                    <button onClick={handleSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date} onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">S.O. Number</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.soNumber} onClick={() => setShowSOSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowSOSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit Period</label>
                                <input type="number" name="creditPeriod" value={formData.creditPeriod} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer</label>
                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={formData.customerId} className="w-24 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none text-gray-700 font-mono shrink-0" />
                                        <div className="relative flex-1">
                                            <input type="text" readOnly value={lookups.customers.find(c => c.code === formData.customerId)?.name || ''} onClick={() => setShowCustomerSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                            <button onClick={() => setShowCustomerSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Sales Asst.</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.salesAssistant} onClick={() => setShowAssistantSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowAssistantSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Due Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.dueDate} onClick={() => { setDatePickerField('dueDate'); setShowDatePicker(true); }} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => { setDatePickerField('dueDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Type</label>
                                <div className="relative">
                                    <input type="text" readOnly value={lookups.paymentMethods.find(m => m.code === formData.payType)?.name || ''} onClick={() => setShowPayMethodSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowPayMethodSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Tax Account</label>
                                <div className="relative">
                                    <input type="text" readOnly value={lookups.taxAccounts.find(a => a.code === formData.taxAccount)?.name || ''} onClick={() => setShowTaxAccSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowTaxAccSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ref. No</label>
                                <input type="text" name="reference" value={formData.reference} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-[3px] bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Allocated Items Inventory</span>
                            <button onClick={() => setShowAddProductModal(true)} className="h-7 px-3 bg-[#0285fd] text-white text-[10px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all flex items-center gap-1.5 border-none shadow-sm active:scale-95">
                                <Plus size={13} /> ADD LINE ITEM
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-3 w-40">PRODUCT CODE</th>
                                        <th className="px-3">PRODUCT NAME</th>
                                        <th className="px-3 text-center w-20">UNIT</th>
                                        <th className="px-3 text-right w-28">SELLING</th>
                                        <th className="px-2 text-right w-20">QTY</th>
                                        <th className="px-2 text-right w-24">DISCOUNT</th>
                                        <th className="px-4 text-right w-32">AMOUNT</th>
                                        <th className="w-16 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-10 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                                                Allocated Items Inventory Empty
                                            </td>
                                        </tr>
                                    ) : products.map((p, idx) => (
                                        <tr key={idx} className="text-[12px] font-bold text-gray-700 border-b border-gray-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-3 py-2.5">
                                                <div className="flex flex-col">
                                                    <span className="text-blue-700 font-mono text-[10px]">{p.prodCode}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 truncate">{p.prodName}</td>
                                            <td className="px-3 py-2.5 text-center text-gray-400">{p.unit}</td>
                                            <td className="px-1 py-1">
                                                <input type="text" value={p.price} onChange={(e) => {
                                                    const newPrice = e.target.value;
                                                    const newAmount = (parseFloat(p.qty) || 0) * (parseFloat(newPrice) || 0) - (parseFloat(p.discount) || 0);
                                                    setProducts(products.map((item, i) => i === idx ? { ...item, price: newPrice, amount: newAmount.toFixed(2) } : item));
                                                }} className="w-full h-8 border border-gray-200 rounded-[3px] text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2" />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input type="text" value={p.qty} onChange={(e) => {
                                                    const newQty = e.target.value;
                                                    const newAmount = (parseFloat(newQty) || 0) * (parseFloat(p.price) || 0) - (parseFloat(p.discount) || 0);
                                                    setProducts(products.map((item, i) => i === idx ? { ...item, qty: newQty, amount: newAmount.toFixed(2) } : item));
                                                }} className="w-full h-8 border border-gray-200 rounded-[3px] text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2" />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input type="text" value={p.discount} onChange={(e) => {
                                                    const newDisc = e.target.value;
                                                    const newAmount = (parseFloat(p.qty) || 0) * (parseFloat(p.price) || 0) - (parseFloat(newDisc) || 0);
                                                    setProducts(products.map((item, i) => i === idx ? { ...item, discount: newDisc, amount: newAmount.toFixed(2) } : item));
                                                }} className="w-full h-8 border border-gray-200 rounded-[3px] text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2" />
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-black">
                                                {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
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
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Remarks / Narrative</label>
                                    <textarea name="remarks" value={formData.remarks} onChange={handleInput} className="w-full h-[128px] border border-gray-300 rounded-[3px] p-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] resize-none text-gray-700" />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 space-y-3">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-medium text-gray-700">Gross Amount</span>
                                    <div className="w-36 h-8 text-right text-[14px] font-mono font-bold bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-gray-800">
                                        {totals.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Discount</span>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input type="number" name="discountPer" value={formData.discountPer} onChange={handleInput} className="w-[60px] h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">%</span>
                                        </div>
                                        <div className="w-28 h-8 bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-[13px] font-mono text-red-600">
                                            ({totals.discAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">NBT</span>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input type="number" name="nbtPer" value={formData.nbtPer} onChange={handleInput} className="w-[60px] h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">%</span>
                                        </div>
                                        <div className="w-28 h-8 bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-[13px] font-mono text-gray-500">
                                            {totals.nbtAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Tax Amount</span>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input type="number" name="taxPer" value={formData.taxPer} onChange={handleInput} className="w-[60px] h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">%</span>
                                        </div>
                                        <div className="w-28 h-8 bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-[13px] font-mono text-gray-500">
                                            {totals.taxAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200 my-1" />
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-[3px]">
                                    <span className="text-[14px] font-black text-gray-800 uppercase">Net Amount</span>
                                    <span className="text-[22px] font-mono font-black text-[#0285fd] tracking-tight">{totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Invoice Draft Explorer" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by document id or date..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className=" px-5 py-3">Reference ID</th>
                                    <th className=" px-5 py-3">Date</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoices.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Archive is currently empty</td></tr>
                                ) : invoices.map((inv, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { handleSelectInvoice(inv.docNo); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{inv.docNo}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{inv.date?.split('T')[0]}</td>
                                        <td className="text-right px-5 py-3">
                                            <button onClick={() => { handleSelectInvoice(inv.docNo); }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RETRIEVE</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showCustomerSearch} onClose={() => setShowCustomerSearch(false)} title="Customer Selection Portal" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={customerSearchQuery} onChange={(e) => setCustomerSearchQuery(e.target.value)} autoFocus placeholder="Search customer..." />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.customers.filter(c => c.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) || c.code?.toLowerCase().includes(customerSearchQuery.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, customerId: c.code })); setShowCustomerSearch(false); }}>
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

            <SimpleModal isOpen={showAssistantSearch} onClose={() => setShowAssistantSearch(false)} title="Sales Assistant Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={assistantSearchQuery} onChange={(e) => setAssistantSearchQuery(e.target.value)} autoFocus placeholder="Search..." />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.salesAssistants.filter(s => s.name?.toLowerCase().includes(assistantSearchQuery.toLowerCase()) || s.code?.toLowerCase().includes(assistantSearchQuery.toLowerCase())).map((s, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, salesAssistant: s.name })); setShowAssistantSearch(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{s.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{s.name}</td>
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

            <SimpleModal isOpen={showPayMethodSearch} onClose={() => setShowPayMethodSearch(false)} title="Payment Method Catalog" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Type</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.paymentMethods.map((m, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, payType: m.code })); setShowPayMethodSearch(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{m.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{m.name}</td>
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

            <SimpleModal isOpen={showTaxAccSearch} onClose={() => setShowTaxAccSearch(false)} title="Tax Ledger Selection" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.taxAccounts.filter(a => a.name?.toLowerCase().includes(('')?.toLowerCase()) || true).map((a, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, taxAccount: a.code })); setShowTaxAccSearch(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.name}</td>
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

            <SimpleModal isOpen={showSOSearch} onClose={() => setShowSOSearch(false)} title="Sales Order Archive" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Global Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by document id or creation date..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={soSearchQuery} onChange={(e) => setSOSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className=" px-5 py-3">Reference ID</th>
                                    <th className=" px-5 py-3">Date</th>
                                    <th className="text-center px-5 py-3">Status</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.salesOrders
                                    .filter(o => !soSearchQuery || o.docNo?.toLowerCase().includes(soSearchQuery.toLowerCase()) || o.date?.includes(soSearchQuery))
                                    .length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Archive is currently empty</td></tr>
                                ) : lookups.salesOrders
                                    .filter(o => !soSearchQuery || o.docNo?.toLowerCase().includes(soSearchQuery.toLowerCase()) || o.date?.includes(soSearchQuery))
                                    .map((order, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectSO(order)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.docNo}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.date?.split('T')[0]}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-[3px] text-[9px] font-black uppercase ${order.status === 'Applied' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="text-right px-5 py-3">
                                            <button onClick={() => handleSelectSO(order)} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RECALL</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showAddProductModal} onClose={() => setShowAddProductModal(false)} title="Product Entry Terminal" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Product / Service</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input type="text" readOnly value={entry.prodName} placeholder="Tap Search to Catalog..." className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 shadow-sm" />
                                <button onClick={() => setShowProductSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Selling Rate</label>
                            <input type="text" name="price" value={entry.price} onChange={handleEntryInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[14px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 shadow-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                            <input type="text" ref={qtyRef} name="qty" value={entry.qty} onChange={handleEntryInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[14px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 shadow-sm" />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button onClick={addProduct} className="w-full h-12 bg-[#0285fd] text-white text-sm font-black rounded-[3px] shadow-sm hover:bg-[#0073ff] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                            <Plus size={18} strokeWidth={3} /> ALLOCATE TO INVOICE
                        </button>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showProductSearch} onClose={() => setShowProductSearch(false)} title="Product Master File" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} autoFocus placeholder="Search by name or code..." />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[500px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className=" px-5 py-3">Code</th>
                                    <th className=" px-5 py-3">Name</th>
                                    <th className="text-center px-5 py-3">Unit</th>
                                    <th className="text-right px-5 py-3">Pur. Price</th>
                                    <th className="text-right px-5 py-3">Sell. Price</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.products.filter(p => !productSearchQuery || p.name?.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.code?.toLowerCase().includes(productSearchQuery.toLowerCase())).map((p, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => {
                                        setEntry({ 
                                            ...entry, 
                                            prodCode: p.code, 
                                            prodName: p.name, 
                                            unit: p.unit, 
                                            price: p.selling || '0', 
                                            amount: (1 * (p.selling || 0)).toFixed(2) 
                                        });
                                        setShowProductSearch(false);
                                        setTimeout(() => qtyRef.current?.focus(), 50);
                                    }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{p.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{p.unit || 'Nos'}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{parseFloat(p.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{parseFloat(p.selling).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} currentDate={formData[datePickerField]} onDateChange={(d) => { setFormData(prev => ({ ...prev, [datePickerField]: d })); setShowDatePicker(false); }} title="Select Date" />
            <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Confirm Final Application" message="Are you sure you want to apply this invoice to the ledger? This action will update inventory and accounting balances." isLoading={isApplying} />
            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Confirm Deletion" message={`Are you sure you want to delete invoice ${formData.docNo}? This action cannot be undone.`} isLoading={isDeleting} />
            
            {appliedDocNo && (
                <SalesInvoiceDetailModal
                    docNo={appliedDocNo}
                    onClose={() => setAppliedDocNo(null)}
                />
            )}
        </>
    );
};

export default SalesInvoiceBoard;
