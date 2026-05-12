import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, ArrowRightLeft, UserCircle, Briefcase, FileCheck, CheckCircle2, History, AlertTriangle } from 'lucide-react';
import { paymentSetoffService } from '../services/paymentSetoff.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const PaymentSetoffBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ suppliers: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        supplierId: '',
        supplierName: '',
        totalOutstanding: 0,
        totalReturns: 0,
        company: 'C001',
        createUser: 'SYSTEM'
    });

    const [pendingPayments, setPendingPayments] = useState([]);
    const [returns, setReturns] = useState([]);
    const [selectedSetoffs, setSelectedSetoffs] = useState([]);
    
    const [activeSupplierModal, setActiveSupplierModal] = useState(false);
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
                paymentSetoffService.getLookups(companyCode),
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

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1 font-['Tahoma']">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
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
                    <div className="flex-grow text-left py-1 font-['Tahoma']">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
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
            handleClear();
            onClose();
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

    const allocateSetoff = (pend, ret, amount) => {
        // Simple logic for UI demo/tracking
        const newSetoff = {
            id: Date.now(),
            pendDoc: pend.documentNo,
            pendDate: pend.date,
            pendBal: pend.balanceAmount,
            setoffAmount: amount,
            retDoc: ret.documentNo,
            retDate: ret.date,
            retAmount: amount,
            retBal: ret.balanceAmount
        };
        setSelectedSetoffs([...selectedSetoffs, newSetoff]);
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
                maxWidth="max-w-[1400px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleApplySetoff} disabled={loading} className={`px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} Apply
                        </button>
                        <button onClick={onClose} className="px-10 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <X size={16} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Plus_Jakarta_Sans']">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-gray-200 rounded-sm shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4 flex-1">
                            <label className="text-[13px] font-bold text-gray-700 w-20 shrink-0">Supplier</label>
                            <div className="flex-1 max-w-[500px] flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.supplierName ? `${formData.supplierId} - ${formData.supplierName}` : ''} 
                                    placeholder="Search supplier to load pending payments & returns..." 
                                    className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold text-[#0078d4] rounded-sm bg-gray-50/20 outline-none" 
                                />
                                <button onClick={() => { setActiveSupplierModal(true); setSearchTerm(''); }} className="w-12 h-9 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-md active:scale-90">
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700">Document No:</label>
                                <input type="text" value={formData.docNo} readOnly className="w-40 h-8 border border-gray-300 px-3 text-[13px] font-black text-[#0078d4] bg-blue-50/20 rounded-sm italic outline-none" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700">Date:</label>
                                <input type="date" value={formData.date} readOnly className="w-44 h-8 border border-gray-300 px-3 text-[13px] font-bold rounded-sm bg-gray-50/50" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        {/* Pending Payments Section */}
                        <div className="col-span-12 lg:col-span-6 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
                            <div className="bg-slate-50/50 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <History size={16} className="text-[#0078d4]" />
                                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Pending Payments</span>
                                </div>
                            </div>
                            <div className="h-[250px] overflow-y-auto overflow-x-hidden">
                                <table className="w-full text-left text-[12px] border-collapse sticky-header">
                                    <thead className="bg-[#f8f9fa] border-b border-gray-200 font-bold text-gray-600 uppercase">
                                        <tr>
                                            <th className="px-4 py-2 border-r">Document No</th>
                                            <th className="px-4 py-2 border-r">Date</th>
                                            <th className="px-4 py-2 border-r text-right">Amount</th>
                                            <th className="px-4 py-2 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pendingPayments.map((p, i) => (
                                            <tr key={i} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                                <td className="px-4 py-2 font-bold text-gray-700">{p.documentNo}</td>
                                                <td className="px-4 py-2 text-gray-500">{p.date}</td>
                                                <td className="px-4 py-2 text-right font-medium">{p.amount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-bold text-red-600">{p.balanceAmount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {pendingPayments.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-300 italic">No records found...</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-gray-200 space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[13px] font-bold text-gray-500">Total Outstanding:</span>
                                    <span className="text-[18px] font-black text-[#b91c1c]">Rs. {formData.totalOutstanding.toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1 p-2 bg-blue-50/40 border border-blue-100/50 rounded-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Document</span>
                                        <input type="text" readOnly className="h-7 border border-gray-300 bg-white px-2 text-[11px] font-bold" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Date</span>
                                        <input type="text" readOnly className="h-7 border border-gray-300 bg-white px-2 text-[11px]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Amount</span>
                                        <input type="text" readOnly className="h-7 border border-gray-300 bg-white px-2 text-[11px] text-right" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase text-blue-600">Set Off Amount</span>
                                        <input type="number" step="0.01" className="h-7 border border-[#0078d4] bg-white px-2 text-[12px] font-black text-right outline-none focus:ring-1 ring-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Returns Section */}
                        <div className="col-span-12 lg:col-span-6 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
                            <div className="bg-slate-50/50 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ArrowRightLeft size={16} className="text-[#0078d4]" />
                                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Returns & Advances</span>
                                </div>
                            </div>
                            <div className="h-[250px] overflow-y-auto overflow-x-hidden">
                               <table className="w-full text-left text-[12px] border-collapse sticky-header">
                                    <thead className="bg-[#f8f9fa] border-b border-gray-200 font-bold text-gray-600 uppercase">
                                        <tr>
                                            <th className="px-4 py-2 border-r">Document No</th>
                                            <th className="px-4 py-2 border-r">Date</th>
                                            <th className="px-4 py-2 border-r text-right">Amount</th>
                                            <th className="px-4 py-2 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {returns.map((r, i) => (
                                            <tr key={i} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                                <td className="px-4 py-2 font-bold text-gray-700">{r.documentNo}</td>
                                                <td className="px-4 py-2 text-gray-500">{r.date || '---'}</td>
                                                <td className="px-4 py-2 text-right font-medium">{r.amount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-bold text-[#0078d4]">{r.balanceAmount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {returns.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-300 italic">No records found...</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-gray-200 space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[13px] font-bold text-gray-500">Total Returns & Advance:</span>
                                    <span className="text-[18px] font-black text-[#0078d4]">Rs. {formData.totalReturns.toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1 p-2 bg-blue-50/40 border border-blue-100/50 rounded-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Document</span>
                                        <input type="text" readOnly className="h-7 border border-gray-300 bg-white px-2 text-[11px] font-bold" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Date</span>
                                        <input type="text" readOnly className="h-7 border border-gray-300 bg-white px-2 text-[11px]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Amount</span>
                                        <input type="text" readOnly className="h-7 border border-gray-300 bg-white px-2 text-[11px] text-right" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase text-blue-600">Set Off Amount</span>
                                        <input type="number" step="0.01" className="h-7 border border-[#0078d4] bg-white px-2 text-[12px] font-black text-right outline-none focus:ring-1 ring-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Set Off Summary Grid */}
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
                        <div className="bg-slate-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                             <FileCheck size={16} className="text-green-600" />
                             <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.15em]">Selected Payment Set Off Allocation</h4>
                        </div>
                        <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
                            <table className="w-full text-left text-[11px] border-collapse sticky-header">
                                <thead className="bg-[#f1f5f9] border-b border-slate-300 text-slate-700 font-bold uppercase">
                                    <tr>
                                        <th className="px-3 py-3 border-r border-slate-200">Selected Doc</th>
                                        <th className="px-3 py-3 border-r border-slate-200">Date</th>
                                        <th className="px-3 py-3 border-r border-slate-200 text-right">Balance Amt</th>
                                        <th className="px-3 py-3 border-r border-slate-200 text-right text-blue-700">Set-Off Amount</th>
                                        <th className="px-3 py-3 border-r border-slate-200">Set-Off Document</th>
                                        <th className="px-3 py-3 border-r border-slate-200">Date</th>
                                        <th className="px-3 py-3 border-r border-slate-200 text-right font-black">Line Total</th>
                                        <th className="px-3 py-3 text-right text-red-600">Rem. Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedSetoffs.map((s, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-3 py-2 border-r border-slate-100 font-bold text-slate-700">{s.pendDoc}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 text-slate-500">{s.pendDate}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 text-right font-bold">{s.pendBal.toLocaleString()}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 text-right font-black text-blue-600 tabular-nums">{s.setoffAmount.toLocaleString()}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 font-bold text-slate-700">{s.retDoc}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 text-slate-500">{s.retDate}</td>
                                            <td className="px-3 py-2 border-r border-slate-100 text-right font-bold text-green-700 font-black">{s.retAmount.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-bold text-red-700">{(s.pendBal - s.setoffAmount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {selectedSetoffs.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-slate-300 font-medium italic">
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
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveSupplierModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] font-['Plus_Jakarta_Sans']">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Search Suppliers</h3>
                            <button 
                                onClick={() => setActiveSupplierModal(false)} 
                                className="w-10 h-10 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={20} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by supplier name or code..." 
                                    className="w-full h-12 border border-blue-100 pl-11 pr-4 text-sm rounded-lg focus:border-blue-500 outline-none shadow-inner" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Supplier Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSuppliers().length > 0 ? filteredSuppliers().map((s, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => handleSupplierSelect(s)}>
                                            <td className="p-3 border-b font-black text-slate-600">{s.code}</td>
                                            <td className="p-3 border-b font-bold text-[#0078d4] uppercase">{s.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-4 py-2 rounded-sm font-black hover:bg-[#005a9e] tracking-wider">SELECT</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="p-10 text-center text-gray-400 italic">No suppliers matching "{searchTerm}" found.</td></tr>
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

export default PaymentSetoffBoard;
