import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, Hash, CheckCircle2, BookOpen, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';

const ChequeBookEntryBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ accounts: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        accountCode: '',
        accountName: '',
        bookNo: '1',
        entryDate: new Date().toISOString().split('T')[0],
        startNo: '',
        endNo: '',
        company: 'C001',
        createUser: 'SYSTEM'
    });

    const [activeModal, setActiveModal] = useState(null); // 'account'
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

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const res = await bankingService.getChequeBookLookups(formData.company);
            setLookups(res);
        } catch (error) {
            toast.error("Failed to load bank account parameters");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.accountCode) return toast.error("Please select a valid Bank Account.");
        if (!formData.startNo || !formData.endNo) return toast.error("Start and End cheque numbers are required.");
        
        const start = parseInt(formData.startNo);
        const end = parseInt(formData.endNo);
        if (isNaN(start) || isNaN(end) || start > end) return toast.error("Invalid cheque range protocol.");

        try {
            setLoading(true);
            await bankingService.saveChequeBook(formData);
            toast.success('New Cheque Book registered successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            accountCode: '',
            accountName: '',
            bookNo: '1',
            entryDate: new Date().toISOString().split('T')[0],
            startNo: '',
            endNo: ''
        });
    };

    const filteredLookup = () => {
        const query = searchTerm.toLowerCase();
        if (activeModal === 'account') return lookups.accounts.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
        return [];
    };

    const totalCheques = (formData.startNo && formData.endNo) ? 
        Math.max(0, parseInt(formData.endNo) - parseInt(formData.startNo) + 1) : 0;

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Book Inventory Registration"
                maxWidth="max-w-[900px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleSave} disabled={loading} className={`px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} />} Register Protocol
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
                    {/* Branding Banner */}
                    <div className="bg-[#0078d4] p-8 rounded-sm relative overflow-hidden shadow-lg border border-blue-400/30">
                         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none rotate-12 scale-150">
                             <BookOpen size={160} />
                         </div>
                         <div className="relative z-10 space-y-2">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
                                     <Hash size={24} className="text-white" />
                                 </div>
                                 <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Serial Inventory Entry</h2>
                             </div>
                             <p className="text-blue-50/80 text-[12px] font-medium max-w-lg leading-relaxed">
                                Enter the starting and ending serial numbers for the new physical cheque book. The system will automatically allocate these numbers for your bank account ledger.
                             </p>
                         </div>
                    </div>

                    {/* Entry Form Grid */}
                    <div className="bg-white p-8 border border-slate-100 rounded shadow-sm space-y-8 relative">
                        {/* Account Selection */}
                        <div className="grid grid-cols-12 gap-8 items-center">
                            <label className="col-span-3 text-[13px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Account</label>
                            <div className="col-span-9 flex gap-2">
                                <div className="flex-1 flex flex-col pointer-events-none bg-slate-50 border border-gray-200 px-4 py-2 rounded-sm group focus-within:border-blue-500 transition-all">
                                    <span className="text-[10px] font-black text-slate-400 leading-none mb-1">{formData.accountCode || 'SELECT BANK ACCOUNT'}</span>
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.accountName}
                                        placeholder="Click search to identify the bank instrument..."
                                        className="h-6 outline-none bg-transparent font-bold text-slate-700 text-[14px] placeholder:font-normal"
                                    />
                                </div>
                                <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-14 h-14 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-md active:scale-95 group">
                                    <Search size={24} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Book No & Date */}
                        <div className="grid grid-cols-12 gap-8 items-center">
                            <div className="col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest w-32 shrink-0">Book No</label>
                                <input 
                                    type="text" 
                                    value={formData.bookNo} 
                                    onChange={e => setFormData({...formData, bookNo: e.target.value})} 
                                    className="flex-1 h-11 border border-gray-200 px-5 text-[14px] font-black text-slate-700 rounded-sm outline-none focus:border-blue-500 bg-white shadow-sm"
                                />
                            </div>
                            <div className="col-span-6 flex items-center gap-4 pl-10">
                                <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest w-32 shrink-0 text-right">Entry Date</label>
                                <div className="flex-1 flex items-center px-4 h-11 border border-gray-200 bg-white shadow-sm rounded-sm hover:border-blue-400 transition-colors">
                                    <input type="date" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent" />
                                    <Calendar size={18} className="text-[#0078d4]" />
                                </div>
                            </div>
                        </div>

                        {/* Serial Number Range */}
                        <div className="grid grid-cols-12 gap-8 items-center bg-slate-50/50 p-6 rounded-sm border border-slate-100 border-dashed">
                             <div className="col-span-12 mb-2 flex items-center gap-2">
                                <Layers size={14} className="text-[#0078d4]" />
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cheque Leaf Serial Protocol</span>
                             </div>
                             <div className="col-span-5 flex items-center gap-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-tight w-24 shrink-0">Start Serial</label>
                                <input 
                                    type="text" 
                                    value={formData.startNo} 
                                    onChange={e => setFormData({...formData, startNo: e.target.value})} 
                                    className="flex-1 h-12 border border-gray-300 px-5 text-[18px] font-black text-[#0078d4] tracking-widest rounded-sm outline-none focus:border-[#0078d4] bg-white shadow-inner"
                                    placeholder="000000"
                                />
                             </div>
                             <div className="col-span-2 flex items-center justify-center">
                                 <div className="w-10 h-[2px] bg-slate-200" />
                             </div>
                             <div className="col-span-5 flex items-center gap-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-tight w-24 shrink-0 text-right">End Serial</label>
                                <input 
                                    type="text" 
                                    value={formData.endNo} 
                                    onChange={e => setFormData({...formData, endNo: e.target.value})} 
                                    className="flex-1 h-12 border border-gray-300 px-5 text-[18px] font-black text-[#0078d4] tracking-widest rounded-sm outline-none focus:border-[#0078d4] bg-white shadow-inner"
                                    placeholder="000000"
                                />
                             </div>
                        </div>

                        {/* Valuation Footer */}
                        <div className="bg-[#f8fafd] p-5 rounded-sm border border-blue-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={18} className="text-[#0078d4]" />
                                <span className="text-[12px] font-bold text-slate-600 italic">Leaves detected in this sequence:</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-[#0078d4] tabular-nums italic">{totalCheques}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leaflets</span>
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
                            Search Bank Portfolio
                            <button onClick={() => setActiveModal(null)} className="w-10 h-10 flex items-center justify-center hover:bg-red-50 text-slate-400 rounded-full transition-all group"><X size={28} className="group-hover:scale-110 transition-transform" /></button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Begin typing bank name or code..." 
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
                                        <th className="p-4 border-b">IFSC / Code</th>
                                        <th className="p-4 border-b">Account Descriptor</th>
                                        <th className="p-4 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            setFormData({...formData, accountCode: item.code, accountName: item.name});
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

export default ChequeBookEntryBoard;
