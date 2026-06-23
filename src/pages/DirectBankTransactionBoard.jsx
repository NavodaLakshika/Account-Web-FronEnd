import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, Banknote, ShieldCheck, Wallet, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2 } from 'lucide-react';
import { bankingService } from '../services/banking.service';


import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';


const DirectBankTransactionBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], accounts: [], costCenters: [] });
    
    // Form States
    const getInitialFormData = () => ({
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
        company: '',
        createUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null); // 'bank', 'ap', 'costCenter'
    const [searchTerm, setSearchTerm] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');
    
    // Receipt Modal States
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSavedTx, setLastSavedTx] = useState(null);

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
                bankingService.getDirectTransactionLookups(activeComp),
                bankingService.generateDocNo('MDPO', activeComp)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.bankAccount || !formData.apAccount || formData.amount <= 0) {
            showErrorToast("Please fill in all required fields and ensure the amount is greater than zero.");
            return;
        }

        try {
            setLoading(true);

            const isExpense = formData.type === 'Expenses';
            const transactionAmount = isExpense ? -Math.abs(formData.amount) : Math.abs(formData.amount);

            const payload = {
                DocNo: formData.docNo,
                Company: formData.company,
                CreateUser: formData.createUser,
                DepositTo: formData.bankAccount,
                DepositDate: formData.date,
                Memo: formData.memo || `${formData.type} Transaction`,
                RefNo: formData.docNo,
                TotalAmount: transactionAmount,
                Entries: [
                    {
                        ReceivedFrom: formData.apAccountName || '',
                        AccountCode: formData.apAccount,
                        Memo: formData.memo || `${formData.type} Transaction`,
                        Amount: transactionAmount
                    }
                ]
            };

            await bankingService.saveDirectTransaction(payload);
            showSuccessToast('Direct transaction saved successfully!');
            
            setLastSavedTx({
                type: 'BANK DIRECT TRANSACTION',
                docNo: formData.docNo,
                payee: formData.apAccountName ? `${formData.apAccount} - ${formData.apAccountName}` : '',
                date: formData.date,
                total: formData.amount,
                details: {
                    header: {
                        docNo: formData.docNo,
                        date: formData.date,
                        payee: formData.apAccountName,
                        amount: formData.amount,
                    },
                    expenses: [{
                        accCode: formData.bankAccountName,
                        memo: formData.memo || `${formData.type} Transaction`,
                        amount: formData.amount
                    }]
                }
            });
            setShowReceipt(true);
            
            handleClear();
        } catch (error) {
            showErrorToast(error.toString());
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
        if (activeModal === 'bank') return (lookups?.banks || []).filter(l => (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (l.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'ap') return (lookups?.accounts || []).filter(l => (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (l.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'costCenter') return (lookups?.costCenters || []).filter(l => (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (l.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
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
                title="Bank Direct Transaction"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50/80 px-6 py-3 w-full flex justify-end gap-3 border-t border-slate-200 rounded-b-[5px]">
                        <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={16} /> CLEAR FORM
                        </button>
                        <button onClick={handleSave} disabled={loading} className={`px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} SAVE
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] relative overflow-hidden space-y-4">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
                            <Landmark size={180} />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 relative z-10">
                            {/* Row 1: Date & Doc No */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.date} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }} />
                                    <button onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2 lg:pl-10">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Doc. No</label>
                                <div className="text-[14px] font-black text-[#0078d4] tracking-tight tabular-nums italic">
                                    {formData.docNo}
                                </div>
                            </div>

                            {/* Row 2: Type Selection */}
                            <div className="col-span-12 flex items-center gap-8 py-2 border-y border-slate-100">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.type === 'Income' ? 'border-[#0078d4] bg-[#0078d4]/10' : 'border-slate-300'}`}>
                                        {formData.type === 'Income' && <div className="w-2 h-2 bg-[#0078d4] rounded-full shadow-sm shadow-[#0078d4]/50" />}
                                    </div>
                                    <input type="radio" value="Income" checked={formData.type === 'Income'} onChange={e => setFormData({...formData, type: e.target.value})} className="hidden" />
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${formData.type === 'Income' ? 'text-[#0078d4]' : 'text-slate-400'}`}>Income Transaction</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.type === 'Expenses' ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}>
                                        {formData.type === 'Expenses' && <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm shadow-red-500/50" />}
                                    </div>
                                    <input type="radio" value="Expenses" checked={formData.type === 'Expenses'} onChange={e => setFormData({...formData, type: e.target.value})} className="hidden" />
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${formData.type === 'Expenses' ? 'text-red-500' : 'text-slate-400'}`}>Expenses Transaction</span>
                                </label>
                            </div>

                            {/* Row 3: Bank Account */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Bank Account</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.bankAccountName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 4: A/P Account (Expense Account) */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">A/P Account</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.apAccountName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('ap'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('ap'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 5: Cost Center */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Cost Center</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.costCenterName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('costCenter'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('costCenter'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 6: Memo */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Memo</label>
                                <input type="text" value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 italic" />
                            </div>

                            {/* Row 7: Amount & Relevant Date */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Amount</label>
                                <div className="flex-1 relative min-w-0">
                                    <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-black text-[#0078d4] rounded bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 tabular-nums shadow-inner" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase italic">LKR</span>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2 lg:pl-10">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Relevant Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.relevantDate} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => { setDatePickerField('relevantDate'); setShowDatePicker(true); }} />
                                    <button onClick={() => { setDatePickerField('relevantDate'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Help Section */}
                    <div className="bg-slate-50 p-4 border-l-4 border-l-[#0285fd] rounded-[5px] flex items-start gap-4 shadow-inner border border-slate-200">
                        <ShieldCheck size={20} className="text-[#0285fd] shrink-0" />
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-widest">Transaction Protocol</h4>
                            <p className="text-[11px] font-medium text-slate-600 font-mono">
                                Direct bank transactions bypassing the standard reconciliation flow. Use this for bank charges, interest, and direct withdrawals/deposits that don't originate from a customer or vendor receipt/payment.
                            </p>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData[datePickerField]}
                onDateSelect={(date) => setFormData({...formData, [datePickerField]: date})}
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
                                placeholder={`Find ${activeModal === 'bank' ? 'Bank Accounts' : activeModal === 'ap' ? 'A/P Accounts' : 'Cost Centers'} by name...`}
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
                                            if (activeModal === 'bank') setFormData({...formData, bankAccount: item.code, bankAccountName: item.name});
                                            if (activeModal === 'ap') setFormData({...formData, apAccount: item.code, apAccountName: item.name});
                                            if (activeModal === 'costCenter') setFormData({...formData, costCenter: item.code, costCenterName: item.name});
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

            {/* Receipt Modal */}
            {showReceipt && lastSavedTx && (
                <TransactionReceiptModal 
                    selectedTx={lastSavedTx}
                    onClose={() => {
                        setShowReceipt(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
};

export default DirectBankTransactionBoard;
