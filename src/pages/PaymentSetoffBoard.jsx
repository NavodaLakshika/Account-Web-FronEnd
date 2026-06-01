import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, ArrowRightLeft, UserCircle, Briefcase, FileCheck, CheckCircle2, History, AlertTriangle } from 'lucide-react';
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
    
    const [activeSupplierModal, setActiveSupplierModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
                    <div className="bg-slate-50/80 px-6 py-3 w-full flex justify-end gap-3 border-t border-slate-200 rounded-b-[5px]">
                        <button onClick={handleApplySetoff} disabled={loading} className={`px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} APPLY SETOFF
                        </button>
                        <button onClick={onClose} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                             <X size={16} /> EXIT
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] flex items-center justify-between">
                         <div className="flex items-center gap-4 flex-1">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-20 shrink-0">Supplier</label>
                            <div className="flex-1 max-w-[500px] flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.supplierName ? `${formData.supplierId} - ${formData.supplierName}` : ''} 
                                    placeholder="Search supplier to load pending payments & returns..." 
                                    className="flex-1 h-8 border border-slate-200 px-4 text-sm font-mono font-bold text-[#0285fd] rounded bg-slate-50 outline-none" 
                                />
                                <button onClick={() => { setActiveSupplierModal(true); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-90 border-none">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Document No:</label>
                                <input type="text" value={formData.docNo} readOnly className="w-40 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-[#0285fd] bg-slate-50 rounded outline-none" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Date:</label>
                                <input type="date" value={formData.date} readOnly className="w-44 h-8 border border-slate-200 px-3 text-sm font-mono font-bold rounded bg-slate-50 outline-none" />
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
                            <div className="h-[250px] overflow-y-auto overflow-x-hidden">
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
                                            <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer group">
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
                            <div className="h-[250px] overflow-y-auto overflow-x-hidden">
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
                                            <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer group">
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

                    {/* Selected Set Off Summary Grid */}
                    <div className="bg-white border border-slate-200 rounded-[5px] flex flex-col overflow-hidden">
                        <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                             <FileCheck size={14} className="text-green-600" />
                             <h4 className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-widest">Selected Payment Set Off Allocation</h4>
                        </div>
                        <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
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
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setActiveSupplierModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-[5px] border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-white">
                            <h3 className="text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest">Search Suppliers</h3>
                            <button 
                                onClick={() => setActiveSupplierModal(false)} 
                                className="w-8 h-8 bg-white/10 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all border-none"
                                title="Close"
                            >
                                <X size={15} strokeWidth={2} />
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
        </>
    );
};

export default PaymentSetoffBoard;
