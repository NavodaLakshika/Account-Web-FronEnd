import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Loader2, Ban, Landmark, Calendar, ShieldAlert, AlertTriangle, Building2, AlignLeft, ArrowRight, FileSearch } from 'lucide-react';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const SearchModal = ({ isOpen, onClose, title, items, onSelect }) => {
    const [q, setQ] = useState('');
    if (!isOpen) return null;
    const filtered = (items || []).filter(i => (i.name || '').toLowerCase().includes(q.toLowerCase()) || (i.code || '').toLowerCase().includes(q.toLowerCase()));
    
    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[500px]">
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Type to search..." className="w-full h-8 pl-9 pr-4 border border-gray-200 rounded-[5px] outline-none text-[12px] focus:border-blue-500 bg-white" />
                    </div>
                </div>
                <div className="border border-gray-100 rounded-lg overflow-hidden max-h-[350px] overflow-y-auto no-scrollbar">
                    <table className="w-full text-left text-[12px]">
                        <thead className="bg-slate-50 sticky top-0 font-bold text-gray-500 border-b border-gray-100">
                            <tr><th className="px-4 py-2">Code</th><th className="px-4 py-2">Name</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length > 0 ? filtered.map((item, i) => (
                                <tr key={i} onClick={() => { onSelect(item); onClose(); }} className="hover:bg-blue-50/50 cursor-pointer transition-colors">
                                    <td className="px-4 py-2.5 font-mono text-blue-600">{item.code || '-'}</td>
                                    <td className="px-4 py-2.5 text-slate-700 font-bold uppercase">{item.name}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="2" className="text-center py-6 text-gray-400 font-bold uppercase text-[10px]">No records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>
    );
};

const ChequeCancelBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ accounts: [] }); // Removed docTypes as it's unnecessary
    const [searchTerm, setSearchTerm] = useState('');
    
    const getInitialFormData = () => ({
        mode: 'Cheque Cancel',
        docType: '',
        docNo: '',
        voucherNo: '',
        supplierCode: '',
        supplierName: '',
        chequeDate: new Date().toISOString().split('T')[0],
        chequeAmount: 0,
        apAccount: '',
        apAccountName: '',
        targetChequeNo: '',
        cancelDate: new Date().toISOString().split('T')[0],
        reason: '',
        memo: '',
        company: '',
        createUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [activeModal, setActiveModal] = useState(null); // 'account'
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            setSearchTerm('');
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
            const res = await bankingService.getCancelLookups(compCode || formData.company);
            setLookups(res);
        } catch (error) {
            showErrorToast("Failed to load search parameters");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCheque = async () => {
        if (!searchTerm.trim()) {
            showErrorToast("Please enter a Document No or Cheque No.");
            return;
        }

        try {
            setLoading(true);
            // Search by either docNo or chequeNo using the same term
            const cheque = await bankingService.findCheque({
                docNo: searchTerm,
                voucherNo: '',
                chequeNo: searchTerm,
                company: formData.company
            });

            if (cheque) {
                setFormData(prev => ({
                    ...prev,
                    supplierCode: cheque.supplierCode,
                    supplierName: cheque.supplierName,
                    chequeDate: cheque.chequeDate,
                    chequeAmount: cheque.chequeAmount,
                    targetChequeNo: cheque.chequeNo,
                    docType: cheque.docType,
                    voucherNo: cheque.voucherNo,
                    docNo: cheque.docNo
                }));
                showSuccessToast("Cheque details found!");
            } else {
                showErrorToast("No valid cheque found with this number.");
            }
        } catch (error) {
            showErrorToast("Search failed or cheque already cancelled.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.supplierCode && !formData.supplierName) {
            showErrorToast("Please search and select a cheque first.");
            return;
        }
        if (!formData.reason) {
            showErrorToast("Cancellation reason is required.");
            return;
        }
        if (!formData.apAccount) {
            showErrorToast("A/P Account is required for ledger reversal.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveChequeCancel(formData);
            showSuccessToast('Cheque cancelled and reversed successfully!');
            setFormData(getInitialFormData());
            setSearchTerm('');
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(getInitialFormData());
        setSearchTerm('');
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Cancellation"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <button onClick={handleClear} disabled={loading} className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center gap-2 shadow-sm">
                            <RotateCcw size={14} /> Reset
                        </button>
                        
                        <button onClick={handleSave} disabled={loading || !formData.supplierName} className={`px-6 py-2.5 ${formData.mode === 'Cheque Return' ? 'bg-[#f59e0b] hover:bg-[#d97706] shadow-orange-100' : 'bg-[#e11d48] hover:bg-[#be123c] shadow-red-100'} text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading || !formData.supplierName ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />} {formData.mode === 'Cheque Return' ? 'Process Return' : 'Reverse Entry'}
                        </button>
                    </div>
                }
            >
                <div className="font-['Tahoma'] p-2 flex flex-col gap-6">
                    
                    {/* Header Row: Modes */}
                    <div className="flex gap-2">
                        <button onClick={() => setFormData({...formData, mode: 'Cheque Cancel'})} className={`flex-1 py-2 rounded-md font-mono font-bold text-[12px] uppercase tracking-widest transition-all ${formData.mode === 'Cheque Cancel' ? 'bg-[#e11d48] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            Cancel Cheque
                        </button>
                        <button onClick={() => setFormData({...formData, mode: 'Cheque Return'})} className={`flex-1 py-2 rounded-md font-mono font-bold text-[12px] uppercase tracking-widest transition-all ${formData.mode === 'Cheque Return' ? 'bg-[#f59e0b] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            Return Cheque
                        </button>
                    </div>

                    {/* Step 1: Big Search Input */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-blue-600 ml-1">Step 1: Locate Cheque</label>
                        <div className="flex bg-white rounded-lg border-2 border-blue-100 shadow-sm overflow-hidden focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                            <div className="flex items-center pl-4 pr-2 bg-blue-50/50 text-blue-400">
                                <Search size={20} />
                            </div>
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchCheque()}
                                className="flex-1 h-12 px-2 text-[15px] font-mono font-bold text-slate-800 outline-none placeholder:text-slate-300 placeholder:font-normal" 
                                placeholder="Enter Cheque No or Document No..." 
                                autoFocus
                            />
                            <button onClick={handleSearchCheque} className="px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[12px] uppercase tracking-widest transition-colors flex items-center gap-2">
                                Find <ArrowRight size={14}/>
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Show Results & Reversal Inputs Only if Found */}
                    {formData.supplierName ? (
                        <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                            
                            <hr className="border-slate-100" />
                            
                            {/* Document Info Card */}
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Building2 size={12}/> Payee / Origin</span>
                                    <p className="text-[14px] font-bold text-slate-800">{formData.supplierName} <span className="text-slate-400 font-mono text-[12px] font-normal">({formData.supplierCode})</span></p>
                                    <p className="text-[11px] text-slate-500 font-mono">Doc: {formData.docNo} | Chq: {formData.targetChequeNo}</p>
                                </div>
                                <div className="flex gap-6 md:text-right">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Calendar size={12}/> Date</span>
                                        <p className="text-[14px] font-mono font-bold text-slate-700">{formData.chequeDate ? formData.chequeDate.split(' ')[0] : ''}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Landmark size={12}/> Amount</span>
                                        <p className="text-[16px] font-mono font-black text-blue-600">Rs. {formData.chequeAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reversal Form */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <label className={`text-[11px] font-black uppercase tracking-widest ml-1 ${formData.mode === 'Cheque Return' ? 'text-orange-500' : 'text-red-500'}`}>Step 2: {formData.mode === 'Cheque Return' ? 'Return Details' : 'Reversal Details'}</label>
                                    <div className={`h-px flex-1 ${formData.mode === 'Cheque Return' ? 'bg-orange-100' : 'bg-red-100'}`}></div>
                                </div>

                                <div className={`bg-white p-5 rounded-lg border ${formData.mode === 'Cheque Return' ? 'border-orange-100 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.05)]' : 'border-red-100 shadow-[0_4px_20px_-4px_rgba(225,29,72,0.05)]'} space-y-4`}>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2 space-y-1">
                                            <label className="text-[11px] font-bold uppercase text-slate-500">{formData.mode === 'Cheque Return' ? 'Return Account (A/P)' : 'Post Reversal To Account (A/P)'}</label>
                                            <div className="flex gap-1 h-10">
                                                <input type="text" readOnly value={formData.apAccountName} className={`flex-1 min-w-0 h-10 border border-slate-200 px-3 text-[13px] font-bold text-slate-800 bg-white rounded cursor-pointer outline-none transition-all ${formData.mode === 'Cheque Return' ? 'focus:border-orange-400 focus:ring-2 focus:ring-orange-100' : 'focus:border-red-400 focus:ring-2 focus:ring-red-100'}`} placeholder="Select Ledger Account" onClick={() => setActiveModal('account')} />
                                                <button onClick={() => setActiveModal('account')} className={`w-12 h-10 text-white flex items-center justify-center rounded transition-colors shadow-sm ${formData.mode === 'Cheque Return' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 hover:bg-red-600'}`}><Search size={16}/></button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold uppercase text-slate-500">{formData.mode === 'Cheque Return' ? 'Return Date' : 'Cancellation Date'}</label>
                                            <div className="flex gap-1 h-10">
                                                <input type="text" readOnly value={formData.cancelDate} className={`flex-1 min-w-0 h-10 border border-slate-200 rounded px-3 text-[13px] font-mono font-bold outline-none bg-white text-slate-800 transition-all cursor-pointer ${formData.mode === 'Cheque Return' ? 'focus:border-orange-400 focus:ring-2 focus:ring-orange-100' : 'focus:border-red-400 focus:ring-2 focus:ring-red-100'}`} onClick={() => setShowDatePicker(true)} />
                                                <button onClick={() => setShowDatePicker(true)} className={`w-12 h-10 text-white flex items-center justify-center rounded transition-colors shadow-sm ${formData.mode === 'Cheque Return' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 hover:bg-red-600'}`}><Calendar size={16}/></button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold uppercase text-slate-500">Reason</label>
                                            <input type="text" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full h-10 border border-orange-200 px-3 text-[13px] font-bold text-slate-800 rounded bg-orange-50/30 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-orange-300 placeholder:font-normal" placeholder="Why is this cancelled?" />
                                        </div>
                                    </div>

                                    <div className={`p-3 rounded flex gap-3 items-start border mt-2 ${formData.mode === 'Cheque Return' ? 'bg-orange-50/50 border-orange-100' : 'bg-red-50/50 border-red-100'}`}>
                                        <AlertTriangle className={`shrink-0 mt-0.5 ${formData.mode === 'Cheque Return' ? 'text-orange-500' : 'text-red-500'}`} size={14} />
                                        <p className={`text-[11px] font-bold leading-relaxed ${formData.mode === 'Cheque Return' ? 'text-orange-800' : 'text-red-800'}`}>
                                            Warning: Submitting this form will mark Document <span className="font-mono">{formData.docNo}</span> as {formData.mode === 'Cheque Return' ? 'RETURNED' : 'CANCELLED'} and post a reversal entry to General Ledger.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                            <FileSearch size={32} className="mb-2 text-slate-300" />
                            <p className="text-[13px] font-bold uppercase tracking-widest">No Document Selected</p>
                            <p className="text-[11px] max-w-[300px] text-center mt-2">Enter a cheque number or document number above to locate the original transaction details.</p>
                        </div>
                    )}
                </div>
            </SimpleModal>

            <SearchModal
                isOpen={activeModal === 'account'}
                onClose={() => setActiveModal(null)}
                title="A/P Accounts Directory"
                items={lookups.accounts}
                onSelect={(item) => setFormData({...formData, apAccount: item.code, apAccountName: item.name})}
            />
            
            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.cancelDate}
                onDateSelect={(date) => setFormData({...formData, cancelDate: date})}
            />
        </>
    );
};

export default ChequeCancelBoard;
