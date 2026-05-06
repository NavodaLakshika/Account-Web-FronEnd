import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw, Trash2, Plus, X , Save, Check} from 'lucide-react';
import { salesOrderService } from '../services/salesOrder.service';
import { productService } from '../services/product.service';
import { toast } from 'react-hot-toast';
import CalendarModal from '../components/CalendarModal';
import { DotLottiePlayer } from '@dotlottie/react-player';

const SalesOrderBoard = ({ isOpen, onClose }) => {
    const company = localStorage.getItem('companyCode') || 'C002';
    
    // Custom Toast Handlers
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

    const initialFormState = {
        docNo: '',
        company: company,
        date: new Date().toISOString().split('T')[0],
        jobNo: '-NO-',
        custCode: '',
        custName: '',
        salesRef: '',
        payType: 'Cash',
        dueDate: new Date().toISOString().split('T')[0],
        creditPeriod: '0',
        refNo: '',
        comment: '',
        discPer: 0,
        discValue: 0,
        taxPer: 0,
        taxValue: 0,
        adjType: 'Add',
        adjValue: 0,
        netAmount: 0
    };

    const [formData, setFormData] = useState(initialFormState);
    const [rows, setRows] = useState([{ id: Date.now(), prodCode: '', prodName: '', unit: '', cost: 0, selling: 0, qty: 0, discPer: 0, discount: 0, amount: 0 }]);
    const [lookups, setLookups] = useState({ customers: [], salesAssistants: [], products: [], jobs: [], paymentTypes: [] });
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [orders, setOrders] = useState([]);

    // Modal States
    const [showCustModal, setShowCustModal] = useState(false);
    const [custSearch, setCustSearch] = useState('');
    const [showPayTypeModal, setShowPayTypeModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [jobSearch, setJobSearch] = useState('');
    const [showSalesAsstModal, setShowSalesAsstModal] = useState(false);
    const [salesAsstSearch, setSalesAsstSearch] = useState('');
    const [showProdModal, setShowProdModal] = useState(false);
    const [prodSearch, setProdSearch] = useState('');
    const [prodIndex, setProdIndex] = useState(null);
    const [orderSearch, setOrderSearch] = useState('');
    const [showDateModal, setShowDateModal] = useState(false);
    const [showDueDateModal, setShowDueDateModal] = useState(false);

    // 1. Initial Load
    useEffect(() => {
        if (isOpen) {
            initComponent();
        }
    }, [isOpen]);

    const initComponent = async () => {
        try {
            const data = await salesOrderService.getInitData(company);
            setLookups({
                customers: data.customers || [],
                salesAssistants: data.salesAssistants || [],
                products: [], // We will fetch these from ProductController
                jobs: data.jobs || [],
                paymentTypes: data.paymentTypes || []
            });
            setFormData(prev => ({ ...prev, docNo: data.nextDocNo }));

            // Load initial products using ProductController
            const productsData = await productService.search(company, '');
            setLookups(prev => ({ ...prev, products: productsData.map(p => ({
                code: p.code,
                name: p.prod_Name,
                unit: p.unit || '',
                cost: p.purchase_price || 0,
                selling: p.selling_Price || 0
            })) }));
        } catch (error) {
            toast.error("Failed to initialize Sales Order");
        }
    };

    // Product search from server
    useEffect(() => {
        const fetchProducts = async () => {
            if (!showProdModal) return;
            try {
                const results = await productService.search(company, prodSearch);
                setLookups(prev => ({ ...prev, products: results.map(p => ({
                    code: p.code,
                    name: p.prod_Name,
                    unit: p.unit || '',
                    cost: p.purchase_price || 0,
                    selling: p.selling_Price || 0
                })) }));
            } catch (error) {
                console.error("Search failed", error);
            }
        };
        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [prodSearch, showProdModal, company]);

    // 2. Calculations
    const totals = useMemo(() => {
        const sumQty = rows.reduce((acc, row) => acc + (parseFloat(row.qty) || 0), 0);
        const sumDisc = rows.reduce((acc, row) => acc + (parseFloat(row.discount) || 0), 0);
        const sumAmount = rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
        
        // Header level calculations (following DiscCalcutlation from C#)
        let headerDiscount = (parseFloat(formData.discPer) > 0) 
            ? sumAmount * (parseFloat(formData.discPer) / 100) 
            : parseFloat(formData.discValue) || 0;
            
        let amountAfterDisc = sumAmount - headerDiscount;
        let taxVal = amountAfterDisc * (parseFloat(formData.taxPer) / 100);
        let net = amountAfterDisc + taxVal;

        if (formData.adjType === 'Add') net += (parseFloat(formData.adjValue) || 0);
        else net -= (parseFloat(formData.adjValue) || 0);

        return { sumQty, sumDisc, sumAmount, headerDiscount, taxVal, net };
    }, [rows, formData.discPer, formData.discValue, formData.taxPer, formData.adjType, formData.adjValue]);

    // 3. Grid Handlers
    const addRow = () => setRows([...rows, { id: Date.now(), prodCode: '', prodName: '', unit: '', cost: 0, selling: 0, qty: 0, discPer: 0, discount: 0, amount: 0 }]);
    
    const removeRow = (id) => {
        if (rows.length > 1) setRows(rows.filter(r => r.id !== id));
    };

    const handleRowChange = (id, field, value) => {
        setRows(prev => prev.map(row => {
            if (row.id === id) {
                let updatedRow = { ...row, [field]: value };
                
                // If product changed, load details
                if (field === 'prodCode') {
                    const prod = lookups.products.find(p => p.code === value);
                    if (prod) {
                        updatedRow.prodName = prod.name;
                        updatedRow.unit = prod.unit;
                        updatedRow.cost = prod.cost;
                        updatedRow.selling = prod.selling;
                    }
                }

                // Calculate Amount (replicating C# Logic)
                const qtyVal = parseFloat(updatedRow.qty) || 0;
                const sellVal = parseFloat(updatedRow.selling) || 0;
                const discPer = parseFloat(updatedRow.discPer) || 0;
                
                let baseAmount = qtyVal * sellVal;
                let discount = baseAmount * (discPer / 100);
                updatedRow.discount = discount;
                updatedRow.amount = baseAmount - discount;
                
                return updatedRow;
            }
            return row;
        }));
    };

    // 4. Header Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'custCode') {
            const cust = lookups.customers.find(c => c.code === value);
            setFormData(prev => ({ ...prev, custName: cust ? cust.name : '' }));
        }
    };

    // 5. Action Handlers
    const handleSave = async (apply = false) => {
        if (!formData.custCode) return showErrorToast("Please select a customer");
        if (rows.some(r => !r.prodCode || r.qty <= 0)) return showErrorToast("Please fill all item details correctly");

        const payload = {
            header: {
                docNo: formData.docNo,
                date: formData.date,
                jobNo: formData.jobNo,
                custCode: formData.custCode,
                salesRef: formData.salesRef,
                payType: formData.payType,
                dueDate: formData.dueDate,
                creditPeriod: formData.creditPeriod,
                company: formData.company,
                refNo: formData.refNo,
                comment: formData.comment,
                totalAmount: totals.sumAmount,
                discPer: parseFloat(formData.discPer) || 0,
                discValue: totals.headerDiscount,
                taxPer: parseFloat(formData.taxPer) || 0,
                taxValue: totals.taxVal,
                adjType: formData.adjType,
                adjValue: parseFloat(formData.adjValue) || 0,
                netAmount: totals.net
            },
            details: rows.map((r, index) => ({
                prodCode: r.prodCode,
                prodName: r.prodName,
                unit: r.unit,
                cost: parseFloat(r.cost) || 0,
                selling: parseFloat(r.selling) || 0,
                qty: parseFloat(r.qty) || 0,
                disc: parseFloat(r.discPer) || 0,
                discount: parseFloat(r.discount) || 0,
                amount: parseFloat(r.amount) || 0,
                lnNo: index + 1
            }))
        };

        try {
            const res = apply ? await salesOrderService.applyOrder(payload) : await salesOrderService.saveDraft(payload);
            showSuccessToast(res.message);
            if (apply) handleClear();
        } catch (error) {
            showErrorToast(error.response?.data || "Operation failed");
        }
    };

    const handleClear = () => {
        setFormData(initialFormState);
        setRows([{ id: Date.now(), prodCode: '', prodName: '', unit: '', cost: 0, selling: 0, qty: 0, discPer: 0, discount: 0, amount: 0 }]);
        initComponent();
    };

    const handleSearchClick = async () => {
        try {
            const data = await salesOrderService.searchOrders(company);
            setOrders(data);
            setShowSearchModal(true);
        } catch (error) { showErrorToast("Failed to load orders"); }
    };

    const loadOrder = async (docNo) => {
        try {
            const { header, details } = await salesOrderService.getOrder(docNo, company);
            setFormData({
                ...formData,
                docNo: header.doc_No || '',
                date: (header.post_Date || new Date().toISOString().split('T')[0]).split('T')[0],
                custCode: header.vendor_Id || '',
                custName: lookups.customers.find(c => c.code === header.vendor_Id)?.name || '',
                jobNo: header.remarks || '-NO-',
                salesRef: header.salesRef || '',
                payType: header.pay_Type || 'Cash',
                dueDate: (header.expected_Date || new Date().toISOString().split('T')[0]).split('T')[0],
                creditPeriod: header.crdtPeriod || '0',
                refNo: header.reference || '',
                discPer: header.purDiscount || 0,
                adjType: header.adjType || 'Add',
                adjValue: header.adjst || 0,
                comment: header.comment || ''
            });
            setRows(details.map(d => ({ 
                id: Math.random(), 
                prodCode: d.prod_Code || '',
                prodName: d.prod_Name || '',
                unit: d.unit || '',
                cost: parseFloat(d.purchase_Price) || 0,
                selling: parseFloat(d.selling_Price) || 0,
                qty: parseFloat(d.qty) || 0,
                discPer: parseFloat(d.disc) || 0,
                discount: parseFloat(d.discount) || 0,
                amount: parseFloat(d.amount) || 0
            })));
            setShowSearchModal(false);
        } catch (error) { 
            console.error("Load order error:", error);
            showErrorToast("Failed to load order"); 
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
                title="Sales Order"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex  items-center justify-end border-t border-gray-100 rounded-b-xl gap-3">
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 h-10 bg-gray-100 text-gray-600 text-sm font-bold rounded-[5px] hover:bg-gray-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                                <RefreshCw size={14} /> CLEAR FORM
                            </button>
                            <button onClick={() => handleSave(false)} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button onClick={() => handleSave(true)} className="px-6 h-10 bg-[#2bb744] text-white text-sm font-bold rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none">
                                <Check size={14} /> SAVE ORDER
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 p-1 font-['Tahoma',_sans-serif] text-slate-700 overflow-y-auto max-h-[80vh] no-scrollbar">
                    {/* 1. Header Information Section */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-4 gap-y-3.5">
                            
                            {/* Document No */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Doc No</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" value={formData.docNo} onChange={handleInputChange} name="docNo" className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-[#0285fd] bg-gray-50 rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm" />
                                    <button onClick={handleSearchClick} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.date} onClick={() => setShowDateModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowDateModal(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Job Number */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0 text-nowrap">Job No</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.jobNo} onClick={() => setShowJobModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => setShowJobModal(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Sales Assistant */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0 text-nowrap">Sales Asst</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={lookups.salesAssistants.find(s => s.code === formData.salesRef)?.name || formData.salesRef || ''} onClick={() => setShowSalesAsstModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" placeholder="" />
                                    <button onClick={() => setShowSalesAsstModal(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Customer</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.custCode} placeholder="ID" className="w-20 min-w-0 h-8 border border-gray-300 px-2 text-[12px] font-bold text-[#0285fd] bg-gray-50 rounded-[5px] outline-none shadow-sm" />
                                    <input type="text" readOnly value={formData.custName} onClick={() => setShowCustModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold rounded-[5px] outline-none shadow-sm bg-white text-gray-700 cursor-pointer" placeholder=" " />
                                    <button onClick={() => setShowCustModal(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Ref No */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Ref. No</label>
                                <input type="text" name="refNo" value={formData.refNo} onChange={handleInputChange} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                            </div>

                            {/* Payment Type */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Pay Type</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.payType} onClick={() => setShowPayTypeModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => setShowPayTypeModal(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Credit Period */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Crd. Period</label>
                                <input type="text" name="creditPeriod" value={formData.creditPeriod} onChange={handleInputChange} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                            </div>

                            {/* Due Date */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Due Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.dueDate} onClick={() => setShowDueDateModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowDueDateModal(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Grid */}
                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[250px] overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                            <div className="w-40 py-2.5 px-3 border-r border-gray-100">PROD. ID</div>
                            <div className="flex-1 py-2.5 px-3 border-r border-gray-100">PRODUCT NAME</div>
                            <div className="w-20 py-2.5 px-3 border-r border-gray-100 text-center">UNIT</div>
                            <div className="w-24 py-2.5 px-3 border-r border-gray-100 text-right">SELLING</div>
                            <div className="w-20 py-2.5 px-3 border-r border-gray-100 text-right">QTY</div>
                            <div className="w-20 py-2.5 px-3 border-r border-gray-100 text-right">DIS %</div>
                            <div className="w-28 py-2.5 px-3 text-right">AMOUNT</div>
                            <div className="w-10"></div>
                        </div>
                        
                        <div className="flex-1 bg-white overflow-y-auto max-h-[220px] divide-y divide-gray-50">
                            {rows.map((row, idx) => (
                                <div key={row.id} className="flex border-b border-gray-50 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="w-40 py-1.5 px-2 border-r border-gray-50">
                                        <div className="flex gap-1 items-center h-7">
                                            <input
                                                type="text"
                                                readOnly
                                                value={row.prodCode}
                                                onClick={() => { setProdIndex(idx); setShowProdModal(true); }}
                                                className="flex-1 min-w-0 h-7 border border-gray-300 px-2 text-[11px] font-bold text-[#0285fd] bg-white rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm cursor-pointer"
                                                placeholder="Select"
                                            />
                                            <button onClick={() => { setProdIndex(idx); setShowProdModal(true); }} className="w-8 h-7 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                                <Search size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 py-1.5 px-2 border-r border-gray-50 truncate" title={row.prodName}>
                                        {row.prodName}
                                    </div>
                                    <div className="w-20 py-1.5 px-2 border-r border-gray-50 text-center text-gray-500">
                                        {row.unit}
                                    </div>
                                    <div className="w-24 border-r border-gray-50 px-2 py-1.5 bg-white group-hover:bg-transparent">
                                        <input
                                            type="number"
                                            value={row.selling}
                                            onChange={(e) => handleRowChange(row.id, 'selling', e.target.value)}
                                            className="w-full h-7 bg-transparent text-right text-[12px] font-mono font-bold text-slate-800 outline-none focus:bg-white border-none px-2 tabular-nums"
                                        />
                                    </div>
                                    <div className="w-20 border-r border-gray-50 px-2 py-1.5 bg-white group-hover:bg-transparent">
                                        <input
                                            type="number"
                                            value={row.qty}
                                            onChange={(e) => handleRowChange(row.id, 'qty', e.target.value)}
                                            className="w-full h-7 bg-transparent text-right text-[12px] font-mono font-bold text-[#0285fd] outline-none focus:bg-white border-none px-2 tabular-nums"
                                        />
                                    </div>
                                    <div className="w-20 border-r border-gray-50 px-2 py-1.5 bg-white group-hover:bg-transparent">
                                        <input
                                            type="number"
                                            value={row.discPer}
                                            onChange={(e) => handleRowChange(row.id, 'discPer', e.target.value)}
                                            className="w-full h-7 bg-transparent text-right text-[12px] font-mono font-bold text-slate-800 outline-none focus:bg-white border-none px-2 tabular-nums"
                                        />
                                    </div>
                                    <div className="w-28 py-1.5 px-4 text-right font-mono font-black text-slate-800">
                                        {row.amount.toFixed(2)}
                                    </div>
                                    <div className="w-10 flex justify-center py-1">
                                        <button onClick={() => removeRow(row.id)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[5px]">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="h-10 border-b border-gray-50 flex items-center">
                                <button onClick={addRow} className="w-full h-full text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={14} /> Add Line Item
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Calculations */}
                    <div className="flex flex-row justify-between items-end gap-x-12 mt-4">
                        <div className="flex-1 space-y-2">
                            <textarea name="comment" value={formData.comment} onChange={handleInputChange} placeholder="Add comments here..." className="w-full h-[150px] bg-white border border-gray-300 rounded-lg p-3 text-[12.5px] font-mono outline-none focus:border-[#0285fd] shadow-sm resize-none" />
                        </div>

                        <div className="w-[360px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm shrink-0">
                            {/* Total Row */}
                            <div className="flex items-center gap-3">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight w-24 shrink-0">Total</span>
                                <div className="flex-1 flex gap-3 items-center justify-end">
                                    <div className="w-28 h-7 text-center text-[11px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50 flex items-center justify-center shrink-0 text-slate-500">
                                        Qty: {totals.sumQty}
                                    </div>
                                    <input type="text" readOnly value={totals.sumAmount.toFixed(2)} className="w-[105px] h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50 px-2 text-slate-800 outline-none shrink-0" />
                                </div>
                            </div>

                            {/* Over Discount Row */}
                            <div className="flex items-center gap-3">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight w-24 shrink-0">Over Discount</span>
                                <div className="flex-1 flex gap-3 items-center justify-end">
                                    <div className="relative w-28 shrink-0">
                                        <input type="number" name="discPer" value={formData.discPer} onChange={handleInputChange} className="w-full h-7 text-center text-[11px] font-mono font-bold border border-gray-200 rounded-[5px] outline-none focus:border-[#0285fd] bg-white" />
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">%</span>
                                    </div>
                                    <input type="text" readOnly value={totals.headerDiscount.toFixed(2)} className="w-[105px] h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50 px-2 outline-none shrink-0" />
                                </div>
                            </div>

                            {/* Tax Amount Row */}
                            <div className="flex items-center gap-3">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight w-24 shrink-0">Tax Amount</span>
                                <div className="flex-1 flex gap-3 items-center justify-end">
                                    <div className="relative w-28 shrink-0">
                                        <input type="number" name="taxPer" value={formData.taxPer} onChange={handleInputChange} className="w-full h-7 text-center text-[11px] font-mono font-bold border border-gray-200 rounded-[5px] outline-none focus:border-[#0285fd] bg-white" />
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">%</span>
                                    </div>
                                    <input type="text" readOnly value={totals.taxVal.toFixed(2)} className="w-[105px] h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50 px-2 outline-none shrink-0" />
                                </div>
                            </div>

                            {/* Adjustment Row */}
                            <div className="flex items-center gap-3">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight w-24 shrink-0">Adjustment</span>
                                <div className="flex-1 flex gap-3 items-center justify-end">
                                    <button onClick={() => setFormData({...formData, adjType: formData.adjType === 'Add' ? 'Less' : 'Add'})} className="w-28 shrink-0 h-7 text-[10px] font-black text-white bg-[#8c97ab] hover:bg-[#7a869a] rounded-[5px] uppercase shadow-sm transition-all active:scale-95">
                                        {formData.adjType}
                                    </button>
                                    <input type="number" name="adjValue" value={formData.adjValue} onChange={handleInputChange} className="w-[105px] h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm bg-white shrink-0" />
                                </div>
                            </div>

                            <div className="h-[1px] bg-gray-100 my-1" />

                            <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-lg border border-gray-50">
                                <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight">Net Amount</span>
                                <div className="text-[20px] font-mono font-black text-[#0285fd] tracking-tighter drop-shadow-sm tabular-nums">
                                    {totals.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {/* Customer Modal */}
                <SimpleModal isOpen={showCustModal} onClose={() => setShowCustModal(false)} title="Customer Directory" maxWidth="max-w-[650px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <Search className="text-gray-400" size={15} />
                            <input type="text" className="w-full h-9 border border-gray-300 rounded-[5px] outline-none px-3 text-sm focus:border-[#0285fd] bg-white shadow-sm" value={custSearch} onChange={(e) => setCustSearch(e.target.value)} autoFocus placeholder="Search customer..." />
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.customers.filter(c => c.name?.toLowerCase().includes(custSearch.toLowerCase()) || c.code?.toLowerCase().includes(custSearch.toLowerCase())).map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, custCode: c.code, custName: c.name }); setShowCustModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{c.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase group-hover:text-blue-600">{c.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                {/* Sales Asst Modal */}
                <SimpleModal isOpen={showSalesAsstModal} onClose={() => setShowSalesAsstModal(false)} title="Sales Assistants" maxWidth="max-w-[500px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <Search className="text-gray-400" size={15} />
                            <input type="text" className="w-full h-9 border border-gray-300 rounded-[5px] outline-none px-3 text-sm focus:border-[#0285fd]" value={salesAsstSearch} onChange={(e) => setSalesAsstSearch(e.target.value)} autoFocus placeholder="Search..." />
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.salesAssistants.filter(s => s.name?.toLowerCase().includes(salesAsstSearch.toLowerCase()) || s.code?.toLowerCase().includes(salesAsstSearch.toLowerCase())).map((s, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, salesRef: s.code }); setShowSalesAsstModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{s.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase group-hover:text-blue-600">{s.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                {/* Job Modal */}
                <SimpleModal isOpen={showJobModal} onClose={() => setShowJobModal(false)} title="Job Directory" maxWidth="max-w-[400px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <Search className="text-gray-400" size={15} />
                            <input type="text" className="w-full h-9 border border-gray-300 rounded-[5px] outline-none px-3 text-sm focus:border-[#0285fd]" value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} autoFocus placeholder="Search..." />
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Job No</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, jobNo: '-NO-' }); setShowJobModal(false); }}>
                                        <td className="px-5 py-3 font-mono text-[13px] font-bold text-gray-600">-NO-</td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                    {lookups.jobs.filter(j => j.toLowerCase().includes(jobSearch.toLowerCase())).map((j, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, jobNo: j }); setShowJobModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{j}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                {/* Pay Type Modal */}
                <SimpleModal isOpen={showPayTypeModal} onClose={() => setShowPayTypeModal(false)} title="Payment Types" maxWidth="max-w-[400px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Code</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Type</th>
                                        <th className="px-5 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.paymentTypes.map((t, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData({ ...formData, payType: t.name }); setShowPayTypeModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[12px] text-gray-500">{t.code}</td>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{t.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                {/* Product Modal */}
                <SimpleModal isOpen={showProdModal} onClose={() => setShowProdModal(false)} title="Product Directory" maxWidth="max-w-[900px] min-h-[650px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input 
                                    type="text" 
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" 
                                    value={prodSearch} 
                                    onChange={(e) => setProdSearch(e.target.value)} 
                                    autoFocus 
                                    placeholder="Search by name or code..." 
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[500px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Name</th>
                                        <th className="px-5 py-3 text-center">Unit</th>
                                        <th className="px-5 py-3 text-right">Pur. Price</th>
                                        <th className="px-5 py-3 text-right">Sell. Price</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.products.map((p, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { 
                                            if (prodIndex !== null) handleRowChange(rows[prodIndex].id, 'prodCode', p.code);
                                            setShowProdModal(false); 
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{p.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase group-hover:text-blue-600">{p.name}</td>
                                            <td className="px-5 py-3 text-center text-[12px] text-gray-500 font-bold uppercase">{p.unit || 'Nos'}</td>
                                            <td className="px-5 py-3 text-right font-mono text-[13px] font-bold text-slate-700">{parseFloat(p.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-5 py-3 text-right font-mono text-[13px] font-black text-blue-600">{parseFloat(p.selling).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                {/* Search Orders Modal */}
                <SimpleModal isOpen={showSearchModal} onClose={() => { setShowSearchModal(false); setOrderSearch(''); }} title="Historical Document Directory" maxWidth="max-w-[750px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Global Archive Search</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input 
                                    type="text" 
                                    placeholder="Filter by document id or creation date..." 
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm" 
                                    value={orderSearch}
                                    onChange={(e) => setOrderSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3">Reference ID</th>
                                            <th className="px-5 py-3">Ledger Posting Date</th>
                                            <th className="px-5 py-3 text-center">Status</th>
                                            <th className="px-5 py-3 text-right">Interaction</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders
                                            .filter(o => !orderSearch || o.docNo.toLowerCase().includes(orderSearch.toLowerCase()) || o.date?.includes(orderSearch))
                                            .length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-gray-300 text-[12px] font-bold uppercase tracking-widest">Archive is currently empty</td>
                                            </tr>
                                        ) : orders
                                            .filter(o => !orderSearch || o.docNo.toLowerCase().includes(orderSearch.toLowerCase()) || o.date?.includes(orderSearch))
                                            .map((order, i) => (
                                            <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => loadOrder(order.docNo)}>
                                                <td className="px-5 py-3 font-mono text-[13px] text-gray-600 ">{order.docNo}</td>
                                                <td className="px-5 py-3 text-[13px] font-mono text-gray-600 ">{order.date?.split('T')[0]}</td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${order.status === 'Applied' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">RETRIEVE</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SimpleModal>

                {/* Date Modals */}
                {showDateModal && (
                    <CalendarModal isOpen={showDateModal} onClose={() => setShowDateModal(false)} currentDate={formData.date} onDateChange={(d) => { setFormData({ ...formData, date: d }); setShowDateModal(false); }} title="Select Date" />
                )}
                {showDueDateModal && (
                    <CalendarModal isOpen={showDueDateModal} onClose={() => setShowDueDateModal(false)} currentDate={formData.dueDate} onDateChange={(d) => { setFormData({ ...formData, dueDate: d }); setShowDueDateModal(false); }} title="Select Due Date" />
                )}
            </SimpleModal>
        </>
    );
};

export default SalesOrderBoard;
