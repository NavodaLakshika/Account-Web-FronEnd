import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, CheckCircle, Trash2, Printer } from 'lucide-react';
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
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Purchase Order"
            maxWidth="max-w-[1000px]"
            footer={
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2 text-[10px]">
                         <button onClick={handleDelete} className="px-4 h-8 bg-red-600 text-white font-bold rounded-sm border border-red-700 hover:bg-red-700 shadow-sm flex items-center gap-2">
                             <Trash2 size={14} /> Delete Draft
                         </button>
                    </div>
                    <div className="flex justify-end gap-2 flex-1">
                        <button onClick={handleApply} className="px-6 h-8 bg-[#0078d4] text-white text-[12px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all flex items-center gap-2 shrink-0">
                            <CheckCircle size={14} /> Save & Apply
                        </button>
                        <button onClick={handleSave} className="px-6 h-8 bg-white text-[#0078d4] text-[12px] font-bold rounded-sm border border-[#0078d4] hover:bg-blue-50 shadow-sm transition-all shrink-0">
                            Save Draft
                        </button>
                        <button onClick={handleClear} className="px-6 h-8 bg-[#0078d4] text-white text-[12px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all">
                            Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-8 bg-[#0078d4] text-white text-[12px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all">
                            Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 overflow-y-auto no-scrollbar font-['Inter']">
                <div className="bg-white p-3 border border-gray-200 rounded-sm shadow-sm space-y-3">
                    <div className="grid grid-cols-12 gap-x-8 gap-y-2.5">
                        
                        <div className="col-span-4 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">PO No</label>
                             <div className="flex-1 flex gap-1">
                                <input type="text" name="docNo" value={formData.docNo} onChange={handleInput} onKeyDown={(e) => e.key === 'Enter' && handleSelectOrder(formData.docNo)} className="flex-1 h-7 border border-[#0078d4]/50 px-2 text-[12px] font-bold text-[#000080] bg-blue-50/20 rounded-sm outline-none focus:border-blue-500" />
                                <button onClick={handleSearch} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                    <Search size={14} />
                                </button>
                             </div>
                        </div>

                        <div className="col-span-4 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">PO Date</label>
                             <input type="date" name="postDate" value={formData.postDate} onChange={handleInput} className="flex-1 h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-white text-gray-700" />
                        </div>

                        <div className="col-span-4 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Expected Date</label>
                             <input type="date" name="expectedDate" value={formData.expectedDate} onChange={handleInput} className="flex-1 h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-white text-gray-700" />
                        </div>

                        <div className="col-span-8 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Supplier</label>
                             <div className="flex-1 relative">
                                 <select name="vendorId" value={formData.vendorId} onChange={handleInput} className="w-full h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#b91c1c] bg-white rounded-sm outline-none focus:border-blue-500">
                                     <option value="">Select Supplier...</option>
                                     {lookups.suppliers.map((s, i) => <option key={i} value={s.code}>{s.name} ({s.code})</option>)}
                                 </select>
                             </div>
                        </div>

                        <div className="col-span-4 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Payment By</label>
                             <select name="payType" value={formData.payType} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold bg-white rounded-sm outline-none">
                                <option value="">Select...</option>
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Credit">Credit</option>
                             </select>
                        </div>
                        
                        <div className="col-span-6 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">Remarks</label>
                             <input type="text" name="remarks" value={formData.remarks} onChange={handleInput} className="flex-1 h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-white text-gray-700" />
                        </div>
                        
                        <div className="col-span-6 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-24 shrink-0">B.Ref / Shift</label>
                             <input type="text" name="reference" value={formData.reference} onChange={handleInput} className="flex-1 h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-white text-gray-700" />
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
                        <div className="flex-[2] px-1">
                            <select name="prodCode" value={entry.prodCode} onChange={handleEntryInput} className="w-full h-7 border border-orange-300 bg-white font-bold px-2 outline-none rounded-sm focus:border-blue-500">
                                <option value="">Select Product...</option>
                                {lookups.products.map(p => <option key={p.code} value={p.code}>{p.name} [{p.code}]</option>)}
                            </select>
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
        </SimpleModal>
    );
};

export default PurchaseOrderBoard;
