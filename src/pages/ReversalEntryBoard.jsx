import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, History, ShieldCheck, Key, FileSearch, CheckCircle2, AlertCircle } from 'lucide-react';
import { reversalEntryService } from '../services/reversalEntry.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const ReversalEntryBoard = ({ isOpen, onClose }) => {
    const { companyCode, userName } = getSessionData();
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ transactionTypes: [], users: [] });
    
    // Form States
    const getInitialFormData = () => ({
        transactionType: '',
        transactionTypeName: '',
        voucherNo: '',
        documentNo: '',
        chequeNo: '',
        reason: '',
        authUsername: '',
        authPassword: '',
        company: companyCode,
        createUser: userName
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null); // 'type', 'user'
    const [searchTerm, setSearchTerm] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: comp, userName: user } = getSessionData();
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const lookupRes = await reversalEntryService.getLookups(formData.company);
            setLookups(lookupRes);
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            transactionType: '',
            transactionTypeName: '',
            voucherNo: '',
            documentNo: '',
            chequeNo: '',
            reason: '',
            authUsername: '',
            authPassword: ''
        });
    };

    const handleApply = async () => {
        if (!formData.transactionType || (!formData.voucherNo && !formData.documentNo)) {
            showErrorToast("Please provide transaction type and a reference number.");
            return;
        }
        if (!formData.authPassword) {
            showErrorToast("Authorization password is required.");
            return;
        }

        try {
            setLoading(true);
            await reversalEntryService.apply(formData);
            showSuccessToast('Transaction reversed successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleView = async () => {
        if (!formData.voucherNo && !formData.documentNo) {
             showErrorToast("Provide a Document No or Voucher No to view.");
             return;
        }
        try {
            setLoading(true);
            const response = await reversalEntryService.view(formData.voucherNo || formData.documentNo, formData.transactionType);
            const data = response.data || response;
            showSuccessToast(data.message || "Transaction details loaded.");
            
            // Auto-fill reason with transaction details if available
            if (data.total !== undefined) {
                setFormData(prev => ({
                    ...prev,
                    reason: `Reversing transaction: ${formData.voucherNo || formData.documentNo}\nTotal Amount: ${data.total}\nDate: ${data.date ? new Date(data.date).toLocaleDateString() : 'N/A'}`
                }));
            }
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const filteredLookup = () => {
        if (activeModal === 'type') return lookups.transactionTypes.filter(t => (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'user') return lookups.users.filter(u => (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
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
                title="Reversal Entry Form"
                maxWidth="max-w-[600px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-white text-gray-600 border border-gray-200 text-[13px] font-mono font-bold tracking-widest uppercase rounded-[5px] hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleView} disabled={loading} className="px-6 h-10 bg-white text-blue-600 border border-blue-200 text-[13px] font-mono font-bold tracking-widest uppercase rounded-[5px] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                                <FileSearch size={14} /> VIEW
                            </button>
                            <button onClick={handleApply} disabled={loading} className={`px-8 h-10 text-[13px] font-mono font-bold tracking-widest uppercase rounded-[5px] shadow-md transition-all active:scale-95 flex items-center gap-2 border-none bg-[#0285fd] hover:bg-[#0073ff] text-white shadow-blue-500/20 ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Main Form Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] relative overflow-hidden space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 relative z-10">
                            {/* Transaction Type - Full Width */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Transaction Type</label>
                                <div className="flex-1 max-w-[400px] flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.transactionTypeName ? `${formData.transactionType} - ${formData.transactionTypeName}` : ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                        onClick={() => { setActiveModal('type'); setSearchTerm(''); }}
                                    />
                                    <button onClick={() => { setActiveModal('type'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Reference Numbers - Stacked vertically */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Voucher No</label>
                                <div className="flex-1 max-w-[400px]">
                                    <input name="voucherNo" value={formData.voucherNo} onChange={handleInputChange} type="text" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                </div>
                            </div>

                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Document No.</label>
                                <div className="flex-1 max-w-[400px]">
                                    <input name="documentNo" value={formData.documentNo} onChange={handleInputChange} type="text" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                </div>
                            </div>

                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Cheque No</label>
                                <div className="flex-1 max-w-[400px]">
                                    <input name="chequeNo" value={formData.chequeNo} onChange={handleInputChange} type="text" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                </div>
                            </div>

                            <div className="col-span-12 flex items-start gap-2 pt-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0 mt-2">Reason</label>
                                <div className="flex-1 max-w-[400px]">
                                    <textarea name="reason" value={formData.reason} onChange={handleInputChange} className="w-full h-24 border border-slate-200 rounded px-3 py-2 font-mono text-[12px] outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 resize-none italic" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Authorization Section */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-[5px] border-l-4 border-l-[#0285fd]">
                        <div className="flex items-center gap-2 mb-4 ml-1">
                            <ShieldCheck size={16} className="text-[#0285fd]" />
                            <h3 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-widest">Mandatory Authorization</h3>
                        </div>
                        
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">User Name</label>
                                <div className="flex-1 max-w-[400px] flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.authUsername} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                        onClick={() => { setActiveModal('user'); setSearchTerm(''); }}
                                    />
                                    <button onClick={() => { setActiveModal('user'); setSearchTerm(''); }} className="w-10 h-8 bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Password</label>
                                <div className="flex-1 max-w-[400px] relative h-8 min-w-0">
                                    <input 
                                        name="authPassword" 
                                        type="password" 
                                        value={formData.authPassword} 
                                        onChange={handleInputChange} 
                                        className="w-full h-8 border border-slate-200 pl-8 pr-3 text-[12px] font-mono rounded outline-none bg-white transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                    />
                                    <Key size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

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
                                placeholder={`Find ${activeModal === 'type' ? 'Transaction Types' : 'Authorized Users'} by code or name...`}
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
                                            if (activeModal === 'type') {
                                                setFormData(prev => ({ ...prev, transactionType: item.code, transactionTypeName: item.name }));
                                            } else {
                                                setFormData(prev => ({ ...prev, authUsername: item.name }));
                                            }
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


export default ReversalEntryBoard;
