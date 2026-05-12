import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, ArrowRightLeft, Landmark, Calendar, FileText, CheckCircle2, Wallet, ArrowRightCircle } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../utils/session';

const FundsTransferBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], costCenters: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        fromAccount: '',
        fromAccountName: '',
        fromBalance: 0,
        fromCostCenter: '',
        fromCostCenterName: '',
        toAccount: '',
        toAccountName: '',
        toBalance: 0,
        toCostCenter: '',
        toCostCenterName: '',
        amount: 0,
        reffNo: '',
        memo: '',
        company: '',
        createUser: ''
    });

    const [activeModal, setActiveModal] = useState(null); // 'fromAcc', 'toAcc', 'fromCC', 'toCC'
    const [searchTerm, setSearchTerm] = useState('');

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1 font-['Tahoma']">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1 font-['Tahoma']">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    useEffect(() => {
        if (isOpen) {
            const { companyCode, userName } = getSessionData();

            setFormData(prev => ({
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
            const activeComp = compCode || formData.company;
            const [lookupRes, docRes] = await Promise.all([
                bankingService.getTransferLookups(activeComp),
                bankingService.generateDocNo('FNT', activeComp)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleAccountSelect = async (account, type) => {
        try {
            const { balance } = await bankingService.getAccountBalance(account.code, formData.company);
            if (type === 'from') {
                setFormData(prev => ({ ...prev, fromAccount: account.code, fromAccountName: account.name, fromBalance: balance }));
            } else {
                setFormData(prev => ({ ...prev, toAccount: account.code, toAccountName: account.name, toBalance: balance }));
            }
        } catch (error) {
            showErrorToast("Failed to fetch account balance");
        }
    };

    const handleSave = async () => {
        if (!formData.fromAccount || !formData.toAccount || formData.amount <= 0) {
            showErrorToast("Please select both accounts and enter a valid amount.");
            return;
        }
        if (formData.fromAccount === formData.toAccount) {
            showErrorToast("Source and destination accounts cannot be the same.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveTransfer(formData);
            showSuccessToast('Funds transferred successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            fromAccount: '',
            fromAccountName: '',
            fromBalance: 0,
            fromCostCenter: '',
            fromCostCenterName: '',
            toAccount: '',
            toAccountName: '',
            toBalance: 0,
            toCostCenter: '',
            toCostCenterName: '',
            amount: 0,
            reffNo: '',
            memo: ''
        });
        loadInitialData();
    };

    const filteredLookup = () => {
        const query = searchTerm.toLowerCase();
        if (activeModal?.includes('Acc')) return lookups.banks.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
        if (activeModal?.includes('CC')) return lookups.costCenters.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
        return [];
    };

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
                title="Funds Transfer"
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
                    {/* Header: Date & Doc No */}
                    <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Date</label>
                            <div className="flex items-center px-3 h-9 border border-gray-300 bg-white shadow-sm rounded-sm hover:border-blue-400 transition-colors">
                                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent" />
                                <Calendar size={14} className="text-[#0078d4]" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-[13px] font-bold text-gray-700">Doc. No</label>
                            <div className="text-[14px] font-black text-[#0078d4] tracking-tight italic">
                                {formData.docNo}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Sections */}
                    <div className="grid grid-cols-12 gap-8">
                        {/* Transfer FROM Section */}
                        <div className="col-span-12 lg:col-span-12 bg-white p-6 border border-gray-200 rounded-sm shadow-sm space-y-4 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                <ArrowRightLeft size={120} />
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-40 shrink-0">Transfer Funds From</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.fromAccountName} placeholder="Source Bank / Cash Account..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                    <button onClick={() => { setActiveModal('fromAcc'); setSearchTerm(''); }} className="w-12 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm group transition-all">
                                        <Search size={18} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                                <div className="w-48 flex items-center gap-3 pl-4 border-l border-slate-100">
                                    <span className="text-[11px] font-black text-slate-400 uppercase">Balance</span>
                                    <span className="text-[14px] font-black text-red-600 tabular-nums uppercase">Rs. {formData.fromBalance.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-40 shrink-0">From Cost Center</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.fromCostCenterName} placeholder="Source Allocation..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                    <button onClick={() => { setActiveModal('fromCC'); setSearchTerm(''); }} className="w-12 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-md active:scale-90">
                                        <Search size={18} />
                                    </button>
                                </div>
                                <div className="w-48" /> {/* Maintain layout */}
                            </div>

                            {/* Separator / Flow Indicator */}
                            <div className="py-4 flex items-center gap-4">
                                 <div className="flex-1 h-[1px] bg-slate-100" />
                                 <div className="px-3 py-1 bg-blue-50 text-[#0078d4] text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 border border-blue-100 shadow-sm">
                                    <ArrowRightCircle size={14} /> Fund Movement Flow
                                 </div>
                                 <div className="flex-1 h-[1px] bg-slate-100" />
                            </div>

                            {/* Transfer TO Section */}
                            <div className="flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-40 shrink-0">Transfer Funds To</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.toAccountName} placeholder="Destination Bank / Cash Account..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                    <button onClick={() => { setActiveModal('toAcc'); setSearchTerm(''); }} className="w-12 h-9 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm group transition-all">
                                        <Search size={18} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                                <div className="w-48 flex items-center gap-3 pl-4 border-l border-slate-100">
                                    <span className="text-[11px] font-black text-slate-400 uppercase">Balance</span>
                                    <span className="text-[14px] font-black text-[#0078d4] tabular-nums uppercase">Rs. {formData.toBalance.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-40 shrink-0">To Cost Center</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.toCostCenterName} placeholder="Destination Allocation..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                    <button onClick={() => { setActiveModal('toCC'); setSearchTerm(''); }} className="w-12 h-9 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-md active:scale-90">
                                        <Search size={18} />
                                    </button>
                                </div>
                                <div className="w-48" /> {/* Maintain layout */}
                            </div>
                        </div>

                        {/* Amount & Memo Footer Section */}
                        <div className="col-span-12 bg-[#f8fafc] p-6 border border-gray-200 rounded-sm shadow-sm space-y-6">
                            <div className="grid grid-cols-12 gap-8">
                                <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                    <label className="text-[13px] font-bold text-gray-700 w-40 shrink-0">Transfer Amount</label>
                                    <div className="flex-1 relative group">
                                         <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className="w-full h-12 border border-blue-200 px-6 text-[22px] font-black text-[#0078d4] rounded shadow-inner outline-none focus:border-[#0078d4] tabular-nums transition-all" />
                                         <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-300 uppercase italic">LKR</span>
                                    </div>
                                </div>
                                <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Reff. No</label>
                                    <input type="text" value={formData.reffNo} onChange={e => setFormData({...formData, reffNo: e.target.value})} className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold text-slate-700 rounded shadow-sm outline-none focus:border-blue-400" placeholder="Internal Tracking ID..." />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-40 shrink-0">Memo / Remarks</label>
                                <input type="text" value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} className="flex-1 h-10 border border-gray-300 px-4 text-[13px] font-medium italic rounded outline-none focus:border-blue-400 shadow-sm" placeholder="Reason for transfer (Internal re-allocation, etc.)..." />
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
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Search {activeModal.includes('CC') ? 'Cost Center' : 'Bank Account'}</h3>
                            <button 
                                onClick={() => setActiveModal(null)} 
                                className="w-10 h-10 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={20} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Type to filter list..." 
                                    className="w-full h-11 border border-gray-100 pl-11 pr-4 text-sm rounded-lg focus:border-blue-500 outline-none shadow-inner" 
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
                                        <th className="p-4 border-b">Code</th>
                                        <th className="p-4 border-b">Title / Name</th>
                                        <th className="p-4 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'fromAcc') handleAccountSelect(item, 'from');
                                            if (activeModal === 'toAcc') handleAccountSelect(item, 'to');
                                            if (activeModal === 'fromCC') setFormData({...formData, fromCostCenter: item.code, fromCostCenterName: item.name});
                                            if (activeModal === 'toCC') setFormData({...formData, toCostCenter: item.code, toCostCenterName: item.name});
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

export default FundsTransferBoard;
