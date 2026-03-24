import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, Banknote, ShieldCheck, Wallet, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2 } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';

const DirectBankTransactionBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], accounts: [], costCenters: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        relevantDate: new Date().toISOString().split('T')[0],
        type: 'Expenses', // 'Income' or 'Expenses'
        bankAccount: '',
        bankAccountName: '',
        apAccount: '',
        apAccountName: '',
        costCenter: '',
        costCenterName: '',
        memo: '',
        amount: 0,
        company: 'C001',
        createUser: 'SYSTEM'
    });

    const [activeModal, setActiveModal] = useState(null); // 'bank', 'ap', 'costCenter'
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
            const companyCode = formData.company || 'C001';
            const [lookupRes, docRes] = await Promise.all([
                bankingService.getDirectTransactionLookups(companyCode),
                bankingService.generateDocNo('BDT', companyCode)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.bankAccount || !formData.apAccount || formData.amount <= 0) {
            toast.error("Please fill in all required fields and ensure the amount is greater than zero.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveDirectTransaction(formData);
            toast.success('Direct transaction saved successfully!');
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
            bankAccount: '',
            bankAccountName: '',
            apAccount: '',
            apAccountName: '',
            costCenter: '',
            costCenterName: '',
            memo: '',
            amount: 0,
            type: 'Expenses'
        });
        loadInitialData();
    };

    const filteredLookup = () => {
        if (activeModal === 'bank') return lookups.banks.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'ap') return lookups.accounts.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'costCenter') return lookups.costCenters.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return [];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Bank Direct Transaction"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleSave} disabled={loading} className={`px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} Save
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
                    {/* Header Section */}
                    <div className="bg-white p-8 border border-gray-200 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
                            <Landmark size={180} />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-8 relative z-10">
                            {/* Row 1: Date & Doc No */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Date</label>
                                <div className="flex-1 flex items-center px-3 h-9 border border-gray-300 bg-white shadow-sm rounded-sm hover:border-blue-400 transition-colors">
                                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent" />
                                    <Calendar size={14} className="text-[#0078d4]" />
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4 lg:pl-10">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Doc. No</label>
                                <div className="text-[14px] font-black text-[#0078d4] tracking-tight tabular-nums italic">
                                    {formData.docNo}
                                </div>
                            </div>

                            {/* Row 2: Type Selection */}
                            <div className="col-span-12 flex items-center gap-12 py-3 border-y border-slate-50">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.type === 'Income' ? 'border-[#0078d4] bg-[#0078d4]/10' : 'border-slate-300'}`}>
                                        {formData.type === 'Income' && <div className="w-2.5 h-2.5 bg-[#0078d4] rounded-full shadow-sm shadow-[#0078d4]/50" />}
                                    </div>
                                    <input type="radio" value="Income" checked={formData.type === 'Income'} onChange={e => setFormData({...formData, type: e.target.value})} className="hidden" />
                                    <span className={`text-[13px] font-bold uppercase tracking-wider ${formData.type === 'Income' ? 'text-[#0078d4]' : 'text-slate-400'}`}>Income Transaction</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.type === 'Expenses' ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}>
                                        {formData.type === 'Expenses' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shadow-red-500/50" />}
                                    </div>
                                    <input type="radio" value="Expenses" checked={formData.type === 'Expenses'} onChange={e => setFormData({...formData, type: e.target.value})} className="hidden" />
                                    <span className={`text-[13px] font-bold uppercase tracking-wider ${formData.type === 'Expenses' ? 'text-red-500' : 'text-slate-400'}`}>Expenses Transaction</span>
                                </label>
                            </div>

                            {/* Row 3: Bank Account */}
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Bank Account</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.bankAccountName} placeholder="Source Bank for Transfer/Expense or Deposit Account..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                    <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} className="w-12 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-md active:scale-90">
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 4: A/P Account (Expense Account) */}
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">A/P Account</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.apAccountName} placeholder="Corresponding Expense or Income GL Account..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                    <button onClick={() => { setActiveModal('ap'); setSearchTerm(''); }} className="w-12 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-md active:scale-90">
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 5: Cost Center */}
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Cost Center</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.costCenterName} placeholder="Allocated Cost Center..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                    <button onClick={() => { setActiveModal('costCenter'); setSearchTerm(''); }} className="w-12 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-md active:scale-90">
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 6: Memo */}
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Memo</label>
                                <input type="text" value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-medium italic rounded-sm outline-none focus:border-blue-500" placeholder="Specific details about this direct transaction..." />
                            </div>

                            {/* Row 7: Amount & Relevant Date */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Amount</label>
                                <div className="flex-1 relative">
                                    <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className="w-full h-11 border border-gray-300 px-5 text-[18px] font-black text-[#0078d4] rounded-sm bg-white outline-none focus:border-blue-500 tabular-nums shadow-inner" placeholder="0.00" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase italic">LKR</span>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4 lg:pl-10">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Relevant Date</label>
                                <div className="flex-1 flex items-center px-3 h-9 border border-gray-300 bg-white shadow-sm rounded-sm hover:border-blue-400 transition-colors">
                                    <input type="date" value={formData.relevantDate} onChange={e => setFormData({...formData, relevantDate: e.target.value})} className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent" />
                                    <Calendar size={14} className="text-[#0078d4]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Help Section */}
                    <div className="bg-slate-50 p-6 border-l-4 border-l-[#0078d4] rounded-sm flex items-start gap-4 shadow-inner">
                        <ShieldCheck size={24} className="text-[#0078d4] shrink-0 mt-1" />
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">Transaction Protocol</h4>
                            <p className="text-[12px] text-slate-600 font-medium">
                                Direct bank transactions bypassing the standard reconciliation flow. Use this for bank charges, interest, and direct withdrawals/deposits that don't originate from a customer or vendor receipt/payment.
                            </p>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] font-['Plus_Jakarta_Sans']">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Search {activeModal === 'bank' ? 'Bank Accounts' : activeModal === 'ap' ? 'A/P Accounts' : 'Cost Centers'}</h3>
                            <button onClick={() => setActiveModal(null)} className="w-10 h-10 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full transition-all"><X size={28} /></button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Type to search..." 
                                    className="w-full h-11 border border-gray-100 pl-11 pr-4 text-sm rounded-lg focus:border-blue-500 outline-none shadow-inner font-medium" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="p-4 border-b">Code</th>
                                        <th className="p-4 border-b">Name</th>
                                        <th className="p-4 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'bank') setFormData({...formData, bankAccount: item.code, bankAccountName: item.name});
                                            if (activeModal === 'ap') setFormData({...formData, apAccount: item.code, apAccountName: item.name});
                                            if (activeModal === 'costCenter') setFormData({...formData, costCenter: item.code, costCenterName: item.name});
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-4 border-b font-black text-slate-700">{item.code}</td>
                                            <td className="p-4 border-b font-bold text-[#0078d4] uppercase tracking-tight">{item.name}</td>
                                            <td className="p-4 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-5 py-2 rounded-sm font-black tracking-widest hover:bg-[#005a9e]">SELECT</button>
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

export default DirectBankTransactionBoard;
