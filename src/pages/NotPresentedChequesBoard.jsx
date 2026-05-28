import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, FileText, CheckCircle2, Plus, Trash2, Clock, History, Ban, ShieldCheck } from 'lucide-react';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


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
    const [showWriteDatePicker, setShowWriteDatePicker] = useState(false);
    const [showChequeDatePicker, setShowChequeDatePicker] = useState(false);

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
            showErrorToast("Banking protocol refresh failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        if (!entry.chequeNo || entry.amount <= 0) {
            showErrorToast("Please provide valid cheque number and valuation.");
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
        if (!header.bankCode) return showErrorToast("Please select a target Bank Portfolio.");
        if (items.length === 0) return showErrorToast("Deployment list is empty. Add at least one instrument.");

        try {
            setLoading(true);
            await bankingService.saveNotPresented({ ...header, items });
            showSuccessToast('Not presented cheques registered successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
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
                title="Not Presented Outward Cheques Register"
                maxWidth="max-w-[1300px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} SECURE ENTRIES
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header Row */}
                    <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-[5px] relative overflow-hidden">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 relative z-10">
                            <div className="col-span-12 lg:col-span-8 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-36 shrink-0">Source Bank Account</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={header.bankName || header.bankCode} placeholder="Identify portfolio..." className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-4 flex items-center gap-2 lg:pl-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0 text-right">Protocol Reference</label>
                                <div className="flex-1 flex items-center">
                                    <div className="text-[14px] font-black text-[#0285fd] tracking-tight tabular-nums italic bg-blue-50/50 px-3 py-1 rounded-[5px] border border-blue-100/50">
                                        {header.docNo}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instrument Table */}
                    <div className="bg-white border border-slate-200 rounded-[5px] overflow-hidden flex flex-col h-[350px]">
                        <table className="w-full text-left border-collapse flex-1 flex flex-col overflow-hidden">
                            <thead className="bg-slate-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky top-0 border-b border-slate-200 z-10 w-full flex">
                                <tr className="w-full flex">
                                    <th className="p-3 w-32 border-r border-slate-200">Write Date</th>
                                    <th className="p-3 w-32 border-r border-slate-200">Cheque Date</th>
                                    <th className="p-3 flex-1 border-r border-slate-200">Memo / Description</th>
                                    <th className="p-3 w-40 border-r border-slate-200 text-center">Cheque No</th>
                                    <th className="p-3 w-36 text-right pr-10 border-r border-slate-200">Amount (LKR)</th>
                                    <th className="p-3 w-16 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 overflow-y-auto block flex-1">
                                {items.length > 0 ? items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group flex w-full">
                                        <td className="p-3 w-32 border-r border-slate-100 font-mono text-slate-700 text-[12px] tabular-nums">{item.writeDate}</td>
                                        <td className="p-3 w-32 border-r border-slate-100 font-mono text-slate-700 text-[12px] tabular-nums italic">{item.chequeDate}</td>
                                        <td className="p-3 flex-1 border-r border-slate-100 font-mono text-slate-700 text-[12px] italic">{item.memo || '-'}</td>
                                        <td className="p-3 w-40 border-r border-slate-100 font-mono font-black text-[#0078d4] text-[13px] tracking-widest text-center italic">{item.chequeNo}</td>
                                        <td className="p-3 w-36 text-right pr-10 border-r border-slate-100 font-mono font-black text-[#0285fd] text-[13px] tabular-nums italic group-hover:bg-white">{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 w-16 flex items-center justify-center">
                                            <button onClick={() => handleRemoveItem(item.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-red-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr className="flex w-full h-full">
                                        <td colSpan={6} className="p-10 text-center flex-1 flex flex-col items-center justify-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20 grayscale">
                                                <Clock size={60} />
                                                <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500">Suspended Protocol</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Entry Protocol Bar */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] space-y-3.5 relative">
                         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                            <Plus size={14} className="text-[#0285fd]" />
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Add Instrument</span>
                         </div>
                         <div className="grid grid-cols-12 gap-x-4 gap-y-3.5 items-end">
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Written On</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={entry.writeDate} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-2 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => setShowWriteDatePicker(true)} />
                                    <button onClick={() => setShowWriteDatePicker(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Instrument Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={entry.chequeDate} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-2 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => setShowChequeDatePicker(true)} />
                                    <button onClick={() => setShowChequeDatePicker(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <History size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Narrative</label>
                                <input type="text" value={entry.memo} onChange={e => setEntry({...entry, memo: e.target.value})} placeholder="Payee / Purpose..." className="h-8 w-full border border-slate-200 px-3 text-[12px] font-mono rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 italic" />
                            </div>
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Cheque Serial</label>
                                <input type="text" value={entry.chequeNo} onChange={e => setEntry({...entry, chequeNo: e.target.value})} placeholder="000000" className="h-8 w-full border border-blue-200 px-3 text-[13px] font-mono font-black text-[#0078d4] tracking-widest text-center rounded outline-none focus:border-[#0285fd] shadow-inner transition-all italic" />
                            </div>
                            <div className="col-span-2 flex flex-col gap-1.5 relative">
                                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Valuation (LKR)</label>
                                <div className="flex-1 relative min-w-0 group">
                                     <input type="number" step="0.01" value={entry.amount} onChange={e => setEntry({...entry, amount: parseFloat(e.target.value) || 0})} className="h-8 w-full border border-[#0285fd] px-3 text-[14px] font-mono font-black text-slate-800 rounded shadow-inner outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 tabular-nums italic pr-10" />
                                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase italic">LKR</span>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <button onClick={handleAddItem} className="w-full h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 group">
                                    <Plus size={16} />
                                </button>
                            </div>
                         </div>
                    </div>

                    {/* Aggregate Logic Footer */}
                    <div className="bg-slate-50 p-4 rounded-[5px] border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-200 rounded text-slate-500">
                                <Ban size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest leading-none">Status Identification</span>
                                <h4 className="text-slate-700 text-[12px] font-bold">Instruments Awaiting Presentation/Clearance</h4>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-4 h-full pr-4">
                             <div className="flex flex-col items-end gap-0.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aggregate Liability</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[9px] font-black text-slate-400 italic">Rs.</span>
                                    <span className="text-[18px] font-mono font-black text-slate-700 tabular-nums italic">
                                        {totalValuation.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            <SimpleModal
                isOpen={!!activeModal}
                onClose={() => setActiveModal(null)}
                title={`Lookup Directory`}
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Record Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                            setHeader({...header, bankCode: item.code, bankName: item.name});
                                            setActiveModal(null);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{item.code}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{item.name}</td>
                                        </tr>
                                    ))}
                                    {filteredLookup().length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-6 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>
            
            <CalendarModal
                isOpen={showWriteDatePicker}
                onClose={() => setShowWriteDatePicker(false)}
                currentDate={entry.writeDate}
                onDateSelect={(date) => setEntry({...entry, writeDate: date})}
            />
            
            <CalendarModal
                isOpen={showChequeDatePicker}
                onClose={() => setShowChequeDatePicker(false)}
                currentDate={entry.chequeDate}
                onDateSelect={(date) => setEntry({...entry, chequeDate: date})}
            />
        </>
    );
};

export default NotPresentedChequesBoard;
