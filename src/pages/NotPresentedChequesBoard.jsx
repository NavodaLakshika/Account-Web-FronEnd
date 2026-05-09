import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, FileText, CheckCircle2, Plus, Trash2, Clock, History, Ban, ShieldCheck, MailQuestion } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';
import { getSessionData } from '../utils/session';

const NotPresentedChequesBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [] });
    
    // Header States
    const [header, setHeader] = useState({
        bankCode: '',
        bankName: '',
        docNo: '',
        company: '',
        createUser: ''
    });

    // Line Entry States
    const [entry, setEntry] = useState({
        writeDate: new Date().toISOString().split('T')[0],
        chequeDate: new Date().toISOString().split('T')[0],
        memo: '',
        chequeNo: '',
        amount: 0
    });

    // Items List
    const [items, setItems] = useState([]);

    const [activeModal, setActiveModal] = useState(null); // 'bank'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const { companyCode, userName } = getSessionData();

            setHeader(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));
            
            loadInitialData(companyCode);
        }
    }, [isOpen]);

    const loadInitialData = async (compCode) => {
        try {
            setLoading(true);
            const activeComp = compCode || header.company;
            const [lookupRes, docRes] = await Promise.all([
                bankingService.getNotPresentedLookups(activeComp),
                bankingService.generateDocNo('NPC', activeComp)
            ]);
            setLookups(lookupRes);
            setHeader(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            toast.error("Banking protocol refresh failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        if (!entry.chequeNo || entry.amount <= 0) {
            toast.error("Please provide valid cheque number and valuation.");
            return;
        }
        setItems([...items, { ...entry, id: Date.now() }]);
        setEntry({
            writeDate: new Date().toISOString().split('T')[0],
            chequeDate: new Date().toISOString().split('T')[0],
            memo: '',
            chequeNo: '',
            amount: 0
        });
    };

    const handleRemoveItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleSave = async () => {
        if (!header.bankCode) return toast.error("Please select a target Bank Portfolio.");
        if (items.length === 0) return toast.error("Deployment list is empty. Add at least one instrument.");

        try {
            setLoading(true);
            await bankingService.saveNotPresented({ ...header, items });
            toast.success('Not presented cheques registered successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setHeader({
            ...header,
            bankCode: '',
            bankName: ''
        });
        setItems([]);
        setEntry({
            writeDate: new Date().toISOString().split('T')[0],
            chequeDate: new Date().toISOString().split('T')[0],
            memo: '',
            chequeNo: '',
            amount: 0
        });
        loadInitialData();
    };

    const filteredLookup = () => {
        const query = searchTerm.toLowerCase();
        if (activeModal === 'bank') return lookups.banks.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
        return [];
    };

    const totalValuation = items.reduce((sum, i) => sum + i.amount, 0);

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Not Presented Outward Cheques Register"
                maxWidth="max-w-[1300px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Plus_Jakarta_Sans']">
                        <button onClick={handleSave} disabled={loading} className={`px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} />} Secure Entries
                        </button>
                        <button onClick={handleClear} className="px-10 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <RotateCcw size={16} /> Clear
                        </button>
                        <button onClick={onClose} className="px-10 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <X size={16} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 font-['Plus_Jakarta_Sans']">
                    {/* Header Row */}
                    <div className="bg-white p-8 border-2 border-slate-50 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 pointer-events-none">
                             <Clock size={120} />
                        </div>
                        <div className="grid grid-cols-12 gap-8 items-center relative z-10">
                            <div className="col-span-12 lg:col-span-8 flex items-center gap-6">
                                <div className="flex flex-col">
                                     <label className="text-[11px] font-black text-[#0078d4] uppercase tracking-widest mb-2 flex items-center gap-2">
                                         <Landmark size={14} /> Source Bank Account
                                     </label>
                                     <div className="flex gap-2">
                                        <div className="w-[500px] flex flex-col bg-slate-50 border-b-2 border-slate-200 px-5 py-2 group focus-within:border-[#0078d4] transition-all cursor-pointer" onClick={() => { setActiveModal('bank'); setSearchTerm(''); }}>
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{header.bankCode || 'IDENTIFY PORTFOLIO'}</span>
                                             <div className="flex items-center justify-between">
                                                <span className={`text-[15px] font-bold ${header.bankName ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                                                    {header.bankName || 'Click magnifying glass to select...'}
                                                </span>
                                                <Search size={18} className="text-[#0078d4] opacity-50 group-hover:opacity-100 transition-opacity" />
                                             </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-4 flex flex-col items-end">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Protocol Reference</label>
                                <div className="text-[20px] font-black text-[#0078d4] tracking-widest tabular-nums italic bg-blue-50/50 px-6 py-3 rounded border border-blue-100/50 shadow-inner min-w-[200px] text-right">
                                    {header.docNo}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instrument Table */}
                    <div className="bg-white border border-slate-100 rounded shadow-md overflow-hidden flex flex-col h-[450px]">
                        <table className="w-full text-left border-collapse flex flex-col flex-1 overflow-hidden">
                            <thead className="bg-slate-900 text-[10px] font-black text-white/60 uppercase tracking-[0.2em] sticky top-0 z-10 w-full flex">
                                <tr className="w-full flex">
                                    <th className="p-4 w-36 border-r border-white/5">Write Date</th>
                                    <th className="p-4 w-36 border-r border-white/5">Cheque Date</th>
                                    <th className="p-4 flex-1 border-r border-white/5 pr-10">Memo / Description</th>
                                    <th className="p-4 w-44 border-r border-white/5 text-center">Cheque No</th>
                                    <th className="p-4 w-40 text-right pr-10 border-r border-white/5">Amount (LKR)</th>
                                    <th className="p-4 w-14 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 overflow-y-auto block flex-1 bg-white font-['Plus_Jakarta_Sans']">
                                {items.length > 0 ? items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group flex w-full">
                                        <td className="p-4 w-36 border-r border-slate-50 font-bold text-slate-500 text-[12px]">{item.writeDate}</td>
                                        <td className="p-4 w-36 border-r border-slate-50 font-black text-slate-800 text-[12px] tabular-nums italic">{item.chequeDate}</td>
                                        <td className="p-4 flex-1 border-r border-slate-50 font-medium text-slate-500 text-[13px] italic pr-10">{item.memo || '-'}</td>
                                        <td className="p-4 w-44 border-r border-slate-50 font-black text-[#0078d4] text-[15px] tracking-[0.15em] text-center italic">{item.chequeNo}</td>
                                        <td className="p-4 w-40 text-right pr-10 border-r border-slate-50 font-black text-slate-900 text-[15px] tabular-nums bg-slate-50/10 italic">
                                            {item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="p-4 w-14 flex items-center justify-center">
                                            <button onClick={() => handleRemoveItem(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr className="flex w-full">
                                        <td colSpan={6} className="p-32 text-center flex-1">
                                            <div className="flex flex-col items-center gap-6 opacity-5 grayscale scale-125">
                                                <Clock size={100} />
                                                <span className="text-[18px] font-black uppercase tracking-[1em]">Suspended Protocol</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Entry Protocol Bar */}
                    <div className="bg-[#0f172a] p-8 rounded shadow-2xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-blue-600 opacity-[0.03] pointer-events-none" />
                         <div className="grid grid-cols-12 gap-5 items-end relative z-10">
                            <div className="col-span-2 flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest pl-1">Written On</label>
                                <div className="flex items-center px-4 h-11 bg-white/5 border border-white/10 rounded group-focus-within:border-blue-500/50 transition-all">
                                    <input type="date" value={entry.writeDate} onChange={e => setEntry({...entry, writeDate: e.target.value})} className="flex-1 text-[12px] font-bold text-white outline-none bg-transparent" />
                                    <Calendar size={14} className="text-blue-500" />
                                </div>
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest pl-1">Instrument Date</label>
                                <div className="flex items-center px-4 h-11 bg-white/5 border border-white/10 rounded">
                                    <input type="date" value={entry.chequeDate} onChange={e => setEntry({...entry, chequeDate: e.target.value})} className="flex-1 text-[12px] font-bold text-white outline-none bg-transparent" />
                                    <History size={14} className="text-blue-500" />
                                </div>
                            </div>
                            <div className="col-span-3 flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest pl-1">Instrument Narrative</label>
                                <input type="text" value={entry.memo} onChange={e => setEntry({...entry, memo: e.target.value})} placeholder="Payee / Purpose..." className="h-11 w-full border border-white/10 px-4 text-[13px] font-bold rounded outline-none focus:border-blue-500/50 bg-white/5 text-white italic placeholder:text-white/20" />
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest pl-1">Cheque Serial</label>
                                <input type="text" value={entry.chequeNo} onChange={e => setEntry({...entry, chequeNo: e.target.value})} placeholder="000000" className="h-11 w-full border border-white/10 px-4 text-[16px] font-black text-blue-400 rounded outline-none focus:border-blue-500/50 bg-white/5 tracking-widest text-center italic" />
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase text-pink-400 tracking-widest pl-1">Valuation (LKR)</label>
                                <input type="number" step="0.01" value={entry.amount} onChange={e => setEntry({...entry, amount: parseFloat(e.target.value) || 0})} className="h-11 w-full border border-blue-500/30 px-6 text-[18px] font-black text-white rounded outline-none bg-white/10 tabular-nums italic text-right shadow-[0_0_15px_rgba(59,130,246,0.1)]" />
                            </div>
                            <div className="col-span-1">
                                <button onClick={handleAddItem} className="w-11 h-11 bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 rounded transition-all shadow-xl active:scale-95 group">
                                    <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                         </div>
                    </div>

                    {/* Aggregate Logic Footer */}
                    <div className="bg-[#f8fafd] px-10 py-6 rounded border border-slate-100 flex justify-between items-center shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                <Ban size={22} className="text-slate-400" />
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Status Identification</span>
                                <h4 className="text-slate-800 text-[14px] font-bold italic">Instruments Awaiting Presentation/Clearance</h4>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 px-10 py-2 border-r-4 border-[#0078d4] bg-white rounded-l-xl shadow-sm">
                             <span className="text-[10px] font-black text-[#0078d4] uppercase tracking-[0.3em]">Aggregate Liability</span>
                             <div className="flex items-baseline gap-3">
                                 <span className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter italic">
                                     {totalValuation.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                 </span>
                                 <span className="text-[#0078d4] text-[12px] font-black italic">LKR</span>
                             </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] font-['Plus_Jakarta_Sans']">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 uppercase tracking-widest font-black text-[12px] text-slate-500">
                            Identify Bank Portfolio
                            <button onClick={() => setActiveModal(null)} className="w-10 h-10 flex items-center justify-center hover:bg-red-50 text-slate-400 rounded-full transition-all group"><X size={28} className="group-hover:scale-110 transition-transform" /></button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by bank name or identifier..." 
                                    className="w-full h-11 border border-gray-100 pl-11 pr-4 text-sm rounded-lg focus:border-blue-500 outline-none shadow-inner font-medium" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#f8fafd] sticky top-0 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="p-4 border-b">IFSC</th>
                                        <th className="p-4 border-b">Bank Account Title</th>
                                        <th className="p-4 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            setHeader({...header, bankCode: item.code, bankName: item.name});
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-4 border-b font-black text-slate-700">{item.code}</td>
                                            <td className="p-4 border-b font-bold text-[#0078d4] uppercase tracking-tight">{item.name}</td>
                                            <td className="p-4 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-5 py-2 rounded-sm font-black tracking-widest hover:bg-[#005a9e]">IDENTIFY</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotPresentedChequesBoard;
