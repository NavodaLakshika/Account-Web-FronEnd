import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, Ban, Landmark, Calendar, FileText, CheckCircle2, ShieldAlert, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';

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
        company: 'C001',
        createUser: 'SYSTEM'
    });

    const [activeModal, setActiveModal] = useState(null); // 'account', 'docType'
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
            const res = await bankingService.getCancelLookups(formData.company);
            setLookups(res);
        } catch (error) {
            toast.error("Failed to load search parameters");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCheque = async () => {
        if (!formData.docNo && !formData.voucherNo && !formData.targetChequeNo) {
            toast.error("Please enter a Document No or Cheque No to search.");
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
                toast.success("Cheque link details retrieved!");
            } else {
                toast.error("No valid cheque found with these details.");
            }
        } catch (error) {
            toast.error("Search failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.supplierCode || !formData.targetChequeNo) {
            toast.error("Search and select a valid cheque record first.");
            return;
        }
        if (!formData.reason) {
            toast.error("Reason for cancellation is strictly required for auditing.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveChequeCancel(formData);
            toast.success('Cheque protocol finalized successfully!');
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Cancellation Hub"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleSave} disabled={loading} className={`px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={18} />} Save Protocol
                        </button>
                        <button onClick={onClose} className="px-10 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <X size={16} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 font-['Plus_Jakarta_Sans']">
                    {/* Mode Selection Header */}
                    <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden flex items-center p-1 bg-slate-50/50">
                        <button onClick={() => setFormData({...formData, mode: 'Cheque Cancel'})} className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-sm font-black uppercase tracking-widest transition-all ${formData.mode === 'Cheque Cancel' ? 'bg-[#0078d4] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Ban size={18} /> Cheque Cancel
                        </button>
                        <button onClick={() => setFormData({...formData, mode: 'Cheque Return'})} className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-sm font-black uppercase tracking-widest transition-all ${formData.mode === 'Cheque Return' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                            <RotateCcw size={18} /> Cheque Return
                        </button>
                    </div>

                    {/* Search & Detail Section (Gray Box style) */}
                    <div className="bg-slate-100/80 p-6 rounded-sm border border-slate-200 space-y-4 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                            <FileText size={160} />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-6 relative z-10">
                            {/* Document Type Selection */}
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[11px] font-black uppercase text-slate-500 w-32 shrink-0">Document Type</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.docType} placeholder="Select Linked Document Type..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-white outline-none" />
                                    <button onClick={() => { setActiveModal('docType'); setSearchTerm(''); }} className="w-10 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-sm">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Doc No & Voucher No */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[11px] font-black uppercase text-slate-500 w-32 shrink-0">Document No</label>
                                <div className="flex-1 relative group">
                                    <input type="text" value={formData.docNo} onChange={e => setFormData({...formData, docNo: e.target.value})} className="w-full h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-white outline-none focus:border-blue-500 transition-all font-mono" />
                                    <button onClick={handleSearchCheque} className="absolute right-1 top-1 w-7 h-7 bg-blue-50 text-[#0078d4] flex items-center justify-center rounded hover:bg-[#0078d4] hover:text-white transition-all">
                                        <Search size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[11px] font-black uppercase text-slate-500 w-32 shrink-0">Voucher No</label>
                                <input type="text" value={formData.voucherNo} onChange={e => setFormData({...formData, voucherNo: e.target.value})} className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-white outline-none focus:border-blue-500 transition-all font-mono" />
                            </div>

                            {/* Supplier Section */}
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[11px] font-black uppercase text-slate-500 w-32 shrink-0">Supplier / Payee</label>
                                <div className="flex gap-2 flex-1">
                                    <input type="text" readOnly value={formData.supplierCode} className="w-32 h-9 border border-gray-300 px-4 text-[13px] font-black text-slate-700 rounded-sm bg-slate-50/50" placeholder="CODE" />
                                    <input type="text" readOnly value={formData.supplierName} className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold text-slate-700 rounded-sm bg-slate-50/50" placeholder="PAYEE NAME AUTOMATICALLY FETCHED..." />
                                </div>
                            </div>

                            {/* Date & Amount */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[11px] font-black uppercase text-slate-500 w-32 shrink-0">Cheque Date</label>
                                <div className="flex-1 flex items-center px-3 h-9 border border-gray-300 bg-white shadow-sm rounded-sm">
                                    <input type="date" value={formData.chequeDate} readOnly className="flex-1 text-[13px] font-bold text-slate-600 outline-none bg-transparent" />
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4 shadow-sm">
                                <label className="text-[11px] font-black uppercase text-slate-500 w-32 shrink-0">Cheque Amount</label>
                                <div className="flex-1 flex items-baseline gap-2 px-4 h-9 bg-white border border-gray-300 rounded-sm">
                                     <span className="text-[10px] font-black text-slate-400 italic">Rs.</span>
                                     <span className="text-[16px] font-black text-[#0078d4] tabular-nums italic">{formData.chequeAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Entry Section */}
                    <div className="bg-white p-8 border border-slate-100 rounded shadow-sm space-y-6 relative">
                        {/* A/P Account Selection */}
                        <div className="grid grid-cols-12 gap-8 items-center">
                            <label className="col-span-3 text-[13px] font-bold text-gray-700 tracking-tight">Post Cancellation To (A/P Account)</label>
                            <div className="col-span-9 flex gap-2">
                                <input type="text" readOnly value={formData.apAccountName} placeholder="Target General Ledger Account for Void Transaction..." className="flex-1 h-10 border border-gray-200 px-4 text-[13px] font-medium rounded-sm bg-slate-50/30 outline-none" />
                                <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-12 h-10 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-md active:scale-95">
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Cheque No & Date */}
                        <div className="grid grid-cols-12 gap-8 items-center">
                            <div className="col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Cheque No</label>
                                <input type="text" value={formData.targetChequeNo} onChange={e => setFormData({...formData, targetChequeNo: e.target.value})} className="flex-1 h-10 border border-gray-200 px-4 text-[14px] font-black text-[#0078d4] tracking-[0.2em] rounded-sm outline-none focus:border-blue-500 shadow-inner" placeholder="000000" />
                            </div>
                            <div className="col-span-6 flex items-center gap-4 pl-10">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0 text-right">Cancel Date</label>
                                <div className="flex-1 flex items-center px-3 h-10 border border-gray-200 bg-white shadow-sm rounded-sm hover:border-blue-400 transition-colors">
                                    <input type="date" value={formData.cancelDate} onChange={e => setFormData({...formData, cancelDate: e.target.value})} className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent" />
                                    <Calendar size={16} className="text-[#0078d4]" />
                                </div>
                            </div>
                        </div>

                        {/* Reason & Memo */}
                        <div className="grid grid-cols-12 gap-8 items-start">
                             <label className="col-span-3 text-[13px] font-bold text-gray-700 tracking-tight pt-2">Reason for Cancellation</label>
                             <div className="col-span-9 space-y-2">
                                <input type="text" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full h-11 border border-blue-50 px-4 text-[13px] font-bold text-slate-800 rounded-sm bg-blue-50/20 outline-none focus:border-blue-500 shadow-sm" placeholder="REQUIRED: Explain why this cheque is being voided or returned (e.g., Damaged, Incorrect Payee)..." />
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase italic">
                                    <AlertTriangle size={12} className="text-orange-400" /> This memo will be logged in the system audit trail per fiscal regulations.
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-12 gap-8 items-center">
                            <label className="col-span-3 text-[13px] font-bold text-gray-700 tracking-tight">General Memo</label>
                            <input type="text" value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} className="col-span-9 h-10 border border-gray-200 px-4 text-[13px] font-medium italic rounded-sm outline-none focus:border-blue-500" placeholder="Additional internal remarks..." />
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
                            Search {activeModal === 'account' ? 'General Ledger' : 'Document Metadata'}
                            <button 
                                onClick={() => setActiveModal(null)} 
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Type to filter..." 
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
                                        <th className="p-4 border-b">Identity</th>
                                        <th className="p-4 border-b">Title / Record</th>
                                        <th className="p-4 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'account') setFormData({...formData, apAccount: item.code, apAccountName: item.name});
                                            if (activeModal === 'docType') setFormData({...formData, docType: item.name});
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-4 border-b font-black text-slate-700">{item.code || idx + 1}</td>
                                            <td className="p-4 border-b font-bold text-[#0078d4] uppercase tracking-tight">{item.name}</td>
                                            <td className="p-4 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-5 py-2 rounded-sm font-black tracking-widest hover:bg-[#005a9e]">VERIFY</button>
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

export default ChequeCancelBoard;
