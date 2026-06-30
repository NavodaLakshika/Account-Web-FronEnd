import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Loader2, Ban, Calendar, ArrowRight } from 'lucide-react';
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

const ChequeCancelBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ accounts: [] });
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
    const [activeModal, setActiveModal] = useState(null);
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

    const isReturn = formData.mode === 'Cheque Return';

    return (
        <>
            <TransactionFormWrapper subtitle="Cheque Cancel" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Cancellation"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-4 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading || !formData.supplierName}
                            className={`px-6 py-2 text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 border-none ${loading || !formData.supplierName ? 'opacity-50 cursor-not-allowed' : ''} ${isReturn ? 'bg-[#d97706] hover:bg-[#b45309]' : 'bg-[#dc2626] hover:bg-[#b91c1c]'}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                            {isReturn ? 'Process Return' : 'Reverse Entry'}
                        </button>
                    </div>
                }
            >
                <div className="font-['Tahoma'] space-y-4">
                    {/* Mode Toggle */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="flex gap-3">
                            <button onClick={() => setFormData({ ...formData, mode: 'Cheque Cancel' })}
                                className={`flex-1 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border-none ${formData.mode === 'Cheque Cancel' ? 'bg-[#dc2626] text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                Cancel Cheque
                            </button>
                            <button onClick={() => setFormData({ ...formData, mode: 'Cheque Return' })}
                                className={`flex-1 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border-none ${formData.mode === 'Cheque Return' ? 'bg-[#d97706] text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                Return Cheque
                            </button>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                        <label className="block text-[13px] font-medium text-gray-700">Step 1: Locate Cheque</label>
                        <div className="flex border border-gray-300 rounded-[3px] overflow-hidden focus-within:border-[#0285fd] focus-within:ring-1 focus-within:ring-[#0285fd] transition-all">
                            <div className="flex items-center pl-3 pr-2 text-gray-400 bg-white">
                                <Search size={18} />
                            </div>
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchCheque()}
                                className="flex-1 h-12 px-3 text-[14px] outline-none text-gray-800 placeholder:text-gray-300 bg-white border-none"
                                placeholder="Enter Cheque No or Document No..." autoFocus />
                            <button onClick={handleSearchCheque}
                                className="px-6 bg-[#0285fd] hover:bg-[#0073ff] text-white text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-none">
                                Find <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {formData.supplierName ? (
                        <div className="space-y-4">
                            {/* Document Info */}
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                                <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                                    <div className="col-span-6">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payee / Origin</span>
                                        <p className="text-[14px] font-bold text-gray-800 mt-1">{formData.supplierName} <span className="text-gray-400 font-mono text-[12px] font-normal">({formData.supplierCode})</span></p>
                                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">Doc: {formData.docNo} | Chq: {formData.targetChequeNo}</p>
                                    </div>
                                    <div className="col-span-3">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                                        <p className="text-[14px] font-bold text-gray-700 mt-1">{formData.chequeDate ? formData.chequeDate.split(' ')[0] : ''}</p>
                                    </div>
                                    <div className="col-span-3">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                                        <p className="text-[16px] font-black text-[#b91c1c] mt-1">Rs. {formData.chequeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reversal Form */}
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                                <h3 className={`text-[11px] font-black uppercase tracking-widest ${isReturn ? 'text-[#d97706]' : 'text-[#dc2626]'}`}>
                                    Step 2: {isReturn ? 'Return Details' : 'Reversal Details'}
                                </h3>
                                <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                                    <div className="col-span-8">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{isReturn ? 'Return Account (A/P)' : 'Post Reversal To Account (A/P)'}</label>
                                        <div className="relative">
                                            <input type="text" readOnly
                                                value={formData.apAccountName ? `${formData.apAccount} - ${formData.apAccountName}` : ''}
                                                placeholder="Select ledger account..."
                                                onClick={() => setActiveModal('account')}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                            <button onClick={() => setActiveModal('account')}
                                                className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{isReturn ? 'Return Date' : 'Cancellation Date'}</label>
                                        <div className="relative">
                                            <input type="text" readOnly value={formData.cancelDate}
                                                onClick={() => setShowDatePicker(true)}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                            <button onClick={() => setShowDatePicker(true)}
                                                className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Calendar size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-12">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Reason *</label>
                                        <input type="text" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                            placeholder="Why is this cancelled?" />
                                    </div>
                                </div>
                                <div className={`p-3 rounded-[3px] flex gap-3 items-start border ${isReturn ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                    <span className={`text-[11px] font-bold leading-relaxed ${isReturn ? 'text-amber-800' : 'text-red-800'}`}>
                                        Warning: Submitting this form will mark Document <span className="font-mono">{formData.docNo}</span> as {isReturn ? 'RETURNED' : 'CANCELLED'} and post a reversal entry to General Ledger.
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-[3px] border border-dashed border-gray-200">
                            <Search size={28} className="mb-2 text-gray-300" />
                            <p className="text-[12px] font-bold uppercase tracking-widest">No Document Selected</p>
                            <p className="text-[11px] max-w-[300px] text-center mt-2 text-gray-400">Enter a cheque number or document number above to locate the original transaction details.</p>
                        </div>
                    )}
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'account'}
                onClose={() => setActiveModal(null)}
                title="A/P Accounts Directory"
                items={lookups.accounts}
                onSelect={(item) => setFormData({ ...formData, apAccount: item.code, apAccountName: item.name })}
            />

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.cancelDate}
                onDateSelect={(date) => setFormData({ ...formData, cancelDate: date })}
            />
        </>
    );
};

export default ChequeCancelBoard;
