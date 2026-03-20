import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw, Trash2, Plus, X } from 'lucide-react';
import { salesOrderService } from '../services/salesOrder.service';
import { toast } from 'react-hot-toast';

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
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Sales Order"
            maxWidth="max-w-[1100px]"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 pl-4">
                        <span className="text-[24px] font-black italic text-[#0078d4]/30 tracking-tighter select-none">onimta IT</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSave(true)} className="px-10 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded shadow-sm hover:bg-[#005a9e] transition-all min-w-[100px]">Save</button>
                        <button onClick={handleClear} className="px-10 h-8 bg-white border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-all min-w-[100px]">Clear</button>
                        <button onClick={onClose} className="px-10 h-8 bg-white border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-all min-w-[100px]">Exit</button>
                    </div>
                </div>
            }
        >
            <div className="space-y-3 p-1 font-['Plus_Jakarta_Sans']">
                {/* 1. Header Sections */}
                <div className="grid grid-cols-12 gap-x-6 gap-y-2.5 bg-[#f8f9fa] p-4 border border-gray-200 rounded shadow-sm">
                    <div className="col-span-8 grid grid-cols-2 gap-x-8 gap-y-2.5">
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Document No</label>
                            <div className="flex flex-1 gap-1">
                                <input type="text" value={formData.docNo} onChange={handleInputChange} name="docNo" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#0078d4] outline-none" />
                                <button onClick={handleSearchClick} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e]"><Search size={14} /></button>
                                <button onClick={generateDocNo} className="w-8 h-7 bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-200"><RefreshCw size={14} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-20">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none bg-white" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Customer</label>
                            <div className="flex flex-1 gap-1">
                                <select name="custCode" value={formData.custCode} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-1 text-[11px] outline-none bg-white">
                                    <option value="">Select Customer</option>
                                    {lookups.customers.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                                <input type="text" readOnly value={formData.custCode} className="w-24 h-7 border border-gray-300 px-2 text-[11px] bg-gray-50 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-20">Ref. No</label>
                            <input type="text" name="refNo" value={formData.refNo} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Payment Type</label>
                            <select name="payType" value={formData.payType} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white">
                                <option>Cash</option>
                                <option>Credit</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-20">Due Date</label>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none bg-white" />
                        </div>
                    </div>
                    <div className="col-span-4 space-y-2.5 pl-6 border-l border-gray-200">
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Job. Number</label>
                            <select name="jobNo" value={formData.jobNo} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white">
                                <option>-NO-</option>
                                {lookups.jobs.map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Sales Assistant</label>
                            <select name="salesRef" value={formData.salesRef} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white">
                                <option value="">Select Asst</option>
                                {lookups.salesAssistants.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Credit Period</label>
                            <input type="text" name="creditPeriod" value={formData.creditPeriod} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                    </div>
                </div>

                {/* 2. Grid */}
                <div className="border border-gray-300 rounded shadow-inner bg-white overflow-hidden min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f1f3f5] border-b border-gray-300 text-gray-600 text-[11px] font-black uppercase tracking-wider sticky top-0">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-300 w-28">Prod. ID</th>
                                <th className="px-3 py-2 border-r border-gray-300">Product Name</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-20">Unit</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-24 text-right">Selling</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-20 text-right">Qty</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-20 text-right">Dis %</th>
                                <th className="px-3 py-2 w-28 text-right">Amount</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                                    <td className="px-1 py-0 border-r border-gray-100">
                                        <select value={row.prodCode} onChange={(e) => handleRowChange(row.id, 'prodCode', e.target.value)} className="w-full h-7 px-1 text-[11px] outline-none bg-transparent">
                                            <option value="">Select</option>
                                            {lookups.products.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-[12px] truncate max-w-[200px]" title={row.prodName}>{row.prodName}</td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-[12px] text-center">{row.unit}</td>
                                    <td className="px-1 py-0 border-r border-gray-100"><input type="number" value={row.selling} onChange={(e) => handleRowChange(row.id, 'selling', e.target.value)} className="w-full h-7 px-1 text-[12px] text-right outline-none bg-transparent" /></td>
                                    <td className="px-1 py-0 border-r border-gray-100"><input type="number" value={row.qty} onChange={(e) => handleRowChange(row.id, 'qty', e.target.value)} className="w-full h-7 px-1 text-[12px] text-right outline-none bg-transparent font-bold" /></td>
                                    <td className="px-1 py-0 border-r border-gray-100"><input type="number" value={row.discPer} onChange={(e) => handleRowChange(row.id, 'discPer', e.target.value)} className="w-full h-7 px-1 text-[12px] text-right outline-none bg-transparent" /></td>
                                    <td className="px-2 py-1 text-right text-[12px] font-bold text-gray-700">{row.amount.toFixed(2)}</td>
                                    <td className="px-1 py-1 text-center">
                                        <button onClick={() => removeRow(row.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addRow} className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#0078d4] font-bold hover:bg-blue-50 w-full transition-colors border-t border-gray-100">
                        <Plus size={14} /> Add Line Item
                    </button>
                </div>

                {/* 3. Calculations */}
                <div className="grid grid-cols-12 gap-4 pt-2">
                    <div className="col-span-7">
                        <textarea name="comment" value={formData.comment} onChange={handleInputChange} placeholder="Add comments here..." className="w-full h-full min-h-[120px] bg-white border border-gray-300 rounded-sm p-3 text-[12px] outline-none focus:border-blue-500 shadow-inner" />
                    </div>
                    <div className="col-span-5 space-y-1.5 bg-[#f8f9fa] p-3 border border-gray-200 rounded">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600 uppercase tracking-tight">Total</span>
                            <div className="flex gap-1 w-56">
                                <input type="text" readOnly value={totals.sumQty} className="w-16 h-7 text-center text-[12px] border border-gray-300 bg-gray-50 font-bold" placeholder="Qty" />
                                <input type="text" readOnly value={totals.sumDisc.toFixed(2)} className="w-20 h-7 text-right text-[11px] border border-gray-300 bg-gray-50 px-2" />
                                <input type="text" readOnly value={totals.sumAmount.toFixed(2)} className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-gray-50 px-2 font-bold" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600 uppercase tracking-tight">Over Discount</span>
                            <div className="flex gap-1 w-56">
                                <input type="number" name="discPer" value={formData.discPer} onChange={handleInputChange} className="w-16 h-7 text-center text-[12px] border border-gray-300 outline-none" />
                                <span className="flex items-center text-[12px] font-black text-gray-400 px-1">%</span>
                                <input type="text" readOnly value={totals.headerDiscount.toFixed(2)} className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-white px-2 outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600 uppercase tracking-tight">Tax Amount</span>
                            <div className="flex gap-1 w-56">
                                <input type="number" name="taxPer" value={formData.taxPer} onChange={handleInputChange} className="w-16 h-7 text-center text-[12px] border border-gray-300 outline-none" />
                                <span className="flex items-center text-[12px] font-black text-gray-400 px-1">%</span>
                                <input type="text" readOnly value={totals.taxVal.toFixed(2)} className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-white px-2 outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600 uppercase tracking-tight">Adjustment</span>
                            <div className="flex gap-1 w-56">
                                <select name="adjType" value={formData.adjType} onChange={handleInputChange} className="w-24 h-7 text-[11px] border border-gray-300 outline-none"><option>Add</option><option>Less</option></select>
                                <input type="number" name="adjValue" value={formData.adjValue} onChange={handleInputChange} className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-white px-2 outline-none font-bold" />
                            </div>
                        </div>
                        <div className="h-[1px] bg-gray-300 my-1.5" />
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-black text-[#0078d4] uppercase tracking-tighter">Net Amount</span>
                            <div className="w-56 h-9 bg-[#e6f2ff] border-2 border-[#0078d4]/40 flex items-center px-4 rounded-sm shadow-[inset_0_1px_2px_rgba(0,119,211,0.1)]">
                                <span className="text-[#0078d4] text-[11px] font-black mr-2">RS.</span>
                                <input type="text" readOnly value={totals.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="w-full text-right text-[17px] font-black text-[#000080] outline-none bg-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Search Sales Orders" maxWidth="max-w-md">
                <div className="p-2 space-y-2">
                    {orders.length === 0 ? <p className="text-center py-4 text-gray-400">No draft orders found</p> : 
                        orders.map(o => (
                            <div key={o.docNo} onClick={() => loadOrder(o.docNo)} className="p-3 border rounded hover:bg-blue-50 cursor-pointer flex justify-between items-center group">
                                <span className="font-bold text-[#0078d4]">{o.docNo}</span>
                                <span className="text-[11px] text-gray-500 group-hover:text-gray-700">{o.date?.split('T')[0]}</span>
                            </div>
                        ))
                    }
                </div>
            </SimpleModal>
        </SimpleModal>
    );
};

export default SalesOrderBoard;
