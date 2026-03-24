import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2, FileText, Landmark } from 'lucide-react';
import receivePaymentService from '../services/receivePayment.service';
import { toast } from 'react-hot-toast';

const CustomerReceiptBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], costCenters: [], customers: [], subAccounts: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        customerId: '',
        customerName: '',
        amount: 0,
        paymentType: 'Cash',
        bankId: '',
        bankName: '',
        branch: '',
        costCenter: '',
        chequeNo: '',
        chequeDate: new Date().toISOString().split('T')[0],
        reference: '',
        memo: '',
        company: 'C001',
        createUser: 'SYSTEM'
    });

    const [rows, setRows] = useState([]);
    const [totals, setTotals] = useState({
        outstanding: 0,
        advance: 0,
        paid: 0,
        discount: 0,
        debit: 0,
        ending: 0
    });

    const [activeModal, setActiveModal] = useState(null); // 'customer', 'bank', 'cc'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';

            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const companyCode = formData.company || 'C001';
            const [lookupRes, docRes] = await Promise.all([
                receivePaymentService.getLookups(companyCode, 'MM'), // Default to Medical Members type mapping if needed
                receivePaymentService.generateDoc(companyCode)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo.replace('REP', 'CPY') })); // Matching UI Screenshot prefix CPY
        } catch (error) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerChange = async (custId) => {
        const cust = lookups.customers.find(c => c.Code === custId);
        setFormData(prev => ({ ...prev, customerId: custId, customerName: cust?.Cust_Name || '' }));
        
        if (custId) {
            try {
                setLoading(true);
                const res = await receivePaymentService.getOutstanding(custId, formData.company, formData.docNo, 'All');
                setRows(res.outstandingRows || []);
                setTotals(prev => ({ ...prev, advance: res.advanceBalance || 0 }));
                calculateTotals(res.outstandingRows || []);
            } catch (error) {
                toast.error("Failed to load outstanding invoices");
            } finally {
                setLoading(false);
            }
        } else {
            setRows([]);
            calculateTotals([]);
        }
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = parseFloat(value) || 0;
        
        // Auto-check logic? Or just manual. In screenshot it seems manual or based on payment.
        if (field === 'payment' && newRows[index].payment > 0) {
            // Keep existing values or auto-allocate
        }

        setRows(newRows);
        calculateTotals(newRows);
    };

    const calculateTotals = (currentRows) => {
        const paid = currentRows.reduce((sum, r) => sum + (r.payment || 0), 0);
        const disc = currentRows.reduce((sum, r) => sum + (r.discount || 0), 0);
        const debit = currentRows.reduce((sum, r) => sum + (r.setOffVal || 0), 0);
        const out = currentRows.reduce((sum, r) => sum + (r.balance || 0), 0);
        
        setTotals(prev => ({
            ...prev,
            paid,
            discount: disc,
            debit,
            outstanding: out,
            ending: out - paid - disc - debit
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            customerId: '',
            customerName: '',
            amount: 0,
            paymentType: 'Cash',
            bankId: '',
            bankName: '',
            branch: '',
            chequeNo: '',
            memo: '',
            reference: ''
        });
        setRows([]);
        calculateTotals([]);
        loadInitialData();
    };

    const handleSave = async () => {
        if (!formData.customerId || totals.paid <= 0) {
            toast.error("Please select a customer and enter payment amounts.");
            return;
        }

        try {
            setLoading(true);
            const res = await receivePaymentService.apply({
                ...formData,
                amount: totals.paid
            });
            toast.success('Customer Receipt saved successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error("Failed to save receipt");
        } finally {
            setLoading(false);
        }
    };

    const filteredLookup = () => {
        if (activeModal === 'customer') return lookups.customers.filter(c => (c.Cust_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.Code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'bank') return lookups.banks.filter(b => (b.Bank_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (b.Bank_Code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'cc') return lookups.costCenters.filter(c => (c.CostCenterName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.CostCenterCode || '').toLowerCase().includes(searchTerm.toLowerCase()));
        return [];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Receipt"
                maxWidth="max-w-5xl"
                footer={
                    <div className="bg-slate-50 px-6 py-3 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-9 bg-[#0078d4] text-white text-xs font-bold rounded shadow-sm hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Receipt
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-6 h-9 bg-white border border-gray-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                            <RotateCcw size={15} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-9 bg-white border border-gray-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                            <X size={15} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-3 font-['Plus_Jakarta_Sans']">
                    {/* Top Section: Form Fields */}
                    <div className="bg-white p-4 border border-gray-100 rounded shadow-sm space-y-3">
                        <div className="grid grid-cols-12 gap-x-8 gap-y-3">
                            {/* Left Side: Core Metadata (Stacked for alignment) */}
                            <div className="col-span-12 lg:col-span-7 space-y-2.5">
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-slate-400 w-20 shrink-0 uppercase">Doc No</label>
                                    <input type="text" value={formData.docNo} readOnly className="flex-1 h-8 border border-gray-200 px-3 text-[13px] font-bold text-[#0078d4] bg-white rounded-sm outline-none tracking-widest" />
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-slate-400 w-20 shrink-0 uppercase">From</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.customerName ? `${formData.customerId} - ${formData.customerName}` : ''} 
                                            placeholder="Select Customer..." 
                                            className="flex-1 h-8 border border-gray-200 px-3 text-[13px] font-bold text-[#b91c1c] rounded-sm bg-white outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('customer'); setSearchTerm(''); }} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-slate-400 w-20 shrink-0 uppercase">Amount</label>
                                    <div className="flex-1 flex items-center gap-6">
                                        <input 
                                            name="amount" 
                                            type="number" 
                                            value={formData.amount} 
                                            onChange={handleInputChange} 
                                            className="flex-1 h-8 border-b-2 border-gray-200 px-2 text-[14px] font-black text-right text-gray-800 outline-none focus:border-[#0078d4]" 
                                        />
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                                            <select name="paymentType" value={formData.paymentType} onChange={handleInputChange} className="w-28 h-8 border border-gray-200 px-2 text-[11px] outline-none rounded-sm bg-white font-bold">
                                                <option value="Cash">Cash</option>
                                                <option value="Cheque">Cheque</option>
                                                <option value="Direct Deposit">Direct Deposit</option>
                                                <option value="Credit Card">Credit Card</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-slate-400 w-20 shrink-0 uppercase">Bank</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.banks.find(b => b.Bank_Code === formData.bankId)?.Bank_Name || ''} 
                                            placeholder="Select Bank..." 
                                            className="flex-1 h-8 border border-gray-200 px-3 text-[12px] rounded-sm bg-white outline-none" 
                                            disabled={formData.paymentType === 'Cash'}
                                        />
                                        <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} disabled={formData.paymentType === 'Cash'} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90 disabled:opacity-50">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-slate-400 w-20 shrink-0 uppercase">Center</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.costCenters.find(c => c.CostCenterCode === formData.costCenter)?.CostCenterName || ''} 
                                            className="flex-1 h-8 border border-gray-200 px-3 text-[12px] rounded-sm bg-white outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('cc'); setSearchTerm(''); }} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Operational Metadata */}
                            <div className="col-span-12 lg:col-span-5 space-y-2.5 bg-gray-50/10 p-4 rounded border border-gray-100 shadow-inner">
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-slate-400 w-24 shrink-0 uppercase">Invc. Date</label>
                                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="flex-1 h-8 border border-gray-200 px-3 text-[12px] outline-none rounded-sm font-bold text-[#0078d4] bg-white shadow-sm" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-slate-400 w-24 shrink-0 uppercase">Outstanding</label>
                                    <div className="flex-1 h-8 flex items-center justify-end px-3 bg-red-50/30 text-[14px] font-black text-[#b91c1c] rounded border border-red-100 tabular-nums shadow-sm">
                                        {totals.outstanding.toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-slate-400 w-24 shrink-0 uppercase">Chq Reference</label>
                                    <div className="flex-1 flex gap-2">
                                        <input name="chequeNo" value={formData.chequeNo} onChange={handleInputChange} disabled={formData.paymentType !== 'Cheque'} type="text" placeholder="No..." className="w-24 h-8 border border-gray-200 px-2 text-[12px] outline-none rounded-sm disabled:bg-gray-50 bg-white shadow-sm" />
                                        <div className="flex flex-1 items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase shrink-0">Dt</span>
                                            <input name="chequeDate" type="date" value={formData.chequeDate} onChange={handleInputChange} disabled={formData.paymentType !== 'Cheque'} className="flex-1 w-7 h-8 border border-gray-200 px-2 text-[12px] outline-none rounded-sm disabled:bg-gray-50 bg-white shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 pt-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Memo / Internal Remarks</label>
                                    <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" placeholder="Enter receipt remarks..." className="w-full h-8 border border-gray-200 px-3 text-[12px] outline-none focus:border-[#0078d4] bg-white rounded-sm shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Invoice Table */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-3 py-2.5 border-r border-gray-100 w-10 text-center text-slate-300">#</th>
                                        <th className="px-3 py-2.5 border-r border-gray-100 w-28 text-[#0078d4]">Due Date</th>
                                        <th className="px-3 py-2.5 border-r border-gray-100 w-28 text-slate-600">Doc No</th>
                                        <th className="px-3 py-2.5 border-r border-gray-100 text-slate-400">Reference</th>
                                        <th className="px-3 py-2.5 border-r border-gray-100 text-right w-24 text-slate-600">Inv Bal</th>
                                        <th className="px-3 py-2.5 border-r border-gray-100 text-right w-24 text-slate-600">Disc</th>
                                        <th className="px-3 py-2.5 border-r border-gray-100 text-right w-24 text-slate-600">SetOff</th>
                                        <th className="px-3 py-2.5 text-right w-28 bg-gray-50/80 text-[#0078d4]">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[12px] text-gray-700">
                                    {rows.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-slate-50 transition-colors group">
                                            <td className="p-1 border-r border-gray-50 text-center">
                                                <input type="checkbox" checked={row.payment > 0} readOnly className="w-3.5 h-3.5 text-[#0078d4] border-gray-300 rounded focus:ring-0 cursor-default" />
                                            </td>
                                            <td className="px-3 py-1 border-r border-gray-50 font-medium text-gray-400 tabular-nums">{row.date_Due?.split('T')[0]}</td>
                                            <td className="px-3 py-1 border-r border-gray-50 font-bold text-slate-700 tracking-tight underline underline-offset-4 decoration-gray-100">{row.doc_No}</td>
                                            <td className="px-3 py-1 border-r border-gray-50 text-[11px] text-slate-400">{row.ref_No}</td>
                                            <td className="px-3 py-1 border-r border-gray-50 text-right font-semibold tabular-nums text-slate-600">{row.balance?.toLocaleString()}</td>
                                            <td className="p-0 border-r border-gray-50 bg-white">
                                                <input type="number" value={row.discount} onChange={(e) => handleRowChange(idx, 'discount', e.target.value)} className="w-full h-8 px-2 text-right bg-transparent outline-none focus:bg-slate-50 tabular-nums" />
                                            </td>
                                            <td className="p-0 border-r border-gray-50 bg-white">
                                                <input type="number" value={row.setOffVal} onChange={(e) => handleRowChange(idx, 'setOffVal', e.target.value)} className="w-full h-8 px-2 text-right bg-transparent outline-none focus:bg-slate-50 tabular-nums" />
                                            </td>
                                            <td className="p-0 bg-gray-50/20">
                                                <input type="number" value={row.payment} onChange={(e) => handleRowChange(idx, 'payment', e.target.value)} className="w-full h-8 px-2 text-right font-black text-[#0078d4] outline-none focus:bg-gray-100 tabular-nums" />
                                            </td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="8" className="px-8 py-16 text-center text-slate-300 font-medium tracking-widest text-[10px] uppercase">No outstanding transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Summary Totals Row */}
                        <div className="bg-gray-50 border-t border-gray-200 p-2 px-4 flex justify-between items-center text-[12px] font-black">
                            <span className="uppercase tracking-widest text-slate-300 text-[10px]">Batch Totals</span>
                            <div className="flex gap-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 uppercase">Disc:</span>
                                    <span className="text-slate-600 tabular-nums">{totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 uppercase">SetOff:</span>
                                    <span className="text-slate-600 tabular-nums">{totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center gap-3 py-1 px-4 bg-white rounded border border-gray-100 shadow-sm">
                                    <span className="text-[11px] text-[#0078d4] uppercase tracking-tighter">Net Received:</span>
                                    <span className="text-[16px] text-slate-800 tabular-nums font-black">Rs. {totals.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Summary Grid */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 lg:col-span-6 bg-white p-4 border border-gray-200 rounded shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Credit</span>
                                <div className="text-[20px] font-black text-[#4cc3a5] tabular-nums tracking-tighter">Rs. {totals.advance.toLocaleString()}</div>
                            </div>
                            <button className="h-9 px-6 bg-gray-50 text-[#0078d4] text-[11px] font-black rounded border border-gray-200 uppercase tracking-widest hover:bg-white hover:border-[#0078d4] transition-all shadow-sm">Apply Advance</button>
                        </div>

                        <div className="col-span-12 lg:col-span-6 bg-white border border-gray-200 p-4 rounded shadow-sm flex items-center justify-between px-8 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0078d4]" />
                            <div className="flex items-center gap-10">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pending Balance</span>
                                    <div className="text-[18px] font-black text-slate-700 tabular-nums leading-none">{totals.outstanding.toLocaleString()}</div>
                                </div>
                                <div className="h-10 w-[1px] bg-gray-100" />
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-[#0078d4] uppercase tracking-widest leading-none">Ending Balance</span>
                                    <div className="text-[24px] font-black text-[#0078d4] tabular-nums leading-none tracking-tighter">Rs. {totals.ending.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-[#4cc3a5]/10 rounded-full flex items-center justify-center border border-[#4cc3a5]/20 shadow-inner">
                                <Check size={20} className="text-[#4cc3a5]" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
                                {activeModal === 'customer' ? 'Search Customers' : activeModal === 'bank' ? 'Search Banks' : 'Search Cost Centers'}
                            </h3>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Type to filter..." 
                                    className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none font-medium" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                                <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100/50 sticky top-0 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Title</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'customer') {
                                                handleCustomerChange(item.Code);
                                            } else if (activeModal === 'bank') {
                                                setFormData(prev => ({ ...prev, bankId: item.Bank_Code, bankName: item.Bank_Name }));
                                            } else {
                                                setFormData(prev => ({ ...prev, costCenter: item.CostCenterCode }));
                                            }
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-3 border-b font-medium text-gray-700">{item.Code || item.Bank_Code || item.CostCenterCode}</td>
                                            <td className="p-3 border-b font-bold uppercase text-blue-600">{item.Cust_Name || item.Bank_Name || item.CostCenterName}</td>
                                            <td className="p-3 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-black tracking-widest hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLookup().length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium italic">No results found for "{searchTerm}"</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerReceiptBoard;
