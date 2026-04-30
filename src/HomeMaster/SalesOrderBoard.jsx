import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw, Trash2, Plus, X , Save} from 'lucide-react';
import { salesOrderService } from '../services/salesOrder.service';
import { toast } from 'react-hot-toast';
import CalendarModal from '../components/CalendarModal';

const SalesOrderBoard = ({ isOpen, onClose }) => {
    const company = localStorage.getItem('companyCode') || 'C002';
    
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
    const [lookups, setLookups] = useState({ customers: [], salesAssistants: [], products: [], jobs: [] });
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
    const [showDateModal, setShowDateModal] = useState(false);
    const [showDueDateModal, setShowDueDateModal] = useState(false);

    // 1. Initial Load & Lookups
    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            generateDocNo();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await salesOrderService.getLookups(company);
            setLookups(data);
        } catch (error) {
            toast.error("Failed to load lookup data");
        }
    };

    const generateDocNo = async () => {
        try {
            const { docNo } = await salesOrderService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo }));
        } catch (error) {
            toast.error("Failed to generate document number");
        }
    };

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
        if (!formData.custCode) return toast.error("Please select a customer");
        if (rows.some(r => !r.prodCode || r.qty <= 0)) return toast.error("Please fill all item details correctly");

        const data = {
            ...formData,
            totAmount: totals.sumAmount,
            totQty: totals.sumQty,
            totDisc: totals.sumDisc,
            discValue: totals.headerDiscount,
            taxValue: totals.taxVal,
            netAmount: totals.net,
            createUser: 'Admin', // Static for now 
            items: rows.map(r => ({ ...r }))
        };

        try {
            const res = apply ? await salesOrderService.applyOrder(data) : await salesOrderService.saveDraft(data);
            toast.success(res.message);
            if (apply) handleClear();
        } catch (error) {
            toast.error(error.response?.data || "Operation failed");
        }
    };

    const handleClear = () => {
        setFormData(initialFormState);
        setRows([{ id: Date.now(), prodCode: '', prodName: '', unit: '', cost: 0, selling: 0, qty: 0, discPer: 0, discount: 0, amount: 0 }]);
        generateDocNo();
    };

    const handleSearchClick = async () => {
        try {
            const data = await salesOrderService.searchOrders(company);
            setOrders(data);
            setShowSearchModal(true);
        } catch (error) { toast.error("Failed to load orders"); }
    };

    const loadOrder = async (docNo) => {
        try {
            const { header, details } = await salesOrderService.getOrder(docNo, company);
            setFormData({
                ...formData,
                docNo: header.doc_No || header.docNo || '',
                date: (header.post_Date || header.postDate || new Date().toISOString().split('T')[0]).split('T')[0].slice(0, 10),
                custCode: header.vendor_Id || header.vendorId || '',
                custName: '',
                jobNo: header.remarks || '-NO-',
                salesRef: header.salesRef || '',
                payType: header.pay_Type || header.payType || 'Cash',
                dueDate: (header.expected_Date || header.expectedDate || new Date().toISOString().split('T')[0]).split('T')[0].slice(0, 10),
                creditPeriod: header.crdtPeriod || '0',
                refNo: header.reffNo || header.reference || '',
                discPer: header.purDiscount || 0,
                adjType: header.adjType || 'Add',
                adjValue: header.adjst || 0
            });
            setRows(details.map(d => ({ 
                id: Math.random(), 
                prodCode: d.prodCode || '',
                prodName: d.prodName || '',
                unit: d.unit || '',
                cost: parseFloat(d.cost) || 0,
                selling: parseFloat(d.selling) || 0,
                qty: parseFloat(d.qty) || 0,
                discPer: parseFloat(d.discPer) || 0,
                discount: parseFloat(d.discount) || 0,
                amount: parseFloat(d.amount) || 0
            })));
            setShowSearchModal(false);
        } catch (error) { 
            console.error("Load order error:", error);
            toast.error("Failed to load order"); 
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Sales Order"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl gap-3">
                        <div className="flex gap-3">
                            <span className="text-[20px] font-black italic text-[#0285fd]/30 tracking-tighter select-none">onimta IT</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                                <RefreshCw size={14} /> CLEAR FORM
                            </button>
                            <button onClick={() => handleSave(true)} className="px-6 h-10 bg-[#2bb744] text-white text-sm font-bold rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none">
                                <Save size={14} /> SAVE ORDER
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 p-1 font-['Tahoma',_sans-serif] text-slate-700 overflow-y-auto max-h-[80vh] no-scrollbar">
                    {/* 1. Header Information Section */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Document No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Doc No</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" value={formData.docNo} onChange={handleInputChange} name="docNo" className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-[#0285fd] bg-gray-50 rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm" />
                                    <button onClick={handleSearchClick} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                    <button onClick={generateDocNo} className="w-10 h-8 bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-200 rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.date} onClick={() => setShowDateModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowDateModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Job Number */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Job Number</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.jobNo} onClick={() => setShowJobModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => setShowJobModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Customer</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.custCode} placeholder="ID" className="w-24 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-[#0285fd] bg-gray-50 rounded-[5px] outline-none shadow-sm" />
                                    <input type="text" readOnly value={formData.custName} onClick={() => setShowCustModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold rounded-[5px] outline-none shadow-sm bg-white text-gray-700 cursor-pointer" placeholder="Select Customer" />
                                    <button onClick={() => setShowCustModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Sales Assistant */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Sales Asst</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={lookups.salesAssistants.find(s => s.code === formData.salesRef)?.name || formData.salesRef || ''} onClick={() => setShowSalesAsstModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" placeholder="Select Asst" />
                                    <button onClick={() => setShowSalesAsstModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Payment Type */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Pay Type</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.payType} onClick={() => setShowPayTypeModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => setShowPayTypeModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Ref No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Ref. No</label>
                                <input type="text" name="refNo" value={formData.refNo} onChange={handleInputChange} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                            </div>

                            {/* Credit Period */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Credit Period</label>
                                <input type="text" name="creditPeriod" value={formData.creditPeriod} onChange={handleInputChange} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                            </div>

                            {/* Due Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Due Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.dueDate} onClick={() => setShowDueDateModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowDueDateModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
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

                        <div className="w-[320px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">Total</span>
                                <div className="flex gap-2 w-48">
                                    <input type="text" readOnly value={totals.sumQty} className="w-12 h-7 text-center text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50" title="Total Qty" />
                                    <input type="text" readOnly value={totals.sumDisc.toFixed(2)} className="w-14 h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50 px-2" title="Total Discount" />
                                    <input type="text" readOnly value={totals.sumAmount.toFixed(2)} className="flex-1 h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50 px-2 text-slate-800" title="Total Amount" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">Over Discount</span>
                                <div className="flex gap-2 w-48">
                                    <div className="relative w-12">
                                        <input type="number" name="discPer" value={formData.discPer} onChange={handleInputChange} className="w-full h-7 text-center text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] outline-none focus:border-[#0285fd]" />
                                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">%</span>
                                    </div>
                                    <input type="text" readOnly value={totals.headerDiscount.toFixed(2)} className="flex-1 h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50 px-2" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">Tax Amount</span>
                                <div className="flex gap-2 w-48">
                                    <div className="relative w-12">
                                        <input type="number" name="taxPer" value={formData.taxPer} onChange={handleInputChange} className="w-full h-7 text-center text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] outline-none focus:border-[#0285fd]" />
                                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">%</span>
                                    </div>
                                    <input type="text" readOnly value={totals.taxVal.toFixed(2)} className="flex-1 h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] bg-gray-50 px-2" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">Adjustment</span>
                                <div className="flex gap-2 w-48">
                                    <button onClick={() => setFormData({...formData, adjType: formData.adjType === 'Add' ? 'Less' : 'Add'})} className="w-12 h-7 text-[10px] font-bold text-white bg-slate-400 hover:bg-slate-500 rounded-[5px] uppercase shadow-sm transition-colors">{formData.adjType}</button>
                                    <input type="number" name="adjValue" value={formData.adjValue} onChange={handleInputChange} className="flex-1 h-7 text-right text-[12px] font-mono font-bold border border-gray-200 rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm" />
                                </div>
                            </div>
                            <div className="h-[1px] bg-gray-100 my-1" />
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                                <span className="text-[13px] font-black text-slate-900 uppercase">Net Amount</span>
                                <div className="text-[18px] font-mono font-black text-[#0285fd] tracking-tighter">
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
                                    <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Name</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.customers.filter(c => c.name?.toLowerCase().includes(custSearch.toLowerCase()) || c.code?.toLowerCase().includes(custSearch.toLowerCase())).map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => { setFormData({ ...formData, custCode: c.code, custName: c.name }); setShowCustModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{c.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase group-hover:text-blue-600">{c.name}</td>
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
                                    <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Name</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.salesAssistants.filter(s => s.name?.toLowerCase().includes(salesAsstSearch.toLowerCase()) || s.code?.toLowerCase().includes(salesAsstSearch.toLowerCase())).map((s, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => { setFormData({ ...formData, salesRef: s.code }); setShowSalesAsstModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{s.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase group-hover:text-blue-600">{s.name}</td>
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
                                    <tr><th className="px-5 py-3">Job No</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => { setFormData({ ...formData, jobNo: '-NO-' }); setShowJobModal(false); }}>
                                        <td className="px-5 py-3 font-mono text-[13px] font-bold text-gray-600">-NO-</td>
                                    </tr>
                                    {lookups.jobs.filter(j => j.toLowerCase().includes(jobSearch.toLowerCase())).map((j, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => { setFormData({ ...formData, jobNo: j }); setShowJobModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{j}</td>
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
                                    <tr><th className="px-5 py-3">Type</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {['Cash', 'Credit'].map((t, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => { setFormData({ ...formData, payType: t }); setShowPayTypeModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{t}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                {/* Product Modal */}
                <SimpleModal isOpen={showProdModal} onClose={() => setShowProdModal(false)} title="Product Directory" maxWidth="max-w-[650px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <Search className="text-gray-400" size={15} />
                            <input type="text" className="w-full h-9 border border-gray-300 rounded-[5px] outline-none px-3 text-sm focus:border-[#0285fd]" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} autoFocus placeholder="Search..." />
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Name</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.products.filter(p => p.name?.toLowerCase().includes(prodSearch.toLowerCase()) || p.code?.toLowerCase().includes(prodSearch.toLowerCase())).map((p, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => { 
                                            if (prodIndex !== null) handleRowChange(rows[prodIndex].id, 'prodCode', p.code);
                                            setShowProdModal(false); 
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{p.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase group-hover:text-blue-600">{p.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>

                {/* Search Orders Modal */}
                <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Search Sales Orders" maxWidth="max-w-md">
                    <div className="p-2 space-y-2 font-['Tahoma']">
                        {orders.length === 0 ? <p className="text-center py-4 text-gray-400">No draft orders found</p> : 
                            orders.map(o => (
                                <div key={o.docNo} onClick={() => loadOrder(o.docNo)} className="p-3 border rounded hover:bg-blue-50 cursor-pointer flex justify-between items-center group">
                                    <span className="font-bold text-[#0285fd]">{o.docNo}</span>
                                    <span className="text-[11px] text-gray-500 group-hover:text-gray-700">{o.date?.split('T')[0]}</span>
                                </div>
                            ))
                        }
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
