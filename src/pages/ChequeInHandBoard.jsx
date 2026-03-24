import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, FileText, CheckCircle2, Plus, Trash2, Wallet, HandCoins, ShieldCheck } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';

const ChequeInHandBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [] });
    
    // Header States
    const [header, setHeader] = useState({
        bankCode: '',
        bankName: '',
        docNo: '',
        company: 'C001',
        createUser: 'SYSTEM'
    });

    // Line Entry States
    const [entry, setEntry] = useState({
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
            loadInitialData();
            
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';

            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            setHeader(prev => ({
                ...prev,
                company: companyCode,
                createUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const companyCode = header.company || 'C001';
            const [lookupRes, docRes] = await Promise.all([
                bankingService.getChequeInHandLookups(companyCode),
                bankingService.generateDocNo('CIH', companyCode)
            ]);
            setLookups(lookupRes);
            setHeader(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            toast.error("Lookup protocol refresh failed");
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
        if (!header.bankCode) return toast.error("Please select a target Bank.");
        if (items.length === 0) return toast.error("Entry list is empty. Add at least one instrument.");

        try {
            setLoading(true);
            await bankingService.saveChequeInHand({ ...header, items });
            toast.success('Cheque in hand inventory registered successfully!');
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
                title="Cheque In Hand (CIH) Inventory Control"
                maxWidth="max-w-[1200px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleSave} disabled={loading} className={`px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} Commit Inventory
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
                    <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
                        <div className="grid grid-cols-12 gap-8 items-center">
                            <div className="col-span-12 lg:col-span-8 flex items-center gap-4">
                                <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest w-24 shrink-0">Bank</label>
                                <div className="flex-1 flex gap-2">
                                    <div className="flex-1 flex flex-col bg-slate-50/50 border border-slate-200 px-4 py-1.5 rounded-sm">
                                         <span className="text-[9px] font-black text-[#0078d4] leading-none mb-1">{header.bankCode || 'SELECT TARGET PORTFOLIO'}</span>
                                         <input type="text" readOnly value={header.bankName} placeholder="Identify the bank for instrument custody..." className="h-6 bg-transparent outline-none font-bold text-slate-700 text-[14px]" />
                                    </div>
                                    <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} className="w-12 h-12 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-md active:scale-90">
                                        <Search size={22} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-4 flex items-center gap-4 pl-10">
                                <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest w-24 shrink-0 text-right">Doc No</label>
                                <div className="flex-1 text-[16px] font-black text-[#0078d4] tracking-tight tabular-nums italic bg-blue-50 px-5 py-2.5 rounded border border-blue-100 shadow-inner">
                                    {header.docNo}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white border-2 border-[#f8fafd] rounded shadow-inner overflow-hidden flex flex-col h-[400px]">
                        <table className="w-full text-left border-collapse font-brand flex-1 flex flex-col overflow-hidden">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-slate-400 uppercase tracking-widest sticky top-0 border-b border-slate-100 z-10 w-full flex">
                                <tr className="w-full flex">
                                    <th className="p-4 w-40 border-r border-slate-100">Cheque Date</th>
                                    <th className="p-4 flex-1 border-r border-slate-100">Memo / Reference</th>
                                    <th className="p-4 w-48 border-r border-slate-100">Cheque No</th>
                                    <th className="p-4 w-40 text-right pr-10 border-r border-slate-100">Amount (LKR)</th>
                                    <th className="p-4 w-16 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 overflow-y-auto block flex-1">
                                {items.length > 0 ? items.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group flex w-full">
                                        <td className="p-4 w-40 border-r border-slate-50 font-bold text-slate-600 text-[13px] tabular-nums">{item.chequeDate}</td>
                                        <td className="p-4 flex-1 border-r border-slate-50 font-medium text-slate-500 text-[13px] italic">{item.memo || 'N/A'}</td>
                                        <td className="p-4 w-48 border-r border-slate-50 font-black text-[#0078d4] text-[14px] tracking-widest italic">{item.chequeNo}</td>
                                        <td className="p-4 w-40 text-right pr-10 border-r border-slate-50 font-black text-slate-800 text-[14px] tabular-nums italic bg-slate-50/20 group-hover:bg-white">{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-4 w-16 flex items-center justify-center">
                                            <button onClick={() => handleRemoveItem(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr className="flex w-full">
                                        <td colSpan={5} className="p-20 text-center flex-1">
                                            <div className="flex flex-col items-center gap-4 opacity-10 grayscale">
                                                <HandCoins size={80} />
                                                <span className="text-[14px] font-black uppercase tracking-[0.4em]">Inventory Empty</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Input Area (Below Table) */}
                    <div className="bg-slate-50/80 p-8 rounded border border-slate-200 shadow-md">
                         <div className="grid grid-cols-12 gap-6 items-end">
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Instrument Date</label>
                                <div className="flex items-center px-4 h-12 bg-white border border-slate-300 rounded shadow-sm focus-within:border-[#0078d4] transition-all">
                                    <input type="date" value={entry.chequeDate} onChange={e => setEntry({...entry, chequeDate: e.target.value})} className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent" />
                                    <Calendar size={18} className="text-[#0078d4]" />
                                </div>
                            </div>
                            <div className="col-span-4 flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Memo / Detail</label>
                                <input type="text" value={entry.memo} onChange={e => setEntry({...entry, memo: e.target.value})} placeholder="Specify instrument context..." className="h-12 w-full border border-slate-300 px-5 text-[13px] font-bold rounded shadow-sm outline-none focus:border-[#0078d4] bg-white italic" />
                            </div>
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cheque No</label>
                                <input type="text" value={entry.chequeNo} onChange={e => setEntry({...entry, chequeNo: e.target.value})} placeholder="000000" className="h-12 w-full border border-slate-300 px-5 text-[16px] font-black text-[#0078d4] rounded shadow-sm outline-none focus:border-[#0078d4] bg-white tracking-widest text-center italic" />
                            </div>
                            <div className="col-span-3 flex flex-col gap-1.5 relative">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Valuation (LKR)</label>
                                <input type="number" step="0.01" value={entry.amount} onChange={e => setEntry({...entry, amount: parseFloat(e.target.value) || 0})} className="h-12 w-full border border-[#0078d4] px-8 text-[18px] font-black text-slate-800 rounded shadow-xl shadow-blue-50 outline-none tabular-nums italic pr-12" />
                                <span className="absolute right-4 bottom-3.5 text-[10px] font-black text-slate-400 opacity-50 uppercase italic">LKR</span>
                            </div>
                            <div className="col-span-1">
                                <button onClick={handleAddItem} className="w-12 h-12 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-xl active:scale-95 group">
                                    <Plus size={28} className="group-hover:scale-125 transition-transform" />
                                </button>
                            </div>
                         </div>
                    </div>

                    {/* Operational Overview Footer */}
                    <div className="bg-slate-900 px-8 py-5 rounded shadow-2xl flex justify-between items-center border-t-4 border-[#0078d4]">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <Landmark size={24} className="text-blue-400" />
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] leading-none">Security Protocol</span>
                                <h4 className="text-white text-[13px] font-bold">Physical Custody Verification Active</h4>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-4 h-full pr-4">
                             <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Value</span>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-blue-400 text-[14px] font-black italic">PKY LKR.</span>
                                    <span className="text-3xl font-black text-white tabular-nums tracking-tighter italic">
                                        {totalValuation.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </span>
                                </div>
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
                        <div className="overflow-y-auto p-2 font-['Inter']">
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
                                                <button className="bg-[#0078d4] text-white text-[10px] px-5 py-2 rounded-sm font-black tracking-widest hover:bg-[#005a9e]">SECURE</button>
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

export default ChequeInHandBoard;
