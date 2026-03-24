import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Loader2 , X, Save} from 'lucide-react';
import receivePaymentService from '../services/receivePayment.service';
import { toast } from 'react-hot-toast';

const ReceivePaymentBoard = ({ isOpen, onClose }) => {
    const company = localStorage.getItem('companyId') || 'C002';
    const user = JSON.parse(localStorage.getItem('user')) || { Emp_Name: 'Admin' };

    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], costCenters: [], customers: [], subAccounts: [] });
    
    const [formData, setFormData] = useState({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        accountType: 'Medical Members',
        customerId: '',
        customerName: '',
        amount: 0,
        payType: 'Cash',
        bankId: '',
        bankName: '',
        branch: '',
        chequeNo: '',
        chequeDate: new Date().toISOString().split('T')[0],
        memo: '',
        reference: '',
        costCenter: '',
        comment: ''
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

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [lookupRes, docRes] = await Promise.all([
                receivePaymentService.getLookups(company, formData.accountType),
                receivePaymentService.generateDoc(company)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && formData.accountType) {
            fetchCustomers();
        }
    }, [isOpen, formData.accountType]);

    const fetchCustomers = async () => {
        try {
            const typeMap = { 'Medical Members': 'MM', 'Staff Credit': 'SC' };
            const res = await receivePaymentService.getLookups(company, typeMap[formData.accountType] || 'MM');
            if (res && res.customers) {
                setLookups(prev => ({ ...prev, customers: res.customers }));
            }
        } catch (error) {}
    };

    const handleCustomerChange = async (e) => {
        const custId = e.target.value;
        const cust = lookups.customers.find(c => c.Code === custId);
        setFormData(prev => ({ ...prev, customerId: custId, customerName: cust?.Cust_Name || '' }));
        
        if (custId) {
            try {
                setLoading(true);
                const res = await receivePaymentService.getOutstanding(custId, company, formData.docNo, formData.accountType);
                setRows(res.outstandingRows || []);
                setTotals(prev => ({ ...prev, advance: res.advanceBalance || 0 }));
            } catch (error) {
                toast.error("Failed to load outstanding invoices");
            } finally {
                setLoading(false);
            }
        } else {
            setRows([]);
        }
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = parseFloat(value) || 0;
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
            ending: paid // In this module, payment received = paid sum
        }));
    };

    const handleSave = async () => {
        if (!formData.customerId || formData.amount <= 0) {
            toast.error("Please select customer and enter valid amount");
            return;
        }

        try {
            setLoading(true);
            
            // 1. Update temp rows first (sync with backend temp table for SP)
            const updatedRows = rows.filter(r => r.payment > 0 || r.discount > 0 || r.setOffVal > 0);
            for (const row of updatedRows) {
                await receivePaymentService.updateRow({
                    docNo: row.doc_No,
                    payment: row.payment,
                    discount: row.discount,
                    setOff: row.setOffVal
                }, company, formData.docNo, formData.customerId);
            }

            // 2. Final apply
            const res = await receivePaymentService.apply({
                ...formData,
                company,
                createUser: user.Emp_Name,
                amount: totals.ending
            });

            toast.success(`Payment saved successfully. Doc: ${res.docNo}`);
            onClose();
        } catch (error) {
            toast.error(error.response?.data || "Failed to save payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Customer Receipt"
            maxWidth="max-w-[1100px]"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 pl-4">
                        <span className="text-[24px] font-black italic text-[#0078d4]/30 tracking-tighter select-none">onimta IT</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            disabled={loading}
                            onClick={handleSave}
                            className="px-10 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded shadow-sm hover:bg-[#005a9e] transition-all min-w-[100px] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-10 h-8 bg-white border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-all min-w-[100px]"
                        >
                            Clear
                        </button>
                        <button onClick={onClose} className="px-10 h-8 bg-white border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-all min-w-[100px]">
                            <X size={14} /> Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 p-1 font-['Plus_Jakarta_Sans'] text-gray-800 relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-lg">
                        <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-xl flex items-center gap-3">
                            <Loader2 className="animate-spin text-[#0078d4]" size={20} />
                            <span className="text-[14px] font-bold text-gray-600">Processing...</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-x-8 gap-y-2 bg-[#f8f9fa] p-4 border border-gray-200 rounded shadow-sm overflow-visible">
                    <div className="col-span-8 space-y-2">
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Doc No</label>
                            <input 
                                type="text" 
                                value={formData.docNo}
                                readOnly
                                className="w-48 h-7 border border-gray-300 px-2 text-[12px] font-black text-[#0078d4] outline-none bg-blue-50/50"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Account Type</label>
                            <select 
                                value={formData.accountType}
                                onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                                className="w-64 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"
                            >
                                <option>Medical Members</option>
                                <option>Staff Credit</option>
                                <option>All</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Received From</label>
                            <div className="flex-1 flex gap-2">
                                <select 
                                    value={formData.customerId}
                                    onChange={handleCustomerChange}
                                    className="w-40 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"
                                >
                                    <option value="">Select ID</option>
                                    {lookups.customers.map(c => <option key={c.Code} value={c.Code}>{c.Code}</option>)}
                                </select>
                                <input 
                                    type="text" 
                                    value={formData.customerName}
                                    readOnly
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none bg-gray-50 font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Amount</label>
                            <input 
                                type="number" 
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                                className="w-48 h-7 border border-gray-300 px-2 text-right text-[12px] font-bold outline-none focus:border-[#0078d4]" 
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Payment Type</label>
                            <select 
                                value={formData.payType}
                                onChange={(e) => setFormData({...formData, payType: e.target.value})}
                                className="w-64 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"
                            >
                                <option>Cash</option>
                                <option>Cheque</option>
                                <option>Direct Deposit</option>
                                <option>Credit Card</option>
                                <option>Journal</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Bank</label>
                            <div className="flex-1 flex gap-2">
                                <select 
                                    value={formData.bankId}
                                    onChange={(e) => {
                                        const b = lookups.banks.find(x => x.Bank_Code === e.target.value);
                                        setFormData({...formData, bankId: e.target.value, bankName: b?.Bank_Name || ''})
                                    }}
                                    className="w-40 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white font-bold"
                                >
                                    <option value="">Select Bank</option>
                                    {lookups.banks.map(b => <option key={b.Bank_Code} value={b.Bank_Code}>{b.Bank_Code}</option>)}
                                </select>
                                <input 
                                    type="text"
                                    value={formData.bankName}
                                    readOnly
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Cost Center</label>
                            <select 
                                value={formData.costCenter}
                                onChange={(e) => setFormData({...formData, costCenter: e.target.value})}
                                className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white font-bold text-[#0078d4]"
                            >
                                <option value="">Select Cost Center</option>
                                {lookups.costCenters.map(c => <option key={c.CostCenterCode} value={c.CostCenterCode}>{c.CostCenterName}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="col-span-4 space-y-2 pl-4 border-l border-gray-200">
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Date</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-48 h-7 border border-gray-300 px-2 text-[12px] outline-none font-bold"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Outstanding Balance</label>
                            <div className="flex gap-1">
                                <span className="text-[12px] font-black text-gray-400">Rs.</span>
                                <input 
                                    type="text" 
                                    value={totals.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    className="w-40 h-7 border-b border-gray-300 bg-transparent text-right text-[13px] outline-none font-black text-gray-700" 
                                    readOnly 
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="text-[12px] font-bold text-gray-600">Reference</label>
                            <input 
                                type="text" 
                                value={formData.reference}
                                onChange={(e) => setFormData({...formData, reference: e.target.value})}
                                className="w-48 h-7 border border-gray-300 px-2 text-[12px] outline-none" 
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Branch</label>
                            <input 
                                type="text" 
                                value={formData.branch}
                                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                                className="w-48 h-7 border border-gray-300 px-2 text-[12px] outline-none" 
                            />
                        </div>

                        <div className="flex flex-col gap-1 pt-4">
                            <label className="text-[11px] font-bold text-gray-500">Cheque Date</label>
                            <input 
                                type="date" 
                                value={formData.chequeDate}
                                onChange={(e) => setFormData({...formData, chequeDate: e.target.value})}
                                className="w-48 h-7 border border-gray-300 px-2 text-[12px] outline-none" 
                            />
                        </div>
                    </div>
                </div>

                <div className="border border-gray-300 rounded shadow-inner bg-white overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f1f3f5] border-b border-gray-300 text-gray-700 text-[11px] font-black uppercase sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-300 w-12 text-center">Chk</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-28">Date_Due</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-32">Doc_No</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-32">Ref_No</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-right">Inv_Amount</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-right">Discount</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-right">SetOff</th>
                                <th className="px-2 py-2 border-r border-gray-300 text-right">Balance</th>
                                <th className="px-3 py-2 text-right">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px]">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400 italic font-medium">No outstanding invoices found for the selected customer</td>
                                </tr>
                            ) : rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-[#0078d4]/5 transition-colors group">
                                    <td className="px-2 py-1.5 border-r border-gray-100 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={row.payment > 0} 
                                            readOnly
                                            className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4]" 
                                        />
                                    </td>
                                    <td className="px-3 py-1.5 border-r border-gray-100 text-gray-500 font-medium">{row.date_Due?.split('T')[0]}</td>
                                    <td className="px-3 py-1.5 border-r border-gray-100 font-bold text-gray-700">{row.doc_No}</td>
                                    <td className="px-3 py-1.5 border-r border-gray-100 text-gray-600">{row.ref_No}</td>
                                    <td className="px-3 py-1.5 border-r border-gray-100 text-right font-medium">{row.inv_Amount?.toLocaleString()}</td>
                                    <td className="px-1 py-1 border-r border-gray-100">
                                        <input 
                                            type="number" 
                                            value={row.discount}
                                            onChange={(e) => handleRowChange(idx, 'discount', e.target.value)}
                                            className="w-full h-7 px-2 text-right text-[12px] bg-transparent outline-none focus:bg-white group-hover:bg-white border focus:border-[#0078d4] border-transparent transition-all" 
                                        />
                                    </td>
                                    <td className="px-1 py-1 border-r border-gray-100">
                                        <input 
                                            type="number" 
                                            value={row.setOffVal}
                                            onChange={(e) => handleRowChange(idx, 'setOffVal', e.target.value)}
                                            className="w-full h-7 px-2 text-right text-[12px] bg-transparent outline-none focus:bg-white group-hover:bg-white border focus:border-[#0078d4] border-transparent transition-all" 
                                        />
                                    </td>
                                    <td className="px-3 py-1.5 border-r border-gray-100 text-right font-bold text-gray-700">{row.balance?.toLocaleString()}</td>
                                    <td className="px-1 py-1">
                                        <input 
                                            type="number" 
                                            value={row.payment}
                                            onChange={(e) => handleRowChange(idx, 'payment', e.target.value)}
                                            className="w-full h-7 px-2 text-right text-[13px] font-black text-[#0078d4] bg-transparent outline-none focus:bg-white group-hover:bg-white border focus:border-[#0078d4] border-transparent transition-all" 
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-12 gap-x-8 items-start">
                    <div className="col-span-12 lg:col-span-7 space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[12px] font-bold text-gray-600">Memo / Remarks</span>
                            <textarea 
                                value={formData.memo}
                                onChange={(e) => setFormData({...formData, memo: e.target.value})}
                                className="w-full h-16 border border-gray-300 bg-white rounded-sm p-3 text-[12px] outline-none focus:border-[#0078d4] resize-none" 
                                placeholder="Enter payment notes..."
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col gap-1 px-4 py-2 bg-blue-50/50 border border-[#0078d4]/10 rounded">
                                <span className="text-[10px] font-black text-[#0078d4] uppercase">Advance Balance</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[13px] font-bold text-[#0078d4]/50">Rs.</span>
                                    <span className="text-[15px] font-black text-[#0078d4]">{totals.advance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <button className="h-9 px-6 bg-white border border-gray-300 text-[12px] font-bold text-gray-700 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all">
                                <Search size={14} /> View History
                            </button>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 space-y-2 bg-[#f8f9fa] p-5 border border-gray-200 rounded shadow-sm">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                            <span>SUMMARY</span>
                            <div className="h-[1px] flex-1 mx-3 bg-gray-200" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-500">Payment Received</span>
                            <span className="text-[14px] font-bold text-gray-900">{totals.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-500">Discount Applied</span>
                            <span className="text-[14px] font-bold text-gray-500">{totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-500">Debit Applied</span>
                            <span className="text-[14px] font-bold text-gray-500">{totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="h-[1px] bg-gray-200 my-2" />
                        
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-black text-[#0078d4] tracking-tighter">TOTAL RECEIPT RS.</span>
                            <div className="px-4 py-2 bg-[#0078d4] rounded shadow-lg shadow-[#0078d4]/20">
                                <span className="text-[18px] font-black text-white">{totals.ending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default ReceivePaymentBoard;
