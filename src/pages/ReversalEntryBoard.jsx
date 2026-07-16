import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Loader2, FileText, ShieldCheck } from 'lucide-react';
import { reversalEntryService } from '../services/reversalEntry.service';
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

const ReversalEntryBoard = ({ isOpen, onClose }) => {
    const { companyCode, userName } = getSessionData();
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ transactionTypes: [], users: [] });

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

    const [activeModal, setActiveModal] = useState(null);

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

    return (
        <>
            <TransactionFormWrapper subtitle="Reversal Entry" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Reversal Entry"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <div className="flex gap-3">
                            <button onClick={handleView} disabled={loading}
                                className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <FileText size={14} /> View
                            </button>
                            <button onClick={handleApply} disabled={loading}
                                className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                Apply
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Main Form Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Transaction Type */}
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Transaction Type</label>
                                <div className="relative max-w-[400px]">
                                    <select
                                        value={formData.transactionTypeName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const item = (lookups.transactionTypes || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData(prev => ({ ...prev, transactionType: item.code, transactionTypeName: item.name }));
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.transactionTypes || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Voucher No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Voucher No</label>
                                <input name="voucherNo" value={formData.voucherNo} onChange={handleInputChange} type="text"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            {/* Document No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Document No.</label>
                                <input name="documentNo" value={formData.documentNo} onChange={handleInputChange} type="text"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            {/* Cheque No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque No</label>
                                <input name="chequeNo" value={formData.chequeNo} onChange={handleInputChange} type="text"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            {/* Reason */}
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Reason</label>
                                <textarea name="reason" value={formData.reason} onChange={handleInputChange}
                                    className="w-full h-24 border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 resize-none italic" />
                            </div>
                        </div>
                    </div>

                    {/* Authorization Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] border-l-4 border-l-[#0285fd] space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-[#0285fd]" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mandatory Authorization</h3>
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">User Name</label>
                                <div className="relative max-w-[400px]">
                                    <select
                                        value={formData.authUsername}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const item = (lookups.users || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData(prev => ({ ...prev, authUsername: item.name }));
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.users || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Password</label>
                                <input name="authPassword" type="password" value={formData.authPassword} onChange={handleInputChange}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'type'}
                onClose={() => setActiveModal(null)}
                title="Select Transaction Type"
                items={lookups.transactionTypes}
                onSelect={(item) => setFormData(prev => ({ ...prev, transactionType: item.code, transactionTypeName: item.name }))}
            />

            <SearchModal
                isOpen={activeModal === 'user'}
                onClose={() => setActiveModal(null)}
                title="Select Authorized User"
                items={lookups.users}
                onSelect={(item) => setFormData(prev => ({ ...prev, authUsername: item.name }))}
            />
        </>
    );
};

export default ReversalEntryBoard;
