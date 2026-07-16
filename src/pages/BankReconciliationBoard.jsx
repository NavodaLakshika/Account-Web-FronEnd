import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, CheckCircle2, RotateCcw, Landmark, ListChecks, ArrowUpRight, ArrowDownLeft, Info, History, Save, CheckCircle, Loader2, X, FileText } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const SearchModal = ({ isOpen, onClose, title, items, onSelect }) => {
    const [q, setQ] = useState('');
    if (!isOpen) return null;
    const filtered = (items || []).filter(i => (i.name || '').toLowerCase().includes(q.toLowerCase()) || (i.code || '').toLowerCase().includes(q.toLowerCase()));

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" />
                    </div>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className=" px-5 py-3">Code</th>
                                    <th className=" px-5 py-3">Account Name</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No matching records found</td></tr>
                                ) : filtered.map((item, i) => (
                                    <tr key={i} onClick={() => { onSelect(item); onClose(); }} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50">
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
    const [activeModal, setActiveModal] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('dateFrom');

    useEffect(() => {
        if (isOpen) {
            setHeader(getInitialHeader());
            const { companyCode: comp, userName } = getSessionData();
            setCompanyCode(comp);
            setCurrentUser(userName);
            if (comp) {
                fetchLookups(comp);
                generateDocNo(comp);
            }
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
            const obData = await bankingService.getReconOpeningBalance({
                accId: header.bankId,
                companyCode,
                dateFrom: header.dateFrom,
                dateTo: header.dateTo
            });

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

        list[index].chk = newStatus;
        setTransactions({ ...transactions, [type]: list });

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
            handleReset();
        } catch (err) {
            alert(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date) => {
        setHeader(prev => ({ ...prev, [datePickerField]: date }));
        setShowDatePicker(false);
    };

    const renderGrid = (title, type, items, icon, color) => (
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[3px] overflow-hidden min-h-[450px]">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <span className={`${type === 'credits' ? 'text-rose-500' : 'text-emerald-500'}`}>{icon}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-700">
                    {items.filter(i => i.chk).length} / {items.length} Selected
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10 z-10">
                        <tr>
                            <th className="px-3 text-center w-12">Recon</th>
                            <th className="px-3">Date</th>
                            <th className="px-3">Doc/CHQ</th>
                            <th className="px-3 text-right">Amount</th>
                        <th className="text-right px-5 py-3">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, i) => (
                            <tr key={i} onClick={() => toggleCheck(type, i)} className={`group cursor-pointer transition-colors text-[12px] ${item.chk ? 'bg-emerald-50/30' : 'hover:bg-gray-50'}`}>
                                <td className="px-3 py-2 text-center align-middle">
                                    <div className={`mx-auto w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${item.chk ? 'bg-[#0285fd] border-[#0285fd] text-white' : 'border-gray-300 group-hover:border-[#0285fd]'}`}>
                                        {item.chk && <CheckCircle size={10} strokeWidth={3} />}
                                    </div>
                                </td>
                                <td className="px-3 py-2 font-mono font-bold text-slate-500">{item.date}</td>
                                <td className="px-3 py-2">
                                    <div className="font-bold text-slate-700 truncate max-w-[120px]">{item.docNo}</div>
                                    <div className="text-[9px] font-bold text-slate-400">{item.chqNo || 'No CHQ'}</div>
                                </td>
                                <td className={`px-3 py-2 text-right font-mono font-black ${type === 'credits' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {(type === 'debits' ? item.debit : item.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan={4} className="py-16 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">No {title} Found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Subtotal Reconciled</span>
                <span className={`text-[12px] font-bold font-mono ${type === 'credits' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {(type === 'debits' ? totals.recDebit : totals.recCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            </div>
        </div>
    );

    return (
        <>
            <style>{`@keyframes toastProgress{0%{width:100%}100%{width:0%}}`}</style>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText} isOpen={isOpen} onClose={onClose} title="Bank Reconciliation"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-4">
                            <button onClick={handleReset} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2">
                                <RotateCcw size={14} /> RESET
                            </button>
                            <button onClick={loadData} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} SYNC RECORDS
                            </button>
                        </div>
                        <button onClick={handleApply} disabled={loading || totals.difference !== 0} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} FINALIZE RECONCILIATION
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar">

                    {/* Statement Setup */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bank Account</label>
                                <div className="relative">
                                    <select
                                        value={header.bankId}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const item = (lookups.banks || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = item => setHeader({ ...header, bankId: item.code, bankName: item.name });
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.banks || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recon Ref:</span>
                                    <span className="text-[10px] font-mono font-bold text-blue-600">{header.docNo}</span>
                                    <span className="text-[8px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded uppercase">{currentUser}</span>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date From</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={header.dateFrom}
                                        onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date To</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={header.dateTo}
                                        onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Statement Date</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={header.statementDate}
                                        onClick={() => { setDatePickerField('statementDate'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => { setDatePickerField('statementDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ending Balance</label>
                                <input
                                    type="number" value={header.endingBalance} onChange={e => setHeader({ ...header, endingBalance: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-10 border border-rose-300 rounded-[3px] px-3 text-[14px] font-mono font-bold text-rose-700 bg-rose-50 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-right"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary & Difference Dashboard */}
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 lg:col-span-8 flex gap-2">
                            <div className="flex-1 bg-slate-50 p-3 rounded-[3px] border border-slate-200 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Opening Balance</div>
                                <div className="text-[15px] font-mono font-black text-slate-700">{header.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center justify-center text-slate-300 font-black">+</div>
                            <div className="flex-1 bg-emerald-50/30 p-3 rounded-[3px] border border-emerald-100 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <ArrowDownLeft size={10} /> Deposits
                                </div>
                                <div className="text-[15px] font-mono font-black text-emerald-700">{totals.recDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center justify-center text-slate-300 font-black">-</div>
                            <div className="flex-1 bg-rose-50/30 p-3 rounded-[3px] border border-rose-100 flex flex-col justify-center">
                                <div className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <ArrowUpRight size={10} /> Payments
                                </div>
                                <div className="text-[15px] font-mono font-black text-rose-700">{totals.recCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center justify-center text-blue-300 font-black">=</div>
                            <div className="flex-1 bg-blue-50 p-3 rounded-[3px] border border-blue-200 flex flex-col justify-center shadow-inner">
                                <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Cleared Ledger Bal</div>
                                <div className="text-[15px] font-mono font-black text-blue-700">{totals.clearedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        <div className={`col-span-12 lg:col-span-4 p-3 rounded-[3px] border flex flex-col justify-center items-center shadow-inner transition-all duration-500 ${totals.difference === 0 ? 'bg-blue-50/50 border-green-300' : 'bg-red-50 border-red-200'}`}>
                            <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${totals.difference === 0 ? 'text-[#0285fd]' : 'text-red-500'}`}>
                                {totals.difference === 0 ? 'PERFECTLY BALANCED' : 'DIFFERENCE TO RECONCILE'}
                            </div>
                            <div className={`text-[24px] font-mono font-black tracking-tight ${totals.difference === 0 ? 'text-[#0285fd]' : 'text-red-600'}`}>
                                {Math.abs(totals.difference).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Transaction Grids */}
                    <div className="flex gap-4 min-h-0 flex-1 pt-2">
                        {renderGrid("Uncleared Deposits & Transfers", "debits", transactions.debits, <ArrowDownLeft size={12} />, "emerald")}
                        {renderGrid("Uncleared Payments & Withdrawals", "credits", transactions.credits, <ArrowUpRight size={12} />, "rose")}
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Lookups */}
            <SearchModal
                isOpen={activeModal === 'bank'} onClose={() => setActiveModal(null)}
                title="Select Bank Account" items={lookups.banks}
                onSelect={item => setHeader({ ...header, bankId: item.code, bankName: item.name })}
            />
            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onDateSelect={handleDateSelect}
                initialDate={header[datePickerField]}
            />
        </>
    );
};

export default BankReconciliationBoard;
