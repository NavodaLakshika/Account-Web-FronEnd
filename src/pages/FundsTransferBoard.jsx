import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, ArrowRightLeft, Landmark, Calendar, FileText, CheckCircle2, Wallet, ArrowRightCircle } from 'lucide-react';
import { bankingService } from '../services/banking.service';


import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const FundsTransferBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], costCenters: [] });
    
    // Form States
    const getInitialFormData = () => ({
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

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null); // 'fromAcc', 'toAcc', 'fromCC', 'toCC'
    const [searchTerm, setSearchTerm] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
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
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            
                            <button onClick={handleSave} disabled={loading} className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header: Date & Doc No */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Date</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.date} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => setShowDatePicker(true)} />
                                    <button onClick={() => setShowDatePicker(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase">Doc. No</label>
                            <div className="text-[14px] font-black text-[#0078d4] tracking-tight italic">
                                {formData.docNo}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Sections */}
                    <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                        {/* Transfer FROM Section */}
                        <div className="col-span-12 lg:col-span-12 bg-white p-4 border border-slate-200 rounded-[5px] space-y-3.5 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                <ArrowRightLeft size={120} />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-40 shrink-0">Transfer Funds From</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.fromAccountName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('fromAcc'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('fromAcc'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <div className="w-48 flex items-center justify-between pl-4 border-l border-slate-200">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Balance</span>
                                    <span className="text-[12px] font-mono font-black text-red-600 uppercase">Rs. {formData.fromBalance.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-40 shrink-0">From Cost Center</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.fromCostCenterName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('fromCC'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('fromCC'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <div className="w-48" /> {/* Maintain layout */}
                            </div>

                            {/* Separator / Flow Indicator */}
                            <div className="py-2 flex items-center gap-4">
                                 <div className="flex-1 h-[1px] bg-slate-100" />
                                 <div className="px-4 py-1 bg-blue-50/50 text-[#0285fd] text-[9px] font-bold font-mono rounded-[5px] uppercase tracking-widest flex items-center gap-2 border border-blue-100/50">
                                    <ArrowRightCircle size={14} /> Fund Movement Flow
                                 </div>
                                 <div className="flex-1 h-[1px] bg-slate-100" />
                            </div>

                            {/* Transfer TO Section */}
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-40 shrink-0">Transfer Funds To</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.toAccountName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('toAcc'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('toAcc'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <div className="w-48 flex items-center justify-between pl-4 border-l border-slate-200">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Balance</span>
                                    <span className="text-[12px] font-mono font-black text-[#0285fd] uppercase">Rs. {formData.toBalance.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-40 shrink-0">To Cost Center</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.toCostCenterName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('toCC'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('toCC'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <div className="w-48" /> {/* Maintain layout */}
                            </div>
                        </div>

                        {/* Amount & Memo Footer Section */}
                        <div className="col-span-12 bg-white p-4 border border-slate-200 rounded-[5px] space-y-3.5">
                            <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                                <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-40 shrink-0">Transfer Amount</label>
                                    <div className="flex-1 relative min-w-0 group">
                                         <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className="w-full h-8 border border-blue-200 px-3 text-[14px] font-mono font-black text-[#0078d4] rounded shadow-inner outline-none focus:border-[#0285fd] tabular-nums transition-all" />
                                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase italic">LKR</span>
                                    </div>
                                </div>
                                <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Reff. No</label>
                                    <input type="text" value={formData.reffNo} onChange={e => setFormData({...formData, reffNo: e.target.value})} className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-700 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-40 shrink-0">Memo / Remarks</label>
                                <input type="text" value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-mono italic rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.date}
                onDateSelect={(date) => setFormData({...formData, date})}
            />

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
                                            if (activeModal === 'fromAcc') handleAccountSelect(item, 'from');
                                            if (activeModal === 'toAcc') handleAccountSelect(item, 'to');
                                            if (activeModal === 'fromCC') setFormData({...formData, fromCostCenter: item.code, fromCostCenterName: item.name});
                                            if (activeModal === 'toCC') setFormData({...formData, toCostCenter: item.code, toCostCenterName: item.name});
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
        </>
    );
};

export default FundsTransferBoard;
