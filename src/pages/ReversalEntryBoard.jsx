import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, History, ShieldCheck, Key, FileSearch, CheckCircle2, AlertCircle } from 'lucide-react';
import { reversalEntryService } from '../services/reversalEntry.service';
import { toast } from 'react-hot-toast';

const ReversalEntryBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ transactionTypes: [], users: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        transactionType: '',
        transactionTypeName: '',
        voucherNo: '',
        documentNo: '',
        chequeNo: '',
        reason: '',
        authUsername: '',
        authPassword: '',
        company: 'C001',
        createUser: 'SYSTEM'
    });

    const [activeModal, setActiveModal] = useState(null); // 'type', 'user'
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
            const lookupRes = await reversalEntryService.getLookups(companyCode);
            setLookups(lookupRes);
        } catch (error) {
            toast.error("Failed to load initial data");
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
            toast.error("Please provide transaction type and a reference number.");
            return;
        }
        if (!formData.authPassword) {
            toast.error("Authorization password is required.");
            return;
        }

        try {
            setLoading(true);
            await reversalEntryService.apply(formData);
            toast.success('Transaction reversed successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleView = async () => {
        if (!formData.voucherNo && !formData.documentNo) {
             toast.error("Provide a Document No or Voucher No to view.");
             return;
        }
        try {
            setLoading(true);
            const data = await reversalEntryService.view(formData.voucherNo || formData.documentNo, formData.transactionType);
            toast.success("Transaction details loaded.");
            // You could show a sub-modal or update state with details
        } catch (error) {
            toast.error(error.toString());
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Reversal Entry Form"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleApply} disabled={loading} className={`px-10 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} Apply
                        </button>
                        <button onClick={handleView} disabled={loading} className="px-10 h-10 bg-white border border-[#0078d4] text-[#0078d4] text-sm font-bold rounded hover:bg-blue-50 transition-all flex items-center gap-2">
                            <FileSearch size={18} /> View
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-8 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <RotateCcw size={16} /> Clear
                        </button>
                        <button onClick={onClose} className="px-8 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <X size={16} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 font-['Plus_Jakarta_Sans']">
                    {/* Main Form Section */}
                    <div className="bg-white p-8 border border-gray-200 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
                            <History size={150} className="text-blue-900" />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-8 relative z-10">
                            <div className="col-span-12 lg:col-span-12 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Transaction Type</label>
                                <div className="flex-1 max-w-[400px] flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.transactionTypeName ? `${formData.transactionType} - ${formData.transactionTypeName}` : ''} 
                                        placeholder="Click search to select transaction type..." 
                                        className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold text-[#0078d4] rounded-sm bg-gray-50/50 outline-none" 
                                    />
                                    <button onClick={() => { setActiveModal('type'); setSearchTerm(''); }} className="w-12 h-9 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-md active:scale-90">
                                        <Search size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Voucher No</label>
                                <input name="voucherNo" value={formData.voucherNo} onChange={handleInputChange} type="text" className="flex-1 h-9 border border-gray-300 px-4 text-[13px] rounded-sm bg-white outline-none focus:border-blue-500 shadow-sm" />
                            </div>

                            <div className="col-span-12 lg:col-span-4 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Document No.</label>
                                <input name="documentNo" value={formData.documentNo} onChange={handleInputChange} type="text" className="flex-1 h-9 border border-gray-300 px-4 text-[13px] rounded-sm bg-white outline-none focus:border-blue-500 shadow-sm" />
                            </div>

                            <div className="col-span-12 lg:col-span-4 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Cheque No</label>
                                <input name="chequeNo" value={formData.chequeNo} onChange={handleInputChange} type="text" className="flex-1 h-9 border border-gray-300 px-4 text-[13px] rounded-sm bg-white outline-none focus:border-blue-500 shadow-sm" />
                            </div>

                            <div className="col-span-12 flex items-start gap-4 pt-2">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0 mt-2">Reason</label>
                                <textarea name="reason" value={formData.reason} onChange={handleInputChange} className="flex-1 h-24 border border-gray-200 p-4 text-[13px] rounded-sm outline-none resize-none bg-gray-50/20 hover:border-blue-300 focus:border-blue-500 transition-all font-medium italic text-gray-600" placeholder="Please specify the reason for reversing this record..." />
                            </div>
                        </div>
                    </div>

                    {/* Authorization Section */}
                    <div className="bg-slate-50 p-6 border border-gray-200 rounded-sm border-l-4 border-l-[#0078d4]">
                        <div className="flex items-center gap-2 mb-6 ml-1">
                            <ShieldCheck size={18} className="text-[#0078d4]" />
                            <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">Mandatory Authorization</h3>
                        </div>
                        
                        <div className="grid grid-cols-12 gap-10">
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">User Name</label>
                                <div className="flex-1 flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.authUsername} 
                                        placeholder="Select authorized user..." 
                                        className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-white outline-none" 
                                    />
                                    <button onClick={() => { setActiveModal('user'); setSearchTerm(''); }} className="w-10 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 rounded-sm transition-all shadow-sm active:scale-90">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Password</label>
                                <div className="flex-1 relative">
                                    <input 
                                        name="authPassword" 
                                        type="password" 
                                        value={formData.authPassword} 
                                        onChange={handleInputChange} 
                                        className="w-full h-9 border border-gray-300 pl-10 pr-4 text-[13px] rounded-sm outline-none focus:border-red-500 bg-white" 
                                        placeholder="••••••••" 
                                    />
                                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-blue-50/50 rounded-sm border border-blue-100/50">
                            <AlertCircle size={14} className="text-[#0078d4]" />
                            <p className="text-[10px] font-bold text-blue-800 tracking-wide uppercase italic">
                                Note: Reversing a transaction will create a counter-entry to offset the original financial impact.
                            </p>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
                                Search {activeModal === 'type' ? 'Transaction Types' : 'Authorized Users'}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="w-10 h-10 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={28} /></button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Type to search..." 
                                    className="w-full h-11 border border-gray-200 pl-10 pr-4 text-sm rounded-lg focus:border-blue-500 outline-none shadow-inner" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'type') {
                                                setFormData(prev => ({ ...prev, transactionType: item.code, transactionTypeName: item.name }));
                                            } else {
                                                setFormData(prev => ({ ...prev, authUsername: item.name }));
                                            }
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-3 border-b font-black text-slate-700">{item.code}</td>
                                            <td className="p-3 border-b font-bold text-[#0078d4] uppercase tracking-tight">{item.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-4 py-1.5 rounded-sm font-black hover:bg-[#005a9e] tracking-[0.1em]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLookup().length === 0 && (
                                        <tr><td colSpan="3" className="p-10 text-center text-gray-400 italic">No matching results found...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReversalEntryBoard;
