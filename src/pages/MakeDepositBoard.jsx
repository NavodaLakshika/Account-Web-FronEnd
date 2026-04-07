import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Landmark, Search, RotateCcw, Save, Calendar, Plus, X, Loader2, Wallet, Banknote, ListFilter, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MakeDepositBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        depositTo: '',
        depositDate: new Date().toISOString().split('T')[0],
        memo: '',
        refNo: '',
        printConfirmation: false
    });

    const [entries, setEntries] = useState([
        { id: Date.now(), receivedFrom: '', accountId: '', memo: '', amount: 0 }
    ]);

    // Modal States
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankSearch, setBankSearch] = useState('');
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [accountSearch, setAccountSearch] = useState('');
    const [activeRowIndex, setActiveRowIndex] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    // Dummy Lookups (These should be fetched from API in production)
    const lookups = {
        banks: [
            { code: 'B001', name: 'Checking Account - Main' },
            { code: 'B002', name: 'Business Savings - HQ' },
            { code: 'B003', name: 'Petty Cash - Ops' }
        ],
        accounts: [
            { code: '1010', name: 'Accounts Receivable' },
            { code: '1200', name: 'Inventory Asset' },
            { code: '4000', name: 'Sales Revenue' },
            { code: '5000', name: 'Cost of Goods Sold' }
        ]
    };

    const addEntry = () => {
        setEntries([...entries, { id: Date.now(), receivedFrom: '', accountId: '', memo: '', amount: 0 }]);
    };

    const removeEntry = (id) => {
        if (entries.length > 1) {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    const handleEntryUpdate = (id, field, value) => {
        setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const totalAmount = entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const handleSave = async () => {
        if (!formData.depositTo) return toast.error('Please select a destination bank account.');
        if (totalAmount <= 0) return toast.error('Total deposit amount must be greater than zero.');

        setLoading(true);
        try {
            // Simulated API Call
            await new Promise(resolve => setTimeout(resolve, 1200));
            toast.success('Deposit Submitted Successfully!');
            handleReset();
        } catch (error) {
            toast.error('Failed to submit deposit.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            depositTo: '',
            depositDate: new Date().toISOString().split('T')[0],
            memo: '',
            refNo: '',
            printConfirmation: false
        });
        setEntries([{ id: Date.now(), receivedFrom: '', accountId: '', memo: '', amount: 0 }]);
        setBankSearch('');
        setAccountSearch('');
    };

    const handleDateSelect = (date) => {
        setFormData({ ...formData, depositDate: date });
        setShowCalendar(false);
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Make Deposit"
                maxWidth="max-w-5xl"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end items-center border-t border-gray-100 rounded-b-xl gap-3">
                        <button onClick={handleReset} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                            <RotateCcw size={14} /> CLEAR FORM
                        </button>
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#50af60] text-white text-sm font-bold rounded-[5px] shadow-md hover:bg-[#24db4e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            SAVE DEPOSIT
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 font-['Tahoma'] relative select-none">
                    {/* Header Branding Icon */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                        <Banknote size={140} />
                    </div>

                    {/* Header Section */}
                    <div className="grid grid-cols-2 gap-10 bg-white p-5 border border-gray-200 rounded shadow-sm">
                        <div className="space-y-4">
                            <FormRow label="Deposit To">
                                <div className="flex-1 flex gap-1 items-center">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.depositTo ? `${formData.depositTo} - ${lookups.banks.find(b => b.code === formData.depositTo)?.name || ''}` : ''}
                                        className="flex-1 h-8 border border-gray-300 px-3 text-[12px] bg-slate-50 font-bold text-slate-700 rounded-[5px] outline-none"
                                    />
                                    <button onClick={() => setShowBankModal(true)} className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-90">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </FormRow>
                            <FormRow label="Deposit Date">
                                <div className="flex h-8 gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.depositDate}
                                        className="w-[110px] px-2 text-[12px] border border-gray-300 rounded-[5px] outline-none text-slate-700 font-bold bg-white text-center shadow-sm"
                                    />
                                    <button onClick={() => setShowCalendar(true)} className="w-9 h-8 bg-white border border-gray-300 text-[#0285fd] flex items-center justify-center hover:bg-blue-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </FormRow>
                        </div>

                        <div className="space-y-4 pl-10 border-l border-slate-100">
                            <FormRow label="Memo / Ref">
                                <input
                                    type="text"
                                    value={formData.memo}
                                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                                    className="flex-1 h-8 border border-gray-300 px-3 text-[12px] rounded-[5px] outline-none hover:border-blue-300 focus:border-blue-500 transition-colors"
                                />
                            </FormRow>
                            <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-sm flex justify-between items-center shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Deposit Amount</span>
                                    <div className="text-2xl font-black text-[#0078d4] tabular-nums tracking-tighter">
                                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <Wallet className="text-blue-200" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Deposit Table */}
                    <div className="space-y-0">
                        <div className="flex items-center gap-3 mb-2">
                            <ListFilter size={16} className="text-[#0078d4]" />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Entry Allocation</span>
                        </div>

                        <div className="border border-gray-300 rounded-lg shadow-sm bg-white overflow-hidden">
                            <table className="w-full text-[11px] border-collapse">
                                <thead className="bg-[#f8fafd] border-b border-gray-200 text-slate-600 font-black uppercase tracking-wider">
                                    <tr>
                                        <th className="w-12 py-3 px-4 text-center border-r border-gray-200">#</th>
                                        <th className="py-3 px-4 text-left border-r border-gray-200">Received From</th>
                                        <th className="py-3 px-4 text-left border-r border-gray-200">Account Mapping</th>
                                        <th className="py-3 px-4 text-left border-r border-gray-200">Memo / Details</th>
                                        <th className="w-44 py-3 px-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {entries.map((entry, idx) => (
                                        <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-2 text-center text-slate-300 font-black tabular-nums border-r border-gray-100">
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </td>
                                            <td className="p-1.5 border-r border-gray-100">
                                                <input
                                                    type="text"
                                                    value={entry.receivedFrom}
                                                    onChange={(e) => handleEntryUpdate(entry.id, 'receivedFrom', e.target.value)}
                                                    className="w-full h-8 px-2 outline-none border border-transparent focus:border-blue-200 rounded-[5px] font-semibold text-slate-700 bg-transparent"
                                                />
                                            </td>
                                            <td className="p-1.5 border-r border-gray-100">
                                                <div className="flex gap-1 items-center">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={lookups.accounts.find(a => a.code === entry.accountId)?.name || ''}
                                                        className="flex-1 h-8 px-2 outline-none bg-white border border-gray-200 rounded-[5px] font-medium text-slate-600"
                                                    />
                                                    <button onClick={() => { setActiveRowIndex(idx); setShowAccountModal(true); }} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-90">
                                                        <Search size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-1.5 border-r border-gray-100">
                                                <input
                                                    type="text"
                                                    value={entry.memo}
                                                    onChange={(e) => handleEntryUpdate(entry.id, 'memo', e.target.value)}
                                                    className="w-full h-8 px-2 outline-none border border-transparent focus:border-blue-200 rounded-[5px] font-medium text-slate-500 italic bg-transparent"
                                                />
                                            </td>
                                            <td className="p-1.5">
                                                <input
                                                    type="number"
                                                    value={entry.amount}
                                                    onChange={(e) => handleEntryUpdate(entry.id, 'amount', e.target.value)}
                                                    className="w-full h-8 px-2 text-right text-[13px] font-black text-[#0078d4] outline-none border border-transparent focus:border-blue-300 rounded-sm tabular-nums bg-transparent"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="h-12 bg-slate-50/10">
                                        <td colSpan={5}>
                                            <button onClick={addEntry} className="w-full h-full text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                                <Plus size={14} /> ADD NEW DEPOSIT LINE
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="flex justify-between items-center py-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.printConfirmation}
                                    onChange={(e) => setFormData({ ...formData, printConfirmation: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-[#0078d4] focus:ring-blue-500 shadow-sm transition-all"
                                />
                            </div>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight group-hover:text-slate-800 transition-colors">Print deposit confirmation</span>
                        </label>
                        <div className="text-[10px] font-bold text-slate-300 italic">SECURE TRANSACTION VERIFIED</div>
                    </div>
                </div>
            </SimpleModal>

            {/* --- MODALS --- */}

            {/* Bank Search Modal */}
            {showBankModal && (
                <SearchModal
                    title="Search Bank Accounts"
                    query={bankSearch}
                    setQuery={setBankSearch}
                    onClose={() => setShowBankModal(false)}
                    data={lookups.banks}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Account Name', key: 'name' }]}
                    onSelect={(b) => {
                        setFormData({ ...formData, depositTo: b.code });
                        setShowBankModal(false);
                    }}
                />
            )}

            {/* Account Mapping Search Modal */}
            {showAccountModal && (
                <SearchModal
                    title="Search Ledger Accounts"
                    query={accountSearch}
                    setQuery={setAccountSearch}
                    onClose={() => setShowAccountModal(false)}
                    data={lookups.accounts}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Account Name', key: 'name' }]}
                    onSelect={(a) => {
                        if (activeRowIndex !== null) {
                            const newEntries = [...entries];
                            newEntries[activeRowIndex].accountId = a.code;
                            setEntries(newEntries);
                        }
                        setShowAccountModal(false);
                    }}
                />
            )}

            <CalendarModal 
                isOpen={showCalendar} 
                onClose={() => setShowCalendar(false)} 
                onDateSelect={handleDateSelect}
                initialDate={formData.depositDate}
            />
        </>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center min-h-[32px] gap-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-[110px] shrink-0 leading-none">{label}</label>
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
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-white text-slate-400 hover:text-red-500 transition-all rounded-full border border-transparent hover:border-gray-200"><X size={20} /></button>
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

export default MakeDepositBoard;
