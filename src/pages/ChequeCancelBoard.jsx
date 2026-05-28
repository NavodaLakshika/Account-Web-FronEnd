import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, Ban, Landmark, Calendar, FileText, CheckCircle2, ShieldAlert, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const ChequeCancelBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ docTypes: [], accounts: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        mode: 'Cheque Cancel', // 'Cheque Cancel' or 'Cheque Return'
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

    const [activeModal, setActiveModal] = useState(null); // 'account', 'docType'
    const [searchTerm, setSearchTerm] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

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
            const res = await bankingService.getCancelLookups(compCode || formData.company);
            setLookups(res);
        } catch (error) {
            showErrorToast("Failed to load search parameters");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCheque = async () => {
        if (!formData.docNo && !formData.voucherNo && !formData.targetChequeNo) {
            showErrorToast("Please enter a Document No or Cheque No to search.");
            return;
        }

        try {
            setLoading(true);
            const cheque = await bankingService.findCheque({
                docNo: formData.docNo,
                voucherNo: formData.voucherNo,
                chequeNo: formData.targetChequeNo,
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
                showSuccessToast("Cheque link details retrieved!");
            } else {
                showErrorToast("No valid cheque found with these details.");
            }
        } catch (error) {
            showErrorToast("Search failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.supplierCode || !formData.targetChequeNo) {
            showErrorToast("Search and select a valid cheque record first.");
            return;
        }
        if (!formData.reason) {
            showErrorToast("Reason for cancellation is strictly required for auditing.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveChequeCancel(formData);
            showSuccessToast('Cheque protocol finalized successfully!');
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
            reason: '',
            memo: ''
        });
    };

    const filteredLookup = () => {
        const query = searchTerm.toLowerCase();
        if (activeModal === 'account') return lookups.accounts.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
        if (activeModal === 'docType') return lookups.docTypes.filter(l => l.name.toLowerCase().includes(query));
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
                title="Cheque Cancellation Hub"
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
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />} SAVE PROTOCOL
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Mode Selection Header */}
                    <div className="bg-white border border-slate-200 rounded-[5px] overflow-hidden flex items-center p-1">
                        <button onClick={() => setFormData({...formData, mode: 'Cheque Cancel'})} className={`flex-1 flex items-center justify-center gap-3 py-2.5 rounded-[3px] font-mono font-bold text-[13px] uppercase tracking-widest transition-all ${formData.mode === 'Cheque Cancel' ? 'bg-[#0285fd] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                            <Ban size={16} /> Cheque Cancel
                        </button>
                        <button onClick={() => setFormData({...formData, mode: 'Cheque Return'})} className={`flex-1 flex items-center justify-center gap-3 py-2.5 rounded-[3px] font-mono font-bold text-[13px] uppercase tracking-widest transition-all ${formData.mode === 'Cheque Return' ? 'bg-[#f04e3e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                            <RotateCcw size={16} /> Cheque Return
                        </button>
                    </div>

                    {/* Search & Detail Section */}
                    <div className="bg-slate-50/50 p-4 rounded-[5px] border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <FileText size={160} />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 relative z-10">
                            {/* Document Type Selection */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold uppercase text-gray-500 w-32 shrink-0">Document Type</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.docType} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('docType'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('docType'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Doc No & Voucher No */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold uppercase text-gray-500 w-32 shrink-0">Document No</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" value={formData.docNo} onChange={e => setFormData({...formData, docNo: e.target.value})} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold rounded bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all font-mono" />
                                    <button onClick={handleSearchCheque} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2 lg:pl-4">
                                <label className="text-[11px] font-bold uppercase text-gray-500 w-28 shrink-0">Voucher No</label>
                                <input type="text" value={formData.voucherNo} onChange={e => setFormData({...formData, voucherNo: e.target.value})} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold rounded bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all font-mono" />
                            </div>

                            {/* Supplier Section */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold uppercase text-gray-500 w-32 shrink-0">Supplier / Payee</label>
                                <div className="flex gap-2 flex-1">
                                    <input type="text" readOnly value={formData.supplierCode} className="w-32 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 rounded bg-slate-100 outline-none" />
                                    <input type="text" readOnly value={formData.supplierName} className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 rounded bg-slate-100 outline-none" />
                                </div>
                            </div>

                            {/* Date & Amount */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold uppercase text-gray-500 w-32 shrink-0">Cheque Date</label>
                                <input type="date" value={formData.chequeDate} readOnly className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold text-gray-700 outline-none bg-slate-100" />
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2 lg:pl-4">
                                <label className="text-[11px] font-bold uppercase text-gray-500 w-28 shrink-0">Cheque Amount</label>
                                <div className="flex-1 flex items-baseline gap-2 px-3 h-8 bg-slate-100 border border-slate-200 rounded">
                                     <span className="text-[9px] font-black text-slate-400 italic">Rs.</span>
                                     <span className="text-[13px] font-mono font-black text-[#0285fd] tabular-nums italic py-1.5">{formData.chequeAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Entry Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] space-y-3.5 relative">
                        {/* A/P Account Selection */}
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold uppercase text-gray-500 w-[180px] shrink-0">Post Cancellation To (A/P)</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" readOnly value={formData.apAccountName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('account'); setSearchTerm(''); }} />
                                <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Cheque No & Date */}
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 items-center">
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-[180px] shrink-0">Cheque No</label>
                                <input type="text" value={formData.targetChequeNo} onChange={e => setFormData({...formData, targetChequeNo: e.target.value})} className="flex-1 h-8 border border-blue-200 px-3 text-[13px] font-mono font-black text-[#0078d4] tracking-[0.2em] rounded outline-none focus:border-[#0285fd] shadow-inner" />
                            </div>
                            <div className="col-span-6 flex items-center gap-2 lg:pl-10">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right">Cancel Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.cancelDate} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => setShowDatePicker(true)} />
                                    <button onClick={() => setShowDatePicker(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reason & Memo */}
                        <div className="flex items-start gap-2">
                             <label className="text-[11px] font-bold text-gray-500 uppercase w-[180px] shrink-0 pt-2">Reason for Cancellation</label>
                             <div className="flex-1 space-y-1">
                                <input type="text" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full h-8 border border-orange-200 px-3 text-[12px] font-bold text-slate-800 rounded bg-orange-50/30 outline-none focus:border-orange-400 shadow-sm" />
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase italic">
                                    <AlertTriangle size={10} className="text-orange-400" /> This memo will be logged in the system audit trail per fiscal regulations.
                                </div>
                             </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-[180px] shrink-0">General Memo</label>
                            <input type="text" value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-mono italic rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
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
                                            if (activeModal === 'account') setFormData({...formData, apAccount: item.code, apAccountName: item.name});
                                            if (activeModal === 'docType') setFormData({...formData, docType: item.name});
                                            setActiveModal(null);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{item.code || idx + 1}</td>
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
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.cancelDate}
                onDateSelect={(date) => setFormData({...formData, cancelDate: date})}
            />
        </>
    );
};

export default ChequeCancelBoard;
