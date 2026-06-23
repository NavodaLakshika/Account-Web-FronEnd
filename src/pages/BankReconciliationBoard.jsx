import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, CheckCircle2, RotateCcw, Landmark, ListChecks, ArrowUpRight, ArrowDownLeft, Info, History, Save, CheckCircle, Loader2, X } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


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

    const getInitialHeader = () => ({
        docNo: 'BRC-AUTO',
        bankId: '',
        bankName: '',
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-GB'),
        dateTo: new Date().toLocaleDateString('en-GB'),
        statementDate: new Date().toLocaleDateString('en-GB'),
        openingBalance: 0,
        endingBalance: 0
    });

    const [header, setHeader] = useState(getInitialHeader());

    const [transactions, setTransactions] = useState({ debits: [], credits: [] });
    const [activeModal, setActiveModal] = useState(null); // 'bank', 'dateFrom', 'dateTo', 'statementDate'

    useEffect(() => {
        if (isOpen) {
            setHeader(getInitialHeader());
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
            if (txData.debits.length === 0 && txData.credits.length === 0) {
                showErrorToast('No new transactions found for this period');
            } else {
                showSuccessToast('Ledger records synchronized');
            }
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

    // Auto-clear when opened
    useEffect(() => {
        if (isOpen) {
            handleReset();
        }
    }, [isOpen, companyCode]);

    const handleReset = () => {
        setHeader(getInitialHeader());
        setTransactions({ debits: [], credits: [] });
        generateDocNo(companyCode);
    };

    const handleApply = async () => {
        if (totals.difference !== 0) return;
        setLoading(true);
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
            showSuccessToast("Bank Reconciliation applied successfully!");
            handleReset(); // Auto clear after apply
        } catch (err) {
            alert(err);
        } finally {
            setLoading(false);
        }
    };

    const renderGrid = (title, type, items, icon, color) => (
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[5px] shadow-sm overflow-hidden min-h-[450px]">
            <div className={`p-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50`}>
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded bg-${color}-50 text-${color}-600`}>{icon}</div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-700">
                    {items.filter(i => i.chk).length} / {items.length} Selected
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-gray-400 font-bold uppercase tracking-widest z-10 text-[9px]">
                        <tr>
                            <th className="px-3 py-2 w-12 text-center">Recon</th>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Doc/CHQ</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, i) => (
                            <tr key={i} onClick={() => toggleCheck(type, i)} className={`group cursor-pointer transition-colors ${item.chk ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                                <td className="px-3 py-1.5 text-center align-middle">
                                    <div className={`mx-auto w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${item.chk ? 'bg-[#00D1FF] border-[#00D1FF] text-white' : 'border-slate-300 group-hover:border-[#00D1FF]'}`}>
                                        {item.chk && <CheckCircle size={8} />}
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 font-mono font-bold text-slate-500">{item.date}</td>
                                <td className="px-3 py-1.5">
                                    <div className="font-bold text-slate-700 truncate max-w-[120px]">{item.docNo}</div>
                                    <div className="text-[9px] font-bold text-slate-400">{item.chqNo || 'No CHQ'}</div>
                                </td>
                                <td className={`px-3 py-1.5 text-right font-mono font-black ${type === 'credits' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {(type === 'debits' ? item.debit : item.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan={4} className="py-10 text-center text-slate-300 font-bold uppercase opacity-50 text-[10px]">No {title} Found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center font-black">
                <span className="text-[9px] text-gray-400 uppercase">Subtotal Reconciled</span>
                <span className={`text-[12px] ${type === 'credits' ? 'text-rose-600' : 'text-emerald-600'}`}>
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
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Bank Reconciliation Board" maxWidth="max-w-[1536px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-4">
                            <button onClick={handleReset} className="px-6 h-10 bg-white text-slate-500 text-[13px] font-mono font-bold tracking-widest uppercase rounded-[5px] border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                                <RotateCcw size={14} /> RESET FORM
                            </button>
                            <button onClick={loadData} disabled={loading} className="px-6 h-10 bg-white text-blue-600 border border-blue-200 text-[13px] font-mono font-bold tracking-widest uppercase rounded-[5px] hover:bg-blue-50 transition-all flex items-center gap-2 active:scale-95">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} SYNC RECORDS
                            </button>
                        </div>
                        <button onClick={handleApply} disabled={loading || totals.difference !== 0} className={`px-8 h-10 text-white text-[13px] font-mono font-bold tracking-widest uppercase rounded-[5px] transition-all flex items-center gap-2 ${totals.difference === 0 && !loading ? 'bg-[#2bb744] hover:bg-[#249e39] shadow-md shadow-[#2bb744]/20 active:scale-95' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} FINALIZE RECONCILIATION
                        </button>
                    </div>
                }
            >
                <div className="p-2 space-y-4 font-['Tahoma'] overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
                    
                    {/* Top Configuration & Statement Setup */}
                    <div className="bg-white p-3 border border-slate-200 rounded-[5px] shadow-sm flex flex-col gap-3">
                        
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Statement Setup</span>
                            <div className="bg-slate-50 px-3 py-1 rounded-[5px] border border-slate-200 flex items-center gap-2">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recon Ref:</span>
                                <span className="text-[10px] font-mono font-bold text-blue-500">{header.docNo}</span>
                                <span className="text-[8px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded uppercase">{currentUser}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 lg:col-span-4">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Select Bank Account</label>
                                <div className="flex gap-1.5 h-8">
                                    <div onClick={() => setActiveModal('bank')} className="flex-1 px-3 border border-slate-200 rounded flex items-center justify-between cursor-pointer focus-within:border-[#00D1FF] bg-slate-50 hover:bg-white group transition-all shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Landmark size={14} className="text-blue-500" />
                                            <span className="text-[12px] font-bold text-slate-700 uppercase truncate">
                                                {header.bankId ? `${header.bankId} - ${header.bankName}` : 'Select bank account...'}
                                            </span>
                                        </div>
                                        <ChevronDown size={14} className="text-slate-300" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Period From</label>
                                    <div onClick={() => setActiveModal('dateFrom')} className="h-8 px-3 border border-slate-200 rounded flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-white transition-all shadow-sm text-blue-600">
                                        <span className="text-[11px] font-bold font-mono">{header.dateFrom}</span>
                                        <Calendar size={12} className="text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Period To</label>
                                    <div onClick={() => setActiveModal('dateTo')} className="h-8 px-3 border border-slate-200 rounded flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-white transition-all shadow-sm text-blue-600">
                                        <span className="text-[11px] font-bold font-mono">{header.dateTo}</span>
                                        <Calendar size={12} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Statement Date</label>
                                    <div onClick={() => setActiveModal('statementDate')} className="h-8 px-3 border border-slate-200 rounded flex items-center justify-between cursor-pointer bg-white transition-all shadow-sm text-slate-700">
                                        <span className="text-[11px] font-bold font-mono">{header.statementDate}</span>
                                        <Calendar size={12} className="text-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 block">Statement Ending Bal</label>
                                    <input 
                                        type="number" value={header.endingBalance} onChange={e => setHeader({...header, endingBalance: parseFloat(e.target.value) || 0})}
                                        className="w-full bg-rose-50 border border-rose-200 h-8 rounded px-2 text-[13px] font-mono font-black text-rose-700 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all text-right shadow-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary & Difference Dashboard */}
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 lg:col-span-8 flex gap-2">
                            <div className="flex-1 bg-slate-50 p-3 rounded-[5px] border border-slate-200 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Opening Balance</div>
                                <div className="text-[15px] font-mono font-black text-slate-700">{header.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center justify-center text-slate-300 font-black">+</div>
                            <div className="flex-1 bg-emerald-50/30 p-3 rounded-[5px] border border-emerald-100 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <ArrowDownLeft size={10} /> Deposits
                                </div>
                                <div className="text-[15px] font-mono font-black text-emerald-700">{totals.recDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center justify-center text-slate-300 font-black">-</div>
                            <div className="flex-1 bg-rose-50/30 p-3 rounded-[5px] border border-rose-100 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <ArrowUpRight size={10} /> Payments
                                </div>
                                <div className="text-[15px] font-mono font-black text-rose-700">{totals.recCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center justify-center text-blue-300 font-black">=</div>
                            <div className="flex-1 bg-blue-50 p-3 rounded-[5px] border border-blue-200 flex flex-col justify-center shadow-inner">
                                <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Cleared Ledger Bal</div>
                                <div className="text-[15px] font-mono font-black text-blue-700">{totals.clearedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        {/* MASSIVE DIFFERENCE INDICATOR */}
                        <div className={`col-span-12 lg:col-span-4 p-3 rounded-[5px] border flex flex-col justify-center items-center shadow-inner transition-all duration-500 ${totals.difference === 0 ? 'bg-[#2bb744]/10 border-[#2bb744]/30' : 'bg-red-50 border-red-200'}`}>
                            <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${totals.difference === 0 ? 'text-[#2bb744]' : 'text-red-500'}`}>
                                {totals.difference === 0 ? 'PERFECTLY BALANCED' : 'DIFFERENCE TO RECONCILE'}
                            </div>
                            <div className={`text-[24px] font-mono font-black tracking-tight ${totals.difference === 0 ? 'text-[#2bb744]' : 'text-red-600'}`}>
                                {Math.abs(totals.difference).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Transaction Grids Side-by-Side */}
                    <div className="flex gap-4 min-h-0 flex-1 pt-2">
                        {renderGrid("Uncleared Deposits & Transfers", "debits", transactions.debits, <ArrowDownLeft size={12} />, "emerald")}
                        {renderGrid("Uncleared Payments & Withdrawals", "credits", transactions.credits, <ArrowUpRight size={12} />, "rose")}
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
