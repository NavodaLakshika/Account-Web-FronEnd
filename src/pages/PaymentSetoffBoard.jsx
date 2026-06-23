import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, ArrowRightLeft, UserCircle, Briefcase, FileCheck, CheckCircle2, History, AlertTriangle, Plus, Calendar } from 'lucide-react';
import { paymentSetoffService } from '../services/paymentSetoff.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const PaymentSetoffBoard = ({ isOpen, onClose }) => {
    const { companyCode, userName } = getSessionData();
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ suppliers: [] });
    
    // Form States
    const getInitialFormData = () => ({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        supplierId: '',
        supplierName: '',
        totalOutstanding: 0,
        totalReturns: 0,
        company: companyCode,
        createUser: userName
    });

    const [formData, setFormData] = useState(getInitialFormData());


    const [pendingPayments, setPendingPayments] = useState([]);
    const [returns, setReturns] = useState([]);
    const [selectedSetoffs, setSelectedSetoffs] = useState([]);
    const [selectedPendingRow, setSelectedPendingRow] = useState(null);
    const [selectedReturnRow, setSelectedReturnRow] = useState(null);
    const [setoffAmountInput, setoffAmountInputSet] = useState('');
    
    const [activeSupplierModal, setActiveSupplierModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);

    // Receipt Modal States
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSavedTx, setLastSavedTx] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: comp, userName: user } = getSessionData();
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [lookupRes, docRes] = await Promise.all([
                paymentSetoffService.getLookups(formData.company),
                paymentSetoffService.generateDocNo(companyCode)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleSupplierSelect = async (supplier) => {
        setFormData(prev => ({ ...prev, supplierId: supplier.code, supplierName: supplier.name }));
        setActiveSupplierModal(false);
        
        try {
            setLoading(true);
            const [pends, rets] = await Promise.all([
                paymentSetoffService.getPendingPayments(supplier.code, formData.company),
                paymentSetoffService.getReturns(supplier.code, formData.company)
            ]);
            setPendingPayments(pends);
            setReturns(rets);
            setFormData(prev => ({
                ...prev,
                totalOutstanding: pends.reduce((sum, p) => sum + (p.balanceAmount || 0), 0),
                totalReturns: rets.reduce((sum, r) => sum + (r.balanceAmount || 0), 0)
            }));
            setSelectedSetoffs([]);
        } catch (error) {
            showErrorToast("Failed to load supplier records");
        } finally {
            setLoading(false);
        }
    };

    const handleApplySetoff = async () => {
        if (!formData.supplierId || selectedSetoffs.length === 0) {
            showErrorToast("Please select a supplier and allocate set-offs.");
            return;
        }

        try {
            setLoading(true);
            await paymentSetoffService.apply({ ...formData, lines: selectedSetoffs });
            showSuccessToast('Payment setoff applied successfully!');

            const totalSetoff = selectedSetoffs.reduce((sum, s) => sum + s.setoffAmount, 0);
            setLastSavedTx({
                type: 'PAYMENT SET OFF',
                docNo: formData.docNo,
                payee: formData.supplierName ? `${formData.supplierId} - ${formData.supplierName}` : '',
                date: formData.date,
                total: totalSetoff,
                details: {
                    header: {
                        docNo: formData.docNo,
                        date: formData.date,
                        payee: formData.supplierName,
                        amount: totalSetoff,
                    },
                    expenses: selectedSetoffs.map(s => ({
                        accCode: `Offset: ${s.pendDoc}`,
                        memo: `Against Return: ${s.retDoc}`,
                        amount: s.setoffAmount
                    }))
                }
            });
            setShowReceipt(true);

            handleClear();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            supplierId: '',
            supplierName: '',
            totalOutstanding: 0,
            totalReturns: 0
        });
        setPendingPayments([]);
        setReturns([]);
        setSelectedSetoffs([]);
        loadInitialData();
    };

    const handleAddAllocation = () => {
        if (!selectedPendingRow || !selectedReturnRow) {
            showErrorToast("Please select one pending payment and one return to offset.");
            return;
        }
        
        const amount = parseFloat(setoffAmountInput);
        if (isNaN(amount) || amount <= 0) {
            showErrorToast("Please enter a valid amount greater than 0.");
            return;
        }

        if (amount > selectedPendingRow.balanceAmount) {
            showErrorToast("Setoff amount cannot exceed the pending payment balance.");
            return;
        }

        if (amount > selectedReturnRow.balanceAmount) {
            showErrorToast("Setoff amount cannot exceed the return balance.");
            return;
        }

        const newSetoff = {
            id: Date.now(),
            pendDoc: selectedPendingRow.documentNo,
            pendDate: selectedPendingRow.date,
            pendBal: selectedPendingRow.balanceAmount,
            setoffAmount: amount,
            retDoc: selectedReturnRow.documentNo,
            retDate: selectedReturnRow.date,
            retAmount: amount,
            retBal: selectedReturnRow.balanceAmount
        };

        // Deduct from local state so they can't double allocate
        setPendingPayments(prev => prev.map(p => p.documentNo === selectedPendingRow.documentNo ? { ...p, balanceAmount: p.balanceAmount - amount } : p));
        setReturns(prev => prev.map(r => r.documentNo === selectedReturnRow.documentNo ? { ...r, balanceAmount: r.balanceAmount - amount } : r));

        setSelectedSetoffs([...selectedSetoffs, newSetoff]);
        setSelectedPendingRow(null);
        setSelectedReturnRow(null);
        setoffAmountInputSet('');
    };

    const filteredSuppliers = () => lookups.suppliers.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.code || '').toLowerCase().includes(searchTerm.toLowerCase()));

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
                title="Payment Set Off"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50/80 px-6 py-3 w-full flex justify-end gap-3 border-t border-slate-200 rounded-b-[5px]">
                        <button onClick={handleApplySetoff} disabled={loading} className={`px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} APPLY SETOFF
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="bg-white p-3 border border-slate-200 rounded-[5px] relative overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            {/* Supplier */}
                            <div className="flex-1 flex items-center gap-2 min-w-0">
                                <label className="text-[11px] font-bold text-gray-500 uppercase shrink-0 w-16">Supplier</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.supplierName ? `${formData.supplierId} - ${formData.supplierName}` : ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                        onClick={() => { setActiveSupplierModal(true); setSearchTerm(''); }}
                                    />
                                    <button onClick={() => { setActiveSupplierModal(true); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="w-[200px] flex items-center gap-2 shrink-0">
                                <label className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Doc No</label>
                                <div className="flex-1">
                                    <input type="text" value={formData.docNo} readOnly className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                </div>
                            </div>

                            <div className="w-[200px] flex items-center gap-2 shrink-0">
                                <label className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        value={formData.date} 
                                        readOnly 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                        onClick={() => setShowCalendar(true)}
                                    />
                                    <button 
                                        onClick={() => setShowCalendar(true)} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Calendar size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        {/* Pending Payments Section */}
                        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-[5px] flex flex-col">
                            <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <History size={14} className="text-slate-500" />
                                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-widest">Pending Payments</span>
                                </div>
                            </div>
                            <div className="h-[180px] overflow-y-auto overflow-x-hidden">
                                <table className="w-full text-left text-[12px] border-collapse sticky-header">
                                    <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-4 py-2.5 border-r border-slate-200">Document No</th>
                                            <th className="px-4 py-2.5 border-r border-slate-200">Date</th>
                                            <th className="px-4 py-2.5 border-r border-slate-200 text-right">Amount</th>
                                            <th className="px-4 py-2.5 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingPayments.map((p, i) => (
                                            <tr 
                                                key={i} 
                                                onClick={() => setSelectedPendingRow(p)}
                                                className={`transition-colors cursor-pointer group ${selectedPendingRow?.documentNo === p.documentNo ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-50'}`}
                                            >
                                                <td className="px-4 py-2 font-mono text-[12px] font-bold text-slate-700">{p.documentNo}</td>
                                                <td className="px-4 py-2 font-mono text-[12px] text-slate-500">{p.date}</td>
                                                <td className="px-4 py-2 text-right font-mono text-[12px]">{p.amount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-mono text-[12px] font-bold text-red-600">{p.balanceAmount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {pendingPayments.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-300 font-mono text-[11px]">No records found...</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[11px] font-bold text-gray-500 uppercase">Total Outstanding:</span>
                                    <span className="text-[18px] font-black text-[#b91c1c] font-mono">{formData.totalOutstanding.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Returns Section */}
                        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-[5px] flex flex-col">
                            <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ArrowRightLeft size={14} className="text-slate-500" />
                                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-widest">Returns & Advances</span>
                                </div>
                            </div>
                            <div className="h-[180px] overflow-y-auto overflow-x-hidden">
                               <table className="w-full text-left text-[12px] border-collapse sticky-header">
                                    <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-4 py-2.5 border-r border-slate-200">Document No</th>
                                            <th className="px-4 py-2.5 border-r border-slate-200">Date</th>
                                            <th className="px-4 py-2.5 border-r border-slate-200 text-right">Amount</th>
                                            <th className="px-4 py-2.5 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {returns.map((r, i) => (
                                            <tr 
                                                key={i} 
                                                onClick={() => setSelectedReturnRow(r)}
                                                className={`transition-colors cursor-pointer group ${selectedReturnRow?.documentNo === r.documentNo ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-slate-50'}`}
                                            >
                                                <td className="px-4 py-2 font-mono text-[12px] font-bold text-slate-700">{r.documentNo}</td>
                                                <td className="px-4 py-2 font-mono text-[12px] text-slate-500">{r.date || '---'}</td>
                                                <td className="px-4 py-2 text-right font-mono text-[12px]">{r.amount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-mono text-[12px] font-bold text-[#0285fd]">{r.balanceAmount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {returns.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-300 font-mono text-[11px]">No records found...</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[11px] font-bold text-gray-500 uppercase">Total Returns & Advance:</span>
                                    <span className="text-[18px] font-black text-[#0285fd] font-mono">{formData.totalReturns.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Setoff Action Bar */}
                    <div className="bg-white border border-slate-200 rounded-[5px] p-3 flex items-center gap-4 justify-between bg-gradient-to-r from-blue-50/50 to-green-50/50">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1 max-w-[200px]">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Selected Pending</label>
                                <div className="h-8 bg-white border border-slate-200 rounded px-3 flex items-center text-[12px] font-mono font-bold text-slate-700">
                                    {selectedPendingRow ? selectedPendingRow.documentNo : '-- Select --'}
                                </div>
                            </div>
                            <ArrowRightLeft size={16} className="text-slate-400" />
                            <div className="flex-1 max-w-[200px]">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Selected Return</label>
                                <div className="h-8 bg-white border border-slate-200 rounded px-3 flex items-center text-[12px] font-mono font-bold text-slate-700">
                                    {selectedReturnRow ? selectedReturnRow.documentNo : '-- Select --'}
                                </div>
                            </div>
                            <div className="w-32">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount</label>
                                <input 
                                    type="number" 
                                    className="w-full h-8 bg-white border border-blue-200 rounded px-3 text-[12px] font-mono font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={setoffAmountInput}
                                    onChange={(e) => setoffAmountInputSet(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleAddAllocation}
                            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[12px] font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={16} /> ADD ALLOCATION
                        </button>
                    </div>

                    {/* Selected Set Off Summary Grid */}
                    <div className="bg-white border border-slate-200 rounded-[5px] flex flex-col overflow-hidden">
                        <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                             <FileCheck size={14} className="text-green-600" />
                             <h4 className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-widest">Selected Payment Set Off Allocation</h4>
                        </div>
                        <div className="min-h-[150px] max-h-[200px] overflow-y-auto">
                            <table className="w-full text-left text-[11px] border-collapse sticky-header">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-3 py-2.5 border-r border-slate-200">Selected Doc</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200">Date</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-right">Balance Amt</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-right">Set-Off Amount</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200">Set-Off Document</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200">Date</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-right font-black">Line Total</th>
                                        <th className="px-3 py-2.5 text-right text-red-600">Rem. Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedSetoffs.map((s, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2 border-r border-slate-100 font-mono text-[11px] font-bold text-slate-700">{s.pendDoc}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 font-mono text-[11px] text-slate-500">{s.pendDate}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 text-right font-mono text-[11px] font-bold">{s.pendBal.toLocaleString()}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 text-right font-mono text-[11px] font-black text-blue-600 tabular-nums">{s.setoffAmount.toLocaleString()}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 font-mono text-[11px] font-bold text-slate-700">{s.retDoc}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 font-mono text-[11px] text-slate-500">{s.retDate}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 text-right font-mono text-[11px] font-bold text-green-700 font-black">{s.retAmount.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-mono text-[11px] font-bold text-red-700">{(s.pendBal - s.setoffAmount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {selectedSetoffs.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-slate-300 font-mono text-[11px] uppercase tracking-widest">
                                                Select pending invoices and matching return documents to build your set-off schedule.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Supplier Search Modal */}
            {activeSupplierModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setActiveSupplierModal(false)} />
 <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-[5px] overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-white">
                            <h3 className="text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest">Search Suppliers</h3>
                            <button 
                                onClick={() => setActiveSupplierModal(false)} 
                                className="w-8 h-8 bg-white/10 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all border-none"
                                title="Close"
                            >
                                <X size={28} strokeWidth={1.5} />
                            </button>
                        </div>
                        <div className="p-4 border-b border-slate-200 bg-white">
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by supplier name or code..." 
                                    className="w-full h-8 border border-slate-200 pl-10 pr-4 text-sm bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-2.5 border-b border-slate-200">Code</th>
                                        <th className="px-5 py-2.5 border-b border-slate-200">Supplier Name</th>
                                        <th className="px-5 py-2.5 border-b border-slate-200 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredSuppliers().length > 0 ? filteredSuppliers().map((s, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleSupplierSelect(s)}>
                                            <td className="px-5 py-2.5 border-b border-slate-100 font-mono text-[12px] font-bold text-slate-600">{s.code}</td>
                                            <td className="px-5 py-2.5 border-b border-slate-100 font-mono text-[12px] font-bold text-[#0285fd] uppercase">{s.name}</td>
                                            <td className="px-5 py-2.5 border-b border-slate-100 text-center">
                                                <button className="bg-[#e49e1b] text-white text-[9px] px-4 py-1.5 rounded-[5px] font-mono font-bold uppercase tracking-widest hover:bg-[#cb9b34] transition-all active:scale-95">SELECT</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="p-10 text-center text-slate-300 font-mono text-[11px] uppercase tracking-widest">No suppliers found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            <CalendarModal 
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={(date) => { setFormData(prev => ({ ...prev, date })); setShowCalendar(false); }}
                initialDate={formData.date}
            />

            {/* Receipt Modal */}
            {showReceipt && lastSavedTx && (
                <TransactionReceiptModal 
                    selectedTx={lastSavedTx}
                    onClose={() => {
                        setShowReceipt(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
};

export default PaymentSetoffBoard;
