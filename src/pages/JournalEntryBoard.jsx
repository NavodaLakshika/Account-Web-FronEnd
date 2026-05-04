import React, { useState, useEffect, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { 
    Search, X, RotateCcw, Loader2, Calendar, CheckCircle2, 
    Plus, Trash2, FileText, Download, Upload, ArrowRight,
    Calculator, Info, History, Landmark, AlertCircle, RefreshCw
} from 'lucide-react';
import { journalService } from '../services/journal.service';
import { toast } from 'react-hot-toast';

const SearchModal = ({ isOpen, onClose, title, items, onSelect }) => {
    const [search, setSearch] = useState('');
    const filtered = items.filter(item => 
        (item.name?.toLowerCase().includes(search.toLowerCase())) || 
        (item.code?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Lookup facility</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input 
                            type="text" autoFocus placeholder="Filter entries..." 
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                        />
                    </div>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3">Code</th>
                                    <th className="px-5 py-3">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((item, idx) => (
                                    <tr 
                                        key={idx} onClick={() => { onSelect(item); onClose(); }}
                                        className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{item.code}</td>
                                        <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{item.name}</td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="p-8 text-center text-gray-400 italic text-[12px]">No matching records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const JournalEntryBoard = ({ isOpen, onClose, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ costCenters: [], accounts: [], customers: [], suppliers: [], dateRanges: [] });
    const [tempEntries, setTempEntries] = useState([]);
    const [history, setHistory] = useState([]);
    const [accBalance, setAccBalance] = useState(0);
    const [companyCode] = useState(localStorage.getItem('company') || 'C001');
    const [currentUser] = useState(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                return parsed.emp_Name || parsed.Emp_Name || parsed.empName || 'SYSTEM';
            } catch (e) {
                return 'SYSTEM';
            }
        }
        return 'SYSTEM';
    });

    const [header, setHeader] = useState({
        docNo: 'JNL-AUTO',
        entryNo: '',
        date: new Date().toLocaleDateString('en-GB'),
        lastEntryNo: '0',
        editSaved: false,
        reconcileUpdate: false,
        debitNote: false
    });

    const [currentLine, setCurrentLine] = useState({
        accId: '',
        accName: '',
        costCenter: '',
        costCenterName: '',
        debit: '0.00',
        credit: '0.00',
        memo: '',
        vendId: '',
        vendName: ''
    });

    const [selectedDateRange, setSelectedDateRange] = useState({ code: '11', name: 'Today' });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const lks = await journalService.getLookups(companyCode);
            setLookups(lks);
            
            const docs = await journalService.generateDocNo(companyCode);
            setHeader(prev => ({ 
                ...prev, 
                docNo: docs.docNo, 
                entryNo: docs.nextEntry,
                lastEntryNo: (parseInt(docs.nextEntry) - 1).toString()
            }));

            // Default cost center if only one
            if (lks.costCenters.length === 1) {
                setCurrentLine(prev => ({ 
                    ...prev, 
                    costCenter: lks.costCenters[0].code, 
                    costCenterName: lks.costCenters[0].name 
                }));
            }
        } catch (error) {
            toast.error("Failed to load metadata");
        } finally {
            setLoading(false);
        }
        loadHistory();
    };

    const loadHistory = async () => {
        const hist = await journalService.getHistory(companyCode, selectedDateRange.code);
        setHistory(hist);
    };

    const handleDateRangeSelect = (item) => {
        setSelectedDateRange(item);
        // In a real app, this would trigger a re-fetch with the date filter
        loadHistory(); 
    };

    const handleAccountSelect = async (item) => {
        setCurrentLine(prev => ({ ...prev, accId: item.code, accName: item.name }));
        const bal = await journalService.getBalance(item.code);
        setAccBalance(bal);
    };

    const handleAddLine = async () => {
        if (!currentLine.accId) return toast.error("Please select an account.");
        if (!currentLine.costCenter) return toast.error("Please select a cost center.");
        if (parseFloat(currentLine.debit) === 0 && parseFloat(currentLine.credit) === 0) {
            return toast.error("Value must be entered in Debit or Credit.");
        }

        try {
            setLoading(true);
            const res = await journalService.addTempEntry({
                ...currentLine,
                docNo: header.docNo,
                entryNo: header.entryNo,
                date: header.date,
                company: companyCode,
                createUser: currentUser,
                type: header.editSaved ? "Edit" : "",
                drNote: header.debitNote,
                idNo: 0
            });
            setTempEntries(res);
            resetLine();
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetLine = () => {
        setCurrentLine(prev => ({
            ...prev,
            accId: '', accName: '',
            debit: '0.00', credit: '0.00',
            memo: '', vendId: '', vendName: ''
        }));
    };

    const handleSave = async () => {
        if (tempEntries.length === 0) return toast.error("No entries to save.");
        if (totalDebit !== totalCredit) return toast.error("Journal is not balanced!");

        try {
            setLoading(true);
            const res = await journalService.applyJournal({
                docNo: header.docNo,
                date: header.date,
                entryNo: header.entryNo,
                company: companyCode,
                createUser: currentUser,
                reclUpdate: header.reconcileUpdate
            });
            toast.success(`Successfully Saved as ${res.orgDocNo}`);
            if (onComplete) onComplete(res);
            onClose();
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totalDebit = tempEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = tempEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="General Journal Entries"
                maxWidth="max-w-[1250px]"
                footer={
                    <div className="bg-slate-50 px-8 py-3 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        <div className="flex gap-3">
                            <button 
                                onClick={() => { setTempEntries([]); resetLine(); }} 
                                className="px-5 h-9 bg-[#00adff] text-white text-[12px] font-black rounded-[5px] shadow-sm hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none uppercase tracking-wider"
                            >
                                <RotateCcw size={15} /> CLEAR FORM
                            </button>
                            <button 
                                onClick={loadHistory} 
                                className="px-5 h-9 bg-white text-[#0285fd] text-[12px] font-black rounded-[5px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider"
                            >
                                <History size={15} /> History List
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSave}
                                disabled={loading || tempEntries.length === 0 || totalDebit !== totalCredit}
                                className={`px-10 h-9 bg-[#2bb744] text-white text-[12px] font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest border-none ${loading || tempEntries.length === 0 || totalDebit !== totalCredit ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} DONE / POST
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 font-['Tahoma'] p-0.5">
                    
                    {/* Header Controls - Compact */}
                    <div className="bg-white p-3.5 border border-gray-100 rounded-lg shadow-sm">
                        <div className="grid grid-cols-12 gap-x-5 gap-y-3">
                            
                            <div className="col-span-12 lg:col-span-3">
                                <label className="text-[12px] font-bold text-gray-700 block mb-1 ml-0.5">Entry Number</label>
                                <input 
                                    type="text" value={header.entryNo} onChange={e => setHeader({...header, entryNo: e.target.value})}
                                    className="w-full h-7 border border-gray-300 rounded-[5px] px-2.5 text-[11.5px] font-bold text-blue-600 bg-gray-50 outline-none focus:border-[#0285fd] shadow-sm"
                                />
                            </div>

                            <div className="col-span-12 lg:col-span-3">
                                <label className="text-[12px] font-bold text-gray-700 block mb-1 ml-0.5">Post Date</label>
                                <div className="flex gap-1 h-7">
                                    <input 
                                        type="text" readOnly value={header.date} onClick={() => setShowDatePicker(true)}
                                        className="flex-1 h-full border border-gray-300 rounded-[5px] px-2.5 text-[11.5px] font-bold text-gray-700 outline-none bg-white cursor-pointer"
                                    />
                                    <button onClick={() => setShowDatePicker(true)} className="w-9 h-full bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-sm active:scale-95 shrink-0">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-3 text-center">
                                <label className="text-[12px] font-bold text-gray-700 block mb-1">Last Entry</label>
                                <div className="w-full h-7 bg-red-50/30 border border-red-100 rounded-[5px] flex items-center justify-center">
                                    <span className="text-[12.5px] font-black text-red-500 tracking-wider font-mono">{header.lastEntryNo}</span>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-3 text-center">
                                <label className="text-[12px] font-bold text-gray-700 block mb-1">System Doc</label>
                                <div className="w-full h-7 bg-blue-50/30 border border-blue-100 rounded-[5px] flex items-center justify-center">
                                    <span className="text-[11.5px] font-black text-blue-600 tracking-tight font-mono uppercase">{header.docNo}</span>
                                </div>
                            </div>

                            <div className="col-span-12 pt-3 mt-1 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <input 
                                            type="checkbox" checked={header.editSaved} 
                                            onChange={e => setHeader({...header, editSaved: e.target.checked})} 
                                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#0285fd]" 
                                        />
                                        <span className="text-[12px] font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Edit Saved Entry</span>
                                    </label>

                                    <a href="#" className="text-[11.5px] font-black text-blue-600 underline flex items-center gap-2 hover:text-blue-700 transition-all">
                                        <Download size={13} /> Excel Template
                                    </a>
                                </div>

                                <button className="h-8 px-4 bg-slate-800 text-white text-[10.5px] font-black rounded-[5px] flex items-center gap-2.5 hover:bg-slate-900 shadow-sm uppercase tracking-widest active:scale-95 border-none">
                                    <Upload size={13} /> LOAD EXCEL
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Entry Line Section - More Compact */}
                    <div className="bg-white p-3.5 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-5 gap-y-3">
                            <div className="col-span-12 lg:col-span-8">
                                <label className="text-[12px] font-bold text-gray-700 block mb-1 ml-0.5">Main Ledger Account</label>
                                <div className="flex gap-1 h-7">
                                    <div 
                                        onClick={() => setActiveModal('account')}
                                        className="flex-1 h-full border border-gray-300 rounded-[5px] px-3 text-[11.5px] font-bold text-red-600 bg-gray-50 cursor-pointer flex items-center overflow-hidden hover:border-[#0285fd]"
                                    >
                                        <span className="truncate">{currentLine.accName || 'Select Account...'}</span>
                                    </div>
                                    <button onClick={() => setActiveModal('account')} className="w-9 h-full bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-sm shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4">
                                <label className="text-[12px] font-bold text-gray-700 block mb-1 ml-0.5">Cost Center</label>
                                <div className="flex gap-1 h-7">
                                    <div 
                                        onClick={() => setActiveModal('costCenter')}
                                        className="flex-1 h-full border border-gray-300 rounded-[5px] px-3 text-[11.5px] font-bold text-gray-700 bg-white cursor-pointer flex items-center overflow-hidden hover:border-[#0285fd]"
                                    >
                                        <span className="truncate">{currentLine.costCenterName || 'Strategic Unit...'}</span>
                                    </div>
                                    <button onClick={() => setActiveModal('costCenter')} className="w-9 h-full bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-sm shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 grid grid-cols-12 gap-4 items-end pt-1">
                                <div className="col-span-12 lg:col-span-5 flex gap-2.5">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[9.5px] font-black text-blue-600 uppercase tracking-widest pl-0.5">Debit (DR)</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rs.</span>
                                            <input 
                                                type="number" step="0.01" value={currentLine.debit} 
                                                onChange={e => setCurrentLine({...currentLine, debit: e.target.value, credit: '0.00'})}
                                                className="w-full h-8 border border-gray-300 rounded-[5px] pl-7 pr-2.5 text-[12.5px] font-black text-blue-700 outline-none focus:border-[#0285fd] text-right bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[9.5px] font-black text-red-500 uppercase tracking-widest pl-0.5">Credit (CR)</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rs.</span>
                                            <input 
                                                type="number" step="0.01" value={currentLine.credit} 
                                                onChange={e => setCurrentLine({...currentLine, credit: e.target.value, debit: '0.00'})}
                                                className="w-full h-8 border border-gray-300 rounded-[5px] pl-7 pr-2.5 text-[12.5px] font-black text-red-600 outline-none focus:border-red-500 text-right bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-12 lg:col-span-4 space-y-1">
                                    <label className="text-[12px] font-bold text-gray-700 block pl-0.5">Narrative / Memo</label>
                                    <input 
                                        type="text" value={currentLine.memo} onChange={e => setCurrentLine({...currentLine, memo: e.target.value})}
                                        placeholder="Add memo..."
                                        className="w-full h-8 border border-gray-300 rounded-[5px] px-3 text-[11.5px] font-mono outline-none focus:border-[#0285fd] bg-white"
                                    />
                                </div>

                                <div className="col-span-12 lg:col-span-3 flex gap-2 h-8">
                                    <div className="flex-1 bg-white border border-gray-200 rounded-[5px] flex items-center px-2 justify-between shadow-sm">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input type="radio" checked={header.debitNote} onChange={() => setHeader({...header, debitNote: true})} className="w-3 h-3 text-blue-600" />
                                            <span className={`text-[9.5px] font-black uppercase tracking-wider ${header.debitNote ? 'text-blue-600' : 'text-slate-400'}`}>DR</span>
                                        </label>
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input type="radio" checked={!header.debitNote} onChange={() => setHeader({...header, debitNote: false})} className="w-3 h-3 text-slate-600" />
                                            <span className={`text-[9.5px] font-black uppercase tracking-wider ${!header.debitNote ? 'text-slate-600' : 'text-slate-400'}`}>CR</span>
                                        </label>
                                    </div>
                                    <button 
                                        onClick={handleAddLine}
                                        className="px-4 bg-[#0285fd] text-white text-[11px] font-black rounded-[5px] shadow-sm hover:bg-[#0073ff] flex items-center gap-2 uppercase shrink-0 border-none"
                                    >
                                        <Plus size={16} strokeWidth={3} /> ADD
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journal Grid Table - Controlled Height */}
                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center sticky top-0 z-10">
                            <div className="w-10 py-2 px-3 text-center border-r border-gray-100">No</div>
                            <div className="flex-1 py-2 px-4 border-r border-gray-100">Account Descriptor</div>
                            <div className="w-32 py-2 px-4 border-r border-gray-100">Cost Center</div>
                            <div className="w-28 py-2 px-4 border-r border-gray-100 text-right">Debit</div>
                            <div className="w-28 py-2 px-4 border-r border-gray-100 text-right">Credit</div>
                            <div className="flex-1 py-2 px-4">Narrative</div>
                            <div className="w-9"></div>
                        </div>
                        <div className="bg-white overflow-y-auto max-h-[160px] divide-y divide-gray-50 no-scrollbar">
                            {tempEntries.length === 0 ? (
                                <div className="h-20 flex items-center justify-center text-gray-300">
                                    <span className="text-[11px] font-bold uppercase tracking-widest italic">Queue is Empty</span>
                                </div>
                            ) : tempEntries.map((entry, idx) => (
                                <div key={idx} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="w-10 py-1.5 px-3 border-r border-gray-50 text-center font-mono text-gray-400">{idx + 1}</div>
                                    <div className="flex-1 py-1.5 px-4 border-r border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 font-mono text-[10px]">{entry.acc_Id}</span>
                                            <span className="truncate">{entry.acc_Name}</span>
                                        </div>
                                    </div>
                                    <div className="w-32 py-1.5 px-4 border-r border-gray-50 italic text-gray-400 truncate">{entry.costCenter}</div>
                                    <div className="w-28 py-1.5 px-4 border-r border-gray-50 text-right font-mono font-black text-slate-800">
                                        {entry.debit > 0 ? entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </div>
                                    <div className="w-28 py-1.5 px-4 border-r border-gray-50 text-right font-mono font-black text-slate-800">
                                        {entry.credit > 0 ? entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </div>
                                    <div className="flex-1 py-1.5 px-4 truncate text-gray-500 font-mono text-[10px]">{entry.memo}</div>
                                    <div className="w-9 flex justify-center">
                                        <button 
                                            onClick={async () => {
                                                if (window.confirm("Delete line?")) {
                                                    await journalService.deleteTempLine(entry.id_No, companyCode);
                                                    setTempEntries(prev => prev.filter(e => e.id_No !== entry.id_No));
                                                }
                                            }}
                                            className="text-red-300 hover:text-red-500 p-1"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary & History Section - Compact Side-by-Side feel */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-end">
                            <div className="w-[420px] bg-slate-50/50 border border-gray-100 rounded-lg p-3 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-[11.5px] font-bold text-gray-500 uppercase">
                                    <span>Aggregated Totals</span>
                                    <div className="flex gap-4">
                                        <span className="text-blue-600">DR: {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        <span className="text-red-600">CR: {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className={`flex items-center justify-between p-2 rounded-md border ${difference === 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                    <span className="text-[12px] font-black uppercase tracking-wider">{difference === 0 ? 'BALANCED' : 'UNBALANCED'}</span>
                                    <div className="text-[16px] font-mono font-black">Rs. {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </div>

                        {/* History Table - Compacted */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <History size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Journal Directory</span>
                                <div className="flex-1 h-[1px] bg-slate-100"></div>
                                <div 
                                    onClick={() => setActiveModal('dateRange')}
                                    className="h-6 border border-gray-300 rounded-[5px] px-3 text-[11px] font-bold text-slate-500 bg-white flex items-center gap-2 cursor-pointer hover:border-[#0285fd]"
                                >
                                    <span>{selectedDateRange.name}</span>
                                    <Search size={12} />
                                </div>
                            </div>

                            <div className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                                <table className="w-full text-left text-[10.5px]">
                                    <thead className="bg-slate-50/80 text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-1.5 w-24">Doc No</th>
                                            <th className="px-4 py-1.5 w-24">Date</th>
                                            <th className="px-4 py-1.5">Ledger Account</th>
                                            <th className="px-4 py-1.5 text-right w-24">Debit</th>
                                            <th className="px-4 py-1.5 text-right w-24">Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 overflow-y-auto max-h-[120px] block w-full no-scrollbar">
                                        {history.map((h, i) => (
                                            <tr key={i} className="hover:bg-blue-50/30 transition-colors cursor-pointer text-slate-700 font-bold table w-full table-fixed" onClick={() => toast.info(`Viewing ${h.docNo}`)}>
                                                <td className="px-4 py-1.5 text-blue-600 font-mono w-24">{h.docNo}</td>
                                                <td className="px-4 py-1.5 font-mono text-gray-400 w-24">{h.date}</td>
                                                <td className="px-4 py-1.5 uppercase truncate">{h.accName}</td>
                                                <td className="px-4 py-1.5 text-right font-mono font-black w-24">{h.debit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-4 py-1.5 text-right font-mono font-black w-24">{h.credit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                        {history.length === 0 && (
                                            <tr className="table w-full"><td className="p-4 text-center text-gray-300 font-bold uppercase tracking-widest italic">Archive Empty</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Lookups Modals */}
            <SearchModal 
                isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)}
                title="Ledger Account Lookup" items={lookups.accounts}
                onSelect={handleAccountSelect}
            />
            <SearchModal 
                isOpen={activeModal === 'costCenter'} onClose={() => setActiveModal(null)}
                title="Strategic Unit Lookup" items={lookups.costCenters}
                onSelect={item => setCurrentLine({...currentLine, costCenter: item.code, costCenterName: item.name})}
            />
            <SearchModal 
                isOpen={activeModal === 'dateRange'} onClose={() => setActiveModal(null)}
                title="Date Period Selection" items={lookups.dateRanges}
                onSelect={handleDateRangeSelect}
            />
            <CalendarModal 
                isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}
                onSelect={date => setHeader({...header, date})} 
            />
        </>
    );
};

export default JournalEntryBoard;
