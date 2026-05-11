import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, CheckCircle2, RotateCcw, Landmark, ListChecks, ArrowUpRight, ArrowDownLeft, Info, History, Save, CheckCircle, Loader2, X } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';
import { getSessionData } from '../utils/session';
import { DotLottiePlayer } from '@dotlottie/react-player';

const SearchModal = ({ isOpen, onClose, title, items, onSelect }) => {
    const [q, setQ] = useState('');
    if (!isOpen) return null;
    const filtered = (items || []).filter(i => (i.name || '').toLowerCase().includes(q.toLowerCase()) || (i.code || '').toLowerCase().includes(q.toLowerCase()));
    
    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[500px]">
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or code..." className="w-full h-8 pl-9 pr-4 border border-gray-200 rounded-[5px] outline-none text-[12px] focus:border-blue-500 bg-white" />
                    </div>
                </div>
                <div className="border border-gray-100 rounded-lg overflow-hidden max-h-[350px] overflow-y-auto no-scrollbar">
                    <table className="w-full text-left text-[12px]">
                        <thead className="bg-slate-50 sticky top-0 font-bold text-gray-500 border-b border-gray-100">
                            <tr><th className="px-4 py-2">Code</th><th className="px-4 py-2">Account Name</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((item, i) => (
                                <tr key={i} onClick={() => { onSelect(item); onClose(); }} className="hover:bg-blue-50/50 cursor-pointer transition-colors">
                                    <td className="px-4 py-2.5 font-mono text-blue-600">{item.code}</td>
                                    <td className="px-4 py-2.5 text-slate-700 font-bold uppercase">{item.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>
    );
};

const BankReconciliationBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [lookups, setLookups] = useState({ banks: [] });
    const [companyCode, setCompanyCode] = useState('');
    const [currentUser, setCurrentUser] = useState('');

    const [header, setHeader] = useState({
        docNo: 'BRC-AUTO',
        bankId: '',
        bankName: '',
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-GB'),
        dateTo: new Date().toLocaleDateString('en-GB'),
        statementDate: new Date().toLocaleDateString('en-GB'),
        openingBalance: 0,
        endingBalance: 0
    });

    const [transactions, setTransactions] = useState({ debits: [], credits: [] });
    const [activeModal, setActiveModal] = useState(null); // 'bank', 'dateFrom', 'dateTo', 'statementDate'

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-tahoma`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
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
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-tahoma`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
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

    useEffect(() => {
        if (isOpen) {
            const { companyCode: comp, userName } = getSessionData();
            setCompanyCode(comp);
            setCurrentUser(userName);
            fetchLookups(comp);
            generateDocNo(comp);
        }
    }, [isOpen]);

    const fetchLookups = async (comp) => {
        const data = await bankingService.getReconLookups(comp || companyCode);
        setLookups(data);
    };

    const generateDocNo = async (comp) => {
        const activeComp = comp || companyCode;
        const data = await bankingService.generateReconDocNo(activeComp);
        setHeader(prev => ({ ...prev, docNo: data.docNo }));
        await bankingService.initializeReconTemp(data.docNo, activeComp);
    };

    const loadData = async () => {
        if (!header.bankId) return showErrorToast('Please select a bank account');
        setLoading(true);
        try {
            // 1. Get Opening Balance
            const obData = await bankingService.getReconOpeningBalance({
                accId: header.bankId,
                companyCode,
                dateFrom: header.dateFrom,
                dateTo: header.dateTo
            });

            // 2. Get Transactions
            const txData = await bankingService.getReconTransactions({
                tempDoc: header.docNo,
                bankId: header.bankId,
                companyCode,
                dateFrom: header.dateFrom,
                dateTo: header.dateTo,
                openingBalance: obData.openingBalance
            });

            setHeader(prev => ({ ...prev, openingBalance: obData.openingBalance }));
            setTransactions(txData);
            showSuccessToast('Ledger records synchronized');
        } catch (error) {
            showErrorToast('Failed to sync bank records');
        } finally {
            setLoading(false);
        }
    };

    const toggleCheck = async (type, index) => {
        const list = [...transactions[type]];
        const item = list[index];
        const newStatus = !item.chk;
        
        // Optimistic update
        list[index].chk = newStatus;
        setTransactions({ ...transactions, [type]: list });

        // Backend update
        await bankingService.updateReconCheck({
            docNo: item.docNo,
            chqNo: item.chqNo,
            checked: newStatus,
            companyCode
        });
    };

    const totals = useMemo(() => {
        const recDebit = transactions.debits.filter(d => d.chk).reduce((sum, d) => sum + d.debit, 0);
        const recCredit = transactions.credits.filter(c => c.chk).reduce((sum, c) => sum + c.credit, 0);
        const clearedBalance = header.openingBalance + recDebit - recCredit;
        const difference = header.endingBalance - clearedBalance;
        
        return { recDebit, recCredit, clearedBalance, difference };
    }, [transactions, header.openingBalance, header.endingBalance]);

    const setDateRange = (type) => {
        const now = new Date();
        let from, to;
        const fmt = (d) => d.toLocaleDateString('en-GB');

        if (type === 'today') {
            from = to = now;
        } else if (type === 'yesterday') {
            from = to = new Date(new Date().setDate(now.getDate() - 1));
        } else if (type === 'thisMonth') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (type === 'lastMonth') {
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            to = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        setHeader(prev => ({ ...prev, dateFrom: fmt(from), dateTo: fmt(to) }));
    };

    const handleApply = async () => {
        if (Math.abs(totals.difference) > 0.01) {
            return showErrorToast(`Cannot apply reconciliation. Difference must be zero. Current: ${totals.difference.toFixed(2)}`);
        }

        setIsApplying(true);
        try {
            await bankingService.applyRecon({
                docNo: header.docNo,
                bankId: header.bankId,
                companyCode,
                dateFrom: header.dateFrom,
                dateTo: header.dateTo,
                endBalance: header.endingBalance,
                clearedBalance: totals.clearedBalance,
                difference: totals.difference
            });
            showSuccessToast('Bank Reconciliation Finalized');
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsApplying(false);
        }
    };

    const renderGrid = (title, type, items, icon, color) => (
        <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden min-h-[450px]">
            <div className={`p-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50`}>
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-${color}-50 text-${color}-600`}>{icon}</div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
                </div>
                <div className="text-[12px] font-black text-slate-700">
                    {items.filter(i => i.chk).length} / {items.length} Selected
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-left text-[11px]">
                    <thead className="bg-white sticky top-0 border-b border-slate-50 text-slate-400 font-black uppercase tracking-tighter z-10">
                        <tr>
                            <th className="px-4 py-2 w-10">Recon</th>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Doc/CHQ</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {items.map((item, i) => (
                            <tr key={i} onClick={() => toggleCheck(type, i)} className={`group cursor-pointer transition-colors ${item.chk ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                                <td className="px-4 py-2">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${item.chk ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                        {item.chk && <CheckCircle size={10} />}
                                    </div>
                                </td>
                                <td className="px-4 py-2 font-mono text-slate-500">{item.date}</td>
                                <td className="px-4 py-2">
                                    <div className="font-bold text-slate-700 truncate max-w-[150px]">{item.docNo}</div>
                                    <div className="text-[10px] text-slate-400">{item.chqNo || 'No CHQ'}</div>
                                </td>
                                <td className={`px-4 py-2 text-right font-mono font-black ${type === 'credits' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {(type === 'debits' ? item.debit : item.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-bold uppercase  opacity-50">No {title} Found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center font-black">
                <span className="text-[10px] text-slate-400 uppercase">Subtotal Reconciled</span>
                <span className={`text-[13px] ${type === 'credits' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {(type === 'debits' ? totals.recDebit : totals.recCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            </div>
        </div>
    );

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
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Bank Reconciliation Board" maxWidth="max-w-[1600px]"
                footer={
                    <div className="bg-slate-50 px-8 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl shadow-inner">
                        <div className="flex gap-3">
                            <button onClick={() => window.location.reload()} className="px-6 h-10 bg-white text-slate-500 text-[12px] font-black rounded-[5px] border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 uppercase">
                                <RotateCcw size={16} /> Reset Form
                            </button>
                            <button onClick={loadData} disabled={loading} className="px-6 h-10 bg-white text-blue-600 border-2 border-blue-600 text-[12px] font-black rounded-[5px] hover:bg-blue-50 transition-all flex items-center gap-2 uppercase">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <ListChecks size={16} />} Sync Records
                            </button>
                        </div>
                        <div className="flex items-center gap-8 mr-4">
                            <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Difference</div>
                                <div className={`text-[20px] font-mono font-black ${Math.abs(totals.difference) < 0.01 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {totals.difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <button onClick={handleApply} disabled={isApplying || loading || Math.abs(totals.difference) > 0.01}
                                className={`px-12 h-10 bg-[#2bb744] text-white text-[12px] font-black rounded-[5px] shadow-md hover:bg-[#259b3a] transition-all flex items-center gap-2 uppercase tracking-widest ${isApplying || loading || Math.abs(totals.difference) > 0.01 ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95'}`}
                            >
                                {isApplying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Finalize Reconciliation
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="p-1 space-y-4 font-['Tahoma'] overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
                    {/* Header Controls */}
                    <div className="bg-white p-5 border border-slate-100 rounded-xl shadow-sm grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Recon Reference</label>
                            <div className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-[5px] flex items-center justify-between font-mono font-bold text-blue-600">
                                <span>{header.docNo}</span>
                                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">{currentUser}</span>
                            </div>
                        </div>
                        
                        <div className="col-span-12 lg:col-span-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Select Bank Account</label>
                            <div className="flex gap-2 h-9">
                                <div onClick={() => setActiveModal('bank')} className="flex-1 px-4 border border-slate-200 rounded-[5px] flex items-center justify-between cursor-pointer hover:border-blue-500 bg-white group transition-all">
                                    <div className="flex items-center gap-3">
                                        <Landmark size={15} className="text-slate-300 group-hover:text-blue-500" />
                                        <span className="text-[12px] font-bold text-slate-700 uppercase truncate">
                                            {header.bankId ? `${header.bankId} - ${header.bankName}` : 'Select target bank account...'}
                                        </span>
                                    </div>
                                    <ChevronDown size={14} className="text-slate-300" />
                                </div>
                                <button onClick={() => setActiveModal('bank')} className="w-10 bg-blue-600 text-white flex items-center justify-center rounded-[5px] hover:bg-blue-700 transition-all shadow-sm">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-5 grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <label className="text-[11px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Period From</label>
                                <div className="flex h-9 gap-1.5">
                                    <div onClick={() => setActiveModal('dateFrom')} className="flex-1 px-3 border border-slate-200 rounded-[5px] flex items-center justify-center cursor-pointer hover:border-blue-500 bg-white group shadow-sm transition-all">
                                        <span className="text-[12px] font-bold text-slate-700">{header.dateFrom}</span>
                                    </div>
                                    <button onClick={() => setActiveModal('dateFrom')} className="w-9 bg-blue-600 text-white flex items-center justify-center rounded-[5px] hover:bg-blue-700 transition-all shadow-sm active:scale-90 shrink-0">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="text-[11px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Period To</label>
                                <div className="flex h-9 gap-1.5">
                                    <div onClick={() => setActiveModal('dateTo')} className="flex-1 px-3 border border-slate-200 rounded-[5px] flex items-center justify-center cursor-pointer hover:border-blue-500 bg-white group shadow-sm transition-all">
                                        <span className="text-[12px] font-bold text-slate-700">{header.dateTo}</span>
                                    </div>
                                    <button onClick={() => setActiveModal('dateTo')} className="w-9 bg-blue-600 text-white flex items-center justify-center rounded-[5px] hover:bg-blue-700 transition-all shadow-sm active:scale-90 shrink-0">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Summary Section */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Quick Ranges</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setDateRange('today')} className="h-8 bg-white hover:bg-slate-50 text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 transition-all shadow-sm">Today</button>
                                <button onClick={() => setDateRange('yesterday')} className="h-8 bg-white hover:bg-slate-50 text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 transition-all shadow-sm">Yesterday</button>
                                <button onClick={() => setDateRange('thisMonth')} className="h-8 bg-white hover:bg-slate-50 text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 transition-all shadow-sm">This Month</button>
                                <button onClick={() => setDateRange('lastMonth')} className="h-8 bg-white hover:bg-slate-50 text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 transition-all shadow-sm">Last Month</button>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-6 grid grid-cols-4 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Opening Balance</div>
                                <div className="text-[16px] font-mono font-black text-slate-700">{header.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <ArrowDownLeft size={10} /> Reconciled Deposits
                                </div>
                                <div className="text-[16px] font-mono font-black text-emerald-700">{totals.recDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <ArrowUpRight size={10} /> Reconciled Payments
                                </div>
                                <div className="text-[16px] font-mono font-black text-rose-700">{totals.recCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Cleared Ledger Balance</div>
                                <div className="text-[16px] font-mono font-black text-blue-700">{totals.clearedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-3 bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3 border border-slate-100">
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Statement Ending Balance</label>
                                <input 
                                    type="number" value={header.endingBalance} onChange={e => setHeader({...header, endingBalance: parseFloat(e.target.value) || 0})}
                                    className="w-full bg-slate-50 border border-slate-200 h-9 rounded-[5px] px-3 text-[16px] font-mono font-black text-slate-800 outline-none focus:border-blue-500 transition-all text-right"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Statement Date</label>
                                <div className="flex h-9 gap-1.5">
                                    <div onClick={() => setActiveModal('statementDate')} className="flex-1 px-3 border border-slate-200 rounded-[5px] flex items-center justify-center cursor-pointer hover:border-blue-500 bg-white group shadow-sm transition-all text-center">
                                        <span className="text-[12px] font-bold text-slate-700">{header.statementDate}</span>
                                    </div>
                                    <button onClick={() => setActiveModal('statementDate')} className="w-9 bg-blue-600 text-white flex items-center justify-center rounded-[5px] hover:bg-blue-700 transition-all shadow-sm active:scale-90 shrink-0">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Grids Side-by-Side */}
                    <div className="flex gap-6 min-h-0 flex-1">
                        {renderGrid("Deposits & Transfers (Debits)", "debits", transactions.debits, <ArrowDownLeft size={14} />, "emerald")}
                        {renderGrid("Payments & Withdrawals (Credits)", "credits", transactions.credits, <ArrowUpRight size={14} />, "rose")}
                    </div>
                </div>
            </SimpleModal>

            {/* Lookups */}
            <SearchModal 
                isOpen={activeModal === 'bank'} onClose={() => setActiveModal(null)} 
                title="Select Bank Account" items={lookups.banks}
                onSelect={item => setHeader({...header, bankId: item.code, bankName: item.name})}
            />
            <CalendarModal 
                isOpen={!!['dateFrom', 'dateTo', 'statementDate'].includes(activeModal)} 
                onClose={() => setActiveModal(null)}
                onSelect={date => setHeader({...header, [activeModal]: date})}
            />
        </>
    );
};

export default BankReconciliationBoard;
