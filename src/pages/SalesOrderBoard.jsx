import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import { Search, Calendar, RefreshCw, Trash2, Plus, Save, Check, ShoppingCart } from 'lucide-react';
import { salesOrderService } from '../services/salesOrder.service';
import { grnService } from '../services/grn.service';
import CalendarModal from '../components/CalendarModal';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import SalesOrderDetailModal from '../components/SalesOrderDetailModal';

const SalesOrderBoard = ({ isOpen, onClose }) => {
    const [company, setCompany] = useState('');

    const getInitialForm = () => ({
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
    });

    const [formData, setFormData] = useState(getInitialForm());
    const [rows, setRows] = useState([{ id: Date.now(), prodCode: '', prodName: '', unit: '', cost: 0, selling: 0, qty: 0, discPer: 0, discount: 0, amount: 0 }]);
    const [lookups, setLookups] = useState({ customers: [], salesAssistants: [], products: [], jobs: [], paymentTypes: [] });
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [orders, setOrders] = useState([]);

    const [showCustModal, setShowCustModal] = useState(false);
    const [custSearch, setCustSearch] = useState('');
    const [showPayTypeModal, setShowPayTypeModal] = useState(false);
    const [showSalesAsstModal, setShowSalesAsstModal] = useState(false);
    const [salesAsstSearch, setSalesAsstSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [showDateModal, setShowDateModal] = useState(false);
    const [showDueDateModal, setShowDueDateModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialForm());
            const { companyCode } = getSessionData();
            setCompany(companyCode);
            setFormData(prev => ({ ...prev, company: companyCode }));
            initComponent(companyCode);
        }
    }, [isOpen]);

    const initComponent = async (comp) => {
        const activeCompany = comp || company;
        try {
            const data = await salesOrderService.getInitData(activeCompany);
            setLookups({
                customers: data.customers || [],
                salesAssistants: data.salesAssistants || [],
                products: [],
                jobs: data.jobs || [],
                paymentTypes: data.paymentTypes || []
            });
            setFormData(prev => ({ ...prev, docNo: data.nextDocNo }));

            const grnLookups = await grnService.getLookups(activeCompany);
            setLookups(prev => ({ ...prev, products: (grnLookups.products || []).map(p => ({
                code: p.code, name: p.name, unit: p.unit || '', cost: p.price || 0, selling: p.sellingPrice || 0
            })) }));
        } catch (error) {
            showErrorToast("Failed to initialize Sales Order");
        }
    };



    const totals = useMemo(() => {
        const sumQty = rows.reduce((acc, row) => acc + (parseFloat(row.qty) || 0), 0);
        const sumDisc = rows.reduce((acc, row) => acc + (parseFloat(row.discount) || 0), 0);
        const sumAmount = rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

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

    const addRow = () => setRows([...rows, { id: Date.now(), prodCode: '', prodName: '', unit: '', cost: 0, selling: 0, qty: 0, discPer: 0, discount: 0, amount: 0 }]);

    const removeRow = (id) => {
        if (rows.length > 1) setRows(rows.filter(r => r.id !== id));
    };

    const handleRowChange = (id, field, value) => {
        setRows(prev => prev.map(row => {
            if (row.id === id) {
                let updatedRow = { ...row, [field]: value };
                if (field === 'prodCode') {
                    const prod = lookups.products.find(p => p.code === value);
                    if (prod) {
                        updatedRow.prodName = prod.name;
                        updatedRow.unit = prod.unit;
                        updatedRow.cost = prod.cost;
                        updatedRow.selling = prod.selling;
                    }
                }
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'custCode') {
            const cust = lookups.customers.find(c => c.code === value);
            setFormData(prev => ({ ...prev, custName: cust ? cust.name : '' }));
        }
    };

    const handleSave = async (apply = false) => {
        if (!formData.custCode) return showErrorToast("Please select a customer");
        if (rows.some(r => !r.prodCode || r.qty <= 0)) return showErrorToast("Please fill all item details correctly");

        const payload = {
            header: {
                docNo: formData.docNo, date: formData.date, jobNo: formData.jobNo,
                custCode: formData.custCode, salesRef: formData.salesRef, payType: formData.payType,
                dueDate: formData.dueDate, creditPeriod: formData.creditPeriod, company: formData.company,
                refNo: formData.refNo, comment: formData.comment, totalAmount: totals.sumAmount,
                discPer: parseFloat(formData.discPer) || 0, discValue: totals.headerDiscount,
                taxPer: parseFloat(formData.taxPer) || 0, taxValue: totals.taxVal,
                adjType: formData.adjType, adjValue: parseFloat(formData.adjValue) || 0, netAmount: totals.net
            },
            details: rows.map((r, index) => ({
                prodCode: r.prodCode, prodName: r.prodName, unit: r.unit,
                cost: parseFloat(r.cost) || 0, selling: parseFloat(r.selling) || 0,
                qty: parseFloat(r.qty) || 0, disc: parseFloat(r.discPer) || 0,
                discount: parseFloat(r.discount) || 0, amount: parseFloat(r.amount) || 0, lnNo: index + 1
            }))
        };

        try {
            const res = apply ? await salesOrderService.applyOrder(payload) : await salesOrderService.saveDraft(payload);
            showSuccessToast(res.message);
            if (apply) {
                setReceiptData({ header: { ...payload.header, custName: formData.custName }, details: payload.details });
                setShowReceipt(true);
                handleClear();
            }
        } catch (error) {
            showErrorToast(error.response?.data || "Operation failed");
        }
    };

    const handleClear = () => {
        setFormData(getInitialForm());
        setRows([{ id: Date.now(), prodCode: '', prodName: '', unit: '', cost: 0, selling: 0, qty: 0, discPer: 0, discount: 0, amount: 0 }]);
        initComponent();
    };

    const handleDelete = async () => {
        if (!formData.docNo) return;
        try {
            const res = await salesOrderService.deleteOrder(formData.docNo, formData.company);
            showSuccessToast(res.message);
            handleClear();
            if (onClose) onClose();
        } catch (error) {
            showErrorToast(error.response?.data?.message || "Operation failed");
        }
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
                ...formData, docNo: header.doc_No || '',
                date: (header.post_Date || new Date().toISOString().split('T')[0]).split('T')[0],
                custCode: header.vendor_Id || '',
                custName: lookups.customers.find(c => c.code === header.vendor_Id)?.name || '',
                jobNo: header.remarks || '-NO-', salesRef: header.salesRef || '',
                payType: header.pay_Type || 'Cash',
                dueDate: (header.expected_Date || new Date().toISOString().split('T')[0]).split('T')[0],
                creditPeriod: header.crdtPeriod || '0', refNo: header.reference || '',
                discPer: header.purDiscount || 0, adjType: header.adjType || 'Add',
                adjValue: header.adjst || 0, comment: header.comment || ''
            });
            setRows(details.map(d => ({
                id: Math.random(), prodCode: d.prod_Code || '', prodName: d.prod_Name || '',
                unit: d.unit || '', cost: parseFloat(d.purchase_Price) || 0,
                selling: parseFloat(d.selling_Price) || 0, qty: parseFloat(d.qty) || 0,
                discPer: parseFloat(d.disc) || 0, discount: parseFloat(d.discount) || 0,
                amount: parseFloat(d.amount) || 0
            })));
            setShowSearchModal(false);
        } catch (error) {
            showErrorToast("Failed to load order");
        }
    };

    return (
        <>
            <style>{`@keyframes toastProgress { 0% { width: 100%; } 100% { width: 0%; } }`}</style>
            <TransactionFormWrapper
                isOpen={isOpen} onClose={onClose}
                title="Sales Order"
                subtitle="Sales Transactions"
                icon={ShoppingCart}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={handleDelete} className="px-6 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> DELETE
                            </button>
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RefreshCw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => handleSave(false)} className="px-6 h-10 border-2 border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button onClick={() => handleSave(true)} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Check size={14} /> APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc No</label>
                                <div className="relative">
                                    <input type="text" value={formData.docNo} onChange={handleInputChange} name="docNo" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date} onClick={() => setShowDateModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => setShowDateModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Job No</label>
                                <div className="relative">
                                    <select value={formData.jobNo} onChange={e => setFormData(prev => ({ ...prev, jobNo: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer truncate" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}>
                                        <option value="-NO-">-NO-</option>
                                        {(lookups.jobs || []).map((j, idx) => (
                                            <option key={idx} value={j}>{j}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Sales Asst</label>
                                <div className="relative">
                                    <select
                                        value={lookups.salesAssistants}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const s = (lookups.salesAssistants || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (s) {
                                                setFormData({ ...formData, salesRef: s.code });
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.salesAssistants || []).map((s, idx) => (
                                            <option key={idx} value={s.code || s.itemId || s.id || s.name || s}>
                                                {s.code ? `${s.code} - ${s.name}` : (s.itemId ? `${s.itemId} - ${s.itemName || s.name}` : (s.name || s))}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer</label>
                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={formData.custCode} className="w-24 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none text-gray-700 font-mono shrink-0" />
                                        <div className="relative flex-1">
                                            <select
                                        value={formData.custName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const c = (lookups.customers || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (c) {
                                                setFormData({ ...formData, custCode: c.code, custName: c.name });
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.customers || []).map((c, idx) => (
                                            <option key={idx} value={c.code || c.itemId || c.id || c.name || c}>
                                                {c.code ? `${c.code} - ${c.name}` : (c.itemId ? `${c.itemId} - ${c.itemName || c.name}` : (c.name || c))}
                                            </option>
                                        ))}
                                    </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ref. No</label>
                                <input type="text" name="refNo" value={formData.refNo} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay Type</label>
                                <div className="relative">
                                    <select
                                        value={formData.payType}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const t = (lookups.paymentTypes || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (t) {
                                                setFormData({ ...formData, payType: t.name });
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.paymentTypes || []).map((t, idx) => (
                                            <option key={idx} value={t.code || t.itemId || t.id || t.name || t}>
                                                {t.code ? `${t.code} - ${t.name}` : (t.itemId ? `${t.itemId} - ${t.itemName || t.name}` : (t.name || t))}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit Period</label>
                                <input type="text" name="creditPeriod" value={formData.creditPeriod} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Due Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.dueDate} onClick={() => setShowDueDateModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => setShowDueDateModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-[3px] bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Selection Portfolio</span>
                            <button onClick={addRow} className="h-7 px-3 bg-[#0285fd] text-white text-[10px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all flex items-center gap-1.5 border-none shadow-sm active:scale-95">
                                <Plus size={13} /> ADD LINE ITEM
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-3 w-40">PROD. ID</th>
                                        <th className="px-3">PRODUCT NAME</th>
                                        <th className="px-3 text-center w-20">UNIT</th>
                                        <th className="px-3 text-right w-28">SELLING</th>
                                        <th className="px-2 text-right w-20">QTY</th>
                                        <th className="px-2 text-right w-20">DIS %</th>
                                        <th className="px-4 text-right w-32">AMOUNT</th>
                                        <th className="w-12"></th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rows.map((row, idx) => (
                                        <tr key={row.id} className="text-[12px] font-bold text-gray-700 border-b border-gray-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-2 py-1">
                                                <select value={row.prodCode} onChange={e => handleRowChange(row.id, 'prodCode', e.target.value)} className="w-full h-8 border border-gray-200 rounded-[3px] px-2 text-[12px] font-mono text-blue-700 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] appearance-none cursor-pointer truncate" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}>
                                        <option value="">-- Select --</option>
                                        {(lookups.products || []).map((p, idx) => (
                                            <option key={idx} value={p.code}>{p.code} - {p.name}</option>
                                        ))}
                                    </select>
                                            </td>
                                            <td className="px-3 py-2.5 truncate">{row.prodName}</td>
                                            <td className="px-3 py-2.5 text-center text-gray-400">{row.unit}</td>
                                            <td className="px-1 py-1">
                                                <input type="number" value={row.selling} onChange={(e) => handleRowChange(row.id, 'selling', e.target.value)} className="w-full h-8 border border-gray-200 rounded-[3px] text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2" />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input type="number" value={row.qty} onChange={(e) => handleRowChange(row.id, 'qty', e.target.value)} className="w-full h-8 border border-gray-200 rounded-[3px] text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2" />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input type="number" value={row.discPer} onChange={(e) => handleRowChange(row.id, 'discPer', e.target.value)} className="w-full h-8 border border-gray-200 rounded-[3px] text-right text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] px-2" />
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-black">{row.amount.toFixed(2)}</td>
                                            <td className="py-1 text-center">
                                                <button onClick={() => removeRow(row.id)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-full">
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
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Comments</label>
                                    <textarea name="comment" value={formData.comment} onChange={handleInputChange} className="w-full h-[128px] border border-gray-300 rounded-[3px] p-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] resize-none text-gray-700" />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 space-y-3">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-medium text-gray-700">Total</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-28 h-8 text-center text-[11px] font-mono font-bold border border-gray-200 rounded-[3px] bg-gray-50 flex items-center justify-center text-gray-500">
                                            Qty: {totals.sumQty}
                                        </div>
                                        <div className="w-28 h-8 text-right text-[13px] font-mono font-bold bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-gray-800">
                                            {totals.sumAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Over Discount</span>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input type="number" name="discPer" value={formData.discPer} onChange={handleInputChange} className="w-16 h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">%</span>
                                        </div>
                                        <div className="w-28 h-8 bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-[13px] font-mono text-gray-500">
                                            {totals.headerDiscount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Tax Amount</span>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input type="number" name="taxPer" value={formData.taxPer} onChange={handleInputChange} className="w-16 h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">%</span>
                                        </div>
                                        <div className="w-28 h-8 bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-[13px] font-mono text-gray-500">
                                            {totals.taxVal.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Adjustment</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setFormData({...formData, adjType: formData.adjType === 'Add' ? 'Less' : 'Add'})} className="w-16 h-8 text-[10px] font-black text-white bg-gray-400 hover:bg-gray-500 rounded-full uppercase shadow-sm transition-all active:scale-95">
                                            {formData.adjType}
                                        </button>
                                        <input type="number" name="adjValue" value={formData.adjValue} onChange={handleInputChange} className="w-28 h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200 my-1" />
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-[3px]">
                                    <span className="text-[14px] font-black text-gray-800 uppercase">Net Amount</span>
                                    <span className="text-[22px] font-mono font-black text-[#0285fd] tracking-tight">{totals.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showCustModal} onClose={() => setShowCustModal(false)} title="Customer Directory" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={custSearch} onChange={(e) => setCustSearch(e.target.value)} autoFocus placeholder="Search customer..." />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.customers.filter(c => c.name?.toLowerCase().includes(custSearch.toLowerCase()) || c.code?.toLowerCase().includes(custSearch.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData({ ...formData, custCode: c.code, custName: c.name }); setShowCustModal(false); }}>
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

            <SimpleModal isOpen={showSalesAsstModal} onClose={() => setShowSalesAsstModal(false)} title="Sales Assistants" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={salesAsstSearch} onChange={(e) => setSalesAsstSearch(e.target.value)} autoFocus placeholder="Search..." />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.salesAssistants.filter(s => s.name?.toLowerCase().includes(salesAsstSearch.toLowerCase()) || s.code?.toLowerCase().includes(salesAsstSearch.toLowerCase())).map((s, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData({ ...formData, salesRef: s.code }); setShowSalesAsstModal(false); }}>
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



            <SimpleModal isOpen={showPayTypeModal} onClose={() => setShowPayTypeModal(false)} title="Payment Types" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Type</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.paymentTypes.map((t, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData({ ...formData, payType: t.name }); setShowPayTypeModal(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{t.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{t.name}</td>
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



            <SimpleModal isOpen={showSearchModal} onClose={() => { setShowSearchModal(false); setOrderSearch(''); }} title="Historical Document Directory" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Global Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter by document id or creation date..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Reference ID</th>
                                        <th className=" px-5 py-3">Ledger Posting Date</th>
                                        <th className="text-center px-5 py-3">Status</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders
                                        .filter(o => !orderSearch || o.docNo.toLowerCase().includes(orderSearch.toLowerCase()) || o.date?.includes(orderSearch))
                                        .length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Archive is currently empty</td></tr>
                                    ) : orders
                                        .filter(o => !orderSearch || o.docNo.toLowerCase().includes(orderSearch.toLowerCase()) || o.date?.includes(orderSearch))
                                        .map((order, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => loadOrder(order.docNo)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.docNo}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{order.date?.split('T')[0]}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-[3px] text-[9px] font-black uppercase ${order.status === 'Applied' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="text-right px-5 py-3">
                                                <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RETRIEVE</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showDateModal && (
                <CalendarModal isOpen={showDateModal} onClose={() => setShowDateModal(false)} currentDate={formData.date} onDateChange={(d) => { setFormData({ ...formData, date: d }); setShowDateModal(false); }} title="Select Date" />
            )}
            {showDueDateModal && (
                <CalendarModal isOpen={showDueDateModal} onClose={() => setShowDueDateModal(false)} currentDate={formData.dueDate} onDateChange={(d) => { setFormData({ ...formData, dueDate: d }); setShowDueDateModal(false); }} title="Select Due Date" />
            )}

            {showReceipt && receiptData && (
                <SalesOrderDetailModal
                    isOpen={showReceipt}
                    onClose={() => { setShowReceipt(false); setReceiptData(null); }}
                    preloadedData={receiptData}
                    docNo={receiptData.header.docNo}
                />
            )}
        </>
    );
};

export default SalesOrderBoard;
