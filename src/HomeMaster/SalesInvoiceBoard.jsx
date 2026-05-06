import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, Calendar, CheckCircle, Trash2, X, Save, RotateCcw, Plus, User, FileText, CreditCard } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { salesInvoiceService } from '../services/salesInvoice.service';
import { salesOrderService } from '../services/salesOrder.service';
import { paymentMethodService } from '../services/paymentMethod.service';
import { productService } from '../services/product.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const SalesInvoiceBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ customers: [], products: [], paymentMethods: [], salesAssistants: [], salesOrders: [], taxAccounts: [] });

    const [formData, setFormData] = useState({
        docNo: '',
        company: 'C001',
        createUser: 'SYSTEM',
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

    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]); 
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
            // 1. Load Init Data from Sales Order & Invoice Services
            const soData = await salesOrderService.getInitData(company);
            const invData = await salesInvoiceService.getInitData(company);
            const methods = await paymentMethodService.getAll(company).catch(() => []);
            
            // 2. Load Products from Product Service (to match SalesOrderBoard pattern)
            const productsData = await productService.search(company, '').catch(() => []);
            
            // 3. Get all Sales Orders for lookup
            const soList = await salesOrderService.searchOrders(company).catch(() => []);

            setLookups(prev => ({ 
                ...prev, 
                customers: soData.customers || [], 
                products: productsData.map(p => ({
                    code: p.code,
                    name: p.prod_Name,
                    unit: p.unit || '',
                    cost: p.purchase_price || 0,
                    selling: p.selling_Price || 0
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
            
            // Call recallSO to transfer SO data to Invoice draft in DB
            await salesInvoiceService.recallSO(formData.docNo, item.docNo, formData.company, formData.date);
            
            // Now load that draft data into UI
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

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Sales Invoice"
                maxWidth="max-w-[1200px]"
                footer={
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 w-full flex justify-between items-center border-t border-blue-100 rounded-b-xl shadow-inner">
                        <div className="flex gap-4">
                            <button onClick={handleDelete} className="px-7 h-11 bg-white text-[#ff3b30] text-[13px] font-black rounded-[8px] border-2 border-[#ff3b30] hover:bg-red-50 transition-all active:scale-95 flex items-center gap-2.5 shadow-sm">
                                <Trash2 size={16} strokeWidth={2.5} /> DELETE
                            </button>
                            <button onClick={handleClear} className="px-7 h-11 bg-white text-[#00adff] text-[13px] font-black rounded-[8px] border-2 border-[#00adff] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2.5 shadow-sm">
                                <RotateCcw size={16} strokeWidth={2.5} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleSave} className="px-7 h-11 bg-white text-[#0285fd] text-[13px] font-black rounded-[8px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2.5 shadow-sm">
                                <Save size={16} strokeWidth={2.5} /> SAVE DRAFT
                            </button>
                            <button onClick={handleApply} className="px-7 h-11 bg-[#2bb744] text-white text-[13px] font-black rounded-[8px] shadow-lg shadow-green-200 hover:bg-[#259b3a] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2.5 border-none">
                                <CheckCircle size={16} strokeWidth={2.5} /> SAVE & APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Row 1 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Document No</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} className="flex-1 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none focus:border-[#0285fd]" />
                                    <button onClick={handleSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input type="text" readOnly value={formData.date} className="flex-1 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 bg-white" />
                                    <button onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md active:scale-95">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">S.O. Number</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input type="text" readOnly value={formData.soNumber} className="flex-1 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px]" />
                                    <button onClick={() => setShowSOSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Customer</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input type="text" readOnly value={lookups.customers.find(c => c.code === formData.customerId)?.name || ''} className="flex-1 border border-gray-300 px-3 text-[12px] font-bold text-red-600 bg-gray-50 rounded-[5px]" />
                                    <button onClick={() => setShowCustomerSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Sales Asst.</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input type="text" readOnly value={formData.salesAssistant} className="flex-1 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px]" />
                                    <button onClick={() => setShowAssistantSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Payment Type</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input type="text" readOnly value={lookups.paymentMethods.find(m => m.code === formData.payType)?.name || ''} className="flex-1 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px]" />
                                    <button onClick={() => setShowPayMethodSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Tax Account</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input type="text" readOnly value={lookups.taxAccounts.find(a => a.code === formData.taxAccount)?.name || ''} className="flex-1 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px]" />
                                    <button onClick={() => setShowTaxAccSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Ref. No</label>
                                <input type="text" name="reference" value={formData.reference} onChange={handleInput} className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-[#0285fd]" />
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Credit Period</label>
                                <input type="number" name="creditPeriod" value={formData.creditPeriod} onChange={handleInput} className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-[#0285fd]" />
                            </div>

                            {/* Row 4 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Due Date</label>
                                <div className="flex-1 flex gap-1 h-8">
                                    <input type="text" readOnly value={formData.dueDate} className="flex-1 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 bg-white" />
                                    <button onClick={() => { setDatePickerField('dueDate'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md active:scale-95">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid Section */}
                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[300px] overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                            <div className="flex-[3] py-2.5 px-4 border-r border-gray-100 flex items-center justify-between">
                                <span>Product Identification</span>
                                <button onClick={() => setShowAddProductModal(true)} className="w-8 h-7 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md active:scale-95">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">Unit</div>
                            <div className="w-28 py-2.5 px-3 border-r border-gray-100 text-right">Selling</div>
                            <div className="w-16 py-2.5 px-3 border-r border-gray-100 text-center">Qty</div>
                            <div className="w-24 py-2.5 px-3 border-r border-gray-100 text-right">Dis.</div>
                            <div className="w-32 py-2.5 px-4 text-right">Amount</div>
                            <div className="w-10"></div>
                        </div>

                        <div className="flex-1 bg-white overflow-y-auto max-h-[250px] divide-y divide-gray-50">
                            {products.length === 0 ? (
                                <div className="h-32 flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest ">
                                    Allocated Items Inventory Empty
                                </div>
                            ) : products.map((p, idx) => (
                                <div key={idx} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors">
                                    <div className="flex-[3] py-2 px-4 border-r border-gray-100 truncate">
                                        <div className="flex flex-col">
                                            <span className="text-blue-600 font-mono text-[10px]">{p.prodCode}</span>
                                            <span className="truncate">{p.prodName}</span>
                                        </div>
                                    </div>
                                    <div className="w-16 py-2 px-3 border-r border-gray-100 text-center text-gray-400">{p.unit}</div>
                                    <div className="w-28 border-r border-gray-100 px-1 py-1">
                                        <input type="text" value={p.price} onChange={(e) => {
                                            const newPrice = e.target.value;
                                            const newAmount = (parseFloat(p.qty) || 0) * (parseFloat(newPrice) || 0) - (parseFloat(p.discount) || 0);
                                            setProducts(products.map((item, i) => i === idx ? { ...item, price: newPrice, amount: newAmount.toFixed(2) } : item));
                                        }} className="w-full h-7 bg-transparent text-right text-[12px] font-mono font-bold text-slate-800 outline-none px-2" />
                                    </div>
                                    <div className="w-16 border-r border-gray-100 px-1 py-1">
                                        <input type="text" value={p.qty} onChange={(e) => {
                                            const newQty = e.target.value;
                                            const newAmount = (parseFloat(newQty) || 0) * (parseFloat(p.price) || 0) - (parseFloat(p.discount) || 0);
                                            setProducts(products.map((item, i) => i === idx ? { ...item, qty: newQty, amount: newAmount.toFixed(2) } : item));
                                        }} className="w-full h-7 bg-transparent text-center text-[12px] font-mono font-black text-slate-900 outline-none px-1" />
                                    </div>
                                    <div className="w-24 border-r border-gray-100 px-1 py-1">
                                        <input type="text" value={p.discount} onChange={(e) => {
                                            const newDisc = e.target.value;
                                            const newAmount = (parseFloat(p.qty) || 0) * (parseFloat(p.price) || 0) - (parseFloat(newDisc) || 0);
                                            setProducts(products.map((item, i) => i === idx ? { ...item, discount: newDisc, amount: newAmount.toFixed(2) } : item));
                                        }} className="w-full h-7 bg-transparent text-right text-[12px] font-mono font-bold text-red-600 outline-none px-2" />
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

                    {/* Footer / Totals Section */}
                    <div className="flex flex-row justify-between items-end gap-x-12">
                        <div className="flex-1 space-y-2">
                            <label className="text-[12.5px] font-bold text-gray-700">Remarks / Narrative</label>
                            <textarea name="remarks" value={formData.remarks} onChange={handleInput} className="w-full h-[120px] border border-gray-300 rounded-lg p-3 text-[12.5px] font-mono outline-none focus:border-[#0285fd] resize-none shadow-sm bg-gray-50/30" placeholder=""></textarea>
                        </div>

                        <div className="w-[350px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-gray-500 uppercase">Gross Amount</span>
                                <div className="text-[14px] font-mono font-black text-slate-800">{totals.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-gray-500 uppercase">Discount</span>
                                    <input type="text" name="discountPer" value={formData.discountPer} onChange={handleInput} className="w-10 h-6 border border-gray-200 text-center text-[11px] font-bold rounded outline-none" />
                                    <span className="text-[12px] font-bold text-gray-400">%</span>
                                </div>
                                <div className="text-[14px] font-mono font-bold text-red-600">({totals.discAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })})</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-gray-500 uppercase">Tax Amount</span>
                                    <input type="text" name="taxPer" value={formData.taxPer} onChange={handleInput} className="w-10 h-6 border border-gray-200 text-center text-[11px] font-bold rounded outline-none" />
                                    <span className="text-[12px] font-bold text-gray-400">%</span>
                                </div>
                                <div className="text-[14px] font-mono font-bold text-slate-700">{totals.taxAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-gray-500 uppercase">NBT</span>
                                    <input type="text" name="nbtPer" value={formData.nbtPer} onChange={handleInput} className="w-10 h-6 border border-gray-200 text-center text-[11px] font-bold rounded outline-none" />
                                    <span className="text-[12px] font-bold text-gray-400">%</span>
                                </div>
                                <div className="text-[14px] font-mono font-bold text-slate-700">{totals.nbtAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="h-[1px] bg-gray-100 my-1" />
                            <div className="flex items-center justify-between bg-blue-50/50 p-2.5 rounded-md border border-blue-100">
                                <span className="text-[13px] font-black text-slate-900 uppercase tracking-wider">Net Amount</span>
                                <div className="text-[20px] font-mono font-black text-blue-700 tabular-nums">
                                    {totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Lookups Modals */}
            <LookupModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Invoice Draft Explorer" items={invoices} onSelect={(item) => { handleSelectInvoice(item.docNo); setShowSearchModal(false); }} />
            <LookupModal isOpen={showCustomerSearch} onClose={() => setShowCustomerSearch(false)} title="Customer Selection Portal" items={lookups.customers} onSelect={(item) => { setFormData(prev => ({ ...prev, customerId: item.code })); setShowCustomerSearch(false); }} />
            <LookupModal isOpen={showAssistantSearch} onClose={() => setShowAssistantSearch(false)} title="Sales Assistant Lookup" items={lookups.salesAssistants} onSelect={(item) => { setFormData(prev => ({ ...prev, salesAssistant: item.name })); setShowAssistantSearch(false); }} />
            <LookupModal isOpen={showPayMethodSearch} onClose={() => setShowPayMethodSearch(false)} title="Payment Method Catalog" items={lookups.paymentMethods} onSelect={(item) => { setFormData(prev => ({ ...prev, payType: item.code })); setShowPayMethodSearch(false); }} />
            <LookupModal isOpen={showTaxAccSearch} onClose={() => setShowTaxAccSearch(false)} title="Tax Ledger Selection" items={lookups.taxAccounts} onSelect={(item) => { setFormData(prev => ({ ...prev, taxAccount: item.code })); setShowTaxAccSearch(false); }} />
            <LookupModal isOpen={showSOSearch} onClose={() => setShowSOSearch(false)} title="Sales Order Archive" items={lookups.salesOrders} onSelect={handleSelectSO} />
            
            {/* Product Add Modal */}
            <SimpleModal isOpen={showAddProductModal} onClose={() => setShowAddProductModal(false)} title="Product Entry Terminal" maxWidth="max-w-[500px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Product / Service</label>
                        <div className="flex gap-2">
                            <input type="text" readOnly value={entry.prodName} placeholder="Tap Search to Catalog..." className="flex-1 h-10 border border-gray-300 rounded-[5px] px-4 text-[13px] font-bold text-blue-600 bg-gray-50 outline-none" />
                            <button onClick={() => setShowProductSearch(true)} className="w-12 h-10 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] shadow-md active:scale-95">
                                <Search size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Selling Rate</label>
                            <input type="text" name="price" value={entry.price} onChange={handleEntryInput} className="w-full h-10 border border-gray-300 rounded-[5px] px-4 text-[13px] font-mono font-bold outline-none focus:border-[#0285fd]" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                            <input type="text" ref={qtyRef} name="qty" value={entry.qty} onChange={handleEntryInput} className="w-full h-10 border border-gray-300 rounded-[5px] px-4 text-[13px] font-mono font-bold outline-none focus:border-[#0285fd]" />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button onClick={addProduct} className="w-full h-12 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-lg shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                            <Plus size={18} strokeWidth={3} /> ALLOCATE TO INVOICE
                        </button>
                    </div>
                </div>
            </SimpleModal>

            {/* Nested Product Search */}
            <LookupModal isOpen={showProductSearch} onClose={() => setShowProductSearch(false)} title="Product Master File" items={lookups.products} onSelect={(item) => {
                setEntry({ 
                    ...entry, 
                    prodCode: item.code, 
                    prodName: item.name, 
                    unit: item.unit, 
                    price: item.selling || '0', 
                    amount: (1 * (item.selling || 0)).toFixed(2) 
                });
                setShowProductSearch(false);
                setTimeout(() => qtyRef.current?.focus(), 50);
            }} />

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onDateSelect={(d) => { setFormData(prev => ({ ...prev, [datePickerField]: d })); setShowDatePicker(false); }} initialDate={formData[datePickerField]} />
            <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Confirm Final Application" message="Are you sure you want to apply this invoice to the ledger? This action will update inventory and accounting balances." isLoading={isApplying} />
        </>
    );
};

const LookupModal = ({ isOpen, onClose, title, items, onSelect }) => {
    const [query, setQuery] = useState('');
    if (!isOpen) return null;
    const filtered = (items || []).filter(i => {
        const q = query.toLowerCase();
        const code = (i.code || i.Code || i.docNo || i.doc_No || i.Doc_No || '').toString().toLowerCase();
        const name = (i.name || i.Name || i.remarks || i.Remarks || i.vendorId || '').toString().toLowerCase();
        return code.includes(q) || name.includes(q);
    });

    const hasPrice = items && items.length > 0 && items.some(i => i.selling !== undefined || i.sellingPrice !== undefined);

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth={hasPrice ? "max-w-[800px]" : "max-w-[600px]"}>
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="text" placeholder="Search archive..." className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                    </div>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3">Identifier</th>
                                <th className="px-5 py-3">Description</th>
                                {hasPrice && <th className="px-5 py-3 text-right">Price</th>}
                                <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={hasPrice ? "4" : "3"} className="text-center py-10 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No matching records found</td></tr>
                            ) : filtered.map((item, i) => (
                                <tr key={i} className="hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => onSelect(item)}>
                                    <td className="px-5 py-3 font-mono text-[12px] text-gray-600">{item.code || item.Code || item.docNo || item.doc_No || item.Doc_No}</td>
                                    <td className="px-5 py-3 text-[12px] font-bold text-gray-700 uppercase">{item.name || item.Name || item.remarks || item.Remarks || item.vendorId || item.date}</td>
                                    {hasPrice && <td className="px-5 py-3 text-right font-mono text-[12px] font-bold text-blue-600">{parseFloat(item.selling || item.sellingPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                                    <td className="px-5 py-3 text-right"><button className="bg-[#e49e1b] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black shadow-md transition-all active:scale-95">SELECT</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>
    );
};

export default SalesInvoiceBoard;
