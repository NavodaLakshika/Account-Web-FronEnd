import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Loader2, Calendar, Plus, Trash2 } from 'lucide-react';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';


const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = "Search by code or name..." }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item =>
        (item.name || '').toLowerCase().includes(query.toLowerCase()) ||
        (item.code || '').toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="text" placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={query} onChange={e => setQuery(e.target.value)} autoFocus />
                    </div>
                </div>
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className="w-32 px-5 py-3">Identifier</th><th className=" px-5 py-3">Credential / Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No matching records discovered</td></tr>
                                ) : filtered.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { onSelect(item); onClose(); }}>
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

const NotPresentedChequesBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [] });
    
    const getInitialHeader = () => ({
        bankCode: '',
        bankName: '',
        docNo: '',
        company: '',
        createUser: ''
    });

    const [header, setHeader] = useState(getInitialHeader());

    const [entry, setEntry] = useState({
        writeDate: new Date().toISOString().split('T')[0],
        chequeDate: new Date().toISOString().split('T')[0],
        memo: '',
        chequeNo: '',
        amount: 0
    });

    const [items, setItems] = useState([]);

    const [activeModal, setActiveModal] = useState(null);
    const [showWriteDatePicker, setShowWriteDatePicker] = useState(false);
    const [showChequeDatePicker, setShowChequeDatePicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHeader(getInitialHeader());
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

    const totalValuation = items.reduce((sum, i) => sum + i.amount, 0);

    return (
        <>
            <TransactionFormWrapper subtitle="Not Presented Cheques" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Not Presented Cheques"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Register Protocol
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header Row */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px]">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Source Bank Account</label>
                                <div className="relative">
                                    <input type="text" readOnly value={header.bankName ? `${header.bankCode} - ${header.bankName}` : ''} placeholder="Identify portfolio..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setActiveModal('bank')} />
                                    <button onClick={() => setActiveModal('bank')}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Protocol Reference</label>
                                <div className="text-[14px] font-black text-[#0285fd] tracking-tight tabular-nums bg-[#f0fdf0] px-3 py-2 rounded-[3px] border border-[#0285fd]/30 text-center">
                                    {header.docNo}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instrument Table */}
                    <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden flex flex-col h-[350px]">
                        <table className="w-full text-left border-collapse flex-1 flex flex-col overflow-hidden">
                            <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10 sticky top-0 border-b border-slate-200 z-10 w-full flex">
                                <tr className="w-full flex">
                                    <th className="px-4 w-32 border-r border-slate-200">Write Date</th>
                                    <th className="px-4 w-32 border-r border-slate-200">Cheque Date</th>
                                    <th className="px-4 flex-1 border-r border-slate-200">Memo / Description</th>
                                    <th className="px-4 w-40 border-r border-slate-200 text-center">Cheque No</th>
                                    <th className="px-4 w-36 text-right border-r border-slate-200">Amount (LKR)</th>
                                    <th className="px-4 w-16 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 overflow-y-auto block flex-1">
                                {items.length > 0 ? items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group flex w-full">
                                        <td className="px-4 w-32 border-r border-slate-100 font-mono text-slate-700 text-[12px] tabular-nums">{item.writeDate}</td>
                                        <td className="px-4 w-32 border-r border-slate-100 font-mono text-slate-700 text-[12px] tabular-nums">{item.chequeDate}</td>
                                        <td className="px-4 flex-1 border-r border-slate-100 font-mono text-slate-700 text-[12px] italic">{item.memo || '-'}</td>
                                        <td className="px-4 w-40 border-r border-slate-100 font-mono font-black text-gray-800 text-[13px] tracking-widest text-center">{item.chequeNo}</td>
                                        <td className="px-4 w-36 text-right border-r border-slate-100 font-mono font-black text-[#0285fd] text-[13px] tabular-nums group-hover:bg-white">{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="px-4 w-16 flex items-center justify-center">
                                            <button onClick={() => handleRemoveItem(item.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-red-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr className="flex w-full h-full">
                                        <td colSpan={6} className="p-10 text-center flex-1 flex flex-col items-center justify-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20 grayscale">
                                                <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500">Suspended Protocol</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Entry Protocol Bar */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px]">
                         <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                            <Plus size={14} className="text-[#0285fd]" />
                            <span className="block text-[13px] font-medium text-gray-700">Add Instrument</span>
                         </div>
                         <div className="grid grid-cols-12 gap-x-4 gap-y-3.5 items-end">
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Written On</label>
                                <div className="relative">
                                    <input type="text" readOnly value={entry.writeDate}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setShowWriteDatePicker(true)} />
                                    <button onClick={() => setShowWriteDatePicker(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Instrument Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={entry.chequeDate}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setShowChequeDatePicker(true)} />
                                    <button onClick={() => setShowChequeDatePicker(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Narrative</label>
                                <input type="text" value={entry.memo} onChange={e => setEntry({...entry, memo: e.target.value})} placeholder="Payee / Purpose..."
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Serial</label>
                                <input type="text" value={entry.chequeNo} onChange={e => setEntry({...entry, chequeNo: e.target.value})} placeholder="000000"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800 font-mono font-bold tracking-wider text-center" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Valuation (LKR)</label>
                                <div className="relative">
                                     <input type="number" step="0.01" value={entry.amount} onChange={e => setEntry({...entry, amount: parseFloat(e.target.value) || 0})}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800 font-mono font-bold tabular-nums pr-10" />
                                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase">LKR</span>
                                </div>
                            </div>
                            <div className="col-span-1 pt-6">
                                <button onClick={handleAddItem}
                                    className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-bold rounded-[3px] text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border-none">
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                         </div>
                    </div>

                    {/* Summary Bar */}
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Instruments Registered:</span>
                            <span className="text-lg font-black text-[#0285fd] tabular-nums">{items.length}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aggregate Liability</span>
                            <span className="text-lg font-black text-[#0285fd] tabular-nums">
                                {totalValuation.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </span>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'bank'}
                onClose={() => setActiveModal(null)}
                title="Select Bank"
                items={lookups.banks}
                onSelect={(item) => {
                    setHeader({...header, bankCode: item.code, bankName: item.name});
                }}
            />
            
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
