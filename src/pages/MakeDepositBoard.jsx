import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Landmark, Search, RotateCcw, Save, Calendar, Plus, X, Loader2, Wallet, Banknote, ListFilter, Users, ChevronRight, CheckCircle2, Filter } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';

const MakeDepositBoard = ({ isOpen, onClose, incomingData }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], accounts: [], costCenters: [] });
    
    const userName = localStorage.getItem('userName') || 'SYSTEM';
    const companyCode = localStorage.getItem('company') || 'C001';

    const [formData, setFormData] = useState({
        depositTo: '',
        depositToName: '',
        depositDate: new Date().toISOString().split('T')[0],
        memo: '',
        refNo: '',
        printConfirmation: false
    });

    const [entries, setEntries] = useState([
        { id: Date.now(), receivedFrom: '', accountId: '', accountName: '', memo: '', amount: 0 }
    ]);

    // Modal States
    const [activeModal, setActiveModal] = useState(null); // 'bank', 'account'
    const [activeRowIndex, setActiveRowIndex] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            if (incomingData && incomingData.items) {
                const mapped = incomingData.items.map(item => ({
                    id: Math.random(),
                    receivedFrom: item.type || 'Collection',
                    accountId: '',
                    accountName: '',
                    memo: `Collection from ${incomingData.sourceDocNo} - ${item.documentNo}`,
                    amount: item.balance || item.amount
                }));
                setEntries(mapped);
                setFormData(prev => ({
                    ...prev,
                    memo: `Deposit for Collection ${incomingData.sourceDocNo}`,
                    refNo: incomingData.sourceDocNo
                }));
            }
        }
    }, [isOpen, incomingData]);

    const loadInitialData = async () => {
        try {
            const data = await bankingService.getDirectTransactionLookups(companyCode);
            setLookups(data);
        } catch (error) {
            toast.error("Failed to load lookups");
        }
    };

    const addEntry = () => {
        setEntries([...entries, { id: Date.now(), receivedFrom: '', accountId: '', accountName: '', memo: '', amount: 0 }]);
    };

    const removeEntry = (idx) => {
        if (entries.length > 1) {
            setEntries(entries.filter((_, i) => i !== idx));
        }
    };

    const handleEntryUpdate = (idx, field, value) => {
        const newEntries = [...entries];
        newEntries[idx][field] = value;
        setEntries(newEntries);
    };

    const totalAmount = entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const handleSave = async () => {
        if (!formData.depositTo) return toast.error('Please select a destination bank account.');
        if (totalAmount <= 0) return toast.error('Total deposit amount must be greater than zero.');

        setLoading(true);
        try {
            const payload = {
                ...formData,
                company: companyCode,
                createUser: userName,
                totalAmount: totalAmount,
                entries: entries.map(e => ({
                    receivedFrom: e.receivedFrom,
                    accountCode: e.accountId,
                    memo: e.memo,
                    amount: parseFloat(e.amount) || 0
                }))
            };

            await bankingService.saveDirectTransaction(payload);
            
            toast.success('Deposit successfully recorded!');
            handleReset();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            depositTo: '',
            depositToName: '',
            depositDate: new Date().toISOString().split('T')[0],
            memo: '',
            refNo: '',
            printConfirmation: false
        });
        setEntries([{ id: Date.now(), receivedFrom: '', accountId: '', accountName: '', memo: '', amount: 0 }]);
        setSearchTerm('');
    };

    const handleDateSelect = (date) => {
        setFormData({ ...formData, depositDate: date });
        setShowCalendar(false);
    };

    const filteredLookup = () => {
        const items = activeModal === 'bank' ? lookups.banks : lookups.accounts;
        return items.filter(i => 
            (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (i.code || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Banking Deposit Reconciliation"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        <div className="flex gap-3">
                             <button
                                onClick={handleReset}
                                className="px-8 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none shadow-sm"
                            >
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-8 h-10 bg-white text-[#ff3b30] text-sm font-black rounded-[5px] border-2 border-[#ff3b30] hover:bg-red-50 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <X size={14} /> EXIT MODULE
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`px-10 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none ${loading ? 'opacity-50 grayscale' : ''}`}
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE DEPOSIT
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma'] overflow-y-auto no-scrollbar p-1">
                    {/* Header Section */}
                    <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                            
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-40 shrink-0">Deposit To (Bank)</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.depositTo ? `[${formData.depositTo}] ${formData.depositToName}` : 'Select target bank...'} 
                                        onClick={() => {setActiveModal('bank'); setSearchTerm('');}}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer"
                                    />
                                    <button onClick={() => {setActiveModal('bank'); setSearchTerm('');}} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Deposit Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly
                                        value={formData.depositDate} 
                                        onClick={() => setShowCalendar(true)}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm"
                                    />
                                    <button onClick={() => setShowCalendar(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-40 shrink-0">Memo / Reference</label>
                                <input 
                                    type="text" 
                                    value={formData.memo} 
                                    onChange={e => setFormData({...formData, memo: e.target.value})}
                                    placeholder="Add deposit details or internal reference..."
                                    className="flex-1 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Entry Allocation Table */}
                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[250px] overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center sticky top-0 z-10">
                            <div className="w-12 py-2.5 px-3 border-r border-gray-100 text-center">#</div>
                            <div className="flex-[1.5] py-2.5 px-4 border-r border-gray-100">Received From / Source</div>
                            <div className="flex-1 py-2.5 px-4 border-r border-gray-100">Ledger Account Mapping</div>
                            <div className="flex-[1.5] py-2.5 px-4 border-r border-gray-100">Remarks / Line Details</div>
                            <div className="w-32 py-2.5 px-4 border-r border-gray-100 text-right">Amount</div>
                            <div className="w-10"></div>
                        </div>

                        <div className="flex-1 bg-white overflow-y-auto max-h-[280px] divide-y divide-gray-50 font-mono">
                            {entries.map((entry, idx) => (
                                <div key={entry.id} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="w-12 py-2 px-3 border-r border-gray-100 text-center text-gray-400">{idx + 1}</div>
                                    <div className="flex-[1.5] border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent">
                                        <input 
                                            type="text" 
                                            value={entry.receivedFrom} 
                                            onChange={e => handleEntryUpdate(idx, 'receivedFrom', e.target.value)}
                                            placeholder="Payer name..."
                                            className="w-full h-7 bg-transparent px-2 outline-none font-bold text-slate-800"
                                        />
                                    </div>
                                    <div className="flex-1 border-r border-gray-100 px-2 py-1 flex items-center justify-between group-hover:bg-blue-50/50">
                                        <span 
                                            onClick={() => { setActiveRowIndex(idx); setActiveModal('account'); setSearchTerm(''); }}
                                            className="text-blue-600 font-black cursor-pointer truncate flex-1"
                                        >
                                            {entry.accountId ? `[${entry.accountId}] ${entry.accountName}` : 'Select Account...'}
                                        </span>
                                        <button onClick={() => { setActiveRowIndex(idx); setActiveModal('account'); setSearchTerm(''); }} className="ml-2 text-gray-300 hover:text-blue-500"><Search size={12}/></button>
                                    </div>
                                    <div className="flex-[1.5] border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent">
                                        <input 
                                            type="text" 
                                            value={entry.memo} 
                                            onChange={e => handleEntryUpdate(idx, 'memo', e.target.value)}
                                            placeholder="Detail..."
                                            className="w-full h-7 bg-transparent px-2 outline-none text-slate-500 italic"
                                        />
                                    </div>
                                    <div className="w-32 border-r border-gray-100 px-1 py-1 bg-white group-hover:bg-transparent text-right font-black text-slate-800">
                                        <input 
                                            type="number" 
                                            value={entry.amount} 
                                            onChange={e => handleEntryUpdate(idx, 'amount', e.target.value)}
                                            className="w-full h-7 bg-transparent text-right outline-none px-2"
                                        />
                                    </div>
                                    <div className="w-10 flex justify-center py-1">
                                        <button onClick={() => removeEntry(idx)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[5px]">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addEntry} className="p-2 text-[10px] font-black text-[#0285fd] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 border-t border-dashed border-gray-200">
                            <Plus size={14} /> APPEND RECONCILIATION LINE
                        </button>
                    </div>

                    <div className="flex flex-row justify-between items-end">
                        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-gray-100 rounded-lg shadow-sm">
                             <input
                                type="checkbox"
                                checked={formData.printConfirmation}
                                onChange={(e) => setFormData({ ...formData, printConfirmation: e.target.checked })}
                                className="w-4 h-4 rounded"
                            />
                             <span className="text-[12px] font-bold text-gray-600">Post confirmation summary to printer</span>
                        </div>

                        <div className="w-[320px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Active Reconciliations</span>
                                <div className="text-[13px] font-mono font-black text-slate-800">
                                    {entries.length} <span className="text-gray-300 font-normal ml-1">UNITS</span>
                                </div>
                            </div>
                            <div className="h-[1px] bg-gray-100 my-1" />
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-blue-50">
                                <span className="text-[13px] font-black text-slate-900 uppercase">Total Deposit Value</span>
                                <div className="text-[20px] font-mono font-black text-blue-700 tracking-tighter">
                                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Lookups Selection Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-['Tahoma']" onClick={e => e.stopPropagation()}>
                        <div className="bg-[#0285fd] px-5 py-3 flex items-center justify-between">
                            <span className="text-white font-bold text-xs tracking-widest uppercase">Select {activeModal === 'bank' ? 'Bank Account' : 'Ledger Account'}</span>
                            <button onClick={() => setActiveModal(null)} className="text-white hover:bg-white/20 p-1 rounded transition-colors"><X size={16} /></button>
                        </div>
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center gap-3">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input 
                                    autoFocus 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    placeholder="Filter by code or title..." 
                                    className="w-full h-9 border border-gray-300 rounded-[5px] pl-9 pr-3 text-[12px] font-bold outline-none focus:border-[#0285fd] shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-50">
                            {filteredLookup().map((item, i) => (
                                <div key={i} onClick={() => {
                                    if (activeModal === 'bank') {
                                        setFormData({...formData, depositTo: item.code, depositToName: item.name});
                                    } else {
                                        const newEntries = [...entries];
                                        newEntries[activeRowIndex].accountId = item.code;
                                        newEntries[activeRowIndex].accountName = item.name;
                                        setEntries(newEntries);
                                    }
                                    setActiveModal(null);
                                }} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 cursor-pointer group transition-colors">
                                    <div className="flex flex-col flex-1">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{item.code || 'N/A'}</span>
                                        <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-700">{item.name}</span>
                                    </div>
                                    <button className="bg-[#e49e1b] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                </div>
                            ))}
                            {filteredLookup().length === 0 && <div className="text-center text-gray-300 text-[11px] font-bold uppercase tracking-widest py-12 italic">No matching registry entries</div>}
                        </div>
                    </div>
                </div>
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

export default MakeDepositBoard;
