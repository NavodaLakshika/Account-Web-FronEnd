import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, CheckCircle, Trash2, XCircle , Save, X} from 'lucide-react';
import { grnService } from '../services/grn.service';
import { toast } from 'react-hot-toast';

const GRNBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [], pos: [] });
    const [showSearchModal, setShowSearchModal] = useState(false);
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
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleApply = async () => {
        if (!formData.suppCode) return toast.error('Select Supplier.');
        if (products.length === 0) return toast.error('No products entered.');
        
        if (!window.confirm("Are you sure you want to Save & Apply this GRN?")) return;

        const payload = preparePayload();
        try {
            await grnService.apply(payload);
            toast.success('GRN Applied successfully.');
            handleClear();
        } catch (error) {
            toast.error(error.toString());
        }
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
        } catch (error) {
            toast.error('Failed to load saved GRNs.');
        }
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
                suppCode: h.vendor_Id || '',
                payType: h.pay_Type || 'Cash',
                suppInv: h.inv_No || '',
                invAmount: h.inv_Amount?.toString() || '0.00',
                consignmentBasis: h.bill_Type || false,
                comment: h.comment || '',
                poNo: h.pO_No || '',
                taxPer: h.taxPer || '0',
                nbtPer: h.nbt?.toString() || '0',
                discPer: h.purDiscount?.toString() || '0', // Adjust if you use percentage in model
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
        } catch (error) {
            toast.error('Failed to fetch order details.');
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Good Received Note (GRN)"
            maxWidth="max-w-[1100px]"
            footer={
                <div className="flex justify-between items-center w-full px-2">
                    <button onClick={handleClear} className="px-6 h-8 bg-gray-100 text-gray-700 font-bold rounded border hover:bg-gray-200">Clear</button>
                    <div className="flex gap-2">
                        <button onClick={handleApply} className="px-10 h-8 bg-[#0078d4] text-white font-bold rounded shadow hover:bg-[#005a9e] flex items-center gap-2">
                            <CheckCircle size={14} /> Save & Apply
                        </button>
                        <button onClick={handleSaveDraft} className="px-8 h-8 bg-white text-[#0078d4] border border-[#0078d4] font-bold rounded hover:bg-blue-50">Save Draft</button>
                        <button onClick={onClose} className="px-8 h-8 bg-gray-600 text-white font-bold rounded hover:bg-gray-700"><X size={14} /> Exit</button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 p-1 overflow-y-auto no-scrollbar font-['Inter']">
                {/* Header Information */}
                <div className="bg-white p-4 border border-gray-200 rounded-sm shadow-sm space-y-3">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-3">
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Doc No</label>
                            <div className="flex-1 flex gap-1">
                                <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} className="flex-1 h-7 border border-[#0078d4]/30 px-2 text-[12px] font-bold text-[#000080]" />
                                <button onClick={handleSearchClick} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e]"><Search size={14} /></button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-24">Date</label>
                            <input type="date" name="grnDate" value={formData.grnDate} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px]" />
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-24">Expected On</label>
                            <input type="date" name="expectedDate" value={formData.expectedDate} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px]" />
                        </div>

                        <div className="col-span-6 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Supplier</label>
                            <select name="suppCode" value={formData.suppCode} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#b91c1c]">
                                <option value="">Select Supplier...</option>
                                {lookups.suppliers.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div className="col-span-3 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-24">PO Number</label>
                            <select name="poNo" value={formData.poNo} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-1 text-[12px]">
                                <option value="">-NO-</option>
                                {lookups.pos.map(p => <option key={p.docNo} value={p.docNo}>{p.docNo}</option>)}
                            </select>
                        </div>
                        <div className="col-span-3 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-24">Payment</label>
                            <select name="payType" value={formData.payType} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px]">
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Credit">Credit</option>
                            </select>
                        </div>

                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-24">Supplier Inv.</label>
                            <input type="text" name="suppInv" value={formData.suppInv} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px]" />
                        </div>
                        <div className="col-span-3 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700">Inv Amount</label>
                            <input type="text" name="invAmount" value={formData.invAmount} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] text-right" />
                        </div>
                        <div className="col-span-5 flex items-center gap-6 pl-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="consignmentBasis" checked={formData.consignmentBasis} onChange={handleInput} className="w-4 h-4 text-[#0078d4]" />
                                <span className="text-[11px] font-bold text-gray-600 uppercase">Consignment Basis</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="acceptOtherSupp" checked={formData.acceptOtherSupp} onChange={handleInput} className="w-4 h-4 text-[#0078d4]" />
                                <span className="text-[11px] font-bold text-gray-600 uppercase">Other Supp. Product</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Main Table Section */}
                <div className="border border-[#0078d4]/20 rounded bg-white shadow-sm flex flex-col min-h-[300px]">
                    <div className="flex bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase">
                        <div className="flex-[2] py-2 px-3 border-r">Product Name</div>
                        <div className="w-16 py-2 px-3 border-r text-center">Unit</div>
                        <div className="w-24 py-2 px-3 border-r text-right">Cost</div>
                        <div className="w-24 py-2 px-3 border-r text-right">Selling</div>
                        <div className="w-16 py-2 px-3 border-r text-center">Qty</div>
                        <div className="w-16 py-2 px-3 border-r text-center">Free</div>
                        <div className="w-28 py-2 px-3 text-right">Amount</div>
                        <div className="w-8"></div>
                    </div>

                    <div className="flex bg-yellow-50/30 border-b border-yellow-200 p-1 gap-1 items-center">
                        <div className="flex-[2] px-1">
                            <select name="prodCode" value={entry.prodCode} onChange={handleEntryInput} className="w-full h-7 border border-yellow-300 bg-white font-bold px-2 text-[12px] outline-none rounded-sm">
                                <option value="">Select Product...</option>
                                {lookups.products.map(p => <option key={p.code} value={p.code}>{p.name} [{p.code}]</option>)}
                            </select>
                        </div>
                        <div className="w-16"><input type="text" readOnly value={entry.unit} className="w-full h-7 border bg-gray-50 text-center text-[12px] font-bold outline-none rounded-sm text-gray-400" /></div>
                        <div className="w-24 px-1"><input type="text" name="cost" value={entry.cost} onChange={handleEntryInput} className="w-full h-7 border border-yellow-300 text-right px-2 text-[12px] font-bold outline-none rounded-sm" /></div>
                        <div className="w-24 px-1"><input type="text" name="selling" value={entry.selling} onChange={handleEntryInput} className="w-full h-7 border border-yellow-300 text-right px-2 text-[12px] font-bold outline-none rounded-sm" /></div>
                        <div className="w-16 px-1"><input type="text" name="qty" ref={qtyRef} value={entry.qty} onChange={handleEntryInput} onKeyDown={e => e.key === 'Enter' && addProduct()} className="w-full h-7 border border-yellow-300 text-center text-[12px] font-black outline-none rounded-sm" /></div>
                        <div className="w-16 px-1"><input type="text" name="free" value={entry.free} onChange={handleEntryInput} onKeyDown={e => e.key === 'Enter' && addProduct()} className="w-full h-7 border border-yellow-300 text-center text-[12px] font-bold outline-none rounded-sm" /></div>
                        <div className="w-28 px-1"><input type="text" readOnly value={entry.amount} className="w-full h-7 border-none bg-transparent text-right text-[12px] font-black text-[#b91c1c] outline-none" /></div>
                        <div className="w-8"><button onClick={addProduct} className="w-7 h-7 bg-orange-500 text-white rounded-sm hover:bg-orange-600">+</button></div>
                    </div>

                    <div className="flex-1 bg-white overflow-y-auto max-h-[180px]">
                        {products.map((p, idx) => (
                            <div key={idx} className="flex border-b border-gray-100 text-[12px] font-semibold text-gray-600 items-center">
                                <div className="flex-[2] py-1.5 px-3 border-r truncate">{p.prodName} [{p.prodCode}]</div>
                                <div className="w-16 py-1.5 px-3 border-r text-center">{p.unit}</div>
                                <div className="w-24 py-1.5 px-3 border-r text-right font-mono">{parseFloat(p.cost).toFixed(2)}</div>
                                <div className="w-24 py-1.5 px-3 border-r text-right font-mono text-blue-600">{parseFloat(p.selling).toFixed(2)}</div>
                                <div className="w-16 py-1.5 px-3 border-r text-center font-bold">{p.qty}</div>
                                <div className="w-16 py-1.5 px-3 border-r text-center text-green-600">{p.free || '0'}</div>
                                <div className="w-28 py-1.5 px-3 text-right font-bold text-[#000080]">{parseFloat(p.amount).toFixed(2)}</div>
                                <div className="w-8 flex justify-center"><button onClick={() => setProducts(products.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="grid grid-cols-12 gap-6 items-start">
                    <div className="col-span-7 space-y-3">
                        <textarea name="comment" value={formData.comment} onChange={handleInput} placeholder="Add additional comments here..." className="w-full h-24 border border-gray-300 p-2 text-[12px] outline-none resize-none rounded-sm bg-gray-50/30"></textarea>
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

                    <div className="col-span-5 bg-blue-50/40 p-3 border border-[#0078d4]/20 rounded-sm space-y-1.5">
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-gray-700 lowercase leading-tight">Total</span>
                            <div className="flex gap-1 w-48">
                                <span className="w-16 text-center text-[11px] font-bold text-gray-400">Qty: {totals.sumQty}</span>
                                <span className="w-16 text-center text-[11px] font-bold text-gray-400">Free: {totals.sumFree}</span>
                                <input type="text" readOnly value={totals.sumTotal.toFixed(2)} className="flex-1 h-6 bg-white border border-gray-300 px-2 text-right font-bold text-[#000080]" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-gray-700 leading-tight">Discount</span>
                            <div className="flex gap-1 w-48">
                                <input type="text" name="discPer" value={formData.discPer} onChange={handleInput} className="w-12 h-6 border-b border-gray-300 bg-transparent text-center outline-none" />
                                <span className="flex items-center text-[10px] font-black text-gray-400">%</span>
                                <input type="text" readOnly value={totals.discAmt.toFixed(2)} className="flex-1 h-6 border bg-white px-2 text-right" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-gray-700 leading-tight">Tax / NBT</span>
                            <div className="flex gap-1 w-48">
                                <input type="text" name="taxPer" value={formData.taxPer} onChange={handleInput} className="w-10 h-6 border-b border-gray-300 bg-transparent text-center outline-none" placeholder="T" />
                                <input type="text" name="nbtPer" value={formData.nbtPer} onChange={handleInput} className="w-10 h-6 border-b border-gray-300 bg-transparent text-center outline-none" placeholder="N" />
                                <input type="text" readOnly value={(totals.taxAmt + totals.nbtAmt).toFixed(2)} className="flex-1 h-6 border bg-white px-2 text-right" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-gray-700 leading-tight">Adjustment</span>
                            <div className="flex gap-1 w-48">
                                <select name="adjType" value={formData.adjType} onChange={handleInput} className="w-16 h-6 text-[10px] border border-gray-300 outline-none rounded-sm">
                                    <option value="">None</option>
                                    <option value="Add">Add</option>
                                    <option value="Less">Less</option>
                                </select>
                                <input type="text" name="adjAmt" value={formData.adjAmt} onChange={handleInput} className="flex-1 h-6 border bg-white px-2 text-right" />
                            </div>
                        </div>
                        <div className="h-[1px] bg-blue-200 my-1" />
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-black text-[#000080] uppercase tracking-tighter italic">Net Amount</span>
                            <div className="w-48 h-8 bg-white border border-[#0078d4] flex items-center px-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                                <span className="text-[10px] font-black text-gray-300 pr-1">Rs.</span>
                                <input type="text" readOnly value={totals.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="w-full text-right text-[16px] font-black text-[#0078d4] outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRN Picker Modal */}
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
        </SimpleModal>
    );
};

export default GRNBoard;
