import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Landmark, Search, Calendar, RotateCcw, Save, X, Loader2, ListFilter, CheckCircle2, History, Scale, LandmarkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BankReconciliationBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bankCode: '',
        bankName: '',
        statementDate: new Date().toISOString().split('T')[0],
        endingBalance: 0
    });

    const [clearedBalance, setClearedBalance] = useState(0);

    // Modal States
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankSearch, setBankSearch] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);

    // Dummy Banks
    const banks = [
        { code: 'B001', name: 'Commercial Bank - Main' },
        { code: 'B002', name: 'HNB Business Savings' },
        { code: 'B003', name: 'Sampath Corporate' }
    ];

    const delta = Math.abs(parseFloat(formData.endingBalance) - clearedBalance);
    const isMatched = delta === 0 && formData.bankCode !== '';

    const handleReset = () => {
        setFormData({
            bankCode: '',
            bankName: '',
            statementDate: new Date().toISOString().split('T')[0],
            endingBalance: 0
        });
        setClearedBalance(0);
        setBankSearch('');
    };

    const handleDateSelect = (date) => {
        setFormData({ ...formData, statementDate: date });
        setShowCalendar(false);
    };

    const handleFinish = async () => {
        if (!formData.bankCode) return toast.error('Please select a bank account to reconcile.');
        if (!isMatched) return toast.error('Reconciliation delta must be zero to finish.');

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Bank Reconciliation Completed!');
            onClose();
        } catch (error) {
            toast.error('Failed to complete reconciliation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Professional Bank Reconciliation"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleReset} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                            <RotateCcw size={14} /> RESET PROGRESS
                        </button>
                        <button onClick={handleFinish} disabled={loading} className={`px-6 h-10 bg-[#50af60] text-white text-sm font-bold rounded-[5px] shadow-md hover:bg-[#24db4e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            FINISH RECONCILIATION
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 font-['Tahoma'] relative select-none">
                    {/* Branding Icon */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                        <LandmarkIcon size={160} />
                    </div>

                    {/* Selection Header */}
                    <div className="grid grid-cols-12 gap-8 bg-white p-5 border border-gray-200 rounded shadow-sm relative overflow-hidden">
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                            <FormRow label="Statement Bank">
                                <div className="flex-1 flex gap-1 items-center">
                                    <div className="flex-1 flex flex-col pointer-events-none bg-slate-50 border border-gray-200 px-3 py-1 rounded-[5px]">
                                        <span className="text-[9px] font-black text-slate-400 leading-none mb-0.5">{formData.bankCode || 'CODE'}</span>
                                        <input
                                            type="text"
                                            readOnly
                                            value={formData.bankName}
                                            className="h-5 outline-none bg-transparent font-bold text-slate-700 text-[12px]"
                                        />
                                    </div>
                                    <button onClick={() => setShowBankModal(true)} className="w-10 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-90">
                                        <Search size={18} />
                                    </button>
                                </div>
                            </FormRow>
                            <FormRow label="Statement Date">
                                <div className="flex h-10 gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.statementDate}
                                        className="w-[120px] px-2 text-[13px] border border-gray-200 rounded-[5px] outline-none text-slate-700 font-bold bg-white text-center shadow-sm"
                                    />
                                    <button onClick={() => setShowCalendar(true)} className="w-10 h-10 bg-white border border-gray-300 text-[#0285fd] flex items-center justify-center hover:bg-blue-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </FormRow>
                        </div>

                        <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-4 border-l border-slate-100 pl-8">
                             <div className="flex flex-col justify-center bg-blue-50/30 p-4 rounded-[5px] border border-blue-100/50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Statement Ending Balance</span>
                                <div className="flex items-baseline gap-1">
                                    <input
                                        type="number"
                                        value={formData.endingBalance}
                                        onChange={(e) => setFormData({ ...formData, endingBalance: e.target.value })}
                                        className="w-full text-2xl font-black text-[#0078d4] bg-transparent outline-none tabular-nums"
                                    />
                                </div>
                            </div>
                             <div className="flex flex-col justify-center bg-slate-50/50 p-4 rounded-[5px] border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Cleared Balance</span>
                                <div className="text-2xl font-black text-slate-700 tabular-nums flex items-baseline gap-1">
                                    {clearedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center bg-white p-4 rounded-sm border border-gray-200 shadow-sm relative overflow-hidden group">
                                <div className={`absolute inset-0 transition-opacity duration-500 ${isMatched ? 'bg-green-600/10 opacity-100' : 'opacity-0'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest leading-none mb-2 relative z-10 ${isMatched ? 'text-green-600' : 'text-slate-400'}`}>
                                    {isMatched ? 'Perfectly Matched' : 'Reconciliation Delta'}
                                </span>
                                 <div className={`text-2xl font-black tabular-nums tracking-tighter relative z-10 flex items-baseline gap-1 ${isMatched ? 'text-green-600' : 'text-[#0078d4]'}`}>
                                    {delta.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    {isMatched && <CheckCircle2 size={24} className="ml-auto text-green-600" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dual Ledger Portfolios */}
                    <div className="grid grid-cols-2 gap-8 h-[450px]">
                        {/* Debit Column */}
                        <div className="flex flex-col border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-[#f8fafd] px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <History size={16} className="text-[#0078d4]" />
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Debit Instrument Portfolio</span>
                                </div>
                                <span className="text-[10px] font-black text-[#0078d4] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50 tabular-nums">0.00 Total</span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-[11px] border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 text-slate-400 font-black uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="w-12 py-3 px-4 text-center">√</th>
                                            <th className="py-3 px-4 text-left">Date</th>
                                            <th className="py-3 px-4 text-left">Reference</th>
                                            <th className="w-32 py-3 px-4 text-right">Valuation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        <tr className="hover:bg-blue-50/40 cursor-pointer group transition-colors">
                                            <td className="p-3 text-center">
                                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#0078d4] focus:ring-transparent transition-all" />
                                            </td>
                                            <td className="p-3 text-slate-500 font-medium">2026/03/10</td>
                                            <td className="p-3 font-black text-slate-700 uppercase tracking-tighter">DEP-00412</td>
                                            <td className="p-3 text-right font-black text-slate-800 tabular-nums text-[13px]">1,250.00</td>
                                        </tr>
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <tr key={i} className="bg-slate-50/10 h-12">
                                                <td colSpan={4}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Credit Column */}
                        <div className="flex flex-col border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-[#f8fafd] px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ListFilter size={16} className="text-red-500" />
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Credit Instrument Portfolio</span>
                                </div>
                                <span className="text-[10px] font-black text-[#d13438] bg-red-50 px-3 py-1 rounded-full border border-red-200/50 tabular-nums">0.00 Total</span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-[11px] border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 text-slate-400 font-black uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="w-12 py-3 px-4 text-center">√</th>
                                            <th className="py-3 px-4 text-left">Date</th>
                                            <th className="py-3 px-4 text-left">Reference</th>
                                            <th className="w-32 py-3 px-4 text-right">Valuation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        <tr className="hover:bg-red-50/40 cursor-pointer group transition-colors">
                                            <td className="p-3 text-center">
                                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-transparent transition-all" />
                                            </td>
                                            <td className="p-3 text-slate-500 font-medium">2026/03/08</td>
                                            <td className="p-3 font-black text-slate-700 uppercase tracking-tighter">ACH-REF-14</td>
                                            <td className="p-3 text-right font-black text-slate-800 tabular-nums text-[13px]">450.00</td>
                                        </tr>
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <tr key={i} className="bg-slate-50/10 h-12">
                                                <td colSpan={4}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer Comparison */}
                    <div className="bg-slate-50 p-6 border border-gray-200 flex justify-between items-center rounded-lg shadow-inner">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-4 cursor-pointer group bg-white px-5 py-3 rounded border border-gray-200 hover:border-[#0078d4] transition-all shadow-sm">
                                <input type="checkbox" className="w-6 h-6 rounded border-gray-300 text-[#0078d4] transition-all" />
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">Mass Reconciliation Protocol</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Automatically reconcile all perfectly matched ledger items</span>
                                </div>
                            </label>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 mb-1">
                                <Scale size={16} className="text-[#0078d4]" />
                                <span className="text-[10px] font-black text-[#0078d4] uppercase tracking-widest leading-none">Status Authentication</span>
                            </div>
                            <div className="text-[11px] font-bold italic text-slate-400 bg-white px-4 py-2 rounded-sm border border-slate-100 shadow-sm text-right max-w-sm leading-snug">
                                "System requires a zero delta synchronization between statement and cleared balances before auditing finalization."
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Bank Search Modal */}
            {showBankModal && (
                <SearchModal
                    title="Search Statement Bank Accounts"
                    query={bankSearch}
                    setQuery={setBankSearch}
                    onClose={() => setShowBankModal(false)}
                    data={banks}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Bank Institution', key: 'name' }]}
                    onSelect={(b) => {
                        setFormData({ ...formData, bankCode: b.code, bankName: b.name });
                        setShowBankModal(false);
                    }}
                />
            )}

            <CalendarModal 
                isOpen={showCalendar} 
                onClose={() => setShowCalendar(false)} 
                onDateSelect={handleDateSelect}
                initialDate={formData.statementDate}
            />
        </>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none pl-1">{label}</label>
        {children}
    </div>
);

const SearchModal = ({ title, query, setQuery, onClose, data, columns, onSelect }) => (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-500/30 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] font-['Tahoma']">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-base font-black text-slate-800 tracking-tight uppercase tracking-[0.05em]">{title}</h3>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search..." className="h-9 border border-gray-200 pl-9 pr-3 text-sm rounded-lg w-64 focus:border-blue-500 outline-none shadow-sm transition-all" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                        title="Close"
                    >
                        <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
            <div className="overflow-y-auto p-2">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 sticky top-0 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                        <tr>
                            {columns.map((col, idx) => <th key={idx} className="p-4 border-b border-slate-100">{col.label}</th>)}
                            <th className="p-4 border-b border-slate-100 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.filter(item =>
                            columns.some(col => (item[col.key] || '').toLowerCase().includes(query.toLowerCase()))
                        ).map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => onSelect(item)}>
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} className={`p-4 border-b border-slate-50 text-[13px] ${cIdx === 0 ? 'font-black text-slate-700' : 'font-medium text-slate-600'}`}>
                                        {item[col.key]}
                                    </td>
                                ))}
                                <td className="p-4 border-b border-slate-50 text-center">
                                    <button className="bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-blue-100/80 shadow-sm transition-all active:scale-95">SELECT</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default BankReconciliationBoard;
