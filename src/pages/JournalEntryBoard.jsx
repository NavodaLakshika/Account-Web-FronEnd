import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { BookOpen, Search, RotateCcw, Save, Calendar, Plus, X, Loader2, ListFilter, Scale, ArrowRightLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const JournalEntryBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        entryId: 'GEN-001',
        entryDate: new Date().toISOString().split('T')[0],
        internalNote: ''
    });

    const [lines, setLines] = useState([
        { id: Date.now(), accountId: '', accountName: '', debit: 0, credit: 0, memo: '' },
        { id: Date.now() + 1, accountId: '', accountName: '', debit: 0, credit: 0, memo: '' }
    ]);

    // Modal States
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [accountSearch, setAccountSearch] = useState('');
    const [activeRowIndex, setActiveRowIndex] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    // Dummy Ledger Accounts
    const ledgerAccounts = [
        { code: '1010', name: 'Cash on Hand' },
        { code: '1200', name: 'Accounts Receivable' },
        { code: '2000', name: 'Accounts Payable' },
        { code: '4000', name: 'Sales Revenue' },
        { code: '5000', name: 'Office Expenses' },
        { code: '6000', name: 'Salary Expense' }
    ];

    const addLine = () => {
        setLines([...lines, { id: Date.now(), accountId: '', accountName: '', debit: 0, credit: 0, memo: '' }]);
    };

    const handleLineUpdate = (id, field, value) => {
        setLines(lines.map(l => {
            if (l.id === id) {
                const updated = { ...l, [field]: value };
                // If debit is entered, clear credit, and vice-versa (Standard double entry row behavior)
                if (field === 'debit' && value > 0) updated.credit = 0;
                if (field === 'credit' && value > 0) updated.debit = 0;
                return updated;
            }
            return l;
        }));
    };

    const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;
    const difference = Math.abs(totalDebit - totalCredit);

    const handleSave = async () => {
        if (!isBalanced) return toast.error('Journal entry must be balanced (Total Debit = Total Credit).');

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Journal Entry Posted Successfully!');
            handleReset();
        } catch (error) {
            toast.error('Failed to post journal entry.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            entryId: 'GEN-001',
            entryDate: new Date().toISOString().split('T')[0],
            internalNote: ''
        });
        setLines([
            { id: Date.now(), accountId: '', accountName: '', debit: 0, credit: 0, memo: '' },
            { id: Date.now() + 1, accountId: '', accountName: '', debit: 0, credit: 0, memo: '' }
        ]);
        setAccountSearch('');
    };

    const handleDateSelect = (date) => {
        setFormData({ ...formData, entryDate: date });
        setShowCalendar(false);
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="General Journal Entry"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleReset} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                            <RotateCcw size={14} /> CLEAR ENTRY
                        </button>
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#50af60] text-white text-sm font-bold rounded-[5px] shadow-md hover:bg-[#24db4e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            POST JOURNAL
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 font-['Tahoma'] relative select-none">
                    {/* Branding Icon */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                        <BookOpen size={160} />
                    </div>

                    {/* Header Information */}
                    <div className="grid grid-cols-12 gap-10 bg-white p-5 border border-gray-200 rounded shadow-sm">
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                            <FormRow label="Entry ID">
                                <input type="text" className="flex-1 h-8 border border-gray-300 px-3 text-[12px] bg-slate-50 font-black text-slate-700 rounded-[5px]" value={formData.entryId} readOnly />
                            </FormRow>
                             <FormRow label="Entry Date">
                                <div className="flex h-8 gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.entryDate}
                                        className="w-[110px] px-2 text-[12px] border border-gray-300 rounded-[5px] outline-none text-slate-700 font-bold bg-white text-center shadow-sm"
                                    />
                                    <button onClick={() => setShowCalendar(true)} className="w-9 h-8 bg-white border border-gray-300 text-[#0285fd] flex items-center justify-center hover:bg-blue-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </FormRow>
                        </div>

                        <div className="col-span-12 lg:col-span-8 pl-10 border-l border-slate-100">
                            <FormRow label="Internal Note">
                                <textarea
                                    value={formData.internalNote}
                                    onChange={(e) => setFormData({ ...formData, internalNote: e.target.value })}
                                    className="flex-1 min-h-[72px] border border-gray-300 p-3 text-[12px] rounded-[5px] outline-none hover:border-blue-300 focus:border-blue-500 transition-all resize-none"
                                />
                            </FormRow>
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div className="space-y-0">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <ListFilter size={16} className="text-[#0078d4]" />
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Double-Entry Allocation</span>
                            </div>
                            {difference > 0 && (
                                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                                    <Scale size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Difference: {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-300 rounded-lg shadow-sm bg-white overflow-hidden">
                            <table className="w-full text-[11px] border-collapse">
                                <thead className="bg-[#f8fafd] border-b border-gray-200 text-slate-600 font-black uppercase tracking-wider">
                                    <tr>
                                        <th className="w-12 py-3 px-4 text-center border-r border-gray-200">#</th>
                                        <th className="py-3 px-4 text-left border-r border-gray-200">Account Nomenclature</th>
                                        <th className="w-40 py-3 px-4 text-right border-r border-gray-200">Debit Vol.</th>
                                        <th className="w-40 py-3 px-4 text-right border-r border-gray-200">Credit Vol.</th>
                                        <th className="py-3 px-4 text-left">Record Memo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {lines.map((line, idx) => (
                                        <tr key={line.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-2 text-center text-slate-300 font-black tabular-nums border-r border-gray-100">
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </td>
                                            <td className="p-1.5 border-r border-gray-100">
                                                <div className="flex gap-1 items-center">
                                                    <div className="flex-1 flex flex-col pointer-events-none">
                                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-[#0078d4] leading-none mb-0.5 transition-colors">{line.accountId}</span>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={line.accountName}
                                                            className="h-6 outline-none bg-transparent font-bold text-slate-700"
                                                        />
                                                    </div>
                                                    <button onClick={() => { setActiveRowIndex(idx); setShowAccountModal(true); }} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-90">
                                                        <Search size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-1.5 border-r border-gray-100">
                                                <input
                                                    type="number"
                                                    value={line.debit || ''}
                                                    onChange={(e) => handleLineUpdate(line.id, 'debit', parseFloat(e.target.value) || 0)}
                                                    className={`w-full h-9 px-3 text-right text-[14px] font-black outline-none border border-transparent focus:border-blue-200 rounded-[5px] tabular-nums bg-transparent transition-all ${line.debit > 0 ? 'text-[#0078d4]' : 'text-slate-200'}`}
                                                />
                                            </td>
                                            <td className="p-1.5 border-r border-gray-100">
                                                <input
                                                    type="number"
                                                    value={line.credit || ''}
                                                    onChange={(e) => handleLineUpdate(line.id, 'credit', parseFloat(e.target.value) || 0)}
                                                    className={`w-full h-9 px-3 text-right text-[14px] font-black outline-none border border-transparent focus:border-slate-200 rounded-[5px] tabular-nums bg-transparent transition-all ${line.credit > 0 ? 'text-slate-600' : 'text-slate-200'}`}
                                                />
                                            </td>
                                            <td className="p-1.5">
                                                <input
                                                    type="text"
                                                    value={line.memo}
                                                    onChange={(e) => handleLineUpdate(line.id, 'memo', e.target.value)}
                                                    className="w-full h-9 px-3 outline-none border border-transparent focus:border-blue-200 rounded-[5px] font-medium text-slate-500 italic bg-transparent"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="h-14 bg-slate-50/20">
                                        <td colSpan={5}>
                                            <button onClick={addLine} className="w-full h-full text-[10px] font-black text-[#0078d4] uppercase tracking-[0.2em] hover:bg-blue-50 transition-colors flex items-center justify-center gap-3">
                                                <Plus size={16} /> ADD NEW JOURNAL LINE RECORD
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-slate-50 shadow-inner px-8 py-6 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-24">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Aggregate Debit</span>
                                    <div className="text-4xl font-black text-[#0078d4] tabular-nums tracking-tighter flex items-baseline gap-1">
                                        {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Aggregate Credit</span>
                                    <div className="text-4xl font-black text-slate-700 tabular-nums tracking-tighter flex items-baseline gap-1">
                                        {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowRightLeft size={16} className={isBalanced ? 'text-green-500' : 'text-slate-300'} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Entry Synchronization</span>
                                </div>
                                <div className={`px-6 py-2 rounded shadow-sm text-xs font-black tracking-[0.1em] uppercase transition-all duration-300 ${isBalanced ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white text-slate-400 border border-slate-200 translate-y-1 opacity-60'}`}>
                                    {isBalanced ? 'Balanced Accounted' : 'Out of Balance'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Account Search Modal */}
            {showAccountModal && (
                <SearchModal
                    title="Search Ledger Accounts"
                    query={accountSearch}
                    setQuery={setAccountSearch}
                    onClose={() => setShowAccountModal(false)}
                    data={ledgerAccounts}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Account Name', key: 'name' }]}
                    onSelect={(a) => {
                        const newLines = [...lines];
                        newLines[activeRowIndex].accountId = a.code;
                        newLines[activeRowIndex].accountName = a.name;
                        setLines(newLines);
                        setShowAccountModal(false);
                    }}
                />
            )}

            <CalendarModal 
                isOpen={showCalendar} 
                onClose={() => setShowCalendar(false)} 
                onDateSelect={handleDateSelect}
                initialDate={formData.entryDate}
            />
        </>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-start gap-4">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-[110px] pt-2 shrink-0 leading-none">{label}</label>
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

export default JournalEntryBoard;
