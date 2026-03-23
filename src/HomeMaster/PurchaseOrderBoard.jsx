import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, CheckCircle, Trash2, Printer, X, Save, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { purchOrderService } from '../services/purchOrder.service';
import { toast } from 'react-hot-toast';

const PurchaseOrderBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [] });

    const [formData, setFormData] = useState({
        docNo: '',
        company: 'C001',
        createUser: 'SYSTEM',
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
    const [showSupplierSearch, setShowSupplierSearch] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('postDate');
    const [viewDate, setViewDate] = useState(new Date());

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
            const data = await purchOrderService.getLookups(company);
            setLookups(data);
        } catch (error) {
            toast.error('Failed to load suppliers/products.');
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await purchOrderService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            toast.error('Failed to generate document number.');
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
        if (!entry.prodCode) return toast.error('Select a Product.');
        if (!entry.qty || parseFloat(entry.qty) <= 0) return toast.error('Enter valid Quantity.');

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
            toast.error('Failed to load purchase orders.');
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
            toast.success("Order Loaded Successfully.");
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleSave = async () => {
        if (!formData.vendorId) return toast.error('Select User/Supplier.');
        if (!formData.payType) return toast.error('Payment type has not been selected.');
        if (products.length === 0) return toast.error('No products entered.');

        const payload = preparePayload();

        try {
            const resp = await purchOrderService.save(payload);
            toast.success(`Draft saved successfully (${resp.docNo}).`);
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleApply = async () => {
        if (!formData.vendorId) return toast.error('Select User/Supplier.');
        if (!formData.payType) return toast.error('Payment type has not been selected.');
        if (products.length === 0) return toast.error('No products entered.');

        if (!window.confirm("Are you sure you want to save and apply this record?")) return;

        const payload = preparePayload();

        try {
            const resp = await purchOrderService.apply(payload);
            toast.success(`Record applied successfully (${resp.docNo}).`);
            handleClear();
        } catch (error) {
            toast.error(error.toString());
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

    const handleDateSelect = (day) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Correct for timezone offset to ensure the local date string's YYYY-MM-DD is correct
        const offset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - offset).toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, [datePickerField]: localDate }));
        setShowDatePicker(false);
    };

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const startDay = new Date(year, month, 1).getDay();
        const res = [];
        for (let i = 0; i < startDay; i++) res.push(null);
        for (let i = 1; i <= days; i++) res.push(i);
        return res;
    }, [viewDate]);

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
        if (!window.confirm("Are you sure you want to delete this record?")) return;

        try {
            await purchOrderService.delete(formData.docNo, formData.company);
            toast.success('Record deleted successfully.');
            handleClear();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Purchase Order"
                maxWidth="max-w-[1000px]"
                footer={
                    <>
                        <div className="flex-1 flex gap-2">
                            <button
                                onClick={handleDelete}
                                className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-md hover:bg-red-100 transition-all active:scale-95 flex items-center gap-2 border border-red-100 uppercase"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClear}
                                className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> Clear
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 h-10 bg-white text-[#0078d4] text-sm font-bold rounded-md border border-[#0078d4] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Save size={14} /> Save Draft
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2"
                            >
                                <CheckCircle size={14} /> Save & Apply
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none"
                            >
                                <X size={14} /> Exit
                            </button>
                        </div>
                    </>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Inter']">
                    <div className="bg-white p-3 border border-gray-200 rounded-sm shadow-sm space-y-3">
                        <div className="grid grid-cols-12 gap-x-8 gap-y-2.5">
                            {/* PO Number */}
                            <div className="col-span-4 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">PO No</label>
                                <div className="flex-1 flex gap-1">
                                    <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} onKeyDown={(e) => e.key === 'Enter' && handleSelectOrder(formData.docNo)} className="flex-1 h-7 border border-[#0078d4]/50 px-2 text-[12px] font-bold text-[#000080] bg-blue-50/20 rounded-sm outline-none focus:border-blue-500" />
                                    <button onClick={handleSearch} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* PO Date */}
                            <div className="col-span-4 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">PO Date</label>
                                <div className="flex-1 flex gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.postDate}
                                        className="flex-1 h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-gray-50 text-gray-700 font-bold cursor-pointer ml-[-30px]"
                                        onClick={() => { setDatePickerField('postDate'); setViewDate(new Date(formData.postDate)); setShowDatePicker(true); }}
                                    />
                                    <button
                                        onClick={() => { setDatePickerField('postDate'); setViewDate(new Date(formData.postDate)); setShowDatePicker(true); }}
                                        className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
                                    >
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Expected Date */}
                            <div className="col-span-4 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-28 shrink-0">Expected Date</label>
                                <div className="flex-1 flex gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.expectedDate}
                                        className="flex-1 w-7 h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-gray-50 text-gray-700 font-bold cursor-pointer"
                                        onClick={() => { setDatePickerField('expectedDate'); setViewDate(new Date(formData.expectedDate)); setShowDatePicker(true); }}
                                    />
                                    <button
                                        onClick={() => { setDatePickerField('expectedDate'); setViewDate(new Date(formData.expectedDate)); setShowDatePicker(true); }}
                                        className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
                                    >
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-8 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Supplier</label>
                                <div className="flex-1 flex gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.suppliers.find(s => s.code === formData.vendorId)?.name || 'Select Supplier...'}
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#b91c1c] bg-gray-50 rounded-sm outline-none"
                                    />
                                    <button onClick={() => setShowSupplierSearch(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-28 shrink-0">Payment By</label>
                                <select name="payType" value={formData.payType} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold bg-white rounded-sm outline-none">
                                    <option value="">Select...</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Credit">Credit</option>
                                </select>
                            </div>

                            <div className="col-span-6 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Remarks</label>
                                <input type="text" name="remarks" value={formData.remarks} onChange={handleInput} className="flex-1 h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-white text-gray-700 ml-[-16px]" />
                            </div>

                            <div className="col-span-6 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">B.Ref / Shift</label>
                                <input type="text" name="reference" value={formData.reference} onChange={handleInput} className="flex-1  h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-white text-gray-700" />
                            </div>

                        </div>
                    </div>

                    <div className="border border-[#0078d4]/30 rounded-sm bg-white shadow-sm flex flex-col min-h-[250px]">
                        <div className="flex bg-[#0078d4]/5 border-b border-[#0078d4]/20 text-[11px] font-bold text-[#0078d4] uppercase tracking-wide">
                            <div className="flex-[2] py-1.5 px-3 border-r border-[#0078d4]/20 truncate">Product Name</div>
                            <div className="flex-[0.8] py-1.5 px-3 border-r border-[#0078d4]/20 text-center">Unit</div>
                            <div className="flex-[1] py-1.5 px-3 border-r border-[#0078d4]/20 text-center">Qty</div>
                            <div className="flex-[1] py-1.5 px-3 border-r border-[#0078d4]/20 text-right">Price</div>
                            <div className="flex-[1.2] py-1.5 px-3 border-r border-[#0078d4]/20 text-right">Amount</div>
                            <div className="w-10"></div>
                        </div>

                        <div className="flex bg-[#ffffe6] border-b border-orange-200 text-[12px] p-1 gap-1 items-center">
                            <div className="flex-[2] px-1 flex gap-1">
                                <input
                                    type="text"
                                    readOnly
                                    value={entry.prodName || 'Select Product...'}
                                    className="flex-1 h-7 border border-orange-300 bg-white font-bold px-2 outline-none rounded-sm focus:border-blue-500 text-[12px]"
                                />
                                <button onClick={() => setShowProductSearch(true)} className="w-8 h-7 bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                </button>
                            </div>
                            <div className="flex-[0.8] px-1">
                                <input type="text" readOnly value={entry.unit} className="w-full h-7 border border-orange-200 bg-orange-50/50 px-2 text-center outline-none rounded-sm text-gray-500 font-semibold" />
                            </div>
                            <div className="flex-[1] px-1">
                                <input type="text" name="qty" ref={qtyRef} value={entry.qty} onChange={handleEntryInput} onKeyDown={e => e.key === 'Enter' && addProduct()} className="w-full h-7 border border-orange-300 bg-white px-2 text-center outline-none rounded-sm font-bold focus:border-blue-500" placeholder="Qty" />
                            </div>
                            <div className="flex-[1] px-1">
                                <input type="text" name="purchasePrice" value={entry.purchasePrice} onChange={handleEntryInput} onKeyDown={e => e.key === 'Enter' && addProduct()} className="w-full h-7 border border-orange-300 bg-white px-2 text-right outline-none rounded-sm font-semibold focus:border-blue-500" />
                            </div>
                            <div className="flex-[1.2] px-1">
                                <input type="text" readOnly value={entry.amount} className="w-full h-7 border border-orange-200 bg-white px-2 text-right outline-none rounded-sm font-bold text-[#b91c1c]" />
                            </div>
                            <div className="w-10 flex justify-center">
                                <button onClick={addProduct} className="w-7 h-7 bg-orange-500 text-white rounded-sm hover:bg-orange-600 flex items-center justify-center font-bold pb-0.5">+</button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white overflow-y-auto max-h-[160px]">
                            {products.map((p, idx) => (
                                <div key={idx} className="flex border-b border-gray-100 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 items-center">
                                    <div className="flex-[2] py-1.5 px-3 border-r border-gray-100 truncate" title={p.prodName}>{p.prodName} [{p.prodCode}]</div>
                                    <div className="flex-[0.8] py-1.5 px-3 border-r border-gray-100 text-center">{p.unit}</div>
                                    <div className="flex-[1] py-1.5 px-3 border-r border-gray-100 text-center font-bold">{p.qty}</div>
                                    <div className="flex-[1] py-1.5 px-3 border-r border-gray-100 text-right">{parseFloat(p.purchasePrice).toFixed(2)}</div>
                                    <div className="flex-[1.2] py-1.5 px-3 border-r border-gray-100 text-right font-bold text-[#000080]">{parseFloat(p.amount).toFixed(2)}</div>
                                    <div className="w-10 flex justify-center py-1">
                                        <button onClick={() => removeProduct(idx)} className="text-red-400 hover:text-red-600 p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-end gap-x-12">
                        <div className="flex-1 space-y-2">
                            <label className="text-[12px] font-bold text-gray-700">Comment</label>
                            <textarea name="comment" value={formData.comment} onChange={handleInput} className="w-full h-[80px] border border-gray-300 rounded-sm p-2 text-[12px] outline-none focus:border-blue-500 resize-none" placeholder="Add additional comments..."></textarea>
                        </div>

                        <div className="w-[300px] bg-blue-50/40 border border-[#0078d4]/20 rounded-sm p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-gray-700">Total Amount</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-400">Rs.</span>
                                    <input type="text" readOnly value={totals.sum.toFixed(2)} className="w-[100px] h-6 bg-white border border-gray-300 px-2 text-right text-[12px] font-bold text-[#000080] rounded-sm outline-none" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-gray-700">NBT %</span>
                                <input type="text" name="nbtAmnt" value={formData.nbtAmnt} onChange={handleInput} className="w-[125px] h-6 bg-white border border-gray-300 px-2 text-right text-[12px] rounded-sm outline-none focus:border-blue-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-gray-700">Tax Amt / %</span>
                                <input type="text" name="taxPer" value={formData.taxPer} onChange={handleInput} className="w-[125px] h-6 bg-white border border-gray-300 px-2 text-right text-[12px] rounded-sm outline-none focus:border-blue-500" />
                            </div>
                            <div className="h-[1px] bg-gray-300 my-1" />
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] font-black text-gray-900">Net Amount</span>
                                <input type="text" readOnly value={totals.netAmount.toFixed(2)} className="w-[125px] h-7 bg-[#e6f2ff] border border-[#0078d4] px-2 text-right text-[14px] font-black text-[#000080] rounded-sm outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Existing PO Picker Modal */}
            <SimpleModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                title="Select Saved Purchase Order"
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-2 p-2 max-h-[400px] overflow-y-auto">
                    {orders.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-[13px]">No saved orders found.</div>
                    ) : (
                        <table className="w-full text-[13px] border-collapse">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="py-2 px-3 text-left">Doc No</th>
                                    <th className="py-2 px-3 text-left">Date</th>
                                    <th className="w-16"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, i) => (
                                    <tr key={i} className="border-b hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => handleSelectOrder(order.docNo)}>
                                        <td className="py-2.5 px-3 font-bold text-[#000080]">{order.docNo}</td>
                                        <td className="py-2.5 px-3 text-gray-600">{order.date?.split('T')[0]}</td>
                                        <td className="py-2.5 px-3 text-right">
                                            <button className="text-[#0078d4] font-bold hover:underline">Select</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </SimpleModal>

            {/* Supplier Search Modal */}
            <SimpleModal
                isOpen={showSupplierSearch}
                onClose={() => setShowSupplierSearch(false)}
                title="Select Supplier"
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search supplier name or code..."
                            className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-md outline-none focus:border-[#0078d4] text-sm"
                            value={supplierSearchQuery}
                            onChange={(e) => setSupplierSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2.5 text-left font-bold text-gray-600 text-[11px] uppercase">Code</th>
                                    <th className="px-4 py-2.5 text-left font-bold text-gray-600 text-[11px] uppercase">Name</th>
                                    <th className="px-4 py-2.5 text-center font-bold text-gray-600 text-[11px] uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lookups.suppliers
                                    .filter(s => s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || s.code.toLowerCase().includes(supplierSearchQuery.toLowerCase()))
                                    .map(s => (
                                        <tr key={s.code} className="border-t border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => handleSelectSupplier(s)}>
                                            <td className="px-4 py-2 font-bold text-[#0078d4]">{s.code}</td>
                                            <td className="px-4 py-2 text-gray-700 font-medium">{s.name}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button className="text-[10px] font-bold text-[#0078d4] hover:underline">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Product Search Modal */}
            <SimpleModal
                isOpen={showProductSearch}
                onClose={() => setShowProductSearch(false)}
                title="Select Product"
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search product name or code..."
                            className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-md outline-none focus:border-orange-500 text-sm"
                            value={productSearchQuery}
                            onChange={(e) => setProductSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2.5 text-left font-bold text-gray-600 text-[11px] uppercase">Code</th>
                                    <th className="px-4 py-2.5 text-left font-bold text-gray-600 text-[11px] uppercase">Name</th>
                                    <th className="px-4 py-2.5 text-right font-bold text-gray-600 text-[11px] uppercase">Price</th>
                                    <th className="px-4 py-2.5 text-center font-bold text-gray-600 text-[11px] uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lookups.products
                                    .filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.code.toLowerCase().includes(productSearchQuery.toLowerCase()))
                                    .map(p => (
                                        <tr key={p.code} className="border-t border-gray-50 hover:bg-orange-50 transition-colors cursor-pointer" onClick={() => handleSelectProduct(p)}>
                                            <td className="px-4 py-2 font-bold text-orange-600">{p.code}</td>
                                            <td className="px-4 py-2 text-gray-700 font-medium">{p.name}</td>
                                            <td className="px-4 py-2 text-right font-bold text-gray-600">{p.price?.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button className="text-[10px] font-bold text-orange-500 hover:underline">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Date Selection Modal */}
            <SimpleModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                title={`Select ${datePickerField === 'postDate' ? 'PO Date' : 'Expected Date'}`}
                maxWidth="max-w-[320px]"
            >
                <div className="p-1 px-2">
                    {/* Header: Month & Year selection */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-all active:scale-90"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex gap-2">
                            <select
                                value={viewDate.getMonth()}
                                onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
                                className="text-[14px] font-bold text-slate-700 outline-none bg-transparent hover:text-[#0078d4] cursor-pointer appearance-none px-1"
                            >
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select
                                value={viewDate.getFullYear()}
                                onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
                                className="text-[14px] font-bold text-slate-700 outline-none bg-transparent hover:text-[#0078d4] cursor-pointer appearance-none px-1"
                            >
                                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-all active:scale-90"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Week Header */}
                    <div className="grid grid-cols-7 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d}</div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            if (!day) return <div key={i} className="h-8" />;

                            const isSelected = formData[datePickerField] === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split('T')[0];
                            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDateSelect(day)}
                                    className={`h-8 w-8 text-[12px] font-bold rounded-md flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-[#0078d4] text-white shadow-md'
                                        : isToday
                                            ? 'bg-blue-50 text-[#0078d4]'
                                            : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => { setViewDate(new Date()); handleDateSelect(new Date().getDate()); }}
                        className="w-full mt-4 py-1.5 text-[11px] font-bold text-[#0078d4] hover:bg-blue-50 rounded-md transition-colors"
                    >
                        GO TO TODAY
                    </button>
                </div>
            </SimpleModal>
        </>
    );
};

export default PurchaseOrderBoard;
